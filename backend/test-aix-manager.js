#!/usr/bin/env node

/**
 * AIX Enhanced Cursor Manager Initialization Test Suite
 * Tests the complete initialization process and agent loading
 */

const path = require('path');
const fs = require('fs');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()]
});

// Test configuration
const TEST_CONFIG = {
  aixDirectory: path.join(__dirname, 'agents/aix'),
  feedbackEnabled: false, // Disable for testing
  quantumEnabled: false,  // Disable for testing
  memoryEnabled: true,    // Keep memory for testing
  maxConcurrentTasks: 5,
  taskTimeout: 15000,
  verbose: true
};

/**
 * Test 1: Verify AIX Directory Structure
 */
async function testAIXDirectoryStructure() {
  logger.info('📁 Test 1: Verifying AIX Directory Structure');
  
  try {
    // Check if AIX directory exists
    if (!fs.existsSync(TEST_CONFIG.aixDirectory)) {
      throw new Error(`AIX directory not found: ${TEST_CONFIG.aixDirectory}`);
    }
    
    // List all AIX files
    const aixFiles = fs.readdirSync(TEST_CONFIG.aixDirectory)
      .filter(file => file.endsWith('.aix'));
    
    logger.info(`✅ Found ${aixFiles.length} AIX files:`, aixFiles);
    
    // Verify expected agents
    const expectedAgents = [
      'luna-v1.aix',
      'karim-v1.aix', 
      'zara-v1.aix',
      'leo-v1.aix',
      'kody-v1.aix',
      'scout-v1.aix'
    ];
    
    const missingAgents = expectedAgents.filter(agent => !aixFiles.includes(agent));
    
    if (missingAgents.length > 0) {
      logger.warn('⚠️ Missing AIX agents:', missingAgents);
    } else {
      logger.info('✅ All expected AIX agents found');
    }
    
    return {
      success: true,
      totalFiles: aixFiles.length,
      files: aixFiles,
      missingAgents
    };
    
  } catch (error) {
    logger.error('❌ AIX Directory Structure Test Failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test 2: Validate AIX File Format
 */
async function testAIXFileFormat() {
  logger.info('📋 Test 2: Validating AIX File Format');
  
  try {
    const aixFiles = fs.readdirSync(TEST_CONFIG.aixDirectory)
      .filter(file => file.endsWith('.aix'));
    
    const validationResults = [];
    
    for (const file of aixFiles) {
      const filePath = path.join(TEST_CONFIG.aixDirectory, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const validation = {
        file,
        valid: true,
        errors: []
      };
      
      // Check for required sections
      const requiredSections = ['meta:', 'persona:', 'capabilities:', 'tools:', 'memory:', 'security:'];
      
      for (const section of requiredSections) {
        if (!content.includes(section)) {
          validation.valid = false;
          validation.errors.push(`Missing required section: ${section}`);
        }
      }
      
      // Check for meta fields
      const requiredMetaFields = ['id:', 'name:', 'version:', 'description:'];
      
      for (const field of requiredMetaFields) {
        if (!content.includes(field)) {
          validation.valid = false;
          validation.errors.push(`Missing meta field: ${field}`);
        }
      }
      
      validationResults.push(validation);
      
      if (validation.valid) {
        logger.info(`✅ ${file}: Valid AIX format`);
      } else {
        logger.warn(`⚠️ ${file}: Invalid AIX format - ${validation.errors.join(', ')}`);
      }
    }
    
    const validFiles = validationResults.filter(r => r.valid).length;
    const totalFiles = validationResults.length;
    
    logger.info(`📊 Validation Results: ${validFiles}/${totalFiles} files valid`);
    
    return {
      success: validFiles === totalFiles,
      totalFiles,
      validFiles,
      results: validationResults
    };
    
  } catch (error) {
    logger.error('❌ AIX File Format Test Failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test 3: Initialize AIX Enhanced Cursor Manager
 */
async function testAIXManagerInitialization() {
  logger.info('🚀 Test 3: Initializing AIX Enhanced Cursor Manager');
  
  let manager;
  
  try {
    // Import AIX Enhanced Cursor Manager
    const AIXEnhancedCursorManager = require('./src/agents/AIXEnhancedCursorManager');
    
    // Create manager instance
    manager = new AIXEnhancedCursorManager(TEST_CONFIG);
    
    logger.info('📝 Manager created, initializing...');
    
    // Initialize manager
    const startTime = Date.now();
    await manager.initialize();
    const initTime = Date.now() - startTime;
    
    logger.info(`✅ Manager initialized successfully in ${initTime}ms`);
    
    // Get available agents
    const agents = manager.getAvailableAgents();
    logger.info(`🤖 Loaded ${agents.length} agents:`, agents.map(a => a.name));
    
    // Test manager methods
    const healthStatus = manager.getHealthStatus();
    logger.info('🏥 Health Status:', healthStatus);
    
    return {
      success: true,
      initTime,
      agentCount: agents.length,
      agents: agents.map(a => ({
        id: a.id,
        name: a.name,
        capabilities: a.capabilities.length,
        tools: a.tools.length
      })),
      healthStatus
    };
    
  } catch (error) {
    logger.error('❌ AIX Manager Initialization Test Failed:', error.message);
    logger.error('Stack trace:', error.stack);
    
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  } finally {
    // Cleanup
    if (manager) {
      try {
        await manager.shutdown();
        logger.info('🛑 Manager shutdown completed');
      } catch (shutdownError) {
        logger.error('❌ Shutdown error:', shutdownError.message);
      }
    }
  }
}

/**
 * Test 4: Test Agent Capabilities
 */
async function testAgentCapabilities() {
  logger.info('🧠 Test 4: Testing Agent Capabilities');
  
  let manager;
  
  try {
    const AIXEnhancedCursorManager = require('./src/agents/AIXEnhancedCursorManager');
    manager = new AIXEnhancedCursorManager(TEST_CONFIG);
    await manager.initialize();
    
    const agents = manager.getAvailableAgents();
    const capabilityTests = [];
    
    for (const agent of agents) {
      logger.info(`🔍 Testing capabilities for ${agent.name}...`);
      
      const test = {
        agent: agent.name,
        id: agent.id,
        capabilities: agent.capabilities,
        tools: agent.tools,
        tests: []
      };
      
      // Test capability mapping
      for (const capability of agent.capabilities) {
        const agentsWithCapability = manager.getAgentsByCapability(capability);
        test.tests.push({
          capability,
          agentsFound: agentsWithCapability.length,
          success: agentsWithCapability.some(a => a.id === agent.id)
        });
      }
      
      capabilityTests.push(test);
      
      logger.info(`✅ ${agent.name}: ${agent.capabilities.length} capabilities, ${agent.tools.length} tools`);
    }
    
    return {
      success: true,
      agentTests: capabilityTests
    };
    
  } catch (error) {
    logger.error('❌ Agent Capabilities Test Failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (manager) {
      await manager.shutdown();
    }
  }
}

/**
 * Test 5: Test Task Orchestration
 */
async function testTaskOrchestration() {
  logger.info('🎯 Test 5: Testing Task Orchestration');
  
  let manager;
  
  try {
    const AIXEnhancedCursorManager = require('./src/agents/AIXEnhancedCursorManager');
    manager = new AIXEnhancedCursorManager(TEST_CONFIG);
    await manager.initialize();
    
    const testTasks = [
      {
        name: 'Travel Planning Task',
        description: 'Plan a 3-day trip to Tokyo with a budget of $2000',
        expectedAgent: 'luna-trip-architect-v1'
      },
      {
        name: 'Budget Analysis Task',
        description: 'Find the cheapest flights to Paris for next month',
        expectedAgent: 'karim-budget-optimizer-v1'
      },
      {
        name: 'Research Task',
        description: 'What are the best restaurants in Rome?',
        expectedAgent: 'zara-research-specialist-v1'
      }
    ];
    
    const orchestrationResults = [];
    
    for (const testTask of testTasks) {
      logger.info(`🎯 Testing: ${testTask.name}`);
      
      const task = {
        description: testTask.description,
        parameters: {
          budget: 2000,
          destination: 'Tokyo',
          duration: 3
        },
        context: {
          source: 'test',
          priority: 'normal',
          sessionId: `test_${Date.now()}`
        }
      };
      
      const startTime = Date.now();
      const result = await manager.orchestrateTask(task);
      const processingTime = Date.now() - startTime;
      
      const orchestrationResult = {
        task: testTask.name,
        expectedAgent: testTask.expectedAgent,
        selectedAgent: result.analysis?.selectedAgent,
        confidence: result.analysis?.confidence,
        processingTime,
        success: result.analysis?.selectedAgent === testTask.expectedAgent,
        hasOutput: !!result.output
      };
      
      orchestrationResults.push(orchestrationResult);
      
      logger.info(`✅ ${testTask.name}: ${orchestrationResult.success ? 'PASS' : 'FAIL'} (${processingTime}ms)`);
    }
    
    const successfulTasks = orchestrationResults.filter(r => r.success).length;
    const totalTasks = orchestrationResults.length;
    
    logger.info(`📊 Orchestration Results: ${successfulTasks}/${totalTasks} tasks successful`);
    
    return {
      success: successfulTasks === totalTasks,
      totalTasks,
      successfulTasks,
      results: orchestrationResults
    };
    
  } catch (error) {
    logger.error('❌ Task Orchestration Test Failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (manager) {
      await manager.shutdown();
    }
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  logger.info('🚀 Starting AIX Enhanced Cursor Manager Initialization Test Suite');
  logger.info('================================================================');
  
  const results = {
    directoryStructure: null,
    fileFormat: null,
    initialization: null,
    capabilities: null,
    orchestration: null
  };
  
  // Test 1: Directory Structure
  results.directoryStructure = await testAIXDirectoryStructure();
  
  // Test 2: File Format
  results.fileFormat = await testAIXFileFormat();
  
  // Test 3: Manager Initialization
  results.initialization = await testAIXManagerInitialization();
  
  // Test 4: Agent Capabilities
  results.capabilities = await testAgentCapabilities();
  
  // Test 5: Task Orchestration
  results.orchestration = await testTaskOrchestration();
  
  // Summary
  logger.info('📊 Test Results Summary');
  logger.info('======================');
  
  const tests = [
    { name: 'Directory Structure', result: results.directoryStructure },
    { name: 'File Format', result: results.fileFormat },
    { name: 'Manager Initialization', result: results.initialization },
    { name: 'Agent Capabilities', result: results.capabilities },
    { name: 'Task Orchestration', result: results.orchestration }
  ];
  
  tests.forEach(test => {
    const status = test.result.success ? '✅ PASS' : '❌ FAIL';
    logger.info(`${test.name}: ${status}`);
  });
  
  const totalTests = tests.length;
  const passedTests = tests.filter(t => t.result.success).length;
  
  logger.info(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    logger.info('🎉 All tests passed! AIX Enhanced Cursor Manager is ready for production!');
  } else {
    logger.warn('⚠️ Some tests failed. Check the logs above for details.');
  }
  
  return results;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then((results) => {
      logger.info('✅ Test suite completed');
      
      // Exit with appropriate code
      const allPassed = Object.values(results).every(r => r && r.success);
      process.exit(allPassed ? 0 : 1);
    })
    .catch(error => {
      logger.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testAIXDirectoryStructure,
  testAIXFileFormat,
  testAIXManagerInitialization,
  testAgentCapabilities,
  testTaskOrchestration,
  runAllTests
};