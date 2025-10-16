# Evolve Manager Setup Guide

## Complete Installation and Configuration Guide

This guide provides detailed instructions for setting up the Evolve Manager system in your Maya Travel Agent project.

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 20.x or higher
- **Memory**: At least 2GB RAM
- **Storage**: 1GB free space for logs and data
- **Network**: Internet connection for MCP servers

### Required Software
```bash
# Check Node.js version
node --version

# If Node.js is not installed or version is too old:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 🚀 Installation

### Step 1: Navigate to Project Directory
```bash
cd /Users/Shared/maya-travel-agent
```

### Step 2: Install Dependencies
```bash
# Install main project dependencies
npm install

# Install additional dependencies for Evolve Manager
npm install axios winston
```

### Step 3: Environment Configuration

Create or update your `.env` file:

```bash
# Evolve Manager Configuration
EVOLVE_MANAGER_VERSION=1.0.0
EVOLVE_LOG_LEVEL=info
EVOLVE_DASHBOARD_ENABLED=true

# MCP Journal Integration (Optional)
MCP_JOURNAL_SERVER_URL=http://localhost:3001
MCP_JOURNAL_API_KEY=your_api_key_here
MCP_JOURNAL_ENCRYPTION_KEY=your_encryption_key_here

# Maya Travel Agent Integration
MAYA_ORCHESTRATOR_ENABLED=true
MAYA_AGENT_AUTO_DISCOVERY=true

# Performance Settings
MAX_CONCURRENT_TASKS=5
TASK_TIMEOUT_MS=30000
PATTERN_LEARNING_ENABLED=true
```

### Step 4: Directory Structure Setup

The following directories should be created automatically:
```
backend/
├── src/
│   ├── agents/
│   │   └── evolve/           # Evolve Manager components
│   │       ├── EvolveOrchestrator.js
│   │       ├── EvolveManagerDashboard.js
│   │       └── EnhancedPatternLearningEngineWithJournal.js
│   ├── mcp/                  # MCP integration layer
│   │   ├── MCPJournalClient.js
│   │   ├── PatternJournalAdapter.js
│   │   └── JournalDataMonitor.js
│   └── examples/             # Demo and example scripts
│       └── evolve-manager-demo.js
├── logs/                     # Log files
talk-to-evolve.js            # Interactive CLI
```

## ⚙️ Configuration

### Evolve Manager Configuration

#### Basic Configuration (`backend/src/agents/evolve/EvolveOrchestrator.js`)

```javascript
// Key configuration options
const config = {
  // Task processing
  maxConcurrentTasks: 5,
  defaultTaskTimeout: 30000,

  // Pattern learning
  patternLearningEnabled: true,
  maxPatternsStored: 1000,
  learningRate: 0.1,

  // Agent coordination
  mayaIntegrationEnabled: true,
  autoAgentDiscovery: true,

  // Dashboard
  dashboardEnabled: true,
  realTimeUpdates: true
};
```

#### Pattern Learning Configuration (`backend/src/agents/evolve/EnhancedPatternLearningEngineWithJournal.js`)

```javascript
// Pattern learning settings
const learningConfig = {
  minConfidenceThreshold: 0.6,
  maxPatterns: 1000,
  memoryRetentionDays: 90,
  insightGenerationInterval: 10,
  patternSimilarityThreshold: 0.8
};
```

### MCP Journal Integration

#### Journal Client Configuration (`backend/src/mcp/MCPJournalClient.js`)

```javascript
const journalConfig = {
  serverUrl: process.env.MCP_JOURNAL_SERVER_URL,
  apiKey: process.env.MCP_JOURNAL_API_KEY,
  encryptionKey: process.env.MCP_JOURNAL_ENCRYPTION_KEY,
  timeout: 10000,
  retryAttempts: 3
};
```

#### Data Adapter Configuration (`backend/src/mcp/PatternJournalAdapter.js`)

```javascript
const adapterConfig = {
  compressionEnabled: true,
  encryptionEnabled: false,
  schemas: {
    pattern_to_journal: { /* schema definition */ },
    interaction_to_journal: { /* schema definition */ }
  }
};
```

## 🔧 Integration with Existing Systems

### Maya Travel Agent Integration

The Evolve Manager integrates seamlessly with your existing Maya Travel Agent system:

#### Automatic Agent Discovery
```javascript
// Evolve automatically discovers Maya agents
const mayaAgents = [
  'luna_trip_architect',
  'karim_budget_optimizer',
  'layla_cultural_guide',
  'amira_problem_solver',
  'tariq_payment_manager',
  'zara_research_specialist'
];
```

#### Task Delegation Strategy
```javascript
// Travel requests are delegated to Maya orchestrator
if (domain === 'travel' && mayaOrchestrator) {
  executionStrategy = 'maya_orchestrator';
}
```

### MCP Server Integration

#### Existing MCP Servers
The system works with your current MCP configuration:
- **Google Maps MCP**: For location and routing
- **Weather MCP**: For travel planning
- **Stripe MCP**: For payment processing
- **Supabase MCP**: For data storage

#### Private Journal MCP (Optional)
For enhanced pattern learning:
```bash
# Set up Private Journal MCP server
git clone https://github.com/your-org/private-journal-mcp.git
cd private-journal-mcp
npm install
npm run build

# Start the server
export MCP_JOURNAL_SERVER_URL=http://localhost:3001
npm start
```

## 🏃‍♂️ Running the System

### Method 1: Interactive CLI
```bash
# Start the interactive CLI
node talk-to-evolve.js

# Commands available:
/help       - Show help
/status     - System status
/agents     - List agents
/dashboard  - Toggle dashboard
/history    - Request history
/quit       - Exit
```

### Method 2: Programmatic Usage
```javascript
const { EvolveOrchestrator } = require('./backend/src/agents/evolve/EvolveOrchestrator');

const evolve = new EvolveOrchestrator();

// Process a request
const result = await evolve.processRequest({
  message: "Plan a trip to Tokyo",
  type: "travel_request"
}, "user123", {
  source: "api",
  priority: "normal"
});
```

### Method 3: Demo Mode
```bash
# Run the demo script
node backend/examples/evolve-manager-demo.js
```

## 📊 Monitoring and Dashboard

### Real-time Dashboard

The Evolve Manager includes a comprehensive monitoring dashboard:

#### Dashboard Features
- **System Health**: Overall system status
- **Active Tasks**: Currently processing requests
- **Agent Status**: All connected agents and their status
- **Performance Metrics**: Response times, success rates
- **Pattern Learning**: Learning progress and insights
- **Recent Activity**: Latest system activities

#### Accessing the Dashboard
```bash
# Enable dashboard in CLI
node talk-to-evolve.js
/dashboard  # Toggle dashboard display
```

### Logging

#### Log Files
- `logs/evolve-manager.log` - Main Evolve Manager logs
- `logs/evolve-dashboard.log` - Dashboard activity logs
- `logs/pattern-engine.log` - Pattern learning logs
- `logs/mcp-journal-client.log` - Journal integration logs

#### Log Levels
```javascript
// Configure log levels
const logger = winston.createLogger({
  level: process.env.EVOLVE_LOG_LEVEL || 'info',
  // ... logger configuration
});
```

## 🔍 Troubleshooting

### Common Issues

#### Issue 1: Evolve Manager Won't Start
```bash
# Check Node.js version
node --version

# Check for missing dependencies
npm list

# Check environment variables
echo $MCP_JOURNAL_SERVER_URL
```

#### Issue 2: Maya Agent Integration Fails
```bash
# Verify Maya orchestrator is running
node -e "console.log('Maya agents:', require('./backend/src/agents/MayaVoiceAgents'))"

# Check agent initialization logs
tail -f logs/master-orchestrator.log
```

#### Issue 3: Pattern Learning Not Working
```bash
# Check journal connection
node -e "
const { MCPJournalClient } = require('./backend/src/mcp/MCPJournalClient');
const client = new MCPJournalClient();
client.healthCheck().then(console.log).catch(console.error);
"

# Verify pattern engine initialization
tail -f logs/pattern-engine.log
```

#### Issue 4: High Memory Usage
```bash
# Check for memory leaks
node --expose-gc -e "
setInterval(() => {
  global.gc();
  console.log('Memory:', process.memoryUsage());
}, 10000);
"

# Reduce pattern storage
// In EvolveOrchestrator.js, reduce maxPatterns
maxPatterns: 500  // Instead of 1000
```

### Debug Mode

Enable debug logging for troubleshooting:

```bash
# Set debug log level
export EVOLVE_LOG_LEVEL=debug

# Run with verbose output
DEBUG=* node talk-to-evolve.js
```

## 🚀 Performance Optimization

### Memory Optimization
```javascript
// Configure memory limits
const memoryConfig = {
  maxPatterns: 500,           // Reduce from 1000
  maxInteractionHistory: 500, // Reduce from 1000
  cleanupInterval: 3600000    // 1 hour instead of 30 minutes
};
```

### Performance Settings
```javascript
// Optimize for speed
const performanceConfig = {
  maxConcurrentTasks: 3,      // Reduce concurrency
  taskTimeout: 15000,         // Shorter timeout
  cacheEnabled: true,         // Enable caching
  compressionEnabled: true    // Enable compression
};
```

### Scaling Configuration
```javascript
// For high-load scenarios
const scalingConfig = {
  maxConcurrentTasks: 10,
  loadBalancerEnabled: true,
  queueSystem: 'redis',
  horizontalScaling: true
};
```

## 🔒 Security Considerations

### API Keys and Secrets
```bash
# Store secrets securely
export MCP_JOURNAL_API_KEY=$(openssl rand -hex 32)
export MCP_JOURNAL_ENCRYPTION_KEY=$(openssl rand -hex 64)

# Use secret management in production
# AWS Secrets Manager, HashiCorp Vault, etc.
```

### Data Encryption
```javascript
// Enable encryption for sensitive data
const securityConfig = {
  encryptionEnabled: true,
  encryptionAlgorithm: 'aes-256-gcm',
  keyRotationDays: 30,
  secureKeyStorage: true
};
```

### Access Control
```javascript
// Implement proper access control
const accessControl = {
  allowedUsers: ['admin', 'manager'],
  rateLimiting: true,
  auditLogging: true,
  ipWhitelist: ['127.0.0.1']
};
```

## 📈 Monitoring and Alerting

### Health Checks
```bash
# Set up health check endpoint
curl http://localhost:3000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Alert Configuration
```javascript
// Configure alerts in JournalDataMonitor
const alertConfig = {
  maxStorageFailures: 5,
  maxRetrievalFailures: 3,
  minDataQualityScore: 80,
  maxLatencyMs: 5000
};
```

### Metrics Collection
```javascript
// Enable metrics collection
const metricsConfig = {
  collectPerformanceMetrics: true,
  collectBusinessMetrics: true,
  exportToExternalSystem: false,
  retentionDays: 90
};
```

## 🔄 Backup and Recovery

### Data Backup
```bash
# Export all data
node -e "
const { EvolveOrchestrator } = require('./backend/src/agents/evolve/EvolveOrchestrator');
const evolve = new EvolveOrchestrator();
// Export logic here
"
```

### Recovery Procedures
```bash
# Restore from backup
node scripts/restore-evolve-data.js backup-file.json

# Verify restoration
node -e "
const { EvolveOrchestrator } = require('./backend/src/agents/evolve/EvolveOrchestrator');
const evolve = new EvolveOrchestrator();
console.log('Health:', evolve.getSystemHealth());
"
```

## 📞 Support

### Getting Help

1. **Check the logs**: `tail -f logs/evolve-manager.log`
2. **Run diagnostics**: `node scripts/diagnose-evolve.js`
3. **Check system health**: Use the `/health` command in CLI
4. **Review documentation**: This setup guide and quick start guide

### Common Commands
```bash
# Quick system check
node -e "console.log('Node version:', process.version)"

# Check disk space
df -h

# Check memory usage
free -h

# Check network connectivity
ping google.com
```

## 🎯 Next Steps

After completing this setup:

1. **Test the installation**:
   ```bash
   node backend/examples/evolve-manager-demo.js
   ```

2. **Try the interactive CLI**:
   ```bash
   node talk-to-evolve.js
   ```

3. **Integrate with your application**:
   ```javascript
   const { EvolveOrchestrator } = require('./backend/src/agents/evolve/EvolveOrchestrator');
   ```

4. **Customize for your needs**:
   - Adjust configuration settings
   - Add custom agents
   - Modify pattern learning behavior

## 📚 Additional Resources

- [Quick Start Guide](QUICK_START_EVOLVE.md) - Fast setup
- [Quick Reference](EVOLVE_QUICK_REFERENCE.md) - Command reference
- [API Documentation](API_DOCUMENTATION.md) - Technical API docs
- [Architecture Guide](ARCHITECTURE.md) - System architecture

---

**Congratulations!** 🎉 You have successfully set up the Evolve Manager system. The AI manager is now ready to coordinate your agents and learn from interactions!

For questions or issues, please refer to the troubleshooting section or check the logs for detailed error information.