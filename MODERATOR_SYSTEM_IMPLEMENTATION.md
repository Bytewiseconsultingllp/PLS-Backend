# Moderator Management System - Implementation Summary

## Overview

Complete moderator management system has been implemented allowing admins to create moderators, assign them to projects, and allow moderators to manage milestones for their assigned projects only.

---

## Database Changes

### Schema Updates (✅ COMPLETED)

**User Model**:

- Added `isActive` field (Boolean, default: true) - For deactivating moderators
- Added `moderatedProjects` relation - Projects where this user is the moderator

**Project Model**:

- Added `assignedModeratorId` field (String?, nullable) - One moderator per project
- Added `assignedModerator` relation - The moderator assigned to this project
- Added index on `assignedModeratorId` for performance

**Migration**: `20251101172549_add_moderator_management` ✅ Applied

---

## Services Created

### Moderator Service (✅ COMPLETED)

**File**: `src/services/moderatorService.ts`

**Functions**:

1. `createModerator(email, fullName, adminUserId)`

   - Admin provides email and full name
   - System generates username and random password (12 chars)
   - Auto-verifies moderator email
   - Returns moderator info + temporary password

2. `getAllModerators(page, limit, includeInactive)`

   - Paginated list of moderators
   - Shows assigned project count
   - Filter active/inactive

3. `getModeratorById(moderatorId)`

   - Get moderator details
   - Include assigned projects and milestones

4. `updateModerator(moderatorId, data)`

   - Update fullName, email, phone
   - Check email uniqueness

5. `toggleModeratorActiveStatus(moderatorId, isActive)`

   - Activate/deactivate moderator account

6. `deleteModerator(moderatorId, adminUserId)`

   - Soft delete (sets trashedAt)
   - Prevents deletion if moderator has assigned projects

7. `assignModeratorToProject(projectId, moderatorId, adminUserId)`

   - Assign moderator to project
   - Replaces existing moderator if any
   - Verifies moderator is active

8. `unassignModeratorFromProject(projectId)`

   - Remove moderator from project
   - Returns unassigned moderator info

9. `getModeratorProjects(moderatorUserId, page, limit)`

   - Get projects assigned to specific moderator
   - Paginated results
   - Only shows assigned projects

10. `getModeratorProjectById(projectId, moderatorUserId)`
    - Get single project details
    - Only if moderator is assigned

---

## Email Templates (✅ COMPLETED)

### 1. Moderator Account Created

**File**: `src/templates/moderatorAccountCreated.html`
**Placeholders**:

- `{{MODERATOR_NAME}}`
- `{{USERNAME}}`
- `{{TEMP_PASSWORD}}`
- `{{EMAIL}}`
- `{{LOGIN_URL}}`

### 2. Project Assignment Notification

**File**: `src/templates/moderatorProjectAssigned.html`
**Placeholders**:

- `{{MODERATOR_NAME}}`
- `{{COMPANY_NAME}}`
- `{{CLIENT_NAME}}`
- `{{CLIENT_EMAIL}}`
- `{{PROJECT_CREATED_DATE}}`
- `{{PROJECT_URL}}`

---

## API Endpoints to Implement

### Admin Endpoints (Admin Only)

#### 1. Create Moderator

```
POST /api/v1/admin/moderators
Body: { email, fullName }
Response: { moderator, tempPassword }
```

#### 2. List All Moderators

```
GET /api/v1/admin/moderators?page=1&limit=20&includeInactive=false
Response: { moderators, pagination }
```

#### 3. Get Moderator Details

```
GET /api/v1/admin/moderators/:id
Response: { moderator with projects }
```

#### 4. Update Moderator

```
PATCH /api/v1/admin/moderators/:id
Body: { fullName?, email?, phone? }
Response: { updated moderator }
```

#### 5. Toggle Active Status

```
PATCH /api/v1/admin/moderators/:id/toggle-status
Body: { isActive: true/false }
Response: { updated moderator }
```

#### 6. Delete Moderator

```
DELETE /api/v1/admin/moderators/:id
Response: { deleted moderator }
```

#### 7. Assign Moderator to Project

```
POST /api/v1/admin/projects/:projectId/assign-moderator
Body: { moderatorId }
Response: { project, previousModerator, newModerator }
```

#### 8. Unassign Moderator from Project

```
DELETE /api/v1/admin/projects/:projectId/moderator
Response: { project, unassignedModerator }
```

### Moderator Endpoints (Moderator Only)

#### 9. Get My Assigned Projects

```
GET /api/v1/moderator/my-projects?page=1&limit=20
Response: { projects, pagination }
```

#### 10. Get Single Project Details

```
GET /api/v1/moderator/projects/:projectId
Response: { full project details }
```

---

## Authorization Updates Needed

### Milestone Endpoints

**Current behavior**: Client or Admin can manage milestones  
**New behavior**: Moderators can ONLY manage milestones for ASSIGNED projects

**Endpoints to Update**:

1. `POST /api/v1/projects/:id/milestones` - Add milestone
2. `PATCH /api/v1/projects/:id/milestones/:milestoneId` - Update milestone
3. `DELETE /api/v1/projects/:id/milestones/:milestoneId` - Delete milestone
4. `POST /api/v1/projects/:id/milestones/:milestoneId/approve` - Approve milestone (MODERATOR/ADMIN only)

**Authorization Logic**:

```typescript
if (userRole === "MODERATOR") {
  // Check if moderator is assigned to this project
  const project = await getProjectById(projectId);
  if (project.assignedModeratorId !== userId) {
    throw "You are not assigned as moderator for this project";
  }
}
```

---

## Validation Schemas (Zod)

```typescript
// Create moderator
export const createModeratorSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
});

// Update moderator
export const updateModeratorSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

// Toggle status
export const toggleModeratorStatusSchema = z.object({
  isActive: z.boolean(),
});

// Assign moderator
export const assignModeratorSchema = z.object({
  moderatorId: z.string().cuid(),
});
```

---

## Email Service Functions to Add

```typescript
// In globalMailService.ts or new moderatorMailService.ts

export async function sendModeratorCredentials(
  email: string,
  moderatorName: string,
  username: string,
  tempPassword: string,
  loginUrl: string,
) {
  const variables = {
    MODERATOR_NAME: moderatorName,
    USERNAME: username,
    TEMP_PASSWORD: tempPassword,
    EMAIL: email,
    LOGIN_URL: loginUrl,
  };

  await sendTemplatedEmail(
    email,
    "Your Moderator Account - Login Credentials",
    "moderatorAccountCreated",
    variables,
  );
}

export async function sendProjectAssignmentNotification(
  moderatorEmail: string,
  moderatorName: string,
  companyName: string,
  clientName: string,
  clientEmail: string,
  projectCreatedDate: string,
  projectUrl: string,
) {
  const variables = {
    MODERATOR_NAME: moderatorName,
    COMPANY_NAME: companyName,
    CLIENT_NAME: clientName,
    CLIENT_EMAIL: clientEmail,
    PROJECT_CREATED_DATE: projectCreatedDate,
    PROJECT_URL: projectUrl,
  };

  await sendTemplatedEmail(
    moderatorEmail,
    "New Project Assignment",
    "moderatorProjectAssigned",
    variables,
  );
}
```

---

## Moderator Capabilities Summary

### ✅ CAN DO:

- View ONLY assigned projects
- Create milestones for assigned projects
- Update milestone progress for assigned projects
- Approve/complete milestones for assigned projects
- View project details (excluding pricing/estimates)
- View assigned freelancers

### ❌ CANNOT DO:

- View non-assigned projects
- Update project details
- Approve/reject freelancer bids
- View project pricing/estimates
- Assign freelancers to projects
- Delete projects

---

## Testing Checklist

### Admin Actions:

- [ ] Create moderator (admin provides email + name)
- [ ] List all moderators
- [ ] View moderator details
- [ ] Update moderator info
- [ ] Deactivate moderator
- [ ] Activate moderator
- [ ] Delete moderator (should fail if has projects)
- [ ] Assign moderator to project
- [ ] Replace moderator on project
- [ ] Unassign moderator from project

### Moderator Actions:

- [ ] Login with generated credentials
- [ ] View only assigned projects
- [ ] Cannot view non-assigned projects
- [ ] Create milestone for assigned project
- [ ] Update milestone progress
- [ ] Approve milestone
- [ ] Cannot create milestone for non-assigned project

### Email Notifications:

- [ ] Moderator receives credentials email on creation
- [ ] Moderator receives notification on project assignment

---

## Next Steps

1. ✅ Schema updated and migration applied
2. ✅ Service created with all functions
3. ✅ Email templates created
4. ⏳ Create controller with all endpoints
5. ⏳ Create router with routes
6. ⏳ Add Zod validation schemas
7. ⏳ Update milestone authorization
8. ⏳ Add email sending functions
9. ⏳ Create Swagger documentation
10. ⏳ Test all functionality

---

## Implementation Status

- **Schema**: ✅ 100% Complete
- **Database Migration**: ✅ 100% Complete
- **Service Layer**: ✅ 100% Complete
- **Email Templates**: ✅ 100% Complete
- **Controller Layer**: ⏳ 0% Complete
- **Router Layer**: ⏳ 0% Complete
- **Validation Schemas**: ⏳ 0% Complete
- **Email Functions**: ⏳ 0% Complete
- **Authorization Updates**: ⏳ 0% Complete
- **Swagger Docs**: ⏳ 0% Complete
- **Testing**: ⏳ 0% Complete

**Overall Progress**: ~40% Complete

---

## Files Created/Modified

### Created:

- `src/services/moderatorService.ts`
- `src/templates/moderatorAccountCreated.html`
- `src/templates/moderatorProjectAssigned.html`
- `prisma/migrations/20251101172549_add_moderator_management/migration.sql`

### Modified:

- `prisma/schema.prisma` (User and Project models)

### To Create:

- `src/controllers/moderatorController/moderatorController.ts`
- `src/routers/moderatorRouter/moderatorRouter.ts`
- `src/swagger/moderator.yaml`
- Email service functions (in existing file)

### To Modify:

- `src/validation/zod.ts` (add moderator schemas)
- `src/controllers/projectController/newProjectController.ts` (update milestone authorization)
- `src/config/swagger.ts` (add moderator tag)
- `src/app.ts` (register moderator router)
- `src/constants/endpoint.ts` (add moderator routes)

---

**Status**: Implementation in progress. Service layer complete. Ready to continue with controller, router, and remaining components.

**Date**: November 1, 2025
