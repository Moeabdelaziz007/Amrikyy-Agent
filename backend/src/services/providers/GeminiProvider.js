/**
 * Gemini Provider - Google Gemini API Integration
 * Handles communication with Google's Gemini LLM API
 */

const winston = require('winston');

class GeminiProvider {
  constructor(config = {}) {
    this.providerId = 'gemini-provider';
    this.version = '1.0.0';
    this.status = 'initializing';
    
    // Configuration
    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'gemini-1.5-flash',
      timeout: config.timeout || 30000,
      maxTokens: config.maxTokens || 2000,
      temperature: config.temperature || 0.7,
      topP: config.topP || 0.9,
      topK: config.topK || 40,
      ...config
    };

    // Validate configuration
    if (!this.config.apiKey) {
      throw new Error('Gemini API key is required');
    }

    // Initialize logger
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'gemini-provider' },
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
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.generateUrl = `${this.baseUrl}/models/${this.config.model}:generateContent`;

    // Metrics
    this.metrics = {
      requests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokens: 0,
      averageResponseTime: 0
    };

    this.status = 'ready';
    this.logger.info('✅ Gemini Provider initialized', {
      model: this.config.model,
      timeout: this.config.timeout
    });
  }

  /**
   * Generate response using Gemini API
   */
  async generateResponse(prompt, options = {}) {
    const requestId = `gemini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    this.metrics.requests++;

    this.logger.info('🧠 Generating Gemini response', {
      requestId,
      promptLength: prompt.length,
      model: this.config.model
    });

    try {
      // Prepare request payload
      const payload = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: options.temperature || this.config.temperature,
          topP: options.topP || this.config.topP,
          topK: options.topK || this.config.topK,
          maxOutputTokens: options.maxTokens || this.config.maxTokens,
          stopSequences: options.stopSequences || []
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      // Make API request
      const response = await this.makeRequest(this.generateUrl, payload, requestId);
      
      // Process response
      const result = this.processResponse(response, requestId);
      
      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, true, result.tokenCount);
      
      this.logger.info('✅ Gemini response generated successfully', {
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
      
      this.logger.error('❌ Gemini request failed', {
        requestId,
        error: error.message,
        responseTime
      });

      throw error;
    }
  }

  /**
   * Make HTTP request to Gemini API
   */
  async makeRequest(url, payload, requestId) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.config.apiKey
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      return await response.json();

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Gemini API request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Process Gemini API response
   */
  processResponse(response, requestId) {
    try {
      // Check if response has candidates
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No candidates in Gemini response');
      }

      const candidate = response.candidates[0];
      
      // Check if candidate has content
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('No content in Gemini response candidate');
      }

      // Extract text response
      const textPart = candidate.content.parts.find(part => part.text);
      if (!textPart) {
        throw new Error('No text content in Gemini response');
      }

      // Extract token usage
      const tokenCount = response.usageMetadata ? 
        (response.usageMetadata.promptTokenCount || 0) + (response.usageMetadata.candidatesTokenCount || 0) : 0;

      return {
        response: textPart.text,
        tokenCount,
        finishReason: candidate.finishReason,
        safetyRatings: candidate.safetyRatings || []
      };

    } catch (error) {
      this.logger.error('❌ Failed to process Gemini response', {
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
      provider: 'gemini',
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
      const testPrompt = 'Hello, this is a test. Please respond with "Gemini test successful".';
      const response = await this.generateResponse(testPrompt);
      
      return {
        status: 'success',
        response: response.substring(0, 100) + '...',
        provider: 'gemini'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        provider: 'gemini'
      };
    }
  }

  /**
   * Shutdown provider
   */
  async shutdown() {
    this.logger.info('🛑 Shutting down Gemini Provider...');
    this.status = 'stopped';
    this.logger.info('✅ Gemini Provider shut down successfully');
  }
}

module.exports = GeminiProvider;
