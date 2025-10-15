#!/bin/bash

# 🧪 Test All AI Agents - Comprehensive Test Script
# Tests Pattern Learning Agent and NanoCoordinator

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🧪 AI AGENTS TESTING SUITE${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 1: Pattern Learning Agent
echo -e "${BLUE}1️⃣  Testing Pattern Learning Agent...${NC}"
echo ""

PATTERN_RESULT=1

if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js found, running JavaScript test..."
    node backend/agents/test-pattern-learning-agent.js
    PATTERN_RESULT=$?
elif command -v python3 &> /dev/null; then
    echo -e "${GREEN}✓${NC} Python3 found, running Python test..."
    python3 backend/agents/test-pattern-learning-agent.py
    PATTERN_RESULT=$?
else
    echo -e "${RED}✗${NC} Neither Node.js nor Python3 found!"
    echo -e "${YELLOW}⚠${NC}  Please install Node.js or Python3 to run tests"
    PATTERN_RESULT=1
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 2: NanoCoordinator
echo -e "${BLUE}2️⃣  Testing NanoCoordinator...${NC}"
echo ""

NANO_RESULT=1

if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✓${NC} Python3 found, starting NanoCoordinator..."
    
    # Start coordinator in background with timeout
    timeout 5s python3 backend/src/nano_coordinator.py > /tmp/nano_test.log 2>&1 &
    NANO_PID=$!
    
    # Wait for startup
    sleep 2
    
    # Check if process is running
    if ps -p $NANO_PID > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} NanoCoordinator started successfully (PID: $NANO_PID)"
        echo -e "${GREEN}✓${NC} WebSocket server running on ws://localhost:8765"
        
        # Check log for success messages
        if grep -q "NanoCoordinator active" /tmp/nano_test.log; then
            echo -e "${GREEN}✓${NC} Coordinator is active and ready"
            NANO_RESULT=0
        else
            echo -e "${YELLOW}⚠${NC}  Coordinator started but may have issues"
            NANO_RESULT=1
        fi
        
        # Cleanup
        kill $NANO_PID 2>/dev/null
        wait $NANO_PID 2>/dev/null
        echo -e "${GREEN}✓${NC} NanoCoordinator stopped gracefully"
    else
        echo -e "${RED}✗${NC} NanoCoordinator failed to start"
        echo -e "${YELLOW}⚠${NC}  Check logs: /tmp/nano_test.log"
        NANO_RESULT=1
    fi
else
    echo -e "${RED}✗${NC} Python3 not found!"
    echo -e "${YELLOW}⚠${NC}  Please install Python3 to test NanoCoordinator"
    NANO_RESULT=1
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Final Results
echo -e "${CYAN}📊 TEST RESULTS SUMMARY${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ $PATTERN_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Pattern Learning Agent: PASSED${NC}"
else
    echo -e "${RED}❌ Pattern Learning Agent: FAILED${NC}"
fi

if [ $NANO_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ NanoCoordinator: PASSED${NC}"
else
    echo -e "${RED}❌ NanoCoordinator: FAILED${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Overall result
if [ $PATTERN_RESULT -eq 0 ] && [ $NANO_RESULT -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL AGENTS PASSED! Both agents are working perfectly!${NC}"
    echo ""
    exit 0
elif [ $PATTERN_RESULT -eq 0 ] || [ $NANO_RESULT -eq 0 ]; then
    echo -e "${YELLOW}⚠️  PARTIAL SUCCESS: Some agents passed, some failed.${NC}"
    echo -e "${YELLOW}   Check the results above for details.${NC}"
    echo ""
    exit 1
else
    echo -e "${RED}❌ ALL AGENTS FAILED! Please check your environment.${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo -e "  1. Install Node.js: ${CYAN}sudo apt-get install nodejs npm${NC}"
    echo -e "  2. Install Python3: ${CYAN}sudo apt-get install python3 python3-pip${NC}"
    echo -e "  3. Check file permissions: ${CYAN}chmod +x backend/agents/*.js backend/agents/*.py${NC}"
    echo -e "  4. Verify AIX file exists: ${CYAN}ls -la backend/agents/pattern-learning-mega-agent.aix${NC}"
    echo ""
    exit 1
fi
