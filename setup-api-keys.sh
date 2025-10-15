#!/bin/bash
# 🔑 API KEYS SETUP SCRIPT
# Smart setup for all API keys needed by Gemini MCP

echo "🔑 ============================================="
echo "   API KEYS SETUP FOR GEMINI MCP SERVERS"
echo "   ============================================="
echo ""

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if settings file exists
SETTINGS_FILE="$HOME/.gemini/settings.json"

if [ ! -f "$SETTINGS_FILE" ]; then
    echo -e "${RED}❌ Error: $SETTINGS_FILE not found!${NC}"
    echo "   Creating directory and file..."
    mkdir -p "$HOME/.gemini"
    echo "✅ Created ~/.gemini directory"
fi

echo -e "${BLUE}📊 CURRENT API KEY STATUS:${NC}"
echo ""

# Check GitHub token
if grep -q "ghp_" "$SETTINGS_FILE" 2>/dev/null; then
    echo -e "${GREEN}✅ GitHub Token: CONFIGURED${NC}"
else
    echo -e "${YELLOW}⏳ GitHub Token: NOT SET${NC}"
fi

# Check Brave API
if grep -q "BRAVE_API_KEY.*BSA" "$SETTINGS_FILE" 2>/dev/null; then
    echo -e "${GREEN}✅ Brave Search API: CONFIGURED${NC}"
else
    echo -e "${YELLOW}⏳ Brave Search API: NOT SET${NC}"
fi

# Check Slack
if grep -q "xoxb-" "$SETTINGS_FILE" 2>/dev/null; then
    echo -e "${GREEN}✅ Slack Bot Token: CONFIGURED${NC}"
else
    echo -e "${YELLOW}⏳ Slack Bot Token: NOT SET (OPTIONAL)${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Interactive setup
echo "Would you like to configure API keys now? (y/n)"
read -p "> " SETUP

if [ "$SETUP" != "y" ] && [ "$SETUP" != "Y" ]; then
    echo ""
    echo "Setup cancelled. You can run this script again later."
    echo ""
    echo "Quick Links:"
    echo "  GitHub Token: https://github.com/settings/tokens"
    echo "  Brave API: https://brave.com/search/api/"
    echo "  Slack: https://api.slack.com/apps"
    exit 0
fi

echo ""
echo -e "${BLUE}🚀 INTERACTIVE API KEY SETUP${NC}"
echo ""

# GitHub Token Setup
echo -e "${YELLOW}1️⃣ GitHub Personal Access Token${NC}"
echo "   Get it from: https://github.com/settings/tokens"
echo "   Required permissions: repo, workflow"
echo ""
read -p "Enter GitHub token (ghp_...): " GITHUB_TOKEN

if [ ! -z "$GITHUB_TOKEN" ]; then
    # Update settings file
    if [ -f "$SETTINGS_FILE" ]; then
        # Backup current file
        cp "$SETTINGS_FILE" "$SETTINGS_FILE.backup"
        
        # Replace token using sed (Mac compatible)
        sed -i '' "s|\"GITHUB_PERSONAL_ACCESS_TOKEN\": \".*\"|\"GITHUB_PERSONAL_ACCESS_TOKEN\": \"$GITHUB_TOKEN\"|g" "$SETTINGS_FILE"
        
        echo -e "${GREEN}✅ GitHub token saved!${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipped GitHub token${NC}"
fi

echo ""

# Brave API Setup
echo -e "${YELLOW}2️⃣ Brave Search API Key${NC}"
echo "   Get it from: https://brave.com/search/api/"
echo "   Free tier: 2,000 queries/month"
echo ""
read -p "Enter Brave API key (BSA...): " BRAVE_KEY

if [ ! -z "$BRAVE_KEY" ]; then
    if [ -f "$SETTINGS_FILE" ]; then
        sed -i '' "s|\"BRAVE_API_KEY\": \".*\"|\"BRAVE_API_KEY\": \"$BRAVE_KEY\"|g" "$SETTINGS_FILE"
        echo -e "${GREEN}✅ Brave API key saved!${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipped Brave API key${NC}"
fi

echo ""

# Slack Setup (Optional)
echo -e "${YELLOW}3️⃣ Slack Bot Token (OPTIONAL)${NC}"
echo "   Get it from: https://api.slack.com/apps"
echo "   For team notifications"
echo ""
read -p "Enter Slack Bot Token (xoxb-...) or press Enter to skip: " SLACK_TOKEN

if [ ! -z "$SLACK_TOKEN" ]; then
    if [ -f "$SETTINGS_FILE" ]; then
        sed -i '' "s|\"SLACK_BOT_TOKEN\": \".*\"|\"SLACK_BOT_TOKEN\": \"$SLACK_TOKEN\"|g" "$SETTINGS_FILE"
        
        read -p "Enter Slack Team ID (T...): " SLACK_TEAM
        sed -i '' "s|\"SLACK_TEAM_ID\": \".*\"|\"SLACK_TEAM_ID\": \"$SLACK_TEAM\"|g" "$SETTINGS_FILE"
        
        echo -e "${GREEN}✅ Slack tokens saved!${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipped Slack token${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Summary
echo -e "${GREEN}✅ SETUP COMPLETE!${NC}"
echo ""
echo "Configuration saved to: $SETTINGS_FILE"
echo ""

# Show what's configured
echo "📊 Final Status:"
if grep -q "ghp_" "$SETTINGS_FILE" 2>/dev/null; then
    echo -e "   ${GREEN}✅ GitHub Token${NC}"
else
    echo -e "   ${RED}❌ GitHub Token${NC}"
fi

if grep -q "BSA" "$SETTINGS_FILE" 2>/dev/null; then
    echo -e "   ${GREEN}✅ Brave Search API${NC}"
else
    echo -e "   ${YELLOW}⏳ Brave Search API${NC}"
fi

if grep -q "xoxb-" "$SETTINGS_FILE" 2>/dev/null; then
    echo -e "   ${GREEN}✅ Slack Bot Token${NC}"
else
    echo -e "   ${YELLOW}⏳ Slack Bot Token (Optional)${NC}"
fi

echo ""
echo "🚀 Next Steps:"
echo "   1. Run: ./activate-gemini.sh"
echo "   2. Open Gemini and type: /mcp list"
echo "   3. Start building: Read GEMINI.md"
echo ""
echo "============================================="

