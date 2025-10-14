# 🚀 **GEMINI MCP SETUP GUIDE**

## 📋 **WHAT WAS CREATED**

### **1. MCP Server Configuration** ✅
**File:** `~/.gemini/settings.json`

**8 MCP Servers Configured:**
- 📁 **Filesystem** - Read/write project files
- 🐙 **GitHub** - Repository management
- 🐘 **PostgreSQL** - Database queries
- 🔍 **Brave Search** - Web research
- 💬 **Slack** - Team communication
- 🎭 **Puppeteer** - Browser automation
- 🧠 **Memory** - Persistent context
- 🤔 **Sequential Thinking** - Advanced reasoning

### **2. Project Instructions** ✅
**File:** `GEMINI.md` (418 lines)

**Complete guide including:**
- Role and responsibilities
- Critical rules (BUILD vs READ)
- Project structure
- Immediate tasks with code templates
- MCP tools usage
- Success criteria
- Best practices

---

## 🔧 **SETUP INSTRUCTIONS**

### **Step 1: Configure API Keys** 🔑

Edit `~/.gemini/settings.json` and replace placeholders:

```json
{
  "mcpServers": {
    "github": {
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_actual_token_here"
      }
    },
    "brave-search": {
      "env": {
        "BRAVE_API_KEY": "your_brave_api_key_here"
      }
    },
    "slack": {
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-slack-bot-token",
        "SLACK_TEAM_ID": "T1234567890"
      }
    }
  }
}
```

**Get API Keys:**
- **GitHub**: https://github.com/settings/tokens
- **Brave Search**: https://brave.com/search/api/
- **Slack**: https://api.slack.com/apps

### **Step 2: Test MCP Servers** 🧪

In Gemini, type:
```
/mcp list
```

Should show all 8 servers active.

### **Step 3: Use MCP Tools** 🛠️

**Examples:**

```javascript
// Read project files
/tools filesystem read backend/server.js

// Query database
/tools postgres SELECT * FROM users LIMIT 5

// Search web
/tools brave-search "Express.js authentication best practices"

// Remember context
/tools memory store last_completed_task "Profile API"
```

---

## 🎯 **USING GEMINI WITH MCP**

### **Quick Commands:**

```bash
# Show available commands
/

# List MCP tools
/mcp

# Use a specific tool
/tools filesystem read backend/routes/ai.js

# Sequential thinking
/tools sequential-thinking analyze "How to implement notifications?"
```

### **Workflow Example:**

```
1. Read existing code:
/tools filesystem read backend/server.js

2. Research best practices:
/tools brave-search "Node.js notification system real-time"

3. Plan implementation:
/tools sequential-thinking breakdown "Notification API requirements"

4. Build code:
[Write code in backend/routes/notifications.js]

5. Store progress:
/tools memory store notifications_api_complete true
```

---

## 📊 **MCP SERVER DETAILS**

### **1. Filesystem Server** 📁
**Capabilities:**
- Read files: `filesystem.read(path)`
- Write files: `filesystem.write(path, content)`
- List directory: `filesystem.list(path)`
- Delete files: `filesystem.delete(path)`

**Use for:**
- Reading existing backend code
- Creating new route files
- Updating server.js
- Managing project structure

---

### **2. GitHub Server** 🐙
**Capabilities:**
- Create PR: `github.createPullRequest()`
- Commit changes: `github.commit()`
- List branches: `github.listBranches()`
- Get file history: `github.getHistory()`

**Use for:**
- Committing backend code
- Creating feature branches
- Managing version control
- Collaborating with team

---

### **3. PostgreSQL Server** 🐘
**Capabilities:**
- Query: `postgres.query(sql, params)`
- Execute: `postgres.execute(sql)`
- List tables: `postgres.listTables()`
- Get schema: `postgres.getSchema(table)`

**Use for:**
- Testing database queries
- Checking table structure
- Debugging SQL issues
- Verifying data integrity

---

### **4. Brave Search Server** 🔍
**Capabilities:**
- Web search: `brave.search(query)`
- Get snippets: `brave.getSnippets()`
- Find documentation: `brave.findDocs()`

**Use for:**
- Researching best practices
- Finding code examples
- Learning new APIs
- Solving technical problems

---

### **5. Slack Server** 💬
**Capabilities:**
- Send message: `slack.sendMessage(channel, text)`
- List channels: `slack.listChannels()`
- Get messages: `slack.getMessages(channel)`

**Use for:**
- Team notifications
- Progress updates
- Asking for help
- Sharing completed work

---

### **6. Puppeteer Server** 🎭
**Capabilities:**
- Navigate: `puppeteer.navigate(url)`
- Screenshot: `puppeteer.screenshot()`
- Click: `puppeteer.click(selector)`
- Fill form: `puppeteer.fill(selector, value)`

**Use for:**
- Testing frontend integration
- Automated UI testing
- Web scraping (if needed)
- Visual regression testing

---

### **7. Memory Server** 🧠
**Capabilities:**
- Store: `memory.store(key, value)`
- Retrieve: `memory.get(key)`
- List: `memory.list()`
- Delete: `memory.delete(key)`

**Use for:**
- Remembering completed tasks
- Storing project patterns
- Context across sessions
- Learning from mistakes

---

### **8. Sequential Thinking Server** 🤔
**Capabilities:**
- Breakdown: `think.breakdown(problem)`
- Analyze: `think.analyze(situation)`
- Reason: `think.reason(question)`
- Solve: `think.solve(problem)`

**Use for:**
- Complex problem solving
- Architecture decisions
- Debugging difficult issues
- Planning implementations

---

## 🎓 **BEST PRACTICES**

### **1. Use MCP for Research** 📚
Before coding, research:
```
/tools brave-search "Express.js profile endpoint best practices"
/tools sequential-thinking analyze "Profile API requirements"
```

### **2. Read Before Writing** 📖
Always check existing code:
```
/tools filesystem read backend/server.js
/tools filesystem read backend/routes/ai.js
```

### **3. Test Database Queries** 🧪
Verify queries before using:
```
/tools postgres SELECT * FROM users WHERE id = '123'
```

### **4. Store Knowledge** 💾
Remember what you learn:
```
/tools memory store profile_api_pattern "Use authenticateToken middleware"
/tools memory store error_handling "Always wrap in try-catch"
```

### **5. Think Sequentially** 🤔
For complex tasks:
```
/tools sequential-thinking breakdown "Real-time notification system implementation steps"
```

---

## 🚀 **GETTING STARTED**

### **Your First Task: Profile API**

```bash
# 1. Read project structure
/tools filesystem list backend/routes

# 2. Research best practices
/tools brave-search "Express.js user profile API authentication"

# 3. Plan implementation
/tools sequential-thinking breakdown "Profile API with GET, PUT, POST endpoints"

# 4. Read similar code
/tools filesystem read backend/routes/ai.js

# 5. BUILD the code
[Create backend/routes/profile.js]

# 6. Test it
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/profile

# 7. Store success
/tools memory store profile_api_complete true
```

---

## 🎯 **SUCCESS METRICS**

**With MCP Servers, you can:**
- ✅ Research 10x faster
- ✅ Build with confidence
- ✅ Test thoroughly
- ✅ Remember patterns
- ✅ Think strategically

**Your new capabilities:**
- 🧠 Persistent memory across sessions
- 🔍 Real-time web research
- 🐘 Direct database access
- 🐙 Git operations
- 🎭 Browser automation
- 🤔 Advanced reasoning

---

## 📋 **QUICK REFERENCE**

### **Essential Commands:**
```bash
/mcp              # List MCP servers
/tools            # List available tools
/tools <tool>     # Use specific tool
/help             # Show help
```

### **Common Workflows:**
```bash
# Research → Plan → Build → Test → Store
/tools brave-search → /tools sequential-thinking → [CODE] → [TEST] → /tools memory
```

---

## 🎉 **YOU'RE READY!**

**MCP Servers configured:** ✅  
**GEMINI.md instructions created:** ✅  
**Tools available:** 8 powerful servers  
**Status:** READY TO BUILD  

**Now go use these superpowers to BUILD THE PROFILE API!** 💪🚀

---

**Setup By:** Cursor (Team Lead)  
**Date:** January 13, 2025  
**Status:** ✅ COMPLETE & READY TO USE
