/**
 * Rate Limiter Configuration
 *
 * This file contains centralized rate limiting configurations for different endpoints.
 * Each configuration specifies:
 * - consumptionPoints: Points consumed per request
 * - totalPoints: Total points allowed in the time window
 * - duration: Time window in seconds
 * - keyPrefix: Unique identifier for this rate limiter
 * - message: Custom error message (optional)
 */

export interface RateLimitConfig {
  consumptionPoints: number;
  totalPoints: number;
  duration: number;
  keyPrefix: string;
  message?: string;
}

/**
 * Preset rate limit configurations for common use cases
 */
export const RATE_LIMIT_PRESETS = {
  // Very strict: 1 request per 5 seconds
  VERY_STRICT: {
    consumptionPoints: 1,
    totalPoints: 1,
    duration: 5,
  },

  // Strict: 1 request per second
  STRICT: {
    consumptionPoints: 1,
    totalPoints: 1,
    duration: 1,
  },

  // Moderate: 10 requests per minute
  MODERATE: {
    consumptionPoints: 1,
    totalPoints: 10,
    duration: 60,
  },

  // Lenient: 30 requests per minute
  LENIENT: {
    consumptionPoints: 1,
    totalPoints: 30,
    duration: 60,
  },

  // Generous: 100 requests per minute
  GENEROUS: {
    consumptionPoints: 1,
    totalPoints: 100,
    duration: 60,
  },

  // For heavy operations: 1 request per 8 hours
  HEAVY_OPERATION: {
    consumptionPoints: 1,
    totalPoints: 1,
    duration: 28800, // 8 hours
  },
} as const;

/**
 * Endpoint-specific rate limit configurations
 */
export const ENDPOINT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Authentication endpoints
  AUTH_LOGIN: {
    ...RATE_LIMIT_PRESETS.MODERATE,
    keyPrefix: "auth_login",
    message: "Too many login attempts. Please try again later.",
  },

  AUTH_REGISTER: {
    ...RATE_LIMIT_PRESETS.VERY_STRICT,
    keyPrefix: "auth_register",
    message: "Registration limit exceeded. Please try again later.",
  },

  AUTH_OTP: {
    ...RATE_LIMIT_PRESETS.MODERATE,
    keyPrefix: "auth_otp",
    message: "Too many OTP requests. Please try again later.",
  },

  // Public form submissions
  CONTACT_US: {
    ...RATE_LIMIT_PRESETS.VERY_STRICT,
    keyPrefix: "contact_us",
    message: "You can only submit one message every 5 seconds. Please wait.",
  },

  GET_QUOTE: {
    ...RATE_LIMIT_PRESETS.VERY_STRICT,
    keyPrefix: "quote",
    message: "You can only request one quote every 5 seconds. Please wait.",
  },

  HIRE_US: {
    ...RATE_LIMIT_PRESETS.VERY_STRICT,
    keyPrefix: "hire_us",
    message:
      "You can only submit one hire request every 5 seconds. Please wait.",
  },

  // Freelancer endpoints
  FREELANCER_JOIN: {
    ...RATE_LIMIT_PRESETS.VERY_STRICT,
    keyPrefix: "freelancer_join",
    message:
      "You can only submit one join request every 5 seconds. Please wait.",
  },

  FREELANCER_REGISTER: {
    ...RATE_LIMIT_PRESETS.VERY_STRICT,
    keyPrefix: "freelancer_register",
    message:
      "You can only submit one registration every 5 seconds. Please wait.",
  },

  // Project requests
  PROJECT_REQUEST: {
    ...RATE_LIMIT_PRESETS.VERY_STRICT,
    keyPrefix: "project_request",
    message:
      "You can only create one project request every 5 seconds. Please wait.",
  },

  // Consultation endpoints
  CONSULTATION_CREATE: {
    ...RATE_LIMIT_PRESETS.VERY_STRICT,
    keyPrefix: "consultation_create",
    message:
      "You can only request one consultation every 5 seconds. Please wait.",
  },

  CONSULTATION_UPDATE: {
    ...RATE_LIMIT_PRESETS.VERY_STRICT,
    keyPrefix: "consultation_update",
    message: "You can only update a consultation every 5 seconds. Please wait.",
  },

  // Newsletter endpoints
  NEWSLETTER_SEND: {
    ...RATE_LIMIT_PRESETS.VERY_STRICT,
    keyPrefix: "newsletter",
    message: "Newsletter sending is rate limited. Please wait.",
  },
};

/**
 * Helper function to get rate limit configuration by name
 */
export function getRateLimitConfig(
  configName: keyof typeof ENDPOINT_RATE_LIMITS,
): RateLimitConfig {
  const config = ENDPOINT_RATE_LIMITS[configName];
  if (!config) {
    throw new Error(`Rate limit configuration not found: ${configName}`);
  }
  return config;
}

/**
 * Helper function to create custom rate limit configuration
 */
export function createRateLimitConfig(
  totalPoints: number,
  duration: number,
  keyPrefix: string,
  consumptionPoints = 1,
  message?: string,
): RateLimitConfig {
  const config: RateLimitConfig = {
    consumptionPoints,
    totalPoints,
    duration,
    keyPrefix,
  };

  if (message) {
    config.message = message;
  }

  return config;
}
