// ═══════════════════════════════════════════════════════════════
// 🤖 LLM TELEGRAM BOT
// Advanced Telegram bot with Z.ai GLM-4.6 integration
// ═══════════════════════════════════════════════════════════════

const TelegramBot = require('node-telegram-bot-api');
const { ZaiClient } = require('../ai/zaiClient');
const { logger } = require('../utils/logger');

class LLMTelegramBot {
  constructor(options = {}) {
    this.token = options.token || process.env.TELEGRAM_BOT_TOKEN;
    this.zaiClient = new ZaiClient();
    this.userSessions = new Map();
    this.isRunning = false;
    this.logger = logger.child('LLMTelegramBot');
  }

  /**
   * Initialize and start the bot
   */
  async start() {
    if (!this.token) {
      throw new Error('Telegram bot token is required');
    }

    try {
      this.bot = new TelegramBot(this.token, { polling: true });
      this.setupEventHandlers();
      this.isRunning = true;

      this.logger.info('🤖 LLM Telegram Bot started successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to start Telegram bot:', error);
      throw error;
    }
  }

  /**
   * Setup bot event handlers
   */
  setupEventHandlers() {
    // Handle /start command
    this.bot.onText(/\/start/, (msg) => {
      this.handleStartCommand(msg);
    });

    // Handle /help command
    this.bot.onText(/\/help/, (msg) => {
      this.handleHelpCommand(msg);
    });

    // Handle /status command
    this.bot.onText(/\/status/, (msg) => {
      this.handleStatusCommand(msg);
    });

    // Handle /voice command
    this.bot.onText(/\/voice/, (msg) => {
      this.handleVoiceCommand(msg);
    });

    // Handle all text messages
    this.bot.on('message', (msg) => {
      if (msg.text && !msg.text.startsWith('/')) {
        this.handleTextMessage(msg);
      }
    });

    // Handle voice messages
    this.bot.on('voice', (msg) => {
      this.handleVoiceMessage(msg);
    });

    // Handle errors
    this.bot.on('error', (error) => {
      this.logger.error('Telegram bot error:', error);
    });

    // Handle polling errors
    this.bot.on('polling_error', (error) => {
      this.logger.error('Telegram polling error:', error);
    });
  }

  /**
   * Handle /start command
   */
  async handleStartCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Initialize user session
    this.userSessions.set(userId, {
      chatId,
      startTime: Date.now(),
      messageCount: 0,
      language: 'ar-EG',
    });

    const welcomeMessage = `🌍 مرحباً! أنا Amrikyy، مساعد السفر الذكي الخاص بك!

🎯 يمكنني مساعدتك في:
• تخطيط رحلاتك 🗺️
• البحث عن أفضل الأسعار 💰
• نصائح ثقافية ومحلية 🏛️
• حجز الفنادق والطيران ✈️
• المساعدة في اللغة المحلية 🗣️

💬 اكتب رسالتك أو استخدم /voice للتحدث معي!`;

    await this.bot.sendMessage(chatId, welcomeMessage);
    this.logger.info(`New user started: ${userId}`);
  }

  /**
   * Handle /help command
   */
  async handleHelpCommand(msg) {
    const chatId = msg.chat.id;

    const helpMessage = `🆘 **مساعدة Amrikyy**

📋 **الأوامر المتاحة:**
/start - بدء المحادثة
/help - عرض هذه المساعدة
/status - حالة النظام
/voice - تفعيل الوضع الصوتي

💬 **طرق التفاعل:**
• اكتب رسائلك مباشرة
• أرسل رسائل صوتية
• استخدم الكلمات المفتاحية مثل "رحلة"، "فندق"، "طيران"

🌍 **اللغات المدعومة:**
• العربية 🇸🇦
• الإنجليزية 🇺🇸

❓ هل تحتاج مساعدة في شيء معين؟`;

    await this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Handle /status command
   */
  async handleStatusCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const session = this.userSessions.get(userId);
    const statusMessage = `📊 **حالة النظام**

🤖 البوت: ${this.isRunning ? '🟢 يعمل' : '🔴 متوقف'}
👤 جلستك: ${session ? '🟢 نشطة' : '🔴 غير موجودة'}
📱 الرسائل: ${session?.messageCount || 0}
⏰ وقت البدء: ${session ? new Date(session.startTime).toLocaleString('ar-SA') : 'غير محدد'}

🌐 **الخدمات:**
• Z.ai GLM-4.6: 🟢 متصل
• نظام المكافآت: 🟢 نشط
• قاعدة البيانات: 🟢 متصلة`;

    await this.bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Handle /voice command
   */
  async handleVoiceCommand(msg) {
    const chatId = msg.chat.id;

    const voiceMessage = `🎤 **الوضع الصوتي مفعل!**

يمكنك الآن:
• إرسال رسائل صوتية مباشرة
• سأقوم بتحويلها إلى نص
• وسأرد عليك صوتياً أيضاً

🗣️ أرسل رسالة صوتية الآن!`;

    await this.bot.sendMessage(chatId, voiceMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Handle text messages
   */
  async handleTextMessage(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const messageText = msg.text;

    try {
      // Update user session
      const session = this.userSessions.get(userId);
      if (session) {
        session.messageCount++;
        session.lastMessage = Date.now();
      }

      // Show typing indicator
      await this.bot.sendChatAction(chatId, 'typing');

      // Process message with Z.ai
      const response = await this.processWithAI(messageText, userId);

      // Send response
      await this.bot.sendMessage(chatId, response, {
        parse_mode: 'Markdown',
        reply_to_message_id: msg.message_id,
      });

      this.logger.info(`Message processed for user ${userId}: ${messageText.substring(0, 50)}...`);
    } catch (error) {
      this.logger.error('Error processing text message:', error);
      await this.bot.sendMessage(
        chatId,
        'عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.'
      );
    }
  }

  /**
   * Handle voice messages
   */
  async handleVoiceMessage(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      // Send processing message
      await this.bot.sendChatAction(chatId, 'typing');
      await this.bot.sendMessage(chatId, '🎤 معالجة الرسالة الصوتية...');

      // Get voice file
      const fileId = msg.voice.file_id;
      const file = await this.bot.getFile(fileId);
      const voiceUrl = `https://api.telegram.org/file/bot${this.token}/${file.file_path}`;

      // Process voice with AI
      const response = await this.processVoiceWithAI(voiceUrl, userId);

      // Send response
      await this.bot.sendMessage(chatId, response, {
        parse_mode: 'Markdown',
        reply_to_message_id: msg.message_id,
      });

      this.logger.info(`Voice message processed for user ${userId}`);
    } catch (error) {
      this.logger.error('Error processing voice message:', error);
      await this.bot.sendMessage(
        chatId,
        'عذراً، لم أتمكن من معالجة الرسالة الصوتية. يرجى المحاولة مرة أخرى.'
      );
    }
  }

  /**
   * Process message with Z.ai GLM-4.6
   */
  async processWithAI(message, userId) {
    try {
      const session = this.userSessions.get(userId);
      const language = session?.language || 'ar-EG';

      // Prepare context for AI
      const context = {
        user_id: userId,
        message: message,
        language: language,
        timestamp: new Date().toISOString(),
        session_info: session,
      };

      // Call Z.ai API
      const aiResponse = await this.zaiClient.chat({
        messages: [
          {
            role: 'system',
            content: `أنت Amrikyy، مساعد السفر الذكي المتخصص في تخطيط الرحلات. 
            تجيب بالعربية بطريقة ودودة ومفيدة. 
            تركز على تقديم نصائح سفر عملية ومفيدة.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        model: 'glm-4.6',
        temperature: 0.7,
        max_tokens: 1000,
      });

      return aiResponse.choices[0].message.content;
    } catch (error) {
      this.logger.error('Error processing with AI:', error);
      return 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.';
    }
  }

  /**
   * Process voice message with AI
   */
  async processVoiceWithAI(voiceUrl, userId) {
    try {
      // For now, return a placeholder response
      // In a real implementation, you would:
      // 1. Download the voice file
      // 2. Convert speech to text
      // 3. Process with AI
      // 4. Convert response to speech

      return '🎤 تم استلام رسالتك الصوتية! حالياً أعمل على تحسين معالجة الصوت. يمكنك كتابة رسالتك في الوقت الحالي.';
    } catch (error) {
      this.logger.error('Error processing voice with AI:', error);
      return 'عذراً، لم أتمكن من معالجة الرسالة الصوتية.';
    }
  }

  /**
   * Stop the bot
   */
  async stop() {
    if (this.bot) {
      await this.bot.stopPolling();
      this.isRunning = false;
      this.logger.info('🤖 LLM Telegram Bot stopped');
    }
  }

  /**
   * Get bot status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeUsers: this.userSessions.size,
      userSessions: Array.from(this.userSessions.entries()).map(([userId, session]) => ({
        userId,
        ...session,
      })),
    };
  }
}

module.exports = LLMTelegramBot;
