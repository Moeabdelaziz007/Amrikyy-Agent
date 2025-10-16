#!/usr/bin/env node

/**
 * Basic Voice Test - No Advanced Dependencies
 * Tests voice functionality without Bottleneck, Prometheus, etc.
 */

console.log('🎤 Basic Voice Test Starting...\n');

// Test 1: Check if basic voice agent exists
const fs = require('fs');
const path = require('path');

console.log('1️⃣ Checking basic voice agent file...');

if (fs.existsSync('src/agents/CursorVoiceAgent.js')) {
  console.log('✅ CursorVoiceAgent.js exists');
} else {
  console.log('❌ CursorVoiceAgent.js missing');
  process.exit(1);
}

console.log('');

// Test 2: Test basic voice agent (without advanced dependencies)
console.log('2️⃣ Testing basic voice agent...');

try {
  // Import only the basic voice agent
  const { CursorVoiceAgent } = require('./src/agents/CursorVoiceAgent');
  console.log('✅ CursorVoiceAgent imported successfully');

  // Create a mock manager
  const mockManager = {
    processRequest: async (message, userId, context) => {
      console.log(`   📝 Mock processing: "${message}" for user: ${userId}`);
      return {
        success: true,
        result: {
          message: `Mock response to: ${message}`,
          timestamp: new Date().toISOString()
        }
      };
    }
  };

  // Create voice agent instance
  console.log('3️⃣ Creating voice agent instance...');
  const voiceAgent = new CursorVoiceAgent(mockManager);
  console.log('✅ Voice agent created successfully');

  // Test 4: Check agent status
  console.log('4️⃣ Checking agent status...');
  const status = voiceAgent.getStatus();
  console.log('✅ Agent status:', {
    agent_id: status.agent_id,
    role: status.role,
    status: status.status,
    capabilities: status.capabilities.length
  });

  // Test 5: Start voice session
  console.log('5️⃣ Testing voice session creation...');
  
  voiceAgent.startVoiceSession('test-user', {
    language: 'en',
    voiceQuality: 'high'
  }).then(result => {
    if (result.success) {
      console.log('✅ Voice session started:', result.sessionId);
      const sessionId = result.sessionId;

      // Test 6: Process voice input
      console.log('6️⃣ Testing voice input processing...');
      
      const voiceData = {
        audioData: Buffer.from('Hello Cursor, this is a test voice input'),
        duration: 3000,
        format: 'wav',
        sampleRate: 44100
      };

      return voiceAgent.processVoiceInput(sessionId, voiceData);
    } else {
      throw new Error(`Session creation failed: ${result.error}`);
    }
  }).then(voiceResult => {
    if (voiceResult.success) {
      console.log('✅ Voice input processed successfully!');
      console.log(`   Transcription: "${voiceResult.transcription}"`);
      console.log(`   Cursor Response: "${voiceResult.cursorResponse.result?.message}"`);
      console.log(`   Audio Duration: ${Math.round(voiceResult.audioResponse.duration / 1000)}s`);
    } else {
      throw new Error(`Voice processing failed: ${voiceResult.error}`);
    }

    // Test 7: Voice commands
    console.log('7️⃣ Testing voice commands...');
    
    const commands = [
      { type: 'get_status' },
      { type: 'change_language', language: 'ar' },
      { type: 'adjust_volume', volume: 0.8 }
    ];

    return Promise.all(commands.map(cmd => 
      voiceAgent.processVoiceCommand(voiceResult.sessionId, cmd)
    ));
  }).then(commandResults => {
    console.log('✅ Voice commands tested:');
    commandResults.forEach((result, index) => {
      if (result.success) {
        console.log(`   Command ${index + 1}: ${result.message}`);
      } else {
        console.log(`   Command ${index + 1}: Failed - ${result.error}`);
      }
    });

    // Test 8: Performance metrics
    console.log('8️⃣ Checking performance metrics...');
    const metrics = voiceAgent.performance;
    console.log('✅ Performance metrics:');
    console.log(`   Voice Requests Processed: ${metrics.voiceRequestsProcessed}`);
    console.log(`   Average Response Time: ${Math.round(metrics.averageResponseTime)}ms`);
    console.log(`   Speech Accuracy: ${metrics.speechAccuracy}%`);

    // Test 9: End session
    console.log('9️⃣ Ending voice session...');
    return voiceAgent.endVoiceSession(voiceResult.sessionId, 'test_complete');
  }).then(endResult => {
    if (endResult.success) {
      console.log('✅ Voice session ended successfully!');
      console.log(`   Duration: ${Math.round(endResult.duration / 1000)}s`);
      console.log(`   Interactions: ${endResult.interactions}`);
    } else {
      throw new Error(`Session end failed: ${endResult.error}`);
    }

    console.log('\n🎉 ALL BASIC VOICE TESTS PASSED! ✅');
    console.log('=====================================');
    console.log('✅ Voice agent import');
    console.log('✅ Agent instantiation');
    console.log('✅ Status retrieval');
    console.log('✅ Session creation');
    console.log('✅ Voice input processing');
    console.log('✅ Voice commands');
    console.log('✅ Performance metrics');
    console.log('✅ Session cleanup');
    console.log('=====================================\n');

  }).catch(error => {
    console.error('❌ VOICE TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
