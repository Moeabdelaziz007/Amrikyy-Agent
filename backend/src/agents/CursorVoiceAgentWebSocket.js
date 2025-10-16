/**
 * Cursor Voice Agent with WebSocket Integration
 * Bridges browser Web Speech API with server-side Cursor Manager
 * Enables real-time voice communication between frontend and backend
 */

const WebSocket = require('ws');
const EventEmitter = require('events');
const winston = require('winston');

class CursorVoiceAgentWebSocket extends EventEmitter {
  constructor(cursorManager, port = 8080) {
    super();

    this.agent_id = "cursor-voice-websocket";
    this.managed_by = "cursor-master";
    this.role = "voice_interface";
    this.version = "1.0.0";
    this.status = 'available';
    this.cursorManager = cursorManager;

    // Initialize logging
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'backend/logs/cursor-voice-websocket.log' }),
        new winston.transports.Console()
      ]
    });

    // WebSocket server for voice communication
    this.wss = null;
    this.port = port;

    // Voice session management
    this.activeSessions = new Map();
    this.voiceHistory = [];

    // Voice capabilities
    this.capabilities = [
      'speech_to_text',
      'text_to_speech',
      'voice_processing',
      'conversation_management',
      'voice_commands',
      'natural_language_understanding',
      'websocket_communication',
      'real_time_voice',
      'browser_integration'
    ];

    // Performance tracking
    this.performance = {
      voiceRequestsProcessed: 0,
      averageResponseTime: 0,
      speechAccuracy: 90,
      lastVoiceRequest: null,
      websocketConnections: 0
    };

    // Configuration
    this.config = {
      voiceTimeout: 30000,
      maxSessionDuration: 300000,
      supportedLanguages: ['en-US', 'ar-SA', 'es-ES', 'fr-FR'],
      voiceQuality: 'high',
      websocketPingInterval: 30000,
      maxConnections: 100
    };

    this.logger.info('🎤 Cursor Voice Agent WebSocket initialized');
  }

  /**
   * Initialize the WebSocket server for voice communication
   */
  async initialize() {
    try {
      this.wss = new WebSocket.Server({
        port: this.port,
        perMessageDeflate: false
      });

      this.wss.on('connection', (ws, request) => {
        this.handleWebSocketConnection(ws, request);
      });

      this.wss.on('error', (error) => {
        this.logger.error('❌ WebSocket server error', { error: error.message });
      });

      this.logger.info(`✅ WebSocket voice server started on port ${this.port}`);

      return {
        success: true,
        port: this.port,
        message: 'WebSocket voice server initialized'
      };

    } catch (error) {
      this.logger.error('❌ Failed to initialize WebSocket server', { error: error.message });
      throw error;
    }
  }

  /**
   * Handle new WebSocket connection for voice
   */
  handleWebSocketConnection(ws, request) {
    const connectionId = `voice_conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.performance.websocketConnections++;

    this.logger.info('🎤 New voice WebSocket connection', {
      connectionId,
      ip: request.socket.remoteAddress
    });

    // Set up connection
    ws.connectionId = connectionId;
    ws.isAlive = true;
    ws.userId = null;
    ws.sessionId = null;

    // Handle messages from client
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        await this.handleVoiceMessage(ws, data);
      } catch (error) {
        this.logger.error('❌ Error handling voice message', {
          connectionId,
          error: error.message
        });

        this.sendToClient(ws, {
          type: 'error',
          error: 'Invalid message format'
        });
      }
    });

    // Handle connection close
    ws.on('close', () => {
      this.handleWebSocketDisconnection(ws);
    });

    // Handle ping/pong for connection health
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Send welcome message
    this.sendToClient(ws, {
      type: 'welcome',
      connectionId,
      message: 'Connected to Cursor Voice Agent',
      capabilities: this.capabilities,
      config: this.config
    });

    // Start ping interval for this connection
    const pingInterval = setInterval(() => {
      if (ws.isAlive === false) {
        clearInterval(pingInterval);
        ws.terminate();
        return;
      }

      ws.isAlive = false;
      ws.ping();
    }, this.config.websocketPingInterval);

    ws.on('close', () => {
      clearInterval(pingInterval);
    });
  }

  /**
   * Handle voice messages from WebSocket client
   */
  async handleVoiceMessage(ws, data) {
    const { type, payload } = data;

    this.logger.info('🎤 Received voice message', {
      connectionId: ws.connectionId,
      type,
      userId: ws.userId
    });

    try {
      switch (type) {
        case 'start_session':
          await this.handleStartSession(ws, payload);
          break;

        case 'voice_input':
          await this.handleVoiceInput(ws, payload);
          break;

        case 'voice_command':
          await this.handleVoiceCommand(ws, payload);
          break;

        case 'end_session':
          await this.handleEndSession(ws, payload);
          break;

        case 'get_status':
          await this.handleGetStatus(ws);
          break;

        default:
          this.sendToClient(ws, {
            type: 'error',
            error: `Unknown message type: ${type}`
          });
      }

    } catch (error) {
      this.logger.error('❌ Error processing voice message', {
        connectionId: ws.connectionId,
        type,
        error: error.message
      });

      this.sendToClient(ws, {
        type: 'error',
        error: error.message
      });
    }
  }

  /**
   * Handle session start request
   */
  async handleStartSession(ws, payload) {
    const { userId, language = 'en-US', quality = 'high' } = payload;

    const sessionId = `voice_${userId}_${Date.now()}`;

    const session = {
      sessionId,
      userId,
      connectionId: ws.connectionId,
      startTime: Date.now(),
      status: 'active',
      language,
      quality,
      websocket: ws,
      voiceHistory: [],
      isListening: false
    };

    this.activeSessions.set(sessionId, session);
    ws.userId = userId;
    ws.sessionId = sessionId;

    this.logger.info('🎤 Voice session started', { sessionId, userId });

    this.sendToClient(ws, {
      type: 'session_started',
      sessionId,
      language,
      quality,
      message: 'Voice session started successfully'
    });

    this.emit('voice_session_started', { sessionId, userId });
  }

  /**
   * Handle voice input from browser
   */
  async handleVoiceInput(ws, payload) {
    const { transcript, confidence = 0.9, isFinal = true } = payload;

    if (!ws.sessionId) {
      this.sendToClient(ws, {
        type: 'error',
        error: 'No active voice session'
      });
      return;
    }

    const session = this.activeSessions.get(ws.sessionId);
    if (!session) {
      this.sendToClient(ws, {
        type: 'error',
        error: 'Voice session not found'
      });
      return;
    }

    this.logger.info('🎤 Processing voice input', {
      sessionId: ws.sessionId,
      transcript,
      confidence
    });

    try {
      // Record the voice interaction
      const interaction = {
        timestamp: Date.now(),
        type: 'voice_input',
        transcript,
        confidence,
        isFinal
      };

      session.voiceHistory.push(interaction);

      // Process through Cursor Manager if this is final result
      if (isFinal && transcript.trim()) {
        const cursorResponse = await this.cursorManager.processRequest(
          transcript,
          session.userId,
          {
            source: 'voice_websocket',
            sessionId: session.sessionId,
            confidence,
            language: session.language
          }
        );

        // Send response back to client for speech synthesis
        this.sendToClient(ws, {
          type: 'voice_response',
          sessionId: session.sessionId,
          transcript,
          cursorResponse,
          interaction
        });

        // Record the response in history
        const responseInteraction = {
          timestamp: Date.now(),
          type: 'voice_response',
          text: this.extractSpeakableText(cursorResponse),
          cursorResponse
        };

        session.voiceHistory.push(responseInteraction);
        this.voiceHistory.push(interaction);
        this.voiceHistory.push(responseInteraction);

        // Update performance metrics
        this.updatePerformanceMetrics(interaction);
      }

    } catch (error) {
      this.logger.error('❌ Error processing voice input', {
        sessionId: ws.sessionId,
        error: error.message
      });

      this.sendToClient(ws, {
        type: 'error',
        error: 'Failed to process voice input'
      });
    }
  }

  /**
   * Handle voice commands
   */
  async handleVoiceCommand(ws, payload) {
    const { command, parameters = {} } = payload;

    if (!ws.sessionId) {
      this.sendToClient(ws, {
        type: 'error',
        error: 'No active voice session'
      });
      return;
    }

    const session = this.activeSessions.get(ws.sessionId);
    if (!session) {
      this.sendToClient(ws, {
        type: 'error',
        error: 'Voice session not found'
      });
      return;
    }

    this.logger.info('🎯 Processing voice command', {
      sessionId: ws.sessionId,
      command
    });

    try {
      let response;

      switch (command) {
        case 'start_listening':
          response = { status: 'listening_started' };
          break;

        case 'stop_listening':
          response = { status: 'listening_stopped' };
          break;

        case 'change_language':
          session.language = parameters.language || 'en-US';
          response = {
            status: 'language_changed',
            language: session.language
          };
          break;

        case 'adjust_volume':
          response = {
            status: 'volume_adjusted',
            volume: parameters.volume || 1.0
          };
          break;

        case 'get_status':
          response = await this.getSessionStatus(session.sessionId);
          break;

        case 'end_session':
          await this.handleEndSession(ws, { reason: 'voice_command' });
          response = { status: 'session_ended' };
          break;

        default:
          response = { error: 'Unknown voice command' };
      }

      this.sendToClient(ws, {
        type: 'voice_command_response',
        command,
        response
      });

    } catch (error) {
      this.logger.error('❌ Error processing voice command', {
        sessionId: ws.sessionId,
        command,
        error: error.message
      });

      this.sendToClient(ws, {
        type: 'error',
        error: 'Failed to process voice command'
      });
    }
  }

  /**
   * Handle session end request
   */
  async handleEndSession(ws, payload = {}) {
    const { reason = 'user_request' } = payload;

    if (!ws.sessionId) {
      return;
    }

    const session = this.activeSessions.get(ws.sessionId);
    if (!session) {
      return;
    }

    this.logger.info('🛑 Ending voice session', {
      sessionId: ws.sessionId,
      reason
    });

    try {
      // Store session data
      await this.storeSessionData(session);

      // Remove from active sessions
      this.activeSessions.delete(ws.sessionId);

      // Clear WebSocket references
      ws.sessionId = null;
      ws.userId = null;

      this.sendToClient(ws, {
        type: 'session_ended',
        sessionId: session.sessionId,
        duration: Date.now() - session.startTime,
        interactions: session.voiceHistory.length,
        reason
      });

      this.logger.info('✅ Voice session ended', {
        sessionId: session.sessionId,
        duration: Date.now() - session.startTime,
        interactions: session.voiceHistory.length
      });

    } catch (error) {
      this.logger.error('❌ Error ending voice session', {
        sessionId: ws.sessionId,
        error: error.message
      });
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  handleWebSocketDisconnection(ws) {
    this.performance.websocketConnections--;

    this.logger.info('🔌 Voice WebSocket disconnected', {
      connectionId: ws.connectionId,
      sessionId: ws.sessionId
    });

    // End any active session for this connection
    if (ws.sessionId) {
      this.handleEndSession(ws, { reason: 'websocket_disconnection' });
    }
  }

  /**
   * Send message to WebSocket client
   */
  sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionId) {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      return {
        success: false,
        error: 'Session not found'
      };
    }

    return {
      success: true,
      sessionId,
      userId: session.userId,
      status: session.status,
      isListening: session.isListening,
      duration: Date.now() - session.startTime,
      interactions: session.voiceHistory.length,
      language: session.language,
      quality: session.quality
    };
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(interaction) {
    this.performance.voiceRequestsProcessed++;
    this.performance.lastVoiceRequest = new Date();
  }

  /**
   * Store session data
   */
  async storeSessionData(session) {
    try {
      const fs = require('fs').promises;
      const path = require('path');

      const sessionData = {
        sessionId: session.sessionId,
        userId: session.userId,
        startTime: session.startTime,
        endTime: Date.now(),
        duration: Date.now() - session.startTime,
        interactions: session.voiceHistory,
        language: session.language,
        quality: session.quality,
        connectionId: session.connectionId
      };

      // Ensure directory exists
      const dataDir = path.join('backend', 'data', 'voice-sessions');
      await fs.mkdir(dataDir, { recursive: true });

      // Store session data
      const filename = `websocket-${session.sessionId}.json`;
      const filepath = path.join(dataDir, filename);
      await fs.writeFile(filepath, JSON.stringify(sessionData, null, 2));

      this.logger.info('💾 WebSocket voice session data stored', {
        sessionId: session.sessionId,
        filename
      });

    } catch (error) {
      this.logger.error('❌ Failed to store WebSocket session data', {
        sessionId: session.sessionId,
        error: error.message
      });
    }
  }

  /**
   * Extract speakable text from cursor response
   */
  extractSpeakableText(cursorResponse) {
    if (cursorResponse.success && cursorResponse.result) {
      if (typeof cursorResponse.result === 'string') {
        return cursorResponse.result;
      } else if (cursorResponse.result.summary) {
        return cursorResponse.result.summary;
      } else if (cursorResponse.result.message) {
        return cursorResponse.result.message;
      }
    }

    return cursorResponse.error || 'Sorry, I encountered an error processing your request.';
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      agent_id: this.agent_id,
      managed_by: this.managed_by,
      role: this.role,
      version: this.version,
      status: this.status,
      capabilities: this.capabilities,
      performance: this.performance,
      activeSessions: this.activeSessions.size,
      websocketConnections: this.performance.websocketConnections,
      totalVoiceHistory: this.voiceHistory.length,
      websocketPort: this.port
    };
  }

  /**
   * Shutdown the voice agent
   */
  async shutdown() {
    this.logger.info('🛑 Shutting down Cursor Voice Agent WebSocket');

    // Close all active sessions
    for (const [sessionId] of this.activeSessions) {
      await this.handleEndSession({ sessionId }, { reason: 'shutdown' });
    }

    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
    }

    this.status = 'shutdown';
    this.logger.info('✅ Cursor Voice Agent WebSocket shutdown complete');
  }
}

module.exports = CursorVoiceAgentWebSocket;