/**
 * Server Integration
 * Integrates all system fixes with the main Express.js server
 * Provides easy integration for Maya Travel Agent
 */

const ComprehensiveSystemFix = require('./ComprehensiveSystemFix');
const winston = require('winston');

class ServerIntegration {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'backend/logs/server-integration.log' }),
        new winston.transports.Console()
      ]
    });

    this.comprehensiveFix = null;
    this.isIntegrated = false;
  }

  /**
   * Integrate fixes with Express.js app
   */
  async integrateWithApp(app, config = {}) {
    try {
      this.logger.info('🔧 Integrating system fixes with Express.js app...');

      // Initialize comprehensive system fix
      this.comprehensiveFix = new ComprehensiveSystemFix(config);
      await this.comprehensiveFix.initialize();

      // Apply Express.js fixes
      this.comprehensiveFix.applyExpressFixes(app);

      // Setup Prometheus metrics
      this.comprehensiveFix.setupPrometheusMetrics(app);

      // Add system status endpoint
      app.get('/api/system/status', (req, res) => {
        try {
          const status = this.comprehensiveFix.getSystemStatus();
          res.json(status);
        } catch (error) {
          this.logger.error('Error getting system status', { error: error.message });
          res.status(500).json({ error: 'Failed to get system status' });
        }
      });

      // Add health check endpoint
      app.get('/api/system/health', (req, res) => {
        try {
          const healthReport = this.comprehensiveFix.generateHealthReport();
          res.json(healthReport);
        } catch (error) {
          this.logger.error('Error generating health report', { error: error.message });
          res.status(500).json({ error: 'Failed to generate health report' });
        }
      });

      // Add test data endpoint
      app.get('/api/system/test-data/:type?', (req, res) => {
        try {
          const type = req.params.type || 'all';
          const testData = this.comprehensiveFix.getTestData(type);
          res.json(testData);
        } catch (error) {
          this.logger.error('Error getting test data', { error: error.message });
          res.status(500).json({ error: 'Failed to get test data' });
        }
      });

      // Add system test endpoint
      app.post('/api/system/test', async (req, res) => {
        try {
          const testResults = await this.comprehensiveFix.runSystemTest();
          res.json(testResults);
        } catch (error) {
          this.logger.error('Error running system test', { error: error.message });
          res.status(500).json({ error: 'Failed to run system test' });
        }
      });

      // Add API connectivity check endpoint
      app.get('/api/system/connectivity', async (req, res) => {
        try {
          const connectivity = await this.comprehensiveFix.validateApiConnectivity();
          res.json(connectivity);
        } catch (error) {
          this.logger.error('Error checking API connectivity', { error: error.message });
          res.status(500).json({ error: 'Failed to check API connectivity' });
        }
      });

      this.isIntegrated = true;
      this.logger.info('✅ System fixes integrated with Express.js app successfully');

      return this.comprehensiveFix;

    } catch (error) {
      this.logger.error('❌ Failed to integrate system fixes with Express.js app', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get comprehensive fix instance
   */
  getComprehensiveFix() {
    return this.comprehensiveFix;
  }

  /**
   * Check if integration is complete
   */
  isIntegrationComplete() {
    return this.isIntegrated && this.comprehensiveFix && this.comprehensiveFix.isInitialized;
  }

  /**
   * Get integration status
   */
  getIntegrationStatus() {
    return {
      integrated: this.isIntegrated,
      comprehensiveFixInitialized: this.comprehensiveFix ? this.comprehensiveFix.isInitialized : false,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Cleanup integration
   */
  async cleanup() {
    try {
      this.logger.info('🧹 Cleaning up server integration...');

      if (this.comprehensiveFix) {
        await this.comprehensiveFix.cleanup();
      }

      this.isIntegrated = false;
      this.logger.info('✅ Server integration cleaned up');

    } catch (error) {
      this.logger.error('❌ Failed to cleanup server integration', {
        error: error.message
      });
    }
  }
}

module.exports = ServerIntegration;
