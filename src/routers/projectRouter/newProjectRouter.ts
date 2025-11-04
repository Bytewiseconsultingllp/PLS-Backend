import { Router } from "express";
import projectController from "../../controllers/projectController/newProjectController";
import authMiddleware from "../../middlewares/authMiddleware";
import { validateDataMiddleware } from "../../middlewares/validationMiddleware";
import {
  clientProjectCreateSchema,
  clientProjectUpdateSchema,
  MilestoneSchema,
  MilestoneUpdateSchema,
  MilestoneModeratorApprovalSchema,
  AcceptingBidsSchema,
} from "../../validation/zod";

const router = Router();

/**
 * @route   POST /api/projects/from-visitor
 * @desc    Create project from visitor data (after visitor registers as client)
 * @access  Private (CLIENT)
 */
router.post(
  "/from-visitor",
  authMiddleware.checkToken,
  projectController.createProjectFromVisitor,
);

/**
 * @route   POST /api/projects
 * @desc    Create project directly (for existing clients)
 * @access  Private (CLIENT)
 */
router.post(
  "/",
  authMiddleware.checkToken,
  validateDataMiddleware(clientProjectCreateSchema),
  projectController.createProject,
);

/**
 * @route   GET /api/projects/my-projects
 * @desc    Get all projects for authenticated client
 * @access  Private (CLIENT)
 */
router.get(
  "/my-projects",
  authMiddleware.checkToken,
  projectController.getMyProjects,
);

/**
 * @route   GET /api/projects
 * @desc    Get all projects (Admin only)
 * @access  Private (ADMIN)
 */
router.get("/", authMiddleware.checkToken, projectController.getAllProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Private (CLIENT/ADMIN)
 */
router.get(
  "/:id",
  authMiddleware.checkToken,
  projectController.getSingleProject,
);

/**
 * @route   GET /api/projects/:id/milestones
 * @desc    Get all milestones for a project
 * @access  Private (CLIENT/ADMIN)
 */
router.get(
  "/:id/milestones",
  authMiddleware.checkToken,
  projectController.getProjectMilestones,
);

/**
 * @route   PATCH /api/projects/:id/discord-url
 * @desc    Update project discord chat URL
 * @access  Private (CLIENT/ADMIN)
 */
router.patch(
  "/:id/discord-url",
  authMiddleware.checkToken,
  projectController.updateProjectDiscordUrl,
);

/**
 * @route   POST /api/projects/:id/milestones
 * @desc    Add milestone to project
 * @access  Private (CLIENT/ADMIN)
 */
router.post(
  "/:id/milestones",
  authMiddleware.checkToken,
  validateDataMiddleware(MilestoneSchema),
  projectController.addMilestone,
);

/**
 * @route   PATCH /api/projects/:id/milestones/:milestoneId
 * @desc    Update milestone
 * @access  Private (CLIENT/ADMIN/FREELANCER)
 */
router.patch(
  "/:id/milestones/:milestoneId",
  authMiddleware.checkToken,
  validateDataMiddleware(MilestoneUpdateSchema),
  projectController.updateMilestone,
);

/**
 * @route   POST /api/projects/:id/milestones/:milestoneId/approve
 * @desc    Moderator approve/disapprove milestone
 * @access  Private (MODERATOR/ADMIN)
 */
router.post(
  "/:id/milestones/:milestoneId/approve",
  authMiddleware.checkToken,
  validateDataMiddleware(MilestoneModeratorApprovalSchema),
  projectController.moderatorApproveMilestone,
);

/**
 * @route   DELETE /api/projects/:id/milestones/:milestoneId
 * @desc    Delete milestone
 * @access  Private (CLIENT/ADMIN)
 */
router.delete(
  "/:id/milestones/:milestoneId",
  authMiddleware.checkToken,
  projectController.deleteMilestone,
);

/**
 * @route   POST /api/projects/:id/interested-freelancers
 * @desc    Add interested freelancer to project
 * @access  Private (ADMIN)
 */
router.post(
  "/:id/interested-freelancers",
  authMiddleware.checkToken,
  projectController.addInterestedFreelancer,
);

/**
 * @route   POST /api/projects/:id/selected-freelancers
 * @desc    Select freelancer for project
 * @access  Private (CLIENT/ADMIN)
 */
router.post(
  "/:id/selected-freelancers",
  authMiddleware.checkToken,
  projectController.selectFreelancer,
);

/**
 * @route   DELETE /api/projects/:id/interested-freelancers/:freelancerId
 * @desc    Remove interested freelancer
 * @access  Private (ADMIN)
 */
router.delete(
  "/:id/interested-freelancers/:freelancerId",
  authMiddleware.checkToken,
  projectController.removeInterestedFreelancer,
);

/**
 * @route   DELETE /api/projects/:id/selected-freelancers/:freelancerId
 * @desc    Remove selected freelancer
 * @access  Private (CLIENT/ADMIN)
 */
router.delete(
  "/:id/selected-freelancers/:freelancerId",
  authMiddleware.checkToken,
  projectController.removeSelectedFreelancer,
);

/**
 * @route   PATCH /api/projects/:id
 * @desc    Update project details (partial update)
 * @access  Private (CLIENT/ADMIN)
 */
router.patch(
  "/:id",
  authMiddleware.checkToken,
  validateDataMiddleware(clientProjectUpdateSchema),
  projectController.updateProject,
);

/**
 * @route   PATCH /api/projects/:id/accepting-bids
 * @desc    Toggle accepting bids status
 * @access  Private (CLIENT/ADMIN/MODERATOR)
 */
router.patch(
  "/:id/accepting-bids",
  authMiddleware.checkToken,
  validateDataMiddleware(AcceptingBidsSchema),
  projectController.toggleAcceptingBids,
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project (soft delete)
 * @access  Private (CLIENT/ADMIN)
 */
router.delete(
  "/:id",
  authMiddleware.checkToken,
  projectController.deleteProject,
);

export default router;
