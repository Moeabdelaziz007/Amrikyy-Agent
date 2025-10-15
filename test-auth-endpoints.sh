#!/bin/bash

# Test Auth Endpoints
# Tests all authentication endpoints for Amrikyy Travel Agent

BASE_URL="http://localhost:5000/api/auth"
TEST_EMAIL="test_$(date +%s)@amrikyy.com"
TEST_PASSWORD="TestPass123!"
TEST_NAME="Test User"

echo "🔐 Testing Amrikyy Auth Endpoints"
echo "=================================="
echo ""
echo "Base URL: $BASE_URL"
echo "Test Email: $TEST_EMAIL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Signup
echo "📝 Test 1: User Signup"
echo "----------------------"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"fullName\": \"$TEST_NAME\"
  }")

echo "$SIGNUP_RESPONSE" | jq '.'

if echo "$SIGNUP_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Signup successful${NC}"
  ACCESS_TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.session.access_token // empty')
  REFRESH_TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.session.refresh_token // empty')
else
  echo -e "${RED}❌ Signup failed${NC}"
fi
echo ""

# Test 2: Login
echo "🔑 Test 2: User Login"
echo "---------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "$LOGIN_RESPONSE" | jq '.'

if echo "$LOGIN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Login successful${NC}"
  ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.session.access_token')
  REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.session.refresh_token')
else
  echo -e "${RED}❌ Login failed${NC}"
fi
echo ""

# Test 3: Get Current User
if [ ! -z "$ACCESS_TOKEN" ]; then
  echo "👤 Test 3: Get Current User"
  echo "---------------------------"
  ME_RESPONSE=$(curl -s -X GET "$BASE_URL/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

  echo "$ME_RESPONSE" | jq '.'

  if echo "$ME_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Get user successful${NC}"
  else
    echo -e "${RED}❌ Get user failed${NC}"
  fi
  echo ""
fi

# Test 4: Refresh Token
if [ ! -z "$REFRESH_TOKEN" ]; then
  echo "🔄 Test 4: Refresh Access Token"
  echo "-------------------------------"
  REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/refresh-token" \
    -H "Content-Type: application/json" \
    -d "{
      \"refresh_token\": \"$REFRESH_TOKEN\"
    }")

  echo "$REFRESH_RESPONSE" | jq '.'

  if echo "$REFRESH_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Token refresh successful${NC}"
    NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.session.access_token')
  else
    echo -e "${RED}❌ Token refresh failed${NC}"
  fi
  echo ""
fi

# Test 5: Forgot Password
echo "📧 Test 5: Forgot Password"
echo "--------------------------"
FORGOT_RESPONSE=$(curl -s -X POST "$BASE_URL/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\"
  }")

echo "$FORGOT_RESPONSE" | jq '.'

if echo "$FORGOT_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Forgot password request successful${NC}"
else
  echo -e "${RED}❌ Forgot password request failed${NC}"
fi
echo ""

# Test 6: Logout
if [ ! -z "$ACCESS_TOKEN" ]; then
  echo "🚪 Test 6: User Logout"
  echo "----------------------"
  LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/logout" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

  echo "$LOGOUT_RESPONSE" | jq '.'

  if echo "$LOGOUT_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Logout successful${NC}"
  else
    echo -e "${RED}❌ Logout failed${NC}"
  fi
  echo ""
fi

# Test 7: Invalid Login
echo "🚫 Test 7: Invalid Login (Should Fail)"
echo "--------------------------------------"
INVALID_LOGIN=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"invalid@test.com\",
    \"password\": \"wrongpassword\"
  }")

echo "$INVALID_LOGIN" | jq '.'

if echo "$INVALID_LOGIN" | jq -e '.success == false' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Invalid login correctly rejected${NC}"
else
  echo -e "${RED}❌ Invalid login should have failed${NC}"
fi
echo ""

# Summary
echo "=================================="
echo "📊 Test Summary"
echo "=================================="
echo ""
echo "All auth endpoints have been tested."
echo "Check the responses above for details."
echo ""
echo "Available Endpoints:"
echo "  POST   /api/auth/signup"
echo "  POST   /api/auth/login"
echo "  POST   /api/auth/logout"
echo "  POST   /api/auth/refresh-token"
echo "  POST   /api/auth/forgot-password"
echo "  POST   /api/auth/reset-password"
echo "  POST   /api/auth/verify-email"
echo "  GET    /api/auth/me"
echo ""
