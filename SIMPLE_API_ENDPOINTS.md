# Simple API Endpoints List

**Base URL:** `/api/v1`

---

## 🌐 VISITOR APIs (Public/No Auth Required)

### Visitor Management

- `POST /visitors/` - Create visitor record
- `GET /visitors/:id` - Get single visitor (requires auth)
- `GET /visitors/` - Get all visitors (requires auth)
- `PUT /visitors/:id` - Update visitor (requires auth)
- `DELETE /visitors/:id` - Delete visitor (requires auth)

### Contact & Consultation

- `POST /contactUs/createMessage` - Submit contact form
- `POST /consultation/requestAConsultation` - Request consultation
- `POST /consultation/updateRequestedConsultation/:id` - Update consultation request

### Quote Requests

- `POST /getQuotes/createQuote` - Create quote request

### Hire Us

- `POST /hireUs/createHireUsRequest` - Submit hire us request (with file upload)

### Project Requests

- `POST /projectRequest/create` - Create project request

### Newsletter

- `POST /newsletter/subscribeToNewsLetter` - Subscribe to newsletter (requires auth)
- `POST /newsletter/unSubscribeToNewsLetter` - Unsubscribe from newsletter (requires auth)

---

## 👨‍💼 FREELANCER APIs

### Registration & Profile

- `POST /freelancer/register` - Register as new freelancer
- `POST /freelancer/getFreeLancerJoinUsRequest` - Submit join request (v1)
- `POST /freelancer/getFreeLancerJoinUsRequestV2` - Submit join request (v2)
- `GET /freelancer/listAllFreelancers` - List all approved freelancers
- `GET /freelancer/listSingleFreelancer/:username` - Get freelancer by username

### Freelancer Registration Management (Admin/Moderator)

- `GET /freelancer/registrations` - Get all registrations
- `GET /freelancer/registrations/:id` - Get single registration
- `PATCH /freelancer/registrations/:id/accept` - Accept registration
- `DELETE /freelancer/registrations/:id/reject` - Reject registration
- `PATCH /freelancer/registrations/:id/trash` - Move to trash
- `PATCH /freelancer/registrations/:id/untrash` - Restore from trash

### Niche Management (Admin/Moderator)

- `POST /freelancer/createNicheListForFreelancer/` - Create niche
- `GET /freelancer/listAllNichesForFreelancer` - List all niches
- `GET /freelancer/listSingleNicheForFreelancer/:id` - Get single niche
- `PUT /freelancer/updateNicheForFreelancer/:id` - Update niche
- `DELETE /freelancer/deleteNicheForFreelancer/:id` - Delete niche

---

## 📁 PROJECT APIs

### Project Management

- `POST /project/createProject` - Create project (Admin/Moderator)
- `GET /project/getSingleProject/:projectSlug` - Get single project
- `GET /project/getAllProjects` - Get all projects
- `GET /project/getAllOutsourcedProjects` - Get outsourced projects
- `GET /project/getAllProjectsWithThierClient/:clientId` - Get client projects
- `DELETE /project/deleteProject/:id` - Delete project (Admin)

### Freelancer Interest & Selection

- `PATCH /project/createInterestedFreelancers/:projectSlug` - Add interested freelancer
- `PATCH /project/removeFreelancerFromInterestedList/:projectSlug` - Remove from interested list
- `GET /project/listInterestedFreelancersInSingleProject/:projectSlug` - List interested freelancers
- `PATCH /project/selectFreelancerForProject/:projectSlug` - Select freelancer
- `PATCH /project/removeSelectedFreelancer/:projectSlug` - Remove selected freelancer
- `GET /project/getProjectForSelectedFreelancers` - Get projects for freelancers

### Project Updates

- `PATCH /project/updateProgressOfProject/:projectSlug` - Update progress
- `PATCH /project/changeProjectStatus/:projectSlug` - Change status
- `PATCH /project/changeProjectType/:projectSlug` - Change type
- `PATCH /project/makeProjectOutsource/:projectSlug` - Make outsourced
- `PATCH /project/updateProjectBySlug/:projectSlug` - Update project
- `PATCH /project/writeReviewAndGiveRating/:projectSlug` - Add review/rating

### Project Builder

- `POST /project-builder/` - Create project builder
- `GET /project-builder/` - Get all project builders
- `GET /project-builder/:id` - Get single project builder
- `PUT /project-builder/:id` - Update project builder
- `DELETE /project-builder/:id` - Delete project builder
- `GET /project-builder/:id/freelancers` - Get with freelancers
- `POST /project-builder/:id/interested-freelancers` - Add interested freelancers
- `DELETE /project-builder/:id/interested-freelancers` - Remove interested freelancer
- `POST /project-builder/:id/selected-freelancers` - Select freelancers
- `DELETE /project-builder/:id/selected-freelancers` - Remove selected freelancer

### Milestones

- `POST /milestone/createMilestone/:projectId` - Create single milestone
- `POST /milestone/createMultipleMilestones/:projectId` - Create multiple milestones
- `PATCH /milestone/updateMilestone/:milestoneId` - Update milestone
- `DELETE /milestone/deleteMilestone/:milestoneId` - Delete milestone
- `PATCH /milestone/completeMilestone/:milestoneId` - Mark as completed
- `PATCH /milestone/updateMilestoneProgress/:milestoneId` - Update progress

---

## 🔐 ADMIN APIs

### User Management

- `GET /auth/getAllUsers` - Get all users (Admin/Moderator)
- `GET /auth/getAllClients` - Get all clients (Admin/Moderator)
- `GET /auth/searchUsers` - Search users
- `DELETE /auth/deleteUser/:uid` - Delete user permanently (Admin)
- `PATCH /auth/trashTheUser` - Move user to trash (Admin/Moderator)
- `PATCH /auth/unTrashTheUser` - Restore user from trash (Admin)
- `PATCH /auth/updateRole` - Update user role

### Consultation Management

- `GET /consultation/getAllRequestedConsultations` - Get all consultations
- `GET /consultation/getSingleRequestedConsultation/:id` - Get single consultation
- `PATCH /consultation/acceptRequestedConsultation/:id` - Accept consultation
- `PATCH /consultation/rejectRequestedConsultation/:id` - Reject consultation
- `DELETE /consultation/deleteRequestedConsultation/:id` - Delete consultation
- `PATCH /consultation/trashRequestedConsultation/:id` - Move to trash
- `PATCH /consultation/untrashRequestedConsultation/:id` - Restore from trash

### Contact Messages

- `GET /contactUs/getAllMessages` - Get all messages
- `GET /contactUs/getSingleMessage/:id` - Get single message
- `POST /contactUs/sendMessageToUser/:id` - Send reply to user
- `DELETE /contactUs/deleteMessage/:id` - Delete message
- `PATCH /contactUs/moveMessageToTrash` - Move to trash
- `PATCH /contactUs/unTrashMessage` - Restore from trash

### Quote Management

- `GET /getQuotes/getAllQuotes` - Get all quotes
- `GET /getQuotes/getSingleQuote/:id` - Get single quote
- `POST /getQuotes/createServicesForQuote` - Create services
- `DELETE /getQuotes/deleteServicesForQuote/:id` - Delete services
- `PATCH /getQuotes/trashQuote/:id` - Move to trash
- `PATCH /getQuotes/unTrashQuote/:id` - Restore from trash
- `DELETE /getQuotes/deleteQuote/:id` - Delete quote

### Hire Us Management

- `GET /hireUs/getAllHireUsRequests` - Get all requests (Admin)
- `GET /hireUs/getSingleHireUsRequest/:id` - Get single request (Admin)
- `PATCH /hireUs/trashHireUsRequest/:id` - Move to trash (Admin)
- `PATCH /hireUs/untrashHireUsRequest/:id` - Restore from trash (Admin)
- `DELETE /hireUs/permanentDeleteHireUsRequest/:id` - Permanent delete (Admin)

### Freelancer Management

- `GET /freelancer/getAllFreeLancerRequest` - Get all requests (v1)
- `GET /freelancer/getSingleFreeLancerRequest/:id` - Get single request (v1)
- `GET /freelancer/deleteFreeLancerRequest/:id` - Delete request (v1)
- `PATCH /freelancer/trashFreeLancerRequest/:id` - Move to trash (v1)
- `PATCH /freelancer/untrashFreeLancerRequest/:id` - Restore from trash (v1)
- `GET /freelancer/getAllFreeLancerRequestV2` - Get all requests (v2)
- `GET /freelancer/getSingleFreeLancerRequestV2/:id` - Get single request (v2)
- `GET /freelancer/deleteFreeLancerRequestV2/:id` - Delete request (v2)
- `PATCH /freelancer/trashFreeLancerRequestV2/:id` - Move to trash (v2)
- `PATCH /freelancer/untrashFreeLancerRequestV2/:id` - Restore from trash (v2)
- `PATCH /freelancer/acceptFreeLancerRequest/:id` - Accept freelancer request

### Project Request Management

- `GET /projectRequest/` - Get all project requests
- `GET /projectRequest/:id` - Get single request
- `DELETE /projectRequest/:id` - Delete request

### Blog Management

- `POST /blog/createBlog` - Create blog (Admin/Moderator)
- `GET /blog/getAllPrivateBlogs` - Get private blogs (Admin)
- `PATCH /blog/updateBlog/:blogSlug` - Update blog (Admin/Moderator)
- `PATCH /blog/makeBlogPublicOrPrivate/:blogSlug` - Toggle visibility (Admin)
- `DELETE /blog/deleteBlog/:blogSlug` - Delete blog (Admin)

### Newsletter Management

- `POST /newsletter/sendNewsLetterToSingleSubscriber` - Send to single (Admin/Moderator)
- `POST /newsletter/sendNewsLetterToAllSubscribers` - Send to all (Admin/Moderator)
- `GET /newsletter/listAllSubscribedMails` - List all subscribed emails (Admin)

### Navigation Pages

- `POST /navigationPages/createNavigationPage` - Create page
- `GET /navigationPages/getAllNavigationPages` - Get all pages
- `GET /navigationPages/getSingleNavigationPage/:id` - Get single page
- `PUT /navigationPages/updateNavigationPage/:id` - Update page
- `DELETE /navigationPages/deleteNavigationPage/:id` - Delete page
- `PATCH /navigationPages/trashNavigationPage/:id` - Move to trash
- `PATCH /navigationPages/untrashNavigationPage/:id` - Restore from trash
- `PATCH /navigationPages/menuItems/:id/addChildrenToMenuItem` - Add children

### Trash Management

- `GET /trash/getTrashedUsers` - Get trashed users (Admin)
- `GET /trash/getTrashedMessages` - Get trashed contact messages (Admin)
- `GET /trash/getTrashedNavigationPages` - Get trashed pages (Admin)
- `GET /trash/getTrashedQuotes` - Get trashed quotes (Admin)
- `GET /trash/getTrashedConsultations` - Get trashed consultations (Admin)
- `GET /trash/getTrashedHireUs` - Get trashed hire us requests (Admin)
- `GET /trash/getTrashedContactUs` - Get trashed contact messages (Admin)

---

## 🔑 AUTHENTICATION APIs

### Registration & Login

- `POST /auth/register` - Register new user
- `POST /auth/verifyEmail` - Verify email with OTP
- `POST /auth/sendOTP` - Send OTP to email
- `POST /auth/login` - User login
- `GET /auth/logoutUser` - Logout current user
- `POST /auth/logoutUserForceFully` - Force logout from all devices
- `POST /auth/refreshAcessToken` - Refresh access token

### Password Management

- `POST /auth/forgotPasswordRequestFromUser` - Request password reset
- `POST /auth/verifyForgotPasswordRequest` - Verify forgot password OTP
- `PATCH /auth/updateNewPasswordRequest` - Update password after reset
- `PATCH /auth/updatePassword` - Update password (logged in)

### Profile Management

- `GET /auth/getCurrentUser` - Get current user details
- `GET /auth/getSingleUser` - Get single user
- `PATCH /auth/updateInfo` - Update user info
- `PATCH /auth/updateEmail` - Update email

---

## 💳 PAYMENT APIs

### Stripe Integration

- `POST /payment/create-payment-intent` - Create payment intent
- `GET /payment/payment-intent/:paymentIntentId/status` - Get payment status
- `POST /payment/create-checkout-session` - Create checkout session
- `GET /payment/checkout-session/:sessionId/status` - Get session status
- `POST /payment/webhook` - Stripe webhook handler
- `POST /payment/create-refund` - Create refund
- `GET /payment/history` - Get payment history

---

## 📝 PUBLIC BLOG APIs

- `GET /blog/getSingleBlog/:blogSlug` - Get single blog (public)
- `GET /blog/getAllPublicBlogs` - Get all public blogs

---

## 🏥 HEALTH CHECK

- `GET /health` - Health check endpoint

---

## 📋 Role Requirements

| Role           | Access Level                                |
| -------------- | ------------------------------------------- |
| **Admin**      | Full access to all endpoints                |
| **Moderator**  | Limited admin access (no permanent deletes) |
| **Freelancer** | Access to freelancer-specific features      |
| **Client**     | Regular user access                         |
| **Public**     | No authentication required                  |

---

## ⚡ Rate Limits

| Endpoint                | Limit                 |
| ----------------------- | --------------------- |
| Contact Us              | 5 requests/minute     |
| Consultation            | 10 requests/8 hours   |
| Hire Us                 | 10 requests/8 hours   |
| Freelancer Join         | 10 requests/5 minutes |
| Freelancer Registration | 5 requests/5 minutes  |
| Newsletter (single)     | 1 request/minute      |
| Quote Request           | 10 requests/minute    |
| Project Request         | 10 requests/5 minutes |

---

**Note:** All endpoints return JSON responses. Most DELETE operations are soft deletes (move to trash).
