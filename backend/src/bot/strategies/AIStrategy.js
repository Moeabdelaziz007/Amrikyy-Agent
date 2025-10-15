
/**
 * AIStrategy is a base class for defining AI response generation strategies.
 * All AI strategy implementations should extend this class.
 */
class AIStrategy {
  /**
   * Constructor for the AI strategy.
   * @param {string} name - The name of the strategy (e.g., 'Zai', 'Gemini', 'NoAI').
   */
  constructor(name) {
    if (this.constructor === AIStrategy) {
      throw new Error("Abstract classes can't be instantiated.");
    }
    this.name = name;
  }

  /**
   * Generates a chat response based on the user's message and conversation history.
   * This method must be overridden by concrete strategy classes.
   * @param {string} message - The user's message.
   * @param {Array<object>} history - The conversation history.
   * @returns {Promise<string>} The AI-generated response.
   */
  async generateResponse(message, history) {
    throw new Error("Method 'generateResponse()' must be implemented.");
  }

  /**
   * Generates insights for a specific destination.
   * This method can be overridden by concrete strategy classes.
   * @param {string} destination - The destination to get insights for.
   * @returns {Promise<string>} The AI-generated insights.
   */
  async getDestinationInsights(destination) {
    throw new Error("Method 'getDestinationInsights()' must be implemented.");
  }

  /**
    * Performs a health check on the AI service.
    * @returns {Promise<boolean>} A promise that resolves to true if the service is healthy, false otherwise.
    */
  async healthCheck() {
    throw new Error("Method 'healthCheck()' must be implemented.");
  }
}

module.exports = AIStrategy;
