import { Router } from "express";
import visitorsController from "../../controllers/visitorsController/newVisitorsController";
import authMiddleware from "../../middlewares/authMiddleware";

const router = Router();

/**
 * @route   POST /api/visitors/create
 * @desc    Step 1: Create visitor with basic details
 * @access  Public
 */
router.post("/create", visitorsController.createVisitorWithDetails);

/**
 * @route   POST /api/visitors/:visitorId/services
 * @desc    Step 2: Add service selections for visitor
 * @access  Public
 */
router.post("/:visitorId/services", visitorsController.addVisitorServices);

/**
 * @route   POST /api/visitors/:visitorId/industries
 * @desc    Step 3: Add industry selections for visitor
 * @access  Public
 */
router.post("/:visitorId/industries", visitorsController.addVisitorIndustries);

/**
 * @route   POST /api/visitors/:visitorId/technologies
 * @desc    Step 4: Add technology selections for visitor
 * @access  Public
 */
router.post(
  "/:visitorId/technologies",
  visitorsController.addVisitorTechnologies,
);

/**
 * @route   POST /api/visitors/:visitorId/features
 * @desc    Step 5: Add feature selections for visitor
 * @access  Public
 */
router.post("/:visitorId/features", visitorsController.addVisitorFeatures);

/**
 * @route   POST /api/visitors/:visitorId/discount
 * @desc    Step 6: Add discount selection for visitor
 * @access  Public
 */
router.post("/:visitorId/discount", visitorsController.addVisitorDiscount);

/**
 * @route   POST /api/visitors/:visitorId/timeline
 * @desc    Step 7: Add timeline selection for visitor (Auto-calculates estimate)
 * @access  Public
 */
router.post("/:visitorId/timeline", visitorsController.addVisitorTimeline);

/**
 * @route   POST /api/visitors/:visitorId/estimate
 * @desc    Step 8: Add estimate for visitor (DISABLED - Now auto-calculated on timeline)
 * @access  Public
 */
// router.post("/:visitorId/estimate", visitorsController.addVisitorEstimate);

/**
 * @route   POST /api/visitors/:visitorId/service-agreement
 * @desc    Step 8: Add service agreement (final step - was Step 9)
 * @access  Public
 */
router.post(
  "/:visitorId/service-agreement",
  visitorsController.addVisitorServiceAgreement,
);

/**
 * @route   POST /api/visitors/check-email
 * @desc    Check if visitor email exists / is a client
 * @access  Public
 */
router.post("/check-email", visitorsController.checkVisitorEmail);

/**
 * @route   GET /api/visitors/:id
 * @desc    Get single visitor by ID
 * @access  Private (Admin/Client)
 */
router.get(
  "/:id",
  authMiddleware.checkToken,
  visitorsController.getSingleVisitor,
);

/**
 * @route   GET /api/visitors
 * @desc    Get all visitors with pagination
 * @access  Private (Admin only)
 */
router.get("/", authMiddleware.checkToken, visitorsController.getAllVisitors);

/**
 * @route   GET /api/visitors/:id/estimate
 * @desc    Get visitor estimate details
 * @access  Public
 */
router.get("/:id/estimate", visitorsController.getVisitorEstimate);

/**
 * @route   POST /api/visitors/:id/estimate/accept
 * @desc    Accept visitor estimate
 * @access  Public
 */
router.post("/:id/estimate/accept", visitorsController.acceptVisitorEstimate);

/**
 * @route   PATCH /api/visitors/:id/estimate
 * @desc    Admin override visitor estimate
 * @access  Private (Admin only)
 */
router.patch(
  "/:id/estimate",
  authMiddleware.checkToken,
  visitorsController.adminOverrideVisitorEstimate,
);

/**
 * @route   GET /api/visitors/:id/quote
 * @desc    Request formal quote (PDF download)
 * @access  Public
 */
router.get("/:id/quote", visitorsController.requestFormalQuote);

/**
 * @route   POST /api/visitors/:id/convert-to-project
 * @desc    Convert visitor to project (manual)
 * @access  Private (Admin only)
 */
router.post(
  "/:id/convert-to-project",
  authMiddleware.checkToken,
  visitorsController.convertVisitorToProject,
);

/**
 * @route   DELETE /api/visitors/:id
 * @desc    Delete visitor (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authMiddleware.checkToken,
  visitorsController.deleteVisitor,
);

export default router;
