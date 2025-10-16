/**
 * Enhanced Pattern Learning Engine with Journal Integration
 * Learns patterns from interactions and stores them in persistent memory
 */

const EventEmitter = require('events');
const winston = require('winston');

class EnhancedPatternLearningEngineWithJournal extends EventEmitter {
  constructor() {
    super();

    this.engine_id = "enhanced_pattern_engine";
    this.version = "2.0.0";

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/pattern-engine.log' }),
        new winston.transports.Console()
      ]
    });

    // Pattern storage
    this.patterns = new Map();
    this.interactionHistory = [];
    this.learningStats = {
      patternsLearned: 0,
      insightsGenerated: 0,
      learningRate: 0,
      lastLearning: null,
      memoryUsage: 0
    };

    // Journal integration
    this.journalClient = null;
    this.journalConnected = false;

    // Pattern analysis
    this.patternMatchers = [];
    this.insightGenerators = [];

    // Learning configuration
    this.config = {
      maxPatterns: 1000,
      minConfidenceThreshold: 0.6,
      learningRate: 0.1,
      memoryRetentionDays: 90,
      insightGenerationInterval: 10, // Generate insights every 10 interactions
      patternSimilarityThreshold: 0.8
    };

    this.status = 'initializing';
  }

  async initialize() {
    this.logger.info('Initializing Enhanced Pattern Learning Engine...');

    try {
      // Initialize journal client
      await this.initializeJournalClient();

      // Load existing patterns from journal
      await this.loadExistingPatterns();

      // Set up pattern matchers
      this.setupPatternMatchers();

      // Set up insight generators
      this.setupInsightGenerators();

      // Start learning cycle
      this.startLearningCycle();

      this.status = 'active';
      this.logger.info('Pattern engine initialized successfully');

      this.emit('engine_initialized', {
        patterns_loaded: this.patterns.size,
        journal_connected: this.journalConnected
      });

    } catch (error) {
      this.logger.error('Failed to initialize pattern engine', { error: error.message });
      this.status = 'error';
      throw error;
    }
  }

  async initializeJournalClient() {
    try {
      // Import MCP Journal Client
      const { MCPJournalClient } = require('../mcp/MCPJournalClient');

      this.journalClient = new MCPJournalClient({
        serverUrl: process.env.MCP_JOURNAL_SERVER_URL || 'http://localhost:3001',
        apiKey: process.env.MCP_JOURNAL_API_KEY,
        encryptionKey: process.env.MCP_JOURNAL_ENCRYPTION_KEY
      });

      await this.journalClient.connect();
      this.journalConnected = true;

      this.logger.info('Journal client initialized successfully');

    } catch (error) {
      this.logger.warn('Could not initialize journal client, continuing without persistent memory', {
        error: error.message
      });
      this.journalConnected = false;
    }
  }

  async loadExistingPatterns() {
    if (!this.journalConnected) return;

    try {
      this.logger.info('Loading existing patterns from journal...');

      // Query journal for pattern data
      const patternData = await this.journalClient.query({
        type: 'pattern_data',
        limit: 1000,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      // Reconstruct patterns from journal data
      for (const entry of patternData) {
        if (entry.data && entry.data.pattern) {
          const pattern = this.reconstructPattern(entry.data.pattern);
          this.patterns.set(pattern.id, pattern);
        }
      }

      this.logger.info('Loaded existing patterns', { count: this.patterns.size });

    } catch (error) {
      this.logger.warn('Failed to load existing patterns', { error: error.message });
    }
  }

  setupPatternMatchers() {
    // Request pattern matchers
    this.patternMatchers.push({
      name: 'travel_request_patterns',
      matcher: (requestText) => {
        const travelKeywords = ['travel', 'trip', 'vacation', 'hotel', 'flight', 'destination'];
        const matches = travelKeywords.filter(keyword => requestText.toLowerCase().includes(keyword));
        return matches.length > 0 ? { type: 'travel', confidence: matches.length / travelKeywords.length } : null;
      }
    });

    this.patternMatchers.push({
      name: 'development_request_patterns',
      matcher: (requestText) => {
        const devKeywords = ['code', 'develop', 'build', 'software', 'app', 'api', 'debug'];
        const matches = devKeywords.filter(keyword => requestText.toLowerCase().includes(keyword));
        return matches.length > 0 ? { type: 'development', confidence: matches.length / devKeywords.length } : null;
      }
    });

    // Complexity pattern matchers
    this.patternMatchers.push({
      name: 'complexity_patterns',
      matcher: (requestText) => {
        let complexityScore = 0;

        if (requestText.length > 200) complexityScore += 0.3;
        if (requestText.includes('then') || requestText.includes('after')) complexityScore += 0.4;
        if (requestText.split(' ').length > 50) complexityScore += 0.3;

        return complexityScore > 0.5 ? { type: 'complex', confidence: complexityScore } : null;
      }
    });

    // Urgency pattern matchers
    this.patternMatchers.push({
      name: 'urgency_patterns',
      matcher: (requestText) => {
        const urgentKeywords = ['urgent', 'asap', 'emergency', 'quickly', 'rush', 'deadline'];
        const matches = urgentKeywords.filter(keyword => requestText.toLowerCase().includes(keyword));
        return matches.length > 0 ? { type: 'urgent', confidence: matches.length / urgentKeywords.length } : null;
      }
    });
  }

  setupInsightGenerators() {
    // Success pattern insights
    this.insightGenerators.push({
      name: 'success_pattern_insights',
      generator: (interactions) => {
        const successful = interactions.filter(i => i.success).length;
        const total = interactions.length;

        if (total >= 5) {
          const successRate = successful / total;

          if (successRate > 0.8) {
            return {
              type: 'success_pattern',
              insight: `High success rate detected (${Math.round(successRate * 100)}%) in recent interactions`,
              confidence: successRate,
              actionable: true
            };
          } else if (successRate < 0.5) {
            return {
              type: 'failure_pattern',
              insight: `Low success rate detected (${Math.round(successRate * 100)}%) - may need process improvement`,
              confidence: 1 - successRate,
              actionable: true
            };
          }
        }

        return null;
      }
    });

    // Domain expertise insights
    this.insightGenerators.push({
      name: 'domain_expertise_insights',
      generator: (interactions) => {
        const domainStats = {};

        interactions.forEach(interaction => {
          const domain = interaction.domain || 'general';
          if (!domainStats[domain]) {
            domainStats[domain] = { total: 0, successful: 0 };
          }
          domainStats[domain].total++;
          if (interaction.success) {
            domainStats[domain].successful++;
          }
        });

        const insights = [];
        Object.entries(domainStats).forEach(([domain, stats]) => {
          const successRate = stats.successful / stats.total;
          if (stats.total >= 3 && successRate > 0.9) {
            insights.push({
              type: 'domain_expertise',
              insight: `Strong performance in ${domain} domain (${Math.round(successRate * 100)}% success rate)`,
              confidence: successRate,
              domain: domain
            });
          }
        });

        return insights.length > 0 ? insights[0] : null;
      }
    });

    // User behavior insights
    this.insightGenerators.push({
      name: 'user_behavior_insights',
      generator: (interactions) => {
        if (interactions.length < 5) return null;

        const userStats = {};
        interactions.forEach(interaction => {
          const userId = interaction.user_id;
          if (!userStats[userId]) {
            userStats[userId] = { count: 0, successful: 0 };
          }
          userStats[userId].count++;
          if (interaction.success) {
            userStats[userId].successful++;
          }
        });

        const problematicUsers = Object.entries(userStats)
          .filter(([_, stats]) => stats.count >= 3 && (stats.successful / stats.count) < 0.5)
          .map(([userId, stats]) => ({
            user_id: userId,
            success_rate: stats.successful / stats.count,
            interaction_count: stats.count
          }));

        if (problematicUsers.length > 0) {
          return {
            type: 'user_behavior',
            insight: `Detected users with low success rates: ${problematicUsers.length} users may need assistance`,
            confidence: 0.8,
            actionable: true,
            users: problematicUsers
          };
        }

        return null;
      }
    });
  }

  startLearningCycle() {
    // Periodic learning and insight generation
    setInterval(async () => {
      await this.generateInsights();
      await this.cleanupOldPatterns();
      await this.persistPatternsToJournal();
    }, this.config.insightGenerationInterval * 60 * 1000); // Convert minutes to milliseconds

    this.logger.info('Learning cycle started');
  }

  /**
   * Main learning method - called after each interaction
   */
  async learnFromInteraction(interactionData) {
    try {
      this.logger.info('Learning from interaction', {
        user_id: interactionData.user_id,
        success: interactionData.success,
        domain: interactionData.analysis?.domain
      });

      // Store interaction in history
      this.interactionHistory.unshift(interactionData);

      // Keep only recent interactions in memory
      if (this.interactionHistory.length > 1000) {
        this.interactionHistory = this.interactionHistory.slice(0, 1000);
      }

      // Extract patterns from interaction
      const patterns = await this.extractPatterns(interactionData);

      // Learn from each pattern
      for (const pattern of patterns) {
        await this.learnPattern(pattern);
      }

      // Update learning stats
      this.learningStats.patternsLearned++;
      this.learningStats.lastLearning = new Date().toISOString();
      this.learningStats.memoryUsage = this.calculateMemoryUsage();

      // Emit learning event
      this.emit('pattern_learned', {
        interaction_id: interactionData.id || 'unknown',
        patterns_learned: patterns.length,
        total_patterns: this.patterns.size
      });

      // Persist to journal if connected
      if (this.journalConnected) {
        await this.persistInteractionToJournal(interactionData);
      }

    } catch (error) {
      this.logger.error('Error learning from interaction', { error: error.message });
    }
  }

  async extractPatterns(interactionData) {
    const patterns = [];
    const { request, analysis, result, context } = interactionData;

    // Extract request patterns
    const requestText = request.message || request.text || '';
    const requestPatterns = this.matchRequestPatterns(requestText);

    for (const patternMatch of requestPatterns) {
      patterns.push({
        id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'request_pattern',
        category: patternMatch.type,
        confidence: patternMatch.confidence,
        data: {
          request_text: requestText,
          domain: analysis?.domain || 'general',
          complexity: analysis?.complexity || 1,
          success: result?.success || false,
          execution_time: interactionData.execution_time || 0,
          agents_used: interactionData.agents_used || [],
          user_id: interactionData.user_id,
          timestamp: new Date().toISOString()
        },
        metadata: {
          source: 'interaction_analysis',
          extraction_method: patternMatch.matcher,
          context: context || {}
        }
      });
    }

    // Extract success patterns
    if (result?.success) {
      patterns.push({
        id: `success_pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'success_pattern',
        category: 'execution_success',
        confidence: 0.9,
        data: {
          execution_strategy: interactionData.execution_plan?.strategy || 'unknown',
          agents_used: interactionData.agents_used || [],
          execution_time: interactionData.execution_time || 0,
          domain: analysis?.domain || 'general',
          complexity: analysis?.complexity || 1,
          user_id: interactionData.user_id,
          timestamp: new Date().toISOString()
        },
        metadata: {
          source: 'success_analysis',
          success_factors: this.identifySuccessFactors(interactionData)
        }
      });
    }

    // Extract failure patterns
    if (!result?.success && result?.error) {
      patterns.push({
        id: `failure_pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'failure_pattern',
        category: 'execution_failure',
        confidence: 0.8,
        data: {
          error_type: this.categorizeError(result.error),
          execution_strategy: interactionData.execution_plan?.strategy || 'unknown',
          agents_used: interactionData.agents_used || [],
          domain: analysis?.domain || 'general',
          complexity: analysis?.complexity || 1,
          user_id: interactionData.user_id,
          timestamp: new Date().toISOString()
        },
        metadata: {
          source: 'failure_analysis',
          error_message: result.error,
          suggested_fixes: this.suggestFailureFixes(interactionData)
        }
      });
    }

    return patterns;
  }

  matchRequestPatterns(requestText) {
    const matches = [];

    for (const matcher of this.patternMatchers) {
      const match = matcher.matcher(requestText);
      if (match && match.confidence >= this.config.minConfidenceThreshold) {
        matches.push({
          type: matcher.name,
          confidence: match.confidence,
          matcher: matcher.name
        });
      }
    }

    return matches;
  }

  async learnPattern(pattern) {
    // Check if similar pattern already exists
    const existingPattern = this.findSimilarPattern(pattern);

    if (existingPattern) {
      // Update existing pattern
      await this.updateExistingPattern(existingPattern, pattern);
    } else {
      // Store new pattern
      this.patterns.set(pattern.id, pattern);

      // Keep pattern count manageable
      if (this.patterns.size > this.config.maxPatterns) {
        await this.pruneOldPatterns();
      }
    }
  }

  findSimilarPattern(newPattern) {
    for (const [id, existingPattern] of this.patterns) {
      const similarity = this.calculatePatternSimilarity(newPattern, existingPattern);

      if (similarity >= this.config.patternSimilarityThreshold) {
        return { id, pattern: existingPattern, similarity };
      }
    }

    return null;
  }

  calculatePatternSimilarity(pattern1, pattern2) {
    // Simple similarity based on category and domain
    if (pattern1.category === pattern2.category) {
      return 0.8;
    }

    if (pattern1.data?.domain === pattern2.data?.domain) {
      return 0.6;
    }

    return 0.2;
  }

  async updateExistingPattern(existingPattern, newPattern) {
    const updatedPattern = {
      ...existingPattern.pattern,
      data: {
        ...existingPattern.pattern.data,
        occurrences: (existingPattern.pattern.data.occurrences || 0) + 1,
        last_seen: new Date().toISOString(),
        success_rate: this.calculateUpdatedSuccessRate(existingPattern.pattern, newPattern)
      }
    };

    this.patterns.set(existingPattern.id, updatedPattern);
  }

  calculateUpdatedSuccessRate(existingPattern, newPattern) {
    const currentOccurrences = existingPattern.data.occurrences || 1;
    const currentSuccessRate = existingPattern.data.success_rate || 0;
    const newSuccess = newPattern.data.success ? 1 : 0;

    return (currentSuccessRate * currentOccurrences + newSuccess) / (currentOccurrences + 1);
  }

  async generateInsights() {
    if (this.interactionHistory.length < this.config.insightGenerationInterval) {
      return;
    }

    this.logger.info('Generating insights from recent interactions...');

    const recentInteractions = this.interactionHistory.slice(0, this.config.insightGenerationInterval);

    for (const generator of this.insightGenerators) {
      try {
        const insight = generator.generator(recentInteractions);

        if (insight) {
          await this.storeInsight(insight);
          this.learningStats.insightsGenerated++;

          this.emit('insight_generated', insight);

          this.logger.info('Insight generated', {
            type: insight.type,
            confidence: insight.confidence
          });
        }
      } catch (error) {
        this.logger.warn('Error generating insight', {
          generator: generator.name,
          error: error.message
        });
      }
    }
  }

  async storeInsight(insight) {
    const insightPattern = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'insight',
      category: insight.type,
      confidence: insight.confidence,
      data: insight,
      metadata: {
        generated_at: new Date().toISOString(),
        based_on_interactions: this.config.insightGenerationInterval
      }
    };

    this.patterns.set(insightPattern.id, insightPattern);

    // Persist to journal if connected
    if (this.journalConnected) {
      await this.persistPatternToJournal(insightPattern);
    }
  }

  async getExecutionGuidance(requestText, context) {
    // Find relevant patterns for the request
    const relevantPatterns = await this.findRelevantPatterns(requestText, context);

    // Generate guidance based on patterns
    const guidance = {
      suggested_strategy: this.suggestStrategy(relevantPatterns),
      recommended_agents: this.recommendAgents(relevantPatterns, context),
      estimated_complexity: this.estimateComplexity(relevantPatterns),
      success_probability: this.calculateSuccessProbability(relevantPatterns),
      similar_past_requests: this.findSimilarPastRequests(requestText),
      insights: relevantPatterns.filter(p => p.type === 'insight').map(p => p.data)
    };

    return guidance;
  }

  async findRelevantPatterns(requestText, context) {
    const relevantPatterns = [];
    const requestLower = requestText.toLowerCase();

    for (const [id, pattern] of this.patterns) {
      // Match based on pattern type and content
      if (pattern.type === 'request_pattern') {
        const patternText = pattern.data.request_text?.toLowerCase() || '';
        const similarity = this.calculateTextSimilarity(requestLower, patternText);

        if (similarity > 0.3) {
          relevantPatterns.push(pattern);
        }
      }

      // Include relevant insights
      if (pattern.type === 'insight' && pattern.data.actionable) {
        relevantPatterns.push(pattern);
      }
    }

    // Sort by relevance (confidence * similarity)
    return relevantPatterns.sort((a, b) => {
      const scoreA = (a.confidence || 0) * (a.similarity || 1);
      const scoreB = (b.confidence || 0) * (b.similarity || 1);
      return scoreB - scoreA;
    });
  }

  calculateTextSimilarity(text1, text2) {
    const words1 = text1.split(' ');
    const words2 = text2.split(' ');

    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];

    return intersection.length / union.length;
  }

  suggestStrategy(relevantPatterns) {
    // Analyze successful patterns to suggest strategy
    const successPatterns = relevantPatterns.filter(p => p.data.success);

    if (successPatterns.length > 0) {
      const strategies = successPatterns.map(p => p.data.execution_strategy);
      const mostSuccessful = strategies.reduce((acc, strategy) => {
        acc[strategy] = (acc[strategy] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(mostSuccessful).sort(([,a], [,b]) => b - a)[0][0];
    }

    return 'direct_execution'; // Default strategy
  }

  recommendAgents(relevantPatterns, context) {
    const agentUsage = {};

    // Count successful agent usage in relevant patterns
    relevantPatterns
      .filter(p => p.data.success && p.data.agents_used)
      .forEach(pattern => {
        pattern.data.agents_used.forEach(agent => {
          agentUsage[agent] = (agentUsage[agent] || 0) + 1;
        });
      });

    // Return top recommended agents
    return Object.entries(agentUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([agent]) => agent);
  }

  estimateComplexity(relevantPatterns) {
    if (relevantPatterns.length === 0) return 3; // Default medium complexity

    const complexities = relevantPatterns
      .filter(p => p.data.complexity)
      .map(p => p.data.complexity);

    return complexities.length > 0
      ? complexities.reduce((sum, complexity) => sum + complexity, 0) / complexities.length
      : 3;
  }

  calculateSuccessProbability(relevantPatterns) {
    if (relevantPatterns.length === 0) return 0.7; // Default 70% success probability

    const successPatterns = relevantPatterns.filter(p => p.data.success);
    return successPatterns.length / relevantPatterns.length;
  }

  findSimilarPastRequests(requestText) {
    return this.interactionHistory
      .filter(interaction => {
        const interactionText = interaction.request.message || '';
        return this.calculateTextSimilarity(requestText.toLowerCase(), interactionText.toLowerCase()) > 0.3;
      })
      .slice(0, 5)
      .map(interaction => ({
        id: interaction.id,
        request: interaction.request,
        success: interaction.result?.success,
        execution_time: interaction.execution_time,
        timestamp: interaction.timestamp || interaction.startTime
      }));
  }

  // Helper methods
  identifySuccessFactors(interactionData) {
    const factors = [];

    if (interactionData.agents_used?.length > 1) {
      factors.push('multi_agent_coordination');
    }

    if (interactionData.execution_time < 10000) { // Under 10 seconds
      factors.push('fast_execution');
    }

    if (interactionData.analysis?.confidence_score > 0.8) {
      factors.push('high_confidence_analysis');
    }

    return factors;
  }

  categorizeError(errorMessage) {
    const lowerError = errorMessage.toLowerCase();

    if (lowerError.includes('timeout')) return 'timeout';
    if (lowerError.includes('network') || lowerError.includes('connection')) return 'network';
    if (lowerError.includes('agent') || lowerError.includes('not found')) return 'agent_unavailable';
    if (lowerError.includes('permission') || lowerError.includes('unauthorized')) return 'permission';

    return 'unknown';
  }

  suggestFailureFixes(interactionData) {
    const suggestions = [];

    if (interactionData.result?.error?.includes('timeout')) {
      suggestions.push('Increase timeout limits for complex requests');
      suggestions.push('Break down complex requests into smaller steps');
    }

    if (interactionData.result?.error?.includes('agent')) {
      suggestions.push('Check agent availability and health status');
      suggestions.push('Implement agent fallback mechanisms');
    }

    return suggestions;
  }

  async cleanupOldPatterns() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.memoryRetentionDays);

    const patternsToRemove = [];

    for (const [id, pattern] of this.patterns) {
      const patternDate = new Date(pattern.data.timestamp || pattern.metadata?.generated_at);

      if (patternDate < cutoffDate) {
        patternsToRemove.push(id);
      }
    }

    patternsToRemove.forEach(id => this.patterns.delete(id));

    if (patternsToRemove.length > 0) {
      this.logger.info('Cleaned up old patterns', { removed: patternsToRemove.length });
    }
  }

  async pruneOldPatterns() {
    // Remove oldest patterns if we exceed maxPatterns
    const patternsArray = Array.from(this.patterns.entries());
    const sortedPatterns = patternsArray.sort((a, b) => {
      const dateA = new Date(a[1].data.timestamp || a[1].metadata?.generated_at);
      const dateB = new Date(b[1].data.timestamp || b[1].metadata?.generated_at);
      return dateA - dateB;
    });

    const patternsToRemove = sortedPatterns.slice(0, this.patterns.size - this.config.maxPatterns);

    patternsToRemove.forEach(([id]) => this.patterns.delete(id));

    this.logger.info('Pruned old patterns', { removed: patternsToRemove.length });
  }

  calculateMemoryUsage() {
    // Rough calculation of memory usage
    const patternsSize = this.patterns.size * 1000; // Estimate 1KB per pattern
    const historySize = this.interactionHistory.length * 500; // Estimate 500B per interaction

    return Math.round((patternsSize + historySize) / 1024); // Return in KB
  }

  // Journal persistence methods
  async persistInteractionToJournal(interactionData) {
    if (!this.journalConnected) return;

    try {
      await this.journalClient.store({
        type: 'interaction_data',
        data: {
          interaction: interactionData,
          engine_id: this.engine_id,
          timestamp: new Date().toISOString()
        },
        metadata: {
          version: this.version,
          retention_days: this.config.memoryRetentionDays
        }
      });
    } catch (error) {
      this.logger.warn('Failed to persist interaction to journal', { error: error.message });
    }
  }

  async persistPatternToJournal(pattern) {
    if (!this.journalConnected) return;

    try {
      await this.journalClient.store({
        type: 'pattern_data',
        data: {
          pattern: pattern,
          engine_id: this.engine_id,
          timestamp: new Date().toISOString()
        },
        metadata: {
          version: this.version,
          pattern_type: pattern.type
        }
      });
    } catch (error) {
      this.logger.warn('Failed to persist pattern to journal', { error: error.message });
    }
  }

  async persistPatternsToJournal() {
    if (!this.journalConnected) return;

    try {
      // Persist all patterns in batches
      const patternsArray = Array.from(this.patterns.values());
      const batches = this.chunkArray(patternsArray, 10); // Process in batches of 10

      for (const batch of batches) {
        await Promise.all(
          batch.map(pattern => this.persistPatternToJournal(pattern))
        );
      }

      this.logger.info('Persisted patterns to journal', { total_patterns: patternsArray.length });

    } catch (error) {
      this.logger.warn('Failed to persist patterns to journal', { error: error.message });
    }
  }

  reconstructPattern(patternData) {
    // Reconstruct pattern object from journal data
    return {
      id: patternData.id,
      type: patternData.type,
      category: patternData.category,
      confidence: patternData.confidence,
      data: patternData.data,
      metadata: patternData.metadata
    };
  }

  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Public API methods
  getLearningStats() {
    return {
      ...this.learningStats,
      total_patterns: this.patterns.size,
      total_interactions: this.interactionHistory.length,
      engine_status: this.status,
      journal_connected: this.journalConnected
    };
  }

  getHealth() {
    return {
      status: this.status,
      memory_usage: this.learningStats.memoryUsage,
      patterns_count: this.patterns.size,
      journal_status: this.journalConnected ? 'connected' : 'disconnected',
      last_activity: this.learningStats.lastLearning
    };
  }

  getPatternsByType(type) {
    return Array.from(this.patterns.values()).filter(pattern => pattern.type === type);
  }

  getRecentPatterns(limit = 10) {
    return Array.from(this.patterns.values())
      .sort((a, b) => {
        const dateA = new Date(a.data.timestamp || a.metadata?.generated_at);
        const dateB = new Date(b.data.timestamp || b.metadata?.generated_at);
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  clearAllData() {
    this.patterns.clear();
    this.interactionHistory = [];
    this.learningStats = {
      patternsLearned: 0,
      insightsGenerated: 0,
      learningRate: 0,
      lastLearning: null,
      memoryUsage: 0
    };

    this.logger.info('All pattern data cleared');
  }
}

module.exports = EnhancedPatternLearningEngineWithJournal;