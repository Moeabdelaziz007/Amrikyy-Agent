#!/bin/bash

###############################################################################
#
#   🤖 AMRIKYY AUTOPILOT BOT - STARTUP SCRIPT
#
#   Quick start script for the Amrikyy Travel Agent bot with autopilot
#
###############################################################################

echo "╔═══════════════════════════════════════════════╗"
echo "║                                               ║"
echo "║   🚀 Starting AMRIKYY AUTOPILOT BOT          ║"
echo "║                                               ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the backend directory
if [ ! -f "run-autopilot-bot.js" ]; then
    echo "${RED}❌ Error: run-autopilot-bot.js not found${NC}"
    echo "${YELLOW}Please run this script from the backend directory${NC}"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "${RED}❌ Error: .env file not found${NC}"
    echo "${YELLOW}Please create .env file with TELEGRAM_BOT_TOKEN${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Kill any existing bot processes
echo "${BLUE}🔍 Checking for existing bot processes...${NC}"
pkill -f "run-autopilot-bot" 2>/dev/null && echo "${GREEN}✅ Killed existing processes${NC}" || echo "${BLUE}ℹ️  No existing processes${NC}"

# Clear Telegram webhook
echo "${BLUE}🧹 Clearing Telegram webhook...${NC}"
BOT_TOKEN=$(grep TELEGRAM_BOT_TOKEN .env | cut -d '=' -f2)
curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook?drop_pending_updates=true" > /dev/null
echo "${GREEN}✅ Webhook cleared${NC}"

# Wait a moment
sleep 2

# Start the bot
echo ""
echo "${BLUE}🤖 Starting Amrikyy Autopilot Bot...${NC}"
echo ""

node run-autopilot-bot.js

# If we get here, the bot stopped
echo ""
echo "${RED}❌ Bot stopped${NC}"

