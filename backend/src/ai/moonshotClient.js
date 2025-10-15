/**
 * Moonshot AI API Client
 * Advanced AI provider for Amrikyy Travel Agent
 * Using Moonshot's powerful models
 */

const fetch = require('node-fetch');

class MoonshotClient {
  constructor() {
    this.apiKey = process.env.MOONSHOT_API_KEY;
    this.baseUrl = process.env.MOONSHOT_BASE_URL || 'https://api.moonshot.cn/v1';
    this.model = process.env.MOONSHOT_MODEL || 'moonshot-v1-8k';
    this.maxTokens = parseInt(process.env.MOONSHOT_MAX_TOKENS) || 4000;
    this.temperature = parseFloat(process.env.MOONSHOT_TEMPERATURE) || 0.7;
    this.topP = parseFloat(process.env.MOONSHOT_TOP_P) || 0.9;
  }

  /**
   * Send chat completion request to Moonshot AI
   */
  async chatCompletion(messages, options = {}) {
    try {
      // Convert messages to Moonshot format
      const formattedMessages = this.convertMessagesToMoonshot(messages);
      
      const requestBody = {
        model: this.model,
        messages: formattedMessages,
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature || this.temperature,
        top_p: options.topP || this.topP,
        stream: false
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'MayaTravelAgent/1.0.0'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Moonshot API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices?.[0]?.message?.content || '',
        usage: data.usage || {},
        model: data.model || this.model,
        finishReason: data.choices?.[0]?.finish_reason || 'stop'
      };

    } catch (error) {
      console.error('Moonshot API Error:', error);
      throw new Error(`Moonshot API Error: ${error.message}`);
    }
  }

  /**
   * Convert messages to Moonshot format
   */
  convertMessagesToMoonshot(messages) {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Generate travel recommendations
   */
  async generateTravelRecommendations(preferences) {
    const messages = [
      {
        role: 'system',
        content: 'You are Maya, a professional travel agent specializing in personalized travel experiences. Provide detailed, helpful travel recommendations based on user preferences.'
      },
      {
        role: 'user',
        content: `Generate travel recommendations based on these preferences: ${JSON.stringify(preferences)}`
      }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.8,
      maxTokens: 2000
    });
  }

  /**
   * Analyze travel data
   */
  async analyzeTravelData(data, analysisType = 'general') {
    const messages = [
      {
        role: 'system',
        content: 'You are a travel data analyst. Analyze the provided data and provide insights, trends, and recommendations.'
      },
      {
        role: 'user',
        content: `Analyze this ${analysisType} travel data: ${JSON.stringify(data)}`
      }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.3,
      maxTokens: 2500
    });
  }

  /**
   * Generate revenue insights
   */
  async generateRevenueInsights(revenueData) {
    const messages = [
      {
        role: 'system',
        content: 'You are a revenue analysis expert for travel agencies. Analyze revenue data and provide actionable insights and opportunities.'
      },
      {
        role: 'user',
        content: `Analyze this revenue data and provide insights: ${JSON.stringify(revenueData)}`
      }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.2,
      maxTokens: 2000
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
          content: 'Hello, are you working?'
        }
      ];

      const response = await this.chatCompletion(messages, {
        maxTokens: 10,
        temperature: 0.1
      });

      return {
        status: 'healthy',
        model: response.model,
        responseTime: Date.now(),
        message: 'Moonshot AI is working correctly'
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
   * Generate chat response
   */
  async generateChatResponse(message, history = []) {
    const messages = [
      {
        role: 'system',
        content: 'You are Maya, a professional travel agent. Provide helpful, accurate, and engaging travel advice and assistance.'
      },
      ...history,
      {
        role: 'user',
        content: message
      }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 1000
    });
  }

  /**
   * Generate streaming response (simulated)
   */
  async generateStreamingResponse(message, history = []) {
    const response = await this.generateChatResponse(message, history);
    
    // Simulate streaming by returning chunks
    const words = response.content.split(' ');
    const chunks = [];
    
    for (let i = 0; i < words.length; i++) {
      chunks.push({
        content: words[i] + ' ',
        index: i,
        total: words.length,
        finished: i === words.length - 1
      });
    }
    
    return chunks;
  }

  /**
   * Get available models
   */
  getAvailableModels() {
    return [
      {
        id: 'moonshot-v1-8k',
        name: 'Moonshot v1 8K',
        description: 'High-performance model with 8K context window',
        maxTokens: 4000,
        contextWindow: 8000
      },
      {
        id: 'moonshot-v1-32k',
        name: 'Moonshot v1 32K',
        description: 'Large context model with 32K context window',
        maxTokens: 8000,
        contextWindow: 32000
      },
      {
        id: 'moonshot-v1-128k',
        name: 'Moonshot v1 128K',
        description: 'Ultra-large context model with 128K context window',
        maxTokens: 16000,
        contextWindow: 128000
      }
    ];
  }
}

module.exports = MoonshotClient;
