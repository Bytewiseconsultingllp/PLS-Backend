# Postman Import & Setup Guide

Quick guide to import and start testing all 150+ API endpoints.

---

## 📦 Files You Have

1. **Postman_Environment.json** - Environment variables (baseUrl, tokens, etc.)
2. **Postman_Collection_Complete.json** - Partial collection (Auth, Blog, Consultation, Contact Us)
3. **POSTMAN_TESTING_GUIDE.md** - Complete endpoint reference with examples

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Import Environment

1. Open Postman
2. Click **"Environments"** (left sidebar) or gear icon ⚙️
3. Click **"Import"**
4. Select `Postman_Environment.json`
5. Click **"Backend API - Development"** to activate it

### Step 2: Set Your Base URL

1. In Postman, click the environment dropdown (top right)
2. Click the eye icon 👁️ next to "Backend API - Development"
3. Update `baseUrl` if your server runs on different port/host

- Default: `http://localhost:3000/api/v1`
- Production: `https://your-api.com/api/v1`

### Step 3: Create Your First Request

Since the complete collection is large, let's create requests manually using the guide:

**Example: Register a User**

1. Click **"New"** → **"HTTP Request"**
2. Set method to **POST**
3. Enter URL: `{{baseUrl}}/auth/register`
4. Go to **"Body"** → **"raw"** → **"JSON"**
5. Paste this:

```json
{
 "username": "testuser",
 "fullName": "Test User",
 "email": "test@example.com",
 "password": "SecurePass123!",
 "phone": "+1234567890"
}
```

6. Click **"Send"**

### Step 4: Login and Auto-Save Token

1. Create new request: **POST** `{{baseUrl}}/auth/login`
2. Body:

```json
{
 "email": "test@example.com",
 "password": "SecurePass123!"
}
```

3. Go to **"Tests"** tab
4. Add this script (auto-saves token):

```javascript
if (pm.response.code === 200) {
 var jsonData = pm.response.json();
 if (jsonData.accessToken) {
   pm.environment.set("accessToken", jsonData.accessToken);
 }
 if (jsonData.refreshToken) {
   pm.environment.set("refreshToken", jsonData.refreshToken);
 }
 console.log("✅ Logged in! Token saved.");
}
```

5. Click **"Send"**

### Step 5: Test Authenticated Endpoint

1. Create new request: **GET** `{{baseUrl}}/auth/getCurrentUser`
2. Go to **"Authorization"** tab
3. Select **"Bearer Token"**
4. Enter: `{{accessToken}}`
5. Click **"Send"**

**✅ You're now ready to test all endpoints!**

---

## 📁 Organizing Your Postman Collection

### Recommended Folder Structure

```
Backend API
├── 01. Health
├── 02. Authentication
│   ├── Auth Flow
│   ├── User Management
│   ├── Profile Updates
│   ├── Password Recovery
│   └── User Deletion
├── 03. Blog
├── 04. Consultation
├── 05. Contact Us
├── 06. Freelancer
│   ├── V1 Endpoints
│   ├── V2 Endpoints
│   ├── Niche Management
│   └── Registration System
├── 07. Get Quote
├── 08. Hire Us
├── 09. Milestone
├── 10. Navigation Pages
├── 11. Newsletter
├── 12. Payment
├── 13. Project Builder
├── 14. Project Request
├── 15. Project
│   ├── Project Management
│   ├── Freelancer Assignment
│   └── Project Updates
├── 16. Trash
└── 17. Visitors
```

---

## 🔑 Setting Up Collection-Level Authentication

### Method 1: Collection-Level Bearer Token

1. Right-click your collection
2. Click **"Edit"**
3. Go to **"Authorization"** tab
4. Select **"Bearer Token"**
5. Enter: `{{accessToken}}`
6. Click **"Update"**

Now all requests inherit this auth automatically!

### Method 2: Pre-request Script

Add this to Collection's Pre-request Script:

```javascript
// Auto-set authorization header if token exists
const token = pm.environment.get("accessToken");
if (token && !pm.request.auth) {
 pm.request.headers.add({
   key: "Authorization",
   value: "Bearer " + token,
 });
}
```

---

## 🧪 Quick Test Sequence

### Sequence 1: Basic User Flow

```
1. POST /auth/register
  → Creates user


2. POST /auth/login
  → Returns token (auto-saved)


3. GET /auth/getCurrentUser
  → Returns your profile


4. PATCH /auth/updateInfo
  → Updates profile


5. GET /auth/logoutUser
  → Logs out
```

### Sequence 2: Admin Project Flow

```
1. POST /auth/login (as admin)
  → Login as admin


2. POST /project/createProject
  → Create project


3. POST /milestone/createMilestone/:projectId
  → Add milestones


4. GET /freelancer/listAllFreelancers
  → View available freelancers


5. PATCH /project/selectFreelancerForProject/:projectSlug
  → Assign freelancer
```

### Sequence 3: Freelancer Flow

```
1. POST /freelancer/register
  → Submit application


2. POST /auth/login (as freelancer after approval)
  → Login


3. GET /project/getAllProjects
  → View projects


4. PATCH /project/createInterestedFreelancers/:projectSlug
  → Express interest


5. PATCH /milestone/updateMilestoneProgress/:milestoneId
  → Update progress
```

---

## 📝 Creating Requests from Guide

Use `POSTMAN_TESTING_GUIDE.md` as your reference. For each endpoint:

### Quick Copy Template

```
Method: [GET/POST/PATCH/DELETE]
URL: {{baseUrl}}/[endpoint-path]
Auth: [Yes/No]
Body: [JSON from guide]
```

### Example: Create Consultation

From guide:

```
POST /consultation/requestAConsultation
```

In Postman:

1. **Method:** POST
2. **URL:** `{{baseUrl}}/consultation/requestAConsultation`
3. **Headers:** `Content-Type: application/json`
4. **Body (raw JSON):**

```json
{
 "name": "John Doe",
 "email": "john@example.com",
 "phone": "+1234567890",
 "message": "I need a consultation",
 "bookingDate": "2025-11-01T10:00:00Z",
 "subject": "Project Discussion",
 "address": "123 Main St"
}
```

---

## 🎯 Environment Variables Reference

| Variable           | Usage             | Set By       |
| ------------------ | ----------------- | ------------ |
| `{{baseUrl}}`      | API base URL      | Manual       |
| `{{accessToken}}`  | Auth token        | Auto (login) |
| `{{refreshToken}}` | Refresh token     | Auto (login) |
| `{{userId}}`       | Current user ID   | Manual/Auto  |
| `{{projectId}}`    | Test project      | Manual       |
| `{{projectSlug}}`  | Test project slug | Manual       |

### Setting Variables Manually

In Postman environment:

1. Click environment dropdown
2. Click eye icon 👁️
3. Click **"Edit"**
4. Add/Update values
5. Click **"Save"**

### Setting Variables from Response

Add to Tests tab:

```javascript
// Save project ID from response
if (pm.response.code === 201) {
 var jsonData = pm.response.json();
 if (jsonData.id) {
   pm.environment.set("projectId", jsonData.id);
 }
 if (jsonData.projectSlug) {
   pm.environment.set("projectSlug", jsonData.projectSlug);
 }
}
```

---

## 🔍 Finding Endpoints Quickly

### In POSTMAN_TESTING_GUIDE.md

Use Ctrl+F / Cmd+F to search for:

**By functionality:**

- "login" → Authentication
- "project" → Project management
- "milestone" → Milestone tracking
- "payment" → Payment endpoints
- "freelancer" → Freelancer system

**By HTTP method:**

- "POST" → Create operations
- "GET" → Read operations
- "PATCH" → Update operations
- "DELETE" → Delete operations

**By auth requirement:**

- "Auth | ✅ Yes" → Requires login
- "Auth | ❌ No" → Public endpoint

---

## 💡 Pro Tips

### 1. Use Postman Variables

Instead of:

```
http://localhost:3000/api/v1/auth/login
```

Use:

```
{{baseUrl}}/auth/login
```

### 2. Use Random Data

Postman has built-in variables:

```json
{
 "username": "user{{$randomInt}}",
 "email": "test{{$timestamp}}@example.com",
 "phone": "+1{{$randomInt}}"
}
```

### 3. Chain Requests

Extract data from one response for the next:

**Request 1 Tests:**

```javascript
var jsonData = pm.response.json();
pm.environment.set("projectId", jsonData.id);
```

**Request 2 URL:**

```
{{baseUrl}}/milestone/createMilestone/{{projectId}}
```

### 4. Use Pre-request Scripts

For dynamic data:

```javascript
// Generate current date + 30 days
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 30);
pm.environment.set("deadline", futureDate.toISOString());
```

Then use `{{deadline}}` in request body.

### 5. Create Test Collections

Separate collections for different scenarios:

- **Development** - Testing new features
- **Staging** - Pre-production testing
- **Smoke Tests** - Quick health checks
- **Regression** - Full test suite

---

## 🐛 Troubleshooting

### Problem: Requests Failing

**Check:**

1. ✅ Server is running (`http://localhost:3000`)
2. ✅ Environment is selected (top right)
3. ✅ `baseUrl` is correct
4. ✅ Token is set (for auth endpoints)

### Problem: "Unauthorized" Error

**Solution:**

```
1. POST {{baseUrl}}/auth/login
2. Check Tests tab for auto-save script
3. Verify {{accessToken}} is set in environment
4. Add to request: Authorization → Bearer Token → {{accessToken}}
```

### Problem: "Validation Error"

**Solution:**

- Check request body matches example in guide
- Verify all required fields are present
- Check data types (string vs number vs boolean)
- Use exact field names (case-sensitive)

### Problem: Token Expired

**Solution:**

```
POST {{baseUrl}}/auth/refreshAcessToken
Body: { "refreshToken": "{{refreshToken}}" }
```

---

## 📊 Testing Workflow

### 1. Setup (One-time)

- [ ] Import environment
- [ ] Set baseUrl
- [ ] Create folder structure

### 2. Start Testing

- [ ] Register user
- [ ] Login (token auto-saves)
- [ ] Test endpoints from guide

### 3. Advanced Testing

- [ ] Test as different roles (Client, Admin, Moderator, Freelancer)
- [ ] Test error scenarios
- [ ] Test edge cases

---

## 🎓 Learn More

### Postman Features to Explore

1. **Collection Runner** - Run multiple requests automatically
2. **Tests** - Add assertions to validate responses
3. **Mock Servers** - Test without backend
4. **Monitors** - Schedule automatic tests
5. **Documentation** - Auto-generate API docs

### Resources

- [Postman Learning Center](https://learning.postman.com/)
- [Variables Guide](https://learning.postman.com/docs/sending-requests/variables/)
- [Tests Examples](https://learning.postman.com/docs/writing-scripts/test-scripts/)

---

## 📄 Related Documentation

- **Complete Endpoint Reference:** `POSTMAN_TESTING_GUIDE.md`
- **API Documentation:** `API_ENDPOINTS_DOCUMENTATION.md`
- **Database Schema:** `DATABASE_SCHEMA_DOCUMENTATION.md`
- **Project Overview:** `PROJECT_OVERVIEW.md`

---

## ✅ Quick Checklist

Setup:

- [ ] Import `Postman_Environment.json`
- [ ] Select environment in Postman
- [ ] Update `baseUrl` if needed

Test Authentication:

- [ ] Create register request
- [ ] Create login request with auto-save script
- [ ] Test `getCurrentUser` with bearer token

Create Collection:

- [ ] Create folders by module
- [ ] Add requests from guide
- [ ] Set collection-level auth

Start Testing:

- [ ] Test basic endpoints
- [ ] Test as different roles
- [ ] Test complete workflows

---

## 🎉 You're All Set!

**What you have:**
✅ Environment file with all variables
✅ Complete endpoint reference (150+ endpoints)
✅ Example requests for every module
✅ Auto-save scripts for tokens
✅ Testing workflows

**Next steps:**

1. Import environment
2. Open `POSTMAN_TESTING_GUIDE.md`
3. Create requests from the guide
4. Start testing!

**Happy Testing! 🚀**

---
