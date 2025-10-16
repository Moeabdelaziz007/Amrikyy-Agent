/**
 * Z.ai Provider - Z.ai GLM-4.6 API Integration
 * Handles communication with Z.ai's GLM-4.6 LLM API
 */

const winston = require('winston');

class ZaiProvider {
  constructor(config = {}) {
    this.providerId = 'zai-provider';
    this.version = '1.0.0';
    this.status = 'initializing';
    
    // Configuration
    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'GLM-4.6',
      timeout: config.timeout || 30000,
      maxTokens: config.maxTokens || 2000,
      temperature: config.temperature || 0.7,
      topP: config.topP || 0.9,
      ...config
    };

    // Validate configuration
    if (!this.config.apiKey) {
      throw new Error('Z.ai API key is required');
    }

    // Initialize logger
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'zai-provider' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    // API endpoints (Z.ai typically uses OpenAI-compatible format)
    this.baseUrl = 'https://open.bigmodel.cn/api/paas/v4';
    this.chatUrl = `${this.baseUrl}/chat/completions`;

    // Metrics
    this.metrics = {
      requests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokens: 0,
      averageResponseTime: 0
    };

    this.status = 'ready';
    this.logger.info('✅ Z.ai Provider initialized', {
      model: this.config.model,
      timeout: this.config.timeout
    });
  }

  /**
   * Generate response using Z.ai API
   */
  async generateResponse(prompt, options = {}) {
    const requestId = `zai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    this.metrics.requests++;

    this.logger.info('🧠 Generating Z.ai response', {
      requestId,
      promptLength: prompt.length,
      model: this.config.model
    });

    try {
      // Prepare request payload (OpenAI-compatible format)
      const payload = {
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || this.config.temperature,
        top_p: options.topP || this.config.topP,
        max_tokens: options.maxTokens || this.config.maxTokens,
        stream: false
      };

      // Make API request
      const response = await this.makeRequest(this.chatUrl, payload, requestId);
      
      // Process response
      const result = this.processResponse(response, requestId);
      
      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, true, result.tokenCount);
      
      this.logger.info('✅ Z.ai response generated successfully', {
        requestId,
        responseTime,
        responseLength: result.response.length,
        tokenCount: result.tokenCount
      });

      return result.response;

    } catch (error) {
      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, false, 0);
      
      this.logger.error('❌ Z.ai request failed', {
        requestId,
        error: error.message,
        responseTime
      });

      throw error;
    }
  }

  /**
   * Make HTTP request to Z.ai API
   */
  async makeRequest(url, payload, requestId) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Z.ai API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      return await response.json();

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Z.ai API request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Process Z.ai API response
   */
  processResponse(response, requestId) {
    try {
      // Check if response has choices
      if (!response.choices || response.choices.length === 0) {
        throw new Error('No choices in Z.ai response');
      }

      const choice = response.choices[0];
      
      // Check if choice has message
      if (!choice.message || !choice.message.content) {
        throw new Error('No message content in Z.ai response');
      }

      // Extract text response
      const responseText = choice.message.content;

      // Extract token usage
      const tokenCount = response.usage ? 
        (response.usage.prompt_tokens || 0) + (response.usage.completion_tokens || 0) : 0;

      return {
        response: responseText,
        tokenCount,
        finishReason: choice.finish_reason,
        model: response.model
      };

    } catch (error) {
      this.logger.error('❌ Failed to process Z.ai response', {
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
  updateMetrics(responseTime, success, tokenCount) {
    if (success) {
      this.metrics.successfulRequests++;
      this.metrics.totalTokens += tokenCount;
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
      provider: 'zai',
      status: this.status,
      version: this.version,
      model: this.config.model,
      metrics: {
        ...this.metrics,
        successRate: this.metrics.requests > 0 ? 
          (this.metrics.successfulRequests / this.metrics.requests * 100).toFixed(2) + '%' : '0%'
      }
    };
  }

  /**
   * Test provider connectivity
   */
  async testConnection() {
    try {
      const testPrompt = 'Hello, this is a test. Please respond with "Z.ai test successful".';
      const response = await this.generateResponse(testPrompt);
      
      return {
        status: 'success',
        response: response.substring(0, 100) + '...',
        provider: 'zai'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        provider: 'zai'
      };
    }
  }

  /**
   * Shutdown provider
   */
  async shutdown() {
    this.logger.info('🛑 Shutting down Z.ai Provider...');
    this.status = 'stopped';
    this.logger.info('✅ Z.ai Provider shut down successfully');
  }
}

module.exports = ZaiProvider;
