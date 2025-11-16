# 25% Minimum First Payment Rule - Implementation

## 🎯 Overview

Updated the payment system to enforce a **25% minimum on the first payment** and set `paymentStatus = "SUCCEEDED"` after the first payment to enable freelancer bidding.

## 🔑 Key Business Logic

### Before (Problem):

- Project `paymentStatus` only became "SUCCEEDED" at 100% completion
- **Result:** No freelancers could bid on ANY projects until fully paid ❌
- Platform was broken for the core use case

### After (Solution):

1. ✅ **First payment MUST be at least 25%** (validated, rejected if less)
2. ✅ **After first payment ≥ 25% → `paymentStatus = "SUCCEEDED"`**
3. ✅ **Project becomes visible to freelancers for bidding**
4. ✅ **Subsequent payments can be any amount** (flexible)
5. ✅ **Status stays "SUCCEEDED"** (never reverts to PENDING)
6. ✅ **Progress tracked via `paymentCompletionPercentage`** (0-100+%)

## 📊 Payment Flow

### Scenario: Project Total = $1,000

| Payment # | Amount | % of Total | Total Paid | Completion % | `paymentStatus`  | Freelancers Can Bid? |
| --------- | ------ | ---------- | ---------- | ------------ | ---------------- | -------------------- |
| Initial   | -      | -          | $0         | 0%           | PENDING          | ❌ NO                |
| Payment 1 | $250   | 25%        | $250       | 25%          | **SUCCEEDED** ✅ | ✅ **YES**           |
| Payment 2 | $500   | 50%        | $750       | 75%          | SUCCEEDED        | ✅ YES               |
| Payment 3 | $250   | 25%        | $1,000     | 100%         | SUCCEEDED        | ✅ YES               |

### Invalid First Payment Example:

```bash
# Client tries to pay only 10% on first payment
POST /api/v1/payment/project/create-checkout-session
{
  "projectId": "...",
  "depositPercentage": 10
}

# Response: ❌ ERROR 400
{
  "success": false,
  "message": "First payment must be at least 25% of the project total. You attempted to pay 10.00% ($100.00). Minimum required: $250.00 (25%)"
}
```

## 🔧 Implementation Details

### 1. Service Layer Validation (`projectPaymentService.ts`)

```typescript
// Check if this is the first payment
const currentTotalPaid = Number(project.totalAmountPaid || 0);
const isFirstPayment = currentTotalPaid === 0;

// ... calculate payment amount ...

// ✅ VALIDATION: First payment must be at least 25%
if (isFirstPayment && actualDepositPercentage < 25) {
  throw new Error(
    `First payment must be at least 25% of the project total. ` +
      `You attempted to pay ${actualDepositPercentage.toFixed(2)}% ($${amountInDollars.toFixed(2)}). ` +
      `Minimum required: $${(fullProjectAmountInDollars * 0.25).toFixed(2)} (25%)`,
  );
}
```

### 2. Webhook Handler Logic (`paymentController.ts`)

Updated in **3 places:**

1. `handlePaymentIntentSucceeded()` - Stripe Payment Intent webhook
2. `handleCheckoutSessionCompleted()` - Stripe Checkout Session webhook
3. `verifyCheckoutSession()` - API fallback for missed webhooks

```typescript
// Determine payment status
// Set to SUCCEEDED on first payment if >= 25%, then keep it SUCCEEDED
const isFirstPayment = currentTotalPaid === 0;
let newPaymentStatus = project.paymentStatus;

if (isFirstPayment && completionPercentage >= 25) {
  newPaymentStatus = "SUCCEEDED";
}

await tx.project.update({
  where: { id: payment.projectId },
  data: {
    totalAmountPaid: newTotalPaid,
    paymentCompletionPercentage: completionPercentage,
    paymentStatus: newPaymentStatus, // Set once, never reverts
  },
});
```

## 📝 Frontend Usage

### Valid First Payment Examples:

#### Example 1: Default 25% (Recommended)

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/payment/project/create-checkout-session' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "projectId": "be3f146b-08d8-4163-8770-f89fdae62583",
  "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "http://localhost:3000/payment/cancel"
}'
```

✅ **Charges exactly 25%** (default)

#### Example 2: Custom 50%

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/payment/project/create-checkout-session' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "projectId": "be3f146b-08d8-4163-8770-f89fdae62583",
  "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "http://localhost:3000/payment/cancel",
  "depositPercentage": 50
}'
```

✅ **Charges 50%** (valid, ≥ 25%)

#### Example 3: Full Payment (100%)

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/payment/project/create-checkout-session' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "projectId": "be3f146b-08d8-4163-8770-f89fdae62583",
  "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "http://localhost:3000/payment/cancel",
  "depositPercentage": 100
}'
```

✅ **Charges 100%** (valid, ≥ 25%)

### Subsequent Payment Examples (After First Payment):

#### Example 4: Custom $500 (Subsequent Payment)

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/payment/project/create-checkout-session' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "projectId": "be3f146b-08d8-4163-8770-f89fdae62583",
  "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "http://localhost:3000/payment/cancel",
  "customAmount": 500.00
}'
```

✅ **Charges $500** (valid, any amount allowed after first payment)

### Invalid First Payment Example:

#### Example 5: 10% First Payment (❌ REJECTED)

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/payment/project/create-checkout-session' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "projectId": "be3f146b-08d8-4163-8770-f89fdae62583",
  "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "http://localhost:3000/payment/cancel",
  "depositPercentage": 10
}'
```

**Response:**

```json
{
  "success": false,
  "message": "Failed to create checkout session",
  "error": "First payment must be at least 25% of the project total. You attempted to pay 10.00% ($100.00). Minimum required: $250.00 (25%)"
}
```

## 🔍 Database Queries

### Check If Project Is Ready for Freelancer Bidding

```sql
SELECT
  p.id,
  p.paymentStatus,
  p.acceptingBids,
  p.totalAmountPaid,
  p.paymentCompletionPercentage,
  CASE
    WHEN p.paymentStatus = 'SUCCEEDED' AND p.acceptingBids = true
    THEN 'Visible to Freelancers ✅'
    ELSE 'Hidden from Freelancers ❌'
  END as freelancer_visibility
FROM "Project" p
WHERE p.id = 'YOUR_PROJECT_ID';
```

### Find Projects Ready for Bidding

```sql
SELECT
  p.id,
  p.totalAmountPaid,
  p.paymentCompletionPercentage,
  p.paymentStatus,
  p.acceptingBids,
  pd.companyName
FROM "Project" p
LEFT JOIN "ProjectDetails" pd ON p.id = pd.projectId
WHERE
  p.paymentStatus = 'SUCCEEDED'  -- Has paid at least 25%
  AND p.acceptingBids = true      -- Accepting new bids
  AND p.deletedAt IS NULL         -- Not deleted
ORDER BY p.createdAt DESC;
```

### Get Payment History for a Project

```sql
SELECT
  pay.id,
  pay.amount / 100.0 as amountInDollars,
  pay.paymentType,
  pay.depositPercentage,
  pay.status,
  pay.paidAt,
  pay.description,
  -- Show cumulative total after this payment
  SUM(CASE WHEN pay2.paidAt <= pay.paidAt THEN pay2.amount / 100.0 ELSE 0 END)
    OVER (ORDER BY pay.paidAt) as cumulativeTotal
FROM "Payment" pay
LEFT JOIN "Payment" pay2 ON pay2.projectId = pay.projectId AND pay2.status = 'SUCCEEDED'
WHERE
  pay.projectId = 'YOUR_PROJECT_ID'
  AND pay.status = 'SUCCEEDED'
ORDER BY pay.paidAt ASC;
```

## ✅ Benefits

1. **✅ Platform Works:** Freelancers can see and bid on projects after initial deposit
2. **✅ Client Commitment:** 25% minimum ensures client is serious
3. **✅ Backward Compatible:** Existing freelancer queries (`paymentStatus = "SUCCEEDED"`) still work
4. **✅ Flexible:** Clients can pay any amount after first payment
5. **✅ Transparent:** `paymentCompletionPercentage` shows exact progress
6. **✅ Protected:** Validation prevents accidental small first payments

## 🚨 Important Notes

1. **First Payment Validation:**

   - Validated at checkout session creation
   - Error thrown immediately if < 25%
   - Clear error message explains the requirement

2. **Payment Status Logic:**

   - `paymentStatus = "PENDING"` → Initial state (no payments)
   - `paymentStatus = "SUCCEEDED"` → After first payment ≥ 25%
   - Status NEVER reverts to PENDING after being set to SUCCEEDED

3. **Progress Tracking:**

   - Use `paymentCompletionPercentage` to see actual progress (0-100+%)
   - Use `totalAmountPaid` to see total dollars paid
   - Use `paymentStatus` to check if project is unlocked for bidding

4. **Freelancer Dashboard:**
   - Query: `WHERE paymentStatus = 'SUCCEEDED' AND acceptingBids = true`
   - This shows all projects with ≥ 25% paid and accepting bids

## 📦 Files Modified

1. **`src/services/projectPaymentService.ts`**

   - Added `isFirstPayment` check
   - Added 25% validation logic
   - Clear error messages

2. **`src/controllers/paymentController/paymentController.ts`**
   - Updated `handlePaymentIntentSucceeded()` webhook handler
   - Updated `handleCheckoutSessionCompleted()` webhook handler
   - Updated `verifyCheckoutSession()` API fallback
   - All now set `paymentStatus = "SUCCEEDED"` on first payment if ≥ 25%

## 🎉 Implementation Complete!

The payment system now:

- ✅ Enforces 25% minimum on first payment
- ✅ Unlocks project for freelancer bidding after first payment
- ✅ Tracks cumulative payment progress
- ✅ Maintains flexibility for subsequent payments
- ✅ Provides clear error messages
- ✅ Works with webhooks AND missed webhook fallback

**Ready to deploy and test!** 🚀
