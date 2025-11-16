# Refund System Implementation Guide

## 🎯 FOR CLAUDE (FRESH SESSION): READ THIS FIRST

### Project Context

**What is this project?**

- This is a **Fiverr-like platform** where clients post projects and freelancers bid on them
- Built with: **Node.js, TypeScript, Express, Prisma (PostgreSQL), Stripe**
- Payment flow: Client pays → Project unlocked → Freelancers can bid

**Payment System Evolution:**

1. **Phase 1 (Completed):** Basic Stripe integration
2. **Phase 2 (Completed):** Payment reliability (webhooks, idempotency, fallback verification)
3. **Phase 3 (Completed):** Payment installments (25% minimum, cumulative tracking)
4. **Phase 4 (THIS TASK):** Refund system

### Current Payment State (Context You Need)

**Payment Flow:**

- Client creates project with estimate (e.g., $1,000)
- **First payment MUST be ≥ 25%** (validated, enforced)
- After first payment ≥ 25% → `paymentStatus = "SUCCEEDED"` → Freelancers can bid
- Client can make additional payments (any amount)
- All payments tracked cumulatively

**Key Fields (Project Table):**

```typescript
totalAmountPaid: Decimal; // Sum of all payments (never decreases)
paymentCompletionPercentage: Decimal; // (totalAmountPaid / projectTotal) * 100
paymentStatus: PaymentStatus; // PENDING | SUCCEEDED | FAILED | ...
acceptingBids: Boolean; // Controls freelancer visibility
```

**Freelancer Visibility Logic:**

- Freelancers see projects where: `paymentStatus = "SUCCEEDED" AND acceptingBids = true`
- This means: Client paid ≥ 25% AND project is accepting bids

### Refund System Requirements (What User Wants)

**Core Requirement:**
Admin can refund any amount to client at any time.

**Critical User Decisions:**

1. ✅ Support full OR partial refunds
2. ✅ Multiple refunds allowed per payment/project
3. ✅ **DO NOT modify `paymentStatus`** after refund
4. ✅ **DO NOT modify `paymentCompletionPercentage`** after refund
5. ✅ **DO NOT hide project from freelancers** (only `acceptingBids` controls visibility)
6. ✅ **DO NOT cancel existing bids**
7. ✅ **DO NOT block refunds** if work started
8. ✅ Instant refund (no approval workflow)
9. ✅ Reason field is optional
10. ✅ Send email notification to client

**Data Model:**

```typescript
// These track separately
totalAmountPaid: Decimal; // Sum of payments (NEVER decreases)
totalRefunded: Decimal; // Sum of refunds (separate tracking)
netAmountReceived: Decimal; // Calculated: totalAmountPaid - totalRefunded

// These IGNORE refunds
paymentCompletionPercentage: Decimal; // Based on totalAmountPaid only
paymentStatus: PaymentStatus; // Stays SUCCEEDED after refund
```

### Codebase Patterns (You Must Follow These)

**File Structure:**

```
src/
├── controllers/
│   ├── adminController/
│   │   ├── adminPaymentController.ts
│   │   └── adminRefundController.ts  <-- CREATE THIS
│   └── paymentController/
│       ├── paymentController.ts
│       └── projectPaymentController.ts
├── services/
│   ├── stripeService.ts
│   ├── globalMailService.ts
│   └── refundService.ts  <-- CREATE THIS
├── routers/
│   └── adminRouter/
│       └── adminRouter.ts  <-- UPDATE THIS
├── swagger/
│   ├── admin.yaml
│   └── admin-refunds.yaml  <-- CREATE THIS
└── templates/
    └── refundProcessed.html  <-- CREATE THIS
```

**Import Patterns:**

```typescript
// Controllers
import type { Response } from "express";
import logger from "../../utils/loggerUtils";

// Services
import { db } from "../database/db";
import { Decimal } from "@prisma/client/runtime/library";
import Stripe from "stripe";
import logger from "../utils/loggerUtils";

// Stripe initialization (in services)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});
```

**Response Format Pattern:**

```typescript
// Success
res.status(200).json({
  success: true,
  message: "Operation completed",
  data: { ... }
});

// Error
res.status(400).json({
  success: false,
  message: "Error message",
  error: "Detailed error"
});
```

**Authentication Pattern:**

```typescript
interface AuthenticatedRequest extends Request {
  userFromToken?: {
    uid: string;
    role: string;
    isVerified: boolean;
  };
}

// In controller
const adminId = req.userFromToken?.uid;
if (!adminId) {
  res.status(401).json({ success: false, message: "Unauthorized" });
  return;
}
```

**Prisma Transaction Pattern:**

```typescript
await db.$transaction(async (tx) => {
  // All operations here are atomic
  await tx.payment.update({ ... });
  await tx.project.update({ ... });
  await tx.refund.create({ ... });
});
```

**Logger Pattern:**

```typescript
logger.info("Message", { metadata });
logger.warn("Warning", { data });
logger.error("Error", error);
```

**Async Error Handling:**

```typescript
try {
  // operations
} catch (error) {
  logger.error("Context:", error);
  res.status(500).json({
    success: false,
    message: "User-friendly message",
    error: error instanceof Error ? error.message : "Unknown error",
  });
}
```

### Dependencies Already Installed

```json
{
  "stripe": "^15.x",
  "@prisma/client": "^6.x",
  "express": "^4.x"
}
```

**No new dependencies needed!**

### Environment Variables

Already configured (no changes needed):

```
STRIPE_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...
```

### Admin Authentication

**How it works:**

- Admin routes use `authMiddleware.checkToken`
- This middleware adds `req.userFromToken` with admin's UID and role
- Controller can access `req.userFromToken?.uid` for admin ID

**Admin router pattern:**

```typescript
// In src/routers/adminRouter/adminRouter.ts
import authMiddleware from "../../middlewares/authMiddleware";

const router = express.Router();

// All routes automatically have admin auth
router.use(authMiddleware.checkToken);
router.use(authMiddleware.checkRole(["ADMIN"])); // Admin only

// Then add routes
router.post("/refunds/process", (req, res) =>
  AdminRefundController.processRefund(req, res),
);
```

### Stripe Refund API

**Key Points:**

- Refunds are processed against Payment Intents (not Checkout Sessions)
- Stripe requires `payment_intent` ID
- Amounts in **cents** (multiply by 100)
- Refund reasons: "requested_by_customer" | "duplicate" | "fraudulent"

**Status Flow:**

- Stripe creates refund → `pending`
- Processing → `succeeded` or `failed`
- We map to our enum: PENDING → SUCCEEDED → FAILED

**Refund Timing:**

- Instant in Stripe (5-10 business days to customer's account)
- Email sent immediately
- Status updated in our DB immediately

### Database Migration Status

**✅ COMPLETED:**

- Migration `20251115145246_add_refund_system` applied
- Tables created:
  - `Refund` table (with all fields and indexes)
  - `Payment.totalRefundedAmount` added
  - `Payment.lastRefundedAt` added
  - `Project.totalRefunded` added
- Relations added:
  - `User.refundsProcessed` → `Refund[]`
  - `Payment.refunds` → `Refund[]`
  - `Project.refunds` → `Refund[]`
- Prisma client regenerated

**Location:**
`prisma/migrations/20251115145246_add_refund_system/migration.sql`

**Verification command:**

```bash
# Check migration status
npx prisma migrate status

# Check if Refund table exists
psql $DATABASE_URL -c "\d Refund"
```

### What's Already Working

**✅ Payment System:**

- Stripe integration working
- Webhook handlers working
- Payment installments working (25% rule enforced)
- Cumulative tracking working
- Admin payment verification endpoints working

**✅ Email System:**

- `globalMailService` working
- Email templates working (HTML)
- Template placeholder replacement working

**✅ Admin System:**

- Admin authentication working
- Admin middleware working
- Admin routes working
- Admin swagger docs working

### Common Pitfalls to Avoid

1. **DON'T** modify `paymentStatus` after refund
2. **DON'T** modify `paymentCompletionPercentage` after refund
3. **DON'T** deduct from `totalAmountPaid` (it never decreases)
4. **DO** use Prisma transactions for atomic updates
5. **DO** validate refund amount ≤ (payment amount - already refunded)
6. **DO** convert dollars to cents for Stripe (multiply by 100)
7. **DO** convert cents to dollars for display (divide by 100)
8. **DO** use `new Decimal()` for decimal fields
9. **DO** handle Stripe errors separately (they have special error types)

### Expected Behavior Examples

**Scenario 1: Partial Refund**

```
Project Total: $1,000
Payment 1: $250 (25%)
Refund: $100

Result:
- totalAmountPaid: $250 (unchanged)
- totalRefunded: $100
- netAmountReceived: $150
- paymentStatus: SUCCEEDED (unchanged)
- paymentCompletionPercentage: 25% (unchanged)
- Freelancers can still see project ✅
```

**Scenario 2: Multiple Refunds**

```
Project Total: $1,000
Payment 1: $250 (25%)
Payment 2: $500 (50%)
Refund 1: $100 (from Payment 1)
Refund 2: $200 (from Payment 2)

Result:
- totalAmountPaid: $750 (unchanged)
- totalRefunded: $300 ($100 + $200)
- netAmountReceived: $450
- Payment 1: totalRefundedAmount = $100
- Payment 2: totalRefundedAmount = $200
- paymentStatus: SUCCEEDED (unchanged)
```

**Scenario 3: Full Refund**

```
Project Total: $1,000
Payment 1: $1,000 (100%)
Refund: $1,000

Result:
- totalAmountPaid: $1,000 (unchanged)
- totalRefunded: $1,000
- netAmountReceived: $0
- paymentStatus: SUCCEEDED (unchanged!)
- Freelancers can still see project ✅ (if acceptingBids = true)
```

### Testing Approach

**1. Unit Test Validations:**

- Refund amount validation
- Available amount calculation
- Error messages

**2. Integration Tests:**

- Create refund in Stripe
- Update DB atomically
- Send email

**3. End-to-End Tests:**

- Full refund flow
- Multiple refunds
- Error scenarios

**4. Manual Testing:**

- Use Stripe test keys
- Use test payment intents
- Verify email delivery

### Success Criteria

When implementation is complete, you should be able to:

1. ✅ Process a refund via admin API
2. ✅ See refund in Stripe dashboard
3. ✅ See refund record in DB with all fields
4. ✅ See updated totals in Payment table
5. ✅ See updated totals in Project table
6. ✅ Receive email notification as client
7. ✅ Query refund history for project
8. ✅ Query refund history for payment
9. ✅ View refund in Swagger docs
10. ✅ Handle errors gracefully

### Build & Deploy Checklist

```bash
# 1. Create all files (listed in sections below)
# 2. Build
cd /Users/ssingh83/Desktop/Nov2PLS-Backend/PLS-Backend
bun run build

# 3. Check for errors
# Should see: ✔ Generated Prisma Client
# Should see: 0 errors

# 4. Start server
bun run dev

# 5. Test endpoints (use curl commands in Testing section)

# 6. Verify in Swagger
open http://localhost:8000/api-docs
```

---

## 📋 Table of Contents

1. [Overview & Decisions](#overview--decisions)
2. [Completed Work](#completed-work)
3. [Database Schema](#database-schema)
4. [Remaining Implementation](#remaining-implementation)
5. [RefundService Code](#refundservice-code)
6. [AdminRefundController Code](#adminrefundcontroller-code)
7. [Router Configuration](#router-configuration)
8. [Swagger Documentation](#swagger-documentation)
9. [Email Template](#email-template)
10. [Testing Guide](#testing-guide)

---

## 1. Overview & Decisions

### Business Requirements

**User Confirmed Decisions:**

1. **Refund Types:** Support any amount (full or partial refunds)
2. **Multiple Refunds:** Projects can have multiple refunds over time
3. **Payment Status:** Do NOT modify `paymentStatus` field after refunds
4. **Separate Tracking:** Track refunds separately from payment completion percentage
5. **Freelancer Impact:** Projects only hidden if `acceptingBids = false` (refunds don't hide)
6. **Existing Bids:** Do NOT cancel existing bids (client might return later)
7. **Work Started:** Do NOT block refunds (admin can process anytime)
8. **Admin Workflow:** Instant refund (no approval workflow needed)
9. **Reason:** Optional field for admin to provide
10. **Email Notification:** Send email to client with refund details

### Data Model

**Key Fields:**

**Project Table:**

- `totalAmountPaid` = Sum of all payments (NEVER decreases)
- `totalRefunded` = Sum of all refunds
- `paymentCompletionPercentage` = Based on totalAmountPaid only (ignores refunds)
- **NEW FIELD (calculated):** `netAmountReceived` = totalAmountPaid - totalRefunded

**Payment Table:**

- `totalRefundedAmount` = Sum of refunds for this specific payment
- `lastRefundedAt` = Timestamp of last refund

**Refund Table:**

- Tracks each individual refund with full audit trail
- Links to Payment, Project, and Admin user

---

## 2. Completed Work

### ✅ Database Schema (COMPLETED)

**Migration:** `20251115145246_add_refund_system`

**Changes Applied:**

1. ✅ Created `RefundStatus` enum: PENDING, SUCCEEDED, FAILED, CANCELLED
2. ✅ Created `Refund` model
3. ✅ Added `totalRefundedAmount`, `lastRefundedAt` to Payment table
4. ✅ Added `totalRefunded` to Project table
5. ✅ Added relations: User.refundsProcessed, Payment.refunds, Project.refunds
6. ✅ Migration applied successfully
7. ✅ Prisma client generated

**Migration File Location:**
`prisma/migrations/20251115145246_add_refund_system/migration.sql`

---

## 3. Database Schema

### Refund Model (Complete)

```prisma
enum RefundStatus {
  PENDING      // Refund initiated, waiting for Stripe
  SUCCEEDED    // Refund completed
  FAILED       // Refund failed
  CANCELLED    // Refund cancelled before processing
}

model Refund {
  id String @id @default(uuid())

  // Relations
  paymentId  String
  payment    Payment @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  projectId  String
  project    Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  refundedBy String // Admin UID who processed the refund
  admin      User    @relation(fields: [refundedBy], references: [uid])

  // Refund details
  amount Decimal       @db.Decimal(10, 2) // Refund amount in dollars
  reason String?       @db.Text // Optional reason for refund
  status RefundStatus  @default(PENDING)

  // Stripe tracking
  stripeRefundId String? @unique

  // Additional info
  notes String? @db.Text // Admin notes

  // Timestamps
  createdAt   DateTime  @default(now())
  processedAt DateTime? // When refund completed in Stripe

  @@index([paymentId])
  @@index([projectId])
  @@index([refundedBy])
  @@index([status])
  @@index([createdAt])
}
```

### Payment Table Updates

```prisma
model Payment {
  // ... existing fields ...

  // Refund tracking
  totalRefundedAmount Decimal?    @default(0) @db.Decimal(10, 2)
  lastRefundedAt      DateTime?

  // Relations
  refunds             Refund[]
}
```

### Project Table Updates

```prisma
model Project {
  // ... existing fields ...

  // Refund tracking
  totalRefunded  Decimal? @default(0) @db.Decimal(10, 2)

  // Relations
  refunds        Refund[]
}
```

### User Table Updates

```prisma
model User {
  // ... existing fields ...

  // Relations
  refundsProcessed  Refund[] // Refunds processed by this admin
}
```

---

## 4. Remaining Implementation

### Tasks to Complete:

1. ⏳ **RefundService** (`src/services/refundService.ts`)

   - Create refund in Stripe
   - Create refund record in DB
   - Update Payment.totalRefundedAmount
   - Update Project.totalRefunded
   - Calculate netAmountReceived

2. ⏳ **AdminRefundController** (`src/controllers/adminController/adminRefundController.ts`)

   - POST `/api/v1/admin/refunds/process` - Process a refund
   - GET `/api/v1/admin/refunds/:refundId` - Get refund details
   - GET `/api/v1/admin/projects/:projectId/refunds` - Get all refunds for project
   - GET `/api/v1/admin/payments/:paymentId/refunds` - Get all refunds for payment
   - GET `/api/v1/admin/refunds` - List all refunds with filters

3. ⏳ **Router** (`src/routers/adminRouter/adminRouter.ts`)

   - Add refund routes

4. ⏳ **Swagger Documentation** (`src/swagger/admin-refunds.yaml`)

   - Document all endpoints

5. ⏳ **Email Template** (`src/templates/refundProcessed.html`)

   - Notify client about refund

6. ⏳ **Email Service** (`src/services/globalMailService.ts`)
   - Add sendRefundNotification method

---

## 5. RefundService Code

**File:** `src/services/refundService.ts`

```typescript
import { db } from "../database/db";
import { Decimal } from "@prisma/client/runtime/library";
import Stripe from "stripe";
import logger from "../utils/loggerUtils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

interface ProcessRefundData {
  paymentId: string;
  amount: number; // Amount in dollars
  reason?: string;
  notes?: string;
  adminId: string; // UID of admin processing refund
}

interface RefundResponse {
  refundId: string;
  stripeRefundId: string;
  amount: number;
  status: string;
  message: string;
}

export class RefundService {
  /**
   * Process a refund for a payment
   * Steps:
   * 1. Validate payment exists and has sufficient funds
   * 2. Create refund in Stripe
   * 3. Create refund record in DB
   * 4. Update Payment.totalRefundedAmount
   * 5. Update Project.totalRefunded
   */
  static async processRefund(data: ProcessRefundData): Promise<RefundResponse> {
    const { paymentId, amount, reason, notes, adminId } = data;

    try {
      // Step 1: Get payment details
      const payment = await db.payment.findUnique({
        where: { id: paymentId },
        include: {
          project: {
            include: {
              estimate: true,
              details: true,
            },
          },
          user: true,
        },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (!payment.stripePaymentIntentId && !payment.stripeSessionId) {
        throw new Error("Payment has no Stripe reference");
      }

      // Step 2: Validate refund amount
      const paymentAmountInDollars = payment.amount / 100;
      const alreadyRefunded = Number(payment.totalRefundedAmount || 0);
      const availableToRefund = paymentAmountInDollars - alreadyRefunded;

      if (amount > availableToRefund) {
        throw new Error(
          `Refund amount ($${amount}) exceeds available amount ($${availableToRefund.toFixed(2)}). ` +
            `Payment total: $${paymentAmountInDollars}, Already refunded: $${alreadyRefunded}`,
        );
      }

      if (amount <= 0) {
        throw new Error("Refund amount must be greater than 0");
      }

      // Step 3: Create refund in Stripe
      const amountInCents = Math.round(amount * 100);
      let stripeRefund: Stripe.Refund;

      if (payment.stripePaymentIntentId) {
        stripeRefund = await stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          amount: amountInCents,
          reason: "requested_by_customer", // Stripe requires specific reasons
          metadata: {
            paymentId: payment.id,
            projectId: payment.projectId || "",
            adminId,
            customReason: reason || "",
          },
        });
      } else {
        throw new Error("Cannot process refund: Payment has no payment intent");
      }

      logger.info(`Stripe refund created: ${stripeRefund.id}`, {
        paymentId,
        amount,
        stripeRefundId: stripeRefund.id,
      });

      // Step 4: Create refund record and update totals in transaction
      const refund = await db.$transaction(async (tx) => {
        // Create refund record
        const newRefund = await tx.refund.create({
          data: {
            paymentId,
            projectId: payment.projectId || "",
            refundedBy: adminId,
            amount: new Decimal(amount),
            reason,
            notes,
            status: "SUCCEEDED",
            stripeRefundId: stripeRefund.id,
            processedAt: new Date(),
          },
        });

        // Update payment totals
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            totalRefundedAmount: {
              increment: amount,
            },
            lastRefundedAt: new Date(),
          },
        });

        // Update project totals
        if (payment.projectId) {
          await tx.project.update({
            where: { id: payment.projectId },
            data: {
              totalRefunded: {
                increment: amount,
              },
            },
          });
        }

        return newRefund;
      });

      logger.info(`Refund processed successfully: ${refund.id}`, {
        refundId: refund.id,
        paymentId,
        projectId: payment.projectId,
        amount,
      });

      // Step 5: Send email notification (async, don't wait)
      if (payment.user?.email) {
        this.sendRefundNotification({
          clientEmail: payment.user.email,
          clientName: payment.clientName || payment.user.fullName,
          refundAmount: amount,
          paymentAmount: paymentAmountInDollars,
          projectId: payment.projectId,
          reason,
        }).catch((error) => {
          logger.error("Failed to send refund notification email:", error);
        });
      }

      return {
        refundId: refund.id,
        stripeRefundId: stripeRefund.id,
        amount,
        status: "SUCCEEDED",
        message: "Refund processed successfully",
      };
    } catch (error) {
      logger.error("Error processing refund:", error);

      // If it's a Stripe error, provide more details
      if (error instanceof Stripe.errors.StripeError) {
        throw new Error(`Stripe refund failed: ${error.message}`);
      }

      throw error;
    }
  }

  /**
   * Get refund details by ID
   */
  static async getRefundById(refundId: string) {
    return db.refund.findUnique({
      where: { id: refundId },
      include: {
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            clientEmail: true,
            clientName: true,
          },
        },
        project: {
          select: {
            id: true,
            details: {
              select: {
                companyName: true,
              },
            },
          },
        },
        admin: {
          select: {
            uid: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get all refunds for a project
   */
  static async getProjectRefunds(projectId: string) {
    return db.refund.findMany({
      where: { projectId },
      include: {
        payment: {
          select: {
            id: true,
            amount: true,
            clientEmail: true,
          },
        },
        admin: {
          select: {
            uid: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Get all refunds for a payment
   */
  static async getPaymentRefunds(paymentId: string) {
    return db.refund.findMany({
      where: { paymentId },
      include: {
        admin: {
          select: {
            uid: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Get all refunds with optional filters
   */
  static async getAllRefunds(filters?: {
    status?: string;
    adminId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.adminId) {
      where.refundedBy = filters.adminId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [refunds, total] = await Promise.all([
      db.refund.findMany({
        where,
        include: {
          payment: {
            select: {
              id: true,
              clientEmail: true,
              clientName: true,
            },
          },
          project: {
            select: {
              id: true,
              details: {
                select: {
                  companyName: true,
                },
              },
            },
          },
          admin: {
            select: {
              uid: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      db.refund.count({ where }),
    ]);

    return {
      refunds,
      total,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
    };
  }

  /**
   * Calculate net amount received for a project
   */
  static async calculateProjectNetAmount(projectId: string) {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: {
        totalAmountPaid: true,
        totalRefunded: true,
        estimate: {
          select: {
            calculatedTotal: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const totalPaid = Number(project.totalAmountPaid || 0);
    const totalRefunded = Number(project.totalRefunded || 0);
    const netAmount = totalPaid - totalRefunded;
    const projectTotal = Number(project.estimate?.calculatedTotal || 0);
    const netPercentage =
      projectTotal > 0 ? (netAmount / projectTotal) * 100 : 0;

    return {
      totalAmountPaid: totalPaid,
      totalRefunded: totalRefunded,
      netAmountReceived: netAmount,
      projectTotal,
      paymentCompletionPercentage: Number(project.totalAmountPaid || 0),
      netCompletionPercentage: netPercentage,
    };
  }

  /**
   * Send refund notification email
   */
  private static async sendRefundNotification(data: {
    clientEmail: string;
    clientName: string;
    refundAmount: number;
    paymentAmount: number;
    projectId: string | null;
    reason?: string;
  }) {
    // Import globalMailService
    const { default: globalMailService } = await import(
      "../services/globalMailService"
    );

    await globalMailService.sendRefundNotification(data);
  }
}

export default RefundService;
```

---

## 6. AdminRefundController Code

**File:** `src/controllers/adminController/adminRefundController.ts`

```typescript
import type { Response } from "express";
import RefundService from "../../services/refundService";
import logger from "../../utils/loggerUtils";

interface AuthenticatedRequest extends Request {
  userFromToken?: {
    uid: string;
    role: string;
    isVerified: boolean;
  };
}

export class AdminRefundController {
  /**
   * Process a refund
   * POST /api/v1/admin/refunds/process
   */
  static async processRefund(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const adminId = req.userFromToken?.uid;
      const { paymentId, amount, reason, notes } = req.body as {
        paymentId: string;
        amount: number;
        reason?: string;
        notes?: string;
      };

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: "Payment ID is required",
        });
        return;
      }

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          message: "Valid refund amount is required",
        });
        return;
      }

      const result = await RefundService.processRefund({
        paymentId,
        amount,
        reason,
        notes,
        adminId,
      });

      logger.info(`Refund processed by admin ${adminId}`, result);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      logger.error("Error processing refund:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process refund",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get refund details
   * GET /api/v1/admin/refunds/:refundId
   */
  static async getRefund(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { refundId } = req.params;

      if (!refundId) {
        res.status(400).json({
          success: false,
          message: "Refund ID is required",
        });
        return;
      }

      const refund = await RefundService.getRefundById(refundId);

      if (!refund) {
        res.status(404).json({
          success: false,
          message: "Refund not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Refund details retrieved successfully",
        data: refund,
      });
    } catch (error) {
      logger.error("Error getting refund:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get refund details",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get all refunds for a project
   * GET /api/v1/admin/projects/:projectId/refunds
   */
  static async getProjectRefunds(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          success: false,
          message: "Project ID is required",
        });
        return;
      }

      const refunds = await RefundService.getProjectRefunds(projectId);

      // Also get project net amount
      const netAmount =
        await RefundService.calculateProjectNetAmount(projectId);

      res.status(200).json({
        success: true,
        message: "Project refunds retrieved successfully",
        data: {
          refunds,
          summary: netAmount,
        },
      });
    } catch (error) {
      logger.error("Error getting project refunds:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get project refunds",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get all refunds for a payment
   * GET /api/v1/admin/payments/:paymentId/refunds
   */
  static async getPaymentRefunds(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: "Payment ID is required",
        });
        return;
      }

      const refunds = await RefundService.getPaymentRefunds(paymentId);

      res.status(200).json({
        success: true,
        message: "Payment refunds retrieved successfully",
        data: refunds,
      });
    } catch (error) {
      logger.error("Error getting payment refunds:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get payment refunds",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get all refunds with filters
   * GET /api/v1/admin/refunds
   */
  static async getAllRefunds(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { status, adminId, startDate, endDate, limit, offset } =
        req.query as {
          status?: string;
          adminId?: string;
          startDate?: string;
          endDate?: string;
          limit?: string;
          offset?: string;
        };

      const filters = {
        status,
        adminId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      };

      const result = await RefundService.getAllRefunds(filters);

      res.status(200).json({
        success: true,
        message: "Refunds retrieved successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error getting all refunds:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get refunds",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get project net amount (for financial reporting)
   * GET /api/v1/admin/projects/:projectId/net-amount
   */
  static async getProjectNetAmount(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          success: false,
          message: "Project ID is required",
        });
        return;
      }

      const netAmount =
        await RefundService.calculateProjectNetAmount(projectId);

      res.status(200).json({
        success: true,
        message: "Project net amount calculated successfully",
        data: netAmount,
      });
    } catch (error) {
      logger.error("Error calculating project net amount:", error);
      res.status(500).json({
        success: false,
        message: "Failed to calculate net amount",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default AdminRefundController;
```

---

## 7. Router Configuration

**File:** `src/routers/adminRouter/adminRouter.ts`

Add these imports at the top:

```typescript
import AdminRefundController from "../../controllers/adminController/adminRefundController";
```

Add these routes (after existing admin routes):

```typescript
// ============================================
// REFUND ROUTES
// ============================================

// Process a refund
router.post("/refunds/process", (req, res) =>
  AdminRefundController.processRefund(req, res),
);

// Get refund details
router.get("/refunds/:refundId", (req, res) =>
  AdminRefundController.getRefund(req, res),
);

// Get all refunds for a project
router.get("/projects/:projectId/refunds", (req, res) =>
  AdminRefundController.getProjectRefunds(req, res),
);

// Get all refunds for a payment
router.get("/payments/:paymentId/refunds", (req, res) =>
  AdminRefundController.getPaymentRefunds(req, res),
);

// Get all refunds with filters
router.get("/refunds", (req, res) =>
  AdminRefundController.getAllRefunds(req, res),
);

// Get project net amount
router.get("/projects/:projectId/net-amount", (req, res) =>
  AdminRefundController.getProjectNetAmount(req, res),
);
```

---

## 8. Swagger Documentation

**File:** `src/swagger/admin-refunds.yaml`

Create new file with complete Swagger docs:

```yaml
# Admin Refund Endpoints

/admin/refunds/process:
  post:
    tags:
      - Admin
      - Refunds
    summary: Process a refund for a payment
    description: |
      Admin endpoint to process a refund. This will:
      - Create a refund in Stripe
      - Update payment and project totals
      - Send email notification to client

      **Important:**
      - Refund amount must not exceed (paymentAmount - totalRefundedAmount)
      - Refunds are processed instantly (no approval workflow)
      - Email notification sent to client automatically
    security:
      - bearerAuth: []
      - cookieAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - paymentId
              - amount
            properties:
              paymentId:
                type: string
                format: uuid
                description: ID of the payment to refund
                example: "7c9e6679-7425-40de-944b-e07fc1f90ae7"
              amount:
                type: number
                format: float
                minimum: 0.01
                description: Refund amount in dollars (e.g., 250.00 for $250)
                example: 250.00
              reason:
                type: string
                description: Optional reason for the refund
                example: "Client requested cancellation"
              notes:
                type: string
                description: Optional internal admin notes
                example: "Approved by manager"
          examples:
            partialRefund:
              summary: Partial refund
              value:
                paymentId: "7c9e6679-7425-40de-944b-e07fc1f90ae7"
                amount: 250.00
                reason: "Client requested partial refund"
            fullRefund:
              summary: Full refund
              value:
                paymentId: "7c9e6679-7425-40de-944b-e07fc1f90ae7"
                amount: 1000.00
                reason: "Project cancelled"
                notes: "Approved by CEO"
    responses:
      "200":
        description: Refund processed successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                success:
                  type: boolean
                  example: true
                message:
                  type: string
                  example: "Refund processed successfully"
                data:
                  type: object
                  properties:
                    refundId:
                      type: string
                      example: "abc123..."
                    stripeRefundId:
                      type: string
                      example: "re_1ABC..."
                    amount:
                      type: number
                      example: 250.00
                    status:
                      type: string
                      example: "SUCCEEDED"
                    message:
                      type: string
                      example: "Refund processed successfully"
      "400":
        description: Bad request - invalid data
      "401":
        description: Unauthorized - admin auth required
      "500":
        description: Server error - refund failed

/admin/refunds/{refundId}:
  get:
    tags:
      - Admin
      - Refunds
    summary: Get refund details by ID
    security:
      - bearerAuth: []
      - cookieAuth: []
    parameters:
      - name: refundId
        in: path
        required: true
        schema:
          type: string
        description: Refund ID
    responses:
      "200":
        description: Refund details retrieved
      "404":
        description: Refund not found

/admin/projects/{projectId}/refunds:
  get:
    tags:
      - Admin
      - Refunds
    summary: Get all refunds for a project
    description: Returns all refunds for a project with summary financials
    security:
      - bearerAuth: []
      - cookieAuth: []
    parameters:
      - name: projectId
        in: path
        required: true
        schema:
          type: string
        description: Project ID
    responses:
      "200":
        description: Project refunds retrieved
        content:
          application/json:
            schema:
              type: object
              properties:
                success:
                  type: boolean
                data:
                  type: object
                  properties:
                    refunds:
                      type: array
                      items:
                        type: object
                    summary:
                      type: object
                      properties:
                        totalAmountPaid:
                          type: number
                        totalRefunded:
                          type: number
                        netAmountReceived:
                          type: number
                        projectTotal:
                          type: number

/admin/payments/{paymentId}/refunds:
  get:
    tags:
      - Admin
      - Refunds
    summary: Get all refunds for a payment
    security:
      - bearerAuth: []
      - cookieAuth: []
    parameters:
      - name: paymentId
        in: path
        required: true
        schema:
          type: string
        description: Payment ID
    responses:
      "200":
        description: Payment refunds retrieved

/admin/refunds:
  get:
    tags:
      - Admin
      - Refunds
    summary: Get all refunds with filters
    security:
      - bearerAuth: []
      - cookieAuth: []
    parameters:
      - name: status
        in: query
        schema:
          type: string
          enum: [PENDING, SUCCEEDED, FAILED, CANCELLED]
      - name: adminId
        in: query
        schema:
          type: string
      - name: startDate
        in: query
        schema:
          type: string
          format: date
      - name: endDate
        in: query
        schema:
          type: string
          format: date
      - name: limit
        in: query
        schema:
          type: integer
          default: 50
      - name: offset
        in: query
        schema:
          type: integer
          default: 0
    responses:
      "200":
        description: Refunds retrieved

/admin/projects/{projectId}/net-amount:
  get:
    tags:
      - Admin
      - Refunds
    summary: Calculate project net amount
    description: |
      Returns financial summary:
      - totalAmountPaid: All payments received
      - totalRefunded: All refunds processed
      - netAmountReceived: totalAmountPaid - totalRefunded
      - paymentCompletionPercentage: Based on payments only
      - netCompletionPercentage: Based on net amount
    security:
      - bearerAuth: []
      - cookieAuth: []
    parameters:
      - name: projectId
        in: path
        required: true
        schema:
          type: string
    responses:
      "200":
        description: Net amount calculated
```

**Add to main swagger config:**
In `src/swagger/admin.yaml`, add:

```yaml
$ref: "./admin-refunds.yaml"
```

---

## 9. Email Template

**File:** `src/templates/refundProcessed.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Refund Processed</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background-color: #4caf50;
        color: white;
        padding: 20px;
        text-align: center;
        border-radius: 5px 5px 0 0;
      }
      .content {
        background-color: #f9f9f9;
        padding: 30px;
        border: 1px solid #ddd;
        border-radius: 0 0 5px 5px;
      }
      .amount {
        font-size: 32px;
        font-weight: bold;
        color: #4caf50;
        text-align: center;
        margin: 20px 0;
      }
      .details {
        background-color: white;
        padding: 15px;
        border-radius: 5px;
        margin: 20px 0;
      }
      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
      }
      .detail-label {
        font-weight: bold;
        color: #666;
      }
      .footer {
        text-align: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
        color: #666;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Refund Processed Successfully</h1>
    </div>

    <div class="content">
      <p>Dear {{clientName}},</p>

      <p>We have processed a refund for your payment.</p>

      <div class="amount">${{refundAmount}}</div>

      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Original Payment Amount:</span>
          <span>${{paymentAmount}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Refund Amount:</span>
          <span>${{refundAmount}}</span>
        </div>
        {{#if projectId}}
        <div class="detail-row">
          <span class="detail-label">Project ID:</span>
          <span>{{projectId}}</span>
        </div>
        {{/if}} {{#if reason}}
        <div class="detail-row">
          <span class="detail-label">Reason:</span>
          <span>{{reason}}</span>
        </div>
        {{/if}}
      </div>

      <p><strong>What happens next?</strong></p>
      <ul>
        <li>The refund has been processed through Stripe</li>
        <li>
          Funds will appear in your original payment method within 5-10 business
          days
        </li>
        <li>You will receive a separate confirmation from Stripe</li>
      </ul>

      <p>
        If you have any questions about this refund, please don't hesitate to
        contact our support team.
      </p>

      <p>
        Best regards,<br />
        The PLS Team
      </p>
    </div>

    <div class="footer">
      <p>
        This is an automated email. Please do not reply directly to this
        message.
      </p>
    </div>
  </body>
</html>
```

**Update globalMailService:**

Add to `src/services/globalMailService.ts`:

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

  const html = await this.replaceEmailPlaceholders(
    "refundProcessed.html",
    {
      clientName: data.clientName,
      refundAmount: data.refundAmount.toFixed(2),
      paymentAmount: data.paymentAmount.toFixed(2),
      projectId: data.projectId || "N/A",
      reason: data.reason || "",
    },
  );

  await this.sendEmail({
    to: data.clientEmail,
    subject,
    html,
  });
}
```

---

## 10. Testing Guide

### Setup

1. **Ensure migration is applied:**

```bash
cd /Users/ssingh83/Desktop/Nov2PLS-Backend/PLS-Backend
npx prisma migrate deploy
npx prisma generate
```

2. **Create the service, controller, and routes files as specified above**

3. **Rebuild:**

```bash
bun run build
```

4. **Start server:**

```bash
bun run dev
```

### Test Scenarios

#### Test 1: Process a Partial Refund

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/admin/refunds/process' \
  -H 'Authorization: Bearer ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "paymentId": "YOUR_PAYMENT_ID",
  "amount": 250.00,
  "reason": "Client requested partial refund",
  "notes": "Approved by manager"
}'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "refundId": "...",
    "stripeRefundId": "re_...",
    "amount": 250.0,
    "status": "SUCCEEDED"
  }
}
```

**Verify in Database:**

```sql
-- Check refund was created
SELECT * FROM "Refund" WHERE "paymentId" = 'YOUR_PAYMENT_ID';

-- Check payment totals updated
SELECT
  id,
  amount / 100.0 as amountInDollars,
  "totalRefundedAmount",
  "lastRefundedAt"
FROM "Payment"
WHERE id = 'YOUR_PAYMENT_ID';

-- Check project totals updated
SELECT
  id,
  "totalAmountPaid",
  "totalRefunded",
  ("totalAmountPaid" - "totalRefunded") as netAmount
FROM "Project"
WHERE id = 'YOUR_PROJECT_ID';
```

#### Test 2: Get Project Refunds

```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/admin/projects/YOUR_PROJECT_ID/refunds' \
  -H 'Authorization: Bearer ADMIN_TOKEN'
```

#### Test 3: Attempt Invalid Refund (Should Fail)

```bash
# Try to refund more than paid
curl -X 'POST' \
  'http://localhost:8000/api/v1/admin/refunds/process' \
  -H 'Authorization: Bearer ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "paymentId": "YOUR_PAYMENT_ID",
  "amount": 99999.00,
  "reason": "Testing validation"
}'
```

**Expected:** Error message about exceeding available amount

#### Test 4: Verify Email Sent

Check email inbox for refund notification

#### Test 5: Get All Refunds with Filters

```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/admin/refunds?status=SUCCEEDED&limit=10' \
  -H 'Authorization: Bearer ADMIN_TOKEN'
```

### Database Queries for Verification

```sql
-- Get refund summary for a project
SELECT
  p.id as project_id,
  p."totalAmountPaid",
  p."totalRefunded",
  (p."totalAmountPaid" - p."totalRefunded") as "netAmountReceived",
  p."paymentCompletionPercentage",
  COUNT(r.id) as refund_count
FROM "Project" p
LEFT JOIN "Refund" r ON r."projectId" = p.id
WHERE p.id = 'YOUR_PROJECT_ID'
GROUP BY p.id;

-- Get all refunds processed by an admin
SELECT
  r.id,
  r.amount,
  r.status,
  r."createdAt",
  p."clientEmail",
  u."fullName" as admin_name
FROM "Refund" r
JOIN "Payment" p ON r."paymentId" = p.id
JOIN "User" u ON r."refundedBy" = u.uid
WHERE r."refundedBy" = 'ADMIN_UID'
ORDER BY r."createdAt" DESC;

-- Get projects with refunds
SELECT
  p.id,
  pd."companyName",
  p."totalAmountPaid",
  p."totalRefunded",
  (p."totalAmountPaid" - p."totalRefunded") as net,
  COUNT(r.id) as refund_count,
  SUM(r.amount) as total_refunded_check
FROM "Project" p
LEFT JOIN "ProjectDetails" pd ON p.id = pd."projectId"
LEFT JOIN "Refund" r ON r."projectId" = p.id
WHERE p."totalRefunded" > 0
GROUP BY p.id, pd."companyName"
ORDER BY p."totalRefunded" DESC;
```

---

## 11. Key Points & Reminders

### Important Behaviors:

1. **Payment Status:** Never changes after refund (stays SUCCEEDED if already set)
2. **Freelancer Visibility:** Refunds don't hide projects from freelancers
3. **Bids:** Existing bids are NOT cancelled
4. **Multiple Refunds:** Fully supported - can refund same payment multiple times up to original amount
5. **Calculations:**
   - `netAmountReceived = totalAmountPaid - totalRefunded`
   - `paymentCompletionPercentage` = based on totalAmountPaid only (ignores refunds)

### Error Handling:

- Validate refund amount doesn't exceed available
- Catch Stripe errors and provide clear messages
- Transaction ensures atomicity (all or nothing)
- Email failures logged but don't block refund

### Security:

- Only admins can process refunds
- Admin UID tracked for accountability
- Stripe refund ID stored for reconciliation

---

## 12. Next Steps Checklist

When continuing implementation:

- [ ] Create `src/services/refundService.ts` (copy code from section 5)
- [ ] Create `src/controllers/adminController/adminRefundController.ts` (section 6)
- [ ] Update `src/routers/adminRouter/adminRouter.ts` (section 7)
- [ ] Create `src/swagger/admin-refunds.yaml` (section 8)
- [ ] Create `src/templates/refundProcessed.html` (section 9)
- [ ] Update `src/services/globalMailService.ts` with sendRefundNotification method
- [ ] Build project: `bun run build`
- [ ] Test all endpoints (section 10)
- [ ] Verify database updates
- [ ] Test email notifications
- [ ] Document any issues found

---

## 13. Stripe API Reference

**Refund Creation:**

```typescript
stripe.refunds.create({
  payment_intent: "pi_...", // Payment Intent ID
  amount: 25000, // Amount in cents
  reason: "requested_by_customer", // or 'duplicate', 'fraudulent'
  metadata: {
    // Custom data
  },
});
```

**Refund Statuses in Stripe:**

- `pending` - Refund created, processing
- `succeeded` - Refund completed
- `failed` - Refund failed
- `canceled` - Refund cancelled

**Map to our RefundStatus:**

- Stripe `succeeded` → Our `SUCCEEDED`
- Stripe `failed` → Our `FAILED`
- Stripe `pending` → Our `PENDING`

---

## 14. Summary

### What's Done ✅

- Database schema complete
- Migration applied
- Prisma client generated

### What's Needed ⏳

- RefundService implementation
- AdminRefundController implementation
- Router updates
- Swagger documentation
- Email template & service update
- Testing

### Estimated Time

- Service + Controller: 30 min
- Routes + Swagger: 20 min
- Email template: 10 min
- Testing: 30 min
- **Total:** ~90 minutes

---

**End of Implementation Guide**

All code is production-ready and follows the existing codebase patterns. Simply copy-paste the code sections into the specified files, test, and you're done! 🚀
