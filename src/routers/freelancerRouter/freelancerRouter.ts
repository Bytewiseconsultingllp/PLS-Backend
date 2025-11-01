import { Router } from "express";
import freelancerController from "../../controllers/freeLancerController/freelancerController";
import authMiddleware from "../../middlewares/authMiddleware";

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   POST /api/freelancer/register
 * @desc    Register as a freelancer
 * @access  Public
 */
router.post("/register", freelancerController.registerFreelancer);

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

export default router;
