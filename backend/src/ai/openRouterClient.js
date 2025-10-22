/**
 * OpenRouter API Client
 * Access to multiple AI models through OpenRouter
 * Cost-effective AI provider for Amrikyy Travel Agent
 */

const fetch = require('node-fetch');
const ContextManager = require('./contextManager');
const ModelSwitcher = require('./modelSwitcher');

class OpenRouterClient {
  constructor() {
    this.apiKey =
      process.env.OPENROUTER_API_KEY ||
      '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';
    this.baseUrl = 'https://openrouter.ai/api/v1';

    // Initialize cost optimization components
    this.contextManager = new ContextManager();
    this.modelSwitcher = new ModelSwitcher();
    this.costOptimization = {
      enabled: true,
      maxDailyCost: parseFloat(process.env.MAX_DAILY_COST) || 10.0,
      currentDailyCost: 0,
      budgetTier: process.env.AI_BUDGET_TIER || 'free',
    };

    // Available models with pricing and capabilities
    this.models = {
      // Free tier models
      'meta-llama/llama-3.1-8b-instruct:free': {
        name: 'Llama 3.1 8B (Free)',
        maxTokens: 8000,
        contextWindow: 8000,
        cost: 0,
        description: 'Fast, free model for general use',
      },
      'microsoft/phi-3-mini-128k-instruct:free': {
        name: 'Phi-3 Mini (Free)',
        maxTokens: 4000,
        contextWindow: 128000,
        cost: 0,
        description: 'Microsoft Phi-3 Mini with large context',
      },
      'xai/grok-1': {
        name: 'Grok Code Fast 1 (Free)',
        maxTokens: 8000, // Assuming similar to other free models
        contextWindow: 8000, // Assuming similar to other free models
        cost: 0,
        description: 'xAI Grok Code Fast 1 - fast model for coding tasks',
      },

      // Budget models
      'meta-llama/llama-3.1-70b-instruct': {
        name: 'Llama 3.1 70B',
        maxTokens: 8000,
        contextWindow: 8000,
        cost: 0.0009, // per 1K tokens
        description: 'High-quality model at low cost',
      },
      'google/gemini-flash-1.5': {
        name: 'Gemini Flash 1.5',
        maxTokens: 8000,
        contextWindow: 1000000,
        cost: 0.000075, // per 1K tokens
        description: 'Google Gemini Flash with massive context',
      },

      // Premium models
      'openai/gpt-4o-mini': {
        name: 'GPT-4o Mini',
        maxTokens: 16000,
        contextWindow: 128000,
        cost: 0.00015, // per 1K tokens
        description: 'OpenAI GPT-4o Mini - fast and capable',
      },
      'anthropic/claude-3.5-sonnet': {
        name: 'Claude 3.5 Sonnet',
        maxTokens: 8000,
        contextWindow: 200000,
        cost: 0.003, // per 1K tokens
        description: 'Anthropic Claude 3.5 Sonnet - high quality',
      },
    };

    // Default model selection strategy
    this.defaultModel = 'openai/gpt-4o-mini';
    this.maxTokens = parseInt(process.env.OPENROUTER_MAX_TOKENS) || 4000;
    this.temperature = parseFloat(process.env.OPENROUTER_TEMPERATURE) || 0.7;
  }

  /**
   * Send chat completion request to OpenRouter with cost optimization
   */
  async chatCompletion(messages, options = {}) {
    try {
      // Check daily cost limit
      if (
        this.costOptimization.enabled &&
        this.costOptimization.currentDailyCost >= this.costOptimization.maxDailyCost
      ) {
        throw new Error(`Daily cost limit of $${this.costOptimization.maxDailyCost} reached`);
      }

      // Optimize context for cost savings
      const optimizedMessages = this.optimizeContextForCost(messages, options);

      // Select optimal model based on task complexity and budget
      const modelSelection = this.modelSwitcher.selectModel(
        options.task || 'general',
        options.budget || this.costOptimization.budgetTier,
        options.previousFailures || 0
      );

      const model = options.model || modelSelection.modelId;
      const modelInfo = this.models[model];

      if (!modelInfo) {
        throw new Error(`Model ${model} not found`);
      }

      const requestBody = {
        model: model,
        messages: this.convertMessagesToOpenRouter(optimizedMessages),
        max_tokens: Math.min(options.maxTokens || this.maxTokens, modelInfo.maxTokens),
        temperature: options.temperature || this.temperature,
        top_p: options.topP || 0.9,
        stream: false,
        // OpenRouter specific options
        extra: {
          top_k: 40,
          repetition_penalty: 1.1,
        },
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://amrikyy-travel-agent.com',
          'X-Title': 'Amrikyy Travel Agent',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Calculate cost and track usage
      const cost = this.calculateCost(data.usage, modelInfo);
      this.trackUsage(model, data.usage, cost);

      // Track performance for model switching
      this.modelSwitcher.trackPerformance(model, true, data.usage?.total_tokens || 0, cost);

      return {
        content: data.choices?.[0]?.message?.content || '',
        usage: data.usage || {},
        model: data.model || model,
        finishReason: data.choices?.[0]?.finish_reason || 'stop',
        cost: cost,
        provider: 'OpenRouter',
        optimization: {
          contextOptimized: true,
          modelSelection: modelSelection.reason,
          costSavings: this.calculateCostSavings(model, options),
        },
      };
    } catch (error) {
      console.error('OpenRouter API Error:', error);

      // Track failure for model switching
      if (options.model) {
        this.modelSwitcher.trackPerformance(options.model, false, 0, 0);
      }

      throw new Error(`OpenRouter API Error: ${error.message}`);
    }
  }

  /**
   * Optimize context for cost savings
   */
  optimizeContextForCost(messages, options) {
    if (!this.costOptimization.enabled) {
      return messages;
    }

    return messages.map((msg) => {
      if (msg.role === 'system') {
        // Compress system prompts
        return {
          ...msg,
          content: this.contextManager.compressContext(msg.content),
        };
      }

      if (msg.role === 'user' && msg.content) {
        // Use Memory Bank references instead of full context
        const optimizedContent = this.replaceContextWithReferences(msg.content);
        return {
          ...msg,
          content: optimizedContent,
        };
      }

      return msg;
    });
  }

  /**
   * Replace full context with Memory Bank references
   */
  replaceContextWithReferences(content) {
    // Look for file references and replace with Memory Bank refs
    const fileRefPattern = /@([^:\s]+)(?::(\d+)-(\d+))?/g;

    return content.replace(fileRefPattern, (match, filePath, startLine, endLine) => {
      const memoryKey = `file_${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const storedContext = this.contextManager.getProjectContext(memoryKey);

      if (storedContext) {
        return `@memory:${memoryKey}`;
      }

      // Store file context in Memory Bank for future use
      this.contextManager.storeProjectContext(memoryKey, `File: ${filePath}`);
      return `@memory:${memoryKey}`;
    });
  }

  /**
   * Track usage and costs
   */
  trackUsage(model, usage, cost) {
    this.contextManager.trackUsage(model, usage?.total_tokens || 0, cost);
    this.costOptimization.currentDailyCost += cost;
  }

  /**
   * Calculate cost savings from optimization
   */
  calculateCostSavings(selectedModel, options) {
    const originalModel = options.originalModel || 'openrouter/anthropic/claude-3.5-sonnet';
    const originalCost = this.models[originalModel]?.cost || 0.003;
    const selectedCost = this.models[selectedModel]?.cost || 0;

    return {
      modelSavings: originalCost - selectedCost,
      contextSavings: this.contextManager.getContextSavings(),
      totalSavings: originalCost - selectedCost + this.contextManager.getContextSavings(),
    };
  }

  /**
   * Select optimal model based on request and budget
   */
  selectOptimalModel(messages, options) {
    const totalTokens = this.estimateTokens(messages);
    const maxTokens = options.maxTokens || this.maxTokens;
    const budget = options.budget || 'free';

    // For free tier
    if (budget === 'free') {
      if (totalTokens < 2000 && maxTokens < 4000) {
        return 'microsoft/phi-3-mini-128k-instruct:free';
      }
      return 'meta-llama/llama-3.1-8b-instruct:free';
    }

    // For budget tier
    if (budget === 'budget') {
      if (maxTokens > 8000) {
        return 'google/gemini-flash-1.5';
      }
      return 'meta-llama/llama-3.1-70b-instruct';
    }

    // For premium tier
    if (budget === 'premium') {
      if (maxTokens > 16000) {
        return 'anthropic/claude-3.5-sonnet';
      }
      return 'openai/gpt-4o-mini';
    }

    return this.defaultModel;
  }

  /**
   * Estimate token count for messages
   */
  estimateTokens(messages) {
    return messages.reduce((total, msg) => {
      return total + (msg.content?.length || 0) / 4; // Rough estimation
    }, 0);
  }

  /**
   * Calculate cost based on usage and model
   */
  calculateCost(usage, modelInfo) {
    if (!usage || !modelInfo.cost) {
      return 0;
    }
    const tokens = usage.total_tokens || 0;
    return (tokens / 1000) * modelInfo.cost;
  }

  /**
   * Convert messages to OpenRouter format
   */
  convertMessagesToOpenRouter(messages) {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Generate travel recommendations
   */
  async generateTravelRecommendations(preferences) {
    const messages = [
      {
        role: 'system',
        content:
          'You are Maya, a professional travel agent. Provide detailed, personalized travel recommendations based on user preferences.',
      },
      {
        role: 'user',
        content: `Generate travel recommendations based on these preferences: ${JSON.stringify(preferences)}`,
      },
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.8,
      maxTokens: 2000,
      budget: 'free', // Use free model for recommendations
    });
  }

  /**
   * Analyze travel data
   */
  async analyzeTravelData(data, analysisType = 'general') {
    const messages = [
      {
        role: 'system',
        content:
          'You are a travel data analyst. Analyze the provided data and provide insights, trends, and recommendations.',
      },
      {
        role: 'user',
        content: `Analyze this ${analysisType} travel data: ${JSON.stringify(data)}`,
      },
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.3,
      maxTokens: 3000,
      budget: 'budget', // Use budget model for analysis
    });
  }

  /**
   * Generate revenue insights
   */
  async generateRevenueInsights(revenueData) {
    const messages = [
      {
        role: 'system',
        content:
          'You are a revenue analysis expert for travel agencies. Analyze revenue data and provide actionable insights and opportunities.',
      },
      {
        role: 'user',
        content: `Analyze this revenue data and provide insights: ${JSON.stringify(revenueData)}`,
      },
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.2,
      maxTokens: 2500,
      budget: 'budget', // Use budget model for revenue analysis
    });
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const messages = [
        {
          role: 'user',
          content: 'Hello, are you working?',
        },
      ];

      const response = await this.chatCompletion(messages, {
        maxTokens: 10,
        temperature: 0.1,
        budget: 'free',
      });

      return {
        status: 'healthy',
        model: response.model,
        cost: response.cost,
        provider: response.provider,
        message: 'OpenRouter API is working correctly',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get available models with pricing
   */
  getAvailableModels() {
    return Object.entries(this.models).map(([id, info]) => ({
      id,
      ...info,
      pricing: info.cost === 0 ? 'Free' : `$${info.cost} per 1K tokens`,
    }));
  }

  /**
   * Generate chat response
   */
  async generateChatResponse(message, history = []) {
    const messages = [
      {
        role: 'system',
        content:
          'You are Maya, a professional travel agent. Provide helpful, accurate, and engaging travel advice and assistance.',
      },
      ...history.slice(-5), // Limit history
      {
        role: 'user',
        content: message,
      },
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 1000,
      budget: 'free', // Use free model for chat
    });
  }

  /**
   * Get model information
   */
  getModelInfo(modelId) {
    return this.models[modelId] || null;
  }

  /**
   * List models by budget tier
   */
  getModelsByBudget(budget) {
    const budgetModels = {
      free: Object.entries(this.models).filter(([_, info]) => info.cost === 0),
      budget: Object.entries(this.models).filter(([_, info]) => info.cost > 0 && info.cost < 0.001),
      premium: Object.entries(this.models).filter(([_, info]) => info.cost >= 0.001),
    };

    return budgetModels[budget] || [];
  }
}

module.exports = OpenRouterClient;
