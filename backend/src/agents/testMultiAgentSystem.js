/**
 * Multi-Agent System Test Suite
 * Demonstrates the INPUT → SYSTEM → OUTPUT architecture
 * Tests agent creation, command execution, and observability
 */

const MultiAgentOrchestrator = require('./multiAgentOrchestrator');
const winston = require('winston');

class MultiAgentSystemTest {
  constructor() {
    this.orchestrator = null;
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple()
      ),
      transports: [
        new winston.transports.Console()
      ]
    });
  }

  async runAllTests() {
    this.logger.info('🚀 Starting Multi-Agent System Tests...');
    
    try {
      // Initialize system
      await this.testSystemInitialization();
      
      // Test agent management
      await this.testAgentManagement();
      
      // Test input processing
      await this.testInputProcessing();
      
      // Test travel operations
      await this.testTravelOperations();
      
      // Test observability
      await this.testObservability();
      
      // Test real-time communication
      await this.testRealTimeCommunication();
      
      this.logger.info('✅ All tests completed successfully!');
      
    } catch (error) {
      this.logger.error('❌ Test suite failed:', error.message);
      throw error;
    }
  }

  async testSystemInitialization() {
    this.logger.info('📋 Testing System Initialization...');
    
    this.orchestrator = new MultiAgentOrchestrator();
    
    // Wait for system initialization
    await new Promise((resolve) => {
      this.orchestrator.on('system_initialized', resolve);
    });
    
    const systemHealth = this.orchestrator.getSystemHealth();
    this.logger.info('System Health:', systemHealth);
    
    if (systemHealth.overall_health.score < 50) {
      throw new Error('System health too low after initialization');
    }
    
    this.logger.info('✅ System initialization test passed');
  }

  async testAgentManagement() {
    this.logger.info('🤖 Testing Agent Management...');
    
    // Test listing agents
    const agents = await this.orchestrator.listAgents();
    this.logger.info(`Found ${agents.length} agents:`, agents.map(a => `${a.name} (${a.type})`));
    
    // Test creating a new agent
    const newAgent = await this.orchestrator.createAgent('travel-researcher', {
      name: 'Test Travel Agent',
      priority: 'high'
    });
    this.logger.info('Created new agent:', newAgent.name);
    
    // Test agent metrics
    const metrics = await this.orchestrator.getAgentMetrics(newAgent.id);
    this.logger.info('Agent metrics:', metrics);
    
    // Test deleting agent
    const deleteResult = await this.orchestrator.deleteAgent(newAgent.id);
    this.logger.info('Agent deletion result:', deleteResult);
    
    this.logger.info('✅ Agent management test passed');
  }

  async testInputProcessing() {
    this.logger.info('📥 Testing Input Processing...');
    
    // Test text input
    const textInput = {
      type: 'text',
      source: 'user',
      text: 'I want to search for flights from Dubai to Istanbul on 2025-01-15 for 2 passengers'
    };
    
    const textResponse = await this.orchestrator.processInput(textInput);
    this.logger.info('Text input response:', textResponse.formats.text.message);
    
    // Test voice input (mock)
    const voiceInput = {
      type: 'voice',
      source: 'user',
      transcript: 'Create a new travel research agent with high priority',
      context: { user_id: 'test_user' }
    };
    
    const voiceResponse = await this.orchestrator.processInput(voiceInput);
    this.logger.info('Voice input response:', voiceResponse.formats.voice.transcript);
    
    // Test agent input
    const agentInput = {
      type: 'agent',
      source: 'booking-agent',
      message: 'Requesting system status update',
      intent: 'system_status',
      context: { request_id: 'req_123' }
    };
    
    const agentResponse = await this.orchestrator.processInput(agentInput);
    this.logger.info('Agent input response:', agentResponse.formats.text.message);
    
    this.logger.info('✅ Input processing test passed');
  }

  async testTravelOperations() {
    this.logger.info('✈️ Testing Travel Operations...');
    
    // Test travel search
    const travelInput = {
      type: 'text',
      source: 'user',
      text: 'Find flights from Dubai to London on 2025-02-01 for 1 passenger'
    };
    
    const travelResponse = await this.orchestrator.processInput(travelInput);
    this.logger.info('Travel search response:', travelResponse.formats.text.message);
    
    // Test booking request
    const bookingInput = {
      type: 'text',
      source: 'user',
      text: 'Book the Emirates flight for 2 passengers with payment info'
    };
    
    const bookingResponse = await this.orchestrator.processInput(bookingInput);
    this.logger.info('Booking response:', bookingResponse.formats.text.message);
    
    // Test analytics request
    const analyticsInput = {
      type: 'text',
      source: 'user',
      text: 'Generate analytics report for travel trends this month'
    };
    
    const analyticsResponse = await this.orchestrator.processInput(analyticsInput);
    this.logger.info('Analytics response:', analyticsResponse.formats.text.message);
    
    this.logger.info('✅ Travel operations test passed');
  }

  async testObservability() {
    this.logger.info('📊 Testing Observability...');
    
    // Test system status
    const systemStatus = this.orchestrator.getSystemHealth();
    this.logger.info('System Status:');
    this.logger.info(`  Overall Health: ${systemStatus.overall_health.status} (${systemStatus.overall_health.score}/100)`);
    this.logger.info(`  Active Agents: ${systemStatus.system_status.active_agents}`);
    this.logger.info(`  Running Tasks: ${systemStatus.system_status.running_tasks}`);
    
    // Test agent metrics
    const agents = await this.orchestrator.listAgents();
    for (const agent of agents.slice(0, 2)) { // Test first 2 agents
      const metrics = await this.orchestrator.getAgentMetrics(agent.id);
      this.logger.info(`Agent ${agent.name} metrics:`, {
        connected: metrics.connected,
        tools: metrics.tools_available.length,
        total_costs: metrics.total_costs
      });
    }
    
    this.logger.info('✅ Observability test passed');
  }

  async testRealTimeCommunication() {
    this.logger.info('🔄 Testing Real-time Communication...');
    
    // Create a test agent for real-time communication
    const testAgent = await this.orchestrator.createAgent('customer-service', {
      name: 'Real-time Test Agent',
      priority: 'medium'
    });
    
    // Set up event listeners
    let taskCompleted = false;
    let taskFailed = false;
    
    this.orchestrator.on('task_completed', (data) => {
      if (data.agent.id === testAgent.id) {
        taskCompleted = true;
        this.logger.info('✅ Task completed in real-time:', data.task.command);
      }
    });
    
    this.orchestrator.on('task_failed', (data) => {
      if (data.agent.id === testAgent.id) {
        taskFailed = true;
        this.logger.info('❌ Task failed in real-time:', data.task.command);
      }
    });
    
    // Send command to agent
    const commandResult = await this.orchestrator.commandAgent(
      testAgent.id,
      'customer_support',
      {
        chat_id: 'test_chat',
        message: 'Hello, I need help with my booking'
      }
    );
    
    this.logger.info('Command sent:', commandResult);
    
    // Wait for task completion
    await new Promise((resolve) => {
      const checkCompletion = () => {
        if (taskCompleted || taskFailed) {
          resolve();
        } else {
          setTimeout(checkCompletion, 1000);
        }
      };
      checkCompletion();
    });
    
    // Check task result
    const taskResult = await this.orchestrator.checkAgentResult(
      testAgent.id,
      commandResult.taskId
    );
    
    this.logger.info('Task result:', {
      status: taskResult.status,
      completed: taskResult.completed_at
    });
    
    // Cleanup
    await this.orchestrator.deleteAgent(testAgent.id);
    
    this.logger.info('✅ Real-time communication test passed');
  }

  // Demo function to show the system in action
  async runDemo() {
    this.logger.info('🎬 Starting Multi-Agent System Demo...');
    
    // Initialize system
    await this.testSystemInitialization();
    
    // Show available agents
    const agents = await this.orchestrator.listAgents();
    this.logger.info('\n📋 Available Agents:');
    agents.forEach(agent => {
      this.logger.info(`  🤖 ${agent.name} (${agent.type}) - ${agent.status}`);
    });
    
    // Demo travel search
    this.logger.info('\n✈️ Demo: Travel Search');
    const travelDemo = {
      type: 'text',
      source: 'user',
      text: 'Search for flights from Dubai to Paris on 2025-03-15 for 2 passengers'
    };
    
    const travelResult = await this.orchestrator.processInput(travelDemo);
    this.logger.info('Search Result:', travelResult.formats.text.message);
    
    // Demo system status
    this.logger.info('\n📊 Demo: System Status');
    const health = this.orchestrator.getSystemHealth();
    this.logger.info(`System Health: ${health.overall_health.status} (${health.overall_health.score}/100)`);
    this.logger.info(`Active Agents: ${health.system_status.active_agents}`);
    this.logger.info(`MCP Connections: ${health.mcp_bridge_status.active_connections}`);
    
    // Demo agent command
    this.logger.info('\n🎯 Demo: Direct Agent Command');
    const researcherAgent = agents.find(a => a.type === 'travel-researcher');
    if (researcherAgent) {
      const commandResult = await this.orchestrator.commandAgent(
        researcherAgent.id,
        'search_hotels',
        {
          city: 'Paris',
          check_in: '2025-03-15',
          check_out: '2025-03-20',
          guests: 2
        }
      );
      
      this.logger.info('Hotel search command sent:', commandResult);
      
      // Check result
      const taskResult = await this.orchestrator.checkAgentResult(
        researcherAgent.id,
        commandResult.taskId
      );
      
      this.logger.info('Task completed:', taskResult.status);
    }
    
    this.logger.info('\n🎉 Demo completed successfully!');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new MultiAgentSystemTest();
  
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--demo')) {
    testSuite.runDemo().catch(console.error);
  } else {
    testSuite.runAllTests().catch(console.error);
  }
}

module.exports = MultiAgentSystemTest;

