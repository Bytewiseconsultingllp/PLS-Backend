import type { Request, Response } from "express";
import RefundService from "../../services/refundService";
import StripeService from "../../services/stripeService";
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

export class AdminRefundController {
  /**
   * Process a refund
   * POST /api/v1/admin/refunds/process
   */
  static async processRefund(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const adminId = req.userFromToken?.uid;
      const { paymentId, amount, reason, notes } = req.body as {
        paymentId: string;
        amount: number;
        reason?: string;
        notes?: string;
      };

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: "Payment ID is required",
        });
        return;
      }

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          message: "Valid refund amount is required",
        });
        return;
      }

      const result = await RefundService.processRefund({
        paymentId,
        amount,
        reason,
        notes,
        adminId,
      });

      logger.info(`Refund processed by admin ${adminId}`, result);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      logger.error("Error processing refund:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process refund",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get refund details
   * GET /api/v1/admin/refunds/:refundId
   */
  static async getRefund(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { refundId } = req.params;

      if (!refundId) {
        res.status(400).json({
          success: false,
          message: "Refund ID is required",
        });
        return;
      }

      const refund = await RefundService.getRefundById(refundId);

      if (!refund) {
        res.status(404).json({
          success: false,
          message: "Refund not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Refund details retrieved successfully",
        data: refund,
      });
    } catch (error) {
      logger.error("Error getting refund:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get refund details",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get all refunds for a project
   * GET /api/v1/admin/projects/:projectId/refunds
   */
  static async getProjectRefunds(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          success: false,
          message: "Project ID is required",
        });
        return;
      }

      const refunds = await RefundService.getProjectRefunds(projectId);

      // Also get project net amount
      const netAmount =
        await RefundService.calculateProjectNetAmount(projectId);

      res.status(200).json({
        success: true,
        message: "Project refunds retrieved successfully",
        data: {
          refunds,
          summary: netAmount,
        },
      });
    } catch (error) {
      logger.error("Error getting project refunds:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get project refunds",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get all refunds for a payment
   * GET /api/v1/admin/payments/:paymentId/refunds
   */
  static async getPaymentRefunds(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: "Payment ID is required",
        });
        return;
      }

      const refunds = await RefundService.getPaymentRefunds(paymentId);

      res.status(200).json({
        success: true,
        message: "Payment refunds retrieved successfully",
        data: refunds,
      });
    } catch (error) {
      logger.error("Error getting payment refunds:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get payment refunds",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get all refunds with filters
   * GET /api/v1/admin/refunds
   */
  static async getAllRefunds(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { status, adminId, startDate, endDate, limit, offset } =
        req.query as {
          status?: string;
          adminId?: string;
          startDate?: string;
          endDate?: string;
          limit?: string;
          offset?: string;
        };

      const filters = {
        status,
        adminId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      };

      const result = await RefundService.getAllRefunds(filters);

      res.status(200).json({
        success: true,
        message: "Refunds retrieved successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error getting all refunds:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get refunds",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get project net amount (for financial reporting)
   * GET /api/v1/admin/projects/:projectId/net-amount
   */
  static async getProjectNetAmount(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          success: false,
          message: "Project ID is required",
        });
        return;
      }

      const netAmount =
        await RefundService.calculateProjectNetAmount(projectId);

      res.status(200).json({
        success: true,
        message: "Project net amount calculated successfully",
        data: netAmount,
      });
    } catch (error) {
      logger.error("Error calculating project net amount:", error);
      res.status(500).json({
        success: false,
        message: "Failed to calculate net amount",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Sync payment intent ID from Stripe session
   * POST /api/v1/admin/payments/:paymentId/sync-payment-intent
   */
  static async syncPaymentIntent(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { paymentId } = req.params;
      const adminId = req.userFromToken?.uid;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: "Payment ID is required",
        });
        return;
      }

      // Get payment
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        select: {
          id: true,
          stripeSessionId: true,
          stripePaymentIntentId: true,
          status: true,
        },
      });

      if (!payment) {
        res.status(404).json({
          success: false,
          message: "Payment not found",
        });
        return;
      }

      if (payment.stripePaymentIntentId) {
        res.status(200).json({
          success: true,
          message: "Payment already has payment intent ID",
          data: {
            paymentId: payment.id,
            stripePaymentIntentId: payment.stripePaymentIntentId,
            alreadySynced: true,
          },
        });
        return;
      }

      if (!payment.stripeSessionId) {
        res.status(400).json({
          success: false,
          message: "Payment has no Stripe session ID - cannot sync",
        });
        return;
      }

      // Retrieve session from Stripe
      const session = await StripeService.getCheckoutSession(
        payment.stripeSessionId,
      );

      if (!session.payment_intent) {
        res.status(400).json({
          success: false,
          message: "Stripe session has no payment intent",
        });
        return;
      }

      // Extract payment intent ID (can be string or object with id)
      let paymentIntentId: string;
      if (typeof session.payment_intent === "string") {
        paymentIntentId = session.payment_intent;
      } else if (
        typeof session.payment_intent === "object" &&
        "id" in session.payment_intent
      ) {
        paymentIntentId = (session.payment_intent as { id: string }).id;
      } else {
        res.status(400).json({
          success: false,
          message: "Unable to extract payment intent ID from session",
        });
        return;
      }

      // Update payment with payment intent ID
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          stripePaymentIntentId: paymentIntentId,
        },
      });

      logger.info(
        `Payment intent synced for payment ${paymentId} by admin ${adminId}`,
        {
          paymentId,
          stripePaymentIntentId: session.payment_intent,
          adminId,
        },
      );

      res.status(200).json({
        success: true,
        message: "Payment intent ID synced successfully",
        data: {
          paymentId: updatedPayment.id,
          stripePaymentIntentId: updatedPayment.stripePaymentIntentId,
          synced: true,
        },
      });
    } catch (error) {
      logger.error("Error syncing payment intent:", error);
      res.status(500).json({
        success: false,
        message: "Failed to sync payment intent",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Bulk sync payment intent IDs for all payments missing them
   * POST /api/v1/admin/payments/bulk-sync-payment-intents
   */
  static async bulkSyncPaymentIntents(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const adminId = req.userFromToken?.uid;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      // Find all payments missing payment intent ID
      const payments = await prisma.payment.findMany({
        where: {
          stripePaymentIntentId: null,
          stripeSessionId: { not: null },
          status: "SUCCEEDED",
        },
        select: {
          id: true,
          stripeSessionId: true,
        },
        take: 100, // Limit to prevent timeout
      });

      const results = {
        total: payments.length,
        synced: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const payment of payments) {
        try {
          const session = await StripeService.getCheckoutSession(
            payment.stripeSessionId!,
          );

          if (session.payment_intent) {
            // Extract payment intent ID (can be string or object with id)
            let paymentIntentId: string | null = null;
            if (typeof session.payment_intent === "string") {
              paymentIntentId = session.payment_intent;
            } else if (
              typeof session.payment_intent === "object" &&
              "id" in session.payment_intent
            ) {
              paymentIntentId = (session.payment_intent as { id: string }).id;
            }

            if (paymentIntentId) {
              await prisma.payment.update({
                where: { id: payment.id },
                data: {
                  stripePaymentIntentId: paymentIntentId,
                },
              });
              results.synced++;
              logger.info(`Synced payment intent for payment ${payment.id}`);
            } else {
              results.failed++;
              results.errors.push(
                `Payment ${payment.id}: Unable to extract payment intent ID`,
              );
            }
          } else {
            results.failed++;
            results.errors.push(
              `Payment ${payment.id}: No payment intent in session`,
            );
          }
        } catch (error) {
          results.failed++;
          const errorMsg =
            error instanceof Error ? error.message : "Unknown error";
          results.errors.push(`Payment ${payment.id}: ${errorMsg}`);
          logger.error(`Failed to sync payment ${payment.id}:`, error);
        }
      }

      logger.info(`Bulk payment intent sync completed by admin ${adminId}`, {
        ...results,
        adminId,
      });

      res.status(200).json({
        success: true,
        message: "Bulk sync completed",
        data: results,
      });
    } catch (error) {
      logger.error("Error in bulk sync:", error);
      res.status(500).json({
        success: false,
        message: "Failed to bulk sync payment intents",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default AdminRefundController;
