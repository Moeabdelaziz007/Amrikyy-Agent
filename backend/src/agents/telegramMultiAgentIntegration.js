/**
 * Telegram Multi-Agent Integration
 * Integrates the Telegram bot with the multi-agent system
 * Provides seamless communication between users and agents
 */

const MultiAgentOrchestrator = require('./multiAgentOrchestrator');
const winston = require('winston');

class TelegramMultiAgentIntegration {
  constructor() {
    this.orchestrator = new MultiAgentOrchestrator();
    this.userSessions = new Map();
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/telegram-multi-agent.log' }),
        new winston.transports.Console()
      ]
    });

    this.setupEventHandlers();
    this.initializeSystem();
  }

  async initializeSystem() {
    try {
      // Wait for orchestrator initialization
      await new Promise((resolve) => {
        this.orchestrator.on('system_initialized', resolve);
      });
      
      this.logger.info('Telegram Multi-Agent Integration initialized');
    } catch (error) {
      this.logger.error('Failed to initialize integration:', error.message);
      throw error;
    }
  }

  setupEventHandlers() {
    // Handle agent events
    this.orchestrator.on('agent_created', (agent) => {
      this.logger.info('Agent created via Telegram integration:', agent.name);
    });

    this.orchestrator.on('task_completed', ({ agent, task }) => {
      this.logger.info('Task completed via Telegram:', {
        agent: agent.name,
        command: task.command
      });
      
      // Notify user if task was initiated via Telegram
      this.notifyUserOfTaskCompletion(task);
    });

    this.orchestrator.on('task_failed', ({ agent, task, error }) => {
      this.logger.error('Task failed via Telegram:', {
        agent: agent.name,
        command: task.command,
        error: error.message
      });
      
      // Notify user of task failure
      this.notifyUserOfTaskFailure(task, error);
    });
  }

  // Main message handler
  async handleTelegramMessage(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const messageText = msg.text;
    const messageType = msg.message_type || 'text';

    this.logger.info('Processing Telegram message', {
      chatId,
      userId,
      messageType,
      text: messageText?.substring(0, 100)
    });

    try {
      // Get or create user session
      const userSession = this.getOrCreateUserSession(userId, chatId);
      
      // Process input through multi-agent system
      const input = this.convertTelegramToInput(msg, userSession);
      const response = await this.orchestrator.processInput(input);
      
      // Convert response back to Telegram format
      const telegramResponse = this.convertResponseToTelegram(response, userSession);
      
      // Update user session
      this.updateUserSession(userSession, input, response);
      
      return telegramResponse;
      
    } catch (error) {
      this.logger.error('Error processing Telegram message:', error);
      
      return {
        chat_id: chatId,
        text: `❌ Sorry, I encountered an error: ${error.message}`,
        parse_mode: 'Markdown'
      };
    }
  }

  // Convert Telegram message to system input
  convertTelegramToInput(msg, userSession) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const messageText = msg.text || '';
    
    // Determine input type based on message content
    let inputType = 'text';
    if (msg.voice) inputType = 'voice';
    if (msg.document) inputType = 'file';
    
    // Extract context from user session
    const context = {
      user_id: userId,
      chat_id: chatId,
      user_name: msg.from.first_name,
      session_id: userSession.sessionId,
      previous_messages: userSession.recentMessages,
      user_preferences: userSession.preferences
    };

    // Determine intent based on message content and session
    const intent = this.determineIntent(messageText, userSession);
    
    // Extract entities from message
    const entities = this.extractEntities(messageText);

    return {
      type: inputType,
      source: 'telegram',
      text: messageText,
      intent: intent,
      entities: entities,
      context: context,
      raw_message: msg
    };
  }

  // Convert system response to Telegram format
  convertResponseToTelegram(response, userSession) {
    const chatId = userSession.chatId;
    
    // Get text response
    const textResponse = response.formats?.text || response;
    
    // Format message based on response type
    let messageText = textResponse.message || 'Response generated';
    
    // Add formatting based on response type
    switch (response.response?.type) {
      case 'travel_search':
        messageText = this.formatTravelSearchResponse(textResponse);
        break;
      case 'booking_request':
        messageText = this.formatBookingResponse(textResponse);
        break;
      case 'system_status':
        messageText = this.formatSystemStatusResponse(textResponse);
        break;
      case 'agent_creation':
        messageText = this.formatAgentCreationResponse(textResponse);
        break;
      default:
        messageText = this.formatGeneralResponse(textResponse);
    }

    // Prepare Telegram response
    const telegramResponse = {
      chat_id: chatId,
      text: messageText,
      parse_mode: 'Markdown'
    };

    // Add keyboard if needed
    if (response.response?.type === 'travel_search' && response.response?.results) {
      telegramResponse.reply_markup = this.createTravelSearchKeyboard();
    }

    // Add file if available
    if (response.formats?.files) {
      telegramResponse.document = response.formats.files.report;
    }

    return telegramResponse;
  }

  // Intent determination
  determineIntent(messageText, userSession) {
    const lowerText = messageText.toLowerCase();
    
    // Check for specific intents
    if (lowerText.includes('/start') || lowerText.includes('hello')) return 'greeting';
    if (lowerText.includes('/help')) return 'help_request';
    if (lowerText.includes('/agents')) return 'list_agents';
    if (lowerText.includes('/status')) return 'system_status';
    if (lowerText.includes('create') && lowerText.includes('agent')) return 'create_agent';
    if (lowerText.includes('flight') || lowerText.includes('travel')) return 'travel_search';
    if (lowerText.includes('book') || lowerText.includes('reserve')) return 'booking_request';
    if (lowerText.includes('analytics') || lowerText.includes('report')) return 'analytics_request';
    if (lowerText.includes('cancel') || lowerText.includes('refund')) return 'cancellation_request';
    
    // Check session context for continuing conversations
    if (userSession.conversationContext) {
      return userSession.conversationContext.intent || 'general_query';
    }
    
    return 'general_query';
  }

  // Entity extraction
  extractEntities(messageText) {
    const entities = {};
    
    // Extract travel entities
    const flightMatch = messageText.match(/from\s+(\w+)\s+to\s+(\w+)/i);
    if (flightMatch) {
      entities.origin = flightMatch[1];
      entities.destination = flightMatch[2];
    }
    
    const dateMatch = messageText.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (dateMatch) {
      entities.date = dateMatch[0];
    }
    
    const passengerMatch = messageText.match(/(\d+)\s+passenger/i);
    if (passengerMatch) {
      entities.passengers = parseInt(passengerMatch[1]);
    }
    
    // Extract agent type for creation
    const agentTypeMatch = messageText.match(/create\s+(\w+)\s+agent/i);
    if (agentTypeMatch) {
      entities.agent_type = agentTypeMatch[1];
    }
    
    return entities;
  }

  // Response formatting
  formatTravelSearchResponse(response) {
    let message = `✈️ **Travel Search Results**\n\n`;
    
    if (response.details?.results) {
      message += `Found ${response.details.results.length} options:\n\n`;
      response.details.results.slice(0, 3).forEach((result, index) => {
        message += `${index + 1}. ${result.airline} ${result.flight_number}\n`;
        message += `   🕐 ${result.departure_time} - ${result.arrival_time}\n`;
        message += `   💰 ${result.price} ${result.currency}\n\n`;
      });
    }
    
    message += `*${response.message}*`;
    return message;
  }

  formatBookingResponse(response) {
    return `✅ **Booking Confirmed**\n\n${response.message}\n\nBooking ID: ${response.details?.booking_id || 'N/A'}`;
  }

  formatSystemStatusResponse(response) {
    const data = response.details;
    let message = `📊 **System Status**\n\n`;
    
    if (data?.agents) {
      message += `🤖 **Agents:** ${data.agents.active_agents}/${data.agents.total_agents} active\n`;
    }
    
    if (data?.mcp_bridge) {
      message += `🔗 **MCP Connections:** ${data.mcp_bridge.active_connections}/${data.mcp_bridge.total_connections}\n`;
    }
    
    if (data?.observability) {
      message += `📈 **System Health:** ${data.observability.health_status}\n`;
    }
    
    message += `\n*${response.message}*`;
    return message;
  }

  formatAgentCreationResponse(response) {
    const agent = response.details?.agent;
    let message = `🤖 **Agent Created**\n\n`;
    
    if (agent) {
      message += `Name: ${agent.name}\n`;
      message += `Type: ${agent.type}\n`;
      message += `Status: ${agent.status}\n`;
      message += `ID: \`${agent.id}\`\n\n`;
    }
    
    message += `*${response.message}*`;
    return message;
  }

  formatGeneralResponse(response) {
    return response.message || 'I received your message and processed it through our multi-agent system.';
  }

  // Keyboard creation
  createTravelSearchKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '🔄 Refine Search', callback_data: 'refine_search' },
          { text: '📋 View Details', callback_data: 'view_details' }
        ],
        [
          { text: '💳 Book Now', callback_data: 'book_flight' },
          { text: '❌ Cancel', callback_data: 'cancel_search' }
        ]
      ]
    };
  }

  // User session management
  getOrCreateUserSession(userId, chatId) {
    if (!this.userSessions.has(userId)) {
      const session = {
        userId: userId,
        chatId: chatId,
        sessionId: `session_${userId}_${Date.now()}`,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        preferences: {},
        recentMessages: [],
        conversationContext: null,
        activeTasks: new Map()
      };
      
      this.userSessions.set(userId, session);
      this.logger.info('Created new user session', { userId, chatId });
    }
    
    return this.userSessions.get(userId);
  }

  updateUserSession(userSession, input, response) {
    userSession.lastActivity = new Date().toISOString();
    
    // Add to recent messages
    userSession.recentMessages.push({
      type: 'user',
      text: input.text,
      timestamp: new Date().toISOString()
    });
    
    userSession.recentMessages.push({
      type: 'assistant',
      text: response.formats?.text?.message || response.message,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 10 messages
    if (userSession.recentMessages.length > 10) {
      userSession.recentMessages = userSession.recentMessages.slice(-10);
    }
    
    // Update conversation context
    if (response.response?.type) {
      userSession.conversationContext = {
        intent: response.response.type,
        entities: response.response.data || response.response.results,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Task completion notifications
  notifyUserOfTaskCompletion(task) {
    // Find user sessions that might be waiting for this task
    for (const [userId, session] of this.userSessions) {
      if (session.activeTasks.has(task.id)) {
        // Send notification to user
        this.logger.info('Notifying user of task completion', {
          userId,
          taskId: task.id,
          command: task.command
        });
        
        session.activeTasks.delete(task.id);
      }
    }
  }

  notifyUserOfTaskFailure(task, error) {
    // Find user sessions that might be waiting for this task
    for (const [userId, session] of this.userSessions) {
      if (session.activeTasks.has(task.id)) {
        // Send error notification to user
        this.logger.error('Notifying user of task failure', {
          userId,
          taskId: task.id,
          command: task.command,
          error: error.message
        });
        
        session.activeTasks.delete(task.id);
      }
    }
  }

  // System management methods
  async getSystemStatus() {
    return this.orchestrator.getSystemHealth();
  }

  async listAgents() {
    return this.orchestrator.listAgents();
  }

  async createAgent(type, config) {
    return this.orchestrator.createAgent(type, config);
  }

  async commandAgent(agentId, command, params) {
    return this.orchestrator.commandAgent(agentId, command, params);
  }

  async deleteAgent(agentId) {
    return this.orchestrator.deleteAgent(agentId);
  }

  // User session management
  getUserSession(userId) {
    return this.userSessions.get(userId);
  }

  getAllUserSessions() {
    return Array.from(this.userSessions.values());
  }

  clearUserSession(userId) {
    if (this.userSessions.has(userId)) {
      this.userSessions.delete(userId);
      this.logger.info('Cleared user session', { userId });
    }
  }

  // Cleanup inactive sessions
  cleanupInactiveSessions() {
    const now = new Date();
    const inactiveThreshold = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [userId, session] of this.userSessions) {
      const lastActivity = new Date(session.lastActivity);
      if (now - lastActivity > inactiveThreshold) {
        this.userSessions.delete(userId);
        this.logger.info('Cleaned up inactive session', { userId });
      }
    }
  }
}

module.exports = TelegramMultiAgentIntegration;

