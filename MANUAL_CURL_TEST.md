# Manual Payment Testing with cURL Commands

## Prerequisites

1. ✅ Stripe webhook listener running: `stripe listen --forward-to localhost:8000/api/v1/payments/webhook`
2. ✅ Server running: `bun run dev` or `npm run dev`
3. ✅ Database is up and running

---

## Step-by-Step Test

### Step 1: Create Visitor with Details

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/create' \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "Manual Test User",
    "businessEmail": "manual.test@example.com",
    "phoneNumber": "1234567890",
    "companyName": "Manual Test Corp",
    "companyWebsite": "https://manualtest.com",
    "businessAddress": "123 Manual Test St",
    "businessType": "Technology",
    "referralSource": "Manual Testing"
  }'
```

**📝 Save the `visitorId` from response!**

---

### Step 2: Add Services

Replace `VISITOR_ID` with the ID from Step 1:

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/VISITOR_ID/services' \
  -H 'Content-Type: application/json' \
  -d '[
    {
      "name": "SOFTWARE_DEVELOPMENT",
      "childServices": ["Web Application", "API Development"]
    }
  ]'
```

**⚠️ Note: Send as an array directly, NOT wrapped in "services" object**

---

### Step 3: Add Technologies

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/VISITOR_ID/technologies' \
  -H 'Content-Type: application/json' \
  -d '[
    {
      "category": "BACKEND",
      "technologies": ["NODE_JS"]
    },
    {
      "category": "FRONTEND",
      "technologies": ["REACT"]
    }
  ]'
```

**⚠️ Note: Send as an array directly**

---

### Step 4: Add Features

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/VISITOR_ID/features' \
  -H 'Content-Type: application/json' \
  -d '[
    {
      "category": "USER_MANAGEMENT",
      "features": ["AUTHENTICATION", "ROLE_BASED_ACCESS_CONTROL"]
    }
  ]'
```

**⚠️ Note: Send as an array directly**

---

### Step 5: Add Timeline

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/VISITOR_ID/timeline' \
  -H 'Content-Type: application/json' \
  -d '{
    "option": "STANDARD_BUILD",
    "rushFeePercent": 0,
    "estimatedDays": 60
  }'
```

**⚠️ Note: rushFeePercent and estimatedDays are required!**

---

### Step 6: Get Estimate (Auto-calculated after Step 5)

```bash
curl -X GET 'http://localhost:8000/api/v1/visitors/VISITOR_ID/estimate'
```

**💰 Look for `calculatedTotal` in the response - this is the amount that will be charged!**

**Note:** Estimate is automatically calculated when you add the timeline in Step 5.

---

### Step 7: Accept Estimate

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/VISITOR_ID/estimate/accept' \
  -H 'Content-Type: application/json'
```

**⚠️ Note: No body needed - just POST to this endpoint**

---

### Step 8: Sign Service Agreement

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/VISITOR_ID/service-agreement' \
  -H 'Content-Type: application/json' \
  -d '{
    "documentUrl": "https://example.com/agreement.pdf",
    "accepted": true
  }'
```

---

### Step 9: Register User

```bash
curl -X POST 'http://localhost:8000/api/v1/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "manualtest123",
    "fullName": "Manual Test User",
    "email": "manual.test@example.com",
    "password": "SecurePass123!"
  }'
```

**📧 Check your server logs for the OTP!**

Look for something like:

```
123456
```

or

```
OTP: 123456
```

---

### Step 10: Verify OTP (This Creates the Project!)

Replace `YOUR_OTP` with the OTP from server logs:

```bash
curl -X POST 'http://localhost:8000/api/v1/auth/verify-otp' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "manual.test@example.com",
    "OTP": "YOUR_OTP"
  }'
```

**🔑 Save the `accessToken` from response!**

✅ **Project is now created with `paymentStatus: PENDING`**

---

### Step 11: Get Projects (Verify Project Created)

Replace `ACCESS_TOKEN` with the token from Step 10:

```bash
curl -X GET 'http://localhost:8000/api/v1/projects' \
  -H 'Authorization: Bearer ACCESS_TOKEN'
```

**📝 Save the `projectId` from response!**

Check that `paymentStatus: "PENDING"` in the response.

---

### Step 12: Create Payment Checkout Session

Replace `ACCESS_TOKEN` and `PROJECT_ID`:

```bash
curl -X POST 'http://localhost:8000/api/v1/payment/project/create-checkout-session' \
  -H 'Authorization: Bearer ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId": "PROJECT_ID",
    "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
    "cancelUrl": "http://localhost:3000/payment/cancel"
  }'
```

**🔗 Copy the `checkoutUrl` from response!**

Example response:

```json
{
  "success": true,
  "message": "Checkout session created successfully",
  "data": {
    "sessionId": "cs_test_...",
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
    "paymentId": "uuid-here"
  }
}
```

---

### Step 13: Complete Payment on Stripe

1. **Copy the `checkoutUrl`** from Step 12
2. **Open it in your browser**
3. **Fill in the payment form with test card:**
   - Card Number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - Name: Any name
   - ZIP: Any 5 digits (e.g., `12345`)
4. **Click "Pay"**

---

### Step 14: Check Webhook (Terminal 1)

In your Stripe webhook listener terminal, you should see:

```
✔ Received event checkout.session.completed
✔ --> POST http://localhost:8000/api/v1/payments/webhook [200]
```

If you see `[200]`, the webhook was successfully processed! ✅

---

### Step 15: Verify Payment Status

Wait 2-3 seconds after payment, then check:

```bash
curl -X GET 'http://localhost:8000/api/v1/payment/project/PROJECT_ID/status' \
  -H 'Authorization: Bearer ACCESS_TOKEN'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Payment status retrieved successfully",
  "data": {
    "paymentStatus": "SUCCEEDED",
    "payments": [
      {
        "id": "uuid",
        "amount": 10000,
        "currency": "usd",
        "status": "SUCCEEDED",
        "paidAt": "2025-10-31T...",
        ...
      }
    ]
  }
}
```

✅ **`paymentStatus` should be `"SUCCEEDED"`**

---

### Step 16: Verify Project Updated

```bash
curl -X GET 'http://localhost:8000/api/v1/projects/PROJECT_ID' \
  -H 'Authorization: Bearer ACCESS_TOKEN'
```

Check that the project now has `paymentStatus: "SUCCEEDED"` ✅

---

## 🎉 Success Criteria

✅ Visitor created  
✅ Services, technologies, features added  
✅ Estimate calculated with `calculatedTotal`  
✅ Estimate accepted  
✅ Service agreement signed  
✅ User registered  
✅ OTP verified  
✅ **Project created with `paymentStatus: PENDING`**  
✅ Checkout session created  
✅ Payment completed on Stripe  
✅ Webhook received and processed (`[200]`)  
✅ **Project `paymentStatus` updated to `SUCCEEDED`**  
✅ Payment record saved with correct amount

---

## 🐛 Troubleshooting

### Issue: "Visitor not found" or "Invalid visitor ID"

**Solution:** Make sure you're using the correct `visitorId` from Step 1.

### Issue: "Estimate not calculated"

**Solution:** Make sure you completed Step 6 before Step 7.

### Issue: "Project not found after OTP"

**Solution:**

- Check that visitor email matches user email
- Verify estimate was accepted
- Verify service agreement was signed

### Issue: Webhook not received

**Solution:**

- Check Stripe CLI is running in Terminal 1
- Verify webhook secret in `.env` file
- Check server logs for errors

### Issue: Payment is $0.00

**Solution:**

- Check that estimate has `calculatedTotal` value
- Verify pricing configuration exists in database
- Run: `bun run seed` to seed pricing data

### Issue: "Project already paid"

**Solution:** Project can only be paid once. Create a new visitor/project for testing.

---

## 📊 Quick Database Checks

### Check Project Status

```sql
SELECT id, "clientId", "paymentStatus", "createdAt"
FROM "Project"
ORDER BY "createdAt" DESC
LIMIT 5;
```

### Check Payment Records

```sql
SELECT id, "projectId", amount, status, "paidAt"
FROM "Payment"
ORDER BY "createdAt" DESC
LIMIT 5;
```

### Check Visitor Conversion

```sql
SELECT id, "isConverted", "clientId"
FROM "Visitor"
WHERE "isConverted" = true
ORDER BY "createdAt" DESC
LIMIT 5;
```

---

## 🔄 Testing Different Scenarios

### Test Failed Payment

Use declined card: `4000 0000 0000 0002`

Expected: Payment fails, webhook received, `paymentStatus` remains `PENDING` or becomes `FAILED`

### Test Cancelled Payment

1. Create checkout session
2. Open checkout URL
3. Click browser back button or close tab
4. Session expires (after 24 hours normally)
5. Or trigger manually: `stripe trigger checkout.session.expired`

Expected: `paymentStatus` becomes `CANCELED`

---

## 📝 Variables Template

Keep these handy as you go through the steps:

```
VISITOR_ID=
ACCESS_TOKEN=
PROJECT_ID=
CHECKOUT_URL=
```

---

**Last Updated:** October 31, 2025  
**Status:** Ready to test!
