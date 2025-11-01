# Visitor API Swagger Documentation - Fixed ✅

## 🎯 Problem

The visitor endpoint in Swagger was showing **completely incorrect request payload** that didn't match the actual API validation schema defined in `src/validation/zod.ts`.

### ❌ Previous (Wrong) Fields:

- `ipAddress` - NOT in validation schema
- `userAgent` - NOT in validation schema
- `page` - NOT in validation schema

These fields were completely **fictitious** and would cause validation errors!

---

## ✅ Fixed: POST `/api/v1/visitors/`

### Correct Required Fields:

1. **`fullName`** (string, 2-100 chars) - Visitor's full name
2. **`businessEmail`** (string, 3-150 chars, valid email) - Business email address
3. **`businessAddress`** (string, 5-500 chars) - Business address
4. **`businessType`** (string, 2-100 chars) - Type of business
5. **`referralSource`** (string, 2-100 chars) - How they found the platform

### Optional Fields:

- **`phoneNumber`** (string, 10-20 chars) - Phone number
- **`companyName`** (string, 2-100 chars) - Company name
- **`companyWebsite`** (string, 3-200 chars, valid URL) - Company website

---

## 📝 Example Request

```json
{
  "fullName": "John Doe",
  "businessEmail": "john.doe@company.com",
  "phoneNumber": "+1234567890",
  "companyName": "Acme Corporation",
  "companyWebsite": "https://www.acme.com",
  "businessAddress": "123 Business Street, New York, NY 10001",
  "businessType": "Technology",
  "referralSource": "Google Search"
}
```

---

## 🔍 Validation Rules

| Field           | Type   | Min | Max | Format      | Required |
| --------------- | ------ | --- | --- | ----------- | -------- |
| fullName        | string | 2   | 100 | -           | ✅       |
| businessEmail   | string | 3   | 150 | Valid email | ✅       |
| phoneNumber     | string | 10  | 20  | -           | ❌       |
| companyName     | string | 2   | 100 | -           | ❌       |
| companyWebsite  | string | 3   | 200 | Valid URL   | ❌       |
| businessAddress | string | 5   | 500 | -           | ✅       |
| businessType    | string | 2   | 100 | -           | ✅       |
| referralSource  | string | 2   | 100 | -           | ✅       |

---

## 🎯 Testing the Fix

### Test Visitor Creation

```bash
curl -X POST http://localhost:8000/api/v1/visitors/ \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "businessEmail": "john.doe@company.com",
    "phoneNumber": "+1234567890",
    "companyName": "Acme Corporation",
    "companyWebsite": "https://www.acme.com",
    "businessAddress": "123 Business Street, New York, NY 10001",
    "businessType": "Technology",
    "referralSource": "Google Search"
  }'
```

**Expected Response (201 Created):**

```json
{
  "success": true,
  "message": "Visitor record created successfully",
  "data": {
    "id": "uuid",
    "fullName": "John Doe",
    "businessEmail": "john.doe@company.com",
    "phoneNumber": "+1234567890",
    "companyName": "Acme Corporation",
    "companyWebsite": "https://www.acme.com",
    "businessAddress": "123 Business Street, New York, NY 10001",
    "businessType": "Technology",
    "referralSource": "Google Search",
    "createdAt": "2025-10-26T..."
  }
}
```

---

### Test with Minimal Required Fields

```bash
curl -X POST http://localhost:8000/api/v1/visitors/ \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "businessEmail": "jane@startup.io",
    "businessAddress": "456 Startup Lane, San Francisco, CA 94105",
    "businessType": "SaaS",
    "referralSource": "LinkedIn"
  }'
```

---

### Test Validation Errors

#### Missing Required Field:

```bash
curl -X POST http://localhost:8000/api/v1/visitors/ \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "businessEmail": "test@example.com"
  }'
```

**Expected Response (400 Bad Request):**

```json
{
  "success": false,
  "status": 400,
  "error": "Invalid data",
  "details": [
    { "message": "businessAddress is required!!" },
    { "message": "businessType is required!!" },
    { "message": "referralSource is required!!" }
  ]
}
```

#### Invalid Email Format:

```bash
curl -X POST http://localhost:8000/api/v1/visitors/ \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "businessEmail": "not-an-email",
    "businessAddress": "123 Main St",
    "businessType": "Tech",
    "referralSource": "Google"
  }'
```

**Expected Response (400 Bad Request):**

```json
{
  "success": false,
  "status": 400,
  "error": "Invalid data",
  "details": [{ "message": "Invalid email format. e.g: john.doe@example.com" }]
}
```

#### Invalid URL Format (Optional Field):

```bash
curl -X POST http://localhost:8000/api/v1/visitors/ \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "businessEmail": "test@example.com",
    "companyWebsite": "not-a-url",
    "businessAddress": "123 Main St",
    "businessType": "Tech",
    "referralSource": "Google"
  }'
```

**Expected Response (400 Bad Request):**

```json
{
  "success": false,
  "status": 400,
  "error": "Invalid data",
  "details": [{ "message": "companyWebsite must be a valid URL" }]
}
```

---

## 📊 Before vs After Comparison

| Feature          | Before                                                 | After                                        |
| ---------------- | ------------------------------------------------------ | -------------------------------------------- |
| Field Names      | ❌ Completely wrong (`ipAddress`, `userAgent`, `page`) | ✅ Correct business-related fields           |
| Required Fields  | ❌ None specified (all optional)                       | ✅ 5 required fields properly documented     |
| Optional Fields  | ❌ Not documented                                      | ✅ 3 optional fields with validation         |
| Validation Rules | ❌ Missing                                             | ✅ All min/max/format constraints documented |
| Email Validation | ❌ Not specified                                       | ✅ Email format validation                   |
| URL Validation   | ❌ Not specified                                       | ✅ URL format for companyWebsite             |
| Field Purpose    | ❌ Generic tracking (IP, user agent)                   | ✅ Business visitor information              |
| Business Context | ❌ None                                                | ✅ Clear business/B2B context                |
| Build Status     | ✅ Was working                                         | ✅ Still working                             |

---

## 🎯 Key Changes

### What Was Wrong:

The previous Swagger documentation showed:

```yaml
properties:
  ipAddress:
    type: string
    example: "192.168.1.1"
  userAgent:
    type: string
    example: "Mozilla/5.0..."
  page:
    type: string
    example: "/home"
```

**Problem:** These fields don't exist in the actual validation schema! Any request using these fields would fail with "field is required!!" errors.

### What's Fixed:

Now shows the **actual** fields required by the API:

```yaml
required:
  - fullName
  - businessEmail
  - businessAddress
  - businessType
  - referralSource
properties:
  fullName:
    type: string
    minLength: 2
    maxLength: 100
  businessEmail:
    type: string
    format: email
    minLength: 3
    maxLength: 150
  # ... all other fields with proper validation
```

---

## ✅ Result

The visitor endpoint now has **correct request payload** that matches the actual API validation schema!

### What Works Now:

1. **Correct Required Fields** - All 5 required business fields documented
2. **Optional Fields** - 3 optional fields properly marked
3. **Validation Rules** - All min/max/format constraints specified
4. **Email Validation** - Proper email format for businessEmail
5. **URL Validation** - Proper URL format for companyWebsite
6. **Business Context** - Clear B2B visitor tracking purpose

### 🚀 Next Steps:

1. Test the endpoint in Swagger UI at `http://localhost:8000/api-docs`
2. Verify all validation rules work correctly
3. Test with both minimal (required only) and complete payloads
4. Check error messages for validation failures

---

## 📝 Files Modified

1. **`src/swagger/misc.yaml`** - Updated visitor POST endpoint request schema to match validation schema from `src/validation/zod.ts`

## 🔗 Related Documentation

- `src/validation/zod.ts` (line 672-732) - Contains actual `visitorsSchema`
- `SWAGGER_DOCUMENTATION.md` - Complete Swagger documentation
- `AUTH_SWAGGER_FIXED.md` - Similar fixes for authentication endpoints

---

**Status:** ✅ **COMPLETE** - Visitor endpoint fixed and build passing!
