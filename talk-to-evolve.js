#!/usr/bin/env node

/**
 * Interactive CLI for talking to Evolve Manager
 * Main entry point for user interaction with the Evolve AI Manager
 */

const readline = require('readline');
const winston = require('winston');
const path = require('path');

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
    new winston.transports.File({ filename: 'logs/evolve-cli.log' })
  ]
});

// ASCII Art Header
const EVOLVE_HEADER = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                          🎯 EVOLVE MANAGER CLI                              ║
║                                                                              ║
║                    Your AI Manager & Pattern Learning Agent                 ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;

// Command help
const COMMANDS = {
  '/help': 'Show this help message',
  '/status': 'Show current system status',
  '/agents': 'List all available agents',
  '/dashboard': 'Toggle live dashboard display',
  '/history': 'Show recent activity history',
  '/patterns': 'Show learned patterns',
  '/health': 'Show system health report',
  '/clear': 'Clear the screen',
  '/export': 'Export current session data',
  '/quit': 'Exit the CLI'
};

// CLI State
let evolveOrchestrator = null;
let dashboardEnabled = false;
let sessionHistory = [];
let currentTaskId = null;

class EvolveCLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '🧠 Evolve> '
    });

    this.sessionStart = new Date().toISOString();
    this.commandCount = 0;
  }

  async initialize() {
    console.log(EVOLVE_HEADER);

    try {
      // Initialize Evolve Manager
      await this.initializeEvolveManager();

      // Set up event listeners
      this.setupEventListeners();

      // Show welcome message
      this.showWelcomeMessage();

      // Start CLI loop
      this.startCLI();

    } catch (error) {
      logger.error('Failed to initialize Evolve CLI', { error: error.message });
      console.error('❌ Failed to initialize Evolve Manager:', error.message);
      console.error('Please check your configuration and try again.');
      process.exit(1);
    }
  }

  async initializeEvolveManager() {
    logger.info('Initializing Evolve Manager...');

    try {
      // Import Evolve Orchestrator
      const { EvolveOrchestrator } = require('./backend/src/agents/evolve/EvolveOrchestrator');

      // Create Evolve instance
      evolveOrchestrator = new EvolveOrchestrator();

      // Wait for initialization
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Initialization timeout'));
        }, 30000); // 30 second timeout

        evolveOrchestrator.once('evolve_initialized', (data) => {
          clearTimeout(timeout);
          logger.info('Evolve Manager initialized successfully', data);
          resolve(data);
        });

        // Handle initialization errors
        evolveOrchestrator.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      logger.info('Evolve Manager ready for interaction');

    } catch (error) {
      logger.error('Failed to initialize Evolve Manager', { error: error.message });
      throw error;
    }
  }

  setupEventListeners() {
    if (!evolveOrchestrator) return;

    // Listen to task events
    evolveOrchestrator.on('execution_phase_started', (data) => {
      if (dashboardEnabled) {
        console.log(`\n📊 Phase Started: ${data.phase}`);
        console.log(`   Agents: ${data.agents.join(', ')}`);
      }
    });

    evolveOrchestrator.on('execution_phase_completed', (data) => {
      if (dashboardEnabled) {
        const status = data.success ? '✅' : '❌';
        console.log(`\n${status} Phase Completed: ${data.phase} (${data.duration}ms)`);
      }
    });

    evolveOrchestrator.on('pattern_learned', (data) => {
      if (dashboardEnabled) {
        console.log(`\n🧠 Pattern Learned: ${data.patterns_learned} new patterns`);
      }
    });

    evolveOrchestrator.on('insight_generated', (data) => {
      if (dashboardEnabled) {
        console.log(`\n💡 Insight Generated: ${data.insight}`);
      }
    });

    // Handle process termination
    process.on('SIGINT', () => {
      this.handleGracefulShutdown();
    });

    process.on('SIGTERM', () => {
      this.handleGracefulShutdown();
    });
  }

  showWelcomeMessage() {
    console.log('\n🎉 Welcome to Evolve Manager CLI!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💬 You can now talk to Evolve, your AI Manager agent.');
    console.log('📚 Type /help to see available commands.');
    console.log('🚀 Start by telling Evolve what you need help with!');
    console.log('');
    console.log('Examples:');
    console.log('  • "Build a user authentication system"');
    console.log('  • "Plan a trip to Japan"');
    console.log('  • "Help me learn React"');
    console.log('  • "Analyze my project structure"');
    console.log('');
  }

  startCLI() {
    this.rl.prompt();

    this.rl.on('line', async (input) => {
      const command = input.trim();

      if (!command) {
        this.rl.prompt();
        return;
      }

      this.commandCount++;

      try {
        // Handle commands
        if (command.startsWith('/')) {
          await this.handleCommand(command);
        } else {
          // Handle regular requests
          await this.handleRequest(command);
        }
      } catch (error) {
        logger.error('Error processing input', { error: error.message });
        console.error('❌ Error:', error.message);
      }

      this.rl.prompt();
    });

    this.rl.on('close', () => {
      this.handleGracefulShutdown();
    });
  }

  async handleCommand(command) {
    const [cmd, ...args] = command.split(' ');

    switch (cmd) {
      case '/help':
        this.showHelp();
        break;

      case '/status':
        await this.showStatus();
        break;

      case '/agents':
        this.showAgents();
        break;

      case '/dashboard':
        this.toggleDashboard();
        break;

      case '/history':
        this.showHistory();
        break;

      case '/patterns':
        this.showPatterns();
        break;

      case '/health':
        this.showHealth();
        break;

      case '/clear':
        console.clear();
        console.log(EVOLVE_HEADER);
        break;

      case '/export':
        await this.exportSession();
        break;

      case '/quit':
        this.handleGracefulShutdown();
        break;

      default:
        console.log(`❓ Unknown command: ${cmd}`);
        console.log('Type /help to see available commands.');
    }
  }

  async handleRequest(request) {
    if (!evolveOrchestrator) {
      console.log('❌ Evolve Manager is not initialized.');
      return;
    }

    console.log(`\n🤔 Processing: "${request}"`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const startTime = Date.now();

    try {
      // Send request to Evolve Manager
      const result = await evolveOrchestrator.processRequest(
        { message: request, type: 'user_request' },
        'cli_user',
        { source: 'cli', timestamp: new Date().toISOString() }
      );

      const processingTime = Date.now() - startTime;

      if (result.success) {
        currentTaskId = result.taskId;

        // Display result
        this.displayResult(result);

        // Add to session history
        sessionHistory.push({
          id: result.taskId,
          request,
          result: result.result,
          processing_time: processingTime,
          timestamp: new Date().toISOString(),
          success: true
        });

        console.log(`\n✅ Completed in ${processingTime}ms`);
        console.log(`📋 Task ID: ${result.taskId}`);

      } else {
        console.log(`❌ Failed: ${result.error}`);

        // Add to session history
        sessionHistory.push({
          id: result.taskId,
          request,
          error: result.error,
          processing_time: processingTime,
          timestamp: new Date().toISOString(),
          success: false
        });
      }

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.log(`❌ Error: ${error.message}`);

      // Add to session history
      sessionHistory.push({
        id: `error_${Date.now()}`,
        request,
        error: error.message,
        processing_time: processingTime,
        timestamp: new Date().toISOString(),
        success: false
      });
    }
  }

  displayResult(result) {
    if (!result.result) {
      console.log('ℹ️ Request processed but no detailed result available.');
      return;
    }

    // Display based on result type
    if (typeof result.result === 'string') {
      console.log(result.result);
    } else if (result.result.type === 'synthesized_response') {
      this.displaySynthesizedResponse(result.result);
    } else if (result.result.type === 'travel_plan') {
      this.displayTravelPlan(result.result);
    } else {
      // Generic object display
      console.log(JSON.stringify(result.result, null, 2));
    }
  }

  displaySynthesizedResponse(response) {
    console.log(`\n📋 Strategy Used: ${response.strategy_used}`);
    console.log(`📊 Phases Executed: ${response.phases_executed}`);
    console.log(`✅ Success Rate: ${response.successful_phases}/${response.phases_executed}`);

    if (response.summary) {
      console.log(`\n📝 Summary:`);
      console.log(`   ${response.summary}`);
    }

    if (response.recommendations && response.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`);
      response.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    if (response.next_steps && response.next_steps.length > 0) {
      console.log(`\n🚀 Next Steps:`);
      response.next_steps.forEach((step, index) => {
        console.log(`   ${index + 1}. ${step}`);
      });
    }
  }

  displayTravelPlan(plan) {
    console.log(`\n🗺️ Travel Plan for ${plan.destination}`);
    console.log(`📅 Duration: ${plan.duration} days`);
    console.log(`💰 Estimated Cost: $${plan.total_estimated_cost}`);

    if (plan.days && plan.days.length > 0) {
      console.log(`\n📋 Daily Itinerary:`);
      plan.days.forEach(day => {
        console.log(`\n   Day ${day.day} (${day.date}):`);
        day.activities.forEach(activity => {
          console.log(`     • ${activity.time}: ${activity.activity} (${activity.duration}) - $${activity.cost}`);
        });
      });
    }

    if (plan.highlights && plan.highlights.length > 0) {
      console.log(`\n✨ Highlights:`);
      plan.highlights.forEach(highlight => {
        console.log(`   • ${highlight}`);
      });
    }
  }

  showHelp() {
    console.log('\n📚 Available Commands:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    Object.entries(COMMANDS).forEach(([command, description]) => {
      console.log(`   ${command.padEnd(12)} - ${description}`);
    });

    console.log('\n💬 Regular Requests:');
    console.log('   Just type your request in natural language!');
    console.log('   Evolve will analyze it and coordinate the appropriate agents.');
  }

  async showStatus() {
    if (!evolveOrchestrator) {
      console.log('❌ Evolve Manager is not initialized.');
      return;
    }

    const health = evolveOrchestrator.getSystemHealth();

    console.log('\n📊 System Status:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log(`   Status: ${health.evolve_manager.status}`);
    console.log(`   Version: ${health.evolve_manager.version}`);
    console.log(`   Active Tasks: ${health.evolve_manager.active_tasks}`);
    console.log(`   Success Rate: ${health.evolve_manager.metrics.successRate}%`);
    console.log(`   Avg Response Time: ${Math.round(health.evolve_manager.metrics.averageResponseTime)}ms`);
    console.log(`   Patterns Learned: ${health.evolve_manager.metrics.patternsLearned}`);

    if (health.maya_orchestrator) {
      console.log(`\n🗺️ Maya Travel Agents:`);
      console.log(`   Status: ${health.maya_orchestrator.orchestrator_health}`);
      console.log(`   Active Conversations: ${health.maya_orchestrator.active_conversations}`);
    }

    if (health.pattern_engine) {
      console.log(`\n🧠 Pattern Engine:`);
      console.log(`   Status: ${health.pattern_engine.status}`);
      console.log(`   Memory Usage: ${health.pattern_engine.memory_usage}KB`);
    }
  }

  showAgents() {
    if (!evolveOrchestrator) {
      console.log('❌ Evolve Manager is not initialized.');
      return;
    }

    const agents = evolveOrchestrator.listAvailableAgents();

    console.log('\n🤖 Available Agents:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    agents.forEach(agent => {
      const status = agent.status === 'active' ? '🟢' : '🟡';
      console.log(`   ${status} ${agent.name.padEnd(20)} - ${agent.title}`);
      console.log(`      Domain: ${agent.domain}`);
      console.log(`      Capabilities: ${agent.capabilities?.join(', ') || 'General'}`);
      console.log('');
    });
  }

  toggleDashboard() {
    dashboardEnabled = !dashboardEnabled;

    if (dashboardEnabled) {
      console.log('\n📊 Live Dashboard: ENABLED');
      console.log('You will now see real-time updates during request processing.');
    } else {
      console.log('\n📊 Live Dashboard: DISABLED');
      console.log('Real-time updates are now hidden.');
    }
  }

  showHistory() {
    console.log('\n📚 Session History:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (sessionHistory.length === 0) {
      console.log('   No requests in this session yet.');
      console.log('   Start by making a request!');
      return;
    }

    sessionHistory.slice(-10).reverse().forEach((entry, index) => {
      const status = entry.success ? '✅' : '❌';
      const time = Math.round(entry.processing_time);
      const request = entry.request.length > 60
        ? entry.request.substring(0, 60) + '...'
        : entry.request;

      console.log(`   ${index + 1}. ${status} ${request}`);
      console.log(`      Time: ${time}ms | ${new Date(entry.timestamp).toLocaleTimeString()}`);

      if (!entry.success && entry.error) {
        console.log(`      Error: ${entry.error}`);
      }

      console.log('');
    });

    console.log(`   Total requests this session: ${sessionHistory.length}`);
  }

  showPatterns() {
    if (!evolveOrchestrator || !evolveOrchestrator.patternEngine) {
      console.log('❌ Pattern engine is not available.');
      return;
    }

    const stats = evolveOrchestrator.patternEngine.getLearningStats();

    console.log('\n🧠 Pattern Learning Status:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log(`   Patterns Learned: ${stats.patternsLearned}`);
    console.log(`   Insights Generated: ${stats.insightsGenerated}`);
    console.log(`   Total Interactions: ${stats.total_interactions}`);
    console.log(`   Memory Usage: ${stats.memory_usage}KB`);
    console.log(`   Journal Connected: ${stats.journal_connected ? '✅' : '❌'}`);

    if (stats.last_learning) {
      console.log(`   Last Learning: ${new Date(stats.last_learning).toLocaleString()}`);
    }
  }

  showHealth() {
    if (!evolveOrchestrator) {
      console.log('❌ Evolve Manager is not initialized.');
      return;
    }

    const health = evolveOrchestrator.getSystemHealth();

    console.log('\n🏥 System Health Report:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Overall health
    const overallStatus = health.evolve_manager.status === 'active' ? '🟢 Healthy' : '🔴 Error';
    console.log(`   Overall Status: ${overallStatus}`);

    // Component health
    console.log('\n📊 Component Status:');

    if (health.maya_orchestrator) {
      const mayaStatus = health.maya_orchestrator.orchestrator_health === 'healthy' ? '🟢' : '🟡';
      console.log(`   ${mayaStatus} Maya Travel Agents`);
    }

    if (health.pattern_engine) {
      const patternStatus = health.pattern_engine.status === 'active' ? '🟢' : '🟡';
      console.log(`   ${patternStatus} Pattern Learning Engine`);
    }

    // Performance metrics
    console.log('\n📈 Performance Metrics:');
    console.log(`   Success Rate: ${health.evolve_manager.metrics.successRate}%`);
    console.log(`   Avg Response Time: ${Math.round(health.evolve_manager.metrics.averageResponseTime)}ms`);
    console.log(`   Tasks Completed: ${health.evolve_manager.metrics.tasksCompleted}`);

    // Active tasks
    if (health.evolve_manager.active_tasks > 0) {
      console.log(`\n⚡ Active Tasks: ${health.evolve_manager.active_tasks}`);
    }
  }

  async exportSession() {
    try {
      const exportData = {
        session_info: {
          start_time: this.sessionStart,
          end_time: new Date().toISOString(),
          command_count: this.commandCount,
          successful_requests: sessionHistory.filter(h => h.success).length,
          failed_requests: sessionHistory.filter(h => !h.success).length
        },
        history: sessionHistory,
        system_health: evolveOrchestrator ? evolveOrchestrator.getSystemHealth() : null
      };

      const filename = `evolve-session-${new Date().toISOString().split('T')[0]}.json`;
      const fs = require('fs');

      fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));

      console.log(`\n💾 Session exported to: ${filename}`);
      console.log(`   Requests: ${sessionHistory.length}`);
      console.log(`   Duration: ${Math.round((new Date() - new Date(this.sessionStart)) / 1000 / 60)} minutes`);

    } catch (error) {
      console.log(`❌ Failed to export session: ${error.message}`);
    }
  }

  handleGracefulShutdown() {
    console.log('\n\n👋 Shutting down Evolve Manager CLI...');

    // Export session if we have history
    if (sessionHistory.length > 0) {
      console.log('💾 Auto-exporting session data...');
      this.exportSession();
    }

    // Cleanup
    if (evolveOrchestrator) {
      // Evolve cleanup would go here
    }

    console.log('✅ Goodbye!');
    process.exit(0);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  console.error('\n❌ Uncaught error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  console.error('\n❌ Unhandled promise rejection:', reason);
  process.exit(1);
});

// Start the CLI
async function main() {
  const cli = new EvolveCLI();
  await cli.initialize();
}

// Run the CLI
if (require.main === module) {
  main().catch(error => {
    logger.error('CLI startup failed', { error: error.message });
    console.error('Failed to start Evolve CLI:', error.message);
    process.exit(1);
  });
}

module.exports = EvolveCLI;