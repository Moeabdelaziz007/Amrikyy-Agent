# 🚀 Quick Start - Continue AI Setup

Get up and running with Continue + MCP in 5 minutes.

---

## ⚡ 3-STEP SETUP

### Step 1: Secure Your API Key (1 minute)
```bash
# 1. Regenerate API key at https://console.anthropic.com/settings/keys
# 2. Set environment variable
export ANTHROPIC_API_KEY="sk-ant-your-new-key-here"

# 3. Verify it's set
echo $ANTHROPIC_API_KEY
# Should display: sk-ant-...
```

**Why?** The old key was in git history and must be replaced.

---

### Step 2: Restart Your IDE (30 seconds)
```bash
# Close VS Code / Cursor completely
# Re-open your workspace
# Wait for Continue to load
```

---

### Step 3: Verify Setup (30 seconds)
```bash
# Run automated verification
./test-continue-setup.sh

# Expected: 🎉 ALL TESTS PASSED! (26/26)
```

---

## 🎯 FIRST USE

### Test 1: Store a Memory
Open Continue, type:
```
/remember Testing the new MCP integration - it works!
```

**Expected:** ✅ Memory stored successfully

---

### Test 2: Recall a Memory
```
/recall testing
```

**Expected:** ✅ Returns your previous memory

---

### Test 3: Generate Code
```
Create a backend service for handling user authentication
```

**Expected:** 
✅ Follows Maya patterns  
✅ Layered architecture  
✅ Proper error handling  

---

## 📋 AVAILABLE AGENTS

### 1. Maya Travel Agent Assistant (Primary)
**Use for:** Day-to-day development
**Models:** Claude Sonnet 4, GPT-5, Qwen3 Coder
**Commands:**
- `/remember` - Store insights
- `/recall` - Search memories
- `/maya-pattern` - Check pattern compliance

### 2. Code Reviewer
**Use for:** Code quality checks
**Commands:**
- `/review` - Comprehensive review
- `/security-audit` - Security scan

### 3. Pattern Learner
**Use for:** Pattern discovery
**Commands:**
- `/learn` - Store new patterns
- `/discover` - Find patterns in code

---

## 🔥 PRO TIPS

### Tip 1: Switch Agents for Specific Tasks
```
General coding → Maya Agent
Code review → Code Reviewer
Pattern analysis → Pattern Learner
```

### Tip 2: Use Memory for Complex Projects
```
After solving a bug:
/remember Fixed authentication issue by clearing Redis cache before JWT refresh

Later when similar issue occurs:
/recall authentication Redis
```

### Tip 3: Let Rules Guide You
Continue automatically applies rules from `docs/continue-rules/`
- Backend code → Layered architecture
- Frontend code → TypeScript + functional components
- Commits → Conventional format

---

## ⚠️ TROUBLESHOOTING

### "API key error"
```bash
# Set environment variable
export ANTHROPIC_API_KEY="your-key"

# Restart IDE
```

### "MCP tools not working"
```bash
# Test MCP server
./test-mcp-server.sh

# Should see: ✅ MCP server test PASSED
```

### "Rules not applying"
```bash
# Verify rules exist
ls docs/continue-rules/

# Should see 5 .md files + README

# Restart IDE
```

### "Index errors"
```bash
# Fix Continue index
./fix-continue-index.sh

# Restart IDE
```

---

## 📊 VERIFICATION

Run this command to verify everything:
```bash
./test-continue-setup.sh
```

Should see:
```
✅ 26/26 tests passed
🎉 ALL TESTS PASSED! Setup is complete.
```

---

## 📚 NEXT STEPS

### Learn More:
- **Full Testing Guide:** `docs/TESTING_GUIDE.md`
- **Security Setup:** `docs/SECURITY_SETUP.md`
- **MCP Integration:** `backend/mcp-servers/MCP_INTEGRATION_GUIDE.md`
- **Rules Documentation:** `docs/continue-rules/README.md`

### Try Advanced Features:
1. **Pattern Learning:**
   ```
   /discover backend patterns
   ```

2. **Code Review:**
   ```
   /review backend/src/controllers/tripController.js
   ```

3. **Maya Pattern Check:**
   ```
   /maya-pattern analyze this file
   ```

---

## ✅ YOU'RE READY!

Your setup includes:
- ✅ 3 specialized AI agents
- ✅ Private journal with semantic search
- ✅ 5 custom rule sets
- ✅ Multiple AI models (Claude, GPT, Qwen)
- ✅ Automatic pattern enforcement
- ✅ Persistent memory system

**Start coding with AI superpowers!** 🚀

---

**Questions?** Check `docs/TESTING_GUIDE.md` for detailed testing instructions.
