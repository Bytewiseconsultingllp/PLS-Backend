# Project Payment Integration Documentation

## Overview

This document describes the complete payment integration for the project creation flow. When a visitor registers and converts to a client, a project is created, and payment is initiated using Stripe Checkout Sessions.

## Flow Summary

```
Visitor → Register → Verify OTP → Auto-create Project (paymentStatus: PENDING)
→ Create Checkout Session → User pays → Webhook updates Project (paymentStatus: SUCCEEDED)
```

## Schema Changes

### Added to Project Model

```prisma
model Project {
  // ... existing fields

  // Payment tracking
  paymentStatus PaymentStatus @default(PENDING)

  // ... rest of model

  @@index([paymentStatus])
}
```

### PaymentStatus Enum (Already Existed)

```prisma
enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  CANCELED
  REFUNDED
}
```

## Database Migration

**IMPORTANT:** You need to run the following command to update your database:

```bash
cd /Users/ssingh83/Desktop/MONDAYTARGET/PLS-Backend
npx prisma migrate dev --name add_payment_status_to_project
```

Or if you're in production:

```bash
npx prisma migrate deploy
```

## New Services

### 1. ProjectPaymentService

**Location:** `src/services/projectPaymentService.ts`

**Methods:**

- `createProjectCheckoutSession(data)` - Creates a Stripe checkout session for a project
- `updateProjectPaymentStatus(projectId, status)` - Updates project payment status
- `getProjectPaymentStatus(projectId)` - Gets project payment status and history
- `isProjectPaid(projectId)` - Checks if project is paid

**Key Features:**

- Automatically retrieves payment amount from `ProjectEstimate.calculatedTotal`
- Converts amount from dollars to cents for Stripe
- Creates payment record in database
- Links payment to project, visitor, and user

## New Controllers

### ProjectPaymentController

**Location:** `src/controllers/paymentController/projectPaymentController.ts`

**Endpoints:**

#### 1. Create Project Checkout Session

**POST** `/api/v1/payments/project/create-checkout-session`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "projectId": "project-uuid",
  "successUrl": "https://yoursite.com/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://yoursite.com/payment/cancel",
  "currency": "usd" // optional, defaults to "usd"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Checkout session created successfully",
  "data": {
    "sessionId": "cs_test_...",
    "checkoutUrl": "https://checkout.stripe.com/c/pay/...",
    "paymentId": "payment-uuid"
  }
}
```

**Error Responses:**

- `400` - Missing required fields or project already paid
- `403` - User doesn't own the project
- `404` - Project not found
- `500` - Server error

---

#### 2. Get Project Payment Status

**GET** `/api/v1/payments/project/:projectId/status`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Payment status retrieved successfully",
  "data": {
    "paymentStatus": "SUCCEEDED",
    "payments": [
      {
        "id": "payment-uuid",
        "amount": 10000,
        "currency": "usd",
        "status": "SUCCEEDED",
        "createdAt": "2025-10-31T...",
        "paidAt": "2025-10-31T..."
      }
    ]
  }
}
```

## Updated Services

### VisitorConversionService

**Updated Method:** `convertVisitorToProject()`

**Changes:**

- Now accepts optional `paymentRedirectUrls` parameter
- Creates checkout session if redirect URLs provided
- Returns both project and checkoutSession data

**Usage Example:**

```typescript
const result = await visitorConversionService.convertVisitorToProject(
  visitorId,
  clientId,
  {
    successUrl: "https://yoursite.com/success",
    cancelUrl: "https://yoursite.com/cancel",
  },
);

// result = {
//   project: { ... },
//   checkoutSession: {
//     sessionId: "...",
//     checkoutUrl: "...",
//     paymentId: "..."
//   }
// }
```

## Webhook Updates

### Updated Webhook Handlers

All webhook handlers now update the project payment status:

1. **handlePaymentIntentSucceeded** - Updates project to `SUCCEEDED`
2. **handlePaymentIntentFailed** - Updates project to `FAILED`
3. **handleCheckoutSessionCompleted** - Updates project to `SUCCEEDED`
4. **handleCheckoutSessionExpired** - Updates project to `CANCELED`

**How it works:**

1. Webhook received from Stripe
2. Payment record updated in database
3. If payment has `projectId`, project payment status is updated
4. Log entry created

## Complete Integration Flow

### Frontend Integration

#### Step 1: User Registration & OTP Verification

```javascript
// 1. Register user
const registerResponse = await fetch("/api/v1/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "john_doe",
    fullName: "John Doe",
    email: "john@example.com",
    password: "SecurePass123!",
  }),
});

// 2. Verify OTP (this auto-creates project)
const verifyResponse = await fetch("/api/v1/auth/verify-otp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "john@example.com",
    OTP: "123456",
  }),
});

const { accessToken, uid } = await verifyResponse.json();
```

#### Step 2: Get Project ID

After OTP verification, the project is auto-created. You need to get the project ID. You can either:

**Option A:** Return project ID from verify-otp endpoint (requires modification)

**Option B:** Query user's projects:

```javascript
const projectsResponse = await fetch("/api/v1/projects", {
  headers: { Authorization: `Bearer ${accessToken}` },
});
const projects = await projectsResponse.json();
const projectId = projects.data[0].id; // Get the newly created project
```

#### Step 3: Initiate Payment

```javascript
const paymentResponse = await fetch(
  "/api/v1/payments/project/create-checkout-session",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId: projectId,
      successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/payment/cancel`,
    }),
  },
);

const { data } = await paymentResponse.json();

// Redirect to Stripe Checkout
window.location.href = data.checkoutUrl;
```

#### Step 4: Handle Success/Cancel

**Success Page (`/payment/success`):**

```javascript
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get("session_id");

// Check payment status
const statusResponse = await fetch(
  `/api/v1/payments/project/${projectId}/status`,
  {
    headers: { Authorization: `Bearer ${accessToken}` },
  },
);

const { data } = await statusResponse.json();

if (data.paymentStatus === "SUCCEEDED") {
  // Show success message and redirect to dashboard
  window.location.href = "/dashboard/projects";
} else {
  // Payment still processing, show loading state
  // Poll every 2 seconds until status is SUCCEEDED
}
```

**Cancel Page (`/payment/cancel`):**

```javascript
// Show message that payment was cancelled
// Offer option to retry payment
<button onClick={retryPayment}>Retry Payment</button>
```

## Amount Calculation

The payment amount is automatically retrieved from `ProjectEstimate.calculatedTotal`:

1. **Stored in Database:** `calculatedTotal` is stored in **dollars** (e.g., 100.50)
2. **Sent to Stripe:** Automatically converted to **cents** (e.g., 10050)
3. **Calculation:** `amountInCents = Math.round(amountInDollars * 100)`

**Example:**

```
ProjectEstimate.calculatedTotal = 1234.56 (stored as Decimal)
↓
Converted to: 123456 cents
↓
Sent to Stripe: 123456
```

## Testing

### Test Cards (Stripe Test Mode)

**Successful Payment:**

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

**Payment Declined:**

```
Card Number: 4000 0000 0000 0002
```

**Requires Authentication:**

```
Card Number: 4000 0025 0000 3155
```

### Test Flow

1. **Create a visitor with complete details**

   ```bash
   POST /api/v1/visitors/create-with-details
   ```

2. **Add all visitor data (services, technologies, features, etc.)**

3. **Calculate and accept estimate**

   ```bash
   POST /api/v1/visitors/{visitorId}/estimate/calculate
   POST /api/v1/visitors/{visitorId}/estimate/accept
   ```

4. **Sign service agreement**

5. **Register user**

   ```bash
   POST /api/v1/auth/register
   ```

6. **Verify OTP** (project auto-created with paymentStatus: PENDING)

   ```bash
   POST /api/v1/auth/verify-otp
   ```

7. **Get project ID**

   ```bash
   GET /api/v1/projects
   ```

8. **Create checkout session**

   ```bash
   POST /api/v1/payments/project/create-checkout-session
   ```

9. **Complete payment on Stripe Checkout page**

10. **Webhook updates project paymentStatus to SUCCEEDED**

11. **Check payment status**
    ```bash
    GET /api/v1/payments/project/{projectId}/status
    ```

## Environment Variables

Make sure you have these in your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Webhook Setup (Important!)

### Local Development

Use Stripe CLI for webhook forwarding:

```bash
stripe listen --forward-to localhost:8000/api/v1/payments/webhook
```

This will give you a webhook secret like `whsec_...` - add it to your `.env` file.

### Production

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/v1/payments/webhook`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the signing secret to your `.env` file

## Security Considerations

1. **Authentication:** All payment endpoints require authentication
2. **Authorization:** Users can only create payments for their own projects
3. **Webhook Signature:** All webhooks are verified using Stripe signature
4. **Amount Security:** Amount comes from server-side database, not client
5. **Metadata:** Project, client, and visitor IDs stored in Stripe metadata

## Error Handling

### Common Errors

**1. Project already paid**

```json
{
  "success": false,
  "message": "Project payment is already completed"
}
```

**Solution:** Check payment status before attempting payment

**2. No calculated total**

```json
{
  "success": false,
  "message": "Project calculated total not found"
}
```

**Solution:** Ensure estimate is calculated before creating project

**3. Insufficient permissions**

```json
{
  "success": false,
  "message": "You do not have permission to access this project"
}
```

**Solution:** User must own the project

## Monitoring & Logging

All payment operations are logged:

```typescript
logger.info("Checkout session created for project", {
  projectId,
  sessionId,
  amount,
  userId,
});
```

Check logs at:

- Development: `logs/application-YYYY-MM-DD.log`
- Production: Your logging service

## Payment Status Flow

```
PENDING (Initial)
    ↓
    ├─→ SUCCEEDED (Payment completed)
    ├─→ FAILED (Payment failed)
    ├─→ CANCELED (Session expired or user cancelled)
    └─→ REFUNDED (Payment refunded by admin)
```

## API Response Examples

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Next Steps

1. **Run Migration:** Apply the schema changes to your database
2. **Test Locally:** Use Stripe test mode and CLI for webhook testing
3. **Frontend Integration:** Implement the checkout flow in your frontend
4. **Production Setup:** Configure production webhook endpoint
5. **Monitoring:** Set up alerts for failed payments

## Support

For issues or questions:

1. Check Stripe logs in Dashboard → Developers → Logs
2. Check application logs
3. Verify webhook secret is correct
4. Test with Stripe test cards

---

**Last Updated:** October 31, 2025
**Version:** 1.0.0
