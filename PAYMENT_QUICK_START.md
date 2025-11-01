# Payment Integration - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Run Database Migration

```bash
cd /Users/ssingh83/Desktop/MONDAYTARGET/PLS-Backend
npx prisma migrate dev --name add_payment_status_to_project
```

### 2. Start Stripe Webhook Listener (Terminal 1)

```bash
stripe listen --forward-to localhost:8000/api/v1/payments/webhook
```

Copy the webhook secret `whsec_xxxxx` and add to `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 3. Start Server (Terminal 2)

```bash
npm run dev
```

## 📍 New API Endpoints

### Create Payment Checkout

```bash
POST /api/v1/payments/project/create-checkout-session
Authorization: Bearer <token>

{
  "projectId": "uuid",
  "successUrl": "http://yoursite.com/success",
  "cancelUrl": "http://yoursite.com/cancel"
}
```

### Check Payment Status

```bash
GET /api/v1/payments/project/:projectId/status
Authorization: Bearer <token>
```

## 🧪 Quick Test

```bash
# 1. Register user
curl -X POST 'http://localhost:8000/api/v1/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{"username":"test","fullName":"Test","email":"test@test.com","password":"Test123!"}'

# 2. Verify OTP (check logs for OTP)
curl -X POST 'http://localhost:8000/api/v1/auth/verify-otp' \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@test.com","OTP":"XXXXXX"}'

# Save accessToken from response

# 3. Create payment
curl -X POST 'http://localhost:8000/api/v1/payments/project/create-checkout-session' \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"projectId":"PROJECT_ID","successUrl":"http://localhost:3000/success","cancelUrl":"http://localhost:3000/cancel"}'

# 4. Open checkoutUrl in browser and pay with:
# Card: 4242 4242 4242 4242
# Expiry: Any future date
# CVC: Any 3 digits
```

## ✅ What Changed

### Database

- Added `paymentStatus` field to `Project` (PENDING by default)

### New Files

- `src/services/projectPaymentService.ts`
- `src/controllers/paymentController/projectPaymentController.ts`

### Updated Files

- `src/services/visitorConversionService.ts`
- `src/controllers/paymentController/paymentController.ts`
- `src/routers/paymentRouter/paymentRouter.ts`

### Webhooks

Now update project status automatically:

- ✅ Payment success → `paymentStatus: SUCCEEDED`
- ❌ Payment failed → `paymentStatus: FAILED`
- 🚫 Session expired → `paymentStatus: CANCELED`

## 💡 Key Points

1. **Amount Source:** `ProjectEstimate.calculatedTotal` (in dollars)
2. **Stripe Amount:** Automatically converted to cents
3. **Payment Required:** User must pay to activate project
4. **Checkout URL:** Redirect user to Stripe hosted page
5. **Webhook Updates:** Payment status updated automatically

## 📚 Full Documentation

- **Complete Guide:** `PROJECT_PAYMENT_INTEGRATION.md`
- **Testing Guide:** `PAYMENT_TESTING_GUIDE.md`
- **Implementation Summary:** `PAYMENT_IMPLEMENTATION_SUMMARY.md`

## 🆘 Need Help?

**Issue:** Migration fails
→ Check database is running and schema is valid

**Issue:** Webhook not received  
→ Ensure Stripe CLI is running and secret is correct

**Issue:** Payment is $0.00
→ Verify estimate is calculated and has `calculatedTotal`

---

**Status:** ✅ Ready to use
**Version:** 1.0.0
