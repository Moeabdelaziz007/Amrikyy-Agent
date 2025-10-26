// backend/agents/NavigatorAgent.js
const logger = require('../utils/logger');

/**
 * @class NavigatorAgent
 * @description An agent responsible for navigation-related tasks.
 * This agent is a placeholder and does not yet have any implemented functionality.
 */
class NavigatorAgent {
  /**
   * @constructor
   * @description Initializes the NavigatorAgent.
   */
  constructor() {
    this.name = 'Navigator Agent';
    this.description = 'Handles navigation-related tasks.';
  }

  /**
   * Executes a navigation task.
   * @param {object} task - The task to be executed.
   * @returns {Promise<object>} The result of the task.
   * @throws {Error} If the task type is unknown.
   */
  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: ${task.type}`);
    throw new Error(`Unknown task type for Navigator Agent: ${task.type}`);
  }
}

module.exports = NavigatorAgent;
