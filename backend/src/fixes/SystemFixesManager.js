/**
 * System Fixes Manager
 * Comprehensive fix manager for Maya Travel Agent issues
 * Addresses all critical issues identified in the test report
 */

const ExpressResponseHandlerFix = require('./ExpressResponseHandlerFix');
const PrometheusMetricsFix = require('./PrometheusMetricsFix');
const TestDataGenerator = require('./TestDataGenerator');
const winston = require('winston');

class SystemFixesManager {
  constructor(config = {}) {
    this.config = {
      enableExpressFixes: config.enableExpressFixes !== false,
      enablePrometheusFixes: config.enablePrometheusFixes !== false,
      enableTestDataGeneration: config.enableTestDataGeneration !== false,
      prometheusPort: config.prometheusPort || 9091,
      ...config
    };

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'backend/logs/system-fixes.log' }),
        new winston.transports.Console()
      ]
    });

    this.fixes = {};
    this.isInitialized = false;
  }

  /**
   * Initialize all fixes
   */
  async initialize() {
    try {
      this.logger.info('🔧 Initializing System Fixes Manager...');

      // Initialize Express Response Handler Fix
      if (this.config.enableExpressFixes) {
        this.fixes.express = new ExpressResponseHandlerFix();
        this.logger.info('✅ Express Response Handler Fix initialized');
      }

      // Initialize Prometheus Metrics Fix
      if (this.config.enablePrometheusFixes) {
        this.fixes.prometheus = new PrometheusMetricsFix({
          port: this.config.prometheusPort
        });
        this.fixes.prometheus.createCustomMetrics();
        this.fixes.prometheus.startPeriodicUpdates();
        this.logger.info('✅ Prometheus Metrics Fix initialized');
      }

      // Initialize Test Data Generator
      if (this.config.enableTestDataGeneration) {
        this.fixes.testData = new TestDataGenerator();
        this.logger.info('✅ Test Data Generator initialized');
      }

      this.isInitialized = true;
      this.logger.info('🎉 All system fixes initialized successfully');

      return true;

    } catch (error) {
      this.logger.error('❌ Failed to initialize system fixes', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Apply Express.js middleware fixes
   */
  applyExpressMiddleware(app) {
    if (!this.fixes.express) {
      this.logger.warn('Express fixes not initialized');
      return;
    }

    try {
      // Apply request validation middleware
      app.use(this.fixes.express.requestValidator());

      // Apply safe response handler middleware
      app.use(this.fixes.express.safeResponseHandler());

      // Apply error handler middleware
      app.use(this.fixes.express.errorHandler());

      // Add health check endpoint
      app.get('/api/health/fixes', this.fixes.express.healthCheck());

      this.logger.info('✅ Express middleware fixes applied');

    } catch (error) {
      this.logger.error('❌ Failed to apply Express middleware fixes', {
        error: error.message
      });
    }
  }

  /**
   * Get Prometheus metrics handler
   */
  getPrometheusMetricsHandler() {
    if (!this.fixes.prometheus) {
      this.logger.warn('Prometheus fixes not initialized');
      return null;
    }

    return this.fixes.prometheus.getMetricsHandler();
  }

  /**
   * Record metrics
   */
  recordMetrics(type, data) {
    if (!this.fixes.prometheus) {
      return;
    }

    try {
      switch (type) {
        case 'agent_execution':
          this.fixes.prometheus.recordAgentExecution(
            data.agentName,
            data.taskType,
            data.status,
            data.duration
          );
          break;

        case 'api_request':
          this.fixes.prometheus.recordApiRequest(
            data.method,
            data.endpoint,
            data.statusCode,
            data.duration
          );
          break;

        case 'tool_usage':
          this.fixes.prometheus.recordToolUsage(
            data.toolName,
            data.status
          );
          break;

        default:
          this.logger.warn('Unknown metrics type', { type });
      }

    } catch (error) {
      this.logger.error('Failed to record metrics', {
        error: error.message,
        type,
        data
      });
    }
  }

  /**
   * Get test data
   */
  getTestData(type = 'all') {
    if (!this.fixes.testData) {
      this.logger.warn('Test data generator not initialized');
      return null;
    }

    try {
      if (type === 'all') {
        return this.fixes.testData.getAllTestData();
      }

      switch (type) {
        case 'flights':
          return this.fixes.testData.generateFlightTestData();
        case 'hotels':
          return this.fixes.testData.generateHotelTestData();
        case 'currency':
          return this.fixes.testData.generateCurrencyTestData();
        case 'destinations':
          return this.fixes.testData.generateDestinationTestData();
        case 'weather':
          return this.fixes.testData.generateWeatherTestData();
        case 'webSearch':
          return this.fixes.testData.generateWebSearchTestData();
        case 'telegram':
          return this.fixes.testData.generateTelegramTestData();
        case 'dates':
          return this.fixes.testData.generateValidDates();
        default:
          return this.fixes.testData.getAllTestData();
      }

    } catch (error) {
      this.logger.error('Failed to get test data', {
        error: error.message,
        type
      });
      return null;
    }
  }

  /**
   * Validate test data
   */
  validateTestData(data, type) {
    if (!this.fixes.testData) {
      return { valid: false, error: 'Test data generator not initialized' };
    }

    return this.fixes.testData.validateTestData(data, type);
  }

  /**
   * Fix bot intent analysis
   */
  fixBotIntentAnalysis(analyzeIntentFunction) {
    if (!analyzeIntentFunction) {
      this.logger.error('No analyzeIntent function provided');
      return null;
    }

    return async (message, context = {}) => {
      try {
        // Add timeout protection
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Intent analysis timeout')), 10000);
        });

        const result = await Promise.race([
          analyzeIntentFunction(message, context),
          timeoutPromise
        ]);

        // Ensure result is not undefined
        if (!result) {
          return {
            intent: 'unknown',
            confidence: 0,
            entities: [],
            fallback: true
          };
        }

        // Validate result structure
        if (!result.intent) {
          result.intent = 'unknown';
        }

        if (typeof result.confidence !== 'number') {
          result.confidence = 0.5;
        }

        if (!Array.isArray(result.entities)) {
          result.entities = [];
        }

        return result;

      } catch (error) {
        this.logger.error('Intent analysis failed', {
          error: error.message,
          message: message.substring(0, 100)
        });

        return {
          intent: 'unknown',
          confidence: 0,
          entities: [],
          fallback: true,
          error: error.message
        };
      }
    };
  }

  /**
   * Fix rate limiting for development
   */
  createDevelopmentRateLimiter() {
    const rateLimit = require('express-rate-limit');

    return rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 1000, // High limit for development
      message: {
        error: 'Too many requests',
        retryAfter: '1 minute'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting in development
        return process.env.NODE_ENV === 'development';
      }
    });
  }

  /**
   * Fix Jupyter integration with connection pooling
   */
  createJupyterConnectionPool(config = {}) {
    const poolConfig = {
      min: config.min || 1,
      max: config.max || 5,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 10000,
      ...config
    };

    const connections = new Map();
    let connectionId = 0;

    return {
      async getConnection() {
        // Find available connection
        for (const [id, conn] of connections) {
          if (conn.available && !conn.busy) {
            conn.busy = true;
            conn.lastUsed = Date.now();
            return { id, connection: conn };
          }
        }

        // Create new connection if under limit
        if (connections.size < poolConfig.max) {
          const id = ++connectionId;
          const connection = {
            id,
            available: true,
            busy: true,
            created: Date.now(),
            lastUsed: Date.now()
          };

          connections.set(id, connection);
          return { id, connection };
        }

        // Wait for available connection
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            for (const [id, conn] of connections) {
              if (conn.available && !conn.busy) {
                conn.busy = true;
                conn.lastUsed = Date.now();
                clearInterval(checkInterval);
                resolve({ id, connection: conn });
                return;
              }
            }
          }, 100);

          // Timeout after 30 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve({ id: null, connection: null });
          }, 30000);
        });
      },

      releaseConnection(id) {
        const connection = connections.get(id);
        if (connection) {
          connection.busy = false;
          connection.lastUsed = Date.now();
        }
      },

      cleanup() {
        const now = Date.now();
        for (const [id, conn] of connections) {
          if (now - conn.lastUsed > poolConfig.idleTimeoutMillis) {
            connections.delete(id);
          }
        }
      }
    };
  }

  /**
   * Create mock services for testing
   */
  createMockServices() {
    return {
      telegram: {
        sendMessage: async (chatId, message) => {
          this.logger.info('Mock Telegram message sent', { chatId, message });
          return { success: true, messageId: Date.now() };
        }
      },

      weather: {
        getForecast: async (location) => {
          this.logger.info('Mock weather forecast requested', { location });
          return {
            location,
            temperature: 25,
            condition: 'Sunny',
            humidity: 60,
            timestamp: new Date().toISOString()
          };
        }
      },

      currency: {
        convert: async (from, to, amount) => {
          this.logger.info('Mock currency conversion', { from, to, amount });
          const rates = {
            'USD-EUR': 0.85,
            'EUR-USD': 1.18,
            'USD-GBP': 0.73,
            'GBP-USD': 1.37
          };
          
          const rate = rates[`${from}-${to}`] || 1;
          return {
            from,
            to,
            amount,
            convertedAmount: amount * rate,
            rate,
            timestamp: new Date().toISOString()
          };
        }
      }
    };
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      fixes: {
        express: !!this.fixes.express,
        prometheus: !!this.fixes.prometheus,
        testData: !!this.fixes.testData
      },
      config: this.config,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Cleanup all fixes
   */
  async cleanup() {
    try {
      this.logger.info('🧹 Cleaning up system fixes...');

      if (this.fixes.prometheus) {
        this.fixes.prometheus.cleanup();
      }

      this.isInitialized = false;
      this.logger.info('✅ System fixes cleaned up');

    } catch (error) {
      this.logger.error('❌ Failed to cleanup system fixes', {
        error: error.message
      });
    }
  }
}

module.exports = SystemFixesManager;
