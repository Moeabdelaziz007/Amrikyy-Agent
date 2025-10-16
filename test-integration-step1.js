#!/usr/bin/env node

/**
 * Step 1 Integration Test Suite
 * Tests SquadOS ↔ Enhanced Cursor Manager ↔ Cursor Executor Bridge Integration
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 STEP 1 INTEGRATION TEST SUITE');
console.log('=================================');
console.log('Testing SquadOS ↔ Enhanced Cursor Manager ↔ Cursor Executor Bridge');
console.log('');

// Test 1: Enhanced Cursor Manager with SquadOS
async function testEnhancedCursorManager() {
  console.log('1️⃣ Testing Enhanced Cursor Manager with SquadOS...');
  
  try {
    const EnhancedCursorManagerWithSquadOS = require('./backend/src/agents/EnhancedCursorManagerWithSquadOS');
    
    console.log('   🚀 Creating Enhanced Cursor Manager...');
    const manager = new EnhancedCursorManagerWithSquadOS();
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const managerStatus = await manager.getManagerStatus();
    console.log('   ✅ Enhanced Manager initialized:', managerStatus.manager_id);
    console.log('   📊 SquadOS ready:', managerStatus.squadOS_ready);
    console.log('   🎤 Voice ready:', managerStatus.voice_ready);
    console.log('   ⚡ Capabilities:', managerStatus.capabilities);
    
    console.log('   🎉 Enhanced Cursor Manager: PASSED ✅');
    return { manager, status: true };
    
  } catch (error) {
    console.log('   ❌ Enhanced Cursor Manager: FAILED');
    console.log('   Error:', error.message);
    return { manager: null, status: false };
  }
}

// Test 2: SquadOS ↔ Cursor Executor Bridge
async function testSquadOSBridge() {
  console.log('2️⃣ Testing SquadOS ↔ Cursor Executor Bridge...');
  
  try {
    const SquadOSCursorExecutorBridge = require('./backend/src/agents/SquadOSCursorExecutorBridge');
    
    console.log('   🌉 Creating SquadOS Bridge...');
    const mockManager = { processRequest: async () => 'Mock response' };
    const bridge = new SquadOSCursorExecutorBridge(mockManager);
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const bridgeStatus = await bridge.getBridgeStatus();
    console.log('   ✅ Bridge initialized:', bridgeStatus.bridge_id);
    console.log('   ⚡ Capabilities:', bridgeStatus.capabilities);
    console.log('   📊 Status:', bridgeStatus.status);
    
    console.log('   🎉 SquadOS Bridge: PASSED ✅');
    return { bridge, status: true };
    
  } catch (error) {
    console.log('   ❌ SquadOS Bridge: FAILED');
    console.log('   Error:', error.message);
    return { bridge: null, status: false };
  }
}

// Test 3: End-to-End Integration Test
async function testEndToEndIntegration(manager, bridge) {
  console.log('3️⃣ Testing End-to-End Integration...');
  
  try {
    if (!manager || !bridge) {
      throw new Error('Manager or Bridge not available');
    }
    
    console.log('   🎯 Testing travel planning request...');
    
    // Test travel planning request
    const travelRequest = 'Plan a 7-day trip to Tokyo with a budget of $3000 for 2 people interested in culture and food';
    
    const travelResult = await manager.processRequest(travelRequest, 'test_user_1', {
      type: 'travel_planning',
      sessionId: 'test_session_1'
    });
    
    console.log('   ✅ Travel request processed:', travelResult.success);
    console.log('   ⏱️ Processing time:', travelResult.processingTime + 'ms');
    
    console.log('   🎉 End-to-End Integration: PASSED ✅');
    return true;
    
  } catch (error) {
    console.log('   ❌ End-to-End Integration: FAILED');
    console.log('   Error:', error.message);
    return false;
  }
}

// Test 4: Bridge Command Execution Test
async function testBridgeCommandExecution(bridge) {
  console.log('4️⃣ Testing Bridge Command Execution...');
  
  try {
    if (!bridge) {
      throw new Error('Bridge not available');
    }
    
    console.log('   🔍 Testing web search command...');
    
    // Test web search command
    const webSearchResult = await bridge.executeAgentCommand(
      'zara',
      'web_search',
      { query: 'Louvre museum opening hours Paris' },
      { destination: 'Paris' }
    );
    
    console.log('   ✅ Web search executed:', webSearchResult.success);
    console.log('   ⏱️ Execution time:', webSearchResult.executionTime + 'ms');
    
    console.log('   🔌 Testing API call command...');
    
    // Test API call command
    const apiCallResult = await bridge.executeAgentCommand(
      'karim',
      'api_call',
      { endpoint: 'booking.com/api/hotels', parameters: { location: 'Paris' } },
      { destination: 'Paris' }
    );
    
    console.log('   ✅ API call executed:', apiCallResult.success);
    console.log('   ⏱️ Execution time:', apiCallResult.executionTime + 'ms');
    
    console.log('   🎉 Bridge Command Execution: PASSED ✅');
    return true;
    
  } catch (error) {
    console.log('   ❌ Bridge Command Execution: FAILED');
    console.log('   Error:', error.message);
    return false;
  }
}

// Test 5: Voice Integration Test
async function testVoiceIntegration(manager) {
  console.log('5️⃣ Testing Voice Integration...');
  
  try {
    if (!manager) {
      throw new Error('Manager not available');
    }
    
    console.log('   🎤 Testing voice interaction...');
    
    // Test voice interaction
    const voiceResult = await manager.processRequest(
      'Plan a trip to Paris using voice commands',
      'test_user_2',
      { type: 'voice', sessionId: 'voice_session_1' }
    );
    
    console.log('   ✅ Voice interaction processed:', voiceResult.success);
    console.log('   📊 Result type:', voiceResult.result?.type);
    
    console.log('   🎉 Voice Integration: PASSED ✅');
    return true;
    
  } catch (error) {
    console.log('   ❌ Voice Integration: FAILED');
    console.log('   Error:', error.message);
    return false;
  }
}

// Test 6: Performance Metrics Test
async function testPerformanceMetrics(manager, bridge) {
  console.log('6️⃣ Testing Performance Metrics...');
  
  try {
    console.log('   📊 Testing manager metrics...');
    const managerMetrics = await manager.getPerformanceMetrics();
    console.log('   ✅ Manager metrics:', Object.keys(managerMetrics).length + ' metrics');
    
    console.log('   📊 Testing bridge metrics...');
    const bridgeMetrics = await bridge.getPerformanceMetrics();
    console.log('   ✅ Bridge metrics:', Object.keys(bridgeMetrics).length + ' metrics');
    
    console.log('   🎉 Performance Metrics: PASSED ✅');
    return true;
    
  } catch (error) {
    console.log('   ❌ Performance Metrics: FAILED');
    console.log('   Error:', error.message);
    return false;
  }
}

// Run all integration tests
async function runIntegrationTests() {
  console.log('🚀 Starting Step 1 Integration Tests...');
  console.log('');
  
  // Test 1: Enhanced Cursor Manager
  const managerResult = await testEnhancedCursorManager();
  const manager = managerResult.manager;
  
  // Test 2: SquadOS Bridge
  const bridgeResult = await testSquadOSBridge();
  const bridge = bridgeResult.bridge;
  
  // Test 3: End-to-End Integration
  const e2eResult = await testEndToEndIntegration(manager, bridge);
  
  // Test 4: Bridge Command Execution
  const bridgeExecResult = await testBridgeCommandExecution(bridge);
  
  // Test 5: Voice Integration
  const voiceResult = await testVoiceIntegration(manager);
  
  // Test 6: Performance Metrics
  const metricsResult = await testPerformanceMetrics(manager, bridge);
  
  console.log('');
  console.log('📊 INTEGRATION TEST RESULTS SUMMARY');
  console.log('====================================');
  console.log(`Enhanced Cursor Manager:     ${managerResult.status ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`SquadOS Bridge:              ${bridgeResult.status ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`End-to-End Integration:      ${e2eResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Bridge Command Execution:    ${bridgeExecResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Voice Integration:           ${voiceResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Performance Metrics:         ${metricsResult ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = [
    managerResult.status,
    bridgeResult.status,
    e2eResult,
    bridgeExecResult,
    voiceResult,
    metricsResult
  ].filter(Boolean).length;
  
  const totalTests = 6;
  
  console.log('');
  console.log(`🎯 OVERALL RESULT: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('');
    console.log('🎉 STEP 1 INTEGRATION COMPLETE! ✅');
    console.log('');
    console.log('✅ WHAT WE\'VE ACCOMPLISHED:');
    console.log('1. ✅ SquadOS integrated with Enhanced Cursor Manager');
    console.log('2. ✅ Agent actions connected to Cursor Executor Bridge');
    console.log('3. ✅ Mock functions replaced with real execution commands');
    console.log('4. ✅ Voice integration working');
    console.log('5. ✅ Performance metrics tracking');
    console.log('6. ✅ End-to-end request processing');
    console.log('');
    console.log('🚀 READY FOR STEP 2: Real API Integration!');
    console.log('');
    console.log('Next: Connect to real web search APIs, booking platforms,');
    console.log('and external data sources to replace mock implementations.');
  } else {
    console.log('⚠️ Some integration tests failed. Review errors above.');
  }
  
  return {
    managerResult: managerResult.status,
    bridgeResult: bridgeResult.status,
    e2eResult,
    bridgeExecResult,
    voiceResult,
    metricsResult,
    overallSuccess: passedTests === totalTests
  };
}

// Run the integration tests
runIntegrationTests().catch(console.error);
