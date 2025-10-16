#!/usr/bin/env node

/**
 * AIX Deployment Verification Script
 * Verifies all components are working in production environment
 * Provides comprehensive health checks and validation
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

// Verification results
const results = {
  server: false,
  aixManager: false,
  agents: false,
  webhookHealth: false,
  agentOrchestration: false,
  environment: false,
  overall: false
};

/**
 * Verify server is running
 */
async function verifyServer() {
  logger.info('🖥️ Verifying server status...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`, { timeout: 5000 });
    const data = await response.json();
    
    if (response.ok) {
      logger.info('✅ Server is running', { 
        status: data.status,
        uptime: data.uptime,
        memory: data.memory 
      });
      results.server = true;
      return true;
    } else {
      logger.error('❌ Server health check failed', data);
      return false;
    }
  } catch (error) {
    logger.error('❌ Server connection failed', { error: error.message });
    return false;
  }
}

/**
 * Verify AIX Manager initialization
 */
async function verifyAIXManager() {
  logger.info('🧠 Verifying AIX Manager initialization...');
  
  try {
    const response = await fetch(`${WEBHOOK_URL}/health`, { timeout: 5000 });
    const data = await response.json();
    
    if (response.ok && data.aixManager) {
      logger.info('✅ AIX Manager is initialized', { 
        status: data.status,
        agents: data.agents 
      });
      results.aixManager = true;
      return true;
    } else {
      logger.error('❌ AIX Manager not available', data);
      return false;
    }
  } catch (error) {
    logger.error('❌ AIX Manager verification failed', { error: error.message });
    return false;
  }
}

/**
 * Verify agent availability
 */
async function verifyAgents() {
  logger.info('🤖 Verifying agent availability...');
  
  try {
    const response = await fetch(`${WEBHOOK_URL}/agents`, { timeout: 5000 });
    const data = await response.json();
    
    if (response.ok && data.agents && data.agents.length > 0) {
      logger.info('✅ Agents are available', { 
        total: data.total,
        agents: data.agents.map(a => a.name)
      });
      results.agents = true;
      return true;
    } else {
      logger.error('❌ No agents available', data);
      return false;
    }
  } catch (error) {
    logger.error('❌ Agent verification failed', { error: error.message });
    return false;
  }
}

/**
 * Verify webhook endpoints
 */
async function verifyWebhookEndpoints() {
  logger.info('🔗 Verifying webhook endpoints...');
  
  try {
    const response = await fetch(`${WEBHOOK_URL}/health`, { timeout: 5000 });
    const data = await response.json();
    
    if (response.ok) {
      logger.info('✅ Webhook endpoints are accessible', { 
        status: data.status 
      });
      results.webhookHealth = true;
      return true;
    } else {
      logger.error('❌ Webhook endpoints not accessible', data);
      return false;
    }
  } catch (error) {
    logger.error('❌ Webhook endpoint verification failed', { error: error.message });
    return false;
  }
}

/**
 * Test agent orchestration with sample tasks
 */
async function verifyAgentOrchestration() {
  logger.info('🎯 Verifying agent orchestration...');
  
  const testTasks = [
    {
      name: 'Travel Planning Task',
      message: 'Plan a 3-day trip to New York with $1000 budget',
      expectedCapabilities: ['itinerary_design', 'budget_analysis']
    },
    {
      name: 'Research Task',
      message: 'Find the best restaurants in Tokyo',
      expectedCapabilities: ['destination_research']
    },
    {
      name: 'Data Analysis Task',
      message: 'Analyze travel trends for summer destinations',
      expectedCapabilities: ['data_analysis']
    }
  ];

  let passedTasks = 0;
  
  for (const task of testTasks) {
    try {
      logger.info(`📝 Testing: ${task.name}`);
      
      const response = await fetch(`${WEBHOOK_URL}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: task.message,
          chatId: `verify_${Date.now()}`,
          userId: 'verify_user'
        }),
        timeout: 10000
      });

      const data = await response.json();
      
      if (response.ok) {
        logger.info('✅ Task completed successfully', {
          task: task.name,
          selectedAgent: data.selectedAgent,
          confidence: data.confidence,
          processingTime: data.processingTime,
          success: data.success
        });
        passedTasks++;
      } else {
        logger.error('❌ Task failed', {
          task: task.name,
          status: response.status,
          error: data.error || data.message || 'Unknown error'
        });
      }
    } catch (error) {
      logger.error('❌ Task verification failed', { 
        task: task.name, 
        error: error.message 
      });
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const successRate = passedTasks / testTasks.length;
  if (successRate >= 0.8) {
    logger.info('✅ Agent orchestration working', { 
      passed: passedTasks,
      total: testTasks.length,
      successRate: `${Math.round(successRate * 100)}%`
    });
    results.agentOrchestration = true;
    return true;
  } else {
    logger.error('❌ Agent orchestration failing', { 
      passed: passedTasks,
      total: testTasks.length,
      successRate: `${Math.round(successRate * 100)}%`
    });
    return false;
  }
}

/**
 * Verify environment configuration
 */
function verifyEnvironment() {
  logger.info('⚙️ Verifying environment configuration...');
  
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'TELEGRAM_BOT_TOKEN'
  ];
  
  const optionalEnvVars = [
    'AIX_FEEDBACK_ENABLED',
    'AIX_QUANTUM_ENABLED',
    'AIX_MEMORY_ENABLED',
    'AIX_MAX_CONCURRENT_TASKS',
    'AIX_TASK_TIMEOUT',
    'AIX_VERBOSE'
  ];
  
  let missingRequired = [];
  let missingOptional = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingRequired.push(envVar);
    }
  }
  
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      missingOptional.push(envVar);
    }
  }
  
  if (missingRequired.length === 0) {
    logger.info('✅ Required environment variables configured');
    if (missingOptional.length > 0) {
      logger.warn('⚠️ Optional environment variables missing', { 
        missing: missingOptional 
      });
    }
    results.environment = true;
    return true;
  } else {
    logger.error('❌ Required environment variables missing', { 
      missing: missingRequired 
    });
    return false;
  }
}

/**
 * Generate verification report
 */
function generateReport() {
  logger.info('📊 Generating verification report...');
  
  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(Boolean).length;
  const successRate = Math.round((passedChecks / totalChecks) * 100);
  
  results.overall = successRate >= 80;
  
  logger.info('\n📋 VERIFICATION REPORT');
  logger.info('========================');
  logger.info(`Server Status: ${results.server ? '✅ PASS' : '❌ FAIL'}`);
  logger.info(`AIX Manager: ${results.aixManager ? '✅ PASS' : '❌ FAIL'}`);
  logger.info(`Agent Availability: ${results.agents ? '✅ PASS' : '❌ FAIL'}`);
  logger.info(`Webhook Endpoints: ${results.webhookHealth ? '✅ PASS' : '❌ FAIL'}`);
  logger.info(`Agent Orchestration: ${results.agentOrchestration ? '✅ PASS' : '❌ FAIL'}`);
  logger.info(`Environment Config: ${results.environment ? '✅ PASS' : '❌ FAIL'}`);
  logger.info(`\n🎯 Overall Result: ${passedChecks}/${totalChecks} checks passed (${successRate}%)`);
  
  if (results.overall) {
    logger.info('🎉 DEPLOYMENT VERIFICATION SUCCESSFUL!');
    logger.info('✅ AIX Telegram Webhook Integration is ready for production');
  } else {
    logger.error('❌ DEPLOYMENT VERIFICATION FAILED');
    logger.error('🔧 Please address the failed checks before deploying to production');
  }
  
  return results;
}

/**
 * Main verification function
 */
async function runVerification() {
  logger.info('🚀 Starting AIX Deployment Verification');
  logger.info('==========================================');
  
  try {
    // Run all verification checks
    await verifyServer();
    await verifyAIXManager();
    await verifyAgents();
    await verifyWebhookEndpoints();
    await verifyAgentOrchestration();
    verifyEnvironment();
    
    // Generate final report
    const finalResults = generateReport();
    
    // Exit with appropriate code
    process.exit(finalResults.overall ? 0 : 1);
    
  } catch (error) {
    logger.error('❌ Verification process failed:', error);
    process.exit(1);
  }
}

// Run verification if this file is executed directly
if (require.main === module) {
  runVerification();
}

module.exports = {
  verifyServer,
  verifyAIXManager,
  verifyAgents,
  verifyWebhookEndpoints,
  verifyAgentOrchestration,
  verifyEnvironment,
  runVerification
};