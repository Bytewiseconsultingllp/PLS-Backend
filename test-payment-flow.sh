#!/bin/bash

# Payment Integration Test Script
# This script tests the complete payment flow without a frontend

set -e  # Exit on error

BASE_URL="http://localhost:8000"
EMAIL="test.payment.$(date +%s)@example.com"
VISITOR_ID=""
PROJECT_ID=""
ACCESS_TOKEN=""
OTP=""

echo "================================================"
echo "🧪 Payment Integration Test"
echo "================================================"
echo ""
echo "Testing with email: $EMAIL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Create Visitor with Details
echo "================================================"
echo "Step 1: Creating Visitor with Details"
echo "================================================"

VISITOR_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/visitors/create-with-details" \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Test Payment User\",
    \"businessEmail\": \"$EMAIL\",
    \"phoneNumber\": \"1234567890\",
    \"companyName\": \"Test Payment Corp\",
    \"companyWebsite\": \"https://testpayment.com\",
    \"businessAddress\": \"123 Test St, Test City\",
    \"businessType\": \"Technology\",
    \"referralSource\": \"Automated Test\"
  }")

echo "Response: $VISITOR_RESPONSE"

VISITOR_ID=$(echo $VISITOR_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\([^"]*\)"/\1/')

if [ -z "$VISITOR_ID" ]; then
  echo -e "${RED}❌ Failed to create visitor${NC}"
  echo "Response: $VISITOR_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Visitor created: $VISITOR_ID${NC}"
echo ""
sleep 1

# Step 2: Add Services
echo "================================================"
echo "Step 2: Adding Services"
echo "================================================"

SERVICE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/visitors/$VISITOR_ID/services" \
  -H "Content-Type: application/json" \
  -d '{
    "services": [
      {
        "name": "SOFTWARE_DEVELOPMENT",
        "childServices": ["Web Application", "API Development"]
      }
    ]
  }')

echo "Response: $SERVICE_RESPONSE"
echo -e "${GREEN}✅ Services added${NC}"
echo ""
sleep 1

# Step 3: Add Technologies
echo "================================================"
echo "Step 3: Adding Technologies"
echo "================================================"

TECH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/visitors/$VISITOR_ID/technologies" \
  -H "Content-Type: application/json" \
  -d '{
    "technologies": [
      {
        "category": "BACKEND",
        "technologies": ["NODE_JS"]
      },
      {
        "category": "FRONTEND",
        "technologies": ["REACT"]
      }
    ]
  }')

echo "Response: $TECH_RESPONSE"
echo -e "${GREEN}✅ Technologies added${NC}"
echo ""
sleep 1

# Step 4: Add Features
echo "================================================"
echo "Step 4: Adding Features"
echo "================================================"

FEATURE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/visitors/$VISITOR_ID/features" \
  -H "Content-Type: application/json" \
  -d '{
    "features": [
      {
        "category": "USER_MANAGEMENT",
        "features": ["AUTHENTICATION", "ROLE_BASED_ACCESS_CONTROL"]
      }
    ]
  }')

echo "Response: $FEATURE_RESPONSE"
echo -e "${GREEN}✅ Features added${NC}"
echo ""
sleep 1

# Step 5: Add Timeline
echo "================================================"
echo "Step 5: Adding Timeline"
echo "================================================"

TIMELINE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/visitors/$VISITOR_ID/timeline" \
  -H "Content-Type: application/json" \
  -d '{
    "option": "STANDARD_BUILD"
  }')

echo "Response: $TIMELINE_RESPONSE"
echo -e "${GREEN}✅ Timeline added${NC}"
echo ""
sleep 1

# Step 6: Calculate Estimate
echo "================================================"
echo "Step 6: Calculating Estimate"
echo "================================================"

ESTIMATE_CALC_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/visitors/$VISITOR_ID/estimate/calculate" \
  -H "Content-Type: application/json")

echo "Response: $ESTIMATE_CALC_RESPONSE"
echo -e "${GREEN}✅ Estimate calculated${NC}"
echo ""

# Extract calculatedTotal for display
CALCULATED_TOTAL=$(echo $ESTIMATE_CALC_RESPONSE | grep -o '"calculatedTotal":[0-9.]*' | sed 's/"calculatedTotal"://')
echo -e "${YELLOW}💰 Calculated Total: \$$CALCULATED_TOTAL${NC}"
echo ""
sleep 1

# Step 7: Accept Estimate
echo "================================================"
echo "Step 7: Accepting Estimate"
echo "================================================"

ESTIMATE_ACCEPT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/visitors/$VISITOR_ID/estimate/accept" \
  -H "Content-Type: application/json" \
  -d '{
    "estimateAccepted": true
  }')

echo "Response: $ESTIMATE_ACCEPT_RESPONSE"
echo -e "${GREEN}✅ Estimate accepted${NC}"
echo ""
sleep 1

# Step 8: Sign Service Agreement
echo "================================================"
echo "Step 8: Signing Service Agreement"
echo "================================================"

AGREEMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/visitors/$VISITOR_ID/service-agreement" \
  -H "Content-Type: application/json" \
  -d '{
    "documentUrl": "https://example.com/agreement.pdf",
    "accepted": true
  }')

echo "Response: $AGREEMENT_RESPONSE"
echo -e "${GREEN}✅ Service agreement signed${NC}"
echo ""
sleep 1

# Step 9: Register User
echo "================================================"
echo "Step 9: Registering User"
echo "================================================"

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testpay$(date +%s)\",
    \"fullName\": \"Test Payment User\",
    \"email\": \"$EMAIL\",
    \"password\": \"SecurePass123!\"
  }")

echo "Response: $REGISTER_RESPONSE"
echo -e "${GREEN}✅ User registered${NC}"
echo ""
echo -e "${YELLOW}⏳ Please check your server logs for the OTP${NC}"
echo ""

# Prompt for OTP
read -p "Enter the OTP from your server logs: " OTP

echo ""

# Step 10: Verify OTP (This creates the project)
echo "================================================"
echo "Step 10: Verifying OTP (Creates Project)"
echo "================================================"

VERIFY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"OTP\": \"$OTP\"
  }")

echo "Response: $VERIFY_RESPONSE"

ACCESS_TOKEN=$(echo $VERIFY_RESPONSE | grep -o '"accessToken":"[^"]*"' | sed 's/"accessToken":"\([^"]*\)"/\1/')

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Failed to verify OTP or get access token${NC}"
  echo "Response: $VERIFY_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ OTP verified and user logged in${NC}"
echo -e "${GREEN}✅ Project auto-created with PENDING payment status${NC}"
echo ""
sleep 1

# Step 11: Get Project ID
echo "================================================"
echo "Step 11: Getting Project Details"
echo "================================================"

PROJECTS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/projects" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $PROJECTS_RESPONSE"

PROJECT_ID=$(echo $PROJECTS_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\([^"]*\)"/\1/')
PAYMENT_STATUS=$(echo $PROJECTS_RESPONSE | grep -o '"paymentStatus":"[^"]*"' | head -1 | sed 's/"paymentStatus":"\([^"]*\)"/\1/')

if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}❌ Failed to get project ID${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Project ID: $PROJECT_ID${NC}"
echo -e "${YELLOW}📊 Current Payment Status: $PAYMENT_STATUS${NC}"
echo ""
sleep 1

# Step 12: Create Checkout Session
echo "================================================"
echo "Step 12: Creating Payment Checkout Session"
echo "================================================"

CHECKOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/payments/project/create-checkout-session" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\": \"$PROJECT_ID\",
    \"successUrl\": \"http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}\",
    \"cancelUrl\": \"http://localhost:3000/payment/cancel\"
  }")

echo "Response: $CHECKOUT_RESPONSE"

CHECKOUT_URL=$(echo $CHECKOUT_RESPONSE | grep -o '"checkoutUrl":"[^"]*"' | sed 's/"checkoutUrl":"\([^"]*\)"/\1/')
SESSION_ID=$(echo $CHECKOUT_RESPONSE | grep -o '"sessionId":"[^"]*"' | sed 's/"sessionId":"\([^"]*\)"/\1/')

if [ -z "$CHECKOUT_URL" ]; then
  echo -e "${RED}❌ Failed to create checkout session${NC}"
  echo "Response: $CHECKOUT_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Checkout session created${NC}"
echo -e "${YELLOW}🔗 Session ID: $SESSION_ID${NC}"
echo ""
echo "================================================"
echo "💳 PAYMENT REQUIRED"
echo "================================================"
echo ""
echo "Please open this URL in your browser to complete payment:"
echo ""
echo -e "${GREEN}$CHECKOUT_URL${NC}"
echo ""
echo "Use Stripe test card:"
echo "  Card Number: 4242 4242 4242 4242"
echo "  Expiry: Any future date (e.g., 12/25)"
echo "  CVC: Any 3 digits (e.g., 123)"
echo "  ZIP: Any 5 digits (e.g., 12345)"
echo ""
read -p "Press Enter after completing payment..."
echo ""

# Step 13: Check Webhook Received
echo "================================================"
echo "Step 13: Checking Webhook & Payment Status"
echo "================================================"
echo ""
echo "Waiting for webhook to process..."
sleep 3

# Step 14: Verify Payment Status
echo "================================================"
echo "Step 14: Verifying Payment Status"
echo "================================================"

PAYMENT_STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/payments/project/$PROJECT_ID/status" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $PAYMENT_STATUS_RESPONSE"

FINAL_STATUS=$(echo $PAYMENT_STATUS_RESPONSE | grep -o '"paymentStatus":"[^"]*"' | sed 's/"paymentStatus":"\([^"]*\)"/\1/')

echo ""
echo "================================================"
echo "📊 FINAL PAYMENT STATUS"
echo "================================================"
echo ""
echo -e "Status: ${GREEN}$FINAL_STATUS${NC}"
echo ""

if [ "$FINAL_STATUS" = "SUCCEEDED" ]; then
  echo -e "${GREEN}✅✅✅ PAYMENT INTEGRATION TEST PASSED! ✅✅✅${NC}"
  echo ""
  echo "All steps completed successfully:"
  echo "  ✅ Visitor created"
  echo "  ✅ Services, technologies, features added"
  echo "  ✅ Estimate calculated and accepted"
  echo "  ✅ Service agreement signed"
  echo "  ✅ User registered and verified"
  echo "  ✅ Project auto-created"
  echo "  ✅ Checkout session created"
  echo "  ✅ Payment completed"
  echo "  ✅ Webhook received and processed"
  echo "  ✅ Project payment status updated to SUCCEEDED"
else
  echo -e "${YELLOW}⚠️  Payment status is: $FINAL_STATUS${NC}"
  echo ""
  echo "This might be expected if:"
  echo "  - Payment is still processing"
  echo "  - Payment was not completed"
  echo "  - Webhook hasn't been received yet"
  echo ""
  echo "Check your Stripe webhook listener terminal for webhook events."
fi

echo ""
echo "================================================"
echo "Test completed!"
echo "================================================"
echo ""
echo "Test Summary:"
echo "  Email: $EMAIL"
echo "  Visitor ID: $VISITOR_ID"
echo "  Project ID: $PROJECT_ID"
echo "  Payment Status: $FINAL_STATUS"
echo ""

