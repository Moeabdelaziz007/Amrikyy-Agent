/**
 * Enhanced AIX Manager - Production-Grade Intelligent Agent System
 * 
 * Integrates:
 * - Quantum-Topology Layer (network intelligence)
 * - Pattern Learning Engine (adaptive learning)
 * - Project Context Database (codebase awareness)
 * - Original AIXManager (agent parsing and execution)
 * 
 * Creates a TRULY intelligent, learning, project-aware agent system
 */

const { AIXManager, AIXAgent } = require('./AIXManager');
const QuantumTopologyLayer = require('./QuantumTopologyLayer');
const PatternLearningEngine = require('./PatternLearningEngine');
const ProjectContextDatabase = require('./ProjectContextDatabase');
const { AIXRewardIntegration } = require('./AIXRewardIntegration');
const { logger } = require('../utils/logger');
const log = logger.child('EnhancedAIXManager');

class EnhancedAIXManager extends AIXManager {
  constructor(options = {}) {
    super(options);

    // Initialize advanced layers
    this.quantumLayer = new QuantumTopologyLayer();
    this.patternEngine = new PatternLearningEngine({
      learningRate: options.learningRate || 0.1
    });
    this.projectContext = new ProjectContextDatabase({
      rootPath: options.projectRoot || process.cwd()
    });

    // Initialize Reward Engine integration
    this.rewardIntegration = options.rewardIntegration || null;
    this.aixRewardIntegration = this.rewardIntegration ? 
      new AIXRewardIntegration(this.rewardIntegration) : null;

    // Workflow orchestration
    this.workflows = new Map();
    this.activeWorkflows = new Map();

    // Performance tracking
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      averageLatency: 0,
      patternsLearned: 0,
      agentsEvolved: 0,
      totalRewards: 0
    };

    // Enable auto-learning
    this.autoLearn = options.autoLearn !== false;

    // Index project on initialization (async)
    if (options.indexProject !== false) {
      this.initializeProjectContext();
    }

    log.info('Enhanced AIX Manager initialized', {
      autoLearn: this.autoLearn,
      quantumEnabled: true,
      patternLearningEnabled: true,
      projectContextEnabled: true,
      rewardEngineEnabled: !!this.aixRewardIntegration
    });
  }

  /**
   * Initialize project context (async)
   */
  async initializeProjectContext() {
    try {
      await this.projectContext.indexProject();
      log.success('Project context ready');
    } catch (error) {
      log.error('Failed to initialize project context', {
        error: error.message
      });
    }
  }

  /**
   * Load agent with quantum topology registration
   */
  async loadAgent(agentPath) {
    // Load agent using parent class
    const agent = await super.loadAgent(agentPath);

    // Register in quantum topology
    const topologyNode = this.quantumLayer.registerAgent(agent);

    // Create agent knowledge
    const agentKnowledge = {
      id: agent.id,
      name: agent.name,
      loadedAt: Date.now(),
      topologyNode,
      executionHistory: [],
      learnedPatterns: []
    };

    this.projectContext.context.agents.set(agent.id, agentKnowledge);

    log.info('Agent loaded with quantum topology', {
      agentId: agent.id,
      consciousness: topologyNode.consciousness.current,
      energy: topologyNode.energy
    });

    return agent;
  }

  /**
   * Execute agent with full intelligence stack
   */
  async executeAgent(agentId, task, context = {}) {
    const startTime = Date.now();
    this.metrics.totalExecutions++;

    try {
      const agent = this.getAgent(agentId);
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      // Observe the task
      this.patternEngine.observe({
        type: 'agent_action',
        agentId,
        action: task.type || 'execute',
        task,
        timestamp: Date.now()
      });

      // Collapse quantum state (agent is now working)
      this.quantumLayer.collapseState(agentId, 'working');

      // Enhance context with project knowledge
      const enhancedContext = this.enhanceContext(agent, context);

      // Execute with learning
      const result = await this.executeWithLearning(agent, task, enhancedContext);

      // Update metrics
      const latency = Date.now() - startTime;
      this.updateMetrics(agentId, {
        success: result.success,
        latency,
        taskCompleted: true
      });

      // Process reward if Reward Engine is available
      if (this.aixRewardIntegration) {
        try {
          const rewardResult = await this.aixRewardIntegration.processAgentTaskCompletion(
            agentId, task, { ...result, executionTime: latency }
          );
          
          if (rewardResult && rewardResult.reward) {
            this.metrics.totalRewards += rewardResult.reward;
            log.info(`🎯 Agent ${agentId} earned ${rewardResult.reward} reward points`);
          }
        } catch (rewardError) {
          log.error('Reward processing failed', { agentId, error: rewardError.message });
        }
      }

      // Restore superposition (agent is ready again)
      this.quantumLayer.restoreSuperposition(agentId, ['idle', 'listening']);

      // Observe result
      this.patternEngine.observe({
        type: 'agent_action',
        agentId,
        action: task.type || 'execute',
        success: result.success,
        latency,
        timestamp: Date.now()
      });

      this.metrics.successfulExecutions++;

      log.success('Agent execution complete', {
        agentId,
        success: result.success,
        latency: `${latency}ms`
      });

      return result;

    } catch (error) {
      const latency = Date.now() - startTime;
      
      // Update metrics
      this.updateMetrics(agentId, {
        success: false,
        latency,
        taskCompleted: false
      });

      // Observe error
      this.patternEngine.observe({
        type: 'error',
        agentId,
        errorType: error.constructor.name,
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });

      // Restore superposition
      this.quantumLayer.restoreSuperposition(agentId, ['idle']);

      log.error('Agent execution failed', {
        agentId,
        error: error.message,
        latency: `${latency}ms`
      });

      throw error;
    }
  }

  /**
   * Enhance context with project knowledge
   */
  enhanceContext(agent, context) {
    const projectSummary = this.projectContext.getProjectSummary();
    const agentPosition = this.quantumLayer.getAgentPosition(agent.id);
    const recentPatterns = this.patternEngine.getInsights();

    return {
      ...context,
      projectContext: projectSummary,
      topology: agentPosition,
      insights: recentPatterns,
      timestamp: Date.now()
    };
  }

  /**
   * Execute with learning
   */
  async executeWithLearning(agent, task, context) {
    // Get learned patterns for this type of task
    const relevantKnowledge = this.patternEngine.getKnowledge(task.type);

    // Execute the task
    const result = await agent.executeFunction(task.function || 'execute', {
      task,
      context,
      knowledge: relevantKnowledge
    });

    // Learn from execution
    if (this.autoLearn) {
      await this.learnFromExecution(agent.id, task, result);
    }

    return result;
  }

  /**
   * Learn from execution
   */
  async learnFromExecution(agentId, task, result) {
    // Consolidate memories
    this.patternEngine.consolidateMemory();

    // Check for new patterns
    const patterns = this.patternEngine.memory.longTerm;
    
    for (const [patternId, pattern] of patterns) {
      if (!pattern.learned && pattern.strength > 0.7) {
        this.patternEngine.learn(patternId);
        pattern.learned = true;
        this.metrics.patternsLearned++;

        log.info('New pattern learned', {
          patternId,
          type: pattern.type,
          strength: pattern.strength
        });
      }
    }

    // Update agent knowledge
    const agentKnowledge = this.projectContext.context.agents.get(agentId);
    if (agentKnowledge) {
      agentKnowledge.executionHistory.push({
        task,
        result: result.success,
        timestamp: Date.now()
      });

      // Limit history
      if (agentKnowledge.executionHistory.length > 100) {
        agentKnowledge.executionHistory.shift();
      }
    }
  }

  /**
   * Update metrics
   */
  updateMetrics(agentId, metrics) {
    // Update quantum topology metrics
    this.quantumLayer.updateMetrics(agentId, metrics);

    // Update global metrics
    if (metrics.latency !== undefined) {
      this.metrics.averageLatency = 
        0.9 * this.metrics.averageLatency + 0.1 * metrics.latency;
    }

    // Check for consciousness evolution
    const node = this.quantumLayer.topology.nodes.get(agentId);
    if (node && node.consciousness.current !== node.consciousness.evolving_to) {
      const evolved = this.quantumLayer.evolveConsciousness(agentId);
      if (evolved) {
        this.metrics.agentsEvolved++;
        log.success('Agent consciousness evolved!', {
          agentId,
          newLevel: node.consciousness.current
        });
      }
    }
  }

  /**
   * Coordinate multiple agents (quantum entanglement)
   */
  async coordinateAgents(taskDistribution) {
    const workflowId = `workflow-${Date.now()}`;
    const startTime = Date.now();

    log.info('Starting multi-agent coordination', {
      workflowId,
      agents: taskDistribution.length
    });

    try {
      // Create entanglements
      for (let i = 0; i < taskDistribution.length - 1; i++) {
        const agent1 = taskDistribution[i].agentId;
        const agent2 = taskDistribution[i + 1].agentId;
        
        this.quantumLayer.entangleAgents(agent1, agent2, 'coordination');
      }

      // Execute tasks in parallel
      const results = await Promise.all(
        taskDistribution.map(dist => 
          this.executeAgent(dist.agentId, dist.task, dist.context)
        )
      );

      // Synthesize results
      const synthesized = this.synthesizeResults(results);

      // Process collaboration reward if Reward Engine is available
      if (this.aixRewardIntegration) {
        try {
          const primaryAgent = taskDistribution[0].agentId;
          const collaboratingAgents = taskDistribution.slice(1).map(dist => dist.agentId);
          
          const rewardResult = await this.aixRewardIntegration.processAgentCollaboration(
            primaryAgent, collaboratingAgents, { type: 'workflow', complexity: 'high' }, {
              success: synthesized.success,
              coordinationSuccess: true,
              conflictsResolved: 0,
              knowledgeShared: true
            }
          );
          
          if (rewardResult) {
            log.info(`🤝 Collaboration reward processed for workflow ${workflowId}`);
          }
        } catch (rewardError) {
          log.error('Collaboration reward processing failed', { workflowId, error: rewardError.message });
        }
      }

      // Track workflow
      const duration = Date.now() - startTime;
      this.patternEngine.observe({
        type: 'workflow_execution',
        workflowId,
        duration,
        success: true,
        steps: taskDistribution.map((dist, idx) => ({
          name: dist.task.type,
          agentId: dist.agentId,
          duration: results[idx].latency || 0
        })),
        timestamp: Date.now()
      });

      log.success('Multi-agent coordination complete', {
        workflowId,
        duration: `${duration}ms`,
        agentsInvolved: taskDistribution.length
      });

      return synthesized;

    } catch (error) {
      log.error('Multi-agent coordination failed', {
        workflowId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Synthesize results from multiple agents
   */
  synthesizeResults(results) {
    return {
      success: results.every(r => r.success),
      results,
      synthesizedOutput: this.mergePerspectives(results),
      agentsInvolved: results.length,
      timestamp: Date.now()
    };
  }

  /**
   * Merge perspectives from different agents
   */
  mergePerspectives(results) {
    // Simple merge for now - can be enhanced
    return results.map(r => r.result).join('\n\n');
  }

  /**
   * Get real-time workflow visualization data
   */
  getWorkflowVisualization(agentId = null) {
    const topology = this.quantumLayer.getTopologySnapshot();
    const patterns = this.patternEngine.getInsights();
    const project = this.projectContext.getProjectSummary();

    if (agentId) {
      const position = this.quantumLayer.getAgentPosition(agentId);
      return {
        agent: position,
        topology: topology.nodes.filter(n => 
          n.id === agentId || n.connections.includes(agentId)
        ),
        recentPatterns: patterns.agent.filter(p => p.agentId === agentId),
        projectContext: project
      };
    }

    return {
      topology,
      patterns,
      projectContext: project,
      metrics: this.getSystemMetrics()
    };
  }

  /**
   * Get system-wide metrics
   */
  getSystemMetrics() {
    const quantumStats = this.quantumLayer.getTopologySnapshot();
    const learningStats = this.patternEngine.getStats();
    const projectStats = this.projectContext.getStats();

    return {
      execution: {
        total: this.metrics.totalExecutions,
        successful: this.metrics.successfulExecutions,
        successRate: this.metrics.totalExecutions > 0 ? 
          (this.metrics.successfulExecutions / this.metrics.totalExecutions) : 0,
        averageLatency: this.metrics.averageLatency
      },
      learning: {
        ...learningStats,
        patternsLearned: this.metrics.patternsLearned
      },
      quantum: {
        agents: quantumStats.nodes.length,
        connections: quantumStats.edges.length,
        energy: quantumStats.energy,
        consciousness: quantumStats.consciousness
      },
      project: projectStats,
      agentsEvolved: this.metrics.agentsEvolved
    };
  }

  /**
   * Get insights for improvement
   */
  getImprovementInsights() {
    const insights = this.patternEngine.getInsights();
    const topology = this.quantumLayer.getTopologySnapshot();

    return {
      userPatterns: insights.user,
      agentPerformance: insights.agent,
      codeQuality: insights.code,
      workflowOptimization: insights.workflow,
      recurringErrors: insights.error,
      energyDistribution: topology.energy,
      consciousnessLevels: topology.consciousness,
      recommendations: this.generateRecommendations(insights)
    };
  }

  /**
   * Generate improvement recommendations
   */
  generateRecommendations(insights) {
    const recommendations = [];

    // Check agent performance
    for (const agentInsight of insights.agent) {
      if (agentInsight.successRate < 0.8) {
        recommendations.push({
          type: 'agent_optimization',
          priority: 'high',
          agent: agentInsight.agentId,
          issue: 'Low success rate',
          recommendation: agentInsight.recommendation
        });
      }
    }

    // Check code quality
    for (const codeInsight of insights.code) {
      if (codeInsight.errorProne) {
        recommendations.push({
          type: 'code_quality',
          priority: 'medium',
          file: codeInsight.file,
          issue: 'Error-prone file',
          recommendation: codeInsight.recommendation
        });
      }
    }

    // Check workflow bottlenecks
    for (const workflowInsight of insights.workflow) {
      if (workflowInsight.bottleneck) {
        recommendations.push({
          type: 'workflow_optimization',
          priority: 'medium',
          workflow: workflowInsight.workflowId,
          issue: `Bottleneck at: ${workflowInsight.bottleneck}`,
          recommendation: workflowInsight.recommendation
        });
      }
    }

    // Check recurring errors
    for (const errorInsight of insights.error) {
      recommendations.push({
        type: 'error_prevention',
        priority: 'high',
        error: errorInsight.errorType,
        issue: `Recurring error (${errorInsight.occurrences} times)`,
        recommendation: errorInsight.recommendation
      });
    }

    return recommendations.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });
  }

  /**
   * Health check
   */
  async healthCheck() {
    return {
      status: 'healthy',
      components: {
        agents: this.agents.size,
        quantumTopology: this.quantumLayer.topology.nodes.size,
        patternEngine: this.patternEngine.metrics.patternsDetected,
        projectContext: this.projectContext.indexed
      },
      metrics: this.getSystemMetrics(),
      timestamp: Date.now()
    };
  }
}

module.exports = EnhancedAIXManager;

