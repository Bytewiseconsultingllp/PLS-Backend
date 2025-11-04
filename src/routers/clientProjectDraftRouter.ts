import { Router } from "express";
import clientProjectDraftController from "../controllers/clientProjectDraftController";
import authMiddleware from "../middlewares/authMiddleware";
import { validateDataMiddleware } from "../middlewares/validationMiddleware";
import {
  clientProjectDraftCreateSchema,
  clientProjectDraftServicesSchema,
  clientProjectDraftIndustriesSchema,
  clientProjectDraftTechnologiesSchema,
  clientProjectDraftFeaturesSchema,
  clientProjectDraftDiscountSchema,
  clientProjectDraftTimelineSchema,
} from "../validation/zod";

const router = Router();

/**
 * @route   POST /api/v1/projects/draft/create
 * @desc    Step 1: Create draft with business details (auto-populates personal info from User)
 * @access  Private (CLIENT)
 */
router.post(
  "/create",
  authMiddleware.checkToken,
  validateDataMiddleware(clientProjectDraftCreateSchema),
  clientProjectDraftController.createDraft,
);

/**
 * @route   GET /api/v1/projects/draft/my-drafts
 * @desc    Get all drafts for authenticated client
 * @access  Private (CLIENT)
 */
router.get(
  "/my-drafts",
  authMiddleware.checkToken,
  clientProjectDraftController.getMyDrafts,
);

/**
 * @route   GET /api/v1/projects/draft/:draftId
 * @desc    Get single draft by ID
 * @access  Private (CLIENT)
 */
router.get(
  "/:draftId",
  authMiddleware.checkToken,
  clientProjectDraftController.getDraft,
);

/**
 * @route   POST /api/v1/projects/draft/:draftId/services
 * @desc    Step 2: Add services to draft
 * @access  Private (CLIENT)
 */
router.post(
  "/:draftId/services",
  authMiddleware.checkToken,
  validateDataMiddleware(clientProjectDraftServicesSchema),
  clientProjectDraftController.addDraftServices,
);

/**
 * @route   POST /api/v1/projects/draft/:draftId/industries
 * @desc    Step 3: Add industries to draft
 * @access  Private (CLIENT)
 */
router.post(
  "/:draftId/industries",
  authMiddleware.checkToken,
  validateDataMiddleware(clientProjectDraftIndustriesSchema),
  clientProjectDraftController.addDraftIndustries,
);

/**
 * @route   POST /api/v1/projects/draft/:draftId/technologies
 * @desc    Step 4: Add technologies to draft
 * @access  Private (CLIENT)
 */
router.post(
  "/:draftId/technologies",
  authMiddleware.checkToken,
  validateDataMiddleware(clientProjectDraftTechnologiesSchema),
  clientProjectDraftController.addDraftTechnologies,
);

/**
 * @route   POST /api/v1/projects/draft/:draftId/features
 * @desc    Step 5: Add features to draft
 * @access  Private (CLIENT)
 */
router.post(
  "/:draftId/features",
  authMiddleware.checkToken,
  validateDataMiddleware(clientProjectDraftFeaturesSchema),
  clientProjectDraftController.addDraftFeatures,
);

/**
 * @route   POST /api/v1/projects/draft/:draftId/discount
 * @desc    Step 6: Add discount to draft
 * @access  Private (CLIENT)
 */
router.post(
  "/:draftId/discount",
  authMiddleware.checkToken,
  validateDataMiddleware(clientProjectDraftDiscountSchema),
  clientProjectDraftController.addDraftDiscount,
);

/**
 * @route   POST /api/v1/projects/draft/:draftId/timeline
 * @desc    Step 7: Add timeline to draft (Auto-calculates estimate)
 * @access  Private (CLIENT)
 */
router.post(
  "/:draftId/timeline",
  authMiddleware.checkToken,
  validateDataMiddleware(clientProjectDraftTimelineSchema),
  clientProjectDraftController.addDraftTimeline,
);

/**
 * @route   GET /api/v1/projects/draft/:draftId/estimate
 * @desc    Get draft estimate details
 * @access  Private (CLIENT)
 */
router.get(
  "/:draftId/estimate",
  authMiddleware.checkToken,
  clientProjectDraftController.getDraftEstimate,
);

/**
 * @route   POST /api/v1/projects/draft/:draftId/estimate/accept
 * @desc    Accept draft estimate
 * @access  Private (CLIENT)
 */
router.post(
  "/:draftId/estimate/accept",
  authMiddleware.checkToken,
  clientProjectDraftController.acceptDraftEstimate,
);

/**
 * @route   POST /api/v1/projects/draft/:draftId/service-agreement
 * @desc    Step 8: Generate and accept service agreement (auto-generates PDF)
 * @access  Private (CLIENT)
 */
router.post(
  "/:draftId/service-agreement",
  authMiddleware.checkToken,
  clientProjectDraftController.addDraftServiceAgreement,
);

/**
 * @route   POST /api/v1/projects/draft/:draftId/finalize
 * @desc    Finalize draft and create actual project
 * @access  Private (CLIENT)
 */
router.post(
  "/:draftId/finalize",
  authMiddleware.checkToken,
  clientProjectDraftController.finalizeDraft,
);

/**
 * @route   DELETE /api/v1/projects/draft/:draftId
 * @desc    Delete a draft
 * @access  Private (CLIENT)
 */
router.delete(
  "/:draftId",
  authMiddleware.checkToken,
  clientProjectDraftController.deleteDraft,
);

export default router;
