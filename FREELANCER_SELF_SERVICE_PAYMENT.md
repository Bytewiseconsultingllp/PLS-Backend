# 🎉 Updated: Freelancer Self-Service Payment System

## What Changed?

✅ **Freelancers now manage their own Stripe account details** instead of admins creating them!

This is more secure and gives freelancers full control over their payment information.

---

## 🔄 New Workflow

### For Freelancers:

1. **Freelancer creates/connects their Stripe account** (outside the platform)
2. **Freelancer adds their Stripe account ID** via API: `POST /api/v1/freelancer/payment-details`
3. System verifies the Stripe account
4. **Freelancer is ready to receive payouts** 🎉

### For Admins:

1. **Admin views freelancer payment status** via: `GET /api/v1/admin/freelancers/:id/payment-details`
2. **Admin initiates payout** when work is completed: `POST /api/v1/admin/freelancers/:id/payout`
3. Money is transferred to freelancer's Stripe account automatically

---

## 🆕 New Freelancer Endpoints

### Base URL: `/api/v1/freelancer`

All endpoints require **FREELANCER** role authentication.

#### 1. Add/Update Stripe Account ID

```http
POST /api/v1/freelancer/payment-details
Authorization: Bearer <freelancer_token>
Content-Type: application/json

{
  "stripeAccountId": "acct_1234567890ABCDEF"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Stripe account updated successfully",
  "data": {
    "id": "freelancer_uuid",
    "stripeAccountId": "acct_1234567890ABCDEF",
    "stripeAccountStatus": "ACTIVE",
    "paymentDetailsVerified": true
  }
}
```

#### 2. Get Own Payment Details

```http
GET /api/v1/freelancer/payment-details
Authorization: Bearer <freelancer_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Payment details retrieved successfully",
  "data": {
    "freelancer": {
      "id": "freelancer_uuid",
      "stripeAccountId": "acct_...",
      "stripeAccountStatus": "ACTIVE",
      "paymentDetailsVerified": true
    },
    "stripeAccountDetails": {
      "id": "acct_...",
      "chargesEnabled": true,
      "payoutsEnabled": true,
      "requirementsCurrentlyDue": [],
      "requirementsEventuallyDue": []
    }
  }
}
```

#### 3. View Payout History

```http
GET /api/v1/freelancer/payouts?page=1&limit=10
Authorization: Bearer <freelancer_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Payout history retrieved successfully",
  "data": {
    "payouts": [
      {
        "id": "payout_uuid",
        "amount": 1500.0,
        "currency": "usd",
        "status": "PAID",
        "payoutType": "MILESTONE",
        "description": "Payment for milestone completion",
        "createdAt": "2025-11-15T10:30:00.000Z",
        "paidAt": "2025-11-15T10:35:00.000Z",
        "project": {
          "id": "project_uuid",
          "details": {
            "companyName": "Acme Corp"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

#### 4. View Specific Payout

```http
GET /api/v1/freelancer/payouts/:payoutId
Authorization: Bearer <freelancer_token>
```

#### 5. Disconnect Stripe Account

```http
DELETE /api/v1/freelancer/payment-details
Authorization: Bearer <freelancer_token>
```

---

## 🔒 Security & Permissions

### Freelancer Permissions:

- ✅ Add/update own Stripe account ID
- ✅ View own payment details
- ✅ View own payout history
- ✅ Disconnect own Stripe account
- ❌ Cannot initiate payouts (admin-only)
- ❌ Cannot view other freelancers' payment details

### Admin Permissions:

- ✅ View any freelancer's payment details
- ✅ Initiate payouts to freelancers
- ✅ View all payouts across all freelancers
- ✅ Cancel pending payouts
- ✅ Update payout status
- ✅ Override freelancer Stripe account ID (if needed)

---

## 📝 How Freelancers Get Their Stripe Account ID

### Option 1: Existing Stripe Account

If freelancer already has a Stripe account:

1. Log in to https://dashboard.stripe.com
2. Click on **Settings** → **Account details**
3. Copy the **Account ID** (starts with `acct_`)
4. Use this ID in the API

### Option 2: Create New Stripe Account

1. Go to https://stripe.com
2. Click **Sign up**
3. Complete the signup process
4. Verify identity and bank details
5. Get Account ID from dashboard
6. Use this ID in the API

### For Stripe Connect (Recommended)

Freelancers should create a **Stripe Express** account for receiving payouts:

1. Visit https://stripe.com/connect
2. Create an Express account
3. Complete onboarding
4. Get Account ID
5. Add to your platform

---

## 🎯 Comparison: Old vs New

### ❌ Old Approach (Removed)

- Admin creates Stripe account for freelancer
- Admin shares account link with freelancer
- Freelancer completes onboarding externally
- Less secure (admin handles freelancer account creation)

### ✅ New Approach (Current)

- **Freelancer creates their own Stripe account**
- **Freelancer adds Account ID via API**
- System verifies account automatically
- **More secure** - freelancer maintains full control
- **Simpler** - no admin intermediary needed

---

## 💡 Best Practices

### For Freelancers:

1. ✅ **Create a dedicated Stripe account** for freelance work
2. ✅ **Complete Stripe verification** before adding Account ID
3. ✅ **Keep Account ID secure** - treat it like a password
4. ✅ **Check payout history regularly** for accuracy
5. ✅ **Update bank details** in Stripe dashboard directly

### For Admins:

1. ✅ **Verify freelancer account status** before initiating payouts
2. ✅ **Link payouts to projects/milestones** for tracking
3. ✅ **Add descriptive notes** for audit trails
4. ✅ **Monitor payment status** regularly
5. ✅ **Communicate payout timeline** to freelancers

---

## 🔍 Validation & Error Handling

### Valid Stripe Account ID Format:

- Must start with `acct_`
- Example: `acct_1234567890ABCDEF`
- Length: typically 21 characters

### Common Errors:

**"Invalid Stripe account ID format"**

```json
{
  "success": false,
  "message": "Invalid Stripe account ID format. Must start with 'acct_'"
}
```

**"Freelancer Stripe account is PENDING"**

- Account exists but not fully verified
- Freelancer needs to complete Stripe onboarding
- Check requirements in payment details endpoint

**"Freelancer profile not found for this user"**

- User doesn't have a freelancer profile
- Need to create freelancer profile first

---

## 📊 Payment Details Response Fields

### `stripeAccountStatus` Values:

| Status          | Meaning                        | Can Receive Payouts? |
| --------------- | ------------------------------ | -------------------- |
| `NOT_CONNECTED` | No Stripe account added        | ❌ No                |
| `PENDING`       | Account added but not verified | ❌ No                |
| `ACTIVE`        | Fully verified and ready       | ✅ Yes               |
| `RESTRICTED`    | Account has restrictions       | ❌ No                |
| `DISABLED`      | Account disabled by Stripe     | ❌ No                |

### `paymentDetailsVerified`:

- `true` - Ready to receive payouts
- `false` - Needs verification

---

## 🚀 Quick Start Guide for Freelancers

### Step 1: Create Stripe Account

```bash
# Visit Stripe and create an account
https://stripe.com/signup
```

### Step 2: Get Account ID

```bash
# From Stripe Dashboard → Settings → Account details
# Copy the Account ID (starts with "acct_")
```

### Step 3: Add to Platform

```bash
curl -X POST http://localhost:8000/api/v1/freelancer/payment-details \
  -H "Authorization: Bearer YOUR_FREELANCER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stripeAccountId": "acct_YOUR_ACCOUNT_ID_HERE"
  }'
```

### Step 4: Verify Status

```bash
curl -X GET http://localhost:8000/api/v1/freelancer/payment-details \
  -H "Authorization: Bearer YOUR_FREELANCER_TOKEN"
```

### Step 5: Ready for Payouts! 🎉

Wait for admin to initiate payouts when work is completed.

---

## 📱 Frontend Integration Examples

### React Example - Add Stripe Account

```typescript
const addStripeAccount = async (stripeAccountId: string) => {
  try {
    const response = await fetch("/api/v1/freelancer/payment-details", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${freelancerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stripeAccountId }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("Stripe account added successfully!");
      return data.data;
    } else {
      console.error("Error:", data.message);
    }
  } catch (error) {
    console.error("Failed to add Stripe account:", error);
  }
};
```

### React Example - View Payment Status

```typescript
const PaymentDetailsCard = () => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch('/api/v1/freelancer/payment-details', {
          headers: {
            'Authorization': `Bearer ${freelancerToken}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setDetails(data.data);
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="payment-details-card">
      <h3>Payment Setup</h3>
      {details?.freelancer?.stripeAccountStatus === 'ACTIVE' ? (
        <div className="status-active">
          <span>✅ Ready to receive payouts</span>
          <p>Account ID: {details.freelancer.stripeAccountId}</p>
        </div>
      ) : (
        <div className="status-pending">
          <span>⚠️ Payment setup incomplete</span>
          <button onClick={() => showAddStripeAccountModal()}>
            Add Stripe Account
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## ✅ What's Been Removed

### Removed Admin Endpoints:

- ❌ `POST /admin/freelancers/:id/create-stripe-account` - No longer needed
- ❌ `createStripeConnectAccountSchema` validation - Removed

### Removed Service Methods:

- ❌ `FreelancerPayoutService.createStripeConnectAccount()` - No longer needed

These have been replaced with freelancer self-service endpoints.

---

## 🎓 Summary

### Key Changes:

1. ✅ **Freelancers manage their own Stripe accounts**
2. ✅ **5 new freelancer endpoints** for self-service
3. ✅ **Improved security** - no admin intermediary
4. ✅ **Simpler workflow** - freelancers own their data
5. ✅ **Admins retain payout control** - only initiating payouts

### Migration Notes:

- Existing admin override endpoint still available if needed
- No database changes required
- Backward compatible with existing payouts
- All previous payout functionality intact

---

**Updated:** November 16, 2025  
**Version:** 2.0.0  
**Status:** ✅ Ready for Production
