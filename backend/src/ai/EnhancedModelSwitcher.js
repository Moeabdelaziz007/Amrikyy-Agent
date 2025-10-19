/**
 * Enhanced Model Switcher - Gemini 2.5 Primary Architecture
 * Gemini 2.5 as main brain with other models as extra options
 * Version: 2.0.0
 * Author: AMRIKYY
 */

const ZaiClient = require('./zaiClient');
const { GeminiComputerControlService } = require('../services/GeminiComputerControlService');
// const { GeminiCLI } = require('../services/automation/GeminiCLI'); // Will be initialized when available

class EnhancedModelSwitcher {
  constructor() {
    // Initialize all available models - Gemini 2.5 as PRIMARY
    this.models = {
      'gemini-2.5': new GeminiComputerControlService(), // PRIMARY BRAIN with Computer Control
      'zai-glm-4.6': new ZaiClient(), // Extra option for Arabic
      'claude-sonnet-4': null, // Extra option for code/business
      'trinity-fusion': null, // Extra option for complex reasoning
    };

    // Model capabilities - Gemini 2.5 as PRIMARY
    this.modelCapabilities = {
      'gemini-2.5': {
        strengths: [
          'primary_brain',
          'multimodal',
          'reasoning',
          'analysis',
          'general_intelligence',
          'computer_control',
        ],
        cost: 0.002,
        latency: 'medium',
        accuracy: 99.5,
        languages: ['ar', 'en', 'fr', 'es', 'de', 'zh', 'ja'],
        specialties: [
          'primary_intelligence',
          'multimodal_processing',
          'advanced_reasoning',
          'general_purpose',
          'computer_automation',
        ],
        priority: 'PRIMARY',
        computerControl: true,
      },
      'zai-glm-4.6': {
        strengths: ['arabic', 'travel', 'conversation', 'chat'],
        cost: 0.001,
        latency: 'low',
        accuracy: 95,
        languages: ['ar', 'en'],
        specialties: ['travel_planning', 'arabic_chat', 'general_conversation'],
        priority: 'SECONDARY',
      },
      'claude-sonnet-4': {
        strengths: ['code', 'analysis', 'presentations', 'business_intelligence'],
        cost: 0.003,
        latency: 'medium',
        accuracy: 97,
        languages: ['en', 'ar'],
        specialties: ['code_generation', 'business_analysis', 'presentation_creation'],
        priority: 'SECONDARY',
      },
      'trinity-fusion': {
        strengths: ['complex_reasoning', 'coordination', 'meta_learning', 'multi_agent'],
        cost: 0.005,
        latency: 'high',
        accuracy: 99.99,
        languages: ['ar', 'en'],
        specialties: ['complex_planning', 'multi_agent_coordination', 'strategic_thinking'],
        priority: 'SECONDARY',
      },
    };

    // Task analysis keywords
    this.taskKeywords = {
      travel: [
        'trip',
        'flight',
        'hotel',
        'destination',
        'booking',
        'travel',
        'journey',
        'vacation',
      ],
      arabic: ['عربي', 'العربية', 'سفر', 'رحلة', 'فندق', 'طيران', 'حجز'],
      data_extraction: [
        'extract',
        'parse',
        'analyze',
        'structure',
        'data',
        'information',
        'details',
      ],
      code: ['code', 'function', 'api', 'implementation', 'programming', 'development', 'script'],
      business: ['business', 'analysis', 'report', 'strategy', 'planning', 'presentation'],
      complex: [
        'multi-agent',
        'coordination',
        'strategic',
        'fusion',
        'complex',
        'advanced',
        'sophisticated',
      ],
      multimodal: ['image', 'photo', 'picture', 'visual', 'multimodal', 'media'],
      computer_control: [
        'control',
        'automate',
        'execute',
        'run',
        'command',
        'system',
        'file',
        'process',
        'monitor',
        'manage',
      ],
    };

    // Usage statistics for learning
    this.usageStats = {
      totalRequests: 0,
      modelUsage: {},
      successRates: {},
      averageResponseTimes: {},
      costTracking: {},
    };

    console.log('✅ Enhanced Model Switcher initialized with 4 models');
  }

  /**
   * Select optimal model - Gemini 2.5 as PRIMARY BRAIN
   * @param {string} task - The task or message to analyze
   * @param {Object} context - Additional context (language, type, etc.)
   * @returns {Promise<string>} - Selected model ID
   */
  async selectOptimalModel(task, context = {}) {
    try {
      this.usageStats.totalRequests++;

      // Analyze the task
      const taskAnalysis = this.analyzeTask(task);
      const contextAnalysis = this.analyzeContext(context);

      // GEMINI 2.5 PRIMARY LOGIC - Use Gemini as main brain unless specific fallback needed
      const selectedModel = this.calculateOptimalModelWithGeminiPrimary(
        taskAnalysis,
        contextAnalysis
      );

      // Track selection
      this.trackModelSelection(selectedModel, taskAnalysis);

      console.log(
        `🧠 Gemini 2.5 Primary Brain: ${selectedModel} for task: "${task.substring(0, 50)}..."`
      );

      return selectedModel;
    } catch (error) {
      console.error('Error in model selection:', error);
      // Fallback to Gemini 2.5 (primary brain)
      return 'gemini-2.5';
    }
  }

  /**
   * Calculate optimal model with Gemini 2.5 as PRIMARY BRAIN
   * @param {Object} taskAnalysis - Task analysis results
   * @param {Object} contextAnalysis - Context analysis results
   * @returns {string} - Selected model ID
   */
  calculateOptimalModelWithGeminiPrimary(taskAnalysis, contextAnalysis) {
    // GEMINI 2.5 PRIMARY STRATEGY:
    // 1. Use Gemini 2.5 for 90% of requests (main brain)
    // 2. Use other models only for specific specialized cases

    const modelScores = {};

    // Calculate scores for each model
    Object.keys(this.modelCapabilities).forEach((modelId) => {
      const model = this.modelCapabilities[modelId];
      let score = 0;

      // PRIMARY BRAIN BOOST for Gemini 2.5
      if (modelId === 'gemini-2.5') {
        score += 50; // Massive boost for primary brain
      }

      // Task matching score (weighted by importance)
      if (taskAnalysis.computer_control > 0 && model.strengths.includes('computer_control')) {
        score += 10;
      } // HIGH PRIORITY for computer control
      if (taskAnalysis.travel > 0 && model.strengths.includes('travel')) {
        score += 3;
      }
      if (taskAnalysis.arabic > 0 && model.strengths.includes('arabic')) {
        score += 3;
      }
      if (taskAnalysis.data_extraction > 0 && model.strengths.includes('data_extraction')) {
        score += 3;
      }
      if (taskAnalysis.code > 0 && model.strengths.includes('code')) {
        score += 3;
      }
      if (taskAnalysis.business > 0 && model.strengths.includes('business_intelligence')) {
        score += 3;
      }
      if (taskAnalysis.complex > 0 && model.strengths.includes('complex_reasoning')) {
        score += 5;
      }
      if (taskAnalysis.multimodal > 0 && model.strengths.includes('multimodal')) {
        score += 3;
      }

      // Language matching
      if (contextAnalysis.language === 'ar' && model.languages.includes('ar')) {
        score += 2;
      }
      if (contextAnalysis.language === 'en' && model.languages.includes('en')) {
        score += 1;
      }

      // Special case handling
      if (taskAnalysis.hasCode && model.strengths.includes('code')) {
        score += 4;
      }
      if (taskAnalysis.hasData && model.strengths.includes('data_extraction')) {
        score += 3;
      }
      if (taskAnalysis.hasImages && model.strengths.includes('multimodal')) {
        score += 4;
      }

      // Cost optimization (penalize expensive models)
      score -= model.cost * 1000;

      // Accuracy bonus
      score += model.accuracy / 10;

      // Latency penalty for urgent requests
      if (contextAnalysis.urgency === 'high' && model.latency === 'high') {
        score -= 2;
      }

      modelScores[modelId] = score;
    });

    // Find model with highest score
    const selectedModel = Object.keys(modelScores).reduce((a, b) =>
      modelScores[a] > modelScores[b] ? a : b
    );

    // Log scoring details for debugging
    console.log('🧠 Gemini Primary Brain Scores:', modelScores);
    console.log('🎯 Selected:', selectedModel, 'Score:', modelScores[selectedModel]);

    return selectedModel;
  }

  /**
   * Analyze task to determine requirements
   * @param {string} task - Task to analyze
   * @returns {Object} - Task analysis results
   */
  analyzeTask(task) {
    const taskLower = task.toLowerCase();
    const scores = {};

    // Initialize all categories
    Object.keys(this.taskKeywords).forEach((category) => {
      scores[category] = 0;
    });

    // Calculate scores for each category
    Object.keys(this.taskKeywords).forEach((category) => {
      scores[category] = this.taskKeywords[category].reduce((score, keyword) => {
        return score + (taskLower.includes(keyword) ? 1 : 0);
      }, 0);
    });

    // Additional analysis
    scores.length = task.length;
    scores.hasCode = /```|function|const|let|var|class|import|require/.test(task);
    scores.hasData = /json|data|extract|parse|structure/.test(task);
    scores.hasImages = /image|photo|picture|visual|multimodal/.test(task);

    return scores;
  }

  /**
   * Analyze context to determine requirements
   * @param {Object} context - Context information
   * @returns {Object} - Context analysis results
   */
  analyzeContext(context) {
    return {
      language: context.language || 'en',
      type: context.type || 'general',
      urgency: context.urgency || 'normal',
      complexity: context.complexity || 'medium',
      userId: context.userId || 'anonymous',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Track model selection for learning and optimization
   * @param {string} modelId - Selected model
   * @param {Object} taskAnalysis - Task analysis
   */
  trackModelSelection(modelId, taskAnalysis) {
    // Update usage statistics
    this.usageStats.modelUsage[modelId] = (this.usageStats.modelUsage[modelId] || 0) + 1;

    // Store task analysis for learning
    if (!this.usageStats.taskPatterns) {
      this.usageStats.taskPatterns = [];
    }

    this.usageStats.taskPatterns.push({
      modelId: modelId,
      taskAnalysis: taskAnalysis,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 1000 patterns to prevent memory issues
    if (this.usageStats.taskPatterns.length > 1000) {
      this.usageStats.taskPatterns.shift();
    }
  }

  /**
   * Track model performance for optimization
   * @param {string} modelId - Model used
   * @param {boolean} success - Whether request was successful
   * @param {number} responseTime - Response time in milliseconds
   * @param {number} cost - Cost of the request
   */
  trackModelPerformance(modelId, success, responseTime, cost) {
    // Update success rates
    if (!this.usageStats.successRates[modelId]) {
      this.usageStats.successRates[modelId] = { successful: 0, total: 0 };
    }

    this.usageStats.successRates[modelId].total++;
    if (success) {
      this.usageStats.successRates[modelId].successful++;
    }

    // Update response times
    if (!this.usageStats.averageResponseTimes[modelId]) {
      this.usageStats.averageResponseTimes[modelId] = [];
    }

    this.usageStats.averageResponseTimes[modelId].push(responseTime);

    // Keep only last 100 response times
    if (this.usageStats.averageResponseTimes[modelId].length > 100) {
      this.usageStats.averageResponseTimes[modelId].shift();
    }

    // Update cost tracking
    this.usageStats.costTracking[modelId] = (this.usageStats.costTracking[modelId] || 0) + cost;
  }

  /**
   * Get comprehensive usage statistics
   * @returns {Object} - Usage statistics
   */
  getUsageStats() {
    const stats = {
      totalRequests: this.usageStats.totalRequests,
      modelUsage: this.usageStats.modelUsage,
      successRates: {},
      averageResponseTimes: {},
      costTracking: this.usageStats.costTracking,
      recommendations: this.generateRecommendations(),
    };

    // Calculate success rates
    Object.keys(this.usageStats.successRates).forEach((modelId) => {
      const rate = this.usageStats.successRates[modelId];
      stats.successRates[modelId] = rate.total > 0 ? (rate.successful / rate.total) * 100 : 0;
    });

    // Calculate average response times
    Object.keys(this.usageStats.averageResponseTimes).forEach((modelId) => {
      const times = this.usageStats.averageResponseTimes[modelId];
      stats.averageResponseTimes[modelId] =
        times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
    });

    return stats;
  }

  /**
   * Generate optimization recommendations
   * @returns {Array} - List of recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Check for underutilized models
    Object.keys(this.modelCapabilities).forEach((modelId) => {
      const usage = this.usageStats.modelUsage[modelId] || 0;
      const totalUsage = Object.values(this.usageStats.modelUsage).reduce((sum, u) => sum + u, 0);
      const usagePercentage = totalUsage > 0 ? (usage / totalUsage) * 100 : 0;

      if (usagePercentage < 5 && totalUsage > 100) {
        recommendations.push({
          type: 'underutilized_model',
          model: modelId,
          message: `${modelId} is underutilized (${usagePercentage.toFixed(
            1
          )}%). Consider using it for ${this.modelCapabilities[modelId].specialties.join(', ')}.`,
        });
      }
    });

    // Check for performance issues
    Object.keys(this.usageStats.successRates).forEach((modelId) => {
      const successRate = this.usageStats.successRates[modelId];
      if (successRate.total > 10 && successRate.successful / successRate.total < 0.8) {
        recommendations.push({
          type: 'performance_issue',
          model: modelId,
          message: `${modelId} has low success rate (${(
            (successRate.successful / successRate.total) *
            100
          ).toFixed(1)}%). Consider investigation.`,
        });
      }
    });

    return recommendations;
  }

  /**
   * Get model information
   * @param {string} modelId - Model ID
   * @returns {Object} - Model information
   */
  getModelInfo(modelId) {
    return this.modelCapabilities[modelId] || null;
  }

  /**
   * List all available models
   * @returns {Array} - List of available models
   */
  listAvailableModels() {
    return Object.keys(this.modelCapabilities).map((modelId) => ({
      id: modelId,
      ...this.modelCapabilities[modelId],
      available: this.models[modelId] !== null,
    }));
  }

  /**
   * Initialize Trinity Fusion service when available
   * @param {Object} trinityService - Trinity Fusion service instance
   */
  setTrinityService(trinityService) {
    this.models['trinity-fusion'] = trinityService;
    console.log('✅ Trinity Fusion service initialized in Model Switcher');
  }
}

module.exports = { EnhancedModelSwitcher };
