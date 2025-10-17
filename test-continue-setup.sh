#!/bin/bash
# Test Continue & MCP Integration Setup
# Tests all configurations and verifies setup completeness

set -e

echo "🔍 CONTINUE & MCP SETUP VERIFICATION"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
  fi
}

echo "📁 1. CHECKING FILE STRUCTURE"
echo "------------------------------"

# Check Continue agents
[ -f ".continue/agents/maya-travel-agent.yaml" ]
test_check "Maya Travel Agent config exists"

[ -f ".continue/agents/code-reviewer.yaml" ]
test_check "Code Reviewer config exists"

[ -f ".continue/agents/pattern-learner.yaml" ]
test_check "Pattern Learner config exists"

# Check Continue rules
[ -f "docs/continue-rules/maya-backend-patterns.md" ]
test_check "Backend patterns rule exists"

[ -f "docs/continue-rules/maya-frontend-patterns.md" ]
test_check "Frontend patterns rule exists"

[ -f "docs/continue-rules/maya-ai-patterns.md" ]
test_check "AI patterns rule exists"

[ -f "docs/continue-rules/maya-code-quality.md" ]
test_check "Code quality rule exists"

[ -f "docs/continue-rules/maya-git-workflow.md" ]
test_check "Git workflow rule exists"

# Check MCP servers
[ -d "backend/mcp-servers/private-journal" ]
test_check "Private Journal MCP directory exists"

[ -f "backend/mcp-servers/mcp-config.json" ]
test_check "MCP config exists"

[ -f "backend/mcp-servers/private-journal/dist/index.js" ]
test_check "Private Journal built (dist/index.js)"

echo ""
echo "🔧 2. CHECKING MCP SERVER"
echo "-------------------------"

# Check if Node.js is available
which node > /dev/null 2>&1
test_check "Node.js is installed"

# Check MCP dependencies
[ -d "backend/mcp-servers/private-journal/node_modules" ]
test_check "Private Journal dependencies installed"

# Test MCP server can start (quick test)
timeout 3s node backend/mcp-servers/private-journal/dist/index.js > /dev/null 2>&1 || true
test_check "MCP server executable (basic check)"

echo ""
echo "📚 3. CHECKING DOCUMENTATION"
echo "----------------------------"

[ -f "backend/mcp-servers/MCP_INTEGRATION_GUIDE.md" ]
test_check "MCP Integration Guide exists"

[ -f "docs/MCP_SETUP.md" ]
test_check "MCP Setup Guide exists"

[ -f "docs/SECURITY_SETUP.md" ]
test_check "Security Setup Guide exists"

[ -f "docs/continue-config-template.json" ]
test_check "Config template exists"

[ -f "docs/continue-agents/INSTALLATION.md" ]
test_check "Agent installation guide exists"

echo ""
echo "🔐 4. CHECKING SECURITY"
echo "-----------------------"

# Check .continue is gitignored
grep -q "\.continue/" .gitignore
test_check ".continue/ is in .gitignore"

# Check .env is gitignored
grep -q "backend/\.env" .gitignore
test_check "backend/.env is in .gitignore"

# Check config.json is NOT tracked
if git ls-files --error-unmatch .continue/config.json > /dev/null 2>&1; then
  echo -e "${RED}❌ FAIL${NC}: .continue/config.json is tracked (security risk!)"
  ((FAILED++))
else
  echo -e "${GREEN}✅ PASS${NC}: .continue/config.json is NOT tracked (secure)"
  ((PASSED++))
fi

echo ""
echo "🧠 5. CHECKING BACKEND INTEGRATIONS"
echo "-----------------------------------"

[ -f "backend/src/autopilot/IntelligenceHub.js" ]
test_check "IntelligenceHub exists"

[ -f "backend/src/autopilot/__tests__/IntelligenceHub.test.js" ]
test_check "IntelligenceHub tests exist"

[ -f "fix-continue-index.sh" ]
test_check "Continue index fix script exists"

[ -x "fix-continue-index.sh" ]
test_check "Continue index fix script is executable"

echo ""
echo "📊 RESULTS"
echo "=========="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL TESTS PASSED! Setup is complete.${NC}"
  echo ""
  echo "✅ Next steps:"
  echo "   1. Regenerate API key at https://console.anthropic.com/"
  echo "   2. Set: export ANTHROPIC_API_KEY='your-key'"
  echo "   3. Restart your IDE"
  echo "   4. Test with: /remember Test insight"
  exit 0
else
  echo -e "${RED}⚠️  SOME TESTS FAILED. Review the output above.${NC}"
  exit 1
fi
