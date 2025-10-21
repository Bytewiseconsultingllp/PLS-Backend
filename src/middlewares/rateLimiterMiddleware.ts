import { RateLimiterPrisma } from "rate-limiter-flexible";
import type { NextFunction, Request, Response } from "express";
import { db } from "../database/db";
import { httpResponse } from "../utils/apiResponseUtils";
import {
  ENV,
  RATE_LIMIT_WHITELIST_IPS,
  ENABLE_RATE_LIMIT_IN_DEV,
} from "../config/config";
import {
  ERRMSG,
  INTERNALSERVERERRORCODE,
  TOOMANYREQUESTSCODE,
  TOOMANYREQUESTSMSG,
} from "../constants";
import getMinutes from "../utils/getMinutesUtils";
import logger from "../utils/loggerUtils";

type ErrorLimiter = {
  remainingPoints: number;
  msBeforeNext: number;
};

type RateLimiterConfig = {
  consumptionPoints: number;
  totalPoints: number;
  duration: number;
  keyPrefix: string;
};

export class RateLimiterMiddleware {
  // Store multiple rate limiters with different configurations
  private rateLimiters: Map<string, RateLimiterPrisma> = new Map();

  // Whitelist of IPs that bypass rate limiting (e.g., admin IPs, monitoring services)
  private whitelistedIPs: Set<string> = new Set([
    "127.0.0.1",
    "::1",
    "::ffff:127.0.0.1",
  ]);

  // Flag to enable rate limiting in development (for testing)
  private enableInDevelopment: boolean = ENABLE_RATE_LIMIT_IN_DEV;

  constructor() {
    // Add IPs from config to whitelist
    if (RATE_LIMIT_WHITELIST_IPS && RATE_LIMIT_WHITELIST_IPS.length > 0) {
      RATE_LIMIT_WHITELIST_IPS.forEach((ip) => {
        if (ip) {
          this.whitelistedIPs.add(ip);
        }
      });
      logger.info(
        `Rate limiter initialized with ${RATE_LIMIT_WHITELIST_IPS.length} whitelisted IPs`,
      );
    }
  }

  /**
   * Enable rate limiting in development mode (useful for testing)
   */
  public enableTestMode(): void {
    this.enableInDevelopment = true;
  }

  /**
   * Add IP addresses to whitelist
   */
  public addToWhitelist(ips: string[]): void {
    ips.forEach((ip) => this.whitelistedIPs.add(ip));
  }

  /**
   * Extract IP address with proxy support
   */
  private getClientIP(req: Request): string {
    // Try to get IP from various headers (for proxy/load balancer support)
    const forwarded = req.headers["x-forwarded-for"];
    const realIP = req.headers["x-real-ip"];

    if (typeof forwarded === "string") {
      // X-Forwarded-For can contain multiple IPs, take the first one
      const firstIP = forwarded.split(",")[0];
      if (firstIP) {
        return firstIP.trim();
      }
    }

    if (typeof realIP === "string") {
      return realIP.trim();
    }

    // Fallback to req.ip (with null safety)
    return req.ip || req.socket.remoteAddress || "unknown";
  }

  /**
   * Generate unique key for rate limiter based on configuration
   */
  private getRateLimiterKey(config: RateLimiterConfig): string {
    return `${config.keyPrefix}_${config.totalPoints}_${config.duration}`;
  }

  /**
   * Get or create a rate limiter instance for the given configuration
   */
  private getRateLimiter(config: RateLimiterConfig): RateLimiterPrisma {
    const key = this.getRateLimiterKey(config);

    if (!this.rateLimiters.has(key)) {
      const rateLimiter = new RateLimiterPrisma({
        storeClient: db,
        points: config.totalPoints,
        duration: config.duration,
        keyPrefix: config.keyPrefix,
      });
      this.rateLimiters.set(key, rateLimiter);

      logger.info(
        `Rate limiter initialized: ${key} (${config.totalPoints} requests per ${config.duration}s)`,
      );
    }

    return this.rateLimiters.get(key)!;
  }

  /**
   * Set rate limit headers on response
   */
  private setRateLimitHeaders(
    res: Response,
    totalPoints: number,
    remainingPoints: number,
    resetTime: number,
  ): void {
    res.setHeader("X-RateLimit-Limit", totalPoints.toString());
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, remainingPoints).toString(),
    );
    res.setHeader("X-RateLimit-Reset", Math.ceil(resetTime / 1000).toString());
    res.setHeader("Retry-After", Math.ceil(resetTime / 1000).toString());
  }

  /**
   * Log rate limit violation
   */
  private logRateLimitViolation(
    clientIP: string,
    endpoint: string,
    remainingTime: string,
  ): void {
    logger.warn(
      `Rate limit exceeded - IP: ${clientIP}, Endpoint: ${endpoint}, Retry after: ${remainingTime}`,
    );
  }

  /**
   * Main rate limiting handler
   */
  public async handle(
    req: Request,
    res: Response,
    next: NextFunction,
    consumptionPoints = 1,
    message?: string,
    totalPoints?: number,
    duration = 60,
    keyPrefix = "global",
  ): Promise<void> {
    try {
      // Check if rate limiting should be applied
      if (ENV === "DEVELOPMENT" && !this.enableInDevelopment) {
        return next();
      }

      const clientIP = this.getClientIP(req);

      // Check if IP is whitelisted
      if (this.whitelistedIPs.has(clientIP)) {
        logger.debug(`Whitelisted IP bypassed rate limit: ${clientIP}`);
        return next();
      }

      // Validate IP address
      if (!clientIP || clientIP === "unknown") {
        logger.error("Unable to determine client IP address for rate limiting");
        return next(); // Allow request but log the issue
      }

      // Setup rate limiter configuration
      const config: RateLimiterConfig = {
        consumptionPoints,
        totalPoints: totalPoints || 10,
        duration,
        keyPrefix,
      };

      const rateLimiter = this.getRateLimiter(config);

      // Consume points and get rate limit info
      const rateLimiterRes = await rateLimiter.consume(
        clientIP,
        consumptionPoints,
      );

      // Set rate limit headers for successful requests
      this.setRateLimitHeaders(
        res,
        config.totalPoints,
        rateLimiterRes.remainingPoints,
        rateLimiterRes.msBeforeNext,
      );

      // Log if user is close to limit (< 20% remaining)
      if (rateLimiterRes.remainingPoints < config.totalPoints * 0.2) {
        logger.debug(
          `IP ${clientIP} approaching rate limit: ${rateLimiterRes.remainingPoints} points remaining`,
        );
      }

      next();
    } catch (err: unknown) {
      const clientIP = this.getClientIP(req);

      // Check if it's a rate limit error
      if (err && typeof err === "object" && "remainingPoints" in err) {
        const error = err as ErrorLimiter;

        const remainingSeconds = Math.ceil(error.msBeforeNext / 1000);
        const remainingDuration = getMinutes(remainingSeconds);

        // Set rate limit headers for rejected requests
        this.setRateLimitHeaders(res, totalPoints || 10, 0, error.msBeforeNext);

        // Log the violation
        this.logRateLimitViolation(
          clientIP,
          req.originalUrl,
          remainingDuration,
        );

        httpResponse(
          req,
          res,
          TOOMANYREQUESTSCODE,
          message || `${TOOMANYREQUESTSMSG} ${remainingDuration}`,
          null,
        ).end();
        return;
      }

      // Handle other errors (database issues, network problems, etc.)
      logger.error(
        `Rate limiter error: ${err instanceof Error ? err.message : String(err)}`,
        {
          error: err,
          ip: clientIP,
          endpoint: req.originalUrl,
        },
      );

      // In case of rate limiter failure, allow the request but log the error
      // This prevents rate limiter issues from breaking the entire application
      if (ENV === "PRODUCTION") {
        // In production, fail closed for security
        httpResponse(
          req,
          res,
          INTERNALSERVERERRORCODE,
          `${ERRMSG} - Service temporarily unavailable`,
          null,
        );
        return;
      } else {
        // In development, fail open to not block development
        logger.warn("Rate limiter error in development - allowing request");
        next();
        return;
      }
    }
  }

  /**
   * Create a middleware function with preset configuration
   * This is useful for defining rate limits at the router level
   */
  public createLimiter(
    consumptionPoints: number,
    totalPoints: number,
    duration: number,
    keyPrefix: string,
    message?: string,
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      await this.handle(
        req,
        res,
        next,
        consumptionPoints,
        message,
        totalPoints,
        duration,
        keyPrefix,
      );
    };
  }

  /**
   * Clear all rate limiter instances (useful for testing)
   */
  public clearAll(): void {
    this.rateLimiters.clear();
    logger.info("All rate limiters cleared");
  }
}

const rateLimiterMiddleware = new RateLimiterMiddleware();
export default rateLimiterMiddleware;
