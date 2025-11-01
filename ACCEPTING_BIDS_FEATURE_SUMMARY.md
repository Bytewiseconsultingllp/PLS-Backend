# Accepting Bids Feature - Implementation Summary

## Overview

Implemented a new `acceptingBids` field on the Project model to control whether a project is open for new freelancer bids. This gives clients, moderators, and admins manual control over project bidding visibility.

---

## Problem Solved

**Scenario**: A project requires 2 freelancers, and both have been assigned. Without this feature, the project would continue to be visible to all freelancers, leading to unnecessary bids and wasted effort.

**Solution**: Added `acceptingBids` boolean field that:

- Allows manual control over project bid visibility
- Hides projects from non-assigned freelancers when set to `false`
- Always shows projects to assigned freelancers (they need to see it to work on it)

---

## Database Changes

### Schema Update (prisma/schema.prisma)

```prisma
model Project {
  // ... existing fields ...

  // Payment tracking
  paymentStatus PaymentStatus @default(PENDING)

  // Bid Management - Control whether project is accepting new bids
  acceptingBids Boolean @default(true)

  // ... rest of fields ...

  @@index([acceptingBids])
}
```

### Migration

- **Migration**: `20251101164101_add_accepting_bids_to_project`
- **Default Value**: `true` (all existing projects are now open for bids)
- **Index**: Added for query performance

---

## Visibility Logic for Freelancers

### For Assigned Freelancers

✅ **Can ALWAYS see their assigned projects**, regardless of:

- `acceptingBids` status
- `paymentStatus`

### For Non-Assigned Freelancers

✅ **Can only see projects where BOTH conditions are true:**

1. `paymentStatus = "SUCCEEDED"` (payment completed)
2. `acceptingBids = true` (project is open for new bids)

---

## API Endpoints

### 1. Toggle Accepting Bids Status

**Endpoint**: `PATCH /api/v1/projects/:id/accepting-bids`

**Authorization**:

- Client: Can toggle their own projects
- Moderator: Can toggle any project
- Admin: Can toggle any project

**Request Body**:

```json
{
  "acceptingBids": true
}
```

**Response** (Success - 200):

```json
{
  "success": true,
  "status": 200,
  "message": "Project is now accepting bids",
  "data": {
    "id": "project-uuid",
    "acceptingBids": true
    // ... complete project data
  }
}
```

**Use Cases**:

- Close bidding after finding enough freelancers
- Reopen bidding if more freelancers are needed
- Temporarily pause bidding while evaluating current applicants

---

## Updated Freelancer Endpoints

### GET /api/v1/freelancer/projects

**Previous Behavior**: Only checked `paymentStatus = "SUCCEEDED"`

**New Behavior**:

- **Assigned freelancers**: See ALL their projects (no filters)
- **Non-assigned freelancers**: Only see projects where `paymentStatus = "SUCCEEDED"` AND `acceptingBids = true`

### GET /api/v1/freelancer/projects/:projectId

**Previous Behavior**: Only checked `paymentStatus = "SUCCEEDED"`

**New Behavior**:

- **Assigned freelancers**: Can access ANY project they're assigned to
- **Non-assigned freelancers**: Can only access if `paymentStatus = "SUCCEEDED"` AND `acceptingBids = true`

### POST /api/v1/freelancer/bids

**New Validation**: Added check to prevent bidding on projects with `acceptingBids = false`

**Error Response**:

```json
{
  "success": false,
  "message": "This project is not currently accepting new bids."
}
```

---

## Files Modified

### 1. Schema & Migration

- `prisma/schema.prisma` - Added `acceptingBids` field
- `prisma/migrations/20251101164101_add_accepting_bids_to_project/migration.sql`

### 2. Services

- `src/services/freelancerService.ts`:
  - Updated `getAvailableProjects()` - Added freelancer assignment check and `acceptingBids` filter
  - Updated `getProjectForBidding()` - Added freelancer assignment check and `acceptingBids` filter
  - Updated `createBid()` - Added `acceptingBids` validation
- `src/services/projectService.ts`:
  - Added `toggleAcceptingBids()` - New method to update `acceptingBids` status

### 3. Controllers

- `src/controllers/freeLancerController/freeLancerController.ts`:
  - Updated `getAvailableProjects()` - Pass `userId` to service
  - Updated `getProjectDetails()` - Pass `userId` to service
- `src/controllers/projectController/newProjectController.ts`:
  - Added `toggleAcceptingBids()` - New endpoint handler

### 4. Routers

- `src/routers/projectRouter/newProjectRouter.ts`:
  - Added `PATCH /:id/accepting-bids` route

### 5. Validation

- `src/validation/zod.ts`:
  - Added `AcceptingBidsSchema` for validating the toggle request

### 6. Documentation

- `src/swagger/project-new.yaml`:
  - Added `/projects/{id}/accepting-bids` endpoint documentation
- `src/swagger/freelancer.yaml`:
  - Updated visibility rules description for `/freelancer/projects`

---

## Testing Guide

### Prerequisites

- Server running on `http://localhost:8000`
- Swagger UI available at `http://localhost:8000/api-docs`
- Valid authentication tokens for:
  - Client (owns a project)
  - Freelancer (accepted, has userId)
  - Admin or Moderator

### Test Scenario 1: Close Project to New Bids

**Step 1**: Client toggles `acceptingBids` to `false`

```bash
curl -X 'PATCH' \
  'http://localhost:8000/api/v1/projects/{projectId}/accepting-bids' \
  -H 'Authorization: Bearer {clientToken}' \
  -H 'Content-Type: application/json' \
  -d '{
    "acceptingBids": false
  }'
```

**Expected**: Success response, `acceptingBids = false`

**Step 2**: Non-assigned freelancer tries to view projects

```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/freelancer/projects' \
  -H 'Authorization: Bearer {freelancerToken}'
```

**Expected**: Project does NOT appear in the list (assuming freelancer is not assigned)

**Step 3**: Assigned freelancer views projects

```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/freelancer/projects' \
  -H 'Authorization: Bearer {assignedFreelancerToken}'
```

**Expected**: Project DOES appear in the list (assigned freelancers can always see)

### Test Scenario 2: Prevent Bidding on Closed Project

**Step 1**: Set `acceptingBids = false` (if not already)

**Step 2**: Freelancer tries to bid

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/freelancer/bids' \
  -H 'Authorization: Bearer {freelancerToken}' \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId": "{projectId}",
    "bidAmount": 5000,
    "proposalText": "I would like to work on this project"
  }'
```

**Expected**: Error response

```json
{
  "success": false,
  "message": "This project is not currently accepting new bids."
}
```

### Test Scenario 3: Reopen Project for Bids

**Step 1**: Admin/Moderator toggles `acceptingBids` to `true`

```bash
curl -X 'PATCH' \
  'http://localhost:8000/api/v1/projects/{projectId}/accepting-bids' \
  -H 'Authorization: Bearer {adminToken}' \
  -H 'Content-Type: application/json' \
  -d '{
    "acceptingBids": true
  }'
```

**Expected**: Success response, `acceptingBids = true`

**Step 2**: Freelancer views projects (assuming payment succeeded)

```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/freelancer/projects' \
  -H 'Authorization: Bearer {freelancerToken}'
```

**Expected**: Project appears in the list again

### Test Scenario 4: Authorization

**Test 4A**: Client tries to toggle another client's project

```bash
curl -X 'PATCH' \
  'http://localhost:8000/api/v1/projects/{otherClientProjectId}/accepting-bids' \
  -H 'Authorization: Bearer {clientToken}' \
  -H 'Content-Type: application/json' \
  -d '{
    "acceptingBids": false
  }'
```

**Expected**: 403 Unauthorized error

**Test 4B**: Moderator toggles any project

```bash
curl -X 'PATCH' \
  'http://localhost:8000/api/v1/projects/{anyProjectId}/accepting-bids' \
  -H 'Authorization: Bearer {moderatorToken}' \
  -H 'Content-Type: application/json' \
  -d '{
    "acceptingBids": false
  }'
```

**Expected**: Success (moderators can toggle any project)

---

## Edge Cases Handled

1. **Assigned Freelancer Always Sees Project**: Even if `acceptingBids = false` and `paymentStatus = "PENDING"`, assigned freelancers can see their projects.

2. **Validation**: `acceptingBids` must be a boolean, otherwise returns 400 validation error.

3. **Authorization**: Only the client who owns the project, moderators, or admins can toggle `acceptingBids`.

4. **Bidding Prevention**: Freelancers cannot submit bids on projects with `acceptingBids = false`.

5. **Default Value**: All new projects default to `acceptingBids = true` (open for bids).

---

## Important Notes

1. **Payment Requirement Still Active**: Even if `acceptingBids = true`, non-assigned freelancers still need `paymentStatus = "SUCCEEDED"` to see the project.

2. **Assigned Freelancers Unaffected**: This feature does NOT hide projects from freelancers who are already working on them.

3. **Manual Control Only**: This is not automatic - clients/admins/moderators must explicitly toggle the status.

4. **Existing Projects**: All existing projects now have `acceptingBids = true` by default after the migration.

---

## Integration with Payment Flow

**Complete Visibility Requirements for Non-Assigned Freelancers:**

```
Project Visible = paymentStatus == "SUCCEEDED" && acceptingBids == true
```

**Complete Visibility Requirements for Assigned Freelancers:**

```
Project Visible = true (always)
```

---

## API Documentation

- **Swagger UI**: `http://localhost:8000/api-docs`
- **New Endpoint**: Look for "Toggle accepting bids status" under "Client Projects" section
- **Updated Endpoint**: Check "Get all available projects for bidding" under "Freelancer" section

---

## Summary of Changes

✅ Added `acceptingBids` boolean field to Project model  
✅ Created database migration  
✅ Updated freelancer project visibility logic  
✅ Added API endpoint to toggle `acceptingBids`  
✅ Added validation for bid submission  
✅ Updated Swagger documentation  
✅ Maintained backward compatibility (default = `true`)

---

## Future Enhancements (Not Implemented)

These were considered but explicitly NOT implemented per user requirements:

- ❌ Automatic bid closing when max freelancers reached
- ❌ `maxFreelancers` field to track capacity
- ❌ Auto-set `acceptingBids = false` when quota filled
- ❌ Notification emails when bidding opens/closes

**Reason**: User requested MANUAL control only via API.

---

**Implementation Date**: November 1, 2025  
**Migration Version**: 20251101164101  
**Server Version**: Tested on Bun runtime  
**Status**: ✅ Ready for Testing
