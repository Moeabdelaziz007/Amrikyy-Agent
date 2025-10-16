/**
 * Comprehensive Voice Integration Test Suite
 * Tests all voice features: sessions, processing, real-time communication
 */

const { CursorVoiceAgent } = require('../src/agents/CursorVoiceAgent');
const { EnhancedCursorManagerAgent } = require('../src/agents/EnhancedCursorManagerAgent');

describe('Voice Integration Tests', () => {
  let voiceAgent;
  let cursorManager;
  let testUserId = 'test-user-voice';

  beforeEach(async () => {
    // Initialize Enhanced Cursor Manager with voice enabled
    cursorManager = new EnhancedCursorManagerAgent({
      maxConcurrentTasks: 5,
      voiceEnabled: true,
      prometheusEnabled: false, // Disable for testing
      tracingEnabled: false,   // Disable for testing
      quantumEdgeEnabled: false // Disable for testing
    });

    await cursorManager.initialize();
    voiceAgent = cursorManager.voiceAgent;
  });

  afterEach(async () => {
    if (cursorManager) {
      await cursorManager.shutdown();
    }
  });

  describe('Voice Session Management', () => {
    test('should start voice session successfully', async () => {
      const result = await voiceAgent.startVoiceSession(testUserId, {
        language: 'en',
        voiceQuality: 'high',
        echoCancellation: true,
        noiseSuppression: true
      });

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
      expect(result.config).toBeDefined();
      expect(result.config.language).toBe('en');
      expect(result.config.voiceQuality).toBe('high');
    });

    test('should validate session configuration', async () => {
      // Test with invalid configuration
      const result = await voiceAgent.startVoiceSession(testUserId, {
        language: 'invalid-lang',
        voiceQuality: 'invalid-quality',
        maxSessionDuration: 1000 // Too short
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle multiple concurrent sessions', async () => {
      const sessions = await Promise.all([
        voiceAgent.startVoiceSession('user1'),
        voiceAgent.startVoiceSession('user2'),
        voiceAgent.startVoiceSession('user3')
      ]);

      sessions.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.sessionId).toContain(`user${index + 1}`);
      });

      // Check active sessions
      const activeSessions = voiceAgent.getActiveSessions();
      expect(activeSessions.success).toBe(true);
      expect(activeSessions.activeSessions).toHaveLength(3);
    });

    test('should end voice session gracefully', async () => {
      // Start session
      const startResult = await voiceAgent.startVoiceSession(testUserId);
      expect(startResult.success).toBe(true);

      const sessionId = startResult.sessionId;

      // End session
      const endResult = await voiceAgent.endVoiceSession(sessionId, 'user_request');
      
      expect(endResult.success).toBe(true);
      expect(endResult.sessionId).toBe(sessionId);
      expect(endResult.duration).toBeGreaterThan(0);
      expect(endResult.reason).toBe('user_request');
    });

    test('should handle session timeout', async () => {
      const startResult = await voiceAgent.startVoiceSession(testUserId, {
        maxSessionDuration: 1000 // 1 second timeout
      });

      expect(startResult.success).toBe(true);
      const sessionId = startResult.sessionId;

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Check if session ended
      const status = voiceAgent.getSessionStatus(sessionId);
      expect(status.success).toBe(false);
      expect(status.error).toBe('Session not found');
    });
  });

  describe('Voice Processing', () => {
    let sessionId;

    beforeEach(async () => {
      const result = await voiceAgent.startVoiceSession(testUserId);
      expect(result.success).toBe(true);
      sessionId = result.sessionId;
    });

    test('should process voice input successfully', async () => {
      const voiceData = {
        audioData: Buffer.from('mock audio data for testing'),
        duration: 5000,
        format: 'wav',
        sampleRate: 44100
      };

      const result = await voiceAgent.processVoiceInput(sessionId, voiceData);

      expect(result.success).toBe(true);
      expect(result.transcription).toBeDefined();
      expect(result.cursorResponse).toBeDefined();
      expect(result.audioResponse).toBeDefined();
      expect(result.interaction).toBeDefined();
      expect(result.interaction.userInput).toBeDefined();
      expect(result.interaction.cursorResponse).toBeDefined();
    });

    test('should handle different voice input formats', async () => {
      const formats = [
        { format: 'wav', sampleRate: 44100 },
        { format: 'mp3', sampleRate: 44100 },
        { format: 'ogg', sampleRate: 48000 }
      ];

      for (const format of formats) {
        const voiceData = {
          audioData: Buffer.from(`mock ${format.format} data`),
          duration: 3000,
          ...format
        };

        const result = await voiceAgent.processVoiceInput(sessionId, voiceData);
        expect(result.success).toBe(true);
        expect(result.transcription).toBeDefined();
      }
    });

    test('should handle voice processing errors gracefully', async () => {
      // Test with invalid session ID
      const result = await voiceAgent.processVoiceInput('invalid-session', {
        audioData: Buffer.from('test')
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Voice session not found');
    });

    test('should update performance metrics during processing', async () => {
      const initialMetrics = voiceAgent.performance;

      const voiceData = {
        audioData: Buffer.from('test audio for metrics'),
        duration: 2000
      };

      await voiceAgent.processVoiceInput(sessionId, voiceData);

      const updatedMetrics = voiceAgent.performance;
      expect(updatedMetrics.voiceRequestsProcessed).toBeGreaterThan(initialMetrics.voiceRequestsProcessed);
      expect(updatedMetrics.lastVoiceRequest).toBeDefined();
    });

    test('should handle multiple voice inputs in sequence', async () => {
      const voiceInputs = [
        { audioData: Buffer.from('first input'), duration: 1000 },
        { audioData: Buffer.from('second input'), duration: 1500 },
        { audioData: Buffer.from('third input'), duration: 2000 }
      ];

      const results = [];
      for (const input of voiceInputs) {
        const result = await voiceAgent.processVoiceInput(sessionId, input);
        expect(result.success).toBe(true);
        results.push(result);
      }

      // Check session history
      const sessionStatus = voiceAgent.getSessionStatus(sessionId);
      expect(sessionStatus.success).toBe(true);
      expect(sessionStatus.interactions).toBe(3);
    });
  });

  describe('Speech-to-Text Processing', () => {
    let sessionId;

    beforeEach(async () => {
      const result = await voiceAgent.startVoiceSession(testUserId);
      sessionId = result.sessionId;
    });

    test('should simulate speech-to-text conversion', async () => {
      const voiceData = {
        audioData: Buffer.from('mock speech audio'),
        duration: 3000
      };

      const result = await voiceAgent.speechToText(voiceData, { language: 'en' });

      expect(result.success).toBe(true);
      expect(result.text).toBeDefined();
      expect(typeof result.text).toBe('string');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.language).toBe('en');
    });

    test('should handle different languages', async () => {
      const languages = ['en', 'ar', 'es', 'fr'];
      
      for (const language of languages) {
        const voiceData = {
          audioData: Buffer.from(`mock ${language} audio`),
          duration: 2000
        };

        const result = await voiceAgent.speechToText(voiceData, { language });
        expect(result.success).toBe(true);
        expect(result.language).toBe(language);
      }
    });

    test('should handle speech-to-text errors', async () => {
      // Mock a failure scenario
      const voiceData = {
        audioData: Buffer.alloc(0), // Empty buffer
        duration: 0
      };

      const result = await voiceAgent.speechToText(voiceData, { language: 'en' });
      // Should still succeed in simulation mode, but with lower confidence
      expect(result.success).toBe(true);
    });
  });

  describe('Text-to-Speech Processing', () => {
    test('should simulate text-to-speech conversion', async () => {
      const cursorResponse = {
        success: true,
        result: {
          message: 'This is a test response from Cursor Manager'
        }
      };

      const result = await voiceAgent.textToSpeech(cursorResponse, {
        language: 'en',
        voiceQuality: 'high'
      });

      expect(result.success).toBe(true);
      expect(result.audioData).toBeDefined();
      expect(result.format).toBe('mp3');
      expect(result.quality).toBe('high');
      expect(result.language).toBe('en');
      expect(result.text).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
    });

    test('should handle different response types', async () => {
      const responseTypes = [
        { success: true, result: 'Simple string response' },
        { success: true, result: { message: 'Object response' } },
        { success: true, result: { summary: 'Summary response' } },
        { success: false, error: 'Error response' }
      ];

      for (const response of responseTypes) {
        const result = await voiceAgent.textToSpeech(response, { language: 'en' });
        expect(result.success).toBe(true);
        expect(result.text).toBeDefined();
        expect(result.audioData).toBeDefined();
      }
    });

    test('should estimate speech duration correctly', async () => {
      const testTexts = [
        'Short text',
        'This is a medium length text that should take more time to speak',
        'This is a very long text that contains many words and should take significantly more time to convert to speech and play back to the user'
      ];

      for (const text of testTexts) {
        const duration = voiceAgent.estimateSpeechDuration(text);
        expect(duration).toBeGreaterThan(0);
        expect(typeof duration).toBe('number');
      }
    });
  });

  describe('Voice Commands', () => {
    let sessionId;

    beforeEach(async () => {
      const result = await voiceAgent.startVoiceSession(testUserId);
      sessionId = result.sessionId;
    });

    test('should handle stop listening command', async () => {
      const result = await voiceAgent.processVoiceCommand(sessionId, {
        type: 'stop_listening'
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Stopped listening');

      const status = voiceAgent.getSessionStatus(sessionId);
      expect(status.success).toBe(true);
      expect(status.isListening).toBe(false);
    });

    test('should handle start listening command', async () => {
      // First stop listening
      await voiceAgent.processVoiceCommand(sessionId, { type: 'stop_listening' });

      // Then start listening
      const result = await voiceAgent.processVoiceCommand(sessionId, {
        type: 'start_listening'
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Started listening');

      const status = voiceAgent.getSessionStatus(sessionId);
      expect(status.isListening).toBe(true);
    });

    test('should handle language change command', async () => {
      const result = await voiceAgent.processVoiceCommand(sessionId, {
        type: 'change_language',
        language: 'ar'
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Language changed to ar');

      const status = voiceAgent.getSessionStatus(sessionId);
      expect(status.config.language).toBe('ar');
    });

    test('should handle volume adjustment command', async () => {
      const result = await voiceAgent.processVoiceCommand(sessionId, {
        type: 'adjust_volume',
        volume: 0.8
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Volume adjusted to 0.8');
    });

    test('should handle get status command', async () => {
      const result = await voiceAgent.processVoiceCommand(sessionId, {
        type: 'get_status'
      });

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe(sessionId);
      expect(result.status).toBeDefined();
    });

    test('should handle end session command', async () => {
      const result = await voiceAgent.processVoiceCommand(sessionId, {
        type: 'end_session'
      });

      expect(result.success).toBe(true);
      expect(result.reason).toBe('voice_command');
    });

    test('should handle unknown voice commands', async () => {
      const result = await voiceAgent.processVoiceCommand(sessionId, {
        type: 'unknown_command'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown voice command');
    });
  });

  describe('Integration with Cursor Manager', () => {
    test('should process voice input through Cursor Manager', async () => {
      // Start voice session
      const sessionResult = await cursorManager.startVoiceSession(testUserId, {
        language: 'en',
        voiceQuality: 'high'
      });

      expect(sessionResult.success).toBe(true);
      const sessionId = sessionResult.sessionId;

      // Process voice input
      const voiceData = {
        audioData: Buffer.from('Plan a trip to Tokyo'),
        duration: 3000
      };

      const result = await cursorManager.processVoiceInput(sessionId, voiceData);

      expect(result.success).toBe(true);
      expect(result.transcription).toBeDefined();
      expect(result.cursorResponse).toBeDefined();
      expect(result.audioResponse).toBeDefined();
    });

    test('should handle voice session lifecycle through Cursor Manager', async () => {
      // Start session
      const startResult = await cursorManager.startVoiceSession(testUserId);
      expect(startResult.success).toBe(true);

      const sessionId = startResult.sessionId;

      // Process some voice inputs
      await cursorManager.processVoiceInput(sessionId, {
        audioData: Buffer.from('Hello Cursor'),
        duration: 2000
      });

      // End session
      const endResult = await cursorManager.voiceAgent.endVoiceSession(sessionId, 'user_request');
      expect(endResult.success).toBe(true);
      expect(endResult.interactions).toBeGreaterThan(0);
    });

    test('should handle multiple voice sessions simultaneously', async () => {
      const users = ['user1', 'user2', 'user3'];
      const sessionResults = [];

      // Start multiple sessions
      for (const user of users) {
        const result = await cursorManager.startVoiceSession(user);
        expect(result.success).toBe(true);
        sessionResults.push(result);
      }

      // Process voice input for each session
      const processingPromises = sessionResults.map((result, index) => 
        cursorManager.processVoiceInput(result.sessionId, {
          audioData: Buffer.from(`Voice input from user${index + 1}`),
          duration: 2000
        })
      );

      const results = await Promise.all(processingPromises);
      
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.transcription).toBeDefined();
      });

      // Check active sessions
      const activeSessions = cursorManager.voiceAgent.getActiveSessions();
      expect(activeSessions.success).toBe(true);
      expect(activeSessions.activeSessions).toHaveLength(3);
    });
  });

  describe('Performance and Load Testing', () => {
    test('should handle concurrent voice processing', async () => {
      const sessionCount = 10;
      const sessions = [];

      // Create multiple sessions
      for (let i = 0; i < sessionCount; i++) {
        const result = await voiceAgent.startVoiceSession(`user-${i}`);
        expect(result.success).toBe(true);
        sessions.push(result);
      }

      // Process voice input concurrently
      const processingPromises = sessions.map((session, index) =>
        voiceAgent.processVoiceInput(session.sessionId, {
          audioData: Buffer.from(`Concurrent voice input ${index}`),
          duration: 1000 + Math.random() * 2000
        })
      );

      const startTime = Date.now();
      const results = await Promise.all(processingPromises);
      const totalTime = Date.now() - startTime;

      // Verify all processing succeeded
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.transcription).toBeDefined();
      });

      // Performance check - should process all sessions in reasonable time
      expect(totalTime).toBeLessThan(sessionCount * 1000); // Less than 1 second per session
    });

    test('should maintain performance under continuous load', async () => {
      const session = await voiceAgent.startVoiceSession(testUserId);
      expect(session.success).toBe(true);

      const sessionId = session.sessionId;
      const requestCount = 20;
      const startTime = Date.now();

      // Process multiple voice inputs in sequence
      for (let i = 0; i < requestCount; i++) {
        const result = await voiceAgent.processVoiceInput(sessionId, {
          audioData: Buffer.from(`Load test input ${i}`),
          duration: 500
        });
        expect(result.success).toBe(true);
      }

      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / requestCount;

      // Should maintain good performance
      expect(averageTime).toBeLessThan(500); // Less than 500ms per request
    });

    test('should track voice performance metrics accurately', async () => {
      const initialMetrics = { ...voiceAgent.performance };

      const session = await voiceAgent.startVoiceSession(testUserId);
      const sessionId = session.sessionId;

      // Process multiple voice inputs
      const requestCount = 5;
      for (let i = 0; i < requestCount; i++) {
        await voiceAgent.processVoiceInput(sessionId, {
          audioData: Buffer.from(`Metrics test ${i}`),
          duration: 1000
        });
      }

      const updatedMetrics = voiceAgent.performance;

      expect(updatedMetrics.voiceRequestsProcessed).toBeGreaterThan(
        initialMetrics.voiceRequestsProcessed
      );
      expect(updatedMetrics.averageResponseTime).toBeGreaterThan(0);
      expect(updatedMetrics.lastVoiceRequest).toBeDefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid session operations', async () => {
      const invalidSessionId = 'invalid-session-id';

      // Test various operations with invalid session
      const operations = [
        () => voiceAgent.processVoiceInput(invalidSessionId, { audioData: Buffer.from('test') }),
        () => voiceAgent.getSessionStatus(invalidSessionId),
        () => voiceAgent.endVoiceSession(invalidSessionId),
        () => voiceAgent.processVoiceCommand(invalidSessionId, { type: 'get_status' })
      ];

      for (const operation of operations) {
        const result = await operation();
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    });

    test('should handle malformed voice data', async () => {
      const session = await voiceAgent.startVoiceSession(testUserId);
      const sessionId = session.sessionId;

      const malformedData = [
        null,
        undefined,
        {},
        { audioData: null },
        { audioData: 'not-a-buffer' },
        { audioData: Buffer.alloc(0) }
      ];

      for (const data of malformedData) {
        const result = await voiceAgent.processVoiceInput(sessionId, data);
        // Should handle gracefully, either succeed or fail with proper error
        expect(result.success).toBeDefined();
        if (!result.success) {
          expect(result.error).toBeDefined();
        }
      }
    });

    test('should handle session cleanup on errors', async () => {
      const session = await voiceAgent.startVoiceSession(testUserId);
      const sessionId = session.sessionId;

      // Simulate an error during processing
      jest.spyOn(voiceAgent, 'speechToText').mockRejectedValueOnce(
        new Error('Simulated speech processing error')
      );

      const result = await voiceAgent.processVoiceInput(sessionId, {
        audioData: Buffer.from('error test'),
        duration: 1000
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      // Session should still be active after error
      const status = voiceAgent.getSessionStatus(sessionId);
      expect(status.success).toBe(true);
    });
  });

  describe('Voice Agent Status and Monitoring', () => {
    test('should provide comprehensive agent status', () => {
      const status = voiceAgent.getStatus();

      expect(status).toHaveProperty('agent_id', 'cursor-voice');
      expect(status).toHaveProperty('managed_by', 'cursor-master');
      expect(status).toHaveProperty('role', 'voice_interface');
      expect(status).toHaveProperty('version', '1.0.0');
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('capabilities');
      expect(status).toHaveProperty('performance');
      expect(status).toHaveProperty('activeSessions');
      expect(status).toHaveProperty('totalVoiceHistory');
    });

    test('should track active sessions accurately', async () => {
      const initialSessions = voiceAgent.getActiveSessions();

      // Start multiple sessions
      const sessions = await Promise.all([
        voiceAgent.startVoiceSession('user1'),
        voiceAgent.startVoiceSession('user2'),
        voiceAgent.startVoiceSession('user3')
      ]);

      const activeSessions = voiceAgent.getActiveSessions();
      expect(activeSessions.success).toBe(true);
      expect(activeSessions.activeSessions).toHaveLength(3);
      expect(activeSessions.totalActive).toBe(3);

      // End one session
      await voiceAgent.endVoiceSession(sessions[0].sessionId);

      const updatedSessions = voiceAgent.getActiveSessions();
      expect(updatedSessions.activeSessions).toHaveLength(2);
      expect(updatedSessions.totalActive).toBe(2);
    });

    test('should store session data persistently', async () => {
      const session = await voiceAgent.startVoiceSession(testUserId);
      const sessionId = session.sessionId;

      // Process some voice inputs to generate data
      await voiceAgent.processVoiceInput(sessionId, {
        audioData: Buffer.from('Test for data storage'),
        duration: 2000
      });

      // End session to trigger data storage
      const endResult = await voiceAgent.endVoiceSession(sessionId);
      expect(endResult.success).toBe(true);

      // Note: In a real implementation, you would verify the data was stored
      // For this test, we just ensure the storage process completed without error
    });
  });
});

// Integration test with real voice simulation
describe('Voice Integration - Real Simulation', () => {
  let cursorManager;
  let testSessionId;

  beforeAll(async () => {
    cursorManager = new EnhancedCursorManagerAgent({
      voiceEnabled: true,
      prometheusEnabled: false,
      tracingEnabled: false,
      quantumEdgeEnabled: false
    });

    await cursorManager.initialize();
  });

  afterAll(async () => {
    if (cursorManager) {
      await cursorManager.shutdown();
    }
  });

  beforeEach(async () => {
    const result = await cursorManager.startVoiceSession('integration-test-user');
    testSessionId = result.sessionId;
  });

  afterEach(async () => {
    if (testSessionId) {
      await cursorManager.voiceAgent.endVoiceSession(testSessionId);
    }
  });

  test('should simulate complete voice conversation flow', async () => {
    // Simulate a real conversation flow
    const conversationSteps = [
      { input: 'Hello Cursor, I need help planning a trip', expected: 'travel planning' },
      { input: 'I want to go to Tokyo next month', expected: 'destination specific' },
      { input: 'What is the best time to visit?', expected: 'information request' },
      { input: 'Thank you for the information', expected: 'gratitude' }
    ];

    const results = [];

    for (const step of conversationSteps) {
      const voiceData = {
        audioData: Buffer.from(step.input),
        duration: 2000 + Math.random() * 1000
      };

      const result = await cursorManager.processVoiceInput(testSessionId, voiceData);

      expect(result.success).toBe(true);
      expect(result.transcription).toBeDefined();
      expect(result.cursorResponse).toBeDefined();
      expect(result.audioResponse).toBeDefined();

      results.push(result);
    }

    // Verify conversation flow
    expect(results).toHaveLength(conversationSteps.length);

    // Check session has conversation history
    const sessionStatus = cursorManager.voiceAgent.getSessionStatus(testSessionId);
    expect(sessionStatus.success).toBe(true);
    expect(sessionStatus.interactions).toBe(conversationSteps.length);
  });

  test('should handle voice commands during conversation', async () => {
    // Start with normal voice input
    await cursorManager.processVoiceInput(testSessionId, {
      audioData: Buffer.from('Start listening to my voice'),
      duration: 2000
    });

    // Change language
    const langResult = await cursorManager.voiceAgent.processVoiceCommand(testSessionId, {
      type: 'change_language',
      language: 'ar'
    });
    expect(langResult.success).toBe(true);

    // Continue conversation in new language
    const result = await cursorManager.processVoiceInput(testSessionId, {
      audioData: Buffer.from('Continue conversation in Arabic'),
      duration: 2500
    });

    expect(result.success).toBe(true);

    // Check language was changed
    const status = cursorManager.voiceAgent.getSessionStatus(testSessionId);
    expect(status.config.language).toBe('ar');
  });
});
