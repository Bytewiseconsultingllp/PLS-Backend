# Freelancer Payout System - Team Documentation

## 📘 Complete User Guide for Admins & Freelancers

**Version:** 1.0  
**Last Updated:** November 16, 2025  
**Status:** ✅ Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [For Administrators](#for-administrators)
3. [For Freelancers](#for-freelancers)
4. [API Reference](#api-reference)
5. [Troubleshooting](#troubleshooting)
6. [FAQs](#faqs)

---

## Overview

### What is the Freelancer Payout System?

This system allows administrators to pay freelancers securely through Stripe Connect. Freelancers can manage their own payment details, and all transactions are tracked in the database.

### Key Features

- ✅ **Secure payments** via Stripe Connect
- ✅ **Self-service** for freelancers to add their Stripe accounts
- ✅ **Multiple payout types**: Milestone, Project, Bonus, Manual
- ✅ **Complete tracking** of all transactions
- ✅ **Automatic status updates**
- ✅ **Payout history** for both admins and freelancers

---

## For Administrators

### 🎯 How to Pay a Freelancer

#### Step 1: Verify Freelancer Has Added Payment Details

Before creating a payout, ensure the freelancer has connected their Stripe account.

**API Call:**

```bash
GET /api/v1/admin/freelancers/{freelancerId}/payment-details
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "freelancer": {
      "stripeAccountId": "acct_xxxxx",
      "stripeAccountStatus": "ACTIVE", // Must be ACTIVE
      "paymentDetailsVerified": true
    }
  }
}
```

✅ **Ready to pay if:** `stripeAccountStatus` is `ACTIVE`  
❌ **Not ready if:** Status is `RESTRICTED`, `PENDING`, or `NOT_CONNECTED`

---

#### Step 2: Create a Payout

**Endpoint:** `POST /api/v1/admin/freelancers/{freelancerId}/payout`

**Request Body:**

```json
{
  "amount": 500.0,
  "currency": "usd",
  "payoutType": "MILESTONE", // or PROJECT, BONUS, MANUAL
  "description": "Milestone 1 completion",
  "notes": "Excellent work on the dashboard feature",
  "projectId": "project-uuid", // Optional
  "milestoneId": "milestone-uuid" // Optional
}
```

**Example cURL:**

```bash
curl -X POST 'http://localhost:8000/api/v1/admin/freelancers/{freelancerId}/payout' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": 500.00,
    "currency": "usd",
    "payoutType": "MILESTONE",
    "description": "Milestone 1 completion"
  }'
```

**Success Response:**

```json
{
  "success": true,
  "message": "Payout initiated successfully",
  "data": {
    "id": "payout-uuid",
    "amount": "500",
    "status": "PROCESSING",
    "stripeTransferId": "tr_xxxxx",
    "createdAt": "2025-11-16T10:37:23.666Z"
  }
}
```

---

#### Step 3: Track Payout Status

**View All Payouts:**

```bash
GET /api/v1/admin/payouts
Authorization: Bearer {admin_token}

# With filters:
GET /api/v1/admin/payouts?status=PROCESSING&page=1&limit=20
```

**View Specific Freelancer's Payouts:**

```bash
GET /api/v1/admin/freelancers/{freelancerId}/payouts
```

**View Single Payout:**

```bash
GET /api/v1/admin/payouts/{payoutId}
```

---

### 📊 Admin Dashboard Features

#### View All Payouts

The system provides a paginated list of all payouts with:

- Freelancer details
- Amount and currency
- Status (PENDING, PROCESSING, PAID, FAILED, CANCELLED)
- Payout type
- Admin who initiated it
- Stripe transfer ID
- Timestamps

#### Filter Options

```bash
GET /api/v1/admin/payouts?status=PAID&freelancerId={id}&page=1&limit=10
```

Available filters:

- `status`: PENDING, PROCESSING, PAID, FAILED, CANCELLED
- `freelancerId`: Filter by specific freelancer
- `payoutType`: MILESTONE, PROJECT, BONUS, MANUAL
- `startDate`: Filter by date range
- `endDate`: Filter by date range
- `page`: Pagination
- `limit`: Results per page

---

### 🛠️ Admin Actions

#### Cancel a Payout

**Only works for PENDING or PROCESSING status**

```bash
PATCH /api/v1/admin/payouts/{payoutId}/cancel
Authorization: Bearer {admin_token}
```

#### Update Payout Status

```bash
PATCH /api/v1/admin/payouts/{payoutId}/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "PAID",
  "notes": "Manual status update"
}
```

---

## For Freelancers

### 🎯 How to Set Up Payment Details

#### Step 1: Create Your Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for a new account
3. Complete Stripe's onboarding process:
   - Provide business details
   - Add bank account information
   - Verify your identity
4. Note your **Account ID** (found in Settings → Account details)

---

#### Step 2: Add Your Stripe Account to the Platform

**Endpoint:** `POST /api/v1/freelancer/payment-details`

**Request:**

```bash
curl -X POST 'http://localhost:8000/api/v1/freelancer/payment-details' \
  -H 'Authorization: Bearer YOUR_FREELANCER_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "stripeAccountId": "acct_YOUR_ACCOUNT_ID"
  }'
```

**Success Response:**

```json
{
  "success": true,
  "message": "Stripe account updated successfully",
  "data": {
    "stripeAccountId": "acct_xxxxx",
    "stripeAccountStatus": "ACTIVE",
    "paymentDetailsVerified": true
  }
}
```

✅ **You're all set! You can now receive payments.**

---

### 📊 View Your Payout History

**Endpoint:** `GET /api/v1/freelancer/payouts`

```bash
curl -X GET 'http://localhost:8000/api/v1/freelancer/payouts' \
  -H 'Authorization: Bearer YOUR_FREELANCER_TOKEN'
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "payout-uuid",
      "amount": "500",
      "currency": "usd",
      "status": "PAID",
      "payoutType": "MILESTONE",
      "description": "Milestone 1 completion",
      "createdAt": "2025-11-16T10:37:23.666Z",
      "processedAt": "2025-11-16T10:37:24.740Z",
      "paidAt": "2025-11-16T10:38:00.000Z"
    }
  ]
}
```

---

### 🔍 View Specific Payout Details

```bash
GET /api/v1/freelancer/payouts/{payoutId}
Authorization: Bearer {freelancer_token}
```

---

### 🗑️ Remove Payment Details

**Warning:** You won't be able to receive new payouts after removing your Stripe account.

```bash
DELETE /api/v1/freelancer/payment-details
Authorization: Bearer {freelancer_token}
```

---

## API Reference

### Authentication

All endpoints require authentication via Bearer token.

**Get Token:**

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

---

### Admin Endpoints

| Method | Endpoint                                         | Description                              |
| ------ | ------------------------------------------------ | ---------------------------------------- |
| POST   | `/api/v1/admin/freelancers/{id}/stripe-account`  | Update freelancer Stripe account (admin) |
| GET    | `/api/v1/admin/freelancers/{id}/payment-details` | Get freelancer payment details           |
| POST   | `/api/v1/admin/freelancers/{id}/payout`          | Create a payout                          |
| GET    | `/api/v1/admin/freelancers/{id}/payouts`         | Get freelancer's payout history          |
| GET    | `/api/v1/admin/payouts`                          | Get all payouts (with filters)           |
| GET    | `/api/v1/admin/payouts/{id}`                     | Get specific payout                      |
| PATCH  | `/api/v1/admin/payouts/{id}/cancel`              | Cancel a payout                          |
| PATCH  | `/api/v1/admin/payouts/{id}/status`              | Update payout status                     |

---

### Freelancer Endpoints

| Method | Endpoint                             | Description               |
| ------ | ------------------------------------ | ------------------------- |
| POST   | `/api/v1/freelancer/payment-details` | Add/update Stripe account |
| GET    | `/api/v1/freelancer/payment-details` | View own payment details  |
| DELETE | `/api/v1/freelancer/payment-details` | Remove Stripe account     |
| GET    | `/api/v1/freelancer/payouts`         | View own payout history   |
| GET    | `/api/v1/freelancer/payouts/{id}`    | View specific payout      |

---

## Troubleshooting

### ❌ "Freelancer has not connected their Stripe account"

**Problem:** The freelancer hasn't added their Stripe account ID yet.

**Solution:**

1. Freelancer needs to create a Stripe account
2. Complete Stripe's onboarding
3. Add their Account ID via `POST /api/v1/freelancer/payment-details`

---

### ❌ "Freelancer Stripe account is RESTRICTED"

**Problem:** The Stripe account hasn't completed onboarding or verification.

**Solution:**

1. Freelancer logs into their Stripe dashboard
2. Completes all required onboarding steps
3. Adds bank account information
4. Waits for Stripe to verify their account (usually instant in test mode, 1-2 days in live mode)

---

### ❌ "Insufficient funds in your Stripe account"

**Problem:** Your platform's Stripe account doesn't have enough balance.

**Solution:**

- **Test Mode:** Create a test charge to add funds
- **Live Mode:** Ensure your platform has received payments from clients before paying freelancers

---

### ❌ "Failed to retrieve connect account"

**Problem:** The Stripe account ID doesn't exist or belongs to a different Stripe account.

**Solution:**

1. Verify the Account ID is correct
2. Ensure Stripe Connect is enabled on your platform account
3. Check that the freelancer's account is accessible to your platform

---

## FAQs

### Q: How long does it take for freelancers to receive money?

**A:**

- **Test Mode:** Instant
- **Live Mode:**
  - Money is transferred immediately to the freelancer's Stripe account
  - Withdrawal to bank account takes 1-2 business days (depends on their bank)

---

### Q: Can freelancers see who initiated the payout?

**A:** No, freelancers only see:

- Amount
- Status
- Description
- Payout type
- Dates

Admin information is not visible to freelancers.

---

### Q: What payout types should I use?

**A:**

- **MILESTONE:** For completing specific milestones in a project
- **PROJECT:** For full project completion
- **BONUS:** For performance bonuses or extra rewards
- **MANUAL:** For any other manual payments

---

### Q: Can I cancel a payout after it's been sent?

**A:**

- ✅ **Yes** if status is PENDING
- ❌ **No** if status is PROCESSING or PAID (money already transferred)
- ⚠️ **Contact Stripe support** for emergency reversals (fees may apply)

---

### Q: What happens if a payout fails?

**A:**

- The payout status is set to FAILED
- The failure reason is stored in the database
- No money is deducted from your platform
- You can retry by creating a new payout

---

### Q: Can freelancers have multiple Stripe accounts?

**A:** No, each freelancer can only have one Stripe account connected at a time. To change accounts:

1. Delete the current account
2. Add the new account ID

---

### Q: Is there a payout limit?

**A:**

- **Test Mode:** Unlimited (test funds)
- **Live Mode:** Limited by your Stripe account balance

---

### Q: Do you charge fees for payouts?

**A:** Stripe charges:

- **Transfer fee:** ~$0.25 per transfer
- **See Stripe's pricing:** https://stripe.com/pricing#connect-pricing

---

## Testing Checklist

Before going to production, test:

- [ ] Freelancer can add Stripe account
- [ ] Admin can view freelancer payment details
- [ ] Admin can create payout
- [ ] Money transfers successfully
- [ ] Payout appears in history
- [ ] Freelancer can view their payouts
- [ ] Payout statuses update correctly
- [ ] Failed payout handling works
- [ ] Stripe dashboard shows transfers

---

## Production Deployment

### 1. Update Environment Variables

Replace test keys with live keys in `.env`:

```env
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
```

### 2. Enable Stripe Connect in Live Mode

1. Go to: https://dashboard.stripe.com/settings/connect
2. Complete all required information
3. Activate Connect for live mode

### 3. Test with Real Accounts

Create a test payout with a real freelancer before going live.

### 4. Monitor Transactions

- Set up Stripe webhooks for status updates
- Monitor Stripe dashboard regularly
- Review payout reports weekly

---

## Support

For technical issues:

- Check [FREELANCER_PAYOUT_SYSTEM.md](./FREELANCER_PAYOUT_SYSTEM.md) for implementation details
- Check [PAYOUT_SYSTEM_TEST_RESULTS.md](./PAYOUT_SYSTEM_TEST_RESULTS.md) for test results
- Review Stripe Connect documentation: https://stripe.com/docs/connect

For Stripe-related issues:

- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Support: https://support.stripe.com

---

## Quick Reference

### Create Payout (Admin)

```bash
POST /api/v1/admin/freelancers/{id}/payout
{
  "amount": 500.00,
  "currency": "usd",
  "payoutType": "MILESTONE",
  "description": "Payment description"
}
```

### View Payouts (Admin)

```bash
GET /api/v1/admin/payouts
GET /api/v1/admin/freelancers/{id}/payouts
```

### Add Payment Details (Freelancer)

```bash
POST /api/v1/freelancer/payment-details
{
  "stripeAccountId": "acct_xxxxx"
}
```

### View Payouts (Freelancer)

```bash
GET /api/v1/freelancer/payouts
```

---

**✅ Your team is now ready to use the freelancer payout system!**

For questions or issues, contact the development team or refer to the technical documentation.
