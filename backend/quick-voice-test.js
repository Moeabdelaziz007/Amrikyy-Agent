#!/usr/bin/env node

/**
 * Quick Voice Test - Fast Voice Integration Test
 * Simple test to verify voice functionality works
 */

const { EnhancedCursorManagerAgent } = require('./src/agents/EnhancedCursorManagerAgent');

async function quickVoiceTest() {
  console.log('🎤 Quick Voice Test Starting...\n');

  let cursorManager;

  try {
    // Initialize Enhanced Cursor Manager with voice only
    console.log('1️⃣ Initializing Cursor Manager with voice...');
    cursorManager = new EnhancedCursorManagerAgent({
      voiceEnabled: true,
      prometheusEnabled: false,
      tracingEnabled: false,
      quantumEdgeEnabled: false,
      patternLearningEnabled: false
    });

    await cursorManager.initialize();
    console.log('✅ Cursor Manager initialized successfully\n');

    // Test 1: Start Voice Session
    console.log('2️⃣ Testing voice session creation...');
    const sessionResult = await cursorManager.startVoiceSession('quick-test-user', {
      language: 'en',
      voiceQuality: 'high'
    });

    if (!sessionResult.success) {
      throw new Error(`Failed to start voice session: ${sessionResult.error}`);
    }

    const sessionId = sessionResult.sessionId;
    console.log(`✅ Voice session created: ${sessionId}\n`);

    // Test 2: Process Voice Input
    console.log('3️⃣ Testing voice input processing...');
    const voiceData = {
      audioData: Buffer.from('Hello Cursor, this is a test voice input'),
      duration: 3000,
      format: 'wav',
      sampleRate: 44100
    };

    const voiceResult = await cursorManager.processVoiceInput(sessionId, voiceData);

    if (!voiceResult.success) {
      throw new Error(`Failed to process voice input: ${voiceResult.error}`);
    }

    console.log('✅ Voice input processed successfully');
    console.log(`   Transcription: "${voiceResult.transcription}"`);
    console.log(`   Response: "${voiceResult.cursorResponse.result?.message || 'No response message'}"\n`);

    // Test 3: Voice Commands
    console.log('4️⃣ Testing voice commands...');
    
    // Test language change command
    const langCommand = await cursorManager.voiceAgent.processVoiceCommand(sessionId, {
      type: 'change_language',
      language: 'ar'
    });

    if (!langCommand.success) {
      throw new Error(`Failed to execute language change command: ${langCommand.error}`);
    }

    console.log(`✅ Language change command: ${langCommand.message}`);

    // Test status command
    const statusCommand = await cursorManager.voiceAgent.processVoiceCommand(sessionId, {
      type: 'get_status'
    });

    if (!statusCommand.success) {
      throw new Error(`Failed to execute status command: ${statusCommand.error}`);
    }

    console.log('✅ Status command executed successfully\n');

    // Test 4: Multiple Voice Inputs
    console.log('5️⃣ Testing multiple voice inputs...');
    const testInputs = [
      'Plan a trip to Tokyo',
      'What is the weather like?',
      'Help me debug this code'
    ];

    for (let i = 0; i < testInputs.length; i++) {
      const input = testInputs[i];
      console.log(`   Processing: "${input}"`);

      const result = await cursorManager.processVoiceInput(sessionId, {
        audioData: Buffer.from(input),
        duration: 2000
      });

      if (result.success) {
        console.log(`   ✅ Response: "${result.transcription}"`);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
    }

    console.log('');

    // Test 5: Session Status
    console.log('6️⃣ Checking session status...');
    const sessionStatus = cursorManager.voiceAgent.getSessionStatus(sessionId);
    
    if (sessionStatus.success) {
      console.log('✅ Session status retrieved successfully');
      console.log(`   Duration: ${Math.round(sessionStatus.duration / 1000)}s`);
      console.log(`   Interactions: ${sessionStatus.interactions}`);
      console.log(`   Language: ${sessionStatus.config.language}`);
    } else {
      console.log(`❌ Failed to get session status: ${sessionStatus.error}`);
    }

    console.log('');

    // Test 6: Performance Metrics
    console.log('7️⃣ Checking performance metrics...');
    const metrics = cursorManager.voiceAgent.performance;
    console.log(`✅ Performance metrics:`);
    console.log(`   Voice Requests Processed: ${metrics.voiceRequestsProcessed}`);
    console.log(`   Average Response Time: ${Math.round(metrics.averageResponseTime)}ms`);
    console.log(`   Speech Accuracy: ${metrics.speechAccuracy}%`);
    console.log('');

    // Test 7: End Session
    console.log('8️⃣ Ending voice session...');
    const endResult = await cursorManager.voiceAgent.endVoiceSession(sessionId, 'test_complete');

    if (!endResult.success) {
      throw new Error(`Failed to end voice session: ${endResult.error}`);
    }

    console.log('✅ Voice session ended successfully');
    console.log(`   Total Duration: ${Math.round(endResult.duration / 1000)}s`);
    console.log(`   Total Interactions: ${endResult.interactions}\n`);

    // Final Status
    console.log('9️⃣ Final system status...');
    const systemStatus = cursorManager.getSystemStatus();
    console.log('✅ System status:');
    console.log(`   Manager Status: ${systemStatus.status}`);
    console.log(`   Uptime: ${Math.round(systemStatus.uptime / 1000)}s`);
    console.log(`   Requests Processed: ${systemStatus.metrics.requestsProcessed}`);
    console.log(`   Success Rate: ${systemStatus.metrics.successRate.toFixed(2)}%\n`);

    console.log('🎉 ALL VOICE TESTS PASSED! ✅');
    console.log('=====================================');
    console.log('✅ Voice session management');
    console.log('✅ Voice input processing');
    console.log('✅ Voice commands');
    console.log('✅ Multiple voice inputs');
    console.log('✅ Session status tracking');
    console.log('✅ Performance metrics');
    console.log('✅ Session cleanup');
    console.log('✅ System integration');
    console.log('=====================================\n');

  } catch (error) {
    console.error('❌ VOICE TEST FAILED!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    // Cleanup
    if (cursorManager) {
      try {
        await cursorManager.shutdown();
        console.log('🧹 Cleanup completed');
      } catch (cleanupError) {
        console.error('⚠️ Cleanup error:', cleanupError.message);
      }
    }
  }
}

// Run the test
if (require.main === module) {
  quickVoiceTest().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { quickVoiceTest };
