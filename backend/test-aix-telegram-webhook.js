#!/usr/bin/env node

/**
 * AIX Telegram Webhook Test Suite
 * Tests the webhook integration with sample messages
 */

const fetch = require('node-fetch');
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

const BASE_URL = process.env.SERVER_URL || 'http://localhost:5000';
const WEBHOOK_URL = `${BASE_URL}/api/telegram/aix`;

// Test messages
const testMessages = [
  {
    name: "Basic Travel Request",
    message: "I want to plan a 5-day trip to Tokyo with a budget of $2000",
    expectedAgent: "luna-trip-architect-v1"
  },
  {
    name: "Budget Analysis Request", 
    message: "Can you help me find the cheapest flights to Paris for next month?",
    expectedAgent: "karim-budget-optimizer-v1"
  },
  {
    name: "Research Request",
    message: "What are the best restaurants in Rome? I need verified recommendations.",
    expectedAgent: "zara-research-specialist-v1"
  },
  {
    name: "Content Creation Request",
    message: "Create a social media post about my amazing trip to Bali",
    expectedAgent: "leo-growth-strategist-v1"
  },
  {
    name: "Data Analysis Request",
    message: "Analyze the travel trends data and create a visualization",
    expectedAgent: "kody-code-interpreter-v1"
  },
  {
    name: "Proactive Offer Request",
    message: "I'm interested in beach destinations. Can you monitor prices for me?",
    expectedAgent: "scout-proactive-scout-v1"
  }
];

/**
 * Test webhook health
 */
async function testHealth() {
  logger.info('🏥 Testing webhook health...');
  
  try {
    const response = await fetch(`${WEBHOOK_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      logger.info('✅ Health check passed', data);
      return true;
    } else {
      logger.error('❌ Health check failed', data);
      return false;
    }
  } catch (error) {
    logger.error('❌ Health check error:', error.message);
    return false;
  }
}

/**
 * Test agent status
 */
async function testAgentStatus() {
  logger.info('🤖 Testing agent status...');
  
  try {
    const response = await fetch(`${WEBHOOK_URL}/agents`);
    const data = await response.json();
    
    if (response.ok) {
      logger.info('✅ Agent status retrieved', { 
        agentCount: data.total,
        agents: data.agents.map(a => a.name)
      });
      return data.agents.length > 0;
    } else {
      logger.error('❌ Agent status failed', data);
      return false;
    }
  } catch (error) {
    logger.error('❌ Agent status error:', error.message);
    return false;
  }
}

/**
 * Test individual message
 */
async function testMessage(testCase) {
  logger.info(`📝 Testing: ${testCase.name}`);
  
  try {
    const response = await fetch(`${WEBHOOK_URL}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testCase.message,
        chatId: `test_${Date.now()}`,
        userId: 'test_user'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      logger.info('✅ Message test passed', {
        test: testCase.name,
        selectedAgent: data.selectedAgent,
        confidence: data.confidence,
        processingTime: data.processingTime
      });
      
      // Check if expected agent was selected
      if (testCase.expectedAgent && data.selectedAgent !== testCase.expectedAgent) {
        logger.warn('⚠️ Unexpected agent selected', {
          expected: testCase.expectedAgent,
          actual: data.selectedAgent
        });
      }
      
      return true;
    } else {
      logger.error('❌ Message test failed', { test: testCase.name, error: data.error });
      return false;
    }
  } catch (error) {
    logger.error('❌ Message test error:', { test: testCase.name, error: error.message });
    return false;
  }
}

/**
 * Test webhook endpoint
 */
async function testWebhook() {
  logger.info('🔗 Testing webhook endpoint...');
  
  try {
    const webhookData = {
      message: {
        message_id: 12345,
        from: {
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
          language_code: 'en'
        },
        chat: {
          id: 123456789,
          type: 'private'
        },
        date: Math.floor(Date.now() / 1000),
        text: 'Plan a trip to Dubai for 3 days'
      }
    };

    const response = await fetch(`${WEBHOOK_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    const data = await response.json();
    
    if (response.ok) {
      logger.info('✅ Webhook test passed', {
        selectedAgent: data.selectedAgent,
        confidence: data.confidence,
        processingTime: data.processingTime
      });
      return true;
    } else {
      logger.error('❌ Webhook test failed', data);
      return false;
    }
  } catch (error) {
    logger.error('❌ Webhook test error:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  logger.info('🚀 Starting AIX Telegram Webhook Test Suite');
  logger.info('==========================================');
  
  const results = {
    health: false,
    agents: false,
    webhook: false,
    messages: []
  };

  // Test 1: Health Check
  results.health = await testHealth();
  
  // Test 2: Agent Status
  results.agents = await testAgentStatus();
  
  // Test 3: Webhook Endpoint
  results.webhook = await testWebhook();
  
  // Test 4: Individual Messages
  logger.info('📝 Testing individual messages...');
  for (const testCase of testMessages) {
    const success = await testMessage(testCase);
    results.messages.push({
      name: testCase.name,
      success
    });
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  logger.info('📊 Test Results Summary');
  logger.info('======================');
  logger.info(`Health Check: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  logger.info(`Agent Status: ${results.agents ? '✅ PASS' : '❌ FAIL'}`);
  logger.info(`Webhook Test: ${results.webhook ? '✅ PASS' : '❌ FAIL'}`);
  
  const messageResults = results.messages.map(m => `${m.name}: ${m.success ? '✅ PASS' : '❌ FAIL'}`);
  logger.info('Message Tests:');
  messageResults.forEach(result => logger.info(`  ${result}`));
  
  const totalTests = 3 + testMessages.length;
  const passedTests = (results.health ? 1 : 0) + (results.agents ? 1 : 0) + (results.webhook ? 1 : 0) + 
                     results.messages.filter(m => m.success).length;
  
  logger.info(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    logger.info('🎉 All tests passed! AIX Telegram integration is working perfectly!');
  } else {
    logger.warn('⚠️ Some tests failed. Check the logs above for details.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      logger.info('✅ Test suite completed');
      process.exit(0);
    })
    .catch(error => {
      logger.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testHealth,
  testAgentStatus,
  testMessage,
  testWebhook,
  runAllTests
};
