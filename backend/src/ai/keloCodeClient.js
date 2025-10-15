/**
 * Kelo Code API Client
 * Optimized for free and budget models
 * Cost-effective AI provider for Amrikyy Travel Agent
 */

const fetch = require('node-fetch');

class KeloCodeClient {
  constructor() {
    this.apiKey = process.env.KELO_CODE_API_KEY;
    this.baseUrl = process.env.KELO_CODE_BASE_URL || 'https://api.kilocode.ai/v1';
    
    // Free and budget model configurations
    this.models = {
      // Free tier models
      free: {
        id: 'kelo-free-v1',
        name: 'Kelo Free v1',
        maxTokens: 1000,
        contextWindow: 2000,
        cost: 0
      },
      // Budget models
      budget: {
        id: 'kelo-budget-v1',
        name: 'Kelo Budget v1', 
        maxTokens: 2000,
        contextWindow: 4000,
        cost: 0.001 // per 1K tokens
      },
      // Standard models
      standard: {
        id: 'kelo-standard-v1',
        name: 'Kelo Standard v1',
        maxTokens: 4000,
        contextWindow: 8000,
        cost: 0.002 // per 1K tokens
      }
    };
    
    // Default to budget model for cost optimization
    this.defaultModel = this.models.budget;
    this.maxTokens = parseInt(process.env.KELO_MAX_TOKENS) || 2000;
    this.temperature = parseFloat(process.env.KELO_TEMPERATURE) || 0.7;
    this.topP = parseFloat(process.env.KELO_TOP_P) || 0.9;
  }

  /**
   * Send chat completion request to Kelo Code
   * Automatically selects best model based on request size
   */
  async chatCompletion(messages, options = {}) {
    try {
      // Select optimal model based on request size
      const model = this.selectOptimalModel(messages, options);
      
      const requestBody = {
        model: model.id,
        messages: this.convertMessagesToKelo(messages),
        max_tokens: Math.min(options.maxTokens || this.maxTokens, model.maxTokens),
        temperature: options.temperature || this.temperature,
        top_p: options.topP || this.topP,
        stream: false,
        // Cost optimization settings
        optimize_for_cost: true,
        use_cache: true
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Kelo-Version': '2024-12',
          'X-Optimization': 'cost-effective'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Kelo Code API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices?.[0]?.message?.content || '',
        usage: data.usage || {},
        model: data.model || model.id,
        finishReason: data.choices?.[0]?.finish_reason || 'stop',
        cost: this.calculateCost(data.usage, model),
        optimization: 'cost-effective'
      };

    } catch (error) {
      console.error('Kelo Code API Error:', error);
      throw new Error(`Kelo Code API Error: ${error.message}`);
    }
  }

  /**
   * Select optimal model based on request size and budget
   */
  selectOptimalModel(messages, options) {
    const totalTokens = this.estimateTokens(messages);
    const maxTokens = options.maxTokens || this.maxTokens;
    
    // For very short requests, use free model
    if (totalTokens < 500 && maxTokens < 1000) {
      return this.models.free;
    }
    
    // For medium requests, use budget model
    if (totalTokens < 2000 && maxTokens < 2000) {
      return this.models.budget;
    }
    
    // For large requests, use standard model
    return this.models.standard;
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
  calculateCost(usage, model) {
    if (!usage || !model.cost) return 0;
    const tokens = usage.total_tokens || 0;
    return (tokens / 1000) * model.cost;
  }

  /**
   * Convert messages to Kelo Code format
   */
  convertMessagesToKelo(messages) {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      // Add metadata for cost optimization
      metadata: {
        priority: msg.role === 'system' ? 'high' : 'normal',
        cache: true
      }
    }));
  }

  /**
   * Generate travel recommendations (optimized for cost)
   */
  async generateTravelRecommendations(preferences) {
    const messages = [
      {
        role: 'system',
        content: 'You are Maya, a travel agent. Provide concise, helpful travel recommendations.'
      },
      {
        role: 'user',
        content: `Travel recommendations for: ${JSON.stringify(preferences)}`
      }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.8,
      maxTokens: 1500 // Use budget model
    });
  }

  /**
   * Analyze data (optimized for cost)
   */
  async analyzeData(data, analysisType = 'general') {
    const messages = [
      {
        role: 'system',
        content: 'You are a data analyst. Provide concise analysis and insights.'
      },
      {
        role: 'user',
        content: `Analyze this ${analysisType} data: ${JSON.stringify(data)}`
      }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.3,
      maxTokens: 2000
    });
  }

  /**
   * Generate revenue insights (cost-optimized)
   */
  async generateRevenueInsights(revenueData) {
    const messages = [
      {
        role: 'system',
        content: 'You are a revenue analyst. Provide actionable insights and opportunities.'
      },
      {
        role: 'user',
        content: `Analyze revenue data: ${JSON.stringify(revenueData)}`
      }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.2,
      maxTokens: 1500
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
          content: 'Hello'
        }
      ];

      const response = await this.chatCompletion(messages, {
        maxTokens: 10,
        temperature: 0.1
      });

      return {
        status: 'healthy',
        model: response.model,
        cost: response.cost,
        optimization: response.optimization,
        message: 'Kelo Code is working correctly'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get available models with pricing
   */
  getAvailableModels() {
    return Object.values(this.models).map(model => ({
      ...model,
      pricing: `$${model.cost} per 1K tokens`,
      recommended_for: this.getRecommendedUse(model.id)
    }));
  }

  /**
   * Get recommended use case for model
   */
  getRecommendedUse(modelId) {
    const recommendations = {
      'kelo-free-v1': 'Simple queries, testing, development',
      'kelo-budget-v1': 'General use, moderate complexity',
      'kelo-standard-v1': 'Complex analysis, large documents'
    };
    return recommendations[modelId] || 'General use';
  }

  /**
   * Generate chat response (cost-optimized)
   */
  async generateChatResponse(message, history = []) {
    const messages = [
      {
        role: 'system',
        content: 'You are Maya, a travel agent. Be helpful and concise.'
      },
      ...history.slice(-5), // Limit history to reduce costs
      {
        role: 'user',
        content: message
      }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 800 // Use budget model
    });
  }

  /**
   * Batch processing for multiple requests (cost optimization)
   */
  async batchProcess(requests) {
    const results = [];
    
    for (const request of requests) {
      try {
        const result = await this.chatCompletion(request.messages, request.options);
        results.push({
          success: true,
          result,
          cost: result.cost
        });
      } catch (error) {
        results.push({
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      results,
      totalCost: results.reduce((sum, r) => sum + (r.cost || 0), 0),
      successCount: results.filter(r => r.success).length
    };
  }
}

module.exports = KeloCodeClient;
