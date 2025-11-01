/* eslint-disable camelcase */
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../config/config";

// Initialize Stripe with secret key
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export interface CreatePaymentIntentData {
  amount: number; // Amount in cents
  currency: string;
  customerEmail: string;
  customerName?: string | undefined;
  customerPhone?: string | undefined;
  description?: string | undefined;
  metadata?: Record<string, string> | undefined;
}

export interface CreateCheckoutSessionData {
  amount: number; // Amount in cents
  currency: string;
  customerEmail: string;
  customerName?: string | undefined;
  successUrl: string;
  cancelUrl: string;
  description?: string | undefined;
  metadata?: Record<string, string> | undefined;
}

export class StripeService {
  /**
   * Create a payment intent for server-side payment processing
   */
  static async createPaymentIntent(
    data: CreatePaymentIntentData,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntentData: Stripe.PaymentIntentCreateParams = {
        amount: data.amount,
        currency: data.currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          ...data.metadata,
          customer_email: data.customerEmail,
        },
      };

      if (data.description) {
        paymentIntentData.description = data.description;
      }

      const paymentIntent =
        await stripe.paymentIntents.create(paymentIntentData);

      return paymentIntent;
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw new Error("Failed to create payment intent");
    }
  }

  /**
   * Create a checkout session for client-side payment processing
   */
  static async createCheckoutSession(
    data: CreateCheckoutSessionData,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await stripe.checkout.sessions.create({
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
        metadata: {
          ...data.metadata,
          customer_email: data.customerEmail,
        },
      });

      return session;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw new Error("Failed to create checkout session");
    }
  }

  /**
   * Retrieve a payment intent by ID
   */
  static async getPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error("Error retrieving payment intent:", error);
      throw new Error("Failed to retrieve payment intent");
    }
  }

  /**
   * Retrieve a checkout session by ID
   */
  static async getCheckoutSession(
    sessionId: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      console.error("Error retrieving checkout session:", error);
      throw new Error("Failed to retrieve checkout session");
    }
  }

  /**
   * Create a customer in Stripe
   */
  static async createCustomer(
    email: string,
    name?: string,
    phone?: string,
  ): Promise<Stripe.Customer> {
    try {
      const customerData: Stripe.CustomerCreateParams = { email };
      if (name) customerData.name = name;
      if (phone) customerData.phone = phone;

      const customer = await stripe.customers.create(customerData);
      return customer;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw new Error("Failed to create customer");
    }
  }

  /**
   * Retrieve a customer by ID
   */
  static async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = (await stripe.customers.retrieve(
        customerId,
      )) as Stripe.Customer;
      return customer;
    } catch (error) {
      console.error("Error retrieving customer:", error);
      throw new Error("Failed to retrieve customer");
    }
  }

  /**
   * Create a refund for a payment intent
   */
  static async createRefund(
    paymentIntentId: string,
    amount?: number,
  ): Promise<Stripe.Refund> {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };
      if (amount) refundData.amount = amount;

      const refund = await stripe.refunds.create(refundData);
      return refund;
    } catch (error) {
      console.error("Error creating refund:", error);
      throw new Error("Failed to create refund");
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string,
  ): Stripe.Event {
    try {
      const event = stripe.webhooks.constructEvent(payload, signature, secret);
      return event;
    } catch (error) {
      console.error("Error verifying webhook signature:", error);
      throw new Error("Invalid webhook signature");
    }
  }

  /**
   * List all payment intents for a customer
   */
  static async listPaymentIntents(
    customerId?: string,
    limit: number = 10,
  ): Promise<Stripe.PaymentIntent[]> {
    try {
      const listParams: Stripe.PaymentIntentListParams = { limit };
      if (customerId) listParams.customer = customerId;

      const paymentIntents = await stripe.paymentIntents.list(listParams);
      return paymentIntents.data;
    } catch (error) {
      console.error("Error listing payment intents:", error);
      throw new Error("Failed to list payment intents");
    }
  }
}

export default StripeService;
