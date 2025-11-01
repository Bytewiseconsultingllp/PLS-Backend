# Payment Integration Testing Guide

## Quick Test Commands

### Prerequisites

1. Database is running
2. Stripe test mode keys configured in `.env`
3. Stripe CLI installed (for webhook testing)

## Step-by-Step Testing

### 1. Start Stripe Webhook Listener (Terminal 1)

```bash
stripe listen --forward-to localhost:8000/api/v1/payments/webhook
```

Copy the webhook secret (starts with `whsec_`) and add to `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 2. Start Your Server (Terminal 2)

```bash
cd /Users/ssingh83/Desktop/MONDAYTARGET/PLS-Backend
npm run dev
```

### 3. Run Database Migration (Terminal 3)

```bash
cd /Users/ssingh83/Desktop/MONDAYTARGET/PLS-Backend
npx prisma migrate dev --name add_payment_status_to_project
```

## API Testing with cURL

### Test 1: Create Visitor and Complete Flow

#### A. Create Visitor with Details

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/create-with-details' \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "John Test",
    "businessEmail": "john.test@example.com",
    "phoneNumber": "1234567890",
    "companyName": "Test Corp",
    "companyWebsite": "https://testcorp.com",
    "businessAddress": "123 Test St",
    "businessType": "Technology",
    "referralSource": "Google"
  }'
```

Save the `visitorId` from response.

#### B. Add Services (Example)

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/{visitorId}/services' \
  -H 'Content-Type: application/json' \
  -d '{
    "services": [
      {
        "name": "SOFTWARE_DEVELOPMENT",
        "childServices": ["Web Application", "API Development"]
      }
    ]
  }'
```

#### C. Add Technologies

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/{visitorId}/technologies' \
  -H 'Content-Type: application/json' \
  -d '{
    "technologies": [
      {
        "category": "BACKEND",
        "technologies": ["NODE_JS", "PYTHON_DJANGO"]
      }
    ]
  }'
```

#### D. Add Features

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/{visitorId}/features' \
  -H 'Content-Type: application/json' \
  -d '{
    "features": [
      {
        "category": "USER_MANAGEMENT",
        "features": ["AUTHENTICATION", "ROLE_BASED_ACCESS_CONTROL"]
      }
    ]
  }'
```

#### E. Add Timeline

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/{visitorId}/timeline' \
  -H 'Content-Type: application/json' \
  -d '{
    "option": "STANDARD_BUILD"
  }'
```

#### F. Calculate Estimate

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/{visitorId}/estimate/calculate' \
  -H 'Content-Type: application/json'
```

#### G. Accept Estimate

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/{visitorId}/estimate/accept' \
  -H 'Content-Type: application/json' \
  -d '{
    "estimateAccepted": true
  }'
```

#### H. Sign Service Agreement

```bash
curl -X POST 'http://localhost:8000/api/v1/visitors/{visitorId}/service-agreement' \
  -H 'Content-Type: application/json' \
  -d '{
    "documentUrl": "https://example.com/agreement.pdf",
    "accepted": true
  }'
```

### Test 2: Register User

```bash
curl -X POST 'http://localhost:8000/api/v1/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "johntest",
    "fullName": "John Test",
    "email": "john.test@example.com",
    "password": "SecurePass123!"
  }'
```

Check your logs for the OTP (in development mode, it's logged to console).

### Test 3: Verify OTP (Auto-creates Project)

```bash
curl -X POST 'http://localhost:8000/api/v1/auth/verify-otp' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "john.test@example.com",
    "OTP": "YOUR_OTP_HERE"
  }'
```

Save the `accessToken` from response.

### Test 4: Get Projects

```bash
curl -X GET 'http://localhost:8000/api/v1/projects' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

Save the `projectId` from response. Note the `paymentStatus` should be "PENDING".

### Test 5: Create Payment Checkout Session

```bash
curl -X POST 'http://localhost:8000/api/v1/payments/project/create-checkout-session' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId": "YOUR_PROJECT_ID",
    "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
    "cancelUrl": "http://localhost:3000/payment/cancel"
  }'
```

Copy the `checkoutUrl` from response.

### Test 6: Complete Payment

Open the `checkoutUrl` in your browser and use Stripe test card:

**Card Number:** 4242 4242 4242 4242  
**Expiry:** Any future date  
**CVC:** Any 3 digits  
**ZIP:** Any 5 digits

Complete the payment.

### Test 7: Check Webhook Received

In Terminal 1 (Stripe CLI), you should see:

```
✔  Received event checkout.session.completed
✔  --> POST http://localhost:8000/api/v1/payments/webhook [200]
```

### Test 8: Verify Payment Status

```bash
curl -X GET 'http://localhost:8000/api/v1/payments/project/YOUR_PROJECT_ID/status' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

Should show `paymentStatus: "SUCCEEDED"`.

### Test 9: Verify Project Updated

```bash
curl -X GET 'http://localhost:8000/api/v1/projects/YOUR_PROJECT_ID' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

Check that `paymentStatus` is now "SUCCEEDED".

## Test with Different Card Scenarios

### Test Declined Payment

Use card: **4000 0000 0000 0002**

Expected: Payment fails, webhook received, paymentStatus remains "PENDING" or becomes "FAILED".

### Test Cancelled Payment

1. Create checkout session
2. Open checkout URL
3. Click "Back" or close the tab
4. After 24 hours, Stripe will send `checkout.session.expired` webhook
5. paymentStatus becomes "CANCELED"

To test immediately:

```bash
stripe trigger checkout.session.expired
```

## Postman Collection

If you prefer using Postman, import this collection:

```json
{
  "info": {
    "name": "Project Payment Flow",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Create Visitor",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"fullName\": \"John Test\",\n  \"businessEmail\": \"john.test@example.com\",\n  \"phoneNumber\": \"1234567890\",\n  \"companyName\": \"Test Corp\",\n  \"businessType\": \"Technology\",\n  \"referralSource\": \"Google\"\n}"
        },
        "url": {
          "raw": "http://localhost:8000/api/v1/visitors/create-with-details",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "v1", "visitors", "create-with-details"]
        }
      }
    },
    {
      "name": "2. Register User",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"johntest\",\n  \"fullName\": \"John Test\",\n  \"email\": \"john.test@example.com\",\n  \"password\": \"SecurePass123!\"\n}"
        },
        "url": {
          "raw": "http://localhost:8000/api/v1/auth/register",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "v1", "auth", "register"]
        }
      }
    },
    {
      "name": "3. Verify OTP",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"john.test@example.com\",\n  \"OTP\": \"{{otp}}\"\n}"
        },
        "url": {
          "raw": "http://localhost:8000/api/v1/auth/verify-otp",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "v1", "auth", "verify-otp"]
        }
      }
    },
    {
      "name": "4. Create Checkout Session",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{accessToken}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"projectId\": \"{{projectId}}\",\n  \"successUrl\": \"http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}\",\n  \"cancelUrl\": \"http://localhost:3000/payment/cancel\"\n}"
        },
        "url": {
          "raw": "http://localhost:8000/api/v1/payments/project/create-checkout-session",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": [
            "api",
            "v1",
            "payments",
            "project",
            "create-checkout-session"
          ]
        }
      }
    },
    {
      "name": "5. Get Payment Status",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{accessToken}}"
          }
        ],
        "url": {
          "raw": "http://localhost:8000/api/v1/payments/project/{{projectId}}/status",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": [
            "api",
            "v1",
            "payments",
            "project",
            "{{projectId}}",
            "status"
          ]
        }
      }
    }
  ]
}
```

## Troubleshooting

### Issue: Webhook not received

**Check:**

1. Stripe CLI is running: `stripe listen --forward-to localhost:8000/api/v1/payments/webhook`
2. Webhook secret is correct in `.env`
3. Server is running on port 8000

### Issue: Payment amount is $0.00

**Check:**

1. Estimate was calculated: `GET /api/v1/visitors/{visitorId}/estimate`
2. `calculatedTotal` has a value
3. Pricing configuration exists: Check `PricingServiceCategory`, `PricingTechnology`, `PricingFeature` tables

### Issue: Project not found after OTP verification

**Check:**

1. Visitor has accepted estimate
2. Visitor has signed service agreement
3. User email matches visitor email
4. Check logs for conversion errors

### Issue: 403 Permission Denied

**Check:**

1. Access token is valid and not expired
2. Project belongs to the authenticated user
3. Token includes correct user ID

## Database Queries for Debugging

### Check Project Payment Status

```sql
SELECT id, "clientId", "paymentStatus", "createdAt"
FROM "Project"
WHERE "clientId" = 'USER_UID';
```

### Check Payment Records

```sql
SELECT id, "projectId", amount, status, "paidAt", "createdAt"
FROM "Payment"
WHERE "projectId" = 'PROJECT_ID'
ORDER BY "createdAt" DESC;
```

### Check Visitor Conversion

```sql
SELECT id, "isConverted", "convertedAt", "clientId"
FROM "Visitor"
WHERE id = 'VISITOR_ID';
```

### Check Estimate

```sql
SELECT "visitorId", "calculatedTotal", "estimateAccepted"
FROM "VisitorEstimate"
WHERE "visitorId" = 'VISITOR_ID';
```

## Success Indicators

✅ Project created with `paymentStatus: "PENDING"`  
✅ Checkout session created successfully  
✅ Stripe checkout page loads  
✅ Payment completed with test card  
✅ Webhook received (`checkout.session.completed`)  
✅ Payment record status updated to `SUCCEEDED`  
✅ Project `paymentStatus` updated to `SUCCEEDED`  
✅ Payment visible in `/payments/project/{id}/status`

## Next Steps After Testing

1. ✅ Verify all endpoints work
2. ✅ Test error scenarios (invalid project, unauthorized access, etc.)
3. ✅ Test webhook with different events
4. ✅ Integrate frontend with checkout flow
5. ✅ Set up production webhook endpoint
6. ✅ Configure monitoring and alerts

---

**Last Updated:** October 31, 2025
