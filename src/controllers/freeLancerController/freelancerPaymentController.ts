import type { Request, Response } from "express";
import FreelancerPayoutService from "../../services/freelancerPayoutService";
import { PrismaClient } from "@prisma/client";
import logger from "../../utils/loggerUtils";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  userFromToken?: {
    uid: string;
    role: string;
    isVerified: boolean;
  };
}

export class FreelancerPaymentController {
  /**
   * Add or update own Stripe account ID
   * POST /api/v1/freelancer/payment-details
   */
  static async updateOwnStripeAccount(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.userFromToken?.uid;
      const { stripeAccountId } = req.body;

      if (!stripeAccountId) {
        res.status(400).json({
          success: false,
          message: "Stripe account ID is required",
        });
        return;
      }

      // Get freelancer profile for this user
      const freelancer = await prisma.freelancer.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!freelancer) {
        res.status(404).json({
          success: false,
          message: "Freelancer profile not found for this user",
        });
        return;
      }

      const result =
        await FreelancerPayoutService.updateFreelancerStripeAccount({
          freelancerId: freelancer.id,
          stripeAccountId,
        });

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      logger.info(
        `Freelancer ${freelancer.id} updated their Stripe account: ${stripeAccountId}`,
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.freelancer,
      });
    } catch (error) {
      logger.error("Error updating freelancer Stripe account:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update Stripe account",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get own payment details and status
   * GET /api/v1/freelancer/payment-details
   */
  static async getOwnPaymentDetails(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.userFromToken?.uid;

      // Get freelancer profile for this user
      const freelancer = await prisma.freelancer.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!freelancer) {
        res.status(404).json({
          success: false,
          message: "Freelancer profile not found for this user",
        });
        return;
      }

      const result = await FreelancerPayoutService.getFreelancerPaymentDetails(
        freelancer.id,
      );

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json({
        success: true,
        message: "Payment details retrieved successfully",
        data: result.data,
      });
    } catch (error) {
      logger.error("Error getting freelancer payment details:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get payment details",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get own payout history
   * GET /api/v1/freelancer/payouts
   */
  static async getOwnPayoutHistory(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.userFromToken?.uid;
      const { page = "1", limit = "10" } = req.query;

      // Get freelancer profile for this user
      const freelancer = await prisma.freelancer.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!freelancer) {
        res.status(404).json({
          success: false,
          message: "Freelancer profile not found for this user",
        });
        return;
      }

      const result = await FreelancerPayoutService.getFreelancerPayoutHistory(
        freelancer.id,
        parseInt(page as string, 10),
        parseInt(limit as string, 10),
      );

      res.status(200).json({
        success: true,
        message: "Payout history retrieved successfully",
        data: result.data,
      });
    } catch (error) {
      logger.error("Error getting freelancer payout history:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get payout history",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get specific payout details (own payouts only)
   * GET /api/v1/freelancer/payouts/:payoutId
   */
  static async getOwnPayoutDetails(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.userFromToken?.uid;
      const { payoutId } = req.params;

      if (!payoutId) {
        res.status(400).json({
          success: false,
          message: "Payout ID is required",
        });
        return;
      }

      // Get freelancer profile for this user
      const freelancer = await prisma.freelancer.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!freelancer) {
        res.status(404).json({
          success: false,
          message: "Freelancer profile not found for this user",
        });
        return;
      }

      // Get payout and verify ownership
      const payout = await prisma.freelancerPayout.findUnique({
        where: { id: payoutId },
        include: {
          project: {
            include: {
              details: {
                select: {
                  companyName: true,
                },
              },
            },
          },
          milestone: {
            select: {
              id: true,
              milestoneName: true,
              description: true,
            },
          },
        },
      });

      if (!payout) {
        res.status(404).json({
          success: false,
          message: "Payout not found",
        });
        return;
      }

      // Verify this payout belongs to the freelancer
      if (payout.freelancerId !== freelancer.id) {
        res.status(403).json({
          success: false,
          message: "You don't have permission to view this payout",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Payout details retrieved successfully",
        data: payout,
      });
    } catch (error) {
      logger.error("Error getting payout details:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get payout details",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Remove Stripe account ID (disconnect payment method)
   * DELETE /api/v1/freelancer/payment-details
   */
  static async removeOwnStripeAccount(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.userFromToken?.uid;

      // Get freelancer profile for this user
      const freelancer = await prisma.freelancer.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!freelancer) {
        res.status(404).json({
          success: false,
          message: "Freelancer profile not found for this user",
        });
        return;
      }

      // Update freelancer to remove Stripe account
      await prisma.freelancer.update({
        where: { id: freelancer.id },
        data: {
          stripeAccountId: null,
          stripeAccountStatus: "NOT_CONNECTED",
          paymentDetailsVerified: false,
        },
      });

      logger.info(`Freelancer ${freelancer.id} removed their Stripe account`);

      res.status(200).json({
        success: true,
        message: "Stripe account disconnected successfully",
      });
    } catch (error) {
      logger.error("Error removing Stripe account:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove Stripe account",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default FreelancerPaymentController;
