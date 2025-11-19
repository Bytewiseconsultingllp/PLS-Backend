import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import StripeService from "../../services/stripeService";
import { STRIPE_WEBHOOK_SECRET } from "../../config/config";
import logger from "../../utils/loggerUtils";

const prisma = new PrismaClient();

interface PaymentRequestBody {
  amount: number;
  currency?: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  description?: string;
  metadata?: Record<string, string>;
}

interface CheckoutRequestBody extends PaymentRequestBody {
  successUrl: string;
  cancelUrl: string;
}

interface RefundRequestBody {
  paymentIntentId: string;
  amount?: number;
}

interface AuthenticatedRequest extends Request {
  userFromToken?: {
    uid: string;
    role: string;
    isVerified: boolean;
  };
}

export class PaymentController {
  /**
   * Create a payment intent for server-side payment processing
   */
  static async createPaymentIntent(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const body = req.body as PaymentRequestBody;
      const {
        amount,
        currency,
        customerEmail,
        customerName,
        customerPhone,
        description,
        metadata,
      } = body;
      const userId = req.userFromToken?.uid;

      // Create payment intent in Stripe
      const paymentIntent = await StripeService.createPaymentIntent({
        amount,
        currency: currency || "usd",
        customerEmail,
        customerName,
        customerPhone,
        description,
        metadata,
      });

      // Save payment record to database
      const paymentData: {
        stripePaymentIntentId: string;
        amount: number;
        currency: string;
        clientEmail: string;
        status: "PENDING";
        metadata: Record<string, string>;
        userId?: string;
        clientName?: string;
        clientPhone?: string;
        description?: string;
      } = {
        stripePaymentIntentId: paymentIntent.id,
        amount,
        currency: currency || "usd",
        clientEmail: customerEmail,
        status: "PENDING",
        metadata: metadata || {},
      };

      if (userId) paymentData.userId = userId;
      if (customerName) paymentData.clientName = customerName;
      if (customerPhone) paymentData.clientPhone = customerPhone;
      if (description) paymentData.description = description;

      const payment = await prisma.payment.create({
        data: paymentData,
      });

      logger.info(`Payment intent created: ${paymentIntent.id}`, {
        paymentId: payment.id,
        userId,
        amount,
        customerEmail,
      });

      res.status(201).json({
        success: true,
        message: "Payment intent created successfully",
        data: {
          paymentId: payment.id,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
      });
    } catch (error) {
      logger.error("Error creating payment intent:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create payment intent",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Create a checkout session for client-side payment processing
   */
  static async createCheckoutSession(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const body = req.body as CheckoutRequestBody;
      const {
        amount,
        currency,
        customerEmail,
        customerName,
        successUrl,
        cancelUrl,
        description,
        metadata,
      } = body;
      const userId = req.userFromToken?.uid;

      // Create checkout session in Stripe
      const session = await StripeService.createCheckoutSession({
        amount,
        currency: currency || "usd",
        customerEmail,
        customerName,
        successUrl,
        cancelUrl,
        description,
        metadata,
      });

      // Save payment record to database
      const paymentData: {
        stripeSessionId: string;
        amount: number;
        currency: string;
        clientEmail: string;
        status: "PENDING";
        metadata: Record<string, string>;
        userId?: string;
        clientName?: string;
        description?: string;
      } = {
        stripeSessionId: session.id,
        amount,
        currency: currency || "usd",
        clientEmail: customerEmail,
        status: "PENDING",
        metadata: metadata || {},
      };

      if (userId) paymentData.userId = userId;
      if (customerName) paymentData.clientName = customerName;
      if (description) paymentData.description = description;

      const payment = await prisma.payment.create({
        data: paymentData,
      });

      logger.info(`Checkout session created: ${session.id}`, {
        paymentId: payment.id,
        userId,
        amount,
        customerEmail,
      });

      res.status(201).json({
        success: true,
        message: "Checkout session created successfully",
        data: {
          paymentId: payment.id,
          sessionId: session.id,
          url: session.url,
        },
      });
    } catch (error) {
      const errorDetails =
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : { error: String(error) };
      logger.error("Error creating checkout session:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create checkout session",
        error: error instanceof Error ? error.message : "Unknown error",
        debug: errorDetails, // Remove this in production after debugging
      });
    }
  }

  /**
   * Get payment intent status
   */
  static async getPaymentIntentStatus(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { paymentIntentId } = req.params as { paymentIntentId: string };

      // Get payment intent from Stripe
      const paymentIntent =
        await StripeService.getPaymentIntent(paymentIntentId);

      // Get payment record from database
      const payment = await prisma.payment.findFirst({
        where: {
          stripePaymentIntentId: paymentIntentId,
        },
      });

      if (!payment) {
        res.status(404).json({
          success: false,
          message: "Payment not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Payment intent status retrieved successfully",
        data: {
          paymentId: payment.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          clientSecret: paymentIntent.client_secret,
        },
      });
    } catch (error) {
      logger.error("Error getting payment intent status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get payment intent status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get checkout session status
   */
  static async getCheckoutSessionStatus(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { sessionId } = req.params as { sessionId: string };

      // Get checkout session from Stripe
      const session = await StripeService.getCheckoutSession(sessionId);

      // Get payment record from database
      const payment = await prisma.payment.findFirst({
        where: {
          stripeSessionId: sessionId,
        },
      });

      if (!payment) {
        res.status(404).json({
          success: false,
          message: "Payment not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Checkout session status retrieved successfully",
        data: {
          paymentId: payment.id,
          status: session.payment_status,
          amount: session.amount_total,
          currency: session.currency,
          url: session.url,
        },
      });
    } catch (error) {
      logger.error("Error getting checkout session status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get checkout session status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Verify checkout session (Client-side fallback for missed webhooks)
   * POST /api/v1/payments/verify-session
   */
  static async verifyCheckoutSession(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { sessionId } = req.body as { sessionId: string };
      const userId = req.userFromToken?.uid;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: "Session ID is required",
        });
        return;
      }

      // Get payment from DB
      const payment = await prisma.payment.findFirst({
        where: {
          stripeSessionId: sessionId,
          userId: userId, // Verify ownership
        },
        include: { project: true },
      });

      if (!payment) {
        res.status(404).json({
          success: false,
          message:
            "Payment not found or you don't have permission to access it",
        });
        return;
      }

      // If already succeeded, return immediately
      if (payment.status === "SUCCEEDED") {
        res.status(200).json({
          success: true,
          message: "Payment already verified",
          data: {
            status: "SUCCEEDED",
            projectId: payment.projectId,
            paidAt: payment.paidAt,
          },
        });
        return;
      }

      // ✅ FALLBACK: Check Stripe directly (in case webhook failed)
      const stripeSession = await StripeService.getCheckoutSession(sessionId);

      logger.info(`Verifying payment status from Stripe`, {
        sessionId,
        stripeStatus: stripeSession.payment_status,
        dbStatus: payment.status,
      });

      // Update DB if Stripe says paid but we show pending
      if (
        stripeSession.payment_status === "paid" &&
        payment.status === "PENDING"
      ) {
        logger.warn(
          `⚠️  Webhook missed! Updating payment ${payment.id} from API check`,
        );

        await prisma.$transaction(async (tx) => {
          // Update payment
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "SUCCEEDED",
              paidAt: new Date(),
              lastCheckedAt: new Date(),
              webhookRetryCount: payment.webhookRetryCount + 1,
            },
          });

          // Update project with cumulative tracking
          if (payment.projectId && payment.project) {
            // Get full project with estimate
            const fullProject = await tx.project.findUnique({
              where: { id: payment.projectId },
              include: { estimate: true },
            });

            if (fullProject && fullProject.estimate) {
              // Calculate payment amount in dollars
              const paymentAmountInDollars = payment.amount / 100;

              // Calculate new cumulative total
              const currentTotalPaid = Number(fullProject.totalAmountPaid || 0);
              const newTotalPaid = currentTotalPaid + paymentAmountInDollars;

              // Calculate completion percentage
              const fullProjectAmount = Number(
                fullProject.estimate.calculatedTotal || 0,
              );
              const completionPercentage =
                fullProjectAmount > 0
                  ? (newTotalPaid / fullProjectAmount) * 100
                  : 0;

              // Determine payment status
              // Set to SUCCEEDED on first payment if >= 25%, then keep it SUCCEEDED
              const isFirstPayment = currentTotalPaid === 0;
              let newPaymentStatus = fullProject.paymentStatus;

              if (isFirstPayment && completionPercentage >= 25) {
                newPaymentStatus = "SUCCEEDED";
              }

              await tx.project.update({
                where: { id: payment.projectId },
                data: {
                  totalAmountPaid: newTotalPaid,
                  paymentCompletionPercentage: completionPercentage,
                  paymentStatus: newPaymentStatus,
                },
              });

              logger.info(
                `Project payment updated via API check: ${payment.projectId}`,
                {
                  paymentAmount: paymentAmountInDollars,
                  totalPaid: newTotalPaid,
                  fullAmount: fullProjectAmount,
                  completionPercentage: completionPercentage.toFixed(2),
                  paymentStatus: newPaymentStatus,
                  isFirstPayment,
                },
              );
            }
          }

          // Log verification
          await tx.paymentVerificationLog.create({
            data: {
              paymentId: payment.id,
              verifiedBy: "api_check",
              stripeStatus: "paid",
              ourStatus: "SUCCEEDED",
              matched: false, // Was out of sync
            },
          });
        });

        res.status(200).json({
          success: true,
          message: "Payment verified and status updated (webhook was missed)",
          data: {
            status: "SUCCEEDED",
            projectId: payment.projectId,
            wasOutOfSync: true,
          },
        });
        return;
      }

      // Update lastCheckedAt even if status matches
      await prisma.payment.update({
        where: { id: payment.id },
        data: { lastCheckedAt: new Date() },
      });

      res.status(200).json({
        success: true,
        message: "Payment verified",
        data: {
          status:
            stripeSession.payment_status === "paid" ? "SUCCEEDED" : "PENDING",
          projectId: payment.projectId,
          wasOutOfSync: false,
        },
      });
    } catch (error) {
      logger.error("Error verifying checkout session:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify payment",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers["stripe-signature"] as string;
      const payload: string | Buffer = req.body as string | Buffer;

      // TEMPORARY DEBUG: Log signature details
      logger.info("DEBUG: Webhook signature details", {
        signature: signature,
        hasSignature: !!signature,
        payloadType: typeof payload,
        payloadLength: payload ? payload.length : 0,
        secretPrefix: STRIPE_WEBHOOK_SECRET
          ? STRIPE_WEBHOOK_SECRET.substring(0, 35) + "..."
          : "undefined",
      });

      if (!signature) {
        res.status(400).json({
          success: false,
          message: "Missing stripe-signature header",
          debug: {
            allHeaders: req.headers,
          },
        });
        return;
      }

      // Verify webhook signature
      const event = StripeService.verifyWebhookSignature(
        payload,
        signature,
        STRIPE_WEBHOOK_SECRET,
      );

      logger.info(`Received webhook event: ${event.type}`, {
        eventId: event.id,
        type: event.type,
      });

      // Handle different event types
      switch (event.type) {
        case "payment_intent.succeeded":
          await handlePaymentIntentSucceeded(event);
          break;
        case "payment_intent.payment_failed":
          await handlePaymentIntentFailed(event);
          break;
        case "checkout.session.completed":
          await handleCheckoutSessionCompleted(event);
          break;
        case "checkout.session.expired":
          await handleCheckoutSessionExpired(event);
          break;
        case "charge.updated":
        case "charge.succeeded":
        case "payment_intent.created":
          // These events are logged but don't require specific handling
          logger.info(`Received ${event.type} event - no action required`);
          break;
        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      logger.error("Error handling webhook:", error);
      // TEMPORARY DEBUG: Return signature details in error response
      const signature = req.headers["stripe-signature"] as string;
      res.status(400).json({
        success: false,
        message: "Webhook signature verification failed",
        error: error instanceof Error ? error.message : "Unknown error",
        debug: {
          signatureReceived: signature,
          secretPrefix: STRIPE_WEBHOOK_SECRET
            ? STRIPE_WEBHOOK_SECRET.substring(0, 15) + "..."
            : "undefined",
          payloadType: typeof req.body,
          headers: {
            "stripe-signature": req.headers["stripe-signature"],
            "content-type": req.headers["content-type"],
          },
        },
      });
    }
  }

  /**
   * Create a refund
   */
  static async createRefund(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as RefundRequestBody;
      const { paymentIntentId, amount } = body;

      // Create refund in Stripe
      const refund = await StripeService.createRefund(paymentIntentId, amount);

      // Update payment status in database
      await prisma.payment.updateMany({
        where: {
          stripePaymentIntentId: paymentIntentId,
        },
        data: {
          status: "REFUNDED",
          refundedAt: new Date(),
        },
      });

      logger.info(`Refund created: ${refund.id}`, {
        paymentIntentId,
        refundId: refund.id,
        amount: refund.amount,
      });

      res.status(201).json({
        success: true,
        message: "Refund created successfully",
        data: {
          refundId: refund.id,
          amount: refund.amount,
          status: refund.status,
        },
      });
    } catch (error) {
      logger.error("Error creating refund:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create refund",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get payment history
   */
  static async getPaymentHistory(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const {
        status,
        customerEmail,
        startDate,
        endDate,
        page = "1",
        limit = "10",
      } = req.query as {
        status?: string;
        customerEmail?: string;
        startDate?: string;
        endDate?: string;
        page?: string;
        limit?: string;
      };
      const userId = req.userFromToken?.uid;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: {
        userId?: string;
        status?: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED";
        clientEmail?: string;
        createdAt?: {
          gte?: Date;
          lte?: Date;
        };
      } = {};

      if (userId) {
        where.userId = userId;
      }

      if (status) {
        where.status = status as
          | "PENDING"
          | "SUCCEEDED"
          | "FAILED"
          | "CANCELED"
          | "REFUNDED";
      }

      if (customerEmail) {
        where.clientEmail = customerEmail;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      // Get payments with pagination
      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.payment.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        message: "Payment history retrieved successfully",
        data: {
          payments,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      logger.error("Error getting payment history:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get payment history",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

// Helper functions for webhook handling
async function handlePaymentIntentSucceeded(event: {
  id: string;
  data: { object: { id: string } };
}): Promise<void> {
  const paymentIntent = event.data.object;
  const eventId = event.id;

  // ✅ STEP 1: Check if we already processed this event (idempotency)
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripePaymentIntentId: paymentIntent.id,
      webhookEventsProcessed: {
        has: eventId, // Already processed this specific event
      },
    },
  });

  if (existingPayment) {
    logger.info(
      `Event ${eventId} already processed for payment intent ${paymentIntent.id}, skipping`,
    );
    return; // ✅ Idempotent - safe to receive multiple times
  }

  // ✅ STEP 2: Use transaction to prevent race conditions
  await prisma.$transaction(async (tx) => {
    // Update payment with idempotency tracking
    const payment = await tx.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
      select: {
        id: true,
        projectId: true,
        status: true,
        amount: true,
        depositPercentage: true,
        fullProjectAmount: true,
      },
    });

    if (!payment) {
      logger.warn(`Payment not found for payment intent ${paymentIntent.id}`);
      return;
    }

    // Only update if not already succeeded
    if (payment.status !== "SUCCEEDED") {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCEEDED",
          paidAt: new Date(),
          lastWebhookEventId: eventId,
          webhookEventsProcessed: {
            push: eventId, // Add to array
          },
          lastCheckedAt: new Date(),
        },
      });

      // Update project payment status and cumulative tracking if this is a project payment
      if (payment.projectId) {
        // Get current project state and estimate
        const project = await tx.project.findUnique({
          where: { id: payment.projectId },
          include: { estimate: true },
        });

        if (project && project.estimate) {
          // Calculate payment amount in dollars
          const paymentAmountInDollars = payment.amount / 100;

          // Calculate new cumulative total
          const currentTotalPaid = Number(project.totalAmountPaid || 0);
          const newTotalPaid = currentTotalPaid + paymentAmountInDollars;

          // Calculate completion percentage
          const fullProjectAmount = Number(
            project.estimate.calculatedTotal || 0,
          );
          const completionPercentage =
            fullProjectAmount > 0
              ? (newTotalPaid / fullProjectAmount) * 100
              : 0;

          // Determine payment status
          // Set to SUCCEEDED on first payment if >= 25%, then keep it SUCCEEDED
          const isFirstPayment = currentTotalPaid === 0;
          let newPaymentStatus = project.paymentStatus;

          if (isFirstPayment && completionPercentage >= 25) {
            newPaymentStatus = "SUCCEEDED";
          }

          await tx.project.update({
            where: { id: payment.projectId },
            data: {
              totalAmountPaid: newTotalPaid,
              paymentCompletionPercentage: completionPercentage,
              paymentStatus: newPaymentStatus,
            },
          });

          logger.info(`Project payment updated: ${payment.projectId}`, {
            paymentAmount: paymentAmountInDollars,
            totalPaid: newTotalPaid,
            fullAmount: fullProjectAmount,
            completionPercentage: completionPercentage.toFixed(2),
            paymentStatus: newPaymentStatus,
            isFirstPayment,
          });
        }
      }

      // ✅ Log verification
      await tx.paymentVerificationLog.create({
        data: {
          paymentId: payment.id,
          verifiedBy: "webhook",
          stripeStatus: "succeeded",
          ourStatus: "SUCCEEDED",
          matched: true,
          eventId: eventId,
        },
      });

      logger.info(
        `Payment succeeded: ${paymentIntent.id} via webhook event ${eventId}`,
      );
    } else {
      // Already succeeded, just log the duplicate event
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          webhookEventsProcessed: {
            push: eventId,
          },
        },
      });
      logger.info(
        `Payment already succeeded: ${paymentIntent.id}, logged duplicate event ${eventId}`,
      );
    }
  });
}

async function handlePaymentIntentFailed(event: {
  data: { object: { id: string } };
}): Promise<void> {
  const paymentIntent = event.data.object;

  // Update payment record
  const payments = await prisma.payment.updateMany({
    where: {
      stripePaymentIntentId: paymentIntent.id,
    },
    data: {
      status: "FAILED",
    },
  });

  // Update project payment status if this is a project payment
  if (payments.count > 0) {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
      select: { projectId: true },
    });

    if (payment?.projectId) {
      await prisma.project.update({
        where: { id: payment.projectId },
        data: { paymentStatus: "FAILED" },
      });
      logger.info(
        `Project payment status updated to FAILED: ${payment.projectId}`,
      );
    }
  }

  logger.info(`Payment failed: ${paymentIntent.id}`);
}

async function handleCheckoutSessionCompleted(event: {
  id: string;
  data: { object: { id: string; payment_intent?: string | object | null } };
}): Promise<void> {
  const session = event.data.object;
  const eventId = event.id;

  // ✅ STEP 1: Check if we already processed this event (idempotency)
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeSessionId: session.id,
      webhookEventsProcessed: {
        has: eventId, // Already processed this specific event
      },
    },
  });

  if (existingPayment) {
    logger.info(
      `Event ${eventId} already processed for session ${session.id}, skipping`,
    );
    return; // ✅ Idempotent - safe to receive multiple times
  }

  // ✅ STEP 2: Use transaction to prevent race conditions
  await prisma.$transaction(async (tx) => {
    // Update payment with idempotency tracking
    const payment = await tx.payment.findFirst({
      where: { stripeSessionId: session.id },
      select: {
        id: true,
        projectId: true,
        status: true,
        amount: true,
        depositPercentage: true,
        fullProjectAmount: true,
      },
    });

    if (!payment) {
      logger.warn(`Payment not found for session ${session.id}`);
      return;
    }

    // Only update if not already succeeded
    if (payment.status !== "SUCCEEDED") {
      // ✅ CRITICAL FIX: Extract payment intent ID from session
      let paymentIntentId: string | null = null;
      if (session.payment_intent) {
        if (typeof session.payment_intent === "string") {
          paymentIntentId = session.payment_intent;
        } else if (
          typeof session.payment_intent === "object" &&
          "id" in session.payment_intent
        ) {
          paymentIntentId = (session.payment_intent as { id: string }).id;
        }
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCEEDED",
          paidAt: new Date(),
          lastWebhookEventId: eventId,
          webhookEventsProcessed: {
            push: eventId, // Add to array
          },
          lastCheckedAt: new Date(),
          ...(paymentIntentId && {
            stripePaymentIntentId: paymentIntentId,
          }),
        },
      });

      // Update project payment status and cumulative tracking if this is a project payment
      if (payment.projectId) {
        // Get current project state and estimate
        const project = await tx.project.findUnique({
          where: { id: payment.projectId },
          include: { estimate: true },
        });

        if (project && project.estimate) {
          // Calculate payment amount in dollars
          const paymentAmountInDollars = payment.amount / 100;

          // Calculate new cumulative total
          const currentTotalPaid = Number(project.totalAmountPaid || 0);
          const newTotalPaid = currentTotalPaid + paymentAmountInDollars;

          // Calculate completion percentage
          const fullProjectAmount = Number(
            project.estimate.calculatedTotal || 0,
          );
          const completionPercentage =
            fullProjectAmount > 0
              ? (newTotalPaid / fullProjectAmount) * 100
              : 0;

          // Determine payment status
          // Set to SUCCEEDED on first payment if >= 25%, then keep it SUCCEEDED
          const isFirstPayment = currentTotalPaid === 0;
          let newPaymentStatus = project.paymentStatus;

          if (isFirstPayment && completionPercentage >= 25) {
            newPaymentStatus = "SUCCEEDED";
          }

          await tx.project.update({
            where: { id: payment.projectId },
            data: {
              totalAmountPaid: newTotalPaid,
              paymentCompletionPercentage: completionPercentage,
              paymentStatus: newPaymentStatus,
            },
          });

          logger.info(`Project payment updated: ${payment.projectId}`, {
            paymentAmount: paymentAmountInDollars,
            totalPaid: newTotalPaid,
            fullAmount: fullProjectAmount,
            completionPercentage: completionPercentage.toFixed(2),
            paymentStatus: newPaymentStatus,
            isFirstPayment,
          });
        }
      }

      // ✅ Log verification
      await tx.paymentVerificationLog.create({
        data: {
          paymentId: payment.id,
          verifiedBy: "webhook",
          stripeStatus: "paid",
          ourStatus: "SUCCEEDED",
          matched: true,
          eventId: eventId,
        },
      });

      logger.info(
        `Checkout session completed: ${session.id} via webhook event ${eventId}`,
      );
    } else {
      // Already succeeded, just log the duplicate event
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          webhookEventsProcessed: {
            push: eventId,
          },
        },
      });
      logger.info(
        `Checkout session already completed: ${session.id}, logged duplicate event ${eventId}`,
      );
    }
  });
}

async function handleCheckoutSessionExpired(event: {
  data: { object: { id: string } };
}): Promise<void> {
  const session = event.data.object;

  // Update payment record
  const payments = await prisma.payment.updateMany({
    where: {
      stripeSessionId: session.id,
    },
    data: {
      status: "CANCELED",
    },
  });

  // Update project payment status if this is a project payment
  if (payments.count > 0) {
    const payment = await prisma.payment.findFirst({
      where: { stripeSessionId: session.id },
      select: { projectId: true },
    });

    if (payment?.projectId) {
      await prisma.project.update({
        where: { id: payment.projectId },
        data: { paymentStatus: "CANCELED" },
      });
      logger.info(
        `Project payment status updated to CANCELED: ${payment.projectId}`,
      );
    }
  }

  logger.info(`Checkout session expired: ${session.id}`);
}
