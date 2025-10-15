#!/bin/bash

# 🧪 Simple AI Agents Test - Pure Bash (No Node.js/Python needed)
# Tests Pattern Learning Agent and NanoCoordinator files

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🧪 AI AGENTS SIMPLE TEST (Bash Only)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 1: Pattern Learning Agent File Validation
echo -e "${BLUE}1️⃣  Testing Pattern Learning Agent Files...${NC}"
echo ""

PATTERN_RESULT=0
AIX_FILE="backend/agents/pattern-learning-mega-agent.aix"

# Check if AIX file exists
if [ -f "$AIX_FILE" ]; then
    echo -e "${GREEN}✓${NC} AIX file found: $AIX_FILE"
    
    # Get file size
    FILE_SIZE=$(wc -c < "$AIX_FILE")
    echo -e "${GREEN}✓${NC} File size: $FILE_SIZE bytes"
    
    # Get line count
    LINE_COUNT=$(wc -l < "$AIX_FILE")
    echo -e "${GREEN}✓${NC} Lines: $LINE_COUNT"
    
    # Check for required sections
    SECTIONS=("\$schema" "version" "genome" "meta:" "identity:" "intelligence:" "mcp_tools:" "dna_scoring:")
    FOUND=0
    
    for section in "${SECTIONS[@]}"; do
        if grep -q "$section" "$AIX_FILE"; then
            echo -e "${GREEN}✓${NC} Section found: $section"
            ((FOUND++))
        else
            echo -e "${RED}✗${NC} Section missing: $section"
        fi
    done
    
    echo ""
    echo -e "${CYAN}Validation: $FOUND/${#SECTIONS[@]} sections found${NC}"
    
    # Extract DNA score
    DNA_SCORE=$(grep -oP "total:\s*\K[\d.]+" "$AIX_FILE" | head -1)
    if [ ! -z "$DNA_SCORE" ]; then
        echo -e "${GREEN}✓${NC} DNA Score: $DNA_SCORE/100"
        
        # Check if score is high enough
        if (( $(echo "$DNA_SCORE >= 95" | bc -l) )); then
            echo -e "${GREEN}✓${NC} Rating: MEGA LEVEL ⭐⭐⭐⭐⭐"
        fi
    fi
    
    # Extract capabilities
    echo ""
    echo -e "${CYAN}Capabilities:${NC}"
    grep -oP "(pattern_recognition|topology_analysis|quantum_simulation|neural_architecture):\s*\K\d+" "$AIX_FILE" | head -4 | while read score; do
        echo -e "${GREEN}✓${NC} Capability score: $score/100"
    done
    
    # Check MCP tools
    echo ""
    echo -e "${CYAN}MCP Tools:${NC}"
    TOOLS=("pattern_analyzer" "topology_explorer" "quantum_simulator" "neural_architect" "simulation_engine")
    TOOLS_FOUND=0
    
    for tool in "${TOOLS[@]}"; do
        if grep -q "$tool" "$AIX_FILE"; then
            echo -e "${GREEN}✓${NC} Tool found: $tool"
            ((TOOLS_FOUND++))
        fi
    done
    
    echo ""
    echo -e "${CYAN}MCP Tools: $TOOLS_FOUND/${#TOOLS[@]} found${NC}"
    
    # Final result for Pattern Learning Agent
    if [ $FOUND -eq ${#SECTIONS[@]} ] && [ $TOOLS_FOUND -eq ${#TOOLS[@]} ]; then
        echo -e "${GREEN}✅ Pattern Learning Agent: ALL CHECKS PASSED${NC}"
        PATTERN_RESULT=0
    else
        echo -e "${YELLOW}⚠️  Pattern Learning Agent: PARTIAL SUCCESS${NC}"
        PATTERN_RESULT=1
    fi
else
    echo -e "${RED}✗${NC} AIX file not found: $AIX_FILE"
    PATTERN_RESULT=1
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 2: NanoCoordinator File Validation
echo -e "${BLUE}2️⃣  Testing NanoCoordinator Files...${NC}"
echo ""

NANO_RESULT=0
NANO_FILE="backend/src/nano_coordinator.py"
NANO_AIX="backend/agents/nano-coordinator.aix"

# Check Python file
if [ -f "$NANO_FILE" ]; then
    echo -e "${GREEN}✓${NC} NanoCoordinator file found: $NANO_FILE"
    
    # Get file size
    FILE_SIZE=$(wc -c < "$NANO_FILE")
    echo -e "${GREEN}✓${NC} File size: $FILE_SIZE bytes"
    
    # Get line count
    LINE_COUNT=$(wc -l < "$NANO_FILE")
    echo -e "${GREEN}✓${NC} Lines: $LINE_COUNT"
    
    # Check for key features
    FEATURES=("NanoCoordinator" "WebSocket" "quantum" "latency" "reward")
    FEATURES_FOUND=0
    
    echo ""
    echo -e "${CYAN}Key Features:${NC}"
    for feature in "${FEATURES[@]}"; do
        if grep -qi "$feature" "$NANO_FILE"; then
            echo -e "${GREEN}✓${NC} Feature found: $feature"
            ((FEATURES_FOUND++))
        fi
    done
    
    echo ""
    echo -e "${CYAN}Features: $FEATURES_FOUND/${#FEATURES[@]} found${NC}"
    
    # Check AIX file
    if [ -f "$NANO_AIX" ]; then
        echo -e "${GREEN}✓${NC} NanoCoordinator AIX found: $NANO_AIX"
        
        # Check for quantum mesh
        if grep -q "quantum-mesh" "$NANO_AIX"; then
            echo -e "${GREEN}✓${NC} Quantum mesh enabled"
        fi
        
        # Check latency target
        LATENCY=$(grep -oP "latency_target_ms:\s*\K\d+" "$NANO_AIX")
        if [ ! -z "$LATENCY" ]; then
            echo -e "${GREEN}✓${NC} Target latency: ${LATENCY}ms"
        fi
    fi
    
    # Final result for NanoCoordinator
    if [ $FEATURES_FOUND -eq ${#FEATURES[@]} ]; then
        echo -e "${GREEN}✅ NanoCoordinator: ALL CHECKS PASSED${NC}"
        NANO_RESULT=0
    else
        echo -e "${YELLOW}⚠️  NanoCoordinator: PARTIAL SUCCESS${NC}"
        NANO_RESULT=1
    fi
else
    echo -e "${RED}✗${NC} NanoCoordinator file not found: $NANO_FILE"
    NANO_RESULT=1
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 3: Nano Agents
echo -e "${BLUE}3️⃣  Testing Nano Agents...${NC}"
echo ""

AGENTS_RESULT=0
AGENT1="backend/src/nano_agents/nano_analyst.py"
AGENT2="backend/src/nano_agents/nano_researcher.py"

if [ -f "$AGENT1" ]; then
    echo -e "${GREEN}✓${NC} Nano Analyst found: $AGENT1"
    AGENTS_RESULT=0
else
    echo -e "${RED}✗${NC} Nano Analyst not found"
    AGENTS_RESULT=1
fi

if [ -f "$AGENT2" ]; then
    echo -e "${GREEN}✓${NC} Nano Researcher found: $AGENT2"
else
    echo -e "${RED}✗${NC} Nano Researcher not found"
    AGENTS_RESULT=1
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

if [ $AGENTS_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Nano Agents: PASSED${NC}"
else
    echo -e "${RED}❌ Nano Agents: FAILED${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Overall result
if [ $PATTERN_RESULT -eq 0 ] && [ $NANO_RESULT -eq 0 ] && [ $AGENTS_RESULT -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! All agent files are present and valid!${NC}"
    echo ""
    echo -e "${CYAN}📝 Note: This is a file validation test.${NC}"
    echo -e "${CYAN}   For full runtime testing, install Node.js or Python3.${NC}"
    echo ""
    exit 0
else
    echo -e "${YELLOW}⚠️  SOME TESTS FAILED! Check the results above.${NC}"
    echo ""
    exit 1
fi
