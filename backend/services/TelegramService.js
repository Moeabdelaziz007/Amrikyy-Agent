// backend/src/services/TelegramService.js
const TelegramBot = require('node-telegram-bot-api');
const logger = require('../utils/logger');

/**
 * @class TelegramService
 * @description A service class for interacting with the Telegram Bot API.
 * This class provides a method for sending messages to a specified Telegram chat.
 * It handles the initialization of the Telegram bot and gracefully handles cases where the bot token is not provided.
 */
class TelegramService {
  /**
   * @constructor
   * @description Initializes the TelegramService.
   * It sets up the Telegram bot client using the token from the environment variables.
   * If the token is not found, it logs a warning and disables the bot to prevent runtime errors.
   */
  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN;
    if (!this.token) {
      logger.warn('[TelegramService] TELEGRAM_BOT_TOKEN is not set. Telegram features will be disabled.');
      this.bot = null;
    } else {
      // Using polling: false as we are only sending messages, not listening for them.
      this.bot = new TelegramBot(this.token, { polling: false });
      logger.info('[TelegramService] Initialized successfully.');
    }
  }

  /**
   * @private
   * @method _checkClient
   * @description Checks if the Telegram bot client is initialized.
   * Throws an error if the client is not available, preventing API calls from being made without a valid configuration.
   * @throws {Error} If the Telegram bot client is not configured.
   */
  _checkClient() {
    if (!this.bot) {
      throw new Error('Telegram Service is not configured. Please provide TELEGRAM_BOT_TOKEN.');
    }
  }

  /**
   * @method sendMessage
   * @description Sends a message to a specified Telegram chat.
   * @param {string|number} chatId - The unique identifier for the target chat.
   * @param {string} message - The text of the message to be sent.
   * @returns {Promise<object>} An object indicating the success of the operation.
   * @throws {Error} If the message fails to send.
   */
  async sendMessage(chatId, message) {
    this._checkClient();
    try {
      await this.bot.sendMessage(chatId, message);
      logger.info(`[TelegramService] Message sent to chat ID: ${chatId}`);
      return { success: true, message: 'Telegram message sent successfully.' };
    } catch (error) {
      logger.error(`[TelegramService] Failed to send message to ${chatId}:`, error.message);
      throw new Error(`Failed to send Telegram message: ${error.message}`);
    }
  }
}

module.exports = TelegramService;
