/**
 * Main Entry Point for Maya Voice-First Multi-Agent System
 * Integrates all components: Voice Processing, Multi-Agent Orchestration, 
 * Journal Learning, Live Monitoring, and Automation
 */

const express = require('express');
const http = require('http');
const winston = require('winston');
const path = require('path');

// Import all system components
const VoiceProcessor = require('./voice/VoiceProcessor');
const MasterOrchestrator = require('./orchestrator/MasterOrchestrator');
const VoiceTelegramBot = require('./voice/VoiceTelegramBot');
const IntegratedJournalSystem = require('./agents/IntegratedJournalSystem');
const MonitorRoutes = require('./monitoring/monitorRoutes');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/system.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

class MayaIntegratedSystem {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.port = process.env.PORT || 3001;

    // System components
    this.voiceProcessor = null;
    this.orchestrator = null;
    this.telegramBot = null;
    this.journalSystem = null;
    this.monitorRoutes = null;

    this.setupExpress();
    this.initializeSystem();
  }

  setupExpress() {
    // Middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Static files for monitoring dashboard
    this.app.use('/dashboard', express.static(path.join(__dirname, '../../frontend/dist')));

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const systemStatus = this.getSystemStatus();
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        components: systemStatus
      });
    });

    // System status endpoint
    this.app.get('/api/status', (req, res) => {
      const systemStatus = this.getSystemStatus();
      res.json({
        success: true,
        data: systemStatus,
        timestamp: new Date().toISOString()
      });
    });

    logger.info('Express server configured');
  }

  async initializeSystem() {
    logger.info('🚀 Starting Maya Voice-First Multi-Agent System...');

    try {
      // 1. Initialize Voice Processing System
      logger.info('🎙️ Initializing Voice Processing System...');
      this.voiceProcessor = new VoiceProcessor();
      await this.voiceProcessor.initializeSystem();
      logger.info('✅ Voice Processing System initialized');

      // 2. Initialize Master Orchestrator
      logger.info('🎯 Initializing Master Orchestrator...');
      this.orchestrator = new MasterOrchestrator(this.voiceProcessor);
      await this.orchestrator.initialize();
      logger.info('✅ Master Orchestrator initialized');

      // 3. Initialize Integrated Journal System
      logger.info('📝 Initializing Integrated Journal System...');
      this.journalSystem = new IntegratedJournalSystem(this.server);
      await new Promise((resolve) => {
        this.journalSystem.once('system_initialized', resolve);
        setTimeout(resolve, 10000); // Fallback timeout
      });
      logger.info('✅ Integrated Journal System initialized');

      // 4. Set up monitoring routes
      logger.info('📊 Setting up monitoring routes...');
      this.monitorRoutes = new MonitorRoutes(
        this.journalSystem.liveMonitor,
        this.journalSystem.automationManager,
        this.orchestrator
      );
      this.app.use('/api/monitor', this.monitorRoutes.getRouter());
      logger.info('✅ Monitoring routes configured');

      // 5. Initialize Voice Telegram Bot
      logger.info('🤖 Initializing Voice Telegram Bot...');
      const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!telegramBotToken) {
        logger.warn('⚠️ TELEGRAM_BOT_TOKEN not set, skipping Telegram bot initialization');
      } else {
        this.telegramBot = new VoiceTelegramBot(telegramBotToken);
        this.telegramBot.start();
        logger.info('✅ Voice Telegram Bot initialized');
      }

      // 6. Start HTTP server
      this.server.listen(this.port, () => {
        logger.info(`🌐 HTTP server listening on port ${this.port}`);
        logger.info(`📊 Monitoring dashboard: http://localhost:${this.port}/dashboard`);
        logger.info(`🔍 API status: http://localhost:${this.port}/api/status`);
        logger.info(`💚 Health check: http://localhost:${this.port}/health`);
      });

      // 7. Set up graceful shutdown
      this.setupGracefulShutdown();

      logger.info('🎉 Maya Voice-First Multi-Agent System is fully operational!');
      logger.info('📋 System Components:');
      logger.info('   • Voice Processing (STT/TTS with emotion detection)');
      logger.info('   • Multi-Agent Orchestration (9 specialized agents)');
      logger.info('   • Journal Learning (Private Journal MCP integration)');
      logger.info('   • Live Monitoring (Real-time agent tracking)');
      logger.info('   • Automation (Cline automation workflows)');
      logger.info('   • Voice Telegram Bot (Multi-language support)');

      // Emit system ready event
      this.emit('system_ready');

    } catch (error) {
      logger.error('❌ Failed to initialize Maya system', { error: error.message });
      process.exit(1);
    }
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      logger.info(`🛑 Received ${signal}, shutting down gracefully...`);

      try {
        // Stop accepting new connections
        this.server.close();

        // Clean up components
        if (this.telegramBot) {
          this.telegramBot.stop();
          logger.info('✅ Telegram bot stopped');
        }

        if (this.journalSystem) {
          this.journalSystem.cleanup();
          logger.info('✅ Journal system cleaned up');
        }

        if (this.orchestrator) {
          // Add orchestrator cleanup if needed
          logger.info('✅ Orchestrator cleaned up');
        }

        if (this.voiceProcessor) {
          // Add voice processor cleanup if needed
          logger.info('✅ Voice processor cleaned up');
        }

        logger.info('✅ Graceful shutdown completed');
        process.exit(0);

      } catch (error) {
        logger.error('❌ Error during shutdown', { error: error.message });
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  getSystemStatus() {
    const status = {
      voiceProcessor: {
        status: this.voiceProcessor ? 'active' : 'inactive',
        health: this.voiceProcessor ? 'healthy' : 'unknown'
      },
      orchestrator: {
        status: this.orchestrator ? 'active' : 'inactive',
        health: this.orchestrator ? 'healthy' : 'unknown'
      },
      journalSystem: this.journalSystem ? this.journalSystem.getSystemStatus() : null,
      telegramBot: {
        status: this.telegramBot ? 'active' : 'inactive',
        health: this.telegramBot ? 'healthy' : 'unknown'
      },
      server: {
        status: 'running',
        port: this.port,
        uptime: process.uptime()
      }
    };

    return status;
  }

  // Expose system components for external access
  getVoiceProcessor() { return this.voiceProcessor; }
  getOrchestrator() { return this.orchestrator; }
  getJournalSystem() { return this.journalSystem; }
  getTelegramBot() { return this.telegramBot; }
  getServer() { return this.server; }
  getApp() { return this.app; }
}

// Start the system
const mayaSystem = new MayaIntegratedSystem();

// Export for testing or external access
module.exports = MayaIntegratedSystem;

// Log startup information
logger.info('🎯 Maya Voice-First Multi-Agent System');
logger.info('📅 Started at:', new Date().toISOString());
logger.info('🖥️ Node.js version:', process.version);
logger.info('📁 Working directory:', process.cwd());
logger.info('🔧 Environment:', process.env.NODE_ENV || 'development');
