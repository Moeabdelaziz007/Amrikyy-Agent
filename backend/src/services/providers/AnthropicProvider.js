/**
 * Anthropic Provider - Claude API Integration
 * Handles communication with Anthropic's Claude LLM API
 */

const winston = require('winston');

class AnthropicProvider {
  constructor(config = {}) {
    this.providerId = 'anthropic-provider';
    this.version = '1.0.0';
    this.status = 'initializing';
    
    // Configuration
    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'claude-3-haiku-20240307',
      timeout: config.timeout || 30000,
      maxTokens: config.maxTokens || 2000,
      temperature: config.temperature || 0.7,
      topP: config.topP || 0.9,
      ...config
    };

    // Validate configuration
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    // Initialize logger
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'anthropic-provider' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    // API endpoints
    this.baseUrl = 'https://api.anthropic.com/v1';
    this.messagesUrl = `${this.baseUrl}/messages`;

    // Metrics
    this.metrics = {
      requests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageResponseTime: 0
    };

    this.status = 'ready';
    this.logger.info('✅ Anthropic Provider initialized', {
      model: this.config.model,
      timeout: this.config.timeout
    });
  }

  /**
   * Generate response using Claude API
   */
  async generateResponse(prompt, options = {}) {
    const requestId = `anthropic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    this.metrics.requests++;

    this.logger.info('🧠 Generating Claude response', {
      requestId,
      promptLength: prompt.length,
      model: this.config.model
    });

    try {
      // Prepare request payload
      const payload = {
        model: options.model || this.config.model,
        max_tokens: options.maxTokens || this.config.maxTokens,
        temperature: options.temperature || this.config.temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      };

      // Make API request
      const response = await this.makeRequest(this.messagesUrl, payload, requestId);
      
      // Process response
      const result = this.processResponse(response, requestId);
      
      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, true, result.tokenCount, result.cost);
      
      this.logger.info('✅ Claude response generated successfully', {
        requestId,
        responseTime,
        responseLength: result.response.length,
        tokenCount: result.tokenCount,
        cost: result.cost
      });

      return result.response;

    } catch (error) {
      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, false, 0, 0);
      
      this.logger.error('❌ Claude request failed', {
        requestId,
        error: error.message,
        responseTime
      });

      throw error;
    }
  }

  /**
   * Make HTTP request to Anthropic API
   */
  async makeRequest(url, payload, requestId) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      return await response.json();

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Anthropic API request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Process Anthropic API response
   */
  processResponse(response, requestId) {
    try {
      // Check if response has content
      if (!response.content || response.content.length === 0) {
        throw new Error('No content in Anthropic response');
      }

      const content = response.content[0];
      
      // Check if content has text
      if (!content.text) {
        throw new Error('No text content in Anthropic response');
      }

      // Extract text response
      const responseText = content.text;

      // Extract token usage and calculate cost
      const inputTokens = response.usage?.input_tokens || 0;
      const outputTokens = response.usage?.output_tokens || 0;
      const totalTokens = inputTokens + outputTokens;
      
      // Cost calculation (Claude 3 Haiku pricing: $0.25/1M input, $1.25/1M output)
      const inputCost = (inputTokens / 1000000) * 0.25;
      const outputCost = (outputTokens / 1000000) * 1.25;
      const totalCost = inputCost + outputCost;

      return {
        response: responseText,
        tokenCount: totalTokens,
        inputTokens,
        outputTokens,
        cost: totalCost,
        stopReason: response.stop_reason,
        model: response.model
      };

    } catch (error) {
      this.logger.error('❌ Failed to process Anthropic response', {
        requestId,
        error: error.message,
        response: JSON.stringify(response, null, 2)
      });
      throw error;
    }
  }

  /**
   * Update metrics
   */
  updateMetrics(responseTime, success, tokenCount, cost) {
    if (success) {
      this.metrics.successfulRequests++;
      this.metrics.totalTokens += tokenCount;
      this.metrics.totalCost += cost;
    } else {
      this.metrics.failedRequests++;
    }

    // Update average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.requests - 1) + responseTime) / 
      this.metrics.requests;
  }

  /**
   * Get provider health and metrics
   */
  getHealth() {
    return {
      provider: 'anthropic',
      status: this.status,
      version: this.version,
      model: this.config.model,
      metrics: {
        ...this.metrics,
        successRate: this.metrics.requests > 0 ? 
          (this.metrics.successfulRequests / this.metrics.requests * 100).toFixed(2) + '%' : '0%',
        averageCostPerRequest: this.metrics.successfulRequests > 0 ? 
          (this.metrics.totalCost / this.metrics.successfulRequests).toFixed(6) : '0'
      }
    };
  }

  /**
   * Test provider connectivity
   */
  async testConnection() {
    try {
      const testPrompt = 'Hello, this is a test. Please respond with "Claude test successful".';
      const response = await this.generateResponse(testPrompt);
      
      return {
        status: 'success',
        response: response.substring(0, 100) + '...',
        provider: 'anthropic'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        provider: 'anthropic'
      };
    }
  }

  /**
   * Get remaining credit estimate (based on usage tracking)
   */
  getRemainingCredit() {
    // Starting with $5 credit
    const initialCredit = 5.0;
    const remaining = Math.max(0, initialCredit - this.metrics.totalCost);
    
    return {
      initialCredit,
      totalSpent: this.metrics.totalCost,
      remainingCredit: remaining,
      remainingPercentage: (remaining / initialCredit * 100).toFixed(2) + '%'
    };
  }

  /**
   * Shutdown provider
   */
  async shutdown() {
    this.logger.info('🛑 Shutting down Anthropic Provider...');
    this.status = 'stopped';
    this.logger.info('✅ Anthropic Provider shut down successfully');
  }
}

module.exports = AnthropicProvider;