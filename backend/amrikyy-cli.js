#!/usr/bin/env node

/**
 * Amrikyy CLI - Direct Control Interface
 * 
 * Command-line interface for direct interaction with the Amrikyy AI Agent System.
 * Perfect for testing, development, and quick administrative tasks.
 */

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');

// Import our AIX system
const AIXEnhancedCursorManager = require('./src/agents/AIXEnhancedCursorManager');

const program = new Command();

// CLI Configuration
const AIX_DIRECTORY = path.join(__dirname, 'agents/aix');

program
  .name('amrikyy-cli')
  .description('🚀 Direct control interface for the Amrikyy AI Agent System')
  .version('1.0.0');

// Global options
program
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--debug', 'Enable debug mode');

// Initialize manager (singleton)
let manager = null;

async function getManager() {
    if (!manager) {
        console.log('🧠 Initializing AIX Enhanced Cursor Manager...');
        manager = new AIXEnhancedCursorManager({
            aixDirectory: AIX_DIRECTORY,
            quantumEdgeEnabled: true,
            memoryEnabled: true,
            verbose: program.opts().verbose
        });
        await manager.initialize();
        console.log('✅ Manager initialized successfully');
    }
    return manager;
}

// ============================================================================
// AGENT MANAGEMENT COMMANDS
// ============================================================================

program
  .command('agents')
  .description('📋 List all available AIX agents')
  .action(async () => {
    try {
      const mgr = await getManager();
      const agents = mgr.getAvailableAgents();
      
      console.log('\n🤖 Available AIX Agents:');
      console.log('========================');
      
      if (agents.length === 0) {
        console.log('❌ No agents found. Make sure AIX files are in:', AIX_DIRECTORY);
        return;
      }
      
      agents.forEach((agent, index) => {
        console.log(`\n${index + 1}. ${agent.name} (${agent.id})`);
        console.log(`   Version: ${agent.version}`);
        console.log(`   Capabilities: ${agent.capabilities.length}`);
        console.log(`   Tools: ${agent.tools.length}`);
        console.log(`   Status: ${agent.status || 'Ready'}`);
      });
      
      console.log(`\n✅ Total: ${agents.length} agent(s) available`);
      
    } catch (error) {
      console.error('❌ Error listing agents:', error.message);
      if (program.opts().debug) console.error(error.stack);
    }
  });

program
  .command('agent <agentId>')
  .description('🔍 Get detailed information about a specific agent')
  .action(async (agentId) => {
    try {
      const mgr = await getManager();
      const agent = mgr.getAgentById(agentId);
      
      if (!agent) {
        console.log(`❌ Agent '${agentId}' not found`);
        return;
      }
      
      console.log(`\n🤖 Agent Details: ${agent.name}`);
      console.log('================================');
      console.log(`ID: ${agent.id}`);
      console.log(`Name: ${agent.name}`);
      console.log(`Version: ${agent.version}`);
      console.log(`Status: ${agent.status || 'Ready'}`);
      
      console.log('\n🧠 Capabilities:');
      agent.capabilities.forEach(cap => {
        console.log(`  • ${cap}`);
      });
      
      console.log('\n🛠️ Tools:');
      agent.tools.forEach(tool => {
        console.log(`  • ${tool.name} - ${tool.description}`);
      });
      
    } catch (error) {
      console.error('❌ Error getting agent details:', error.message);
      if (program.opts().debug) console.error(error.stack);
    }
  });

// ============================================================================
// TRIP PLANNING COMMANDS
// ============================================================================

program
  .command('plan-trip')
  .description('✈️ Orchestrate a new trip planning task')
  .requiredOption('-d, --destination <string>', 'The travel destination')
  .option('-p, --days <number>', 'Duration of the trip in days', '7')
  .option('-b, --budget <number>', 'Budget for the trip', '2000')
  .option('-i, --interests <string...>', 'User interests (e.g., food history art)')
  .option('-u, --user <string>', 'User ID for personalization', 'test-user')
  .option('--agent <string>', 'Force specific agent (optional)')
  .action(async (options) => {
    try {
      console.log('🚀 Orchestrating a new trip planning task...');
      console.log('==========================================');
      
      const tripTask = {
        description: `Plan a ${options.days}-day trip to ${options.destination}`,
        parameters: {
          destination: options.destination,
          duration: parseInt(options.days),
          budget: parseFloat(options.budget),
          interests: options.interests || [],
          userId: options.user
        },
        context: {
          source: 'cli',
          priority: 'normal',
          sessionId: `cli-${Date.now()}`
        }
      };
      
      console.log('📋 Task Details:');
      console.log(`   Destination: ${options.destination}`);
      console.log(`   Duration: ${options.days} days`);
      console.log(`   Budget: $${options.budget}`);
      console.log(`   Interests: ${options.interests?.join(', ') || 'None specified'}`);
      console.log(`   User: ${options.user}`);
      
      if (options.agent) {
        console.log(`   Forced Agent: ${options.agent}`);
        tripTask.context.forcedAgent = options.agent;
      }
      
      console.log('\n🧠 Sending task to AIX Enhanced Cursor Manager...');
      
      const mgr = await getManager();
      const result = await mgr.orchestrateTask(tripTask);
      
      console.log('\n✅ Task completed successfully!');
      console.log('==============================');
      
      if (result.analysis) {
        console.log('📊 Analysis:');
        console.log(`   Selected Agent: ${result.analysis.selectedAgent}`);
        console.log(`   Confidence: ${result.analysis.confidence}%`);
        console.log(`   Reasoning: ${result.analysis.reasoning}`);
      }
      
      if (result.result) {
        console.log('\n📝 Result:');
        if (typeof result.result === 'string') {
          console.log(result.result);
        } else {
          console.log(JSON.stringify(result.result, null, 2));
        }
      }
      
      if (result.metadata) {
        console.log('\n📈 Metadata:');
        console.log(`   Execution Time: ${result.metadata.executionTime}ms`);
        console.log(`   Memory Used: ${result.metadata.memoryUsed || 'N/A'}`);
        console.log(`   Tools Called: ${result.metadata.toolsCalled || 0}`);
      }
      
    } catch (error) {
      console.error('\n❌ Task failed:', error.message);
      if (program.opts().debug) console.error(error.stack);
    }
  });

// ============================================================================
// LUNA SPECIFIC COMMANDS (POC Testing)
// ============================================================================

program
  .command('luna-test')
  .description('🌙 Test Luna Trip Architect specifically (POC)')
  .requiredOption('-d, --destination <string>', 'The travel destination')
  .option('-p, --days <number>', 'Duration of the trip in days', '3')
  .option('-b, --budget <number>', 'Budget for the trip', '1000')
  .option('-i, --interests <string...>', 'User interests', ['food', 'culture'])
  .action(async (options) => {
    try {
      console.log('🌙 Luna Trip Architect - POC Test');
      console.log('=================================');
      
      const lunaTask = {
        description: `Plan a ${options.days}-day '${options.interests.join(' & ')}' trip to ${options.destination}`,
        parameters: {
          destination: options.destination,
          duration: parseInt(options.days),
          budget: parseFloat(options.budget),
          interests: options.interests,
          userId: 'luna-poc-test'
        },
        context: {
          source: 'luna-poc',
          priority: 'high',
          sessionId: `luna-poc-${Date.now()}`,
          forcedAgent: 'luna-trip-architect-v1' // Force Luna
        }
      };
      
      console.log('📋 Luna Test Task:');
      console.log(`   Destination: ${options.destination}`);
      console.log(`   Duration: ${options.days} days`);
      console.log(`   Budget: $${options.budget}`);
      console.log(`   Interests: ${options.interests.join(', ')}`);
      
      console.log('\n🧠 Sending task directly to Luna...');
      
      const mgr = await getManager();
      const result = await mgr.orchestrateTask(lunaTask);
      
      console.log('\n🌙 Luna\'s Response:');
      console.log('==================');
      
      if (result.analysis) {
        console.log(`✅ Agent Selected: ${result.analysis.selectedAgent}`);
        console.log(`🎯 Confidence: ${result.analysis.confidence}%`);
      }
      
      if (result.result) {
        console.log('\n📝 Trip Plan:');
        if (typeof result.result === 'string') {
          console.log(result.result);
        } else {
          console.log(JSON.stringify(result.result, null, 2));
        }
      }
      
      console.log('\n🎉 Luna POC Test Completed Successfully!');
      
    } catch (error) {
      console.error('\n❌ Luna POC Test Failed:', error.message);
      if (program.opts().debug) console.error(error.stack);
    }
  });

// ============================================================================
// SYSTEM COMMANDS
// ============================================================================

program
  .command('status')
  .description('📊 Get system status and health')
  .action(async () => {
    try {
      const mgr = await getManager();
      const agents = mgr.getAvailableAgents();
      
      console.log('\n📊 Amrikyy AI Agent System Status');
      console.log('==================================');
      console.log(`🤖 Active Agents: ${agents.length}`);
      console.log(`🧠 AIX Directory: ${AIX_DIRECTORY}`);
      console.log(`⚡ Quantum Edge: ${mgr.config?.quantumEdgeEnabled ? 'Enabled' : 'Disabled'}`);
      console.log(`💾 Memory System: ${mgr.config?.memoryEnabled ? 'Enabled' : 'Disabled'}`);
      
      console.log('\n🔍 Agent Status:');
      agents.forEach(agent => {
        const status = agent.status || 'Ready';
        const statusIcon = status === 'Ready' ? '✅' : '⚠️';
        console.log(`   ${statusIcon} ${agent.name} (${agent.id})`);
      });
      
    } catch (error) {
      console.error('❌ Error getting system status:', error.message);
      if (program.opts().debug) console.error(error.stack);
    }
  });

program
  .command('awaken')
  .description('🌅 Initialize and awaken all AIX agents')
  .action(async () => {
    try {
      console.log('🌅 Awakening AIX Agents...');
      console.log('==========================');
      
      const mgr = await getManager();
      const agents = mgr.getAvailableAgents();
      
      console.log(`✅ Successfully awakened ${agents.length} agent(s)`);
      
      agents.forEach(agent => {
        console.log(`   🌙 ${agent.name} - Ready for missions`);
      });
      
      console.log('\n🎯 System ready for operations!');
      
    } catch (error) {
      console.error('❌ Error awakening agents:', error.message);
      if (program.opts().debug) console.error(error.stack);
    }
  });

// ============================================================================
// HELP AND EXAMPLES
// ============================================================================

program
  .command('examples')
  .description('📚 Show usage examples')
  .action(() => {
    console.log('\n📚 Amrikyy CLI Usage Examples');
    console.log('==============================');
    
    console.log('\n🤖 Agent Management:');
    console.log('  amrikyy-cli agents                    # List all agents');
    console.log('  amrikyy-cli agent luna-trip-architect-v1  # Get agent details');
    
    console.log('\n✈️ Trip Planning:');
    console.log('  amrikyy-cli plan-trip -d "Cairo, Egypt" -p 3 -b 1000 -i food history');
    console.log('  amrikyy-cli plan-trip -d "Tokyo" -p 7 -b 2000 -i culture art --agent luna-trip-architect-v1');
    
    console.log('\n🌙 Luna POC Testing:');
    console.log('  amrikyy-cli luna-test -d "Paris" -p 3 -b 1500 -i food culture');
    console.log('  amrikyy-cli luna-test -d "Rome" -p 5 -b 2000 -i history art');
    
    console.log('\n📊 System Management:');
    console.log('  amrikyy-cli status                    # System status');
    console.log('  amrikyy-cli awaken                    # Initialize all agents');
    
    console.log('\n🔧 Options:');
    console.log('  --verbose                             # Enable verbose logging');
    console.log('  --debug                               # Enable debug mode');
  });

// ============================================================================
// MAIN EXECUTION
// ============================================================================

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log('\n💡 Tip: Use "amrikyy-cli examples" to see usage examples');
}
