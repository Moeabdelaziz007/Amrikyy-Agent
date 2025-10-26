// backend/services/aixExecutor.js
const { getAi } = require('./geminiService');
const logger = require('../utils/logger');

/**
 * Executes a parsed AIX task using the Gemini API.
 * This function constructs a detailed prompt from the parsed AIX sections (PROMPT, DATA, RULES)
 * and sends it to the Gemini model for processing. It's designed to handle structured AI tasks
 * by providing the AI with a clear objective, the data to work with, and the constraints to follow.
 *
 * @param {object} parsedAix - The parsed sections of an AIX file.
 * @param {string} parsedAix.PROMPT - The main objective or instruction for the AI.
 * @param {string} parsedAix.DATA - The data or content to be processed by the AI.
 * @param {string} parsedAix.RULES - The constraints, rules, or logic the AI must adhere to.
 * @returns {Promise<{success: boolean, output?: string, error?: string}>} An object containing the result from the Gemini API.
 * If successful, it includes `success: true` and the `output` text.
 * If it fails, it includes `success: false` and an `error` message.
 */
async function executeAixTask(parsedAix) {
  try {
    const ai = getAi();
    const modelName = 'gemini-2.5-pro';

    // Construct a detailed prompt for Gemini, telling it how to use the parsed sections
    const fullPrompt = `
      You are an AI task executor. You have been given a task structured in the AIX format.
      Your goal is to follow the instructions in the PROMPT section, using the provided DATA and adhering to the RULES.

      **PROMPT (Your main objective):**
      ${parsedAix.PROMPT}

      **DATA (The information to process):**
      ${parsedAix.DATA}

      **RULES (Constraints and logic to apply):**
      ${parsedAix.RULES}

      Please provide the final output based on these instructions. Do not add any extra commentary or explanation outside of the requested output format.
    `;

    const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    });
    
    return { success: true, output: response.text };
  } catch (error) {
    logger.error("Error executing AIX task with Gemini:", error);
    return { success: false, error: "Failed to get response from Gemini." };
  }
}

module.exports = { executeAixTask };
