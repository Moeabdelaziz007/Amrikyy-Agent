/**
 * Holographic Command Center Controller
 * Main controller that orchestrates all hologram functionality
 * Integrates WebSocket, API routes, and agent systems
 */

const MultiAgentOrchestrator = require('../agents/multiAgentOrchestrator');
const MoneyHunterAgentSystem = require('../agents/moneyHunterAgents');
const RevenueCalculator = require('../services/revenueCalculator');
const HologramWebSocketServer = require('./websocketServer');
const HologramRoutes = require('./hologramRoutes');
const winston = require('winston');

class HologramController {
  constructor(server, supabaseClient) {
    this.server = server;
    this.supabase = supabaseClient;
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/hologram-controller.log' }),
        new winston.transports.Console()
      ]
    });

    // Initialize subsystems
    this.multiAgentOrchestrator = new MultiAgentOrchestrator();
    this.moneyHunterSystem = new MoneyHunterAgentSystem();
    this.revenueCalculator = new RevenueCalculator(supabaseClient, this.moneyHunterSystem);
    this.webSocketServer = new HologramWebSocketServer(server);
    this.routes = new HologramRoutes(this.multiAgentOrchestrator, this.revenueCalculator);

    this.setupIntegration();
    this.setupEventHandlers();
    this.initializeHologramSystem();
  }

  async setupIntegration() {
    try {
      // Register Money Hunter agent types with the orchestrator
      const moneyHunterTypes = this.moneyHunterSystem.getAgentTypes();
      
      for (const [type, config] of Object.entries(moneyHunterTypes)) {
        this.multiAgentOrchestrator.agentController.agentTypes.set(type, {
          name: config.name,
          capabilities: config.capabilities,
          mcp_tools: config.mcp_tools,
          description: config.description,
          hologram: {
            icon: config.icon,
            color: config.color
          }
        });
      }

      this.logger.info('Money Hunter agents integrated with orchestrator', {
        agentTypes: Object.keys(moneyHunterTypes)
      });
    } catch (error) {
      this.logger.error('Failed to integrate Money Hunter system', { error: error.message });
    }
  }

  setupEventHandlers() {
    // Multi-Agent Orchestrator Events
    this.multiAgentOrchestrator.on('agent_created', (agent) => {
      this.webSocketServer.broadcastAgentCreated(agent);
      this.logger.info('Agent created event broadcasted', { agentId: agent.id });
    });

    this.multiAgentOrchestrator.on('agent_deleted', (agentId) => {
      this.webSocketServer.broadcastAgentDeleted(agentId);
      this.logger.info('Agent deleted event broadcasted', { agentId });
    });

    this.multiAgentOrchestrator.on('task_completed', ({ agent, task }) => {
      this.webSocketServer.broadcastTaskCompleted(task, task.result);
      this.handleTaskCompletion(agent, task);
      this.logger.info('Task completed event broadcasted', { 
        agentId: agent.id, 
        taskId: task.id 
      });
    });

    this.multiAgentOrchestrator.on('task_failed', ({ agent, task, error }) => {
      this.webSocketServer.broadcastTaskFailed(task, error);
      this.logger.error('Task failed event broadcasted', { 
        agentId: agent.id, 
        taskId: task.id,
        error: error.message 
      });
    });

    // WebSocket Command Events
    this.webSocketServer.on('hologram_command', (commandData) => {
      this.handleHologramCommand(commandData);
    });

    // Revenue Update Events
    this.revenueCalculator.on('revenue_updated', (revenueData) => {
      this.webSocketServer.broadcastRevenueUpdate(revenueData);
    });

    this.logger.info('Event handlers configured for hologram system');
  }

  async initializeHologramSystem() {
    try {
      // Wait for orchestrator initialization
      await new Promise((resolve) => {
        this.multiAgentOrchestrator.on('system_initialized', resolve);
      });

      // Create default Money Hunter agents
      await this.createDefaultMoneyHunterAgents();

      // Initialize revenue tracking
      await this.revenueCalculator.initializeRevenueTracking();

      // Start periodic updates
      this.startPeriodicUpdates();

      this.logger.info('Hologram system initialized successfully');
      this.webSocketServer.broadcastToAll({
        type: 'system:initialized',
        message: 'Holographic Command Center is online',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('Failed to initialize hologram system', { error: error.message });
      throw error;
    }
  }

  async createDefaultMoneyHunterAgents() {
    try {
      // Create Nexus Orchestrator
      const nexusAgent = this.moneyHunterSystem.createNexusOrchestrator({
        name: 'Nexus',
        priority: 'high'
      });
      await this.multiAgentOrchestrator.createAgent('nexus-orchestrator', {
        name: 'Nexus',
        priority: 'high'
      });

      // Create Sentinel Hunter
      const sentinelAgent = this.moneyHunterSystem.createSentinelHunter({
        name: 'Sentinel',
        priority: 'high'
      });
      await this.multiAgentOrchestrator.createAgent('sentinel-hunter', {
        name: 'Sentinel',
        priority: 'high'
      });

      // Create Validator QC
      const validatorAgent = this.moneyHunterSystem.createValidatorQC({
        name: 'Validator',
        priority: 'medium'
      });
      await this.multiAgentOrchestrator.createAgent('validator-qc', {
        name: 'Validator',
        priority: 'medium'
      });

      this.logger.info('Default Money Hunter agents created', {
        agents: ['nexus', 'sentinel', 'validator']
      });

    } catch (error) {
      this.logger.error('Failed to create default Money Hunter agents', { error: error.message });
    }
  }

  async handleHologramCommand(commandData) {
    const { command, agentId, params, clientId } = commandData;
    
    try {
      this.logger.info('Processing hologram command', { 
        clientId, 
        agentId, 
        command 
      });

      let result;
      
      // Route command to appropriate system
      if (agentId && command) {
        result = await this.multiAgentOrchestrator.commandAgent(agentId, command, params);
      } else {
        // Handle system-level commands
        result = await this.handleSystemCommand(command, params);
      }

      // Broadcast result
      this.webSocketServer.broadcastToAll({
        type: 'command:result',
        command: command,
        agentId: agentId,
        result: result,
        timestamp: new Date().toISOString()
      });

      this.logger.info('Hologram command processed successfully', { 
        clientId, 
        command, 
        success: true 
      });

    } catch (error) {
      this.logger.error('Failed to process hologram command', { 
        clientId, 
        command, 
        error: error.message 
      });

      // Broadcast error
      this.webSocketServer.broadcastToAll({
        type: 'command:error',
        command: command,
        agentId: agentId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async handleSystemCommand(command, params) {
    switch (command) {
      case 'start_hunt':
        return await this.startMoneyHunt();
      
      case 'run_full_pipeline':
        return await this.runFullPipeline();
      
      case 'get_system_status':
        return await this.getSystemStatus();
      
      case 'refresh_revenue':
        await this.revenueCalculator.refreshRevenueData();
        return { message: 'Revenue data refreshed' };
      
      default:
        throw new Error(`Unknown system command: ${command}`);
    }
  }

  async startMoneyHunt() {
    this.logger.info('Starting money hunt sequence');
    
    // Broadcast hunt start
    this.webSocketServer.broadcastToAll({
      type: 'hunt:started',
      message: 'Money Hunt sequence initiated',
      timestamp: new Date().toISOString()
    });

    // Execute hunt sequence
    const huntSequence = [
      { agent: 'sentinel-hunter', command: 'scan_platforms', params: { platforms: ['upwork', 'fiverr', 'freelancer'] } },
      { agent: 'validator-qc', command: 'batch_validate', params: { validation_criteria: { min_quality: 80 } } },
      { agent: 'nexus-orchestrator', command: 'generate_report', params: { report_type: 'hunt_summary' } }
    ];

    const results = [];
    for (const step of huntSequence) {
      try {
        const agents = await this.multiAgentOrchestrator.listAgents();
        const agent = agents.find(a => a.type === step.agent);
        
        if (agent) {
          const result = await this.multiAgentOrchestrator.commandAgent(agent.id, step.command, step.params);
          results.push({ step: step.agent, result });
          
          // Broadcast step completion
          this.webSocketServer.broadcastToAll({
            type: 'hunt:step_completed',
            agent: step.agent,
            command: step.command,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        this.logger.error('Hunt step failed', { step: step.agent, error: error.message });
      }
    }

    // Broadcast hunt completion
    this.webSocketServer.broadcastToAll({
      type: 'hunt:completed',
      results: results,
      message: 'Money Hunt sequence completed',
      timestamp: new Date().toISOString()
    });

    return {
      message: 'Money Hunt completed',
      results: results,
      opportunities_found: this.moneyHunterSystem.getOpportunities().length,
      validated_opportunities: this.moneyHunterSystem.getValidatedOpportunities().length
    };
  }

  async runFullPipeline() {
    this.logger.info('Running full pipeline sequence');
    
    // Broadcast pipeline start
    this.webSocketServer.broadcastToAll({
      type: 'pipeline:started',
      message: 'Full pipeline execution initiated',
      timestamp: new Date().toISOString()
    });

    const pipelineSteps = [
      { id: 1, name: 'SCAN', agent: 'sentinel-hunter' },
      { id: 2, name: 'DETECT', agent: 'sentinel-hunter' },
      { id: 3, name: 'VALIDATE', agent: 'validator-qc' },
      { id: 4, name: 'SCORE', agent: 'validator-qc' },
      { id: 5, name: 'DECIDE', agent: 'nexus-orchestrator' },
      { id: 6, name: 'EXECUTE', agent: 'nexus-orchestrator' }
    ];

    for (const step of pipelineSteps) {
      // Broadcast step activation
      this.webSocketServer.broadcastWorkflowStep(step);
      
      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.logger.info('Pipeline step completed', { 
        step: step.name, 
        agent: step.agent 
      });
    }

    // Broadcast pipeline completion
    this.webSocketServer.broadcastToAll({
      type: 'pipeline:completed',
      message: 'Full pipeline execution completed',
      timestamp: new Date().toISOString()
    });

    return {
      message: 'Full pipeline completed',
      steps_executed: pipelineSteps.length,
      opportunities_processed: this.moneyHunterSystem.getOpportunities().length
    };
  }

  async getSystemStatus() {
    const systemHealth = this.multiAgentOrchestrator.getSystemHealth();
    const agents = await this.multiAgentOrchestrator.listAgents();
    const revenue = await this.revenueCalculator.getCurrentRevenue();
    const moneyHunterStats = this.moneyHunterSystem.getSystemStats();

    return {
      system_health: systemHealth,
      agents: {
        total: agents.length,
        active: agents.filter(a => a.status === 'active').length,
        breakdown: this.getAgentBreakdown(agents)
      },
      revenue: revenue,
      money_hunter: moneyHunterStats,
      websocket: this.webSocketServer.getStats()
    };
  }

  getAgentBreakdown(agents) {
    const breakdown = {};
    agents.forEach(agent => {
      const category = this.getAgentCategory(agent.type);
      breakdown[category] = (breakdown[category] || 0) + 1;
    });
    return breakdown;
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

  async handleTaskCompletion(agent, task) {
    // Update revenue if applicable
    if (task.result?.type === 'booking_process' && task.result.booking_id) {
      this.revenueCalculator.updateTravelRevenue({
        id: task.result.booking_id,
        total_amount: task.result.amount || 0,
        status: 'completed'
      });
    }

    if (task.result?.type === 'opportunity_validation' && task.result.validation?.validated) {
      this.revenueCalculator.updateFreelanceRevenue({
        id: task.result.validation.opportunity_id,
        budget: task.result.validation.profitability_analysis?.estimated_profit || 0,
        status: 'validated'
      });
    }

    // Log task completion
    this.webSocketServer.broadcastLogEntry({
      level: 'info',
      agent: agent.name,
      message: `Task ${task.command} completed successfully`,
      timestamp: new Date().toISOString()
    });
  }

  startPeriodicUpdates() {
    // Update system metrics every 30 seconds
    setInterval(async () => {
      try {
        const systemStatus = await this.getSystemStatus();
        this.webSocketServer.broadcastSystemMetrics(systemStatus);
      } catch (error) {
        this.logger.error('Failed to broadcast system metrics', { error: error.message });
      }
    }, 30000);

    // Update revenue every 60 seconds
    setInterval(async () => {
      try {
        const revenue = await this.revenueCalculator.getCurrentRevenue();
        this.webSocketServer.broadcastRevenueUpdate(revenue);
      } catch (error) {
        this.logger.error('Failed to broadcast revenue update', { error: error.message });
      }
    }, 60000);

    this.logger.info('Periodic updates started');
  }

  // Public API Methods
  getRoutes() {
    return this.routes.getRouter();
  }

  getWebSocketServer() {
    return this.webSocketServer;
  }

  getMultiAgentOrchestrator() {
    return this.multiAgentOrchestrator;
  }

  getMoneyHunterSystem() {
    return this.moneyHunterSystem;
  }

  getRevenueCalculator() {
    return this.revenueCalculator;
  }

  async shutdown() {
    this.logger.info('Shutting down hologram system');
    
    // Close WebSocket server
    this.webSocketServer.close();
    
    // Stop periodic updates
    if (this.updateIntervals) {
      this.updateIntervals.forEach(interval => clearInterval(interval));
    }

    this.logger.info('Hologram system shutdown complete');
  }
}

module.exports = HologramController;

