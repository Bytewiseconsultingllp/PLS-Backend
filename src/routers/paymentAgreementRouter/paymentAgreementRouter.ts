/**
 * Payment Agreement Router
 *
 * Routes for managing milestone payment agreements (Admin/Moderator only)
 */

import { Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware";
import { validateDataMiddleware } from "../../middlewares/validationMiddleware";
import {
  createPaymentAgreementSchema,
  updatePaymentAgreementSchema,
} from "../../validation/zod";
import paymentAgreementController from "../../controllers/paymentAgreementController/paymentAgreementController";

const paymentAgreementRouter = Router();

// ============================================
// MILESTONE-SPECIFIC ROUTES
// ============================================

/**
 * @route POST /api/v1/admin/projects/:projectId/milestones/:milestoneId/payment-agreement
 * @desc Create payment agreement for a milestone
 * @access Admin, Assigned Moderator
 */
paymentAgreementRouter.post(
  "/projects/:projectId/milestones/:milestoneId/payment-agreement",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIAdminOrModerator,
  validateDataMiddleware(createPaymentAgreementSchema),
  paymentAgreementController.createPaymentAgreement,
);

/**
 * @route GET /api/v1/admin/projects/:projectId/milestones/:milestoneId/payment-agreement
 * @desc Get payment agreement for a milestone
 * @access Admin, Assigned Moderator
 */
paymentAgreementRouter.get(
  "/projects/:projectId/milestones/:milestoneId/payment-agreement",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIAdminOrModerator,
  paymentAgreementController.getPaymentAgreementByMilestone,
);

/**
 * @route PATCH /api/v1/admin/projects/:projectId/milestones/:milestoneId/payment-agreement
 * @desc Update payment agreement for a milestone
 * @access Admin, Assigned Moderator
 */
paymentAgreementRouter.patch(
  "/projects/:projectId/milestones/:milestoneId/payment-agreement",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIAdminOrModerator,
  validateDataMiddleware(updatePaymentAgreementSchema),
  paymentAgreementController.updatePaymentAgreement,
);

/**
 * @route DELETE /api/v1/admin/projects/:projectId/milestones/:milestoneId/payment-agreement
 * @desc Delete payment agreement for a milestone
 * @access Admin only
 */
paymentAgreementRouter.delete(
  "/projects/:projectId/milestones/:milestoneId/payment-agreement",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIsAdmin,
  paymentAgreementController.deletePaymentAgreement,
);

// ============================================
// PROJECT-LEVEL ROUTES
// ============================================

/**
 * @route GET /api/v1/admin/projects/:projectId/payment-agreements
 * @desc Get all payment agreements for a project
 * @access Admin, Assigned Moderator
 */
paymentAgreementRouter.get(
  "/projects/:projectId/payment-agreements",
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIAdminOrModerator,
  paymentAgreementController.getPaymentAgreementsByProject,
);

export default paymentAgreementRouter;
