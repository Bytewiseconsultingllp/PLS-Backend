/**
 * KPI Router
 *
 * Routes for KPI management endpoints
 */

import { Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware";
import { validateDataMiddleware } from "../../middlewares/validationMiddleware";
import { assignKPIPointsSchema } from "../../validation/zod";
import kpiController from "../../controllers/kpiController/kpiController";

const kpiRouter = Router();

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @route POST /api/v1/admin/freelancers/:freelancerId/kpi
 * @desc Assign KPI points to a freelancer (Admin only)
 * @access Admin
 */
kpiRouter.post(
  "/freelancers/:freelancerId/kpi",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIsAdmin,
  validateDataMiddleware(assignKPIPointsSchema),
  kpiController.assignKPIPointsAdmin,
);

// ============================================
// MODERATOR ROUTES
// ============================================

/**
 * @route POST /api/v1/moderator/freelancers/:freelancerId/kpi
 * @desc Assign KPI points to a freelancer (Moderator for their projects)
 * @access Moderator
 */
kpiRouter.post(
  "/moderator-kpi/freelancers/:freelancerId/kpi",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIAdminOrModerator,
  validateDataMiddleware(assignKPIPointsSchema),
  kpiController.assignKPIPointsModerator,
);

// ============================================
// CLIENT ROUTES
// ============================================

/**
 * @route POST /api/v1/client/freelancers/:freelancerId/kpi
 * @desc Assign KPI points to a freelancer (Client for their projects)
 * @access Client
 */
kpiRouter.post(
  "/client-kpi/freelancers/:freelancerId/kpi",
  authMiddleware.checkToken,
  validateDataMiddleware(assignKPIPointsSchema),
  kpiController.assignKPIPointsClient,
);

// ============================================
// PUBLIC/AUTHENTICATED ROUTES
// ============================================

/**
 * @route GET /api/v1/freelancers/leaderboard
 * @desc Get KPI leaderboard (top freelancers)
 * @access Public
 */
kpiRouter.get("/freelancers/leaderboard", kpiController.getKPILeaderboard);

/**
 * @route GET /api/v1/freelancers/:freelancerId/kpi
 * @desc Get KPI information for a freelancer
 * @access Public
 */
kpiRouter.get("/freelancers/:freelancerId/kpi", kpiController.getFreelancerKPI);

/**
 * @route GET /api/v1/freelancers/:freelancerId/kpi-history
 * @desc Get KPI history for a freelancer
 * @access Authenticated
 */
kpiRouter.get(
  "/freelancers/:freelancerId/kpi-history",
  authMiddleware.checkToken,
  kpiController.getKPIHistory,
);

export default kpiRouter;
