
const TelegramBotBase = require('./TelegramBotBase');
const fs = require('fs');
const path = require('path');

// Load localized strings
const localesPath = path.join(__dirname, 'locales', 'ar.json');
const i18n = JSON.parse(fs.readFileSync(localesPath, 'utf8'));

/**
 * UnifiedBot brings together the base bot, strategies, and internationalization.
 * It can be configured with any AI strategy that conforms to the AIStrategy interface.
 */
class UnifiedBot extends TelegramBotBase {
  /**
   * @param {string} token - The Telegram bot token.
   * @param {AIStrategy} aiStrategy - The AI strategy to use for generating responses.
   * @param {object} [options={}] - Options for the bot.
   */
  constructor(token, aiStrategy, options = {}) {
    super(token, options);
    if (!aiStrategy) {
      throw new Error('An AI strategy must be provided.');
    }
    this.aiStrategy = aiStrategy;
    this.conversationHistories = new Map(); // In-memory conversation history
    this.userStates = new Map(); // For conversation control

    this.registerCommands();
    this.setupCallbackQueryHandler(this.handleCallbackQuery.bind(this));
    this.setupTextHandler(this.handleText.bind(this));
  }

  /**
   * Registers all the bot's commands.
   */
  registerCommands() {
    this.registerCommand(/\/start/, this.handleStart.bind(this));
    this.registerCommand(/\/help/, this.handleHelp.bind(this));
    // Add other commands from Phase 3 here (e.g., /trip, /budget)
  }

  /**
   * Handles the /start command.
   * @param {object} msg - The Telegram message object.
   */
  async handleStart(msg) {
    const chatId = msg.chat.id;
    await this.bot.sendMessage(chatId, i18n.welcome, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: i18n.buttons.new_trip, callback_data: 'new_trip' },
              { text: i18n.buttons.budget, callback_data: 'budget' }
            ],
            [
              { text: i18n.buttons.payment, callback_data: 'payment' },
              { text: i18n.buttons.help, callback_data: 'help' }
            ]
          ]
        }
      });
  }

  /**
   * Handles the /help command.
   * @param {object} msg - The Telegram message object.
   */
  async handleHelp(msg) {
    const chatId = msg.chat.id;
    await this.bot.sendMessage(chatId, i18n.help);
  }

  /**
   * Handles incoming text messages (non-commands).
   * @param {object} msg - The Telegram message object.
   */
  async handleText(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    await this.bot.sendChatAction(chatId, 'typing');

    const history = this.conversationHistories.get(userId) || [];

    // Conversation Control Logic from advanced-telegram-bot.js
    const recentMessages = history.slice(-6);
    const repetitionCount = recentMessages.filter(m => 
      m.role === 'assistant' && this.isSimilarQuestion(m.content, text)
    ).length;

    if (repetitionCount >= 2) {
      await this.bot.sendMessage(chatId, '🔄 يبدو أننا نكرر نفس الموضوع. دعني أساعدك بطريقة مختلفة:');
      return;
    }

    const endKeywords = ['إنهاء', 'انهاء', 'توقف', 'كفاية', 'شكرا وداعا', 'end', 'stop', 'bye'];
    if (endKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
      this.conversationHistories.delete(userId);
      this.userStates.delete(userId);
      await this.bot.sendMessage(chatId, '✅ تم إنهاء المحادثة بنجاح!');
      return;
    }

    const userState = this.userStates.get(userId) || { turnCount: 0 };
    userState.turnCount = (userState.turnCount || 0) + 1;

    if (userState.turnCount >= 15) {
      await this.bot.sendMessage(chatId, '⏰ لقد تحدثنا كثيراً حول هذا الموضوع! هل تريد إنهاء المحادثة والبدء من جديد؟');
      userState.turnCount = 0;
      this.userStates.set(userId, userState);
      return;
    }

    this.userStates.set(userId, userState);

    // Get AI response
    const response = await this.aiStrategy.generateResponse(text, history);
    await this.bot.sendMessage(chatId, response);

    // Update history
    history.push({ role: 'user', content: text });
    history.push({ role: 'assistant', content: response });
    this.conversationHistories.set(userId, history);
  }

  /**
   * Check if two messages are asking similar questions
   * @param {string} msg1
   * @param {string} msg2
   * @returns {boolean}
   */
  isSimilarQuestion(msg1, msg2) {
    const normalize = (str) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const words1 = normalize(msg1).split(/\s+/);
    const words2 = normalize(msg2).split(/\s+/);
    
    const commonWords = words1.filter(w => words2.includes(w) && w.length > 3);
    return commonWords.length >= 3;
  }

  /**
   * Handles incoming callback queries.
   * @param {object} callbackQuery - The Telegram callback query object.
   */
  async handleCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    await this.bot.answerCallbackQuery(callbackQuery.id);

    let response = `Received callback: ${data}`;
    // Logic for different callbacks will be added here
    if (data === 'new_trip') {
        response = i18n.new_trip_prompt;
    } else if (data === 'budget') {
        response = i18n.budget_prompt;
    }

    await this.bot.sendMessage(chatId, response);
  }
}

module.exports = UnifiedBot;
