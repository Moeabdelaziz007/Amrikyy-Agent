/**
 * LLM Service - Unified Language Model Integration
 * Provides abstraction layer for multiple LLM providers with fallback support
 * Supports Gemini, Z.ai, OpenAI with automatic failover
 */

const winston = require('winston');
const GeminiProvider = require('./providers/GeminiProvider');
const ZaiProvider = require('./providers/ZaiProvider');
const AnthropicProvider = require('./providers/AnthropicProvider');

class LLMService {
  constructor(config = {}) {
    this.serviceId = 'llm-service';
    this.version = '1.0.0';
    this.status = 'initializing';
    
    // Configuration
    this.config = {
      primaryProvider: config.primaryProvider || 'gemini',
      fallbackProviders: config.fallbackProviders || ['zai', 'openai'],
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      timeout: config.timeout || 30000,
      rateLimitDelay: config.rateLimitDelay || 2000,
      ...config
    };

    // Initialize logger
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'llm-service' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    // Initialize providers
    this.providers = new Map();
    this.initializeProviders();

    // Metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      providerUsage: new Map(),
      averageResponseTime: 0,
      lastRequestTime: null
    };

    this.status = 'ready';
    this.logger.info('✅ LLM Service initialized', {
      primaryProvider: this.config.primaryProvider,
      fallbackProviders: this.config.fallbackProviders,
      availableProviders: Array.from(this.providers.keys())
    });
  }

  /**
   * Initialize all LLM providers
   */
  initializeProviders() {
    try {
      // Initialize Gemini Provider
      if (process.env.GEMINI_API_KEY) {
        this.providers.set('gemini', new GeminiProvider({
          apiKey: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
          timeout: this.config.timeout
        }));
        this.logger.info('✅ Gemini provider initialized');
      }

      // Initialize Z.ai Provider
      if (process.env.ZAI_API_KEY) {
        this.providers.set('zai', new ZaiProvider({
          apiKey: process.env.ZAI_API_KEY,
          model: process.env.ZAI_MODEL || 'GLM-4.6',
          timeout: this.config.timeout
        }));
        this.logger.info('✅ Z.ai provider initialized');
      }

      // Initialize Anthropic Provider
      if (process.env.ANTHROPIC_API_KEY) {
        this.providers.set('anthropic', new AnthropicProvider({
          apiKey: process.env.ANTHROPIC_API_KEY,
          model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
          timeout: this.config.timeout
        }));
        this.logger.info('✅ Anthropic provider initialized');
      }

      // Check if at least one provider is available
      if (this.providers.size === 0) {
        throw new Error('No LLM providers configured. Please set API keys in environment variables.');
      }

    } catch (error) {
      this.logger.error('❌ Failed to initialize LLM providers:', error);
      throw error;
    }
  }

  /**
   * Generate response using LLM with fallback support
   */
  async generateResponse(prompt, agentPersona = null, tools = [], options = {}) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    this.metrics.totalRequests++;
    this.metrics.lastRequestTime = new Date().toISOString();

    this.logger.info('🧠 Generating LLM response', {
      requestId,
      promptLength: prompt.length,
      agentPersona: agentPersona?.name || 'unknown',
      toolsCount: tools.length,
      options
    });

    // Build complete prompt with agent persona
    const completePrompt = this.buildCompletePrompt(prompt, agentPersona, tools, options);

    // Try providers in order: primary -> fallback
    const providersToTry = [this.config.primaryProvider, ...this.config.fallbackProviders];
    
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      for (const providerName of providersToTry) {
        const provider = this.providers.get(providerName);
        
        if (!provider) {
          this.logger.warn(`⚠️ Provider ${providerName} not available, skipping`);
          continue;
        }

        try {
          this.logger.info(`🔄 Trying provider: ${providerName} (attempt ${attempt + 1})`);
          
          const response = await provider.generateResponse(completePrompt, options);
          
          // Update metrics
          const responseTime = Date.now() - startTime;
          this.updateMetrics(providerName, responseTime, true);
          
          this.logger.info('✅ LLM response generated successfully', {
            requestId,
            provider: providerName,
            responseTime,
            responseLength: response.length
          });

          return {
            success: true,
            response,
            provider: providerName,
            responseTime,
            requestId
          };

        } catch (error) {
          this.logger.warn(`⚠️ Provider ${providerName} failed:`, {
            error: error.message,
            attempt: attempt + 1
          });

          // If rate limited, wait before trying next provider
          if (error.message.includes('rate limit') || error.message.includes('429')) {
            await this.delay(this.config.rateLimitDelay);
          }

          // Update metrics for failed request
          const responseTime = Date.now() - startTime;
          this.updateMetrics(providerName, responseTime, false);
        }
      }

      // Wait before retry
      if (attempt < this.config.maxRetries - 1) {
        await this.delay(this.config.retryDelay * (attempt + 1));
      }
    }

    // All providers failed
    this.metrics.failedRequests++;
    const responseTime = Date.now() - startTime;
    
    this.logger.error('❌ All LLM providers failed', {
      requestId,
      responseTime,
      attempts: this.config.maxRetries
    });

    return {
      success: false,
      error: 'All LLM providers failed',
      responseTime,
      requestId
    };
  }

  /**
   * Build complete prompt with agent persona and context
   */
  buildCompletePrompt(prompt, agentPersona, tools, options) {
    let completePrompt = '';

    // Add agent persona if provided
    if (agentPersona) {
      completePrompt += `You are ${agentPersona.name}, ${agentPersona.role}.\n`;
      completePrompt += `Personality: ${agentPersona.personality}\n`;
      completePrompt += `Communication Style: ${agentPersona.communication_style}\n`;
      completePrompt += `Background: ${agentPersona.background}\n`;
      completePrompt += `Expertise: ${agentPersona.expertise}\n`;
      completePrompt += `Motivation: ${agentPersona.motivation}\n\n`;
    }

    // Add system instructions
    completePrompt += 'Instructions:\n';
    completePrompt += '- Provide helpful, accurate, and contextual responses\n';
    completePrompt += '- Use your expertise to give detailed, actionable advice\n';
    completePrompt += '- Maintain your personality and communication style\n';
    
    if (tools && tools.length > 0) {
      completePrompt += '- You have access to tools, use them when appropriate\n';
      completePrompt += `- Available tools: ${tools.map(t => t.name).join(', ')}\n`;
    }
    
    completePrompt += '\n';

    // Add the actual user prompt
    completePrompt += `User Request: ${prompt}\n\n`;
    completePrompt += 'Response:';

    return completePrompt;
  }

  /**
   * Update metrics
   */
  updateMetrics(providerName, responseTime, success) {
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Update provider usage
    const currentUsage = this.metrics.providerUsage.get(providerName) || { requests: 0, totalTime: 0 };
    currentUsage.requests++;
    currentUsage.totalTime += responseTime;
    this.metrics.providerUsage.set(providerName, currentUsage);

    // Update average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) / 
      this.metrics.totalRequests;
  }

  /**
   * Get service health and metrics
   */
  getHealth() {
    return {
      status: this.status,
      version: this.version,
      availableProviders: Array.from(this.providers.keys()),
      primaryProvider: this.config.primaryProvider,
      metrics: {
        ...this.metrics,
        providerUsage: Object.fromEntries(this.metrics.providerUsage),
        successRate: this.metrics.totalRequests > 0 ? 
          (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2) + '%' : '0%'
      }
    };
  }

  /**
   * Test all providers
   */
  async testProviders() {
    const testPrompt = 'Hello, this is a test message. Please respond with "Test successful" and your provider name.';
    const results = {};

    for (const [providerName, provider] of this.providers) {
      try {
        this.logger.info(`🧪 Testing provider: ${providerName}`);
        const response = await provider.generateResponse(testPrompt);
        results[providerName] = {
          status: 'success',
          response: response.substring(0, 100) + '...'
        };
      } catch (error) {
        results[providerName] = {
          status: 'error',
          error: error.message
        };
      }
    }

    return results;
  }

  /**
   * Utility: Delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Shutdown service
   */
  async shutdown() {
    this.logger.info('🛑 Shutting down LLM Service...');
    
    // Shutdown all providers
    for (const [providerName, provider] of this.providers) {
      try {
        if (provider.shutdown) {
          await provider.shutdown();
        }
      } catch (error) {
        this.logger.error(`❌ Error shutting down provider ${providerName}:`, error);
      }
    }

    this.status = 'stopped';
    this.logger.info('✅ LLM Service shut down successfully');
  }
}

module.exports = LLMService;
