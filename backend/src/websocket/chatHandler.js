/**
 * Web Chat Handler - WebSocket Integration for Maya Travel Agent
 * Provides real-time chat widget functionality
 */

const { logger } = require('../utils/logger');
const AIXConnectionManager = require('../aix/AIXConnectionManager');

const log = logger.child('WebChatHandler');

class WebChatHandler {
  constructor() {
    this.connectionManager = new AIXConnectionManager();
    this.activeSessions = new Map(); // Track active chat sessions
    this.sessionCounter = 0;
    
    // Register web chat transport
    this.connectionManager.registerTransport('webchat', this.sendToWebChat.bind(this));
    
    log.info('Web Chat Handler initialized');
  }

  /**
   * Handle new WebSocket connection for chat
   */
  handleConnection(ws, req) {
    const sessionId = `webchat_${++this.sessionCounter}_${Date.now()}`;
    
    // Store session info
    this.activeSessions.set(sessionId, {
      ws,
      userId: null,
      startTime: Date.now(),
      messageCount: 0,
      lastActivity: Date.now()
    });

    log.info(`New web chat session: ${sessionId}`);

    // Send welcome message
    this.sendMessage(ws, {
      type: 'welcome',
      message: '👋 مرحباً! أنا مايا، مساعدتك الشخصية للتخطيط للسفر. كيف يمكنني مساعدتك اليوم؟',
      sessionId
    });

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(sessionId, message);
      } catch (error) {
        log.error('Error parsing WebSocket message:', error);
        this.sendError(ws, 'Invalid message format');
      }
    });

    // Handle connection close
    ws.on('close', () => {
      this.handleDisconnect(sessionId);
    });

    // Handle errors
    ws.on('error', (error) => {
      log.error(`WebSocket error for session ${sessionId}:`, error);
      this.handleDisconnect(sessionId);
    });
  }

  /**
   * Handle incoming chat message
   */
  async handleMessage(sessionId, message) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.lastActivity = Date.now();
    session.messageCount++;

    log.info(`Processing message for session ${sessionId}:`, { 
      type: message.type, 
      length: message.content?.length || 0 
    });

    try {
      // Send typing indicator
      this.sendTyping(session.ws);

      // Route message through AIXConnectionManager
      const response = await this.connectionManager.processMessage({
        from: sessionId,
        to: 'maya-travel-agent',
        content: message.content,
        type: message.type || 'text',
        metadata: {
          sessionId,
          timestamp: Date.now(),
          userAgent: session.userAgent,
          source: 'webchat'
        }
      });

      // Send response back to client
      this.sendMessage(session.ws, {
        type: 'response',
        message: response.content || response.message,
        sessionId,
        timestamp: Date.now()
      });

    } catch (error) {
      log.error(`Error processing message for session ${sessionId}:`, error);
      this.sendError(session.ws, 'Sorry, I encountered an error. Please try again.');
    }
  }

  /**
   * Send message to web chat client
   */
  sendMessage(ws, data) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  /**
   * Send typing indicator
   */
  sendTyping(ws) {
    this.sendMessage(ws, {
      type: 'typing',
      isTyping: true
    });
  }

  /**
   * Send error message
   */
  sendError(ws, message) {
    this.sendMessage(ws, {
      type: 'error',
      message,
      timestamp: Date.now()
    });
  }

  /**
   * Transport function for sending outbound messages
   */
  async sendToWebChat(to, message) {
    const session = this.activeSessions.get(to);
    if (session && session.ws.readyState === session.ws.OPEN) {
      this.sendMessage(session.ws, {
        type: 'response',
        message: message.content || message,
        sessionId: to,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle session disconnect
   */
  handleDisconnect(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      log.info(`Web chat session ended: ${sessionId}`, {
        duration: Date.now() - session.startTime,
        messageCount: session.messageCount
      });
      this.activeSessions.delete(sessionId);
    }
  }

  /**
   * Get active sessions statistics
   */
  getStats() {
    return {
      activeSessions: this.activeSessions.size,
      totalSessions: this.sessionCounter,
      sessions: Array.from(this.activeSessions.entries()).map(([id, session]) => ({
        sessionId: id,
        messageCount: session.messageCount,
        duration: Date.now() - session.startTime,
        lastActivity: session.lastActivity
      }))
    };
  }

  /**
   * Cleanup inactive sessions
   */
  cleanupInactiveSessions() {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastActivity > timeout) {
        log.info(`Cleaning up inactive session: ${sessionId}`);
        session.ws.close();
        this.activeSessions.delete(sessionId);
      }
    }
  }
}

module.exports = WebChatHandler;
