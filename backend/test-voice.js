#!/usr/bin/env node

/**
 * Voice Testing Script - Interactive Voice Testing Tool
 * Run this script to test voice integration interactively
 */

const readline = require('readline');
const { EnhancedCursorManagerAgent } = require('./src/agents/EnhancedCursorManagerAgent');

class VoiceTester {
  constructor() {
    this.cursorManager = null;
    this.activeSessionId = null;
    this.rl = null;
  }

  async initialize() {
    console.log('🎤 Initializing Voice Tester...\n');

    try {
      this.cursorManager = new EnhancedCursorManagerAgent({
        voiceEnabled: true,
        prometheusEnabled: false,
        tracingEnabled: false,
        quantumEdgeEnabled: false,
        patternLearningEnabled: false
      });

      await this.cursorManager.initialize();
      console.log('✅ Enhanced Cursor Manager initialized successfully\n');

      this.setupReadline();
      this.showWelcomeMessage();
      this.showCommands();

    } catch (error) {
      console.error('❌ Failed to initialize:', error.message);
      process.exit(1);
    }
  }

  setupReadline() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '🎤 Voice> '
    });

    this.rl.on('line', (input) => this.handleInput(input.trim()));
    this.rl.on('close', () => this.shutdown());
  }

  showWelcomeMessage() {
    console.log('🚀 Voice Integration Test Tool');
    console.log('=====================================\n');
    console.log('This tool allows you to test voice integration features:');
    console.log('• Start/end voice sessions');
    console.log('• Process voice input');
    console.log('• Test voice commands');
    console.log('• Monitor performance\n');
  }

  showCommands() {
    console.log('📋 Available Commands:');
    console.log('  start [language]     - Start a new voice session');
    console.log('  stop                 - End current voice session');
    console.log('  speak <text>         - Simulate voice input');
    console.log('  command <cmd>        - Execute voice command');
    console.log('  status               - Show session status');
    console.log('  sessions             - List active sessions');
    console.log('  metrics              - Show performance metrics');
    console.log('  test                 - Run automated tests');
    console.log('  help                 - Show this help');
    console.log('  quit                 - Exit the tool\n');
    this.rl.prompt();
  }

  async handleInput(input) {
    if (!input) {
      this.rl.prompt();
      return;
    }

    const [command, ...args] = input.split(' ');

    try {
      switch (command.toLowerCase()) {
        case 'start':
          await this.startSession(args[0] || 'en');
          break;
        case 'stop':
          await this.stopSession();
          break;
        case 'speak':
          await this.simulateVoiceInput(args.join(' '));
          break;
        case 'command':
          await this.executeVoiceCommand(args[0], args[1]);
          break;
        case 'status':
          await this.showStatus();
          break;
        case 'sessions':
          await this.showActiveSessions();
          break;
        case 'metrics':
          await this.showMetrics();
          break;
        case 'test':
          await this.runAutomatedTests();
          break;
        case 'help':
          this.showCommands();
          break;
        case 'quit':
        case 'exit':
          await this.shutdown();
          break;
        default:
          console.log(`❌ Unknown command: ${command}`);
          console.log('Type "help" for available commands\n');
      }
    } catch (error) {
      console.error(`❌ Error executing command: ${error.message}\n`);
    }

    this.rl.prompt();
  }

  async startSession(language = 'en') {
    console.log(`🎤 Starting voice session with language: ${language}...`);

    try {
      const result = await this.cursorManager.startVoiceSession('test-user', {
        language: language,
        voiceQuality: 'high',
        echoCancellation: true,
        noiseSuppression: true
      });

      if (result.success) {
        this.activeSessionId = result.sessionId;
        console.log(`✅ Voice session started successfully!`);
        console.log(`   Session ID: ${this.activeSessionId}`);
        console.log(`   Language: ${result.config.language}`);
        console.log(`   Quality: ${result.config.voiceQuality}\n`);
      } else {
        console.log(`❌ Failed to start voice session: ${result.error}\n`);
      }
    } catch (error) {
      console.error(`❌ Error starting voice session: ${error.message}\n`);
    }
  }

  async stopSession() {
    if (!this.activeSessionId) {
      console.log('❌ No active voice session to stop\n');
      return;
    }

    console.log('🛑 Stopping voice session...');

    try {
      const result = await this.cursorManager.voiceAgent.endVoiceSession(
        this.activeSessionId, 
        'user_request'
      );

      if (result.success) {
        console.log(`✅ Voice session stopped successfully!`);
        console.log(`   Duration: ${Math.round(result.duration / 1000)}s`);
        console.log(`   Interactions: ${result.interactions}\n`);
        this.activeSessionId = null;
      } else {
        console.log(`❌ Failed to stop voice session: ${result.error}\n`);
      }
    } catch (error) {
      console.error(`❌ Error stopping voice session: ${error.message}\n`);
    }
  }

  async simulateVoiceInput(text) {
    if (!this.activeSessionId) {
      console.log('❌ No active voice session. Start a session first.\n');
      return;
    }

    if (!text) {
      console.log('❌ Please provide text to simulate voice input\n');
      return;
    }

    console.log(`🗣️  Simulating voice input: "${text}"`);

    try {
      const voiceData = {
        audioData: Buffer.from(text),
        duration: text.length * 100, // Estimate duration
        format: 'wav',
        sampleRate: 44100
      };

      const result = await this.cursorManager.processVoiceInput(this.activeSessionId, voiceData);

      if (result.success) {
        console.log(`✅ Voice processing completed!`);
        console.log(`   Transcription: "${result.transcription}"`);
        console.log(`   Response: "${result.cursorResponse.result?.message || result.cursorResponse.error || 'No response'}"`);
        console.log(`   Audio Duration: ${Math.round(result.audioResponse.duration / 1000)}s\n`);
      } else {
        console.log(`❌ Voice processing failed: ${result.error}\n`);
      }
    } catch (error) {
      console.error(`❌ Error processing voice input: ${error.message}\n`);
    }
  }

  async executeVoiceCommand(command, value) {
    if (!this.activeSessionId) {
      console.log('❌ No active voice session. Start a session first.\n');
      return;
    }

    if (!command) {
      console.log('❌ Please provide a voice command\n');
      return;
    }

    console.log(`🎯 Executing voice command: ${command}`);

    try {
      let commandData = { type: command };
      
      if (value) {
        switch (command) {
          case 'change_language':
            commandData.language = value;
            break;
          case 'adjust_volume':
            commandData.volume = parseFloat(value);
            break;
        }
      }

      const result = await this.cursorManager.voiceAgent.processVoiceCommand(
        this.activeSessionId, 
        commandData
      );

      if (result.success) {
        console.log(`✅ Voice command executed: ${result.message}\n`);
      } else {
        console.log(`❌ Voice command failed: ${result.error}\n`);
      }
    } catch (error) {
      console.error(`❌ Error executing voice command: ${error.message}\n`);
    }
  }

  async showStatus() {
    if (!this.activeSessionId) {
      console.log('❌ No active voice session\n');
      return;
    }

    console.log('📊 Voice Session Status:');

    try {
      const status = this.cursorManager.voiceAgent.getSessionStatus(this.activeSessionId);

      if (status.success) {
        console.log(`   Session ID: ${status.sessionId}`);
        console.log(`   Status: ${status.status}`);
        console.log(`   Duration: ${Math.round(status.duration / 1000)}s`);
        console.log(`   Is Listening: ${status.isListening}`);
        console.log(`   Is Speaking: ${status.isSpeaking}`);
        console.log(`   Interactions: ${status.interactions}`);
        console.log(`   Language: ${status.config.language}`);
        console.log(`   Quality: ${status.config.voiceQuality}\n`);
      } else {
        console.log(`❌ Failed to get session status: ${status.error}\n`);
      }
    } catch (error) {
      console.error(`❌ Error getting session status: ${error.message}\n`);
    }
  }

  async showActiveSessions() {
    console.log('📋 Active Voice Sessions:');

    try {
      const sessions = this.cursorManager.voiceAgent.getActiveSessions();

      if (sessions.success) {
        if (sessions.activeSessions.length === 0) {
          console.log('   No active sessions\n');
        } else {
          sessions.activeSessions.forEach((session, index) => {
            console.log(`   ${index + 1}. Session: ${session.sessionId}`);
            console.log(`      User: ${session.userId}`);
            console.log(`      Duration: ${Math.round(session.duration / 1000)}s`);
            console.log(`      Interactions: ${session.interactions}`);
          });
          console.log(`\n   Total Active Sessions: ${sessions.totalActive}\n`);
        }
      } else {
        console.log(`❌ Failed to get active sessions\n`);
      }
    } catch (error) {
      console.error(`❌ Error getting active sessions: ${error.message}\n`);
    }
  }

  async showMetrics() {
    console.log('📈 Voice Performance Metrics:');

    try {
      const metrics = this.cursorManager.voiceAgent.performance;

      console.log(`   Voice Requests Processed: ${metrics.voiceRequestsProcessed}`);
      console.log(`   Average Response Time: ${Math.round(metrics.averageResponseTime)}ms`);
      console.log(`   Speech Accuracy: ${metrics.speechAccuracy}%`);
      console.log(`   Last Voice Request: ${metrics.lastVoiceRequest || 'None'}`);
      console.log(`   Active Sessions: ${this.cursorManager.voiceAgent.activeSessions.size}`);
      console.log(`   Total Voice History: ${this.cursorManager.voiceAgent.voiceHistory.length}\n`);
    } catch (error) {
      console.error(`❌ Error getting metrics: ${error.message}\n`);
    }
  }

  async runAutomatedTests() {
    console.log('🧪 Running Automated Voice Tests...\n');

    try {
      // Test 1: Session Management
      console.log('Test 1: Session Management');
      const sessionResult = await this.cursorManager.startVoiceSession('auto-test-user');
      if (sessionResult.success) {
        console.log('✅ Session creation test passed');
        
        // Test 2: Voice Processing
        console.log('Test 2: Voice Processing');
        const voiceResult = await this.cursorManager.processVoiceInput(sessionResult.sessionId, {
          audioData: Buffer.from('Automated test voice input'),
          duration: 2000
        });
        
        if (voiceResult.success) {
          console.log('✅ Voice processing test passed');
        } else {
          console.log('❌ Voice processing test failed');
        }

        // Test 3: Voice Commands
        console.log('Test 3: Voice Commands');
        const commandResult = await this.cursorManager.voiceAgent.processVoiceCommand(
          sessionResult.sessionId, 
          { type: 'get_status' }
        );
        
        if (commandResult.success) {
          console.log('✅ Voice command test passed');
        } else {
          console.log('❌ Voice command test failed');
        }

        // Cleanup
        await this.cursorManager.voiceAgent.endVoiceSession(sessionResult.sessionId);
        console.log('✅ Session cleanup completed');
      } else {
        console.log('❌ Session creation test failed');
      }

      console.log('\n🎉 Automated tests completed!\n');
    } catch (error) {
      console.error(`❌ Error running automated tests: ${error.message}\n`);
    }
  }

  async shutdown() {
    console.log('\n🛑 Shutting down Voice Tester...');

    try {
      if (this.activeSessionId) {
        await this.cursorManager.voiceAgent.endVoiceSession(this.activeSessionId);
        console.log('✅ Active voice session ended');
      }

      if (this.cursorManager) {
        await this.cursorManager.shutdown();
        console.log('✅ Cursor Manager shut down');
      }

      if (this.rl) {
        this.rl.close();
      }

      console.log('👋 Goodbye!\n');
      process.exit(0);
    } catch (error) {
      console.error(`❌ Error during shutdown: ${error.message}`);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const tester = new VoiceTester();
  
  // Handle process termination
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Received SIGINT, shutting down gracefully...');
    await tester.shutdown();
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n🛑 Received SIGTERM, shutting down gracefully...');
    await tester.shutdown();
  });

  await tester.initialize();
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = VoiceTester;
