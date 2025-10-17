#!/bin/bash

###############################################################################
# 🚀 MONEY HUNTER SYSTEM LAUNCHER
# Quick start script for the autonomous revenue detection system
###############################################################################

echo "
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              💰 MONEY HUNTER SYSTEM LAUNCHER                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed!"
    echo "   Please install Node.js 18+ to run Money Hunter"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/src/agents/run-money-hunter.js" ]; then
    echo "❌ Error: Money Hunter files not found!"
    echo "   Please run this script from the project root directory"
    exit 1
fi

echo "📦 Checking dependencies..."

# Check for ws module (WebSocket)
if ! node -e "require('ws')" 2>/dev/null; then
    echo "⚠️  WebSocket module not found. Installing..."
    cd backend && npm install ws --no-save && cd ..
fi

echo "✅ All dependencies ready!"
echo ""

echo "🚀 Starting Money Hunter System..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Launch the system
node backend/src/agents/run-money-hunter.js

# If the script exits, show message
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👋 Money Hunter System stopped"
echo ""
