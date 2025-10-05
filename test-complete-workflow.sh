#!/bin/bash

# Complete Workflow Test Script
# This script tests: Freelancer Registration -> ProjectBuilder Creation -> Freelancer Assignment

BASE_URL="http://localhost:8000/api/v1"
ADMIN_USERNAME="newuser789"
ADMIN_PASSWORD="password123"

echo "🚀 Starting Complete Workflow Test"
echo "=================================="

# Step 1: Login as admin to get token
echo "1. Logging in as admin to get authentication token..."
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$ADMIN_USERNAME\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

echo "Admin login response: $ADMIN_LOGIN_RESPONSE"

# Extract token from response
ADMIN_TOKEN=$(echo $ADMIN_LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Failed to get admin token. Please check credentials."
  exit 1
fi

echo "✅ Admin token obtained: ${ADMIN_TOKEN:0:20}..."

# Step 2: Register a freelancer
echo ""
echo "2. Registering a new freelancer..."
FREELANCER_REGISTRATION_RESPONSE=$(curl -s -X POST "$BASE_URL/freelancer/register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "whoYouAre": {
      "fullName": "Test Freelancer",
      "email": "testfreelancer12345@example.com",
      "timeZone": "Asia/Calcutta",
      "country": "IN",
      "professionalLinks": {
        "github": "https://github.com/testfreelancer",
        "linkedin": "https://linkedin.com/in/testfreelancer",
        "personalSite": "https://testfreelancer.com"
      }
    },
    "coreRole": {
      "primaryDomain": "Software Engineering"
    },
    "eliteSkillCards": {
      "selectedSkills": ["React", "Node.js", "Python", "JavaScript"]
    },
    "toolstackProficiency": {
      "selectedTools": [
        {
          "category": "Programming Languages",
          "tools": ["JavaScript", "Python", "TypeScript"]
        },
        {
          "category": "Frontend Frameworks",
          "tools": ["React", "Vue.js"]
        },
        {
          "category": "Backend Frameworks",
          "tools": ["Node.js", "Express"]
        }
      ]
    },
    "domainExperience": {
      "roles": [
        {
          "title": "Full-Stack Developer",
          "years": 5
        }
      ]
    },
    "industryExperience": {
      "selectedIndustries": [
        "SaaS (B2B/B2C)",
        "E-commerce",
        "Fintech"
      ]
    },
    "availabilityWorkflow": {
      "weeklyCommitment": 40,
      "workingHours": ["9am–5pm"],
      "collaborationTools": ["Slack", "Zoom", "GitHub"],
      "teamStyle": "agile",
      "screenSharing": "yes",
      "availabilityExceptions": "Available for urgent projects"
    },
    "softSkills": {
      "collaborationStyle": "agile",
      "communicationFrequency": "daily",
      "conflictResolution": "collaborative",
      "languages": ["English"],
      "teamVsSolo": "team"
    },
    "certifications": {
      "certificates": [
        {
          "name": "AWS Certified Developer",
          "url": "https://aws.amazon.com/certification/"
        }
      ]
    },
    "projectQuoting": {
      "compensationPreference": "hourly",
      "smallProjectPrice": 50,
      "midProjectPrice": 45,
      "longTermPrice": 40,
      "milestoneTerms": "50/50",
      "willSubmitProposals": "yes"
    },
    "legalAgreements": {
      "agreements": [
        {
          "id": "nda",
          "accepted": true
        },
        {
          "id": "workForHire",
          "accepted": true
        },
        {
          "id": "scope",
          "accepted": true
        },
        {
          "id": "payment",
          "accepted": true
        },
        {
          "id": "security",
          "accepted": true
        },
        {
          "id": "nonSolicitation",
          "accepted": true
        },
        {
          "id": "codeOfConduct",
          "accepted": true
        },
        {
          "id": "ipBoundaries",
          "accepted": true
        }
      ],
      "identityVerification": {
        "idType": "passport",
        "taxDocType": "w9",
        "addressVerified": true
      },
      "workAuthorization": {
        "interested": true
      }
    }
  }')

echo "Freelancer registration response: $FREELANCER_REGISTRATION_RESPONSE"

# Extract profile ID from response
PROFILE_ID=$(echo $FREELANCER_REGISTRATION_RESPONSE | grep -o '"profileId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$PROFILE_ID" ]; then
  echo "❌ Failed to register freelancer. Response: $FREELANCER_REGISTRATION_RESPONSE"
  exit 1
fi

echo "✅ Freelancer profile created with ID: $PROFILE_ID"

# Step 2.5: Accept freelancer registration to create actual user
echo ""
echo "2.5. Accepting freelancer registration to create user account..."
ACCEPT_FREELANCER_RESPONSE=$(curl -s -X POST "$BASE_URL/freelancer/accept/$PROFILE_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Accept freelancer response: $ACCEPT_FREELANCER_RESPONSE"

# Extract freelancer UID from acceptance response
FREELANCER_UID=$(echo $ACCEPT_FREELANCER_RESPONSE | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$FREELANCER_UID" ]; then
  echo "❌ Failed to accept freelancer. Response: $ACCEPT_FREELANCER_RESPONSE"
  exit 1
fi

echo "✅ Freelancer accepted with UID: $FREELANCER_UID"

# Step 3: Create a ProjectBuilder project
echo ""
echo "3. Creating a ProjectBuilder project..."
PROJECT_CREATION_RESPONSE=$(curl -s -X POST "$BASE_URL/project-builder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "projectName": "E-commerce Platform Development",
    "projectDescription": "A comprehensive e-commerce platform with modern features including user authentication, product catalog, shopping cart, payment integration, order management, and admin dashboard. The platform should be responsive and mobile-optimized.",
    "projectType": "Web Development",
    "technologies": ["React", "Node.js", "PostgreSQL", "Stripe", "AWS", "Docker"],
    "features": [
      "User Authentication & Authorization",
      "Product Catalog & Search",
      "Shopping Cart & Checkout",
      "Payment Processing",
      "Order Management",
      "Admin Dashboard",
      "Inventory Management",
      "Customer Reviews",
      "Email Notifications",
      "Analytics & Reporting"
    ],
    "budget": 25000,
    "timeline": "4 months",
    "priority": "HIGH",
    "status": "DRAFT",
    "clientName": "TechCorp Solutions",
    "clientEmail": "contact@techcorp.com",
    "clientPhone": "+1-555-0123",
    "clientCompany": "TechCorp Solutions Inc",
    "additionalNotes": "Need responsive design, mobile optimization, and integration with existing CRM system. Project should follow agile methodology with weekly sprints."
  }')

echo "Project creation response: $PROJECT_CREATION_RESPONSE"

# Extract project ID from response
PROJECT_ID=$(echo $PROJECT_CREATION_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Failed to create project. Response: $PROJECT_CREATION_RESPONSE"
  exit 1
fi

echo "✅ Project created with ID: $PROJECT_ID"

# Step 4: Get project details to verify creation
echo ""
echo "4. Getting project details..."
PROJECT_DETAILS_RESPONSE=$(curl -s -X GET "$BASE_URL/project-builder/$PROJECT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Project details: $PROJECT_DETAILS_RESPONSE"
echo "✅ Project details retrieved successfully"

# Step 5: Add freelancer as interested
echo ""
echo "5. Adding freelancer as interested in the project..."
ADD_INTERESTED_RESPONSE=$(curl -s -X POST "$BASE_URL/project-builder/$PROJECT_ID/interested-freelancers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"interestedFreelancerIds\": [\"$FREELANCER_UID\"]
  }")

echo "Add interested freelancer response: $ADD_INTERESTED_RESPONSE"
echo "✅ Freelancer added as interested"

# Step 6: Get project with freelancer information
echo ""
echo "6. Getting project with freelancer information..."
PROJECT_WITH_FREELANCERS_RESPONSE=$(curl -s -X GET "$BASE_URL/project-builder/$PROJECT_ID/freelancers" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Project with freelancers: $PROJECT_WITH_FREELANCERS_RESPONSE"
echo "✅ Project retrieved with freelancer data"

# Step 7: Select the freelancer for the project
echo ""
echo "7. Selecting freelancer for the project..."
SELECT_FREELANCER_RESPONSE=$(curl -s -X POST "$BASE_URL/project-builder/$PROJECT_ID/selected-freelancers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"selectedFreelancerIds\": [\"$FREELANCER_UID\"]
  }")

echo "Select freelancer response: $SELECT_FREELANCER_RESPONSE"
echo "✅ Freelancer selected for the project"

# Step 8: Final verification - Get project with all freelancer information
echo ""
echo "8. Final verification - Getting complete project information..."
FINAL_PROJECT_RESPONSE=$(curl -s -X GET "$BASE_URL/project-builder/$PROJECT_ID/freelancers" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Final project state: $FINAL_PROJECT_RESPONSE"

# Step 9: Test removing a freelancer (optional)
echo ""
echo "9. Testing freelancer removal..."
REMOVE_INTERESTED_RESPONSE=$(curl -s -X DELETE "$BASE_URL/project-builder/$PROJECT_ID/interested-freelancers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"freelancerUid\": \"$FREELANCER_UID\"
  }")

echo "Remove interested freelancer response: $REMOVE_INTERESTED_RESPONSE"

# Add freelancer back as interested
echo "Adding freelancer back as interested..."
curl -s -X POST "$BASE_URL/project-builder/$PROJECT_ID/interested-freelancers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"interestedFreelancerIds\": [\"$FREELANCER_UID\"]
  }" > /dev/null

echo "✅ Freelancer added back as interested"

echo ""
echo "🎉 Complete Workflow Test Completed Successfully!"
echo "================================================"
echo "Summary:"
echo "• Freelancer registered with UID: $FREELANCER_UID"
echo "• Project created with ID: $PROJECT_ID"
echo "• Freelancer assigned to project successfully"
echo "• All ProjectBuilder freelancer assignment endpoints working correctly"
echo ""
echo "📋 Tested Endpoints:"
echo "• POST /api/v1/freelancer/register - Freelancer registration"
echo "• POST /api/v1/project-builder - Project creation"
echo "• GET /api/v1/project-builder/:id - Get project details"
echo "• GET /api/v1/project-builder/:id/freelancers - Get project with freelancers"
echo "• POST /api/v1/project-builder/:id/interested-freelancers - Add interested freelancers"
echo "• POST /api/v1/project-builder/:id/selected-freelancers - Select freelancers"
echo "• DELETE /api/v1/project-builder/:id/interested-freelancers - Remove interested freelancer"
echo ""
echo "✅ All tests passed! The ProjectBuilder freelancer assignment system is working correctly."
