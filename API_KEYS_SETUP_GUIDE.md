# 🔑 **API KEYS SETUP GUIDE - GEMINI MCP SERVERS**

## 📋 **REQUIRED API KEYS**

For Gemini's MCP servers to work fully, you need these API keys:

---

## 1️⃣ **BRAVE SEARCH API KEY** 🔍

**What it does:** Enables web search for research and documentation lookup

**How to get it:**

### **Step 1: Sign Up**
1. Go to: https://brave.com/search/api/
2. Click "Get Started" or "Sign Up"
3. Create an account (free tier available)

### **Step 2: Get API Key**
1. Log in to Brave Search API dashboard
2. Navigate to "API Keys" section
3. Click "Create New API Key"
4. Copy the key (looks like: `BSA...`)

### **Step 3: Add to Gemini Settings**
Edit `~/.gemini/settings.json`:
```json
{
  "mcpServers": {
    "brave-search": {
      "env": {
        "BRAVE_API_KEY": "YOUR_BRAVE_API_KEY_HERE"
      }
    }
  }
}
```

**Free Tier:**
- 2,000 queries per month
- Rate limit: 1 request/second
- **Perfect for development!** ✅

**Use it for:**
- "Express.js authentication best practices"
- "Node.js error handling patterns"
- "PostgreSQL query optimization"
- "REST API design principles"

---

## 2️⃣ **GITHUB PERSONAL ACCESS TOKEN** 🐙

**What it does:** Enables repository management, commits, and PR creation

**How to get it:**

### **Step 1: Generate Token**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "Gemini MCP Access"

### **Step 2: Select Scopes**
Check these permissions:
- ✅ `repo` (Full control of private repositories)
- ✅ `workflow` (Update GitHub Actions)
- ✅ `admin:org` (if working with organization)

### **Step 3: Generate & Copy**
1. Click "Generate token"
2. **IMPORTANT:** Copy the token immediately (starts with `ghp_...`)
3. Store it safely - you can't see it again!

### **Step 4: Add to Gemini Settings**
Edit `~/.gemini/settings.json`:
```json
{
  "mcpServers": {
    "github": {
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

**Use it for:**
- Committing backend code
- Creating pull requests
- Managing branches
- Viewing file history

---

## 3️⃣ **SLACK BOT TOKEN** 💬 (OPTIONAL)

**What it does:** Enables team communication and notifications

**How to get it:**

### **Step 1: Create Slack App**
1. Go to: https://api.slack.com/apps
2. Click "Create New App"
3. Choose "From scratch"
4. Name: "Gemini Bot"
5. Select your workspace

### **Step 2: Configure Bot**
1. Navigate to "OAuth & Permissions"
2. Add these scopes:
   - ✅ `chat:write`
   - ✅ `channels:read`
   - ✅ `channels:history`
3. Click "Install to Workspace"

### **Step 3: Get Tokens**
1. Copy **Bot User OAuth Token** (starts with `xoxb-...`)
2. Copy **Team ID** from workspace settings

### **Step 4: Add to Gemini Settings**
Edit `~/.gemini/settings.json`:
```json
{
  "mcpServers": {
    "slack": {
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-bot-token",
        "SLACK_TEAM_ID": "T1234567890"
      }
    }
  }
}
```

**Use it for:**
- Posting progress updates
- Notifying team of completed tasks
- Asking for code reviews
- Sharing API test results

---

## 4️⃣ **SUPABASE DATABASE URL** 🐘 (PROJECT SPECIFIC)

**What it does:** Enables direct database queries for testing

**Already in project `.env`:**
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

**For MCP PostgreSQL server:**
Edit `~/.gemini/settings.json`:
```json
{
  "mcpServers": {
    "postgres": {
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"
      ]
    }
  }
}
```

**Get connection string from:**
1. Supabase Dashboard → Settings → Database
2. Copy "Connection String" (URI format)
3. Replace `[YOUR-PASSWORD]` with actual password

**Use it for:**
- Testing SQL queries
- Debugging database issues
- Checking table schemas
- Verifying data integrity

---

## 📊 **SUMMARY TABLE**

| API Key | Required? | Free Tier? | Setup Time | Use Case |
|---------|-----------|------------|------------|----------|
| **Brave Search** | ✅ Highly Recommended | ✅ Yes (2K/month) | 5 min | Web research |
| **GitHub Token** | ✅ Highly Recommended | ✅ Yes | 3 min | Git operations |
| **Slack Token** | ⏳ Optional | ✅ Yes | 10 min | Team comms |
| **Supabase URL** | ✅ Already Have | ✅ Yes | 1 min | Database queries |

---

## 🚀 **QUICK SETUP (RECOMMENDED)**

### **Minimum Setup (5 minutes):**

1. **Brave Search API** → Research capabilities
2. **GitHub Token** → Code commits

**Result:** 80% of MCP functionality unlocked! ✅

### **Complete Setup (15 minutes):**

1. **Brave Search API** → Research
2. **GitHub Token** → Git operations
3. **Supabase URL** → Database queries
4. **Slack Token** → Team notifications

**Result:** 100% of MCP functionality! 🎉

---

## 🔒 **SECURITY BEST PRACTICES**

### **DO:**
- ✅ Store API keys in `~/.gemini/settings.json` (NOT in project files)
- ✅ Use environment variables
- ✅ Add `.gemini/` to `.gitignore`
- ✅ Rotate keys periodically
- ✅ Use minimal required permissions

### **DON'T:**
- ❌ Commit API keys to GitHub
- ❌ Share keys in chat/email
- ❌ Use production keys for development
- ❌ Grant excessive permissions
- ❌ Store keys in plaintext in project files

---

## 📁 **FILE STRUCTURE**

```
~/.gemini/
└── settings.json          ← API keys stored here (gitignored)

/Users/Shared/amrikyy-travel-agent/
├── .gitignore             ← Add .gemini/ here
├── .env                   ← Supabase keys already here
├── GEMINI.md              ← Instructions for Gemini
└── backend/               ← Your code (NO keys here!)
```

---

## 🛡️ **GITIGNORE SETUP**

Add to `.gitignore`:
```bash
# MCP Configuration (contains API keys)
.gemini/
~/.gemini/

# Environment variables
.env
.env.local
.env.*.local

# Secrets
secrets/
*.key
*.pem
```

---

## ✅ **VERIFICATION CHECKLIST**

After setup, verify in Gemini:

```bash
# Check MCP servers are active
/mcp list

# Should show:
# ✅ filesystem
# ✅ github (if token added)
# ✅ postgres (if URL configured)
# ✅ brave-search (if key added)
# ✅ slack (if token added)
# ✅ puppeteer
# ✅ memory
# ✅ sequential-thinking
```

---

## 🎯 **WHICH ONES DO YOU ACTUALLY NEED?**

### **Tier 1: Essential (Setup Now)** 🔴
- **Brave Search API** → Research while coding
- **GitHub Token** → Commit and push code

**Time:** 5 minutes  
**Benefit:** Huge productivity boost  
**Cost:** Free

### **Tier 2: Very Useful (Setup This Week)** 🟡
- **Supabase Database URL** → Test database queries

**Time:** 2 minutes  
**Benefit:** Database debugging  
**Cost:** Free (already have Supabase)

### **Tier 3: Nice to Have (Setup Later)** 🟢
- **Slack Token** → Team notifications

**Time:** 10 minutes  
**Benefit:** Better team communication  
**Cost:** Free

---

## 🚀 **RECOMMENDED ACTION PLAN**

### **Right Now (5 minutes):**

1. **Get Brave Search API Key**
   - Visit: https://brave.com/search/api/
   - Sign up (free)
   - Get API key
   - Add to `~/.gemini/settings.json`

2. **Get GitHub Token**
   - Visit: https://github.com/settings/tokens
   - Generate new token
   - Select `repo` scope
   - Add to `~/.gemini/settings.json`

3. **Test in Gemini**
   ```bash
   /mcp list
   /tools brave-search "Express.js best practices"
   ```

### **Later (Optional):**

4. **Add Supabase URL** (if you want database queries)
5. **Add Slack Token** (if you want team notifications)

---

## 💡 **WHAT IF I SKIP THEM?**

### **Without Brave Search:**
- ❌ Can't research on the web
- ✅ Can still read docs you provide
- ✅ Can still write code

### **Without GitHub Token:**
- ❌ Can't auto-commit code
- ✅ Can still generate code
- ✅ You manually commit with git

### **Without Slack:**
- ❌ Can't post to team channels
- ✅ Can still notify you directly
- ✅ You manually share updates

**Bottom Line:** Brave Search + GitHub Token = 80% of value! 🎯

---

## 🎉 **FINAL RECOMMENDATION**

### **DO THIS NOW (5 minutes):**

```bash
1. Get Brave Search API key → https://brave.com/search/api/
2. Get GitHub token → https://github.com/settings/tokens
3. Add both to ~/.gemini/settings.json
4. Test with /mcp list in Gemini
```

**This unlocks:**
- 🔍 Web research while coding
- 🐙 Automatic code commits
- 🧠 Sequential thinking
- 📁 File system access
- 💾 Persistent memory

**You'll be 10x more productive!** 🚀

---

## 📞 **NEED HELP?**

**If stuck:**
1. Check setup guide: `GEMINI_MCP_SETUP_GUIDE.md`
2. Read instructions: `GEMINI.md`
3. Ask me for specific help!

---

**Last Updated:** January 13, 2025  
**Priority:** 🔴 Setup Brave + GitHub Now (5 min)  
**Status:** Ready to enhance Gemini's abilities! ⚡
