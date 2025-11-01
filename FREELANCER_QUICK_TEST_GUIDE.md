# Freelancer System - Quick Test Guide

## Quick Test Commands

### 1. Register Freelancer

```bash
curl -X POST http://localhost:8000/api/v1/freelancer/register \
  -H "Content-Type: application/json" \
  -d '{
    "details": {
      "country": "USA",
      "email": "test@example.com",
      "fullName": "Test User",
      "professionalLinks": ["https://github.com/test"],
      "timeZone": "America/Los_Angeles",
      "eliteSkillCards": ["React Expert"],
      "tools": ["SLACK", "GITHUB"],
      "selectedIndustries": ["FINTECH"],
      "primaryDomain": "Full Stack Development"
    },
    "availabilityWorkflow": {
      "weeklyCommitmentMinHours": 30,
      "timeZone": "America/Los_Angeles",
      "workingWindows": ["EIGHT_AM_TO_TWELVE_PM"],
      "collaborationTools": ["SLACK", "ZOOM"],
      "preferredTeamStyle": "SCHEDULED_STANDUPS",
      "liveScreenSharingPreference": "YES_COMFORTABLE"
    },
    "domainExperiences": [{"roleTitle": "Developer", "years": 5}],
    "softSkills": {
      "preferredCollaborationStyle": "AGILE_SCRUM",
      "communicationFrequency": "DAILY_CHECK_INS",
      "conflictResolutionStyle": "DIRECT_CLEAR",
      "languages": ["ENGLISH"],
      "teamVsSoloPreference": "FLEXIBLE_BOTH"
    },
    "certifications": [],
    "projectBidding": {
      "compensationPreference": "FIXED_PRICE",
      "milestonePaymentTerms": "FIFTY_FIFTY",
      "proposalSubmission": "YES_HAVE_TEMPLATE"
    },
    "legalAgreements": {
      "projectSpecificNdaAccepted": true,
      "projectSpecificNdaUrl": "https://example.com/nda.pdf",
      "workForHireAccepted": true,
      "workForHireUrl": "https://example.com/work.pdf",
      "projectScopeDeliverablesAccepted": true,
      "projectScopeDeliverablesUrl": "https://example.com/scope.pdf",
      "paymentTermsAccepted": true,
      "paymentTermsUrl": "https://example.com/payment.pdf",
      "securityComplianceAccepted": true,
      "nonSolicitationAccepted": true,
      "nonSolicitationUrl": "https://example.com/non-sol.pdf",
      "codeOfConductAccepted": true,
      "codeOfConductUrl": "https://example.com/code.pdf",
      "projectIpBoundariesAccepted": true,
      "projectIpBoundariesUrl": "https://example.com/ip.pdf",
      "finalCertificationAccepted": true
    }
  }' | jq .
```

### 2. Admin Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testadmin",
    "password": "TestAdmin123"
  }' | jq .
```

### 3. Get Pending Freelancers (Admin)

```bash
ADMIN_TOKEN="<your-admin-token>"

curl -X GET "http://localhost:8000/api/v1/freelancer/admin/freelancers?status=PENDING_REVIEW" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq .
```

### 4. Accept Freelancer (Admin)

```bash
FREELANCER_ID="<freelancer-id>"

curl -X POST "http://localhost:8000/api/v1/freelancer/admin/freelancers/$FREELANCER_ID/review" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "ACCEPT"}' | jq .
```

### 5. Freelancer Login

```bash
# Use credentials from admin accept response
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "<generated-username>",
    "password": "<temp-password>"
  }' | jq .
```

### 6. View Available Projects (Freelancer)

```bash
FREELANCER_TOKEN="<freelancer-token>"

curl -X GET "http://localhost:8000/api/v1/freelancer/projects" \
  -H "Authorization: Bearer $FREELANCER_TOKEN" \
  -H "Content-Type: application/json" | jq .
```

### 7. Submit Bid (Freelancer)

```bash
PROJECT_ID="<project-id>"

curl -X POST "http://localhost:8000/api/v1/freelancer/bids" \
  -H "Authorization: Bearer $FREELANCER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\": \"$PROJECT_ID\",
    \"bidAmount\": 25000,
    \"proposalText\": \"I am interested in working on this project.\"
  }" | jq .
```

### 8. View My Bids (Freelancer)

```bash
curl -X GET "http://localhost:8000/api/v1/freelancer/bids" \
  -H "Authorization: Bearer $FREELANCER_TOKEN" \
  -H "Content-Type: application/json" | jq .
```

### 9. Review Bid (Admin)

```bash
BID_ID="<bid-id>"

curl -X POST "http://localhost:8000/api/v1/freelancer/admin/bids/$BID_ID/review" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "ACCEPT"}' | jq .
```

---

## Test Credentials

### Admin

- **Username:** `testadmin`
- **Password:** `TestAdmin123`

### Test Freelancer (After Acceptance)

- **Username:** Auto-generated (e.g., `johndoe_1761907493172`)
- **Password:** Auto-generated (e.g., `og8o!YqnI!5C`)
- Check admin acceptance response for credentials

---

## API Endpoints

### Base URL

```
http://localhost:8000/api/v1/freelancer
```

### Public

- `POST /register` - Register as freelancer

### Freelancer (Authenticated)

- `GET /profile` - Get my profile
- `GET /projects` - List available projects
- `GET /projects/:projectId` - Get project details
- `POST /bids` - Submit a bid
- `GET /bids` - List my bids
- `GET /bids/:bidId` - Get bid details
- `DELETE /bids/:bidId` - Withdraw bid

### Admin (Authenticated)

- `GET /admin/freelancers` - List all freelancers
- `GET /admin/freelancers/:id` - Get freelancer details
- `POST /admin/freelancers/:id/review` - Accept/Reject freelancer
- `GET /admin/bids/:bidId` - Get bid details
- `POST /admin/bids/:bidId/review` - Accept/Reject bid
- `GET /admin/projects/:projectId/bids` - Get project bids

---

## Test Workflow

1. **Register Freelancer** → Status: PENDING_REVIEW
2. **Admin Login** → Get admin token
3. **View Pending** → See registered freelancer
4. **Accept Freelancer** → User account created
5. **Freelancer Login** → Use generated credentials
6. **View Projects** → See available projects (no pricing)
7. **Submit Bid** → Create bid on project
8. **View My Bids** → Check bid status
9. **Admin Review Bid** → Accept bid
10. **Verify Status** → Both parties see ACCEPTED

---

## Key Features Verified

✅ Freelancer registration with comprehensive profile  
✅ Admin review and acceptance workflow  
✅ Automatic user account creation  
✅ Role-based access control (FREELANCER role)  
✅ Projects visible to freelancers WITHOUT pricing  
✅ Bid submission and tracking  
✅ Duplicate bid prevention  
✅ Admin bid review and acceptance  
✅ Status updates visible to both parties  
✅ Soft delete support

---

## Notes

- All endpoints require proper authentication (except registration)
- JWT tokens expire after 14 minutes (access token)
- Freelancers CANNOT see project estimates/pricing
- Clients CANNOT see freelancer bid amounts (by design)
- Email notifications are planned but not yet implemented
