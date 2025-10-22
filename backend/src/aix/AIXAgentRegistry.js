/**
 * @fileoverview AIX Agent Registry - Central registry for managing AIX agents
 * @description Manages agent lifecycle, communication, and coordination
 * @version 1.0.0
 * @author AMRIKYY AI Solutions
 */

const EventEmitter = require('events');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

/**
 * @class AIXAgentRegistry
 * @description Central registry for managing AIX agents and their coordination
 */
class AIXAgentRegistry extends EventEmitter {
  constructor() {
    super();

    this.name = 'aix_agent_registry';
    this.version = '1.0.0';
    this.agents = new Map();
    this.agentTypes = new Map();
    this.communicationChannels = new Map();
    this.coordinationProtocols = new Map();

    // Registry state
    this.isInitialized = false;
    this.activeSessions = new Map();
    this.performanceMetrics = new AgentPerformanceMetrics();

    // Agent coordination
    this.agentHierarchy = new Map();
    this.agentDependencies = new Map();
    this.agentCapabilities = new Map();

    this.initialize();
  }

  /**
   * Initialize the AIX Agent Registry
   */
  async initialize() {
    try {
      logger.info('🤖 Initializing AIX Agent Registry...');

      // Load predefined agent types
      await this.loadPredefinedAgentTypes();

      // Initialize communication channels
      await this.initializeCommunicationChannels();

      // Initialize coordination protocols
      await this.initializeCoordinationProtocols();

      // Start registry monitoring
      this.startRegistryMonitoring();

      this.isInitialized = true;
      logger.info('✅ AIX Agent Registry initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize AIX Agent Registry:', error);
      throw error;
    }
  }

  /**
   * Load predefined agent types
   */
  async loadPredefinedAgentTypes() {
    // Maya Travel Agent types
    this.agentTypes.set('maya-orchestrator', {
      name: 'Maya Orchestrator',
      role: 'travel_coordination',
      capabilities: ['orchestration', 'coordination', 'decision_making'],
      dependencies: ['luna', 'karim', 'layla', 'amira', 'tariq', 'zara'],
      priority: 'high',
    });

    this.agentTypes.set('luna', {
      name: 'Luna - Trip Architect',
      role: 'trip_planning',
      capabilities: ['itinerary_design', 'route_planning', 'attraction_research'],
      dependencies: [],
      priority: 'high',
    });

    this.agentTypes.set('karim', {
      name: 'Karim - Budget Optimizer',
      role: 'budget_optimization',
      capabilities: ['budget_optimization', 'cost_analysis', 'price_tracking'],
      dependencies: [],
      priority: 'high',
    });

    this.agentTypes.set('layla', {
      name: 'Layla - Cultural Guide',
      role: 'cultural_guidance',
      capabilities: ['cultural_guidance', 'local_experiences', 'etiquette_advice'],
      dependencies: [],
      priority: 'medium',
    });

    this.agentTypes.set('amira', {
      name: 'Amira - Problem Solver',
      role: 'problem_solving',
      capabilities: ['problem_solving', 'conflict_resolution', 'crisis_management'],
      dependencies: [],
      priority: 'medium',
    });

    this.agentTypes.set('tariq', {
      name: 'Tariq - Payment Manager',
      role: 'payment_management',
      capabilities: ['payment_processing', 'financial_security', 'transaction_management'],
      dependencies: [],
      priority: 'high',
    });

    this.agentTypes.set('zara', {
      name: 'Zara - Research Specialist',
      role: 'research',
      capabilities: ['data_research', 'fact_checking', 'information_validation'],
      dependencies: [],
      priority: 'medium',
    });

    this.agentTypes.set('cline', {
      name: 'Cline - Development Agent',
      role: 'development',
      capabilities: ['code_execution', 'development', 'technical_implementation'],
      dependencies: [],
      priority: 'high',
    });

    this.agentTypes.set('pattern-engine', {
      name: 'Pattern Engine',
      role: 'learning',
      capabilities: ['pattern_recognition', 'learning', 'optimization'],
      dependencies: [],
      priority: 'medium',
    });

    this.agentTypes.set('aieducation-agent', {
      name: 'AI Education Agent',
      role: 'education',
      capabilities: ['teaching', 'curriculum_design', 'learning_adaptation'],
      dependencies: [],
      priority: 'medium',
    });

    logger.info(`📚 Loaded ${this.agentTypes.size} predefined agent types`);
  }

  /**
   * Register an AIX agent
   * @param {Object} agentSpec - AIX agent specification
   * @returns {string} Agent ID
   */
  async registerAgent(agentSpec) {
    try {
      // Validate agent specification
      const validationResult = await this.validateAgentSpec(agentSpec);
      if (!validationResult.isValid) {
        throw new Error(`Invalid agent specification: ${validationResult.errors.join(', ')}`);
      }

      // Generate unique agent ID
      const agentId = this.generateAgentId(agentSpec);

      // Create agent instance
      const agent = new AIXAgentInstance(agentSpec, agentId, this);

      // Register agent
      this.agents.set(agentId, agent);

      // Initialize agent
      await agent.initialize();

      // Update registry state
      await this.updateRegistryState(agent);

      logger.info(`✅ Agent registered: ${agentId} (${agentSpec.persona.role})`);

      this.emit('agentRegistered', { agentId, agentSpec });

      return agentId;
    } catch (error) {
      logger.error('❌ Failed to register agent:', error);
      throw error;
    }
  }

  /**
   * Unregister an AIX agent
   * @param {string} agentId - Agent ID
   */
  async unregisterAgent(agentId) {
    try {
      const agent = this.agents.get(agentId);
      if (!agent) {
        throw new Error(`Agent not found: ${agentId}`);
      }

      // Shutdown agent
      await agent.shutdown();

      // Remove from registry
      this.agents.delete(agentId);

      // Update registry state
      await this.updateRegistryState();

      logger.info(`🗑️ Agent unregistered: ${agentId}`);

      this.emit('agentUnregistered', { agentId });
    } catch (error) {
      logger.error('❌ Failed to unregister agent:', error);
      throw error;
    }
  }

  /**
   * Get agent by ID
   * @param {string} agentId - Agent ID
   * @returns {AIXAgentInstance} Agent instance
   */
  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents by type
   * @param {string} agentType - Agent type
   * @returns {Array} Array of agent instances
   */
  getAgentsByType(agentType) {
    const agents = [];
    for (const [agentId, agent] of this.agents) {
      if (agent.spec.persona.role === agentType) {
        agents.push(agent);
      }
    }
    return agents;
  }

  /**
   * Get all agents by capability
   * @param {string} capability - Capability
   * @returns {Array} Array of agent instances
   */
  getAgentsByCapability(capability) {
    const agents = [];
    for (const [agentId, agent] of this.agents) {
      if (agent.spec.capabilities && agent.spec.capabilities.includes(capability)) {
        agents.push(agent);
      }
    }
    return agents;
  }

  /**
   * Execute multi-agent coordination
   * @param {string} taskType - Type of task
   * @param {Object} taskData - Task data
   * @param {Array} requiredCapabilities - Required capabilities
   * @returns {Object} Coordination result
   */
  async executeMultiAgentCoordination(taskType, taskData, requiredCapabilities = []) {
    try {
      logger.info(`🤝 Starting multi-agent coordination for task: ${taskType}`);

      // Find suitable agents
      const suitableAgents = await this.findSuitableAgents(requiredCapabilities);

      if (suitableAgents.length === 0) {
        throw new Error('No suitable agents found for the task');
      }

      // Create coordination session
      const sessionId = this.createCoordinationSession(taskType, taskData, suitableAgents);

      // Execute coordination protocol
      const coordinationResult = await this.executeCoordinationProtocol(sessionId, suitableAgents);

      // End coordination session
      this.endCoordinationSession(sessionId, coordinationResult);

      return coordinationResult;
    } catch (error) {
      logger.error('❌ Multi-agent coordination failed:', error);
      throw error;
    }
  }

  /**
   * Find suitable agents for a task
   * @param {Array} requiredCapabilities - Required capabilities
   * @returns {Array} Suitable agents
   */
  async findSuitableAgents(requiredCapabilities) {
    const suitableAgents = [];

    for (const [agentId, agent] of this.agents) {
      if (agent.isAvailable() && agent.hasCapabilities(requiredCapabilities)) {
        suitableAgents.push(agent);
      }
    }

    // Sort by priority and availability
    suitableAgents.sort((a, b) => {
      const priorityA = this.agentTypes.get(a.spec.persona.role)?.priority || 'medium';
      const priorityB = this.agentTypes.get(b.spec.persona.role)?.priority || 'medium';

      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[priorityB] - priorityOrder[priorityA];
    });

    return suitableAgents;
  }

  /**
   * Execute coordination protocol
   * @param {string} sessionId - Session ID
   * @param {Array} agents - Participating agents
   * @returns {Object} Coordination result
   */
  async executeCoordinationProtocol(sessionId, agents) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Coordination session not found: ${sessionId}`);
    }

    try {
      // Step 1: Task decomposition
      const taskDecomposition = await this.decomposeTask(session.taskData, agents);

      // Step 2: Agent assignment
      const agentAssignments = await this.assignAgentsToSubtasks(taskDecomposition, agents);

      // Step 3: Parallel execution
      const executionResults = await this.executeSubtasksInParallel(agentAssignments);

      // Step 4: Result synthesis
      const synthesisResult = await this.synthesizeResults(executionResults, session.taskData);

      return {
        sessionId,
        success: true,
        taskDecomposition,
        agentAssignments,
        executionResults,
        synthesisResult,
        duration: Date.now() - session.startTime,
      };
    } catch (error) {
      logger.error('❌ Coordination protocol execution failed:', error);
      return {
        sessionId,
        success: false,
        error: error.message,
        duration: Date.now() - session.startTime,
      };
    }
  }

  /**
   * Decompose task into subtasks
   * @param {Object} taskData - Task data
   * @param {Array} agents - Available agents
   * @returns {Array} Subtasks
   */
  async decomposeTask(taskData, agents) {
    // Simple task decomposition based on agent capabilities
    const subtasks = [];

    for (const agent of agents) {
      const agentCapabilities = agent.spec.capabilities || [];

      for (const capability of agentCapabilities) {
        if (this.taskRequiresCapability(taskData, capability)) {
          subtasks.push({
            id: crypto.randomUUID(),
            capability,
            agentId: agent.id,
            data: this.extractTaskDataForCapability(taskData, capability),
            priority: 'medium',
          });
        }
      }
    }

    return subtasks;
  }

  /**
   * Assign agents to subtasks
   * @param {Array} subtasks - Subtasks
   * @param {Array} agents - Available agents
   * @returns {Array} Agent assignments
   */
  async assignAgentsToSubtasks(subtasks, agents) {
    const assignments = [];

    for (const subtask of subtasks) {
      const agent = agents.find((a) => a.id === subtask.agentId);
      if (agent) {
        assignments.push({
          subtaskId: subtask.id,
          agentId: agent.id,
          capability: subtask.capability,
          data: subtask.data,
          priority: subtask.priority,
        });
      }
    }

    return assignments;
  }

  /**
   * Execute subtasks in parallel
   * @param {Array} assignments - Agent assignments
   * @returns {Array} Execution results
   */
  async executeSubtasksInParallel(assignments) {
    const executionPromises = assignments.map(async (assignment) => {
      try {
        const agent = this.agents.get(assignment.agentId);
        if (!agent) {
          throw new Error(`Agent not found: ${assignment.agentId}`);
        }

        const result = await agent.executeTask(assignment.data, assignment.capability);

        return {
          assignmentId: assignment.subtaskId,
          agentId: assignment.agentId,
          capability: assignment.capability,
          success: true,
          result,
          duration: result.duration || 0,
        };
      } catch (error) {
        return {
          assignmentId: assignment.subtaskId,
          agentId: assignment.agentId,
          capability: assignment.capability,
          success: false,
          error: error.message,
          duration: 0,
        };
      }
    });

    return await Promise.all(executionPromises);
  }

  /**
   * Synthesize execution results
   * @param {Array} executionResults - Execution results
   * @param {Object} originalTaskData - Original task data
   * @returns {Object} Synthesis result
   */
  async synthesizeResults(executionResults, originalTaskData) {
    const successfulResults = executionResults.filter((r) => r.success);
    const failedResults = executionResults.filter((r) => !r.success);

    // Combine successful results
    const combinedResult = {
      taskType: originalTaskData.type || 'multi_agent_task',
      success: failedResults.length === 0,
      results: successfulResults.map((r) => ({
        capability: r.capability,
        agentId: r.agentId,
        result: r.result,
      })),
      failures: failedResults.map((r) => ({
        capability: r.capability,
        agentId: r.agentId,
        error: r.error,
      })),
      totalDuration: executionResults.reduce((sum, r) => sum + r.duration, 0),
      successRate: successfulResults.length / executionResults.length,
    };

    return combinedResult;
  }

  /**
   * Create coordination session
   * @param {string} taskType - Task type
   * @param {Object} taskData - Task data
   * @param {Array} agents - Participating agents
   * @returns {string} Session ID
   */
  createCoordinationSession(taskType, taskData, agents) {
    const sessionId = crypto.randomUUID();

    this.activeSessions.set(sessionId, {
      taskType,
      taskData,
      agents: agents.map((a) => a.id),
      startTime: Date.now(),
      status: 'active',
    });

    return sessionId;
  }

  /**
   * End coordination session
   * @param {string} sessionId - Session ID
   * @param {Object} result - Coordination result
   */
  endCoordinationSession(sessionId, result) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.endTime = Date.now();
      session.duration = session.endTime - session.startTime;
      session.status = 'completed';
      session.result = result;

      // Update performance metrics
      this.performanceMetrics.recordCoordination(session);
    }
  }

  /**
   * Initialize communication channels
   */
  async initializeCommunicationChannels() {
    // Initialize inter-agent communication channels
    this.communicationChannels.set('direct', new DirectCommunicationChannel());
    this.communicationChannels.set('broadcast', new BroadcastCommunicationChannel());
    this.communicationChannels.set('hierarchical', new HierarchicalCommunicationChannel());

    logger.info('📡 Communication channels initialized');
  }

  /**
   * Initialize coordination protocols
   */
  async initializeCoordinationProtocols() {
    // Initialize coordination protocols
    this.coordinationProtocols.set('sequential', new SequentialCoordinationProtocol());
    this.coordinationProtocols.set('parallel', new ParallelCoordinationProtocol());
    this.coordinationProtocols.set('hierarchical', new HierarchicalCoordinationProtocol());

    logger.info('🤝 Coordination protocols initialized');
  }

  /**
   * Start registry monitoring
   */
  startRegistryMonitoring() {
    setInterval(() => {
      this.performanceMetrics.updateRegistryMetrics({
        activeAgents: this.agents.size,
        activeSessions: this.activeSessions.size,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      });
    }, 30000); // Update every 30 seconds
  }

  /**
   * Generate unique agent ID
   * @param {Object} agentSpec - Agent specification
   * @returns {string} Agent ID
   */
  generateAgentId(agentSpec) {
    const baseId = agentSpec.agent_id || agentSpec.persona.role.toLowerCase().replace(/\s+/g, '-');
    const timestamp = Date.now();
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(agentSpec))
      .digest('hex')
      .substring(0, 8);

    return `${baseId}-${hash}-${timestamp}`;
  }

  /**
   * Validate agent specification
   * @param {Object} agentSpec - Agent specification
   * @returns {Object} Validation result
   */
  async validateAgentSpec(agentSpec) {
    const errors = [];

    // Required fields validation
    const requiredFields = ['persona', 'instructions', 'memory_access_policy'];
    for (const field of requiredFields) {
      if (!agentSpec[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Persona validation
    if (agentSpec.persona) {
      const requiredPersonaFields = ['role', 'tone', 'specialization'];
      for (const field of requiredPersonaFields) {
        if (!agentSpec.persona[field]) {
          errors.push(`Missing required persona field: ${field}`);
        }
      }
    }

    // Memory access policy validation
    if (agentSpec.memory_access_policy) {
      if (!agentSpec.memory_access_policy.read || !agentSpec.memory_access_policy.write) {
        errors.push('Memory access policy must define both read and write permissions');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Update registry state
   * @param {AIXAgentInstance} agent - Agent instance (optional)
   */
  async updateRegistryState(agent = null) {
    // Update agent capabilities mapping
    if (agent) {
      this.agentCapabilities.set(agent.id, agent.spec.capabilities || []);
    }

    // Update agent hierarchy
    this.updateAgentHierarchy();

    // Update agent dependencies
    this.updateAgentDependencies();
  }

  /**
   * Update agent hierarchy
   */
  updateAgentHierarchy() {
    this.agentHierarchy.clear();

    for (const [agentId, agent] of this.agents) {
      const agentType = this.agentTypes.get(agent.spec.persona.role);
      if (agentType && agentType.dependencies) {
        this.agentHierarchy.set(agentId, agentType.dependencies);
      }
    }
  }

  /**
   * Update agent dependencies
   */
  updateAgentDependencies() {
    this.agentDependencies.clear();

    for (const [agentId, agent] of this.agents) {
      const agentType = this.agentTypes.get(agent.spec.persona.role);
      if (agentType && agentType.dependencies) {
        this.agentDependencies.set(agentId, agentType.dependencies);
      }
    }
  }

  /**
   * Check if task requires capability
   * @param {Object} taskData - Task data
   * @param {string} capability - Capability
   * @returns {boolean} Whether task requires capability
   */
  taskRequiresCapability(taskData, capability) {
    // Simple capability matching logic
    const taskType = taskData.type || '';
    const taskContent = JSON.stringify(taskData).toLowerCase();

    const capabilityKeywords = {
      travel_planning: ['travel', 'trip', 'journey', 'itinerary'],
      budget_optimization: ['budget', 'cost', 'price', 'money'],
      cultural_guidance: ['culture', 'local', 'tradition', 'custom'],
      problem_solving: ['problem', 'issue', 'help', 'solve'],
      payment_processing: ['payment', 'pay', 'transaction', 'billing'],
      research: ['research', 'find', 'search', 'information'],
    };

    const keywords = capabilityKeywords[capability] || [];
    return keywords.some((keyword) => taskContent.includes(keyword));
  }

  /**
   * Extract task data for capability
   * @param {Object} taskData - Task data
   * @param {string} capability - Capability
   * @returns {Object} Extracted task data
   */
  extractTaskDataForCapability(taskData, capability) {
    // Extract relevant data for specific capability
    return {
      ...taskData,
      capability,
      timestamp: Date.now(),
    };
  }

  /**
   * Get registry status
   * @returns {Object} Registry status
   */
  getRegistryStatus() {
    return {
      isInitialized: this.isInitialized,
      version: this.version,
      activeAgents: this.agents.size,
      activeSessions: this.activeSessions.size,
      agentTypes: this.agentTypes.size,
      communicationChannels: this.communicationChannels.size,
      coordinationProtocols: this.coordinationProtocols.size,
      performanceMetrics: this.performanceMetrics.getMetrics(),
    };
  }

  /**
   * Shutdown registry
   */
  async shutdown() {
    try {
      logger.info('🛑 Shutting down AIX Agent Registry...');

      // End all active sessions
      for (const [sessionId, session] of this.activeSessions) {
        if (session.status === 'active') {
          this.endCoordinationSession(sessionId, { success: false, error: 'Registry shutdown' });
        }
      }

      // Shutdown all agents
      for (const [agentId, agent] of this.agents) {
        await agent.shutdown();
      }

      this.isInitialized = false;
      logger.info('✅ AIX Agent Registry shutdown complete');
    } catch (error) {
      logger.error('❌ Error during registry shutdown:', error);
    }
  }
}

/**
 * @class AIXAgentInstance
 * @description Individual AIX agent instance
 */
class AIXAgentInstance {
  constructor(spec, agentId, registry) {
    this.id = agentId;
    this.spec = spec;
    this.registry = registry;
    this.state = 'inactive';
    this.isAvailable = true;
    this.currentTasks = new Map();
    this.performanceMetrics = new AgentPerformanceMetrics();
  }

  async initialize() {
    this.state = 'active';
    logger.info(`🤖 Initializing agent: ${this.id}`);
  }

  async executeTask(taskData, capability) {
    const taskId = crypto.randomUUID();
    const startTime = Date.now();

    try {
      this.currentTasks.set(taskId, {
        taskData,
        capability,
        startTime,
        status: 'running',
      });

      // Simulate task execution
      const result = await this.simulateTaskExecution(taskData, capability);

      this.currentTasks.delete(taskId);
      this.performanceMetrics.recordTaskExecution({
        taskId,
        capability,
        success: true,
        duration: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      this.currentTasks.delete(taskId);
      this.performanceMetrics.recordTaskExecution({
        taskId,
        capability,
        success: false,
        duration: Date.now() - startTime,
        error: error.message,
      });

      throw error;
    }
  }

  async simulateTaskExecution(taskData, capability) {
    // Simulate task execution based on capability
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500));

    return {
      capability,
      result: `Task executed successfully by ${this.id}`,
      duration: Math.random() * 1000 + 500,
      timestamp: Date.now(),
    };
  }

  hasCapabilities(requiredCapabilities) {
    const agentCapabilities = this.spec.capabilities || [];
    return requiredCapabilities.every((capability) => agentCapabilities.includes(capability));
  }

  isAvailable() {
    return this.isAvailable && this.currentTasks.size < 5; // Max 5 concurrent tasks
  }

  async shutdown() {
    this.state = 'inactive';
    this.isAvailable = false;
    logger.info(`🛑 Agent shutdown: ${this.id}`);
  }
}

/**
 * @class AgentPerformanceMetrics
 * @description Performance metrics for agents and registry
 */
class AgentPerformanceMetrics {
  constructor() {
    this.metrics = {
      totalTasks: 0,
      successfulTasks: 0,
      failedTasks: 0,
      averageTaskTime: 0,
      totalCoordination: 0,
      successfulCoordination: 0,
      failedCoordination: 0,
      averageCoordinationTime: 0,
    };
  }

  recordTaskExecution(taskExecution) {
    this.metrics.totalTasks++;

    if (taskExecution.success) {
      this.metrics.successfulTasks++;
    } else {
      this.metrics.failedTasks++;
    }

    // Update average task time
    const totalTime =
      this.metrics.averageTaskTime * (this.metrics.totalTasks - 1) + taskExecution.duration;
    this.metrics.averageTaskTime = totalTime / this.metrics.totalTasks;
  }

  recordCoordination(coordination) {
    this.metrics.totalCoordination++;

    if (coordination.result && coordination.result.success) {
      this.metrics.successfulCoordination++;
    } else {
      this.metrics.failedCoordination++;
    }

    // Update average coordination time
    const totalTime =
      this.metrics.averageCoordinationTime * (this.metrics.totalCoordination - 1) +
      coordination.duration;
    this.metrics.averageCoordinationTime = totalTime / this.metrics.totalCoordination;
  }

  updateRegistryMetrics(data) {
    // Update registry-level metrics
    this.metrics.activeAgents = data.activeAgents;
    this.metrics.activeSessions = data.activeSessions;
    this.metrics.memoryUsage = data.memoryUsage;
    this.metrics.uptime = data.uptime;
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

// Communication Channel Classes
class DirectCommunicationChannel {
  constructor() {
    this.name = 'direct_communication';
  }
}

class BroadcastCommunicationChannel {
  constructor() {
    this.name = 'broadcast_communication';
  }
}

class HierarchicalCommunicationChannel {
  constructor() {
    this.name = 'hierarchical_communication';
  }
}

// Coordination Protocol Classes
class SequentialCoordinationProtocol {
  constructor() {
    this.name = 'sequential_coordination';
  }
}

class ParallelCoordinationProtocol {
  constructor() {
    this.name = 'parallel_coordination';
  }
}

class HierarchicalCoordinationProtocol {
  constructor() {
    this.name = 'hierarchical_coordination';
  }
}

module.exports = AIXAgentRegistry;
