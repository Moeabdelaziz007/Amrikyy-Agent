# Agent Communication Guide

## Overview

This guide explains how AI agents communicate in the Amrikyy platform using two complementary systems:

1. **AIXCommunicationHub** - Node.js event-driven messaging system
2. **MCPAgentServer** - Model Context Protocol (MCP) standard implementation

---

## 🎯 Which System to Use?

### Use AIXCommunicationHub when:
- ✅ You need simple, direct agent-to-agent messaging
- ✅ You want event-driven communication
- ✅ You need message queuing and routing
- ✅ You want shared state management
- ✅ You're building custom workflows

### Use MCPAgentServer when:
- ✅ You need standardized protocol compliance
- ✅ You want to integrate with MCP-compatible clients (Claude Desktop, etc.)
- ✅ You need tool registration and execution
- ✅ You want resource management
- ✅ You're building reusable agent components

### Use Both when:
- ✅ You want maximum flexibility
- ✅ You need both internal messaging and external integration
- ✅ You're building a production system

---

## 📡 System 1: AIXCommunicationHub

### Architecture

```
┌─────────────────────────────────────────────────┐
│         AIXCommunicationHub (Central)           │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Agent   │  │  Agent   │  │  Agent   │     │
│  │  Cursor  │  │   ONA    │  │  Gemini  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│       │             │             │            │
│       └─────────────┼─────────────┘            │
│                     │                          │
│         Message Queue & Routing                │
│         Shared State Management                │
│         Event Broadcasting                     │
└─────────────────────────────────────────────────┘
```

### Quick Start

```javascript
const { AIXCommunicationHub } = require('./backend/src/aix/AIXCommunicationHub');

// Initialize hub
const hub = new AIXCommunicationHub({
  workspaceRoot: '/workspaces/maya-travel-agent',
  pollInterval: 5000
});

await hub.initialize();

// Register agents
await hub.registerAgent('cursor', {
  name: 'Cursor (Team Lead)',
  type: 'coordinator',
  capabilities: ['task_management', 'code_review']
});

await hub.registerAgent('ona', {
  name: 'ONA (Documentation)',
  type: 'documentation',
  capabilities: ['documentation', 'examples']
});

// Send a message
await hub.sendMessage('cursor', 'ona', {
  type: 'task',
  priority: 'high',
  content: {
    title: 'Document AIX System',
    description: 'Create comprehensive documentation'
  }
});

// Receive messages
const messages = await hub.receiveMessages('ona');
console.log(`ONA has ${messages.length} messages`);

// Update shared state
await hub.updateSharedState('project_phase', 'Phase 1', 'cursor');

// Broadcast to all agents
await hub.broadcastMessage('cursor', {
  type: 'announcement',
  content: { message: 'Great progress team!' }
});
```

### Message Types

#### 1. Task Messages
```javascript
await hub.createTask('ona', {
  title: 'Document AIX Parser',
  description: 'Create API documentation',
  priority: 'high',
  deadline: Date.now() + 3600000,
  requirements: ['API docs', 'Examples'],
  deliverables: ['README.md', 'API_REFERENCE.md']
});
```

#### 2. Progress Updates
```javascript
await hub.sendProgressUpdate('ona', {
  taskId: 'task_001',
  progress: 75,
  status: 'in_progress',
  completedItems: ['Created structure', 'Wrote API docs'],
  nextSteps: ['Add examples', 'Review'],
  notes: 'On track for completion'
});
```

#### 3. Help Requests
```javascript
await hub.requestHelp('gemini', 'cursor', {
  issue: 'Performance profiling showing unexpected results',
  context: 'Running node --prof on AIXParser.js',
  whatTried: ['Checked memory leaks', 'Analyzed CPU usage'],
  whatNeeded: 'Second opinion on profiling data',
  urgent: false
});
```

#### 4. Blocker Reports
```javascript
await hub.reportBlocker('gemini', {
  title: 'Missing benchmarking tool',
  description: 'Need proper framework for measurements',
  impact: 'Cannot provide reliable metrics',
  attemptedSolutions: ['Tried console.time()', 'Manual timing'],
  helpNeeded: 'Recommendation for Node.js benchmarking library'
});
```

### Event Handling

```javascript
// Listen to events
hub.on('message:sent', (msg) => {
  console.log(`Message sent: ${msg.from} → ${msg.to}`);
});

hub.on('state:updated', (data) => {
  console.log(`State updated: ${data.key} by ${data.agentId}`);
});

hub.on('agent:registered', (agent) => {
  console.log(`New agent: ${agent.name}`);
});

hub.on('hub:poll', () => {
  console.log('Hub polling for updates...');
});
```

---

## 🔧 System 2: MCPAgentServer

### Architecture

```
┌─────────────────────────────────────────────────┐
│              MCP Client (Host)                  │
│         (Claude Desktop, VS Code, etc.)         │
└─────────────────┬───────────────────────────────┘
                  │ JSON-RPC 2.0
                  │ (stdio/HTTP)
┌─────────────────┴───────────────────────────────┐
│           MCPAgentServer (ONA)                  │
│                                                 │
│  Tools:                                         │
│  - create_documentation                         │
│  - generate_examples                            │
│  - update_progress                              │
│                                                 │
│  Resources:                                     │
│  - file:///progress/ona                         │
│  - file:///docs/index                           │
└─────────────────────────────────────────────────┘
```

### Quick Start

```javascript
const { MCPAgentServer } = require('./backend/src/aix/MCPAgentServer');

// Create custom agent
class MyAgent extends MCPAgentServer {
  constructor() {
    super({
      id: 'my-agent',
      name: 'My Custom Agent',
      type: 'custom',
      capabilities: ['custom_capability']
    });

    this.setupTools();
    this.setupResources();
  }

  setupTools() {
    // Register a tool
    this.registerTool(
      'my_tool',
      'Description of what this tool does',
      {
        type: 'object',
        properties: {
          param1: {
            type: 'string',
            description: 'First parameter'
          },
          param2: {
            type: 'number',
            description: 'Second parameter'
          }
        },
        required: ['param1']
      },
      async (args) => {
        // Tool implementation
        return {
          success: true,
          result: `Processed ${args.param1}`
        };
      }
    );
  }

  setupResources() {
    // Register a resource
    this.registerResource(
      'file:///my-resource',
      'My Resource',
      'Description of this resource',
      'application/json',
      async () => {
        return {
          data: 'Resource content'
        };
      }
    );
  }
}

// Start the agent
const agent = new MyAgent();
await agent.start();
```

### Using Pre-built Agents

#### ONA Documentation Agent

```javascript
const { ONADocumentationAgent } = require('./backend/src/aix/MCPAgentServer');

const ona = new ONADocumentationAgent();
await ona.start();

// Available tools:
// - create_documentation
// - generate_examples
// - update_progress

// Available resources:
// - file:///progress/ona
// - file:///docs/index
```

#### Gemini Performance Agent

```javascript
const { GeminiPerformanceAgent } = require('./backend/src/aix/MCPAgentServer');

const gemini = new GeminiPerformanceAgent();
await gemini.start();

// Available tools:
// - analyze_performance
// - optimize_code
// - run_benchmarks

// Available resources:
// - file:///metrics/performance
// - file:///recommendations/optimizations
```

### Running from Command Line

```bash
# Start ONA agent
node backend/src/aix/MCPAgentServer.js ona

# Start Gemini agent
node backend/src/aix/MCPAgentServer.js gemini
```

### Connecting to Claude Desktop

Add to `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ona-agent": {
      "command": "node",
      "args": [
        "/workspaces/maya-travel-agent/backend/src/aix/MCPAgentServer.js",
        "ona"
      ]
    },
    "gemini-agent": {
      "command": "node",
      "args": [
        "/workspaces/maya-travel-agent/backend/src/aix/MCPAgentServer.js",
        "gemini"
      ]
    }
  }
}
```

---

## 🔄 Combining Both Systems

### Hybrid Architecture

```javascript
const { AIXCommunicationHub } = require('./backend/src/aix/AIXCommunicationHub');
const { ONADocumentationAgent } = require('./backend/src/aix/MCPAgentServer');

// Start communication hub
const hub = new AIXCommunicationHub();
await hub.initialize();

// Register ONA in hub
await hub.registerAgent('ona', {
  name: 'ONA Documentation Agent',
  type: 'documentation'
});

// Start ONA's MCP server (in separate process)
// This allows ONA to:
// 1. Communicate with other agents via hub
// 2. Expose tools/resources via MCP to external clients

// In ONA's process:
const ona = new ONADocumentationAgent();
await ona.start();

// ONA can now:
// - Receive tasks from hub
// - Execute tools via MCP
// - Update progress in hub
// - Provide resources via MCP
```

---

## 📊 Comparison

| Feature | AIXCommunicationHub | MCPAgentServer |
|---------|---------------------|----------------|
| **Protocol** | Custom (Event-driven) | MCP (JSON-RPC 2.0) |
| **Transport** | File-based + Events | stdio / HTTP |
| **Use Case** | Internal messaging | External integration |
| **Complexity** | Simple | Standard-compliant |
| **Flexibility** | High | Structured |
| **Integration** | Custom agents | MCP clients |
| **State Management** | Built-in | Via resources |
| **Message Queue** | Yes | No (request/response) |
| **Broadcasting** | Yes | No |
| **Tool Execution** | Custom | MCP standard |

---

## 🚀 Best Practices

### 1. Message Priority

Use appropriate priority levels:
- `critical`: System failures, security issues
- `high`: Blockers, urgent help requests
- `normal`: Regular tasks, updates
- `low`: Nice-to-have, informational

### 2. Error Handling

```javascript
try {
  await hub.sendMessage('cursor', 'ona', message);
} catch (error) {
  console.error('Failed to send message:', error);
  // Implement retry logic or fallback
}
```

### 3. Resource Cleanup

```javascript
// Always cleanup on shutdown
process.on('SIGINT', async () => {
  await hub.shutdown();
  await agent.stop();
  process.exit(0);
});
```

### 4. Logging

```javascript
// Use stderr for logging in MCP servers
console.error('MCP server started'); // ✅ Good
console.log('MCP server started');   // ❌ Bad (corrupts JSON-RPC)
```

### 5. Tool Naming

Follow MCP conventions:
- Use snake_case: `create_documentation` ✅
- Be descriptive: `doc` ❌, `create_documentation` ✅
- Namespace if needed: `ona_create_documentation` ✅

---

## 🔍 Debugging

### AIXCommunicationHub

```javascript
// Enable debug logging
hub.on('message:sent', console.log);
hub.on('message:read', console.log);
hub.on('state:updated', console.log);

// Check agent status
const status = hub.getAllAgentsStatus();
console.log('Agent status:', status);

// Inspect message queue
const messages = await hub.receiveMessages('ona');
console.log('Pending messages:', messages);
```

### MCPAgentServer

```bash
# Run with debug output
DEBUG=* node backend/src/aix/MCPAgentServer.js ona

# Check MCP Inspector
npx @modelcontextprotocol/inspector node backend/src/aix/MCPAgentServer.js ona
```

---

## 📚 Examples

See complete examples in:
- `backend/src/aix/examples/communication-example.js`
- `backend/src/aix/MCPAgentServer.js` (built-in agents)

Run the demo:
```bash
node backend/src/aix/examples/communication-example.js
```

---

## 🔗 Resources

- [Model Context Protocol Docs](https://modelcontextprotocol.io)
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-06-18)
- [AIX Specification](../../aix-tools/docs/AIX_SPEC.md)
- [Team Communication Guide](../../TEAM_COMMUNICATION_AR.md)

---

## 💡 Tips

1. **Start Simple**: Use AIXCommunicationHub for basic messaging
2. **Add MCP Later**: Implement MCP when you need external integration
3. **Test Locally**: Use MCP Inspector to test your agents
4. **Monitor Events**: Listen to hub events for debugging
5. **Document Tools**: Provide clear descriptions for all tools
6. **Version Resources**: Include version info in resource URIs
7. **Handle Errors**: Always implement proper error handling
8. **Clean Up**: Properly shutdown agents and hubs

---

**Last Updated:** 2025-01-13  
**Version:** 1.0  
**Status:** Production Ready ✅
