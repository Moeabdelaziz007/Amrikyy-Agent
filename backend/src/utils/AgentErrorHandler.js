/**
 * Agent Error Handler - Advanced error handling for AI agents
 * Implements retry logic, circuit breaker pattern, and error tracking
 *
 * Features:
 * - Exponential backoff retry
 * - Circuit breaker for API failures
 * - Error classification and handling
 * - LangSmith error tracking integration
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-23
 */

const logger = require('./logger');

class AgentErrorHandler {
  constructor(agentName) {
    this.agentName = agentName;

    // Circuit breaker state
    this.circuitBreaker = {
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      failures: 0,
      threshold: 5, // Open circuit after 5 failures
      resetTimeout: 60000, // Reset after 60 seconds
      lastFailure: null,
    };

    // Retry configuration
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 10000, // 10 seconds
      backoffMultiplier: 2,
    };

    // Error statistics
    this.stats = {
      totalErrors: 0,
      retriedErrors: 0,
      recoveredErrors: 0,
      circuitBreakerTrips: 0,
      errorsByType: {},
    };
  }

  /**
   * Execute function with retry and circuit breaker
   */
  async executeWithRetry(fn, context = {}) {
    // Check circuit breaker
    if (this.isCircuitOpen()) {
      throw new Error(`Circuit breaker is OPEN for ${this.agentName}. Too many failures.`);
    }

    let lastError;
    const maxRetries = context.maxRetries || this.retryConfig.maxRetries;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Try to execute the function
        const result = await fn();

        // Success - record recovery if it was a retry
        if (attempt > 0) {
          this.recordSuccess();
          this.stats.recoveredErrors++;
          logger.info(`${this.agentName}: Recovered after ${attempt} retries`);
        }

        return result;
      } catch (error) {
        lastError = error;
        this.stats.totalErrors++;

        // Classify error
        const errorType = this.classifyError(error);
        this.stats.errorsByType[errorType] = (this.stats.errorsByType[errorType] || 0) + 1;

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          logger.error(`${this.agentName}: Non-retryable error:`, error);
          throw error;
        }

        // Last attempt - don't retry
        if (attempt === maxRetries) {
          this.recordFailure();
          logger.error(`${this.agentName}: Max retries (${maxRetries}) exceeded`);
          break;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt);
        this.stats.retriedErrors++;

        logger.warn(
          `${this.agentName}: Attempt ${attempt + 1}/${maxRetries + 1} failed. ` +
            `Retrying in ${delay}ms. Error: ${error.message}`
        );

        await this.sleep(delay);
      }
    }

    // All retries failed
    throw lastError;
  }

  /**
   * Check if circuit breaker is open
   */
  isCircuitOpen() {
    if (this.circuitBreaker.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailure;

      // Try to reset circuit breaker
      if (timeSinceLastFailure >= this.circuitBreaker.resetTimeout) {
        this.circuitBreaker.state = 'HALF_OPEN';
        this.circuitBreaker.failures = 0;
        logger.info(`${this.agentName}: Circuit breaker entering HALF_OPEN state`);
        return false;
      }

      return true;
    }

    return false;
  }

  /**
   * Record successful execution
   */
  recordSuccess() {
    if (this.circuitBreaker.state === 'HALF_OPEN') {
      this.circuitBreaker.state = 'CLOSED';
      this.circuitBreaker.failures = 0;
      logger.info(`${this.agentName}: Circuit breaker reset to CLOSED state`);
    }
  }

  /**
   * Record failed execution
   */
  recordFailure() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();

    if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
      this.circuitBreaker.state = 'OPEN';
      this.stats.circuitBreakerTrips++;
      logger.error(
        `${this.agentName}: Circuit breaker OPENED after ${this.circuitBreaker.failures} failures`
      );
    }
  }

  /**
   * Classify error type
   */
  classifyError(error) {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('rate limit') || message.includes('quota')) {
      return 'RATE_LIMIT';
    }

    if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
      return 'TIMEOUT';
    }

    if (message.includes('network') || message.includes('ECONNREFUSED')) {
      return 'NETWORK';
    }

    if (message.includes('auth') || message.includes('unauthorized')) {
      return 'AUTHENTICATION';
    }

    if (message.includes('invalid') || message.includes('validation')) {
      return 'VALIDATION';
    }

    if (error.status === 500 || error.status === 502 || error.status === 503) {
      return 'SERVER_ERROR';
    }

    if (error.status === 400) {
      return 'BAD_REQUEST';
    }

    return 'UNKNOWN';
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    const errorType = this.classifyError(error);

    // Non-retryable errors
    const nonRetryable = ['AUTHENTICATION', 'VALIDATION', 'BAD_REQUEST'];

    if (nonRetryable.includes(errorType)) {
      return false;
    }

    // Retryable errors
    const retryable = ['RATE_LIMIT', 'TIMEOUT', 'NETWORK', 'SERVER_ERROR'];

    return retryable.includes(errorType);
  }

  /**
   * Calculate exponential backoff delay
   */
  calculateDelay(attempt) {
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt),
      this.retryConfig.maxDelay
    );

    // Add jitter (±20%) to prevent thundering herd
    const jitter = delay * 0.2 * (Math.random() * 2 - 1);

    return Math.floor(delay + jitter);
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Wrap Gemini API call with error handling
   */
  async callGeminiWithRetry(geminiModel, prompt, options = {}) {
    return this.executeWithRetry(async () => {
      try {
        const result = await geminiModel.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        // Enhance error message with context
        if (error.message?.includes('API key')) {
          throw new Error('AUTHENTICATION: Invalid or missing Gemini API key');
        }

        if (error.message?.includes('quota')) {
          throw new Error('RATE_LIMIT: Gemini API quota exceeded. Please wait and try again.');
        }

        throw error;
      }
    }, options);
  }

  /**
   * Handle JSON parsing errors
   */
  parseJSONWithFallback(response, fallbackData = null) {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try direct parse
      return JSON.parse(response);
    } catch (error) {
      logger.warn(`${this.agentName}: JSON parsing failed. Using fallback.`, {
        error: error.message,
        responsePreview: response?.substring(0, 200),
      });

      // Return fallback or structured error
      if (fallbackData) {
        return fallbackData;
      }

      return {
        success: false,
        error: 'Failed to parse response',
        raw: response,
      };
    }
  }

  /**
   * Validate agent response
   */
  validateResponse(data, requiredFields = []) {
    if (!data) {
      throw new Error('VALIDATION: Response data is null or undefined');
    }

    const missing = requiredFields.filter((field) => !(field in data));

    if (missing.length > 0) {
      throw new Error(`VALIDATION: Missing required fields: ${missing.join(', ')}`);
    }

    return true;
  }

  /**
   * Get error statistics
   */
  getStats() {
    return {
      ...this.stats,
      circuitBreaker: {
        state: this.circuitBreaker.state,
        failures: this.circuitBreaker.failures,
        threshold: this.circuitBreaker.threshold,
      },
      successRate: this.calculateSuccessRate(),
    };
  }

  /**
   * Calculate success rate
   */
  calculateSuccessRate() {
    const total = this.stats.totalErrors + this.stats.recoveredErrors;
    if (total === 0) {
      return 100;
    }

    const successful = total - (this.stats.totalErrors - this.stats.recoveredErrors);
    return ((successful / total) * 100).toFixed(2);
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalErrors: 0,
      retriedErrors: 0,
      recoveredErrors: 0,
      circuitBreakerTrips: 0,
      errorsByType: {},
    };

    logger.info(`${this.agentName}: Error statistics reset`);
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker() {
    this.circuitBreaker.state = 'CLOSED';
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.lastFailure = null;

    logger.info(`${this.agentName}: Circuit breaker manually reset`);
  }
}

module.exports = AgentErrorHandler;
