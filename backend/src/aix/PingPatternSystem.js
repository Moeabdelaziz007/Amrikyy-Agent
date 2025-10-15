/**
 * Ping Pattern System - Advanced Ping with Patterns
 * Created by Cursor - Team Lead
 * 
 * System where when someone pings, they send a pattern to others
 * Patterns can be visual, audio, or data-based for team coordination
 */

const { EventEmitter } = require('events');
const { logger } = require('../utils/logger');

// Create logger for Ping Pattern System
const log = logger.child('PingPatternSystem');

/**
 * Ping Pattern System
 * Advanced ping system with pattern distribution
 */
class PingPatternSystem extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.patterns = new Map();
    this.patternHistory = [];
    this.isActive = false;
    
    // Initialize pattern types
    this.initializePatternTypes();
    
    log.info('Ping Pattern System initialized');
  }

  /**
   * Initialize pattern types
   */
  initializePatternTypes() {
    this.patternTypes = {
      visual: {
        name: 'Visual Pattern',
        description: 'Visual patterns for display',
        examples: ['wave', 'pulse', 'spiral', 'grid', 'dots']
      },
      audio: {
        name: 'Audio Pattern',
        description: 'Audio patterns for sound',
        examples: ['beep', 'chime', 'tone', 'melody', 'rhythm']
      },
      data: {
        name: 'Data Pattern',
        description: 'Data patterns for information',
        examples: ['status', 'progress', 'alert', 'update', 'sync']
      },
      quantum: {
        name: 'Quantum Pattern',
        description: 'Quantum patterns for coordination',
        examples: ['entangle', 'superpose', 'interfere', 'tunnel', 'measure']
      }
    };
  }

  /**
   * Register agent with pattern capabilities
   * @param {string} agentId - Agent ID
   * @param {Object} agentInfo - Agent information
   * @param {Array} patternCapabilities - Pattern capabilities
   */
  registerAgent(agentId, agentInfo, patternCapabilities = []) {
    const agent = {
      id: agentId,
      name: agentInfo.name,
      role: agentInfo.role,
      capabilities: patternCapabilities,
      status: 'online',
      lastSeen: Date.now(),
      patternCount: 0,
      responseTime: 0
    };

    this.agents.set(agentId, agent);
    this.emit('agentRegistered', agent);
    
    log.info('Agent registered with pattern capabilities', { 
      agentId, 
      capabilities: patternCapabilities 
    });
  }

  /**
   * Send ping with pattern to specific agent
   * @param {string} fromAgent - Sender agent ID
   * @param {string} toAgent - Target agent ID
   * @param {Object} pattern - Pattern to send
   * @param {Object} options - Ping options
   */
  async sendPingWithPattern(fromAgent, toAgent, pattern, options = {}) {
    const pingId = this.generatePingId();
    const timestamp = Date.now();
    
    const pingData = {
      id: pingId,
      from: fromAgent,
      to: toAgent,
      pattern: pattern,
      priority: options.priority || 'normal',
      message: options.message || 'Ping with pattern',
      timestamp: timestamp,
      deadline: options.deadline || null,
      requiresAction: options.requiresAction || false,
      context: options.context || {}
    };

    // Store pattern
    this.patterns.set(pingId, pattern);
    
    // Add to history
    this.patternHistory.push({
      pingId,
      from: fromAgent,
      to: toAgent,
      pattern: pattern,
      timestamp: timestamp
    });

    // Keep only last 100 patterns
    if (this.patternHistory.length > 100) {
      this.patternHistory = this.patternHistory.slice(-100);
    }

    // Update agent stats
    const agent = this.agents.get(fromAgent);
    if (agent) {
      agent.patternCount++;
      agent.lastSeen = timestamp;
    }

    // Emit ping event
    this.emit('pingSent', pingData);
    
    // Distribute pattern to other agents
    await this.distributePattern(pingData);
    
    log.info('Ping with pattern sent', { 
      pingId, 
      from: fromAgent, 
      to: toAgent, 
      patternType: pattern.type 
    });

    return pingId;
  }

  /**
   * Distribute pattern to other agents
   * @param {Object} pingData - Ping data
   */
  async distributePattern(pingData) {
    const { from, to, pattern } = pingData;
    
    // Send pattern to all agents except sender
    for (const [agentId, agent] of this.agents) {
      if (agentId !== from && agentId !== to) {
        // Check if agent can handle this pattern type
        if (agent.capabilities.includes(pattern.type)) {
          await this.sendPatternToAgent(agentId, pingData);
        }
      }
    }
  }

  /**
   * Send pattern to specific agent
   * @param {string} agentId - Target agent ID
   * @param {Object} pingData - Ping data
   */
  async sendPatternToAgent(agentId, pingData) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const patternData = {
      pingId: pingData.id,
      from: pingData.from,
      to: pingData.to,
      pattern: pingData.pattern,
      timestamp: pingData.timestamp,
      context: pingData.context
    };

    // Emit pattern event for the agent
    this.emit('patternReceived', { agentId, patternData });
    
    // Update agent stats
    agent.lastSeen = Date.now();
    
    log.info('Pattern sent to agent', { 
      agentId, 
      patternType: pingData.pattern.type,
      from: pingData.from
    });
  }

  /**
   * Create visual pattern
   * @param {string} type - Pattern type
   * @param {Object} options - Pattern options
   * @returns {Object} Visual pattern
   */
  createVisualPattern(type, options = {}) {
    const patterns = {
      wave: {
        type: 'visual',
        name: 'Wave Pattern',
        data: {
          animation: 'wave',
          duration: options.duration || 1000,
          intensity: options.intensity || 1,
          color: options.color || '#00ff00',
          direction: options.direction || 'right'
        }
      },
      pulse: {
        type: 'visual',
        name: 'Pulse Pattern',
        data: {
          animation: 'pulse',
          duration: options.duration || 500,
          intensity: options.intensity || 1,
          color: options.color || '#ff0000',
          frequency: options.frequency || 2
        }
      },
      spiral: {
        type: 'visual',
        name: 'Spiral Pattern',
        data: {
          animation: 'spiral',
          duration: options.duration || 2000,
          intensity: options.intensity || 1,
          color: options.color || '#0000ff',
          direction: options.direction || 'clockwise'
        }
      },
      grid: {
        type: 'visual',
        name: 'Grid Pattern',
        data: {
          animation: 'grid',
          duration: options.duration || 1500,
          intensity: options.intensity || 1,
          color: options.color || '#ffff00',
          size: options.size || 10
        }
      },
      dots: {
        type: 'visual',
        name: 'Dots Pattern',
        data: {
          animation: 'dots',
          duration: options.duration || 800,
          intensity: options.intensity || 1,
          color: options.color || '#ff00ff',
          count: options.count || 5
        }
      }
    };

    return patterns[type] || patterns.wave;
  }

  /**
   * Create audio pattern
   * @param {string} type - Pattern type
   * @param {Object} options - Pattern options
   * @returns {Object} Audio pattern
   */
  createAudioPattern(type, options = {}) {
    const patterns = {
      beep: {
        type: 'audio',
        name: 'Beep Pattern',
        data: {
          sound: 'beep',
          frequency: options.frequency || 1000,
          duration: options.duration || 200,
          volume: options.volume || 0.5,
          repeat: options.repeat || 1
        }
      },
      chime: {
        type: 'audio',
        name: 'Chime Pattern',
        data: {
          sound: 'chime',
          frequency: options.frequency || 800,
          duration: options.duration || 500,
          volume: options.volume || 0.7,
          repeat: options.repeat || 1
        }
      },
      tone: {
        type: 'audio',
        name: 'Tone Pattern',
        data: {
          sound: 'tone',
          frequency: options.frequency || 1200,
          duration: options.duration || 300,
          volume: options.volume || 0.6,
          repeat: options.repeat || 2
        }
      },
      melody: {
        type: 'audio',
        name: 'Melody Pattern',
        data: {
          sound: 'melody',
          notes: options.notes || ['C4', 'E4', 'G4'],
          duration: options.duration || 1000,
          volume: options.volume || 0.8,
          repeat: options.repeat || 1
        }
      },
      rhythm: {
        type: 'audio',
        name: 'Rhythm Pattern',
        data: {
          sound: 'rhythm',
          pattern: options.pattern || [1, 0, 1, 0],
          duration: options.duration || 800,
          volume: options.volume || 0.6,
          repeat: options.repeat || 3
        }
      }
    };

    return patterns[type] || patterns.beep;
  }

  /**
   * Create data pattern
   * @param {string} type - Pattern type
   * @param {Object} options - Pattern options
   * @returns {Object} Data pattern
   */
  createDataPattern(type, options = {}) {
    const patterns = {
      status: {
        type: 'data',
        name: 'Status Pattern',
        data: {
          status: options.status || 'active',
          progress: options.progress || 0,
          message: options.message || 'Status update',
          timestamp: Date.now()
        }
      },
      progress: {
        type: 'data',
        name: 'Progress Pattern',
        data: {
          task: options.task || 'unknown',
          progress: options.progress || 0,
          stage: options.stage || 'working',
          eta: options.eta || null,
          timestamp: Date.now()
        }
      },
      alert: {
        type: 'data',
        name: 'Alert Pattern',
        data: {
          level: options.level || 'info',
          message: options.message || 'Alert',
          action: options.action || 'none',
          timestamp: Date.now()
        }
      },
      update: {
        type: 'data',
        name: 'Update Pattern',
        data: {
          version: options.version || '1.0.0',
          changes: options.changes || [],
          timestamp: Date.now()
        }
      },
      sync: {
        type: 'data',
        name: 'Sync Pattern',
        data: {
          state: options.state || 'syncing',
          data: options.data || {},
          timestamp: Date.now()
        }
      }
    };

    return patterns[type] || patterns.status;
  }

  /**
   * Create quantum pattern
   * @param {string} type - Pattern type
   * @param {Object} options - Pattern options
   * @returns {Object} Quantum pattern
   */
  createQuantumPattern(type, options = {}) {
    const patterns = {
      entangle: {
        type: 'quantum',
        name: 'Entanglement Pattern',
        data: {
          action: 'entangle',
          particles: options.particles || 2,
          coherence: options.coherence || 0.95,
          timestamp: Date.now()
        }
      },
      superpose: {
        type: 'quantum',
        name: 'Superposition Pattern',
        data: {
          action: 'superpose',
          states: options.states || ['|0⟩', '|1⟩'],
          probability: options.probability || 0.5,
          timestamp: Date.now()
        }
      },
      interfere: {
        type: 'quantum',
        name: 'Interference Pattern',
        data: {
          action: 'interfere',
          waves: options.waves || 2,
          phase: options.phase || 0,
          timestamp: Date.now()
        }
      },
      tunnel: {
        type: 'quantum',
        name: 'Tunneling Pattern',
        data: {
          action: 'tunnel',
          barrier: options.barrier || 1.0,
          probability: options.probability || 0.1,
          timestamp: Date.now()
        }
      },
      measure: {
        type: 'quantum',
        name: 'Measurement Pattern',
        data: {
          action: 'measure',
          observable: options.observable || 'position',
          value: options.value || 0,
          timestamp: Date.now()
        }
      }
    };

    return patterns[type] || patterns.entangle;
  }

  /**
   * Get pattern by ID
   * @param {string} pingId - Ping ID
   * @returns {Object} Pattern data
   */
  getPattern(pingId) {
    return this.patterns.get(pingId);
  }

  /**
   * Get pattern history
   * @param {number} limit - Number of patterns to return
   * @returns {Array} Pattern history
   */
  getPatternHistory(limit = 20) {
    return this.patternHistory.slice(-limit);
  }

  /**
   * Get agent status
   * @param {string} agentId - Agent ID
   * @returns {Object} Agent status
   */
  getAgentStatus(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return { error: 'Agent not found' };
    }

    return {
      ...agent,
      isActive: Date.now() - agent.lastSeen < 300000, // Active if seen within 5 minutes
      lastSeenFormatted: new Date(agent.lastSeen).toISOString()
    };
  }

  /**
   * Get all agents status
   * @returns {Object} All agents status
   */
  getAllAgentsStatus() {
    const agents = {};
    
    for (const [agentId, agent] of this.agents) {
      agents[agentId] = this.getAgentStatus(agentId);
    }
    
    return agents;
  }

  /**
   * Generate unique ping ID
   * @returns {string} Ping ID
   */
  generatePingId() {
    return `ping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start pattern system
   */
  start() {
    if (this.isActive) {
      log.warn('Pattern system already started');
      return;
    }

    this.isActive = true;
    log.info('Ping Pattern System started');
  }

  /**
   * Stop pattern system
   */
  stop() {
    if (!this.isActive) {
      log.warn('Pattern system not started');
      return;
    }

    this.isActive = false;
    log.info('Ping Pattern System stopped');
  }
}

module.exports = PingPatternSystem;