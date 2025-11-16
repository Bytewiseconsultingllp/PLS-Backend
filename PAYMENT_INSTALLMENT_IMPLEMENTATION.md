# Payment Installment & Progress Tracking Implementation

## 🎯 Overview

Successfully implemented a flexible payment system that supports:

- **Default 25% deposit payments**
- **Custom percentage payments** (any % from 1-100+)
- **Custom dollar amount payments** (any amount)
- **Cumulative payment tracking** across multiple payments
- **Automatic payment completion percentage calculation**

## 📊 Database Schema Changes

### New Enum: `PaymentType`

```prisma
enum PaymentType {
  FULL         // 100% payment
  DEPOSIT      // Percentage-based deposit (e.g., 25%)
  INSTALLMENT  // Custom amount payment
}
```

### Payment Model - New Fields

```prisma
model Payment {
  // ... existing fields ...

  // Payment type and breakdown (for partial/deposit payments)
  paymentType         PaymentType @default(FULL)
  depositPercentage   Decimal?    @db.Decimal(5, 2)  // e.g., 25.00 for 25%
  fullProjectAmount   Decimal?    @db.Decimal(10, 2) // Full project amount for reference
}
```

### Project Model - New Fields

```prisma
model Project {
  // ... existing fields ...

  // Payment tracking
  paymentStatus               PaymentStatus @default(PENDING)
  totalAmountPaid             Decimal?      @default(0) @db.Decimal(10, 2) // Cumulative sum
  paymentCompletionPercentage Decimal?      @default(0) @db.Decimal(5, 2)  // 0-100+%
}
```

## 🔄 Business Logic Flow

### 1. **Creating a Payment Checkout Session**

**Endpoint:** `POST /api/v1/payment/project/create-checkout-session`

**Request Options:**

#### Option A: Default 25% Deposit (No parameters)

```json
{
  "projectId": "be3f146b-08d8-4163-8770-f89fdae62583",
  "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "http://localhost:3000/payment/cancel"
}
```

→ **Charges 25% of project total** (paymentType: DEPOSIT)

#### Option B: Custom Percentage

```json
{
  "projectId": "be3f146b-08d8-4163-8770-f89fdae62583",
  "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "http://localhost:3000/payment/cancel",
  "depositPercentage": 50
}
```

→ **Charges 50% of project total** (paymentType: DEPOSIT)

#### Option C: Custom Dollar Amount

```json
{
  "projectId": "be3f146b-08d8-4163-8770-f89fdae62583",
  "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "http://localhost:3000/payment/cancel",
  "customAmount": 500.0
}
```

→ **Charges $500** (paymentType: INSTALLMENT, percentage calculated automatically)

#### Option D: Full Payment

```json
{
  "projectId": "be3f146b-08d8-4163-8770-f89fdae62583",
  "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "http://localhost:3000/payment/cancel",
  "depositPercentage": 100
}
```

→ **Charges 100% of project total** (paymentType: FULL)

### 2. **Payment Success Flow**

When a payment succeeds (via webhook or API verification), the system automatically:

1. **Updates Payment Record:**

   - `status` → "SUCCEEDED"
   - `paidAt` → current timestamp
   - Records webhook event ID for idempotency

2. **Updates Project Cumulative Tracking:**

   ```javascript
   // Calculate new totals
   totalAmountPaid = previousTotal + currentPaymentAmount;

   // Calculate completion percentage
   completionPercentage =
     (totalAmountPaid / projectEstimate.calculatedTotal) * 100;

   // Update payment status
   paymentStatus = completionPercentage >= 100 ? "SUCCEEDED" : "PENDING";
   ```

3. **Logs the verification** in `PaymentVerificationLog`

### 3. **Example Scenario**

**Project Total:** $1,000

| Payment # | Type          | Amount | Total Paid | Completion % | Status        |
| --------- | ------------- | ------ | ---------- | ------------ | ------------- |
| Initial   | -             | -      | $0         | 0%           | PENDING       |
| Payment 1 | Deposit (25%) | $250   | $250       | 25%          | PENDING       |
| Payment 2 | Custom Amount | $500   | $750       | 75%          | PENDING       |
| Payment 3 | Custom Amount | $250   | $1,000     | 100%         | **SUCCEEDED** |
| Payment 4 | Custom Amount | $100   | $1,100     | 110%         | SUCCEEDED     |

**Note:** System allows overpayment (>100%) for flexibility.

## 🔧 Technical Implementation

### Files Modified:

1. **`prisma/schema.prisma`**

   - Added `PaymentType` enum
   - Added payment tracking fields to Payment model
   - Added cumulative tracking fields to Project model

2. **`src/services/projectPaymentService.ts`**

   - Updated `createProjectCheckoutSession()` to handle:
     - Default 25% deposit
     - Custom percentage
     - Custom dollar amount
   - Calculate and store payment metadata

3. **`src/controllers/paymentController/projectPaymentController.ts`**

   - Added `depositPercentage` and `customAmount` parameters
   - Pass parameters to service layer

4. **`src/controllers/paymentController/paymentController.ts`**

   - Updated `handlePaymentIntentSucceeded()` webhook handler
   - Updated `handleCheckoutSessionCompleted()` webhook handler
   - Updated `verifyCheckoutSession()` API check handler
   - All now update cumulative totals and completion percentage

5. **`src/swagger/payment.yaml`**
   - Updated API documentation
   - Added examples for all payment types

## 🧪 Testing Guide

### Test Case 1: Default 25% Deposit

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/payment/project/create-checkout-session' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "projectId": "YOUR_PROJECT_ID",
  "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "http://localhost:3000/payment/cancel"
}'
```

**Expected:**

- Payment amount = 25% of project total
- `paymentType` = "DEPOSIT"
- `depositPercentage` = 25.00

### Test Case 2: Custom 50% Deposit

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/payment/project/create-checkout-session' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "projectId": "YOUR_PROJECT_ID",
  "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "http://localhost:3000/payment/cancel",
  "depositPercentage": 50
}'
```

**Expected:**

- Payment amount = 50% of project total
- `paymentType` = "DEPOSIT"
- `depositPercentage` = 50.00

### Test Case 3: Custom Amount ($500)

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/payment/project/create-checkout-session' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "projectId": "YOUR_PROJECT_ID",
  "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "http://localhost:3000/payment/cancel",
  "customAmount": 500.00
}'
```

**Expected:**

- Payment amount = $500
- `paymentType` = "INSTALLMENT"
- `depositPercentage` = (500 / projectTotal) \* 100

### Test Case 4: Multiple Payments

1. **First Payment:** Pay 25% deposit

   ```sql
   -- Check project after payment 1
   SELECT
     totalAmountPaid,
     paymentCompletionPercentage,
     paymentStatus
   FROM "Project"
   WHERE id = 'YOUR_PROJECT_ID';
   ```

   **Expected:** totalAmountPaid = 25% of total, status = PENDING

2. **Second Payment:** Pay custom amount ($500)

   ```sql
   -- Check project after payment 2
   SELECT
     totalAmountPaid,
     paymentCompletionPercentage,
     paymentStatus
   FROM "Project"
   WHERE id = 'YOUR_PROJECT_ID';
   ```

   **Expected:** totalAmountPaid = cumulative, percentage updated

3. **Third Payment:** Complete remaining balance
   **Expected:** paymentStatus changes to SUCCEEDED when >= 100%

## 📈 Database Queries for Monitoring

### Get Project Payment Progress

```sql
SELECT
  p.id,
  p.paymentStatus,
  p.totalAmountPaid,
  p.paymentCompletionPercentage,
  pe.calculatedTotal as projectTotal,
  (pe.calculatedTotal - COALESCE(p.totalAmountPaid, 0)) as remainingAmount
FROM "Project" p
LEFT JOIN "ProjectEstimate" pe ON p.id = pe.projectId
WHERE p.id = 'YOUR_PROJECT_ID';
```

### Get All Payments for a Project

```sql
SELECT
  id,
  amount / 100.0 as amountInDollars,
  paymentType,
  depositPercentage,
  status,
  paidAt,
  description
FROM "Payment"
WHERE projectId = 'YOUR_PROJECT_ID'
ORDER BY createdAt ASC;
```

### Find Projects with Partial Payments

```sql
SELECT
  p.id,
  p.totalAmountPaid,
  p.paymentCompletionPercentage,
  pe.calculatedTotal
FROM "Project" p
LEFT JOIN "ProjectEstimate" pe ON p.id = pe.projectId
WHERE
  p.paymentCompletionPercentage > 0
  AND p.paymentCompletionPercentage < 100
  AND p.paymentStatus = 'PENDING'
ORDER BY p.paymentCompletionPercentage DESC;
```

## ✅ Key Features

1. **Backward Compatible:** Existing payment flow still works
2. **Idempotent:** Duplicate webhook events don't cause double-counting
3. **Transactional:** All updates happen atomically
4. **Flexible:** Supports any payment amount or percentage
5. **Tracked:** Full audit trail via PaymentVerificationLog
6. **Accurate:** Cumulative tracking across multiple payments

## 🚀 Migration Applied

Migration: `20251115012045_add_payment_installment_tracking`

All existing projects initialized with:

- `totalAmountPaid` = 0
- `paymentCompletionPercentage` = 0

## 📝 Notes

- **Payment Status Logic:** Project `paymentStatus` only changes to "SUCCEEDED" when `paymentCompletionPercentage >= 100%`
- **Freelancer Visibility:** Freelancers see projects where `paymentStatus = "SUCCEEDED"` (backward compatible)
- **Overpayment Allowed:** System allows payments exceeding 100% (no validation limit)
- **Currency:** All amounts stored in cents for Stripe, converted to dollars for display

## 🎉 Implementation Complete!

All features have been implemented, tested, and documented. The system now supports flexible payment installments with accurate progress tracking.
