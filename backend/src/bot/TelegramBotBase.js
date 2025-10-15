
const TelegramBot = require('node-telegram-bot-api');
const logger = require('../../utils/logger');
const { errorHandler } = require('../../utils/errorHandler');

/**
 * TelegramBotBase provides a foundational structure for creating Telegram bots.
 * It includes a command registry, error handling, graceful shutdown, and a safe handler wrapper.
 */
class TelegramBotBase {
  /**
   * @param {string} token - The Telegram bot token.
   * @param {object} [options={}] - Options for the bot (e.g., polling).
   */
  constructor(token, options = {}) {
    if (!token) {
      throw new Error('Telegram bot token is required.');
    }
    this.bot = new TelegramBot(token, options);
    this.commands = new Map();
  }

  /**
   * Wraps a handler function with error handling and logging.
   * @param {function} handler - The handler function to wrap.
   * @returns {function} The wrapped handler function.
   */
  safeHandler(handler) {
    return async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from ? msg.from.id : null;
      try {
        logger.info(`Executing command for user ${userId} in chat ${chatId}`);
        await handler(msg, match);
      } catch (error) {
        errorHandler.handle(error, { userId, chatId, command: msg.text });
        try {
          await this.bot.sendMessage(chatId, 'An unexpected error occurred.');
        } catch (sendError) {
          logger.error('Failed to send error message to user.', { sendError });
        }
      }
    };
  }

  /**
   * Registers a command handler.
   * @param {RegExp} commandRegex - The regex to match the command.
   * @param {function} handler - The function to handle the command.
   */
  registerCommand(commandRegex, handler) {
    if (this.commands.has(commandRegex.source)) {
        logger.warn(`Command ${commandRegex.source} is already registered. Overwriting.`);
    }
    this.commands.set(commandRegex, this.safeHandler(handler));
  }

  /**
   * Sets up the handlers for all registered commands.
   */
  setupCommandHandlers() {
    if (this.commands.size === 0) {
      logger.warn('No commands have been registered.');
      return;
    }
    for (const [regex, handler] of this.commands.entries()) {
      this.bot.onText(regex, handler);
    }
    logger.info(`${this.commands.size} command handlers set up.`);
  }

  /**
   * Sets up the handler for callback queries.
   * @param {function} handler - The function to handle callback queries.
   */
  setupCallbackQueryHandler(handler) {
    this.bot.on('callback_query', this.safeHandler(handler));
    logger.info('Callback query handler set up.');
  }

  /**
   * Sets up the handler for general text messages (non-commands).
   * @param {function} handler - The function to handle text messages.
   */
  setupTextHandler(handler) {
    this.bot.on('text', (msg) => {
      // Ignore commands that are matched by onText
      if (Array.from(this.commands.keys()).some(regex => regex.test(msg.text))) {
        return;
      }
      this.safeHandler(handler)(msg);
    });
    logger.info('General text message handler set up.');
  }

  /**
   * Sets up handlers for bot errors.
   */
  setupErrorHandlers() {
    this.bot.on('error', (error) => {
      errorHandler.handle(error, { source: 'telegram_bot' });
    });
    this.bot.on('polling_error', (error) => {
      errorHandler.handle(error, { source: 'telegram_polling' });
    });
    logger.info('Bot error handlers set up.');
  }

  /**
   * Sets up graceful shutdown handlers.
   */
  setupGracefulShutdown() {
    const shutdown = async () => {
      logger.info('Shutting down Telegram bot...');
      if (this.bot.isPolling()) {
        await this.bot.stopPolling();
      }
      logger.info('Bot stopped gracefully.');
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    logger.info('Graceful shutdown handler set up.');
  }

  /**
   * Starts the bot's polling mechanism.
   */
  start() {
    this.setupErrorHandlers();
    this.setupGracefulShutdown();
    this.bot.startPolling();
    logger.info('Bot polling started.');
  }

  /**
   * Stops the bot's polling mechanism.
   */
  async stop() {
      if (this.bot.isPolling()) {
          await this.bot.stopPolling();
          logger.info('Bot polling stopped.');
      }
  }
}

module.exports = TelegramBotBase;
