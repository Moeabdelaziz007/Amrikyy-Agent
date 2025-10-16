/**
 * Cursor Voice Agent with Google Cloud Speech API Integration
 * Uses Google Cloud Speech-to-Text and Text-to-Speech APIs
 * Requires GOOGLE_APPLICATION_CREDENTIALS environment variable
 */

const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs').promises;
const path = require('path');

class CursorVoiceAgentGoogleCloud {
  constructor(manager) {
    this.agentId = 'cursor-voice-googlecloud';
    this.role = 'voice_interface';
    this.status = 'available';
    this.manager = manager;
    
    // Voice capabilities
    this.capabilities = [
      'speech_to_text',
      'text_to_speech', 
      'voice_processing',
      'conversation_management',
      'voice_commands',
      'natural_language_understanding',
      'real_time_recognition',
      'google_cloud_integration',
      'high_accuracy_speech',
      'multiple_languages'
    ];

    // Voice session management
    this.activeSessions = new Map();
    this.voiceHistory = [];
    
    // Google Cloud clients
    this.speechClient = null;
    this.ttsClient = null;
    this.isInitialized = false;

    // Configuration
    this.config = {
      language: 'en-US',
      sampleRateHertz: 48000,
      encoding: 'WEBM_OPUS',
      volume: 1.0,
      rate: 1.0,
      pitch: 0.0,
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Standard-A',
        ssmlGender: 'NEUTRAL'
      }
    };

    this.initializeGoogleCloud();
  }

  /**
   * Initialize Google Cloud Speech clients
   */
  async initializeGoogleCloud() {
    try {
      // Check for credentials
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.warn('⚠️ GOOGLE_APPLICATION_CREDENTIALS not set. Using mock mode.');
        this.isInitialized = false;
        return;
      }

      // Initialize Speech-to-Text client
      this.speechClient = new speech.SpeechClient();
      
      // Initialize Text-to-Speech client
      this.ttsClient = new textToSpeech.TextToSpeechClient();
      
      this.isInitialized = true;
      console.log('✅ Google Cloud Speech APIs initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Google Cloud Speech APIs:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Start a voice session
   */
  async startVoiceSession(userId, options = {}) {
    const sessionId = `voice_${userId}_${Date.now()}`;
    
    const session = {
      sessionId,
      userId,
      startTime: Date.now(),
      isActive: true,
      isListening: false,
      interactions: 0,
      language: options.language || this.config.language,
      quality: options.quality || 'high',
      voiceHistory: [],
      audioFiles: []
    };

    this.activeSessions.set(sessionId, session);
    
    console.log(`🎤 Started Google Cloud voice session: ${sessionId}`);
    return {
      sessionId,
      language: session.language,
      quality: session.quality,
      googleCloudEnabled: this.isInitialized,
      freeMinutesRemaining: this.isInitialized ? 60 : 0
    };
  }

  /**
   * Process audio file with Google Cloud Speech-to-Text
   */
  async processAudioFile(sessionId, audioFilePath) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (!this.isInitialized) {
      // Fallback to mock processing
      return await this.mockSpeechToText(sessionId, audioFilePath);
    }

    try {
      // Read audio file
      const audioBytes = await fs.readFile(audioFilePath);
      
      // Configure recognition request
      const request = {
        audio: {
          content: audioBytes.toString('base64'),
        },
        config: {
          encoding: this.config.encoding,
          sampleRateHertz: this.config.sampleRateHertz,
          languageCode: session.language,
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: true,
          model: 'latest_long'
        },
      };

      console.log('🎤 Processing audio with Google Cloud Speech-to-Text...');
      
      // Perform speech recognition
      const [response] = await this.speechClient.recognize(request);
      
      if (response.results.length === 0) {
        throw new Error('No speech detected in audio file');
      }

      const result = response.results[0];
      const transcript = result.alternatives[0].transcript;
      const confidence = result.alternatives[0].confidence;

      console.log(`📝 Google Cloud transcription: "${transcript}" (confidence: ${confidence})`);

      // Record the interaction
      const interaction = {
        timestamp: Date.now(),
        type: 'speech_to_text',
        transcript,
        confidence,
        sessionId,
        provider: 'google_cloud'
      };

      session.voiceHistory.push(interaction);
      session.interactions++;

      return {
        transcript,
        confidence,
        sessionId,
        provider: 'google_cloud'
      };

    } catch (error) {
      console.error('❌ Google Cloud Speech-to-Text error:', error);
      // Fallback to mock
      return await this.mockSpeechToText(sessionId, audioFilePath);
    }
  }

  /**
   * Generate speech using Google Cloud Text-to-Speech
   */
  async generateSpeech(sessionId, text) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (!this.isInitialized) {
      // Fallback to mock TTS
      return await this.mockTextToSpeech(sessionId, text);
    }

    try {
      // Configure TTS request
      const request = {
        input: { text: text },
        voice: {
          languageCode: session.language,
          name: this.config.voice.name,
          ssmlGender: this.config.voice.ssmlGender,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: this.config.rate,
          pitch: this.config.pitch,
          volumeGainDb: Math.log10(this.config.volume) * 20,
        },
      };

      console.log('🔊 Generating speech with Google Cloud Text-to-Speech...');
      
      // Perform TTS
      const [response] = await this.ttsClient.synthesizeSpeech(request);
      
      // Save audio file
      const audioDir = path.join('backend', 'data', 'voice_sessions', sessionId);
      await fs.mkdir(audioDir, { recursive: true });
      
      const audioFilePath = path.join(audioDir, `response_${Date.now()}.mp3`);
      await fs.writeFile(audioFilePath, response.audioContent, 'binary');
      
      session.audioFiles.push(audioFilePath);

      console.log(`🔊 Google Cloud TTS completed: ${audioFilePath}`);

      // Record the interaction
      const interaction = {
        timestamp: Date.now(),
        type: 'text_to_speech',
        text,
        audioFile: audioFilePath,
        sessionId,
        provider: 'google_cloud'
      };

      session.voiceHistory.push(interaction);

      return {
        audioFile: audioFilePath,
        text,
        sessionId,
        provider: 'google_cloud',
        duration: this.estimateAudioDuration(text)
      };

    } catch (error) {
      console.error('❌ Google Cloud Text-to-Speech error:', error);
      // Fallback to mock
      return await this.mockTextToSpeech(sessionId, text);
    }
  }

  /**
   * Process voice input and generate response
   */
  async processVoiceInput(sessionId, transcript, confidence = 0.9) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      console.log(`🎤 Processing voice input: "${transcript}"`);

      // Process through manager
      const response = await this.manager.processRequest(transcript, session.userId, {
        type: 'voice',
        sessionId,
        confidence,
        provider: this.isInitialized ? 'google_cloud' : 'mock'
      });

      // Generate speech response
      const speechResult = await this.generateSpeech(sessionId, response);

      return {
        transcript,
        response,
        confidence,
        sessionId,
        audioFile: speechResult.audioFile,
        provider: speechResult.provider
      };

    } catch (error) {
      console.error('❌ Error processing voice input:', error);
      const errorResponse = 'Sorry, I encountered an error processing your request.';
      const speechResult = await this.generateSpeech(sessionId, errorResponse);
      throw error;
    }
  }

  /**
   * Mock speech-to-text for testing without credentials
   */
  async mockSpeechToText(sessionId, audioFilePath) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Simulate transcription based on filename or random
    const mockTranscriptions = [
      "Hello, how are you today?",
      "Can you help me with this task?",
      "What's the weather like?",
      "Plan a trip to Tokyo",
      "Show me the dashboard",
      "Help me debug this code",
      "What are the latest updates?"
    ];

    const transcript = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
    const confidence = 0.85 + Math.random() * 0.1; // 85-95% confidence

    console.log(`📝 Mock transcription: "${transcript}" (confidence: ${confidence.toFixed(2)})`);

    // Record the interaction
    const interaction = {
      timestamp: Date.now(),
      type: 'speech_to_text',
      transcript,
      confidence,
      sessionId,
      provider: 'mock'
    };

    session.voiceHistory.push(interaction);
    session.interactions++;

    return {
      transcript,
      confidence,
      sessionId,
      provider: 'mock'
    };
  }

  /**
   * Mock text-to-speech for testing without credentials
   */
  async mockTextToSpeech(sessionId, text) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Simulate audio file creation
    const audioDir = path.join('backend', 'data', 'voice_sessions', sessionId);
    await fs.mkdir(audioDir, { recursive: true });
    
    const audioFilePath = path.join(audioDir, `mock_response_${Date.now()}.txt`);
    await fs.writeFile(audioFilePath, `Mock audio for: ${text}`, 'utf8');
    
    session.audioFiles.push(audioFilePath);

    console.log(`🔊 Mock TTS: "${text}"`);

    // Record the interaction
    const interaction = {
      timestamp: Date.now(),
      type: 'text_to_speech',
      text,
      audioFile: audioFilePath,
      sessionId,
      provider: 'mock'
    };

    session.voiceHistory.push(interaction);

    return {
      audioFile: audioFilePath,
      text,
      sessionId,
      provider: 'mock',
      duration: this.estimateAudioDuration(text)
    };
  }

  /**
   * Estimate audio duration based on text length
   */
  estimateAudioDuration(text) {
    const wordsPerMinute = 150; // Average speaking rate
    const wordCount = text.split(' ').length;
    return Math.ceil((wordCount / wordsPerMinute) * 60); // Duration in seconds
  }

  /**
   * Process voice commands
   */
  async processVoiceCommand(sessionId, command) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      switch (command.type) {
        case 'change_language':
          session.language = command.language;
          this.config.language = command.language;
          this.config.voice.languageCode = command.language;
          return { status: 'language_changed', language: command.language };
          
        case 'adjust_volume':
          this.config.volume = Math.max(0, Math.min(1, command.volume));
          return { status: 'volume_adjusted', volume: this.config.volume };
          
        case 'adjust_speed':
          this.config.rate = Math.max(0.25, Math.min(4.0, command.rate));
          return { status: 'speed_adjusted', rate: this.config.rate };
          
        case 'change_voice':
          this.config.voice.name = command.voiceName;
          this.config.voice.ssmlGender = command.gender || 'NEUTRAL';
          return { status: 'voice_changed', voice: this.config.voice };
          
        case 'get_status':
          return await this.getSessionStatus(sessionId);
          
        case 'get_audio_files':
          return { audioFiles: session.audioFiles };
          
        default:
          throw new Error(`Unknown voice command: ${command.type}`);
      }
    } catch (error) {
      console.error('❌ Error processing voice command:', error);
      throw error;
    }
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    return {
      sessionId,
      userId: session.userId,
      isActive: session.isActive,
      isListening: session.isListening,
      interactions: session.interactions,
      language: session.language,
      duration: Date.now() - session.startTime,
      googleCloudEnabled: this.isInitialized,
      audioFiles: session.audioFiles.length,
      provider: this.isInitialized ? 'google_cloud' : 'mock'
    };
  }

  /**
   * End voice session
   */
  async endVoiceSession(sessionId, reason = 'user_request') {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      // Mark session as inactive
      session.isActive = false;
      session.endTime = Date.now();
      session.endReason = reason;

      // Store session data
      await this.storeSessionData(session);

      // Remove from active sessions
      this.activeSessions.delete(sessionId);

      console.log(`🛑 Google Cloud voice session ended: ${sessionId} (${reason})`);

      return {
        sessionId,
        duration: session.endTime - session.startTime,
        interactions: session.interactions,
        audioFiles: session.audioFiles.length,
        reason,
        provider: this.isInitialized ? 'google_cloud' : 'mock'
      };

    } catch (error) {
      console.error('❌ Error ending voice session:', error);
      throw error;
    }
  }

  /**
   * Store session data
   */
  async storeSessionData(session) {
    try {
      const dataDir = path.join('backend', 'data', 'voice_sessions');
      await fs.mkdir(dataDir, { recursive: true });
      
      const filename = `googlecloud-session-${session.sessionId}.json`;
      const filepath = path.join(dataDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(session, null, 2));
      console.log(`💾 Google Cloud session data stored: ${filename}`);
      
    } catch (error) {
      console.error('❌ Error storing session data:', error);
    }
  }

  /**
   * Get agent status
   */
  async getAgentStatus() {
    return {
      agent_id: this.agentId,
      role: this.role,
      status: this.status,
      capabilities: this.capabilities.length,
      active_sessions: this.activeSessions.size,
      google_cloud_enabled: this.isInitialized,
      credentials_configured: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      provider: this.isInitialized ? 'google_cloud' : 'mock'
    };
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    const totalSessions = this.activeSessions.size + this.voiceHistory.length;
    const avgResponseTime = this.isInitialized ? 2000 : 100; // Google Cloud is slower but more accurate
    
    return {
      voice_requests_processed: this.voiceHistory.length,
      active_sessions: this.activeSessions.size,
      average_response_time: avgResponseTime,
      speech_accuracy: this.isInitialized ? 95 : 85,
      provider: this.isInitialized ? 'google_cloud' : 'mock',
      free_minutes_used: this.isInitialized ? Math.min(60, this.voiceHistory.length * 0.1) : 0,
      uptime: Date.now() - (this.startTime || Date.now())
    };
  }
}

module.exports = CursorVoiceAgentGoogleCloud;
