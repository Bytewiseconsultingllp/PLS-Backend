import { Router } from "express";
import moderatorController from "../../controllers/moderatorController/moderatorController";
import authMiddleware from "../../middlewares/authMiddleware";
import { validateDataMiddleware } from "../../middlewares/validationMiddleware";
import {
  createModeratorSchema,
  updateModeratorSchema,
  toggleModeratorStatusSchema,
  assignModeratorToProjectSchema,
} from "../../validation/zod";

const router = Router();

// ============================================
// ADMIN-ONLY ROUTES
// ============================================

/**
 * @route POST /api/v1/admin/moderators
 * @desc Create a new moderator (Admin only)
 */
router.post(
  "/",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIAdminOrModerator, // Only admin should create moderators
  validateDataMiddleware(createModeratorSchema),
  moderatorController.createModerator,
);

/**
 * @route GET /api/v1/admin/moderators
 * @desc Get all moderators (Admin only)
 */
router.get(
  "/",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIAdminOrModerator,
  moderatorController.getAllModerators,
);

/**
 * @route GET /api/v1/admin/moderators/:id
 * @desc Get moderator by ID (Admin only)
 */
router.get(
  "/:id",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIAdminOrModerator,
  moderatorController.getModeratorById,
);

/**
 * @route PATCH /api/v1/admin/moderators/:id
 * @desc Update moderator information (Admin only)
 */
router.patch(
  "/:id",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIAdminOrModerator,
  validateDataMiddleware(updateModeratorSchema),
  moderatorController.updateModerator,
);

/**
 * @route PATCH /api/v1/admin/moderators/:id/toggle-status
 * @desc Toggle moderator active status (Admin only)
 */
router.patch(
  "/:id/toggle-status",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIAdminOrModerator,
  validateDataMiddleware(toggleModeratorStatusSchema),
  moderatorController.toggleModeratorStatus,
);

/**
 * @route DELETE /api/v1/admin/moderators/:id
 * @desc Delete moderator (Admin only)
 */
router.delete(
  "/:id",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIAdminOrModerator,
  moderatorController.deleteModerator,
);

// ============================================
// PROJECT-MODERATOR ASSIGNMENT (ADMIN ONLY)
// ============================================

/**
 * @route POST /api/v1/admin/projects/:projectId/assign-moderator
 * @desc Assign moderator to a project (Admin only)
 */
router.post(
  "/projects/:projectId/assign-moderator",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIAdminOrModerator,
  validateDataMiddleware(assignModeratorToProjectSchema),
  moderatorController.assignModeratorToProject,
);

/**
 * @route DELETE /api/v1/admin/projects/:projectId/moderator
 * @desc Unassign moderator from a project (Admin only)
 */
router.delete(
  "/projects/:projectId/moderator",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIAdminOrModerator,
  moderatorController.unassignModeratorFromProject,
);

export default router;
