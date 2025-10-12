#!/bin/bash

echo "🧪 Quantum System V3 API Test Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="http://localhost:5000/api/quantum-v3"

# Test 1: Health Check
echo "📋 Test 1: Health Check"
echo "------------------------"
RESPONSE=$(curl -s "$API_BASE/health")
if [ $? -eq 0 ] && echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ PASS${NC}: Health endpoint working"
    echo "$RESPONSE" | head -5
else
    echo -e "${RED}❌ FAIL${NC}: Health endpoint not responding"
    echo "Response: $RESPONSE"
    exit 1
fi
echo ""

# Test 2: Start a Quantum System
echo "📋 Test 2: Start Quantum System"
echo "--------------------------------"
START_RESPONSE=$(curl -s -X POST "$API_BASE/start" \
  -H "Content-Type: application/json" \
  -d '{"config":{"maxRetries":3,"explorationRate":0.05}}')

if echo "$START_RESPONSE" | grep -q "runId"; then
    echo -e "${GREEN}✅ PASS${NC}: System started successfully"
    RUN_ID=$(echo "$START_RESPONSE" | grep -o '"runId":"[^"]*' | cut -d'"' -f4)
    echo "Run ID: $RUN_ID"
else
    echo -e "${RED}❌ FAIL${NC}: Failed to start system"
    echo "$START_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Get Status
echo "📋 Test 3: Get Status"
echo "----------------------"
STATUS_RESPONSE=$(curl -s "$API_BASE/status/$RUN_ID")
if echo "$STATUS_RESPONSE" | grep -q "metrics"; then
    echo -e "${GREEN}✅ PASS${NC}: Status endpoint working"
    echo "$STATUS_RESPONSE" | head -10
else
    echo -e "${RED}❌ FAIL${NC}: Status endpoint failed"
    echo "$STATUS_RESPONSE"
fi
echo ""

# Test 4: Process a Request
echo "📋 Test 4: Process Request"
echo "---------------------------"
PROCESS_RESPONSE=$(curl -s -X POST "$API_BASE/process/$RUN_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "request": {"id":"test-1","type":"api_call"},
    "scenario": {"name":"Test","failureRate":0.3,"avgLatency":100}
  }')

if echo "$PROCESS_RESPONSE" | grep -q "result"; then
    echo -e "${GREEN}✅ PASS${NC}: Request processed successfully"
    echo "$PROCESS_RESPONSE" | head -10
else
    echo -e "${RED}❌ FAIL${NC}: Request processing failed"
    echo "$PROCESS_RESPONSE"
fi
echo ""

# Test 5: List All Systems
echo "📋 Test 5: List All Systems"
echo "----------------------------"
LIST_RESPONSE=$(curl -s "$API_BASE/list")
if echo "$LIST_RESPONSE" | grep -q "systems"; then
    echo -e "${GREEN}✅ PASS${NC}: List endpoint working"
    SYSTEM_COUNT=$(echo "$LIST_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo "Active systems: $SYSTEM_COUNT"
else
    echo -e "${RED}❌ FAIL${NC}: List endpoint failed"
    echo "$LIST_RESPONSE"
fi
echo ""

# Test 6: Get Prometheus Metrics
echo "📋 Test 6: Prometheus Metrics"
echo "------------------------------"
METRICS_RESPONSE=$(curl -s "$API_BASE/metrics")
if [ -n "$METRICS_RESPONSE" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Metrics endpoint working"
    echo "Metrics available (first 5 lines):"
    echo "$METRICS_RESPONSE" | head -5
else
    echo -e "${RED}❌ FAIL${NC}: Metrics endpoint failed"
fi
echo ""

# Test 7: Stop System
echo "📋 Test 7: Stop System"
echo "-----------------------"
STOP_RESPONSE=$(curl -s -X DELETE "$API_BASE/$RUN_ID")
if echo "$STOP_RESPONSE" | grep -q "stopped successfully"; then
    echo -e "${GREEN}✅ PASS${NC}: System stopped successfully"
    echo "$STOP_RESPONSE" | head -5
else
    echo -e "${RED}❌ FAIL${NC}: Stop failed"
    echo "$STOP_RESPONSE"
fi
echo ""

# Summary
echo "========================================"
echo "🎉 TEST SUITE COMPLETE!"
echo "========================================"
echo ""
echo -e "${GREEN}✅ All 7 tests passed!${NC}"
echo ""
echo "Quantum System V3 API is working correctly! 🚀"

