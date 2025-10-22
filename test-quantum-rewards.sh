#!/bin/bash

# Test Quantum Reward Engine Endpoints
# Tests all reward system endpoints

BASE_URL="http://localhost:5000/api/rewards"

echo "🌌 Testing Quantum Reward Engine"
echo "================================="
echo ""
echo "Base URL: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${BLUE}Test 1: System Health Check${NC}"
echo "----------------------------"
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health")
echo "$HEALTH_RESPONSE" | jq '.'

if echo "$HEALTH_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Health check successful${NC}"
else
  echo -e "${RED}❌ Health check failed${NC}"
fi
echo ""

# Test 2: Get System Metrics
echo -e "${BLUE}Test 2: Get System Metrics${NC}"
echo "---------------------------"
METRICS_RESPONSE=$(curl -s "$BASE_URL/metrics")
echo "$METRICS_RESPONSE" | jq '.'

if echo "$METRICS_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Metrics retrieved successfully${NC}"
  TOTAL_AGENTS=$(echo "$METRICS_RESPONSE" | jq '.data.agents | length')
  GLOBAL_COHERENCE=$(echo "$METRICS_RESPONSE" | jq '.data.quantum.globalCoherence')
  echo -e "${YELLOW}📊 Total Agents: $TOTAL_AGENTS${NC}"
  echo -e "${YELLOW}🧠 Global Coherence: $GLOBAL_COHERENCE%${NC}"
else
  echo -e "${RED}❌ Failed to retrieve metrics${NC}"
fi
echo ""

# Test 3: Get Specific Agent (Luna)
echo -e "${BLUE}Test 3: Get Agent State (Luna)${NC}"
echo "-------------------------------"
AGENT_RESPONSE=$(curl -s "$BASE_URL/agent/luna")
echo "$AGENT_RESPONSE" | jq '.'

if echo "$AGENT_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Agent state retrieved${NC}"
  AGENT_ENERGY=$(echo "$AGENT_RESPONSE" | jq '.data.energy')
  AGENT_REWARDS=$(echo "$AGENT_RESPONSE" | jq '.data.rewards')
  echo -e "${YELLOW}⚡ Energy: $AGENT_ENERGY${NC}"
  echo -e "${YELLOW}🏆 Rewards: $AGENT_REWARDS${NC}"
else
  echo -e "${RED}❌ Failed to retrieve agent state${NC}"
fi
echo ""

# Test 4: Process Interaction
echo -e "${BLUE}Test 4: Process Agent Interaction${NC}"
echo "----------------------------------"
PROCESS_RESPONSE=$(curl -s -X POST "$BASE_URL/process" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "luna",
    "action": {
      "type": "create_itinerary",
      "destination": "Paris",
      "duration": 7
    },
    "result": {
      "accuracy": 0.95,
      "responseTime": 1500,
      "userRating": 5,
      "tokensUsed": 800
    },
    "context": {
      "userId": "test_user",
      "sessionId": "test_session"
    },
    "collaboratingAgents": ["karim", "layla"]
  }')

echo "$PROCESS_RESPONSE" | jq '.'

if echo "$PROCESS_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Interaction processed successfully${NC}"
  REWARD=$(echo "$PROCESS_RESPONSE" | jq '.data.reward')
  NEW_ENERGY=$(echo "$PROCESS_RESPONSE" | jq '.data.agentState.energy')
  echo -e "${YELLOW}🎯 Reward Earned: $REWARD points${NC}"
  echo -e "${YELLOW}⚡ New Energy: $NEW_ENERGY${NC}"
else
  echo -e "${RED}❌ Failed to process interaction${NC}"
fi
echo ""

# Test 5: Get Agent Recommendations
echo -e "${BLUE}Test 5: Get Agent Recommendations${NC}"
echo "----------------------------------"
RECOMMEND_RESPONSE=$(curl -s -X POST "$BASE_URL/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "taskType": "trip_planning",
    "taskContext": {
      "requiredCapabilities": ["itinerary_creation", "route_optimization"],
      "complexity": "high"
    }
  }')

echo "$RECOMMEND_RESPONSE" | jq '.'

if echo "$RECOMMEND_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Recommendations retrieved${NC}"
  RECOMMENDED_COUNT=$(echo "$RECOMMEND_RESPONSE" | jq '.data | length')
  echo -e "${YELLOW}👥 Recommended Agents: $RECOMMENDED_COUNT${NC}"
else
  echo -e "${RED}❌ Failed to get recommendations${NC}"
fi
echo ""

# Test 6: Process Multiple Interactions
echo -e "${BLUE}Test 6: Process Multiple Interactions${NC}"
echo "--------------------------------------"

AGENTS=("karim" "layla" "scout")
for agent in "${AGENTS[@]}"; do
  echo "Processing interaction for $agent..."
  MULTI_RESPONSE=$(curl -s -X POST "$BASE_URL/process" \
    -H "Content-Type: application/json" \
    -d "{
      \"agentId\": \"$agent\",
      \"action\": {
        \"type\": \"assist_user\",
        \"task\": \"test_task\"
      },
      \"result\": {
        \"accuracy\": 0.85,
        \"responseTime\": 2000,
        \"userRating\": 4,
        \"tokensUsed\": 900
      },
      \"context\": {
        \"userId\": \"test_user\"
      }
    }")
  
  if echo "$MULTI_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    REWARD=$(echo "$MULTI_RESPONSE" | jq '.data.reward')
    echo -e "${GREEN}✅ $agent: $REWARD points${NC}"
  else
    echo -e "${RED}❌ $agent: Failed${NC}"
  fi
done
echo ""

# Test 7: Final System State
echo -e "${BLUE}Test 7: Final System State${NC}"
echo "---------------------------"
FINAL_METRICS=$(curl -s "$BASE_URL/metrics")

echo "Agent Leaderboard:"
echo "$FINAL_METRICS" | jq -r '.data.agents | sort_by(-.rewards) | .[] | "\(.name): \(.rewards) points (Energy: \(.energy), Coherence: \(.coherence))"'
echo ""

FINAL_COHERENCE=$(echo "$FINAL_METRICS" | jq '.data.quantum.globalCoherence')
FINAL_ENTANGLEMENT=$(echo "$FINAL_METRICS" | jq '.data.quantum.entanglementStrength')
TOTAL_REWARDS=$(echo "$FINAL_METRICS" | jq '.data.totalRewards')

echo -e "${YELLOW}📊 Final Statistics:${NC}"
echo -e "${YELLOW}   Global Coherence: $FINAL_COHERENCE%${NC}"
echo -e "${YELLOW}   Entanglement Strength: $FINAL_ENTANGLEMENT${NC}"
echo -e "${YELLOW}   Total Rewards: $TOTAL_REWARDS points${NC}"
echo ""

# Test 8: Invalid Agent Test
echo -e "${BLUE}Test 8: Invalid Agent (Should Fail)${NC}"
echo "------------------------------------"
INVALID_RESPONSE=$(curl -s "$BASE_URL/agent/invalid_agent")

if echo "$INVALID_RESPONSE" | jq -e '.success == false' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Invalid agent correctly rejected${NC}"
else
  echo -e "${RED}❌ Invalid agent should have failed${NC}"
fi
echo ""

# Summary
echo "================================="
echo -e "${BLUE}📊 Test Summary${NC}"
echo "================================="
echo ""
echo "All quantum reward engine endpoints have been tested."
echo ""
echo "Available Endpoints:"
echo "  GET    /api/rewards/health"
echo "  GET    /api/rewards/metrics"
echo "  GET    /api/rewards/agent/:agentId"
echo "  POST   /api/rewards/process"
echo "  POST   /api/rewards/recommend"
echo ""
echo -e "${GREEN}✅ Testing Complete!${NC}"
echo ""
