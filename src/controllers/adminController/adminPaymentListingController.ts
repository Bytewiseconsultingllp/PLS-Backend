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

export class AdminPaymentListingController {
  /**
   * Get all payments with filters
   * GET /api/v1/admin/payments
   */
  static async getAllPayments(
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

      const {
        page = 1,
        limit = 50,
        status,
        searchQuery,
        startDate,
        endDate,
        projectId,
        clientId,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (searchQuery) {
        where.OR = [
          {
            clientEmail: {
              contains: searchQuery as string,
              mode: "insensitive",
            },
          },
          {
            clientName: {
              contains: searchQuery as string,
              mode: "insensitive",
            },
          },
          { id: { contains: searchQuery as string, mode: "insensitive" } },
        ];
      }

      if (startDate) {
        where.createdAt = {
          ...where.createdAt,
          gte: new Date(startDate as string),
        };
      }

      if (endDate) {
        where.createdAt = {
          ...where.createdAt,
          lte: new Date(endDate as string),
        };
      }

      if (projectId) {
        where.projectId = projectId as string;
      }

      if (clientId) {
        // Filter by client - need to get payments where the client user has this ID
        // Note: Payments don't have clientId, they have clientEmail
        // We need to find the user first to get their email
        const clientUser = await prisma.user.findUnique({
          where: { uid: clientId as string },
          select: { email: true },
        });
        if (clientUser) {
          where.clientEmail = clientUser.email;
        }
      }

      // Build order by
      const orderBy: any = {};
      orderBy[sortBy as string] = sortOrder;

      // Get total count
      const total = await prisma.payment.count({ where });

      // Get payments
      const payments = await prisma.payment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          paymentMethod: true,
          stripeSessionId: true,
          stripePaymentIntentId: true,
          clientEmail: true,
          clientName: true,
          projectId: true,
          depositPercentage: true,
          fullProjectAmount: true,
          totalRefundedAmount: true,
          lastRefundedAt: true,
          createdAt: true,
          paidAt: true,
          lastCheckedAt: true,
          project: {
            select: {
              id: true,
              details: true,
              paymentStatus: true,
              totalAmountPaid: true,
              totalRefunded: true,
            },
          },
        },
      });

      const totalPages = Math.ceil(total / limitNum);

      logger.info(`Admin ${adminId} retrieved ${payments.length} payments`);

      res.status(200).json({
        success: true,
        message: "Payments retrieved successfully",
        data: {
          payments,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages,
            hasNextPage: pageNum < totalPages,
            hasPreviousPage: pageNum > 1,
          },
        },
      });
    } catch (error) {
      logger.error("Error retrieving payments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve payments",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get payment details by ID
   * GET /api/v1/admin/payments/:paymentId
   */
  static async getPaymentById(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const adminId = req.userFromToken?.uid;
      const { paymentId } = req.params;

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

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          project: {
            select: {
              id: true,
              details: true,
              paymentStatus: true,
              totalAmountPaid: true,
              totalRefunded: true,
              paymentCompletionPercentage: true,
            },
          },
          refunds: {
            select: {
              id: true,
              amount: true,
              status: true,
              reason: true,
              notes: true,
              createdAt: true,
              processedAt: true,
              refundedBy: true,
              stripeRefundId: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          verificationLogs: {
            select: {
              id: true,
              verifiedBy: true,
              stripeStatus: true,
              ourStatus: true,
              matched: true,
              eventId: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 10,
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

      logger.info(`Admin ${adminId} retrieved payment ${paymentId}`);

      res.status(200).json({
        success: true,
        message: "Payment details retrieved successfully",
        data: payment,
      });
    } catch (error) {
      logger.error("Error retrieving payment details:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve payment details",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get all payments for a project
   * GET /api/v1/admin/projects/:projectId/payments
   */
  static async getProjectPayments(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const adminId = req.userFromToken?.uid;
      const { projectId } = req.params;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      if (!projectId) {
        res.status(400).json({
          success: false,
          message: "Project ID is required",
        });
        return;
      }

      // Get project with payments
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          details: true,
          paymentStatus: true,
          totalAmountPaid: true,
          totalRefunded: true,
          paymentCompletionPercentage: true,
        },
      });

      if (!project) {
        res.status(404).json({
          success: false,
          message: "Project not found",
        });
        return;
      }

      const payments = await prisma.payment.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
        include: {
          refunds: {
            select: {
              id: true,
              amount: true,
              status: true,
              reason: true,
              createdAt: true,
            },
          },
        },
      });

      // Calculate net amount
      const totalPaid = Number(project.totalAmountPaid || 0);
      const totalRefunded = Number(project.totalRefunded || 0);
      const netAmount = totalPaid - totalRefunded;

      const summary = {
        totalPayments: payments.length,
        totalAmountPaid: totalPaid.toFixed(2),
        totalRefunded: totalRefunded.toFixed(2),
        netAmountReceived: netAmount.toFixed(2),
        paymentStatus: project.paymentStatus,
        paymentCompletionPercentage: Number(
          project.paymentCompletionPercentage || 0,
        ),
      };

      logger.info(
        `Admin ${adminId} retrieved ${payments.length} payments for project ${projectId}`,
      );

      res.status(200).json({
        success: true,
        message: "Project payments retrieved successfully",
        data: {
          projectId: project.id,
          companyName: (project.details as any)?.companyName || "N/A",
          summary,
          payments,
        },
      });
    } catch (error) {
      logger.error("Error retrieving project payments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve project payments",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get all payments for a client
   * GET /api/v1/admin/clients/:clientId/payments
   */
  static async getClientPayments(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const adminId = req.userFromToken?.uid;
      const { clientId } = req.params;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      if (!clientId) {
        res.status(400).json({
          success: false,
          message: "Client ID is required",
        });
        return;
      }

      // Get client
      const client = await prisma.user.findUnique({
        where: { uid: clientId },
        select: {
          uid: true,
          fullName: true,
          email: true,
          role: true,
        },
      });

      if (!client) {
        res.status(404).json({
          success: false,
          message: "Client not found",
        });
        return;
      }

      // Get all payments for this client
      const payments = await prisma.payment.findMany({
        where: {
          clientEmail: client.email,
        },
        orderBy: { createdAt: "desc" },
        include: {
          project: {
            select: {
              id: true,
              details: true,
              paymentStatus: true,
            },
          },
        },
      });

      // Calculate summary
      const totalAmount = payments.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0,
      );
      const totalRefunded = payments.reduce(
        (sum, p) => sum + Number(p.totalRefundedAmount || 0),
        0,
      );
      const succeededPayments = payments.filter(
        (p) => p.status === "SUCCEEDED",
      ).length;
      const pendingPayments = payments.filter(
        (p) => p.status === "PENDING",
      ).length;

      const summary = {
        totalPayments: payments.length,
        totalAmount: (totalAmount / 100).toFixed(2),
        totalRefunded: (totalRefunded / 100).toFixed(2),
        succeededPayments,
        pendingPayments,
      };

      logger.info(
        `Admin ${adminId} retrieved ${payments.length} payments for client ${clientId}`,
      );

      res.status(200).json({
        success: true,
        message: "Client payments retrieved successfully",
        data: {
          clientId: client.uid,
          clientName: client.fullName,
          clientEmail: client.email,
          summary,
          payments,
        },
      });
    } catch (error) {
      logger.error("Error retrieving client payments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve client payments",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default AdminPaymentListingController;
