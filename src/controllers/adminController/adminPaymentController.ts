import type { Request, Response } from "express";
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

export class AdminPaymentController {
  /**
   * Get verification history for a specific payment
   * GET /api/v1/admin/payments/:paymentId/verification-history
   */
  static async getPaymentVerificationHistory(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { paymentId } = req.params;

      // Get payment with all verification logs
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          verificationLogs: {
            orderBy: {
              createdAt: "desc",
            },
          },
          project: {
            select: {
              id: true,
              paymentStatus: true,
            },
          },
          user: {
            select: {
              uid: true,
              email: true,
              fullName: true,
            },
          },
        },
      });

      if (!payment) {
        res.status(404).json({
          success: false,
          message: "Payment not found",
        });
        return;
      }

      // Calculate statistics
      const webhookCount = payment.verificationLogs.filter(
        (log) => log.verifiedBy === "webhook",
      ).length;
      const apiCheckCount = payment.verificationLogs.filter(
        (log) => log.verifiedBy === "api_check",
      ).length;
      const mismatchCount = payment.verificationLogs.filter(
        (log) => !log.matched,
      ).length;

      res.status(200).json({
        success: true,
        message: "Payment verification history retrieved successfully",
        data: {
          payment: {
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            createdAt: payment.createdAt,
            paidAt: payment.paidAt,
            stripeSessionId: payment.stripeSessionId,
            stripePaymentIntentId: payment.stripePaymentIntentId,
            webhookRetryCount: payment.webhookRetryCount,
            lastCheckedAt: payment.lastCheckedAt,
            lastWebhookEventId: payment.lastWebhookEventId,
            webhookEventsProcessed: payment.webhookEventsProcessed,
          },
          project: payment.project,
          user: payment.user,
          verificationLogs: payment.verificationLogs,
          statistics: {
            totalVerifications: payment.verificationLogs.length,
            webhookVerifications: webhookCount,
            apiCheckVerifications: apiCheckCount,
            mismatches: mismatchCount,
            hasWebhookFailure: payment.webhookRetryCount > 0,
          },
        },
      });

      logger.info(
        `Admin ${req.userFromToken?.uid} viewed verification history for payment ${paymentId}`,
      );
    } catch (error) {
      logger.error("Error getting payment verification history:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get payment verification history",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get payment verification statistics
   * GET /api/v1/admin/payments/verification-stats?days=7
   */
  static async getVerificationStats(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { days = "7" } = req.query as { days?: string };
      const daysInt = parseInt(days, 10);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysInt);

      // Get all payments in date range
      const payments = await prisma.payment.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          verificationLogs: true,
        },
      });

      // Calculate statistics
      const totalPayments = payments.length;
      const succeededPayments = payments.filter(
        (p) => p.status === "SUCCEEDED",
      ).length;
      const pendingPayments = payments.filter(
        (p) => p.status === "PENDING",
      ).length;
      const failedPayments = payments.filter(
        (p) => p.status === "FAILED",
      ).length;

      // Webhook statistics
      const paymentsWithWebhookSuccess = payments.filter(
        (p) => p.webhookRetryCount === 0 && p.status === "SUCCEEDED",
      ).length;
      const paymentsWithWebhookFailure = payments.filter(
        (p) => p.webhookRetryCount > 0,
      ).length;

      // Verification source breakdown
      const allVerificationLogs = payments.flatMap((p) => p.verificationLogs);
      const verificationBySource = {
        webhook: allVerificationLogs.filter(
          (log) => log.verifiedBy === "webhook",
        ).length,
        // eslint-disable-next-line camelcase
        api_check: allVerificationLogs.filter(
          (log) => log.verifiedBy === "api_check",
        ).length,
        cron: allVerificationLogs.filter((log) => log.verifiedBy === "cron")
          .length,
        manual: allVerificationLogs.filter((log) => log.verifiedBy === "manual")
          .length,
      };

      // Mismatch analysis
      const mismatchedVerifications = allVerificationLogs.filter(
        (log) => !log.matched,
      ).length;

      // Calculate rates
      const webhookSuccessRate =
        succeededPayments > 0
          ? (paymentsWithWebhookSuccess / succeededPayments) * 100
          : 0;
      const webhookFailureRate =
        totalPayments > 0
          ? (paymentsWithWebhookFailure / totalPayments) * 100
          : 0;

      // Average time to payment success
      const successfulPayments = payments.filter(
        (p) => p.paidAt && p.createdAt,
      );
      const avgTimeToSuccess =
        successfulPayments.length > 0
          ? successfulPayments.reduce((sum, p) => {
              const timeDiff =
                new Date(p.paidAt!).getTime() - new Date(p.createdAt).getTime();
              return sum + timeDiff;
            }, 0) /
            successfulPayments.length /
            1000
          : 0; // in seconds

      res.status(200).json({
        success: true,
        message: "Verification statistics retrieved successfully",
        data: {
          dateRange: {
            from: startDate.toISOString(),
            to: new Date().toISOString(),
            days: daysInt,
          },
          paymentOverview: {
            total: totalPayments,
            succeeded: succeededPayments,
            pending: pendingPayments,
            failed: failedPayments,
          },
          webhookReliability: {
            successfulWebhooks: paymentsWithWebhookSuccess,
            failedWebhooks: paymentsWithWebhookFailure,
            successRate: parseFloat(webhookSuccessRate.toFixed(2)),
            failureRate: parseFloat(webhookFailureRate.toFixed(2)),
          },
          verificationSources: {
            ...verificationBySource,
            total: allVerificationLogs.length,
            percentages: {
              webhook:
                allVerificationLogs.length > 0
                  ? parseFloat(
                      (
                        (verificationBySource.webhook /
                          allVerificationLogs.length) *
                        100
                      ).toFixed(2),
                    )
                  : 0,
              // eslint-disable-next-line camelcase
              api_check:
                allVerificationLogs.length > 0
                  ? parseFloat(
                      (
                        (verificationBySource.api_check /
                          allVerificationLogs.length) *
                        100
                      ).toFixed(2),
                    )
                  : 0,
              cron:
                allVerificationLogs.length > 0
                  ? parseFloat(
                      (
                        (verificationBySource.cron /
                          allVerificationLogs.length) *
                        100
                      ).toFixed(2),
                    )
                  : 0,
              manual:
                allVerificationLogs.length > 0
                  ? parseFloat(
                      (
                        (verificationBySource.manual /
                          allVerificationLogs.length) *
                        100
                      ).toFixed(2),
                    )
                  : 0,
            },
          },
          systemHealth: {
            mismatchedVerifications,
            averageTimeToSuccess: parseFloat(avgTimeToSuccess.toFixed(2)), // seconds
            averageTimeToSuccessMinutes: parseFloat(
              (avgTimeToSuccess / 60).toFixed(2),
            ),
            totalVerifications: allVerificationLogs.length,
          },
          reliability: {
            overallCoverage: parseFloat(
              ((succeededPayments / (totalPayments || 1)) * 100).toFixed(2),
            ),
            fallbackEffectiveness: parseFloat(
              (
                (verificationBySource.api_check /
                  (verificationBySource.webhook +
                    verificationBySource.api_check || 1)) *
                100
              ).toFixed(2),
            ),
          },
        },
      });

      logger.info(
        `Admin ${req.userFromToken?.uid} viewed verification stats for ${daysInt} days`,
      );
    } catch (error) {
      logger.error("Error getting verification stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get verification statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get payments with verification issues (mismatches)
   * GET /api/v1/admin/payments/verification-issues?days=7&limit=50
   */
  static async getVerificationIssues(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { days = "7", limit = "50" } = req.query as {
        days?: string;
        limit?: string;
      };
      const daysInt = parseInt(days, 10);
      const limitInt = parseInt(limit, 10);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysInt);

      // Find verification logs with mismatches
      const mismatchedLogs = await prisma.paymentVerificationLog.findMany({
        where: {
          matched: false,
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          payment: {
            include: {
              project: {
                select: {
                  id: true,
                  paymentStatus: true,
                },
              },
              user: {
                select: {
                  uid: true,
                  email: true,
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limitInt,
      });

      // Also find payments stuck in PENDING for > 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const stuckPayments = await prisma.payment.findMany({
        where: {
          status: "PENDING",
          createdAt: {
            lt: oneHourAgo,
            gte: startDate,
          },
        },
        include: {
          verificationLogs: {
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          },
          project: {
            select: {
              id: true,
              paymentStatus: true,
            },
          },
          user: {
            select: {
              uid: true,
              email: true,
              fullName: true,
            },
          },
        },
        take: limitInt,
      });

      // Find payments with high webhook retry counts
      const highRetryPayments = await prisma.payment.findMany({
        where: {
          webhookRetryCount: {
            gte: 2,
          },
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          verificationLogs: {
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          },
          project: {
            select: {
              id: true,
              paymentStatus: true,
            },
          },
          user: {
            select: {
              uid: true,
              email: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          webhookRetryCount: "desc",
        },
        take: limitInt,
      });

      res.status(200).json({
        success: true,
        message: "Verification issues retrieved successfully",
        data: {
          dateRange: {
            from: startDate.toISOString(),
            to: new Date().toISOString(),
            days: daysInt,
          },
          summary: {
            mismatchedVerifications: mismatchedLogs.length,
            stuckPayments: stuckPayments.length,
            highRetryPayments: highRetryPayments.length,
          },
          issues: {
            mismatchedVerifications: mismatchedLogs.map((log) => ({
              logId: log.id,
              paymentId: log.paymentId,
              verifiedBy: log.verifiedBy,
              stripeStatus: log.stripeStatus,
              ourStatus: log.ourStatus,
              eventId: log.eventId,
              createdAt: log.createdAt,
              payment: {
                id: log.payment.id,
                status: log.payment.status,
                amount: log.payment.amount,
                currency: log.payment.currency,
                stripeSessionId: log.payment.stripeSessionId,
                webhookRetryCount: log.payment.webhookRetryCount,
              },
              project: log.payment.project,
              user: log.payment.user,
            })),
            stuckPayments: stuckPayments.map((payment) => ({
              id: payment.id,
              status: payment.status,
              amount: payment.amount,
              currency: payment.currency,
              createdAt: payment.createdAt,
              hoursSinceCreation: (
                (Date.now() - new Date(payment.createdAt).getTime()) /
                (1000 * 60 * 60)
              ).toFixed(2),
              stripeSessionId: payment.stripeSessionId,
              webhookRetryCount: payment.webhookRetryCount,
              lastCheckedAt: payment.lastCheckedAt,
              recentVerifications: payment.verificationLogs,
              project: payment.project,
              user: payment.user,
            })),
            highRetryPayments: highRetryPayments.map((payment) => ({
              id: payment.id,
              status: payment.status,
              amount: payment.amount,
              currency: payment.currency,
              webhookRetryCount: payment.webhookRetryCount,
              createdAt: payment.createdAt,
              paidAt: payment.paidAt,
              stripeSessionId: payment.stripeSessionId,
              recentVerifications: payment.verificationLogs,
              project: payment.project,
              user: payment.user,
            })),
          },
        },
      });

      logger.info(
        `Admin ${req.userFromToken?.uid} viewed verification issues for ${daysInt} days`,
      );
    } catch (error) {
      logger.error("Error getting verification issues:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get verification issues",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default AdminPaymentController;
