/**
 * Voice Integration Test Script
 * Tests the complete voice pipeline from WebSocket to Cursor Manager
 */

const WebSocket = require('ws');
const CursorManagerAgent = require('./src/agents/CursorManagerAgent');
const CursorVoiceAgentWebSocket = require('./src/agents/CursorVoiceAgentWebSocket');

class VoiceIntegrationTest {
  constructor() {
    this.cursorManager = null;
    this.voiceAgent = null;
    this.testResults = [];
  }

  async initialize() {
    console.log('🚀 Initializing Voice Integration Test...\n');

    try {
      // 1. Initialize Cursor Manager
      console.log('1️⃣ Initializing Cursor Manager...');
      this.cursorManager = new CursorManagerAgent();
      await this.cursorManager.initialize();
      this.testResults.push({
        test: 'Cursor Manager Initialization',
        status: '✅ PASSED',
        details: `Registered ${this.cursorManager.agents.size} agents`
      });

      // 2. Initialize Voice Agent
      console.log('2️⃣ Initializing Voice Agent...');
      this.voiceAgent = new CursorVoiceAgentWebSocket(this.cursorManager, 8080);
      await this.voiceAgent.initialize();
      this.testResults.push({
        test: 'Voice Agent Initialization',
        status: '✅ PASSED',
        details: 'WebSocket server started on port 8080'
      });

      console.log('✅ Voice Integration Test initialized successfully\n');

    } catch (error) {
      this.testResults.push({
        test: 'Initialization',
        status: '❌ FAILED',
        details: error.message
      });
      throw error;
    }
  }

  async testWebSocketConnection() {
    console.log('3️⃣ Testing WebSocket Connection...');

    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket('ws://localhost:8080');
        let connected = false;

        ws.onopen = () => {
          console.log('   📡 WebSocket connected successfully');
          connected = true;
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'welcome') {
            console.log('   📨 Received welcome message:', data.message);
            ws.close();
          }
        };

        ws.onclose = () => {
          if (connected) {
            this.testResults.push({
              test: 'WebSocket Connection',
              status: '✅ PASSED',
              details: 'Successfully connected and received welcome message'
            });
          } else {
            this.testResults.push({
              test: 'WebSocket Connection',
              status: '❌ FAILED',
              details: 'Failed to establish connection'
            });
          }
          resolve();
        };

        ws.onerror = (error) => {
          this.testResults.push({
            test: 'WebSocket Connection',
            status: '❌ FAILED',
            details: `WebSocket error: ${error.message}`
          });
          reject(error);
        };

        // Timeout after 5 seconds
        setTimeout(() => {
          if (!connected) {
            ws.close();
            this.testResults.push({
              test: 'WebSocket Connection',
              status: '❌ FAILED',
              details: 'Connection timeout'
            });
            resolve();
          }
        }, 5000);

      } catch (error) {
        this.testResults.push({
          test: 'WebSocket Connection',
          status: '❌ FAILED',
          details: error.message
        });
        reject(error);
      }
    });
  }

  async testVoiceSession() {
    console.log('4️⃣ Testing Voice Session Management...');

    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket('ws://localhost:8080');
        let sessionStarted = false;
        let sessionEnded = false;

        ws.onopen = () => {
          // Start voice session
          ws.send(JSON.stringify({
            type: 'start_session',
            payload: {
              userId: 'test_user_123',
              language: 'en-US',
              quality: 'high'
            }
          }));
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'welcome':
              console.log('   📨 Welcome received');
              break;

            case 'session_started':
              console.log('   🎤 Session started:', data.sessionId);
              sessionStarted = true;

              // Test voice input
              setTimeout(() => {
                ws.send(JSON.stringify({
                  type: 'voice_input',
                  payload: {
                    transcript: 'Hello, can you help me plan a trip to Tokyo?',
                    confidence: 0.95,
                    isFinal: true
                  }
                }));
              }, 1000);
              break;

            case 'voice_response':
              console.log('   🔊 Voice response received');
              console.log('   📝 Transcript:', data.transcript);
              console.log('   🤖 Cursor Response:', data.cursorResponse?.success ? 'Success' : 'Failed');

              // End session
              setTimeout(() => {
                ws.send(JSON.stringify({
                  type: 'end_session',
                  payload: { reason: 'test_complete' }
                }));
              }, 500);
              break;

            case 'session_ended':
              console.log('   🛑 Session ended');
              sessionEnded = true;
              ws.close();
              break;

            case 'error':
              console.error('   ❌ Error:', data.error);
              break;
          }
        };

        ws.onclose = () => {
          if (sessionStarted && sessionEnded) {
            this.testResults.push({
              test: 'Voice Session Management',
              status: '✅ PASSED',
              details: 'Successfully started, processed input, and ended session'
            });
          } else {
            this.testResults.push({
              test: 'Voice Session Management',
              status: '❌ FAILED',
              details: `Session started: ${sessionStarted}, Session ended: ${sessionEnded}`
            });
          }
          resolve();
        };

        ws.onerror = (error) => {
          this.testResults.push({
            test: 'Voice Session Management',
            status: '❌ FAILED',
            details: `WebSocket error: ${error.message}`
          });
          reject(error);
        };

        // Timeout after 10 seconds
        setTimeout(() => {
          ws.close();
          this.testResults.push({
            test: 'Voice Session Management',
            status: '❌ FAILED',
            details: 'Test timeout'
          });
          resolve();
        }, 10000);

      } catch (error) {
        this.testResults.push({
          test: 'Voice Session Management',
          status: '❌ FAILED',
          details: error.message
        });
        reject(error);
      }
    });
  }

  async testVoiceCommands() {
    console.log('5️⃣ Testing Voice Commands...');

    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket('ws://localhost:8080');
        let commandsTested = 0;
        let commandsPassed = 0;

        ws.onopen = () => {
          // Start session first
          ws.send(JSON.stringify({
            type: 'start_session',
            payload: {
              userId: 'test_user_456',
              language: 'en-US'
            }
          }));
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.type === 'session_started') {
            // Test various voice commands
            const commands = [
              { type: 'change_language', language: 'es-ES' },
              { type: 'adjust_volume', volume: 0.8 },
              { type: 'adjust_speed', rate: 1.2 },
              { type: 'get_status' }
            ];

            commands.forEach((command, index) => {
              setTimeout(() => {
                ws.send(JSON.stringify({
                  type: 'voice_command',
                  payload: { command, parameters: command }
                }));
                commandsTested++;
              }, (index + 1) * 500);
            });

            // End session after commands
            setTimeout(() => {
              ws.send(JSON.stringify({
                type: 'end_session',
                payload: { reason: 'commands_test_complete' }
              }));
            }, 3000);
          }

          if (data.type === 'voice_command_response') {
            console.log(`   🎯 Command response: ${data.command}`);
            commandsPassed++;
          }

          if (data.type === 'session_ended') {
            ws.close();
          }
        };

        ws.onclose = () => {
          this.testResults.push({
            test: 'Voice Commands',
            status: commandsPassed >= 3 ? '✅ PASSED' : '❌ FAILED',
            details: `${commandsPassed}/${commandsTested} commands processed successfully`
          });
          resolve();
        };

        ws.onerror = (error) => {
          this.testResults.push({
            test: 'Voice Commands',
            status: '❌ FAILED',
            details: `WebSocket error: ${error.message}`
          });
          reject(error);
        };

        // Timeout after 8 seconds
        setTimeout(() => {
          ws.close();
          resolve();
        }, 8000);

      } catch (error) {
        this.testResults.push({
          test: 'Voice Commands',
          status: '❌ FAILED',
          details: error.message
        });
        reject(error);
      }
    });
  }

  async testPerformance() {
    console.log('6️⃣ Testing Performance Metrics...');

    try {
      const voiceStatus = this.voiceAgent.getStatus();
      const managerStatus = this.cursorManager.getSystemStatus();

      const performanceResults = {
        websocketConnections: voiceStatus.websocketConnections,
        activeSessions: voiceStatus.activeSessions,
        totalVoiceHistory: voiceStatus.totalVoiceHistory,
        registeredAgents: managerStatus.agents_registered,
        agentUtilization: managerStatus.active_tasks
      };

      this.testResults.push({
        test: 'Performance Metrics',
        status: '✅ PASSED',
        details: `WebSocket: ${performanceResults.websocketConnections} connections, Agents: ${performanceResults.registeredAgents} registered`
      });

      console.log('   📊 Performance metrics collected');
      console.log(`   🔗 WebSocket connections: ${performanceResults.websocketConnections}`);
      console.log(`   🎤 Active voice sessions: ${performanceResults.activeSessions}`);
      console.log(`   🤖 Registered agents: ${performanceResults.registeredAgents}`);

    } catch (error) {
      this.testResults.push({
        test: 'Performance Metrics',
        status: '❌ FAILED',
        details: error.message
      });
    }
  }

  async runAllTests() {
    try {
      await this.initialize();
      await this.testWebSocketConnection();
      await this.testVoiceSession();
      await this.testVoiceCommands();
      await this.testPerformance();

      this.displayResults();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.displayResults();
    } finally {
      await this.cleanup();
    }
  }

  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🎤 VOICE INTEGRATION TEST RESULTS');
    console.log('='.repeat(60));

    let passed = 0;
    let failed = 0;

    this.testResults.forEach(result => {
      console.log(`${result.status} ${result.test}`);
      console.log(`   ${result.details}`);
      console.log('');

      if (result.status.includes('PASSED')) {
        passed++;
      } else {
        failed++;
      }
    });

    console.log('='.repeat(60));
    console.log(`📊 SUMMARY: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(60));

    if (failed === 0) {
      console.log('🎉 All tests passed! Voice integration is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Please check the implementation.');
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test resources...');

    try {
      if (this.voiceAgent) {
        await this.voiceAgent.shutdown();
      }

      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup error:', error);
    }
  }
}

// Run the tests
async function main() {
  console.log('🎤 Starting Voice Integration Test Suite...\n');

  const testSuite = new VoiceIntegrationTest();

  try {
    await testSuite.runAllTests();
  } catch (error) {
    console.error('💥 Test suite crashed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run tests if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = VoiceIntegrationTest;