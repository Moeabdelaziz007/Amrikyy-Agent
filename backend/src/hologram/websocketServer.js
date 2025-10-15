/**
 * Holographic Command Center WebSocket Server
 * Real-time communication for the holographic dashboard
 * Broadcasts agent events, metrics, and workflow updates
 */

const WebSocket = require('ws');
const EventEmitter = require('events');
const winston = require('winston');

class HologramWebSocketServer extends EventEmitter {
  constructor(server) {
    super();
    this.server = server;
    this.wss = null;
    this.clients = new Set();
    this.agentSubscriptions = new Map();
    this.broadcastQueue = [];
    this.isBroadcasting = false;
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/hologram-websocket.log' }),
        new winston.transports.Console()
      ]
    });

    this.initializeWebSocket();
    this.setupHeartbeat();
  }

  initializeWebSocket() {
    this.wss = new WebSocket.Server({ 
      server: this.server,
      path: '/api/hologram/stream'
    });

    this.wss.on('connection', (ws, request) => {
      this.handleConnection(ws, request);
    });

    this.logger.info('Hologram WebSocket server initialized');
  }

  handleConnection(ws, request) {
    const clientId = this.generateClientId();
    ws.clientId = clientId;
    ws.isAlive = true;
    ws.subscriptions = new Set();

    this.clients.add(ws);
    this.logger.info('Hologram client connected', { clientId, totalClients: this.clients.size });

    // Send welcome message
    this.sendToClient(ws, {
      type: 'welcome',
      clientId: clientId,
      timestamp: new Date().toISOString(),
      message: 'Connected to Holographic Command Center'
    });

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(ws, message);
      } catch (error) {
        this.logger.error('Failed to parse WebSocket message', { error: error.message });
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      this.handleDisconnect(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
      this.logger.error('WebSocket client error', { clientId, error: error.message });
      this.handleDisconnect(ws);
    });

    // Handle pong responses
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  }

  handleMessage(ws, message) {
    this.logger.info('Received WebSocket message', { 
      clientId: ws.clientId, 
      type: message.type 
    });

    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(ws, message);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(ws, message);
        break;
      case 'command':
        this.handleCommand(ws, message);
        break;
      case 'ping':
        this.sendToClient(ws, { type: 'pong', timestamp: new Date().toISOString() });
        break;
      default:
        this.logger.warn('Unknown message type', { type: message.type });
    }
  }

  handleSubscribe(ws, message) {
    const { topics } = message;
    
    if (Array.isArray(topics)) {
      topics.forEach(topic => {
        ws.subscriptions.add(topic);
        this.addToSubscription(topic, ws);
      });
    } else {
      ws.subscriptions.add(topics);
      this.addToSubscription(topics, ws);
    }

    this.sendToClient(ws, {
      type: 'subscribed',
      topics: Array.from(ws.subscriptions),
      timestamp: new Date().toISOString()
    });

    this.logger.info('Client subscribed', { 
      clientId: ws.clientId, 
      topics: Array.from(ws.subscriptions) 
    });
  }

  handleUnsubscribe(ws, message) {
    const { topics } = message;
    
    if (Array.isArray(topics)) {
      topics.forEach(topic => {
        ws.subscriptions.delete(topic);
        this.removeFromSubscription(topic, ws);
      });
    } else {
      ws.subscriptions.delete(topics);
      this.removeFromSubscription(topics, ws);
    }

    this.sendToClient(ws, {
      type: 'unsubscribed',
      topics: Array.from(ws.subscriptions),
      timestamp: new Date().toISOString()
    });
  }

  handleCommand(ws, message) {
    const { command, agentId, params } = message;
    
    this.logger.info('Executing hologram command', { 
      clientId: ws.clientId, 
      command, 
      agentId 
    });

    // Emit command event for orchestrator to handle
    this.emit('hologram_command', {
      command,
      agentId,
      params,
      clientId: ws.clientId,
      timestamp: new Date().toISOString()
    });

    // Send acknowledgment
    this.sendToClient(ws, {
      type: 'command_acknowledged',
      command,
      agentId,
      timestamp: new Date().toISOString()
    });
  }

  handleDisconnect(ws) {
    this.clients.delete(ws);
    
    // Remove from all subscriptions
    ws.subscriptions.forEach(topic => {
      this.removeFromSubscription(topic, ws);
    });

    this.logger.info('Hologram client disconnected', { 
      clientId: ws.clientId, 
      totalClients: this.clients.size 
    });
  }

  addToSubscription(topic, ws) {
    if (!this.agentSubscriptions.has(topic)) {
      this.agentSubscriptions.set(topic, new Set());
    }
    this.agentSubscriptions.get(topic).add(ws);
  }

  removeFromSubscription(topic, ws) {
    if (this.agentSubscriptions.has(topic)) {
      this.agentSubscriptions.get(topic).delete(ws);
      if (this.agentSubscriptions.get(topic).size === 0) {
        this.agentSubscriptions.delete(topic);
      }
    }
  }

  // Broadcasting Methods
  broadcastToAll(data) {
    this.broadcastQueue.push({
      type: 'broadcast_all',
      data,
      timestamp: new Date().toISOString()
    });
    this.processBroadcastQueue();
  }

  broadcastToTopic(topic, data) {
    this.broadcastQueue.push({
      type: 'broadcast_topic',
      topic,
      data,
      timestamp: new Date().toISOString()
    });
    this.processBroadcastQueue();
  }

  sendToClient(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(data));
      } catch (error) {
        this.logger.error('Failed to send message to client', { 
          clientId: ws.clientId, 
          error: error.message 
        });
      }
    }
  }

  processBroadcastQueue() {
    if (this.isBroadcasting || this.broadcastQueue.length === 0) {
      return;
    }

    this.isBroadcasting = true;
    const batch = this.broadcastQueue.splice(0, 10); // Process up to 10 messages

    batch.forEach(message => {
      switch (message.type) {
        case 'broadcast_all':
          this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              this.sendToClient(client, message.data);
            }
          });
          break;
        case 'broadcast_topic':
          if (this.agentSubscriptions.has(message.topic)) {
            this.agentSubscriptions.get(message.topic).forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                this.sendToClient(client, message.data);
              }
            });
          }
          break;
      }
    });

    this.isBroadcasting = false;

    // Process remaining queue
    if (this.broadcastQueue.length > 0) {
      setImmediate(() => this.processBroadcastQueue());
    }
  }

  // Agent Event Broadcasting
  broadcastAgentCreated(agent) {
    this.broadcastToAll({
      type: 'agent:created',
      agent: {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        status: agent.status,
        created_at: agent.created_at,
        capabilities: agent.capabilities
      },
      timestamp: new Date().toISOString()
    });

    this.broadcastToTopic(`agent:${agent.id}`, {
      type: 'agent:created',
      agent: agent,
      timestamp: new Date().toISOString()
    });
  }

  broadcastAgentUpdated(agent) {
    this.broadcastToAll({
      type: 'agent:updated',
      agent: {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        status: agent.status,
        last_active: agent.last_active,
        metrics: agent.metrics || {}
      },
      timestamp: new Date().toISOString()
    });

    this.broadcastToTopic(`agent:${agent.id}`, {
      type: 'agent:updated',
      agent: agent,
      timestamp: new Date().toISOString()
    });
  }

  broadcastAgentDeleted(agentId) {
    this.broadcastToAll({
      type: 'agent:deleted',
      agentId: agentId,
      timestamp: new Date().toISOString()
    });

    this.broadcastToTopic(`agent:${agentId}`, {
      type: 'agent:deleted',
      agentId: agentId,
      timestamp: new Date().toISOString()
    });
  }

  broadcastTaskStarted(task) {
    this.broadcastToAll({
      type: 'task:started',
      task: {
        id: task.id,
        agent_id: task.agent_id,
        command: task.command,
        status: task.status,
        started_at: task.started_at
      },
      timestamp: new Date().toISOString()
    });

    this.broadcastToTopic(`agent:${task.agent_id}`, {
      type: 'task:started',
      task: task,
      timestamp: new Date().toISOString()
    });
  }

  broadcastTaskCompleted(task, result) {
    this.broadcastToAll({
      type: 'task:completed',
      task: {
        id: task.id,
        agent_id: task.agent_id,
        command: task.command,
        status: task.status,
        completed_at: task.completed_at
      },
      result: result,
      timestamp: new Date().toISOString()
    });

    this.broadcastToTopic(`agent:${task.agent_id}`, {
      type: 'task:completed',
      task: task,
      result: result,
      timestamp: new Date().toISOString()
    });
  }

  broadcastTaskFailed(task, error) {
    this.broadcastToAll({
      type: 'task:failed',
      task: {
        id: task.id,
        agent_id: task.agent_id,
        command: task.command,
        status: task.status,
        error: task.error
      },
      error: error.message,
      timestamp: new Date().toISOString()
    });

    this.broadcastToTopic(`agent:${task.agent_id}`, {
      type: 'task:failed',
      task: task,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }

  broadcastRevenueUpdate(revenue) {
    this.broadcastToAll({
      type: 'revenue:updated',
      revenue: revenue,
      timestamp: new Date().toISOString()
    });
  }

  broadcastWorkflowStep(step) {
    this.broadcastToAll({
      type: 'workflow:step',
      step: step,
      timestamp: new Date().toISOString()
    });
  }

  broadcastSystemMetrics(metrics) {
    this.broadcastToAll({
      type: 'metrics:system',
      metrics: metrics,
      timestamp: new Date().toISOString()
    });
  }

  broadcastLogEntry(logEntry) {
    this.broadcastToAll({
      type: 'log:entry',
      log: logEntry,
      timestamp: new Date().toISOString()
    });
  }

  // Utility Methods
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setupHeartbeat() {
    setInterval(() => {
      this.clients.forEach(ws => {
        if (!ws.isAlive) {
          this.logger.info('Terminating inactive client', { clientId: ws.clientId });
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds
  }

  getStats() {
    return {
      totalClients: this.clients.size,
      activeSubscriptions: this.agentSubscriptions.size,
      queueLength: this.broadcastQueue.length,
      isBroadcasting: this.isBroadcasting
    };
  }

  close() {
    this.logger.info('Closing Hologram WebSocket server');
    this.wss.close();
  }
}

module.exports = HologramWebSocketServer;

