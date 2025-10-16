#!/usr/bin/env node

/**
 * Simple Voice Test - No Terminal Dependencies
 * Direct test of voice functionality
 */

console.log('🎤 Simple Voice Test Starting...\n');

// Test 1: Check if files exist
const fs = require('fs');
const path = require('path');

console.log('1️⃣ Checking file existence...');

const filesToCheck = [
  'backend/src/agents/CursorVoiceAgent.js',
  'backend/src/agents/EnhancedCursorManagerAgent.js',
  'backend/package.json'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log('');

// Test 2: Check if voice agent can be imported
console.log('2️⃣ Testing voice agent import...');

try {
  const { CursorVoiceAgent } = require('./backend/src/agents/CursorVoiceAgent');
  console.log('✅ CursorVoiceAgent imported successfully');
  
  // Test 3: Create voice agent instance
  console.log('3️⃣ Testing voice agent instantiation...');
  const mockManager = { processRequest: () => ({ success: true }) };
  const voiceAgent = new CursorVoiceAgent(mockManager);
  console.log('✅ Voice agent created successfully');
  
  // Test 4: Check agent status
  console.log('4️⃣ Testing agent status...');
  const status = voiceAgent.getStatus();
  console.log('✅ Agent status retrieved:', {
    agent_id: status.agent_id,
    status: status.status,
    capabilities: status.capabilities.length
  });
  
  // Test 5: Test voice session creation
  console.log('5️⃣ Testing voice session creation...');
  voiceAgent.startVoiceSession('test-user').then(result => {
    if (result.success) {
      console.log('✅ Voice session created:', result.sessionId);
      
      // Test 6: Process voice input
      console.log('6️⃣ Testing voice input processing...');
      return voiceAgent.processVoiceInput(result.sessionId, {
        audioData: Buffer.from('test voice input'),
        duration: 2000
      });
    } else {
      throw new Error(`Session creation failed: ${result.error}`);
    }
  }).then(voiceResult => {
    if (voiceResult.success) {
      console.log('✅ Voice input processed:', voiceResult.transcription);
    } else {
      throw new Error(`Voice processing failed: ${voiceResult.error}`);
    }
    
    console.log('\n🎉 ALL BASIC VOICE TESTS PASSED! ✅');
    console.log('=====================================');
    console.log('✅ File existence check');
    console.log('✅ Module import');
    console.log('✅ Agent instantiation');
    console.log('✅ Status retrieval');
    console.log('✅ Session creation');
    console.log('✅ Voice processing');
    console.log('=====================================\n');
    
  }).catch(error => {
    console.error('❌ VOICE TEST FAILED:', error.message);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
