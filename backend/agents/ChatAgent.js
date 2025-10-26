// backend/agents/ChatAgent.js
const { getAi } = require('../services/geminiService');
const logger = require('../utils/logger');

/**
 * @class ChatAgent
 * @description An agent that handles conversational chat with the Gemini API.
 * This agent is responsible for taking a user's prompt and conversation history,
 * formatting it for the Gemini API, and returning the AI's response.
 */
class ChatAgent {
  /**
   * @constructor
   * @description Initializes the ChatAgent with a name, description, and the model to be used.
   */
  constructor() {
    this.name = 'Chat Agent';
    this.description = 'Handles conversational chat with Gemini.';
    this.modelName = 'gemini-2.5-flash'; 
  }

  /**
   * Executes a chat task.
   * @param {object} task - The task to be executed.
   * @param {string} task.type - The type of task, which must be 'sendMessage'.
   * @param {string} task.prompt - The user's message to the chat.
   * @param {Array<object>} [task.history] - The conversation history.
   * @returns {Promise<object>} An object containing the AI's response.
   * @throws {Error} If the task type is unknown or the prompt is missing.
   */
  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);

    if (task.type !== 'sendMessage') {
      throw new Error(`Unknown task type for Chat Agent: ${task.type}`);
    }

    if (!task.prompt) {
      throw new Error('Prompt is required for sendMessage task.');
    }

    try {
      const ai = getAi();
      
      // The history from the frontend is an array of { role, text }.
      // We need to format it into { role, parts: [{ text }] }.
      const formattedHistory = (task.history || []).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      const chat = ai.chats.create({
        model: this.modelName,
        history: formattedHistory,
      });

      const result = await chat.sendMessage({ message: task.prompt });
      
      return { response: result.text };

    } catch (error) {
      logger.error(`[${this.name}] Error during chat execution:`, error.message);
      throw new Error('Failed to get a response from the Gemini API.');
    }
  }
}

module.exports = ChatAgent;
