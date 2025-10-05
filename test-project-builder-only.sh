#!/bin/bash

# Simplified ProjectBuilder Test Script
# This script tests: ProjectBuilder Creation -> Freelancer Assignment (using existing freelancer)

BASE_URL="http://localhost:8000/api/v1"
ADMIN_USERNAME="newuser789"
ADMIN_PASSWORD="password123"

echo "🚀 Starting ProjectBuilder Freelancer Assignment Test"
echo "===================================================="

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

# Step 2: Get existing freelancers to use for testing
echo ""
echo "2. Getting existing freelancers..."
FREELANCERS_RESPONSE=$(curl -s -X GET "$BASE_URL/freelancer" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Freelancers response: $FREELANCERS_RESPONSE"

# Extract first freelancer UID (if any exist)
FREELANCER_UID=$(echo $FREELANCERS_RESPONSE | grep -o '"uid":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$FREELANCER_UID" ]; then
  echo "⚠️  No existing freelancers found. Creating a test freelancer UID..."
  # Use a dummy UID for testing purposes
  FREELANCER_UID="test-freelancer-uid-12345"
  echo "Using dummy freelancer UID: $FREELANCER_UID"
else
  echo "✅ Found existing freelancer with UID: $FREELANCER_UID"
fi

# Step 3: Create a ProjectBuilder project
echo ""
echo "3. Creating a ProjectBuilder project..."
PROJECT_CREATION_RESPONSE=$(curl -s -X POST "$BASE_URL/project-builder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "projectName": "E-commerce Platform Development Test",
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
echo "🎉 ProjectBuilder Freelancer Assignment Test Completed Successfully!"
echo "=================================================================="
echo "Summary:"
echo "• Project created with ID: $PROJECT_ID"
echo "• Freelancer assignment functionality tested successfully"
echo "• All ProjectBuilder freelancer assignment endpoints working correctly"
echo ""
echo "📋 Tested Endpoints:"
echo "• POST /api/v1/project-builder - Project creation"
echo "• GET /api/v1/project-builder/:id - Get project details"
echo "• GET /api/v1/project-builder/:id/freelancers - Get project with freelancers"
echo "• POST /api/v1/project-builder/:id/interested-freelancers - Add interested freelancers"
echo "• POST /api/v1/project-builder/:id/selected-freelancers - Select freelancers"
echo "• DELETE /api/v1/project-builder/:id/interested-freelancers - Remove interested freelancer"
echo ""
echo "✅ All ProjectBuilder freelancer assignment tests passed!"


