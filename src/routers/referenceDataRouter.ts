import { Router } from "express";
import referenceDataController from "../controllers/referenceDataController";
import rateLimiterMiddleware from "../middlewares/rateLimiterMiddleware";

const router = Router();

/**
 * @route   GET /api/reference-data
 * @desc    Get all reference data (enums) for frontend
 * @access  Public
 * @swagger
 * /api/reference-data:
 *   get:
 *     summary: Get all reference data
 *     description: Returns all enum values for ServiceCategory, IndustryCategory, IndustrySubIndustry, TechnologyCategory, TechnologyItem, FeatureItem, and FeatureCategory
 *     tags: [Reference Data]
 *     responses:
 *       200:
 *         description: Reference data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Reference data retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     serviceCategories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                           label:
 *                             type: string
 *                           description:
 *                             type: string
 *                     industryCategories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                           label:
 *                             type: string
 *                           subIndustries:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 value:
 *                                   type: string
 *                                 label:
 *                                   type: string
 *                     technologyCategories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                           label:
 *                             type: string
 *                           technologies:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 value:
 *                                   type: string
 *                                 label:
 *                                   type: string
 *                     featureCategories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                           label:
 *                             type: string
 *                           features:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 value:
 *                                   type: string
 *                                 label:
 *                                   type: string
 */
router.get(
  "/",
  (req, res, next) =>
    rateLimiterMiddleware.handle(
      req,
      res,
      next,
      1,
      "Too many requests. Please try again in a few minutes.",
      50,
      300,
      "reference_data_all",
    ),
  referenceDataController.getAllReferenceData,
);

/**
 * @route   GET /api/reference-data/service-categories
 * @desc    Get only service categories
 * @access  Public
 */
router.get(
  "/service-categories",
  (req, res, next) =>
    rateLimiterMiddleware.handle(
      req,
      res,
      next,
      1,
      "Too many requests. Please try again in a few minutes.",
      50,
      300,
      "reference_data_services",
    ),
  referenceDataController.getServiceCategories,
);

/**
 * @route   GET /api/reference-data/industry-categories
 * @desc    Get only industry categories with sub-industries
 * @access  Public
 */
router.get(
  "/industry-categories",
  (req, res, next) =>
    rateLimiterMiddleware.handle(
      req,
      res,
      next,
      1,
      "Too many requests. Please try again in a few minutes.",
      50,
      300,
      "reference_data_industries",
    ),
  referenceDataController.getIndustryCategories,
);

/**
 * @route   GET /api/reference-data/technology-categories
 * @desc    Get only technology categories with items
 * @access  Public
 */
router.get(
  "/technology-categories",
  (req, res, next) =>
    rateLimiterMiddleware.handle(
      req,
      res,
      next,
      1,
      "Too many requests. Please try again in a few minutes.",
      50,
      300,
      "reference_data_technologies",
    ),
  referenceDataController.getTechnologyCategories,
);

/**
 * @route   GET /api/reference-data/feature-categories
 * @desc    Get only feature categories with items
 * @access  Public
 */
router.get(
  "/feature-categories",
  (req, res, next) =>
    rateLimiterMiddleware.handle(
      req,
      res,
      next,
      1,
      "Too many requests. Please try again in a few minutes.",
      50,
      300,
      "reference_data_features",
    ),
  referenceDataController.getFeatureCategories,
);

export default router;
