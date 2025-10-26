// backend/agents/GuardianAgent.js
const { getAi } = require('../services/geminiService');
const { Type } = require('@google/genai');
const logger = require('../utils/logger');

/**
 * @const {object} DEBUG_SCHEMA
 * @description The JSON schema for the debug analysis provided by the Guardian Agent.
 * @private
 */
const DEBUG_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    diagnosis: {
      type: Type.STRING,
      description: 'A concise, technical explanation of the root cause of the error. Analyze the task, input, and error message.'
    },
    suggestion: {
      type: Type.STRING,
      description: 'A clear, user-friendly suggestion on how to fix the issue or modify the input for a successful outcome.'
    },
    retryInput: {
      type: Type.OBJECT,
      description: 'An optional, corrected version of the original taskInput object that is likely to succeed if the task is retried. Only provide this if a clear, automated fix is possible.'
    }
  },
  required: ['diagnosis', 'suggestion']
};

/**
 * @class GuardianAgent
 * @description An agent that analyzes and debugs failed agent tasks to provide self-healing capabilities.
 * This agent takes a failed task as input, analyzes the error, and provides a diagnosis, a suggestion for a fix,
 * and an optional corrected input for retrying the task.
 */
class GuardianAgent {
  /**
   * @constructor
   * @description Initializes the GuardianAgent.
   */
  constructor() {
    this.name = 'Guardian Agent';
    this.description = 'Analyzes and debugs failed agent tasks to provide self-healing capabilities.';
    this.model = 'gemini-2.5-pro';
  }

  /**
   * Executes a debugging task for a failed agent task.
   * @param {object} task - The task to be executed.
   * @param {object} task.failedTask - The failed task object to be debugged.
   * @param {string} task.failedTask.agentName - The name of the agent that failed.
   * @param {string} task.failedTask.taskType - The type of the failed task.
   * @param {object} task.failedTask.taskInput - The input that caused the task to fail.
   * @param {string} task.failedTask.errorMessage - The error message from the failed task.
   * @returns {Promise<object>} A JSON object containing the debug analysis.
   * @throws {Error} If the failedTask object is missing.
   */
  async executeTask(task) {
    logger.info(`[${this.name}] Received task for debugging.`);

    if (!task.failedTask) {
      throw new Error('A failedTask object is required for debugging.');
    }

    const { failedTask } = task;

    const systemInstruction = `You are the Guardian Agent, an expert AI debugger for a multi-agent OS.
Your role is to analyze a failed task record and provide a clear diagnosis, a helpful suggestion, and, if possible, a corrected input to retry the task.
Your output must be a single JSON object conforming to the provided schema. Do not add any extra commentary.`;

    const userPrompt = `Analyze the following failed task and provide a diagnosis and suggestion.

- **Agent Name**: ${failedTask.agentName}
- **Task Type**: ${failedTask.taskType}
- **Original Input**: ${JSON.stringify(failedTask.taskInput, null, 2)}
- **Error Message**: ${failedTask.errorMessage}`;

    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: DEBUG_SCHEMA,
            thinkingConfig: { thinkingBudget: 32768 },
        }
      });
      
      const analysisJson = response.text.trim();
      const analysis = JSON.parse(analysisJson);

      logger.info(`[${this.name}] Generated debug analysis:`, JSON.stringify(analysis, null, 2));
      return analysis;

    } catch (error) {
      logger.error(`[${this.name}] Error during debugging analysis:`, error);
      throw new Error('Guardian Agent failed to analyze the error.');
    }
  }
}

module.exports = GuardianAgent;
