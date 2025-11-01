#!/bin/bash

# Live Payment Test Script
# Project ID: 403f90bd-0f1f-4bde-a701-adc37ab35252

echo "=========================================="
echo "STEP 1: Login to get Access Token"
echo "=========================================="

LOGIN_RESPONSE=$(curl -s -X POST 'http://localhost:8000/api/v1/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "username": "aaaaaaaaaa",
  "password": "aaaaaaaaaa"
}')

echo "$LOGIN_RESPONSE" | jq '.'

# Extract access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token!"
  exit 1
fi

echo ""
echo "✅ Access Token: $ACCESS_TOKEN"
echo ""

echo "=========================================="
echo "STEP 2: Create Checkout Session"
echo "=========================================="

CHECKOUT_RESPONSE=$(curl -s -X POST 'http://localhost:8000/api/v1/payment/project/create-checkout-session' \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId": "403f90bd-0f1f-4bde-a701-adc37ab35252",
    "successUrl": "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
    "cancelUrl": "http://localhost:3000/payment/cancel"
  }')

echo "$CHECKOUT_RESPONSE" | jq '.'

# Extract checkout URL
CHECKOUT_URL=$(echo "$CHECKOUT_RESPONSE" | jq -r '.data.url')

if [ "$CHECKOUT_URL" == "null" ] || [ -z "$CHECKOUT_URL" ]; then
  echo ""
  echo "❌ Failed to create checkout session!"
  exit 1
fi

echo ""
echo "=========================================="
echo "✅ SUCCESS! Checkout Session Created"
echo "=========================================="
echo ""
echo "🔗 CHECKOUT URL:"
echo "$CHECKOUT_URL"
echo ""
echo "📋 Open this URL in your browser to complete payment"
echo "💳 Use test card: 4242 4242 4242 4242"
echo ""

# Save for reference
echo "$CHECKOUT_URL" > checkout_url.txt
echo "✅ URL saved to: checkout_url.txt"
echo ""

echo "=========================================="
echo "STEP 3: Check Payment Status (after payment)"
echo "=========================================="
echo ""
echo "Run this command after completing payment:"
echo ""
echo "curl -X GET 'http://localhost:8000/api/v1/payment/project/403f90bd-0f1f-4bde-a701-adc37ab35252/status' \\"
echo "  -H 'Authorization: Bearer $ACCESS_TOKEN'"
echo ""

