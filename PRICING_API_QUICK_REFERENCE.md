# PRICING API - QUICK REFERENCE

## 🔗 **Base URL**

```
/api/v1/admin/pricing
```

## 🔐 **Authentication**

All endpoints require:

```
Authorization: Bearer {admin_token}
```

---

## 📍 **Endpoints at a Glance**

### **Service Categories**

```
GET    /categories          - List all
GET    /categories/:id      - Get one
PATCH  /categories/:id      - Update one
PATCH  /categories/bulk     - Update many
```

### **Technologies**

```
GET    /technologies          - List all (paginated)
GET    /technologies/:id      - Get one
POST   /technologies          - Create new
PATCH  /technologies/:id      - Update one
DELETE /technologies/:id      - Delete one
PATCH  /technologies/bulk     - Update many
```

### **Features**

```
GET    /features          - List all (paginated)
GET    /features/:id      - Get one
POST   /features          - Create new
PATCH  /features/:id      - Update one
DELETE /features/:id      - Delete one
PATCH  /features/bulk     - Update many
```

---

## 💡 **Quick Examples**

### **Update a service category price**

```bash
PATCH /api/v1/admin/pricing/categories/{id}
{
  "basePrice": 6000
}
```

### **Add new technology**

```bash
POST /api/v1/admin/pricing/technologies
{
  "technology": "Bun",
  "additionalCost": 600
}
```

### **Bulk update (10% increase)**

```bash
PATCH /api/v1/admin/pricing/technologies/bulk
{
  "updates": [
    { "id": "uuid-1", "additionalCost": 550 },
    { "id": "uuid-2", "additionalCost": 660 },
    { "id": "uuid-3", "additionalCost": 550 }
  ]
}
```

---

## 🎯 **Common Tasks**

### **View all current prices**

```bash
GET /api/v1/admin/pricing/categories
GET /api/v1/admin/pricing/technologies?limit=100
GET /api/v1/admin/pricing/features?limit=100
```

### **Annual price adjustment**

1. GET all items
2. Calculate new prices (e.g., +10%)
3. PATCH /bulk with updates

### **Add emerging technology**

```bash
POST /api/v1/admin/pricing/technologies
{
  "technology": "Deno 2.0",
  "additionalCost": 650
}
```

### **Remove deprecated feature**

```bash
DELETE /api/v1/admin/pricing/features/{old-feature-id}
```

---

## 📊 **Response Format**

### **Success (200)**

```json
{
  "success": true,
  "status": 200,
  "message": "Technology updated successfully",
  "data": { ... }
}
```

### **Error (4xx/5xx)**

```json
{
  "success": false,
  "status": 400,
  "error": "Invalid data",
  "details": [ ... ]
}
```

---

## 🚀 **Quick Test**

```bash
# 1. Start server
bun run dev

# 2. Go to Swagger
http://localhost:8000/api-docs

# 3. Find "Pricing Management"

# 4. Authorize with admin token

# 5. Try GET /admin/pricing/categories
```

---

## 📁 **Key Files**

- Service: `src/services/pricingService.ts`
- Controller: `src/controllers/pricingController/pricingController.ts`
- Router: `src/routers/pricingRouter/pricingRouter.ts`
- Swagger: `src/swagger/pricing.yaml`
- Validation: `src/validation/zod.ts`

---

## 📚 **Full Documentation**

See `PRICING_MANAGEMENT_API.md` for complete details.
