# 💰 Automatic Estimate Calculation Feature

## Overview

The system now automatically calculates project estimates based on visitor/project selections. When a visitor completes Step 7 (Timeline), the estimate is automatically calculated and saved to the database.

---

## 📊 Pricing Configuration

### Database Tables

Three new pricing configuration tables have been added:

1. **`PricingServiceCategory`** - Base prices for service categories
2. **`PricingTechnology`** - Additional costs for technologies
3. **`PricingFeature`** - Additional costs for features

### Default Pricing (Seeded)

#### Service Categories (Base Prices)

- **SOFTWARE_DEVELOPMENT**: $5,000
- **DATA_AND_ANALYTICS**: $4,000
- **CLOUD_AND_DEVOPS**: $3,500
- **EMERGING_TECHNOLOGIES**: $6,000 (AI/ML, Blockchain, IoT)
- **CREATIVE_AND_DESIGN**: $2,500
- **DIGITAL_MARKETING**: $2,000

#### Technologies (Sample)

- React, Vue.js, Python: $500
- Angular: $600
- Next.js, Django: $700
- AWS, Azure, Google Cloud: $800
- Kubernetes: $900
- TensorFlow, PyTorch: $1,200

#### Features (Sample)

- User Authentication: $800
- Payment Gateway: $1,200
- Real-time Chat: $1,500
- Admin Panel: $1,800
- Content Management System: $2,000
- E-commerce Cart: $1,000

---

## 🧮 Calculation Formula

```
Base Cost = Sum of (Service Categories + Technologies + Features)
Discount Amount = Base Cost × Discount Percentage
After Discount = Base Cost - Discount Amount
Rush Fee Amount = After Discount × Rush Fee Percentage
Calculated Total = After Discount + Rush Fee Amount

Minimum Price = Calculated Total × 0.9  (-10%)
Maximum Price = Calculated Total × 1.1  (+10%)
```

### Discount Percentages

| Discount Type          | Percentage |
| ---------------------- | ---------- |
| STARTUP_FOUNDER        | 10%        |
| VETERAN_OWNED_BUSINESS | 15%        |
| NONPROFIT_ORGANIZATION | 15%        |
| NOT_ELIGIBLE           | 0%         |

### Rush Fee Percentages

| Timeline Option             | Rush Fee |
| --------------------------- | -------- |
| STANDARD_BUILD (2 months)   | 0%       |
| PRIORITY_BUILD (1.5 months) | 5%       |
| ACCELERATED_BUILD (6 weeks) | 10%      |
| RAPID_BUILD (1 month)       | 15%      |
| FAST_TRACK_BUILD (25 days)  | 20%      |

---

## 🔄 Automatic Calculation

### When It Happens

The estimate is **automatically calculated and saved** when:

- Visitor completes Step 7 (Timeline)
- All required data is available (services + timeline minimum)

### Calculation Breakdown Stored

The following breakdown is stored in the database:

- `baseCost` - Sum of all services, technologies, and features
- `discountAmount` - Amount deducted from discount
- `rushFeeAmount` - Additional rush fee
- `calculatedTotal` - Final calculated amount
- `estimateFinalPriceMin` - Minimum price (calculatedTotal - 10%)
- `estimateFinalPriceMax` - Maximum price (calculatedTotal + 10%)
- `isManuallyAdjusted` - Boolean flag (false for auto-calculated)

---

## 🌐 New API Endpoints

### 1. **Get Estimate Details**

```http
GET /api/v1/visitors/{id}/estimate
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Estimate retrieved successfully",
  "data": {
    "id": "uuid",
    "visitorId": "uuid",
    "estimateAccepted": false,
    "estimateFinalPriceMin": 8100.0,
    "estimateFinalPriceMax": 9900.0,
    "isManuallyAdjusted": false,
    "baseCost": 10000.0,
    "discountAmount": 1000.0,
    "rushFeeAmount": 0.0,
    "calculatedTotal": 9000.0,
    "calculatedAt": "2025-10-30T12:00:00Z",
    "createdAt": "2025-10-30T12:00:00Z"
  }
}
```

### 2. **Accept Estimate**

```http
POST /api/v1/visitors/{id}/estimate/accept
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Estimate accepted successfully",
  "data": {
    "estimateAccepted": true,
    ...
  }
}
```

### 3. **Admin Override Estimate** (Admin Only)

```http
PATCH /api/v1/visitors/{id}/estimate
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "estimateFinalPriceMin": 8500,
  "estimateFinalPriceMax": 10500
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Estimate overridden successfully by admin",
  "data": {
    "isManuallyAdjusted": true,
    "estimateFinalPriceMin": 8500.00,
    "estimateFinalPriceMax": 10500.00,
    ...
  }
}
```

---

## 📝 Database Schema Changes

### VisitorEstimate & ProjectEstimate Models

Added fields:

```prisma
isManuallyAdjusted    Boolean  @default(false)
baseCost              Decimal? @db.Decimal(18, 2)
discountAmount        Decimal? @db.Decimal(18, 2)
rushFeeAmount         Decimal? @db.Decimal(18, 2)
calculatedTotal       Decimal? @db.Decimal(18, 2)
```

---

## 🎯 Usage Flow

### For Visitors

1. **Step 1-6**: Fill in project details
2. **Step 7**: Add timeline
   - ✅ Estimate is **automatically calculated**
3. **View Estimate**: Call `GET /visitors/{id}/estimate`
4. **Accept Estimate**: Call `POST /visitors/{id}/estimate/accept`
5. **Step 8**: Proceed to service agreement

### For Admin

1. **View any visitor/project estimate**
2. **Override if needed**: `PATCH /visitors/{id}/estimate`
   - Sets `isManuallyAdjusted = true`
3. **Track which estimates are manual vs auto-calculated**

---

## 🔧 Updating Pricing

### Via Database

```sql
-- Update service category base price
UPDATE "PricingServiceCategory"
SET "basePrice" = 6000
WHERE category = 'SOFTWARE_DEVELOPMENT';

-- Update technology cost
UPDATE "PricingTechnology"
SET "additionalCost" = 700
WHERE technology = 'React';

-- Update feature cost
UPDATE "PricingFeature"
SET "additionalCost" = 1000
WHERE feature = 'User Authentication';
```

### Via Seed Script (Re-seed)

```bash
npx tsx prisma/seed-pricing.ts
```

---

## ✅ Implementation Checklist

- [x] Created pricing configuration tables
- [x] Seeded initial pricing data
- [x] Created estimate calculation service
- [x] Auto-calculate on timeline add (Step 7)
- [x] Added `GET /visitors/{id}/estimate` endpoint
- [x] Added `POST /visitors/{id}/estimate/accept` endpoint
- [x] Added `PATCH /visitors/{id}/estimate` endpoint (admin)
- [x] Track `isManuallyAdjusted` flag
- [x] Store calculation breakdown
- [x] Apply 10% price range variance
- [x] Database migration completed
- [x] TypeScript compilation successful

---

## 📋 Example Calculation

**Input:**

- Services: SOFTWARE_DEVELOPMENT ($5,000)
- Technologies: React ($500), Node.js ($600)
- Features: User Auth ($800), Payment Gateway ($1,200)
- Discount: STARTUP_FOUNDER (10%)
- Timeline: STANDARD_BUILD (0% rush)

**Calculation:**

```
Base Cost = 5000 + 500 + 600 + 800 + 1200 = $8,100
Discount (10%) = $8,100 × 0.10 = $810
After Discount = $8,100 - $810 = $7,290
Rush Fee (0%) = $7,290 × 0.00 = $0
Calculated Total = $7,290
Min Price = $7,290 × 0.9 = $6,561
Max Price = $7,290 × 1.1 = $8,019
```

---

## 🚀 Ready to Use!

The estimate calculation feature is now fully implemented and ready for testing. Start the server and test the visitor flow through Step 7 to see automatic estimate calculation in action!

```bash
bun run dev
```

Then test with:

```bash
# After adding timeline
GET http://localhost:8000/api/v1/visitors/{visitorId}/estimate
```
