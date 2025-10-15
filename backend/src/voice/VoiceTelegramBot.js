/**
 * Voice-Enabled Telegram Bot for Maya Travel Assistant
 * Integrates voice processing with multi-agent orchestration
 */

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const VoiceProcessor = require('./VoiceProcessor');
const MasterOrchestrator = require('../orchestrator/MasterOrchestrator');

class VoiceTelegramBot {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/voice-telegram-bot.log' }),
        new winston.transports.Console()
      ]
    });

    // Initialize components
    this.bot = null;
    this.voiceProcessor = new VoiceProcessor();
    this.orchestrator = new MasterOrchestrator();
    
    // User sessions
    this.userSessions = new Map();
    
    // Voice message handling
    this.voiceProcessingQueue = new Map();
    
    this.initializeBot();
  }

  async initializeBot() {
    try {
      // Initialize Telegram bot
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token) {
        throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
      }

      this.bot = new TelegramBot(token, { polling: true });
      this.logger.info('Telegram bot initialized');

      // Initialize voice processor
      await this.voiceProcessor.initializeSystem();
      this.logger.info('Voice processor initialized');

      // Initialize orchestrator
      await this.orchestrator.initializeSystem();
      this.logger.info('Master orchestrator initialized');

      // Set up event listeners
      this.setupEventListeners();
      
      // Set up bot command handlers
      this.setupCommandHandlers();
      
      // Set up message handlers
      this.setupMessageHandlers();

      this.logger.info('Voice-enabled Telegram bot fully initialized');
    } catch (error) {
      this.logger.error('Failed to initialize voice Telegram bot', { error: error.message });
      throw error;
    }
  }

  setupEventListeners() {
    // Voice processor events
    this.voiceProcessor.on('system_initialized', () => {
      this.logger.info('Voice processing system ready');
    });

    // Orchestrator events
    this.orchestrator.on('orchestrator_initialized', () => {
      this.logger.info('Multi-agent orchestrator ready');
    });

    this.orchestrator.on('agent_task_started', (data) => {
      this.logger.info('Agent task started', { agent: data.agentId, task: data.task.type });
    });

    this.orchestrator.on('agent_task_completed', (data) => {
      this.logger.info('Agent task completed', { agent: data.agentId, task: data.task.type });
    });
  }

  setupCommandHandlers() {
    // Start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      
      this.logger.info('User started conversation', { userId, chatId });
      
      const welcomeMessage = `🎙️ Marhaba! I'm Maya, your AI travel companion with voice capabilities! 👋

I have a whole team of specialists ready to help you plan the perfect trip:

🎫 **Luna** - Your travel architect and itinerary designer
💰 **Karim** - Your budget optimizer and financial strategist  
🗺️ **Layla** - Your cultural guide and destination expert
📞 **Amira** - Your support specialist and problem solver
💳 **Tariq** - Your payment specialist and security expert
🔍 **Zara** - Your research specialist and information expert

**Voice Features:**
🎤 Send me voice messages in Arabic, English, or French
🔊 I'll respond with natural, personalized voices for each agent
🌍 Multi-language support with cultural context

**How to use:**
• Send a voice message describing your travel needs
• Type your questions if you prefer text
• Use /help for more commands

What adventure are you dreaming of? 🗺️✨`;

      await this.bot.sendMessage(chatId, welcomeMessage);
      
      // Initialize user session
      this.userSessions.set(userId, {
        chatId,
        language: 'ar', // Default to Arabic
        conversationId: `tg_${userId}_${Date.now()}`,
        voiceEnabled: true,
        lastActivity: new Date().toISOString()
      });
    });

    // Help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      
      const helpMessage = `🆘 **Maya Voice Assistant Help**

**Voice Commands:**
🎤 Send voice messages in Arabic, English, or French
🔊 Get voice responses from specialized agents

**Text Commands:**
/start - Start conversation with Maya
/help - Show this help message
/agents - List all available agents
/status - Check system health
/language <code> - Set language (ar, en, fr)

**Examples:**
• "أريد التخطيط لرحلة إلى اليابان" (Arabic)
• "I want to plan a trip to Japan" (English)
• "Je veux planifier un voyage au Japon" (French)

**Supported Languages:**
🇸🇦 Arabic (العربية)
🇺🇸 English
🇫🇷 French (Français)
🇪🇸 Spanish (Español)
🇩🇪 German (Deutsch)
🇮🇹 Italian (Italiano)

Need help? Just ask! 😊`;

      await this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    });

    // Agents command
    this.bot.onText(/\/agents/, async (msg) => {
      const chatId = msg.chat.id;
      const agents = this.orchestrator.listAgents();
      
      let agentsMessage = `🤖 **Maya's Specialist Team**\n\n`;
      
      agents.forEach(agent => {
        const statusEmoji = agent.status === 'active' ? '🟢' : '🔴';
        agentsMessage += `${statusEmoji} **${agent.name}** ${agent.avatar}\n`;
        agentsMessage += `   ${agent.title}\n`;
        agentsMessage += `   Status: ${agent.status}\n\n`;
      });
      
      agentsMessage += `**Voice Capabilities:**\n`;
      agentsMessage += `🎤 Each agent has a unique voice personality\n`;
      agentsMessage += `🌍 Multi-language support\n`;
      agentsMessage += `🎭 Emotion-aware responses\n`;
      
      await this.bot.sendMessage(chatId, agentsMessage, { parse_mode: 'Markdown' });
    });

    // Status command
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      
      try {
        const health = this.orchestrator.getSystemHealth();
        const voiceHealth = await this.voiceProcessor.healthCheck();
        
        let statusMessage = `📊 **System Status**\n\n`;
        statusMessage += `🎙️ **Voice Processing:** ${voiceHealth.overall_health}\n`;
        statusMessage += `🤖 **Orchestrator:** ${health.orchestrator_health}\n`;
        statusMessage += `💬 **Active Conversations:** ${health.active_conversations}\n\n`;
        
        statusMessage += `**Agent Status:**\n`;
        Object.entries(health.agent_status).forEach(([agentId, status]) => {
          const emoji = status.health === 'healthy' ? '🟢' : '🔴';
          statusMessage += `${emoji} ${status.name}: ${status.status}\n`;
        });
        
        await this.bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
      } catch (error) {
        await this.bot.sendMessage(chatId, '❌ Error checking system status');
      }
    });

    // Language command
    this.bot.onText(/\/language (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const language = match[1].toLowerCase();
      
      const supportedLanguages = this.voiceProcessor.getSupportedLanguages();
      
      if (supportedLanguages.includes(language)) {
        const session = this.userSessions.get(userId);
        if (session) {
          session.language = language;
          this.userSessions.set(userId, session);
          
          const languageNames = {
            'ar': 'العربية',
            'en': 'English',
            'fr': 'Français',
            'es': 'Español',
            'de': 'Deutsch',
            'it': 'Italiano'
          };
          
          await this.bot.sendMessage(chatId, `🌍 Language set to: ${languageNames[language] || language}`);
        }
      } else {
        await this.bot.sendMessage(chatId, `❌ Unsupported language. Supported: ${supportedLanguages.join(', ')}`);
      }
    });
  }

  setupMessageHandlers() {
    // Handle voice messages
    this.bot.on('voice', async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      
      try {
        this.logger.info('Voice message received', { userId, chatId, fileId: msg.voice.file_id });
        
        // Show processing message
        const processingMsg = await this.bot.sendMessage(chatId, '🎤 Processing your voice message...');
        
        // Get user session
        const session = this.userSessions.get(userId) || this.createUserSession(userId, chatId);
        
        // Download voice file
        const voiceFile = await this.bot.getFile(msg.voice.file_id);
        const audioBuffer = await this.downloadFile(voiceFile.file_path);
        
        // Process voice input
        const voiceResult = await this.voiceProcessor.processVoiceInput(audioBuffer, session.language);
        
        // Update processing message
        await this.bot.editMessageText('🧠 Understanding your request...', {
          chat_id: chatId,
          message_id: processingMsg.message_id
        });
        
        // Process with orchestrator
        const response = await this.orchestrator.processMessage(
          voiceResult.text,
          userId,
          session.conversationId
        );
        
        // Update processing message
        await this.bot.editMessageText('🎭 Generating personalized response...', {
          chat_id: chatId,
          message_id: processingMsg.message_id
        });
        
        // Generate voice response
        let voiceResponse = null;
        if (response.success && response.agent) {
          const agent = this.orchestrator.getAgent(response.agent);
          if (agent) {
            voiceResponse = await this.voiceProcessor.generateVoiceResponse(
              this.formatResponseForVoice(response.response),
              agent,
              session.language
            );
          }
        }
        
        // Delete processing message
        await this.bot.deleteMessage(chatId, processingMsg.message_id);
        
        // Send text response
        const textMessage = this.formatResponseForText(response.response);
        await this.bot.sendMessage(chatId, textMessage, { parse_mode: 'Markdown' });
        
        // Send voice response if available
        if (voiceResponse && voiceResponse.audio) {
          // Save audio to temporary file
          const tempAudioPath = path.join(__dirname, '..', '..', 'temp', `voice_${Date.now()}.mp3`);
          await fs.promises.writeFile(tempAudioPath, voiceResponse.audio);
          
          // Send voice message
          await this.bot.sendVoice(chatId, tempAudioPath, {
            caption: `🎙️ ${agent.identity.name} speaking`
          });
          
          // Clean up temporary file
          await fs.promises.unlink(tempAudioPath);
        }
        
        this.logger.info('Voice message processed successfully', { 
          userId, 
          confidence: voiceResult.confidence,
          agent: response.agent
        });
        
      } catch (error) {
        this.logger.error('Error processing voice message', { error: error.message });
        await this.bot.sendMessage(chatId, '❌ Sorry, I had trouble processing your voice message. Please try again.');
      }
    });

    // Handle text messages
    this.bot.on('message', async (msg) => {
      // Skip if it's a voice message (handled separately)
      if (msg.voice) return;
      
      // Skip commands (handled separately)
      if (msg.text && msg.text.startsWith('/')) return;
      
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      
      if (!msg.text) return;
      
      try {
        this.logger.info('Text message received', { userId, chatId, text: msg.text.substring(0, 100) });
        
        // Get user session
        const session = this.userSessions.get(userId) || this.createUserSession(userId, chatId);
        
        // Show typing indicator
        await this.bot.sendChatAction(chatId, 'typing');
        
        // Process with orchestrator
        const response = await this.orchestrator.processMessage(
          msg.text,
          userId,
          session.conversationId
        );
        
        // Generate voice response if voice is enabled
        let voiceResponse = null;
        if (session.voiceEnabled && response.success && response.agent) {
          const agent = this.orchestrator.getAgent(response.agent);
          if (agent) {
            voiceResponse = await this.voiceProcessor.generateVoiceResponse(
              this.formatResponseForVoice(response.response),
              agent,
              session.language
            );
          }
        }
        
        // Send text response
        const textMessage = this.formatResponseForText(response.response);
        await this.bot.sendMessage(chatId, textMessage, { parse_mode: 'Markdown' });
        
        // Send voice response if available
        if (voiceResponse && voiceResponse.audio) {
          // Save audio to temporary file
          const tempAudioPath = path.join(__dirname, '..', '..', 'temp', `voice_${Date.now()}.mp3`);
          await fs.promises.writeFile(tempAudioPath, voiceResponse.audio);
          
          // Send voice message
          await this.bot.sendVoice(chatId, tempAudioPath, {
            caption: `🎙️ ${agent.identity.name} speaking`
          });
          
          // Clean up temporary file
          await fs.promises.unlink(tempAudioPath);
        }
        
      } catch (error) {
        this.logger.error('Error processing text message', { error: error.message });
        await this.bot.sendMessage(chatId, '❌ Sorry, I had trouble processing your message. Please try again.');
      }
    });
  }

  createUserSession(userId, chatId) {
    const session = {
      chatId,
      language: 'ar',
      conversationId: `tg_${userId}_${Date.now()}`,
      voiceEnabled: true,
      lastActivity: new Date().toISOString()
    };
    
    this.userSessions.set(userId, session);
    return session;
  }

  async downloadFile(filePath) {
    // Mock implementation - in production, implement actual file download
    return Buffer.from('mock audio data');
  }

  formatResponseForText(response) {
    if (typeof response === 'string') {
      return response;
    }
    
    if (response.type === 'comprehensive_response') {
      let text = `🎯 **Your Travel Plan is Ready!**\n\n`;
      
      if (response.summary) {
        text += `${response.summary}\n\n`;
      }
      
      if (response.recommendations && response.recommendations.length > 0) {
        text += `**Recommendations:**\n`;
        response.recommendations.forEach(rec => {
          text += `${rec}\n`;
        });
      }
      
      return text;
    }
    
    return JSON.stringify(response, null, 2);
  }

  formatResponseForVoice(response) {
    if (typeof response === 'string') {
      return response;
    }
    
    if (response.type === 'comprehensive_response') {
      return response.summary || 'Your travel plan has been created with input from multiple specialists.';
    }
    
    // Convert complex objects to simple text for voice
    return 'I have processed your request and prepared a comprehensive response.';
  }

  /**
   * Start the bot
   */
  async start() {
    try {
      await this.initializeBot();
      this.logger.info('Voice-enabled Telegram bot started successfully');
    } catch (error) {
      this.logger.error('Failed to start voice Telegram bot', { error: error.message });
      throw error;
    }
  }

  /**
   * Stop the bot
   */
  async stop() {
    if (this.bot) {
      await this.bot.stopPolling();
      this.logger.info('Voice Telegram bot stopped');
    }
  }

  /**
   * Get bot statistics
   */
  getStats() {
    return {
      active_sessions: this.userSessions.size,
      voice_processing_queue: this.voiceProcessingQueue.size,
      supported_languages: this.voiceProcessor.getSupportedLanguages(),
      available_agents: this.orchestrator.listAgents().length,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = VoiceTelegramBot;

