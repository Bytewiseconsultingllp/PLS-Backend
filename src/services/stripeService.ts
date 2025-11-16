/* eslint-disable camelcase */
import Stripe from "stripe";
import { STRIPE_SECRET_KEY, STRIPE_CONNECT_CLIENT_ID } from "../config/config";

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
      if (error instanceof Error) {
        throw error;
      }
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
      // Pass through the actual Stripe error message
      if (error instanceof Error) {
        throw error;
      }
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
      if (error instanceof Error) {
        throw error;
      }
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
      if (error instanceof Error) {
        throw error;
      }
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
      console.error("Signature received:", signature);
      console.error(
        "Secret prefix:",
        secret ? secret.substring(0, 30) + "..." : "undefined",
      );
      console.error("Payload type:", typeof payload);
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

  /**
   * Create a Stripe Connect account link for onboarding
   * Used to connect freelancers to receive payouts
   */
  static async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<Stripe.AccountLink> {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: "account_onboarding",
      });
      return accountLink;
    } catch (error) {
      console.error("Error creating account link:", error);
      throw new Error("Failed to create account link");
    }
  }

  /**
   * Create a Stripe Connect account for a freelancer
   */
  static async createConnectAccount(
    email: string,
    country: string = "US",
  ): Promise<Stripe.Account> {
    try {
      const account = await stripe.accounts.create({
        type: "express",
        email,
        country,
        capabilities: {
          transfers: { requested: true },
        },
      });
      return account;
    } catch (error) {
      console.error("Error creating connect account:", error);
      throw new Error("Failed to create connect account");
    }
  }

  /**
   * Retrieve a Stripe Connect account
   */
  static async getConnectAccount(accountId: string): Promise<Stripe.Account> {
    try {
      const account = await stripe.accounts.retrieve(accountId);
      return account;
    } catch (error) {
      console.error("Error retrieving connect account:", error);
      throw new Error("Failed to retrieve connect account");
    }
  }

  /**
   * Create a transfer to a connected account (for payouts to freelancers)
   */
  static async createTransfer(
    amount: number, // Amount in cents
    currency: string,
    destination: string, // Stripe Connect account ID
    description?: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Transfer> {
    try {
      const transferData: Stripe.TransferCreateParams = {
        amount,
        currency,
        destination,
      };

      if (description) transferData.description = description;
      if (metadata) transferData.metadata = metadata;

      const transfer = await stripe.transfers.create(transferData);
      return transfer;
    } catch (error) {
      console.error("Error creating transfer:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to create transfer");
    }
  }

  /**
   * Retrieve a transfer
   */
  static async getTransfer(transferId: string): Promise<Stripe.Transfer> {
    try {
      const transfer = await stripe.transfers.retrieve(transferId);
      return transfer;
    } catch (error) {
      console.error("Error retrieving transfer:", error);
      throw new Error("Failed to retrieve transfer");
    }
  }

  /**
   * List transfers
   */
  static async listTransfers(
    destination?: string,
    limit: number = 10,
  ): Promise<Stripe.Transfer[]> {
    try {
      const listParams: Stripe.TransferListParams = { limit };
      if (destination) listParams.destination = destination;

      const transfers = await stripe.transfers.list(listParams);
      return transfers.data;
    } catch (error) {
      console.error("Error listing transfers:", error);
      throw new Error("Failed to list transfers");
    }
  }

  /**
   * Cancel a transfer (must be done before funds are paid out)
   */
  static async cancelTransfer(transferId: string): Promise<Stripe.Transfer> {
    try {
      // Note: Transfers can only be reversed using reverseTransfer
      // This method retrieves the transfer to check if it can be reversed
      const transfer = await stripe.transfers.retrieve(transferId);
      if (transfer.reversed) {
        throw new Error("Transfer already reversed");
      }
      return transfer;
    } catch (error) {
      console.error("Error canceling transfer:", error);
      throw new Error("Failed to cancel transfer");
    }
  }

  /**
   * Reverse a transfer (refund to platform)
   */
  static async reverseTransfer(
    transferId: string,
    amount?: number,
    description?: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.TransferReversal> {
    try {
      const reversalData: Stripe.TransferReversalCreateParams = {};

      if (amount) reversalData.amount = amount;
      if (description) reversalData.description = description;
      if (metadata) reversalData.metadata = metadata;

      const reversal = await stripe.transfers.createReversal(
        transferId,
        reversalData,
      );
      return reversal;
    } catch (error) {
      console.error("Error reversing transfer:", error);
      throw new Error("Failed to reverse transfer");
    }
  }

  /**
   * Get balance for connected account
   */
  static async getAccountBalance(accountId: string): Promise<Stripe.Balance> {
    try {
      const balance = await stripe.balance.retrieve({
        stripeAccount: accountId,
      });
      return balance;
    } catch (error) {
      console.error("Error retrieving account balance:", error);
      throw new Error("Failed to retrieve account balance");
    }
  }

  // ============================================
  // STRIPE CONNECT OAUTH METHODS
  // ============================================

  /**
   * Exchange authorization code for Stripe Connect account access
   * This is called after the freelancer authorizes the connection
   */
  static async exchangeOAuthCode(code: string): Promise<Stripe.OAuthToken> {
    try {
      const response = await stripe.oauth.token({
        grant_type: "authorization_code",
        code,
      });
      return response;
    } catch (error) {
      console.error("Error exchanging OAuth code:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to exchange OAuth code");
    }
  }

  /**
   * Deauthorize a connected account (disconnect)
   * This revokes the platform's access to the connected account
   */
  static async deauthorizeAccount(
    stripeAccountId: string,
  ): Promise<Stripe.OAuthDeauthorization> {
    try {
      const response = await stripe.oauth.deauthorize({
        client_id: STRIPE_CONNECT_CLIENT_ID,
        stripe_user_id: stripeAccountId,
      });
      return response;
    } catch (error) {
      console.error("Error deauthorizing account:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to deauthorize account");
    }
  }

  /**
   * Generate OAuth authorization URL for Stripe Connect
   * Freelancer will be redirected to this URL to authorize the connection
   */
  static generateOAuthUrl(params: {
    clientId: string;
    redirectUri: string;
    state: string;
    userEmail?: string;
    userCountry?: string;
  }): string {
    const queryParams = new URLSearchParams({
      response_type: "code",
      client_id: params.clientId,
      state: params.state,
      scope: "read_write",
      redirect_uri: params.redirectUri,
    });

    // Add optional user prefill data
    if (params.userEmail) {
      queryParams.append("stripe_user[email]", params.userEmail);
    }
    if (params.userCountry) {
      queryParams.append("stripe_user[country]", params.userCountry);
    }

    return `https://connect.stripe.com/oauth/authorize?${queryParams.toString()}`;
  }
}

export default StripeService;
