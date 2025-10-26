// backend/src/agents/mini/CommunicatorAgent.js
const TelegramService = require('../services/TelegramService');
const logger = require('../utils/logger');

/**
 * @class CommunicatorAgent
 * @description An agent responsible for handling communication tasks, such as sending messages via Telegram.
 * This agent integrates with the TelegramService to send messages and provides mock responses for other communication tasks like email.
 */
class CommunicatorAgent {
  /**
   * @constructor
   * @description Initializes the CommunicatorAgent.
   */
  constructor() {
    this.name = 'Communicator Agent';
    this.description = 'Handles sending messages via Telegram and other communication tasks.';
    this.telegramService = new TelegramService();
    
    // Mock responses for email tasks remain
    this.mockSendEmailResult = { messageId: "mock_email_id_123", status: "sent" };
    this.mockEmailItineraryResult = { messageId: "mock_email_id_456", status: "sent" };
    this.mockSendNotificationResult = { status: "Notification sent" };
  }

  /**
   * Executes a communication task.
   * @param {object} task - The task to be executed.
   * @param {string} task.type - The type of communication task (e.g., 'sendTelegramMessage').
   * @param {string} [task.chatId] - The chat ID for Telegram messages.
   * @param {string} [task.message] - The message content.
   * @returns {Promise<object>} The result of the communication task.
   * @throws {Error} If the task type is unknown or required parameters are missing.
   */
  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);

    try {
        switch (task.type) {
            case 'sendTelegramMessage':
                if (!task.chatId || !task.message) throw new Error('Chat ID and message are required.');
                return await this.telegramService.sendMessage(task.chatId, task.message);

            // --- Email tasks remain mocked ---
            case 'sendEmail':
                logger.info(`[${this.name}] Using mock for sendEmail task.`);
                await new Promise(resolve => setTimeout(resolve, 500));
                return this.mockSendEmailResult;

            case 'emailItinerary':
                logger.info(`[${this.name}] Using mock for emailItinerary task.`);
                await new Promise(resolve => setTimeout(resolve, 500));
                return this.mockEmailItineraryResult;
            
            case 'sendNotification':
                logger.info(`[${this.name}] Using mock for sendNotification task.`);
                await new Promise(resolve => setTimeout(resolve, 500));
                return this.mockSendNotificationResult;

            default:
                throw new Error(`Unknown task type for Communicator Agent: ${task.type}`);
        }
    } catch (error) {
        logger.error(`[${this.name}] Error executing task ${task.type}:`, error.message);
        throw error;
    }
  }
}

module.exports = CommunicatorAgent;
