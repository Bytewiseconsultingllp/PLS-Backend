import { Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware";

// Import admin controllers
import adminProjectController from "../../controllers/adminController/adminProjectController";
import adminClientController from "../../controllers/adminController/adminClientController";
import adminFreelancerController from "../../controllers/freeLancerController/adminFreelancerController";
import adminPaymentController from "../../controllers/adminController/adminPaymentController";
import adminPaymentListingController from "../../controllers/adminController/adminPaymentListingController";
import adminRefundController from "../../controllers/adminController/adminRefundController";

// Import admin routers
import adminFreelancerPayoutRouter from "./adminFreelancerPayoutRouter";

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

// ============================================
// PAYMENT LISTING & VERIFICATION ROUTES (ADMIN ONLY)
// Note: Specific routes MUST come before parameterized routes
// ============================================

/**
 * @route   GET /api/admin/payments
 * @desc    Get all payments with filters and pagination
 * @access  Private (Admin only)
 */
router.get("/payments", (req, res) =>
  adminPaymentListingController.getAllPayments(req, res),
);

/**
 * @route   GET /api/admin/payments/verification-stats
 * @desc    Get payment verification statistics and dashboard metrics
 * @access  Private (Admin only)
 * @query   days - Number of days to look back (default: 7)
 */
router.get("/payments/verification-stats", (req, res) =>
  adminPaymentController.getVerificationStats(req, res),
);

/**
 * @route   GET /api/admin/payments/verification-issues
 * @desc    Get payments with verification problems (mismatches, stuck payments)
 * @access  Private (Admin only)
 * @query   days - Number of days to look back (default: 7)
 * @query   limit - Maximum number of results (default: 50)
 */
router.get("/payments/verification-issues", (req, res) =>
  adminPaymentController.getVerificationIssues(req, res),
);

/**
 * @route   GET /api/admin/payments/:paymentId/verification-history
 * @desc    Get complete verification history for a specific payment
 * @access  Private (Admin only)
 */
router.get("/payments/:paymentId/verification-history", (req, res) =>
  adminPaymentController.getPaymentVerificationHistory(req, res),
);

/**
 * @route   GET /api/admin/payments/:paymentId/refunds
 * @desc    Get all refunds for a specific payment
 * @access  Private (Admin only)
 */
router.get("/payments/:paymentId/refunds", (req, res) =>
  adminRefundController.getPaymentRefunds(req, res),
);

/**
 * @route   GET /api/admin/payments/:paymentId
 * @desc    Get detailed payment information
 * @access  Private (Admin only)
 */
router.get("/payments/:paymentId", (req, res) =>
  adminPaymentListingController.getPaymentById(req, res),
);

/**
 * @route   GET /api/admin/projects/:projectId/payments
 * @desc    Get all payments for a specific project
 * @access  Private (Admin only)
 */
router.get("/projects/:projectId/payments", (req, res) =>
  adminPaymentListingController.getProjectPayments(req, res),
);

/**
 * @route   GET /api/admin/clients/:clientId/payments
 * @desc    Get all payments for a specific client
 * @access  Private (Admin only)
 */
router.get("/clients/:clientId/payments", (req, res) =>
  adminPaymentListingController.getClientPayments(req, res),
);

// ============================================
// REFUND ROUTES (ADMIN ONLY)
// ============================================

/**
 * @route   POST /api/admin/refunds/process
 * @desc    Process a refund for a payment
 * @access  Private (Admin only)
 */
router.post("/refunds/process", (req, res) =>
  adminRefundController.processRefund(req, res),
);

/**
 * @route   GET /api/admin/refunds/:refundId
 * @desc    Get refund details by ID
 * @access  Private (Admin only)
 */
router.get("/refunds/:refundId", (req, res) =>
  adminRefundController.getRefund(req, res),
);

/**
 * @route   GET /api/admin/projects/:projectId/refunds
 * @desc    Get all refunds for a specific project
 * @access  Private (Admin only)
 */
router.get("/projects/:projectId/refunds", (req, res) =>
  adminRefundController.getProjectRefunds(req, res),
);

/**
 * @route   GET /api/admin/payments/:paymentId/refunds
 * @desc    Get all refunds for a specific payment
 * @access  Private (Admin only)
 */
router.get("/payments/:paymentId/refunds", (req, res) =>
  adminRefundController.getPaymentRefunds(req, res),
);

/**
 * @route   GET /api/admin/refunds
 * @desc    Get all refunds with filters
 * @access  Private (Admin only)
 * @query   status - Filter by refund status (PENDING, SUCCEEDED, FAILED, CANCELLED)
 * @query   adminId - Filter by admin who processed the refund
 * @query   startDate - Filter by creation date (start)
 * @query   endDate - Filter by creation date (end)
 * @query   limit - Items per page (default: 50)
 * @query   offset - Number of items to skip (default: 0)
 */
router.get("/refunds", (req, res) =>
  adminRefundController.getAllRefunds(req, res),
);

/**
 * @route   GET /api/admin/projects/:projectId/net-amount
 * @desc    Calculate project net amount (totalAmountPaid - totalRefunded)
 * @access  Private (Admin only)
 */
router.get("/projects/:projectId/net-amount", (req, res) =>
  adminRefundController.getProjectNetAmount(req, res),
);

// ============================================
// PAYMENT SYNC ROUTES (ADMIN ONLY)
// ============================================

/**
 * @route   POST /api/admin/payments/:paymentId/sync-payment-intent
 * @desc    Sync payment intent ID from Stripe session (for existing payments)
 * @access  Private (Admin only)
 */
router.post("/payments/:paymentId/sync-payment-intent", (req, res) =>
  adminRefundController.syncPaymentIntent(req, res),
);

/**
 * @route   POST /api/admin/payments/bulk-sync-payment-intents
 * @desc    Bulk sync payment intent IDs for all payments missing them
 * @access  Private (Admin only)
 */
router.post("/payments/bulk-sync-payment-intents", (req, res) =>
  adminRefundController.bulkSyncPaymentIntents(req, res),
);

// ============================================
// FREELANCER PAYOUT ROUTES (ADMIN ONLY)
// All routes under /api/v1/admin/* related to freelancer payouts
// ============================================
router.use("/", adminFreelancerPayoutRouter);

export default router;
