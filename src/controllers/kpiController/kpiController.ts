/**
 * KPI Controller
 *
 * Handles API logic for KPI (Key Performance Indicator) management.
 * Different endpoints for Admin, Moderator, and Client to assign points.
 */

import type { Response } from "express";
import type { _Request } from "../../middlewares/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandlerUtils";
import { httpResponse } from "../../utils/apiResponseUtils";
import kpiService from "../../services/kpiService";
import { SUCCESSCODE, UNAUTHORIZEDCODE, BADREQUESTCODE } from "../../constants";

// ============================================
// ASSIGN KPI POINTS (ADMIN)
// ============================================

/**
 * Assign KPI points to a freelancer (Admin only)
 * POST /api/v1/admin/freelancers/:freelancerId/kpi
 */
export const assignKPIPointsAdmin = asyncHandler(
  async (req: _Request, res: Response) => {
    const { freelancerId } = req.params;
    const { points, note } = req.body;
    const userId = req.userFromToken?.uid || "";
    const userRole = req.userFromToken?.role;

    if (!userId || userRole !== "ADMIN") {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "Only admins can use this endpoint",
      };
    }

    // Assign KPI points
    const result = await kpiService.assignKPIPoints(freelancerId!, {
      points,
      note,
      assignedBy: userId,
      assignedByRole: userRole,
    });

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "KPI points assigned successfully",
      result,
    );
  },
);

// ============================================
// ASSIGN KPI POINTS (MODERATOR)
// ============================================

/**
 * Assign KPI points to a freelancer (Moderator for their projects)
 * POST /api/v1/moderator/freelancers/:freelancerId/kpi
 */
export const assignKPIPointsModerator = asyncHandler(
  async (req: _Request, res: Response) => {
    const { freelancerId } = req.params;
    const { points, note, projectId } = req.body;
    const userId = req.userFromToken?.uid || "";
    const userRole = req.userFromToken?.role;

    if (!userId || userRole !== "MODERATOR") {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "Only moderators can use this endpoint",
      };
    }

    if (!projectId) {
      throw {
        status: BADREQUESTCODE,
        message: "projectId is required for moderators",
      };
    }

    // Check authorization
    const authCheck = await kpiService.canAssignKPIPoints(
      userId,
      userRole,
      freelancerId!,
      projectId,
    );

    if (!authCheck.authorized) {
      throw {
        status: UNAUTHORIZEDCODE,
        message: authCheck.reason || "Not authorized",
      };
    }

    // Assign KPI points
    const result = await kpiService.assignKPIPoints(freelancerId!, {
      points,
      note,
      assignedBy: userId,
      assignedByRole: userRole,
    });

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "KPI points assigned successfully",
      result,
    );
  },
);

// ============================================
// ASSIGN KPI POINTS (CLIENT)
// ============================================

/**
 * Assign KPI points to a freelancer (Client for their projects)
 * POST /api/v1/client/freelancers/:freelancerId/kpi
 */
export const assignKPIPointsClient = asyncHandler(
  async (req: _Request, res: Response) => {
    const { freelancerId } = req.params;
    const { points, note, projectId } = req.body;
    const userId = req.userFromToken?.uid || "";
    const userRole = req.userFromToken?.role;

    if (!userId || userRole !== "CLIENT") {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "Only clients can use this endpoint",
      };
    }

    if (!projectId) {
      throw {
        status: BADREQUESTCODE,
        message: "projectId is required for clients",
      };
    }

    // Check authorization
    const authCheck = await kpiService.canAssignKPIPoints(
      userId,
      userRole,
      freelancerId!,
      projectId,
    );

    if (!authCheck.authorized) {
      throw {
        status: UNAUTHORIZEDCODE,
        message: authCheck.reason || "Not authorized",
      };
    }

    // Assign KPI points
    const result = await kpiService.assignKPIPoints(freelancerId!, {
      points,
      note,
      assignedBy: userId,
      assignedByRole: userRole,
    });

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "KPI points assigned successfully",
      result,
    );
  },
);

// ============================================
// GET FREELANCER KPI
// ============================================

/**
 * Get KPI information for a freelancer
 * GET /api/v1/freelancers/:freelancerId/kpi
 */
export const getFreelancerKPI = asyncHandler(
  async (req: _Request, res: Response) => {
    const { freelancerId } = req.params;

    const result = await kpiService.getFreelancerKPI(freelancerId!);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "KPI data retrieved successfully",
      result,
    );
  },
);

// ============================================
// GET KPI HISTORY
// ============================================

/**
 * Get KPI history for a freelancer
 * GET /api/v1/freelancers/:freelancerId/kpi-history
 */
export const getKPIHistory = asyncHandler(
  async (req: _Request, res: Response) => {
    const { freelancerId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await kpiService.getKPIHistory(freelancerId!, limit);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "KPI history retrieved successfully",
      result,
    );
  },
);

// ============================================
// GET KPI LEADERBOARD
// ============================================

/**
 * Get KPI leaderboard (top freelancers)
 * GET /api/v1/freelancers/leaderboard
 */
export const getKPILeaderboard = asyncHandler(
  async (req: _Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await kpiService.getKPILeaderboard(page, limit);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Leaderboard retrieved successfully",
      result,
    );
  },
);

// ============================================
// EXPORTS
// ============================================

export default {
  assignKPIPointsAdmin,
  assignKPIPointsModerator,
  assignKPIPointsClient,
  getFreelancerKPI,
  getKPIHistory,
  getKPILeaderboard,
};
