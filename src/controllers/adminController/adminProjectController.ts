import type { Request, Response } from "express";
import adminProjectService from "../../services/adminProjectService";
import { SUCCESSCODE, BADREQUESTCODE } from "../../constants";
import { asyncHandler } from "../../utils/asyncHandlerUtils";
import { httpResponse } from "../../utils/apiResponseUtils";

// ============================================
// ADMIN PROJECT MANAGEMENT CONTROLLERS
// ============================================

/**
 * GET /api/admin/projects
 * Get all projects with filtering and pagination
 * Requires authentication - admin role only
 */
export const getAllProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, paymentStatus, startDate, endDate, acceptingBids } =
      req.query;

    const result = await adminProjectService.getAllProjects({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      paymentStatus: paymentStatus as any,
      startDate: startDate as string,
      endDate: endDate as string,
      acceptingBids:
        acceptingBids === "true"
          ? true
          : acceptingBids === "false"
            ? false
            : undefined,
    });

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Projects retrieved successfully",
      result,
    );
  },
);

/**
 * GET /api/admin/projects/:projectId
 * Get comprehensive project details
 * Requires authentication - admin role only
 */
export const getProjectById = asyncHandler(
  async (req: Request, res: Response) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw { status: BADREQUESTCODE, message: "Project ID is required" };
    }

    const project = await adminProjectService.getProjectById(projectId);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Project details retrieved successfully",
      project,
    );
  },
);

/**
 * GET /api/admin/projects/stats
 * Get project statistics
 * Requires authentication - admin role only
 */
export const getProjectStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await adminProjectService.getProjectStats();

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Project statistics retrieved successfully",
      stats,
    );
  },
);

export default {
  getAllProjects,
  getProjectById,
  getProjectStats,
};
