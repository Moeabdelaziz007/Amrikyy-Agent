/**
 * AIX Communication Hub - Node.js Implementation
 * Created by Cursor - Team Lead
 * 
 * Central communication hub for AI agents using Node.js
 * Supports real-time messaging, task coordination, and quantum workflow
 */

const { EventEmitter } = require('events');
const { logger } = require('../utils/logger');
const AIXPingSystem = require('./AIXPingSystem');

// Create logger for Communication Hub
const log = logger.child('AIXCommunicationHub');

/**
 * AIX Communication Hub
 * Central hub for agent communication and coordination
 */
class AIXCommunicationHub extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.messageQueue = [];
    this.isProcessing = false;
    this.pingSystem = new AIXPingSystem();
    
    // Initialize communication protocols
    this.protocols = {
      AIX3: this.handleAIX3Message.bind(this),
      QUANTUM: this.handleQuantumMessage.bind(this),
      PING: this.handlePingMessage.bind(this),
      TASK: this.handleTaskMessage.bind(this)
    };
    
    log.info('AIX Communication Hub initialized');
  }

  /**
   * Register an agent with the communication hub
   * @param {string} agentId - Unique agent identifier
   * @param {Object} agent - Agent instance
   * @param {Object} capabilities - Agent capabilities
   */
  registerAgent(agentId, agent, capabilities = {}) {
    const agentInfo = {
      id: agentId,
      instance: agent,
      capabilities,
      status: 'online',
      lastSeen: Date.now(),
      messageCount: 0,
      responseTime: 0
    };

    this.agents.set(agentId, agentInfo);
    this.emit('agentRegistered', agentInfo);
    
    log.info('Agent registered', { agentId, capabilities });
  }

  /**
   * Send message to specific agent
   * @param {string} fromAgent - Sender agent ID
   * @param {string} toAgent - Recipient agent ID
   * @param {Object} message - Message content
   * @param {string} protocol - Communication protocol
   */
  async sendMessage(fromAgent, toAgent, message, protocol = 'AIX3') {
    const messageId = this.generateMessageId();
    const timestamp = new Date().toISOString();
    
    const messageData = {
      id: messageId,
      from: fromAgent,
      to: toAgent,
      protocol,
      message,
      timestamp,
      status: 'pending'
    };

    // Add to message queue
    this.messageQueue.push(messageData);
    
    // Process message queue
    await this.processMessageQueue();
    
    log.info('Message sent', { messageId, fromAgent, toAgent, protocol });
    return messageId;
  }

  /**
   * Broadcast message to all agents
   * @param {string} fromAgent - Sender agent ID
   * @param {Object} message - Message content
   * @param {string} protocol - Communication protocol
   */
  async broadcastMessage(fromAgent, message, protocol = 'AIX3') {
    const messageId = this.generateMessageId();
    const timestamp = new Date().toISOString();
    
    const broadcastData = {
      id: messageId,
      from: fromAgent,
      to: 'ALL',
      protocol,
      message,
      timestamp,
      status: 'broadcast'
    };

    // Send to all agents
    for (const [agentId, agentInfo] of this.agents) {
      if (agentId !== fromAgent) {
        await this.deliverMessage(agentId, broadcastData);
      }
    }
    
    log.info('Message broadcasted', { messageId, fromAgent, protocol });
    return messageId;
  }

  /**
   * Process message queue
   */
  async processMessageQueue() {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      await this.processMessage(message);
    }
    
    this.isProcessing = false;
  }

  /**
   * Process individual message
   * @param {Object} message - Message to process
   */
  async processMessage(message) {
    try {
      const { to, protocol, message: content } = message;
      
      if (to === 'ALL') {
        await this.broadcastMessage(message.from, content, protocol);
      } else {
        await this.deliverMessage(to, message);
      }
      
      message.status = 'delivered';
      this.emit('messageProcessed', message);
      
    } catch (error) {
      log.error('Error processing message', { error: error.message, message });
      message.status = 'failed';
      this.emit('messageFailed', { message, error });
    }
  }

  /**
   * Deliver message to specific agent
   * @param {string} agentId - Target agent ID
   * @param {Object} message - Message to deliver
   */
  async deliverMessage(agentId, message) {
    const agentInfo = this.agents.get(agentId);
    
    if (!agentInfo) {
      log.warn('Agent not found', { agentId });
      return;
    }

    if (agentInfo.status !== 'online') {
      log.warn('Agent offline', { agentId, status: agentInfo.status });
      return;
    }

    // Update agent stats
    agentInfo.messageCount++;
    agentInfo.lastSeen = Date.now();
    
    // Deliver message based on protocol
    const protocol = this.protocols[message.protocol];
    if (protocol) {
      await protocol(agentId, message);
    } else {
      log.warn('Unknown protocol', { protocol: message.protocol });
    }
  }

  /**
   * Handle AIX3 protocol messages
   * @param {string} agentId - Target agent ID
   * @param {Object} message - Message to handle
   */
  async handleAIX3Message(agentId, message) {
    const agentInfo = this.agents.get(agentId);
    
    if (agentInfo && agentInfo.instance && typeof agentInfo.instance.processAIX3Message === 'function') {
      await agentInfo.instance.processAIX3Message(message);
    } else {
      log.warn('Agent does not support AIX3 protocol', { agentId });
    }
  }

  /**
   * Handle Quantum protocol messages
   * @param {string} agentId - Target agent ID
   * @param {Object} message - Message to handle
   */
  async handleQuantumMessage(agentId, message) {
    const agentInfo = this.agents.get(agentId);
    
    if (agentInfo && agentInfo.instance && typeof agentInfo.instance.processQuantumMessage === 'function') {
      await agentInfo.instance.processQuantumMessage(message);
    } else {
      log.warn('Agent does not support Quantum protocol', { agentId });
    }
  }

  /**
   * Handle Ping protocol messages
   * @param {string} agentId - Target agent ID
   * @param {Object} message - Message to handle
   */
  async handlePingMessage(agentId, message) {
    // Use AIX Ping System
    await this.pingSystem.receivePong({
      pingId: message.message.pingId,
      fromAgent: agentId,
      status: message.message.status,
      message: message.message.response
    });
  }

  /**
   * Handle Task protocol messages
   * @param {string} agentId - Target agent ID
   * @param {Object} message - Message to handle
   */
  async handleTaskMessage(agentId, message) {
    const agentInfo = this.agents.get(agentId);
    
    if (agentInfo && agentInfo.instance && typeof agentInfo.instance.processTaskMessage === 'function') {
      await agentInfo.instance.processTaskMessage(message);
    } else {
      log.warn('Agent does not support Task protocol', { agentId });
    }
  }

  /**
   * Get agent status
   * @param {string} agentId - Agent ID
   * @returns {Object} Agent status
   */
  getAgentStatus(agentId) {
    const agentInfo = this.agents.get(agentId);
    
    if (!agentInfo) {
      return { error: 'Agent not found' };
    }

    return {
      id: agentInfo.id,
      status: agentInfo.status,
      capabilities: agentInfo.capabilities,
      messageCount: agentInfo.messageCount,
      lastSeen: new Date(agentInfo.lastSeen).toISOString(),
      responseTime: agentInfo.responseTime
    };
  }

  /**
   * Get all agents status
   * @returns {Object} All agents status
   */
  getAllAgentsStatus() {
    const agents = {};
    
    for (const [agentId, agentInfo] of this.agents) {
      agents[agentId] = this.getAgentStatus(agentId);
    }
    
    return agents;
  }

  /**
   * Generate unique message ID
   * @returns {string} Message ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start communication hub
   */
  start() {
    log.info('AIX Communication Hub started');
    
    // Start ping system
    this.pingSystem.startMonitoring();
    
    // Start message processing
    setInterval(() => {
      this.processMessageQueue();
    }, 1000);
  }

  /**
   * Stop communication hub
   */
  stop() {
    log.info('AIX Communication Hub stopped');
    
    // Stop ping system
    this.pingSystem.stopMonitoring();
    
    // Clear message queue
    this.messageQueue = [];
  }
}

module.exports = AIXCommunicationHub;