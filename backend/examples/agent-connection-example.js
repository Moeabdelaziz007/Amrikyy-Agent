/**
 * AIX Agent Connection Example
 * Created by Cursor - Team Lead
 * 
 * Example showing how to connect AI agents using the unified connection system
 */

const AIXConnectionManager = require('../src/aix/AIXConnectionManager');
const { logger } = require('../src/utils/logger');

// Create logger for example
const log = logger.child('AgentConnectionExample');

/**
 * Example AI Agent
 */
class ExampleAgent {
  constructor(name, capabilities = []) {
    this.name = name;
    this.capabilities = capabilities;
    this.messageCount = 0;
  }

  /**
   * Process AIX3 message
   * @param {Object} message - AIX3 message
   */
  async processAIX3Message(message) {
    this.messageCount++;
    log.info('AIX3 message received', { 
      agent: this.name, 
      messageId: message.id,
      from: message.from,
      content: message.message
    });
    
    // Process message based on content
    if (message.message.action === 'ping') {
      return this.handlePing(message);
    } else if (message.message.action === 'task') {
      return this.handleTask(message);
    }
  }

  /**
   * Process Quantum message
   * @param {Object} message - Quantum message
   */
  async processQuantumMessage(message) {
    this.messageCount++;
    log.info('Quantum message received', { 
      agent: this.name, 
      messageId: message.id,
      from: message.from,
      content: message.message
    });
    
    // Process quantum workflow
    return this.handleQuantumWorkflow(message);
  }

  /**
   * Process Task message
   * @param {Object} message - Task message
   */
  async processTaskMessage(message) {
    this.messageCount++;
    log.info('Task message received', { 
      agent: this.name, 
      messageId: message.id,
      from: message.from,
      content: message.message
    });
    
    // Process task
    return this.handleTask(message);
  }

  /**
   * Handle ping message
   * @param {Object} message - Ping message
   */
  async handlePing(message) {
    log.info('Handling ping', { agent: this.name, from: message.from });
    
    // Simulate ping response
    return {
      type: 'pong',
      agent: this.name,
      timestamp: new Date().toISOString(),
      message: 'Pong from ' + this.name
    };
  }

  /**
   * Handle task message
   * @param {Object} message - Task message
   */
  async handleTask(message) {
    log.info('Handling task', { agent: this.name, from: message.from });
    
    // Simulate task processing
    return {
      type: 'task_response',
      agent: this.name,
      taskId: message.message.taskId,
      status: 'completed',
      result: 'Task completed by ' + this.name
    };
  }

  /**
   * Handle quantum workflow
   * @param {Object} message - Quantum message
   */
  async handleQuantumWorkflow(message) {
    log.info('Handling quantum workflow', { agent: this.name, from: message.from });
    
    // Simulate quantum processing
    return {
      type: 'quantum_response',
      agent: this.name,
      quantumState: 'activated',
      coherence: '95%',
      result: 'Quantum workflow processed by ' + this.name
    };
  }
}

/**
 * Main example function
 */
async function runExample() {
  log.info('Starting AIX Agent Connection Example');

  // Create connection manager
  const connectionManager = new AIXConnectionManager();
  
  // Start connection manager
  connectionManager.start();

  try {
    // Create example agents
    const ona = new ExampleAgent('ONA', ['documentation', 'testing']);
    const gemini = new ExampleAgent('Gemini 2.5', ['parsing', 'optimization']);
    const cursor = new ExampleAgent('Cursor', ['coordination', 'monitoring']);

    // Connect agents
    log.info('Connecting agents...');
    
    await connectionManager.connectAgent('ona', ona, {
      protocols: ['AIX3', 'MCP', 'PING'],
      capabilities: ['documentation', 'testing'],
      server: false
    });

    await connectionManager.connectAgent('gemini', gemini, {
      protocols: ['AIX3', 'MCP', 'PING'],
      capabilities: ['parsing', 'optimization'],
      server: true
    });

    await connectionManager.connectAgent('cursor', cursor, {
      protocols: ['AIX3', 'MCP', 'PING'],
      capabilities: ['coordination', 'monitoring'],
      server: false
    });

    // Get system status
    const systemStatus = connectionManager.getSystemStatus();
    log.info('System status', systemStatus);

    // Send messages between agents
    log.info('Sending messages...');

    // Send AIX3 message from Cursor to ONA
    await connectionManager.sendMessage('cursor', 'ona', {
      action: 'task',
      taskId: 'ONA-001',
      content: 'Start AIX Integration Documentation',
      priority: 'HIGH'
    }, 'AIX3');

    // Send AIX3 message from Cursor to Gemini
    await connectionManager.sendMessage('cursor', 'gemini', {
      action: 'task',
      taskId: 'GEMINI-001',
      content: 'Enhance AIX Parser Performance',
      priority: 'HIGH'
    }, 'AIX3');

    // Send Quantum message from Cursor to ONA
    await connectionManager.sendMessage('cursor', 'ona', {
      action: 'quantum_workflow',
      quantumState: 'activated',
      coherence: '95%',
      content: 'Activate quantum documentation workflow'
    }, 'AIX3');

    // Send Ping message from Cursor to Gemini
    await connectionManager.sendMessage('cursor', 'gemini', {
      action: 'ping',
      content: 'Status check',
      priority: 3
    }, 'PING');

    // Broadcast message to all agents
    await connectionManager.broadcastMessage('cursor', {
      action: 'team_update',
      content: 'Quantum workflow activated for all agents',
      priority: 'HIGH'
    }, 'AIX3');

    // Wait for messages to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get final status
    const finalStatus = connectionManager.getAllAgentsStatus();
    log.info('Final agent status', finalStatus);

    // Disconnect agents
    log.info('Disconnecting agents...');
    await connectionManager.disconnectAgent('ona');
    await connectionManager.disconnectAgent('gemini');
    await connectionManager.disconnectAgent('cursor');

    // Stop connection manager
    connectionManager.stop();

    log.info('AIX Agent Connection Example completed successfully');

  } catch (error) {
    log.error('Example failed', { error: error.message });
    throw error;
  }
}

// Run example if this file is executed directly
if (require.main === module) {
  runExample().catch(error => {
    console.error('Example failed:', error);
    process.exit(1);
  });
}

module.exports = {
  ExampleAgent,
  runExample
};