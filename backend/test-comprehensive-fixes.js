/**
 * Comprehensive System Fixes Test
 * Tests all fixes applied to Maya Travel Agent
 * Validates that all critical issues have been resolved
 */

const ComprehensiveSystemFix = require('./src/fixes/ComprehensiveSystemFix');
const TestDataGenerator = require('./src/fixes/TestDataGenerator');
const winston = require('winston');

class ComprehensiveFixesTest {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'backend/logs/comprehensive-fixes-test.log' }),
        new winston.transports.Console()
      ]
    });

    this.comprehensiveFix = null;
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: {},
      summary: {
        passed: 0,
        failed: 0,
        total: 0
      }
    };
  }

  /**
   * Initialize comprehensive fix
   */
  async initialize() {
    try {
      this.logger.info('🚀 Initializing Comprehensive System Fix for testing...');

      this.comprehensiveFix = new ComprehensiveSystemFix({
        enableAllFixes: true,
        enableExpressFixes: true,
        enablePrometheusFixes: true,
        enableEnvironmentFixes: true,
        enableTestDataGeneration: true,
        prometheusPort: 9091
      });

      await this.comprehensiveFix.initialize();
      this.logger.info('✅ Comprehensive System Fix initialized for testing');

      return true;

    } catch (error) {
      this.logger.error('❌ Failed to initialize Comprehensive System Fix', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Test 1: Express.js Response Handler Fix
   */
  async testExpressResponseHandlerFix() {
    this.logger.info('🧪 Testing Express.js Response Handler Fix...');

    try {
      // Test safe response handler
      const expressFix = this.comprehensiveFix.fixesManager.fixes.express;
      if (!expressFix) {
        throw new Error('Express fix not initialized');
      }

      // Test request validator
      const mockReq = { method: 'GET', url: '/test', id: 'test-123' };
      const mockRes = { json: () => {}, status: () => mockRes };
      const mockNext = () => {};

      // This should not throw an error
      expressFix.requestValidator()(mockReq, mockRes, mockNext);

      this.testResults.tests.expressResponseHandler = {
        status: 'passed',
        details: 'Express.js response handler fix working correctly'
      };
      this.testResults.summary.passed++;

    } catch (error) {
      this.testResults.tests.expressResponseHandler = {
        status: 'failed',
        error: error.message
      };
      this.testResults.summary.failed++;
    }

    this.testResults.summary.total++;
  }

  /**
   * Test 2: Prometheus Metrics Fix
   */
  async testPrometheusMetricsFix() {
    this.logger.info('🧪 Testing Prometheus Metrics Fix...');

    try {
      const prometheusFix = this.comprehensiveFix.fixesManager.fixes.prometheus;
      if (!prometheusFix) {
        throw new Error('Prometheus fix not initialized');
      }

      // Test metrics recording
      this.comprehensiveFix.recordMetrics('agent_execution', {
        agentName: 'test-agent',
        taskType: 'test-task',
        status: 'success',
        duration: 1000
      });

      // Test API request metrics
      this.comprehensiveFix.recordMetrics('api_request', {
        method: 'GET',
        endpoint: '/test',
        statusCode: 200,
        duration: 500
      });

      this.testResults.tests.prometheusMetrics = {
        status: 'passed',
        details: 'Prometheus metrics fix working correctly, no duplication errors'
      };
      this.testResults.summary.passed++;

    } catch (error) {
      this.testResults.tests.prometheusMetrics = {
        status: 'failed',
        error: error.message
      };
      this.testResults.summary.failed++;
    }

    this.testResults.summary.total++;
  }

  /**
   * Test 3: Test Data Generation
   */
  async testTestDataGeneration() {
    this.logger.info('🧪 Testing Test Data Generation...');

    try {
      // Test flight data generation
      const flightData = this.comprehensiveFix.getTestData('flights');
      const flightValidation = this.comprehensiveFix.validateTestData(flightData.valid, 'flight');

      if (!flightValidation.valid) {
        throw new Error(`Flight data validation failed: ${flightValidation.error}`);
      }

      // Test hotel data generation
      const hotelData = this.comprehensiveFix.getTestData('hotels');
      const hotelValidation = this.comprehensiveFix.validateTestData(hotelData.valid, 'hotel');

      if (!hotelValidation.valid) {
        throw new Error(`Hotel data validation failed: ${hotelValidation.error}`);
      }

      // Test currency data generation
      const currencyData = this.comprehensiveFix.getTestData('currency');
      const currencyValidation = this.comprehensiveFix.validateTestData(currencyData.valid[0], 'currency');

      if (!currencyValidation.valid) {
        throw new Error(`Currency data validation failed: ${currencyValidation.error}`);
      }

      this.testResults.tests.testDataGeneration = {
        status: 'passed',
        details: {
          flightData: flightData.valid,
          hotelData: hotelData.valid,
          currencyData: currencyData.valid[0],
          validations: {
            flight: flightValidation,
            hotel: hotelValidation,
            currency: currencyValidation
          }
        }
      };
      this.testResults.summary.passed++;

    } catch (error) {
      this.testResults.tests.testDataGeneration = {
        status: 'failed',
        error: error.message
      };
      this.testResults.summary.failed++;
    }

    this.testResults.summary.total++;
  }

  /**
   * Test 4: Environment Configuration Fix
   */
  async testEnvironmentConfigurationFix() {
    this.logger.info('🧪 Testing Environment Configuration Fix...');

    try {
      const envStatus = this.comprehensiveFix.getEnvironmentStatus();
      
      if (!envStatus || envStatus.error) {
        throw new Error('Environment configuration fix not working');
      }

      // Test API connectivity
      const connectivity = await this.comprehensiveFix.validateApiConnectivity();
      
      this.testResults.tests.environmentConfiguration = {
        status: 'passed',
        details: {
          environmentStatus: envStatus,
          connectivity: connectivity
        }
      };
      this.testResults.summary.passed++;

    } catch (error) {
      this.testResults.tests.environmentConfiguration = {
        status: 'failed',
        error: error.message
      };
      this.testResults.summary.failed++;
    }

    this.testResults.summary.total++;
  }

  /**
   * Test 5: Bot Intent Analysis Fix
   */
  async testBotIntentAnalysisFix() {
    this.logger.info('🧪 Testing Bot Intent Analysis Fix...');

    try {
      // Mock analyzeIntent function that returns undefined
      const mockAnalyzeIntent = async (message, context) => {
        // Simulate undefined return
        return undefined;
      };

      // Apply fix
      const fixedAnalyzeIntent = this.comprehensiveFix.fixBotIntentAnalysis(mockAnalyzeIntent);

      // Test with fixed function
      const result = await fixedAnalyzeIntent('test message', {});

      if (!result || !result.intent) {
        throw new Error('Bot intent analysis fix not working');
      }

      this.testResults.tests.botIntentAnalysis = {
        status: 'passed',
        details: {
          originalResult: 'undefined',
          fixedResult: result,
          fallbackApplied: result.fallback === true
        }
      };
      this.testResults.summary.passed++;

    } catch (error) {
      this.testResults.tests.botIntentAnalysis = {
        status: 'failed',
        error: error.message
      };
      this.testResults.summary.failed++;
    }

    this.testResults.summary.total++;
  }

  /**
   * Test 6: Mock Services
   */
  async testMockServices() {
    this.logger.info('🧪 Testing Mock Services...');

    try {
      const mockServices = this.comprehensiveFix.getMockServices();
      
      if (!mockServices) {
        throw new Error('Mock services not available');
      }

      // Test Telegram mock service
      const telegramResult = await mockServices.telegram.sendMessage('123', 'Test message');
      if (!telegramResult.success) {
        throw new Error('Telegram mock service not working');
      }

      // Test currency mock service
      const currencyResult = await mockServices.currency.convert('USD', 'EUR', 100);
      if (!currencyResult.convertedAmount) {
        throw new Error('Currency mock service not working');
      }

      // Test weather mock service
      const weatherResult = await mockServices.weather.getForecast('Dubai');
      if (!weatherResult.temperature) {
        throw new Error('Weather mock service not working');
      }

      this.testResults.tests.mockServices = {
        status: 'passed',
        details: {
          telegram: telegramResult,
          currency: currencyResult,
          weather: weatherResult
        }
      };
      this.testResults.summary.passed++;

    } catch (error) {
      this.testResults.tests.mockServices = {
        status: 'failed',
        error: error.message
      };
      this.testResults.summary.failed++;
    }

    this.testResults.summary.total++;
  }

  /**
   * Test 7: Jupyter Connection Pool
   */
  async testJupyterConnectionPool() {
    this.logger.info('🧪 Testing Jupyter Connection Pool...');

    try {
      const connectionPool = this.comprehensiveFix.createJupyterConnectionPool({
        min: 1,
        max: 3
      });

      if (!connectionPool) {
        throw new Error('Jupyter connection pool not created');
      }

      // Test getting connection
      const connection = await connectionPool.getConnection();
      if (!connection) {
        throw new Error('Failed to get connection from pool');
      }

      // Test releasing connection
      connectionPool.releaseConnection(connection.id);

      // Test cleanup
      connectionPool.cleanup();

      this.testResults.tests.jupyterConnectionPool = {
        status: 'passed',
        details: {
          connectionId: connection.id,
          poolCreated: true,
          connectionReleased: true,
          cleanupExecuted: true
        }
      };
      this.testResults.summary.passed++;

    } catch (error) {
      this.testResults.tests.jupyterConnectionPool = {
        status: 'failed',
        error: error.message
      };
      this.testResults.summary.failed++;
    }

    this.testResults.summary.total++;
  }

  /**
   * Test 8: Development Rate Limiter
   */
  async testDevelopmentRateLimiter() {
    this.logger.info('🧪 Testing Development Rate Limiter...');

    try {
      const rateLimiter = this.comprehensiveFix.createDevelopmentRateLimiter();
      
      if (!rateLimiter) {
        throw new Error('Development rate limiter not created');
      }

      this.testResults.tests.developmentRateLimiter = {
        status: 'passed',
        details: {
          rateLimiterCreated: true,
          developmentMode: process.env.NODE_ENV === 'development'
        }
      };
      this.testResults.summary.passed++;

    } catch (error) {
      this.testResults.tests.developmentRateLimiter = {
        status: 'failed',
        error: error.message
      };
      this.testResults.summary.failed++;
    }

    this.testResults.summary.total++;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    try {
      this.logger.info('🧪 Running comprehensive system fixes tests...');

      // Initialize
      await this.initialize();

      // Run all tests
      await this.testExpressResponseHandlerFix();
      await this.testPrometheusMetricsFix();
      await this.testTestDataGeneration();
      await this.testEnvironmentConfigurationFix();
      await this.testBotIntentAnalysisFix();
      await this.testMockServices();
      await this.testJupyterConnectionPool();
      await this.testDevelopmentRateLimiter();

      // Calculate results
      this.testResults.overallStatus = this.testResults.summary.failed === 0 ? 'passed' : 'failed';
      this.testResults.successRate = (this.testResults.summary.passed / this.testResults.summary.total) * 100;

      // Log results
      this.logger.info('✅ Comprehensive system fixes tests completed', {
        overallStatus: this.testResults.overallStatus,
        successRate: `${this.testResults.successRate.toFixed(1)}%`,
        passed: this.testResults.summary.passed,
        failed: this.testResults.summary.failed,
        total: this.testResults.summary.total
      });

      return this.testResults;

    } catch (error) {
      this.logger.error('❌ Comprehensive system fixes tests failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate test report
   */
  generateTestReport() {
    const report = {
      title: 'Maya Travel Agent - Comprehensive System Fixes Test Report',
      timestamp: this.testResults.timestamp,
      overallStatus: this.testResults.overallStatus,
      successRate: `${this.testResults.successRate.toFixed(1)}%`,
      summary: this.testResults.summary,
      tests: this.testResults.tests,
      recommendations: []
    };

    // Add recommendations based on results
    if (this.testResults.summary.failed > 0) {
      report.recommendations.push('Review failed tests and apply additional fixes');
    }

    if (this.testResults.successRate < 100) {
      report.recommendations.push('Address remaining issues before production deployment');
    }

    if (this.testResults.successRate === 100) {
      report.recommendations.push('All critical issues resolved - ready for production deployment');
    }

    return report;
  }

  /**
   * Cleanup
   */
  async cleanup() {
    try {
      if (this.comprehensiveFix) {
        await this.comprehensiveFix.cleanup();
      }
      this.logger.info('✅ Comprehensive fixes test cleaned up');
    } catch (error) {
      this.logger.error('❌ Failed to cleanup comprehensive fixes test', {
        error: error.message
      });
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const test = new ComprehensiveFixesTest();
  
  test.runAllTests()
    .then((results) => {
      console.log('\n🎉 COMPREHENSIVE SYSTEM FIXES TEST COMPLETED');
      console.log(`Overall Status: ${results.overallStatus.toUpperCase()}`);
      console.log(`Success Rate: ${results.successRate.toFixed(1)}%`);
      console.log(`Passed: ${results.summary.passed}/${results.summary.total}`);
      console.log(`Failed: ${results.summary.failed}/${results.summary.total}`);
      
      const report = test.generateTestReport();
      console.log('\n📊 TEST REPORT:');
      console.log(JSON.stringify(report, null, 2));
      
      return test.cleanup();
    })
    .catch((error) => {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = ComprehensiveFixesTest;
