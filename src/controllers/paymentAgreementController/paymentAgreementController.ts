/**
 * Payment Agreement Controller
 *
 * Handles API logic for milestone payment agreements.
 * Only accessible by Admin and Moderators (for their assigned projects).
 */

import type { Response } from "express";
import type { _Request } from "../../middlewares/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandlerUtils";
import { httpResponse } from "../../utils/apiResponseUtils";
import paymentAgreementService from "../../services/paymentAgreementService";
import { SUCCESSCODE, NOTFOUNDCODE, UNAUTHORIZEDCODE } from "../../constants";
import { db } from "../../database/db";

// ============================================
// CREATE PAYMENT AGREEMENT
// ============================================

/**
 * Create a new payment agreement for a milestone
 * POST /api/v1/admin/projects/:projectId/milestones/:milestoneId/payment-agreement
 */
export const createPaymentAgreement = asyncHandler(
  async (req: _Request, res: Response) => {
    const { projectId, milestoneId } = req.params;
    const userId = req.userFromToken?.uid || "";
    const userRole = req.userFromToken?.role;

    if (!userId || !userRole) {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "User not authenticated",
      };
    }

    // Check if project exists
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw {
        status: NOTFOUNDCODE,
        message: "Project not found",
      };
    }

    // Authorization: Admin or assigned Moderator
    const isAuthorized =
      userRole === "ADMIN" ||
      (userRole === "MODERATOR" && project.assignedModeratorId === userId);

    if (!isAuthorized) {
      throw {
        status: UNAUTHORIZEDCODE,
        message:
          "You don't have permission to create payment agreements for this project",
      };
    }

    // Create the payment agreement
    const agreement = await paymentAgreementService.createPaymentAgreement(
      milestoneId!,
      projectId!,
      req.body,
      userId,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Payment agreement created successfully",
      agreement,
    );
  },
);

// ============================================
// GET PAYMENT AGREEMENT BY MILESTONE
// ============================================

/**
 * Get payment agreement for a specific milestone
 * GET /api/v1/admin/projects/:projectId/milestones/:milestoneId/payment-agreement
 */
export const getPaymentAgreementByMilestone = asyncHandler(
  async (req: _Request, res: Response) => {
    const { projectId, milestoneId } = req.params;
    const userId = req.userFromToken?.uid || "";
    const userRole = req.userFromToken?.role;

    if (!userId || !userRole) {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "User not authenticated",
      };
    }

    // Check if project exists
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw {
        status: NOTFOUNDCODE,
        message: "Project not found",
      };
    }

    // Authorization: Admin or assigned Moderator
    const isAuthorized =
      userRole === "ADMIN" ||
      (userRole === "MODERATOR" && project.assignedModeratorId === userId);

    if (!isAuthorized) {
      throw {
        status: UNAUTHORIZEDCODE,
        message:
          "You don't have permission to view payment agreements for this project",
      };
    }

    // Get the payment agreement
    const agreement =
      await paymentAgreementService.getPaymentAgreementByMilestone(
        milestoneId!,
      );

    if (!agreement) {
      throw {
        status: NOTFOUNDCODE,
        message: "Payment agreement not found for this milestone",
      };
    }

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Payment agreement retrieved successfully",
      agreement,
    );
  },
);

// ============================================
// GET ALL PAYMENT AGREEMENTS FOR PROJECT
// ============================================

/**
 * Get all payment agreements for a project
 * GET /api/v1/admin/projects/:projectId/payment-agreements
 */
export const getPaymentAgreementsByProject = asyncHandler(
  async (req: _Request, res: Response) => {
    const { projectId } = req.params;
    const userId = req.userFromToken?.uid || "";
    const userRole = req.userFromToken?.role;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId || !userRole) {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "User not authenticated",
      };
    }

    // Check if project exists
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw {
        status: NOTFOUNDCODE,
        message: "Project not found",
      };
    }

    // Authorization: Admin or assigned Moderator
    const isAuthorized =
      userRole === "ADMIN" ||
      (userRole === "MODERATOR" && project.assignedModeratorId === userId);

    if (!isAuthorized) {
      throw {
        status: UNAUTHORIZEDCODE,
        message:
          "You don't have permission to view payment agreements for this project",
      };
    }

    // Get all payment agreements
    const result = await paymentAgreementService.getPaymentAgreementsByProject(
      projectId!,
      page,
      limit,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Payment agreements retrieved successfully",
      result,
    );
  },
);

// ============================================
// UPDATE PAYMENT AGREEMENT
// ============================================

/**
 * Update an existing payment agreement
 * PATCH /api/v1/admin/projects/:projectId/milestones/:milestoneId/payment-agreement
 */
export const updatePaymentAgreement = asyncHandler(
  async (req: _Request, res: Response) => {
    const { projectId, milestoneId } = req.params;
    const userId = req.userFromToken?.uid || "";
    const userRole = req.userFromToken?.role;

    if (!userId || !userRole) {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "User not authenticated",
      };
    }

    // Check if project exists
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw {
        status: NOTFOUNDCODE,
        message: "Project not found",
      };
    }

    // Authorization: Admin or assigned Moderator
    const isAuthorized =
      userRole === "ADMIN" ||
      (userRole === "MODERATOR" && project.assignedModeratorId === userId);

    if (!isAuthorized) {
      throw {
        status: UNAUTHORIZEDCODE,
        message:
          "You don't have permission to update payment agreements for this project",
      };
    }

    // Update the payment agreement
    const agreement = await paymentAgreementService.updatePaymentAgreement(
      milestoneId!,
      req.body,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Payment agreement updated successfully",
      agreement,
    );
  },
);

// ============================================
// DELETE PAYMENT AGREEMENT
// ============================================

/**
 * Delete a payment agreement (soft delete)
 * DELETE /api/v1/admin/projects/:projectId/milestones/:milestoneId/payment-agreement
 */
export const deletePaymentAgreement = asyncHandler(
  async (req: _Request, res: Response) => {
    const { projectId, milestoneId } = req.params;
    const userId = req.userFromToken?.uid || "";
    const userRole = req.userFromToken?.role;

    if (!userId || !userRole) {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "User not authenticated",
      };
    }

    // Check if project exists
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw {
        status: NOTFOUNDCODE,
        message: "Project not found",
      };
    }

    // Authorization: Only Admin (not Moderators - important decision)
    if (userRole !== "ADMIN") {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "Only admins can delete payment agreements",
      };
    }

    // Delete the payment agreement
    await paymentAgreementService.deletePaymentAgreement(milestoneId!);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Payment agreement deleted successfully",
      null,
    );
  },
);

// ============================================
// EXPORTS
// ============================================

export default {
  createPaymentAgreement,
  getPaymentAgreementByMilestone,
  getPaymentAgreementsByProject,
  updatePaymentAgreement,
  deletePaymentAgreement,
};
