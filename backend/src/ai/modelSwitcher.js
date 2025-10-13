/**
 * Model Switching Strategies for Cost Optimization
 * Start cheap, escalate when needed
 */

class ModelSwitcher {
  constructor() {
    this.models = {
      // Free tier models
      free: {
        'openrouter/meta-llama/llama-3.1-8b-instruct:free': {
          name: 'Llama 3.1 8B (Free)',
          maxTokens: 8000,
          cost: 0,
          capabilities: ['simple_coding', 'basic_analysis', 'documentation'],
          successRate: 0.85
        },
        'openrouter/microsoft/phi-3-mini-128k-instruct:free': {
          name: 'Phi-3 Mini (Free)',
          maxTokens: 4000,
          cost: 0,
          capabilities: ['large_context', 'basic_reasoning'],
          successRate: 0.80
        }
      },
      
      // Budget tier models
      budget: {
        'openrouter/meta-llama/llama-3.1-70b-instruct': {
          name: 'Llama 3.1 70B',
          maxTokens: 8000,
          cost: 0.0009,
          capabilities: ['complex_coding', 'refactoring', 'debugging'],
          successRate: 0.90
        },
        'openrouter/google/gemini-flash-1.5': {
          name: 'Gemini Flash 1.5',
          maxTokens: 8000,
          cost: 0.000075,
          capabilities: ['large_context', 'analysis', 'reasoning'],
          successRate: 0.88
        }
      },
      
      // Premium tier models
      premium: {
        'openrouter/openai/gpt-4o-mini': {
          name: 'GPT-4o Mini',
          maxTokens: 16000,
          cost: 0.00015,
          capabilities: ['complex_reasoning', 'architecture', 'critical_code'],
          successRate: 0.95
        },
        'openrouter/anthropic/claude-3.5-sonnet': {
          name: 'Claude 3.5 Sonnet',
          maxTokens: 8000,
          cost: 0.003,
          capabilities: ['advanced_reasoning', 'complex_analysis', 'critical_tasks'],
          successRate: 0.98
        }
      }
    };

    this.taskComplexity = {
      simple: ['basic_coding', 'documentation', 'simple_fixes'],
      medium: ['refactoring', 'debugging', 'feature_implementation'],
      complex: ['architecture', 'security_analysis', 'performance_optimization'],
      critical: ['production_fixes', 'security_critical', 'complex_algorithms']
    };

    this.usageHistory = [];
  }

  /**
   * Select optimal model based on task complexity and budget
   */
  selectModel(task, budget = 'free', previousFailures = 0) {
    const complexity = this.assessTaskComplexity(task);
    const tier = this.getOptimalTier(complexity, budget, previousFailures);
    
    const availableModels = this.models[tier];
    const bestModel = this.findBestModel(availableModels, task);
    
    return {
      modelId: bestModel,
      tier,
      reason: this.getSelectionReason(complexity, tier, previousFailures)
    };
  }

  /**
   * Assess task complexity
   */
  assessTaskComplexity(task) {
    const taskLower = task.toLowerCase();
    
    if (this.taskComplexity.critical.some(keyword => taskLower.includes(keyword))) {
      return 'critical';
    }
    
    if (this.taskComplexity.complex.some(keyword => taskLower.includes(keyword))) {
      return 'complex';
    }
    
    if (this.taskComplexity.medium.some(keyword => taskLower.includes(keyword))) {
      return 'medium';
    }
    
    return 'simple';
  }

  /**
   * Get optimal tier based on complexity and budget
   */
  getOptimalTier(complexity, budget, previousFailures) {
    // Escalate if previous attempts failed
    if (previousFailures >= 2) {
      if (budget === 'free') return 'budget';
      if (budget === 'budget') return 'premium';
    }

    // Match complexity to tier
    switch (complexity) {
      case 'simple':
        return budget === 'free' ? 'free' : 'budget';
      case 'medium':
        return budget === 'free' ? 'budget' : 'budget';
      case 'complex':
        return budget === 'free' ? 'budget' : 'premium';
      case 'critical':
        return 'premium';
      default:
        return 'free';
    }
  }

  /**
   * Find best model for task
   */
  findBestModel(availableModels, task) {
    const taskLower = task.toLowerCase();
    
    // Find model with best capabilities match
    let bestModel = null;
    let bestScore = 0;
    
    for (const [modelId, model] of Object.entries(availableModels)) {
      const score = this.calculateModelScore(model, taskLower);
      if (score > bestScore) {
        bestScore = score;
        bestModel = modelId;
      }
    }
    
    return bestModel || Object.keys(availableModels)[0];
  }

  /**
   * Calculate model score for task
   */
  calculateModelScore(model, taskLower) {
    let score = 0;
    
    // Base score from success rate
    score += model.successRate * 100;
    
    // Bonus for capability matches
    model.capabilities.forEach(capability => {
      if (taskLower.includes(capability.replace('_', ' '))) {
        score += 20;
      }
    });
    
    // Cost penalty (prefer cheaper models for same capability)
    score -= model.cost * 10000;
    
    return score;
  }

  /**
   * Get selection reason
   */
  getSelectionReason(complexity, tier, previousFailures) {
    if (previousFailures > 0) {
      return `Escalated to ${tier} tier due to ${previousFailures} previous failures`;
    }
    
    return `Selected ${tier} tier for ${complexity} complexity task`;
  }

  /**
   * Track model performance
   */
  trackPerformance(modelId, success, tokens, cost) {
    this.usageHistory.push({
      modelId,
      success,
      tokens,
      cost,
      timestamp: Date.now()
    });

    // Update success rate
    this.updateModelSuccessRate(modelId, success);
  }

  /**
   * Update model success rate
   */
  updateModelSuccessRate(modelId, success) {
    for (const tier of Object.values(this.models)) {
      if (tier[modelId]) {
        const recentUses = this.usageHistory
          .filter(entry => entry.modelId === modelId)
          .slice(-10); // Last 10 uses
        
        if (recentUses.length > 0) {
          const successCount = recentUses.filter(entry => entry.success).length;
          tier[modelId].successRate = successCount / recentUses.length;
        }
        break;
      }
    }
  }

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics() {
    const analytics = {
      totalRequests: this.usageHistory.length,
      successRate: 0,
      totalCost: 0,
      totalTokens: 0,
      byTier: {}
    };

    if (this.usageHistory.length > 0) {
      const successfulRequests = this.usageHistory.filter(entry => entry.success).length;
      analytics.successRate = successfulRequests / this.usageHistory.length;
      analytics.totalCost = this.usageHistory.reduce((sum, entry) => sum + entry.cost, 0);
      analytics.totalTokens = this.usageHistory.reduce((sum, entry) => sum + entry.tokens, 0);
    }

    // Analytics by tier
    Object.keys(this.models).forEach(tier => {
      const tierEntries = this.usageHistory.filter(entry => 
        Object.keys(this.models[tier]).includes(entry.modelId)
      );
      
      if (tierEntries.length > 0) {
        analytics.byTier[tier] = {
          requests: tierEntries.length,
          successRate: tierEntries.filter(entry => entry.success).length / tierEntries.length,
          totalCost: tierEntries.reduce((sum, entry) => sum + entry.cost, 0),
          averageTokens: tierEntries.reduce((sum, entry) => sum + entry.tokens, 0) / tierEntries.length
        };
      }
    });

    return analytics;
  }

  /**
   * Get cost optimization recommendations
   */
  getCostOptimizationRecommendations() {
    const analytics = this.getPerformanceAnalytics();
    const recommendations = [];

    // Check if free tier is underutilized
    if (analytics.byTier.free && analytics.byTier.free.requests < analytics.totalRequests * 0.3) {
      recommendations.push({
        type: 'tier_optimization',
        message: 'Consider using free tier more often for simple tasks',
        potentialSavings: analytics.byTier.premium ? analytics.byTier.premium.totalCost * 0.5 : 0
      });
    }

    // Check for overuse of premium tier
    if (analytics.byTier.premium && analytics.byTier.premium.requests > analytics.totalRequests * 0.4) {
      recommendations.push({
        type: 'tier_optimization',
        message: 'Consider using budget tier for more tasks to reduce costs',
        potentialSavings: analytics.byTier.premium.totalCost * 0.3
      });
    }

    return recommendations;
  }
}

module.exports = ModelSwitcher;
