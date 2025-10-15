
const AIStrategy = require('./AIStrategy');
const GeminiClient = require('../../ai/geminiClient');
const NodeCache = require('node-cache');

/**
 * GeminiStrategy uses the Google Gemini client to generate AI-powered responses.
 * It uses an in-memory cache to store responses and improve performance.
 */
class GeminiStrategy extends AIStrategy {
  constructor() {
    super('Gemini');
    this.geminiClient = new GeminiClient();
    // Cache for 10 minutes
    this.cache = new NodeCache({ stdTTL: 600 });
  }

  /**
   * Generates a chat response using the Gemini client.
   * @param {string} message - The user's message.
   * @param {Array<object>} history - The conversation history.
   * @returns {Promise<string>} The AI-generated response.
   */
  async generateResponse(message, history = []) {
    const cacheKey = `generateResponse::${message}::${JSON.stringify(history)}`;
    const cachedResponse = this.cache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await this.geminiClient.generateChatResponse(message, history);
    if (response.success) {
      this.cache.set(cacheKey, response.content);
      return response.content;
    } else {
      throw new Error('Failed to get response from Gemini client.');
    }
  }

  /**
   * Generates insights for a specific destination using the Gemini client.
   * @param {string} destination - The destination to get insights for.
   * @returns {Promise<string>} The AI-generated insights.
   */
  async getDestinationInsights(destination) {
    const cacheKey = `getDestinationInsights::${destination}`;
    const cachedInsights = this.cache.get(cacheKey);
    if (cachedInsights) {
        return cachedInsights;
    }

    const response = await this.geminiClient.generateDestinationInsights(destination, 'leisure');
    if (response.success) {
        this.cache.set(cacheKey, response.content);
        return response.content;
    } else {
        throw new Error(`Failed to get insights for ${destination} from Gemini client.`);
    }
  }

  /**
   * Performs a health check on the Gemini service.
   * @returns {Promise<boolean>} A promise that resolves to true if the service is healthy, false otherwise.
   */
  async healthCheck() {
    const health = await this.geminiClient.healthCheck();
    return health.status === 'healthy';
  }
}

module.exports = GeminiStrategy;
