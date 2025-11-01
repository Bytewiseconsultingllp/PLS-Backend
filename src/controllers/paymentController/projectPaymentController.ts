import type { Request, Response } from "express";
import ProjectPaymentService from "../../services/projectPaymentService";
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
      const { projectId, successUrl, cancelUrl, currency } =
        req.body as CreateProjectCheckoutRequest;
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
        select: { clientId: true, paymentStatus: true },
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

      // Check if project is already paid
      if (project.paymentStatus === "SUCCEEDED") {
        res.status(400).json({
          success: false,
          message: "Project payment is already completed",
        });
        return;
      }

      // Create checkout session
      const checkoutSession =
        await ProjectPaymentService.createProjectCheckoutSession({
          projectId,
          successUrl,
          cancelUrl,
          currency: currency || "usd",
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
      res.status(500).json({
        success: false,
        message: "Failed to create checkout session",
        error: error instanceof Error ? error.message : "Unknown error",
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
