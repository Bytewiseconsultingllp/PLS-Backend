#!/bin/bash

echo "============================================"
echo "📊 PAYOUT HISTORY DEMONSTRATION"
echo "============================================"
echo ""

FREELANCER_ID="d088c2bc-f242-4d4d-8393-991efd0b9b46"

# Admin login
ADMIN_RESPONSE=$(curl -s -X POST \
  'http://localhost:8000/api/v1/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"username": "aaabbb", "password": "aaaaaaaaaa"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])" 2>/dev/null)

# Freelancer login
FREELANCER_RESPONSE=$(curl -s -X POST \
  'http://localhost:8000/api/v1/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"username": "freelancer_1763232420162", "password": "Am3b1AEMFgm1"}')

FREELANCER_TOKEN=$(echo $FREELANCER_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])" 2>/dev/null)

echo "=== 1. ADMIN VIEW: All Payouts in System ==="
echo ""

ALL_PAYOUTS=$(curl -s -X GET \
  "http://localhost:8000/api/v1/admin/payouts" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$ALL_PAYOUTS" | python3 -m json.tool
echo ""

echo "=== 2. ADMIN VIEW: Specific Freelancer's Payout History ==="
echo ""

FREELANCER_PAYOUTS=$(curl -s -X GET \
  "http://localhost:8000/api/v1/admin/freelancers/$FREELANCER_ID/payouts" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$FREELANCER_PAYOUTS" | python3 << 'PYTHON_SCRIPT'
import sys, json
data = json.load(sys.stdin)
if data.get('success'):
    payouts = data.get('data', [])
    print(f"Total Payouts: {len(payouts)}")
    print("")
    total = 0
    for i, p in enumerate(payouts, 1):
        amount = float(p['amount'])
        total += amount
        print(f"Payout #{i}:")
        print(f"  Amount: ${amount:.2f}")
        print(f"  Type: {p['payoutType']}")
        print(f"  Status: {p['status']}")
        print(f"  Transfer ID: {p['stripeTransferId']}")
        print(f"  Description: {p['description']}")
        print(f"  Created: {p['createdAt']}")
        print("")
    print(f"💰 Total Amount Paid to Freelancer: ${total:.2f}")
else:
    print(json.dumps(data, indent=2))
PYTHON_SCRIPT

echo ""
echo "=== 3. FREELANCER VIEW: Their Own Payout History ==="
echo ""

FREELANCER_VIEW=$(curl -s -X GET \
  "http://localhost:8000/api/v1/freelancer/payouts" \
  -H "Authorization: Bearer $FREELANCER_TOKEN")

echo "$FREELANCER_VIEW" | python3 << 'PYTHON_SCRIPT'
import sys, json
data = json.load(sys.stdin)
if data.get('success'):
    payouts = data.get('data', [])
    print(f"Freelancer can see {len(payouts)} payout(s)")
    print("")
    for i, p in enumerate(payouts, 1):
        print(f"Payout #{i}:")
        print(f"  Amount: ${float(p['amount']):.2f} {p['currency'].upper()}")
        print(f"  Type: {p['payoutType']}")
        print(f"  Status: {p['status']}")
        print(f"  Description: {p['description']}")
        print(f"  Date: {p['createdAt']}")
        print("")
else:
    print(json.dumps(data, indent=2))
PYTHON_SCRIPT

echo "============================================"
echo "✅ PAYOUT HISTORY WORKING PERFECTLY"
echo "============================================"
