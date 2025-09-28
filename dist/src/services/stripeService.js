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
exports.StripeService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = require("../config/config");
const stripe = new stripe_1.default(config_1.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
});
class StripeService {
    static createPaymentIntent(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const paymentIntentData = {
                    amount: data.amount,
                    currency: data.currency,
                    automatic_payment_methods: {
                        enabled: true,
                    },
                    metadata: Object.assign(Object.assign({}, data.metadata), { customer_email: data.customerEmail }),
                };
                if (data.description) {
                    paymentIntentData.description = data.description;
                }
                const paymentIntent = yield stripe.paymentIntents.create(paymentIntentData);
                return paymentIntent;
            }
            catch (error) {
                console.error("Error creating payment intent:", error);
                throw new Error("Failed to create payment intent");
            }
        });
    }
    static createCheckoutSession(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = yield stripe.checkout.sessions.create({
                    payment_method_types: ["card"],
                    line_items: [
                        {
                            price_data: {
                                currency: data.currency || "usd",
                                product_data: {
                                    name: data.description || "Service Payment",
                                },
                                unit_amount: data.amount,
                            },
                            quantity: 1,
                        },
                    ],
                    mode: "payment",
                    success_url: data.successUrl,
                    cancel_url: data.cancelUrl,
                    metadata: Object.assign(Object.assign({}, data.metadata), { customer_email: data.customerEmail }),
                });
                return session;
            }
            catch (error) {
                console.error("Error creating checkout session:", error);
                throw new Error("Failed to create checkout session");
            }
        });
    }
    static getPaymentIntent(paymentIntentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const paymentIntent = yield stripe.paymentIntents.retrieve(paymentIntentId);
                return paymentIntent;
            }
            catch (error) {
                console.error("Error retrieving payment intent:", error);
                throw new Error("Failed to retrieve payment intent");
            }
        });
    }
    static getCheckoutSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = yield stripe.checkout.sessions.retrieve(sessionId);
                return session;
            }
            catch (error) {
                console.error("Error retrieving checkout session:", error);
                throw new Error("Failed to retrieve checkout session");
            }
        });
    }
    static createCustomer(email, name, phone) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const customerData = { email };
                if (name)
                    customerData.name = name;
                if (phone)
                    customerData.phone = phone;
                const customer = yield stripe.customers.create(customerData);
                return customer;
            }
            catch (error) {
                console.error("Error creating customer:", error);
                throw new Error("Failed to create customer");
            }
        });
    }
    static getCustomer(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const customer = (yield stripe.customers.retrieve(customerId));
                return customer;
            }
            catch (error) {
                console.error("Error retrieving customer:", error);
                throw new Error("Failed to retrieve customer");
            }
        });
    }
    static createRefund(paymentIntentId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refundData = {
                    payment_intent: paymentIntentId,
                };
                if (amount)
                    refundData.amount = amount;
                const refund = yield stripe.refunds.create(refundData);
                return refund;
            }
            catch (error) {
                console.error("Error creating refund:", error);
                throw new Error("Failed to create refund");
            }
        });
    }
    static verifyWebhookSignature(payload, signature, secret) {
        try {
            const event = stripe.webhooks.constructEvent(payload, signature, secret);
            return event;
        }
        catch (error) {
            console.error("Error verifying webhook signature:", error);
            throw new Error("Invalid webhook signature");
        }
    }
    static listPaymentIntents(customerId_1) {
        return __awaiter(this, arguments, void 0, function* (customerId, limit = 10) {
            try {
                const listParams = { limit };
                if (customerId)
                    listParams.customer = customerId;
                const paymentIntents = yield stripe.paymentIntents.list(listParams);
                return paymentIntents.data;
            }
            catch (error) {
                console.error("Error listing payment intents:", error);
                throw new Error("Failed to list payment intents");
            }
        });
    }
}
exports.StripeService = StripeService;
exports.default = StripeService;
