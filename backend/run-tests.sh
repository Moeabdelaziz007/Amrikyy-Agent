#!/bin/bash

# Test Runner Script
# Runs all tests with proper configuration

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         AMRIKYY TRAVEL AGENT - TEST SUITE                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "Please install Node.js to run tests"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    echo "Please install npm to run tests"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed${NC}"
    echo "Installing dependencies..."
    npm install
fi

echo -e "${BLUE}🧪 Running Test Suite...${NC}"
echo ""

# Run structure tests (no dependencies required)
echo -e "${BLUE}📋 Test 1: Structure Validation${NC}"
node test-agents-simple.js
STRUCTURE_EXIT=$?

if [ $STRUCTURE_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ Structure tests passed${NC}"
else
    echo -e "${RED}❌ Structure tests failed${NC}"
fi

echo ""

# Run Jest tests if available
if command -v jest &> /dev/null || [ -f "node_modules/.bin/jest" ]; then
    echo -e "${BLUE}📋 Test 2: Unit & Integration Tests${NC}"
    npm test
    JEST_EXIT=$?
    
    if [ $JEST_EXIT -eq 0 ]; then
        echo -e "${GREEN}✅ Jest tests passed${NC}"
    else
        echo -e "${RED}❌ Jest tests failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Jest not available, skipping unit tests${NC}"
    JEST_EXIT=0
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Summary
if [ $STRUCTURE_EXIT -eq 0 ] && [ $JEST_EXIT -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed${NC}"
    exit 1
fi
