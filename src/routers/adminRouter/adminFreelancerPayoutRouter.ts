import { Router } from "express";
import AdminFreelancerPayoutController from "../../controllers/adminController/adminFreelancerPayoutController";
import authMiddleware from "../../middlewares/authMiddleware";
import { validateDataMiddleware } from "../../middlewares/validationMiddleware";
import {
  updateFreelancerStripeAccountSchema,
  createPayoutSchema,
  updatePayoutStatusSchema,
} from "../../validation/zod";

const router = Router();

// ============================================
// ALL ROUTES REQUIRE ADMIN AUTHENTICATION
// ============================================
router.use(authMiddleware.checkToken);
router.use(authMiddleware.checkIfUserIsAdmin);

// ============================================
// FREELANCER PAYMENT DETAILS MANAGEMENT
// ============================================

/**
 * @route POST /api/v1/admin/freelancers/:freelancerId/payment-details
 * @desc Add or update freelancer Stripe account details (admin override)
 * @access Admin only
 * @note Freelancers can also manage their own payment details via /api/v1/freelancer/payment-details
 */
router.post(
  "/freelancers/:freelancerId/payment-details",
  validateDataMiddleware(updateFreelancerStripeAccountSchema),
  (req, res) =>
    AdminFreelancerPayoutController.updateFreelancerStripeAccount(req, res),
);

/**
 * @route GET /api/v1/admin/freelancers/:freelancerId/payment-details
 * @desc Get freelancer payment details and Stripe account status
 * @access Admin only
 */
router.get("/freelancers/:freelancerId/payment-details", (req, res) =>
  AdminFreelancerPayoutController.getFreelancerPaymentDetails(req, res),
);

// ============================================
// PAYOUT MANAGEMENT
// ============================================

/**
 * @route POST /api/v1/admin/freelancers/:freelancerId/payout
 * @desc Initiate payout to freelancer
 * @access Admin only
 */
router.post(
  "/freelancers/:freelancerId/payout",
  validateDataMiddleware(createPayoutSchema),
  (req, res) => AdminFreelancerPayoutController.createPayout(req, res),
);

/**
 * @route GET /api/v1/admin/freelancers/:freelancerId/payouts
 * @desc Get payout history for a specific freelancer
 * @access Admin only
 */
router.get("/freelancers/:freelancerId/payouts", (req, res) =>
  AdminFreelancerPayoutController.getFreelancerPayoutHistory(req, res),
);

/**
 * @route GET /api/v1/admin/payouts
 * @desc Get all payouts with optional filters
 * @query status - Filter by payout status
 * @query freelancerId - Filter by freelancer
 * @query projectId - Filter by project
 * @query startDate - Filter by date range (start)
 * @query endDate - Filter by date range (end)
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 10)
 * @access Admin only
 */
router.get("/payouts", (req, res) =>
  AdminFreelancerPayoutController.getAllPayouts(req, res),
);

/**
 * @route GET /api/v1/admin/payouts/:payoutId
 * @desc Get specific payout details
 * @access Admin only
 */
router.get("/payouts/:payoutId", (req, res) =>
  AdminFreelancerPayoutController.getPayoutById(req, res),
);

/**
 * @route DELETE /api/v1/admin/payouts/:payoutId
 * @desc Cancel a pending payout
 * @access Admin only
 */
router.delete("/payouts/:payoutId", (req, res) =>
  AdminFreelancerPayoutController.cancelPayout(req, res),
);

/**
 * @route PATCH /api/v1/admin/payouts/:payoutId/status
 * @desc Update payout status (manual override)
 * @access Admin only
 */
router.patch(
  "/payouts/:payoutId/status",
  validateDataMiddleware(updatePayoutStatusSchema),
  (req, res) => AdminFreelancerPayoutController.updatePayoutStatus(req, res),
);

export { router as adminFreelancerPayoutRouter };
export default router;
