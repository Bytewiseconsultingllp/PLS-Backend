import type { Request, Response } from "express";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import StripeService from "../../services/stripeService";
import CurrencyDetectionService from "../../services/currencyDetectionService";
import logger from "../../utils/loggerUtils";
import {
  STRIPE_CONNECT_CLIENT_ID,
  BACKEND_URL,
  FRONTEND_URL,
} from "../../config/config";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  userFromToken?: {
    uid: string;
    role: string;
    isVerified: boolean;
  };
}

// In-memory state store (in production, use Redis or database)
const oauthStateStore = new Map<
  string,
  { freelancerId: string; expires: number }
>();

// Clean up expired states every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [state, data] of oauthStateStore.entries()) {
      if (data.expires < now) {
        oauthStateStore.delete(state);
      }
    }
  },
  5 * 60 * 1000,
);

export class FreelancerStripeConnectController {
  /**
   * Generate Stripe Connect OAuth URL
   * GET /api/v1/freelancer/stripe-connect-url
   */
  static async getStripeConnectUrl(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.userFromToken?.uid;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      // Get freelancer profile
      const freelancer = await prisma.freelancer.findUnique({
        where: { userId },
        include: {
          details: {
            select: {
              email: true,
              fullName: true,
              country: true,
            },
          },
        },
      });

      if (!freelancer) {
        res.status(404).json({
          success: false,
          message: "Freelancer profile not found",
        });
        return;
      }

      // Check if already connected
      if (
        freelancer.stripeAccountId &&
        freelancer.stripeAccountStatus === "ACTIVE"
      ) {
        res.status(400).json({
          success: false,
          message: "Stripe account already connected",
          data: {
            accountId: freelancer.stripeAccountId,
            status: freelancer.stripeAccountStatus,
          },
        });
        return;
      }

      const requestedCountryParam =
        (req.query.country as string | undefined) ||
        freelancer.details?.country ||
        "US";
      const normalizedCountry =
        CurrencyDetectionService.normalizeCountry(requestedCountryParam) ||
        "US";

      const supportedCountries =
        await StripeService.listSupportedConnectCountries();
      const supportedCountryCodes = new Set(
        supportedCountries.map((country) => country.code),
      );

      if (!supportedCountryCodes.has(normalizedCountry)) {
        res.status(400).json({
          success: false,
          message: `Country ${normalizedCountry} is not supported for Stripe Connect onboarding`,
          data: {
            supportedCountries,
          },
        });
        return;
      }

      // Generate secure state token
      const state = crypto.randomBytes(32).toString("hex");

      // Store state with freelancer ID (expires in 1 hour)
      oauthStateStore.set(state, {
        freelancerId: freelancer.id,
        expires: Date.now() + 3600000, // 1 hour
      });

      // Generate OAuth URL
      const connectUrl = StripeService.generateOAuthUrl({
        clientId: STRIPE_CONNECT_CLIENT_ID,
        redirectUri: `${BACKEND_URL}/api/v1/freelancer/stripe-connect-callback`,
        state,
        userEmail: freelancer.details?.email,
        userCountry: normalizedCountry,
      });

      logger.info(
        `Generated Stripe Connect URL for freelancer ${freelancer.id}`,
      );

      res.status(200).json({
        success: true,
        message: "Stripe Connect URL generated",
        data: {
          connectUrl,
          expiresIn: 3600, // seconds
        },
      });
    } catch (error) {
      logger.error("Error generating Stripe Connect URL:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate Stripe Connect URL",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Handle Stripe OAuth callback
   * GET /api/v1/freelancer/stripe-connect-callback
   */
  static async handleStripeCallback(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { code, state, error: oauthError } = req.query;

      // Check if user denied authorization
      if (oauthError) {
        const errorReason =
          typeof oauthError === "string" ? oauthError : "access_denied";
        logger.warn(`Stripe OAuth denied: ${errorReason}`);
        res.redirect(
          `${FRONTEND_URL}/freelancer/stripe/error?reason=${errorReason}`,
        );
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        res.redirect(
          `${FRONTEND_URL}/freelancer/stripe/error?reason=missing_parameters`,
        );
        return;
      }

      // Verify state token
      const stateData = oauthStateStore.get(state as string);
      if (!stateData || stateData.expires < Date.now()) {
        res.redirect(
          `${FRONTEND_URL}/freelancer/stripe/error?reason=invalid_state`,
        );
        return;
      }

      // Delete used state token
      oauthStateStore.delete(state as string);

      const { freelancerId } = stateData;

      try {
        // Exchange authorization code for account access
        const oauthResponse = await StripeService.exchangeOAuthCode(
          code as string,
        );

        const stripeAccountId = oauthResponse.stripe_user_id;

        if (!stripeAccountId) {
          logger.error(
            "OAuth exchange succeeded but no stripe_user_id returned",
          );
          res.redirect(
            `${FRONTEND_URL}/freelancer/stripe/error?reason=no_account_id`,
          );
          return;
        }

        // Get account details to verify status
        const account = await StripeService.getConnectAccount(stripeAccountId);

        // Update freelancer with connected account
        await prisma.freelancer.update({
          where: { id: freelancerId },
          data: {
            stripeAccountId,
            stripeAccountStatus: account.charges_enabled ? "ACTIVE" : "PENDING",
            paymentDetailsVerified: account.charges_enabled,
          },
        });

        logger.info(
          `Freelancer ${freelancerId} successfully connected Stripe account ${stripeAccountId}`,
        );

        // Redirect to success page
        res.redirect(
          `${FRONTEND_URL}/freelancer/stripe/success?accountId=${stripeAccountId}`,
        );
      } catch (exchangeError) {
        logger.error("Error exchanging OAuth code:", exchangeError);
        res.redirect(
          `${FRONTEND_URL}/freelancer/stripe/error?reason=exchange_failed`,
        );
      }
    } catch (error) {
      logger.error("Error handling Stripe callback:", error);
      res.redirect(
        `${FRONTEND_URL}/freelancer/stripe/error?reason=server_error`,
      );
    }
  }

  /**
   * Disconnect Stripe account (revoke OAuth connection)
   * DELETE /api/v1/freelancer/stripe-connect
   */
  static async disconnectStripeAccount(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.userFromToken?.uid;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      // Get freelancer profile
      const freelancer = await prisma.freelancer.findUnique({
        where: { userId },
        select: {
          id: true,
          stripeAccountId: true,
          stripeAccountStatus: true,
        },
      });

      if (!freelancer) {
        res.status(404).json({
          success: false,
          message: "Freelancer profile not found",
        });
        return;
      }

      if (!freelancer.stripeAccountId) {
        res.status(400).json({
          success: false,
          message: "No Stripe account connected",
        });
        return;
      }

      try {
        // Deauthorize the connected account
        await StripeService.deauthorizeAccount(freelancer.stripeAccountId);

        // Update freelancer record
        await prisma.freelancer.update({
          where: { id: freelancer.id },
          data: {
            stripeAccountId: null,
            stripeAccountStatus: "NOT_CONNECTED",
            paymentDetailsVerified: false,
          },
        });

        logger.info(
          `Freelancer ${freelancer.id} disconnected Stripe account ${freelancer.stripeAccountId}`,
        );

        res.status(200).json({
          success: true,
          message: "Stripe account disconnected successfully",
        });
      } catch (deauthError) {
        logger.error("Error deauthorizing Stripe account:", deauthError);

        // Even if deauth fails, update our database
        await prisma.freelancer.update({
          where: { id: freelancer.id },
          data: {
            stripeAccountId: null,
            stripeAccountStatus: "NOT_CONNECTED",
            paymentDetailsVerified: false,
          },
        });

        res.status(200).json({
          success: true,
          message: "Stripe account disconnected from platform",
        });
      }
    } catch (error) {
      logger.error("Error disconnecting Stripe account:", error);
      res.status(500).json({
        success: false,
        message: "Failed to disconnect Stripe account",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get Stripe Connect status
   * GET /api/v1/freelancer/stripe-connect-status
   */
  static async getConnectStatus(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.userFromToken?.uid;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      // Get freelancer profile
      const freelancer = await prisma.freelancer.findUnique({
        where: { userId },
        select: {
          id: true,
          stripeAccountId: true,
          stripeAccountStatus: true,
          paymentDetailsVerified: true,
        },
      });

      if (!freelancer) {
        res.status(404).json({
          success: false,
          message: "Freelancer profile not found",
        });
        return;
      }

      let accountDetails = null;

      // If connected, get live status from Stripe
      if (freelancer.stripeAccountId) {
        try {
          const account = await StripeService.getConnectAccount(
            freelancer.stripeAccountId,
          );

          accountDetails = {
            id: account.id,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            detailsSubmitted: account.details_submitted,
            requirementsCurrentlyDue: account.requirements?.currently_due || [],
            requirementsPastDue: account.requirements?.past_due || [],
          };

          // Update status in database if different
          const newStatus = account.charges_enabled ? "ACTIVE" : "PENDING";
          if (freelancer.stripeAccountStatus !== newStatus) {
            await prisma.freelancer.update({
              where: { id: freelancer.id },
              data: {
                stripeAccountStatus: newStatus,
                paymentDetailsVerified: account.charges_enabled,
              },
            });
          }
        } catch (accountError) {
          logger.error("Error fetching Stripe account details:", accountError);
          // Continue with database status if Stripe fetch fails
        }
      }

      res.status(200).json({
        success: true,
        message: "Stripe Connect status retrieved",
        data: {
          isConnected: !!freelancer.stripeAccountId,
          status: freelancer.stripeAccountStatus,
          verified: freelancer.paymentDetailsVerified,
          accountId: freelancer.stripeAccountId,
          accountDetails,
        },
      });
    } catch (error) {
      logger.error("Error getting Stripe Connect status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get Stripe Connect status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * List supported Stripe Connect countries
   * GET /api/v1/freelancer/stripe-connect-supported-countries
   */
  static async listSupportedCountries(
    _req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const countries = await StripeService.listSupportedConnectCountries();
      res.status(200).json({
        success: true,
        message: "Supported countries retrieved",
        data: countries,
      });
    } catch (error) {
      logger.error("Error listing Stripe Connect countries:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve supported countries",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default FreelancerStripeConnectController;
