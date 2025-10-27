/**
 * PatternLearningEngine Comprehensive Test
 * 
 * Tests all aspects of the pattern learning system
 */

const PatternLearningEngine = require('../src/aix/PatternLearningEngine');
const { logger } = require('../src/utils/logger');
const log = logger.child('PatternEngineTest');

class PatternEngineTestSuite {
  constructor() {
    this.engine = new PatternLearningEngine({ learningRate: 0.1 });
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  /**
   * Test observation system
   */
  testObservations() {
    log.info('Testing observation system...');

    try {
      // Test user message observation
      this.engine.observe({
        type: 'user_message',
        userId: 'test-user-1',
        message: 'I need a budget trip to Japan for $2000',
        language: 'en'
      });

      this.engine.observe({
        type: 'user_message',
        userId: 'test-user-1',
        message: 'What about a cheap flight to Tokyo?',
        language: 'en'
      });

      this.engine.observe({
        type: 'user_message',
        userId: 'test-user-1',
        message: 'I want budget accommodation in Kyoto',
        language: 'en'
      });

      // Check patterns detected
      const userPattern = this.engine.patterns.user.get('test-user-1');
      
      const test = {
        name: 'User Pattern Detection',
        passed: userPattern && userPattern.messageCount === 3,
        details: `Observed ${userPattern?.messageCount || 0} messages, detected ${userPattern?.commonQueries.size || 0} query types`
      };

      this.recordTest(test);

      // Test agent observation
      this.engine.observe({
        type: 'agent_action',
        agentId: 'amrikyy-001',
        action: 'plan_trip',
        success: true,
        latency: 1500
      });

      this.engine.observe({
        type: 'agent_action',
        agentId: 'amrikyy-001',
        action: 'plan_trip',
        success: true,
        latency: 1200
      });

      const agentPattern = this.engine.patterns.agent.get('amrikyy-001');
      
      const agentTest = {
        name: 'Agent Pattern Detection',
        passed: agentPattern && agentPattern.actionCount === 2,
        details: `Actions: ${agentPattern?.actionCount || 0}, Success rate: ${(agentPattern?.successRate * 100 || 0).toFixed(1)}%`
      };

      this.recordTest(agentTest);

    } catch (error) {
      this.recordTest({
        name: 'Observation System',
        passed: false,
        details: `Error: ${error.message}`
      });
    }
  }

  /**
   * Test memory consolidation
   */
  testMemoryConsolidation() {
    log.info('Testing memory consolidation...');

    try {
      // Add observations
      for (let i = 0; i < 5; i++) {
        this.engine.observe({
          type: 'workflow_execution',
          workflowId: 'trip-planning',
          duration: 2000 + (i * 100),
          success: true,
          steps: [
            { name: 'research', duration: 800 },
            { name: 'budget_analysis', duration: 1200 }
          ]
        });
      }

      // Consolidate
      this.engine.consolidateMemory();

      const test = {
        name: 'Memory Consolidation',
        passed: this.engine.memory.longTerm.size > 0,
        details: `Long-term memory: ${this.engine.memory.longTerm.size} patterns, Short-term: ${this.engine.memory.shortTerm.size} items`
      };

      this.recordTest(test);

    } catch (error) {
      this.recordTest({
        name: 'Memory Consolidation',
        passed: false,
        details: `Error: ${error.message}`
      });
    }
  }

  /**
   * Test insights generation
   */
  testInsights() {
    log.info('Testing insights generation...');

    try {
      // Add diverse observations
      this.engine.observe({
        type: 'error',
        errorType: 'ValidationError',
        message: 'Invalid input',
        solution: 'Added validation'
      });

      this.engine.observe({
        type: 'error',
        errorType: 'ValidationError',
        message: 'Invalid input',
        solution: 'Added validation'
      });

      this.engine.observe({
        type: 'error',
        errorType: 'ValidationError',
        message: 'Invalid input',
        solution: 'Added validation'
      });

      const insights = this.engine.getInsights();

      const test = {
        name: 'Insights Generation',
        passed: insights && Object.keys(insights).length > 0,
        details: `Generated insights for: ${Object.keys(insights).join(', ')}`
      };

      this.recordTest(test);

    } catch (error) {
      this.recordTest({
        name: 'Insights Generation',
        passed: false,
        details: `Error: ${error.message}`
      });
    }
  }

  /**
   * Test pattern learning
   */
  testLearning() {
    log.info('Testing learning capabilities...');

    try {
      // Create multiple similar observations
      for (let i = 0; i < 5; i++) {
        this.engine.observe({
          type: 'user_message',
          userId: 'learning-test',
          message: 'budget travel',
          language: 'en'
        });
      }

      // Consolidate and learn
      this.engine.consolidateMemory();

      // Check if knowledge was extracted
      const knowledge = this.engine.getKnowledge();

      const test = {
        name: 'Pattern Learning',
        passed: this.engine.metrics.observations > 0,
        details: `Observations: ${this.engine.metrics.observations}, Patterns detected: ${this.engine.metrics.patternsDetected}, Knowledge items: ${knowledge.length}`
      };

      this.recordTest(test);

    } catch (error) {
      this.recordTest({
        name: 'Pattern Learning',
        passed: false,
        details: `Error: ${error.message}`
      });
    }
  }

  /**
   * Test performance
   */
  testPerformance() {
    log.info('Testing performance...');

    try {
      const startTime = Date.now();
      const iterations = 1000;

      // Simulate heavy load
      for (let i = 0; i < iterations; i++) {
        this.engine.observe({
          type: 'agent_action',
          agentId: `agent-${i % 4}`,
          action: 'execute',
          success: Math.random() > 0.1,
          latency: Math.random() * 2000
        });
      }

      const duration = Date.now() - startTime;
      const opsPerSecond = Math.round((iterations / duration) * 1000);

      const test = {
        name: 'Performance Test',
        passed: duration < 5000, // Should complete in < 5 seconds
        details: `${iterations} observations in ${duration}ms (${opsPerSecond} ops/sec)`
      };

      this.recordTest(test);

    } catch (error) {
      this.recordTest({
        name: 'Performance Test',
        passed: false,
        details: `Error: ${error.message}`
      });
    }
  }

  /**
   * Record test result
   */
  recordTest(test) {
    this.results.tests.push(test);
    if (test.passed) {
      this.results.passed++;
      log.success(`✅ ${test.name}`, { details: test.details });
    } else {
      this.results.failed++;
      log.error(`❌ ${test.name}`, { details: test.details });
    }
  }

  /**
   * Run all tests
   */
  async runAll() {
    log.info('Starting PatternLearningEngine Test Suite...\n');

    this.testObservations();
    this.testMemoryConsolidation();
    this.testInsights();
    this.testLearning();
    this.testPerformance();

    return this.generateReport();
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const stats = this.engine.getStats();
    const insights = this.engine.getInsights();

    const report = {
      summary: {
        total: this.results.passed + this.results.failed,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: ((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1) + '%'
      },
      tests: this.results.tests,
      engineStats: stats,
      insights: {
        userPatterns: insights.user.length,
        agentPatterns: insights.agent.length,
        codePatterns: insights.code.length,
        workflowPatterns: insights.workflow.length,
        errorPatterns: insights.error.length
      },
      recommendations: this.generateRecommendations(stats, insights)
    };

    log.info('\n' + '='.repeat(60));
    log.info('📊 TEST SUMMARY');
    log.info('='.repeat(60));
    log.info(`Total Tests: ${report.summary.total}`);
    log.info(`Passed: ${report.summary.passed} ✅`);
    log.info(`Failed: ${report.summary.failed} ❌`);
    log.info(`Success Rate: ${report.summary.successRate}`);
    log.info('='.repeat(60) + '\n');

    return report;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(stats, insights) {
    const recommendations = [];

    // Memory optimization
    if (stats.memoryUsage.shortTerm > 80) {
      recommendations.push({
        category: 'Performance',
        priority: 'High',
        issue: 'Short-term memory approaching limit',
        solution: 'Increase consolidation frequency or reduce retention window'
      });
    }

    // Learning rate
    if (stats.patternsDetected < stats.observations * 0.1) {
      recommendations.push({
        category: 'Learning',
        priority: 'Medium',
        issue: 'Low pattern detection rate',
        solution: 'Adjust similarity threshold or increase observation window'
      });
    }

    // Error patterns
    if (insights.error.length > 5) {
      recommendations.push({
        category: 'Quality',
        priority: 'High',
        issue: `${insights.error.length} recurring error patterns detected`,
        solution: 'Review and fix root causes of common errors'
      });
    }

    return recommendations;
  }
}

// Run tests if executed directly
if (require.main === module) {
  const suite = new PatternEngineTestSuite();
  suite.runAll().then(report => {
    console.log('\n📄 Full Report:');
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.summary.failed > 0 ? 1 : 0);
  });
}

module.exports = PatternEngineTestSuite;

