# Moderator Freelancer Privacy Analysis

## 🚨 CRITICAL PRIVACY ISSUE FOUND

**Date**: November 15, 2025  
**Severity**: MEDIUM-HIGH  
**Type**: Information Disclosure / Privacy Violation

## Summary

Moderators can currently see **ALL freelancer details** including sensitive personal information that they don't need to perform their duties. This violates the principle of least privilege and exposes freelancer private information.

## The Problem

### Affected Endpoints

1. **GET `/api/v1/moderator/projects/:projectId`** - Single project details
2. **GET `/api/v1/moderator/my-projects`** - List of moderator's projects
3. **GET `/api/v1/admin/moderators/:id`** - Admin viewing moderator details

### Vulnerable Code

#### File: `src/services/moderatorService.ts`

**Line 610-614** (`getModeratorProjectById`):

```typescript
selectedFreelancers: {
  where: { deletedAt: null },
  include: {
    details: true,  // ❌ EXPOSES ALL FREELANCER DETAILS!
  },
},
```

**Line 541-552** (`getModeratorProjects`):

```typescript
selectedFreelancers: {
  where: { deletedAt: null },
  select: {
    id: true,
    details: {
      select: {
        fullName: true,
        email: true,
        primaryDomain: true,  // ✅ Limited, but could be more restrictive
      },
    },
  },
},
```

## What's Exposed

### FreelancerDetails Table Contains:

| Field                | Sensitivity | Should Moderator See?                        |
| -------------------- | ----------- | -------------------------------------------- |
| `fullName`           | Low         | ✅ YES - Needed for identification           |
| `email`              | Medium      | ✅ YES - Needed for communication            |
| `primaryDomain`      | Low         | ✅ YES - Needed to understand expertise      |
| `country`            | Medium      | ❌ NO - Not needed, potentially sensitive    |
| `professionalLinks`  | High        | ❌ NO - Personal portfolios/social media     |
| `timeZone`           | Medium      | ❌ NO - Personal information                 |
| `eliteSkillCards`    | Medium      | ❌ NO - Private skills/capabilities          |
| `tools`              | Medium      | ❌ NO - Private toolstack preferences        |
| `otherNote`          | **HIGH**    | ❌ NO - May contain sensitive personal notes |
| `selectedIndustries` | Low         | ❌ NO - Not needed for moderation            |

### Additional Sensitive Data (Not in details but could be exposed):

- ❌ `FreelancerDomainExperience` - Work history
- ❌ `FreelancerSoftSkills` - Communication preferences, languages
- ❌ `FreelancerCertification` - Professional certifications
- ❌ `LegalAgreements` - NDAs, tax docs, identity docs, addresses
- ❌ `FreelancerProjectBidding` - Bidding preferences
- ❌ `FreelancerAvailabilityWorkflow` - Availability, working hours

## Current State Analysis

### getModeratorProjects() - Line 541-552

**Status**: ⚠️ PARTIALLY SECURE

```typescript
selectedFreelancers: {
  where: { deletedAt: null },
  select: {
    id: true,
    details: {
      select: {
        fullName: true,      // ✅ OK
        email: true,         // ✅ OK
        primaryDomain: true, // ✅ OK
      },
    },
  },
},
```

**Assessment**: This is acceptable. Only essential fields are exposed.

### getModeratorProjectById() - Line 610-614

**Status**: 🚨 VULNERABLE

```typescript
selectedFreelancers: {
  where: { deletedAt: null },
  include: {
    details: true,  // ❌ EXPOSES ALL FIELDS!
  },
},
```

**Assessment**: This exposes ALL freelancer details including:

- professionalLinks
- timeZone
- eliteSkillCards
- tools
- otherNote (CRITICAL - may contain sensitive notes)
- selectedIndustries
- country

### getModeratorById() - Line 195-206 (Admin endpoint)

**Status**: ✅ ACCEPTABLE (Admin Only)

```typescript
selectedFreelancers: {
  where: { deletedAt: null },
  select: {
    id: true,
    details: {
      select: {
        fullName: true,
        email: true,
      },
    },
  },
},
```

**Assessment**: Admin-only endpoint with limited exposure. Acceptable.

## Security Impact

### Information Disclosure

- **Freelancer Privacy**: Personal information exposed to moderators
- **Professional Data**: Portfolio links, skill cards, and notes visible
- **Competitive Intelligence**: Other freelancers' capabilities visible

### Potential Attack Vectors

1. **Data Harvesting**: Malicious moderator could collect freelancer contact info
2. **Social Engineering**: Use professionalLinks to contact freelancers outside platform
3. **Competitive Advantage**: Use skill/tool data for competitive purposes
4. **Privacy Violation**: otherNote field may contain sensitive personal information

## Compliance Concerns

### GDPR (General Data Protection Regulation)

- **Principle of Data Minimization**: Only process data necessary for the purpose
- **Purpose Limitation**: Data should only be used for specified purposes
- **Storage Limitation**: Don't retain more data than necessary

### CCPA (California Consumer Privacy Act)

- **Consumer Right to Know**: Freelancers should know what data is shared
- **Right to Delete**: Excessive data sharing makes deletion complex

## Recommended Fix

### Option 1: Selective Fields (RECOMMENDED)

Update `getModeratorProjectById()` to match `getModeratorProjects()`:

```typescript
selectedFreelancers: {
  where: { deletedAt: null },
  select: {
    id: true,
    details: {
      select: {
        fullName: true,      // ✅ For identification
        email: true,         // ✅ For communication
        primaryDomain: true, // ✅ For understanding expertise
      },
    },
  },
},
```

### Option 2: Even More Restrictive (MOST SECURE)

Only expose absolutely essential fields:

```typescript
selectedFreelancers: {
  where: { deletedAt: null },
  select: {
    id: true,
    details: {
      select: {
        fullName: true,  // ✅ For identification
        email: true,     // ✅ For communication
      },
    },
  },
},
```

## What Moderators Actually Need

### For Their Job Duties:

- ✅ Freelancer name (to identify who's working)
- ✅ Email (to contact if needed)
- ✅ Primary domain (to understand their role)
- ✅ Assigned milestone info
- ✅ Work progress/status

### What They DON'T Need:

- ❌ Personal portfolios/social media links
- ❌ Timezone information
- ❌ Personal notes
- ❌ Tool preferences
- ❌ Elite skill cards
- ❌ Country of residence
- ❌ Selected industries
- ❌ Legal documents
- ❌ Certifications
- ❌ Soft skills preferences

## Comparison with Other Roles

### What ADMINS Can See (Appropriate):

- ✅ All freelancer information (for hiring decisions)
- ✅ Legal documents
- ✅ Certifications
- ✅ Full profile

### What CLIENTS Can See (Should verify):

- ✅ Freelancer name
- ✅ Email (for assigned freelancers)
- ✅ Work expertise
- ✅ Milestone progress
- ❌ Personal portfolios (unless needed)
- ❌ Legal documents

### What FREELANCERS Can See:

- ✅ Their own full data
- ✅ Other freelancers' names (on same project)
- ❌ Other freelancers' private details

### What MODERATORS Should See (Needs fix):

- ✅ Freelancer name
- ✅ Email (for assigned projects only)
- ✅ Primary domain
- ✅ Milestone assignments
- ❌ Everything else

## Testing Required

### Test 1: Moderator Views Project (After Fix)

```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/moderator/projects/PROJECT_ID' \
  -H 'Authorization: Bearer MODERATOR_TOKEN'
```

**Expected**: Should only see `fullName`, `email`, and `primaryDomain` in freelancer details.

**Should NOT see**:

- professionalLinks
- timeZone
- eliteSkillCards
- tools
- otherNote
- selectedIndustries
- country

### Test 2: Moderator Lists Projects (Already OK)

```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/moderator/my-projects' \
  -H 'Authorization: Bearer MODERATOR_TOKEN'
```

**Status**: ✅ Already secure - only shows essential fields.

## Files Requiring Changes

1. `src/services/moderatorService.ts` - Line 610-614

   - Change `include: { details: true }` to selective `select`

2. Review any other moderator endpoints that might expose freelancer data

## Priority

**HIGH** - Should be fixed soon to:

- Protect freelancer privacy
- Comply with data protection regulations
- Follow principle of least privilege
- Prevent potential data misuse

## Related Documentation

- See `FREELANCER_PRIVACY_FIX.md` - Similar fix for hiding client details from freelancers
- See `SECURITY_FIX_MODERATOR_AUTHORIZATION.md` - Related moderator security fixes

---

**Recommendation**: Implement Option 1 (Selective Fields) immediately to match the security pattern already used in `getModeratorProjects()`.
