#!/usr/bin/env node

/**
 * Evolve Manager Demo Script
 * Demonstrates Evolve Manager capabilities with sample requests
 */

const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/evolve-demo.log' })
  ]
});

// Demo scenarios
const DEMO_SCENARIOS = [
  {
    name: 'Travel Planning',
    description: 'Complex multi-day trip planning with budget optimization',
    request: {
      message: 'Plan a 7-day trip to Tokyo, Japan for 2 people with a $3000 budget. Include cultural experiences, food tours, and must-see attractions.',
      type: 'travel_request'
    },
    expected_agents: ['maya_orchestrator', 'luna', 'karim'],
    complexity: 'high'
  },
  {
    name: 'Development Task',
    description: 'Software development request with multiple components',
    request: {
      message: 'Build a user authentication system with JWT tokens, password hashing, and rate limiting. Include unit tests and documentation.',
      type: 'development_request'
    },
    expected_agents: ['code_architect'],
    complexity: 'high'
  },
  {
    name: 'Learning Request',
    description: 'Educational content and guidance',
    request: {
      message: 'Explain how machine learning works and help me understand neural networks with a simple example.',
      type: 'learning_request'
    },
    expected_agents: ['evolve_manager'],
    complexity: 'medium'
  },
  {
    name: 'Pattern Learning',
    description: 'Demonstrate pattern learning across multiple interactions',
    requests: [
      {
        message: 'I need help planning a weekend getaway to a nearby city.',
        type: 'travel_request'
      },
      {
        message: 'Can you suggest some budget-friendly activities?',
        type: 'travel_request'
      },
      {
        message: 'What are some good restaurants in the area?',
        type: 'travel_request'
      }
    ],
    expected_patterns: ['travel_patterns', 'budget_optimization', 'local_discovery'],
    complexity: 'medium'
  }
];

class EvolveDemo {
  constructor() {
    this.evolveOrchestrator = null;
    this.demoResults = [];
    this.startTime = Date.now();
  }

  async run() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                       🎯 EVOLVE MANAGER DEMO                                 ║
║                                                                              ║
║                Demonstrating AI Manager & Pattern Learning                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

    try {
      // Initialize Evolve Manager
      await this.initializeEvolve();

      // Run demo scenarios
      await this.runScenarios();

      // Show results summary
      this.showResultsSummary();

      // Demonstrate pattern learning
      await this.demonstratePatternLearning();

      console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                          ✅ DEMO COMPLETED                                   ║
║                                                                              ║
║                    Ready to use Evolve Manager!                              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

    } catch (error) {
      logger.error('Demo failed', { error: error.message });
      console.error('❌ Demo failed:', error.message);
      process.exit(1);
    }
  }

  async initializeEvolve() {
    console.log('\n🚀 Initializing Evolve Manager...');

    try {
      const { EvolveOrchestrator } = require('../src/agents/evolve/EvolveOrchestrator');

      this.evolveOrchestrator = new EvolveOrchestrator();

      // Wait for initialization
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Initialization timeout'));
        }, 30000);

        this.evolveOrchestrator.once('evolve_initialized', (data) => {
          clearTimeout(timeout);
          console.log('✅ Evolve Manager initialized successfully');
          console.log(`   📊 Agents Available: ${data.agents_available}`);
          console.log(`   🧠 Patterns Loaded: ${data.patterns_loaded}`);
          resolve(data);
        });

        this.evolveOrchestrator.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

    } catch (error) {
      logger.error('Failed to initialize Evolve Manager', { error: error.message });
      throw error;
    }
  }

  async runScenarios() {
    console.log('\n🎬 Running Demo Scenarios...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (let i = 0; i < DEMO_SCENARIOS.length; i++) {
      const scenario = DEMO_SCENARIOS[i];

      console.log(`\n[${i + 1}/${DEMO_SCENARIOS.length}] ${scenario.name}`);
      console.log(`   ${scenario.description}`);

      if (scenario.request) {
        // Single request scenario
        await this.runSingleScenario(scenario);
      } else if (scenario.requests) {
        // Multi-request scenario
        await this.runMultiRequestScenario(scenario);
      }

      // Small delay between scenarios
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async runSingleScenario(scenario) {
    const startTime = Date.now();

    try {
      console.log(`\n📝 Request: "${scenario.request.message}"`);
      console.log(`🎯 Expected Complexity: ${scenario.complexity}`);
      console.log(`🤖 Expected Agents: ${scenario.expected_agents.join(', ')}`);

      // Process request
      const result = await this.evolveOrchestrator.processRequest(
        scenario.request,
        'demo_user',
        {
          source: 'demo',
          scenario: scenario.name,
          timestamp: new Date().toISOString()
        }
      );

      const processingTime = Date.now() - startTime;

      if (result.success) {
        console.log(`\n✅ Success! (${processingTime}ms)`);
        console.log(`📋 Task ID: ${result.taskId}`);

        if (result.result) {
          this.displayScenarioResult(scenario, result.result);
        }

        // Store result
        this.demoResults.push({
          scenario: scenario.name,
          success: true,
          processing_time: processingTime,
          task_id: result.taskId,
          agents_used: result.agents_used || []
        });

      } else {
        console.log(`❌ Failed: ${result.error}`);

        this.demoResults.push({
          scenario: scenario.name,
          success: false,
          error: result.error,
          processing_time: processingTime
        });
      }

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.log(`❌ Error: ${error.message}`);

      this.demoResults.push({
        scenario: scenario.name,
        success: false,
        error: error.message,
        processing_time: processingTime
      });
    }
  }

  async runMultiRequestScenario(scenario) {
    console.log(`\n📝 Multi-Request Scenario: ${scenario.requests.length} requests`);

    const scenarioResults = [];

    for (let i = 0; i < scenario.requests.length; i++) {
      const request = scenario.requests[i];

      console.log(`\n   [${i + 1}/${scenario.requests.length}] "${request.message}"`);

      try {
        const result = await this.evolveOrchestrator.processRequest(
          request,
          'demo_user',
          {
            source: 'demo',
            scenario: scenario.name,
            request_number: i + 1,
            timestamp: new Date().toISOString()
          }
        );

        if (result.success) {
          console.log(`   ✅ Success! (${result.execution_time}ms)`);
          scenarioResults.push({ success: true, task_id: result.taskId });
        } else {
          console.log(`   ❌ Failed: ${result.error}`);
          scenarioResults.push({ success: false, error: result.error });
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        scenarioResults.push({ success: false, error: error.message });
      }
    }

    // Store scenario results
    this.demoResults.push({
      scenario: scenario.name,
      success: scenarioResults.every(r => r.success),
      results: scenarioResults,
      expected_patterns: scenario.expected_patterns
    });
  }

  displayScenarioResult(scenario, result) {
    console.log('\n📊 Result Summary:');

    if (typeof result === 'string') {
      console.log(`   ${result}`);
    } else if (result.type === 'synthesized_response') {
      console.log(`   Strategy: ${result.strategy_used}`);
      console.log(`   Phases: ${result.phases_executed}`);
      console.log(`   Success Rate: ${result.successful_phases}/${result.phases_executed}`);

      if (result.summary) {
        console.log(`   Summary: ${result.summary}`);
      }
    } else if (result.type === 'travel_plan') {
      console.log(`   Destination: ${result.destination}`);
      console.log(`   Duration: ${result.duration} days`);
      console.log(`   Cost: $${result.total_estimated_cost}`);

      if (result.highlights) {
        console.log(`   Highlights: ${result.highlights.join(', ')}`);
      }
    } else {
      console.log(`   Response Type: ${result.type || 'unknown'}`);
    }
  }

  showResultsSummary() {
    console.log('\n📈 Demo Results Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const totalScenarios = this.demoResults.length;
    const successfulScenarios = this.demoResults.filter(r => r.success).length;
    const totalTime = Date.now() - this.startTime;

    console.log(`   Total Scenarios: ${totalScenarios}`);
    console.log(`   Successful: ${successfulScenarios}`);
    console.log(`   Success Rate: ${Math.round((successfulScenarios / totalScenarios) * 100)}%`);
    console.log(`   Total Time: ${Math.round(totalTime / 1000)}s`);

    // Show individual results
    console.log('\n📋 Individual Results:');
    this.demoResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const time = result.processing_time ? `(${Math.round(result.processing_time)}ms)` : '';

      console.log(`   ${index + 1}. ${status} ${result.scenario} ${time}`);

      if (!result.success && result.error) {
        console.log(`      Error: ${result.error}`);
      }

      if (result.agents_used && result.agents_used.length > 0) {
        console.log(`      Agents: ${result.agents_used.join(', ')}`);
      }
    });
  }

  async demonstratePatternLearning() {
    console.log('\n🧠 Demonstrating Pattern Learning...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!this.evolveOrchestrator || !this.evolveOrchestrator.patternEngine) {
      console.log('❌ Pattern engine not available');
      return;
    }

    const learningStats = this.evolveOrchestrator.patternEngine.getLearningStats();

    console.log('\n📊 Pattern Learning Status:');
    console.log(`   Patterns Learned: ${learningStats.patternsLearned}`);
    console.log(`   Insights Generated: ${learningStats.insightsGenerated}`);
    console.log(`   Total Interactions: ${learningStats.total_interactions}`);
    console.log(`   Memory Usage: ${learningStats.memory_usage}KB`);

    if (learningStats.journal_connected) {
      console.log('✅ Journal Integration: Active');
    } else {
      console.log('⚠️ Journal Integration: Not available');
    }

    // Show recent patterns if available
    if (learningStats.total_patterns > 0) {
      console.log('\n📚 Recent Patterns:');
      const recentPatterns = this.evolveOrchestrator.patternEngine.getRecentPatterns(5);

      recentPatterns.forEach((pattern, index) => {
        console.log(`   ${index + 1}. ${pattern.type} (${pattern.category})`);
        console.log(`      Confidence: ${Math.round((pattern.confidence || 0) * 100)}%`);
        console.log(`      Created: ${new Date(pattern.data?.timestamp || pattern.metadata?.generated_at).toLocaleString()}`);
      });
    }

    // Show insights if available
    if (learningStats.insightsGenerated > 0) {
      console.log('\n💡 Recent Insights:');
      // Note: In a real implementation, you'd retrieve insights from the pattern engine
      console.log('   💡 Insights generated during demo execution');
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');

    if (this.evolveOrchestrator) {
      // Cleanup would go here
      logger.info('Demo cleanup completed');
    }
  }
}

// Helper function to display demo header
function showDemoHeader() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                       🎯 EVOLVE MANAGER DEMO                                 ║
║                                                                              ║
║                Demonstrating AI Manager & Pattern Learning                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

This demo will showcase:

✅ Multi-Agent Coordination
   • Travel planning with Maya agents
   • Development tasks with code agents
   • Learning requests with general agents

✅ Pattern Learning
   • Learning from successful interactions
   • Generating insights and recommendations
   • Persistent memory across sessions

✅ Real-Time Monitoring
   • Live dashboard updates
   • Performance metrics
   • System health monitoring

✅ Integration Capabilities
   • Maya Travel Agent integration
   • MCP Journal for persistent memory
   • Cross-domain request handling

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

// Main execution
async function main() {
  showDemoHeader();

  const demo = new EvolveDemo();

  try {
    await demo.run();
  } catch (error) {
    logger.error('Demo execution failed', { error: error.message });
    console.error('\n❌ Demo failed:', error.message);
    process.exit(1);
  } finally {
    await demo.cleanup();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n👋 Demo interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Demo terminated');
  process.exit(0);
});

// Run demo if called directly
if (require.main === module) {
  main().catch(error => {
    logger.error('Demo startup failed', { error: error.message });
    console.error('Failed to start demo:', error.message);
    process.exit(1);
  });
}

module.exports = EvolveDemo;