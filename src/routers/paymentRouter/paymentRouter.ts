import { Router } from "express";
import { PaymentController } from "../../controllers/paymentController/paymentController";
import { ProjectPaymentController } from "../../controllers/paymentController/projectPaymentController";
import { validateDataMiddleware } from "../../middlewares/validationMiddleware";
import authMiddleware from "../../middlewares/authMiddleware";
import {
  createPaymentIntentSchema,
  createCheckoutSessionSchema,
  createRefundSchema,
} from "../../validation/zod";

const paymentRouter: Router = Router();

// ** Payment Intent Routes (Server-side payment processing) **
paymentRouter.post(
  "/create-payment-intent",
  authMiddleware.checkToken,
  validateDataMiddleware(createPaymentIntentSchema),
  (req, res) => PaymentController.createPaymentIntent(req, res),
);

paymentRouter.get(
  "/payment-intent/:paymentIntentId/status",
  authMiddleware.checkToken,
  (req, res) => PaymentController.getPaymentIntentStatus(req, res),
);

// ** Checkout Session Routes (Client-side payment processing) **
paymentRouter.post(
  "/create-checkout-session",
  authMiddleware.checkToken,
  validateDataMiddleware(createCheckoutSessionSchema),
  (req, res) => PaymentController.createCheckoutSession(req, res),
);

paymentRouter.get(
  "/checkout-session/:sessionId/status",
  authMiddleware.checkToken,
  (req, res) => PaymentController.getCheckoutSessionStatus(req, res),
);

// ** Webhook Route (No authentication required for webhooks) **
paymentRouter.post("/webhook", (req, res) =>
  PaymentController.handleWebhook(req, res),
);

// ** Refund Routes **
paymentRouter.post(
  "/create-refund",
  authMiddleware.checkToken,
  validateDataMiddleware(createRefundSchema),
  (req, res) => PaymentController.createRefund(req, res),
);

// ** Payment History Routes **
paymentRouter.get("/history", authMiddleware.checkToken, (req, res) =>
  PaymentController.getPaymentHistory(req, res),
);

// ** Project Payment Routes **
paymentRouter.post(
  "/project/create-checkout-session",
  authMiddleware.checkToken,
  (req, res) => ProjectPaymentController.createProjectCheckoutSession(req, res),
);

paymentRouter.get(
  "/project/:projectId/status",
  authMiddleware.checkToken,
  (req, res) => ProjectPaymentController.getProjectPaymentStatus(req, res),
);

export { paymentRouter };
