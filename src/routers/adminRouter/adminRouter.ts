import { Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware";

// Import admin controllers
import adminProjectController from "../../controllers/adminController/adminProjectController";
import adminClientController from "../../controllers/adminController/adminClientController";
import adminFreelancerController from "../../controllers/freeLancerController/adminFreelancerController";

const router = Router();

// ============================================
// ALL ROUTES REQUIRE ADMIN AUTHENTICATION
// ============================================
router.use(authMiddleware.checkToken);
router.use(authMiddleware.checkIfUserIsAdmin);

// ============================================
// PROJECT MANAGEMENT ROUTES (ADMIN ONLY)
// ============================================

/**
 * @route   GET /api/admin/projects/stats
 * @desc    Get project statistics
 * @access  Private (Admin only)
 */
router.get("/projects/stats", adminProjectController.getProjectStats);

/**
 * @route   GET /api/admin/projects
 * @desc    Get all projects with filters and pagination
 * @access  Private (Admin only)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 * @query   paymentStatus - Filter by payment status (PENDING, SUCCEEDED, FAILED, etc.)
 * @query   startDate - Filter by creation date (start)
 * @query   endDate - Filter by creation date (end)
 * @query   acceptingBids - Filter by accepting bids status (true/false)
 */
router.get("/projects", adminProjectController.getAllProjects);

/**
 * @route   GET /api/admin/projects/:projectId
 * @desc    Get comprehensive project details with all related data
 * @access  Private (Admin only)
 */
router.get("/projects/:projectId", adminProjectController.getProjectById);

// ============================================
// CLIENT MANAGEMENT ROUTES (ADMIN ONLY)
// ============================================

/**
 * @route   GET /api/admin/clients/stats
 * @desc    Get client statistics
 * @access  Private (Admin only)
 */
router.get("/clients/stats", adminClientController.getClientStats);

/**
 * @route   GET /api/admin/clients
 * @desc    Get all clients with pagination and search
 * @access  Private (Admin only)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 * @query   searchQuery - Search by name, email, or username
 */
router.get("/clients", adminClientController.getAllClients);

/**
 * @route   GET /api/admin/clients/:clientId
 * @desc    Get comprehensive client details with projects, payments, KPI, visitor data
 * @access  Private (Admin only)
 */
router.get("/clients/:clientId", adminClientController.getClientById);

// ============================================
// FREELANCER MANAGEMENT ROUTES (ADMIN ONLY)
// ============================================

/**
 * @route   GET /api/admin/freelancers/stats
 * @desc    Get freelancer statistics
 * @access  Private (Admin only)
 */
router.get("/freelancers/stats", adminFreelancerController.getFreelancerStats);

/**
 * @route   GET /api/admin/freelancers
 * @desc    Get all freelancers with filtering
 * @access  Private (Admin only)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 * @query   status - Filter by status (PENDING_REVIEW, ACCEPTED, REJECTED)
 */
router.get("/freelancers", adminFreelancerController.getAllFreelancers);

/**
 * @route   GET /api/admin/freelancers/:freelancerId
 * @desc    Get detailed information about a specific freelancer
 * @access  Private (Admin only)
 */
router.get(
  "/freelancers/:freelancerId",
  adminFreelancerController.getFreelancerDetails,
);

/**
 * @route   POST /api/admin/freelancers/:freelancerId/review
 * @desc    Accept or reject a freelancer
 * @access  Private (Admin only)
 */
router.post(
  "/freelancers/:freelancerId/review",
  adminFreelancerController.reviewFreelancer,
);

// ============================================
// BID MANAGEMENT ROUTES (ADMIN ONLY)
// ============================================

/**
 * @route   GET /api/admin/projects/:projectId/bids
 * @desc    Get all bids for a specific project
 * @access  Private (Admin only)
 */
router.get(
  "/projects/:projectId/bids",
  adminFreelancerController.getProjectBids,
);

/**
 * @route   GET /api/admin/bids/:bidId
 * @desc    Get detailed information about a specific bid
 * @access  Private (Admin only)
 */
router.get("/bids/:bidId", adminFreelancerController.getBidDetails);

/**
 * @route   POST /api/admin/bids/:bidId/review
 * @desc    Accept or reject a bid
 * @access  Private (Admin only)
 */
router.post("/bids/:bidId/review", adminFreelancerController.reviewBid);

export default router;
