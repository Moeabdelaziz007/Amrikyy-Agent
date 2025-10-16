/**
 * Evolve Manager Dashboard - Real-time Monitoring System
 * Provides live dashboard for monitoring Evolve Manager activities
 */

const EventEmitter = require('events');
const winston = require('winston');

class EvolveManagerDashboard extends EventEmitter {
  constructor(evolveOrchestrator) {
    super();

    this.evolve = evolveOrchestrator;
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/evolve-dashboard.log' }),
        new winston.transports.Console()
      ]
    });

    // Dashboard state
    this.dashboardData = {
      system_status: 'initializing',
      active_tasks: [],
      recent_activity: [],
      agent_status: [],
      performance_metrics: {},
      pattern_learning: {
        patterns_learned: 0,
        insights_generated: 0,
        learning_rate: 0
      },
      system_health: {
        overall: 'healthy',
        components: {}
      },
      last_updated: new Date().toISOString()
    };

    // Update intervals
    this.updateInterval = null;
    this.fastUpdateInterval = 1000; // 1 second for real-time data
    this.slowUpdateInterval = 5000; // 5 seconds for computed metrics

    // WebSocket connections for real-time updates
    this.websocketClients = new Set();

    this.initialize();
  }

  async initialize() {
    this.logger.info('Initializing Evolve Manager Dashboard...');

    try {
      // Set up dashboard update cycles
      this.startUpdateCycles();

      // Set up event listeners
      this.setupEventListeners();

      this.logger.info('Dashboard initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize dashboard', { error: error.message });
      throw error;
    }
  }

  setupEventListeners() {
    // Listen to Evolve orchestrator events
    if (this.evolve) {
      this.evolve.on('evolve_initialized', (data) => {
        this.updateSystemStatus('active');
        this.emit('dashboard_update', this.getDashboardData());
      });

      this.evolve.on('execution_phase_started', (data) => {
        this.updateActiveTasks();
        this.emit('dashboard_update', this.getDashboardData());
      });

      this.evolve.on('execution_phase_completed', (data) => {
        this.updateActiveTasks();
        this.updateRecentActivity(data);
        this.emit('dashboard_update', this.getDashboardData());
      });

      this.evolve.on('pattern_learned', (pattern) => {
        this.updatePatternLearning();
        this.emit('dashboard_update', this.getDashboardData());
      });

      this.evolve.on('insight_generated', (insight) => {
        this.updatePatternLearning();
        this.emit('dashboard_update', this.getDashboardData());
      });

      this.evolve.on('maya_agent_task_started', (data) => {
        this.updateAgentStatus();
        this.emit('dashboard_update', this.getDashboardData());
      });

      this.evolve.on('maya_agent_task_completed', (data) => {
        this.updateAgentStatus();
        this.emit('dashboard_update', this.getDashboardData());
      });
    }
  }

  startUpdateCycles() {
    // Fast updates for real-time data
    this.updateInterval = setInterval(() => {
      this.updateActiveTasks();
      this.updateSystemHealth();
      this.dashboardData.last_updated = new Date().toISOString();

      // Emit to WebSocket clients
      this.emit('dashboard_update', this.getDashboardData());
    }, this.fastUpdateInterval);

    // Slow updates for computed metrics
    setInterval(() => {
      this.updatePerformanceMetrics();
      this.updateSystemHealth();
    }, this.slowUpdateInterval);

    this.logger.info('Dashboard update cycles started');
  }

  updateSystemStatus(status) {
    this.dashboardData.system_status = status;

    if (status === 'active') {
      this.dashboardData.system_health.overall = 'healthy';
    } else if (status === 'error') {
      this.dashboardData.system_health.overall = 'degraded';
    }
  }

  updateActiveTasks() {
    if (!this.evolve) return;

    const activeTasks = Array.from(this.evolve.activeTasks.values()).map(task => ({
      id: task.id,
      user_id: task.userId,
      request_type: task.request.type || 'general',
      status: task.status,
      progress: task.progress || 0,
      current_phase: task.currentPhase?.name || 'unknown',
      start_time: task.startTime,
      duration: Date.now() - task.startTime,
      agents_involved: task.agents || []
    }));

    this.dashboardData.active_tasks = activeTasks;
  }

  updateRecentActivity(activityData) {
    const activity = {
      id: `activity_${Date.now()}`,
      type: 'task_completed',
      description: `Task phase completed: ${activityData.phase}`,
      timestamp: new Date().toISOString(),
      success: activityData.success,
      duration: activityData.duration,
      agent: activityData.taskId ? 'evolve' : 'maya'
    };

    // Add to recent activity
    this.dashboardData.recent_activity.unshift(activity);

    // Keep only last 50 activities
    if (this.dashboardData.recent_activity.length > 50) {
      this.dashboardData.recent_activity = this.dashboardData.recent_activity.slice(0, 50);
    }
  }

  updateAgentStatus() {
    if (!this.evolve) return;

    const agentStatus = [];

    // Evolve manager status
    agentStatus.push({
      id: 'evolve_manager',
      name: 'Evolve Manager',
      type: 'manager',
      status: this.evolve.status,
      active_tasks: this.evolve.activeTasks.size,
      metrics: this.evolve.metrics
    });

    // Maya orchestrator agents
    if (this.evolve.mayaOrchestrator) {
      const mayaHealth = this.evolve.mayaOrchestrator.getSystemHealth();
      if (mayaHealth.agent_status) {
        Object.entries(mayaHealth.agent_status).forEach(([agentId, status]) => {
          agentStatus.push({
            id: agentId,
            name: this.getAgentDisplayName(agentId),
            type: 'specialist',
            status: status.health,
            metrics: status
          });
        });
      }
    }

    // Available agents from registry
    this.evolve.availableAgents.forEach((agent, agentId) => {
      agentStatus.push({
        id: agentId,
        name: agent.name,
        type: agent.domain,
        status: 'available',
        capabilities: agent.capabilities
      });
    });

    this.dashboardData.agent_status = agentStatus;
  }

  updatePerformanceMetrics() {
    if (!this.evolve) return;

    const metrics = this.evolve.metrics;
    const recentTasks = this.evolve.taskHistory.slice(-20); // Last 20 tasks

    // Calculate recent performance
    const recentSuccessRate = recentTasks.length > 0
      ? (recentTasks.filter(task => task.result?.success).length / recentTasks.length) * 100
      : 100;

    const averageExecutionTime = recentTasks.length > 0
      ? recentTasks.reduce((sum, task) => sum + (task.endTime - task.startTime), 0) / recentTasks.length
      : 0;

    this.dashboardData.performance_metrics = {
      overall_success_rate: metrics.successRate,
      recent_success_rate: recentSuccessRate,
      average_response_time: metrics.averageResponseTime,
      average_execution_time: averageExecutionTime,
      tasks_completed: metrics.tasksCompleted,
      patterns_learned: metrics.patternsLearned,
      user_satisfaction: metrics.userSatisfaction,
      system_efficiency: this.calculateEfficiencyScore(metrics)
    };
  }

  updatePatternLearning() {
    if (!this.evolve || !this.evolve.patternEngine) return;

    const patternStats = this.evolve.patternEngine.getLearningStats();

    this.dashboardData.pattern_learning = {
      patterns_learned: patternStats.patternsLearned || 0,
      insights_generated: patternStats.insightsGenerated || 0,
      learning_rate: patternStats.learningRate || 0,
      memory_usage: patternStats.memoryUsage || 0,
      last_learning: patternStats.lastLearning || null
    };
  }

  updateSystemHealth() {
    const health = {
      overall: 'healthy',
      components: {}
    };

    // Check Evolve manager health
    health.components.evolve_manager = {
      status: this.evolve?.status === 'active' ? 'healthy' : 'degraded',
      uptime: this.evolve ? Date.now() - this.evolve.startTime : 0,
      memory_usage: process.memoryUsage ? Math.round(process.memoryUsage().heapUsed / 1024 / 1024) : 0
    };

    // Check Maya orchestrator health
    if (this.evolve?.mayaOrchestrator) {
      const mayaHealth = this.evolve.mayaOrchestrator.getSystemHealth();
      health.components.maya_orchestrator = {
        status: mayaHealth.orchestrator_health,
        active_conversations: mayaHealth.active_conversations,
        agents_healthy: Object.values(mayaHealth.agent_status).filter(s => s.health === 'healthy').length
      };
    }

    // Check pattern engine health
    if (this.evolve?.patternEngine) {
      const patternHealth = this.evolve.patternEngine.getHealth();
      health.components.pattern_engine = patternHealth;
    }

    // Determine overall health
    const componentStatuses = Object.values(health.components).map(c => c.status);
    if (componentStatuses.includes('error')) {
      health.overall = 'error';
    } else if (componentStatuses.includes('degraded')) {
      health.overall = 'degraded';
    }

    this.dashboardData.system_health = health;
  }

  calculateEfficiencyScore(metrics) {
    // Calculate efficiency based on multiple factors
    const successWeight = 0.4;
    const speedWeight = 0.3;
    const learningWeight = 0.3;

    const successScore = metrics.successRate / 100;
    const speedScore = Math.max(0, 1 - (metrics.averageResponseTime / 30000)); // Optimal under 30s
    const learningScore = Math.min(1, metrics.patternsLearned / 100); // Normalize to 100 patterns

    return Math.round((successScore * successWeight + speedScore * speedWeight + learningScore * learningWeight) * 100);
  }

  getAgentDisplayName(agentId) {
    const nameMap = {
      'luna': 'Luna (Travel Architect)',
      'karim': 'Karim (Budget Optimizer)',
      'layla': 'Layla (Cultural Guide)',
      'amira': 'Amira (Problem Solver)',
      'tariq': 'Tariq (Payment Manager)',
      'zara': 'Zara (Research Specialist)'
    };

    return nameMap[agentId] || agentId;
  }

  // Public API methods
  getDashboardData() {
    return {
      ...this.dashboardData,
      timestamp: new Date().toISOString(),
      version: this.evolve?.version || '1.0.0'
    };
  }

  getSystemOverview() {
    return {
      status: this.dashboardData.system_status,
      health: this.dashboardData.system_health.overall,
      active_tasks: this.dashboardData.active_tasks.length,
      agents_online: this.dashboardData.agent_status.filter(a => a.status === 'active' || a.status === 'available').length,
      recent_success_rate: this.dashboardData.performance_metrics.recent_success_rate || 0,
      patterns_learned: this.dashboardData.pattern_learning.patterns_learned || 0
    };
  }

  getAgentPerformance() {
    return this.dashboardData.agent_status.map(agent => ({
      id: agent.id,
      name: agent.name,
      type: agent.type,
      status: agent.status,
      tasks_completed: agent.metrics?.tasksProcessed || 0,
      success_rate: agent.metrics?.successRate || 100,
      current_load: agent.metrics?.load || 0
    }));
  }

  getRecentActivity(limit = 10) {
    return this.dashboardData.recent_activity.slice(0, limit);
  }

  getPerformanceMetrics() {
    return this.dashboardData.performance_metrics;
  }

  // WebSocket management for real-time updates
  addWebSocketClient(ws) {
    this.websocketClients.add(ws);

    // Send current dashboard data
    ws.send(JSON.stringify({
      type: 'dashboard_data',
      data: this.getDashboardData()
    }));

    // Handle client disconnect
    ws.on('close', () => {
      this.websocketClients.delete(ws);
    });

    this.logger.info('WebSocket client added', { clientCount: this.websocketClients.size });
  }

  // Cleanup method
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.websocketClients.clear();
    this.removeAllListeners();

    this.logger.info('Dashboard destroyed');
  }
}

module.exports = EvolveManagerDashboard;