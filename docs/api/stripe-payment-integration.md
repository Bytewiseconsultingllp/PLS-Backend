# Stripe Payment Integration

This document describes the Stripe payment integration implemented in the application.

## Overview

The payment system supports two main payment flows:

1. **Server-side Payment Processing** - Using Payment Intents for more control
2. **Client-side Payment Processing** - Using Checkout Sessions for simpler implementation

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_... # Your Stripe webhook secret
```

## API Endpoints

### 1. Create Payment Intent (Server-side)

**POST** `/api/v1/payment/create-payment-intent`

Creates a payment intent for server-side payment processing.

**Request Body:**

```json
{
  "amount": 2000, // Amount in cents ($20.00)
  "currency": "usd",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "description": "Service payment",
  "metadata": {
    "orderId": "12345"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment intent created successfully",
  "data": {
    "paymentId": "uuid",
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx"
  }
}
```

### 2. Create Checkout Session (Client-side)

**POST** `/api/v1/payment/create-checkout-session`

Creates a checkout session for client-side payment processing.

**Request Body:**

```json
{
  "amount": 2000, // Amount in cents ($20.00)
  "currency": "usd",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/cancel",
  "description": "Service payment",
  "metadata": {
    "orderId": "12345"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Checkout session created successfully",
  "data": {
    "paymentId": "uuid",
    "sessionId": "cs_xxx",
    "url": "https://checkout.stripe.com/xxx"
  }
}
```

### 3. Get Payment Status

**GET** `/api/v1/payment/payment-intent/{paymentIntentId}/status`

**GET** `/api/v1/payment/checkout-session/{sessionId}/status`

### 4. Payment History

**GET** `/api/v1/payment/history`

Query parameters:

- `status`: Filter by payment status
- `customerEmail`: Filter by customer email
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### 5. Create Refund

**POST** `/api/v1/payment/create-refund`

**Request Body:**

```json
{
  "paymentIntentId": "pi_xxx",
  "amount": 1000 // Optional: partial refund amount in cents
}
```

### 6. Webhook Endpoint

**POST** `/api/v1/payment/webhook`

This endpoint handles Stripe webhook events. Configure this URL in your Stripe dashboard.

## Frontend Integration

### Server-side Payment (Payment Intents)

```javascript
// 1. Create payment intent
const response = await fetch("/api/v1/payment/create-payment-intent", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer your-jwt-token",
  },
  body: JSON.stringify({
    amount: 2000, // $20.00
    customerEmail: "customer@example.com",
    customerName: "John Doe",
    description: "Service payment",
  }),
});

const { data } = await response.json();

// 2. Use Stripe.js to confirm payment
const stripe = Stripe("pk_test_...");
const { error } = await stripe.confirmPayment({
  clientSecret: data.clientSecret,
  confirmParams: {
    return_url: "https://yoursite.com/return",
  },
});
```

### Client-side Payment (Checkout Sessions)

```javascript
// 1. Create checkout session
const response = await fetch("/api/v1/payment/create-checkout-session", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer your-jwt-token",
  },
  body: JSON.stringify({
    amount: 2000, // $20.00
    customerEmail: "customer@example.com",
    customerName: "John Doe",
    successUrl: "https://yoursite.com/success",
    cancelUrl: "https://yoursite.com/cancel",
    description: "Service payment",
  }),
});

const { data } = await response.json();

// 2. Redirect to Stripe Checkout
window.location.href = data.url;
```

## Database Schema

The payment system uses the following Prisma model:

```prisma
model Payment {
  id                String        @id @default(uuid())
  userId            String?
  user              User?         @relation(fields: [userId], references: [uid])

  // Stripe related fields
  stripePaymentIntentId String?   @unique
  stripeSessionId       String?   @unique
  stripeCustomerId      String?

  // Payment details
  amount              Int           // Amount in cents
  currency            String        @default("usd")
  status              PaymentStatus @default(PENDING)
  paymentMethod       PaymentMethod @default(CARD)

  // Client information
  clientEmail         String
  clientName          String?
  clientPhone         String?

  // Payment metadata
  description         String?
  metadata            Json?

  // Timestamps
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
  paidAt              DateTime?
  refundedAt          DateTime?

  // Soft delete
  trashedBy           String?
  trashedAt           DateTime?
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  CANCELED
  REFUNDED
}

enum PaymentMethod {
  CARD
  BANK_TRANSFER
  WALLET
}
```

## Webhook Events

The system handles the following Stripe webhook events:

- `payment_intent.succeeded` - Updates payment status to SUCCEEDED
- `payment_intent.payment_failed` - Updates payment status to FAILED
- `checkout.session.completed` - Updates payment status to SUCCEEDED
- `checkout.session.expired` - Updates payment status to CANCELED

## Security Considerations

1. **Authentication**: All payment endpoints (except webhooks) require authentication
2. **Validation**: All input is validated using Zod schemas
3. **Webhook Verification**: Stripe webhook signatures are verified
4. **Rate Limiting**: Consider implementing rate limiting for payment endpoints
5. **Logging**: All payment activities are logged for audit purposes

## Testing

1. Use Stripe test keys for development
2. Test with Stripe's test card numbers
3. Use Stripe CLI for local webhook testing: `stripe listen --forward-to localhost:4000/api/v1/payment/webhook`

## Migration

After adding the payment model to your schema, run:

```bash
npx prisma migrate dev --name add_payment_model
npx prisma generate
```

## Error Handling

The system includes comprehensive error handling:

- Validation errors for invalid input
- Stripe API errors are caught and logged
- Database errors are handled gracefully
- Webhook signature verification failures

## Monitoring

Monitor the following:

- Payment success/failure rates
- Webhook delivery success
- Database performance for payment queries
- Stripe API response times
