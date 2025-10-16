# 🎯 Evolve Manager - Quick Reference

## 📋 Commands & Usage

### CLI Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/help` | Show all commands | `/help` |
| `/status` | System status | `/status` |
| `/agents` | List agents | `/agents` |
| `/dashboard` | Toggle dashboard | `/dashboard` |
| `/history` | Request history | `/history` |
| `/patterns` | Learning status | `/patterns` |
| `/health` | Health report | `/health` |
| `/clear` | Clear screen | `/clear` |
| `/export` | Export data | `/export` |
| `/quit` | Exit CLI | `/quit` |

### Request Types

#### Travel Requests
```
"Plan a 7-day trip to Tokyo for 2 people"
"Find budget hotels in Paris under $100/night"
"Suggest cultural experiences in Kyoto"
"Optimize my travel budget for Europe trip"
```

#### Development Requests
```
"Build a user authentication system"
"Create a REST API for my app"
"Help me debug this JavaScript error"
"Design a database schema for e-commerce"
```

#### Learning Requests
```
"Explain machine learning basics"
"Show me how to use React hooks"
"Teach me about API design principles"
"Tutorial for building a web scraper"
```

#### General Requests
```
"Analyze my project structure"
"Help me organize my files"
"Suggest improvements for my workflow"
"Research best practices for [topic]"
```

## 🏗️ Architecture

### Core Components

```
YOU → Evolve Manager → Specialized Agents
              ↓
         Pattern Learning ← Journal Memory
              ↓
       Real-time Dashboard ← Monitoring
```

### Agent Hierarchy

#### Manager Level
- **Evolve Manager** - Main coordinator (You talk to this)

#### Specialist Level
- **Maya Travel Agents** - Luna, Karim, Layla, Amira, Tariq, Zara
- **Development Agents** - Code Architect, Test Engineer
- **General Agents** - Research, Analysis, Documentation

## 📊 Dashboard Features

### Real-time Monitoring
- **Active Tasks** - Currently processing requests
- **Agent Status** - Health and availability
- **Performance Metrics** - Response times, success rates
- **Pattern Learning** - Insights and learning progress
- **System Health** - Overall system status

### Key Metrics
- **Success Rate** - Percentage of successful requests
- **Response Time** - Average processing time
- **Patterns Learned** - Number of learned patterns
- **Active Agents** - Currently available agents

## 🔧 Configuration

### Environment Variables

```bash
# Basic Settings
EVOLVE_LOG_LEVEL=info
EVOLVE_DASHBOARD_ENABLED=true

# Journal Integration (Optional)
MCP_JOURNAL_SERVER_URL=http://localhost:3001
MCP_JOURNAL_API_KEY=your_api_key
MCP_JOURNAL_ENCRYPTION_KEY=your_key

# Performance Tuning
MAX_CONCURRENT_TASKS=5
TASK_TIMEOUT_MS=30000
```

### File Structure

```
backend/src/agents/evolve/
├── EvolveOrchestrator.js           # Main manager
├── EvolveManagerDashboard.js       # Monitoring dashboard
└── EnhancedPatternLearningEngineWithJournal.js  # Pattern learning

backend/src/mcp/
├── MCPJournalClient.js             # Journal connection
├── PatternJournalAdapter.js        # Data transformation
└── JournalDataMonitor.js           # Health monitoring

talk-to-evolve.js                   # Interactive CLI
backend/examples/evolve-manager-demo.js  # Demo script
```

## 🚀 Usage Examples

### Basic Usage

```bash
# Start CLI
node talk-to-evolve.js

# Enable dashboard
/dashboard

# Make request
🧠 Evolve> Plan a trip to Japan

# Check status
/status

# View agents
/agents
```

### Programmatic Usage

```javascript
const { EvolveOrchestrator } = require('./backend/src/agents/evolve/EvolveOrchestrator');

const evolve = new EvolveOrchestrator();

const result = await evolve.processRequest({
  message: "Build an authentication system",
  type: "development_request"
}, "user123");
```

## 🛠️ Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Not initialized" | Check file paths and dependencies |
| "Maya not available" | Verify Maya orchestrator is running |
| "Pattern engine error" | Check journal connection (optional) |
| "High memory usage" | Normal during initial learning |

### Debug Commands

```bash
# Check logs
tail -f logs/evolve-manager.log

# Test journal connection
node -e "
const client = require('./backend/src/mcp/MCPJournalClient');
console.log('Testing connection...');
"

# Verify agent loading
node -e "
const agents = require('./backend/src/agents/MayaVoiceAgents');
console.log('Agents loaded:', Object.keys(agents));
"
```

## 📈 Performance Tips

### Optimization

1. **Enable Compression** - Reduces memory usage
2. **Set Appropriate Timeouts** - Prevent hanging requests
3. **Monitor Resource Usage** - Track memory and CPU
4. **Regular Cleanup** - Remove old patterns periodically

### Best Practices

1. **Clear Requests** - Be specific about what you want
2. **Natural Language** - Talk to Evolve like a person
3. **Use Dashboard** - Monitor system performance
4. **Check History** - Learn from past requests

## 🔗 Integration

### With Existing Systems

```javascript
// Maya Travel Agent integration
const mayaOrchestrator = new MasterOrchestrator();
evolve.setMayaOrchestrator(mayaOrchestrator);

// Custom agent integration
evolve.registerAgent('custom_agent', {
  name: 'My Custom Agent',
  capabilities: ['custom_task'],
  handler: myHandlerFunction
});
```

### API Integration

```javascript
// REST API endpoint
app.post('/api/evolve/request', async (req, res) => {
  const result = await evolve.processRequest(req.body);
  res.json(result);
});
```

## 📚 Resources

- **[Setup Guide](EVOLVE_MANAGER_SETUP.md)** - Complete installation
- **[Quick Start](QUICK_START_EVOLVE.md)** - Fast setup
- **[Demo Script](backend/examples/evolve-manager-demo.js)** - Examples
- **[API Docs](API_DOCUMENTATION.md)** - Technical reference

## 🎯 Key Features

✅ **Single Entry Point** - Talk only to Evolve
✅ **Automatic Delegation** - Smart agent selection
✅ **Pattern Learning** - Gets smarter over time
✅ **Real-time Monitoring** - Live dashboard
✅ **Persistent Memory** - Remembers across sessions
✅ **Multi-domain Support** - Travel, development, general
✅ **Maya Integration** - Works with existing travel agents

## 🚨 Support

### Getting Help

1. **Check Status** - Use `/status` command
2. **View Logs** - Check log files for errors
3. **Test Connection** - Verify all components
4. **Review Documentation** - Check setup guides

### Quick Diagnostics

```bash
# System health
node -e "
const { EvolveOrchestrator } = require('./backend/src/agents/evolve/EvolveOrchestrator');
const evolve = new EvolveOrchestrator();
console.log('Health:', evolve.getSystemHealth());
"
```

---

## 🎊 Ready to Use!

**Evolve Manager is your AI coordination hub!**

- 🗣️ **Talk naturally** - Use conversational language
- 📊 **Monitor progress** - Use the dashboard
- 🧠 **Learn patterns** - System improves automatically
- 🔗 **Integrate easily** - Works with existing systems

**Start using Evolve today!** 🚀