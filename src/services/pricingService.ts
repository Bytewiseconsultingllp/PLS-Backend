/**
 * Pricing Service
 *
 * Handles CRUD operations for pricing data (Service Categories, Technologies, Features)
 * Used for calculating project estimates
 */

import { db } from "../database/db";

// ============================================
// SERVICE CATEGORIES
// ============================================

/**
 * Get all service categories
 */
export const getAllServiceCategories = async () => {
  return await db.pricingServiceCategory.findMany({
    orderBy: {
      category: "asc",
    },
  });
};

/**
 * Get a single service category
 */
export const getServiceCategoryById = async (id: string) => {
  return await db.pricingServiceCategory.findUnique({
    where: { id },
  });
};

/**
 * Update a service category
 */
export const updateServiceCategory = async (
  id: string,
  data: {
    basePrice?: number;
    description?: string;
  },
) => {
  return await db.pricingServiceCategory.update({
    where: { id },
    data,
  });
};

// ============================================
// TECHNOLOGIES
// ============================================

/**
 * Get all technologies
 */
export const getAllTechnologies = async (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;

  const [technologies, total] = await Promise.all([
    db.pricingTechnology.findMany({
      skip,
      take: limit,
      orderBy: {
        technology: "asc",
      },
    }),
    db.pricingTechnology.count(),
  ]);

  return {
    technologies,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single technology
 */
export const getTechnologyById = async (id: string) => {
  return await db.pricingTechnology.findUnique({
    where: { id },
  });
};

/**
 * Create a new technology
 */
export const createTechnology = async (data: {
  technology: string;
  additionalCost: number;
}) => {
  return await db.pricingTechnology.create({
    data,
  });
};

/**
 * Update a technology
 */
export const updateTechnology = async (
  id: string,
  data: {
    technology?: string;
    additionalCost?: number;
  },
) => {
  return await db.pricingTechnology.update({
    where: { id },
    data,
  });
};

/**
 * Delete a technology
 */
export const deleteTechnology = async (id: string) => {
  return await db.pricingTechnology.delete({
    where: { id },
  });
};

// ============================================
// FEATURES
// ============================================

/**
 * Get all features
 */
export const getAllFeatures = async (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;

  const [features, total] = await Promise.all([
    db.pricingFeature.findMany({
      skip,
      take: limit,
      orderBy: {
        feature: "asc",
      },
    }),
    db.pricingFeature.count(),
  ]);

  return {
    features,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single feature
 */
export const getFeatureById = async (id: string) => {
  return await db.pricingFeature.findUnique({
    where: { id },
  });
};

/**
 * Create a new feature
 */
export const createFeature = async (data: {
  feature: string;
  additionalCost: number;
}) => {
  return await db.pricingFeature.create({
    data,
  });
};

/**
 * Update a feature
 */
export const updateFeature = async (
  id: string,
  data: {
    feature?: string;
    additionalCost?: number;
  },
) => {
  return await db.pricingFeature.update({
    where: { id },
    data,
  });
};

/**
 * Delete a feature
 */
export const deleteFeature = async (id: string) => {
  return await db.pricingFeature.delete({
    where: { id },
  });
};

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Bulk update service categories
 */
export const bulkUpdateServiceCategories = async (
  updates: Array<{ id: string; basePrice: number; description?: string }>,
) => {
  const results = await Promise.all(
    updates.map((update) =>
      db.pricingServiceCategory.update({
        where: { id: update.id },
        data: {
          basePrice: update.basePrice,
          description: update.description,
        },
      }),
    ),
  );

  return results;
};

/**
 * Bulk update technologies
 */
export const bulkUpdateTechnologies = async (
  updates: Array<{ id: string; additionalCost: number; technology?: string }>,
) => {
  const results = await Promise.all(
    updates.map((update) =>
      db.pricingTechnology.update({
        where: { id: update.id },
        data: {
          additionalCost: update.additionalCost,
          technology: update.technology,
        },
      }),
    ),
  );

  return results;
};

/**
 * Bulk update features
 */
export const bulkUpdateFeatures = async (
  updates: Array<{ id: string; additionalCost: number; feature?: string }>,
) => {
  const results = await Promise.all(
    updates.map((update) =>
      db.pricingFeature.update({
        where: { id: update.id },
        data: {
          additionalCost: update.additionalCost,
          feature: update.feature,
        },
      }),
    ),
  );

  return results;
};

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
