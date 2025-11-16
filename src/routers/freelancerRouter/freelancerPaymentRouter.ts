import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import FreelancerPaymentController from "../../controllers/freeLancerController/freelancerPaymentController";
import authMiddleware from "../../middlewares/authMiddleware";
import { validateDataMiddleware } from "../../middlewares/validationMiddleware";
import { updateFreelancerStripeAccountSchema } from "../../validation/zod";

const router = Router();

// ============================================
// ALL ROUTES REQUIRE FREELANCER AUTHENTICATION
// ============================================
router.use(authMiddleware.checkToken);

// Middleware to check if user is a freelancer
router.use((req: Request, res: Response, next: NextFunction) => {
  const userFromToken = (req as any).userFromToken;
  if (userFromToken?.role !== "FREELANCER") {
    res.status(403).json({
      success: false,
      message: "Access denied. Freelancer role required.",
    });
    return;
  }
  next();
});

// ============================================
// FREELANCER PAYMENT DETAILS MANAGEMENT
// ============================================

/**
 * @route POST /api/v1/freelancer/payment-details
 * @desc Add or update own Stripe account ID
 * @access Freelancer only
 */
router.post(
  "/payment-details",
  validateDataMiddleware(updateFreelancerStripeAccountSchema),
  (req, res) => FreelancerPaymentController.updateOwnStripeAccount(req, res),
);

/**
 * @route GET /api/v1/freelancer/payment-details
 * @desc Get own payment details and Stripe account status
 * @access Freelancer only
 */
router.get("/payment-details", (req, res) =>
  FreelancerPaymentController.getOwnPaymentDetails(req, res),
);

/**
 * @route DELETE /api/v1/freelancer/payment-details
 * @desc Remove/disconnect Stripe account
 * @access Freelancer only
 */
router.delete("/payment-details", (req, res) =>
  FreelancerPaymentController.removeOwnStripeAccount(req, res),
);

// ============================================
// PAYOUT HISTORY (Read-only for freelancers)
// ============================================

/**
 * @route GET /api/v1/freelancer/payouts
 * @desc Get own payout history
 * @access Freelancer only
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 10)
 */
router.get("/payouts", (req, res) =>
  FreelancerPaymentController.getOwnPayoutHistory(req, res),
);

/**
 * @route GET /api/v1/freelancer/payouts/:payoutId
 * @desc Get specific payout details (must be own payout)
 * @access Freelancer only
 */
router.get("/payouts/:payoutId", (req, res) =>
  FreelancerPaymentController.getOwnPayoutDetails(req, res),
);

export { router as freelancerPaymentRouter };
export default router;
