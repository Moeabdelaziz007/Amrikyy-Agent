# 🔐 Security Setup for Continue & MCP

## ⚠️ IMPORTANT: API Key Management

### ✅ Secure Setup (Recommended)

**Step 1: Use Environment Variables**
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANTHROPIC_API_KEY="sk-ant-your-key-here"

# Reload shell
source ~/.bashrc
```

**Step 2: Update Continue Config**
```bash
# Copy template to .continue/
cp docs/continue-config-template.json ~/.continue/config.json

# The $ANTHROPIC_API_KEY will be read from environment
```

### ❌ What NOT To Do

**NEVER do this:**
```json
{
  "apiKey": "sk-ant-actual-key-here"  // ❌ Will be committed to git!
}
```

---

## 🔑 Regenerate Compromised API Key

**⚠️ ACTION REQUIRED:**

Your API key was accidentally committed to git history. You **MUST** regenerate it:

1. **Go to:** https://console.anthropic.com/settings/keys
2. **Delete the old key** (the one that was committed)
3. **Create a new key**
4. **Set as environment variable** (see above)

**Why?** Once committed to git, the key is in the history forever and could be scraped by bots.

---

## 🛡️ Security Checklist

### Before Committing
- [ ] No API keys in code
- [ ] No passwords or secrets
- [ ] `.env` files in `.gitignore`
- [ ] `.continue/` in `.gitignore` ✅
- [ ] Use environment variables for secrets

### Files to NEVER Commit
```
.env
.env.local
.env.production
.continue/config.json  (if contains keys)
backend/.env
**/secrets/**
```

---

## 📋 Current Status

✅ `.continue/` is in `.gitignore`  
✅ `.continue/config.json` removed from tracking  
⚠️ **API key in git history** - Regenerate immediately!  
✅ Template config provided  

---

## 🔧 Proper Setup

```bash
# 1. Set environment variable
export ANTHROPIC_API_KEY="your-new-key"

# 2. Verify it's set
echo $ANTHROPIC_API_KEY

# 3. Continue will read from environment
# No need to edit config files!
```

---

**Security is non-negotiable. Always use environment variables for API keys.** 🔒
