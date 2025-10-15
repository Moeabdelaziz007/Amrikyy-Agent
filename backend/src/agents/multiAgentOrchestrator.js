/**
 * Multi-Agent Orchestrator
 * Main controller for the multi-agent system with real-time observability
 * Implements the INPUT → SYSTEM → OUTPUT architecture from the video
 */

const AgentController = require('./agentController');
const MCPAgentBridge = require('./mcpAgentBridge');
const EventEmitter = require('events');
const winston = require('winston');

class MultiAgentOrchestrator extends EventEmitter {
  constructor() {
    super();
    
    this.agentController = new AgentController();
    this.mcpBridge = new MCPAgentBridge();
    this.observability = new RealTimeObservability();
    this.inputProcessor = new InputProcessor();
    this.outputGenerator = new OutputGenerator();
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/multi-agent-orchestrator.log' }),
        new winston.transports.Console()
      ]
    });

    this.setupEventHandlers();
    this.initializeSystem();
  }

  setupEventHandlers() {
    // Agent Controller Events
    this.agentController.on('agent_created', (agent) => {
      this.logger.info('Agent created', { agentId: agent.id, type: agent.type });
      this.observability.recordAgentEvent('created', agent);
      this.emit('agent_created', agent);
    });

    this.agentController.on('agent_deleted', (agentId) => {
      this.logger.info('Agent deleted', { agentId });
      this.observability.recordAgentEvent('deleted', { agentId });
      this.emit('agent_deleted', agentId);
    });

    this.agentController.on('task_completed', ({ agent, task }) => {
      this.logger.info('Task completed', { 
        agentId: agent.id, 
        taskId: task.id, 
        command: task.command 
      });
      this.observability.recordTaskEvent('completed', { agent, task });
      this.emit('task_completed', { agent, task });
    });

    this.agentController.on('task_failed', ({ agent, task, error }) => {
      this.logger.error('Task failed', { 
        agentId: agent.id, 
        taskId: task.id, 
        command: task.command,
        error: error.message 
      });
      this.observability.recordTaskEvent('failed', { agent, task, error });
      this.emit('task_failed', { agent, task, error });
    });

    // MCP Bridge Events
    this.mcpBridge.on('agent_connected', (connection) => {
      this.logger.info('Agent connected to MCP', { 
        agentId: connection.agentId, 
        agentType: connection.agentType 
      });
      this.observability.recordMCPEvent('connected', connection);
    });

    this.mcpBridge.on('agent_disconnected', (connection) => {
      this.logger.info('Agent disconnected from MCP', { 
        agentId: connection.agentId 
      });
      this.observability.recordMCPEvent('disconnected', connection);
    });
  }

  async initializeSystem() {
    this.logger.info('Initializing Multi-Agent System...');
    
    try {
      // Initialize default agents for travel operations
      await this.createDefaultAgents();
      
      this.logger.info('Multi-Agent System initialized successfully');
      this.emit('system_initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Multi-Agent System', { error: error.message });
      throw error;
    }
  }

  async createDefaultAgents() {
    const defaultAgents = [
      {
        type: 'travel-researcher',
        config: { name: 'Maya Travel Researcher', priority: 'high' }
      },
      {
        type: 'booking-agent', 
        config: { name: 'Maya Booking Manager', priority: 'high' }
      },
      {
        type: 'customer-service',
        config: { name: 'Maya Customer Support', priority: 'medium' }
      },
      {
        type: 'data-analyst',
        config: { name: 'Maya Analytics Engine', priority: 'medium' }
      }
    ];

    for (const agentConfig of defaultAgents) {
      try {
        const agent = await this.agentController.create_agent(agentConfig.type, agentConfig.config);
        await this.mcpBridge.connectAgent(agent.id, agentConfig.type);
        this.logger.info('Default agent created and connected', { 
          agentId: agent.id, 
          type: agentConfig.type 
        });
      } catch (error) {
        this.logger.error('Failed to create default agent', { 
          type: agentConfig.type, 
          error: error.message 
        });
      }
    }
  }

  // INPUT Processing (Voice, Text, Agent Input)
  async processInput(input) {
    this.logger.info('Processing input', { type: input.type, source: input.source });
    
    try {
      const processedInput = await this.inputProcessor.process(input);
      this.observability.recordInputEvent(input);
      
      // Route to appropriate system component
      const response = await this.routeToSystem(processedInput);
      
      // Generate output
      const output = await this.outputGenerator.generate(response, input.type);
      
      this.emit('input_processed', { input, response, output });
      return output;
      
    } catch (error) {
      this.logger.error('Failed to process input', { error: error.message });
      this.observability.recordError('input_processing', error);
      throw error;
    }
  }

  async routeToSystem(processedInput) {
    const { intent, entities, context } = processedInput;
    
    switch (intent) {
      case 'create_agent':
        return await this.handleCreateAgent(entities);
      
      case 'command_agent':
        return await this.handleCommandAgent(entities);
      
      case 'travel_search':
        return await this.handleTravelSearch(entities);
      
      case 'booking_request':
        return await this.handleBookingRequest(entities);
      
      case 'analytics_request':
        return await this.handleAnalyticsRequest(entities);
      
      case 'system_status':
        return await this.handleSystemStatus();
      
      default:
        return await this.handleGeneralQuery(processedInput);
    }
  }

  // SYSTEM Handlers
  async handleCreateAgent(entities) {
    const { agent_type, config } = entities;
    const agent = await this.agentController.create_agent(agent_type, config);
    await this.mcpBridge.connectAgent(agent.id, agent_type);
    
    return {
      type: 'agent_creation',
      success: true,
      agent: agent,
      message: `Agent ${agent.name} created successfully`
    };
  }

  async handleCommandAgent(entities) {
    const { agent_id, command, params } = entities;
    const result = await this.agentController.command_agent(agent_id, command, params);
    
    return {
      type: 'agent_command',
      success: true,
      result: result,
      message: `Command ${command} executed on agent ${agent_id}`
    };
  }

  async handleTravelSearch(entities) {
    const { origin, destination, date, passengers } = entities;
    
    // Command travel researcher agent
    const researcherAgent = this.findAgentByType('travel-researcher');
    if (researcherAgent) {
      const searchResult = await this.agentController.command_agent(
        researcherAgent.id,
        'search_flights',
        { origin, destination, date, passengers }
      );
      
      return {
        type: 'travel_search',
        success: true,
        results: searchResult,
        message: `Found travel options from ${origin} to ${destination}`
      };
    }
    
    throw new Error('Travel researcher agent not available');
  }

  async handleBookingRequest(entities) {
    const { booking_data, payment_info } = entities;
    
    const bookingAgent = this.findAgentByType('booking-agent');
    if (bookingAgent) {
      const bookingResult = await this.agentController.command_agent(
        bookingAgent.id,
        'process_booking',
        { booking_data, payment_info }
      );
      
      return {
        type: 'booking_request',
        success: true,
        result: bookingResult,
        message: 'Booking processed successfully'
      };
    }
    
    throw new Error('Booking agent not available');
  }

  async handleAnalyticsRequest(entities) {
    const { analysis_type, timeframe } = entities;
    
    const analyticsAgent = this.findAgentByType('data-analyst');
    if (analyticsAgent) {
      const analysisResult = await this.agentController.command_agent(
        analyticsAgent.id,
        'analyze_trends',
        { analysis_type, timeframe }
      );
      
      return {
        type: 'analytics_request',
        success: true,
        results: analysisResult,
        message: `${analysis_type} analysis completed`
      };
    }
    
    throw new Error('Analytics agent not available');
  }

  async handleSystemStatus() {
    const systemStatus = this.agentController.getSystemStatus();
    const mcpMetrics = this.mcpBridge.getSystemMetrics();
    const observabilityData = this.observability.getSystemOverview();
    
    return {
      type: 'system_status',
      success: true,
      data: {
        agents: systemStatus,
        mcp_bridge: mcpMetrics,
        observability: observabilityData
      },
      message: 'System status retrieved successfully'
    };
  }

  async handleGeneralQuery(processedInput) {
    // Route to customer service agent for general queries
    const customerAgent = this.findAgentByType('customer-service');
    if (customerAgent) {
      const response = await this.agentController.command_agent(
        customerAgent.id,
        'customer_support',
        { query: processedInput.text, context: processedInput.context }
      );
      
      return {
        type: 'general_query',
        success: true,
        response: response,
        message: 'Query processed by customer service agent'
      };
    }
    
    return {
      type: 'general_query',
      success: false,
      message: 'No customer service agent available'
    };
  }

  // Helper Methods
  findAgentByType(agentType) {
    const agents = Array.from(this.agentController.agents.values());
    return agents.find(agent => agent.type === agentType && agent.status === 'active');
  }

  // Real-time Monitoring and Feedback
  getSystemHealth() {
    return {
      timestamp: new Date().toISOString(),
      system_status: this.agentController.getSystemStatus(),
      mcp_bridge_status: this.mcpBridge.getSystemMetrics(),
      observability_status: this.observability.getHealthMetrics(),
      overall_health: this.calculateOverallHealth()
    };
  }

  calculateOverallHealth() {
    const agentStatus = this.agentController.getSystemStatus();
    const mcpStatus = this.mcpBridge.getSystemMetrics();
    
    // Calculate health score (0-100)
    const agentHealth = (agentStatus.active_agents / Math.max(agentStatus.total_agents, 1)) * 50;
    const mcpHealth = (mcpStatus.active_connections / Math.max(mcpStatus.total_connections, 1)) * 50;
    
    const overallHealth = Math.round(agentHealth + mcpHealth);
    
    return {
      score: overallHealth,
      status: overallHealth > 80 ? 'excellent' : overallHealth > 60 ? 'good' : overallHealth > 40 ? 'fair' : 'poor',
      details: {
        agent_health: agentHealth,
        mcp_health: mcpHealth
      }
    };
  }

  // API Interface
  async listAgents() {
    return await this.agentController.list_agents();
  }

  async createAgent(type, config) {
    const agent = await this.agentController.create_agent(type, config);
    await this.mcpBridge.connectAgent(agent.id, type);
    return agent;
  }

  async commandAgent(agentId, command, params) {
    return await this.agentController.command_agent(agentId, command, params);
  }

  async deleteAgent(agentId) {
    await this.mcpBridge.disconnectAgent(agentId);
    return await this.agentController.delete_agent(agentId);
  }

  async checkAgentResult(agentId, taskId) {
    return await this.agentController.check_agent_result(agentId, taskId);
  }

  async getAgentMetrics(agentId) {
    return this.mcpBridge.getAgentMetrics(agentId);
  }
}

// Input Processor
class InputProcessor {
  process(input) {
    // Process different types of input (voice, text, agent)
    const processed = {
      type: input.type,
      source: input.source,
      timestamp: new Date().toISOString(),
      raw: input
    };

    switch (input.type) {
      case 'voice':
        return this.processVoiceInput(processed);
      case 'text':
        return this.processTextInput(processed);
      case 'agent':
        return this.processAgentInput(processed);
      default:
        throw new Error(`Unknown input type: ${input.type}`);
    }
  }

  processVoiceInput(input) {
    // Mock voice processing - in production, integrate with speech-to-text
    return {
      ...input,
      text: input.raw.transcript || 'Voice input processed',
      intent: this.extractIntent(input.raw.transcript || ''),
      entities: this.extractEntities(input.raw.transcript || ''),
      context: input.raw.context || {}
    };
  }

  processTextInput(input) {
    return {
      ...input,
      text: input.raw.text,
      intent: this.extractIntent(input.raw.text),
      entities: this.extractEntities(input.raw.text),
      context: input.raw.context || {}
    };
  }

  processAgentInput(input) {
    return {
      ...input,
      text: input.raw.message || 'Agent input',
      intent: input.raw.intent || 'general',
      entities: input.raw.entities || {},
      context: input.raw.context || {}
    };
  }

  extractIntent(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('create') && lowerText.includes('agent')) return 'create_agent';
    if (lowerText.includes('command') || lowerText.includes('tell agent')) return 'command_agent';
    if (lowerText.includes('flight') || lowerText.includes('travel')) return 'travel_search';
    if (lowerText.includes('book') || lowerText.includes('reservation')) return 'booking_request';
    if (lowerText.includes('analytics') || lowerText.includes('report')) return 'analytics_request';
    if (lowerText.includes('status') || lowerText.includes('health')) return 'system_status';
    
    return 'general_query';
  }

  extractEntities(text) {
    // Simple entity extraction - in production, use NLP libraries
    const entities = {};
    
    // Extract travel entities
    const flightMatch = text.match(/from\s+(\w+)\s+to\s+(\w+)/i);
    if (flightMatch) {
      entities.origin = flightMatch[1];
      entities.destination = flightMatch[2];
    }
    
    const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      entities.date = dateMatch[1];
    }
    
    const passengerMatch = text.match(/(\d+)\s+passenger/i);
    if (passengerMatch) {
      entities.passengers = parseInt(passengerMatch[1]);
    }
    
    return entities;
  }
}

// Output Generator
class OutputGenerator {
  async generate(response, inputType) {
    const output = {
      type: 'response',
      timestamp: new Date().toISOString(),
      response: response,
      formats: {}
    };

    // Generate different output formats based on input type
    switch (inputType) {
      case 'voice':
        output.formats.voice = this.generateVoiceOutput(response);
        output.formats.text = this.generateTextOutput(response);
        break;
      case 'text':
        output.formats.text = this.generateTextOutput(response);
        output.formats.files = this.generateFileOutput(response);
        break;
      case 'agent':
        output.formats.text = this.generateTextOutput(response);
        output.formats.actions = this.generateActionOutput(response);
        break;
      default:
        output.formats.text = this.generateTextOutput(response);
    }

    return output;
  }

  generateVoiceOutput(response) {
    return {
      audio: `Voice response for ${response.type}`,
      transcript: response.message || 'Response generated',
      duration: 5.2
    };
  }

  generateTextOutput(response) {
    return {
      message: response.message || 'Response generated',
      details: response.data || response.results,
      timestamp: new Date().toISOString()
    };
  }

  generateFileOutput(response) {
    if (response.type === 'analytics_request') {
      return {
        report: 'analytics_report.pdf',
        data: 'analytics_data.json',
        charts: ['trend_chart.png', 'summary_chart.png']
      };
    }
    return {};
  }

  generateActionOutput(response) {
    return {
      notifications: [`Action completed: ${response.type}`],
      updates: ['System status updated'],
      triggers: ['Next workflow step initiated']
    };
  }
}

// Real-time Observability
class RealTimeObservability {
  constructor() {
    this.events = [];
    this.agentEvents = new Map();
    this.taskEvents = new Map();
    this.mcpEvents = new Map();
    this.metrics = {
      total_events: 0,
      agent_events: 0,
      task_events: 0,
      mcp_events: 0,
      errors: 0
    };
  }

  recordAgentEvent(type, data) {
    const event = {
      type: 'agent_event',
      subtype: type,
      data: data,
      timestamp: new Date().toISOString()
    };
    
    this.events.push(event);
    this.agentEvents.set(data.id || data.agentId, event);
    this.metrics.total_events++;
    this.metrics.agent_events++;
  }

  recordTaskEvent(type, data) {
    const event = {
      type: 'task_event',
      subtype: type,
      data: data,
      timestamp: new Date().toISOString()
    };
    
    this.events.push(event);
    this.taskEvents.set(data.task.id, event);
    this.metrics.total_events++;
    this.metrics.task_events++;
  }

  recordMCPEvent(type, data) {
    const event = {
      type: 'mcp_event',
      subtype: type,
      data: data,
      timestamp: new Date().toISOString()
    };
    
    this.events.push(event);
    this.mcpEvents.set(data.agentId, event);
    this.metrics.total_events++;
    this.metrics.mcp_events++;
  }

  recordInputEvent(input) {
    const event = {
      type: 'input_event',
      data: input,
      timestamp: new Date().toISOString()
    };
    
    this.events.push(event);
    this.metrics.total_events++;
  }

  recordError(context, error) {
    const event = {
      type: 'error_event',
      context: context,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    this.events.push(event);
    this.metrics.total_events++;
    this.metrics.errors++;
  }

  getSystemOverview() {
    return {
      metrics: this.metrics,
      recent_events: this.events.slice(-20),
      event_summary: this.getEventSummary()
    };
  }

  getHealthMetrics() {
    const recentErrors = this.events
      .filter(e => e.type === 'error_event')
      .slice(-10);
    
    const errorRate = this.metrics.errors / Math.max(this.metrics.total_events, 1);
    
    return {
      error_rate: errorRate,
      recent_errors: recentErrors,
      system_uptime: process.uptime(),
      health_status: errorRate < 0.1 ? 'healthy' : 'degraded'
    };
  }

  getEventSummary() {
    const summary = {};
    for (const event of this.events) {
      if (!summary[event.type]) {
        summary[event.type] = 0;
      }
      summary[event.type]++;
    }
    return summary;
  }
}

module.exports = MultiAgentOrchestrator;

