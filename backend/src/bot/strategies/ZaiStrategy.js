
const AIStrategy = require('./AIStrategy');
const ZaiClient = require('../../ai/zaiClient');
const MayaPersona = require('../../ai/mayaPersona');

/**
 * ZaiStrategy uses the Z.ai client to generate AI-powered responses.
 */
class ZaiStrategy extends AIStrategy {
  constructor() {
    super('Zai');
    this.zaiClient = new ZaiClient();
    this.mayaPersona = new MayaPersona();
  }

  /**
   * Generates a chat response using the Z.ai client.
   * @param {string} message - The user's message.
   * @param {Array<object>} history - The conversation history.
   * @returns {Promise<string>} The AI-generated response.
   */
  async generateResponse(message, history = []) {
    const systemPrompt = this.mayaPersona.generateSystemPrompt({
        conversation_history: history,
    });

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    const response = await this.zaiClient.chatCompletion(messages, { maxTokens: 800 });

    if (response.success) {
      return response.content;
    } else {
      throw new Error('Failed to get response from Z.ai client.');
    }
  }

  /**
   * Generates insights for a specific destination using the Z.ai client.
   * @param {string} destination - The destination to get insights for.
   * @returns {Promise<string>} The AI-generated insights.
   */
  async getDestinationInsights(destination) {
    const response = await this.zaiClient.generateDestinationInsights(destination, 'leisure');
    if (response.success) {
        return response.content;
    } else {
        throw new Error(`Failed to get insights for ${destination} from Z.ai client.`);
    }
  }

  /**
   * Performs a health check on the Z.ai service.
   * @returns {Promise<boolean>} A promise that resolves to true if the service is healthy, false otherwise.
   */
  async healthCheck() {
    const health = await this.zaiClient.healthCheck();
    return health.status === 'healthy';
  }
}

module.exports = ZaiStrategy;
