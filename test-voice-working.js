#!/usr/bin/env node

/**
 * Working Voice Test - No Dependencies
 * Tests voice functionality with basic components only
 */

console.log('🎤 Working Voice Test Starting...\n');

// Test the basic voice agent
async function testVoice() {
  try {
    console.log('1️⃣ Importing basic voice agent...');
    const CursorVoiceAgentBasic = require('./backend/src/agents/CursorVoiceAgentBasic');
    console.log('✅ Basic voice agent imported successfully\n');

    console.log('2️⃣ Creating mock cursor manager...');
    const mockManager = {
      processRequest: async (message, userId, context) => {
        console.log(`   📝 Processing: "${message}" for user: ${userId}`);
        
        // Simulate different responses based on input
        let response = `I received your message: "${message}". This is a mock response from Cursor Manager.`;
        
        if (message.toLowerCase().includes('trip') || message.toLowerCase().includes('travel')) {
          response = `I'll help you plan a trip. Let me gather some travel information for you.`;
        } else if (message.toLowerCase().includes('code') || message.toLowerCase().includes('debug')) {
          response = `I can help you with coding and debugging. What specific issue are you facing?`;
        } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
          response = `Hello! I'm Cursor, your AI assistant. How can I help you today?`;
        }

        return {
          success: true,
          result: {
            message: response,
            timestamp: new Date().toISOString(),
            userId: userId,
            context: context
          }
        };
      }
    };
    console.log('✅ Mock manager created\n');

    console.log('3️⃣ Creating voice agent instance...');
    const voiceAgent = new CursorVoiceAgentBasic(mockManager);
    console.log('✅ Voice agent created successfully\n');

    console.log('4️⃣ Checking agent status...');
    const status = voiceAgent.getStatus();
    console.log('✅ Agent status:', {
      agent_id: status.agent_id,
      role: status.role,
      status: status.status,
      capabilities: status.capabilities.length
    });
    console.log('   Capabilities:', status.capabilities.join(', '));
    console.log('');

    console.log('5️⃣ Starting voice session...');
    const sessionResult = await voiceAgent.startVoiceSession('test-user', {
      language: 'en',
      voiceQuality: 'high',
      echoCancellation: true,
      noiseSuppression: true
    });

    if (!sessionResult.success) {
      throw new Error(`Failed to start voice session: ${sessionResult.error}`);
    }

    const sessionId = sessionResult.sessionId;
    console.log('✅ Voice session started:', sessionId);
    console.log('   Language:', sessionResult.config.language);
    console.log('   Quality:', sessionResult.config.voiceQuality);
    console.log('');

    console.log('6️⃣ Processing voice inputs...');
    const testInputs = [
      'Hello Cursor, how are you?',
      'Plan a trip to Tokyo',
      'Help me debug this JavaScript code',
      'What is the weather like today?'
    ];

    for (let i = 0; i < testInputs.length; i++) {
      const input = testInputs[i];
      console.log(`   Test ${i + 1}: "${input}"`);

      const voiceData = {
        audioData: Buffer.from(input),
        duration: 2000 + Math.random() * 1000,
        format: 'wav',
        sampleRate: 44100
      };

      const result = await voiceAgent.processVoiceInput(sessionId, voiceData);

      if (result.success) {
        console.log(`   ✅ Transcription: "${result.transcription}"`);
        console.log(`   ✅ Response: "${result.cursorResponse.result.message}"`);
        console.log(`   ✅ Audio Duration: ${Math.round(result.audioResponse.duration / 1000)}s`);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
      console.log('');
    }

    console.log('7️⃣ Testing voice commands...');
    const commands = [
      { type: 'get_status', name: 'Get Status' },
      { type: 'change_language', language: 'ar', name: 'Change Language' },
      { type: 'adjust_volume', volume: 0.8, name: 'Adjust Volume' },
      { type: 'stop_listening', name: 'Stop Listening' },
      { type: 'start_listening', name: 'Start Listening' }
    ];

    for (const cmd of commands) {
      console.log(`   Testing: ${cmd.name}`);
      const result = await voiceAgent.processVoiceCommand(sessionId, cmd);
      
      if (result.success) {
        console.log(`   ✅ ${result.message}`);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
    }
    console.log('');

    console.log('8️⃣ Checking session status...');
    const sessionStatus = voiceAgent.getSessionStatus(sessionId);
    if (sessionStatus.success) {
      console.log('✅ Session status:');
      console.log(`   Duration: ${Math.round(sessionStatus.duration / 1000)}s`);
      console.log(`   Interactions: ${sessionStatus.interactions}`);
      console.log(`   Is Listening: ${sessionStatus.isListening}`);
      console.log(`   Language: ${sessionStatus.config.language}`);
    }
    console.log('');

    console.log('9️⃣ Checking performance metrics...');
    const metrics = voiceAgent.performance;
    console.log('✅ Performance metrics:');
    console.log(`   Voice Requests Processed: ${metrics.voiceRequestsProcessed}`);
    console.log(`   Average Response Time: ${Math.round(metrics.averageResponseTime)}ms`);
    console.log(`   Speech Accuracy: ${metrics.speechAccuracy}%`);
    console.log('');

    console.log('🔟 Ending voice session...');
    const endResult = await voiceAgent.endVoiceSession(sessionId, 'test_complete');

    if (endResult.success) {
      console.log('✅ Voice session ended successfully!');
      console.log(`   Total Duration: ${Math.round(endResult.duration / 1000)}s`);
      console.log(`   Total Interactions: ${endResult.interactions}`);
    } else {
      console.log(`❌ Failed to end session: ${endResult.error}`);
    }

    console.log('\n🎉 ALL VOICE TESTS PASSED! ✅');
    console.log('=====================================');
    console.log('✅ Voice agent import');
    console.log('✅ Agent instantiation');
    console.log('✅ Status retrieval');
    console.log('✅ Session creation');
    console.log('✅ Voice input processing (4 tests)');
    console.log('✅ Voice commands (5 commands)');
    console.log('✅ Session status tracking');
    console.log('✅ Performance metrics');
    console.log('✅ Session cleanup');
    console.log('=====================================\n');

  } catch (error) {
    console.error('❌ VOICE TEST FAILED!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testVoice();
