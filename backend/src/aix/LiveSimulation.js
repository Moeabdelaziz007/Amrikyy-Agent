/**
 * Live Simulation - Real-time Ping Pattern Simulation
 * Created by Cursor - Team Lead
 * 
 * Live simulation system for testing ping patterns
 * with interactive controls and real-time display
 */

const SimulationDashboard = require('./SimulationDashboard');
const { logger } = require('../utils/logger');

// Create logger for Live Simulation
const log = logger.child('LiveSimulation');

/**
 * Live Simulation System
 * Real-time ping pattern simulation with interactive controls
 */
class LiveSimulation {
  constructor() {
    this.dashboard = new SimulationDashboard();
    this.pingSystem = this.dashboard.getPingSystem();
    this.isRunning = false;
    this.agents = new Map();
    
    // Setup event listeners
    this.setupEventListeners();
    
    log.info('Live Simulation initialized');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.dashboard.on('pingSent', (pingData) => {
      log.info('Ping sent', { 
        from: pingData.from, 
        to: pingData.to, 
        pattern: pingData.pattern.type 
      });
    });

    this.dashboard.on('patternReceived', (data) => {
      log.info('Pattern received', { 
        agentId: data.agentId, 
        patternType: data.patternData.pattern.type 
      });
    });

    this.dashboard.on('agentRegistered', (agent) => {
      log.info('Agent registered', { 
        id: agent.id, 
        name: agent.name, 
        capabilities: agent.capabilities 
      });
    });
  }

  /**
   * Initialize simulation with team agents
   */
  async initialize() {
    log.info('Initializing live simulation...');

    // Register team agents
    await this.registerAgent('cursor', {
      name: 'Cursor',
      role: 'Team Lead & Coordinator'
    }, ['visual', 'audio', 'data', 'quantum']);

    await this.registerAgent('ona', {
      name: 'ONA',
      role: 'Documentation & Testing Specialist'
    }, ['visual', 'data']);

    await this.registerAgent('gemini', {
      name: 'Gemini 2.5',
      role: 'Parser & Security Expert'
    }, ['visual', 'audio', 'data', 'quantum']);

    log.info('Live simulation initialized with team agents');
  }

  /**
   * Register agent
   * @param {string} agentId - Agent ID
   * @param {Object} agentInfo - Agent information
   * @param {Array} capabilities - Pattern capabilities
   */
  async registerAgent(agentId, agentInfo, capabilities) {
    await this.pingSystem.registerAgent(agentId, agentInfo, capabilities);
    this.agents.set(agentId, { ...agentInfo, capabilities });
  }

  /**
   * Start live simulation
   */
  start() {
    if (this.isRunning) {
      log.warn('Simulation already running');
      return;
    }

    this.isRunning = true;
    this.dashboard.start();
    
    log.info('Live simulation started');
  }

  /**
   * Stop live simulation
   */
  stop() {
    if (!this.isRunning) {
      log.warn('Simulation not running');
      return;
    }

    this.isRunning = false;
    this.dashboard.stop();
    
    log.info('Live simulation stopped');
  }

  /**
   * Send visual pattern
   * @param {string} from - Sender agent ID
   * @param {string} to - Target agent ID
   * @param {string} patternType - Pattern type
   * @param {Object} options - Pattern options
   */
  async sendVisualPattern(from, to, patternType, options = {}) {
    const pattern = this.pingSystem.createVisualPattern(patternType, options);
    return await this.pingSystem.sendPingWithPattern(from, to, pattern, {
      message: `Visual ${patternType} pattern from ${from} to ${to}`,
      priority: options.priority || 'normal'
    });
  }

  /**
   * Send audio pattern
   * @param {string} from - Sender agent ID
   * @param {string} to - Target agent ID
   * @param {string} patternType - Pattern type
   * @param {Object} options - Pattern options
   */
  async sendAudioPattern(from, to, patternType, options = {}) {
    const pattern = this.pingSystem.createAudioPattern(patternType, options);
    return await this.pingSystem.sendPingWithPattern(from, to, pattern, {
      message: `Audio ${patternType} pattern from ${from} to ${to}`,
      priority: options.priority || 'normal'
    });
  }

  /**
   * Send data pattern
   * @param {string} from - Sender agent ID
   * @param {string} to - Target agent ID
   * @param {string} patternType - Pattern type
   * @param {Object} options - Pattern options
   */
  async sendDataPattern(from, to, patternType, options = {}) {
    const pattern = this.pingSystem.createDataPattern(patternType, options);
    return await this.pingSystem.sendPingWithPattern(from, to, pattern, {
      message: `Data ${patternType} pattern from ${from} to ${to}`,
      priority: options.priority || 'normal'
    });
  }

  /**
   * Send quantum pattern
   * @param {string} from - Sender agent ID
   * @param {string} to - Target agent ID
   * @param {string} patternType - Pattern type
   * @param {Object} options - Pattern options
   */
  async sendQuantumPattern(from, to, patternType, options = {}) {
    const pattern = this.pingSystem.createQuantumPattern(patternType, options);
    return await this.pingSystem.sendPingWithPattern(from, to, pattern, {
      message: `Quantum ${patternType} pattern from ${from} to ${to}`,
      priority: options.priority || 'normal'
    });
  }

  /**
   * Run demo sequence
   */
  async runDemo() {
    log.info('Running demo sequence...');

    const patterns = [
      // Visual patterns
      { type: 'visual', pattern: 'wave', from: 'cursor', to: 'ona', options: { color: '#00ff00' } },
      { type: 'visual', pattern: 'pulse', from: 'cursor', to: 'gemini', options: { color: '#ff0000' } },
      { type: 'visual', pattern: 'spiral', from: 'gemini', to: 'ona', options: { color: '#0000ff' } },
      { type: 'visual', pattern: 'grid', from: 'ona', to: 'cursor', options: { color: '#ffff00' } },
      { type: 'visual', pattern: 'dots', from: 'gemini', to: 'cursor', options: { color: '#ff00ff' } },
      
      // Audio patterns
      { type: 'audio', pattern: 'beep', from: 'cursor', to: 'ona', options: { frequency: 1000 } },
      { type: 'audio', pattern: 'chime', from: 'ona', to: 'gemini', options: { frequency: 800 } },
      { type: 'audio', pattern: 'melody', from: 'gemini', to: 'cursor', options: { notes: ['C4', 'E4', 'G4'] } },
      
      // Data patterns
      { type: 'data', pattern: 'status', from: 'ona', to: 'cursor', options: { status: 'working', progress: 50 } },
      { type: 'data', pattern: 'progress', from: 'gemini', to: 'cursor', options: { task: 'optimization', progress: 75 } },
      { type: 'data', pattern: 'alert', from: 'cursor', to: 'ona', options: { level: 'info', message: 'Task update' } },
      
      // Quantum patterns
      { type: 'quantum', pattern: 'entangle', from: 'cursor', to: 'gemini', options: { coherence: 0.95 } },
      { type: 'quantum', pattern: 'superpose', from: 'gemini', to: 'ona', options: { states: ['|0⟩', '|1⟩'] } },
      { type: 'quantum', pattern: 'interfere', from: 'ona', to: 'cursor', options: { waves: 2 } }
    ];

    for (const pattern of patterns) {
      try {
        let pingId;
        
        switch (pattern.type) {
          case 'visual':
            pingId = await this.sendVisualPattern(pattern.from, pattern.to, pattern.pattern, pattern.options);
            break;
          case 'audio':
            pingId = await this.sendAudioPattern(pattern.from, pattern.to, pattern.pattern, pattern.options);
            break;
          case 'data':
            pingId = await this.sendDataPattern(pattern.from, pattern.to, pattern.pattern, pattern.options);
            break;
          case 'quantum':
            pingId = await this.sendQuantumPattern(pattern.from, pattern.to, pattern.pattern, pattern.options);
            break;
        }
        
        log.info('Demo pattern sent', { 
          type: pattern.type, 
          pattern: pattern.pattern, 
          from: pattern.from, 
          to: pattern.to,
          pingId 
        });
        
        // Wait between patterns
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        log.error('Demo pattern failed', { 
          error: error.message, 
          pattern: pattern.pattern 
        });
      }
    }

    log.info('Demo sequence completed');
  }

  /**
   * Get simulation status
   * @returns {Object} Simulation status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      agents: Object.fromEntries(this.agents),
      pingSystem: this.pingSystem.getAllAgentsStatus(),
      patterns: this.pingSystem.getPatternHistory().length
    };
  }
}

module.exports = LiveSimulation;