import { db } from "../database/db";
import { Decimal } from "@prisma/client/runtime/library";
import StripeService from "./stripeService";
import logger from "../utils/loggerUtils";

interface CreateProjectCheckoutSessionData {
  projectId: string;
  successUrl: string;
  cancelUrl: string;
  currency?: string;
}

interface ProjectCheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  paymentId: string;
}

export class ProjectPaymentService {
  /**
   * Create a checkout session for a project payment
   * Gets the amount from ProjectEstimate.calculatedTotal
   */
  static async createProjectCheckoutSession(
    data: CreateProjectCheckoutSessionData,
  ): Promise<ProjectCheckoutSessionResponse> {
    const { projectId, successUrl, cancelUrl, currency = "usd" } = data;

    try {
      // Fetch project with estimate and details
      const project = await db.project.findUnique({
        where: { id: projectId },
        include: {
          estimate: true,
          details: true,
          client: true,
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      if (!project.estimate) {
        throw new Error("Project estimate not found");
      }

      // Calculate total if it's missing or zero
      let calculatedTotal = project.estimate.calculatedTotal;

      if (!calculatedTotal || Number(calculatedTotal) <= 0) {
        // Calculate from components: baseCost - discountAmount + rushFeeAmount
        const baseCost = Number(project.estimate.baseCost || 0);
        const discountAmount = Number(project.estimate.discountAmount || 0);
        const rushFeeAmount = Number(project.estimate.rushFeeAmount || 0);

        const recalculatedAmount = baseCost - discountAmount + rushFeeAmount;

        logger.warn(
          `Project ${projectId} had calculatedTotal of ${project.estimate.calculatedTotal?.toString() || 0}, recalculated to ${recalculatedAmount}`,
        );

        // Update the estimate with the calculated total
        await db.projectEstimate.update({
          where: { projectId },
          data: { calculatedTotal: new Decimal(recalculatedAmount) },
        });

        calculatedTotal = new Decimal(recalculatedAmount);
      }

      // Get amount in dollars and convert to cents for Stripe
      const amountInDollars = Number(calculatedTotal);
      const amountInCents = Math.round(amountInDollars * 100);

      if (amountInCents <= 0) {
        throw new Error(
          `Invalid payment amount: ${amountInDollars} dollars (${amountInCents} cents)`,
        );
      }

      // Get customer details
      const customerEmail =
        project.details?.businessEmail || project.client.email;
      const customerName = project.details?.fullName || project.client.fullName;
      const companyName = project.details?.companyName || "";

      // Create checkout session in Stripe
      const session = await StripeService.createCheckoutSession({
        amount: amountInCents,
        currency,
        customerEmail,
        customerName,
        successUrl,
        cancelUrl,
        description: `Project Payment - ${companyName}`,
        metadata: {
          projectId: project.id,
          clientId: project.clientId,
          visitorId: project.visitorId || "",
          type: "project_payment",
        },
      });

      // Save payment record to database
      const payment = await db.payment.create({
        data: {
          stripeSessionId: session.id,
          amount: amountInCents,
          currency,
          clientEmail: customerEmail,
          clientName: customerName,
          status: "PENDING",
          description: `Project Payment - ${companyName}`,
          metadata: {
            projectId: project.id,
            clientId: project.clientId,
            visitorId: project.visitorId || "",
            type: "project_payment",
          },
          userId: project.clientId,
          projectId: project.id,
          visitorId: project.visitorId,
        },
      });

      logger.info(`Checkout session created for project: ${projectId}`, {
        sessionId: session.id,
        paymentId: payment.id,
        amount: amountInCents,
        projectId,
      });

      return {
        sessionId: session.id,
        checkoutUrl: session.url || "",
        paymentId: payment.id,
      };
    } catch (error) {
      logger.error("Error creating project checkout session:", error);
      throw error;
    }
  }

  /**
   * Update project payment status
   */
  static async updateProjectPaymentStatus(
    projectId: string,
    status: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED",
  ): Promise<void> {
    try {
      await db.project.update({
        where: { id: projectId },
        data: {
          paymentStatus: status,
        },
      });

      logger.info(`Updated project payment status: ${projectId}`, {
        projectId,
        status,
      });
    } catch (error) {
      logger.error("Error updating project payment status:", error);
      throw error;
    }
  }

  /**
   * Get project payment status
   */
  static async getProjectPaymentStatus(projectId: string): Promise<{
    paymentStatus: string;
    payments: any[];
  }> {
    try {
      const project = await db.project.findUnique({
        where: { id: projectId },
        include: {
          payments: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      return {
        paymentStatus: project.paymentStatus,
        payments: project.payments,
      };
    } catch (error) {
      logger.error("Error getting project payment status:", error);
      throw error;
    }
  }

  /**
   * Check if project payment is completed
   */
  static async isProjectPaid(projectId: string): Promise<boolean> {
    try {
      const project = await db.project.findUnique({
        where: { id: projectId },
        select: {
          paymentStatus: true,
        },
      });

      return project?.paymentStatus === "SUCCEEDED";
    } catch (error) {
      logger.error("Error checking if project is paid:", error);
      return false;
    }
  }
}

export default ProjectPaymentService;
