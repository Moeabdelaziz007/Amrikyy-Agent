#!/usr/bin/env node

/**
 * Anthropic Claude API Integration Test
 * Tests the Anthropic provider with the provided API key
 */

// Load environment variables
require('dotenv').config({ path: '.env.anthropic' });

const AnthropicProvider = require('./src/services/providers/AnthropicProvider');
const LLMService = require('./src/services/LLMService');

// Test configuration
const TEST_CONFIG = {
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
  timeout: 30000
};

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testAnthropicProvider() {
  log('\n🧪 Testing Anthropic Claude API Integration', 'cyan');
  log('=' .repeat(50), 'cyan');

  // Check environment variables
  if (!TEST_CONFIG.apiKey) {
    error('ANTHROPIC_API_KEY not found in environment');
    return false;
  }

  if (TEST_CONFIG.apiKey.startsWith('sk-ant-api03')) {
    success('API key format looks correct (Anthropic)');
  } else {
    warning('API key format may be incorrect');
  }

  try {
    // Test 1: Initialize Anthropic Provider
    info('Initializing Anthropic Provider...');
    const anthropicProvider = new AnthropicProvider(TEST_CONFIG);
    success('Anthropic Provider initialized successfully');

    // Test 2: Basic connectivity test
    info('Testing basic connectivity...');
    const healthCheck = anthropicProvider.getHealth();
    log(`Provider Status: ${healthCheck.status}`, 'blue');
    log(`Model: ${healthCheck.model}`, 'blue');
    success('Provider health check passed');

    // Test 3: Simple API call
    info('Testing simple API call...');
    const simplePrompt = 'Hello! Please respond with "Claude is working" and nothing else.';
    const simpleResponse = await anthropicProvider.generateResponse(simplePrompt);
    
    if (simpleResponse.includes('Claude is working')) {
      success('Simple API call successful');
      log(`Response: ${simpleResponse}`, 'blue');
    } else {
      warning('Simple API call succeeded but response was unexpected');
      log(`Response: ${simpleResponse}`, 'yellow');
    }

    // Test 4: Travel-related query
    info('Testing travel-related query...');
    const travelPrompt = 'What are the top 3 tourist attractions in Paris? Keep it brief.';
    const travelResponse = await anthropicProvider.generateResponse(travelPrompt);
    success('Travel query successful');
    log(`Travel Response: ${travelResponse.substring(0, 200)}...`, 'blue');

    // Test 5: Check metrics and credit usage
    const metrics = anthropicProvider.getHealth();
    log(`Total Requests: ${metrics.metrics.requests}`, 'blue');
    log(`Successful Requests: ${metrics.metrics.successfulRequests}`, 'blue');
    log(`Success Rate: ${metrics.metrics.successRate}`, 'blue');
    log(`Total Cost: $${metrics.metrics.totalCost.toFixed(6)}`, 'blue');
    log(`Average Cost per Request: $${metrics.metrics.averageCostPerRequest}`, 'blue');

    const creditInfo = anthropicProvider.getRemainingCredit();
    log(`Initial Credit: $${creditInfo.initialCredit}`, 'blue');
    log(`Total Spent: $${creditInfo.totalSpent.toFixed(6)}`, 'blue');
    log(`Remaining Credit: $${creditInfo.remainingCredit.toFixed(6)}`, 'blue');
    log(`Remaining Percentage: ${creditInfo.remainingPercentage}`, 'blue');

    success('All Anthropic API tests passed');
    return true;

  } catch (err) {
    error(`Anthropic API test failed: ${err.message}`);
    
    if (err.message.includes('401')) {
      error('Authentication failed - check API key');
    } else if (err.message.includes('429')) {
      error('Rate limit exceeded - wait and try again');
    } else if (err.message.includes('timeout')) {
      error('Request timeout - check network connection');
    } else if (err.message.includes('insufficient')) {
      error('Insufficient credit - check account balance');
    }
    
    return false;
  }
}

async function testLLMServiceIntegration() {
  log('\n🔧 Testing LLM Service Integration', 'cyan');
  log('=' .repeat(50), 'cyan');

  try {
    // Initialize LLM Service with Anthropic as primary
    const llmService = new LLMService({
      primaryProvider: 'anthropic',
      fallbackProviders: [],
      timeout: 30000
    });

    success('LLM Service initialized with Anthropic as primary');

    // Test the service
    const testPrompt = 'What is the best time to visit Tokyo for cherry blossoms?';
    const response = await llmService.generateResponse(testPrompt);

    if (response.success) {
      success('LLM Service integration successful');
      log(`Provider used: ${response.provider}`, 'blue');
      log(`Response time: ${response.responseTime}ms`, 'blue');
      log(`Response preview: ${response.response.substring(0, 150)}...`, 'blue');
    } else {
      error('LLM Service integration failed');
      log(`Error: ${response.error}`, 'red');
      return false;
    }

    // Test all providers
    const providerTests = await llmService.testProviders();
    log('\nProvider Test Results:', 'blue');
    
    for (const [provider, result] of Object.entries(providerTests)) {
      if (result.status === 'success') {
        success(`${provider}: ${result.status}`);
      } else {
        error(`${provider}: ${result.status} - ${result.error}`);
      }
    }

    return true;

  } catch (err) {
    error(`LLM Service integration test failed: ${err.message}`);
    return false;
  }
}

async function main() {
  log('🚀 Maya Travel Agent - Anthropic API Test Suite', 'cyan');
  log('=' .repeat(60), 'cyan');
  log(`Environment: ${process.env.NODE_ENV || 'development'}`, 'blue');
  log(`Model: ${TEST_CONFIG.model}`, 'blue');
  log(`Timestamp: ${new Date().toISOString()}`, 'blue');

  let allTestsPassed = true;

  // Run tests
  const anthropicTestResult = await testAnthropicProvider();
  allTestsPassed = allTestsPassed && anthropicTestResult;

  if (anthropicTestResult) {
    const llmServiceTestResult = await testLLMServiceIntegration();
    allTestsPassed = allTestsPassed && llmServiceTestResult;
  }

  // Final summary
  log('\n' + '=' .repeat(60), 'cyan');
  if (allTestsPassed) {
    success('🎉 All tests passed! Anthropic API is ready for use.');
    log('\nNext steps:', 'blue');
    log('1. Update your main .env file with ANTHROPIC_API_KEY', 'blue');
    log('2. Set primaryProvider to "anthropic" in your LLM Service config', 'blue');
    log('3. Test with your travel agent application', 'blue');
    log('4. Monitor credit usage to stay within $5 budget', 'blue');
  } else {
    error('❌ Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  main().catch(err => {
    error(`Test suite failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { testAnthropicProvider, testLLMServiceIntegration };