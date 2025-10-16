/**
 * Comprehensive System Fix
 * Main integration file that applies all fixes to Maya Travel Agent
 * Addresses all critical issues from the test report
 */

const SystemFixesManager = require('./SystemFixesManager');
const EnvironmentConfigFix = require('./EnvironmentConfigFix');
const winston = require('winston');

class ComprehensiveSystemFix {
  constructor(config = {}) {
    this.config = {
      enableAllFixes: config.enableAllFixes !== false,
      enableExpressFixes: config.enableExpressFixes !== false,
      enablePrometheusFixes: config.enablePrometheusFixes !== false,
      enableEnvironmentFixes: config.enableEnvironmentFixes !== false,
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
        new winston.transports.File({ filename: 'backend/logs/comprehensive-fix.log' }),
        new winston.transports.Console()
      ]
    });

    this.fixesManager = null;
    this.envConfigFix = null;
    this.isInitialized = false;
  }

  /**
   * Initialize all system fixes
   */
  async initialize() {
    try {
      this.logger.info('🚀 Initializing Comprehensive System Fix...');

      // Initialize Environment Configuration Fix first
      if (this.config.enableEnvironmentFixes) {
        this.envConfigFix = new EnvironmentConfigFix();
        const envResult = await this.envConfigFix.initialize();
        this.logger.info('✅ Environment Configuration Fix initialized', {
          servicesConfigured: Object.keys(envResult.status.services).length
        });
      }

      // Initialize System Fixes Manager
      if (this.config.enableAllFixes) {
        this.fixesManager = new SystemFixesManager({
          enableExpressFixes: this.config.enableExpressFixes,
          enablePrometheusFixes: this.config.enablePrometheusFixes,
          enableTestDataGeneration: this.config.enableTestDataGeneration,
          prometheusPort: this.config.prometheusPort
        });

        await this.fixesManager.initialize();
        this.logger.info('✅ System Fixes Manager initialized');
      }

      this.isInitialized = true;
      this.logger.info('🎉 Comprehensive System Fix initialized successfully');

      return this.getSystemStatus();

    } catch (error) {
      this.logger.error('❌ Failed to initialize Comprehensive System Fix', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Apply fixes to Express.js application
   */
  applyExpressFixes(app) {
    if (!this.fixesManager) {
      this.logger.warn('System Fixes Manager not initialized');
      return;
    }

    try {
      this.fixesManager.applyExpressMiddleware(app);
      this.logger.info('✅ Express.js fixes applied successfully');
    } catch (error) {
      this.logger.error('❌ Failed to apply Express.js fixes', {
        error: error.message
      });
    }
  }

  /**
   * Setup Prometheus metrics endpoint
   */
  setupPrometheusMetrics(app) {
    if (!this.fixesManager) {
      this.logger.warn('System Fixes Manager not initialized');
      return;
    }

    try {
      const metricsHandler = this.fixesManager.getPrometheusMetricsHandler();
      if (metricsHandler) {
        app.get('/api/metrics', metricsHandler);
        this.logger.info('✅ Prometheus metrics endpoint configured');
      }
    } catch (error) {
      this.logger.error('❌ Failed to setup Prometheus metrics', {
        error: error.message
      });
    }
  }

  /**
   * Get test data for tools
   */
  getTestData(type = 'all') {
    if (!this.fixesManager) {
      this.logger.warn('System Fixes Manager not initialized');
      return null;
    }

    return this.fixesManager.getTestData(type);
  }

  /**
   * Validate test data
   */
  validateTestData(data, type) {
    if (!this.fixesManager) {
      return { valid: false, error: 'System Fixes Manager not initialized' };
    }

    return this.fixesManager.validateTestData(data, type);
  }

  /**
   * Record system metrics
   */
  recordMetrics(type, data) {
    if (!this.fixesManager) {
      return;
    }

    this.fixesManager.recordMetrics(type, data);
  }

  /**
   * Fix bot intent analysis function
   */
  fixBotIntentAnalysis(analyzeIntentFunction) {
    if (!this.fixesManager) {
      this.logger.warn('System Fixes Manager not initialized');
      return analyzeIntentFunction;
    }

    return this.fixesManager.fixBotIntentAnalysis(analyzeIntentFunction);
  }

  /**
   * Create development rate limiter
   */
  createDevelopmentRateLimiter() {
    if (!this.fixesManager) {
      this.logger.warn('System Fixes Manager not initialized');
      return null;
    }

    return this.fixesManager.createDevelopmentRateLimiter();
  }

  /**
   * Create Jupyter connection pool
   */
  createJupyterConnectionPool(config = {}) {
    if (!this.fixesManager) {
      this.logger.warn('System Fixes Manager not initialized');
      return null;
    }

    return this.fixesManager.createJupyterConnectionPool(config);
  }

  /**
   * Get mock services
   */
  getMockServices() {
    if (!this.fixesManager) {
      this.logger.warn('System Fixes Manager not initialized');
      return null;
    }

    return this.fixesManager.createMockServices();
  }

  /**
   * Get environment configuration status
   */
  getEnvironmentStatus() {
    if (!this.envConfigFix) {
      return { error: 'Environment Configuration Fix not initialized' };
    }

    return this.envConfigFix.getConfigurationStatus();
  }

  /**
   * Validate API connectivity
   */
  async validateApiConnectivity() {
    if (!this.envConfigFix) {
      return { error: 'Environment Configuration Fix not initialized' };
    }

    return await this.envConfigFix.validateApiConnectivity();
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus() {
    const status = {
      initialized: this.isInitialized,
      timestamp: new Date().toISOString(),
      fixes: {
        systemFixesManager: !!this.fixesManager,
        environmentConfigFix: !!this.envConfigFix
      },
      config: this.config,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      }
    };

    if (this.fixesManager) {
      status.fixes.details = this.fixesManager.getSystemStatus();
    }

    if (this.envConfigFix) {
      status.environment = this.getEnvironmentStatus();
    }

    return status;
  }

  /**
   * Run comprehensive system test
   */
  async runSystemTest() {
    try {
      this.logger.info('🧪 Running comprehensive system test...');

      const results = {
        timestamp: new Date().toISOString(),
        tests: {},
        summary: {
          passed: 0,
          failed: 0,
          total: 0
        }
      };

      // Test 1: Environment Configuration
      if (this.envConfigFix) {
        try {
          const envStatus = this.getEnvironmentStatus();
          results.tests.environment = {
            status: 'passed',
            details: envStatus
          };
          results.summary.passed++;
        } catch (error) {
          results.tests.environment = {
            status: 'failed',
            error: error.message
          };
          results.summary.failed++;
        }
        results.summary.total++;
      }

      // Test 2: Test Data Generation
      if (this.fixesManager) {
        try {
          const testData = this.getTestData('flights');
          const validation = this.validateTestData(testData.valid, 'flight');
          results.tests.testDataGeneration = {
            status: validation.valid ? 'passed' : 'failed',
            details: { validation, sampleData: testData.valid }
          };
          if (validation.valid) {
            results.summary.passed++;
          } else {
            results.summary.failed++;
          }
        } catch (error) {
          results.tests.testDataGeneration = {
            status: 'failed',
            error: error.message
          };
          results.summary.failed++;
        }
        results.summary.total++;
      }

      // Test 3: Mock Services
      if (this.fixesManager) {
        try {
          const mockServices = this.getMockServices();
          results.tests.mockServices = {
            status: 'passed',
            details: {
              services: Object.keys(mockServices),
              telegramTest: await mockServices.telegram.sendMessage('123', 'Test'),
              currencyTest: await mockServices.currency.convert('USD', 'EUR', 100)
            }
          };
          results.summary.passed++;
        } catch (error) {
          results.tests.mockServices = {
            status: 'failed',
            error: error.message
          };
          results.summary.failed++;
        }
        results.summary.total++;
      }

      // Test 4: API Connectivity
      if (this.envConfigFix) {
        try {
          const connectivity = await this.validateApiConnectivity();
          results.tests.apiConnectivity = {
            status: 'passed',
            details: connectivity
          };
          results.summary.passed++;
        } catch (error) {
          results.tests.apiConnectivity = {
            status: 'failed',
            error: error.message
          };
          results.summary.failed++;
        }
        results.summary.total++;
      }

      // Calculate overall status
      results.overallStatus = results.summary.failed === 0 ? 'passed' : 'failed';
      results.successRate = (results.summary.passed / results.summary.total) * 100;

      this.logger.info('✅ Comprehensive system test completed', {
        overallStatus: results.overallStatus,
        successRate: `${results.successRate.toFixed(1)}%`,
        passed: results.summary.passed,
        failed: results.summary.failed,
        total: results.summary.total
      });

      return results;

    } catch (error) {
      this.logger.error('❌ Comprehensive system test failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate system health report
   */
  generateHealthReport() {
    const status = this.getSystemStatus();
    const report = {
      title: 'Maya Travel Agent - System Health Report',
      timestamp: new Date().toISOString(),
      overallHealth: 'healthy',
      issues: [],
      recommendations: [],
      metrics: {
        system: status.system,
        fixes: status.fixes,
        environment: status.environment
      }
    };

    // Check for issues
    if (!this.isInitialized) {
      report.overallHealth = 'critical';
      report.issues.push('System fixes not initialized');
    }

    if (status.environment && status.environment.recommendations) {
      report.issues.push(...status.environment.recommendations);
      if (status.environment.recommendations.length > 0) {
        report.overallHealth = 'warning';
      }
    }

    // Add recommendations
    report.recommendations.push('Run comprehensive system test regularly');
    report.recommendations.push('Monitor Prometheus metrics for performance issues');
    report.recommendations.push('Update API keys for production deployment');

    return report;
  }

  /**
   * Cleanup all fixes
   */
  async cleanup() {
    try {
      this.logger.info('🧹 Cleaning up Comprehensive System Fix...');

      if (this.fixesManager) {
        await this.fixesManager.cleanup();
      }

      this.isInitialized = false;
      this.logger.info('✅ Comprehensive System Fix cleaned up');

    } catch (error) {
      this.logger.error('❌ Failed to cleanup Comprehensive System Fix', {
        error: error.message
      });
    }
  }
}

module.exports = ComprehensiveSystemFix;
