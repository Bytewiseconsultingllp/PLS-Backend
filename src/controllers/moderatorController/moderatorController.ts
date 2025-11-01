import type { Response } from "express";
import moderatorService from "../../services/moderatorService";
import { BADREQUESTCODE, SUCCESSCODE, UNAUTHORIZEDCODE } from "../../constants";
import { asyncHandler } from "../../utils/asyncHandlerUtils";
import { httpResponse } from "../../utils/apiResponseUtils";
import type { _Request } from "../../middlewares/authMiddleware";
import { globalMailService } from "../../services/globalMailService";

// ============================================
// ADMIN-ONLY MODERATOR MANAGEMENT
// ============================================

/**
 * Create a new moderator (Admin only)
 * Admin provides: email and fullName
 * System generates: username and password
 */
export const createModerator = asyncHandler(
  async (req: _Request, res: Response) => {
    const { email, fullName } = req.body;

    const result = await moderatorService.createModerator(email, fullName);

    // Send credentials email
    try {
      await globalMailService.sendModeratorCredentials(
        result.moderator.email,
        result.moderator.fullName,
        result.moderator.username,
        result.tempPassword,
      );
    } catch (emailError) {
      console.error("Error sending moderator credentials email:", emailError);
      // Don't fail the request if email fails, just log it
    }

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Moderator created successfully. Credentials have been sent via email.",
      {
        moderator: result.moderator,
        // Include password in response for admin reference
        // (Also sent via email to moderator)
        generatedPassword: result.tempPassword,
      },
    );
  },
);

/**
 * Get all moderators (Admin only)
 */
export const getAllModerators = asyncHandler(
  async (req: _Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const includeInactive = req.query.includeInactive === "true";

    const result = await moderatorService.getAllModerators(
      page,
      limit,
      includeInactive,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Moderators retrieved successfully",
      result,
    );
  },
);

/**
 * Get moderator by ID (Admin only)
 */
export const getModeratorById = asyncHandler(
  async (req: _Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Moderator ID is required" };
    }

    const moderator = await moderatorService.getModeratorById(id);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Moderator details retrieved successfully",
      moderator,
    );
  },
);

/**
 * Update moderator information (Admin only)
 */
export const updateModerator = asyncHandler(
  async (req: _Request, res: Response) => {
    const { id } = req.params;
    const { fullName, email, phone } = req.body;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Moderator ID is required" };
    }

    const moderator = await moderatorService.updateModerator(id, {
      fullName,
      email,
      phone,
    });

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Moderator updated successfully",
      moderator,
    );
  },
);

/**
 * Toggle moderator active status (Admin only)
 */
export const toggleModeratorStatus = asyncHandler(
  async (req: _Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Moderator ID is required" };
    }

    if (typeof isActive !== "boolean") {
      throw {
        status: BADREQUESTCODE,
        message: "isActive must be a boolean value",
      };
    }

    const moderator = await moderatorService.toggleModeratorActiveStatus(
      id,
      isActive,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      isActive
        ? "Moderator activated successfully"
        : "Moderator deactivated successfully",
      moderator,
    );
  },
);

/**
 * Delete moderator (Admin only)
 */
export const deleteModerator = asyncHandler(
  async (req: _Request, res: Response) => {
    const { id } = req.params;
    const adminUserId = req.userFromToken?.uid;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Moderator ID is required" };
    }

    if (!adminUserId) {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "Admin user ID not found",
      };
    }

    const moderator = await moderatorService.deleteModerator(id, adminUserId);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Moderator deleted successfully",
      moderator,
    );
  },
);

// ============================================
// PROJECT-MODERATOR ASSIGNMENT (ADMIN ONLY)
// ============================================

/**
 * Assign moderator to a project (Admin only)
 */
export const assignModeratorToProject = asyncHandler(
  async (req: _Request, res: Response) => {
    const { projectId } = req.params;
    const { moderatorId } = req.body;

    if (!projectId) {
      throw { status: BADREQUESTCODE, message: "Project ID is required" };
    }

    if (!moderatorId) {
      throw { status: BADREQUESTCODE, message: "Moderator ID is required" };
    }

    const result = await moderatorService.assignModeratorToProject(
      projectId,
      moderatorId,
    );

    // Send project assignment email to moderator
    try {
      const projectUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/projects/${projectId}`;
      const companyName =
        result.project.details?.companyName || "Unknown Company";

      await globalMailService.sendProjectAssignmentNotification(
        result.newModerator.email,
        result.newModerator.fullName,
        companyName,
        projectUrl,
      );
    } catch (emailError) {
      console.error(
        "Error sending project assignment notification:",
        emailError,
      );
      // Don't fail the request if email fails
    }

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      result.previousModerator
        ? `Moderator assigned successfully. Previous moderator (${result.previousModerator.fullName}) has been replaced.`
        : "Moderator assigned successfully",
      {
        project: result.project,
        assignedModerator: result.newModerator,
        previousModerator: result.previousModerator,
      },
    );
  },
);

/**
 * Unassign moderator from a project (Admin only)
 */
export const unassignModeratorFromProject = asyncHandler(
  async (req: _Request, res: Response) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw { status: BADREQUESTCODE, message: "Project ID is required" };
    }

    const result =
      await moderatorService.unassignModeratorFromProject(projectId);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      `Moderator (${result.unassignedModerator?.fullName}) unassigned successfully`,
      {
        project: result.project,
        unassignedModerator: result.unassignedModerator,
      },
    );
  },
);

// ============================================
// MODERATOR SELF-SERVICE ENDPOINTS
// ============================================

/**
 * Get projects assigned to the logged-in moderator
 */
export const getMyProjects = asyncHandler(
  async (req: _Request, res: Response) => {
    const moderatorUserId = req.userFromToken?.uid;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!moderatorUserId) {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "Moderator user ID not found",
      };
    }

    const result = await moderatorService.getModeratorProjects(
      moderatorUserId,
      page,
      limit,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Your assigned projects retrieved successfully",
      result,
    );
  },
);

/**
 * Get single project details (must be assigned to this moderator)
 */
export const getProjectDetails = asyncHandler(
  async (req: _Request, res: Response) => {
    const { projectId } = req.params;
    const moderatorUserId = req.userFromToken?.uid;

    if (!projectId) {
      throw { status: BADREQUESTCODE, message: "Project ID is required" };
    }

    if (!moderatorUserId) {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "Moderator user ID not found",
      };
    }

    const project = await moderatorService.getModeratorProjectById(
      projectId,
      moderatorUserId,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Project details retrieved successfully",
      project,
    );
  },
);

export default {
  // Admin endpoints
  createModerator,
  getAllModerators,
  getModeratorById,
  updateModerator,
  toggleModeratorStatus,
  deleteModerator,
  assignModeratorToProject,
  unassignModeratorFromProject,
  // Moderator endpoints
  getMyProjects,
  getProjectDetails,
};
