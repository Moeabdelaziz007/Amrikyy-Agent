/**
 * Team Dashboard - Live Real-time Dashboard for AIX Team
 * Created by Cursor - Team Lead
 * 
 * Live dashboard showing all team messages, progress, and coordination
 * in one unified interface for real-time team collaboration
 */

const { EventEmitter } = require('events');
const { logger } = require('../utils/logger');

// Create logger for Team Dashboard
const log = logger.child('TeamDashboard');

/**
 * Team Dashboard - Live Real-time Dashboard
 * Shows all team messages, progress, and coordination in one place
 */
class TeamDashboard extends EventEmitter {
  constructor() {
    super();
    this.messages = [];
    this.teamStatus = new Map();
    this.progress = new Map();
    this.isActive = false;
    this.updateInterval = null;
    
    // Initialize team members
    this.initializeTeam();
    
    log.info('Team Dashboard initialized');
  }

  /**
   * Initialize team members
   */
  initializeTeam() {
    const teamMembers = [
      { id: 'cursor', name: 'Cursor', role: 'Team Lead & Coordinator', status: 'active' },
      { id: 'ona', name: 'ONA', role: 'Documentation & Testing Specialist', status: 'ready' },
      { id: 'gemini', name: 'Gemini 2.5', role: 'Parser & Security Expert', status: 'ready' }
    ];

    teamMembers.forEach(member => {
      this.teamStatus.set(member.id, {
        ...member,
        lastSeen: Date.now(),
        messageCount: 0,
        currentTask: null,
        progress: 0
      });
    });
  }

  /**
   * Add message to dashboard
   * @param {Object} message - Message object
   */
  addMessage(message) {
    const messageData = {
      id: this.generateMessageId(),
      timestamp: Date.now(),
      ...message
    };

    this.messages.push(messageData);
    
    // Keep only last 100 messages
    if (this.messages.length > 100) {
      this.messages = this.messages.slice(-100);
    }

    // Update team status
    if (message.from) {
      const member = this.teamStatus.get(message.from);
      if (member) {
        member.lastSeen = Date.now();
        member.messageCount++;
      }
    }

    // Emit event for real-time updates
    this.emit('messageAdded', messageData);
    
    log.info('Message added to dashboard', { 
      from: message.from, 
      to: message.to, 
      type: message.type 
    });
  }

  /**
   * Update team member progress
   * @param {string} memberId - Team member ID
   * @param {Object} progressData - Progress data
   */
  updateProgress(memberId, progressData) {
    const member = this.teamStatus.get(memberId);
    if (member) {
      member.progress = progressData.progress || member.progress;
      member.currentTask = progressData.currentTask || member.currentTask;
      member.status = progressData.status || member.status;
      member.lastSeen = Date.now();
      
      this.progress.set(memberId, {
        ...progressData,
        timestamp: Date.now()
      });

      // Emit event for real-time updates
      this.emit('progressUpdated', { memberId, progressData });
      
      log.info('Progress updated', { memberId, progress: progressData.progress });
    }
  }

  /**
   * Get current dashboard state
   * @returns {Object} Dashboard state
   */
  getDashboardState() {
    return {
      timestamp: Date.now(),
      teamStatus: Object.fromEntries(this.teamStatus),
      progress: Object.fromEntries(this.progress),
      recentMessages: this.messages.slice(-20), // Last 20 messages
      totalMessages: this.messages.length,
      activeMembers: Array.from(this.teamStatus.values()).filter(m => 
        Date.now() - m.lastSeen < 300000 // Active if seen within 5 minutes
      ).length
    };
  }

  /**
   * Get team member status
   * @param {string} memberId - Team member ID
   * @returns {Object} Member status
   */
  getMemberStatus(memberId) {
    const member = this.teamStatus.get(memberId);
    if (!member) {
      return { error: 'Member not found' };
    }

    return {
      ...member,
      isActive: Date.now() - member.lastSeen < 300000, // Active if seen within 5 minutes
      lastSeenFormatted: new Date(member.lastSeen).toISOString()
    };
  }

  /**
   * Get recent messages
   * @param {number} limit - Number of messages to return
   * @returns {Array} Recent messages
   */
  getRecentMessages(limit = 20) {
    return this.messages.slice(-limit);
  }

  /**
   * Get messages by type
   * @param {string} type - Message type
   * @returns {Array} Messages of specified type
   */
  getMessagesByType(type) {
    return this.messages.filter(msg => msg.type === type);
  }

  /**
   * Get messages between team members
   * @param {string} from - Sender ID
   * @param {string} to - Recipient ID
   * @returns {Array} Messages between members
   */
  getMessagesBetween(from, to) {
    return this.messages.filter(msg => 
      (msg.from === from && msg.to === to) || 
      (msg.from === to && msg.to === from)
    );
  }

  /**
   * Start dashboard updates
   */
  start() {
    if (this.isActive) {
      log.warn('Dashboard already started');
      return;
    }

    this.isActive = true;
    
    // Update dashboard every 5 seconds
    this.updateInterval = setInterval(() => {
      this.emit('dashboardUpdate', this.getDashboardState());
    }, 5000);

    log.info('Team Dashboard started');
  }

  /**
   * Stop dashboard updates
   */
  stop() {
    if (!this.isActive) {
      log.warn('Dashboard not started');
      return;
    }

    this.isActive = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    log.info('Team Dashboard stopped');
  }

  /**
   * Generate unique message ID
   * @returns {string} Message ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Print dashboard to console
   */
  printDashboard() {
    const state = this.getDashboardState();
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 AIX TEAM DASHBOARD - LIVE STATUS');
    console.log('='.repeat(80));
    
    console.log(`\n📊 Team Status (${state.activeMembers}/${state.teamStatus.length} active)`);
    console.log('-'.repeat(80));
    
    Object.entries(state.teamStatus).forEach(([id, member]) => {
      const status = member.status === 'active' ? '🟢' : 
                   member.status === 'ready' ? '🟡' : '🔴';
      const lastSeen = new Date(member.lastSeen).toLocaleTimeString();
      const progress = member.progress || 0;
      
      console.log(`${status} ${member.name} (${member.role})`);
      console.log(`   Status: ${member.status} | Progress: ${progress}% | Last Seen: ${lastSeen}`);
      console.log(`   Messages: ${member.messageCount} | Current Task: ${member.currentTask || 'None'}`);
      console.log('');
    });
    
    console.log('📨 Recent Messages (Last 10)');
    console.log('-'.repeat(80));
    
    state.recentMessages.slice(-10).forEach(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      const from = msg.from || 'System';
      const to = msg.to || 'All';
      const type = msg.type || 'message';
      
      console.log(`[${time}] ${from} → ${to} (${type})`);
      if (msg.content) {
        console.log(`   ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
      }
      console.log('');
    });
    
    console.log('='.repeat(80) + '\n');
  }
}

module.exports = TeamDashboard;