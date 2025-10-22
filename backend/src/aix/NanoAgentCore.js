/**
 * NanoAgentCore - Quantum Decision Engine
 *
 * A revolutionary micro-agent system that brings quantum computing concepts
 * to AI decision-making. It allows an agent to explore multiple strategies
 * in parallel and collapse to the best possible outcome.
 *
 * Inspired by GPT-5 Golden Research and professional implementation patterns.
 *
 * @version 1.0.0
 * @author AMRIKYY AI Solutions / Gemini Code Assist
 * @date 2025-10-19
 */

const { performance } = require('perf_hooks');

class NanoAgentCore {
  /**
   * Initializes the NanoAgent Decision Engine.
   * @param {object} config - Configuration for the engine.
   * @param {number} [config.maxStrategies=5] - Max number of strategies to run in parallel.
   * @param {number} [config.timeout=10000] - Timeout in ms for strategy execution.
   * @param {number} [config.minConfidence=0.6] - Minimum confidence score to consider a result valid.
   * @param {boolean} [config.learningEnabled=true] - Enable self-optimization of strategy weights.
   */
  constructor(config = {}) {
    this.strategies = new Map();
    this.config = {
      maxStrategies: 5,
      timeout: 10000,
      minConfidence: 0.6,
      learningEnabled: true,
      ...config,
    };
    this.strategyWeights = new Map();
    console.log('🚀 NanoAgentCore Initialized: Quantum decision-making enabled.');
  }

  /**
   * Registers a decision-making strategy.
   * @param {string} name - The unique name of the strategy.
   * @param {Function} executeFn - The async function that implements the strategy.
   * @param {object} metadata - Metadata about the strategy.
   * @param {string} [metadata.cost='medium'] - Estimated cost (low, medium, high).
   * @param {number} [metadata.reliability=0.8] - Estimated reliability (0.0 to 1.0).
   * @param {number} [metadata.latency=1500] - Estimated latency in ms.
   */
  registerStrategy(name, executeFn, metadata = {}) {
    if (this.strategies.has(name)) {
      console.warn(`⚠️ Strategy "${name}" is already registered. Overwriting.`);
    }
    this.strategies.set(name, {
      name,
      execute: executeFn,
      metadata: {
        cost: 'medium',
        reliability: 0.8,
        latency: 1500,
        ...metadata,
      },
    });
    this.strategyWeights.set(name, 1.0); // Initial weight
    console.log(`✅ Strategy Registered: "${name}"`);
  }

  /**
   * Selects the best strategies to execute based on current weights and task type.
   * @param {object} task - The task details.
   * @returns {Array} A list of strategy objects to execute.
   */
  _selectStrategies(task) {
    // Simple selection for now, can be enhanced with task-specific logic
    return Array.from(this.strategies.values())
      .sort(
        (a, b) =>
          (this.strategyWeights.get(b.name) || 1.0) - (this.strategyWeights.get(a.name) || 1.0)
      )
      .slice(0, this.config.maxStrategies);
  }

  /**
   * Executes the decision-making process for a given task.
   * This is the "Quantum Superposition" phase where all strategies run in parallel.
   * @param {object} task - The task to be executed (e.g., { type: 'price_check', ... }).
   * @param {object} context - Shared context for all strategies (e.g., API keys, cache instances).
   * @returns {Promise<object>} The final result after collapsing to the best outcome.
   */
  async execute(task, context = {}) {
    const startTime = performance.now();
    const selectedStrategies = this._selectStrategies(task);

    if (selectedStrategies.length === 0) {
      return this._formatErrorResult('No strategies available for this task.');
    }

    console.log(
      `🧠 NanoAgent Executing Task: "${task.type}". Trying ${selectedStrategies.length} strategies in parallel.`
    );

    const promises = selectedStrategies.map((strategy) =>
      this._executeStrategyWithTimeout(strategy, task, context)
    );

    const allResults = await Promise.all(promises);

    const successfulResults = allResults.filter((r) => r.success && r.result !== null);

    if (successfulResults.length === 0) {
      if (this.config.learningEnabled) {
        this._updateWeights(allResults);
      }
      return this._formatErrorResult('All strategies failed or returned no result.', allResults);
    }

    const bestResult = this._evaluateAndCollapse(successfulResults);

    if (this.config.learningEnabled) {
      this._updateWeights(allResults, bestResult.strategy);
    }

    const totalLatency = performance.now() - startTime;

    return {
      success: true,
      result: bestResult.result,
      strategy: bestResult.strategy,
      confidence: bestResult.score,
      allResults: allResults.map(({ execute, ...rest }) => rest), // Don't expose the function itself
      latency: totalLatency,
      metadata: {
        strategiesTried: selectedStrategies.length,
        successfulStrategies: successfulResults.length,
      },
    };
  }

  /**
   * Wraps a strategy's execution with a timeout.
   * @param {object} strategy - The strategy to execute.
   * @param {object} task - The task details.
   * @param {object} context - Shared context.
   * @returns {Promise<object>} The result of the strategy execution.
   */
  async _executeStrategyWithTimeout(strategy, task, context) {
    const startTime = performance.now();
    try {
      const result = await Promise.race([
        strategy.execute(task, context),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Strategy timed out')), this.config.timeout)
        ),
      ]);

      const latency = performance.now() - startTime;
      const score = this._calculateScore(result, latency, strategy.metadata);

      if (score < this.config.minConfidence) {
        throw new Error(
          `Result confidence (${score.toFixed(2)}) is below threshold (${
            this.config.minConfidence
          })`
        );
      }

      return {
        strategy: strategy.name,
        success: true,
        result,
        latency,
        score,
      };
    } catch (error) {
      return {
        strategy: strategy.name,
        success: false,
        result: null,
        error: error.message,
        latency: performance.now() - startTime,
        score: 0,
      };
    }
  }

  /**
   * Calculates a confidence score for a strategy's result.
   * This can be customized for different task types.
   * @param {object} result - The result from the strategy.
   * @param {number} latency - The execution latency.
   * @param {object} metadata - The strategy's metadata.
   * @returns {number} A score between 0.0 and 1.0.
   */
  _calculateScore(result, latency, metadata) {
    // Default scoring logic for a price check.
    // A good result has a price, is available, and is fast.
    if (!result || typeof result.price !== 'number' || !result.available) {
      return 0;
    }

    // Normalize latency against expected latency. Faster is better.
    const latencyScore = Math.max(0, 1 - latency / (metadata.latency * 2));

    // Reliability is a direct factor.
    const reliabilityScore = metadata.reliability;

    // Combine scores with weights.
    // Example: 50% reliability, 50% speed.
    return reliabilityScore * 0.5 + latencyScore * 0.5;
  }

  /**
   * This is the "Quantum Collapse" phase. It evaluates all successful results
   * and chooses the best one.
   * @param {Array<object>} successfulResults - An array of successful strategy results.
   * @returns {object} The best result.
   */
  _evaluateAndCollapse(successfulResults) {
    // For a price check, the best result is the one with the lowest price,
    // but we can also factor in the confidence score.
    return successfulResults.reduce((best, current) => {
      if (!best) return current;

      // Prioritize lower price
      if (current.result.price < best.result.price) {
        return current;
      }
      // If prices are equal, choose the one with a higher confidence score
      if (current.result.price === best.result.price && current.score > best.score) {
        return current;
      }

      return best;
    }, null);
  }

  /**
   * Updates the weights of strategies based on their performance.
   * This is the self-learning mechanism.
   * @param {Array<object>} allResults - The results from all tried strategies.
   * @param {string} [winningStrategyName] - The name of the winning strategy.
   */
  _updateWeights(allResults, winningStrategyName = null) {
    const learningRate = 0.1; // How much to adjust weights

    allResults.forEach((result) => {
      const name = result.strategy;
      const currentWeight = this.strategyWeights.get(name) || 1.0;

      if (name === winningStrategyName) {
        // Reward the winner
        const newWeight = currentWeight + learningRate * (1 - currentWeight);
        this.strategyWeights.set(name, newWeight);
        console.log(`🧠 Learning: Increased weight for "${name}" to ${newWeight.toFixed(3)}`);
      } else if (!result.success) {
        // Penalize failures
        const newWeight = currentWeight - learningRate * currentWeight;
        this.strategyWeights.set(name, Math.max(0.1, newWeight)); // Don't let weight go to zero
        console.log(
          `🧠 Learning: Decreased weight for failed strategy "${name}" to ${newWeight.toFixed(3)}`
        );
      }
      // We could also slightly penalize losers, but let's keep it simple for now.
    });
  }

  /**
   * Formats a standard error response.
   * @param {string} message - The error message.
   * @param {Array|null} allResults - Optional results from all strategies.
   * @returns {object} The formatted error object.
   */
  _formatErrorResult(message, allResults = null) {
    return {
      success: false,
      error: message,
      result: null,
      strategy: null,
      confidence: 0,
      allResults,
    };
  }
}

module.exports = NanoAgentCore;

/**
 * =================================================
 *           EXAMPLE STRATEGIES
 * =================================================
 *
 * These would typically be in their own files, e.g.,
 * `backend/src/aix/strategies/PriceCheckStrategies.js`
 */

/**
 * Strategy 1: Check a reliable but potentially slow API.
 * @returns {Promise<object>} { price, currency, available }
 */
async function apiPriceCheck(task, context) {
  // Mock API call
  console.log('[Strategy: API] Checking Skyscanner API for', task.destination);
  await new Promise((resolve) => setTimeout(resolve, 1200)); // Simulate network latency
  // Simulate a 10% failure rate
  if (Math.random() < 0.1) {
    throw new Error('API timeout');
  }
  return {
    price: 347 + Math.floor(Math.random() * 20), // Random price around 347
    currency: 'USD',
    available: true,
    source: 'Skyscanner API',
  };
}

/**
 * Strategy 2: Scrape a website. Less reliable, higher latency.
 * @returns {Promise<object>} { price, currency, available }
 */
async function simpleScrape(task, context) {
  console.log('[Strategy: Scrape] Scraping Kayak for', task.destination);
  await new Promise((resolve) => setTimeout(resolve, 3500)); // Simulate scraping time
  // Simulate a 30% failure rate
  if (Math.random() < 0.3) {
    throw new Error('Scraping blocked by CAPTCHA');
  }
  return {
    price: 355 + Math.floor(Math.random() * 30),
    currency: 'USD',
    available: true,
    source: 'Kayak Web Scrape',
  };
}

/**
 * Strategy 3: Check an internal cache. Very fast, but might be stale.
 * @returns {Promise<object>} { price, currency, available }
 */
async function cachedPrice(task, context) {
  console.log('[Strategy: Cache] Checking internal cache for', task.destination);
  await new Promise((resolve) => setTimeout(resolve, 50)); // Very fast
  // Simulate a 70% cache miss
  if (Math.random() < 0.7) {
    return null; // Cache miss is not an error, just no result
  }
  return {
    price: 340 + Math.floor(Math.random() * 10), // Usually a bit cheaper
    currency: 'USD',
    available: true,
    source: 'Internal Cache',
  };
}

module.exports.exampleStrategies = {
  apiPriceCheck,
  simpleScrape,
  cachedPrice,
};
