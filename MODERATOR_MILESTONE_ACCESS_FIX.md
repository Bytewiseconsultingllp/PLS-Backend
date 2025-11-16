# Moderator Milestone Access Fix

## Issue Reported

When a moderator tried to access project milestones using:

```bash
GET /api/v1/projects/{projectId}/milestones
```

They received the error:

```json
{
  "success": false,
  "statusCode": 500,
  "message": "Unauthorized: You don't have permission to view this project's milestones!!",
  "data": null
}
```

## Root Cause

The `getProjectMilestones` controller only handled ADMIN and CLIENT roles. It didn't have logic for MODERATOR role, causing the moderator request to fall through to the client authorization check which then failed because the moderator's user ID didn't match the project's client ID.

## Fix Applied

### Files Modified

1. `src/controllers/projectController/newProjectController.ts`
2. `src/routers/projectRouter/newProjectRouter.ts`

### Changes Made

#### 1. Updated Controller Logic

Added MODERATOR role handling in `getProjectMilestones()`:

```typescript
} else if (userRole === "MODERATOR") {
  // Moderator can only view milestones for projects they're assigned to
  const project = await prisma.project.findFirst({
    where: {
      id,
      assignedModeratorId: userId,
      deletedAt: null,
    },
    select: { id: true, clientId: true },
  });

  if (!project) {
    throw {
      status: UNAUTHORIZEDCODE,
      message: "You are not assigned as moderator for this project",
    };
  }

  // Fetch milestones for the project
  milestones = await prisma.milestone.findMany({
    where: {
      projectId: id,
      deletedAt: null,
    },
    include: {
      assignedFreelancer: {
        select: {
          id: true,
          details: {
            select: {
              fullName: true,
              email: true,
              primaryDomain: true,
            },
          },
        },
      },
    },
    orderBy: { deadline: "asc" },
  });
}
```

#### 2. Updated Route Documentation

Updated the route comment to reflect that MODERATOR can also access:

```typescript
/**
 * @route   GET /api/projects/:id/milestones
 * @desc    Get all milestones for a project
 * @access  Private (CLIENT/ADMIN/MODERATOR)  // ✅ Added MODERATOR
 */
```

## Authorization Logic Summary

### GET /api/v1/projects/:id/milestones

| Role            | Access Rules                                                 |
| --------------- | ------------------------------------------------------------ |
| **ADMIN**       | ✅ Can view milestones for ANY project                       |
| **MODERATOR**   | ✅ Can ONLY view milestones for projects they're assigned to |
| **CLIENT**      | ✅ Can ONLY view milestones for their own projects           |
| **Other Roles** | ❌ No access                                                 |

## Important: Moderator Assignment Requirement

**⚠️ CRITICAL**: Before a moderator can view project milestones, an **ADMIN must assign them to the project**.

### How to Assign a Moderator to a Project

```bash
# Only ADMIN can assign moderators to projects
curl -X 'POST' \
  'http://localhost:8000/api/v1/admin/moderators/projects/PROJECT_ID/assign-moderator' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "moderatorId": "MODERATOR_USER_ID"
}'
```

### Workflow

1. **Admin assigns moderator to project**

   ```
   POST /api/v1/admin/moderators/projects/{projectId}/assign-moderator
   Body: { "moderatorId": "cmi0p335s00003brngyv5iqxo" }
   ```

2. **Moderator can now access project milestones**

   ```
   GET /api/v1/projects/{projectId}/milestones
   ```

3. **If not assigned, moderator gets error**
   ```json
   {
     "success": false,
     "statusCode": 401,
     "message": "You are not assigned as moderator for this project"
   }
   ```

## Testing

### Test 1: Moderator Without Assignment (Should FAIL)

```bash
# Assuming moderator is NOT assigned to project
curl -X 'GET' \
  'http://localhost:8000/api/v1/projects/be3f146b-08d8-4163-8770-f89fdae62583/milestones' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer MODERATOR_TOKEN'
```

**Expected Response:**

```json
{
  "success": false,
  "statusCode": 401,
  "message": "You are not assigned as moderator for this project"
}
```

### Test 2: Admin Assigns Moderator to Project

```bash
# Admin assigns moderator
curl -X 'POST' \
  'http://localhost:8000/api/v1/admin/moderators/projects/be3f146b-08d8-4163-8770-f89fdae62583/assign-moderator' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "moderatorId": "cmi0p335s00003brngyv5iqxo"
}'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Moderator assigned successfully",
  "data": {
    "project": { ... },
    "assignedModerator": { ... }
  }
}
```

### Test 3: Moderator With Assignment (Should SUCCEED)

```bash
# Now moderator should be able to access milestones
curl -X 'GET' \
  'http://localhost:8000/api/v1/projects/be3f146b-08d8-4163-8770-f89fdae62583/milestones' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer MODERATOR_TOKEN'
```

**Expected Response:**

```json
{
  "success": true,
  "status": 200,
  "message": "Milestones retrieved successfully",
  "data": [
    {
      "id": "milestone-id",
      "milestoneName": "Phase 1 - Setup",
      "description": "Initial setup and configuration",
      "status": "IN_PROGRESS",
      "progress": 50,
      "deadline": "2025-12-01T00:00:00.000Z",
      "assignedFreelancer": {
        "id": "freelancer-id",
        "details": {
          "fullName": "John Doe",
          "email": "john@example.com",
          "primaryDomain": "SOFTWARE_DEVELOPMENT"
        }
      }
    }
  ]
}
```

## Check Moderator's Assigned Projects

Moderators can check which projects they're assigned to:

```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/moderator/my-projects?page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer MODERATOR_TOKEN'
```

## Related Endpoints

### Moderator Can Access (for assigned projects only):

- ✅ `GET /api/v1/moderator/my-projects` - List assigned projects
- ✅ `GET /api/v1/moderator/projects/:projectId` - View project details
- ✅ `GET /api/v1/projects/:id/milestones` - View milestones (FIXED)
- ✅ `POST /api/v1/projects/:id/milestones` - Add milestone
- ✅ `PATCH /api/v1/projects/:id/milestones/:milestoneId` - Update milestone
- ✅ `POST /api/v1/projects/:id/milestones/:milestoneId/approve` - Approve milestone
- ✅ `DELETE /api/v1/projects/:id/milestones/:milestoneId` - Delete milestone

### Only Admin Can Do:

- ❌ Assign/unassign moderators to projects
- ❌ Create/update/delete moderators
- ❌ Toggle moderator active status

## Build Status

✅ Build completed successfully  
✅ No linter errors  
✅ Type checking passed

## Database Schema Reference

The assignment relationship in the database:

```sql
-- Project table has assignedModeratorId field
Project {
  id: String
  assignedModeratorId: String?  -- References User.uid
  clientId: String
  ...
}

-- User with MODERATOR role
User {
  uid: String
  role: MODERATOR
  ...
}
```

## Next Steps

1. **Assign the moderator to the project first** (if not already done)
2. **Test the milestone access** with the new token
3. **Verify other milestone operations** (add, update, delete, approve)

## Summary

The fix adds proper MODERATOR role handling to the milestone retrieval endpoint. Moderators can now view milestones for projects they're assigned to, maintaining proper authorization controls while enabling moderators to perform their job duties.

**Key Point**: Moderators must be explicitly assigned to projects by an admin before they can access any project-specific information, including milestones.

---

**Date**: November 15, 2025  
**Related Security Fix**: See `SECURITY_FIX_MODERATOR_AUTHORIZATION.md`
