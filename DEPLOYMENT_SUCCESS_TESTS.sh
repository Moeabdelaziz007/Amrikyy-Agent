#!/bin/bash

# ============================================
# AMRIKYY-AGENT MVP - Production Tests
# Run after deployment to verify everything works
# ============================================

echo "🧪 Testing Amrikyy-Agent MVP in Production"
echo "=========================================="
echo ""

# Get URL from user
read -p "Enter your Railway URL (e.g., https://amrikyy-production.up.railway.app): " BASE_URL

if [ -z "$BASE_URL" ]; then
    echo "❌ Error: URL is required"
    exit 1
fi

echo ""
echo "Testing URL: $BASE_URL"
echo ""

# Test 1: Health Check
echo "Test 1/5: Health Check..."
HEALTH=$(curl -s "$BASE_URL/health" | jq -r '.status // empty')
if [ "$HEALTH" = "UP" ]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
fi
echo ""

# Test 2: MCP Tools Count
echo "Test 2/5: MCP Tools..."
TOOLS_COUNT=$(curl -s "$BASE_URL/api/mcp/tools" | jq -r '.count // 0')
if [ "$TOOLS_COUNT" -eq 11 ]; then
    echo "✅ MCP Tools: $TOOLS_COUNT/11"
else
    echo "⚠️  MCP Tools: $TOOLS_COUNT/11 (expected 11)"
fi
echo ""

# Test 3: Agency Status
echo "Test 3/5: Agent Manager..."
AGENCY_STATUS=$(curl -s "$BASE_URL/api/agency/status" | jq -r '.success // false')
if [ "$AGENCY_STATUS" = "true" ]; then
    echo "✅ Agent Manager working"
else
    echo "⚠️  Agent Manager check failed"
fi
echo ""

# Test 4: Creative Agent Status
echo "Test 4/5: Creative Agent..."
CREATIVE_STATUS=$(curl -s "$BASE_URL/api/creative-agent/status" | jq -r '.success // false')
if [ "$CREATIVE_STATUS" = "true" ]; then
    echo "✅ Creative Agent running"
else
    echo "⚠️  Creative Agent check failed"
fi
echo ""

# Test 5: Generate Ideas (may take 30-60 seconds)
echo "Test 5/5: Generate Ideas (this may take 30-60 seconds)..."
IDEAS_GENERATED=$(curl -s -X POST "$BASE_URL/api/creative-agent/run" | jq -r '.data.ideasGenerated // 0')
if [ "$IDEAS_GENERATED" -gt 0 ]; then
    echo "✅ Ideas generated: $IDEAS_GENERATED"
    echo "🎉 CREATIVE AGENT IS WORKING!"
else
    echo "⚠️  No ideas generated (check logs)"
fi
echo ""

# Summary
echo "=========================================="
echo "🏆 DEPLOYMENT TEST SUMMARY"
echo "=========================================="
echo "Health:           $([[ $HEALTH == "UP" ]] && echo "✅" || echo "❌")"
echo "MCP Tools:        $TOOLS_COUNT/11"
echo "Agent Manager:    $([[ $AGENCY_STATUS == "true" ]] && echo "✅" || echo "❌")"
echo "Creative Agent:   $([[ $CREATIVE_STATUS == "true" ]] && echo "✅" || echo "❌")"
echo "Ideas Generated:  $IDEAS_GENERATED"
echo ""

if [[ $HEALTH == "UP" ]] && [[ $TOOLS_COUNT -eq 11 ]] && [[ $CREATIVE_STATUS == "true" ]]; then
    echo "🎉🎉🎉 MVP IS FULLY OPERATIONAL! 🎉🎉🎉"
else
    echo "⚠️  Some checks failed - review logs on Railway"
fi
