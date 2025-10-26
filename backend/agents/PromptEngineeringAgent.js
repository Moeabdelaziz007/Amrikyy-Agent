// backend/agents/PromptEngineeringAgent.js
const { getAi } = require('../services/geminiService');
const logger = require('../utils/logger');

/**
 * @class PromptEngineeringAgent
 * @description An agent that refines user prompts to improve the quality of AI-generated content.
 * This agent takes a user's prompt and a context, and rewrites the prompt to be more detailed,
 * descriptive, and structured, maximizing the quality of the output from a generative AI model.
 */
class PromptEngineeringAgent {
  /**
   * @constructor
   * @description Initializes the PromptEngineeringAgent.
   */
  constructor() {
    this.name = 'Prompt Engineering Agent';
    this.description = 'Refines user prompts to improve the quality of AI-generated content.';
    this.modelName = 'gemini-2.5-pro'; // Use a powerful model for this task
  }

  /**
   * Executes a prompt refinement task.
   * @param {object} task - The task to be executed.
   * @param {string} task.type - The type of task, must be 'refinePrompt'.
   * @param {string} task.prompt - The user's prompt to be refined.
   * @param {string} [task.context] - The context for the prompt refinement.
   * @returns {Promise<object>} An object containing the refined prompt.
   * @throws {Error} If the task type is unknown or the prompt is missing.
   */
  async executeTask(task) {
    logger.info(`[${this.name}] Executing task: refinePrompt`);

    if (task.type !== 'refinePrompt') {
      throw new Error(`Unknown task type for Prompt Engineering Agent: ${task.type}`);
    }
    if (!task.prompt) {
      throw new Error('A prompt to refine is required.');
    }

    const { prompt, context } = task;

    const systemInstruction = `You are an expert Prompt Engineer. Your task is to rewrite a user's prompt to be more detailed, descriptive, and structured, maximizing the quality of the output from a generative AI model.
    - Analyze the user's original prompt and the provided context.
    - Add specific details, sensory language, and clear instructions.
    - For image prompts, describe composition, lighting, style, and mood.
    - For code prompts, specify requirements, edge cases, and desired structure.
    - Your output MUST be ONLY the rewritten prompt, with no extra explanation or conversational text.`;

    const userPrompt = `Context: ${context || 'General'}\n\nOriginal Prompt: "${prompt}"\n\nRewrite this prompt to be significantly more detailed and effective:`;

    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: userPrompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingBudget: 32768 },
        },
      });
      
      const refinedPrompt = response.text.trim();
      return { refinedPrompt };

    } catch (error) {
      logger.error(`[${this.name}] Error refining prompt:`, error.message);
      throw new Error('Failed to get a response from the Gemini API for prompt refinement.');
    }
  }
}

module.exports = PromptEngineeringAgent;
