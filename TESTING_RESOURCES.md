# 🧪 Postman Testing Resources - Complete Package

Everything you need to test all 150+ API endpoints using Postman.

---

## 📦 What You Have

I've created a complete testing package for your backend API:

### 1. **Postman_Environment.json**

- Environment variables file
- Pre-configured with all necessary variables
- Ready to import into Postman

### 2. **Postman_Collection_Complete.json**

- Partial Postman collection
- Includes Auth, Blog, Consultation, Contact Us modules
- With auto-save scripts for tokens

### 3. **POSTMAN_TESTING_GUIDE.md** ⭐ (Main Reference)

- **Complete list of all 150+ endpoints**
- Organized by 17 modules
- Example requests for each endpoint
- Request/response examples
- Testing workflows
- Troubleshooting guide

### 4. **POSTMAN_IMPORT_GUIDE.md**

- Quick start guide
- Step-by-step import instructions
- Setup walkthrough
- Pro tips and tricks

---

## 🚀 Quick Start (Choose Your Path)

### Path A: Quick Manual Setup (5 minutes)

**Best for:** Getting started immediately

1. Import `Postman_Environment.json`
2. Open `POSTMAN_TESTING_GUIDE.md`
3. Create requests manually using the examples
4. Start testing!

**Advantages:**

- ✅ Quick setup
- ✅ Learn endpoints as you go
- ✅ Full control over organization

### Path B: Import Partial Collection (10 minutes)

**Best for:** Testing auth and basic modules quickly

1. Import `Postman_Environment.json`
2. Import `Postman_Collection_Complete.json`
3. Add remaining endpoints from guide
4. Start testing!

**Advantages:**

- ✅ Auth module pre-configured
- ✅ Auto-save token scripts included
- ✅ Good starting point

---

## 📚 Documentation Overview

### Quick Reference Table

| Document                             | Purpose                     | When to Use                            |
| ------------------------------------ | --------------------------- | -------------------------------------- |
| **TESTING_RESOURCES_README.md**      | You are here!               | Start here to understand what you have |
| **POSTMAN_IMPORT_GUIDE.md**          | Setup instructions          | First time importing                   |
| **POSTMAN_TESTING_GUIDE.md**         | Complete endpoint reference | Daily testing reference                |
| **Postman_Environment.json**         | Environment file            | Import into Postman                    |
| **Postman_Collection_Complete.json** | API collection (partial)    | Import into Postman                    |

---

## 📋 Complete API Modules List

All modules documented in `POSTMAN_TESTING_GUIDE.md`:

| #         | Module                 | Endpoints | Auth Required | Description           |
| --------- | ---------------------- | --------- | ------------- | --------------------- |
| 1         | Health                 | 1         | ❌ No         | Health check          |
| 2         | Authentication & Users | 24        | Mixed         | User management       |
| 3         | Blog                   | 7         | Mixed         | Blog posts            |
| 4         | Consultation           | 9         | Mixed         | Consultation bookings |
| 5         | Contact Us             | 7         | Mixed         | Contact messages      |
| 6         | Freelancer             | 27        | Mixed         | Freelancer system     |
| 7         | Get Quote              | 8         | Mixed         | Quote requests        |
| 8         | Hire Us                | 6         | Mixed         | Hire requests         |
| 9         | Milestone              | 6         | ✅ Yes        | Project milestones    |
| 10        | Navigation Pages       | 8         | Mixed         | Menu items            |
| 11        | Newsletter             | 5         | Mixed         | Newsletter management |
| 12        | Payment                | 7         | Mixed         | Stripe integration    |
| 13        | Project Builder        | 10        | ✅ Yes        | Project planning      |
| 14        | Project Request        | 4         | Mixed         | Project submissions   |
| 15        | Project                | 17        | Mixed         | Project management    |
| 16        | Trash                  | 7         | ✅ Yes        | Deleted items         |
| 17        | Visitors               | 6         | Mixed         | Visitor tracking      |
| **TOTAL** | **17 Modules**         | **150+**  | -             | Complete API          |

---

## 🎯 Step-by-Step Getting Started

### Step 1: Import Environment (2 minutes)

1. Open Postman
2. Click **"Environments"** (left sidebar)
3. Click **"Import"**
4. Select `Postman_Environment.json`
5. Click **"Backend API - Development"**
6. Update `baseUrl` to your server URL (default: `http://localhost:3000/api/v1`)

**✅ Done!** Environment is ready.

### Step 2: First API Call (3 minutes)

Create a new request in Postman:

**Register User:**

```
POST {{baseUrl}}/auth/register


Body (JSON):
{
 "username": "testuser",
 "fullName": "Test User",
 "email": "test@example.com",
 "password": "SecurePass123!",
 "phone": "+1234567890"
}
```

Click **Send** → User created! ✅

### Step 3: Login & Auto-Save Token (3 minutes)

Create another request:

**Login:**

```
POST {{baseUrl}}/auth/login


Body (JSON):
{
 "email": "test@example.com",
 "password": "SecurePass123!"
}
```

**Add to Tests tab:**

```javascript
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  if (jsonData.accessToken) {
    pm.environment.set("accessToken", jsonData.accessToken);
    console.log("✅ Token saved!");
  }
}
```

Click **Send** → Token saved! ✅

### Step 4: Test Authenticated Endpoint (2 minutes)

Create another request:

**Get Current User:**

```
GET {{baseUrl}}/auth/getCurrentUser


Authorization:
- Type: Bearer Token
- Token: {{accessToken}}
```

Click **Send** → Your profile returned! ✅

**🎉 You're now testing the API!**

---

## 📖 Using the Testing Guide

### The `POSTMAN_TESTING_GUIDE.md` contains:

#### ✅ Complete Endpoint Reference

Every endpoint with:

- HTTP method (GET, POST, PATCH, DELETE)
- Full URL path
- Auth requirements
- User role requirements
- Example request body
- Description

#### ✅ Request Examples

Ready-to-use JSON examples for:

- User registration and authentication
- Project creation and management
- Freelancer applications
- Payment processing
- Blog posts
- And more...

#### ✅ Testing Workflows

Complete workflows for:

1. **User Journey** - Register → Login → Update Profile → Create Request
2. **Admin Flow** - Manage users → Create projects → Assign freelancers
3. **Freelancer Flow** - Apply → Get approved → View projects → Work

#### ✅ Troubleshooting

Common issues and solutions:

- Unauthorized errors
- Token expiration
- Validation errors
- Role permissions

---

## 🔑 Environment Variables

Pre-configured in `Postman_Environment.json`:

| Variable       | Purpose          | Auto-Set?         |
| -------------- | ---------------- | ----------------- |
| `baseUrl`      | API base URL     | ❌ Manual         |
| `accessToken`  | Auth token       | ✅ Yes (on login) |
| `refreshToken` | Refresh token    | ✅ Yes (on login) |
| `userId`       | Current user ID  | 🟡 Optional       |
| `projectId`    | Test project ID  | 🟡 Optional       |
| `projectSlug`  | Project URL slug | 🟡 Optional       |
| `milestoneId`  | Milestone ID     | 🟡 Optional       |
| `blogSlug`     | Blog URL slug    | 🟡 Optional       |

---

## 🎓 Common Testing Scenarios

### Scenario 1: Test as Client

```bash
1. Register → /auth/register
2. Login → /auth/login
3. Create project request → /projectRequest/create
4. View projects → /project/getAllProjects
5. Rate completed project → /project/writeReviewAndGiveRating/:slug
```

### Scenario 2: Test as Admin

```bash
1. Login → /auth/login
2. View all users → /auth/getAllUsers
3. Create project → /project/createProject
4. Create milestones → /milestone/createMultipleMilestones/:id
5. View freelancers → /freelancer/listAllFreelancers
6. Assign to project → /project/selectFreelancerForProject/:slug
```

### Scenario 3: Test as Freelancer

```bash
1. Submit application → /freelancer/register
2. [Admin approves] → /freelancer/registrations/:id/accept
3. Login → /auth/login
4. View projects → /project/getAllProjects
5. Express interest → /project/createInterestedFreelancers/:slug
6. Update progress → /milestone/updateMilestoneProgress/:id
```

### Scenario 4: Test Payment Flow

```bash
1. Create payment intent → /payment/create-payment-intent
2. Check status → /payment/payment-intent/:id/status
3. Create checkout → /payment/create-checkout-session
4. View history → /payment/history
```

---

## 💡 Pro Tips for Testing

### 1. Organize Your Workspace

Create folders in Postman:

```
My API Tests
├── 🔴 Auth & Setup
├── 📝 Content Management (Blog, Pages)
├── 💼 Business Requests (Quote, Consultation, Contact)
├── 👥 User Management
├── 💻 Project System
├── 👨‍💻 Freelancer System
├── 💳 Payments
└── 🧪 Testing & Utilities
```

### 2. Use Collection Variables

Set at collection level:

- `{{baseUrl}}`
- `{{accessToken}}`

Set at request level:

- Specific IDs
- Test data

### 3. Create Test Users

Create dedicated test users for each role:

```
testclient@example.com → CLIENT role
testfreelancer@example.com → FREELANCER role
testmoderator@example.com → MODERATOR role
testadmin@example.com → ADMIN role
```

### 4. Use Postman Runner

Run entire collections automatically:

1. Click **"Runner"** icon
2. Select collection/folder
3. Select environment
4. Click **"Run"**

### 5. Export Your Work

Save your collection:

1. Right-click collection
2. Click **"Export"**
3. Choose Collection v2.1
4. Save file

Share with team or backup!

---

## 🐛 Troubleshooting Guide

### Issue: Can't Import Environment

**Solution:**

1. Make sure file is `Postman_Environment.json`
2. Check JSON is valid (no syntax errors)
3. Try Import → File → Select file
4. Restart Postman if needed

### Issue: Requests Not Using Variables

**Solution:**

1. Check environment is selected (top right dropdown)
2. Verify variable names match (case-sensitive)
3. Use `{{variableName}}` syntax
4. Check variable is set (eye icon 👁️ → view values)

### Issue: "Unauthorized" on Every Request

**Solution:**

1. Login first: `POST /auth/login`
2. Check Tests tab has token-save script
3. Verify `{{accessToken}}` is set in environment
4. Add Auth to request: Bearer Token → `{{accessToken}}`

### Issue: Token Expired

**Solution:**

```
POST {{baseUrl}}/auth/refreshAcessToken


Body:
{
 "refreshToken": "{{refreshToken}}"
}


Tests:
if (pm.response.code === 200) {
   pm.environment.set('accessToken', pm.response.json().accessToken);
}
```

---

## 📊 Testing Progress Checklist

### Basic Setup

- [ ] Import environment file
- [ ] Update baseUrl
- [ ] Test health check endpoint

### Authentication

- [ ] Register user
- [ ] Login user
- [ ] Token auto-saves
- [ ] Get current user works
- [ ] Logout works

### CRUD Operations

- [ ] Create resource (POST)
- [ ] Read resource (GET)
- [ ] Update resource (PATCH/PUT)
- [ ] Delete resource (DELETE)

### Role Testing

- [ ] Test as CLIENT
- [ ] Test as FREELANCER
- [ ] Test as MODERATOR
- [ ] Test as ADMIN

### Complete Workflows

- [ ] User registration flow
- [ ] Project creation flow
- [ ] Freelancer assignment flow
- [ ] Payment processing flow

### Edge Cases

- [ ] Test with invalid data
- [ ] Test with missing fields
- [ ] Test with wrong auth
- [ ] Test with expired token

---

## 📄 File Structure

```
CursorVersion6/
├── Postman_Environment.json ← Import this
├── Postman_Collection_Complete.json ← Import this (optional)
├── POSTMAN_TESTING_GUIDE.md ← Your main reference
├── POSTMAN_IMPORT_GUIDE.md ← Setup instructions
├── TESTING_RESOURCES_README.md ← You are here
│
├── API_ENDPOINTS_DOCUMENTATION.md
├── DATABASE_SCHEMA_DOCUMENTATION.md
├── DATABASE_QUICK_REFERENCE.md
├── ER_DIAGRAM.md
├── PROJECT_OVERVIEW.md
└── DOCUMENTATION_INDEX.md
```

---

## 🎯 What's Included vs What to Create

### ✅ Already Created (Ready to Use)

- **Environment variables** - Import and use
- **Auth endpoints** - In partial collection
- **Complete endpoint list** - In testing guide
- **Request examples** - For every endpoint
- **Testing workflows** - Step-by-step guides

### 🔨 You Create in Postman

- **Additional requests** - Using examples from guide
- **Your folder organization** - Based on your needs
- **Test scripts** - Custom validations
- **Collection runs** - Automated testing

---

## 🎉 Summary

**You now have everything to test your API:**

### 📦 Files

✅ Environment with all variables
✅ Partial collection with auth setup
✅ Complete endpoint reference (150+ endpoints)

### 📖 Documentation

✅ Import guide (setup instructions)
✅ Testing guide (endpoint reference)
✅ This README (overview)

### 🚀 Ready to Test

✅ Step-by-step instructions
✅ Example requests
✅ Workflows for all scenarios
✅ Troubleshooting help

---

## 🆘 Need Help?

1. **Setup issues?** → Read `POSTMAN_IMPORT_GUIDE.md`
2. **Endpoint examples?** → Read `POSTMAN_TESTING_GUIDE.md`
3. **API details?** → Read `API_ENDPOINTS_DOCUMENTATION.md`
4. **Database info?** → Read `DATABASE_SCHEMA_DOCUMENTATION.md`

---

## 🎊 Start Testing!

**Recommended order:**

1. ✅ Read this file (you're here!)
2. ✅ Read `POSTMAN_IMPORT_GUIDE.md` (5 min)
3. ✅ Import environment file
4. ✅ Open `POSTMAN_TESTING_GUIDE.md` (keep it open)
5. ✅ Create first request (register)
6. ✅ Create second request (login)
7. ✅ Start testing other endpoints!

**Happy Testing! 🚀🎉**
