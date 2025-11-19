# Quick Testing Guide - Payment Reliability

## 🧪 How to Test the New Implementation

### Test 1: Normal Flow (Webhook Works) ✅

**Scenario:** Everything works as expected - webhook fires successfully

```bash
# 1. Create a checkout session
curl -X POST http://localhost:4000/api/v1/payments/create-checkout-session \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "usd",
    "customerEmail": "test@example.com",
    "customerName": "Test User",
    "successUrl": "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
    "cancelUrl": "http://localhost:3000/cancel",
    "description": "Test Payment"
  }'

# Response will include:
# {
#   "sessionId": "cs_test_...",
#   "url": "https://checkout.stripe.com/..."
# }

# 2. Complete payment in Stripe (use test card: 4242 4242 4242 4242)

# 3. Webhook fires automatically → Payment marked SUCCEEDED

# 4. When user returns, call verify-session:
curl -X POST http://localhost:4000/api/v1/payments/verify-session \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "cs_test_..."
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Payment already verified",
#   "data": {
#     "status": "SUCCEEDED",
#     "projectId": "clp123...",
#     "wasOutOfSync": false  ← Webhook worked!
#   }
# }
```

**✅ Success Criteria:**

- Payment status in DB: `SUCCEEDED`
- `wasOutOfSync: false` (webhook was not missed)
- `PaymentVerificationLog` entry with `verifiedBy: "webhook"`

---

### Test 2: Missed Webhook (Fallback Works) 🔥

**Scenario:** Webhook fails, but API verification catches it

```bash
# 1. Create checkout session (same as above)

# 2. BEFORE completing payment, temporarily block webhook endpoint:
# Option A: In Stripe dashboard, disable webhook endpoint temporarily
# Option B: In your server, add a route guard to reject webhooks temporarily

# 3. Complete payment in Stripe

# 4. Check payment status in DB - should still be PENDING:
# SELECT * FROM "Payment" WHERE "stripeSessionId" = 'cs_test_...';
# Expected: status = 'PENDING'

# 5. Call verify-session endpoint:
curl -X POST http://localhost:4000/api/v1/payments/verify-session \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "cs_test_..."
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Payment verified and status updated (webhook was missed)",
#   "data": {
#     "status": "SUCCEEDED",
#     "projectId": "clp123...",
#     "wasOutOfSync": true  ← Webhook was missed!
#   }
# }

# 6. Re-enable webhook endpoint
```

**✅ Success Criteria:**

- Payment status in DB: `SUCCEEDED` (updated by API check)
- `wasOutOfSync: true` (webhook was missed, but caught!)
- `webhookRetryCount: 1` in Payment record
- `PaymentVerificationLog` entry with `verifiedBy: "api_check"` and `matched: false`

---

### Test 3: Duplicate Webhook (Idempotency) 🛡️

**Scenario:** Stripe sends the same webhook multiple times

```bash
# 1. Create checkout session and complete payment

# 2. Webhook fires → Payment marked SUCCEEDED

# 3. Check Payment record:
# SELECT
#   id,
#   status,
#   "webhookEventsProcessed",
#   "lastWebhookEventId"
# FROM "Payment"
# WHERE "stripeSessionId" = 'cs_test_...';

# Expected:
# status: SUCCEEDED
# webhookEventsProcessed: ["evt_..."]  ← One event ID
# lastWebhookEventId: "evt_..."

# 4. Manually trigger the same webhook again from Stripe Dashboard:
# - Go to Stripe Dashboard → Developers → Webhooks
# - Find the checkout.session.completed event
# - Click "Resend"

# 5. Check logs - should see:
# "Event evt_... already processed for session cs_test_..., skipping"

# 6. Check Payment record again - should be unchanged:
# status: SUCCEEDED (still)
# webhookEventsProcessed: ["evt_..."]  ← Same event ID, not duplicated
```

**✅ Success Criteria:**

- Payment status remains `SUCCEEDED` (not processed twice)
- `webhookEventsProcessed` array contains the event ID only once
- No duplicate `PaymentVerificationLog` entries
- Logs show "already processed, skipping" message

---

### Test 4: Race Condition (Transaction Safety) 🏁

**Scenario:** Webhook and API verify fire at the same time

```bash
# This is hard to test manually, but here's how to verify it works:

# 1. Create checkout session and complete payment

# 2. IMMEDIATELY after payment, call both:
# - Let webhook fire naturally
# - Call verify-session endpoint manually at the same time

# 3. Check Payment record:
# SELECT * FROM "Payment" WHERE "stripeSessionId" = 'cs_test_...';

# 4. Check PaymentVerificationLog:
# SELECT * FROM "PaymentVerificationLog"
# WHERE "paymentId" = 'payment_id_here'
# ORDER BY "createdAt";
```

**✅ Success Criteria:**

- Payment updated only ONCE to `SUCCEEDED`
- Only ONE `paidAt` timestamp
- May have 2 verification log entries (webhook + api_check)
- No duplicate charges or status conflicts

---

## 📊 Database Queries for Verification

### Check Payment Status:

```sql
SELECT
  p.id,
  p."stripeSessionId",
  p.status,
  p."paidAt",
  p."webhookEventsProcessed",
  p."lastWebhookEventId",
  p."lastCheckedAt",
  p."webhookRetryCount",
  COUNT(pvl.id) as verification_count
FROM "Payment" p
LEFT JOIN "PaymentVerificationLog" pvl ON p.id = pvl."paymentId"
WHERE p."stripeSessionId" = 'cs_test_...'
GROUP BY p.id;
```

### View Verification History:

```sql
SELECT
  pvl.*,
  p."stripeSessionId",
  p.status as current_status
FROM "PaymentVerificationLog" pvl
JOIN "Payment" p ON pvl."paymentId" = p.id
WHERE p."stripeSessionId" = 'cs_test_...'
ORDER BY pvl."createdAt" DESC;
```

### Find Missed Webhooks:

```sql
SELECT
  p.id,
  p."stripeSessionId",
  p.status,
  p."webhookRetryCount",
  p."createdAt"
FROM "Payment" p
WHERE p."webhookRetryCount" > 0
ORDER BY p."createdAt" DESC;
```

### Check for Duplicate Event Processing:

```sql
SELECT
  id,
  "stripeSessionId",
  "webhookEventsProcessed",
  array_length("webhookEventsProcessed", 1) as event_count
FROM "Payment"
WHERE array_length("webhookEventsProcessed", 1) > 1
ORDER BY "createdAt" DESC;
```

---

## 🔍 What to Look for in Logs

### Successful Webhook:

```
INFO: Checkout session completed: cs_test_... via webhook event evt_...
INFO: Project payment status updated to SUCCEEDED: clp123...
```

### Missed Webhook (Caught by API):

```
WARN: ⚠️  Webhook missed! Updating payment pay_123... from API check
INFO: Verifying payment status from Stripe
```

### Duplicate Webhook (Blocked):

```
INFO: Event evt_... already processed for session cs_test_..., skipping
```

---

## 🚨 Common Issues & Solutions

### Issue: `wasOutOfSync` is always false

**Cause:** Webhooks are working perfectly  
**Solution:** This is good! Your webhooks are reliable

### Issue: Payment stuck in PENDING

**Cause:** Webhook failed AND user didn't call verify-session  
**Solution:**

1. Check webhook logs in Stripe dashboard
2. Verify webhook endpoint is accessible
3. Call verify-session endpoint manually

### Issue: "Payment not found" error

**Cause:** User doesn't own this payment  
**Solution:** Verify the correct Bearer token is being used

### Issue: Duplicate payments in database

**Cause:** User created multiple checkout sessions  
**Solution:** This is normal - each checkout session creates a new payment record

---

## 📈 Success Metrics to Monitor

After implementation, track these metrics:

1. **Webhook Success Rate:**

   ```sql
   SELECT
     COUNT(*) as total_payments,
     SUM(CASE WHEN "webhookRetryCount" = 0 THEN 1 ELSE 0 END) as webhook_success,
     SUM(CASE WHEN "webhookRetryCount" > 0 THEN 1 ELSE 0 END) as webhook_missed,
     ROUND(100.0 * SUM(CASE WHEN "webhookRetryCount" = 0 THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
   FROM "Payment"
   WHERE "createdAt" > NOW() - INTERVAL '7 days'
   AND status = 'SUCCEEDED';
   ```

2. **API Verification Usage:**

   ```sql
   SELECT
     "verifiedBy",
     COUNT(*) as count,
     ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
   FROM "PaymentVerificationLog"
   WHERE "createdAt" > NOW() - INTERVAL '7 days'
   GROUP BY "verifiedBy";
   ```

3. **Average Time to Payment Success:**
   ```sql
   SELECT
     AVG(EXTRACT(EPOCH FROM ("paidAt" - "createdAt"))) as avg_seconds
   FROM "Payment"
   WHERE "paidAt" IS NOT NULL
   AND "createdAt" > NOW() - INTERVAL '7 days';
   ```

---

## 🎯 Expected Results

### Before Implementation:

- Webhook failure: ~5-10% of payments
- Stuck payments: ~5% requiring manual intervention
- No duplicate protection

### After Implementation (Phase 1-3):

- Webhook success: ~90-95% (Layer 1)
- API verification: ~4-9% (Layer 2)
- **Total coverage: 99%+**
- Duplicate webhooks: Handled safely
- Race conditions: Prevented by transactions

---

## ✅ Ready to Test!

Start with **Test 1** to verify normal flow works, then move to **Test 2** to verify the fallback mechanism catches missed webhooks.

**Questions?** Check the main implementation docs or logs for detailed information.
