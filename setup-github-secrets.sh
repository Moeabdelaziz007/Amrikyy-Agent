#!/bin/bash

# ============================================
# GITHUB SECRETS SETUP SCRIPT
# Amrikyy Travel Platform
# ============================================

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   🔐 GITHUB SECRETS SETUP                                 ║"
echo "║   Amrikyy Travel Platform                                 ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo ""
    echo "📥 Install it with:"
    echo "   Ubuntu/Debian: sudo apt install gh"
    echo "   Mac: brew install gh"
    echo "   Or visit: https://cli.github.com/"
    echo ""
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "🔑 You need to authenticate with GitHub first."
    echo ""
    gh auth login
    echo ""
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"
echo ""

# ============================================
# REQUIRED SECRETS
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  REQUIRED SECRETS (for CI/CD)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. RAILWAY_TOKEN
echo "1️⃣  RAILWAY_TOKEN"
echo "   📍 Get from: https://railway.app/account/tokens"
echo "   ℹ️  Click 'Create New Token' → Copy the token"
echo ""
read -p "   Enter RAILWAY_TOKEN (or press Enter to skip): " RAILWAY_TOKEN
if [ ! -z "$RAILWAY_TOKEN" ]; then
    gh secret set RAILWAY_TOKEN --body "$RAILWAY_TOKEN"
    echo "   ✅ RAILWAY_TOKEN added"
else
    echo "   ⏭️  Skipped"
fi
echo ""

# 2. VERCEL_TOKEN
echo "2️⃣  VERCEL_TOKEN"
echo "   📍 Get from: https://vercel.com/account/tokens"
echo "   ℹ️  Click 'Create' → Name it 'GitHub Actions' → Copy"
echo ""
read -p "   Enter VERCEL_TOKEN (or press Enter to skip): " VERCEL_TOKEN
if [ ! -z "$VERCEL_TOKEN" ]; then
    gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
    echo "   ✅ VERCEL_TOKEN added"
else
    echo "   ⏭️  Skipped"
fi
echo ""

# 3. VERCEL_ORG_ID
echo "3️⃣  VERCEL_ORG_ID"
echo "   📍 Get by running in frontend/: vercel link"
echo "   ℹ️  Or find in .vercel/project.json after running 'vercel link'"
echo ""
read -p "   Enter VERCEL_ORG_ID (or press Enter to skip): " VERCEL_ORG_ID
if [ ! -z "$VERCEL_ORG_ID" ]; then
    gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID"
    echo "   ✅ VERCEL_ORG_ID added"
else
    echo "   ⏭️  Skipped"
fi
echo ""

# 4. VERCEL_PROJECT_ID
echo "4️⃣  VERCEL_PROJECT_ID"
echo "   📍 Get by running in frontend/: vercel link"
echo "   ℹ️  Or find in .vercel/project.json after running 'vercel link'"
echo ""
read -p "   Enter VERCEL_PROJECT_ID (or press Enter to skip): " VERCEL_PROJECT_ID
if [ ! -z "$VERCEL_PROJECT_ID" ]; then
    gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID"
    echo "   ✅ VERCEL_PROJECT_ID added"
else
    echo "   ⏭️  Skipped"
fi
echo ""

# 5. SENTRY_DSN
echo "5️⃣  SENTRY_DSN"
echo "   📍 Get from: https://sentry.io → Settings → Projects → Your Project → Client Keys (DSN)"
echo "   ℹ️  Format: https://xxxxx@oxxxxxx.ingest.sentry.io/xxxxxx"
echo ""
read -p "   Enter SENTRY_DSN (or press Enter to skip): " SENTRY_DSN
if [ ! -z "$SENTRY_DSN" ]; then
    gh secret set SENTRY_DSN --body "$SENTRY_DSN"
    echo "   ✅ SENTRY_DSN added"
else
    echo "   ⏭️  Skipped"
fi
echo ""

# 6. METRICS_API_KEY
echo "6️⃣  METRICS_API_KEY"
echo "   ℹ️  Generate a secure random key"
echo ""
read -p "   Generate new key automatically? (Y/n): " AUTO_METRICS_KEY
if [[ "$AUTO_METRICS_KEY" != "n" && "$AUTO_METRICS_KEY" != "N" ]]; then
    METRICS_API_KEY=$(openssl rand -hex 32)
    gh secret set METRICS_API_KEY --body "$METRICS_API_KEY"
    echo "   ✅ METRICS_API_KEY generated and added"
    echo "   📋 Key: $METRICS_API_KEY"
    echo "   💾 Save this key - you'll need it to access /health/metrics"
else
    read -p "   Enter METRICS_API_KEY: " METRICS_API_KEY
    if [ ! -z "$METRICS_API_KEY" ]; then
        gh secret set METRICS_API_KEY --body "$METRICS_API_KEY"
        echo "   ✅ METRICS_API_KEY added"
    else
        echo "   ⏭️  Skipped"
    fi
fi
echo ""

# ============================================
# OPTIONAL SECRETS
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  OPTIONAL SECRETS (for enhanced features)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Add optional secrets? (y/N): " ADD_OPTIONAL
echo ""

if [[ "$ADD_OPTIONAL" == "y" || "$ADD_OPTIONAL" == "Y" ]]; then
    
    # 7. SONAR_TOKEN
    echo "7️⃣  SONAR_TOKEN (Code Quality)"
    echo "   📍 Get from: https://sonarcloud.io/account/security"
    echo "   ℹ️  Generate a new token for GitHub Actions"
    echo ""
    read -p "   Enter SONAR_TOKEN (or press Enter to skip): " SONAR_TOKEN
    if [ ! -z "$SONAR_TOKEN" ]; then
        gh secret set SONAR_TOKEN --body "$SONAR_TOKEN"
        echo "   ✅ SONAR_TOKEN added"
    else
        echo "   ⏭️  Skipped"
    fi
    echo ""
    
    # 8. SLACK_WEBHOOK
    echo "8️⃣  SLACK_WEBHOOK (Notifications)"
    echo "   📍 Get from: Slack → Apps → Incoming Webhooks"
    echo "   ℹ️  Format: https://hooks.slack.com/services/XXX/XXX/XXX"
    echo ""
    read -p "   Enter SLACK_WEBHOOK (or press Enter to skip): " SLACK_WEBHOOK
    if [ ! -z "$SLACK_WEBHOOK" ]; then
        gh secret set SLACK_WEBHOOK --body "$SLACK_WEBHOOK"
        echo "   ✅ SLACK_WEBHOOK added"
    else
        echo "   ⏭️  Skipped"
    fi
    echo ""
fi

# ============================================
# SUMMARY
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Listing all secrets in repository..."
gh secret list

echo ""
echo "✅ GitHub Secrets setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update backend/.env with SENTRY_DSN and METRICS_API_KEY"
echo "   2. Test CI/CD by pushing to your branch"
echo "   3. Merge to main to trigger deployment"
echo ""
echo "🔗 View secrets at:"
echo "   https://github.com/$REPO/settings/secrets/actions"
echo ""
