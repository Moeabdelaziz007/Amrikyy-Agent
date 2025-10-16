# 🚀 Evolve Manager - Quick Start Guide

## Get Started in 5 Minutes!

This guide will get you up and running with the Evolve Manager in just a few simple steps.

## ✅ Prerequisites

- **Node.js 20+** installed
- **Maya Travel Agent** project set up
- **Terminal/Command prompt** access

## 🎯 Step 1: Quick Setup

### 1.1 Navigate to Your Project
```bash
cd /Users/Shared/maya-travel-agent
```

### 1.2 Install Dependencies (if needed)
```bash
npm install axios winston
```

### 1.3 Set Environment Variables (Optional)
```bash
# Basic configuration
export EVOLVE_LOG_LEVEL=info
export EVOLVE_DASHBOARD_ENABLED=true

# For pattern learning with journal (optional)
export MCP_JOURNAL_SERVER_URL=http://localhost:3001
```

## 🎯 Step 2: Start Using Evolve

### Option A: Interactive CLI (Recommended)

```bash
# Start the interactive CLI
node talk-to-evolve.js
```

**What you'll see:**
```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                          🎯 EVOLVE MANAGER CLI                              ║
║                                                                              ║
║                    Your AI Manager & Pattern Learning Agent                 ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

🎉 Welcome to Evolve Manager CLI!

💬 You can now talk to Evolve, your AI Manager agent.
📚 Type /help to see available commands.
🚀 Start by telling Evolve what you need help with!

Examples:
  • "Build a user authentication system"
  • "Plan a trip to Japan"
  • "Help me learn React"
  • "Analyze my project structure"

🧠 Evolve>
```

### Option B: Run the Demo

```bash
# See Evolve in action with sample requests
node backend/examples/evolve-manager-demo.js
```

## 🎯 Step 3: Make Your First Request

### In the CLI, try these examples:

**Travel Planning:**
```
🧠 Evolve> Plan a 7-day trip to Tokyo for 2 people with a $3000 budget
```

**Development:**
```
🧠 Evolve> Build a user authentication system with JWT tokens
```

**Learning:**
```
🧠 Evolve> Explain machine learning and show me a simple example
```

**General Assistance:**
```
🧠 Evolve> Help me organize my project files and suggest improvements
```

## 🎯 Step 4: Explore Features

### Available Commands:

| Command | Description |
|---------|-------------|
| `/help` | Show all commands |
| `/status` | System status and health |
| `/agents` | List available agents |
| `/dashboard` | Toggle live dashboard |
| `/history` | Recent requests |
| `/patterns` | Pattern learning status |
| `/health` | Detailed health report |
| `/clear` | Clear screen |
| `/export` | Export session data |
| `/quit` | Exit |

### Dashboard Features:

When you enable the dashboard (`/dashboard`), you'll see:
- 📊 **Real-time updates** during request processing
- 🧠 **Pattern learning** notifications
- 📈 **Performance metrics**
- 🤖 **Agent status** updates

## 🎯 Step 5: Integration Examples

### Use in Your Code:

```javascript
// Import Evolve Manager
const { EvolveOrchestrator } = require('./backend/src/agents/evolve/EvolveOrchestrator');

// Create instance
const evolve = new EvolveOrchestrator();

// Process a request
const result = await evolve.processRequest({
  message: "Plan a trip to Paris",
  type: "travel_request"
}, "user123", {
  source: "my_app",
  priority: "normal"
});

// Handle the result
if (result.success) {
  console.log("Success:", result.result);
} else {
  console.log("Error:", result.error);
}
```

### HTTP API Integration:

```javascript
// POST request to Evolve Manager
const response = await fetch('/api/evolve/process', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    request: "Build an API for my travel app",
    userId: "user123",
    context: { source: "web_app" }
  })
});

const result = await response.json();
```

## 🚨 Troubleshooting

### Common Issues & Solutions:

**❌ "Evolve Manager is not initialized"**
```bash
# Make sure you're in the right directory
pwd  # Should show: /Users/Shared/maya-travel-agent

# Check if files exist
ls backend/src/agents/evolve/
```

**❌ "Maya orchestrator not available"**
```bash
# Check if Maya agents are working
node -e "console.log('Maya agents loaded:', !!require('./backend/src/agents/MayaVoiceAgents'))"
```

**❌ "Pattern engine not available"**
```bash
# Check journal connection (optional)
echo $MCP_JOURNAL_SERVER_URL
```

**❌ High memory usage**
```bash
# The system is learning - this is normal!
# Memory usage will stabilize after initial learning period
```

## 🎉 What's Next?

### After your first successful run:

1. **Explore Advanced Features:**
   - Try complex multi-step requests
   - Enable the live dashboard
   - Check pattern learning insights

2. **Customize for Your Needs:**
   - Add custom agents
   - Modify learning behavior
   - Integrate with your existing systems

3. **Production Deployment:**
   - Set up proper logging
   - Configure monitoring
   - Set up backup strategies

### Example Workflow:

```bash
# 1. Start Evolve
node talk-to-evolve.js

# 2. Enable dashboard
/dashboard

# 3. Make a request
🧠 Evolve> Plan a weekend trip to the mountains

# 4. Watch real-time progress
# 5. See the results
# 6. Check patterns learned
/patterns

# 7. Try another request
🧠 Evolve> Build a simple web app for tracking expenses
```

## 📚 Learn More

- **[Setup Guide](EVOLVE_MANAGER_SETUP.md)** - Detailed installation
- **[Quick Reference](EVOLVE_QUICK_REFERENCE.md)** - Command reference
- **[Demo Script](backend/examples/evolve-manager-demo.js)** - See examples

## 🎯 Pro Tips

### For Best Results:

1. **Be Specific**: Clear requests get better results
   - ✅ "Plan a 3-day trip to Kyoto with cultural focus"
   - ❌ "Plan a trip"

2. **Use Natural Language**: Talk to Evolve like a person
   - ✅ "I need help building an authentication system"
   - ❌ "auth system build"

3. **Enable Dashboard**: See what's happening in real-time
   ```bash
   /dashboard  # Toggle on
   ```

4. **Check History**: Learn from past requests
   ```bash
   /history  # See recent requests
   ```

## 🚨 Need Help?

If something doesn't work:

1. **Check the logs**: `tail -f logs/evolve-manager.log`
2. **Verify setup**: Use `/health` command
3. **Test connection**: Try a simple request first
4. **Check dependencies**: Ensure all files are in place

---

## 🎊 You're Ready!

**Congratulations!** You've successfully set up Evolve Manager.

**Next Steps:**
1. Try the examples above
2. Make your first request
3. Explore the dashboard features
4. Start integrating into your workflow

**Evolve is now your AI manager!** 🧠✨

*Happy managing! 🎯*