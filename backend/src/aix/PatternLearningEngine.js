/**
 * Pattern Learning Engine for AIX Agent System
 * 
 * Watches, learns, and adapts from:
 * - User interactions
 * - Agent behaviors
 * - Code patterns
 * - Project changes
 * - Success/failure patterns
 * 
 * Implements:
 * - Real-time pattern detection
 * - Memory consolidation
 * - Adaptive learning
 * - Knowledge extraction
 */

const { logger } = require('../utils/logger');
const log = logger.child('PatternLearning');

class PatternLearningEngine {
  constructor(options = {}) {
    // Memory systems
    this.memory = {
      shortTerm: new Map(), // Recent interactions (last 100)
      longTerm: new Map(), // Consolidated patterns
      episodic: [], // Event sequences
      semantic: new Map() // Learned knowledge
    };

    // Pattern detectors
    this.patterns = {
      user: new Map(), // User behavior patterns
      agent: new Map(), // Agent performance patterns
      code: new Map(), // Code patterns
      workflow: new Map(), // Workflow patterns
      error: new Map() // Error patterns
    };

    // Learning metrics
    this.metrics = {
      totalObservations: 0,
      patternsDetected: 0,
      accuracyRate: 0,
      lastLearned: null
    };

    // Pattern thresholds
    this.thresholds = {
      minOccurrences: 3, // Minimum to detect pattern
      confidence: 0.7, // Minimum confidence to act
      decay: 0.95 // Memory decay factor
    };

    // Learning rate
    this.learningRate = options.learningRate || 0.1;

    // Knowledge base
    this.knowledge = new Map();

    log.info('Pattern Learning Engine initialized');
  }

  /**
   * Observe an interaction
   */
  observe(interaction) {
    this.metrics.totalObservations++;

    // Store in short-term memory
    const id = `obs-${Date.now()}-${Math.random()}`;
    this.memory.shortTerm.set(id, {
      ...interaction,
      timestamp: Date.now(),
      processed: false
    });

    // Keep short-term memory limited
    if (this.memory.shortTerm.size > 100) {
      const oldest = Array.from(this.memory.shortTerm.keys())[0];
      this.memory.shortTerm.delete(oldest);
    }

    // Detect patterns in real-time
    this.detectPatterns(interaction);

    // Store episode
    this.memory.episodic.push({
      timestamp: Date.now(),
      type: interaction.type,
      data: interaction
    });

    // Limit episodic memory
    if (this.memory.episodic.length > 1000) {
      this.memory.episodic.shift();
    }

    log.debug('Interaction observed', {
      type: interaction.type,
      totalObservations: this.metrics.totalObservations
    });
  }

  /**
   * Detect patterns in interaction
   */
  detectPatterns(interaction) {
    const type = interaction.type;

    switch (type) {
      case 'user_message':
        this.detectUserPatterns(interaction);
        break;
      case 'agent_action':
        this.detectAgentPatterns(interaction);
        break;
      case 'code_change':
        this.detectCodePatterns(interaction);
        break;
      case 'workflow_execution':
        this.detectWorkflowPatterns(interaction);
        break;
      case 'error':
        this.detectErrorPatterns(interaction);
        break;
    }
  }

  /**
   * Detect user behavior patterns
   */
  detectUserPatterns(interaction) {
    const userId = interaction.userId;
    if (!userId) return;

    if (!this.patterns.user.has(userId)) {
      this.patterns.user.set(userId, {
        messageCount: 0,
        preferences: {},
        commonQueries: new Map(),
        responsePatterns: new Map(),
        timePatterns: [],
        satisfaction: []
      });
    }

    const userPattern = this.patterns.user.get(userId);
    userPattern.messageCount++;

    // Track query type
    const queryType = this.classifyQuery(interaction.message);
    const count = userPattern.commonQueries.get(queryType) || 0;
    userPattern.commonQueries.set(queryType, count + 1);

    // Track time patterns
    const hour = new Date().getHours();
    userPattern.timePatterns.push(hour);

    // Detect preferences
    this.extractPreferences(interaction, userPattern);

    log.debug('User pattern updated', {
      userId,
      messageCount: userPattern.messageCount,
      topQuery: this.getTopQuery(userPattern.commonQueries)
    });
  }

  /**
   * Classify user query type
   */
  classifyQuery(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('budget') || lower.includes('cost') || lower.includes('price')) {
      return 'budget_question';
    }
    if (lower.includes('destination') || lower.includes('where') || lower.includes('recommend')) {
      return 'destination_inquiry';
    }
    if (lower.includes('plan') || lower.includes('itinerary') || lower.includes('schedule')) {
      return 'planning_request';
    }
    if (lower.includes('culture') || lower.includes('tradition') || lower.includes('custom')) {
      return 'cultural_question';
    }
    if (lower.includes('help') || lower.includes('how')) {
      return 'help_request';
    }

    return 'general';
  }

  /**
   * Extract user preferences
   */
  extractPreferences(interaction, userPattern) {
    const message = interaction.message.toLowerCase();

    // Budget preference
    if (message.match(/\$\d+/)) {
      const amounts = message.match(/\$(\d+)/g);
      if (amounts) {
        userPattern.preferences.budgetRange = amounts.map(a => 
          parseInt(a.replace('$', ''))
        );
      }
    }

    // Travel style
    if (message.includes('luxury')) {
      userPattern.preferences.style = 'luxury';
    } else if (message.includes('budget') || message.includes('cheap')) {
      userPattern.preferences.style = 'budget';
    } else if (message.includes('adventure')) {
      userPattern.preferences.style = 'adventure';
    }

    // Language preference
    if (interaction.language) {
      userPattern.preferences.language = interaction.language;
    }
  }

  /**
   * Detect agent performance patterns
   */
  detectAgentPatterns(interaction) {
    const agentId = interaction.agentId;
    if (!agentId) return;

    if (!this.patterns.agent.has(agentId)) {
      this.patterns.agent.set(agentId, {
        actionCount: 0,
        successRate: 1.0,
        averageLatency: 0,
        commonActions: new Map(),
        errorTypes: new Map(),
        improvementAreas: []
      });
    }

    const agentPattern = this.patterns.agent.get(agentId);
    agentPattern.actionCount++;

    // Track action type
    const actionType = interaction.action;
    const count = agentPattern.commonActions.get(actionType) || 0;
    agentPattern.commonActions.set(actionType, count + 1);

    // Track success
    if (interaction.success !== undefined) {
      agentPattern.successRate = 
        0.9 * agentPattern.successRate + 0.1 * (interaction.success ? 1 : 0);
    }

    // Track latency
    if (interaction.latency !== undefined) {
      agentPattern.averageLatency = 
        0.9 * agentPattern.averageLatency + 0.1 * interaction.latency;
    }

    // Detect improvement areas
    if (agentPattern.successRate < 0.8) {
      agentPattern.improvementAreas.push({
        area: 'success_rate',
        value: agentPattern.successRate,
        timestamp: Date.now()
      });
    }

    log.debug('Agent pattern updated', {
      agentId,
      actionCount: agentPattern.actionCount,
      successRate: agentPattern.successRate.toFixed(2)
    });
  }

  /**
   * Detect code patterns
   */
  detectCodePatterns(interaction) {
    const file = interaction.file;
    if (!file) return;

    if (!this.patterns.code.has(file)) {
      this.patterns.code.set(file, {
        changeCount: 0,
        changeTypes: new Map(),
        complexity: 0,
        errorProne: false,
        lastChanged: null
      });
    }

    const codePattern = this.patterns.code.get(file);
    codePattern.changeCount++;
    codePattern.lastChanged = Date.now();

    // Track change type
    const changeType = interaction.changeType || 'unknown';
    const count = codePattern.changeTypes.get(changeType) || 0;
    codePattern.changeTypes.set(changeType, count + 1);

    // Detect error-prone files
    if (codePattern.changeCount > 10 && 
        (codePattern.changeTypes.get('bug_fix') || 0) > 5) {
      codePattern.errorProne = true;
    }

    log.debug('Code pattern updated', {
      file,
      changeCount: codePattern.changeCount,
      errorProne: codePattern.errorProne
    });
  }

  /**
   * Detect workflow execution patterns
   */
  detectWorkflowPatterns(interaction) {
    const workflowId = interaction.workflowId;
    if (!workflowId) return;

    if (!this.patterns.workflow.has(workflowId)) {
      this.patterns.workflow.set(workflowId, {
        executionCount: 0,
        averageDuration: 0,
        successRate: 1.0,
        bottlenecks: new Map(),
        optimizations: []
      });
    }

    const workflowPattern = this.patterns.workflow.get(workflowId);
    workflowPattern.executionCount++;

    // Track duration
    if (interaction.duration !== undefined) {
      workflowPattern.averageDuration = 
        0.9 * workflowPattern.averageDuration + 0.1 * interaction.duration;
    }

    // Track success
    if (interaction.success !== undefined) {
      workflowPattern.successRate = 
        0.9 * workflowPattern.successRate + 0.1 * (interaction.success ? 1 : 0);
    }

    // Detect bottlenecks
    if (interaction.steps) {
      for (const step of interaction.steps) {
        if (step.duration > workflowPattern.averageDuration * 0.3) {
          const count = workflowPattern.bottlenecks.get(step.name) || 0;
          workflowPattern.bottlenecks.set(step.name, count + 1);
        }
      }
    }
  }

  /**
   * Detect error patterns
   */
  detectErrorPatterns(interaction) {
    const errorType = interaction.errorType || 'unknown';

    if (!this.patterns.error.has(errorType)) {
      this.patterns.error.set(errorType, {
        occurrences: 0,
        contexts: [],
        solutions: new Map(),
        lastOccurred: null
      });
    }

    const errorPattern = this.patterns.error.get(errorType);
    errorPattern.occurrences++;
    errorPattern.lastOccurred = Date.now();

    // Store context
    errorPattern.contexts.push({
      message: interaction.message,
      stack: interaction.stack,
      timestamp: Date.now()
    });

    // Limit context history
    if (errorPattern.contexts.length > 10) {
      errorPattern.contexts.shift();
    }

    // Track solutions
    if (interaction.solution) {
      const count = errorPattern.solutions.get(interaction.solution) || 0;
      errorPattern.solutions.set(interaction.solution, count + 1);
    }

    // Alert if recurring
    if (errorPattern.occurrences >= this.thresholds.minOccurrences) {
      this.metrics.patternsDetected++;
      log.warn('Recurring error pattern detected', {
        errorType,
        occurrences: errorPattern.occurrences
      });
    }
  }

  /**
   * Consolidate short-term to long-term memory
   */
  consolidateMemory() {
    const shortTermItems = Array.from(this.memory.shortTerm.values())
      .filter(item => !item.processed);

    for (const item of shortTermItems) {
      // Find similar patterns in long-term memory
      const pattern = this.findSimilarPattern(item);

      if (pattern) {
        // Strengthen existing pattern
        pattern.strength += this.learningRate;
        pattern.occurrences++;
        pattern.lastSeen = Date.now();
      } else if (this.shouldCreatePattern(item)) {
        // Create new long-term pattern
        const newPattern = {
          type: item.type,
          data: item,
          strength: 1.0,
          occurrences: 1,
          created: Date.now(),
          lastSeen: Date.now()
        };

        const patternId = `pattern-${Date.now()}-${Math.random()}`;
        this.memory.longTerm.set(patternId, newPattern);

        this.metrics.patternsDetected++;
        log.info('New pattern created', { patternId, type: item.type });
      }

      item.processed = true;
    }

    // Apply memory decay
    this.applyMemoryDecay();

    log.debug('Memory consolidated', {
      shortTerm: this.memory.shortTerm.size,
      longTerm: this.memory.longTerm.size,
      patterns: this.metrics.patternsDetected
    });
  }

  /**
   * Find similar pattern
   */
  findSimilarPattern(item) {
    for (const pattern of this.memory.longTerm.values()) {
      if (this.calculateSimilarity(item, pattern.data) > 0.8) {
        return pattern;
      }
    }
    return null;
  }

  /**
   * Calculate similarity between items
   */
  calculateSimilarity(item1, item2) {
    // Simple similarity based on type and key properties
    if (item1.type !== item2.type) return 0;

    let matches = 0;
    let total = 0;

    for (const key in item1) {
      if (key === 'timestamp' || key === 'processed') continue;
      total++;
      if (item1[key] === item2[key]) matches++;
    }

    return total > 0 ? matches / total : 0;
  }

  /**
   * Should create new pattern?
   */
  shouldCreatePattern(item) {
    // Check if seen multiple times in short-term
    const similar = Array.from(this.memory.shortTerm.values())
      .filter(i => this.calculateSimilarity(item, i) > 0.7);

    return similar.length >= this.thresholds.minOccurrences;
  }

  /**
   * Apply memory decay
   */
  applyMemoryDecay() {
    for (const [id, pattern] of this.memory.longTerm) {
      // Decay strength over time
      const age = Date.now() - pattern.lastSeen;
      const decayFactor = Math.pow(this.thresholds.decay, age / (1000 * 60 * 60 * 24)); // Daily decay
      
      pattern.strength *= decayFactor;

      // Remove very weak patterns
      if (pattern.strength < 0.1) {
        this.memory.longTerm.delete(id);
      }
    }
  }

  /**
   * Learn from pattern
   */
  learn(patternId) {
    const pattern = this.memory.longTerm.get(patternId);
    if (!pattern) return;

    // Extract knowledge
    const knowledge = this.extractKnowledge(pattern);

    if (knowledge) {
      this.knowledge.set(knowledge.id, knowledge);
      this.metrics.lastLearned = Date.now();

      log.success('Knowledge learned', {
        id: knowledge.id,
        type: knowledge.type,
        confidence: knowledge.confidence
      });
    }
  }

  /**
   * Extract knowledge from pattern
   */
  extractKnowledge(pattern) {
    if (pattern.strength < this.thresholds.confidence) return null;

    const knowledge = {
      id: `knowledge-${Date.now()}`,
      type: pattern.type,
      confidence: pattern.strength,
      occurrences: pattern.occurrences,
      created: Date.now(),
      data: null
    };

    switch (pattern.type) {
      case 'user_message':
        knowledge.data = {
          insight: 'Users frequently ask about this',
          recommendation: 'Prepare quick response'
        };
        break;
      case 'agent_action':
        knowledge.data = {
          insight: 'This action is common',
          recommendation: 'Optimize for speed'
        };
        break;
      case 'error':
        knowledge.data = {
          insight: 'This error recurs',
          recommendation: 'Add prevention logic'
        };
        break;
    }

    return knowledge;
  }

  /**
   * Get learned knowledge
   */
  getKnowledge(type = null) {
    const allKnowledge = Array.from(this.knowledge.values());
    
    if (type) {
      return allKnowledge.filter(k => k.type === type);
    }

    return allKnowledge;
  }

  /**
   * Get pattern insights
   */
  getInsights() {
    return {
      user: this.getUserInsights(),
      agent: this.getAgentInsights(),
      code: this.getCodeInsights(),
      workflow: this.getWorkflowInsights(),
      error: this.getErrorInsights()
    };
  }

  /**
   * Get user insights
   */
  getUserInsights() {
    const insights = [];

    for (const [userId, pattern] of this.patterns.user) {
      const topQuery = this.getTopQuery(pattern.commonQueries);
      
      insights.push({
        userId,
        messageCount: pattern.messageCount,
        topQueryType: topQuery,
        preferences: pattern.preferences,
        recommendation: `Focus on ${topQuery} responses`
      });
    }

    return insights;
  }

  /**
   * Get agent insights
   */
  getAgentInsights() {
    const insights = [];

    for (const [agentId, pattern] of this.patterns.agent) {
      const topAction = this.getTopQuery(pattern.commonActions);
      
      insights.push({
        agentId,
        actionCount: pattern.actionCount,
        successRate: pattern.successRate,
        topAction,
        improvementAreas: pattern.improvementAreas.slice(-3),
        recommendation: pattern.successRate < 0.8 ? 
          'Review and optimize agent logic' : 'Performance is good'
      });
    }

    return insights;
  }

  /**
   * Get code insights
   */
  getCodeInsights() {
    const insights = [];

    for (const [file, pattern] of this.patterns.code) {
      insights.push({
        file,
        changeCount: pattern.changeCount,
        errorProne: pattern.errorProne,
        recommendation: pattern.errorProne ? 
          'Add more tests and error handling' : 'File is stable'
      });
    }

    return insights.filter(i => i.errorProne || i.changeCount > 5);
  }

  /**
   * Get workflow insights
   */
  getWorkflowInsights() {
    const insights = [];

    for (const [workflowId, pattern] of this.patterns.workflow) {
      const bottleneck = this.getTopQuery(pattern.bottlenecks);
      
      insights.push({
        workflowId,
        executionCount: pattern.executionCount,
        averageDuration: pattern.averageDuration,
        successRate: pattern.successRate,
        bottleneck,
        recommendation: bottleneck ? 
          `Optimize step: ${bottleneck}` : 'Workflow is efficient'
      });
    }

    return insights;
  }

  /**
   * Get error insights
   */
  getErrorInsights() {
    const insights = [];

    for (const [errorType, pattern] of this.patterns.error) {
      const topSolution = this.getTopQuery(pattern.solutions);
      
      if (pattern.occurrences >= this.thresholds.minOccurrences) {
        insights.push({
          errorType,
          occurrences: pattern.occurrences,
          topSolution,
          recommendation: topSolution ? 
            `Apply solution: ${topSolution}` : 'Investigate root cause'
        });
      }
    }

    return insights;
  }

  /**
   * Get top query from map
   */
  getTopQuery(queryMap) {
    let top = null;
    let max = 0;

    for (const [query, count] of queryMap) {
      if (count > max) {
        max = count;
        top = query;
      }
    }

    return top;
  }

  /**
   * Get learning statistics
   */
  getStats() {
    return {
      observations: this.metrics.totalObservations,
      patternsDetected: this.metrics.patternsDetected,
      knowledgeItems: this.knowledge.size,
      memoryUsage: {
        shortTerm: this.memory.shortTerm.size,
        longTerm: this.memory.longTerm.size,
        episodic: this.memory.episodic.length,
        semantic: this.memory.semantic.size
      },
      lastLearned: this.metrics.lastLearned
    };
  }
}

module.exports = PatternLearningEngine;

