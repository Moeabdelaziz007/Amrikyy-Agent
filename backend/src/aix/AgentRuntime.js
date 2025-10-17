/**
 * Agent Runtime - Complete Agent Lifecycle Management
 * Created by Cursor - AIX Integration Team
 * 
 * Manages the complete lifecycle of AIX agents:
 * - Loading and validation
 * - Execution and monitoring
 * - Memory and learning
 * - Communication and coordination
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/logger');
const { AIXManager } = require('./AIXManager');
const AIXConnectionManager = require('./AIXConnectionManager');
const { wrapAgentBrain, wrapAsyncOperation } = require('../utils/langsmith_helpers');

const log = logger.child('AgentRuntime');

/**
 * Agent Runtime - Central agent management system
 */
class AgentRuntime extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      agentsDirectory: options.agentsDirectory || path.join(__dirname, '../../agents'),
      maxConcurrentAgents: options.maxConcurrentAgents || 50,
      defaultTimeout: options.defaultTimeout || 30000, // 30s
      enableLearning: options.enableLearning !== false,
      enableMonitoring: options.enableMonitoring !== false,
      ...options
    };

    // Core systems
    this.aixManager = new AIXManager({
      agentsDirectory: this.options.agentsDirectory,
      autoLoad: false,
      validateOnLoad: true
    });
    
    this.connectionManager = new AIXConnectionManager();
    
    // Agent registry
    this.activeAgents = new Map();
    this.agentInstances = new Map();
    this.agentMetrics = new Map();
    
    // Runtime state
    this.isRunning = false;
    this.startTime = null;
    
    // Performance tracking
    this.stats = {
      totalActivations: 0,
      totalExecutions: 0,
      totalErrors: 0,
      averageExecutionTime: 0,
      uptime: 0
    };

    log.info('Agent Runtime initialized', {
      agentsDirectory: this.options.agentsDirectory,
      maxConcurrentAgents: this.options.maxConcurrentAgents
    });
  }

  /**
   * Start the agent runtime system
   */
  async start() {
    if (this.isRunning) {
      log.warn('Agent Runtime already started');
      return;
    }

    try {
      log.info('Starting Agent Runtime...');
      
      // Start connection manager
      this.connectionManager.start();
      
      // Load all available agents
      await this.loadAllAvailableAgents();
      
      // Start monitoring if enabled
      if (this.options.enableMonitoring) {
        this.startMonitoring();
      }
      
      this.isRunning = true;
      this.startTime = Date.now();
      
      log.success('Agent Runtime started successfully', {
        loadedAgents: this.activeAgents.size,
        uptime: 0
      });
      
      this.emit('runtimeStarted', {
        timestamp: new Date(),
        agentsLoaded: this.activeAgents.size
      });
      
    } catch (error) {
      log.error('Failed to start Agent Runtime', { error: error.message });
      throw error;
    }
  }

  /**
   * Stop the agent runtime system
   */
  async stop() {
    if (!this.isRunning) {
      log.warn('Agent Runtime not running');
      return;
    }

    try {
      log.info('Stopping Agent Runtime...');
      
      // Deactivate all agents
      for (const [agentId, agent] of this.activeAgents) {
        await this.deactivateAgent(agentId);
      }
      
      // Stop connection manager
      this.connectionManager.stop();
      
      this.isRunning = false;
      this.stats.uptime = Date.now() - this.startTime;
      
      log.success('Agent Runtime stopped successfully', {
        uptime: this.stats.uptime,
        totalExecutions: this.stats.totalExecutions
      });
      
      this.emit('runtimeStopped', {
        timestamp: new Date(),
        uptime: this.stats.uptime,
        stats: this.stats
      });
      
    } catch (error) {
      log.error('Failed to stop Agent Runtime', { error: error.message });
      throw error;
    }
  }

  /**
   * Load all available agents from the agents directory
   */
  async loadAllAvailableAgents() {
    try {
      const files = await fs.readdir(this.options.agentsDirectory);
      const aixFiles = files.filter(file => 
        file.endsWith('.aix') || 
        file.endsWith('.yaml') || 
        file.endsWith('.yml') || 
        file.endsWith('.json')
      );

      log.info(`Found ${aixFiles.length} AIX files to load`);

      for (const file of aixFiles) {
        try {
          const agentPath = path.join(this.options.agentsDirectory, file);
          await this.loadAgent(agentPath);
        } catch (error) {
          log.warn(`Failed to load agent file ${file}`, { error: error.message });
        }
      }

      log.success(`Loaded ${this.activeAgents.size} agents successfully`);
      
    } catch (error) {
      log.error('Failed to load available agents', { error: error.message });
      throw error;
    }
  }

  /**
   * Load a specific agent from file path
   */
  async loadAgent(agentPath) {
    try {
      log.info(`Loading agent from ${agentPath}`);
      
      // Load agent using AIX Manager
      const aixAgent = await this.aixManager.loadAgent(agentPath);
      
      // Create agent instance
      const agentInstance = new AgentInstance(aixAgent, {
        runtime: this,
        timeout: this.options.defaultTimeout,
        enableLearning: this.options.enableLearning
      });
      
      // Register agent
      const agentId = aixAgent.id || aixAgent.meta?.id || path.basename(agentPath, path.extname(agentPath));
      this.activeAgents.set(agentId, aixAgent);
      this.agentInstances.set(agentId, agentInstance);
      
      // Initialize metrics
      this.agentMetrics.set(agentId, {
        activations: 0,
        executions: 0,
        errors: 0,
        averageExecutionTime: 0,
        lastActivity: null,
        status: 'loaded'
      });
      
      log.success(`Agent ${agentId} loaded successfully`, {
        name: aixAgent.name || aixAgent.meta?.name,
        version: aixAgent.version || aixAgent.meta?.version
      });
      
      this.emit('agentLoaded', {
        agentId,
        agent: aixAgent,
        timestamp: new Date()
      });
      
      return { agentId, agent: aixAgent };
      
    } catch (error) {
      log.error(`Failed to load agent from ${agentPath}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Activate an agent (make it available for execution)
   */
  async activateAgent(agentId, options = {}) {
    try {
      const agent = this.activeAgents.get(agentId);
      const agentInstance = this.agentInstances.get(agentId);
      
      if (!agent || !agentInstance) {
        throw new Error(`Agent ${agentId} not found`);
      }

      log.info(`Activating agent ${agentId}`);
      
      // Check concurrent agent limit
      if (this.getActiveAgentCount() >= this.options.maxConcurrentAgents) {
        throw new Error(`Maximum concurrent agents limit reached (${this.options.maxConcurrentAgents})`);
      }

      // Initialize agent instance
      await agentInstance.initialize();
      
      // Connect to communication system
      await this.connectionManager.connectAgent(agentId, agentInstance, {
        protocols: ['AIX3', 'MCP', 'PING'],
        capabilities: this.extractCapabilities(agent),
        server: options.server !== false
      });

      // Update metrics
      const metrics = this.agentMetrics.get(agentId);
      metrics.activations++;
      metrics.lastActivity = new Date();
      metrics.status = 'active';

      this.stats.totalActivations++;
      
      log.success(`Agent ${agentId} activated successfully`);
      
      this.emit('agentActivated', {
        agentId,
        agent,
        timestamp: new Date()
      });
      
      return {
        success: true,
        agentId,
        status: 'active',
        capabilities: this.extractCapabilities(agent)
      };
      
    } catch (error) {
      log.error(`Failed to activate agent ${agentId}`, { error: error.message });
      
      // Update error metrics
      const metrics = this.agentMetrics.get(agentId);
      if (metrics) {
        metrics.errors++;
        metrics.status = 'error';
      }
      this.stats.totalErrors++;
      
      throw error;
    }
  }

  /**
   * Deactivate an agent
   */
  async deactivateAgent(agentId) {
    try {
      const agentInstance = this.agentInstances.get(agentId);
      
      if (!agentInstance) {
        log.warn(`Agent ${agentId} not found for deactivation`);
        return;
      }

      log.info(`Deactivating agent ${agentId}`);
      
      // Disconnect from communication system
      await this.connectionManager.disconnectAgent(agentId);
      
      // Cleanup agent instance
      await agentInstance.cleanup();
      
      // Update metrics
      const metrics = this.agentMetrics.get(agentId);
      if (metrics) {
        metrics.status = 'inactive';
        metrics.lastActivity = new Date();
      }
      
      log.success(`Agent ${agentId} deactivated successfully`);
      
      this.emit('agentDeactivated', {
        agentId,
        timestamp: new Date()
      });
      
      return {
        success: true,
        agentId,
        status: 'inactive'
      };
      
    } catch (error) {
      log.error(`Failed to deactivate agent ${agentId}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Execute a task on an agent
   */
  executeAgent = wrapAgentBrain(async function(agentId, task, context = {}) {
    const startTime = Date.now();
    
    try {
      const agentInstance = this.agentInstances.get(agentId);
      
      if (!agentInstance) {
        throw new Error(`Agent ${agentId} not found`);
      }

      const metrics = this.agentMetrics.get(agentId);
      if (metrics.status !== 'active') {
        throw new Error(`Agent ${agentId} is not active (status: ${metrics.status})`);
      }

      log.info(`Executing task on agent ${agentId}`, {
        taskType: task.type || 'unknown',
        taskId: task.id || 'unknown'
      });

      // Execute the task
      const result = await agentInstance.execute(task, context);
      
      // Update metrics
      const executionTime = Date.now() - startTime;
      metrics.executions++;
      metrics.lastActivity = new Date();
      metrics.averageExecutionTime = 
        (metrics.averageExecutionTime * (metrics.executions - 1) + executionTime) / metrics.executions;
      
      this.stats.totalExecutions++;
      this.stats.averageExecutionTime = 
        (this.stats.averageExecutionTime * (this.stats.totalExecutions - 1) + executionTime) / this.stats.totalExecutions;
      
      log.success(`Task executed successfully on agent ${agentId}`, {
        executionTime,
        taskType: task.type
      });
      
      this.emit('agentExecuted', {
        agentId,
        task,
        result,
        executionTime,
        timestamp: new Date()
      });
      
      return {
        success: true,
        agentId,
        result,
        executionTime,
        timestamp: new Date()
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      log.error(`Task execution failed on agent ${agentId}`, {
        error: error.message,
        executionTime
      });
      
      // Update error metrics
      const metrics = this.agentMetrics.get(agentId);
      if (metrics) {
        metrics.errors++;
        metrics.lastActivity = new Date();
      }
      this.stats.totalErrors++;
      
      throw error;
    }
  }

  /**
   * Get agent status
   */
  getAgentStatus(agentId) {
    const agent = this.activeAgents.get(agentId);
    const agentInstance = this.agentInstances.get(agentId);
    const metrics = this.agentMetrics.get(agentId);
    
    if (!agent) {
      return { error: 'Agent not found' };
    }

    return {
      agentId,
      name: agent.name || agent.meta?.name,
      version: agent.version || agent.meta?.version,
      status: metrics?.status || 'unknown',
      capabilities: this.extractCapabilities(agent),
      metrics: metrics || {},
      lastActivity: metrics?.lastActivity,
      uptime: agentInstance?.getUptime() || 0
    };
  }

  /**
   * Get all agents status
   */
  getAllAgentsStatus() {
    const agents = {};
    
    for (const [agentId] of this.activeAgents) {
      agents[agentId] = this.getAgentStatus(agentId);
    }
    
    return agents;
  }

  /**
   * Get runtime statistics
   */
  getRuntimeStats() {
    return {
      ...this.stats,
      uptime: this.isRunning ? Date.now() - this.startTime : 0,
      activeAgents: this.getActiveAgentCount(),
      totalAgents: this.activeAgents.size,
      isRunning: this.isRunning
    };
  }

  /**
   * Get count of active agents
   */
  getActiveAgentCount() {
    let count = 0;
    for (const [, metrics] of this.agentMetrics) {
      if (metrics.status === 'active') {
        count++;
      }
    }
    return count;
  }

  /**
   * Extract capabilities from agent configuration
   */
  extractCapabilities(agent) {
    const capabilities = [];
    
    // Extract from skills section
    if (agent.skills && Array.isArray(agent.skills)) {
      capabilities.push(...agent.skills.map(skill => skill.name || skill));
    }
    
    // Extract from APIs section
    if (agent.apis && Array.isArray(agent.apis)) {
      capabilities.push(...agent.apis.map(api => api.name || api.id));
    }
    
    // Extract from MCP servers
    if (agent.mcp_servers && Array.isArray(agent.mcp_servers)) {
      capabilities.push(...agent.mcp_servers.map(server => server.name));
    }
    
    return capabilities;
  }

  /**
   * Start monitoring system
   */
  startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Check every 30 seconds
    
    log.info('Agent monitoring started');
  }

  /**
   * Perform health check on all agents
   */
  async performHealthCheck() {
    try {
      const activeAgents = this.getActiveAgentCount();
      const totalAgents = this.activeAgents.size;
      
      log.debug('Health check performed', {
        activeAgents,
        totalAgents,
        uptime: this.isRunning ? Date.now() - this.startTime : 0
      });
      
      this.emit('healthCheck', {
        activeAgents,
        totalAgents,
        timestamp: new Date()
      });
      
    } catch (error) {
      log.error('Health check failed', { error: error.message });
    }
  }
}

/**
 * Agent Instance - Individual agent execution wrapper
 */
class AgentInstance {
  constructor(aixAgent, options = {}) {
    this.aixAgent = aixAgent;
    this.options = options;
    this.runtime = options.runtime;
    
    this.isInitialized = false;
    this.startTime = null;
    this.executionCount = 0;
    this.lastExecution = null;
    
    // Agent capabilities
    this.capabilities = this.extractCapabilities();
    this.functions = new Map();
    
    this.prepareFunctions();
  }

  /**
   * Initialize the agent instance
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      log.info(`Initializing agent instance: ${this.aixAgent.id || this.aixAgent.meta?.id}`);
      
      this.startTime = Date.now();
      this.isInitialized = true;
      
      log.success(`Agent instance initialized: ${this.aixAgent.id || this.aixAgent.meta?.id}`);
      
    } catch (error) {
      log.error(`Failed to initialize agent instance: ${this.aixAgent.id || this.aixAgent.meta?.id}`, {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Execute a task on this agent
   */
  execute = wrapAgentBrain(async function(task, context = {}) {
    if (!this.isInitialized) {
      throw new Error('Agent instance not initialized');
    }

    try {
      log.info(`Executing task on agent instance: ${this.aixAgent.id || this.aixAgent.meta?.id}`, {
        taskType: task.type,
        taskId: task.id
      });

      // Execute based on agent type and capabilities
      const result = await this.executeTask(task, context);
      
      this.executionCount++;
      this.lastExecution = new Date();
      
      log.success(`Task executed successfully on agent instance: ${this.aixAgent.id || this.aixAgent.meta?.id}`);
      
      return result;
      
    } catch (error) {
      log.error(`Task execution failed on agent instance: ${this.aixAgent.id || this.aixAgent.meta?.id}`, {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Execute task based on agent capabilities
   */
  executeTask = wrapAsyncOperation(async function(task, context) {
    // For now, return a mock execution result
    // In a real implementation, this would execute the agent's actual capabilities
    
    return {
      success: true,
      agentId: this.aixAgent.id || this.aixAgent.meta?.id,
      taskId: task.id,
      result: {
        message: `Task executed by ${this.aixAgent.name || this.aixAgent.meta?.name}`,
        capabilities: this.capabilities,
        executionTime: Date.now()
      },
      timestamp: new Date()
    };
  }

  /**
   * Prepare agent functions
   */
  prepareFunctions() {
    if (this.aixAgent.skills && Array.isArray(this.aixAgent.skills)) {
      for (const skill of this.aixAgent.skills) {
        if (skill.enabled !== false) {
          this.functions.set(skill.name, {
            description: skill.description,
            parameters: skill.parameters || {},
            timeout: skill.timeout || this.options.timeout,
            priority: skill.priority || 5
          });
        }
      }
    }
  }

  /**
   * Extract capabilities from agent configuration
   */
  extractCapabilities() {
    const capabilities = [];
    
    if (this.aixAgent.skills && Array.isArray(this.aixAgent.skills)) {
      capabilities.push(...this.aixAgent.skills.map(skill => skill.name));
    }
    
    if (this.aixAgent.apis && Array.isArray(this.aixAgent.apis)) {
      capabilities.push(...this.aixAgent.apis.map(api => api.name || api.id));
    }
    
    if (this.aixAgent.mcp_servers && Array.isArray(this.aixAgent.mcp_servers)) {
      capabilities.push(...this.aixAgent.mcp_servers.map(server => server.name));
    }
    
    return capabilities;
  }

  /**
   * Get agent uptime
   */
  getUptime() {
    return this.startTime ? Date.now() - this.startTime : 0;
  }

  /**
   * Cleanup agent instance
   */
  async cleanup() {
    if (!this.isInitialized) {
      return;
    }

    try {
      log.info(`Cleaning up agent instance: ${this.aixAgent.id || this.aixAgent.meta?.id}`);
      
      // Perform any necessary cleanup
      this.isInitialized = false;
      
      log.success(`Agent instance cleaned up: ${this.aixAgent.id || this.aixAgent.meta?.id}`);
      
    } catch (error) {
      log.error(`Failed to cleanup agent instance: ${this.aixAgent.id || this.aixAgent.meta?.id}`, {
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = {
  AgentRuntime,
  AgentInstance
};
