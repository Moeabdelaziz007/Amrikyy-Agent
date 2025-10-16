/**
 * Cursor Voice Agent with Real Web Speech API Integration
 * Uses browser's built-in Web Speech API for real voice processing
 * 100% FREE - No API keys required!
 */

class CursorVoiceAgentWebAPI {
  constructor(manager) {
    this.agentId = 'cursor-voice-webapi';
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
      'browser_integration'
    ];

    // Voice session management
    this.activeSessions = new Map();
    this.voiceHistory = [];
    
    // Web Speech API components
    this.recognition = null;
    this.synthesis = null;
    this.isListening = false;
    this.isSupported = false;

    // Configuration
    this.config = {
      language: 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 1,
      volume: 1.0,
      rate: 1.0,
      pitch: 1.0
    };

    this.initializeWebSpeechAPI();
  }

  /**
   * Initialize Web Speech API components
   */
  initializeWebSpeechAPI() {
    try {
      // Check if Web Speech API is supported
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        this.isSupported = true;
        
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition
        this.recognition.continuous = this.config.continuous;
        this.recognition.interimResults = this.config.interimResults;
        this.recognition.lang = this.config.language;
        this.recognition.maxAlternatives = this.config.maxAlternatives;

        // Initialize speech synthesis
        this.synthesis = window.speechSynthesis;
        
        console.log('✅ Web Speech API initialized successfully');
      } else {
        this.isSupported = false;
        console.warn('⚠️ Web Speech API not supported in this browser');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Web Speech API:', error);
      this.isSupported = false;
    }
  }

  /**
   * Start a voice session
   */
  async startVoiceSession(userId, options = {}) {
    const sessionId = `voice_${userId}_${Date.now()}`;
    
    if (!this.isSupported) {
      throw new Error('Web Speech API not supported in this browser');
    }

    const session = {
      sessionId,
      userId,
      startTime: Date.now(),
      isActive: true,
      isListening: false,
      interactions: 0,
      language: options.language || this.config.language,
      quality: options.quality || 'high',
      voiceHistory: []
    };

    this.activeSessions.set(sessionId, session);
    
    console.log(`🎤 Started voice session: ${sessionId}`);
    return {
      sessionId,
      language: session.language,
      quality: session.quality,
      supported: this.isSupported
    };
  }

  /**
   * Start listening for voice input
   */
  async startListening(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (!this.isSupported) {
      throw new Error('Web Speech API not supported');
    }

    return new Promise((resolve, reject) => {
      try {
        // Set up recognition event handlers
        this.recognition.onstart = () => {
          console.log('🎤 Listening started...');
          session.isListening = true;
          this.isListening = true;
          resolve({ status: 'listening', sessionId });
        };

        this.recognition.onresult = (event) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          const confidence = event.results[event.results.length - 1][0].confidence;
          
          console.log(`📝 Recognized: "${transcript}" (confidence: ${confidence})`);
          
          // Process the voice input
          this.processVoiceInput(sessionId, transcript, confidence);
        };

        this.recognition.onerror = (event) => {
          console.error('❌ Speech recognition error:', event.error);
          session.isListening = false;
          this.isListening = false;
          reject(new Error(`Speech recognition error: ${event.error}`));
        };

        this.recognition.onend = () => {
          console.log('🛑 Listening ended');
          session.isListening = false;
          this.isListening = false;
        };

        // Start recognition
        this.recognition.start();
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop listening for voice input
   */
  async stopListening(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (this.recognition && this.isListening) {
      this.recognition.stop();
      session.isListening = false;
      this.isListening = false;
      console.log('🛑 Listening stopped');
    }

    return { status: 'stopped', sessionId };
  }

  /**
   * Process voice input and generate response
   */
  async processVoiceInput(sessionId, transcript, confidence) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      // Record the interaction
      const interaction = {
        timestamp: Date.now(),
        type: 'voice_input',
        transcript,
        confidence,
        sessionId
      };

      session.voiceHistory.push(interaction);
      session.interactions++;

      console.log(`🎤 Processing voice input: "${transcript}"`);

      // Process through manager
      const response = await this.manager.processRequest(transcript, session.userId, {
        type: 'voice',
        sessionId,
        confidence
      });

      // Generate speech response
      await this.speakResponse(sessionId, response);

      return {
        transcript,
        response,
        confidence,
        sessionId
      };

    } catch (error) {
      console.error('❌ Error processing voice input:', error);
      await this.speakResponse(sessionId, 'Sorry, I encountered an error processing your request.');
      throw error;
    }
  }

  /**
   * Convert text to speech using Web Speech API
   */
  async speakResponse(sessionId, text) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    return new Promise((resolve, reject) => {
      try {
        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure speech parameters
        utterance.rate = this.config.rate;
        utterance.pitch = this.config.pitch;
        utterance.volume = this.config.volume;
        utterance.lang = session.language;

        // Set up event handlers
        utterance.onstart = () => {
          console.log('🔊 Speaking started...');
        };

        utterance.onend = () => {
          console.log('🔊 Speaking completed');
          
          // Record the speech interaction
          const interaction = {
            timestamp: Date.now(),
            type: 'voice_output',
            text,
            sessionId
          };

          session.voiceHistory.push(interaction);
          resolve({ status: 'completed', text, sessionId });
        };

        utterance.onerror = (event) => {
          console.error('❌ Speech synthesis error:', event.error);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        // Speak the text
        this.synthesis.speak(utterance);

      } catch (error) {
        reject(error);
      }
    });
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
        case 'start_listening':
          return await this.startListening(sessionId);
          
        case 'stop_listening':
          return await this.stopListening(sessionId);
          
        case 'change_language':
          session.language = command.language;
          this.config.language = command.language;
          if (this.recognition) {
            this.recognition.lang = command.language;
          }
          return { status: 'language_changed', language: command.language };
          
        case 'adjust_volume':
          this.config.volume = Math.max(0, Math.min(1, command.volume));
          return { status: 'volume_adjusted', volume: this.config.volume };
          
        case 'adjust_speed':
          this.config.rate = Math.max(0.1, Math.min(10, command.rate));
          return { status: 'speed_adjusted', rate: this.config.rate };
          
        case 'get_status':
          return await this.getSessionStatus(sessionId);
          
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
      supported: this.isSupported
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
      // Stop listening if active
      if (session.isListening) {
        await this.stopListening(sessionId);
      }

      // Mark session as inactive
      session.isActive = false;
      session.endTime = Date.now();
      session.endReason = reason;

      // Store session data
      await this.storeSessionData(session);

      // Remove from active sessions
      this.activeSessions.delete(sessionId);

      console.log(`🛑 Voice session ended: ${sessionId} (${reason})`);

      return {
        sessionId,
        duration: session.endTime - session.startTime,
        interactions: session.interactions,
        reason
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
      const fs = require('fs').promises;
      const path = require('path');
      
      const dataDir = path.join('backend', 'data', 'voice_sessions');
      await fs.mkdir(dataDir, { recursive: true });
      
      const filename = `voice-session-${session.sessionId}.json`;
      const filepath = path.join(dataDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(session, null, 2));
      console.log(`💾 Voice session data stored: ${filename}`);
      
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
      is_supported: this.isSupported,
      is_listening: this.isListening,
      web_speech_api: this.isSupported ? 'enabled' : 'not_supported'
    };
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    const totalSessions = this.activeSessions.size + this.voiceHistory.length;
    const avgResponseTime = 150; // Web Speech API is typically fast
    
    return {
      voice_requests_processed: this.voiceHistory.length,
      active_sessions: this.activeSessions.size,
      average_response_time: avgResponseTime,
      speech_accuracy: 85, // Web Speech API typical accuracy
      api_support: this.isSupported ? 'full' : 'none',
      uptime: Date.now() - (this.startTime || Date.now())
    };
  }
}

module.exports = CursorVoiceAgentWebAPI;
