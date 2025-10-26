// backend/agents/VoiceControlAgent.js
const { getAi } = require('../services/geminiService');
const { Type } = require('@google/genai');
const logger = require('../utils/logger');

/**
 * @const {object} openAppFunctionDeclaration
 * @description The function declaration for the 'openApp' tool, used by the Gemini API.
 * @private
 */
const openAppFunctionDeclaration = {
    name: 'openApp',
    parameters: { type: Type.OBJECT, description: 'Opens a specified application.', properties: { appName: { type: Type.STRING, description: 'The name of the app to open, e.g., "Terminal" or "Coding Agent".' } }, required: ['appName'] }
};

/**
 * @const {object} executeWorkflowFunctionDeclaration
 * @description The function declaration for the 'executeWorkflow' tool, used by the Gemini API.
 * @private
 */
const executeWorkflowFunctionDeclaration = {
    name: 'executeWorkflow',
    parameters: { type: Type.OBJECT, description: 'Executes a complex multi-step workflow for searches, planning, or multi-agent tasks.', properties: { prompt: { type: Type.STRING, description: 'The complex user request, e.g., "Plan a 3-day trip to Paris" or "search for the weather".' } }, required: ['prompt'] }
};

/**
 * @class VoiceControlAgent
 * @description An agent that parses voice commands and determines the appropriate action to take.
 * This agent uses the Gemini API with function calling to understand user commands and
 * translate them into structured actions, such as opening an application or executing a workflow.
 */
class VoiceControlAgent {
    /**
     * @constructor
     * @description Initializes the VoiceControlAgent.
     */
    constructor() {
        this.name = 'Voice Control Agent';
        this.model = 'gemini-2.5-pro';
    }

    /**
     * Parses a voice command and returns a structured action.
     * @param {string} command - The voice command from the user.
     * @returns {Promise<object>} An object representing the parsed action (e.g., opening an app, executing a workflow, or speaking a text response).
     * @throws {Error} If the Gemini API is not configured or fails to parse the command.
     */
    async parseCommand(command) {
        logger.info(`[${this.name}] Parsing command: "${command}"`);
        if (!process.env.API_KEY) throw new Error('Gemini API is not configured.');

        try {
            const ai = getAi();
            const response = await ai.models.generateContent({
                model: this.model,
                contents: [{ role: 'user', parts: [{ text: `Command: "${command}"` }] }],
                config: { tools: [{ functionDeclarations: [openAppFunctionDeclaration, executeWorkflowFunctionDeclaration] }] }
            });

            const call = response.functionCalls?.[0];
            if (call) {
                if (call.name === 'openApp') {
                    return { action: 'openApp', appName: call.args.appName };
                } else if (call.name === 'executeWorkflow') {
                    return { action: 'executeWorkflow', prompt: call.args.prompt };
                }
            }

            // If no function call, return a text response
            return { action: 'speak', text: response.text || "Sorry, I couldn't understand that command." };

        } catch (error) {
            logger.error(`[${this.name}] Error parsing command:`, error);
            throw new Error('Failed to parse voice command with Gemini.');
        }
    }
}

module.exports = VoiceControlAgent;
