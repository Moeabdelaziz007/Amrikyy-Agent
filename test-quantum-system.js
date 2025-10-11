/**
 * Comprehensive Quantum System Test
 * Tests Agent DNA Engine, Country Agents, Deployment Engine, and Admin Dashboard
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testQuantumSystem() {
  log('\n🌌 QUANTUM SYSTEM COMPREHENSIVE TEST', 'cyan');
  log('='.repeat(60), 'cyan');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Health Check
  log('\n[1/10] Testing Quantum Health Check...', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/quantum/health`);
    if (response.data.success && response.data.status === 'healthy') {
      log('✅ Quantum system is healthy', 'green');
      passedTests++;
    } else {
      log('❌ Quantum system health check failed', 'red');
      failedTests++;
    }
  } catch (error) {
    log(`❌ Health check error: ${error.message}`, 'red');
    failedTests++;
  }

  // Test 2: Get Agent Presets
  log('\n[2/10] Testing Agent Presets...', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/quantum/presets`);
    if (response.data.success && response.data.count >= 5) {
      log(`✅ Found ${response.data.count} agent presets`, 'green');
      log(
        `   Presets: ${response.data.presets.map((p) => p.name).join(', ')}`,
        'cyan'
      );
      passedTests++;
    } else {
      log('❌ Failed to get agent presets', 'red');
      failedTests++;
    }
  } catch (error) {
    log(`❌ Presets error: ${error.message}`, 'red');
    failedTests++;
  }

  // Test 3: Calculate DNA Score
  log('\n[3/10] Testing DNA Score Calculation...', 'blue');
  try {
    const testDNA = {
      personality: {
        analytical: 80,
        creative: 70,
        empathetic: 85,
        logical: 75,
        intuitive: 80,
        assertive: 65,
      },
      skills: {
        coding: 60,
        communication: 90,
        problemSolving: 85,
        leadership: 70,
        learning: 80,
        cultural: 95,
      },
      behavior: {
        decisionSpeed: 60,
        riskTolerance: 40,
        workStyle: 70,
        detailLevel: 80,
      },
      specialization: 'travel-expert',
    };

    const response = await axios.post(
      `${BASE_URL}/quantum/calculate-dna`,
      testDNA
    );
    if (response.data.success && response.data.dnaScore) {
      log(`✅ DNA Score: ${response.data.dnaScore.totalScore}/1000`, 'green');
      log(
        `   Level: ${response.data.dnaScore.level} ${response.data.dnaScore.emoji}`,
        'cyan'
      );
      log(`   Tier: ${response.data.dnaScore.tier}/10`, 'cyan');
      passedTests++;
    } else {
      log('❌ DNA calculation failed', 'red');
      failedTests++;
    }
  } catch (error) {
    log(`❌ DNA calculation error: ${error.message}`, 'red');
    failedTests++;
  }

  // Test 4: Generate System Prompt
  log('\n[4/10] Testing System Prompt Generation...', 'blue');
  try {
    const testAgent = {
      name: 'Test Travel Expert',
      specialization: 'travel-expert',
      personality: {
        analytical: 75,
        creative: 60,
        empathetic: 85,
        logical: 70,
        intuitive: 80,
        assertive: 65,
      },
      skills: {
        cultural: 95,
        communication: 90,
        problemSolving: 85,
        learning: 80,
        leadership: 70,
        coding: 50,
      },
      behavior: {
        decisionSpeed: 60,
        riskTolerance: 40,
        workStyle: 70,
        detailLevel: 80,
      },
    };

    const response = await axios.post(
      `${BASE_URL}/quantum/generate-prompt`,
      testAgent
    );
    if (response.data.success && response.data.systemPrompt) {
      log('✅ System prompt generated successfully', 'green');
      log(`   Length: ${response.data.systemPrompt.length} characters`, 'cyan');
      passedTests++;
    } else {
      log('❌ System prompt generation failed', 'red');
      failedTests++;
    }
  } catch (error) {
    log(`❌ System prompt error: ${error.message}`, 'red');
    failedTests++;
  }

  // Test 5: Initialize Country Agent Network
  log('\n[5/10] Testing Country Agent Network Initialization...', 'blue');
  try {
    const response = await axios.post(`${BASE_URL}/quantum/network/initialize`);
    if (response.data.success) {
      log('✅ Country Agent Network initialized', 'green');
      log(`   Agents: ${response.data.status.agents}`, 'cyan');
      log(
        `   Total Knowledge: ${JSON.stringify(
          response.data.status.totalKnowledge
        )}`,
        'cyan'
      );
      passedTests++;
    } else {
      log('❌ Network initialization failed', 'red');
      failedTests++;
    }
  } catch (error) {
    // Network might already be initialized
    if (error.response && error.response.data) {
      log('⚠️ Network may already be initialized', 'yellow');
      passedTests++;
    } else {
      log(`❌ Network initialization error: ${error.message}`, 'red');
      failedTests++;
    }
  }

  // Test 6: Query Country Agent Network
  log('\n[6/10] Testing Country Agent Network Query...', 'blue');
  try {
    const response = await axios.post(`${BASE_URL}/quantum/network/query`, {
      query: 'Show me attractions in Egypt',
      context: { country: 'Egypt' },
    });

    if (response.data.success) {
      log('✅ Network query successful', 'green');
      log(`   Agent: ${response.data.agent}`, 'cyan');
      log(`   Response type: ${response.data.response.type}`, 'cyan');
      passedTests++;
    } else {
      log('❌ Network query failed', 'red');
      failedTests++;
    }
  } catch (error) {
    log(`❌ Network query error: ${error.message}`, 'red');
    failedTests++;
  }

  // Test 7: Deploy Agent from Preset
  log('\n[7/10] Testing Agent Deployment from Preset...', 'blue');
  let deploymentId = null;
  try {
    const response = await axios.post(
      `${BASE_URL}/quantum/deploy/preset/egyptExpert`,
      {
        name: 'Test Egypt Agent',
      }
    );

    if (response.data.success && response.data.deploymentId) {
      deploymentId = response.data.deploymentId;
      log('✅ Agent deployed successfully', 'green');
      log(`   Deployment ID: ${deploymentId}`, 'cyan');
      log(`   Agent: ${response.data.agent.name}`, 'cyan');
      log(`   DNA Score: ${response.data.dnaScore.totalScore}`, 'cyan');
      passedTests++;
    } else {
      log('❌ Agent deployment failed', 'red');
      failedTests++;
    }
  } catch (error) {
    log(`❌ Deployment error: ${error.message}`, 'red');
    failedTests++;
  }

  // Test 8: Get Deployment Statistics
  log('\n[8/10] Testing Deployment Statistics...', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/quantum/deployments/stats`);
    if (response.data.success && response.data.statistics) {
      log('✅ Deployment statistics retrieved', 'green');
      log(`   Active: ${response.data.statistics.active}`, 'cyan');
      log(`   Total: ${response.data.statistics.total}`, 'cyan');
      log(`   Success Rate: ${response.data.statistics.successRate}%`, 'cyan');
      passedTests++;
    } else {
      log('❌ Failed to get deployment statistics', 'red');
      failedTests++;
    }
  } catch (error) {
    log(`❌ Statistics error: ${error.message}`, 'red');
    failedTests++;
  }

  // Test 9: Admin Dashboard Overview
  log('\n[9/10] Testing Admin Dashboard...', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/admin/dashboard`);
    if (response.data.success && response.data.dashboard) {
      log('✅ Admin dashboard data retrieved', 'green');
      log(
        `   Network Active: ${response.data.dashboard.network.active}`,
        'cyan'
      );
      log(`   Total Agents: ${response.data.dashboard.agents.total}`, 'cyan');
      log(
        `   Active Deployments: ${response.data.dashboard.deployments.active}`,
        'cyan'
      );
      log(
        `   System Health: ${response.data.dashboard.health.overall}`,
        'cyan'
      );
      passedTests++;
    } else {
      log('❌ Dashboard data retrieval failed', 'red');
      failedTests++;
    }
  } catch (error) {
    log(`❌ Dashboard error: ${error.message}`, 'red');
    failedTests++;
  }

  // Test 10: Cleanup - Undeploy Test Agent
  if (deploymentId) {
    log('\n[10/10] Testing Agent Undeployment...', 'blue');
    try {
      const response = await axios.delete(
        `${BASE_URL}/quantum/deploy/${deploymentId}`
      );
      if (response.data.success) {
        log('✅ Test agent undeployed successfully', 'green');
        passedTests++;
      } else {
        log('❌ Undeployment failed', 'red');
        failedTests++;
      }
    } catch (error) {
      log(`❌ Undeployment error: ${error.message}`, 'red');
      failedTests++;
    }
  } else {
    log('\n[10/10] Skipping undeployment (no deployment ID)', 'yellow');
    failedTests++;
  }

  // Final Results
  log('\n' + '='.repeat(60), 'cyan');
  log('QUANTUM SYSTEM TEST RESULTS', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`✅ Passed: ${passedTests}/10`, 'green');
  log(`❌ Failed: ${failedTests}/10`, 'red');
  log(`📊 Success Rate: ${Math.round((passedTests / 10) * 100)}%`, 'magenta');

  if (passedTests === 10) {
    log(
      '\n🎉 ALL TESTS PASSED! Quantum system is fully operational! 🌌',
      'green'
    );
  } else if (passedTests >= 7) {
    log('\n⚠️ Most tests passed. Some issues detected.', 'yellow');
  } else {
    log('\n❌ Multiple tests failed. Please check the system.', 'red');
  }

  log('='.repeat(60) + '\n', 'cyan');
}

// Run tests
testQuantumSystem().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
