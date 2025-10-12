#!/bin/bash

# ============================================
# Audit System Test Script
# Tests Phase 4 Audit Logging Implementation
# ============================================

BASE_URL="${API_URL:-http://localhost:3000}"
COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

echo -e "${COLOR_BLUE}╔════════════════════════════════════════════╗${COLOR_RESET}"
echo -e "${COLOR_BLUE}║   Audit System Test Suite (Phase 4)       ║${COLOR_RESET}"
echo -e "${COLOR_BLUE}╚════════════════════════════════════════════╝${COLOR_RESET}"
echo ""
echo "Testing against: $BASE_URL"
echo ""

PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  
  echo -n "Testing: $name... "
  
  if [ "$method" = "POST" ]; then
    response=$(curl -s -X POST "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data" 2>&1)
  else
    response=$(curl -s -X GET "$BASE_URL$endpoint" 2>&1)
  fi
  
  if echo "$response" | grep -q "success.*true" 2>/dev/null; then
    echo -e "${COLOR_GREEN}✓ PASSED${COLOR_RESET}"
    ((PASSED++))
    return 0
  else
    echo -e "${COLOR_RED}✗ FAILED${COLOR_RESET}"
    echo "Response: $response"
    ((FAILED++))
    return 1
  fi
}

# ============================================
# Test 1: Log Audit Event
# ============================================
echo -e "\n${COLOR_YELLOW}📋 Test 1: Log Audit Event${COLOR_RESET}"

test_endpoint \
  "Log payment event" \
  "POST" \
  "/api/audit/log" \
  '{
    "eventType": "payment_created",
    "eventCategory": "payment",
    "userId": "test-user-001",
    "transactionId": "tx-test-001",
    "action": "Payment invoice created",
    "status": "success",
    "metadata": {"amount": 1000, "currency": "USDT"}
  }'

test_endpoint \
  "Log KYC event" \
  "POST" \
  "/api/audit/log" \
  '{
    "eventType": "kyc_started",
    "eventCategory": "kyc",
    "userId": "test-user-001",
    "action": "KYC verification started",
    "status": "success"
  }'

# ============================================
# Test 2: Query Audit Trails
# ============================================
echo -e "\n${COLOR_YELLOW}🔍 Test 2: Query Audit Trails${COLOR_RESET}"

test_endpoint \
  "Get user audit trail" \
  "GET" \
  "/api/audit/user/test-user-001?limit=10" \
  ""

test_endpoint \
  "Get transaction audit trail" \
  "GET" \
  "/api/audit/transaction/tx-test-001" \
  ""

# ============================================
# Test 3: Get Activity & Statistics
# ============================================
echo -e "\n${COLOR_YELLOW}📊 Test 3: Activity & Statistics${COLOR_RESET}"

test_endpoint \
  "Get recent activity" \
  "GET" \
  "/api/audit/activity/recent" \
  ""

test_endpoint \
  "Get audit statistics" \
  "GET" \
  "/api/audit/statistics?days=7" \
  ""

# ============================================
# Test 4: Get Special Views
# ============================================
echo -e "\n${COLOR_YELLOW}⚠️  Test 4: Special Views${COLOR_RESET}"

test_endpoint \
  "Get failed events" \
  "GET" \
  "/api/audit/events/failed?limit=10" \
  ""

test_endpoint \
  "Get admin actions" \
  "GET" \
  "/api/audit/actions/admin?limit=10" \
  ""

# ============================================
# Test 5: Export Functions
# ============================================
echo -e "\n${COLOR_YELLOW}💾 Test 5: Export Functions${COLOR_RESET}"

# Note: These will return file content, not JSON
echo -n "Testing: Export to CSV... "
response=$(curl -s -o /tmp/audit_test.csv -w "%{http_code}" \
  "$BASE_URL/api/audit/export/csv?limit=10")
if [ "$response" = "200" ]; then
  echo -e "${COLOR_GREEN}✓ PASSED${COLOR_RESET}"
  ((PASSED++))
else
  echo -e "${COLOR_RED}✗ FAILED${COLOR_RESET} (HTTP $response)"
  ((FAILED++))
fi

echo -n "Testing: Export to JSON... "
response=$(curl -s "$BASE_URL/api/audit/export/json?limit=10" 2>&1)
if echo "$response" | grep -q "success.*true" 2>/dev/null; then
  echo -e "${COLOR_GREEN}✓ PASSED${COLOR_RESET}"
  ((PASSED++))
else
  echo -e "${COLOR_RED}✗ FAILED${COLOR_RESET}"
  ((FAILED++))
fi

# ============================================
# Summary
# ============================================
echo -e "\n${COLOR_BLUE}╔════════════════════════════════════════════╗${COLOR_RESET}"
echo -e "${COLOR_BLUE}║              Test Summary                  ║${COLOR_RESET}"
echo -e "${COLOR_BLUE}╚════════════════════════════════════════════╝${COLOR_RESET}"
echo ""
echo -e "${COLOR_GREEN}✓ Passed: $PASSED${COLOR_RESET}"
echo -e "${COLOR_RED}✗ Failed: $FAILED${COLOR_RESET}"
echo -e "${COLOR_BLUE}  Total: $((PASSED + FAILED))${COLOR_RESET}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${COLOR_GREEN}🎉 All tests passed!${COLOR_RESET}"
  exit 0
else
  echo -e "${COLOR_RED}❌ Some tests failed. Review output above.${COLOR_RESET}"
  exit 1
fi

