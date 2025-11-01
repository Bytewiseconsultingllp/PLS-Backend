import { Router } from "express";
import adminFreelancerController from "../../controllers/freeLancerController/adminFreelancerController";
import authMiddleware from "../../middlewares/authMiddleware";

const router = Router();

// All routes require Admin or Moderator authentication
router.use(authMiddleware.checkToken);
router.use(authMiddleware.checkIfUserIAdminOrModerator);

// ============================================
// FREELANCER MANAGEMENT ROUTES
// ============================================

/**
 * @route   GET /api/admin/freelancers
 * @desc    Get all freelancers with filtering
 * @access  Private (Admin/Moderator)
 */
router.get("/freelancers", adminFreelancerController.getAllFreelancers);

/**
 * @route   GET /api/admin/freelancers/stats
 * @desc    Get freelancer statistics
 * @access  Private (Admin/Moderator)
 */
router.get("/freelancers/stats", adminFreelancerController.getFreelancerStats);

/**
 * @route   GET /api/admin/freelancers/:freelancerId
 * @desc    Get detailed information about a specific freelancer
 * @access  Private (Admin/Moderator)
 */
router.get(
  "/freelancers/:freelancerId",
  adminFreelancerController.getFreelancerDetails,
);

/**
 * @route   POST /api/admin/freelancers/:freelancerId/review
 * @desc    Accept or reject a freelancer
 * @access  Private (Admin/Moderator)
 */
router.post(
  "/freelancers/:freelancerId/review",
  adminFreelancerController.reviewFreelancer,
);

// ============================================
// BID MANAGEMENT ROUTES
// ============================================

/**
 * @route   GET /api/admin/projects/:projectId/bids
 * @desc    Get all bids for a specific project
 * @access  Private (Admin/Moderator)
 */
router.get(
  "/projects/:projectId/bids",
  adminFreelancerController.getProjectBids,
);

/**
 * @route   GET /api/admin/bids/:bidId
 * @desc    Get detailed information about a specific bid
 * @access  Private (Admin/Moderator)
 */
router.get("/bids/:bidId", adminFreelancerController.getBidDetails);

/**
 * @route   POST /api/admin/bids/:bidId/review
 * @desc    Accept or reject a bid
 * @access  Private (Admin/Moderator)
 */
router.post("/bids/:bidId/review", adminFreelancerController.reviewBid);

export default router;
