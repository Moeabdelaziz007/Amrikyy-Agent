/**
 * Quantum Edge Layer - Advanced AI Agent Management System
 * Implements Bottleneck rate limiting, adaptive capability selection, and circuit breakers
 */

const Bottleneck = require('bottleneck');
const { z } = require('zod');
const EventEmitter = require('events');
const winston = require('winston');

class QuantumEdgeLayer extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      maxConcurrent: config.maxConcurrent || 5,
      minTime: config.minTime || 100,
      highWater: config.highWater || 100,
      strategy: config.strategy || Bottleneck.strategy.LEAK,
      ...config
    };

    // Advanced rate limiting with Bottleneck
    this.limiter = new Bottleneck({
      maxConcurrent: this.config.maxConcurrent,
      minTime: this.config.minTime,
      highWater: this.config.highWater,
      strategy: this.config.strategy,
      trackDoneStatus: true
    });

    // Circuit breaker states for each agent
    this.circuitBreakers = new Map();
    this.agentFailureCounts = new Map();
    this.agentSuccessCounts = new Map();

    // Adaptive capability scoring
    this.capabilityEmbeddings = new Map();
    this.capabilityScores = new Map();

    // Performance tracking
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      circuitBreakerTrips: 0,
      averageResponseTime: 0,
      adaptiveScoreUpdates: 0
    };

    // Logger setup
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'backend/logs/quantum-edge.log' }),
        new winston.transports.Console()
      ]
    });

    // Validation schemas
    this.setupValidationSchemas();

    // Initialize event listeners
    this.setupEventListeners();

    this.logger.info('🚀 Quantum Edge Layer initialized', { config: this.config });
  }

  /**
   * Setup validation schemas using Zod
   */
  setupValidationSchemas() {
    this.taskSchema = z.object({
      taskType: z.string().min(1).max(100),
      payload: z.any(),
      requestId: z.string().uuid(),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
      timeout: z.number().min(1000).max(300000).default(30000),
      retries: z.number().min(0).max(5).default(3)
    });

    this.agentSchema = z.object({
      id: z.string().min(1).max(50),
      name: z.string().min(1).max(100),
      capabilities: z.array(z.string()).min(1),
      handler: z.function(),
      maxConcurrency: z.number().min(1).max(10).default(1),
      circuitBreakerThreshold: z.number().min(1).max(10).default(3),
      circuitBreakerTimeout: z.number().min(1000).max(60000).default(30000)
    });

    this.capabilitySchema = z.object({
      capability: z.string().min(1).max(100),
      embedding: z.array(z.number()).length(1536), // OpenAI embedding size
      synonyms: z.array(z.string()).default([]),
      weight: z.number().min(0).max(1).default(1)
    });
  }

  /**
   * Setup event listeners for monitoring
   */
  setupEventListeners() {
    this.limiter.on('error', (error) => {
      this.logger.error('Bottleneck error:', error);
      this.emit('limiter_error', error);
    });

    this.limiter.on('failed', (error, jobInfo) => {
      this.logger.warn('Job failed in queue:', { error: error.message, jobInfo });
      this.performanceMetrics.failedRequests++;
      this.emit('job_failed', { error, jobInfo });
    });

    this.limiter.on('done', (result, jobInfo) => {
      this.logger.debug('Job completed successfully:', { jobInfo });
      this.performanceMetrics.successfulRequests++;
      this.emit('job_completed', { result, jobInfo });
    });

    this.limiter.on('depleted', () => {
      this.logger.info('Rate limiter queue depleted');
      this.emit('queue_depleted');
    });

    this.limiter.on('dropped', (dropped) => {
      this.logger.warn('Job dropped due to queue limits:', dropped);
      this.emit('job_dropped', dropped);
    });
  }

  /**
   * Register agent with circuit breaker
   */
  registerAgent(agentData) {
    const validatedAgent = this.agentSchema.parse(agentData);
    
    // Initialize circuit breaker for agent
    this.circuitBreakers.set(validatedAgent.id, {
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      failureCount: 0,
      successCount: 0,
      lastFailureTime: null,
      threshold: validatedAgent.circuitBreakerThreshold,
      timeout: validatedAgent.circuitBreakerTimeout
    });

    // Initialize failure tracking
    this.agentFailureCounts.set(validatedAgent.id, 0);
    this.agentSuccessCounts.set(validatedAgent.id, 0);

    this.logger.info('Agent registered with circuit breaker', { 
      agentId: validatedAgent.id,
      threshold: validatedAgent.circuitBreakerThreshold 
    });

    return validatedAgent;
  }

  /**
   * Execute task with advanced rate limiting and circuit breaker
   */
  async executeTask(agentId, task, options = {}) {
    const startTime = Date.now();
    
    // Validate task
    const validatedTask = this.taskSchema.parse({
      ...task,
      requestId: task.requestId || this.generateUUID()
    });

    // Check circuit breaker
    if (!this.isCircuitBreakerOpen(agentId)) {
      this.logger.warn('Circuit breaker is OPEN for agent', { agentId });
      throw new Error(`Circuit breaker is OPEN for agent ${agentId}`);
    }

    try {
      // Execute with rate limiting
      const result = await this.limiter.schedule(async () => {
        return await this.executeWithRetry(agentId, validatedTask, options);
      }, {
        priority: this.getPriorityValue(validatedTask.priority),
        id: validatedTask.requestId
      });

      // Update success metrics
      this.updateAgentSuccess(agentId);
      this.updatePerformanceMetrics(startTime, true);

      return result;

    } catch (error) {
      // Update failure metrics
      this.updateAgentFailure(agentId);
      this.updatePerformanceMetrics(startTime, false);

      this.logger.error('Task execution failed', { 
        agentId, 
        requestId: validatedTask.requestId,
        error: error.message 
      });

      throw error;
    }
  }

  /**
   * Execute task with retry logic
   */
  async executeWithRetry(agentId, task, options) {
    const maxRetries = task.retries || 3;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const agent = this.getAgent(agentId);
        if (!agent) {
          throw new Error(`Agent ${agentId} not found`);
        }

        // Execute with timeout
        const result = await this.executeWithTimeout(
          agent.handler(task.payload, task.requestId),
          task.timeout
        );

        if (attempt > 0) {
          this.logger.info('Task succeeded after retry', { 
            agentId, 
            requestId: task.requestId,
            attempt 
          });
        }

        return result;

      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          const delay = this.calculateBackoffDelay(attempt);
          this.logger.warn('Task failed, retrying', { 
            agentId, 
            requestId: task.requestId,
            attempt: attempt + 1,
            delay,
            error: error.message 
          });
          
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Execute with timeout using Promise.race
   */
  async executeWithTimeout(promise, timeout) {
    const timeoutPromise = new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Task timeout after ${timeout}ms`));
      }, timeout);

      promise.finally(() => clearTimeout(timeoutId));
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Check if circuit breaker is open
   */
  isCircuitBreakerOpen(agentId) {
    const breaker = this.circuitBreakers.get(agentId);
    if (!breaker) return true;

    if (breaker.state === 'CLOSED') return true;
    
    if (breaker.state === 'OPEN') {
      // Check if timeout has passed
      if (Date.now() - breaker.lastFailureTime > breaker.timeout) {
        breaker.state = 'HALF_OPEN';
        this.logger.info('Circuit breaker moving to HALF_OPEN', { agentId });
        return true;
      }
      return false;
    }

    if (breaker.state === 'HALF_OPEN') return true;

    return true;
  }

  /**
   * Update agent success metrics
   */
  updateAgentSuccess(agentId) {
    const breaker = this.circuitBreakers.get(agentId);
    if (breaker) {
      breaker.successCount++;
      breaker.failureCount = 0;
      
      if (breaker.state === 'HALF_OPEN') {
        breaker.state = 'CLOSED';
        this.logger.info('Circuit breaker CLOSED after successful execution', { agentId });
      }
    }

    const currentCount = this.agentSuccessCounts.get(agentId) || 0;
    this.agentSuccessCounts.set(agentId, currentCount + 1);
  }

  /**
   * Update agent failure metrics
   */
  updateAgentFailure(agentId) {
    const breaker = this.circuitBreakers.get(agentId);
    if (breaker) {
      breaker.failureCount++;
      breaker.successCount = 0;
      breaker.lastFailureTime = Date.now();

      if (breaker.failureCount >= breaker.threshold) {
        breaker.state = 'OPEN';
        this.performanceMetrics.circuitBreakerTrips++;
        this.logger.warn('Circuit breaker OPEN due to failures', { 
          agentId, 
          failureCount: breaker.failureCount,
          threshold: breaker.threshold 
        });
        this.emit('circuit_breaker_opened', { agentId, failureCount: breaker.failureCount });
      }
    }

    const currentCount = this.agentFailureCounts.get(agentId) || 0;
    this.agentFailureCounts.set(agentId, currentCount + 1);
  }

  /**
   * Adaptive capability scoring using embeddings
   */
  async calculateCapabilityScore(requiredCapability, agentCapabilities) {
    // Check if we have cached embedding for this capability
    if (this.capabilityEmbeddings.has(requiredCapability)) {
      const embedding = this.capabilityEmbeddings.get(requiredCapability);
      return this.calculateSimilarityScores(embedding, agentCapabilities);
    }

    // For now, use simple keyword matching with weights
    // In production, this would call OpenAI/Gemini embeddings API
    const scores = agentCapabilities.map(capability => {
      return this.calculateKeywordSimilarity(requiredCapability, capability);
    });

    this.performanceMetrics.adaptiveScoreUpdates++;
    return Math.max(...scores);
  }

  /**
   * Calculate keyword similarity (fallback when embeddings not available)
   */
  calculateKeywordSimilarity(required, available) {
    const requiredWords = required.toLowerCase().split(/[\s_-]+/);
    const availableWords = available.toLowerCase().split(/[\s_-]+/);
    
    let matches = 0;
    for (const word of requiredWords) {
      if (availableWords.includes(word)) {
        matches++;
      }
    }

    return matches / Math.max(requiredWords.length, availableWords.length);
  }

  /**
   * Calculate similarity scores using embeddings
   */
  calculateSimilarityScores(embedding, capabilities) {
    // Simplified cosine similarity calculation
    // In production, use proper vector math libraries
    return capabilities.map(capability => {
      const capabilityEmbedding = this.capabilityEmbeddings.get(capability);
      if (!capabilityEmbedding) return 0;
      
      return this.cosineSimilarity(embedding, capabilityEmbedding);
    });
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(startTime, success) {
    this.performanceMetrics.totalRequests++;
    
    const responseTime = Date.now() - startTime;
    this.performanceMetrics.averageResponseTime = 
      ((this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalRequests - 1)) + responseTime) 
      / this.performanceMetrics.totalRequests;

    if (!success) {
      this.performanceMetrics.failedRequests++;
    } else {
      this.performanceMetrics.successfulRequests++;
    }
  }

  /**
   * Get priority value for Bottleneck
   */
  getPriorityValue(priority) {
    const priorityMap = {
      'urgent': 5,
      'high': 4,
      'normal': 3,
      'low': 2
    };
    return priorityMap[priority] || 3;
  }

  /**
   * Calculate exponential backoff delay
   */
  calculateBackoffDelay(attempt) {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = baseDelay * Math.pow(2, attempt);
    return Math.min(delay, maxDelay);
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Get agent (placeholder - would be injected from manager)
   */
  getAgent(agentId) {
    // This would be injected from the CursorManagerAgent
    return null;
  }

  /**
   * Get comprehensive metrics
   */
  getMetrics() {
    return {
      ...this.performanceMetrics,
      circuitBreakers: Object.fromEntries(this.circuitBreakers),
      agentFailures: Object.fromEntries(this.agentFailureCounts),
      agentSuccesses: Object.fromEntries(this.agentSuccessCounts),
      limiterStats: {
        queued: this.limiter.queued(),
        running: this.limiter.running(),
        done: this.limiter.done()
      }
    };
  }

  /**
   * Health check
   */
  getHealthStatus() {
    const metrics = this.getMetrics();
    const successRate = metrics.totalRequests > 0 ? 
      (metrics.successfulRequests / metrics.totalRequests) * 100 : 100;

    return {
      status: successRate > 90 ? 'healthy' : successRate > 70 ? 'degraded' : 'unhealthy',
      successRate: Math.round(successRate * 100) / 100,
      circuitBreakersOpen: Object.values(metrics.circuitBreakers).filter(cb => cb.state === 'OPEN').length,
      averageResponseTime: Math.round(metrics.averageResponseTime),
      queueSize: metrics.limiterStats.queued
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    this.logger.info('Shutting down Quantum Edge Layer...');
    
    try {
      // Stop accepting new jobs
      this.limiter.stop();
      
      // Wait for running jobs to complete
      await this.limiter.disconnect();
      
      this.logger.info('Quantum Edge Layer shut down successfully');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      throw error;
    }
  }
}

module.exports = QuantumEdgeLayer;
