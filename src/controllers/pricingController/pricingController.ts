/**
 * Pricing Controller
 *
 * Admin-only endpoints for managing pricing data
 */

import type { Response } from "express";
import type { _Request } from "../../middlewares/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandlerUtils";
import { httpResponse } from "../../utils/apiResponseUtils";
import pricingService from "../../services/pricingService";
import { SUCCESSCODE, NOTFOUNDCODE } from "../../constants";

// ============================================
// SERVICE CATEGORIES
// ============================================

/**
 * Get all service categories
 * GET /api/v1/admin/pricing/categories
 */
export const getAllServiceCategories = asyncHandler(
  async (req: _Request, res: Response) => {
    const categories = await pricingService.getAllServiceCategories();

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Service categories retrieved successfully",
      categories,
    );
  },
);

/**
 * Get a single service category
 * GET /api/v1/admin/pricing/categories/:id
 */
export const getServiceCategoryById = asyncHandler(
  async (req: _Request, res: Response) => {
    const { id } = req.params;

    const category = await pricingService.getServiceCategoryById(id!);

    if (!category) {
      throw {
        status: NOTFOUNDCODE,
        message: "Service category not found",
      };
    }

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Service category retrieved successfully",
      category,
    );
  },
);

/**
 * Update a service category
 * PATCH /api/v1/admin/pricing/categories/:id
 */
export const updateServiceCategory = asyncHandler(
  async (req: _Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    const updated = await pricingService.updateServiceCategory(id!, data);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Service category updated successfully",
      updated,
    );
  },
);

/**
 * Bulk update service categories
 * PATCH /api/v1/admin/pricing/categories/bulk
 */
export const bulkUpdateServiceCategories = asyncHandler(
  async (req: _Request, res: Response) => {
    const { updates } = req.body;

    const results = await pricingService.bulkUpdateServiceCategories(updates);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      `${results.length} service categories updated successfully`,
      results,
    );
  },
);

// ============================================
// TECHNOLOGIES
// ============================================

/**
 * Get all technologies
 * GET /api/v1/admin/pricing/technologies
 */
export const getAllTechnologies = asyncHandler(
  async (req: _Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await pricingService.getAllTechnologies(page, limit);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Technologies retrieved successfully",
      result,
    );
  },
);

/**
 * Get a single technology
 * GET /api/v1/admin/pricing/technologies/:id
 */
export const getTechnologyById = asyncHandler(
  async (req: _Request, res: Response) => {
    const { id } = req.params;

    const technology = await pricingService.getTechnologyById(id!);

    if (!technology) {
      throw {
        status: NOTFOUNDCODE,
        message: "Technology not found",
      };
    }

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Technology retrieved successfully",
      technology,
    );
  },
);

/**
 * Create a new technology
 * POST /api/v1/admin/pricing/technologies
 */
export const createTechnology = asyncHandler(
  async (req: _Request, res: Response) => {
    const data = req.body;

    const technology = await pricingService.createTechnology(data);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Technology created successfully",
      technology,
    );
  },
);

/**
 * Update a technology
 * PATCH /api/v1/admin/pricing/technologies/:id
 */
export const updateTechnology = asyncHandler(
  async (req: _Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    const updated = await pricingService.updateTechnology(id!, data);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Technology updated successfully",
      updated,
    );
  },
);

/**
 * Delete a technology
 * DELETE /api/v1/admin/pricing/technologies/:id
 */
export const deleteTechnology = asyncHandler(
  async (req: _Request, res: Response) => {
    const { id } = req.params;

    await pricingService.deleteTechnology(id!);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Technology deleted successfully",
      null,
    );
  },
);

/**
 * Bulk update technologies
 * PATCH /api/v1/admin/pricing/technologies/bulk
 */
export const bulkUpdateTechnologies = asyncHandler(
  async (req: _Request, res: Response) => {
    const { updates } = req.body;

    const results = await pricingService.bulkUpdateTechnologies(updates);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      `${results.length} technologies updated successfully`,
      results,
    );
  },
);

// ============================================
// FEATURES
// ============================================

/**
 * Get all features
 * GET /api/v1/admin/pricing/features
 */
export const getAllFeatures = asyncHandler(
  async (req: _Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await pricingService.getAllFeatures(page, limit);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Features retrieved successfully",
      result,
    );
  },
);

/**
 * Get a single feature
 * GET /api/v1/admin/pricing/features/:id
 */
export const getFeatureById = asyncHandler(
  async (req: _Request, res: Response) => {
    const { id } = req.params;

    const feature = await pricingService.getFeatureById(id!);

    if (!feature) {
      throw {
        status: NOTFOUNDCODE,
        message: "Feature not found",
      };
    }

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Feature retrieved successfully",
      feature,
    );
  },
);

/**
 * Create a new feature
 * POST /api/v1/admin/pricing/features
 */
export const createFeature = asyncHandler(
  async (req: _Request, res: Response) => {
    const data = req.body;

    const feature = await pricingService.createFeature(data);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Feature created successfully",
      feature,
    );
  },
);

/**
 * Update a feature
 * PATCH /api/v1/admin/pricing/features/:id
 */
export const updateFeature = asyncHandler(
  async (req: _Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    const updated = await pricingService.updateFeature(id!, data);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Feature updated successfully",
      updated,
    );
  },
);

/**
 * Delete a feature
 * DELETE /api/v1/admin/pricing/features/:id
 */
export const deleteFeature = asyncHandler(
  async (req: _Request, res: Response) => {
    const { id } = req.params;

    await pricingService.deleteFeature(id!);

    httpResponse(req, res, SUCCESSCODE, "Feature deleted successfully", null);
  },
);

/**
 * Bulk update features
 * PATCH /api/v1/admin/pricing/features/bulk
 */
export const bulkUpdateFeatures = asyncHandler(
  async (req: _Request, res: Response) => {
    const { updates } = req.body;

    const results = await pricingService.bulkUpdateFeatures(updates);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      `${results.length} features updated successfully`,
      results,
    );
  },
);

// ============================================
// EXPORTS
// ============================================

export default {
  // Service Categories
  getAllServiceCategories,
  getServiceCategoryById,
  updateServiceCategory,
  bulkUpdateServiceCategories,

  // Technologies
  getAllTechnologies,
  getTechnologyById,
  createTechnology,
  updateTechnology,
  deleteTechnology,
  bulkUpdateTechnologies,

  // Features
  getAllFeatures,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature,
  bulkUpdateFeatures,
};
