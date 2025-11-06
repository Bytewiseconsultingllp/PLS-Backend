import { Router } from "express";
import freelancerController from "../../controllers/freeLancerController/freelancerController";
import authMiddleware from "../../middlewares/authMiddleware";
import rateLimiterMiddleware from "../../middlewares/rateLimiterMiddleware";

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   POST /api/freelancer/accept-platform-agreement
 * @desc    Accept platform agreement (Step 1 of registration)
 * @access  Public
 */
router.post(
  "/accept-platform-agreement",
  (req, res, next) =>
    rateLimiterMiddleware.handle(
      req,
      res,
      next,
      1,
      "Too many platform agreement attempts. Please try again in 15 minutes.",
      3,
      900,
      "freelancer_accept_agreement",
    ),
  freelancerController.acceptPlatformAgreement,
);

/**
 * @route   POST /api/freelancer/register
 * @desc    Register as a freelancer
 * @access  Public
 */
router.post(
  "/register",
  (req, res, next) =>
    rateLimiterMiddleware.handle(
      req,
      res,
      next,
      1,
      "Too many registration attempts. Please try again in 15 minutes.",
      3,
      900,
      "freelancer_register",
    ),
  freelancerController.registerFreelancer,
);

// ============================================
// PROTECTED ROUTES (FREELANCER ONLY)
// ============================================

/**
 * @route   GET /api/freelancer/profile
 * @desc    Get current freelancer's profile
 * @access  Private (Freelancer)
 */
router.get(
  "/profile",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer,
  freelancerController.getMyProfile,
);

/**
 * @route   GET /api/freelancer/projects
 * @desc    Get all available projects for bidding
 * @access  Private (Freelancer)
 */
router.get(
  "/projects",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer,
  freelancerController.getAvailableProjects,
);

/**
 * @route   GET /api/freelancer/projects/:projectId
 * @desc    Get project details for bidding (without pricing)
 * @access  Private (Freelancer)
 */
router.get(
  "/projects/:projectId",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer,
  freelancerController.getProjectDetails,
);

/**
 * @route   POST /api/freelancer/bids
 * @desc    Submit a bid on a project
 * @access  Private (Freelancer)
 */
router.post(
  "/bids",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer,
  freelancerController.createBid,
);

/**
 * @route   GET /api/freelancer/bids
 * @desc    Get all bids submitted by the current freelancer
 * @access  Private (Freelancer)
 */
router.get(
  "/bids",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer,
  freelancerController.getMyBids,
);

/**
 * @route   GET /api/freelancer/bids/:bidId
 * @desc    Get details of a specific bid
 * @access  Private (Freelancer)
 */
router.get(
  "/bids/:bidId",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer,
  freelancerController.getBidDetails,
);

/**
 * @route   DELETE /api/freelancer/bids/:bidId
 * @desc    Withdraw a pending bid
 * @access  Private (Freelancer)
 */
router.delete(
  "/bids/:bidId",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer,
  freelancerController.withdrawBid,
);

// ============================================
// SELECTED PROJECTS & MILESTONES ROUTES
// ============================================

/**
 * @route   GET /api/freelancer/my-projects
 * @desc    Get all projects where the freelancer is selected/assigned
 * @access  Private (Freelancer)
 */
router.get(
  "/my-projects",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer,
  freelancerController.getMySelectedProjects,
);

/**
 * @route   GET /api/freelancer/my-projects/:projectId
 * @desc    Get detailed view of a specific project the freelancer is selected for
 * @access  Private (Freelancer)
 */
router.get(
  "/my-projects/:projectId",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer,
  freelancerController.getMySelectedProjectDetails,
);

/**
 * @route   GET /api/freelancer/my-projects/:projectId/milestones
 * @desc    Get all milestones for a project the freelancer is selected for
 * @access  Private (Freelancer)
 */
router.get(
  "/my-projects/:projectId/milestones",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer,
  freelancerController.getProjectMilestones,
);

/**
 * @route   GET /api/freelancer/my-projects/:projectId/milestones/:milestoneId
 * @desc    Get specific milestone details for a project the freelancer is selected for
 * @access  Private (Freelancer)
 */
router.get(
  "/my-projects/:projectId/milestones/:milestoneId",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer,
  freelancerController.getMilestoneDetails,
);

export default router;
