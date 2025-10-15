#!/usr/bin/env node

/**
 * Maya Voice-First Multi-Agent System - Main Entry Point
 * Starts the complete voice-enabled travel assistant system
 */

const winston = require('winston');
const VoiceTelegramBot = require('./VoiceTelegramBot');
const VoiceProcessor = require('./VoiceProcessor');
const MasterOrchestrator = require('../orchestrator/MasterOrchestrator');

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/maya-voice-system.log' })
  ]
});

class MayaVoiceSystem {
  constructor() {
    this.logger = logger;
    this.components = {
      voiceProcessor: null,
      orchestrator: null,
      telegramBot: null
    };
    this.isRunning = false;
  }

  async initialize() {
    try {
      this.logger.info('🚀 Starting Maya Voice-First Multi-Agent System...');
      
      // Check environment variables
      this.checkEnvironmentVariables();
      
      // Initialize components
      await this.initializeComponents();
      
      // Set up graceful shutdown
      this.setupGracefulShutdown();
      
      this.logger.info('✅ Maya Voice System initialized successfully');
      this.isRunning = true;
      
      // Display system status
      this.displaySystemStatus();
      
    } catch (error) {
      this.logger.error('❌ Failed to initialize Maya Voice System', { error: error.message });
      process.exit(1);
    }
  }

  checkEnvironmentVariables() {
    const required = [
      'TELEGRAM_BOT_TOKEN',
      'CARTESIA_API_KEY'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      this.logger.error('❌ Missing required environment variables:', missing);
      process.exit(1);
    }
    
    this.logger.info('✅ Environment variables validated');
  }

  async initializeComponents() {
    this.logger.info('🔧 Initializing system components...');
    
    // Initialize Voice Processor
    this.logger.info('🎙️ Initializing Voice Processor...');
    this.components.voiceProcessor = new VoiceProcessor();
    await this.components.voiceProcessor.initializeSystem();
    
    // Initialize Master Orchestrator
    this.logger.info('🧠 Initializing Master Orchestrator...');
    this.components.orchestrator = new MasterOrchestrator();
    await this.components.orchestrator.initializeSystem();
    
    // Initialize Telegram Bot
    this.logger.info('📱 Initializing Voice Telegram Bot...');
    this.components.telegramBot = new VoiceTelegramBot();
    await this.components.telegramBot.start();
    
    this.logger.info('✅ All components initialized');
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      this.logger.info(`🛑 Received ${signal}, shutting down gracefully...`);
      this.isRunning = false;
      
      try {
        if (this.components.telegramBot) {
          await this.components.telegramBot.stop();
        }
        
        this.logger.info('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        this.logger.error('❌ Error during shutdown', { error: error.message });
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }

  displaySystemStatus() {
    const status = `
🎙️ MAYA VOICE-FIRST MULTI-AGENT SYSTEM 🎙️
=============================================

🤖 Specialized Agents:
   🎫 Luna - Trip Architect & Itinerary Designer
   💰 Karim - Financial Strategist & Budget Optimizer
   🗺️ Layla - Cultural Expert & Destination Specialist
   📞 Amira - Customer Care & Crisis Manager
   💳 Tariq - Transaction Security Expert
   🔍 Zara - Information Intelligence Expert
   📊 Insights - Performance Analytics Specialist
   🔄 Evolve - Continuous Improvement Specialist
   🐛 Fix - System Health & Error Resolution Specialist

🎙️ Voice Capabilities:
   ✅ Speech-to-Text: Whisper Large v3 with fallback engines
   ✅ Text-to-Speech: Cartesia with emotion modulation
   ✅ Voice Cloning: Personalized voices for each agent
   ✅ Multilingual: Arabic, English, French, Spanish, German, Italian
   ✅ Real-time Processing: WebSocket streaming support

🔧 System Components:
   ✅ Voice Processing Engine
   ✅ Multi-Agent Orchestrator
   ✅ Telegram Bot Integration
   ✅ WebSocket Communication
   ✅ MCP Tools Integration

📱 Active Services:
   ✅ Telegram Bot (@your_bot_username)
   🔄 WhatsApp Bot (coming soon)
   🔄 Web Voice Interface (coming soon)

🌍 Supported Languages:
   🇸🇦 Arabic (العربية) - Primary
   🇺🇸 English
   🇫🇷 French (Français)
   🇪🇸 Spanish (Español)
   🇩🇪 German (Deutsch)
   🇮🇹 Italian (Italiano)

🎯 Ready to help with:
   • Voice-first travel planning
   • Multi-agent collaboration
   • Cultural insights and recommendations
   • Budget optimization
   • Real-time assistance
   • Multilingual conversations

System is now running and ready to assist! 🚀
=============================================`;

    console.log(status);
    this.logger.info('Maya Voice System is now running and ready to assist users');
  }

  async getSystemHealth() {
    try {
      const health = {
        system: 'healthy',
        components: {},
        timestamp: new Date().toISOString()
      };

      if (this.components.voiceProcessor) {
        health.components.voiceProcessor = await this.components.voiceProcessor.healthCheck();
      }

      if (this.components.orchestrator) {
        health.components.orchestrator = this.components.orchestrator.getSystemHealth();
      }

      if (this.components.telegramBot) {
        health.components.telegramBot = this.components.telegramBot.getStats();
      }

      return health;
    } catch (error) {
      this.logger.error('Error getting system health', { error: error.message });
      return {
        system: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Start the system if this file is run directly
if (require.main === module) {
  const system = new MayaVoiceSystem();
  
  system.initialize().catch((error) => {
    console.error('❌ Failed to start Maya Voice System:', error);
    process.exit(1);
  });
}

module.exports = MayaVoiceSystem;

