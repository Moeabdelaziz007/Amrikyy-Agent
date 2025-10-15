/**
 * Live Agent Monitoring Dashboard
 * Real-time tracking of all agent progress, metrics, and system health
 */

const { EventEmitter } = require('events');
const winston = require('winston');
const WebSocket = require('ws');

class LiveAgentMonitor extends EventEmitter {
  constructor(server) {
    super();

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/live-agent-monitor.log' }),
        new winston.transports.Console()
      ]
    });

    // WebSocket server for real-time updates
    this.wss = new WebSocket.Server({ server, path: '/ws/agent-monitor' });
    this.clients = new Set();

    // Agent tracking
    this.agentMetrics = new Map();
    this.systemMetrics = {
      totalRequests: 0,
      activeConversations: 0,
      systemHealth: 'healthy',
      lastUpdate: new Date().toISOString()
    };

    // Performance tracking
    this.performanceHistory = {
      responseTimes: [],
      successRates: [],
      errorRates: [],
      loadMetrics: []
    };

    // Real-time data collection
    this.dataCollectionInterval = null;
    this.updateInterval = 1000; // Update every second

    this.initializeMonitoring();
  }

  async initializeMonitoring() {
    this.logger.info('Initializing Live Agent Monitor...');

    try {
      // Set up WebSocket connection handling
      this.setupWebSocketHandlers();

      // Start real-time data collection
      this.startDataCollection();

      // Initialize agent metrics tracking
      this.initializeAgentTracking();

      this.logger.info('Live Agent Monitor initialized successfully');
      this.emit('monitor_initialized');

    } catch (error) {
      this.logger.error('Failed to initialize Live Agent Monitor', { error: error.message });
      throw error;
    }
  }

  /**
   * Set up WebSocket connection handlers
   */
  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, req) => {
      this.logger.info('New monitoring client connected', { 
        ip: req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      this.clients.add(ws);

      // Send initial data to new client
      this.sendInitialData(ws);

      // Handle client messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (error) {
          this.logger.error('Invalid message from client', { error: error.message });
        }
      });

      // Handle client disconnection
      ws.on('close', () => {
        this.clients.delete(ws);
        this.logger.info('Monitoring client disconnected');
      });

      // Handle client errors
      ws.on('error', (error) => {
        this.logger.error('WebSocket client error', { error: error.message });
        this.clients.delete(ws);
      });
    });

    this.logger.info('WebSocket handlers configured');
  }

  /**
   * Send initial data to new client
   */
  sendInitialData(ws) {
    const initialData = {
      type: 'initial_data',
      data: {
        agents: this.getAllAgentMetrics(),
        system: this.systemMetrics,
        performance: this.performanceHistory,
        timestamp: new Date().toISOString()
      }
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(initialData));
    }
  }

  /**
   * Handle messages from monitoring clients
   */
  handleClientMessage(ws, data) {
    switch (data.type) {
      case 'subscribe':
        this.logger.info('Client subscribed to updates', { 
          clientId: data.clientId,
          subscriptions: data.subscriptions 
        });
        break;

      case 'request_agent_details':
        this.sendAgentDetails(ws, data.agentId);
        break;

      case 'request_performance_history':
        this.sendPerformanceHistory(ws, data.timeRange);
        break;

      default:
        this.logger.warn('Unknown message type from client', { type: data.type });
    }
  }

  /**
   * Start real-time data collection
   */
  startDataCollection() {
    this.dataCollectionInterval = setInterval(() => {
      this.collectRealTimeMetrics();
      this.broadcastUpdate();
    }, this.updateInterval);

    this.logger.info('Real-time data collection started', { 
      interval: this.updateInterval 
    });
  }

  /**
   * Stop real-time data collection
   */
  stopDataCollection() {
    if (this.dataCollectionInterval) {
      clearInterval(this.dataCollectionInterval);
      this.dataCollectionInterval = null;
    }

    this.logger.info('Real-time data collection stopped');
  }

  /**
   * Initialize agent metrics tracking
   */
  initializeAgentTracking() {
    // Initialize metrics for all 9 agents
    const agentIds = [
      'luna', 'karim', 'layla', 'amira', 'tariq', 
      'zara', 'analytics', 'learning', 'debugger'
    ];

    agentIds.forEach(agentId => {
      this.agentMetrics.set(agentId, {
        id: agentId,
        name: this.getAgentDisplayName(agentId),
        avatar: this.getAgentAvatar(agentId),
        status: 'idle',
        load: 0,
        tasksProcessed: 0,
        successRate: 100,
        currentTask: null,
        responseTime: 0,
        lastActivity: new Date().toISOString(),
        metrics: {
          totalTasks: 0,
          successfulTasks: 0,
          failedTasks: 0,
          averageResponseTime: 0,
          peakLoad: 0,
          uptime: 0
        },
        health: 'healthy',
        alerts: []
      });
    });

    this.logger.info('Agent tracking initialized', { 
      agentCount: this.agentMetrics.size 
    });
  }

  /**
   * Collect real-time metrics from all agents
   */
  collectRealTimeMetrics() {
    const timestamp = new Date().toISOString();

    // Update system metrics
    this.systemMetrics.lastUpdate = timestamp;
    this.systemMetrics.totalRequests++;
    
    // Simulate real agent activity (in production, collect from actual agents)
    this.agentMetrics.forEach((metrics, agentId) => {
      // Simulate random activity
      const isActive = Math.random() > 0.7;
      
      if (isActive) {
        metrics.status = 'processing';
        metrics.load = Math.min(100, metrics.load + Math.random() * 20);
        metrics.currentTask = this.getRandomTask(agentId);
        metrics.responseTime = Math.random() * 2000 + 500;
        metrics.lastActivity = timestamp;
      } else {
        metrics.status = 'idle';
        metrics.load = Math.max(0, metrics.load - Math.random() * 5);
        metrics.currentTask = null;
      }

      // Update performance metrics
      if (metrics.status === 'processing') {
        metrics.tasksProcessed++;
        metrics.metrics.totalTasks++;
        
        // Simulate success/failure
        const success = Math.random() > 0.1; // 90% success rate
        if (success) {
          metrics.metrics.successfulTasks++;
          metrics.successRate = Math.min(100, metrics.successRate + 1);
        } else {
          metrics.metrics.failedTasks++;
          metrics.successRate = Math.max(0, metrics.successRate - 2);
          metrics.alerts.push({
            type: 'error',
            message: 'Task execution failed',
            timestamp: timestamp
          });
        }

        // Update average response time
        const alpha = 0.1;
        metrics.metrics.averageResponseTime = 
          (1 - alpha) * metrics.metrics.averageResponseTime + 
          alpha * metrics.responseTime;

        // Update peak load
        metrics.metrics.peakLoad = Math.max(metrics.metrics.peakLoad, metrics.load);
      }

      // Update health status
      metrics.health = this.calculateAgentHealth(metrics);
    });

    // Update performance history
    this.updatePerformanceHistory();

    // Update system health
    this.updateSystemHealth();
  }

  /**
   * Calculate agent health based on metrics
   */
  calculateAgentHealth(metrics) {
    if (metrics.successRate < 80) return 'critical';
    if (metrics.successRate < 90) return 'warning';
    if (metrics.load > 90) return 'warning';
    if (metrics.alerts.length > 5) return 'warning';
    return 'healthy';
  }

  /**
   * Update performance history
   */
  updatePerformanceHistory() {
    const timestamp = Date.now();
    const avgResponseTime = Array.from(this.agentMetrics.values())
      .reduce((sum, metrics) => sum + metrics.responseTime, 0) / this.agentMetrics.size;
    
    const avgSuccessRate = Array.from(this.agentMetrics.values())
      .reduce((sum, metrics) => sum + metrics.successRate, 0) / this.agentMetrics.size;

    const avgLoad = Array.from(this.agentMetrics.values())
      .reduce((sum, metrics) => sum + metrics.load, 0) / this.agentMetrics.size;

    // Add to history (keep last 100 data points)
    this.performanceHistory.responseTimes.push({ timestamp, value: avgResponseTime });
    this.performanceHistory.successRates.push({ timestamp, value: avgSuccessRate });
    this.performanceHistory.loadMetrics.push({ timestamp, value: avgLoad });

    // Keep only last 100 points
    Object.keys(this.performanceHistory).forEach(key => {
      if (this.performanceHistory[key].length > 100) {
        this.performanceHistory[key] = this.performanceHistory[key].slice(-100);
      }
    });
  }

  /**
   * Update system health
   */
  updateSystemHealth() {
    const healthyAgents = Array.from(this.agentMetrics.values())
      .filter(metrics => metrics.health === 'healthy').length;
    
    const totalAgents = this.agentMetrics.size;
    const healthRatio = healthyAgents / totalAgents;

    if (healthRatio < 0.7) {
      this.systemMetrics.systemHealth = 'critical';
    } else if (healthRatio < 0.9) {
      this.systemMetrics.systemHealth = 'warning';
    } else {
      this.systemMetrics.systemHealth = 'healthy';
    }
  }

  /**
   * Broadcast updates to all connected clients
   */
  broadcastUpdate() {
    if (this.clients.size === 0) return;

    const updateData = {
      type: 'real_time_update',
      data: {
        agents: this.getAllAgentMetrics(),
        system: this.systemMetrics,
        performance: {
          current: {
            avgResponseTime: this.performanceHistory.responseTimes[this.performanceHistory.responseTimes.length - 1]?.value || 0,
            avgSuccessRate: this.performanceHistory.successRates[this.performanceHistory.successRates.length - 1]?.value || 0,
            avgLoad: this.performanceHistory.loadMetrics[this.performanceHistory.loadMetrics.length - 1]?.value || 0
          },
          history: this.performanceHistory
        },
        timestamp: new Date().toISOString()
      }
    };

    const message = JSON.stringify(updateData);

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      } else {
        this.clients.delete(client);
      }
    });
  }

  /**
   * Get all agent metrics
   */
  getAllAgentMetrics() {
    return Array.from(this.agentMetrics.values());
  }

  /**
   * Get agent display name
   */
  getAgentDisplayName(agentId) {
    const names = {
      'luna': 'Luna - Trip Architect',
      'karim': 'Karim - Budget Optimizer',
      'layla': 'Layla - Cultural Navigator',
      'amira': 'Amira - Support Specialist',
      'tariq': 'Tariq - Payment Specialist',
      'zara': 'Zara - Research Specialist',
      'analytics': 'Insights - Analytics Agent',
      'learning': 'Evolve - Learning Agent',
      'debugger': 'Fix - Debugger Agent'
    };
    return names[agentId] || agentId;
  }

  /**
   * Get agent avatar
   */
  getAgentAvatar(agentId) {
    const avatars = {
      'luna': '🎫',
      'karim': '💰',
      'layla': '🗺️',
      'amira': '📞',
      'tariq': '💳',
      'zara': '🔍',
      'analytics': '📊',
      'learning': '🔄',
      'debugger': '🐛'
    };
    return avatars[agentId] || '🤖';
  }

  /**
   * Get random task for agent
   */
  getRandomTask(agentId) {
    const tasks = {
      'luna': ['Creating itinerary', 'Optimizing route', 'Suggesting activities', 'Planning logistics'],
      'karim': ['Analyzing budget', 'Finding deals', 'Optimizing costs', 'Tracking expenses'],
      'layla': ['Cultural research', 'Destination insights', 'Local customs', 'Safety tips'],
      'amira': ['Resolving issue', 'Customer support', 'Emergency response', 'Follow-up care'],
      'tariq': ['Processing payment', 'Fraud detection', 'Transaction verification', 'Security check'],
      'zara': ['Web research', 'Data extraction', 'Fact verification', 'Comparison analysis'],
      'analytics': ['Performance analysis', 'Metrics tracking', 'Trend identification', 'Report generation'],
      'learning': ['Pattern extraction', 'Adaptation learning', 'Improvement analysis', 'Knowledge update'],
      'debugger': ['Error detection', 'System monitoring', 'Performance optimization', 'Health check']
    };

    const agentTasks = tasks[agentId] || ['General task'];
    return agentTasks[Math.floor(Math.random() * agentTasks.length)];
  }

  /**
   * Send agent details to specific client
   */
  sendAgentDetails(ws, agentId) {
    const agentMetrics = this.agentMetrics.get(agentId);
    if (!agentMetrics) {
      ws.send(JSON.stringify({
        type: 'error',
        message: `Agent not found: ${agentId}`
      }));
      return;
    }

    const detailsData = {
      type: 'agent_details',
      data: {
        agent: agentMetrics,
        recentTasks: this.getRecentTasks(agentId),
        alerts: agentMetrics.alerts,
        timestamp: new Date().toISOString()
      }
    };

    ws.send(JSON.stringify(detailsData));
  }

  /**
   * Send performance history to client
   */
  sendPerformanceHistory(ws, timeRange = '1h') {
    const historyData = {
      type: 'performance_history',
      data: {
        history: this.performanceHistory,
        timeRange: timeRange,
        timestamp: new Date().toISOString()
      }
    };

    ws.send(JSON.stringify(historyData));
  }

  /**
   * Get recent tasks for agent (mock implementation)
   */
  getRecentTasks(agentId) {
    // Mock recent tasks - in production, fetch from database
    return [
      {
        id: `task_${Date.now()}_1`,
        type: 'create_itinerary',
        status: 'completed',
        duration: 2500,
        timestamp: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: `task_${Date.now()}_2`,
        type: 'budget_analysis',
        status: 'completed',
        duration: 1800,
        timestamp: new Date(Date.now() - 600000).toISOString()
      }
    ];
  }

  /**
   * Update agent metrics (called by orchestrator when agents perform tasks)
   */
  updateAgentMetrics(agentId, metrics) {
    const agentMetrics = this.agentMetrics.get(agentId);
    if (agentMetrics) {
      Object.assign(agentMetrics, metrics);
      agentMetrics.lastActivity = new Date().toISOString();
    }
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData() {
    return {
      agents: this.getAllAgentMetrics(),
      system: this.systemMetrics,
      performance: this.performanceHistory,
      connections: this.clients.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.logger.info('Cleaning up Live Agent Monitor...');

    this.stopDataCollection();

    // Close all WebSocket connections
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.close();
      }
    });
    this.clients.clear();

    this.logger.info('Live Agent Monitor cleanup completed');
  }
}

module.exports = LiveAgentMonitor;
