# Postman Testing Guide - Complete API Collection

Complete guide for testing all 150+ API endpoints using Postman.

---

## 📦 Quick Setup

### 1. Import Files into Postman

1. Open Postman
2. Click **Import** button
3. Import these files:

- `Postman_Environment.json` - Environment variables
- `Postman_Collection_Complete.json` - API collection (partial - see below for all endpoints)

### 2. Select Environment

1. Click environment dropdown (top right)
2. Select **Backend API - Development**
3. Update `baseUrl` if your server runs on different port

### 3. Authentication Setup

**Important:** Most endpoints require authentication!

1. First, register a user OR login
2. The token will auto-save to `{{accessToken}}`
3. All authenticated requests will use this token automatically

---

## 🔑 Authentication Flow

### Step 1: Register → Step 2: Login → Step 3: Test Endpoints

```
POST /auth/register
 ↓
POST /auth/sendOTP (optional - if email verification required)
 ↓
POST /auth/verifyEmail (optional)
 ↓
POST /auth/login ← AUTO-SAVES TOKEN
 ↓
All other endpoints now work!
```

---

## 📚 Complete API Endpoint List

### Module 1: Health (1 endpoint)

| Method | Endpoint  | Auth  | Description  |
| ------ | --------- | ----- | ------------ |
| GET    | `/health` | ❌ No | Health check |

---

### Module 2: Authentication & Users (24 endpoints)

#### Auth Flow (8 endpoints)

| Method | Endpoint                     | Auth   | Description            |
| ------ | ---------------------------- | ------ | ---------------------- |
| POST   | `/auth/register`             | ❌ No  | Register new user      |
| POST   | `/auth/sendOTP`              | ❌ No  | Send OTP to email      |
| POST   | `/auth/verifyEmail`          | ❌ No  | Verify email with OTP  |
| POST   | `/auth/login`                | ❌ No  | Login user             |
| POST   | `/auth/refreshAcessToken`    | ❌ No  | Refresh access token   |
| GET    | `/auth/logoutUser`           | ✅ Yes | Logout current session |
| POST   | `/auth/logoutUserForceFully` | ✅ Yes | Logout all sessions    |

**Example - Register:**

```json
POST {{baseUrl}}/auth/register
{
 "username": "johndoe",
 "fullName": "John Doe",
 "email": "john@example.com",
 "password": "SecurePass123!",
 "phone": "+1234567890"
}
```

**Example - Login:**

```json
POST {{baseUrl}}/auth/login
{
 "email": "john@example.com",
 "password": "SecurePass123!"
}
```

#### User Management (5 endpoints)

| Method | Endpoint                         | Auth   | Role      | Description        |
| ------ | -------------------------------- | ------ | --------- | ------------------ |
| GET    | `/auth/getCurrentUser`           | ✅ Yes | Any       | Get logged-in user |
| GET    | `/auth/getSingleUser?userId=xxx` | ✅ Yes | Any       | Get user by ID     |
| GET    | `/auth/getAllUsers`              | ✅ Yes | Admin/Mod | List all users     |
| GET    | `/auth/searchUsers?search=xxx`   | ✅ Yes | Any       | Search users       |
| GET    | `/auth/getAllClients`            | ✅ Yes | Admin/Mod | List all clients   |

#### Profile Updates (4 endpoints)

| Method | Endpoint               | Auth   | Description      |
| ------ | ---------------------- | ------ | ---------------- |
| PATCH  | `/auth/updateInfo`     | ✅ Yes | Update user info |
| PATCH  | `/auth/updateEmail`    | ✅ Yes | Update email     |
| PATCH  | `/auth/updatePassword` | ✅ Yes | Change password  |
| PATCH  | `/auth/updateRole`     | ✅ Yes | Change user role |

**Example - Update Info:**

```json
PATCH {{baseUrl}}/auth/updateInfo
{
 "fullName": "John Updated",
 "address": "123 Main St",
 "detail": "Updated details"
}
```

#### Password Recovery (3 endpoints)

| Method | Endpoint                              | Auth  | Description            |
| ------ | ------------------------------------- | ----- | ---------------------- |
| POST   | `/auth/forgotPasswordRequestFromUser` | ❌ No | Request password reset |
| POST   | `/auth/verifyForgotPasswordRequest`   | ❌ No | Verify reset OTP       |
| PATCH  | `/auth/updateNewPasswordRequest`      | ❌ No | Set new password       |

#### User Deletion (3 endpoints)

| Method | Endpoint                | Auth   | Role      | Description      |
| ------ | ----------------------- | ------ | --------- | ---------------- |
| PATCH  | `/auth/trashTheUser`    | ✅ Yes | Admin/Mod | Soft delete      |
| PATCH  | `/auth/unTrashTheUser`  | ✅ Yes | Admin     | Restore user     |
| DELETE | `/auth/deleteUser/:uid` | ✅ Yes | Admin     | Permanent delete |

---

### Module 3: Blog (7 endpoints)

| Method | Endpoint                                  | Auth   | Role      | Description        |
| ------ | ----------------------------------------- | ------ | --------- | ------------------ |
| POST   | `/blog/createBlog`                        | ✅ Yes | Admin/Mod | Create blog post   |
| GET    | `/blog/getSingleBlog/:blogSlug`           | ❌ No  | -         | Get blog by slug   |
| GET    | `/blog/getAllPublicBlogs`                 | ❌ No  | -         | List public blogs  |
| GET    | `/blog/getAllPrivateBlogs`                | ✅ Yes | Admin     | List private blogs |
| PATCH  | `/blog/updateBlog/:blogSlug`              | ✅ Yes | Admin/Mod | Update blog        |
| PATCH  | `/blog/makeBlogPublicOrPrivate/:blogSlug` | ✅ Yes | Admin     | Toggle visibility  |
| DELETE | `/blog/deleteBlog/:blogSlug`              | ✅ Yes | Admin     | Delete blog        |

**Example - Create Blog:**

```json
POST {{baseUrl}}/blog/createBlog
{
 "blogTitle": "My First Blog Post",
 "blogThumbnail": "https://example.com/image.jpg",
 "blogOverview": "A short overview",
 "blogBody": "The full blog content goes here...",
 "isPublished": true
}
```

---

### Module 4: Consultation (9 endpoints)

| Method | Endpoint                                           | Auth   | Role      | Description       |
| ------ | -------------------------------------------------- | ------ | --------- | ----------------- |
| POST   | `/consultation/requestAConsultation`               | ❌ No  | -         | Book consultation |
| POST   | `/consultation/updateRequestedConsultation/:id`    | ❌ No  | -         | Update booking    |
| GET    | `/consultation/getAllRequestedConsultations`       | ✅ Yes | Admin/Mod | List all          |
| GET    | `/consultation/getSingleRequestedConsultation/:id` | ✅ Yes | Admin/Mod | Get one           |
| DELETE | `/consultation/deleteRequestedConsultation/:id`    | ✅ Yes | Admin     | Delete            |
| PATCH  | `/consultation/acceptRequestedConsultation/:id`    | ✅ Yes | Admin/Mod | Accept            |
| PATCH  | `/consultation/rejectRequestedConsultation/:id`    | ✅ Yes | Admin/Mod | Reject            |
| PATCH  | `/consultation/trashRequestedConsultation/:id`     | ✅ Yes | Admin/Mod | Soft delete       |
| PATCH  | `/consultation/untrashRequestedConsultation/:id`   | ✅ Yes | Admin     | Restore           |

**Example - Request Consultation:**

```json
POST {{baseUrl}}/consultation/requestAConsultation
{
 "name": "John Doe",
 "email": "john@example.com",
 "phone": "+1234567890",
 "message": "I need a consultation about...",
 "bookingDate": "2025-11-01T10:00:00Z",
 "subject": "Project Discussion",
 "address": "123 Main St"
}
```

---

### Module 5: Contact Us (7 endpoints)

| Method | Endpoint                           | Auth   | Role      | Description   |
| ------ | ---------------------------------- | ------ | --------- | ------------- |
| POST   | `/contactUs/createMessage`         | ❌ No  | -         | Send message  |
| GET    | `/contactUs/getAllMessages`        | ✅ Yes | Admin/Mod | List all      |
| GET    | `/contactUs/getSingleMessage/:id`  | ✅ Yes | Admin/Mod | Get one       |
| DELETE | `/contactUs/deleteMessage/:id`     | ✅ Yes | Admin     | Delete        |
| POST   | `/contactUs/sendMessageToUser/:id` | ✅ Yes | Admin/Mod | Reply to user |
| PATCH  | `/contactUs/moveMessageToTrash`    | ✅ Yes | Admin/Mod | Soft delete   |
| PATCH  | `/contactUs/unTrashMessage`        | ✅ Yes | Admin     | Restore       |

**Example - Create Message:**

```json
POST {{baseUrl}}/contactUs/createMessage
{
 "firstName": "John",
 "lastName": "Doe",
 "email": "john@example.com",
 "message": "I have a question about your services..."
}
```

---

### Module 6: Freelancer (27 endpoints)

#### V1 Endpoints (6)

| Method | Endpoint                                     | Auth   | Role      | Description         |
| ------ | -------------------------------------------- | ------ | --------- | ------------------- |
| POST   | `/freelancer/getFreeLancerJoinUsRequest`     | ❌ No  | -         | Submit join request |
| GET    | `/freelancer/getAllFreeLancerRequest`        | ✅ Yes | Admin/Mod | List all requests   |
| GET    | `/freelancer/getSingleFreeLancerRequest/:id` | ✅ Yes | Admin/Mod | Get one             |
| GET    | `/freelancer/deleteFreeLancerRequest/:id`    | ✅ Yes | Admin/Mod | Delete              |
| PATCH  | `/freelancer/trashFreeLancerRequest/:id`     | ✅ Yes | Admin/Mod | Trash               |
| PATCH  | `/freelancer/untrashFreeLancerRequest/:id`   | ✅ Yes | Admin     | Restore             |

#### V2 Endpoints (6)

| Method | Endpoint                                       | Auth   | Role      | Description       |
| ------ | ---------------------------------------------- | ------ | --------- | ----------------- |
| POST   | `/freelancer/getFreeLancerJoinUsRequestV2`     | ❌ No  | -         | Submit V2 request |
| GET    | `/freelancer/getAllFreeLancerRequestV2`        | ✅ Yes | Admin/Mod | List all V2       |
| GET    | `/freelancer/getSingleFreeLancerRequestV2/:id` | ✅ Yes | Admin/Mod | Get one           |
| GET    | `/freelancer/deleteFreeLancerRequestV2/:id`    | ✅ Yes | Admin/Mod | Delete            |
| PATCH  | `/freelancer/trashFreeLancerRequestV2/:id`     | ✅ Yes | Admin/Mod | Trash             |
| PATCH  | `/freelancer/untrashFreeLancerRequestV2/:id`   | ✅ Yes | Admin     | Restore           |

#### Niche Management (5)

| Method | Endpoint                                       | Auth   | Role      | Description  |
| ------ | ---------------------------------------------- | ------ | --------- | ------------ |
| POST   | `/freelancer/createNicheListForFreelancer`     | ✅ Yes | Admin/Mod | Create niche |
| DELETE | `/freelancer/deleteNicheForFreelancer/:id`     | ✅ Yes | Admin/Mod | Delete niche |
| GET    | `/freelancer/listAllNichesForFreelancer`       | ✅ Yes | Admin/Mod | List all     |
| GET    | `/freelancer/listSingleNicheForFreelancer/:id` | ✅ Yes | Admin/Mod | Get one      |
| PUT    | `/freelancer/updateNicheForFreelancer/:id`     | ✅ Yes | Admin/Mod | Update       |

#### Freelancer Management (4)

| Method | Endpoint                                     | Auth   | Role         | Description    |
| ------ | -------------------------------------------- | ------ | ------------ | -------------- |
| PATCH  | `/freelancer/acceptFreeLancerRequest/:id`    | ✅ Yes | Admin/Mod    | Accept request |
| GET    | `/freelancer/listAllFreelancers`             | ✅ Yes | Admin/Mod/FL | List all       |
| GET    | `/freelancer/listSingleFreelancer/:username` | ✅ Yes | Admin/Mod/FL | Get one        |

#### New Registration System (6)

| Method | Endpoint                                | Auth   | Role      | Description      |
| ------ | --------------------------------------- | ------ | --------- | ---------------- |
| POST   | `/freelancer/register`                  | ❌ No  | -         | New registration |
| GET    | `/freelancer/registrations`             | ✅ Yes | Admin/Mod | List all         |
| GET    | `/freelancer/registrations/:id`         | ✅ Yes | Admin/Mod | Get one          |
| PATCH  | `/freelancer/registrations/:id/accept`  | ✅ Yes | Admin/Mod | Accept           |
| DELETE | `/freelancer/registrations/:id/reject`  | ✅ Yes | Admin/Mod | Reject           |
| PATCH  | `/freelancer/registrations/:id/trash`   | ✅ Yes | Admin/Mod | Trash            |
| PATCH  | `/freelancer/registrations/:id/untrash` | ✅ Yes | Admin     | Restore          |

**Example - Freelancer Join Request:**

```json
POST {{baseUrl}}/freelancer/getFreeLancerJoinUsRequest
{
 "name": "Jane Developer",
 "email": "jane@example.com",
 "phone": "+1234567890",
 "address": "456 Dev Street",
 "detail": "I'm a full-stack developer with 5 years experience",
 "yourPortfolio": "https://jane.dev",
 "niche": "Web Development",
 "yourTopProject1": "E-commerce Platform",
 "yourTopProject2": "Social Media App",
 "yourTopProject3": "CRM System"
}
```

---

### Module 7: Get Quote (8 endpoints)

| Method | Endpoint                                | Auth   | Role      | Description    |
| ------ | --------------------------------------- | ------ | --------- | -------------- |
| POST   | `/getQuotes/createQuote`                | ❌ No  | -         | Request quote  |
| POST   | `/getQuotes/createServicesForQuote`     | ❌ No  | -         | Add service    |
| DELETE | `/getQuotes/deleteServicesForQuote/:id` | ✅ Yes | Admin/Mod | Delete service |
| GET    | `/getQuotes/getSingleQuote/:id`         | ✅ Yes | Admin/Mod | Get one        |
| GET    | `/getQuotes/getAllQuotes`               | ✅ Yes | Admin/Mod | List all       |
| PATCH  | `/getQuotes/trashQuote/:id`             | ✅ Yes | Admin/Mod | Trash          |
| PATCH  | `/getQuotes/unTrashQuote/:id`           | ✅ Yes | Admin     | Restore        |
| DELETE | `/getQuotes/deleteQuote/:id`            | ✅ Yes | Admin     | Delete         |

**Example - Create Quote:**

```json
POST {{baseUrl}}/getQuotes/createQuote
{
 "name": "John Doe",
 "email": "john@example.com",
 "phone": "+1234567890",
 "company": "Acme Corp",
 "address": "123 Business Ave",
 "deadline": "2025-12-31",
 "services": "Web Development, Mobile App",
 "detail": "Need a full-stack solution"
}
```

---

### Module 8: Hire Us (6 endpoints)

| Method | Endpoint                                   | Auth   | Role  | Description         |
| ------ | ------------------------------------------ | ------ | ----- | ------------------- |
| POST   | `/hireUs/createHireUsRequest`              | ❌ No  | -     | Submit hire request |
| GET    | `/hireUs/getAllHireUsRequests`             | ✅ Yes | Admin | List all            |
| GET    | `/hireUs/getSingleHireUsRequest/:id`       | ✅ Yes | Admin | Get one             |
| PATCH  | `/hireUs/trashHireUsRequest/:id`           | ✅ Yes | Admin | Trash               |
| PATCH  | `/hireUs/untrashHireUsRequest/:id`         | ✅ Yes | Admin | Restore             |
| DELETE | `/hireUs/permanentDeleteHireUsRequest/:id` | ✅ Yes | Admin | Delete              |

**Example - Hire Us (with file upload):**

```
POST {{baseUrl}}/hireUs/createHireUsRequest
Content-Type: multipart/form-data


{
 "name": "John Doe",
 "email": "john@example.com",
 "phone": "+1234567890",
 "company": "Acme Corp",
 "address": "123 Business Ave",
 "detail": "We need a development team",
 "docs": [file1, file2]  // Use Postman's form-data for file upload
}
```

---

### Module 9: Milestone (6 endpoints)

| Method | Endpoint                                          | Auth   | Role         | Description     |
| ------ | ------------------------------------------------- | ------ | ------------ | --------------- |
| POST   | `/milestone/createMilestone/:projectId`           | ✅ Yes | Admin/Mod    | Create one      |
| POST   | `/milestone/createMultipleMilestones/:projectId`  | ✅ Yes | Admin/Mod    | Create multiple |
| PATCH  | `/milestone/updateMilestone/:milestoneId`         | ✅ Yes | Admin/Mod    | Update          |
| DELETE | `/milestone/deleteMilestone/:milestoneId`         | ✅ Yes | Admin/Mod    | Delete          |
| PATCH  | `/milestone/completeMilestone/:milestoneId`       | ✅ Yes | Admin/Mod/FL | Mark complete   |
| PATCH  | `/milestone/updateMilestoneProgress/:milestoneId` | ✅ Yes | Admin/Mod/FL | Update progress |

**Example - Create Milestone:**

```json
POST {{baseUrl}}/milestone/createMilestone/1
{
 "mileStoneName": "Phase 1: Planning",
 "description": "Initial planning and requirements gathering",
 "deadline": "2025-11-15T23:59:59Z",
 "totalProgressPoints": 100,
 "priorityRank": 1
}
```

**Example - Create Multiple:**

```json
POST {{baseUrl}}/milestone/createMultipleMilestones/1
{
 "milestones": [
   {
     "mileStoneName": "Phase 1",
     "deadline": "2025-11-15T23:59:59Z",
     "totalProgressPoints": 100,
     "priorityRank": 1
   },
   {
     "mileStoneName": "Phase 2",
     "deadline": "2025-12-15T23:59:59Z",
     "totalProgressPoints": 100,
     "priorityRank": 2
   }
 ]
}
```

---

### Module 10: Navigation Pages (8 endpoints)

| Method | Endpoint                                               | Auth   | Role      | Description |
| ------ | ------------------------------------------------------ | ------ | --------- | ----------- |
| POST   | `/navigationPages/createNavigationPage`                | ❌ No  | -         | Create page |
| GET    | `/navigationPages/getSingleNavigationPage/:id`         | ✅ Yes | Admin/Mod | Get one     |
| GET    | `/navigationPages/getAllNavigationPages`               | ❌ No  | -         | List all    |
| PUT    | `/navigationPages/updateNavigationPage/:id`            | ✅ Yes | Admin/Mod | Update      |
| DELETE | `/navigationPages/deleteNavigationPage/:id`            | ❌ No  | -         | Delete      |
| PATCH  | `/navigationPages/trashNavigationPage/:id`             | ✅ Yes | Admin/Mod | Trash       |
| PATCH  | `/navigationPages/untrashNavigationPage/:id`           | ✅ Yes | Admin     | Restore     |
| PATCH  | `/navigationPages/menuItems/:id/addChildrenToMenuItem` | ❌ No  | -         | Add submenu |

---

### Module 11: Newsletter (5 endpoints)

| Method | Endpoint                                       | Auth   | Role      | Description      |
| ------ | ---------------------------------------------- | ------ | --------- | ---------------- |
| POST   | `/newsletter/subscribeToNewsLetter`            | ✅ Yes | Any       | Subscribe        |
| POST   | `/newsletter/unSubscribeToNewsLetter`          | ✅ Yes | Any       | Unsubscribe      |
| POST   | `/newsletter/sendNewsLetterToSingleSubscriber` | ✅ Yes | Admin/Mod | Send to one      |
| POST   | `/newsletter/sendNewsLetterToAllSubscribers`   | ✅ Yes | Admin/Mod | Send to all      |
| GET    | `/newsletter/listAllSubscribedMails`           | ✅ Yes | Admin     | List subscribers |

**Example - Subscribe:**

```json
POST {{baseUrl}}/newsletter/subscribeToNewsLetter
{
 "email": "john@example.com"
}
```

---

### Module 12: Payment (7 endpoints - Stripe Integration)

| Method | Endpoint                                          | Auth   | Role | Description     |
| ------ | ------------------------------------------------- | ------ | ---- | --------------- |
| POST   | `/payment/create-payment-intent`                  | ✅ Yes | Any  | Create payment  |
| GET    | `/payment/payment-intent/:paymentIntentId/status` | ✅ Yes | Any  | Check status    |
| POST   | `/payment/create-checkout-session`                | ✅ Yes | Any  | Create session  |
| GET    | `/payment/checkout-session/:sessionId/status`     | ✅ Yes | Any  | Check session   |
| POST   | `/payment/webhook`                                | ❌ No  | -    | Stripe webhook  |
| POST   | `/payment/create-refund`                          | ✅ Yes | Any  | Create refund   |
| GET    | `/payment/history`                                | ✅ Yes | Any  | Payment history |

**Example - Create Payment Intent:**

```json
POST {{baseUrl}}/payment/create-payment-intent
{
 "amount": 10000,
 "currency": "usd",
 "description": "Project payment",
 "metadata": {
   "projectId": "123",
   "userId": "user_123"
 }
}
```

**Example - Create Checkout Session:**

```json
POST {{baseUrl}}/payment/create-checkout-session
{
 "amount": 10000,
 "currency": "usd",
 "successUrl": "https://example.com/success",
 "cancelUrl": "https://example.com/cancel"
}
```

---

### Module 13: Project Builder (10 endpoints)

| Method | Endpoint                                      | Auth   | Description            |
| ------ | --------------------------------------------- | ------ | ---------------------- |
| POST   | `/project-builder/`                           | ✅ Yes | Create project builder |
| GET    | `/project-builder/`                           | ✅ Yes | List all               |
| GET    | `/project-builder/:id`                        | ✅ Yes | Get one                |
| PUT    | `/project-builder/:id`                        | ✅ Yes | Update                 |
| DELETE | `/project-builder/:id`                        | ✅ Yes | Delete (soft)          |
| GET    | `/project-builder/:id/freelancers`            | ✅ Yes | Get with freelancers   |
| POST   | `/project-builder/:id/interested-freelancers` | ✅ Yes | Add interested         |
| DELETE | `/project-builder/:id/interested-freelancers` | ✅ Yes | Remove interested      |
| POST   | `/project-builder/:id/selected-freelancers`   | ✅ Yes | Select freelancer      |
| DELETE | `/project-builder/:id/selected-freelancers`   | ✅ Yes | Remove selected        |

**Example - Create Project Builder:**

```json
POST {{baseUrl}}/project-builder/
{
 "projectName": "E-commerce Platform",
 "projectDescription": "Build a full-featured e-commerce site",
 "projectType": "Web Application",
 "technologies": ["React", "Node.js", "PostgreSQL"],
 "features": ["Shopping Cart", "Payment Integration", "Admin Dashboard"],
 "budget": 50000,
 "timeline": "3 months",
 "priority": "HIGH",
 "clientName": "John Doe",
 "clientEmail": "john@example.com",
 "clientPhone": "+1234567890",
 "clientCompany": "Acme Corp"
}
```

---

### Module 14: Project Request (4 endpoints)

| Method | Endpoint                 | Auth   | Role      | Description    |
| ------ | ------------------------ | ------ | --------- | -------------- |
| POST   | `/projectRequest/create` | ❌ No  | -         | Create request |
| GET    | `/projectRequest/`       | ✅ Yes | Admin/Mod | List all       |
| GET    | `/projectRequest/:id`    | ✅ Yes | Admin/Mod | Get one        |
| DELETE | `/projectRequest/:id`    | ✅ Yes | Admin/Mod | Delete         |

**Example - Create Project Request:**

```json
POST {{baseUrl}}/projectRequest/create
{
 "fullName": "John Doe",
 "businessEmail": "john@example.com",
 "phoneNumber": "+1234567890",
 "companyName": "Acme Corp",
 "companyWebsite": "https://acme.com",
 "businessAddress": "123 Business St",
 "businessType": "Technology",
 "referralSource": "Google Search",
 "timeline": "3-6 months",
 "paymentMethod": "Credit Card"
}
```

---

### Module 15: Project (17 endpoints)

#### Project Management (6)

| Method | Endpoint                                           | Auth   | Role         | Description       |
| ------ | -------------------------------------------------- | ------ | ------------ | ----------------- |
| POST   | `/project/createProject`                           | ✅ Yes | Admin/Mod    | Create project    |
| GET    | `/project/getSingleProject/:projectSlug`           | ✅ Yes | Admin/Mod/FL | Get one           |
| GET    | `/project/getAllOutsourcedProjects`                | ✅ Yes | Admin/Mod/FL | List outsourced   |
| GET    | `/project/getAllProjects`                          | ✅ Yes | Admin/Mod/FL | List all          |
| GET    | `/project/getAllProjectsWithThierClient/:clientId` | ✅ Yes | Any          | Client's projects |
| DELETE | `/project/deleteProject/:id`                       | ✅ Yes | Admin        | Delete            |
| GET    | `/project/getProjectForSelectedFreelancers`        | ✅ Yes | Admin/Mod/FL | Assigned projects |

**Example - Create Project:**

```json
POST {{baseUrl}}/project/createProject
{
 "title": "E-commerce Website Development",
 "detail": "Build a full-featured e-commerce platform",
 "niche": "Web Development",
 "bounty": 5000,
 "deadline": "2025-12-31T23:59:59Z",
 "difficultyLevel": "MEDIUM",
 "projectType": "INHOUSE"
}
```

#### Freelancer Assignment (5)

| Method | Endpoint                                                         | Auth   | Role         | Description       |
| ------ | ---------------------------------------------------------------- | ------ | ------------ | ----------------- |
| PATCH  | `/project/createInterestedFreelancers/:projectSlug`              | ✅ Yes | Admin/Mod/FL | Express interest  |
| PATCH  | `/project/removeFreelancerFromInterestedList/:projectSlug`       | ✅ Yes | Admin/Mod/FL | Remove interest   |
| GET    | `/project/listInterestedFreelancersInSingleProject/:projectSlug` | ✅ Yes | Admin/Mod    | List interested   |
| PATCH  | `/project/selectFreelancerForProject/:projectSlug`               | ✅ Yes | Admin/Mod    | Select freelancer |
| PATCH  | `/project/removeSelectedFreelancer/:projectSlug`                 | ✅ Yes | Admin/Mod    | Remove selection  |

#### Project Updates (5)

| Method | Endpoint                                         | Auth  | Description     |
| ------ | ------------------------------------------------ | ----- | --------------- |
| PATCH  | `/project/updateProgressOfProject/:projectSlug`  | ❌ No | Update progress |
| PATCH  | `/project/changeProjectStatus/:projectSlug`      | ❌ No | Change status   |
| PATCH  | `/project/changeProjectType/:projectSlug`        | ❌ No | Change type     |
| PATCH  | `/project/writeReviewAndGiveRating/:projectSlug` | ❌ No | Add review      |
| PATCH  | `/project/updateProjectBySlug/:projectSlug`      | ❌ No | Full update     |
| PATCH  | `/project/makeProjectOutsource/:projectSlug`     | ❌ No | Make outsource  |

---

### Module 16: Trash (7 endpoints)

| Method | Endpoint                           | Auth   | Role  | Description                   |
| ------ | ---------------------------------- | ------ | ----- | ----------------------------- |
| GET    | `/trash/getTrashedUsers`           | ✅ Yes | Admin | List trashed users            |
| GET    | `/trash/getTrashedMessages`        | ✅ Yes | Admin | List trashed messages         |
| GET    | `/trash/getTrashedNavigationPages` | ✅ Yes | Admin | List trashed pages            |
| GET    | `/trash/getTrashedQuotes`          | ✅ Yes | Admin | List trashed quotes           |
| GET    | `/trash/getTrashedConsultations`   | ✅ Yes | Admin | List trashed consultations    |
| GET    | `/trash/getTrashedHireUs`          | ✅ Yes | Admin | List trashed hire requests    |
| GET    | `/trash/getTrashedContactUs`       | ✅ Yes | Admin | List trashed contact messages |

---

### Module 17: Visitors (6 endpoints)

| Method | Endpoint         | Auth   | Description    |
| ------ | ---------------- | ------ | -------------- |
| POST   | `/visitors/`     | ❌ No  | Create visitor |
| POST   | `/visitors/test` | ❌ No  | Test endpoint  |
| GET    | `/visitors/`     | ✅ Yes | List all       |
| GET    | `/visitors/:id`  | ✅ Yes | Get one        |
| PUT    | `/visitors/:id`  | ✅ Yes | Update         |
| DELETE | `/visitors/:id`  | ✅ Yes | Delete         |

**Example - Create Visitor:**

```json
POST {{baseUrl}}/visitors/
{
 "fullName": "John Doe",
 "businessEmail": "john@example.com",
 "phoneNumber": "+1234567890",
 "companyName": "Acme Corp",
 "companyWebsite": "https://acme.com",
 "businessAddress": "123 Business St",
 "businessType": "Technology",
 "referralSource": "Google Search"
}
```

---

## 🧪 Testing Workflows

### Workflow 1: Complete User Journey

```bash
1. Register User
  POST /auth/register


2. Verify Email (if required)
  POST /auth/sendOTP
  POST /auth/verifyEmail


3. Login
  POST /auth/login  # Token auto-saved


4. Get Current User
  GET /auth/getCurrentUser


5. Update Profile
  PATCH /auth/updateInfo


6. Create Project Request
  POST /projectRequest/create


7. View Projects
  GET /project/getAllProjects
```

### Workflow 2: Admin Testing

```bash
1. Login as Admin
  POST /auth/login


2. View All Users
  GET /auth/getAllUsers


3. View All Requests
  GET /consultation/getAllRequestedConsultations
  GET /contactUs/getAllMessages
  GET /freelancer/getAllFreeLancerRequest


4. Manage Projects
  POST /project/createProject
  GET /project/getAllProjects


5. Create Milestones
  POST /milestone/createMilestone/:projectId


6. Assign Freelancers
  PATCH /project/selectFreelancerForProject/:projectSlug
```

### Workflow 3: Freelancer Testing

```bash
1. Submit Freelancer Request
  POST /freelancer/register


2. Admin Approves (as admin)
  PATCH /freelancer/registrations/:id/accept


3. Login as Freelancer
  POST /auth/login


4. View Available Projects
  GET /project/getAllProjects


5. Express Interest
  PATCH /project/createInterestedFreelancers/:projectSlug


6. Update Milestone Progress
  PATCH /milestone/updateMilestoneProgress/:milestoneId
```

---

## 🔧 Environment Variables

Update these in your Postman environment:

| Variable       | Example                        | Description       |
| -------------- | ------------------------------ | ----------------- |
| `baseUrl`      | `http://localhost:3000/api/v1` | API base URL      |
| `accessToken`  | `eyJhbGc...`                   | Auto-set on login |
| `refreshToken` | `eyJhbGc...`                   | Auto-set on login |
| `userId`       | `user_123`                     | Current user ID   |
| `projectId`    | `1`                            | Test project ID   |
| `projectSlug`  | `test-project`                 | Test project slug |

---

## 📝 Common Request Bodies

### User Roles

```
CLIENT - Default role, basic access
FREELANCER - Can work on projects
MODERATOR - Can manage content and requests
ADMIN - Full access
```

### Project Status

```
PENDING - Not started
ONGOING - In progress
COMPLETED - Finished
CANCELLED - Cancelled
```

### Difficulty Levels

```
EASY
MEDIUM
HARD
```

### Project Types

```
INHOUSE - Internal team
OUTSOURCE - External freelancers
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Unauthorized" Error

**Solution:**

- Make sure you're logged in
- Check if `{{accessToken}}` is set in environment
- Try refreshing token: `POST /auth/refreshAcessToken`

### Issue 2: "Forbidden" Error

**Solution:**

- Check if your role has permission
- Admin/Moderator required for many endpoints

### Issue 3: "Validation Error"

**Solution:**

- Check request body matches schema
- All required fields must be present
- Check data types (string vs number)

### Issue 4: Token Expired

**Solution:**

```
POST {{baseUrl}}/auth/refreshAcessToken
{
 "refreshToken": "{{refreshToken}}"
}
```

---

## 📊 Testing Checklist

### Basic Testing

- [ ] Register new user
- [ ] Login user
- [ ] Get current user
- [ ] Update user info
- [ ] Logout

### Admin Testing

- [ ] Login as admin
- [ ] Create project
- [ ] Create milestones
- [ ] Assign freelancer
- [ ] View all users
- [ ] Manage content

### Freelancer Testing

- [ ] Submit join request
- [ ] Admin approves
- [ ] Login as freelancer
- [ ] View projects
- [ ] Express interest
- [ ] Update progress

### Payment Testing

- [ ] Create payment intent
- [ ] Check payment status
- [ ] Create checkout session
- [ ] View payment history

### Full Workflow

- [ ] Client registers
- [ ] Client submits project request
- [ ] Admin creates project
- [ ] Freelancer applies
- [ ] Admin assigns freelancer
- [ ] Freelancer updates progress
- [ ] Project completes
- [ ] Client reviews

---

## 🎯 Quick Test Scripts

### Script 1: Setup New User

```javascript
// Run in Postman Tests tab
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set("accessToken", jsonData.accessToken);
  pm.environment.set("userId", jsonData.user.uid);
  console.log("✅ User logged in successfully");
}
```

### Script 2: Save Response Data

```javascript
// Save any ID from response
if (pm.response.code === 201) {
  var jsonData = pm.response.json();
  if (jsonData.id) {
    pm.environment.set("lastCreatedId", jsonData.id);
  }
}
```

---

## 📚 Additional Resources

- **API Documentation:** `API_ENDPOINTS_DOCUMENTATION.md`
- **Database Schema:** `DATABASE_SCHEMA_DOCUMENTATION.md`
- **Project Overview:** `PROJECT_OVERVIEW.md`
- **Prisma Schema:** `prisma/schema.prisma`

---

## 🎉 You're Ready!

You now have:
✅ Complete list of all 150+ endpoints
✅ Example requests for each module
✅ Testing workflows
✅ Environment setup
✅ Troubleshooting guide

**Start Testing:**

1. Import environment
2. Register/Login
3. Start making requests!

**Happy Testing! 🚀**
