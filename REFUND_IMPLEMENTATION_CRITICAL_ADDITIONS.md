# CRITICAL ADDITIONS TO REFUND IMPLEMENTATION GUIDE

## 🚨 CRITICAL: Read These Corrections First

### 1. Stripe API Version (IMPORTANT!)

**WRONG in guide:**

```typescript
apiVersion: "2024-11-20.acacia"; // ❌ DON'T USE THIS
```

**CORRECT (from existing stripeService.ts):**

```typescript
apiVersion: "2024-06-20"; // ✅ USE THIS
```

**Location to verify:** `src/services/stripeService.ts` line 7

### 2. Stripe Import Pattern (CRITICAL!)

**From existing code (`src/services/stripeService.ts`):**

```typescript
/* eslint-disable camelcase */
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../config/config";

// Initialize Stripe with secret key
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});
```

**For RefundService, use EXACT pattern:**

```typescript
/* eslint-disable camelcase */
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../config/config";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});
```

### 3. Prisma Client Import (CRITICAL!)

**From existing code (`src/controllers/adminController/adminPaymentController.ts`):**

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
```

**BUT in services, use:**

```typescript
import { db } from "../database/db";
// Use db.refund, db.payment, db.project
```

**Controllers:** Use `prisma` (new instance)  
**Services:** Use `db` (shared instance)

### 4. Exact Router Pattern (CRITICAL!)

**Check existing adminRouter.ts for pattern:**

```bash
# Read the actual router to see exact pattern
cat src/routers/adminRouter/adminRouter.ts | grep -A 5 "import"
```

**Exact location to add routes:**
After line with existing admin payment routes, add refund routes.

**Pattern from existing code:**

```typescript
router.get("/payments/:paymentId/verification-history", (req, res) =>
  adminPaymentController.getPaymentVerificationHistory(req, res),
);
```

**Follow EXACT same pattern for refunds:**

```typescript
router.post("/refunds/process", (req, res) =>
  adminRefundController.processRefund(req, res),
);
```

### 5. Email Service Pattern (CRITICAL!)

**Check existing email methods in globalMailService.ts:**

```bash
# Find existing email methods
grep -n "async send" src/services/globalMailService.ts
```

**Pattern to follow:**

```typescript
async sendRefundNotification(data: {
  clientEmail: string;
  clientName: string;
  refundAmount: number;
  paymentAmount: number;
  projectId: string | null;
  reason?: string;
}): Promise<void> {
  const subject = `Refund Processed - $${data.refundAmount.toFixed(2)}`;

  // Use existing template replacement method
  const html = await this.replaceEmailPlaceholders(
    "refundProcessed.html",
    {
      clientName: data.clientName,
      refundAmount: data.refundAmount.toFixed(2),
      paymentAmount: data.paymentAmount.toFixed(2),
      projectId: data.projectId || "N/A",
      reason: data.reason || "No reason provided",
    },
  );

  // Use existing sendEmail method
  await this.sendEmail({
    to: data.clientEmail,
    subject,
    html,
  });
}
```

### 6. Critical Edge Cases (MUST HANDLE!)

#### Edge Case 1: Payment has no Payment Intent

```typescript
if (!payment.stripePaymentIntentId) {
  throw new Error(
    "Cannot process refund: Payment was not processed through Stripe Payment Intent",
  );
}
```

#### Edge Case 2: Payment already fully refunded

```typescript
if (availableToRefund <= 0) {
  throw new Error(
    `This payment has already been fully refunded. ` +
      `Payment amount: $${paymentAmountInDollars}, Already refunded: $${alreadyRefunded}`,
  );
}
```

#### Edge Case 3: Refund amount precision

```typescript
// Round to 2 decimal places to avoid floating point issues
const roundedAmount = Math.round(amount * 100) / 100;
if (roundedAmount !== amount) {
  logger.warn(`Refund amount rounded from ${amount} to ${roundedAmount}`);
}
```

#### Edge Case 4: Project doesn't exist (orphaned payment)

```typescript
if (payment.projectId) {
  await tx.project.update({
    where: { id: payment.projectId },
    data: { totalRefunded: { increment: amount } },
  });
} else {
  logger.warn(`Payment ${paymentId} has no associated project`);
}
```

### 7. Stripe Error Handling (CRITICAL!)

```typescript
try {
  stripeRefund = await stripe.refunds.create({...});
} catch (error) {
  if (error instanceof Stripe.errors.StripeError) {
    // Specific Stripe error types
    if (error.type === 'StripeCardError') {
      throw new Error(`Card error: ${error.message}`);
    }
    if (error.type === 'StripeInvalidRequestError') {
      throw new Error(`Invalid request: ${error.message}`);
    }
    if (error.type === 'StripeAPIError') {
      throw new Error(`Stripe API error: ${error.message}`);
    }
    if (error.type === 'StripeConnectionError') {
      throw new Error(`Connection error: ${error.message}`);
    }
    if (error.type === 'StripeAuthenticationError') {
      throw new Error(`Authentication error: Check STRIPE_SECRET_KEY`);
    }
    // Generic Stripe error
    throw new Error(`Stripe error: ${error.message}`);
  }
  // Non-Stripe error
  throw error;
}
```

### 8. Transaction Rollback (CRITICAL!)

**If ANY operation in transaction fails, ALL are rolled back automatically.**

```typescript
try {
  const refund = await db.$transaction(async (tx) => {
    // If ANY of these fail, ALL are rolled back
    const newRefund = await tx.refund.create({...});
    await tx.payment.update({...});  // Rolled back if this fails
    await tx.project.update({...});  // Rolled back if this fails
    return newRefund;
  });
} catch (error) {
  // All DB operations rolled back
  // BUT Stripe refund already created!
  logger.error("DB transaction failed but Stripe refund succeeded", {
    stripeRefundId: stripeRefund.id,
    error
  });
  // Admin needs to manually reconcile
  throw new Error(
    `Refund created in Stripe (${stripeRefund.id}) but DB update failed. ` +
    `Manual reconciliation required.`
  );
}
```

### 9. Real Test Data (USE THESE!)

**Stripe Test Payment Intent IDs:**

```
pi_3ABC123def456GHI789jkl  // Format: pi_[random]
```

**Stripe Test Refund IDs:**

```
re_3ABC123def456GHI789jkl  // Format: re_[random]
```

**Test Amounts (Stripe Test Mode):**

- Succeed: Any amount
- Fail: Amount ending in `.99` (e.g., 99.99)

**Test Cards (Stripe Test Mode):**

- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002

### 10. Exact File Locations to Reference

**BEFORE writing any code, READ these files to match patterns:**

```bash
# 1. Check how admin controllers are structured
cat src/controllers/adminController/adminPaymentController.ts | head -30

# 2. Check how services use Stripe
cat src/services/stripeService.ts | head -30

# 3. Check how email service sends emails
grep -A 20 "sendEmail" src/services/globalMailService.ts

# 4. Check how admin routes are added
cat src/routers/adminRouter/adminRouter.ts | grep -A 3 "router\."

# 5. Check existing Prisma usage
grep -n "db\.\$transaction" src/controllers/paymentController/paymentController.ts
```

### 11. Validation Rules (MUST IMPLEMENT!)

```typescript
// 1. Validate payment exists
if (!payment) {
  throw new Error("Payment not found");
}

// 2. Validate payment has Stripe ID
if (!payment.stripePaymentIntentId) {
  throw new Error("Cannot refund: Payment has no Stripe Payment Intent");
}

// 3. Validate amount is positive
if (amount <= 0) {
  throw new Error("Refund amount must be greater than 0");
}

// 4. Validate amount doesn't exceed available
const available = paymentAmount - alreadyRefunded;
if (amount > available) {
  throw new Error(
    `Refund amount ($${amount}) exceeds available ($${available.toFixed(2)}). ` +
      `Payment: $${paymentAmount}, Already refunded: $${alreadyRefunded}`,
  );
}

// 5. Validate payment is in correct status
if (payment.status !== "SUCCEEDED") {
  throw new Error(
    `Cannot refund: Payment status is ${payment.status}, must be SUCCEEDED`,
  );
}

// 6. Validate amount precision (max 2 decimals)
if (!/^\d+(\.\d{1,2})?$/.test(amount.toString())) {
  throw new Error("Refund amount must have maximum 2 decimal places");
}
```

### 12. Database Constraints (MUST KNOW!)

**From Prisma schema:**

```prisma
model Refund {
  // REQUIRED fields (MUST provide):
  paymentId  String
  projectId  String
  refundedBy String
  amount     Decimal @db.Decimal(10, 2)
  status     RefundStatus @default(PENDING)

  // OPTIONAL fields (can be null):
  reason String?
  notes String?
  stripeRefundId String? @unique
  processedAt DateTime?
}
```

**Max values:**

- amount: 99999999.99 (10 digits, 2 decimals)
- reason: Unlimited text
- notes: Unlimited text

### 13. Logging Strategy (CRITICAL!)

```typescript
// ALWAYS log these events

// 1. Refund initiated
logger.info("Refund initiated", {
  paymentId,
  amount,
  adminId,
  reason,
});

// 2. Stripe refund created
logger.info("Stripe refund created", {
  stripeRefundId: stripeRefund.id,
  paymentId,
  amount,
});

// 3. DB transaction started
logger.info("Updating database", {
  paymentId,
  projectId: payment.projectId,
});

// 4. Refund completed
logger.info("Refund completed successfully", {
  refundId: refund.id,
  stripeRefundId: stripeRefund.id,
  paymentId,
  projectId: payment.projectId,
  amount,
});

// 5. Email sent
logger.info("Refund notification email sent", {
  refundId: refund.id,
  clientEmail: payment.clientEmail,
});

// 6. ERRORS
logger.error("Refund failed", {
  error: error instanceof Error ? error.message : "Unknown",
  stack: error instanceof Error ? error.stack : undefined,
  paymentId,
  amount,
  adminId,
});
```

### 14. Return Value Format (MUST MATCH!)

**RefundService.processRefund MUST return:**

```typescript
return {
  refundId: string;        // Our DB ID
  stripeRefundId: string;  // Stripe refund ID
  amount: number;          // Amount refunded (dollars)
  status: string;          // "SUCCEEDED"
  message: string;         // "Refund processed successfully"
}
```

**Controller MUST return:**

```typescript
res.status(200).json({
  success: true,
  message: "Refund processed successfully",
  data: {
    refundId: "...",
    stripeRefundId: "...",
    amount: 250.0,
    status: "SUCCEEDED",
    message: "...",
  },
});
```

### 15. Testing Sequence (EXACT STEPS!)

```bash
# 1. Build
cd /Users/ssingh83/Desktop/Nov2PLS-Backend/PLS-Backend
bun run build

# 2. Check for errors
# MUST see: "0 errors"
# If errors, FIX before continuing

# 3. Start server
bun run dev
# Server should start on port 8000

# 4. Get admin token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"admin123"}'
# Copy the token from response

# 5. Get a payment ID
# Query database or use existing payment
psql $DATABASE_URL -c "SELECT id, amount, \"stripePaymentIntentId\" FROM \"Payment\" WHERE status = 'SUCCEEDED' LIMIT 1;"

# 6. Process refund
curl -X POST http://localhost:8000/api/v1/admin/refunds/process \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "paymentId": "PAYMENT_ID_FROM_STEP_5",
    "amount": 50.00,
    "reason": "Test refund"
  }'

# 7. Verify in DB
psql $DATABASE_URL -c "SELECT * FROM \"Refund\" ORDER BY \"createdAt\" DESC LIMIT 1;"

# 8. Check Stripe Dashboard
open https://dashboard.stripe.com/test/payments
# Find the refund

# 9. Check email (if configured)
# Should receive email at client's address
```

### 16. Rollback Plan (IF THINGS GO WRONG!)

**Scenario 1: Stripe refund created but DB update failed**

```sql
-- Manually create refund record
INSERT INTO "Refund" (
  id, "paymentId", "projectId", "refundedBy",
  amount, status, "stripeRefundId", "createdAt", "processedAt"
) VALUES (
  gen_random_uuid(),
  'PAYMENT_ID',
  'PROJECT_ID',
  'ADMIN_UID',
  100.00,
  'SUCCEEDED',
  'STRIPE_REFUND_ID',
  NOW(),
  NOW()
);

-- Update payment
UPDATE "Payment"
SET "totalRefundedAmount" = "totalRefundedAmount" + 100.00,
    "lastRefundedAt" = NOW()
WHERE id = 'PAYMENT_ID';

-- Update project
UPDATE "Project"
SET "totalRefunded" = "totalRefunded" + 100.00
WHERE id = 'PROJECT_ID';
```

**Scenario 2: DB updated but Stripe failed**

```sql
-- Delete the refund record
DELETE FROM "Refund" WHERE id = 'REFUND_ID';

-- Revert payment
UPDATE "Payment"
SET "totalRefundedAmount" = "totalRefundedAmount" - 100.00
WHERE id = 'PAYMENT_ID';

-- Revert project
UPDATE "Project"
SET "totalRefunded" = "totalRefunded" - 100.00
WHERE id = 'PROJECT_ID';
```

### 17. Common Build Errors & Fixes

**Error 1: Cannot find module '@prisma/client'**

```bash
npx prisma generate
```

**Error 2: Stripe type errors**

```bash
npm install --save-dev @types/stripe
```

**Error 3: ESLint camelcase error**

```typescript
/* eslint-disable camelcase */
// Put at top of file
```

**Error 4: Decimal type error**

```typescript
import { Decimal } from "@prisma/client/runtime/library";
// Use: new Decimal(amount)
```

### 18. Performance Considerations

```typescript
// 1. Use select to limit data fetched
const payment = await db.payment.findUnique({
  where: { id: paymentId },
  select: {
    id: true,
    amount: true,
    stripePaymentIntentId: true,
    totalRefundedAmount: true,
    projectId: true,
    clientEmail: true,
    // Don't fetch: createdAt, updatedAt, metadata, etc.
  }
});

// 2. Use indexes (already in schema)
@@index([paymentId])
@@index([projectId])
@@index([status])

// 3. Email async (don't await)
this.sendRefundNotification(data).catch(error => {
  logger.error("Email failed but refund succeeded", error);
});
```

### 19. Security Checks (CRITICAL!)

```typescript
// 1. Verify admin role
if (!req.userFromToken || req.userFromToken.role !== "ADMIN") {
  return res.status(403).json({
    success: false,
    message: "Forbidden: Admin access required",
  });
}

// 2. Sanitize inputs
const amount = Math.abs(parseFloat(req.body.amount));
const reason = req.body.reason?.trim().substring(0, 1000); // Limit length

// 3. Log sensitive operations
logger.info("Refund processed by admin", {
  adminId: req.userFromToken.uid,
  adminEmail: req.userFromToken.email, // If available
  paymentId,
  amount,
  timestamp: new Date().toISOString(),
});
```

### 20. Final Checklist (VERIFY BEFORE COMMITTING!)

- [ ] Stripe API version matches existing (2024-06-20)
- [ ] Prisma import pattern matches (db vs prisma)
- [ ] Error handling for ALL Stripe error types
- [ ] Transaction rollback handling
- [ ] All validations implemented
- [ ] Logging at every step
- [ ] Email template created in templates/
- [ ] Email method added to globalMailService
- [ ] Routes added to adminRouter
- [ ] Swagger docs created
- [ ] Build succeeds (0 errors)
- [ ] Manual test passes
- [ ] Database verified
- [ ] Stripe dashboard verified
- [ ] Email received
- [ ] Error scenarios tested

---

**USE THIS CHECKLIST DOCUMENT ALONGSIDE THE MAIN IMPLEMENTATION GUIDE!**

This document contains CRITICAL corrections and details that MUST be followed for successful implementation.
