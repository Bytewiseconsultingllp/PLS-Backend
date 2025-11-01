# PRICING MANAGEMENT API - ADMIN ENDPOINTS

## 🎯 Overview

Admin-only API endpoints to manage pricing data through the API instead of manually editing the seed file. This allows dynamic pricing updates without code changes or database re-seeding.

---

## 📊 **What Can Be Managed**

### **1. Service Categories (6 categories)**

- Base pricing for each service category
- Description updates
- Example: SOFTWARE_DEVELOPMENT, DATA_AND_ANALYTICS, etc.

### **2. Technologies (26+ technologies)**

- Additional costs for each technology
- Add new technologies
- Update existing technology costs
- Remove obsolete technologies
- Example: React, Node.js, AWS, Kubernetes, etc.

### **3. Features (30+ features)**

- Additional costs for each feature
- Add new features
- Update existing feature costs
- Remove features
- Example: User Authentication, Payment Gateway, Real-time Chat, etc.

---

## 🔐 **Authentication & Authorization**

All endpoints require:

- ✅ **Bearer Token** (Admin login)
- ✅ **Admin Role** verification

**Unauthorized users will get 403 Forbidden**

---

## 📡 **API Endpoints**

### **Service Categories**

#### Get All Categories

```bash
GET /api/v1/admin/pricing/categories
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Service categories retrieved successfully",
  "data": [
    {
      "id": "uuid-here",
      "category": "SOFTWARE_DEVELOPMENT",
      "basePrice": 5000,
      "description": "Base price for software development services",
      "createdAt": "2025-11-01T...",
      "updatedAt": "2025-11-01T..."
    }
  ]
}
```

#### Update a Category

```bash
PATCH /api/v1/admin/pricing/categories/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "basePrice": 6000,
  "description": "Updated base price for 2025"
}
```

#### Bulk Update Categories

```bash
PATCH /api/v1/admin/pricing/categories/bulk
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "updates": [
    {
      "id": "uuid-1",
      "basePrice": 6000,
      "description": "Updated for 2025"
    },
    {
      "id": "uuid-2",
      "basePrice": 4500
    }
  ]
}
```

---

### **Technologies**

#### Get All Technologies (Paginated)

```bash
GET /api/v1/admin/pricing/technologies?page=1&limit=50
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Technologies retrieved successfully",
  "data": {
    "technologies": [
      {
        "id": "uuid",
        "technology": "React",
        "additionalCost": 500,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": {
      "total": 26,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

#### Create New Technology

```bash
POST /api/v1/admin/pricing/technologies
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "technology": "Bun",
  "additionalCost": 600
}
```

#### Update Technology

```bash
PATCH /api/v1/admin/pricing/technologies/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "technology": "React.js",
  "additionalCost": 550
}
```

#### Delete Technology

```bash
DELETE /api/v1/admin/pricing/technologies/{id}
Authorization: Bearer {admin_token}
```

**Warning:** This is permanent. Projects using this technology may be affected.

#### Bulk Update Technologies

```bash
PATCH /api/v1/admin/pricing/technologies/bulk
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "updates": [
    {
      "id": "uuid-1",
      "additionalCost": 550
    },
    {
      "id": "uuid-2",
      "technology": "Updated Name",
      "additionalCost": 700
    }
  ]
}
```

---

### **Features**

#### Get All Features (Paginated)

```bash
GET /api/v1/admin/pricing/features?page=1&limit=50
Authorization: Bearer {admin_token}
```

#### Create New Feature

```bash
POST /api/v1/admin/pricing/features
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "feature": "AI-Powered Recommendations",
  "additionalCost": 2500
}
```

#### Update Feature

```bash
PATCH /api/v1/admin/pricing/features/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "feature": "User Authentication (Enhanced)",
  "additionalCost": 900
}
```

#### Delete Feature

```bash
DELETE /api/v1/admin/pricing/features/{id}
Authorization: Bearer {admin_token}
```

#### Bulk Update Features

```bash
PATCH /api/v1/admin/pricing/features/bulk
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "updates": [
    {
      "id": "uuid-1",
      "additionalCost": 850
    },
    {
      "id": "uuid-2",
      "feature": "Updated Feature Name",
      "additionalCost": 1300
    }
  ]
}
```

---

## 📝 **Validation Rules**

### **Service Categories**

- `basePrice`: Number, must be positive
- `description`: String, 5-500 characters (optional)

### **Technologies**

- `technology`: String, 2-100 characters (required for create)
- `additionalCost`: Number, must be >= 0

### **Features**

- `feature`: String, 2-200 characters (required for create)
- `additionalCost`: Number, must be >= 0

---

## 🎯 **Common Use Cases**

### **1. Annual Price Increase**

Use bulk update to increase all prices by 10%:

```bash
# 1. Get all categories
GET /api/v1/admin/pricing/categories

# 2. Calculate new prices (multiply by 1.1)
# 3. Bulk update
PATCH /api/v1/admin/pricing/categories/bulk
{
  "updates": [
    { "id": "uuid-1", "basePrice": 5500 },  // Was 5000
    { "id": "uuid-2", "basePrice": 4400 },  // Was 4000
    // ... all categories
  ]
}
```

### **2. Add New Technology**

When supporting a new tech stack:

```bash
POST /api/v1/admin/pricing/technologies
{
  "technology": "Svelte",
  "additionalCost": 500
}
```

### **3. Adjust Individual Cost**

When a specific technology becomes more expensive:

```bash
PATCH /api/v1/admin/pricing/technologies/{kubernetes-uuid}
{
  "additionalCost": 1000  // Was 900
}
```

### **4. Remove Deprecated Technology**

When no longer supporting a technology:

```bash
DELETE /api/v1/admin/pricing/technologies/{angular-js-uuid}
```

---

## 🚀 **Testing via Swagger**

1. **Start Server:**

   ```bash
   bun run dev
   ```

2. **Open Swagger UI:**

   ```
   http://localhost:8000/api-docs
   ```

3. **Navigate to "Pricing Management" section**

4. **Authorize:**

   - Click "Authorize" button
   - Login as Admin to get token
   - Enter token in format: `Bearer {your-token}`

5. **Test Endpoints:**
   - Try `GET /admin/pricing/categories` first
   - Copy an ID from the response
   - Try `PATCH /admin/pricing/categories/{id}` to update a price
   - Verify the change with another GET request

---

## 📊 **Impact on Project Estimates**

When you update pricing, it affects **future project estimates** immediately:

**Before Update:**

```
SERVICE: SOFTWARE_DEVELOPMENT = $5,000
TECH: React = $500
FEATURE: User Auth = $800
───────────────────────────────
ESTIMATE: $6,300
```

**After Updating React to $550:**

```
SERVICE: SOFTWARE_DEVELOPMENT = $5,000
TECH: React = $550 ← UPDATED
FEATURE: User Auth = $800
───────────────────────────────
ESTIMATE: $6,350
```

**Note:** Existing projects keep their original estimates. Only new projects/estimates use updated pricing.

---

## 🔍 **How It Works**

### **Traditional Way (Before):**

1. Edit `prisma/seed-pricing.ts`
2. Update prices in the code
3. Run `bun run db:seed`
4. Deploy changes

**Problems:**

- ❌ Requires code changes
- ❌ Needs deployment
- ❌ Non-technical admin can't update

### **New Way (With API):**

1. Login as Admin
2. Call API to update price
3. Changes take effect immediately

**Benefits:**

- ✅ No code changes needed
- ✅ No deployment needed
- ✅ Admin can manage via Swagger UI or custom admin panel
- ✅ Bulk updates supported
- ✅ Full CRUD operations

---

## 📦 **Files Created/Modified**

### **Created:**

- `src/services/pricingService.ts` - Business logic for pricing CRUD
- `src/controllers/pricingController/pricingController.ts` - API controllers
- `src/routers/pricingRouter/pricingRouter.ts` - Route definitions
- `src/swagger/pricing.yaml` - Swagger documentation

### **Modified:**

- `src/validation/zod.ts` - Added validation schemas
- `src/routers/defaultRouter.ts` - Integrated pricing router
- `src/config/swagger.ts` - Added "Pricing Management" tag

---

## 🎨 **Building a Custom Admin Panel**

You can now build a frontend admin panel that calls these APIs:

### **Features to Implement:**

1. **Dashboard:**

   - Show all categories, technologies, features
   - Search and filter
   - Inline editing

2. **Bulk Update Tool:**

   - Select multiple items
   - Apply percentage increase/decrease
   - Preview changes before applying

3. **History Tracking:**

   - Log all pricing changes
   - Show who changed what and when

4. **Price Calculator:**
   - Live preview of project estimates
   - Test different pricing scenarios

---

## ✅ **What's Different from Seed Script**

| Feature               | Seed Script        | API Endpoints        |
| --------------------- | ------------------ | -------------------- |
| **Who can use**       | Developers only    | Admin users          |
| **How to update**     | Edit code, re-seed | API call             |
| **Deployment needed** | Yes                | No                   |
| **Bulk operations**   | Manual             | Supported            |
| **Audit trail**       | No                 | Can be added         |
| **UI possible**       | No                 | Yes (Swagger/Custom) |
| **Real-time**         | No                 | Yes                  |

---

## 🚦 **Quick Start Commands**

```bash
# Start server
bun run dev

# Test with curl (replace {admin_token} with your token)

# 1. Get all categories
curl -X GET 'http://localhost:8000/api/v1/admin/pricing/categories' \
  -H 'Authorization: Bearer {admin_token}'

# 2. Update a category
curl -X PATCH 'http://localhost:8000/api/v1/admin/pricing/categories/{id}' \
  -H 'Authorization: Bearer {admin_token}' \
  -H 'Content-Type: application/json' \
  -d '{"basePrice": 6000}'

# 3. Add new technology
curl -X POST 'http://localhost:8000/api/v1/admin/pricing/technologies' \
  -H 'Authorization: Bearer {admin_token}' \
  -H 'Content-Type: application/json' \
  -d '{"technology": "Bun", "additionalCost": 600}'
```

---

## 📚 **Full API Documentation**

Complete Swagger documentation available at:

**http://localhost:8000/api-docs**

Look for the **"Pricing Management"** section.

---

## 🎉 **You're All Set!**

You can now:

- ✅ View all pricing data via API
- ✅ Update prices dynamically
- ✅ Add new technologies/features
- ✅ Remove obsolete items
- ✅ Perform bulk updates
- ✅ No code changes needed!

**Next Steps:**

1. Test the endpoints via Swagger
2. Build a custom admin UI (optional)
3. Set up price change notifications (optional)
4. Add pricing history tracking (optional)
