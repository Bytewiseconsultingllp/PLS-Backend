import { Router } from "express";
import moderatorController from "../../controllers/moderatorController/moderatorController";
import authMiddleware from "../../middlewares/authMiddleware";

const router = Router();

// ============================================
// MODERATOR SELF-SERVICE ROUTES
// ============================================

/**
 * @route GET /api/v1/moderator/my-projects
 * @desc Get projects assigned to the logged-in moderator
 */
router.get(
  "/my-projects",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIAdminOrModerator,
  moderatorController.getMyProjects,
);

/**
 * @route GET /api/v1/moderator/projects/:projectId
 * @desc Get single project details (must be assigned to this moderator)
 */
router.get(
  "/projects/:projectId",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIAdminOrModerator,
  moderatorController.getProjectDetails,
);

export default router;
