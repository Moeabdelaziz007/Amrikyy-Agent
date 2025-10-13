/**
 * Context Management for Cost Savings
 * Optimizes AI interactions to minimize token usage and costs
 */

class ContextManager {
  constructor() {
    this.memoryBank = new Map();
    this.costTracker = {
      totalTokens: 0,
      totalCost: 0,
      requestsByModel: {},
      dailyUsage: new Map()
    };
    this.contextOptimization = {
      maxContextSize: 4000,
      compressionThreshold: 0.8,
      enableMemoryBank: true,
      enableCompression: true
    };
  }

  /**
   * Store project context in Memory Bank
   * Reduces need to re-explain project details (saves 200-500 tokens)
   */
  storeProjectContext(key, context) {
    const compressedContext = this.compressContext(context);
    this.memoryBank.set(key, {
      context: compressedContext,
      timestamp: Date.now(),
      tokenCount: this.estimateTokens(compressedContext)
    });
  }

  /**
   * Retrieve context from Memory Bank
   */
  getProjectContext(key) {
    const stored = this.memoryBank.get(key);
    if (stored && this.isContextFresh(stored.timestamp)) {
      return stored.context;
    }
    return null;
  }

  /**
   * Compress context to reduce token usage
   */
  compressContext(context) {
    if (typeof context !== 'string') {
      context = JSON.stringify(context);
    }

    // Remove unnecessary whitespace
    context = context.replace(/\s+/g, ' ').trim();
    
    // Remove comments and empty lines
    context = context.replace(/\/\*[\s\S]*?\*\//g, '');
    context = context.replace(/\/\/.*$/gm, '');
    context = context.replace(/^\s*[\r\n]/gm, '');
    
    return context;
  }

  /**
   * Estimate token count
   */
  estimateTokens(text) {
    return Math.ceil(text.length / 4); // Rough estimation
  }

  /**
   * Check if context is still fresh (within 24 hours)
   */
  isContextFresh(timestamp) {
    const dayInMs = 24 * 60 * 60 * 1000;
    return (Date.now() - timestamp) < dayInMs;
  }

  /**
   * Optimize file references for minimal context
   */
  optimizeFileReference(filePath, specificLines = null) {
    if (specificLines) {
      return `@${filePath}:${specificLines.start}-${specificLines.end}`;
    }
    return `@${filePath}`;
  }

  /**
   * Create focused context for specific tasks
   */
  createFocusedContext(task, relevantFiles = []) {
    const context = {
      task,
      relevantFiles: relevantFiles.map(file => this.optimizeFileReference(file)),
      memoryBankRefs: this.getRelevantMemoryBankRefs(task),
      timestamp: Date.now()
    };

    return this.compressContext(JSON.stringify(context));
  }

  /**
   * Get relevant Memory Bank references for task
   */
  getRelevantMemoryBankRefs(task) {
    const keywords = task.toLowerCase().split(' ');
    const relevantRefs = [];

    for (const [key, value] of this.memoryBank.entries()) {
      if (keywords.some(keyword => key.toLowerCase().includes(keyword))) {
        relevantRefs.push(key);
      }
    }

    return relevantRefs;
  }

  /**
   * Track cost and usage
   */
  trackUsage(model, tokens, cost = 0) {
    this.costTracker.totalTokens += tokens;
    this.costTracker.totalCost += cost;
    
    if (!this.costTracker.requestsByModel[model]) {
      this.costTracker.requestsByModel[model] = { requests: 0, tokens: 0, cost: 0 };
    }
    
    this.costTracker.requestsByModel[model].requests++;
    this.costTracker.requestsByModel[model].tokens += tokens;
    this.costTracker.requestsByModel[model].cost += cost;

    // Daily usage tracking
    const today = new Date().toDateString();
    if (!this.costTracker.dailyUsage.has(today)) {
      this.costTracker.dailyUsage.set(today, { tokens: 0, cost: 0 });
    }
    
    const daily = this.costTracker.dailyUsage.get(today);
    daily.tokens += tokens;
    daily.cost += cost;
  }

  /**
   * Get cost summary
   */
  getCostSummary() {
    return {
      totalTokens: this.costTracker.totalTokens,
      totalCost: this.costTracker.totalCost,
      requestsByModel: this.costTracker.requestsByModel,
      dailyUsage: Object.fromEntries(this.costTracker.dailyUsage),
      averageCostPerToken: this.costTracker.totalCost / this.costTracker.totalTokens || 0
    };
  }

  /**
   * Reset daily usage (call at start of new day)
   */
  resetDailyUsage() {
    this.costTracker.dailyUsage.clear();
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations() {
    const recommendations = [];
    const summary = this.getCostSummary();

    // Check for high-cost models
    Object.entries(summary.requestsByModel).forEach(([model, data]) => {
      if (data.cost > summary.totalCost * 0.5) {
        recommendations.push({
          type: 'model_optimization',
          message: `Consider using budget models instead of ${model} for routine tasks`,
          potentialSavings: data.cost * 0.3
        });
      }
    });

    // Check for high token usage
    if (summary.totalTokens > 100000) {
      recommendations.push({
        type: 'context_optimization',
        message: 'Consider using more focused context and Memory Bank references',
        potentialSavings: summary.totalCost * 0.2
      });
    }

    return recommendations;
  }
}

module.exports = ContextManager;
