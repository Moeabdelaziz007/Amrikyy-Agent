// backend/services/VeoService.js
const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');

/**
 * @class VeoService
 * @description A service class for interacting with the Google Veo API for video generation.
 * This class provides methods to start the video generation process and check the status of an ongoing operation.
 * It requires the `API_KEY` environment variable to be set for making API calls.
 */
class VeoService {
    /**
     * @constructor
     * @description Initializes the VeoService.
     * Sets the model name for the Veo API.
     */
    constructor() {
        this.modelName = 'veo-3.1-fast-generate-preview';
        logger.info('[VeoService] Initialized.');
    }

    /**
     * @method startVideoGeneration
     * @description Initiates a video generation task with the Veo API.
     * @param {object} params - The parameters for video generation.
     * @param {string} params.prompt - The text prompt describing the video to be generated.
     * @param {object} [params.image] - An optional image to influence the video generation.
     * @param {string} [params.image.imageBytes] - Base64 encoded image bytes.
     * @param {string} [params.image.mimeType] - The MIME type of the image (e.g., 'image/png').
     * @param {string} [params.aspectRatio='16:9'] - The desired aspect ratio of the video.
     * @returns {Promise<object>} The operation object from the Veo API, which can be used to track the generation status.
     * @throws {Error} If the API key is not configured or the API call fails.
     */
    async startVideoGeneration({ prompt, image, aspectRatio }) {
        if (!process.env.API_KEY) {
            throw new Error('API_KEY is not configured. Cannot make real Veo API calls.');
        }

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            logger.info(`[VeoService] Starting video generation with prompt: "${prompt}"`);

            const request = {
                model: this.modelName,
                prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio || '16:9',
                }
            };
            
            if (image && image.imageBytes && image.mimeType) {
                request.image = {
                    imageBytes: image.imageBytes,
                    mimeType: image.mimeType,
                };
            }

            const operation = await ai.models.generateVideos(request);
            logger.info(`[VeoService] Video generation started. Operation name: ${operation.name}`);
            return operation;

        } catch (error) {
            logger.error('[VeoService] Error starting video generation:', error);
            throw new Error(`Failed to start video generation: ${error.message}`);
        }
    }

    /**
     * @method checkStatus
     * @description Checks the status of an ongoing video generation operation.
     * @param {object} params - The parameters for checking the status.
     * @param {object} params.operation - The operation object returned from `startVideoGeneration`.
     * @returns {Promise<object>} The updated operation object with the latest status.
     * @throws {Error} If the API key is not configured, the operation object is missing, or the API call fails.
     */
    async checkStatus({ operation }) {
        if (!process.env.API_KEY) {
            throw new Error('API_KEY is not configured. Cannot make real Veo API calls.');
        }
        if (!operation) {
            throw new Error('Operation object is required to check status.');
        }

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            logger.debug(`[VeoService] Checking status for operation: ${operation.name}`);
            const updatedOperation = await ai.operations.getVideosOperation({ operation });
            logger.debug(`[VeoService] Status check complete. Done: ${updatedOperation.done}`);
            return updatedOperation;

        } catch (error) {
            logger.error('[VeoService] Error checking video generation status:', error);
            // Handle specific error for not found, which can happen if key changes
            if (error.message.includes('Requested entity was not found')) {
                throw new Error('API Key mismatch or operation not found. Please re-select your API key and try again.');
            }
            throw new Error(`Failed to check video generation status: ${error.message}`);
        }
    }
}

module.exports = VeoService;
