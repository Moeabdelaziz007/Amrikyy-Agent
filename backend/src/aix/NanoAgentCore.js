/**
 * NanoAgent Core - Quantum Strategy Execution Engine
 * 
 * Inspired by:
 * - obra/smallest-agent (minimal agent design)
 * - TinyFish (web automation)
 * - Quantum computing (parallel execution + collapse)
 * 
 * Pattern:
 * 1. Receive task
 * 2. Generate 3-5 strategies (superposition)
 * 3. Execute all in parallel
 * 4. Score each result
 * 5. Collapse to best strategy
 * 6. Return optimal result
 * 
 * Perfect for:
 * - Price comparison (try multiple APIs)
 * - Web scraping with fallbacks
 * - Multi-source data aggregation
 * - Resilient decision-making
 */

const { logger } = require('../utils/logger');
const log = logger.child('NanoAgent');

class NanoAgentCore {
  constructor(options = {}) {
    // Strategy registry
    this.strategies = new Map();
    
    // Execution history (for learning)
    this.history = [];
    
    // Strategy performance tracking
    this.performance = new Map();
    
    // Configuration
    this.config = {
      maxStrategies: options.maxStrategies || 5,
      timeout: options.timeout || 10000, // 10s max per strategy
      minConfidence: options.minConfidence || 0.6,
      parallelExecution: options.parallelExecution !== false,
      learningEnabled: options.learningEnabled !== false
    };

    log.info('NanoAgent Core initialized', {
      maxStrategies: this.config.maxStrategies,
      parallelExecution: this.config.parallelExecution
    });
  }

  /**
   * Register a strategy
   */
  registerStrategy(name, strategyFunction, metadata = {}) {
    this.strategies.set(name, {
      name,
      execute: strategyFunction,
      metadata: {
        description: metadata.description || '',
        cost: metadata.cost || 'low', // low, medium, high
        reliability: metadata.reliability || 0.8,
        latency: metadata.latency || 1000, // expected latency in ms
        ...metadata
      },
      stats: {
        executions: 0,
        successes: 0,
        failures: 0,
        totalLatency: 0,
        lastUsed: null
      }
    });

    log.info('Strategy registered', { 
      name, 
      cost: metadata.cost,
      reliability: metadata.reliability 
    });
  }

  /**
   * Execute task with quantum strategy approach
   * 
   * @param {Object} task - Task to execute
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Best result after collapse
   */
  async execute(task, context = {}) {
    const startTime = Date.now();
    
    log.info('NanoAgent executing task', {
      task: task.description || task.type,
      strategiesAvailable: this.strategies.size
    });

    try {
      // PHASE 1: SUPERPOSITION - Generate strategy variations
      const strategies = this.selectStrategies(task, context);
      
      if (strategies.length === 0) {
        throw new Error('No suitable strategies found for task');
      }

      log.debug('Strategies selected', {
        count: strategies.length,
        names: strategies.map(s => s.name)
      });

      // PHASE 2: PARALLEL EXECUTION - Run all strategies simultaneously
      const results = await this.executeStrategiesInParallel(
        strategies, 
        task, 
        context
      );

      // PHASE 3: SCORING - Evaluate each result
      const scored = this.scoreResults(results, task);

      // PHASE 4: COLLAPSE - Choose best strategy
      const best = this.collapseToB est(scored, task);

      // PHASE 5: LEARNING - Update strategy performance
      if (this.config.learningEnabled) {
        this.learnFromExecution(strategies, scored, best);
      }

      // Record execution
      const execution = {
        task,
        strategies: strategies.map(s => s.name),
        results: scored,
        best: best.strategy,
        confidence: best.score,
        totalLatency: Date.now() - startTime,
        timestamp: Date.now()
      };

      this.history.push(execution);

      // Keep history limited
      if (this.history.length > 1000) {
        this.history.shift();
      }

      log.success('Task executed successfully', {
        strategy: best.strategy,
        score: best.score.toFixed(2),
        latency: `${Date.now() - startTime}ms`
      });

      return {
        success: true,
        result: best.result,
        strategy: best.strategy,
        confidence: best.score,
        allResults: scored,
        latency: Date.now() - startTime,
        metadata: {
          strategiesTried: strategies.length,
          successfulStrategies: scored.filter(r => r.success).length
        }
      };

    } catch (error) {
      log.error('NanoAgent execution failed', {
        error: error.message,
        latency: `${Date.now() - startTime}ms`
      });

      return {
        success: false,
        error: error.message,
        latency: Date.now() - startTime
      };
    }
  }

  /**
   * Select best strategies for task
   */
  selectStrategies(task, context) {
    const candidates = Array.from(this.strategies.values());
    
    // Filter by task type compatibility
    const compatible = candidates.filter(strategy => {
      if (strategy.metadata.taskTypes) {
        return strategy.metadata.taskTypes.includes(task.type);
      }
      return true; // No filter if not specified
    });

    // Sort by historical performance
    const sorted = compatible.sort((a, b) => {
      const scoreA = this.calculateStrategyScore(a);
      const scoreB = this.calculateStrategyScore(b);
      return scoreB - scoreA;
    });

    // Take top N strategies
    return sorted.slice(0, this.config.maxStrategies);
  }

  /**
   * Calculate strategy historical score
   */
  calculateStrategyScore(strategy) {
    const stats = strategy.stats;
    
    if (stats.executions === 0) {
      // No history - use metadata reliability
      return strategy.metadata.reliability;
    }

    // Historical success rate
    const successRate = stats.successes / stats.executions;
    
    // Average latency (lower is better)
    const avgLatency = stats.totalLatency / stats.executions;
    const latencyScore = 1 / (1 + avgLatency / 1000); // Normalize to 0-1
    
    // Weighted score
    return (successRate * 0.7) + (latencyScore * 0.2) + (strategy.metadata.reliability * 0.1);
  }

  /**
   * Execute strategies in parallel (Quantum Superposition)
   */
  async executeStrategiesInParallel(strategies, task, context) {
    const executions = strategies.map(strategy => 
      this.executeStrategy(strategy, task, context)
    );

    // Wait for all to complete or timeout
    const results = await Promise.allSettled(executions);

    return results.map((result, index) => {
      const strategy = strategies[index];
      
      if (result.status === 'fulfilled') {
        return {
          strategy: strategy.name,
          success: result.value.success,
          result: result.value.data,
          latency: result.value.latency,
          cost: strategy.metadata.cost,
          method: strategy.name
        };
      } else {
        return {
          strategy: strategy.name,
          success: false,
          error: result.reason?.message || 'Unknown error',
          latency: this.config.timeout,
          cost: strategy.metadata.cost,
          method: strategy.name
        };
      }
    });
  }

  /**
   * Execute single strategy with timeout
   */
  async executeStrategy(strategy, task, context) {
    const startTime = Date.now();
    
    try {
      // Update stats
      strategy.stats.executions++;
      strategy.stats.lastUsed = Date.now();

      // Execute with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Strategy timeout')), this.config.timeout)
      );

      const executionPromise = strategy.execute(task, context);
      
      const result = await Promise.race([executionPromise, timeoutPromise]);

      // Record success
      strategy.stats.successes++;
      strategy.stats.totalLatency += Date.now() - startTime;

      return {
        success: true,
        data: result,
        latency: Date.now() - startTime
      };

    } catch (error) {
      // Record failure
      strategy.stats.failures++;

      return {
        success: false,
        error: error.message,
        latency: Date.now() - startTime
      };
    }
  }

  /**
   * Score all results
   */
  scoreResults(results, task) {
    return results.map(result => {
      if (!result.success) {
        return { ...result, score: 0 };
      }

      // Multi-criteria scoring
      let score = 0;

      // Success is primary
      score += 0.4;

      // Latency (faster is better)
      const latencyScore = 1 / (1 + result.latency / 1000);
      score += latencyScore * 0.3;

      // Cost (lower is better)
      const costScores = { low: 1.0, medium: 0.7, high: 0.4 };
      score += (costScores[result.cost] || 0.5) * 0.2;

      // Task-specific scoring (e.g., for price comparison, lowest price wins)
      if (task.type === 'price_check' && result.result?.price) {
        const targetPrice = task.targetPrice || Infinity;
        if (result.result.price <= targetPrice) {
          score += 0.1;
        }
      }

      return {
        ...result,
        score: Math.min(1.0, score)
      };
    });
  }

  /**
   * Collapse to best result (Quantum Collapse)
   */
  collapseToBest(scoredResults, task) {
    // Filter successful results
    const successful = scoredResults.filter(r => r.success && r.score > 0);

    if (successful.length === 0) {
      // All failed - return best failure with explanation
      const bestFailure = scoredResults.sort((a, b) => b.score - a.score)[0];
      
      log.warn('All strategies failed', {
        strategiesTried: scoredResults.length
      });

      return {
        strategy: 'none',
        result: null,
        score: 0,
        allFailed: true,
        attempts: scoredResults
      };
    }

    // Sort by score and return best
    successful.sort((a, b) => b.score - a.score);
    
    const best = successful[0];

    // Check confidence threshold
    if (best.score < this.config.minConfidence) {
      log.warn('Best result below confidence threshold', {
        score: best.score,
        threshold: this.config.minConfidence
      });
    }

    return best;
  }

  /**
   * Learn from execution (Pattern Learning Integration)
   */
  learnFromExecution(strategies, scored, best) {
    // Update strategy performance
    for (const result of scored) {
      const strategyName = result.strategy;
      
      if (!this.performance.has(strategyName)) {
        this.performance.set(strategyName, {
          name: strategyName,
          totalScore: 0,
          executions: 0,
          wins: 0, // Times this was chosen as best
          averageScore: 0
        });
      }

      const perf = this.performance.get(strategyName);
      perf.totalScore += result.score;
      perf.executions++;
      perf.averageScore = perf.totalScore / perf.executions;

      if (result.strategy === best.strategy) {
        perf.wins++;
      }
    }

    // Adapt strategy selection for next time
    this.adaptStrategyWeights();
  }

  /**
   * Adapt strategy weights based on performance
   */
  adaptStrategyWeights() {
    for (const [name, perf] of this.performance) {
      const strategy = this.strategies.get(name);
      if (!strategy) continue;

      // Adjust reliability based on wins
      if (perf.executions >= 10) {
        const winRate = perf.wins / perf.executions;
        strategy.metadata.reliability = 
          0.8 * strategy.metadata.reliability + 0.2 * winRate;
      }
    }
  }

  /**
   * Get strategy performance report
   */
  getPerformanceReport() {
    const report = [];

    for (const [name, perf] of this.performance) {
      const strategy = this.strategies.get(name);
      
      report.push({
        name,
        executions: perf.executions,
        wins: perf.wins,
        winRate: perf.executions > 0 ? (perf.wins / perf.executions) : 0,
        averageScore: perf.averageScore,
        reliability: strategy?.metadata.reliability || 0,
        recommendation: perf.winRate > 0.7 ? 'Excellent' : 
                       perf.winRate > 0.4 ? 'Good' : 'Needs improvement'
      });
    }

    return report.sort((a, b) => b.winRate - a.winRate);
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalExecutions: this.history.length,
      registeredStrategies: this.strategies.size,
      averageStrategiesPerTask: this.calculateAverageStrategies(),
      averageConfidence: this.calculateAverageConfidence(),
      performanceReport: this.getPerformanceReport()
    };
  }

  calculateAverageStrategies() {
    if (this.history.length === 0) return 0;
    const total = this.history.reduce((sum, h) => sum + h.strategies.length, 0);
    return total / this.history.length;
  }

  calculateAverageConfidence() {
    if (this.history.length === 0) return 0;
    const total = this.history.reduce((sum, h) => sum + h.confidence, 0);
    return total / this.history.length;
  }
}

module.exports = NanoAgentCore;

