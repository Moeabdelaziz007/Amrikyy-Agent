/**
 * AI Operating System - Core Module
 * Powered by Google Gemini Pro
 * Manages desktop environment, windows, and AI interactions
 */

const { EventEmitter } = require('events');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../utils/logger');

class AIOperatingSystem extends EventEmitter {
  constructor() {
    super();
    this.genAI = null;
    this.model = null;
    this.state = {
      windows: new Map(),
      apps: new Map(),
      desktop: {
        wallpaper: 'default',
        icons: []
      },
      system: {
        uptime: 0,
        activeWindow: null
      }
    };
    
    this.initializeGemini();
    logger.info('🖥️ AI Operating System initialized');
  }

  async initializeGemini() {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not found');
      }

      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp'
      });

      logger.info('🤖 Gemini Pro integrated with AI OS');
      this.emit('gemini-ready');
    } catch (error) {
      logger.error('Failed to initialize Gemini:', error);
    }
  }

  // Get OS status
  getStatus() {
    return {
      windows: this.state.windows.size,
      apps: this.state.apps.size,
      uptime: this.state.system.uptime,
      activeWindow: this.state.system.activeWindow,
      geminiReady: this.model !== null
    };
  }

  // Test AI interaction
  async testAI(prompt) {
    try {
      if (!this.model) {
        return { error: 'Gemini not initialized' };
      }

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      return {
        success: true,
        response: response
      };
    } catch (error) {
      logger.error('AI test failed:', error);
      return { error: error.message };
    }
  }
}

module.exports = AIOperatingSystem;
