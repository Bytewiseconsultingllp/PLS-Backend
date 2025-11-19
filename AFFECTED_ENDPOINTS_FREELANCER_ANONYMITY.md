# Endpoints Affected by Freelancer Anonymity for Moderators

## Summary

All moderator endpoints that return project information with freelancer data are now showing anonymized freelancer information (capabilities only, no identity).

---

## 🔄 **Affected Endpoints**

### 1. **GET `/api/v1/moderator/my-projects`**

**Description**: List all projects assigned to the logged-in moderator

**Access**: Moderator only (must be logged in)

**Service Function**: `getModeratorProjects()`

**Freelancer Data Returned**:

```json
{
  "selectedFreelancers": [
    {
      "id": "freelancer-id",
      "details": {
        "primaryDomain": "SOFTWARE_DEVELOPMENT",
        "timeZone": "America/New_York",
        "eliteSkillCards": ["React", "Node.js"],
        "tools": ["GIT", "DOCKER"],
        "otherNote": "Prefers async work",
        "selectedIndustries": ["FINTECH"],
        "country": "United States"
      }
    }
  ]
}
```

**What's Hidden**: `fullName`, `email`, `professionalLinks`

---

### 2. **GET `/api/v1/moderator/projects/:projectId`**

**Description**: Get detailed view of a specific project (moderator must be assigned)

**Access**: Moderator only (must be assigned to this project)

**Service Function**: `getModeratorProjectById()`

**Freelancer Data Returned**:

```json
{
  "selectedFreelancers": [
    {
      "id": "freelancer-id",
      "details": {
        "primaryDomain": "FRONTEND_DEVELOPMENT",
        "timeZone": "Europe/London",
        "eliteSkillCards": ["React Expert", "TypeScript"],
        "tools": ["FIGMA", "GIT", "JIRA"],
        "otherNote": "Available for sync meetings 9am-5pm GMT",
        "selectedIndustries": ["ECOMMERCE", "SAAS"],
        "country": "United Kingdom"
      }
    }
  ]
}
```

**What's Hidden**: `fullName`, `email`, `professionalLinks`

---

### 3. **GET `/api/v1/admin/moderators/:id`** ⚠️

**Description**: Admin viewing a specific moderator's details (includes their assigned projects)

**Access**: Admin only

**Service Function**: `getModeratorById()`

**Note**: This is an ADMIN endpoint, not used by moderators themselves, but shows freelancer data when viewing moderator's projects

**Freelancer Data Returned**:

```json
{
  "moderatedProjects": [
    {
      "id": "project-id",
      "selectedFreelancers": [
        {
          "id": "freelancer-id",
          "details": {
            "primaryDomain": "BACKEND_DEVELOPMENT",
            "timeZone": "Asia/Tokyo",
            "eliteSkillCards": ["Python", "Django", "PostgreSQL"],
            "tools": ["GIT", "DOCKER", "KUBERNETES"],
            "otherNote": "Specialized in scalable systems",
            "selectedIndustries": ["FINTECH", "HEALTHCARE"],
            "country": "Japan"
          }
        }
      ]
    }
  ]
}
```

**What's Hidden**: `fullName`, `email`, `professionalLinks`

---

### 4. **GET `/api/v1/projects/:id/milestones`** ⚠️

**Description**: Get milestones for a project (accessible by Client, Admin, Moderator)

**Access**: Client (own projects), Admin (all projects), Moderator (assigned projects only)

**Service Function**: `getProjectMilestones()` in `newProjectController.ts`

**Current Status**: ⚠️ **NEEDS REVIEW** - Currently shows freelancer `fullName` in assignedFreelancer

**Current Freelancer Data in Milestones**:

```typescript
assignedFreelancer: {
  select: {
    id: true,
    details: {
      select: {
        fullName: true,           // ⚠️ CURRENTLY EXPOSED
        email: true,              // ⚠️ CURRENTLY EXPOSED
        primaryDomain: true,      // ✅ OK
      },
    },
  },
}
```

**Issue**: When moderators view milestones via `/api/v1/projects/:id/milestones`, they can see the freelancer's name and email assigned to each milestone.

**Recommendation**: This endpoint should also be updated to hide identity for moderator role.

---

## 📋 **Endpoint Summary Table**

| Endpoint                                    | Access                 | Function                    | Freelancer Identity Hidden? | Status       |
| ------------------------------------------- | ---------------------- | --------------------------- | --------------------------- | ------------ |
| `GET /api/v1/moderator/my-projects`         | Moderator              | `getModeratorProjects()`    | ✅ YES                      | ✅ Fixed     |
| `GET /api/v1/moderator/projects/:projectId` | Moderator              | `getModeratorProjectById()` | ✅ YES                      | ✅ Fixed     |
| `GET /api/v1/admin/moderators/:id`          | Admin only             | `getModeratorById()`        | ✅ YES                      | ✅ Fixed     |
| `GET /api/v1/projects/:id/milestones`       | Client/Admin/Moderator | `getProjectMilestones()`    | ⚠️ PARTIAL                  | ⚠️ Needs Fix |

---

## ⚠️ **Additional Endpoint That Needs Attention**

### GET `/api/v1/projects/:id/milestones`

This endpoint is accessible by moderators (for their assigned projects) and currently shows:

- Freelancer `fullName`
- Freelancer `email`
- Freelancer `primaryDomain`

**Location**: `src/controllers/projectController/newProjectController.ts` (Line 716-733)

**Current Code**:

```typescript
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
            fullName: true, // ⚠️ EXPOSED TO MODERATORS
            email: true, // ⚠️ EXPOSED TO MODERATORS
            primaryDomain: true, // ✅ OK
          },
        },
      },
    },
  },
  orderBy: { deadline: "asc" },
});
```

**Recommended Fix**:
We need to differentiate what moderators see vs what admins/clients see in milestone freelancer data.

**Option 1**: Split the logic by role (like we do for projects)

```typescript
if (userRole === "MODERATOR") {
  // Show capabilities only
  assignedFreelancer: {
    select: {
      id: true,
      details: {
        select: {
          primaryDomain: true,
          timeZone: true,
          eliteSkillCards: true,
          tools: true,
          country: true,
        },
      },
    },
  }
} else {
  // Admin/Client can see name and email
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
  }
}
```

**Option 2**: Always hide identity in milestones (most consistent)

```typescript
assignedFreelancer: {
  select: {
    id: true,
    details: {
      select: {
        // Only show capabilities, hide identity for everyone
        primaryDomain: true,
        timeZone: true,
        eliteSkillCards: true,
        tools: true,
        country: true,
      },
    },
  },
}
```

---

## 🔍 **Other Endpoints to Check**

These endpoints might also show freelancer data and should be reviewed:

### Admin Endpoints (OK - Admins can see everything)

- ✅ `GET /api/v1/admin/projects` - Admin only, can show full freelancer info
- ✅ `GET /api/v1/admin/projects/:id` - Admin only, can show full freelancer info
- ✅ `GET /api/v1/admin/freelancers` - Admin only, manages freelancers

### Client Endpoints (Should Review)

- ⚠️ `GET /api/v1/client/projects` - Client viewing their own projects
- ⚠️ `GET /api/v1/client/projects/:id` - Client viewing their project
  - **Question**: Should clients see freelancer names/emails?
  - **Current**: Likely shows names/emails (needs verification)
  - **Recommendation**: Clients probably should see freelancer names/emails for their own projects

### Freelancer Endpoints (Already Reviewed Earlier)

- ✅ `GET /api/v1/freelancer/projects` - Hides client details (already fixed)
- ✅ `GET /api/v1/freelancer/my-projects` - Hides client details (already fixed)

---

## 📝 **Testing Commands**

### Test 1: Moderator Lists Projects

```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/moderator/my-projects?page=1&limit=10' \
  -H 'Authorization: Bearer MODERATOR_TOKEN'
```

**Expected**: Freelancers should show capabilities only, no names/emails

### Test 2: Moderator Views Single Project

```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/moderator/projects/PROJECT_ID' \
  -H 'Authorization: Bearer MODERATOR_TOKEN'
```

**Expected**: Freelancers should show capabilities only, no names/emails

### Test 3: Moderator Views Milestones

```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/projects/PROJECT_ID/milestones' \
  -H 'Authorization: Bearer MODERATOR_TOKEN'
```

**Expected**: ⚠️ Currently shows freelancer names/emails in `assignedFreelancer`

**Should show**: Only capabilities (needs fix)

---

## 🎯 **Recommendation**

**Fix the milestone endpoint** to be consistent with the project endpoints. Moderators viewing milestones should see anonymous freelancer data (capabilities only, no identity).

Would you like me to fix the milestone endpoint as well to complete the anonymity implementation?
