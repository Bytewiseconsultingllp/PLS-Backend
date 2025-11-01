# 🎯 Final Payment Test Commands

## Setup ✅

- ✅ Server running on port 8000
- ✅ Stripe webhook listener: `stripe listen --forward-to localhost:8000/api/v1/payment/webhook`
- ✅ Project ID: `403f90bd-0f1f-4bde-a701-adc37ab35252`
- ✅ Client credentials: username `john`, password `aaaaaaaaaa`

---

## STEP 1: Login and Get Access Token

Run this in your terminal:

```bash
curl -X POST 'http://localhost:8000/api/v1/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "username": "john",
  "password": "aaaaaaaaaa"
}'
```

**📝 Copy the `accessToken` from the response!**

Example response:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "user": {...}
  }
}
```

---

## STEP 2: Create Checkout Session

**Replace `YOUR_ACCESS_TOKEN` with the token from Step 1:**

```bash
curl -X POST 'http://localhost:8000/api/v1/payment/project/create-checkout-session' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId": "403f90bd-0f1f-4bde-a701-adc37ab35252",
    "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
    "cancelUrl": "http://localhost:3000/payment/cancel"
  }'
```

**🎉 Expected Success Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Project checkout session created successfully",
  "data": {
    "sessionId": "cs_test_xxxxxxxxxxxxx",
    "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxxxxxxxxxx",
    "paymentId": "payment-uuid-here"
  }
}
```

**📋 Copy the `url` field!**

---

## STEP 3: Complete Payment

1. Open the checkout URL in your browser
2. Use Stripe test card:
   - **Card Number:** `4242 4242 4242 4242`
   - **Expiry:** Any future date (e.g., `12/34`)
   - **CVC:** Any 3 digits (e.g., `123`)
   - **Postal Code:** Any 5 digits (e.g., `12345`)
3. Click "Pay"

---

## STEP 4: Verify Payment Status

After completing payment (wait 2-3 seconds for webhook), run:

```bash
curl -X GET 'http://localhost:8000/api/v1/payment/project/403f90bd-0f1f-4bde-a701-adc37ab35252/status' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

**✅ Expected Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Project payment status retrieved successfully",
  "data": {
    "status": "SUCCEEDED",
    "amount": 1500.0,
    "currency": "usd"
  }
}
```

---

## 🎯 Quick Copy/Paste Version

### Step 1: Login

```bash
curl -X POST 'http://localhost:8000/api/v1/auth/login' -H 'accept: application/json' -H 'Content-Type: application/json' -d '{"username":"john","password":"aaaaaaaaaa"}'
```

### Step 2: Create Checkout (Replace TOKEN!)

```bash
curl -X POST 'http://localhost:8000/api/v1/payment/project/create-checkout-session' -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' -H 'Content-Type: application/json' -d '{"projectId":"403f90bd-0f1f-4bde-a701-adc37ab35252","successUrl":"http://localhost:3000/payment/success","cancelUrl":"http://localhost:3000/payment/cancel"}'
```

### Step 3: Check Status (Replace TOKEN!)

```bash
curl -X GET 'http://localhost:8000/api/v1/payment/project/403f90bd-0f1f-4bde-a701-adc37ab35252/status' -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

---

## 🔧 Troubleshooting

### If you get 404 Error:

- Server needs restart: `bun run dev`

### If you get 401 Unauthorized:

- Token expired, login again (Step 1)

### If checkout session fails:

- Check if project has an estimate with `calculatedTotal`
- Check server logs for detailed error

### If payment status doesn't update:

- Check Stripe webhook listener is running
- Check webhook secret in `.env` file
- Look at webhook listener terminal for events

---

## ✅ Success Indicators

1. **Checkout URL received** ✅
2. **Payment completed in browser** ✅
3. **Status shows "SUCCEEDED"** ✅
4. **Webhook listener shows events** ✅
5. **Server logs show status update** ✅

---

Ready to test! 🚀
