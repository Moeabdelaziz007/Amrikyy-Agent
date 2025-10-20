#!/bin/bash

# ========================================
# 🔒 Security Check Script
# Scans codebase for hardcoded secrets and security issues
# Part of Amrikyy-Agent Phase 1: Security Foundation
# ========================================

echo ""
echo "🔒 ═══════════════════════════════════════════════════════"
echo "🔒 Running Security Check for Amrikyy Agent Platform"
echo "🔒 ═══════════════════════════════════════════════════════"
echo ""

ERRORS=0

# ========================================
# Check 1: Hardcoded API Keys
# ========================================
echo "📝 Check 1: Scanning for hardcoded API keys..."

# Patterns to detect
PATTERNS=(
  "sk-or-v1-"     # OpenRouter keys
  "sk-proj-"      # OpenAI keys
  "AIza"          # Google API keys
  "ghp_"          # GitHub personal access tokens
  "glpat-"        # GitLab tokens
  "Bearer [A-Za-z0-9]" # Bearer tokens
)

for pattern in "${PATTERNS[@]}"; do
  if grep -r "$pattern" backend/src --exclude-dir=node_modules --exclude="*.log" 2>/dev/null; then
    echo "   ❌ Found potential hardcoded secrets matching: $pattern"
    ERRORS=$((ERRORS + 1))
  fi
done

if [ $ERRORS -eq 0 ]; then
  echo "   ✅ No hardcoded API keys found"
fi

# ========================================
# Check 2: .env File Committed
# ========================================
echo ""
echo "📝 Check 2: Checking if .env files are committed to git..."

if git ls-files 2>/dev/null | grep -q "^\.env$\|^backend/\.env$\|^frontend/\.env$"; then
  echo "   ❌ .env file is committed to git!"
  echo "   Run: git rm --cached .env backend/.env frontend/.env"
  ERRORS=$((ERRORS + 1))
else
  echo "   ✅ No .env files committed to git"
fi

# ========================================
# Check 3: Sensitive Files in Git
# ========================================
echo ""
echo "📝 Check 3: Checking for sensitive files..."

SENSITIVE_FILES=(
  "api-keys.json"
  "secrets.json"
  "credentials.json"
  "tokens.json"
  "private.key"
  "id_rsa"
)

for file in "${SENSITIVE_FILES[@]}"; do
  if git ls-files 2>/dev/null | grep -q "$file"; then
    echo "   ❌ Sensitive file found in git: $file"
    ERRORS=$((ERRORS + 1))
  fi
done

if [ $ERRORS -eq 0 ] || [ $ERRORS -eq 1 ]; then
  echo "   ✅ No sensitive files committed"
fi

# ========================================
# Check 4: Environment Variable Validation
# ========================================
echo ""
echo "📝 Check 4: Validating environment files exist..."

if [ ! -f "backend/.env.example" ]; then
  echo "   ❌ backend/.env.example is missing"
  ERRORS=$((ERRORS + 1))
else
  echo "   ✅ backend/.env.example exists"
fi

if [ -f "backend/.env" ]; then
  echo "   ✅ backend/.env exists (local configuration)"
  
  # Check if .env has required variables
  REQUIRED_VARS=("OPENROUTER_API_KEY" "SUPABASE_URL" "REDIS_URL" "JWT_SECRET")
  for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" backend/.env 2>/dev/null; then
      echo "   ⚠️  Warning: $var not found in .env"
    fi
  done
else
  echo "   ⚠️  Warning: backend/.env not found (create from .env.example)"
fi

# ========================================
# Check 5: Node Modules Security
# ========================================
echo ""
echo "📝 Check 5: Checking for known vulnerabilities in dependencies..."

if command -v npm &> /dev/null; then
  cd backend 2>/dev/null
  if [ -f "package.json" ]; then
    # Run npm audit (but don't fail on warnings)
    echo "   Running npm audit..."
    npm audit --production 2>&1 | grep -E "critical|high" || echo "   ✅ No critical/high vulnerabilities found"
  fi
  cd .. 2>/dev/null
else
  echo "   ⚠️  npm not found, skipping dependency check"
fi

# ========================================
# Check 6: Git Hooks
# ========================================
echo ""
echo "📝 Check 6: Checking git hooks..."

if [ -f ".git/hooks/pre-commit" ]; then
  echo "   ✅ Pre-commit hook exists"
else
  echo "   ⚠️  No pre-commit hook (recommended for automatic security checks)"
fi

# ========================================
# Results Summary
# ========================================
echo ""
echo "🔒 ═══════════════════════════════════════════════════════"

if [ $ERRORS -eq 0 ]; then
  echo "✅ Security check PASSED - No critical issues found"
  echo "🔒 ═══════════════════════════════════════════════════════"
  echo ""
  exit 0
else
  echo "❌ Security check FAILED - $ERRORS issue(s) found"
  echo "🔒 ═══════════════════════════════════════════════════════"
  echo ""
  echo "Please fix the issues above before committing code."
  echo ""
  exit 1
fi
