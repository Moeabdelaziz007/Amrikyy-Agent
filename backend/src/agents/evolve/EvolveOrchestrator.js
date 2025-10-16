/**
 * Evolve Manager - Main Manager Agent for Maya Travel Agent
 * Coordinates all agents and learns patterns across interactions
 *
 * Integration Strategy:
 * - Evolve acts as the main entry point for all user requests
 * - Delegates travel-specific tasks to existing MasterOrchestrator
 * - Handles general tasks, development, and cross-domain coordination
 * - Learns patterns and improves coordination over time
 */

const EventEmitter = require('events');
const winston = require('winston');
const { EnhancedPatternLearningEngineWithJournal } = require('./EnhancedPatternLearningEngineWithJournal');
const { EvolveManagerDashboard } = require('./EvolveManagerDashboard');

class EvolveOrchestrator extends EventEmitter {
  constructor() {
    super();

    this.agent_id = "evolve_manager";
    this.version = "1.0.0";
    this.role = "main_manager";

    // Initialize logging
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/evolve-manager.log' }),
        new winston.transports.Console()
      ]
    });

    // System state
    this.status = 'initializing';
    this.activeTasks = new Map();
    this.taskHistory = [];
    this.agentRegistry = new Map();
    this.coordinationPatterns = new Map();

    // Pattern learning and memory
    this.patternEngine = null;
    this.dashboard = null;

    // Integration with existing Maya system
    this.mayaOrchestrator = null;
    this.availableAgents = new Map();

    // Performance metrics
    this.metrics = {
      tasksCompleted: 0,
      successRate: 100,
      averageResponseTime: 0,
      patternsLearned: 0,
      userSatisfaction: 100
    };

    this.initializeSystem();
  }

  async initializeSystem() {
    this.logger.info('Initializing Evolve Manager...');

    try {
      // Initialize pattern learning engine
      this.patternEngine = new EnhancedPatternLearningEngineWithJournal();
      await this.patternEngine.initialize();

      // Initialize dashboard
      this.dashboard = new EvolveManagerDashboard(this);

      // Initialize existing Maya orchestrator
      await this.initializeMayaOrchestrator();

      // Register available agents
      await this.discoverAgents();

      // Set up event listeners
      this.setupEventListeners();

      this.status = 'active';
      this.logger.info('Evolve Manager initialized successfully');

      this.emit('evolve_initialized', {
        version: this.version,
        agents_available: this.availableAgents.size,
        patterns_loaded: this.metrics.patternsLearned
      });

    } catch (error) {
      this.logger.error('Failed to initialize Evolve Manager', { error: error.message });
      this.status = 'error';
      throw error;
    }
  }

  async initializeMayaOrchestrator() {
    try {
      // Import existing MasterOrchestrator
      const MasterOrchestrator = require('../orchestrator/MasterOrchestrator');
      this.mayaOrchestrator = new MasterOrchestrator();

      // Listen to Maya orchestrator events
      this.mayaOrchestrator.on('orchestrator_initialized', () => {
        this.logger.info('Maya orchestrator connected');
      });

      this.mayaOrchestrator.on('agent_task_started', (data) => {
        this.emit('maya_agent_task_started', data);
      });

      this.mayaOrchestrator.on('agent_task_completed', (data) => {
        this.emit('maya_agent_task_completed', data);
      });

      // Initialize Maya orchestrator
      await new Promise((resolve) => {
        if (this.mayaOrchestrator.status === 'active') {
          resolve();
        } else {
          this.mayaOrchestrator.once('orchestrator_initialized', resolve);
        }
      });

    } catch (error) {
      this.logger.warn('Could not initialize Maya orchestrator, continuing without it', { error: error.message });
    }
  }

  async discoverAgents() {
    this.logger.info('Discovering available agents...');

    // Register Maya travel agents
    if (this.mayaOrchestrator) {
      const mayaAgents = this.mayaOrchestrator.listAgents();
      mayaAgents.forEach(agent => {
        this.availableAgents.set(agent.id, {
          ...agent,
          domain: 'travel',
          managed_by: 'maya_orchestrator',
          capabilities: this.getMayaAgentCapabilities(agent.id)
        });
      });
    }

    // Register general-purpose agents
    this.availableAgents.set('evolve_manager', {
      id: 'evolve_manager',
      name: 'Evolve',
      title: 'AI Manager & Pattern Learning Agent',
      domain: 'meta',
      role: 'manager',
      capabilities: [
        'task_coordination',
        'pattern_learning',
        'multi_agent_orchestration',
        'performance_monitoring',
        'user_request_analysis',
        'cross_domain_integration'
      ]
    });

    // Register development agents
    this.availableAgents.set('code_architect', {
      id: 'code_architect',
      name: 'Code Architect',
      title: 'Software Architecture & Design Specialist',
      domain: 'development',
      role: 'specialist',
      capabilities: [
        'system_design',
        'code_architecture',
        'technical_planning',
        'framework_selection',
        'scalability_analysis'
      ]
    });

    this.logger.info('Agent discovery completed', {
      total_agents: this.availableAgents.size,
      domains: Array.from(new Set(Array.from(this.availableAgents.values()).map(a => a.domain)))
    });
  }

  getMayaAgentCapabilities(agentId) {
    const capabilities = {
      'luna': ['itinerary_design', 'activity_curation', 'route_planning', 'travel_consultation'],
      'karim': ['budget_optimization', 'cost_analysis', 'financial_planning', 'expense_tracking'],
      'layla': ['cultural_insights', 'local_customs', 'tradition_guidance', 'cultural_etiquette'],
      'amira': ['problem_resolution', 'complaint_handling', 'issue_escalation', 'customer_service'],
      'tariq': ['payment_processing', 'transaction_handling', 'billing_support', 'financial_security'],
      'zara': ['research', 'information_gathering', 'comparison_analysis', 'recommendation_engine']
    };

    return capabilities[agentId] || ['general_travel_assistance'];
  }

  setupEventListeners() {
    // Listen to pattern engine events
    if (this.patternEngine) {
      this.patternEngine.on('pattern_learned', (pattern) => {
        this.metrics.patternsLearned++;
        this.emit('pattern_learned', pattern);
      });

      this.patternEngine.on('insight_generated', (insight) => {
        this.emit('insight_generated', insight);
      });
    }

    // Listen to dashboard events
    if (this.dashboard) {
      this.dashboard.on('dashboard_update', (data) => {
        this.emit('dashboard_update', data);
      });
    }
  }

  /**
   * Main entry point for all user requests
   */
  async processRequest(request, userId = 'anonymous', context = {}) {
    const startTime = Date.now();
    const taskId = this.generateTaskId();

    this.logger.info('Processing request via Evolve Manager', {
      taskId,
      userId,
      requestType: request.type || 'general',
      requestLength: request.message?.length || 0
    });

    // Create task record
    const task = {
      id: taskId,
      userId,
      request,
      context,
      status: 'analyzing',
      startTime,
      agents: [],
      progress: 0
    };

    this.activeTasks.set(taskId, task);

    try {
      // Step 1: Analyze the request
      const analysis = await this.analyzeRequest(request, context);

      // Step 2: Plan execution strategy
      const executionPlan = await this.planExecution(analysis, context);

      // Step 3: Execute the plan
      const result = await this.executePlan(executionPlan, taskId);

      // Step 4: Learn from the interaction
      await this.learnFromInteraction(task, result, analysis);

      // Update metrics
      this.updateMetrics(task, result, startTime);

      // Clean up
      this.activeTasks.delete(taskId);
      this.taskHistory.push({ ...task, result, endTime: Date.now() });

      return {
        success: true,
        taskId,
        result,
        execution_time: Date.now() - startTime,
        agents_used: task.agents,
        patterns_applied: analysis.patterns_used || []
      };

    } catch (error) {
      this.logger.error('Error processing request', { taskId, error: error.message });

      // Update task status
      task.status = 'failed';
      task.error = error.message;
      task.endTime = Date.now();

      this.activeTasks.delete(taskId);
      this.taskHistory.push(task);

      return {
        success: false,
        taskId,
        error: error.message,
        execution_time: Date.now() - startTime,
        fallback: this.generateFallbackResponse(request, error)
      };
    }
  }

  async analyzeRequest(request, context) {
    this.logger.info('Analyzing request...');

    // Extract request components
    const requestText = request.message || request.text || '';
    const requestType = request.type || this.classifyRequestType(requestText);

    // Check for patterns in historical data
    const relevantPatterns = await this.patternEngine?.findRelevantPatterns(requestText, context) || [];

    // Determine domain and complexity
    const domain = this.determineDomain(requestText);
    const complexity = this.assessComplexity(requestText, domain);

    // Identify required capabilities
    const requiredCapabilities = this.identifyRequiredCapabilities(requestText, domain);

    // Check for similar past requests
    const similarRequests = this.findSimilarRequests(requestText);

    return {
      request_type: requestType,
      domain,
      complexity,
      required_capabilities: requiredCapabilities,
      relevant_patterns: relevantPatterns,
      similar_requests: similarRequests,
      estimated_time: this.estimateExecutionTime(complexity, requiredCapabilities),
      confidence_score: this.calculateConfidenceScore(requestText, relevantPatterns)
    };
  }

  async planExecution(analysis, context) {
    this.logger.info('Planning execution strategy...', { domain: analysis.domain, complexity: analysis.complexity });

    // Determine primary execution path
    let executionStrategy = 'direct_execution';

    if (analysis.domain === 'travel' && this.mayaOrchestrator) {
      executionStrategy = 'maya_orchestrator';
    } else if (analysis.complexity > 7 || analysis.required_capabilities.length > 3) {
      executionStrategy = 'multi_agent_coordination';
    } else if (analysis.relevant_patterns.length > 0) {
      executionStrategy = 'pattern_guided';
    }

    // Select appropriate agents
    const selectedAgents = this.selectAgents(analysis, executionStrategy);

    // Create execution phases
    const executionPhases = this.createExecutionPhases(analysis, selectedAgents, executionStrategy);

    // Estimate resource requirements
    const resourceRequirements = this.estimateResources(executionPhases);

    return {
      strategy: executionStrategy,
      selected_agents: selectedAgents,
      execution_phases: executionPhases,
      resource_requirements: resourceRequirements,
      fallback_plan: this.createFallbackPlan(analysis),
      success_criteria: this.defineSuccessCriteria(analysis)
    };
  }

  async executePlan(executionPlan, taskId) {
    this.logger.info('Executing plan...', {
      taskId,
      strategy: executionPlan.strategy,
      phases: executionPlan.execution_phases.length
    });

    const results = [];
    const task = this.activeTasks.get(taskId);

    // Execute each phase
    for (let i = 0; i < executionPlan.execution_phases.length; i++) {
      const phase = executionPlan.execution_phases[i];

      // Update task progress
      task.status = `executing_phase_${i + 1}`;
      task.progress = (i / executionPlan.execution_phases.length) * 100;
      task.currentPhase = phase;

      this.emit('execution_phase_started', {
        taskId,
        phase: phase.name,
        agents: phase.agents
      });

      // Execute phase
      const phaseResult = await this.executePhase(phase, executionPlan.selected_agents, taskId);

      results.push(phaseResult);

      // Check if phase succeeded
      if (!phaseResult.success && !phase.optional) {
        throw new Error(`Phase ${phase.name} failed: ${phaseResult.error}`);
      }

      this.emit('execution_phase_completed', {
        taskId,
        phase: phase.name,
        success: phaseResult.success,
        duration: phaseResult.duration
      });
    }

    // Synthesize final result
    const finalResult = await this.synthesizeResults(results, executionPlan);

    task.status = 'completed';
    task.progress = 100;
    task.agents = executionPlan.selected_agents.map(a => a.id);

    return finalResult;
  }

  async executePhase(phase, availableAgents, taskId) {
    const startTime = Date.now();

    try {
      switch (phase.execution_method) {
        case 'maya_orchestrator':
          return await this.executeMayaOrchestratorPhase(phase, taskId);

        case 'direct_agent_call':
          return await this.executeDirectAgentPhase(phase, availableAgents, taskId);

        case 'pattern_guided':
          return await this.executePatternGuidedPhase(phase, taskId);

        default:
          throw new Error(`Unknown execution method: ${phase.execution_method}`);
      }
    } catch (error) {
      return {
        success: false,
        phase: phase.name,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  async executeMayaOrchestratorPhase(phase, taskId) {
    if (!this.mayaOrchestrator) {
      throw new Error('Maya orchestrator not available');
    }

    const task = this.activeTasks.get(taskId);
    const mayaResult = await this.mayaOrchestrator.processMessage(
      task.request.message,
      task.userId,
      taskId
    );

    return {
      success: mayaResult.success,
      result: mayaResult.response,
      agent: 'maya_orchestrator',
      phase: phase.name,
      duration: Date.now() - Date.now() // Would need to track actual time
    };
  }

  async executeDirectAgentPhase(phase, availableAgents, taskId) {
    const agent = availableAgents.find(a => a.id === phase.primary_agent);
    if (!agent) {
      throw new Error(`Agent not found: ${phase.primary_agent}`);
    }

    // This would integrate with the actual agent execution system
    // For now, return a mock result
    return {
      success: true,
      result: `Executed ${phase.name} using ${agent.name}`,
      agent: agent.id,
      phase: phase.name,
      duration: 1000
    };
  }

  async executePatternGuidedPhase(phase, taskId) {
    if (!this.patternEngine) {
      throw new Error('Pattern engine not available');
    }

    const task = this.activeTasks.get(taskId);
    const guidance = await this.patternEngine.getExecutionGuidance(
      task.request.message,
      task.context
    );

    return {
      success: true,
      result: guidance,
      agent: 'pattern_engine',
      phase: phase.name,
      duration: 500
    };
  }

  async synthesizeResults(results, executionPlan) {
    this.logger.info('Synthesizing final results...', { resultCount: results.length });

    // Combine results from all phases
    const successfulResults = results.filter(r => r.success);

    if (successfulResults.length === 0) {
      throw new Error('No successful results to synthesize');
    }

    // Create comprehensive response
    const synthesizedResponse = {
      type: 'synthesized_response',
      strategy_used: executionPlan.strategy,
      phases_executed: results.length,
      successful_phases: successfulResults.length,
      components: results.map(r => ({
        phase: r.phase,
        agent: r.agent,
        success: r.success,
        contribution: r.result
      })),
      summary: this.generateSummary(results),
      recommendations: this.generateRecommendations(results),
      next_steps: this.generateNextSteps(results)
    };

    return synthesizedResponse;
  }

  async learnFromInteraction(task, result, analysis) {
    if (!this.patternEngine) return;

    try {
      // Extract learning data
      const learningData = {
        request: task.request,
        analysis,
        execution_plan: task.executionPlan,
        result,
        user_id: task.userId,
        context: task.context,
        success: result.success,
        execution_time: task.endTime - task.startTime,
        agents_used: task.agents,
        patterns_applied: analysis.relevant_patterns
      };

      // Submit to pattern engine for learning
      await this.patternEngine.learnFromInteraction(learningData);

      this.logger.info('Interaction learning completed', {
        taskId: task.id,
        success: result.success,
        patterns_learned: 1
      });

    } catch (error) {
      this.logger.warn('Failed to learn from interaction', { error: error.message });
    }
  }

  // Helper methods
  classifyRequestType(requestText) {
    const lowerText = requestText.toLowerCase();

    if (lowerText.includes('travel') || lowerText.includes('trip') || lowerText.includes('vacation')) {
      return 'travel_request';
    } else if (lowerText.includes('code') || lowerText.includes('develop') || lowerText.includes('build')) {
      return 'development_request';
    } else if (lowerText.includes('learn') || lowerText.includes('explain') || lowerText.includes('how')) {
      return 'learning_request';
    }

    return 'general_request';
  }

  determineDomain(requestText) {
    const travelKeywords = ['travel', 'trip', 'vacation', 'hotel', 'flight', 'destination', 'itinerary'];
    const developmentKeywords = ['code', 'develop', 'build', 'software', 'app', 'website', 'api'];
    const learningKeywords = ['learn', 'explain', 'how', 'what', 'why', 'tutorial'];

    const lowerText = requestText.toLowerCase();

    if (travelKeywords.some(keyword => lowerText.includes(keyword))) return 'travel';
    if (developmentKeywords.some(keyword => lowerText.includes(keyword))) return 'development';
    if (learningKeywords.some(keyword => lowerText.includes(keyword))) return 'learning';

    return 'general';
  }

  assessComplexity(requestText, domain) {
    let complexity = 1;

    // Length factor
    if (requestText.length > 200) complexity += 2;
    if (requestText.length > 500) complexity += 2;

    // Domain complexity
    const complexityMap = {
      'travel': 3,
      'development': 5,
      'learning': 2,
      'general': 1
    };

    complexity += complexityMap[domain] || 1;

    // Multi-step indicators
    if (requestText.includes('then') || requestText.includes('after') || requestText.includes('finally')) {
      complexity += 2;
    }

    return Math.min(10, complexity);
  }

  identifyRequiredCapabilities(requestText, domain) {
    const capabilities = [];

    if (domain === 'travel') {
      if (requestText.includes('plan') || requestText.includes('itinerary')) capabilities.push('itinerary_design');
      if (requestText.includes('budget') || requestText.includes('cost')) capabilities.push('budget_optimization');
      if (requestText.includes('culture') || requestText.includes('local')) capabilities.push('cultural_insights');
    }

    if (domain === 'development') {
      if (requestText.includes('design') || requestText.includes('architecture')) capabilities.push('system_design');
      if (requestText.includes('code') || requestText.includes('implement')) capabilities.push('implementation');
    }

    return capabilities.length > 0 ? capabilities : ['general_assistance'];
  }

  selectAgents(analysis, strategy) {
    const agents = [];

    switch (strategy) {
      case 'maya_orchestrator':
        agents.push({ id: 'maya_orchestrator', role: 'travel_coordinator', priority: 'high' });
        break;

      case 'multi_agent_coordination':
        // Select agents based on required capabilities
        analysis.required_capabilities.forEach(capability => {
          const agent = this.findAgentByCapability(capability);
          if (agent) agents.push(agent);
        });
        break;

      default:
        agents.push({ id: 'evolve_manager', role: 'general_assistant', priority: 'normal' });
    }

    return agents;
  }

  findAgentByCapability(capability) {
    for (const [agentId, agent] of this.availableAgents) {
      if (agent.capabilities && agent.capabilities.includes(capability)) {
        return { id: agentId, role: agent.role, capability };
      }
    }
    return null;
  }

  createExecutionPhases(analysis, selectedAgents, strategy) {
    const phases = [];

    if (strategy === 'maya_orchestrator') {
      phases.push({
        name: 'travel_coordination',
        execution_method: 'maya_orchestrator',
        agents: ['maya_orchestrator'],
        optional: false,
        timeout: 30000
      });
    } else {
      // Create phases for each selected agent
      selectedAgents.forEach((agent, index) => {
        phases.push({
          name: `${agent.id}_execution`,
          execution_method: 'direct_agent_call',
          primary_agent: agent.id,
          agents: [agent.id],
          optional: false,
          timeout: 15000
        });
      });
    }

    return phases;
  }

  findSimilarRequests(requestText) {
    // Simple similarity check based on keywords
    return this.taskHistory
      .filter(task => {
        const taskText = task.request.message || '';
        const similarity = this.calculateSimilarity(requestText, taskText);
        return similarity > 0.3;
      })
      .slice(0, 5)
      .map(task => ({
        id: task.id,
        similarity: this.calculateSimilarity(requestText, task.request.message || ''),
        result: task.result?.success ? 'success' : 'failed',
        execution_time: task.endTime - task.startTime
      }));
  }

  calculateSimilarity(text1, text2) {
    const words1 = text1.toLowerCase().split(' ');
    const words2 = text2.toLowerCase().split(' ');

    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];

    return intersection.length / union.length;
  }

  estimateExecutionTime(complexity, capabilities) {
    const baseTime = 1000; // 1 second base
    const complexityMultiplier = complexity * 500; // 0.5 seconds per complexity point
    const capabilityMultiplier = capabilities.length * 300; // 0.3 seconds per capability

    return baseTime + complexityMultiplier + capabilityMultiplier;
  }

  calculateConfidenceScore(requestText, relevantPatterns) {
    let confidence = 0.5; // Base confidence

    // Pattern bonus
    if (relevantPatterns.length > 0) {
      confidence += 0.3;
    }

    // Length factor (longer requests tend to be clearer)
    if (requestText.length > 100) {
      confidence += 0.1;
    }

    // Clarity indicators
    if (requestText.includes('please') || requestText.includes('I need') || requestText.includes('I want')) {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }

  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  updateMetrics(task, result, startTime) {
    this.metrics.tasksCompleted++;

    if (result.success) {
      const executionTime = Date.now() - startTime;
      this.metrics.averageResponseTime =
        (this.metrics.averageResponseTime + executionTime) / 2;
    } else {
      this.metrics.successRate = Math.max(0, this.metrics.successRate - 1);
    }
  }

  generateFallbackResponse(request, error) {
    return {
      type: 'fallback_response',
      message: 'I apologize, but I encountered an issue processing your request. Let me try a simpler approach.',
      suggestions: [
        'Try rephrasing your request',
        'Break down complex requests into smaller steps',
        'Contact support if the issue persists'
      ],
      error_context: error.message
    };
  }

  generateSummary(results) {
    const successful = results.filter(r => r.success).length;
    const total = results.length;

    return `Completed ${successful} out of ${total} execution phases successfully.`;
  }

  generateRecommendations(results) {
    const recommendations = [];

    results.forEach(result => {
      if (result.success && result.agent === 'maya_orchestrator') {
        recommendations.push('Consider booking early for better rates');
        recommendations.push('Check travel advisories before your trip');
      }
    });

    return recommendations.length > 0 ? recommendations : ['Request processed successfully'];
  }

  generateNextSteps(results) {
    return [
      'Monitor your request status',
      'Follow up if you need modifications',
      'Provide feedback to help improve our service'
    ];
  }

  // Public API methods
  getSystemHealth() {
    return {
      evolve_manager: {
        status: this.status,
        version: this.version,
        active_tasks: this.activeTasks.size,
        metrics: this.metrics
      },
      maya_orchestrator: this.mayaOrchestrator ? this.mayaOrchestrator.getSystemHealth() : null,
      pattern_engine: this.patternEngine ? this.patternEngine.getHealth() : null,
      available_agents: Array.from(this.availableAgents.values()).map(agent => ({
        id: agent.id,
        name: agent.name,
        domain: agent.domain,
        status: 'available'
      }))
    };
  }

  getTaskStatus(taskId) {
    const task = this.activeTasks.get(taskId);
    if (task) {
      return {
        id: taskId,
        status: task.status,
        progress: task.progress,
        current_phase: task.currentPhase?.name,
        start_time: task.startTime
      };
    }

    // Check history
    const historyTask = this.taskHistory.find(t => t.id === taskId);
    if (historyTask) {
      return {
        id: taskId,
        status: historyTask.status,
        completed: true,
        end_time: historyTask.endTime,
        execution_time: historyTask.endTime - historyTask.startTime
      };
    }

    return null;
  }

  listAvailableAgents() {
    return Array.from(this.availableAgents.values());
  }

  getRecentActivity(limit = 10) {
    return this.taskHistory
      .slice(-limit)
      .map(task => ({
        id: task.id,
        user_id: task.userId,
        request_type: task.request.type || 'general',
        status: task.status,
        execution_time: task.endTime ? task.endTime - task.startTime : 0,
        timestamp: task.startTime
      }));
  }
}

module.exports = EvolveOrchestrator;