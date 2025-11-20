import type { Request, Response } from "express";
import ProjectPaymentService from "../../services/projectPaymentService";
import CurrencyDetectionService from "../../services/currencyDetectionService";
import logger from "../../utils/loggerUtils";

interface AuthenticatedRequest extends Request {
  userFromToken?: {
    uid: string;
    role: string;
    isVerified: boolean;
  };
}

interface CreateProjectCheckoutRequest {
  projectId: string;
  successUrl: string;
  cancelUrl: string;
  currency?: string;
  depositPercentage?: number; // Optional: percentage of total (e.g., 25 for 25%)
  customAmount?: number; // Optional: custom amount in dollars
}

export class ProjectPaymentController {
  /**
   * Create a checkout session for a project payment
   * POST /api/v1/payments/project/create-checkout-session
   */
  static async createProjectCheckoutSession(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const {
        projectId,
        successUrl,
        cancelUrl,
        currency,
        depositPercentage,
        customAmount,
      } = req.body as CreateProjectCheckoutRequest;
      const userId = req.userFromToken?.uid;

      if (!projectId) {
        res.status(400).json({
          success: false,
          message: "Project ID is required",
        });
        return;
      }

      if (!successUrl || !cancelUrl) {
        res.status(400).json({
          success: false,
          message: "Success URL and Cancel URL are required",
        });
        return;
      }

      // Verify that the project belongs to the authenticated user
      const { db } = await import("../../database/db");
      const project = await db.project.findUnique({
        where: { id: projectId },
        select: {
          clientId: true,
          paymentStatus: true,
          preferredCurrency: true,
        },
      });

      if (!project) {
        res.status(404).json({
          success: false,
          message: "Project not found",
        });
        return;
      }

      if (project.clientId !== userId) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to access this project",
        });
        return;
      }

      // Note: We allow multiple payments (installments) even if paymentStatus is SUCCEEDED
      // SUCCEEDED now means "at least 25% paid", not "fully paid"
      // Clients can make additional payments to reach 100% or beyond

      // Determine best currency option
      let clientCurrency =
        CurrencyDetectionService.normalizeCurrency(currency)?.toLowerCase() ??
        CurrencyDetectionService.normalizeCurrency(
          project.preferredCurrency,
        )?.toLowerCase() ??
        undefined;

      if (!clientCurrency) {
        const headerCountry =
          (req.headers["cf-ipcountry"] as string) ||
          (req.headers["x-country-code"] as string) ||
          (req.headers["cloudfront-viewer-country"] as string);
        if (headerCountry) {
          clientCurrency =
            CurrencyDetectionService.getCurrencyForCountry(headerCountry);
        }
      }

      if (!clientCurrency) {
        clientCurrency = await CurrencyDetectionService.getCurrencyFromIP(
          req.ip || req.socket.remoteAddress,
        );
      }

      clientCurrency =
        CurrencyDetectionService.normalizeCurrency(clientCurrency) || "usd";

      if (
        project.preferredCurrency?.toLowerCase() !==
        clientCurrency.toLowerCase()
      ) {
        await db.project.update({
          where: { id: projectId },
          data: { preferredCurrency: clientCurrency.toLowerCase() },
        });
      }

      // Create checkout session
      const checkoutSession =
        await ProjectPaymentService.createProjectCheckoutSession({
          projectId,
          successUrl,
          cancelUrl,
          currency: clientCurrency,
          depositPercentage,
          customAmount,
        });

      logger.info(`Checkout session created for project: ${projectId}`, {
        projectId,
        userId,
        sessionId: checkoutSession.sessionId,
      });

      res.status(201).json({
        success: true,
        message: "Checkout session created successfully",
        data: {
          sessionId: checkoutSession.sessionId,
          checkoutUrl: checkoutSession.checkoutUrl,
          paymentId: checkoutSession.paymentId,
        },
      });
    } catch (error) {
      logger.error("Error creating project checkout session:", error);

      // TEMPORARY DEBUG: Return full error details
      const errorDetails =
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : { error: String(error) };

      res.status(500).json({
        success: false,
        message: "Failed to create checkout session",
        error: error instanceof Error ? error.message : "Unknown error",
        debug: errorDetails, // Remove this in production after debugging
      });
    }
  }

  /**
   * Get project payment status
   * GET /api/v1/payments/project/:projectId/status
   */
  static async getProjectPaymentStatus(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { projectId } = req.params;
      const userId = req.userFromToken?.uid;

      if (!projectId) {
        res.status(400).json({
          success: false,
          message: "Project ID is required",
        });
        return;
      }

      // Verify that the project belongs to the authenticated user
      const { db } = await import("../../database/db");
      const project = await db.project.findUnique({
        where: { id: projectId },
        select: { clientId: true },
      });

      if (!project) {
        res.status(404).json({
          success: false,
          message: "Project not found",
        });
        return;
      }

      if (project.clientId !== userId) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to access this project",
        });
        return;
      }

      // Get payment status
      const paymentStatus =
        await ProjectPaymentService.getProjectPaymentStatus(projectId);

      res.status(200).json({
        success: true,
        message: "Payment status retrieved successfully",
        data: paymentStatus,
      });
    } catch (error) {
      logger.error("Error getting project payment status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get payment status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default ProjectPaymentController;
