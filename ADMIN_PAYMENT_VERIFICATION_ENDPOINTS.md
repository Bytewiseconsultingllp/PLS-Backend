# Admin Payment Verification Endpoints - Usage Guide

## 🎯 Overview

Three new admin endpoints have been added to monitor and debug payment verification:

1. **Verification History** - View complete verification log for a specific payment
2. **Verification Stats** - Dashboard metrics for system health monitoring
3. **Verification Issues** - Find problematic payments requiring attention

All endpoints require **Admin authentication**.

---

## 📋 Endpoint Details

### 1. Get Payment Verification History

**Endpoint:** `GET /api/v1/admin/payments/:paymentId/verification-history`

**Purpose:** View complete verification history for a single payment

**Use Cases:**

- Customer support: "Why is this payment stuck?"
- Debugging: "Did the webhook fire?"
- Audit: "When was this payment verified?"

**Example Request:**

```bash
curl -X GET http://localhost:4000/api/v1/admin/payments/clp1234567890/verification-history \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "Payment verification history retrieved successfully",
  "data": {
    "payment": {
      "id": "clp1234567890",
      "status": "SUCCEEDED",
      "amount": 5000,
      "currency": "usd",
      "createdAt": "2024-11-09T10:00:00Z",
      "paidAt": "2024-11-09T10:01:30Z",
      "webhookRetryCount": 0,
      "lastCheckedAt": "2024-11-09T10:01:30Z",
      "webhookEventsProcessed": ["evt_abc123"]
    },
    "project": {
      "id": "proj_123",
      "paymentStatus": "SUCCEEDED"
    },
    "user": {
      "uid": "user_123",
      "email": "customer@example.com",
      "fullName": "John Doe"
    },
    "verificationLogs": [
      {
        "id": "log_1",
        "verifiedBy": "webhook",
        "stripeStatus": "paid",
        "ourStatus": "SUCCEEDED",
        "matched": true,
        "eventId": "evt_abc123",
        "createdAt": "2024-11-09T10:01:30Z"
      }
    ],
    "statistics": {
      "totalVerifications": 1,
      "webhookVerifications": 1,
      "apiCheckVerifications": 0,
      "mismatches": 0,
      "hasWebhookFailure": false
    }
  }
}
```

**What to Look For:**

- ✅ `webhookVerifications > 0` = Webhook worked
- ⚠️ `apiCheckVerifications > 0` = Webhook failed, fallback caught it
- 🔴 `mismatches > 0` = Status discrepancies occurred
- 🔴 `hasWebhookFailure: true` = Webhook issues detected

---

### 2. Get Verification Statistics

**Endpoint:** `GET /api/v1/admin/payments/verification-stats?days=7`

**Purpose:** Dashboard metrics for monitoring system health

**Use Cases:**

- Weekly review: "How reliable are our webhooks?"
- Performance tracking: "Is the fallback system working?"
- Trend analysis: "Are webhook failures increasing?"

**Query Parameters:**

- `days` (optional, default: 7) - Number of days to analyze

**Example Request:**

```bash
curl -X GET "http://localhost:4000/api/v1/admin/payments/verification-stats?days=7" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "Verification statistics retrieved successfully",
  "data": {
    "dateRange": {
      "from": "2024-11-02T00:00:00Z",
      "to": "2024-11-09T00:00:00Z",
      "days": 7
    },
    "paymentOverview": {
      "total": 100,
      "succeeded": 95,
      "pending": 3,
      "failed": 2
    },
    "webhookReliability": {
      "successfulWebhooks": 90,
      "failedWebhooks": 5,
      "successRate": 94.74,
      "failureRate": 5.26
    },
    "verificationSources": {
      "webhook": 90,
      "api_check": 5,
      "cron": 0,
      "manual": 0,
      "total": 95,
      "percentages": {
        "webhook": 94.74,
        "api_check": 5.26,
        "cron": 0,
        "manual": 0
      }
    },
    "systemHealth": {
      "mismatchedVerifications": 5,
      "averageTimeToSuccess": 12.5,
      "averageTimeToSuccessMinutes": 0.21,
      "totalVerifications": 95
    },
    "reliability": {
      "overallCoverage": 95.0,
      "fallbackEffectiveness": 5.26
    }
  }
}
```

**Key Metrics:**

- **successRate**: Should be > 90%
- **fallbackEffectiveness**: Shows % caught by API verification
- **overallCoverage**: Total success rate (should be > 99%)
- **averageTimeToSuccess**: Time from payment creation to verification

---

### 3. Get Verification Issues

**Endpoint:** `GET /api/v1/admin/payments/verification-issues?days=7&limit=50`

**Purpose:** Find problematic payments requiring attention

**Use Cases:**

- Daily check: "Any payments stuck?"
- Support queue: "Which payments need manual review?"
- Proactive fixes: "Catch issues before customers complain"

**Query Parameters:**

- `days` (optional, default: 7) - Number of days to look back
- `limit` (optional, default: 50) - Max results per category

**Example Request:**

```bash
curl -X GET "http://localhost:4000/api/v1/admin/payments/verification-issues?days=7&limit=50" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "Verification issues retrieved successfully",
  "data": {
    "dateRange": {
      "from": "2024-11-02T00:00:00Z",
      "to": "2024-11-09T00:00:00Z",
      "days": 7
    },
    "summary": {
      "mismatchedVerifications": 5,
      "stuckPayments": 2,
      "highRetryPayments": 3
    },
    "issues": {
      "mismatchedVerifications": [
        {
          "logId": "log_1",
          "paymentId": "pay_123",
          "verifiedBy": "api_check",
          "stripeStatus": "paid",
          "ourStatus": "SUCCEEDED",
          "createdAt": "2024-11-09T10:00:00Z",
          "payment": {...},
          "project": {...},
          "user": {...}
        }
      ],
      "stuckPayments": [
        {
          "id": "pay_456",
          "status": "PENDING",
          "amount": 5000,
          "hoursSinceCreation": "2.50",
          "webhookRetryCount": 0,
          "lastCheckedAt": null,
          "recentVerifications": [],
          "project": {...},
          "user": {...}
        }
      ],
      "highRetryPayments": [
        {
          "id": "pay_789",
          "status": "SUCCEEDED",
          "webhookRetryCount": 3,
          "recentVerifications": [...],
          "project": {...},
          "user": {...}
        }
      ]
    }
  }
}
```

**Issue Categories:**

1. **mismatchedVerifications**: Stripe status ≠ DB status

   - Action: Review Stripe dashboard, call verify-session if needed

2. **stuckPayments**: PENDING for > 1 hour

   - Action: Check Stripe status, manually verify if needed

3. **highRetryPayments**: webhookRetryCount >= 2
   - Action: Investigate webhook connectivity issues

---

## 🎯 Common Use Cases

### Daily Morning Check (5 minutes)

```bash
# 1. Check for any stuck payments
curl -X GET "http://localhost:4000/api/v1/admin/payments/verification-issues?days=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# If any stuck payments found, manually check them
curl -X POST http://localhost:4000/api/v1/payments/verify-session \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "cs_test_..."}'
```

### Weekly Health Report (10 minutes)

```bash
# Get 7-day statistics
curl -X GET "http://localhost:4000/api/v1/admin/payments/verification-stats?days=7" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Check key metrics:
# - webhookReliability.successRate (should be > 90%)
# - reliability.overallCoverage (should be > 99%)
# - systemHealth.mismatchedVerifications (should be low)
```

### Customer Support Ticket

**Customer:** "I paid 2 hours ago but project shows unpaid"

```bash
# 1. Find the payment ID from customer email
curl -X GET "http://localhost:4000/api/v1/admin/payments?email=customer@example.com" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 2. Check verification history
curl -X GET "http://localhost:4000/api/v1/admin/payments/pay_123/verification-history" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Look at the response:
# - If webhookRetryCount > 0: Webhook failed, API caught it
# - If verificationLogs empty: Payment never verified
# - If status mismatch: Call verify-session to fix
```

### Investigating Webhook Failures

```bash
# Get all verification issues for last 24 hours
curl -X GET "http://localhost:4000/api/v1/admin/payments/verification-issues?days=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data.issues.highRetryPayments'

# Check if multiple payments have same pattern
# - Same time period? Server downtime
# - Random? Network issues
# - All from one customer? Their firewall blocking webhooks
```

---

## 📊 Interpreting the Data

### Healthy System

```json
{
  "webhookReliability": {
    "successRate": 95.5,
    "failureRate": 4.5
  },
  "reliability": {
    "overallCoverage": 99.8,
    "fallbackEffectiveness": 4.5
  }
}
```

✅ Webhook working well, fallback catching the rest

### Warning Signs

```json
{
  "webhookReliability": {
    "successRate": 75.0,
    "failureRate": 25.0
  },
  "summary": {
    "stuckPayments": 10
  }
}
```

⚠️ High webhook failure rate, investigate webhook endpoint

### Critical Issues

```json
{
  "reliability": {
    "overallCoverage": 85.0
  },
  "summary": {
    "stuckPayments": 15,
    "mismatchedVerifications": 20
  }
}
```

🔴 System unreliable, immediate action required

---

## 🔧 Integration with Monitoring Tools

### Setup Daily Alert (using cron)

```bash
#!/bin/bash
# check-payment-health.sh

# Run daily at 9 AM
ADMIN_TOKEN="your_admin_token"
WEBHOOK_URL="https://slack.webhook.url"

STATS=$(curl -s "http://localhost:4000/api/v1/admin/payments/verification-stats?days=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

SUCCESS_RATE=$(echo $STATS | jq '.data.webhookReliability.successRate')

if (( $(echo "$SUCCESS_RATE < 90" | bc -l) )); then
  # Send alert to Slack
  curl -X POST $WEBHOOK_URL \
    -H 'Content-Type: application/json' \
    -d "{\"text\": \"⚠️ Webhook success rate dropped to ${SUCCESS_RATE}%\"}"
fi
```

### Dashboard Integration (React Example)

```typescript
// PaymentHealthDashboard.tsx
const [stats, setStats] = useState(null);

useEffect(() => {
  fetch('/api/v1/admin/payments/verification-stats?days=7', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  })
    .then(res => res.json())
    .then(data => setStats(data.data));
}, []);

return (
  <div>
    <h2>Payment System Health (Last 7 Days)</h2>

    <Card>
      <h3>Webhook Reliability</h3>
      <ProgressBar value={stats?.webhookReliability.successRate} />
      <p>{stats?.webhookReliability.successRate}% Success Rate</p>
    </Card>

    <Card>
      <h3>Active Issues</h3>
      <p>{stats?.systemHealth.mismatchedVerifications} Mismatches</p>
      <Link to="/admin/payments/issues">View Details →</Link>
    </Card>
  </div>
);
```

---

## ✅ Implementation Complete!

**Files Created:**

- ✅ `src/controllers/adminController/adminPaymentController.ts` - Controller logic
- ✅ `src/routers/adminRouter/adminRouter.ts` - Routes added
- ✅ `src/swagger/admin-payment-verification.yaml` - API documentation

**Endpoints Live:**

- ✅ `GET /api/v1/admin/payments/:paymentId/verification-history`
- ✅ `GET /api/v1/admin/payments/verification-stats`
- ✅ `GET /api/v1/admin/payments/verification-issues`

**Ready to Use!** 🚀

Test the endpoints and monitor your payment system health!
