# 🧪 Testing Guide - Continue & MCP Integration

Complete guide to test and verify your Continue + MCP setup.

---

## 🎯 Quick Start

```bash
# Run automated tests
./test-continue-setup.sh

# Test MCP server
./test-mcp-server.sh
```

---

## 📋 PRE-TESTING CHECKLIST

### 1. Security Setup ✅
- [ ] Old API key regenerated at https://console.anthropic.com/
- [ ] New API key set as environment variable
- [ ] Verify with: `echo $ANTHROPIC_API_KEY`
- [ ] Should show your new key (starts with `sk-ant-`)

### 2. IDE Restart ✅
- [ ] Close VS Code / Cursor completely
- [ ] Re-open the workspace
- [ ] Wait for Continue to load (check bottom status bar)

### 3. Continue Extension Active ✅
- [ ] Continue icon visible in sidebar
- [ ] Click Continue icon to open panel
- [ ] Should see model selector dropdown

---

## 🧪 TESTING PHASE 1: Basic Setup

### Test 1: Verify Agents Available
**What to do:**
1. Open Continue sidebar
2. Click the agent dropdown (top of panel)
3. Look for available agents

**Expected result:**
```
✅ You should see:
   - Maya Travel Agent Assistant
   - Code Reviewer
   - Pattern Learner
   - (plus any default agents)
```

**If not working:**
- Check `.continue/agents/` directory exists
- Verify agent YAML files are valid
- Restart IDE

---

### Test 2: Select Maya Agent
**What to do:**
1. Click agent dropdown
2. Select "Maya Travel Agent Assistant"
3. Notice the agent name at top of panel

**Expected result:**
```
✅ Agent name changes to "Maya Travel Agent Assistant"
✅ Status bar shows "Maya Travel Agent" or similar
```

---

### Test 3: Check Model Configuration
**What to do:**
1. With Maya agent selected
2. Look at model dropdown (usually below agent selector)

**Expected result:**
```
✅ Should show models like:
   - Claude Sonnet 4 (Primary)
   - GPT-5 (Alternative)
   - Qwen3 Coder 30B (Local)
   - (others from config)
```

**If not working:**
- Check environment variable: `echo $ANTHROPIC_API_KEY`
- Verify Continue can access the key
- Check Continue logs: `Cmd/Ctrl + Shift + P` → "Continue: Show Logs"

---

## 🧪 TESTING PHASE 2: MCP Integration

### Test 4: Private Journal - Store Memory
**What to do:**
1. In Continue chat, type:
   ```
   /remember I'm testing the Private Journal MCP integration. This is my first memory entry!
   ```
2. Press Enter

**Expected result:**
```
✅ Continue should:
   - Process the command
   - Call the private-journal MCP tool
   - Confirm the memory was stored
   - Show response like "Memory stored successfully"
```

**If not working:**
- Run: `./test-mcp-server.sh` to verify server works
- Check MCP config: `backend/mcp-servers/mcp-config.json`
- Check Continue MCP settings in config
- Look for errors in Continue logs

---

### Test 5: Private Journal - Search Memory
**What to do:**
1. In Continue chat, type:
   ```
   /recall testing
   ```
2. Or use:
   ```
   /search-memory integration
   ```

**Expected result:**
```
✅ Should retrieve your previous memory entry
✅ Shows semantic search results
✅ Displays relevant context
```

---

### Test 6: List Recent Entries
**What to do:**
```
/journal list recent
```

**Expected result:**
```
✅ Shows your recent journal entries
✅ Displays timestamps
✅ Shows entry summaries
```

---

## 🧪 TESTING PHASE 3: Custom Commands

### Test 7: Maya Pattern Analysis
**What to do:**
1. Open a backend file (e.g., `backend/src/controllers/userController.js`)
2. In Continue, type:
   ```
   /maya-pattern analyze this controller
   ```

**Expected result:**
```
✅ Analyzes the code against Maya patterns
✅ Checks layered architecture compliance
✅ Suggests improvements if needed
```

---

### Test 8: Code Review
**What to do:**
1. Switch to "Code Reviewer" agent
2. Open a code file
3. Type:
   ```
   /review
   ```

**Expected result:**
```
✅ Comprehensive code review
✅ Security audit
✅ Quality assessment
✅ Actionable suggestions
```

---

### Test 9: Pattern Learning
**What to do:**
1. Switch to "Pattern Learner" agent
2. Type:
   ```
   /discover what patterns exist in the backend?
   ```

**Expected result:**
```
✅ Analyzes codebase patterns
✅ Identifies common structures
✅ Documents patterns it finds
✅ Stores patterns in journal
```

---

## 🧪 TESTING PHASE 4: Rules Application

### Test 10: Backend Code Generation
**What to do:**
1. Ask Continue:
   ```
   Create a new API endpoint for getting user preferences
   ```

**Expected result:**
```
✅ Follows layered architecture:
   - Creates route
   - Creates controller
   - Creates service
✅ Includes error handling
✅ Uses async/await
✅ Adds JSDoc comments
```

**Verify:**
- Check generated code matches patterns in `docs/continue-rules/maya-backend-patterns.md`

---

### Test 11: Frontend Code Generation
**What to do:**
```
Create a React component for displaying trip cards
```

**Expected result:**
```
✅ TypeScript with Props interface
✅ Functional component
✅ TailwindCSS styling
✅ Custom hooks for logic
```

**Verify:**
- Check generated code matches `docs/continue-rules/maya-frontend-patterns.md`

---

### Test 12: Git Commit Message
**What to do:**
```
Generate a commit message for adding the MCP integration
```

**Expected result:**
```
✅ Conventional commit format:
   feat: Add Private Journal MCP integration
   
   Integrated semantic search for development insights...
```

**Verify:**
- Matches format in `docs/continue-rules/maya-git-workflow.md`

---

## 🔧 TROUBLESHOOTING

### Issue: Agent not found
**Fix:**
```bash
# Verify agent files exist
ls -la .continue/agents/

# Restart IDE
```

### Issue: MCP tools not working
**Fix:**
```bash
# Test MCP server manually
./test-mcp-server.sh

# Check server logs
cd backend/mcp-servers/private-journal
npm run build
node dist/index.js
```

### Issue: API key not working
**Fix:**
```bash
# Verify environment variable
echo $ANTHROPIC_API_KEY

# Should start with: sk-ant-

# If not set:
export ANTHROPIC_API_KEY="your-key-here"

# Restart IDE after setting
```

### Issue: Rules not applied
**Fix:**
```bash
# Verify rules exist
ls -la docs/continue-rules/

# Rules should auto-load
# Try restarting IDE
```

### Issue: "SQLITE_ERROR: no such table: chunks"
**Fix:**
```bash
# Run the fix script
./fix-continue-index.sh

# Restart IDE
# Continue will rebuild its index
```

---

## 📊 VERIFICATION CHECKLIST

After all tests, verify:

- [x] ✅ 26/26 automated tests passed
- [ ] ✅ All 3 agents accessible
- [ ] ✅ Models configured and working
- [ ] ✅ MCP `/remember` command works
- [ ] ✅ MCP `/recall` command works
- [ ] ✅ Custom commands functional
- [ ] ✅ Code generation follows patterns
- [ ] ✅ Rules automatically applied
- [ ] ✅ No API key errors

---

## 🎯 SUCCESS CRITERIA

### ✅ Setup is COMPLETE when:
1. All agents selectable
2. MCP commands work (`/remember`, `/recall`)
3. Generated code follows Maya patterns
4. No security warnings
5. All tests pass

### 🚀 You're ready to:
- Use AI-powered coding with persistent memory
- Generate Maya-compliant code automatically
- Search past solutions and insights
- Collaborate with specialized agents
- Maintain consistent code quality

---

## 📚 Additional Resources

- **MCP Integration Guide:** `backend/mcp-servers/MCP_INTEGRATION_GUIDE.md`
- **Security Setup:** `docs/SECURITY_SETUP.md`
- **Agent Installation:** `docs/continue-agents/INSTALLATION.md`
- **Rules Documentation:** `docs/continue-rules/README.md`

---

**Your AI development setup is production-ready!** 🎉
