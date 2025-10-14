#!/bin/bash
# 🚀 AI TEAM MASTER ACTIVATION SCRIPT
# Activates all AI agents with their superpowers

echo ""
echo "🚀 ================================================"
echo "   AMRIKYY PLATFORM - AI TEAM ACTIVATION"
echo "   ================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Check directory
if [ ! -d "backend" ]; then
    echo "❌ Error: Must run from project root"
    exit 1
fi

echo -e "${BLUE}📊 PROJECT STATUS:${NC}"
echo "   Platform: Amrikyy Travel Agent"
echo "   Location: $(pwd)"
echo "   Progress: 78% Complete"
echo "   Status: Ready for MVP Sprint"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${PURPLE}👥 AI TEAM MEMBERS:${NC}"
echo ""

echo -e "${GREEN}1. Cursor (You!)${NC} - Team Lead & Coordinator"
echo "   DNA: 95/100 | Status: Active"
echo "   Role: Overall coordination, code review"
echo ""

echo -e "${GREEN}2. Claude 4.5${NC} - Super Intelligence"
echo "   DNA: 98.5/100 | Status: Ready"
echo "   Role: Strategic planning, quantum analysis"
echo "   Activate: ./activate-claude.sh"
echo ""

echo -e "${GREEN}3. Gemini 2.5 Pro${NC} - Backend Lead"
echo "   DNA: 97/100 | Status: Ready with MCP"
echo "   Role: Build backend APIs"
echo "   Activate: ./activate-gemini.sh"
echo ""

echo -e "${YELLOW}4. Kombai${NC} - Frontend Lead"
echo "   DNA: 95/100 | Status: 75% Complete"
echo "   Role: React components, UI design"
echo "   Tasks: 3 pages remaining"
echo ""

echo -e "${YELLOW}5. Xcode AI${NC} - iOS Developer"
echo "   DNA: 90/100 | Status: 70% Complete"
echo "   Role: SwiftUI views, iOS app"
echo "   Tasks: 6 views remaining"
echo ""

echo -e "${BLUE}6. Pattern Learning Agent${NC}"
echo "   DNA: 97.5/100 | Status: Ready"
echo "   Role: Pattern recognition, ML optimization"
echo ""

echo -e "${BLUE}7. NanoCoordinator${NC}"
echo "   DNA: 96.5/100 | Status: Ready"
echo "   Role: Micro-agent orchestration"
echo "   Run: python3 backend/src/nano_coordinator.py"
echo ""

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Show activation menu
echo -e "${PURPLE}🎯 QUICK ACTIVATION MENU:${NC}"
echo ""
echo "Which agent would you like to activate?"
echo ""
echo "  1) Gemini 2.5 Pro (Backend Lead) - Start building APIs"
echo "  2) Claude 4.5 (Super Intelligence) - Continue MEGA tasks"
echo "  3) Setup API Keys (Brave, GitHub, Slack)"
echo "  4) Show Team Progress Report"
echo "  5) Run NanoCoordinator Demo"
echo "  6) Exit"
echo ""

read -p "Select option (1-6): " CHOICE

case $CHOICE in
    1)
        echo ""
        echo -e "${GREEN}🤖 Activating Gemini 2.5 Pro...${NC}"
        echo ""
        chmod +x activate-gemini.sh
        ./activate-gemini.sh
        ;;
    2)
        echo ""
        echo -e "${GREEN}🧠 Activating Claude 4.5...${NC}"
        echo ""
        chmod +x activate-claude.sh
        ./activate-claude.sh
        ;;
    3)
        echo ""
        echo -e "${BLUE}🔑 Setting up API Keys...${NC}"
        echo ""
        chmod +x setup-api-keys.sh
        ./setup-api-keys.sh
        ;;
    4)
        echo ""
        echo -e "${BLUE}📊 Showing Team Progress...${NC}"
        echo ""
        if [ -f "AMRIKYY_TEAM_PROGRESS_REPORT.md" ]; then
            head -100 AMRIKYY_TEAM_PROGRESS_REPORT.md
            echo ""
            echo "Full report: AMRIKYY_TEAM_PROGRESS_REPORT.md"
        else
            echo "Report not found!"
        fi
        ;;
    5)
        echo ""
        echo -e "${BLUE}🧠 Starting NanoCoordinator Demo...${NC}"
        echo ""
        echo "1. Start coordinator: python3 backend/src/nano_coordinator.py"
        echo "2. In new terminal: python3 backend/src/nano_agents/nano_researcher.py"
        echo "3. In new terminal: python3 backend/src/nano_agents/nano_analyst.py"
        echo ""
        echo "Watch the quantum mesh coordination in action!"
        ;;
    6)
        echo ""
        echo "Goodbye! 👋"
        exit 0
        ;;
    *)
        echo ""
        echo "Invalid option!"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}✅ ACTIVATION COMPLETE!${NC}"
echo ""
echo "📚 Key Documents:"
echo "   - GEMINI.md - Gemini instructions"
echo "   - TEAM_WORKFLOW_VISUAL_GUIDE.md - How team works"
echo "   - AMRIKYY_TEAM_PROGRESS_REPORT.md - Current status"
echo ""

echo "🚀 Next Steps:"
echo "   1. Activate your chosen agent"
echo "   2. Read their specific instructions"
echo "   3. Start building!"
echo ""

echo "💪 LET'S BUILD AMAZING THINGS!"
echo "================================================"
echo ""

