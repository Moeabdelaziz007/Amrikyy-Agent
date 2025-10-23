#!/bin/bash

# Test script for Phase 2 endpoints
# Run this after starting the server

echo "🧪 Testing Phase 2 Endpoints..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000"

# Test 1: Health endpoint
echo -e "${YELLOW}Test 1: Health Check${NC}"
curl -s "$BASE_URL/api/health" | head -20
echo ""
echo ""

# Test 2: Status endpoint
echo -e "${YELLOW}Test 2: Status Check${NC}"
curl -s "$BASE_URL/api/status" | head -20
echo ""
echo ""

# Test 3: Metrics endpoint (JSON)
echo -e "${YELLOW}Test 3: Metrics (JSON)${NC}"
curl -s "$BASE_URL/api/metrics/json" | head -20
echo ""
echo ""

# Test 4: Legacy health endpoint
echo -e "${YELLOW}Test 4: Legacy Health${NC}"
curl -s "$BASE_URL/api/health-legacy" | head -20
echo ""
echo ""

echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "Note: Streaming endpoint requires authentication token"
echo "Example: curl -H 'Authorization: Bearer <token>' $BASE_URL/api/stream/travel?prompt=test"
