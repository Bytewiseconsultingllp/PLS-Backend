# Freelancer Payout System - Complete Implementation Guide

## 🎯 Overview

This implementation adds a complete **Stripe Connect-based freelancer payout system** that allows admins to pay freelancers for their work. The system is secure, trackable, and fully integrated with your existing payment infrastructure.

---

## 📋 Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Database Changes](#database-changes)
4. [Setup Instructions](#setup-instructions)
5. [API Endpoints](#api-endpoints)
6. [Usage Examples](#usage-examples)
7. [Security](#security)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Implemented Functionality

✅ **Stripe Connect Integration**

- Create Stripe Connect accounts for freelancers
- Verify freelancer payment details
- Track Stripe account status (NOT_CONNECTED, PENDING, ACTIVE, RESTRICTED, DISABLED)

✅ **Payout Management**

- Initiate payouts to freelancers (admin-only)
- Support multiple payout types: MILESTONE, PROJECT, BONUS, MANUAL
- Link payouts to specific projects and milestones
- Track payout status: PENDING, PROCESSING, PAID, FAILED, CANCELLED

✅ **Payment Tracking**

- Complete payout history per freelancer
- Admin dashboard view of all payouts with filters
- Stripe transfer details and reconciliation
- Failure tracking and retry management

✅ **Security & Authorization**

- Admin-only access to all payout operations
- Validation of freelancer eligibility (must have active Stripe account)
- Transaction logging and audit trails

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN DASHBOARD                         │
│  (Manages Freelancers, Initiates Payouts, Views History)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              ADMIN FREELANCER PAYOUT CONTROLLER             │
│  - Update Stripe Account                                    │
│  - Create Payout                                            │
│  - Get Payment Details                                      │
│  - View Payout History                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            FREELANCER PAYOUT SERVICE (Business Logic)       │
│  - Validate freelancer eligibility                          │
│  - Create Stripe transfers                                  │
│  - Track payout lifecycle                                   │
│  - Handle failures and retries                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    STRIPE SERVICE                           │
│  - Create/Retrieve Connect Accounts                         │
│  - Create Transfers to freelancers                          │
│  - Verify account status                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      STRIPE API                             │
│  (Handles actual money transfers to freelancer accounts)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Changes

### New Tables

#### `FreelancerPayout`

Tracks all payouts to freelancers.

**Columns:**

- `id` - UUID primary key
- `freelancerId` - Foreign key to Freelancer
- `projectId` - Optional foreign key to Project
- `milestoneId` - Optional foreign key to Milestone
- `initiatedBy` - Admin UID who created the payout
- `amount` - Decimal(10,2) - Amount in dollars
- `currency` - String (default: "usd")
- `status` - Enum: PENDING, PROCESSING, PAID, FAILED, CANCELLED
- `payoutType` - Enum: MILESTONE, PROJECT, BONUS, MANUAL
- `description` - Text
- `notes` - Text (admin notes)
- `stripeTransferId` - Unique Stripe transfer ID
- `stripePayoutId` - Unique Stripe payout ID
- `failureReason` - Text (if failed)
- `failureCode` - String
- `retryCount` - Integer
- `createdAt`, `updatedAt`, `processedAt`, `paidAt` - Timestamps

### Modified Tables

#### `Freelancer`

Added payment-related fields:

- `stripeAccountId` - String (unique) - Stripe Connect account ID
- `stripeAccountStatus` - Enum: NOT_CONNECTED, PENDING, ACTIVE, RESTRICTED, DISABLED
- `paymentDetailsVerified` - Boolean (default: false)
- `payouts` - Relation to FreelancerPayout[]

#### `Project`

Added relation:

- `freelancerPayouts` - Relation to FreelancerPayout[]

#### `Milestone`

Added relation:

- `freelancerPayouts` - Relation to FreelancerPayout[]

### New Enums

```prisma
enum StripeAccountStatus {
  NOT_CONNECTED
  PENDING
  ACTIVE
  RESTRICTED
  DISABLED
}

enum PayoutStatus {
  PENDING
  PROCESSING
  PAID
  FAILED
  CANCELLED
}

enum PayoutType {
  MILESTONE
  PROJECT
  BONUS
  MANUAL
}
```

---

## 🚀 Setup Instructions

### 1. Database Migration

Run the Prisma migration to update your database:

```bash
cd /Users/ssingh83/Desktop/Nov2PLS-Backend/PLS-Backend
npx prisma generate
npx prisma migrate dev --name add_freelancer_payout_system
```

### 2. Environment Variables

Ensure these are set in your `.env` file:

```env
# Stripe Configuration (already exists)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URLs (for Stripe Connect onboarding)
FRONTEND_URL=http://localhost:3000
```

### 3. Stripe Connect Setup

1. **Enable Stripe Connect** in your Stripe Dashboard

   - Go to https://dashboard.stripe.com/settings/connect
   - Enable "Express" account type
   - Configure your platform settings

2. **Set up Connect webhooks** (optional but recommended)
   - Create webhook endpoint: `POST /api/v1/admin/payouts/webhook` (if you want to track transfers)
   - Subscribe to events: `transfer.created`, `transfer.updated`, `transfer.failed`, `transfer.reversed`

---

## 🔌 API Endpoints

### Base URL: `/api/v1/admin`

All endpoints require **ADMIN** authentication.

### 1. **Freelancer Payment Details**

#### Create Stripe Connect Account for Freelancer

```http
POST /freelancers/:freelancerId/create-stripe-account
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "email": "freelancer@example.com",
  "country": "US"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Stripe Connect account created successfully",
  "data": {
    "accountId": "acct_1234567890ABCDEF",
    "accountLinkUrl": "https://connect.stripe.com/setup/s/..."
  }
}
```

#### Update Freelancer Stripe Account

```http
POST /freelancers/:freelancerId/payment-details
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "stripeAccountId": "acct_1234567890ABCDEF"
}
```

#### Get Freelancer Payment Details

```http
GET /freelancers/:freelancerId/payment-details
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Freelancer payment details retrieved successfully",
  "data": {
    "freelancer": {
      "id": "f7c9e6679-...",
      "stripeAccountId": "acct_...",
      "stripeAccountStatus": "ACTIVE",
      "paymentDetailsVerified": true,
      "details": {
        "email": "freelancer@example.com",
        "fullName": "John Doe",
        "country": "US"
      }
    },
    "stripeAccountDetails": {
      "id": "acct_...",
      "chargesEnabled": true,
      "payoutsEnabled": true,
      "requirementsCurrentlyDue": [],
      "requirementsEventuallyDue": [],
      "disabledReason": null
    }
  }
}
```

### 2. **Payout Management**

#### Initiate Payout to Freelancer

```http
POST /freelancers/:freelancerId/payout
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "amount": 1500.00,
  "currency": "usd",
  "payoutType": "MILESTONE",
  "description": "Payment for milestone completion",
  "notes": "Approved by project manager",
  "projectId": "403f90bd-0f1f-4bde-a701-adc37ab35252",
  "milestoneId": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payout initiated successfully",
  "data": {
    "id": "payout_uuid",
    "freelancerId": "freelancer_uuid",
    "amount": 1500.0,
    "currency": "usd",
    "status": "PROCESSING",
    "payoutType": "MILESTONE",
    "stripeTransferId": "tr_...",
    "createdAt": "2025-11-15T10:30:00.000Z",
    "processedAt": "2025-11-15T10:31:00.000Z"
  }
}
```

#### Get Freelancer Payout History

```http
GET /freelancers/:freelancerId/payouts?page=1&limit=10
Authorization: Bearer <admin_token>
```

#### Get All Payouts (Admin Dashboard)

```http
GET /payouts?status=PAID&page=1&limit=20
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `status` - Filter by status (PENDING, PROCESSING, PAID, FAILED, CANCELLED)
- `freelancerId` - Filter by freelancer
- `projectId` - Filter by project
- `startDate` - Filter by date range (start)
- `endDate` - Filter by date range (end)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

#### Get Specific Payout Details

```http
GET /payouts/:payoutId
Authorization: Bearer <admin_token>
```

#### Cancel Pending Payout

```http
DELETE /payouts/:payoutId
Authorization: Bearer <admin_token>
```

#### Update Payout Status (Manual Override)

```http
PATCH /payouts/:payoutId/status
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "status": "PAID",
  "paidAt": "2025-11-15T10:35:00.000Z"
}
```

---

## 💡 Usage Examples

### Scenario 1: Onboard Freelancer for Payouts

**Step 1:** Create Stripe Connect account

```bash
curl -X POST http://localhost:8000/api/v1/admin/freelancers/f7c9e6679-7425-40de-944b-e07fc1f90ae7/create-stripe-account \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "freelancer@example.com",
    "country": "US"
  }'
```

**Step 2:** Send the `accountLinkUrl` to the freelancer to complete onboarding

**Step 3:** Verify account status

```bash
curl -X GET http://localhost:8000/api/v1/admin/freelancers/f7c9e6679-7425-40de-944b-e07fc1f90ae7/payment-details \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Scenario 2: Pay Freelancer for Milestone Completion

```bash
curl -X POST http://localhost:8000/api/v1/admin/freelancers/f7c9e6679-7425-40de-944b-e07fc1f90ae7/payout \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2500.00,
    "currency": "usd",
    "payoutType": "MILESTONE",
    "description": "Phase 1 - Backend Development Completed",
    "notes": "Milestone approved and verified",
    "projectId": "403f90bd-0f1f-4bde-a701-adc37ab35252",
    "milestoneId": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
  }'
```

### Scenario 3: View All Payouts for a Project

```bash
curl -X GET "http://localhost:8000/api/v1/admin/payouts?projectId=403f90bd-0f1f-4bde-a701-adc37ab35252&page=1&limit=50" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🔒 Security

### Authorization

✅ **All payout endpoints require ADMIN role**

- Middleware: `authMiddleware.checkIfUserIsAdmin`
- Only admins can view payment details, initiate payouts, or modify payout status

### Validation

✅ **Input validation using Zod schemas**

- Stripe account IDs must start with `acct_`
- Amounts must be positive and within limits
- Enum values are validated (status, payoutType, etc.)

### Stripe Account Verification

✅ **Freelancer eligibility checks**

- Must have connected Stripe account (`stripeAccountId` present)
- Account status must be `ACTIVE`
- `chargesEnabled` and `payoutsEnabled` must be true

### Transaction Safety

✅ **Idempotency and error handling**

- Payout records created before Stripe transfer
- Failed transfers update status to `FAILED` with reason
- Retry tracking with `retryCount`

---

## 🧪 Testing

### Manual Testing Checklist

1. **Create Stripe Connect Account**

   - [ ] Test with valid email
   - [ ] Test with invalid email format
   - [ ] Verify account link URL is returned

2. **Update Payment Details**

   - [ ] Test with valid Stripe account ID
   - [ ] Test with invalid account ID format
   - [ ] Verify account status is updated correctly

3. **Initiate Payout**

   - [ ] Test with freelancer who has ACTIVE Stripe account
   - [ ] Test with freelancer who has NOT_CONNECTED status (should fail)
   - [ ] Test with invalid amount (negative, zero)
   - [ ] Test linking to project and milestone
   - [ ] Verify Stripe transfer is created
   - [ ] Verify payout status changes to PROCESSING

4. **View Payout History**

   - [ ] Test pagination
   - [ ] Test filtering by status
   - [ ] Test filtering by date range

5. **Cancel Payout**
   - [ ] Test cancelling PENDING payout (should succeed)
   - [ ] Test cancelling PROCESSING/PAID payout (should fail)

### Test Stripe Account IDs

For development/testing, use Stripe test mode account IDs:

- Format: `acct_test_xxxxxxxxxxxxx`
- Get from Stripe Dashboard > Connect > Test Data

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Freelancer has not connected their Stripe account"

**Cause:** Freelancer's `stripeAccountId` is null  
**Solution:**

- Create Stripe Connect account using `POST /freelancers/:id/create-stripe-account`
- Or manually update with `POST /freelancers/:id/payment-details`

#### 2. "Freelancer Stripe account is PENDING"

**Cause:** Freelancer hasn't completed Stripe onboarding  
**Solution:**

- Send the account link URL to freelancer
- They must verify identity and bank details
- Check requirements: `GET /freelancers/:id/payment-details`

#### 3. "Failed to create transfer: Insufficient funds"

**Cause:** Your platform Stripe account doesn't have enough balance  
**Solution:**

- In production: Ensure client payments have settled
- In test mode: Add test balance in Stripe Dashboard

#### 4. Payout stuck in PENDING status

**Cause:** Transfer not initiated to Stripe  
**Solution:**

- Check logs for Stripe API errors
- Manually update status using `PATCH /payouts/:id/status`
- Cancel and recreate if needed

---

## 📊 Database Queries

### Get total payouts for a freelancer

```sql
SELECT
  SUM(amount) as total_paid,
  COUNT(*) as total_payouts,
  status
FROM "FreelancerPayout"
WHERE "freelancerId" = 'freelancer_uuid'
GROUP BY status;
```

### Get pending payouts

```sql
SELECT fp.*, f."details"->'fullName' as freelancer_name
FROM "FreelancerPayout" fp
JOIN "Freelancer" f ON fp."freelancerId" = f.id
WHERE fp.status = 'PENDING'
ORDER BY fp."createdAt" DESC;
```

### Get freelancers ready for payouts

```sql
SELECT
  f.id,
  fd."fullName",
  fd.email,
  f."stripeAccountStatus",
  f."paymentDetailsVerified"
FROM "Freelancer" f
JOIN "FreelancerDetails" fd ON f.id = fd."freelancerId"
WHERE f."stripeAccountStatus" = 'ACTIVE'
  AND f."paymentDetailsVerified" = true;
```

---

## 🎓 Best Practices

1. **Always verify freelancer eligibility** before initiating payouts
2. **Link payouts to projects/milestones** for better tracking
3. **Add descriptive notes** for audit trails
4. **Monitor failed payouts** and investigate promptly
5. **Reconcile with Stripe dashboard** regularly
6. **Set up webhook handlers** for real-time status updates
7. **Keep frontend URLs updated** for Stripe Connect onboarding

---

## 📝 Notes

- **Currency Support:** Currently supports all Stripe-supported currencies (default: USD)
- **Minimum Amount:** Stripe minimum transfer amount applies (usually $1 USD or equivalent)
- **Processing Time:** Transfers typically complete in 2-7 business days depending on bank
- **Fees:** Stripe charges fees for transfers - check your Stripe pricing
- **International Payouts:** Supported if freelancer's Stripe account is in an eligible country

---

## 🔗 Related Documentation

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe Transfers API](https://stripe.com/docs/connect/charges-transfers)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

---

## 📧 Support

For questions or issues, contact the development team or refer to:

- `/api/v1/admin/payouts` - Swagger/OpenAPI documentation
- `src/swagger/freelancer-payout.yaml` - Complete API specification

---

**Implementation Date:** November 15, 2025  
**Version:** 1.0.0  
**Status:** ✅ Ready for Production
