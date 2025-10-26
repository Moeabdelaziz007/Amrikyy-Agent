#!/bin/bash

# Test Streaming Cancelation Logic
# Tests that LLM requests are properly canceled when client disconnects

echo "🧪 Testing Streaming Cancelation Logic"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000"
TOKEN="test-token-123" # Replace with actual token

# Test 1: Normal streaming completion
echo -e "${BLUE}Test 1: Normal Streaming (Complete)${NC}"
echo "Starting stream request..."
timeout 10 curl -N -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/stream/travel?prompt=Quick test" \
  2>/dev/null | head -20

echo ""
echo -e "${GREEN}✅ Test 1 Complete${NC}"
echo ""

# Test 2: Client disconnect (cancelation)
echo -e "${BLUE}Test 2: Client Disconnect (Cancelation Test)${NC}"
echo "Starting stream request and disconnecting after 2 seconds..."

# Start stream in background
timeout 2 curl -N -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/stream/travel?prompt=Plan a detailed trip to Paris with multiple stops" \
  2>/dev/null &

CURL_PID=$!
echo "Stream PID: $CURL_PID"

# Wait 2 seconds
sleep 2

# Kill the curl process (simulate client disconnect)
echo "Simulating client disconnect..."
kill $CURL_PID 2>/dev/null

# Wait a bit for cleanup
sleep 1

echo ""
echo -e "${YELLOW}⚠️  Check backend logs for:${NC}"
echo "  - 'Client disconnected: <streamId>'"
echo "  - 'Stream canceled during generation'"
echo "  - 'Estimated cost saved by cancelation'"
echo ""
echo -e "${GREEN}✅ Test 2 Complete${NC}"
echo ""

# Test 3: Multiple concurrent streams
echo -e "${BLUE}Test 3: Multiple Concurrent Streams${NC}"
echo "Starting 3 concurrent streams..."

for i in {1..3}; do
  timeout 3 curl -N -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/stream/travel?prompt=Test $i" \
    2>/dev/null > /dev/null &
  echo "Started stream $i (PID: $!)"
done

echo "Waiting 3 seconds..."
sleep 3

echo ""
echo -e "${GREEN}✅ Test 3 Complete${NC}"
echo ""

# Test 4: Check streaming stats
echo -e "${BLUE}Test 4: Streaming Statistics${NC}"
echo "Fetching streaming stats..."

curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/stream/stats" | jq '.' 2>/dev/null || \
  curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/stream/stats"

echo ""
echo -e "${GREEN}✅ Test 4 Complete${NC}"
echo ""

# Test 5: Check metrics
echo -e "${BLUE}Test 5: Metrics Check${NC}"
echo "Fetching metrics..."

curl -s "$BASE_URL/api/metrics/json" | jq '.metrics[] | select(.name | contains("stream"))' 2>/dev/null || \
  echo "Metrics endpoint not available or jq not installed"

echo ""
echo -e "${GREEN}✅ Test 5 Complete${NC}"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 All Tests Complete!${NC}"
echo ""
echo "Expected Results:"
echo "  ✅ Normal streams complete successfully"
echo "  ✅ Canceled streams stop LLM generation"
echo "  ✅ Cost savings are tracked"
echo "  ✅ Stats show cancelation rate"
echo "  ✅ Metrics show stream events"
echo ""
echo "Check backend logs for detailed cancelation messages!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
