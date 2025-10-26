// backend/src/services/TranslateService.js
const { Translate } = require('@google-cloud/translate').v2;
const logger = require('../utils/logger');

/**
 * @class TranslateService
 * @description A service class for interacting with the Google Cloud Translate API.
 * This class provides methods for translating text between languages and detecting the language of a given text.
 * It handles the initialization of the Google Translate client and requires the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to be set.
 */
class TranslateService {
  /**
   * @constructor
   * @description Initializes the TranslateService.
   * It sets up the Google Translate client. If the initialization fails (e.g., due to missing credentials),
   * it logs a warning and disables the client to prevent runtime errors.
   */
  constructor() {
    try {
      // GOOGLE_APPLICATION_CREDENTIALS environment variable must be set
      this.translateClient = new Translate();
      logger.info('[TranslateService] Initialized successfully.');
    } catch (error) {
      logger.warn('[TranslateService] Failed to initialize. GOOGLE_APPLICATION_CREDENTIALS might be missing or invalid.', error.message);
      this.translateClient = null;
    }
  }

  /**
   * @private
   * @method _checkClient
   * @description Checks if the Google Translate client is initialized.
   * Throws an error if the client is not available, preventing API calls from being made without a valid configuration.
   * @throws {Error} If the Google Translate client is not configured.
   */
  _checkClient() {
    if (!this.translateClient) {
      throw new Error('Google Translate Service is not configured. Check application credentials.');
    }
  }

  /**
   * @method translateText
   * @description Translates a string of text from a source language to a target language.
   * @param {string} text - The text to be translated.
   * @param {string} target - The ISO 639-1 code of the target language (e.g., 'es' for Spanish).
   * @param {string|null} [source=null] - The ISO 639-1 code of the source language (e.g., 'en' for English). If null, the API will auto-detect the language.
   * @returns {Promise<object>} An object containing the original and translated text.
   * @throws {Error} If the API call fails.
   */
  async translateText(text, target, source = null) {
    this._checkClient();
    try {
      const options = { to: target };
      if (source) {
        options.from = source;
      }
      const [translation] = await this.translateClient.translate(text, options);
      return {
        originalText: text,
        translatedText: translation,
      };
    } catch (error) {
      logger.error('[TranslateService] Error translating text:', error.message);
      throw new Error('Failed to translate text with Google Translate API.');
    }
  }

  /**
   * @method detectLanguage
   * @description Detects the language of a given string of text.
   * @param {string} text - The text for which to detect the language.
   * @returns {Promise<object>} An object containing the detected language code and the confidence level.
   * @throws {Error} If the API call fails.
   */
  async detectLanguage(text) {
    this._checkClient();
    try {
      const [detection] = await this.translateClient.detect(text);
      return {
        language: detection.language,
        confidence: detection.confidence,
      };
    } catch (error) {
      logger.error('[TranslateService] Error detecting language:', error.message);
      throw new Error('Failed to detect language with Google Translate API.');
    }
  }
}

module.exports = TranslateService;
