/**
 * AIX Connection Manager - Unified Communication System
 * Created by Cursor - Team Lead
 *
 * Unified system for connecting AI agents using multiple protocols:
 * - Node.js EventEmitter
 * - MCP (Model Context Protocol)
 * - AIX3 Protocol
 * - Quantum Workflow
 */

const AIXCommunicationHub = require('./AIXCommunicationHub');
const MCPProtocol = require('./MCPProtocol');
const AIXPingSystem = require('./AIXPingSystem');
const { logger } = require('../utils/logger');

// Create logger for Connection Manager
const log = logger.child('AIXConnectionManager');

/**
 * AIX Connection Manager
 * Unified system for agent communication and coordination
 */
class AIXConnectionManager {
  constructor() {
    this.communicationHub = new AIXCommunicationHub();
    this.mcpProtocol = new MCPProtocol();
    this.pingSystem = new AIXPingSystem();

    this.agents = new Map();
    this.connections = new Map();
    this.transports = new Map(); // For sending outbound messages
    this.isActive = false;

    // Setup event listeners
    this.setupEventListeners();

    log.info('AIX Connection Manager initialized');
  }

  /**
   * Register an outbound transport for a specific protocol type.
   * @param {string} transportType - e.g., 'whatsapp', 'telegram'
   * @param {Function} sendFunction - An async function that takes (to, message) and sends it.
   */
  registerTransport(transportType, sendFunction) {
    if (typeof sendFunction !== 'function') {
      throw new Error('sendFunction must be a function');
    }
    this.transports.set(transportType, sendFunction);
    log.info(`Outbound transport registered for '${transportType}'`);
  }

  /**
   * Setup event listeners for all protocols
   */
  setupEventListeners() {
    // Communication Hub events
    this.communicationHub.on('agentRegistered', (agentInfo) => {
      log.info('Agent registered via Communication Hub', { agentId: agentInfo.id });
    });

    this.communicationHub.on('messageProcessed', (message) => {
      log.info('Message processed via Communication Hub', { messageId: message.id });
    });

    // MCP Protocol events
    this.mcpProtocol.on('serverRegistered', (serverInfo) => {
      log.info('MCP Server registered', { serverId: serverInfo.id });
    });

    this.mcpProtocol.on('clientRegistered', (clientInfo) => {
      log.info('MCP Client registered', { clientId: clientInfo.id });
    });
  }

  /**
   * Connect agent using multiple protocols
   * @param {string} agentId - Agent identifier
   * @param {Object} agent - Agent instance
   * @param {Object} options - Connection options
   */
  async connectAgent(agentId, agent, options = {}) {
    const connectionInfo = {
      id: agentId,
      agent,
      protocols: options.protocols || ['AIX3', 'MCP', 'PING'],
      transportType: options.transportType || 'internal', // e.g., 'whatsapp'
      status: 'connecting',
      connectedAt: Date.now(),
    };

    try {
      // Register with Communication Hub
      if (connectionInfo.protocols.includes('AIX3') || connectionInfo.protocols.includes('PING')) {
        await this.communicationHub.registerAgent(agentId, agent, options.capabilities);
      }

      // Register with MCP Protocol
      if (connectionInfo.protocols.includes('MCP')) {
        if (options.server) {
          await this.mcpProtocol.registerServer(agentId, agent, options.capabilities);
        } else {
          await this.mcpProtocol.registerClient(agentId, agent, options.capabilities);
        }
      }

      // Register with Ping System
      if (connectionInfo.protocols.includes('PING')) {
        // Ping system is automatically integrated with Communication Hub
      }

      connectionInfo.status = 'connected';
      this.agents.set(agentId, connectionInfo);

      log.info('Agent connected successfully', {
        agentId,
        protocols: connectionInfo.protocols,
        status: connectionInfo.status,
      });

      return connectionInfo;
    } catch (error) {
      log.error('Failed to connect agent', { error: error.message, agentId });
      throw error;
    }
  }

  /**
   * Send message to agent using best available protocol
   * @param {string} fromAgent - Sender agent ID
   * @param {string} toAgent - Recipient agent ID
   * @param {Object} message - Message content
   * @param {string} protocol - Preferred protocol
   */
  async sendMessage(fromAgent, toAgent, message, protocol = 'auto') {
    const connectionInfo = this.agents.get(toAgent);

    if (!connectionInfo) {
      throw new Error(`Agent ${toAgent} not connected`);
    }

    // Auto-select best protocol
    if (protocol === 'auto') {
      protocol = this.selectBestProtocol(connectionInfo, message);
    }

    try {
      let messageId;

      switch (protocol) {
        case 'AIX3':
          messageId = await this.communicationHub.sendMessage(fromAgent, toAgent, message, 'AIX3');
          break;

        case 'MCP':
          messageId = await this.mcpProtocol.sendRequest(fromAgent, toAgent, message);
          break;

        case 'PING':
          messageId = await this.pingSystem.pingAgent({
            fromAgent,
            toAgent,
            priority: message.priority || 3,
            message: message.content || message.message,
            requiresAction: message.requiresAction || false,
            context: message.context || {},
          });
          break;

        default:
          throw new Error(`Unknown protocol: ${protocol}`);
      }

      log.info('Message sent successfully', {
        messageId,
        fromAgent,
        toAgent,
        protocol,
      });

      return messageId;
    } catch (error) {
      log.error('Failed to send message', {
        error: error.message,
        fromAgent,
        toAgent,
        protocol,
      });
      throw error;
    }
  }

  /**
   * Send a reply from an agent back to an external user (e.g., WhatsApp).
   * @param {string} toAgentId - The ID of the recipient agent (e.g., the user's phone number).
   * @param {Object} message - The message object to send.
   */
  async sendReply(toAgentId, message) {
    const connectionInfo = this.agents.get(toAgentId);
    if (!connectionInfo) {
      throw new Error(`Cannot send reply: Agent ${toAgentId} not connected.`);
    }

    const transport = this.transports.get(connectionInfo.transportType);
    if (!transport) {
      log.warn(
        `No outbound transport found for type '${connectionInfo.transportType}'. Cannot send reply to ${toAgentId}.`
      );
      return;
    }

    await transport(toAgentId, message);
    log.info(`Reply sent to agent ${toAgentId} via ${connectionInfo.transportType} transport.`);
  }
  /**
   * Broadcast message to all agents
   * @param {string} fromAgent - Sender agent ID
   * @param {Object} message - Message content
   * @param {string} protocol - Communication protocol
   */
  async broadcastMessage(fromAgent, message, protocol = 'AIX3') {
    try {
      let messageId;

      switch (protocol) {
        case 'AIX3':
          messageId = await this.communicationHub.broadcastMessage(fromAgent, message, 'AIX3');
          break;

        case 'MCP':
          // MCP doesn't support broadcasting, send to each agent individually
          const promises = [];
          for (const [agentId, connectionInfo] of this.agents) {
            if (agentId !== fromAgent && connectionInfo.protocols.includes('MCP')) {
              promises.push(this.mcpProtocol.sendRequest(fromAgent, agentId, message));
            }
          }
          await Promise.all(promises);
          messageId = 'broadcast_mcp';
          break;

        case 'PING':
          // Ping system doesn't support broadcasting, send to each agent individually
          const pingPromises = [];
          for (const [agentId, connectionInfo] of this.agents) {
            if (agentId !== fromAgent && connectionInfo.protocols.includes('PING')) {
              pingPromises.push(
                this.pingSystem.pingAgent({
                  fromAgent,
                  toAgent: agentId,
                  priority: message.priority || 3,
                  message: message.content || message.message,
                  requiresAction: message.requiresAction || false,
                  context: message.context || {},
                })
              );
            }
          }
          await Promise.all(pingPromises);
          messageId = 'broadcast_ping';
          break;

        default:
          throw new Error(`Unknown protocol: ${protocol}`);
      }

      log.info('Message broadcasted successfully', {
        messageId,
        fromAgent,
        protocol,
      });

      return messageId;
    } catch (error) {
      log.error('Failed to broadcast message', {
        error: error.message,
        fromAgent,
        protocol,
      });
      throw error;
    }
  }

  /**
   * Select best protocol for message
   * @param {Object} connectionInfo - Connection information
   * @param {Object} message - Message content
   * @returns {string} Best protocol
   */
  selectBestProtocol(connectionInfo, message) {
    const availableProtocols = connectionInfo.protocols;

    // Priority order: AIX3 > MCP > PING
    if (availableProtocols.includes('AIX3')) {
      return 'AIX3';
    } else if (availableProtocols.includes('MCP')) {
      return 'MCP';
    } else if (availableProtocols.includes('PING')) {
      return 'PING';
    } else {
      return 'AIX3'; // Default fallback
    }
  }

  /**
   * Get agent status
   * @param {string} agentId - Agent ID
   * @returns {Object} Agent status
   */
  getAgentStatus(agentId) {
    const connectionInfo = this.agents.get(agentId);

    if (!connectionInfo) {
      return { error: 'Agent not found' };
    }

    const status = {
      id: agentId,
      status: connectionInfo.status,
      protocols: connectionInfo.protocols,
      connectedAt: new Date(connectionInfo.connectedAt).toISOString(),
    };

    // Add protocol-specific status
    if (connectionInfo.protocols.includes('AIX3') || connectionInfo.protocols.includes('PING')) {
      status.communicationHub = this.communicationHub.getAgentStatus(agentId);
    }

    if (connectionInfo.protocols.includes('MCP')) {
      status.mcp =
        this.mcpProtocol.getClientStatus(agentId) || this.mcpProtocol.getServerStatus(agentId);
    }

    return status;
  }

  /**
   * Get all agents status
   * @returns {Object} All agents status
   */
  getAllAgentsStatus() {
    const agents = {};

    for (const [agentId, connectionInfo] of this.agents) {
      agents[agentId] = this.getAgentStatus(agentId);
    }

    return agents;
  }

  /**
   * Disconnect agent
   * @param {string} agentId - Agent ID
   */
  async disconnectAgent(agentId) {
    const connectionInfo = this.agents.get(agentId);

    if (!connectionInfo) {
      log.warn('Agent not found for disconnection', { agentId });
      return;
    }

    try {
      // Disconnect from all protocols
      if (connectionInfo.protocols.includes('AIX3') || connectionInfo.protocols.includes('PING')) {
        // Communication Hub doesn't have explicit disconnect, just remove from agents
        this.agents.delete(agentId);
      }

      if (connectionInfo.protocols.includes('MCP')) {
        // MCP doesn't have explicit disconnect
        this.agents.delete(agentId);
      }

      connectionInfo.status = 'disconnected';

      log.info('Agent disconnected successfully', { agentId });
    } catch (error) {
      log.error('Failed to disconnect agent', { error: error.message, agentId });
      throw error;
    }
  }

  /**
   * Start connection manager
   */
  start() {
    if (this.isActive) {
      log.warn('Connection Manager already started');
      return;
    }

    this.isActive = true;

    // Start all subsystems
    this.communicationHub.start();

    log.info('AIX Connection Manager started');
  }

  /**
   * Stop connection manager
   */
  stop() {
    if (!this.isActive) {
      log.warn('Connection Manager not started');
      return;
    }

    this.isActive = false;

    // Stop all subsystems
    this.communicationHub.stop();

    // Clear all connections
    this.agents.clear();

    log.info('AIX Connection Manager stopped');
  }

  /**
   * Get system status
   * @returns {Object} System status
   */
  getSystemStatus() {
    return {
      isActive: this.isActive,
      totalAgents: this.agents.size,
      protocols: ['AIX3', 'MCP', 'PING'],
      subsystems: {
        communicationHub: 'active',
        mcpProtocol: 'active',
        pingSystem: 'active',
      },
      agents: this.getAllAgentsStatus(),
    };
  }
}

module.exports = AIXConnectionManager;
