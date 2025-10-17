/**
 * Gemini CLI Integration Service
 * Provides interface to Gemini 2.5 Pro via CLI and SDK
 */

const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../utils/logger');

class GeminiCLI {
  constructor() {
    // Initialize SDK for advanced features
    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.1, // Low temperature for consistent extraction
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        }
      });
      logger.info('Gemini SDK initialized');
    } else {
      logger.warn('GEMINI_API_KEY not found, CLI-only mode');
    }
  }

  /**
   * Extract structured data from text using CLI
   * @param {string} text - Input text to analyze
   * @param {string} prompt - Extraction instructions
   * @returns {Promise<Object>} Parsed JSON response
   */
  static async extractCLI(text, prompt) {
    try {
      // Escape text for shell
      const escapedText = text.replace(/"/g, '\\"').replace(/\n/g, ' ');
      const escapedPrompt = prompt.replace(/"/g, '\\"');

      const command = `echo "${escapedText}" | gemini --format json "${escapedPrompt}"`;
      
      logger.debug('Executing Gemini CLI command', { 
        textLength: text.length,
        promptLength: prompt.length 
      });

      const result = execSync(command, { 
        encoding: 'utf-8',
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024 // 1MB buffer
      });

      // Parse JSON response
      const parsed = JSON.parse(result.trim());
      
      logger.info('Gemini CLI extraction successful', {
        outputSize: result.length
      });

      return parsed;

    } catch (error) {
      logger.error('Gemini CLI extraction failed', {
        error: error.message,
        stderr: error.stderr?.toString()
      });

      // Fallback to SDK if CLI fails
      if (this.model) {
        logger.info('Falling back to Gemini SDK');
        return await this.extractSDK(text, prompt);
      }

      throw new Error(`Gemini CLI failed: ${error.message}`);
    }
  }

  /**
   * Extract structured data using SDK
   * @param {string} text - Input text to analyze
   * @param {string} prompt - Extraction instructions
   * @returns {Promise<Object>} Parsed JSON response
   */
  async extractSDK(text, prompt) {
    try {
      const fullPrompt = `${prompt}

Input text:
${text}

CRITICAL: Output MUST be valid JSON only. No markdown, no explanations, no additional text.`;

      logger.debug('Executing Gemini SDK request', {
        textLength: text.length,
        promptLength: fullPrompt.length
      });

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      let jsonText = response.text().trim();

      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Parse JSON
      const parsed = JSON.parse(jsonText);

      logger.info('Gemini SDK extraction successful');

      return parsed;

    } catch (error) {
      logger.error('Gemini SDK extraction failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Analyze data with Gemini
   * @param {Object} data - Data to analyze
   * @param {string} prompt - Analysis instructions
   * @returns {Promise<Object>} Analysis result
   */
  async analyze(data, prompt) {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      
      const fullPrompt = `${prompt}

Data to analyze:
${jsonData}

Output ONLY valid JSON.`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      let jsonText = response.text().trim();

      // Clean up response
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      return JSON.parse(jsonText);

    } catch (error) {
      logger.error('Gemini analysis failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Analyze image with Gemini
   * @param {Buffer} imageBuffer - Image data
   * @param {string} prompt - Analysis instructions
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeImage(imageBuffer, prompt) {
    try {
      if (!this.model) {
        throw new Error('Gemini SDK not initialized');
      }

      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: 'image/jpeg'
        }
      };

      const fullPrompt = `${prompt}

Output ONLY valid JSON.`;

      const result = await this.model.generateContent([fullPrompt, imagePart]);
      const response = await result.response;
      let jsonText = response.text().trim();

      // Clean up response
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      return JSON.parse(jsonText);

    } catch (error) {
      logger.error('Gemini image analysis failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate content with Gemini
   * @param {string} prompt - Generation instructions
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated content
   */
  async generate(prompt, options = {}) {
    try {
      if (!this.model) {
        throw new Error('Gemini SDK not initialized');
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      logger.info('Gemini content generation successful', {
        outputLength: text.length
      });

      return text;

    } catch (error) {
      logger.error('Gemini content generation failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Health check for Gemini service
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const testPrompt = 'Respond with JSON: {"status": "healthy", "timestamp": "' + new Date().toISOString() + '"}';
      
      const result = await this.model.generateContent(testPrompt);
      const response = await result.response;
      const text = response.text().trim();
      
      const parsed = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

      return {
        healthy: true,
        sdk: true,
        response: parsed
      };

    } catch (error) {
      logger.error('Gemini health check failed', {
        error: error.message
      });

      return {
        healthy: false,
        sdk: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
module.exports = new GeminiCLI();
