/**
 * Simulation Dashboard - Visual Ping Pattern Display
 * Created by Cursor - Team Lead
 * 
 * Real-time simulation dashboard showing ping patterns
 * with visual, audio, and data representations
 */

const { EventEmitter } = require('events');
const PingPatternSystem = require('./PingPatternSystem');
const { logger } = require('../utils/logger');

// Create logger for Simulation Dashboard
const log = logger.child('SimulationDashboard');

/**
 * Simulation Dashboard
 * Visual dashboard for ping pattern simulation
 */
class SimulationDashboard extends EventEmitter {
  constructor() {
    super();
    this.pingSystem = new PingPatternSystem();
    this.isActive = false;
    this.updateInterval = null;
    this.displayWidth = 80;
    this.displayHeight = 24;
    
    // Initialize display
    this.display = this.createDisplay();
    
    // Setup ping system events
    this.setupPingSystemEvents();
    
    log.info('Simulation Dashboard initialized');
  }

  /**
   * Create display grid
   * @returns {Array} Display grid
   */
  createDisplay() {
    const grid = [];
    for (let y = 0; y < this.displayHeight; y++) {
      grid[y] = [];
      for (let x = 0; x < this.displayWidth; x++) {
        grid[y][x] = { char: ' ', color: 'white', intensity: 0 };
      }
    }
    return grid;
  }

  /**
   * Setup ping system events
   */
  setupPingSystemEvents() {
    this.pingSystem.on('pingSent', (pingData) => {
      this.handlePingSent(pingData);
    });

    this.pingSystem.on('patternReceived', (data) => {
      this.handlePatternReceived(data);
    });

    this.pingSystem.on('agentRegistered', (agent) => {
      this.handleAgentRegistered(agent);
    });
  }

  /**
   * Handle ping sent
   * @param {Object} pingData - Ping data
   */
  handlePingSent(pingData) {
    this.drawPingPattern(pingData);
    this.emit('pingSent', pingData);
  }

  /**
   * Handle pattern received
   * @param {Object} data - Pattern data
   */
  handlePatternReceived(data) {
    this.drawPatternReceived(data);
    this.emit('patternReceived', data);
  }

  /**
   * Handle agent registered
   * @param {Object} agent - Agent data
   */
  handleAgentRegistered(agent) {
    this.drawAgentStatus(agent);
    this.emit('agentRegistered', agent);
  }

  /**
   * Draw ping pattern on display
   * @param {Object} pingData - Ping data
   */
  drawPingPattern(pingData) {
    const { from, to, pattern } = pingData;
    
    // Clear previous patterns
    this.clearPatterns();
    
    // Draw based on pattern type
    switch (pattern.type) {
      case 'visual':
        this.drawVisualPattern(pattern, from, to);
        break;
      case 'audio':
        this.drawAudioPattern(pattern, from, to);
        break;
      case 'data':
        this.drawDataPattern(pattern, from, to);
        break;
      case 'quantum':
        this.drawQuantumPattern(pattern, from, to);
        break;
    }
  }

  /**
   * Draw visual pattern
   * @param {Object} pattern - Visual pattern
   * @param {string} from - Sender
   * @param {string} to - Receiver
   */
  drawVisualPattern(pattern, from, to) {
    const { animation, color, intensity } = pattern.data;
    
    switch (animation) {
      case 'wave':
        this.drawWave(from, to, color, intensity);
        break;
      case 'pulse':
        this.drawPulse(from, to, color, intensity);
        break;
      case 'spiral':
        this.drawSpiral(from, to, color, intensity);
        break;
      case 'grid':
        this.drawGrid(from, to, color, intensity);
        break;
      case 'dots':
        this.drawDots(from, to, color, intensity);
        break;
    }
  }

  /**
   * Draw wave pattern
   * @param {string} from - Sender
   * @param {string} to - Receiver
   * @param {string} color - Color
   * @param {number} intensity - Intensity
   */
  drawWave(from, to, color, intensity) {
    const centerY = Math.floor(this.displayHeight / 2);
    const startX = 5;
    const endX = this.displayWidth - 5;
    
    for (let x = startX; x < endX; x++) {
      const waveY = centerY + Math.sin((x - startX) * 0.3) * 3;
      if (waveY >= 0 && waveY < this.displayHeight) {
        this.setPixel(x, Math.floor(waveY), '~', color, intensity);
      }
    }
    
    // Add labels
    this.setPixel(2, centerY, from.charAt(0).toUpperCase(), 'green', 1);
    this.setPixel(endX + 1, centerY, to.charAt(0).toUpperCase(), 'blue', 1);
  }

  /**
   * Draw pulse pattern
   * @param {string} from - Sender
   * @param {string} to - Receiver
   * @param {string} color - Color
   * @param {number} intensity - Intensity
   */
  drawPulse(from, to, color, intensity) {
    const centerX = Math.floor(this.displayWidth / 2);
    const centerY = Math.floor(this.displayHeight / 2);
    
    // Draw expanding circles
    for (let r = 1; r <= 8; r++) {
      this.drawCircle(centerX, centerY, r, 'O', color, intensity / r);
    }
    
    // Add labels
    this.setPixel(centerX - 10, centerY, from.charAt(0).toUpperCase(), 'green', 1);
    this.setPixel(centerX + 10, centerY, to.charAt(0).toUpperCase(), 'blue', 1);
  }

  /**
   * Draw spiral pattern
   * @param {string} from - Sender
   * @param {string} to - Receiver
   * @param {string} color - Color
   * @param {number} intensity - Intensity
   */
  drawSpiral(from, to, color, intensity) {
    const centerX = Math.floor(this.displayWidth / 2);
    const centerY = Math.floor(this.displayHeight / 2);
    
    for (let t = 0; t < 4 * Math.PI; t += 0.1) {
      const r = t * 0.5;
      const x = centerX + Math.cos(t) * r;
      const y = centerY + Math.sin(t) * r;
      
      if (x >= 0 && x < this.displayWidth && y >= 0 && y < this.displayHeight) {
        this.setPixel(Math.floor(x), Math.floor(y), '*', color, intensity);
      }
    }
    
    // Add labels
    this.setPixel(centerX - 15, centerY, from.charAt(0).toUpperCase(), 'green', 1);
    this.setPixel(centerX + 15, centerY, to.charAt(0).toUpperCase(), 'blue', 1);
  }

  /**
   * Draw grid pattern
   * @param {string} from - Sender
   * @param {string} to - Receiver
   * @param {string} color - Color
   * @param {number} intensity - Intensity
   */
  drawGrid(from, to, color, intensity) {
    const startX = 10;
    const endX = this.displayWidth - 10;
    const startY = 5;
    const endY = this.displayHeight - 5;
    
    // Draw grid lines
    for (let x = startX; x < endX; x += 3) {
      for (let y = startY; y < endY; y += 2) {
        this.setPixel(x, y, '+', color, intensity);
      }
    }
    
    // Add labels
    this.setPixel(startX - 2, startY, from.charAt(0).toUpperCase(), 'green', 1);
    this.setPixel(endX + 2, endY, to.charAt(0).toUpperCase(), 'blue', 1);
  }

  /**
   * Draw dots pattern
   * @param {string} from - Sender
   * @param {string} to - Receiver
   * @param {string} color - Color
   * @param {number} intensity - Intensity
   */
  drawDots(from, to, color, intensity) {
    const centerX = Math.floor(this.displayWidth / 2);
    const centerY = Math.floor(this.displayHeight / 2);
    const count = 5;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * 8;
      const y = centerY + Math.sin(angle) * 4;
      
      if (x >= 0 && x < this.displayWidth && y >= 0 && y < this.displayHeight) {
        this.setPixel(Math.floor(x), Math.floor(y), '●', color, intensity);
      }
    }
    
    // Add labels
    this.setPixel(centerX - 12, centerY, from.charAt(0).toUpperCase(), 'green', 1);
    this.setPixel(centerX + 12, centerY, to.charAt(0).toUpperCase(), 'blue', 1);
  }

  /**
   * Draw audio pattern
   * @param {Object} pattern - Audio pattern
   * @param {string} from - Sender
   * @param {string} to - Receiver
   */
  drawAudioPattern(pattern, from, to) {
    const { sound, frequency, duration } = pattern.data;
    const centerY = Math.floor(this.displayHeight / 2);
    const startX = 5;
    const endX = this.displayWidth - 5;
    
    // Draw sound wave
    for (let x = startX; x < endX; x++) {
      const waveY = centerY + Math.sin((x - startX) * frequency * 0.01) * 2;
      if (waveY >= 0 && waveY < this.displayHeight) {
        this.setPixel(x, Math.floor(waveY), '♪', 'yellow', 1);
      }
    }
    
    // Add labels
    this.setPixel(2, centerY, from.charAt(0).toUpperCase(), 'green', 1);
    this.setPixel(endX + 1, centerY, to.charAt(0).toUpperCase(), 'blue', 1);
  }

  /**
   * Draw data pattern
   * @param {Object} pattern - Data pattern
   * @param {string} from - Sender
   * @param {string} to - Receiver
   */
  drawDataPattern(pattern, from, to) {
    const { status, progress, message } = pattern.data;
    const centerY = Math.floor(this.displayHeight / 2);
    const startX = 5;
    const endX = this.displayWidth - 5;
    
    // Draw data flow
    for (let x = startX; x < endX; x++) {
      const dataY = centerY + Math.sin((x - startX) * 0.2) * 1;
      if (dataY >= 0 && dataY < this.displayHeight) {
        this.setPixel(x, Math.floor(dataY), '█', 'cyan', 1);
      }
    }
    
    // Add labels
    this.setPixel(2, centerY, from.charAt(0).toUpperCase(), 'green', 1);
    this.setPixel(endX + 1, centerY, to.charAt(0).toUpperCase(), 'blue', 1);
  }

  /**
   * Draw quantum pattern
   * @param {Object} pattern - Quantum pattern
   * @param {string} from - Sender
   * @param {string} to - Receiver
   */
  drawQuantumPattern(pattern, from, to) {
    const { action, coherence } = pattern.data;
    const centerX = Math.floor(this.displayWidth / 2);
    const centerY = Math.floor(this.displayHeight / 2);
    
    // Draw quantum field
    for (let x = centerX - 10; x < centerX + 10; x++) {
      for (let y = centerY - 5; y < centerY + 5; y++) {
        if (x >= 0 && x < this.displayWidth && y >= 0 && y < this.displayHeight) {
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          if (distance < 8) {
            this.setPixel(x, y, '◊', 'magenta', coherence);
          }
        }
      }
    }
    
    // Add labels
    this.setPixel(centerX - 15, centerY, from.charAt(0).toUpperCase(), 'green', 1);
    this.setPixel(centerX + 15, centerY, to.charAt(0).toUpperCase(), 'blue', 1);
  }

  /**
   * Draw circle
   * @param {number} centerX - Center X
   * @param {number} centerY - Center Y
   * @param {number} radius - Radius
   * @param {string} char - Character
   * @param {string} color - Color
   * @param {number} intensity - Intensity
   */
  drawCircle(centerX, centerY, radius, char, color, intensity) {
    for (let angle = 0; angle < 2 * Math.PI; angle += 0.1) {
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (x >= 0 && x < this.displayWidth && y >= 0 && y < this.displayHeight) {
        this.setPixel(Math.floor(x), Math.floor(y), char, color, intensity);
      }
    }
  }

  /**
   * Set pixel on display
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} char - Character
   * @param {string} color - Color
   * @param {number} intensity - Intensity
   */
  setPixel(x, y, char, color, intensity) {
    if (x >= 0 && x < this.displayWidth && y >= 0 && y < this.displayHeight) {
      this.display[y][x] = { char, color, intensity };
    }
  }

  /**
   * Clear patterns from display
   */
  clearPatterns() {
    for (let y = 0; y < this.displayHeight; y++) {
      for (let x = 0; x < this.displayWidth; x++) {
        if (this.display[y][x].char !== ' ') {
          this.display[y][x] = { char: ' ', color: 'white', intensity: 0 };
        }
      }
    }
  }

  /**
   * Draw agent status
   * @param {Object} agent - Agent data
   */
  drawAgentStatus(agent) {
    const y = 1;
    const x = 2;
    
    // Draw agent info
    this.setPixel(x, y, agent.name.charAt(0).toUpperCase(), 'green', 1);
    this.setPixel(x + 2, y, ':', 'white', 1);
    this.setPixel(x + 4, y, agent.status.charAt(0).toUpperCase(), 'yellow', 1);
  }

  /**
   * Draw pattern received
   * @param {Object} data - Pattern data
   */
  drawPatternReceived(data) {
    const { agentId, patternData } = data;
    const y = this.displayHeight - 2;
    const x = 2;
    
    // Draw received pattern indicator
    this.setPixel(x, y, '◄', 'red', 1);
    this.setPixel(x + 2, y, agentId.charAt(0).toUpperCase(), 'red', 1);
    this.setPixel(x + 4, y, patternData.pattern.type.charAt(0).toUpperCase(), 'red', 1);
  }

  /**
   * Render display to console
   */
  render() {
    console.clear();
    console.log('\n' + '='.repeat(this.displayWidth));
    console.log('🎯 PING PATTERN SIMULATION DASHBOARD');
    console.log('='.repeat(this.displayWidth));
    
    // Render display grid
    for (let y = 0; y < this.displayHeight; y++) {
      let line = '';
      for (let x = 0; x < this.displayWidth; x++) {
        const pixel = this.display[y][x];
        line += pixel.char;
      }
      console.log(line);
    }
    
    console.log('='.repeat(this.displayWidth));
    
    // Show status
    const agents = this.pingSystem.getAllAgentsStatus();
    console.log(`\n📊 Agents: ${Object.keys(agents).length} | Patterns: ${this.pingSystem.getPatternHistory().length}`);
    
    // Show recent patterns
    const recentPatterns = this.pingSystem.getPatternHistory(5);
    if (recentPatterns.length > 0) {
      console.log('\n🔄 Recent Patterns:');
      recentPatterns.forEach(pattern => {
        const time = new Date(pattern.timestamp).toLocaleTimeString();
        console.log(`  [${time}] ${pattern.from} → ${pattern.to} (${pattern.pattern.type})`);
      });
    }
    
    console.log('\n' + '='.repeat(this.displayWidth) + '\n');
  }

  /**
   * Start simulation dashboard
   */
  start() {
    if (this.isActive) {
      log.warn('Dashboard already started');
      return;
    }

    this.isActive = true;
    
    // Start ping system
    this.pingSystem.start();
    
    // Update display every 100ms
    this.updateInterval = setInterval(() => {
      this.render();
    }, 100);

    log.info('Simulation Dashboard started');
  }

  /**
   * Stop simulation dashboard
   */
  stop() {
    if (!this.isActive) {
      log.warn('Dashboard not started');
      return;
    }

    this.isActive = false;
    
    // Stop ping system
    this.pingSystem.stop();
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    log.info('Simulation Dashboard stopped');
  }

  /**
   * Get ping system
   * @returns {PingPatternSystem} Ping system
   */
  getPingSystem() {
    return this.pingSystem;
  }
}

module.exports = SimulationDashboard;