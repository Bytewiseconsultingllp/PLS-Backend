# Server Restart and Testing Guide

## ✅ What Was Fixed:

1. ❌ Route was `/payments` → ✅ Now `/payment`
2. ✅ All documentation updated
3. ✅ Code rebuilt successfully
4. ✅ `projectPaymentController.js` compiled

## 🚀 To Test:

### Step 1: Start Your Server

In **Terminal 1**:

```bash
cd /Users/ssingh83/Desktop/MONDAYTARGET/PLS-Backend
bun run dev
```

Wait for: `Server running on port 8000`

---

### Step 2: Start Stripe Webhook Listener

In **Terminal 2**:

```bash
cd /Users/ssingh83/Desktop/MONDAYTARGET/PLS-Backend
stripe listen --forward-to localhost:8000/api/v1/payment/webhook
```

Copy the webhook secret to your `.env` file:

```
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...
```

---

### Step 3: Complete the Visitor Flow

In **Terminal 3**, run these commands:

#### 3.1 Create Visitor

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/create' \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "Test User",
    "businessEmail": "test@example.com",
    "phoneNumber": "1234567890",
    "companyName": "Test Corp",
    "businessType": "Technology",
    "referralSource": "Test"
  }'
```

**→ Save the `visitorId`**

#### 3.2 Add Services

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/YOUR_VISITOR_ID/services' \
  -H 'Content-Type: application/json' \
  -d '[{"name":"SOFTWARE_DEVELOPMENT","childServices":["Web Application"]}]'
```

#### 3.3 Add Technologies

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/YOUR_VISITOR_ID/technologies' \
  -H 'Content-Type: application/json' \
  -d '[{"category":"BACKEND","technologies":["NODE_JS"]}]'
```

#### 3.4 Add Features

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/YOUR_VISITOR_ID/features' \
  -H 'Content-Type: application/json' \
  -d '[{"category":"USER_MANAGEMENT","features":["AUTHENTICATION"]}]'
```

#### 3.5 Add Timeline (Auto-calculates estimate!)

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/YOUR_VISITOR_ID/timeline' \
  -H 'Content-Type: application/json' \
  -d '{"option":"STANDARD_BUILD","rushFeePercent":0,"estimatedDays":60}'
```

#### 3.6 Get Estimate

```bash
curl -X GET 'http://localhost:8000/api/v1/visitors/YOUR_VISITOR_ID/estimate'
```

**→ Note the `calculatedTotal`** (this will be charged!)

#### 3.7 Accept Estimate

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/YOUR_VISITOR_ID/estimate/accept' \
  -H 'Content-Type: application/json'
```

#### 3.8 Sign Service Agreement

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/YOUR_VISITOR_ID/service-agreement' \
  -H 'Content-Type: application/json' \
  -d '{
    "documentUrl": "https://example.com/agreement.pdf",
    "accepted": true
  }'
```

---

### Step 4: Register User (Auto-creates Project!)

```bash
curl -X POST 'http://localhost:8000/api/v1/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "testuser123",
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**→ Save the `userId` and look for auto-created project**

---

### Step 5: Verify OTP

Check `Terminal 1` server logs for the OTP, then:

```bash
curl -X POST 'http://localhost:8000/api/v1/auth/verify-otp' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "code": "YOUR_OTP_HERE"
  }'
```

**→ Copy the `accessToken`**

---

### Step 6: Login to Get Fresh Token

```bash
curl -X POST 'http://localhost:8000/api/v1/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**→ Copy the `accessToken`**

---

### Step 7: Get Projects (Find Project ID)

```bash
curl -X GET 'http://localhost:8000/api/v1/project' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

**→ Copy the `projectId` and verify `paymentStatus: "PENDING"`**

---

### Step 8: Create Checkout Session 🎉

```bash
curl -X POST 'http://localhost:8000/api/v1/payment/project/create-checkout-session' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId": "YOUR_PROJECT_ID",
    "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
    "cancelUrl": "http://localhost:3000/payment/cancel"
  }'
```

**✅ You should get:**

```json
{
  "success": true,
  "message": "Project checkout session created successfully",
  "data": {
    "sessionId": "cs_test_xxxxx",
    "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxx",
    "paymentId": "payment-uuid"
  }
}
```

---

### Step 9: Complete Payment

1. Copy the `url` from Step 8
2. Open it in your browser
3. Use test card: **4242 4242 4242 4242**
4. Any future date, any CVC, any postal code
5. Complete the payment

---

### Step 10: Verify Payment Status

Wait 2-3 seconds for webhook, then:

```bash
curl -X GET 'http://localhost:8000/api/v1/payment/project/YOUR_PROJECT_ID/status' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

**Expected:**

```json
{
  "success": true,
  "message": "Project payment status retrieved successfully",
  "data": {
    "status": "SUCCEEDED",
    "amount": 1500.0,
    "currency": "usd"
  }
}
```

---

## 🎯 Quick Test (All-in-One)

I've also created `QUICK_TEST_COMMANDS.txt` with condensed commands!

---

## 🔧 If You Get Errors:

1. **404 Route Not Found** → Server needs restart
2. **401 Unauthorized** → Token expired, login again
3. **400 Bad Request** → Check request body format
4. **500 Server Error** → Check server logs in Terminal 1

---

## ✅ Server is Ready!

The code is compiled and ready. Just:

1. Start your server: `bun run dev`
2. Follow the steps above
3. Get your checkout URL!
