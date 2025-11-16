import type { Request, Response } from "express";
import FreelancerPayoutService from "../../services/freelancerPayoutService";
import { PayoutStatus, PayoutType } from "@prisma/client";
import logger from "../../utils/loggerUtils";

interface AuthenticatedRequest extends Request {
  userFromToken?: {
    uid: string;
    role: string;
    isVerified: boolean;
  };
}

export class AdminFreelancerPayoutController {
  /**
   * Add or update freelancer Stripe account details
   * POST /api/v1/admin/freelancers/:freelancerId/payment-details
   */
  static async updateFreelancerStripeAccount(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { freelancerId } = req.params;
      const { stripeAccountId } = req.body;

      if (!freelancerId) {
        res.status(400).json({
          success: false,
          message: "Freelancer ID is required",
        });
        return;
      }

      if (!stripeAccountId) {
        res.status(400).json({
          success: false,
          message: "Stripe account ID is required",
        });
        return;
      }

      const result =
        await FreelancerPayoutService.updateFreelancerStripeAccount({
          freelancerId,
          stripeAccountId,
        });

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      logger.info(
        `Admin ${req.userFromToken?.uid} updated Stripe account for freelancer ${freelancerId}`,
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
        message: "Failed to update freelancer Stripe account",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get freelancer payment details
   * GET /api/v1/admin/freelancers/:freelancerId/payment-details
   */
  static async getFreelancerPaymentDetails(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { freelancerId } = req.params;

      if (!freelancerId) {
        res.status(400).json({
          success: false,
          message: "Freelancer ID is required",
        });
        return;
      }

      const result =
        await FreelancerPayoutService.getFreelancerPaymentDetails(freelancerId);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json({
        success: true,
        message: "Freelancer payment details retrieved successfully",
        data: result.data,
      });
    } catch (error) {
      logger.error("Error getting freelancer payment details:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get freelancer payment details",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Initiate payout to freelancer
   * POST /api/v1/admin/freelancers/:freelancerId/payout
   */
  static async createPayout(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { freelancerId } = req.params;
      const {
        amount,
        currency,
        payoutType,
        description,
        notes,
        projectId,
        milestoneId,
      } = req.body;

      if (!freelancerId) {
        res.status(400).json({
          success: false,
          message: "Freelancer ID is required",
        });
        return;
      }

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          message: "Valid amount is required",
        });
        return;
      }

      if (!payoutType || !Object.values(PayoutType).includes(payoutType)) {
        res.status(400).json({
          success: false,
          message: "Valid payout type is required",
        });
        return;
      }

      const result = await FreelancerPayoutService.createPayout({
        freelancerId,
        amount: parseFloat(amount),
        currency: currency || "usd",
        payoutType,
        description,
        notes,
        projectId,
        milestoneId,
        initiatedBy: req.userFromToken!.uid,
      });

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      logger.info(
        `Admin ${req.userFromToken?.uid} initiated payout to freelancer ${freelancerId}`,
        {
          amount,
          payoutType,
        },
      );

      res.status(201).json({
        success: true,
        message: result.message,
        data: result.payout,
      });
    } catch (error) {
      logger.error("Error creating payout:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create payout",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get payout history for a freelancer
   * GET /api/v1/admin/freelancers/:freelancerId/payouts
   */
  static async getFreelancerPayoutHistory(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { freelancerId } = req.params;
      const { page = "1", limit = "10" } = req.query;

      if (!freelancerId) {
        res.status(400).json({
          success: false,
          message: "Freelancer ID is required",
        });
        return;
      }

      const result = await FreelancerPayoutService.getFreelancerPayoutHistory(
        freelancerId,
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
   * Get all payouts (admin view with filters)
   * GET /api/v1/admin/payouts
   */
  static async getAllPayouts(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const {
        page = "1",
        limit = "10",
        status,
        freelancerId,
        projectId,
        startDate,
        endDate,
      } = req.query;

      const filters: {
        page: number;
        limit: number;
        status?: PayoutStatus;
        freelancerId?: string;
        projectId?: string;
        startDate?: Date;
        endDate?: Date;
      } = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      };

      if (
        status &&
        Object.values(PayoutStatus).includes(status as PayoutStatus)
      ) {
        filters.status = status as PayoutStatus;
      }

      if (freelancerId) filters.freelancerId = freelancerId as string;
      if (projectId) filters.projectId = projectId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const result = await FreelancerPayoutService.getAllPayouts(filters);

      res.status(200).json({
        success: true,
        message: "Payouts retrieved successfully",
        data: result.data,
      });
    } catch (error) {
      logger.error("Error getting all payouts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get payouts",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get specific payout details
   * GET /api/v1/admin/payouts/:payoutId
   */
  static async getPayoutById(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { payoutId } = req.params;

      if (!payoutId) {
        res.status(400).json({
          success: false,
          message: "Payout ID is required",
        });
        return;
      }

      const result = await FreelancerPayoutService.getPayoutById(payoutId);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json({
        success: true,
        message: "Payout details retrieved successfully",
        data: result.data,
      });
    } catch (error) {
      logger.error("Error getting payout by ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get payout details",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Cancel a pending payout
   * DELETE /api/v1/admin/payouts/:payoutId
   */
  static async cancelPayout(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { payoutId } = req.params;

      if (!payoutId) {
        res.status(400).json({
          success: false,
          message: "Payout ID is required",
        });
        return;
      }

      const result = await FreelancerPayoutService.cancelPayout(
        payoutId,
        req.userFromToken!.uid,
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      logger.info(
        `Admin ${req.userFromToken?.uid} cancelled payout ${payoutId}`,
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      logger.error("Error cancelling payout:", error);
      res.status(500).json({
        success: false,
        message: "Failed to cancel payout",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Update payout status (manual override)
   * PATCH /api/v1/admin/payouts/:payoutId/status
   */
  static async updatePayoutStatus(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { payoutId } = req.params;
      const { status, paidAt } = req.body;

      if (!payoutId) {
        res.status(400).json({
          success: false,
          message: "Payout ID is required",
        });
        return;
      }

      if (!status || !Object.values(PayoutStatus).includes(status)) {
        res.status(400).json({
          success: false,
          message: "Valid status is required",
        });
        return;
      }

      const result = await FreelancerPayoutService.updatePayoutStatus(
        payoutId,
        status as PayoutStatus,
        paidAt ? new Date(paidAt) : undefined,
      );

      logger.info(
        `Admin ${req.userFromToken?.uid} updated payout ${payoutId} status to ${status}`,
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      logger.error("Error updating payout status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update payout status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default AdminFreelancerPayoutController;
