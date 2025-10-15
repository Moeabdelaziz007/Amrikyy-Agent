/**
 * Holographic Command Center API Routes
 * REST endpoints for hologram dashboard data
 */

const express = require('express');
const winston = require('winston');

class HologramRoutes {
  constructor(multiAgentOrchestrator, revenueCalculator) {
    this.router = express.Router();
    this.orchestrator = multiAgentOrchestrator;
    this.revenueCalculator = revenueCalculator;
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/hologram-routes.log' }),
        new winston.transports.Console()
      ]
    });

    this.setupRoutes();
  }

  setupRoutes() {
    // Agent management routes
    this.router.get('/agents', this.getAllAgents.bind(this));
    this.router.post('/agents', this.createAgent.bind(this));
    this.router.get('/agents/:id', this.getAgent.bind(this));
    this.router.delete('/agents/:id', this.deleteAgent.bind(this));
    this.router.post('/agents/:id/command', this.commandAgent.bind(this));

    // System metrics routes
    this.router.get('/metrics', this.getSystemMetrics.bind(this));
    this.router.get('/metrics/agent/:id', this.getAgentMetrics.bind(this));

    // Workflow routes
    this.router.get('/workflow', this.getWorkflowState.bind(this));
    this.router.post('/workflow/execute', this.executeWorkflow.bind(this));

    // Revenue routes
    this.router.get('/revenue', this.getRevenueData.bind(this));
    this.router.get('/revenue/projected', this.getProjectedRevenue.bind(this));

    // Logs and monitoring
    this.router.get('/logs', this.getRecentLogs.bind(this));
    this.router.get('/health', this.getSystemHealth.bind(this));

    // Dashboard data aggregation
    this.router.get('/dashboard', this.getDashboardData.bind(this));
  }

  // Agent Management Endpoints
  async getAllAgents(req, res) {
    try {
      const agents = await this.orchestrator.listAgents();
      
      // Add hologram-specific metadata
      const enhancedAgents = agents.map(agent => ({
        ...agent,
        hologram: {
          displayName: this.getDisplayName(agent.type),
          icon: this.getAgentIcon(agent.type),
          color: this.getAgentColor(agent.type),
          category: this.getAgentCategory(agent.type),
          description: this.getAgentDescription(agent.type)
        }
      }));

      res.json({
        success: true,
        data: enhancedAgents,
        count: enhancedAgents.length,
        timestamp: new Date().toISOString()
      });

      this.logger.info('Retrieved all agents for hologram', { count: enhancedAgents.length });
    } catch (error) {
      this.logger.error('Failed to get agents', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async createAgent(req, res) {
    try {
      const { type, config } = req.body;
      
      if (!type) {
        return res.status(400).json({
          success: false,
          error: 'Agent type is required',
          timestamp: new Date().toISOString()
        });
      }

      const agent = await this.orchestrator.createAgent(type, config);
      
      res.json({
        success: true,
        data: agent,
        message: `Agent ${agent.name} created successfully`,
        timestamp: new Date().toISOString()
      });

      this.logger.info('Created agent via hologram', { agentId: agent.id, type: agent.type });
    } catch (error) {
      this.logger.error('Failed to create agent', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getAgent(req, res) {
    try {
      const { id } = req.params;
      const agents = await this.orchestrator.listAgents();
      const agent = agents.find(a => a.id === id);

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found',
          timestamp: new Date().toISOString()
        });
      }

      // Get detailed metrics
      const metrics = await this.orchestrator.getAgentMetrics(id);

      res.json({
        success: true,
        data: {
          ...agent,
          metrics: metrics,
          hologram: {
            displayName: this.getDisplayName(agent.type),
            icon: this.getAgentIcon(agent.type),
            color: this.getAgentColor(agent.type)
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to get agent', { agentId: req.params.id, error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async deleteAgent(req, res) {
    try {
      const { id } = req.params;
      const result = await this.orchestrator.deleteAgent(id);

      res.json({
        success: true,
        data: result,
        message: `Agent ${id} deleted successfully`,
        timestamp: new Date().toISOString()
      });

      this.logger.info('Deleted agent via hologram', { agentId: id });
    } catch (error) {
      this.logger.error('Failed to delete agent', { agentId: req.params.id, error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async commandAgent(req, res) {
    try {
      const { id } = req.params;
      const { command, params } = req.body;

      if (!command) {
        return res.status(400).json({
          success: false,
          error: 'Command is required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await this.orchestrator.commandAgent(id, command, params);

      res.json({
        success: true,
        data: result,
        message: `Command ${command} executed on agent ${id}`,
        timestamp: new Date().toISOString()
      });

      this.logger.info('Executed agent command via hologram', { 
        agentId: id, 
        command: command 
      });
    } catch (error) {
      this.logger.error('Failed to execute agent command', { 
        agentId: req.params.id, 
        command: req.body.command,
        error: error.message 
      });
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // System Metrics Endpoints
  async getSystemMetrics(req, res) {
    try {
      const systemHealth = this.orchestrator.getSystemHealth();
      const agents = await this.orchestrator.listAgents();
      
      // Calculate additional metrics
      const metrics = {
        ...systemHealth,
        agent_breakdown: this.calculateAgentBreakdown(agents),
        performance_metrics: this.calculatePerformanceMetrics(agents),
        hologram_stats: {
          total_agents: agents.length,
          active_agents: agents.filter(a => a.status === 'active').length,
          categories: this.getAgentCategories(agents)
        }
      };

      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to get system metrics', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getAgentMetrics(req, res) {
    try {
      const { id } = req.params;
      const metrics = await this.orchestrator.getAgentMetrics(id);

      if (!metrics) {
        return res.status(404).json({
          success: false,
          error: 'Agent metrics not found',
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to get agent metrics', { agentId: req.params.id, error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Workflow Endpoints
  async getWorkflowState(req, res) {
    try {
      const workflowState = {
        current_step: 1,
        total_steps: 6,
        active_agents: await this.getActiveAgentsForWorkflow(),
        workflow_nodes: this.getWorkflowNodes(),
        connections: this.getWorkflowConnections(),
        status: 'active'
      };

      res.json({
        success: true,
        data: workflowState,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to get workflow state', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async executeWorkflow(req, res) {
    try {
      const { workflow_type } = req.body;
      
      // Trigger workflow execution
      this.orchestrator.emit('workflow_execute', { type: workflow_type });

      res.json({
        success: true,
        message: `Workflow ${workflow_type} execution initiated`,
        timestamp: new Date().toISOString()
      });

      this.logger.info('Executed workflow via hologram', { workflow_type });
    } catch (error) {
      this.logger.error('Failed to execute workflow', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Revenue Endpoints
  async getRevenueData(req, res) {
    try {
      const revenue = await this.revenueCalculator.getCurrentRevenue();
      
      res.json({
        success: true,
        data: revenue,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to get revenue data', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getProjectedRevenue(req, res) {
    try {
      const projection = await this.revenueCalculator.getProjectedRevenue();
      
      res.json({
        success: true,
        data: projection,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to get projected revenue', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Logs and Monitoring
  async getRecentLogs(req, res) {
    try {
      const { limit = 50 } = req.query;
      const logs = await this.getSystemLogs(parseInt(limit));
      
      res.json({
        success: true,
        data: logs,
        count: logs.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to get recent logs', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getSystemHealth(req, res) {
    try {
      const health = this.orchestrator.getSystemHealth();
      
      res.json({
        success: true,
        data: health,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to get system health', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Dashboard Data Aggregation
  async getDashboardData(req, res) {
    try {
      const [agents, metrics, revenue, workflow] = await Promise.all([
        this.orchestrator.listAgents(),
        this.getSystemMetrics(),
        this.revenueCalculator.getCurrentRevenue(),
        this.getWorkflowState()
      ]);

      const dashboardData = {
        agents: agents,
        system_metrics: metrics,
        revenue: revenue,
        workflow: workflow,
        summary: {
          total_agents: agents.length,
          active_agents: agents.filter(a => a.status === 'active').length,
          system_health: metrics.overall_health?.status || 'unknown',
          current_revenue: revenue.current || 0,
          projected_revenue: revenue.projected || 0
        }
      };

      res.json({
        success: true,
        data: dashboardData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to get dashboard data', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Helper Methods
  getDisplayName(agentType) {
    const displayNames = {
      'travel-researcher': 'Travel Researcher',
      'booking-agent': 'Booking Manager',
      'customer-service': 'Customer Support',
      'data-analyst': 'Analytics Engine',
      'nexus-orchestrator': 'Nexus',
      'sentinel-hunter': 'Sentinel',
      'validator-qc': 'Validator'
    };
    return displayNames[agentType] || agentType;
  }

  getAgentIcon(agentType) {
    const icons = {
      'travel-researcher': '🧠',
      'booking-agent': '💳',
      'customer-service': '🎧',
      'data-analyst': '📊',
      'nexus-orchestrator': '🧠',
      'sentinel-hunter': '🔍',
      'validator-qc': '✅'
    };
    return icons[agentType] || '🤖';
  }

  getAgentColor(agentType) {
    const colors = {
      'travel-researcher': '#0ff',
      'booking-agent': '#0f0',
      'customer-service': '#ff0',
      'data-analyst': '#f0f',
      'nexus-orchestrator': '#0ff',
      'sentinel-hunter': '#f00',
      'validator-qc': '#0f0'
    };
    return colors[agentType] || '#666';
  }

  getAgentCategory(agentType) {
    const categories = {
      'travel-researcher': 'travel',
      'booking-agent': 'travel',
      'customer-service': 'support',
      'data-analyst': 'analytics',
      'nexus-orchestrator': 'money-hunter',
      'sentinel-hunter': 'money-hunter',
      'validator-qc': 'money-hunter'
    };
    return categories[agentType] || 'general';
  }

  getAgentDescription(agentType) {
    const descriptions = {
      'travel-researcher': 'Discovers travel opportunities and destinations',
      'booking-agent': 'Manages reservations and payments',
      'customer-service': 'Provides customer support and assistance',
      'data-analyst': 'Analyzes data and generates insights',
      'nexus-orchestrator': 'Coordinates money hunting operations',
      'sentinel-hunter': 'Scans for freelance opportunities',
      'validator-qc': 'Validates and quality-checks opportunities'
    };
    return descriptions[agentType] || 'AI Agent';
  }

  calculateAgentBreakdown(agents) {
    const breakdown = {};
    agents.forEach(agent => {
      const category = this.getAgentCategory(agent.type);
      breakdown[category] = (breakdown[category] || 0) + 1;
    });
    return breakdown;
  }

  calculatePerformanceMetrics(agents) {
    const activeAgents = agents.filter(a => a.status === 'active');
    const totalTasks = agents.reduce((sum, agent) => sum + (agent.tasks?.length || 0), 0);
    
    return {
      active_ratio: activeAgents.length / agents.length,
      total_tasks: totalTasks,
      average_tasks_per_agent: totalTasks / agents.length
    };
  }

  getAgentCategories(agents) {
    const categories = new Set();
    agents.forEach(agent => {
      categories.add(this.getAgentCategory(agent.type));
    });
    return Array.from(categories);
  }

  async getActiveAgentsForWorkflow() {
    const agents = await this.orchestrator.listAgents();
    return agents.filter(a => a.status === 'active').map(a => ({
      id: a.id,
      name: a.name,
      type: a.type
    }));
  }

  getWorkflowNodes() {
    return [
      { id: 1, name: 'SCAN', x: 50, y: 50, agent: 'sentinel-hunter' },
      { id: 2, name: 'DETECT', x: 250, y: 50, agent: 'sentinel-hunter' },
      { id: 3, name: 'VALIDATE', x: 450, y: 50, agent: 'validator-qc' },
      { id: 4, name: 'SCORE', x: 650, y: 50, agent: 'validator-qc' },
      { id: 5, name: 'DECIDE', x: 350, y: 200, agent: 'nexus-orchestrator' },
      { id: 6, name: 'EXECUTE', x: 350, y: 350, agent: 'nexus-orchestrator' }
    ];
  }

  getWorkflowConnections() {
    return [
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 4, to: 5 },
      { from: 5, to: 6 }
    ];
  }

  async getSystemLogs(limit) {
    // Mock implementation - in production, read from actual log files
    return Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
      id: i,
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)],
      message: `System log entry ${i + 1}`,
      agent: ['nexus', 'sentinel', 'validator'][Math.floor(Math.random() * 3)],
      category: ['task', 'system', 'error'][Math.floor(Math.random() * 3)]
    }));
  }

  getRouter() {
    return this.router;
  }
}

module.exports = HologramRoutes;

