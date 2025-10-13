/**
 * Smart Agent Dashboard - Individual Agent Dashboard with Ping System
 * Created by Cursor - Team Lead
 * 
 * Smart dashboard for each agent to connect to ping system
 * with real-time updates and interactive interface
 */

const { EventEmitter } = require('events');
const AIXPingSystem = require('./AIXPingSystem');
const { logger } = require('../utils/logger');

// Create logger for Smart Agent Dashboard
const log = logger.child('SmartAgentDashboard');

/**
 * Smart Agent Dashboard
 * Individual dashboard for each agent with ping system integration
 */
class SmartAgentDashboard extends EventEmitter {
  constructor(agentId, agentName, agentRole) {
    super();
    this.agentId = agentId;
    this.agentName = agentName;
    this.agentRole = agentRole;
    this.pingSystem = new AIXPingSystem();
    this.isActive = false;
    this.updateInterval = null;
    
    // Agent state
    this.agentState = {
      status: 'offline',
      lastPing: null,
      responseTime: 0,
      reliabilityScore: 100,
      currentTask: null,
      progress: 0,
      messages: [],
      notifications: []
    };
    
    // Ping system integration
    this.setupPingSystem();
    
    log.info(`Smart Agent Dashboard initialized for ${agentName} (${agentId})`);
  }

  /**
   * Setup ping system integration
   */
  setupPingSystem() {
    // Listen for ping events
    this.pingSystem.on('pingReceived', (ping) => {
      this.handlePingReceived(ping);
    });

    this.pingSystem.on('pongSent', (pong) => {
      this.handlePongSent(pong);
    });

    this.pingSystem.on('timeout', (ping) => {
      this.handlePingTimeout(ping);
    });
  }

  /**
   * Handle ping received
   * @param {Object} ping - Ping message
   */
  handlePingReceived(ping) {
    this.agentState.lastPing = ping;
    this.agentState.status = 'pinged';
    
    // Add notification
    this.addNotification({
      type: 'ping',
      priority: ping.priority,
      message: `Ping received from ${ping.fromAgent}`,
      data: ping
    });

    // Auto-respond to pings
    this.autoRespondToPing(ping);
    
    this.emit('pingReceived', ping);
    log.info('Ping received', { from: ping.fromAgent, priority: ping.priority });
  }

  /**
   * Handle pong sent
   * @param {Object} pong - Pong response
   */
  handlePongSent(pong) {
    this.agentState.status = 'online';
    this.agentState.responseTime = pong.responseTime;
    
    // Update reliability score
    this.updateReliabilityScore(pong.quality);
    
    this.emit('pongSent', pong);
    log.info('Pong sent', { responseTime: pong.responseTime, quality: pong.quality });
  }

  /**
   * Handle ping timeout
   * @param {Object} ping - Ping message
   */
  handlePingTimeout(ping) {
    this.agentState.status = 'timeout';
    
    // Add notification
    this.addNotification({
      type: 'timeout',
      priority: 'high',
      message: `Ping timeout from ${ping.fromAgent}`,
      data: ping
    });

    this.emit('pingTimeout', ping);
    log.warn('Ping timeout', { from: ping.fromAgent, priority: ping.priority });
  }

  /**
   * Auto-respond to ping
   * @param {Object} ping - Ping message
   */
  async autoRespondToPing(ping) {
    try {
      const responseTime = (Date.now() - ping.timestamp) / 1000;
      const quality = this.calculateResponseQuality(ping, responseTime);
      
      await this.pingSystem.receivePong({
        pingId: ping.pingId,
        fromAgent: this.agentId,
        status: 'online',
        message: `Auto-response from ${this.agentName}`,
        quality: quality
      });
      
      log.info('Auto-response sent', { pingId: ping.pingId, responseTime });
    } catch (error) {
      log.error('Auto-response failed', { error: error.message, pingId: ping.pingId });
    }
  }

  /**
   * Calculate response quality
   * @param {Object} ping - Ping message
   * @param {number} responseTime - Response time in seconds
   * @returns {number} Response quality
   */
  calculateResponseQuality(ping, responseTime) {
    if (ping.deadline === null) return 4; // Good for no deadline
    
    const timeUntilDeadline = (ping.deadline - ping.timestamp) / 1000;
    const percentageUsed = responseTime / timeUntilDeadline;
    
    if (percentageUsed <= 0.25) return 5; // Excellent
    if (percentageUsed <= 0.50) return 4; // Good
    if (percentageUsed <= 0.75) return 3; // Acceptable
    if (percentageUsed <= 1.0) return 2; // Poor
    return 1; // Failed
  }

  /**
   * Update reliability score
   * @param {number} quality - Response quality
   */
  updateReliabilityScore(quality) {
    const score = this.agentState.reliabilityScore;
    
    if (quality >= 4) {
      this.agentState.reliabilityScore = Math.min(100, score + 1);
    } else if (quality <= 2) {
      this.agentState.reliabilityScore = Math.max(0, score - 2);
    }
  }

  /**
   * Add notification
   * @param {Object} notification - Notification object
   */
  addNotification(notification) {
    const notificationData = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...notification
    };

    this.agentState.notifications.push(notificationData);
    
    // Keep only last 50 notifications
    if (this.agentState.notifications.length > 50) {
      this.agentState.notifications = this.agentState.notifications.slice(-50);
    }

    this.emit('notificationAdded', notificationData);
  }

  /**
   * Add message
   * @param {Object} message - Message object
   */
  addMessage(message) {
    const messageData = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...message
    };

    this.agentState.messages.push(messageData);
    
    // Keep only last 100 messages
    if (this.agentState.messages.length > 100) {
      this.agentState.messages = this.agentState.messages.slice(-100);
    }

    this.emit('messageAdded', messageData);
  }

  /**
   * Update current task
   * @param {Object} task - Task object
   */
  updateTask(task) {
    this.agentState.currentTask = task;
    this.agentState.progress = task.progress || 0;
    
    this.addNotification({
      type: 'task_update',
      priority: 'normal',
      message: `Task updated: ${task.title}`,
      data: task
    });

    this.emit('taskUpdated', task);
    log.info('Task updated', { taskId: task.id, progress: task.progress });
  }

  /**
   * Send ping to another agent
   * @param {string} toAgent - Target agent ID
   * @param {Object} options - Ping options
   */
  async sendPing(toAgent, options = {}) {
    try {
      const pingId = await this.pingSystem.pingAgent({
        fromAgent: this.agentId,
        toAgent: toAgent,
        priority: options.priority || 3,
        message: options.message || 'Ping from ' + this.agentName,
        requiresAction: options.requiresAction || false,
        context: options.context || {}
      });

      this.addNotification({
        type: 'ping_sent',
        priority: 'normal',
        message: `Ping sent to ${toAgent}`,
        data: { pingId, toAgent }
      });

      this.emit('pingSent', { pingId, toAgent });
      log.info('Ping sent', { pingId, toAgent });
      
      return pingId;
    } catch (error) {
      log.error('Ping send failed', { error: error.message, toAgent });
      throw error;
    }
  }

  /**
   * Get dashboard state
   * @returns {Object} Dashboard state
   */
  getDashboardState() {
    return {
      agent: {
        id: this.agentId,
        name: this.agentName,
        role: this.agentRole,
        status: this.agentState.status,
        lastPing: this.agentState.lastPing,
        responseTime: this.agentState.responseTime,
        reliabilityScore: this.agentState.reliabilityScore,
        currentTask: this.agentState.currentTask,
        progress: this.agentState.progress
      },
      messages: this.agentState.messages.slice(-20), // Last 20 messages
      notifications: this.agentState.notifications.slice(-10), // Last 10 notifications
      pingSystem: this.pingSystem.getSystemReport(),
      timestamp: Date.now()
    };
  }

  /**
   * Start dashboard
   */
  start() {
    if (this.isActive) {
      log.warn('Dashboard already started');
      return;
    }

    this.isActive = true;
    this.agentState.status = 'online';
    
    // Start ping system
    this.pingSystem.startMonitoring();
    
    // Update dashboard every 3 seconds
    this.updateInterval = setInterval(() => {
      this.emit('dashboardUpdate', this.getDashboardState());
    }, 3000);

    log.info(`Smart Agent Dashboard started for ${this.agentName}`);
  }

  /**
   * Stop dashboard
   */
  stop() {
    if (!this.isActive) {
      log.warn('Dashboard not started');
      return;
    }

    this.isActive = false;
    this.agentState.status = 'offline';
    
    // Stop ping system
    this.pingSystem.stopMonitoring();
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    log.info(`Smart Agent Dashboard stopped for ${this.agentName}`);
  }

  /**
   * Print dashboard to console
   */
  printDashboard() {
    const state = this.getDashboardState();
    
    console.log('\n' + '='.repeat(80));
    console.log(`🎯 SMART AGENT DASHBOARD - ${this.agentName.toUpperCase()}`);
    console.log('='.repeat(80));
    
    console.log(`\n🤖 Agent Status`);
    console.log('-'.repeat(80));
    console.log(`Name: ${this.agentName}`);
    console.log(`Role: ${this.agentRole}`);
    console.log(`Status: ${this.agentState.status}`);
    console.log(`Reliability Score: ${this.agentState.reliabilityScore}/100`);
    console.log(`Response Time: ${this.agentState.responseTime}s`);
    console.log(`Current Task: ${this.agentState.currentTask?.title || 'None'}`);
    console.log(`Progress: ${this.agentState.progress}%`);
    
    console.log(`\n📨 Recent Messages (Last 10)`);
    console.log('-'.repeat(80));
    
    state.messages.slice(-10).forEach(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      const from = msg.from || 'System';
      const to = msg.to || 'All';
      
      console.log(`[${time}] ${from} → ${to}`);
      if (msg.content) {
        console.log(`   ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
      }
    });
    
    console.log(`\n🔔 Recent Notifications (Last 5)`);
    console.log('-'.repeat(80));
    
    state.notifications.slice(-5).forEach(notif => {
      const time = new Date(notif.timestamp).toLocaleTimeString();
      const priority = notif.priority === 'high' ? '🔴' : 
                     notif.priority === 'normal' ? '🟡' : '🟢';
      
      console.log(`${priority} [${time}] ${notif.message}`);
    });
    
    console.log('='.repeat(80) + '\n');
  }

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return `${this.agentId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = SmartAgentDashboard;