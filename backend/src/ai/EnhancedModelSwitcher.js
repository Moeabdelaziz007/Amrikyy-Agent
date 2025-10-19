/**
 * Enhanced Model Switcher
 * Intelligent switching between different AI models based on context and performance
 */

class EnhancedModelSwitcher {
  constructor() {
    this.models = {
      gemini: {
        name: 'gemini-2.5-flash',
        provider: 'google',
        capabilities: ['text', 'vision', 'reasoning'],
        cost: 'low',
        speed: 'fast'
      },
      zai: {
        name: 'glm-4.6',
        provider: 'zai',
        capabilities: ['text', 'reasoning'],
        cost: 'medium',
        speed: 'medium'
      },
      openai: {
        name: 'gpt-4o-mini',
        provider: 'openai',
        capabilities: ['text', 'vision'],
        cost: 'medium',
        speed: 'fast'
      }
    };

    this.currentModel = 'gemini';
    this.usageStats = {};
    this.fallbackChain = ['gemini', 'zai', 'openai'];
  }

  /**
   * Select the best model for a given task
   */
  selectModel(task, context = {}) {
    const { priority = 'normal', complexity = 'medium', budget = 'medium' } = context;

    // Simple selection logic - can be enhanced with ML
    if (priority === 'high' && budget === 'high') {
      return 'openai';
    } else if (complexity === 'low' && budget === 'low') {
      return 'gemini';
    } else {
      return 'zai';
    }
  }

  /**
   * Switch to a different model
   */
  switchModel(modelName) {
    if (this.models[modelName]) {
      this.currentModel = modelName;
      return true;
    }
    return false;
  }

  /**
   * Get current model info
   */
  getCurrentModel() {
    return {
      name: this.currentModel,
      info: this.models[this.currentModel]
    };
  }

  /**
   * Record usage statistics
   */
  recordUsage(modelName, success, responseTime) {
    if (!this.usageStats[modelName]) {
      this.usageStats[modelName] = {
        total: 0,
        successful: 0,
        failed: 0,
        avgResponseTime: 0
      };
    }

    const stats = this.usageStats[modelName];
    stats.total++;
    
    if (success) {
      stats.successful++;
    } else {
      stats.failed++;
    }

    // Update average response time
    stats.avgResponseTime = (stats.avgResponseTime * (stats.total - 1) + responseTime) / stats.total;
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return this.usageStats;
  }

  /**
   * Get fallback model
   */
  getFallbackModel(currentModel) {
    const currentIndex = this.fallbackChain.indexOf(currentModel);
    if (currentIndex < this.fallbackChain.length - 1) {
      return this.fallbackChain[currentIndex + 1];
    }
    return this.fallbackChain[0]; // Loop back to first
  }
}

module.exports = { EnhancedModelSwitcher };