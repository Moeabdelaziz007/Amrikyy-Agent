// backend/services/geminiService.js
const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');

/**
 * @type {GoogleGenAI | undefined}
 * @description The singleton instance of the GoogleGenAI client.
 * It is initialized when the module is first loaded.
 * @private
 */
let ai;

try {
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    logger.info('[geminiService] GoogleGenAI client initialized successfully.');
  } else {
    logger.warn('[geminiService] API_KEY is not set. Gemini functions will be disabled.');
  }
} catch (error) {
  logger.error('[geminiService] Failed to initialize GoogleGenAI client:', error);
}

/**
 * Returns the initialized GoogleGenAI client instance.
 * This function provides a way to access the singleton `ai` instance from other parts of the application.
 * It ensures that the client is initialized before it is used.
 *
 * @returns {GoogleGenAI} The initialized GoogleGenAI client instance.
 * @throws {Error} If the client is not initialized (e.g., if the API_KEY is missing).
 */
function getAi() {
  if (!ai) {
    throw new Error('GoogleGenAI client is not initialized. Please set the API_KEY environment variable.');
  }
  return ai;
}

module.exports = { getAi };
