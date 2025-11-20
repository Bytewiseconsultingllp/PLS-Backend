import { Router } from "express";
import FreelancerStripeConnectController from "../../controllers/freeLancerController/freelancerStripeConnectController";
import authMiddleware from "../../middlewares/authMiddleware";

const router = Router();

// ============================================
// PUBLIC OAUTH CALLBACK (No Auth Required)
// ============================================

/**
 * @route GET /api/v1/freelancer/stripe-connect-callback
 * @desc Handle Stripe OAuth callback after authorization
 * @access Public (Stripe redirects here with code)
 */
router.get("/stripe-connect-callback", (req, res) =>
  FreelancerStripeConnectController.handleStripeCallback(req, res),
);

// ============================================
// AUTHENTICATED FREELANCER ROUTES
// ============================================
router.use(authMiddleware.checkToken);

// Middleware to check if user is a freelancer
router.use((req, res, next) => {
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

/**
 * @route GET /api/v1/freelancer/stripe-connect-url
 * @desc Generate Stripe Connect OAuth URL for freelancer to authorize
 * @access Freelancer only
 */
router.get("/stripe-connect-url", (req, res) =>
  FreelancerStripeConnectController.getStripeConnectUrl(req, res),
);

/**
 * @route GET /api/v1/freelancer/stripe-connect-supported-countries
 * @desc List supported countries for Stripe Connect onboarding
 * @access Freelancer only
 */
router.get("/stripe-connect-supported-countries", (req, res) =>
  FreelancerStripeConnectController.listSupportedCountries(req, res),
);

/**
 * @route GET /api/v1/freelancer/stripe-connect-status
 * @desc Get current Stripe Connect status and account details
 * @access Freelancer only
 */
router.get("/stripe-connect-status", (req, res) =>
  FreelancerStripeConnectController.getConnectStatus(req, res),
);

/**
 * @route DELETE /api/v1/freelancer/stripe-connect
 * @desc Disconnect Stripe account (revoke OAuth authorization)
 * @access Freelancer only
 */
router.delete("/stripe-connect", (req, res) =>
  FreelancerStripeConnectController.disconnectStripeAccount(req, res),
);

export { router as freelancerStripeConnectRouter };
export default router;
