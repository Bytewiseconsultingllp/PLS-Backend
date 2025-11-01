# PLS-Backend Schema Migration Summary

## Overview

This document summarizes the complete rebuild of the Visitor, Project, and Freelancer systems with a new comprehensive schema structure.

---

## ✅ Completed Changes

### 1. **Database Schema (Prisma)**

**File:** `prisma/schema.prisma`

#### **Added New Models:**

**Visitor System (14 models):**

- `Visitor` - Main visitor entity with `clientId` link
- `VisitorDetails` - Business contact information
- `VisitorService` - Service selections with categories
- `VisitorIndustries` - Industry and sub-industry selections
- `VisitorTechnologies` - Technology stack selections
- `VisitorFeatures` - Feature requirements
- `VisitorDiscount` - Discount eligibility
- `VisitorTimeline` - Timeline and rush fee preferences
- `VisitorEstimate` - Price estimates
- `VisitorServiceAgreement` - T&C acceptance with metadata

**Project System (14 models + enhanced Milestone):**

- `Project` - Main project entity with `clientId` and optional `visitorId`
- `ProjectDetails` through `ProjectServiceAgreement` - Mirror of Visitor tables
- `Milestone` - Enhanced with status, priority, phase, risk level, budget tracking, assignments

**Freelancer System (8 models):**

- `Freelancer` - Main freelancer entity
- `FreelancerDetails` - Professional information
- `FreelancerDomainExperience` - Role experience
- `FreelancerAvailabilityWorkflow` - Availability and working preferences
- `FreelancerSoftSkills` - Collaboration and communication preferences
- `FreelancerCertification` - Professional certifications
- `FreelancerProjectBidding` - Pricing and compensation preferences
- `LegalAgreements` - Legal documents and agreements

#### **Added New Enums:**

- `ServiceCategory`, `IndustryCategory`, `IndustrySubIndustry`
- `TechnologyCategory`, `TechnologyItem`
- `FeatureCategory`, `FeatureItem`
- `DiscountType`, `TimelineOption`
- `MilestoneStatus`, `MilestonePriority`, `MilestonePhase`, `MilestoneRiskLevel`
- `ToolstackItem`, `FreelancerIndustry`, `AvailabilityWindow`, `CollaborationTool`
- `PreferredTeamStyle`, `LiveScreenSharingPreference`
- `PreferredCollaborationStyle`, `CommunicationFrequencyPreference`, `ConflictResolutionStyle`
- `LanguageFluency`, `TeamVsSoloPreference`
- `ProjectCompensationPreference`, `MilestonePaymentTerms`, `ProposalSubmissionPreference`
- `LegalIdentityDocType`, `LegalTaxDocType`

#### **Removed Old Models:**

- Old `Project` (lines 98-136)
- Old `Milestone` (lines 138-159)
- `ProjectBuilder` (lines 555-586)
- `ProjectRequest`, `Service`, `Industry`, `Technology`, `Feature` (lines 467-553)
- `FreeLancersRequest` (lines 281-304)
- Entire old Profile system (lines 331-463)
- Old `Visitors` (lines 588-609)
- `CreateServicesForQuote` (lines 228-231)
- `NichesForFreelancers` (lines 306-309)

#### **Updated Existing Models:**

- `User` - Updated relations for new Visitor/Project system
- `Payment` - Added `projectId` and `visitorId` optional relations

---

### 2. **TypeScript Type Definitions**

**File:** `src/types/index.d.ts`

#### **Added New Types:**

**Visitor Types:**

```typescript
TVISITOR_DETAILS,
  TVISITOR_SERVICE,
  TVISITOR_INDUSTRY,
  TVISITOR_TECHNOLOGY,
  TVISITOR_FEATURE,
  TVISITOR_DISCOUNT,
  TVISITOR_TIMELINE,
  TVISITOR_ESTIMATE,
  TVISITOR_SERVICE_AGREEMENT,
  TVISITOR_CREATE,
  TVISITOR;
```

**Project Types:**

```typescript
TPROJECT_DETAILS,
  TPROJECT_SERVICE,
  TPROJECT_INDUSTRY,
  TPROJECT_TECHNOLOGY,
  TPROJECT_FEATURE,
  TPROJECT_DISCOUNT,
  TPROJECT_TIMELINE,
  TPROJECT_ESTIMATE,
  TPROJECT_SERVICE_AGREEMENT,
  TMILESTONE,
  TPROJECT_CREATE,
  TPROJECT;
```

**Freelancer Types:**

```typescript
TFREELANCER_DETAILS,
  TFREELANCER_DOMAIN_EXPERIENCE,
  TFREELANCER_AVAILABILITY,
  TFREELANCER_SOFT_SKILLS,
  TFREELANCER_CERTIFICATION,
  TFREELANCER_PROJECT_BIDDING,
  TFREELANCER_LEGAL_AGREEMENTS,
  TFREELANCER_CREATE,
  TFREELANCER;
```

#### **Deprecated Types (kept for backward compatibility):**

- Old project types renamed with `_OLD` suffix

---

### 3. **Services Layer**

#### **Created New Services:**

**`src/services/visitorService.ts`**

- `createVisitor()` - Initialize visitor
- `upsertVisitorDetails()` - Add/update visitor details
- `addVisitorServices()` - Add service selections
- `addVisitorIndustries()` - Add industry selections
- `addVisitorTechnologies()` - Add technology selections
- `addVisitorFeatures()` - Add feature selections
- `upsertVisitorDiscount()` - Add/update discount
- `upsertVisitorTimeline()` - Add/update timeline
- `upsertVisitorEstimate()` - Add/update estimate
- `upsertVisitorServiceAgreement()` - Add/update service agreement
- `getVisitorById()` - Get complete visitor data
- `getVisitorByEmail()` - Find visitor by email
- `getAllVisitors()` - Get all visitors with pagination
- `linkVisitorToClient()` - Link visitor to user
- `deleteVisitor()` - Soft delete
- `checkIfEmailIsClient()` - Check if email is registered client

**`src/services/projectService.ts`**

- `createProjectFromVisitor()` - Copy visitor data to project
- `createProject()` - Create project directly
- `getProjectById()` - Get complete project data
- `getProjectsByClientId()` - Get client's projects
- `getAllProjects()` - Get all projects (admin)
- `updateProjectDiscordUrl()` - Update Discord chat URL
- `addMilestone()` - Add milestone to project
- `updateMilestone()` - Update milestone
- `deleteMilestone()` - Delete milestone
- `addInterestedFreelancer()` - Add interested freelancer
- `selectFreelancer()` - Select freelancer for project
- `removeInterestedFreelancer()` - Remove interested freelancer
- `removeSelectedFreelancer()` - Remove selected freelancer
- `deleteProject()` - Soft delete project

**`src/services/freelancerService.ts`**

- `createFreelancer()` - Initialize freelancer
- `upsertFreelancerDetails()` - Add/update details
- `addFreelancerDomainExperiences()` - Add domain experiences
- `upsertFreelancerAvailability()` - Add/update availability
- `upsertFreelancerSoftSkills()` - Add/update soft skills
- `addFreelancerCertifications()` - Add certifications
- `upsertFreelancerProjectBidding()` - Add/update bidding preferences
- `upsertFreelancerLegalAgreements()` - Add/update legal agreements
- `createCompleteFreelancer()` - Create full profile at once
- `getFreelancerById()` - Get complete freelancer data
- `getFreelancerByEmail()` - Find freelancer by email
- `getAllFreelancers()` - Get all freelancers with pagination
- `deleteFreelancer()` - Soft delete
- `checkEmailExists()` - Check if email exists

---

### 4. **Controllers Layer**

#### **Created New Controllers:**

**`src/controllers/visitorsController/newVisitorsController.ts`**

- `createVisitorWithDetails` - Step 1: Create visitor with details
- `addVisitorServices` - Step 2: Add services
- `addVisitorIndustries` - Step 3: Add industries
- `addVisitorTechnologies` - Step 4: Add technologies
- `addVisitorFeatures` - Step 5: Add features
- `addVisitorDiscount` - Step 6: Add discount
- `addVisitorTimeline` - Step 7: Add timeline
- `addVisitorEstimate` - Step 8: Add estimate
- `addVisitorServiceAgreement` - Step 9: Add service agreement (final)
- `getSingleVisitor` - Get visitor by ID
- `getAllVisitors` - Get all visitors (admin)
- `checkVisitorEmail` - Check if email exists/is client
- `deleteVisitor` - Soft delete (admin)

**`src/controllers/projectController/newProjectController.ts`**

- `createProjectFromVisitor` - Create from visitor data (after registration)
- `createProject` - Create directly (existing clients)
- `getSingleProject` - Get project by ID
- `getMyProjects` - Get client's projects
- `getAllProjects` - Get all projects (admin)
- `updateProjectDiscordUrl` - Update Discord URL
- `addMilestone` - Add milestone
- `updateMilestone` - Update milestone
- `deleteMilestone` - Delete milestone
- `addInterestedFreelancer` - Add interested freelancer (admin)
- `selectFreelancer` - Select freelancer (client/admin)
- `removeInterestedFreelancer` - Remove interested (admin)
- `removeSelectedFreelancer` - Remove selected (client/admin)
- `deleteProject` - Soft delete project

**`src/controllers/freeLancerController/newFreelancerController.ts`**

- `createFreelancer` - Create complete profile
- `createFreelancerWithDetails` - Step 1: Create with details
- `addFreelancerDomainExperiences` - Step 2: Add experiences
- `addFreelancerAvailability` - Step 3: Add availability
- `addFreelancerSoftSkills` - Step 4: Add soft skills
- `addFreelancerCertifications` - Step 5: Add certifications
- `addFreelancerProjectBidding` - Step 6: Add bidding preferences
- `addFreelancerLegalAgreements` - Step 7: Add legal agreements (final)
- `getSingleFreelancer` - Get freelancer by ID
- `getAllFreelancers` - Get all freelancers (admin)
- `checkFreelancerEmail` - Check if email exists
- `deleteFreelancer` - Soft delete (admin)

---

### 5. **Routers Layer**

#### **Created New Routers:**

**`src/routers/visitorsRouter/newVisitorsRouter.ts`**

```
POST   /api/v1/visitors/create                    - Create visitor with details
POST   /api/v1/visitors/:visitorId/services       - Add services
POST   /api/v1/visitors/:visitorId/industries     - Add industries
POST   /api/v1/visitors/:visitorId/technologies   - Add technologies
POST   /api/v1/visitors/:visitorId/features       - Add features
POST   /api/v1/visitors/:visitorId/discount       - Add discount
POST   /api/v1/visitors/:visitorId/timeline       - Add timeline
POST   /api/v1/visitors/:visitorId/estimate       - Add estimate
POST   /api/v1/visitors/:visitorId/service-agreement - Add service agreement
POST   /api/v1/visitors/check-email               - Check email
GET    /api/v1/visitors/:id                       - Get single visitor (auth)
GET    /api/v1/visitors                           - Get all visitors (admin)
DELETE /api/v1/visitors/:id                       - Delete visitor (admin)
```

**`src/routers/projectRouter/newProjectRouter.ts`**

```
POST   /api/v1/project/from-visitor              - Create from visitor
POST   /api/v1/project                            - Create project directly
GET    /api/v1/project/my-projects                - Get my projects
GET    /api/v1/project                            - Get all projects (admin)
GET    /api/v1/project/:id                        - Get single project
PATCH  /api/v1/project/:id/discord-url            - Update Discord URL
POST   /api/v1/project/:id/milestones             - Add milestone
PATCH  /api/v1/project/:id/milestones/:milestoneId - Update milestone
DELETE /api/v1/project/:id/milestones/:milestoneId - Delete milestone
POST   /api/v1/project/:id/interested-freelancers - Add interested freelancer
POST   /api/v1/project/:id/selected-freelancers   - Select freelancer
DELETE /api/v1/project/:id/interested-freelancers/:freelancerId - Remove interested
DELETE /api/v1/project/:id/selected-freelancers/:freelancerId - Remove selected
DELETE /api/v1/project/:id                        - Delete project
```

**`src/routers/freelancerRouter/newFreelancerRouter.ts`**

```
POST   /api/v1/freelancer/complete                - Create complete profile
POST   /api/v1/freelancer/create                  - Create with details
POST   /api/v1/freelancer/:freelancerId/domain-experiences - Add experiences
POST   /api/v1/freelancer/:freelancerId/availability - Add availability
POST   /api/v1/freelancer/:freelancerId/soft-skills - Add soft skills
POST   /api/v1/freelancer/:freelancerId/certifications - Add certifications
POST   /api/v1/freelancer/:freelancerId/project-bidding - Add bidding
POST   /api/v1/freelancer/:freelancerId/legal-agreements - Add legal agreements
POST   /api/v1/freelancer/check-email             - Check email
GET    /api/v1/freelancer/:id                     - Get single freelancer
GET    /api/v1/freelancer                         - Get all freelancers (admin)
DELETE /api/v1/freelancer/:id                     - Delete freelancer (admin)
```

---

### 6. **Router Configuration**

**File:** `src/routers/defaultRouter.ts`

- ✅ Imported new routers
- ✅ Registered new routers at existing endpoints
- ✅ Commented out old routers (kept for reference)

---

## 📋 Manual Tasks Required

### 1. **Run Database Migration**

The Prisma migration needs to be run in an interactive terminal:

```bash
cd PLS-Backend
npx prisma migrate dev --name rebuild_visitor_project_freelancer
```

**⚠️ WARNING:** This will:

- Drop `ProjectBuilder` table (1 row will be lost)
- Drop `Visitors` table (2 rows will be lost)
- Make other structural changes

**Backup your database first!**

```bash
# PostgreSQL backup
pg_dump -U your_user -d pls_backend > backup_$(date +%Y%m%d).sql
```

---

### 2. **Update Authentication/Registration Flow**

You mentioned visitors register as clients after completing all steps. The auth system needs to:

1. **During visitor form completion (Steps 1-9):**

   - No authentication required
   - Store data progressively in Visitor tables

2. **After completing service agreement:**
   - Show registration form (username, password)
   - Create User with `role: CLIENT`
   - Call `/api/v1/project/from-visitor` to create project
   - Link visitor to client via `clientId`

**Example Flow:**

```typescript
// Frontend after all visitor steps complete
const registerResponse = await fetch("/api/v1/auth/register", {
  method: "POST",
  body: JSON.stringify({
    username,
    fullName,
    email,
    password,
    role: "CLIENT",
  }),
});

const { clientId } = await registerResponse.json();

// Create project from visitor data
await fetch("/api/v1/project/from-visitor", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ visitorId }),
});
```

---

### 3. **Update Frontend API Calls**

All frontend calls need to be updated to use new endpoints:

**Visitor Journey:**

```
/api/v1/visitors/create                    → Step 1
/api/v1/visitors/:id/services              → Step 2
/api/v1/visitors/:id/industries            → Step 3
// ... etc
```

**Project Management:**

```
/api/v1/project/my-projects                → Get client's projects
/api/v1/project/:id                        → Get single project
/api/v1/project/:id/milestones             → Add milestone
```

**Freelancer Registration:**

```
/api/v1/freelancer/create                  → Step 1
/api/v1/freelancer/:id/domain-experiences  → Step 2
// ... etc
```

---

### 4. **Test the New Endpoints**

Use the provided Postman collection or test manually:

```bash
# Test visitor creation
curl -X POST http://localhost:PORT/api/v1/visitors/create \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "businessEmail": "john@example.com",
    "companyName": "Acme Corp",
    "businessType": "Technology",
    "referralSource": "Google"
  }'
```

---

### 5. **Update Swagger Documentation**

TODO: Create Swagger YAML files for new endpoints

Needed files:

- `src/swagger/visitors.yaml`
- `src/swagger/projects.yaml`
- `src/swagger/freelancers.yaml`

---

### 6. **Data Migration (If Needed)**

If you have existing data in old tables that needs to be migrated:

```sql
-- Example: Migrate old Visitors to new Visitor + VisitorDetails
INSERT INTO "Visitor" (id, "ipAddress", "createdAt", "updatedAt")
SELECT gen_random_uuid(), NULL, "createdAt", "updatedAt"
FROM "Visitors";

-- Then migrate details
-- Custom migration script needed
```

---

## 🚀 Key Features of New System

### **Progressive Data Collection**

- Visitor fills form step-by-step
- Each step saves to database immediately
- No data loss if user leaves mid-process

### **Client-Project Relationship**

- Clear separation: Visitor → Client (User) → Project
- One client can have multiple projects
- Projects retain original visitor data

### **Enhanced Project Management**

- Rich milestone tracking (status, priority, phase, budget)
- Freelancer assignment system
- Discord integration support

### **Comprehensive Freelancer Profiles**

- Detailed availability and working preferences
- Project bidding and pricing preferences
- Legal agreements and certifications
- Professional domain experiences

### **Data Integrity**

- All relations properly typed with Prisma
- Soft deletes throughout
- Comprehensive indexes for performance

---

## 📁 File Structure

```
PLS-Backend/
├── prisma/
│   └── schema.prisma                    ✅ Updated
├── src/
│   ├── types/
│   │   └── index.d.ts                   ✅ Updated
│   ├── services/
│   │   ├── visitorService.ts            ✅ NEW
│   │   ├── projectService.ts            ✅ NEW
│   │   └── freelancerService.ts         ✅ NEW
│   ├── controllers/
│   │   ├── visitorsController/
│   │   │   └── newVisitorsController.ts ✅ NEW
│   │   ├── projectController/
│   │   │   └── newProjectController.ts  ✅ NEW
│   │   └── freeLancerController/
│   │       └── newFreelancerController.ts ✅ NEW
│   └── routers/
│       ├── visitorsRouter/
│       │   └── newVisitorsRouter.ts     ✅ NEW
│       ├── projectRouter/
│       │   └── newProjectRouter.ts      ✅ NEW
│       ├── freelancerRouter/
│       │   └── newFreelancerRouter.ts   ✅ NEW
│       └── defaultRouter.ts             ✅ Updated
└── MIGRATION_SUMMARY.md                 ✅ THIS FILE
```

---

## 🔄 Rollback Plan

If you need to rollback:

1. **Restore database from backup**
2. **Uncomment old routers in `defaultRouter.ts`**
3. **Comment out new routers**
4. **Restore old `schema.prisma` from git history**
5. **Run `npx prisma generate`**

---

## ✅ Next Steps

1. ✅ **Run database migration** (manual)
2. ✅ **Test all new endpoints**
3. ✅ **Update frontend API calls**
4. ✅ **Update authentication flow**
5. ✅ **Create Swagger documentation**
6. ✅ **Deploy to staging for testing**
7. ✅ **Monitor for issues**
8. ✅ **Remove old deprecated files after successful migration**

---

## 📞 Support

If you encounter any issues during migration:

1. Check this document first
2. Review the inline code comments
3. Test endpoints with Postman
4. Check Prisma migration logs

---

**Migration completed:** $(date)
**Tested:** ⚠️ Needs testing
**Production Ready:** ⚠️ Needs validation
