#!/bin/bash

echo "🚀 Testing User Registration with cURL..."
echo ""

# Registration data
USERNAME="testuser456"
FULLNAME="Test User Two"
EMAIL="ztbhgt@mailinator.com"
PASSWORD="password123"

echo "📝 Registration Data:"
echo "   Username: $USERNAME"
echo "   Full Name: $FULLNAME"
echo "   Email: $EMAIL"
echo "   Password: $PASSWORD"
echo ""

echo "🌐 Sending registration request..."
echo ""

# Make the curl request
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"fullName\": \"$FULLNAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }" \
  -w "\n\n📊 HTTP Status: %{http_code}\n⏱️  Response Time: %{time_total}s\n" \
  -s | jq '.' 2>/dev/null || cat

echo ""
echo "✅ Registration request completed!"


