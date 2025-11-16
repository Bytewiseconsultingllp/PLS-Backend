/* eslint-disable camelcase */
import { db } from "../database/db";
import { Decimal } from "@prisma/client/runtime/library";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../config/config";
import logger from "../utils/loggerUtils";

// Initialize Stripe with secret key
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

interface ProcessRefundData {
  paymentId: string;
  amount: number; // Amount in dollars
  reason?: string;
  notes?: string;
  adminId: string; // UID of admin processing refund
}

interface RefundResponse {
  refundId: string;
  stripeRefundId: string;
  amount: number;
  status: string;
  message: string;
}

export class RefundService {
  /**
   * Process a refund for a payment
   * Steps:
   * 1. Validate payment exists and has sufficient funds
   * 2. Create refund in Stripe
   * 3. Create refund record in DB
   * 4. Update Payment.totalRefundedAmount
   * 5. Update Project.totalRefunded
   */
  static async processRefund(data: ProcessRefundData): Promise<RefundResponse> {
    const { paymentId, amount, reason, notes, adminId } = data;

    try {
      logger.info("Refund initiated", {
        paymentId,
        amount,
        adminId,
        reason,
      });

      // Step 1: Get payment details
      const payment = await db.payment.findUnique({
        where: { id: paymentId },
        include: {
          project: {
            include: {
              estimate: true,
              details: true,
            },
          },
          user: true,
        },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (!payment.stripePaymentIntentId) {
        throw new Error(
          "Cannot process refund: Payment was not processed through Stripe Payment Intent",
        );
      }

      // Step 2: Validate refund amount
      const paymentAmountInDollars = payment.amount / 100;
      const alreadyRefunded = Number(payment.totalRefundedAmount || 0);
      const availableToRefund = paymentAmountInDollars - alreadyRefunded;

      // Validate amount is positive
      if (amount <= 0) {
        throw new Error("Refund amount must be greater than 0");
      }

      // Validate amount precision (max 2 decimals)
      if (!/^\d+(\.\d{1,2})?$/.test(amount.toString())) {
        throw new Error("Refund amount must have maximum 2 decimal places");
      }

      // Check if already fully refunded
      if (availableToRefund <= 0) {
        throw new Error(
          `This payment has already been fully refunded. ` +
            `Payment amount: $${paymentAmountInDollars}, Already refunded: $${alreadyRefunded}`,
        );
      }

      // Validate amount doesn't exceed available
      if (amount > availableToRefund) {
        throw new Error(
          `Refund amount ($${amount}) exceeds available amount ($${availableToRefund.toFixed(2)}). ` +
            `Payment total: $${paymentAmountInDollars}, Already refunded: $${alreadyRefunded}`,
        );
      }

      // Validate payment status
      if (payment.status !== "SUCCEEDED") {
        throw new Error(
          `Cannot refund: Payment status is ${payment.status}, must be SUCCEEDED`,
        );
      }

      // Step 3: Create refund in Stripe
      const amountInCents = Math.round(amount * 100);
      let stripeRefund: Stripe.Refund;

      try {
        stripeRefund = await stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          amount: amountInCents,
          reason: "requested_by_customer", // Stripe requires specific reasons
          metadata: {
            paymentId: payment.id,
            projectId: payment.projectId || "",
            adminId,
            customReason: reason || "",
          },
        });

        logger.info("Stripe refund created", {
          stripeRefundId: stripeRefund.id,
          paymentId,
          amount,
        });
      } catch (error) {
        // Handle Stripe-specific errors
        if (error instanceof Stripe.errors.StripeError) {
          if (error.type === "StripeCardError") {
            throw new Error(`Card error: ${error.message}`);
          }
          if (error.type === "StripeInvalidRequestError") {
            throw new Error(`Invalid request: ${error.message}`);
          }
          if (error.type === "StripeAPIError") {
            throw new Error(`Stripe API error: ${error.message}`);
          }
          if (error.type === "StripeConnectionError") {
            throw new Error(`Connection error: ${error.message}`);
          }
          if (error.type === "StripeAuthenticationError") {
            throw new Error(`Authentication error: Check STRIPE_SECRET_KEY`);
          }
          // Generic Stripe error
          throw new Error(`Stripe error: ${error.message}`);
        }
        // Non-Stripe error
        throw error;
      }

      // Step 4: Create refund record and update totals in transaction
      let refund;
      try {
        logger.info("Updating database", {
          paymentId,
          projectId: payment.projectId,
        });

        refund = await db.$transaction(async (tx) => {
          // Create refund record
          const newRefund = await tx.refund.create({
            data: {
              paymentId,
              projectId: payment.projectId || "",
              refundedBy: adminId,
              amount: new Decimal(amount),
              reason,
              notes,
              status: "SUCCEEDED",
              stripeRefundId: stripeRefund.id,
              processedAt: new Date(),
            },
          });

          // Update payment totals
          await tx.payment.update({
            where: { id: paymentId },
            data: {
              totalRefundedAmount: {
                increment: amount,
              },
              lastRefundedAt: new Date(),
            },
          });

          // Update project totals
          if (payment.projectId) {
            await tx.project.update({
              where: { id: payment.projectId },
              data: {
                totalRefunded: {
                  increment: amount,
                },
              },
            });
          } else {
            logger.warn(`Payment ${paymentId} has no associated project`);
          }

          return newRefund;
        });
      } catch (error) {
        // DB transaction failed but Stripe refund succeeded
        logger.error("DB transaction failed but Stripe refund succeeded", {
          stripeRefundId: stripeRefund.id,
          paymentId,
          error,
        });
        throw new Error(
          `Refund created in Stripe (${stripeRefund.id}) but DB update failed. ` +
            `Manual reconciliation required. Error: ${error instanceof Error ? error.message : "Unknown"}`,
        );
      }

      logger.info("Refund completed successfully", {
        refundId: refund.id,
        stripeRefundId: stripeRefund.id,
        paymentId,
        projectId: payment.projectId,
        amount,
      });

      // Step 5: Send email notification (async, don't wait)
      if (payment.user?.email) {
        this.sendRefundNotification({
          clientEmail: payment.user.email,
          clientName: payment.clientName || payment.user.fullName,
          refundAmount: amount,
          paymentAmount: paymentAmountInDollars,
          projectId: payment.projectId,
          reason,
        }).catch((error) => {
          logger.error("Failed to send refund notification email", {
            error: error instanceof Error ? error.message : "Unknown",
            refundId: refund.id,
            clientEmail: payment.user?.email,
          });
        });
      }

      return {
        refundId: refund.id,
        stripeRefundId: stripeRefund.id,
        amount,
        status: "SUCCEEDED",
        message: "Refund processed successfully",
      };
    } catch (error) {
      logger.error("Error processing refund", {
        error: error instanceof Error ? error.message : "Unknown",
        stack: error instanceof Error ? error.stack : undefined,
        paymentId,
        amount,
        adminId,
      });

      throw error;
    }
  }

  /**
   * Get refund details by ID
   */
  static async getRefundById(refundId: string) {
    return db.refund.findUnique({
      where: { id: refundId },
      include: {
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            clientEmail: true,
            clientName: true,
          },
        },
        project: {
          select: {
            id: true,
            details: {
              select: {
                companyName: true,
              },
            },
          },
        },
        admin: {
          select: {
            uid: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get all refunds for a project
   */
  static async getProjectRefunds(projectId: string) {
    return db.refund.findMany({
      where: { projectId },
      include: {
        payment: {
          select: {
            id: true,
            amount: true,
            clientEmail: true,
          },
        },
        admin: {
          select: {
            uid: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Get all refunds for a payment
   */
  static async getPaymentRefunds(paymentId: string) {
    return db.refund.findMany({
      where: { paymentId },
      include: {
        admin: {
          select: {
            uid: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Get all refunds with optional filters
   */
  static async getAllRefunds(filters?: {
    status?: string;
    adminId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.adminId) {
      where.refundedBy = filters.adminId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [refunds, total] = await Promise.all([
      db.refund.findMany({
        where,
        include: {
          payment: {
            select: {
              id: true,
              clientEmail: true,
              clientName: true,
            },
          },
          project: {
            select: {
              id: true,
              details: {
                select: {
                  companyName: true,
                },
              },
            },
          },
          admin: {
            select: {
              uid: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      db.refund.count({ where }),
    ]);

    return {
      refunds,
      total,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
    };
  }

  /**
   * Calculate net amount received for a project
   */
  static async calculateProjectNetAmount(projectId: string) {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: {
        totalAmountPaid: true,
        totalRefunded: true,
        paymentCompletionPercentage: true,
        estimate: {
          select: {
            calculatedTotal: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const totalPaid = Number(project.totalAmountPaid || 0);
    const totalRefunded = Number(project.totalRefunded || 0);
    const netAmount = totalPaid - totalRefunded;
    const projectTotal = Number(project.estimate?.calculatedTotal || 0);
    const netPercentage =
      projectTotal > 0 ? (netAmount / projectTotal) * 100 : 0;

    return {
      totalAmountPaid: totalPaid,
      totalRefunded: totalRefunded,
      netAmountReceived: netAmount,
      projectTotal,
      paymentCompletionPercentage: Number(
        project.paymentCompletionPercentage || 0,
      ),
      netCompletionPercentage: netPercentage,
    };
  }

  /**
   * Send refund notification email
   */
  private static async sendRefundNotification(data: {
    clientEmail: string;
    clientName: string;
    refundAmount: number;
    paymentAmount: number;
    projectId: string | null;
    reason?: string;
  }) {
    // Import sendTemplatedEmail
    const { sendTemplatedEmail } = await import(
      "../services/globalMailService"
    );

    const subject = `Refund Processed - $${data.refundAmount.toFixed(2)}`;

    const variables = {
      clientName: data.clientName,
      refundAmount: data.refundAmount.toFixed(2),
      paymentAmount: data.paymentAmount.toFixed(2),
      projectId: data.projectId || "N/A",
      reason: data.reason || "No reason provided",
    };

    await sendTemplatedEmail(
      data.clientEmail,
      subject,
      "refundProcessed",
      variables,
    );

    logger.info("Refund notification email sent", {
      clientEmail: data.clientEmail,
    });
  }
}

export default RefundService;
