/**
 * Pricing Router (Admin Only)
 *
 * Routes for managing pricing data: service categories, technologies, features
 */

import { Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware";
import { validateDataMiddleware } from "../../middlewares/validationMiddleware";
import {
  updateServiceCategorySchema,
  createTechnologySchema,
  updateTechnologySchema,
  createFeatureSchema,
  updateFeatureSchema,
  bulkUpdateServiceCategoriesSchema,
  bulkUpdateTechnologiesSchema,
  bulkUpdateFeaturesSchema,
} from "../../validation/zod";
import pricingController from "../../controllers/pricingController/pricingController";

const pricingRouter = Router();

// All routes require Admin authentication
pricingRouter.use(authMiddleware.checkToken);
pricingRouter.use(authMiddleware.checkIfUserIsAdmin);

// ============================================
// SERVICE CATEGORIES
// ============================================

/**
 * @route GET /api/v1/admin/pricing/categories
 * @desc Get all service categories
 * @access Admin
 */
pricingRouter.get("/categories", pricingController.getAllServiceCategories);

/**
 * @route GET /api/v1/admin/pricing/categories/:id
 * @desc Get a single service category
 * @access Admin
 */
pricingRouter.get("/categories/:id", pricingController.getServiceCategoryById);

/**
 * @route PATCH /api/v1/admin/pricing/categories/:id
 * @desc Update a service category
 * @access Admin
 */
pricingRouter.patch(
  "/categories/:id",
  validateDataMiddleware(updateServiceCategorySchema),
  pricingController.updateServiceCategory,
);

/**
 * @route PATCH /api/v1/admin/pricing/categories/bulk
 * @desc Bulk update service categories
 * @access Admin
 */
pricingRouter.patch(
  "/categories/bulk",
  validateDataMiddleware(bulkUpdateServiceCategoriesSchema),
  pricingController.bulkUpdateServiceCategories,
);

// ============================================
// TECHNOLOGIES
// ============================================

/**
 * @route GET /api/v1/admin/pricing/technologies
 * @desc Get all technologies (paginated)
 * @access Admin
 */
pricingRouter.get("/technologies", pricingController.getAllTechnologies);

/**
 * @route GET /api/v1/admin/pricing/technologies/:id
 * @desc Get a single technology
 * @access Admin
 */
pricingRouter.get("/technologies/:id", pricingController.getTechnologyById);

/**
 * @route POST /api/v1/admin/pricing/technologies
 * @desc Create a new technology
 * @access Admin
 */
pricingRouter.post(
  "/technologies",
  validateDataMiddleware(createTechnologySchema),
  pricingController.createTechnology,
);

/**
 * @route PATCH /api/v1/admin/pricing/technologies/:id
 * @desc Update a technology
 * @access Admin
 */
pricingRouter.patch(
  "/technologies/:id",
  validateDataMiddleware(updateTechnologySchema),
  pricingController.updateTechnology,
);

/**
 * @route DELETE /api/v1/admin/pricing/technologies/:id
 * @desc Delete a technology
 * @access Admin
 */
pricingRouter.delete("/technologies/:id", pricingController.deleteTechnology);

/**
 * @route PATCH /api/v1/admin/pricing/technologies/bulk
 * @desc Bulk update technologies
 * @access Admin
 */
pricingRouter.patch(
  "/technologies/bulk",
  validateDataMiddleware(bulkUpdateTechnologiesSchema),
  pricingController.bulkUpdateTechnologies,
);

// ============================================
// FEATURES
// ============================================

/**
 * @route GET /api/v1/admin/pricing/features
 * @desc Get all features (paginated)
 * @access Admin
 */
pricingRouter.get("/features", pricingController.getAllFeatures);

/**
 * @route GET /api/v1/admin/pricing/features/:id
 * @desc Get a single feature
 * @access Admin
 */
pricingRouter.get("/features/:id", pricingController.getFeatureById);

/**
 * @route POST /api/v1/admin/pricing/features
 * @desc Create a new feature
 * @access Admin
 */
pricingRouter.post(
  "/features",
  validateDataMiddleware(createFeatureSchema),
  pricingController.createFeature,
);

/**
 * @route PATCH /api/v1/admin/pricing/features/:id
 * @desc Update a feature
 * @access Admin
 */
pricingRouter.patch(
  "/features/:id",
  validateDataMiddleware(updateFeatureSchema),
  pricingController.updateFeature,
);

/**
 * @route DELETE /api/v1/admin/pricing/features/:id
 * @desc Delete a feature
 * @access Admin
 */
pricingRouter.delete("/features/:id", pricingController.deleteFeature);

/**
 * @route PATCH /api/v1/admin/pricing/features/bulk
 * @desc Bulk update features
 * @access Admin
 */
pricingRouter.patch(
  "/features/bulk",
  validateDataMiddleware(bulkUpdateFeaturesSchema),
  pricingController.bulkUpdateFeatures,
);

export default pricingRouter;
