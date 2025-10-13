/**
 * AIX Communication Hub
 * Advanced agent-to-agent communication system using Node.js and MCP
 * 
 * Features:
 * - Real-time agent communication
 * - Message queuing and routing
 * - Event-driven architecture
 * - MCP protocol integration
 * - Git-based state synchronization
 * - WebSocket support for live updates
 * 
 * @author AMRIKYY AI Solutions
 * @version 1.0.0
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class AIXCommunicationHub extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      workspaceRoot: config.workspaceRoot || '/workspaces/maya-travel-agent',
      communicationDir: config.communicationDir || 'docs/team-communication',
      messageQueueDir: config.messageQueueDir || 'docs/team-communication/messages',
      stateFile: config.stateFile || 'docs/team-communication/shared-state.json',
      pollInterval: config.pollInterval || 5000, // 5 seconds
      maxMessageAge: config.maxMessageAge || 3600000, // 1 hour
      ...config
    };

    this.agents = new Map();
    this.messageQueue = [];
    this.sharedState = {};
    this.isRunning = false;
    this.pollTimer = null;
  }

  /**
   * Initialize the communication hub
   */
  async initialize() {
    console.log('🚀 Initializing AIX Communication Hub...');
    
    // Create necessary directories
    await this.ensureDirectories();
    
    // Load shared state
    await this.loadSharedState();
    
    // Start polling for messages
    this.startPolling();
    
    console.log('✅ AIX Communication Hub initialized');
    this.emit('hub:initialized');
  }

  /**
   * Register an agent with the hub
   */
  async registerAgent(agentId, metadata = {}) {
    const agent = {
      id: agentId,
      name: metadata.name || agentId,
      type: metadata.type || 'generic',
      capabilities: metadata.capabilities || [],
      status: 'active',
      lastSeen: Date.now(),
      messageCount: 0,
      ...metadata
    };

    this.agents.set(agentId, agent);
    
    // Create agent's message directory
    const agentDir = path.join(this.config.workspaceRoot, this.config.messageQueueDir, agentId);
    await fs.mkdir(agentDir, { recursive: true });
    
    console.log(`✅ Agent registered: ${agentId} (${agent.name})`);
    this.emit('agent:registered', agent);
    
    return agent;
  }

  /**
   * Send a message from one agent to another
   */
  async sendMessage(fromAgentId, toAgentId, message) {
    const messageId = this.generateMessageId();
    const timestamp = Date.now();

    const messageEnvelope = {
      id: messageId,
      from: fromAgentId,
      to: toAgentId,
      timestamp,
      type: message.type || 'message',
      priority: message.priority || 'normal',
      content: message.content,
      metadata: message.metadata || {},
      status: 'pending'
    };

    // Save message to recipient's queue
    await this.saveMessage(toAgentId, messageEnvelope);
    
    // Update sender's message count
    const sender = this.agents.get(fromAgentId);
    if (sender) {
      sender.messageCount++;
      sender.lastSeen = timestamp;
    }

    console.log(`📨 Message sent: ${fromAgentId} → ${toAgentId} [${message.type}]`);
    this.emit('message:sent', messageEnvelope);
    
    return messageEnvelope;
  }

  /**
   * Broadcast a message to all agents
   */
  async broadcastMessage(fromAgentId, message) {
    const recipients = Array.from(this.agents.keys()).filter(id => id !== fromAgentId);
    const results = [];

    for (const recipientId of recipients) {
      const result = await this.sendMessage(fromAgentId, recipientId, message);
      results.push(result);
    }

    console.log(`📢 Broadcast from ${fromAgentId} to ${recipients.length} agents`);
    this.emit('message:broadcast', { from: fromAgentId, recipients, message });
    
    return results;
  }

  /**
   * Receive messages for an agent
   */
  async receiveMessages(agentId, options = {}) {
    const agentDir = path.join(this.config.workspaceRoot, this.config.messageQueueDir, agentId);
    
    try {
      const files = await fs.readdir(agentDir);
      const messages = [];

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(agentDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const message = JSON.parse(content);

        // Filter by type if specified
        if (options.type && message.type !== options.type) continue;
        
        // Filter by priority if specified
        if (options.priority && message.priority !== options.priority) continue;

        // Check message age
        if (Date.now() - message.timestamp > this.config.maxMessageAge) {
          await fs.unlink(filePath); // Delete old messages
          continue;
        }

        messages.push(message);
      }

      // Sort by priority and timestamp
      messages.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
      });

      // Update agent's last seen
      const agent = this.agents.get(agentId);
      if (agent) {
        agent.lastSeen = Date.now();
      }

      return messages;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return []; // No messages yet
      }
      throw error;
    }
  }

  /**
   * Mark a message as read/processed
   */
  async markMessageAsRead(agentId, messageId) {
    const agentDir = path.join(this.config.workspaceRoot, this.config.messageQueueDir, agentId);
    const filePath = path.join(agentDir, `${messageId}.json`);

    try {
      await fs.unlink(filePath);
      console.log(`✅ Message marked as read: ${messageId}`);
      this.emit('message:read', { agentId, messageId });
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`❌ Error marking message as read: ${error.message}`);
      }
    }
  }

  /**
   * Update shared state
   */
  async updateSharedState(key, value, agentId) {
    this.sharedState[key] = {
      value,
      updatedBy: agentId,
      timestamp: Date.now()
    };

    await this.saveSharedState();
    
    console.log(`🔄 Shared state updated: ${key} by ${agentId}`);
    this.emit('state:updated', { key, value, agentId });
  }

  /**
   * Get shared state value
   */
  getSharedState(key) {
    return this.sharedState[key]?.value;
  }

  /**
   * Get all shared state
   */
  getAllSharedState() {
    return Object.entries(this.sharedState).reduce((acc, [key, data]) => {
      acc[key] = data.value;
      return acc;
    }, {});
  }

  /**
   * Get agent status
   */
  getAgentStatus(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return null;

    const timeSinceLastSeen = Date.now() - agent.lastSeen;
    const isActive = timeSinceLastSeen < 60000; // Active if seen in last minute

    return {
      ...agent,
      isActive,
      timeSinceLastSeen
    };
  }

  /**
   * Get all agents status
   */
  getAllAgentsStatus() {
    return Array.from(this.agents.values()).map(agent => 
      this.getAgentStatus(agent.id)
    );
  }

  /**
   * Create a task for an agent
   */
  async createTask(forAgentId, task) {
    const taskMessage = {
      type: 'task',
      priority: task.priority || 'normal',
      content: {
        taskId: this.generateMessageId(),
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        requirements: task.requirements || [],
        deliverables: task.deliverables || [],
        status: 'pending'
      },
      metadata: {
        createdAt: Date.now(),
        createdBy: task.createdBy || 'system'
      }
    };

    return await this.sendMessage('system', forAgentId, taskMessage);
  }

  /**
   * Request help from another agent
   */
  async requestHelp(fromAgentId, toAgentId, helpRequest) {
    const helpMessage = {
      type: 'help_request',
      priority: helpRequest.urgent ? 'high' : 'normal',
      content: {
        requestId: this.generateMessageId(),
        issue: helpRequest.issue,
        context: helpRequest.context,
        whatTried: helpRequest.whatTried || [],
        whatNeeded: helpRequest.whatNeeded
      },
      metadata: {
        requestedAt: Date.now()
      }
    };

    return await this.sendMessage(fromAgentId, toAgentId, helpMessage);
  }

  /**
   * Send progress update
   */
  async sendProgressUpdate(fromAgentId, update) {
    const progressMessage = {
      type: 'progress_update',
      priority: 'normal',
      content: {
        taskId: update.taskId,
        progress: update.progress, // 0-100
        status: update.status,
        completedItems: update.completedItems || [],
        blockers: update.blockers || [],
        nextSteps: update.nextSteps || [],
        notes: update.notes
      },
      metadata: {
        timestamp: Date.now()
      }
    };

    return await this.broadcastMessage(fromAgentId, progressMessage);
  }

  /**
   * Report a blocker
   */
  async reportBlocker(fromAgentId, blocker) {
    const blockerMessage = {
      type: 'blocker',
      priority: 'high',
      content: {
        blockerId: this.generateMessageId(),
        title: blocker.title,
        description: blocker.description,
        impact: blocker.impact,
        attemptedSolutions: blocker.attemptedSolutions || [],
        helpNeeded: blocker.helpNeeded
      },
      metadata: {
        reportedAt: Date.now()
      }
    };

    return await this.broadcastMessage(fromAgentId, blockerMessage);
  }

  /**
   * Start polling for new messages
   */
  startPolling() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.pollTimer = setInterval(() => {
      this.emit('hub:poll');
    }, this.config.pollInterval);

    console.log(`🔄 Started polling (interval: ${this.config.pollInterval}ms)`);
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    console.log('⏸️  Stopped polling');
  }

  /**
   * Shutdown the hub
   */
  async shutdown() {
    console.log('🛑 Shutting down AIX Communication Hub...');
    
    this.stopPolling();
    await this.saveSharedState();
    
    this.emit('hub:shutdown');
    this.removeAllListeners();
    
    console.log('✅ Hub shutdown complete');
  }

  // ==================== Private Methods ====================

  async ensureDirectories() {
    const dirs = [
      path.join(this.config.workspaceRoot, this.config.communicationDir),
      path.join(this.config.workspaceRoot, this.config.messageQueueDir)
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async saveMessage(agentId, message) {
    const agentDir = path.join(this.config.workspaceRoot, this.config.messageQueueDir, agentId);
    await fs.mkdir(agentDir, { recursive: true });

    const filePath = path.join(agentDir, `${message.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(message, null, 2));
  }

  async loadSharedState() {
    const stateFilePath = path.join(this.config.workspaceRoot, this.config.stateFile);
    
    try {
      const content = await fs.readFile(stateFilePath, 'utf8');
      this.sharedState = JSON.parse(content);
      console.log('✅ Shared state loaded');
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.sharedState = {};
        await this.saveSharedState();
      } else {
        throw error;
      }
    }
  }

  async saveSharedState() {
    const stateFilePath = path.join(this.config.workspaceRoot, this.config.stateFile);
    await fs.writeFile(stateFilePath, JSON.stringify(this.sharedState, null, 2));
  }

  generateMessageId() {
    return `msg_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }
}

// ==================== MCP Integration ====================

class MCPAgentBridge {
  constructor(communicationHub) {
    this.hub = communicationHub;
    this.mcpServers = new Map();
  }

  /**
   * Register an MCP server for agent communication
   */
  async registerMCPServer(serverId, config) {
    this.mcpServers.set(serverId, {
      id: serverId,
      command: config.command,
      args: config.args || [],
      env: config.env || {},
      enabled: config.enabled !== false,
      description: config.description
    });

    console.log(`✅ MCP Server registered: ${serverId}`);
  }

  /**
   * Send message via MCP protocol
   */
  async sendViaMCP(serverId, method, params) {
    const server = this.mcpServers.get(serverId);
    if (!server || !server.enabled) {
      throw new Error(`MCP server ${serverId} not found or disabled`);
    }

    // MCP message format
    const mcpMessage = {
      jsonrpc: '2.0',
      id: this.hub.generateMessageId(),
      method,
      params
    };

    console.log(`📡 Sending via MCP: ${serverId}.${method}`);
    
    // In a real implementation, this would spawn the MCP server process
    // and communicate via stdio
    return mcpMessage;
  }

  /**
   * Bridge AIX messages to MCP format
   */
  bridgeToMCP(aixMessage) {
    return {
      jsonrpc: '2.0',
      method: `aix.${aixMessage.type}`,
      params: {
        from: aixMessage.from,
        to: aixMessage.to,
        content: aixMessage.content,
        metadata: aixMessage.metadata
      }
    };
  }

  /**
   * Bridge MCP messages to AIX format
   */
  bridgeFromMCP(mcpMessage) {
    return {
      type: mcpMessage.method.replace('aix.', ''),
      content: mcpMessage.params.content,
      metadata: {
        ...mcpMessage.params.metadata,
        mcpId: mcpMessage.id
      }
    };
  }
}

// ==================== Export ====================

module.exports = {
  AIXCommunicationHub,
  MCPAgentBridge
};
