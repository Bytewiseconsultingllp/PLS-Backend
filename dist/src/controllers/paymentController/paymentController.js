"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const client_1 = require("@prisma/client");
const stripeService_1 = __importDefault(require("../../services/stripeService"));
const config_1 = require("../../config/config");
const loggerUtils_1 = __importDefault(require("../../utils/loggerUtils"));
const prisma = new client_1.PrismaClient();
class PaymentController {
    static createPaymentIntent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const body = req.body;
                const { amount, currency, customerEmail, customerName, customerPhone, description, metadata, } = body;
                const userId = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
                const paymentIntent = yield stripeService_1.default.createPaymentIntent({
                    amount,
                    currency: currency || "usd",
                    customerEmail,
                    customerName,
                    customerPhone,
                    description,
                    metadata,
                });
                const paymentData = {
                    stripePaymentIntentId: paymentIntent.id,
                    amount,
                    currency: currency || "usd",
                    clientEmail: customerEmail,
                    status: "PENDING",
                    metadata: metadata || {},
                };
                if (userId)
                    paymentData.userId = userId;
                if (customerName)
                    paymentData.clientName = customerName;
                if (customerPhone)
                    paymentData.clientPhone = customerPhone;
                if (description)
                    paymentData.description = description;
                const payment = yield prisma.payment.create({
                    data: paymentData,
                });
                loggerUtils_1.default.info(`Payment intent created: ${paymentIntent.id}`, {
                    paymentId: payment.id,
                    userId,
                    amount,
                    customerEmail,
                });
                res.status(201).json({
                    success: true,
                    message: "Payment intent created successfully",
                    data: {
                        paymentId: payment.id,
                        clientSecret: paymentIntent.client_secret,
                        paymentIntentId: paymentIntent.id,
                    },
                });
            }
            catch (error) {
                loggerUtils_1.default.error("Error creating payment intent:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to create payment intent",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    static createCheckoutSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const body = req.body;
                const { amount, currency, customerEmail, customerName, successUrl, cancelUrl, description, metadata, } = body;
                const userId = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
                const session = yield stripeService_1.default.createCheckoutSession({
                    amount,
                    currency: currency || "usd",
                    customerEmail,
                    customerName,
                    successUrl,
                    cancelUrl,
                    description,
                    metadata,
                });
                const paymentData = {
                    stripeSessionId: session.id,
                    amount,
                    currency: currency || "usd",
                    clientEmail: customerEmail,
                    status: "PENDING",
                    metadata: metadata || {},
                };
                if (userId)
                    paymentData.userId = userId;
                if (customerName)
                    paymentData.clientName = customerName;
                if (description)
                    paymentData.description = description;
                const payment = yield prisma.payment.create({
                    data: paymentData,
                });
                loggerUtils_1.default.info(`Checkout session created: ${session.id}`, {
                    paymentId: payment.id,
                    userId,
                    amount,
                    customerEmail,
                });
                res.status(201).json({
                    success: true,
                    message: "Checkout session created successfully",
                    data: {
                        paymentId: payment.id,
                        sessionId: session.id,
                        url: session.url,
                    },
                });
            }
            catch (error) {
                loggerUtils_1.default.error("Error creating checkout session:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to create checkout session",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    static getPaymentIntentStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { paymentIntentId } = req.params;
                const paymentIntent = yield stripeService_1.default.getPaymentIntent(paymentIntentId);
                const payment = yield prisma.payment.findFirst({
                    where: {
                        stripePaymentIntentId: paymentIntentId,
                    },
                });
                if (!payment) {
                    res.status(404).json({
                        success: false,
                        message: "Payment not found",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Payment intent status retrieved successfully",
                    data: {
                        paymentId: payment.id,
                        status: paymentIntent.status,
                        amount: paymentIntent.amount,
                        currency: paymentIntent.currency,
                        clientSecret: paymentIntent.client_secret,
                    },
                });
            }
            catch (error) {
                loggerUtils_1.default.error("Error getting payment intent status:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to get payment intent status",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    static getCheckoutSessionStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sessionId } = req.params;
                const session = yield stripeService_1.default.getCheckoutSession(sessionId);
                const payment = yield prisma.payment.findFirst({
                    where: {
                        stripeSessionId: sessionId,
                    },
                });
                if (!payment) {
                    res.status(404).json({
                        success: false,
                        message: "Payment not found",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Checkout session status retrieved successfully",
                    data: {
                        paymentId: payment.id,
                        status: session.payment_status,
                        amount: session.amount_total,
                        currency: session.currency,
                        url: session.url,
                    },
                });
            }
            catch (error) {
                loggerUtils_1.default.error("Error getting checkout session status:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to get checkout session status",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    static handleWebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const signature = req.headers["stripe-signature"];
                const payload = req.body;
                if (!signature) {
                    res.status(400).json({
                        success: false,
                        message: "Missing stripe-signature header",
                    });
                    return;
                }
                const event = stripeService_1.default.verifyWebhookSignature(payload, signature, config_1.STRIPE_WEBHOOK_SECRET);
                loggerUtils_1.default.info(`Received webhook event: ${event.type}`, {
                    eventId: event.id,
                    type: event.type,
                });
                switch (event.type) {
                    case "payment_intent.succeeded":
                        yield handlePaymentIntentSucceeded(event);
                        break;
                    case "payment_intent.payment_failed":
                        yield handlePaymentIntentFailed(event);
                        break;
                    case "checkout.session.completed":
                        yield handleCheckoutSessionCompleted(event);
                        break;
                    case "checkout.session.expired":
                        yield handleCheckoutSessionExpired(event);
                        break;
                    default:
                        loggerUtils_1.default.info(`Unhandled event type: ${event.type}`);
                }
                res.status(200).json({ received: true });
            }
            catch (error) {
                loggerUtils_1.default.error("Error handling webhook:", error);
                res.status(400).json({
                    success: false,
                    message: "Webhook signature verification failed",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    static createRefund(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const { paymentIntentId, amount } = body;
                const refund = yield stripeService_1.default.createRefund(paymentIntentId, amount);
                yield prisma.payment.updateMany({
                    where: {
                        stripePaymentIntentId: paymentIntentId,
                    },
                    data: {
                        status: "REFUNDED",
                        refundedAt: new Date(),
                    },
                });
                loggerUtils_1.default.info(`Refund created: ${refund.id}`, {
                    paymentIntentId,
                    refundId: refund.id,
                    amount: refund.amount,
                });
                res.status(201).json({
                    success: true,
                    message: "Refund created successfully",
                    data: {
                        refundId: refund.id,
                        amount: refund.amount,
                        status: refund.status,
                    },
                });
            }
            catch (error) {
                loggerUtils_1.default.error("Error creating refund:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to create refund",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    static getPaymentHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { status, customerEmail, startDate, endDate, page = "1", limit = "10", } = req.query;
                const userId = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
                const pageNum = parseInt(page, 10);
                const limitNum = parseInt(limit, 10);
                const skip = (pageNum - 1) * limitNum;
                const where = {};
                if (userId) {
                    where.userId = userId;
                }
                if (status) {
                    where.status = status;
                }
                if (customerEmail) {
                    where.clientEmail = customerEmail;
                }
                if (startDate || endDate) {
                    where.createdAt = {};
                    if (startDate) {
                        where.createdAt.gte = new Date(startDate);
                    }
                    if (endDate) {
                        where.createdAt.lte = new Date(endDate);
                    }
                }
                const [payments, total] = yield Promise.all([
                    prisma.payment.findMany({
                        where,
                        skip,
                        take: limitNum,
                        orderBy: {
                            createdAt: "desc",
                        },
                    }),
                    prisma.payment.count({ where }),
                ]);
                res.status(200).json({
                    success: true,
                    message: "Payment history retrieved successfully",
                    data: {
                        payments,
                        pagination: {
                            page: pageNum,
                            limit: limitNum,
                            total,
                            pages: Math.ceil(total / limitNum),
                        },
                    },
                });
            }
            catch (error) {
                loggerUtils_1.default.error("Error getting payment history:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to get payment history",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
}
exports.PaymentController = PaymentController;
function handlePaymentIntentSucceeded(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const paymentIntent = event.data.object;
        yield prisma.payment.updateMany({
            where: {
                stripePaymentIntentId: paymentIntent.id,
            },
            data: {
                status: "SUCCEEDED",
                paidAt: new Date(),
            },
        });
        loggerUtils_1.default.info(`Payment succeeded: ${paymentIntent.id}`);
    });
}
function handlePaymentIntentFailed(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const paymentIntent = event.data.object;
        yield prisma.payment.updateMany({
            where: {
                stripePaymentIntentId: paymentIntent.id,
            },
            data: {
                status: "FAILED",
            },
        });
        loggerUtils_1.default.info(`Payment failed: ${paymentIntent.id}`);
    });
}
function handleCheckoutSessionCompleted(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = event.data.object;
        yield prisma.payment.updateMany({
            where: {
                stripeSessionId: session.id,
            },
            data: {
                status: "SUCCEEDED",
                paidAt: new Date(),
            },
        });
        loggerUtils_1.default.info(`Checkout session completed: ${session.id}`);
    });
}
function handleCheckoutSessionExpired(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = event.data.object;
        yield prisma.payment.updateMany({
            where: {
                stripeSessionId: session.id,
            },
            data: {
                status: "CANCELED",
            },
        });
        loggerUtils_1.default.info(`Checkout session expired: ${session.id}`);
    });
}
