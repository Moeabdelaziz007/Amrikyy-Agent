#!/bin/bash

# ============================================
# Amrikyy-Agent MVP - Railway Deployment Script
# Quick deployment to Railway.app
# ============================================

echo "🚀 Amrikyy-Agent MVP - Railway Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
echo "📦 Checking Railway CLI..."
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install Railway CLI${NC}"
        echo "Please install manually: npm install -g @railway/cli"
        exit 1
    fi
    echo -e "${GREEN}✅ Railway CLI installed${NC}"
else
    echo -e "${GREEN}✅ Railway CLI found${NC}"
fi

echo ""
echo "🔐 Environment Variables Setup"
echo "================================"
echo ""
echo "Please prepare these variables:"
echo ""
echo "REQUIRED:"
echo "  - OPENROUTER_API_KEY"
echo "  - ZAI_API_KEY"
echo "  - SUPABASE_URL"
echo "  - SUPABASE_ANON_KEY"
echo "  - REDIS_URL"
echo "  - JWT_SECRET"
echo "  - PORT=5000"
echo ""
echo "OPTIONAL:"
echo "  - NODE_ENV=production"
echo "  - REDIS_PASSWORD"
echo ""

read -p "Do you have all environment variables ready? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please prepare your environment variables first${NC}"
    echo "See: backend/.env.example for reference"
    exit 0
fi

echo ""
echo "🔑 Railway Login"
echo "================"
echo ""
echo "Opening browser for Railway authentication..."
railway login

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Railway login failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Logged in to Railway${NC}"
echo ""

echo "📁 Project Initialization"
echo "========================="
echo ""

# Check if already initialized
if [ -f "railway.json" ]; then
    echo -e "${YELLOW}⚠️  Railway project already initialized${NC}"
    read -p "Use existing project? (y/n): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Creating new project..."
        railway init
    else
        echo "Using existing project"
    fi
else
    echo "Creating new Railway project..."
    railway init
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to initialize Railway project${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Railway project ready${NC}"
echo ""

echo "🔧 Setting Environment Variables"
echo "================================="
echo ""
echo "Setting critical variables..."
echo ""

# Set variables interactively
read -p "OPENROUTER_API_KEY: " OPENROUTER_KEY
railway variables set OPENROUTER_API_KEY="$OPENROUTER_KEY"

read -p "ZAI_API_KEY: " ZAI_KEY
railway variables set ZAI_API_KEY="$ZAI_KEY"

read -p "SUPABASE_URL: " SUPABASE_URL
railway variables set SUPABASE_URL="$SUPABASE_URL"

read -p "SUPABASE_ANON_KEY: " SUPABASE_KEY
railway variables set SUPABASE_ANON_KEY="$SUPABASE_KEY"

read -p "REDIS_URL: " REDIS_URL
railway variables set REDIS_URL="$REDIS_URL"

read -p "JWT_SECRET (32+ chars): " JWT_SECRET
railway variables set JWT_SECRET="$JWT_SECRET"

railway variables set PORT="5000"
railway variables set NODE_ENV="production"

echo -e "${GREEN}✅ Environment variables set${NC}"
echo ""

echo "🚀 Deploying to Railway"
echo "======================="
echo ""
echo "This will:"
echo "  1. Build Docker image"
echo "  2. Deploy to Railway"
echo "  3. Start your backend"
echo ""
read -p "Continue with deployment? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Deployment cancelled${NC}"
    exit 0
fi

echo "Deploying..."
railway up

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check logs: railway logs"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Deployment initiated!${NC}"
echo ""

echo "🌐 Getting Deployment URL"
echo "========================="
echo ""

# Generate domain
railway domain

echo ""
echo "📊 Checking Deployment Status"
echo "=============================="
echo ""

sleep 5
railway status

echo ""
echo "📝 Viewing Recent Logs"
echo "======================"
echo ""

railway logs --tail 20

echo ""
echo "════════════════════════════════════════"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE! 🎉${NC}"
echo "════════════════════════════════════════"
echo ""
echo "Your MVP is deploying to Railway!"
echo ""
echo "Next steps:"
echo "  1. Wait 2-3 minutes for build to complete"
echo "  2. Get your URL: railway domain"
echo "  3. Test health: curl https://YOUR_URL/health"
echo "  4. Test MCP: curl https://YOUR_URL/api/mcp/tools"
echo ""
echo "Monitor deployment:"
echo "  - Logs: railway logs"
echo "  - Status: railway status"
echo "  - Open: railway open"
echo ""
echo -e "${GREEN}Congratulations! MVP is LIVE! 🚀${NC}"
echo ""
