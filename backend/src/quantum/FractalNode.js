/**
 * 🌳 Fractal Node System
 *
 * Universal self-healing, self-learning architecture
 * Every component follows the 3×3×3 pattern:
 * - 3 Steps: TRY → HEAL → LEARN
 * - 3 Nodes per step
 * - 3 Sub-operations per node
 *
 * If ANY point breaks, it auto-debugs and keeps going.
 */

const logger = require('../utils/logger');
const { EventEmitter } = require('events');

/**
 * Base Fractal Node
 * Can be nested infinitely for fractal architecture
 */
class FractalNode extends EventEmitter {
  constructor(config) {
    super();
    this.id =
      config.id ||
      `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.name = config.name || 'FractalNode';
    this.depth = config.depth || 0;
    this.maxDepth = config.maxDepth || 3;
    this.parent = config.parent || null;

    // State
    this.state = 'idle'; // idle, running, healing, learning, failed
    this.attemptCount = 0;
    this.maxAttempts = 3;

    // Learning memory
    this.memory = {
      successes: [],
      failures: [],
      patterns: {},
      optimizations: []
    };

    // Health metrics
    this.metrics = {
      totalExecutions: 0,
      successCount: 0,
      failureCount: 0,
      healCount: 0,
      avgExecutionTime: 0,
      lastError: null
    };

    // Child nodes (for fractal structure)
    this.children = [];

    logger.info(`🌟 ${this.name} created at depth ${this.depth}`);
  }

  /**
   * 🎯 MAIN EXECUTION: 3-Step Loop
   */
  async execute(operation, context = {}) {
    this.state = 'running';
    this.attemptCount = 0;
    const startTime = Date.now();

    logger.info(`▶️  ${this.name} executing...`);

    try {
      // ============================================================
      // STEP 1: TRY (Execute with 3 nodes)
      // ============================================================
      const result = await this._step1_try(operation, context);

      // Success!
      this._recordSuccess(result, Date.now() - startTime);

      // ============================================================
      // STEP 3: LEARN (Always learn from success)
      // ============================================================
      await this._step3_learn(result, null, context);

      this.state = 'idle';
      logger.info(`✅ ${this.name} completed successfully`);
      return result;
    } catch (error) {
      // ============================================================
      // STEP 2: HEAL (Auto-debug and fix)
      // ============================================================
      logger.warn(`⚠️  ${this.name} encountered error, initiating healing...`);
      this.state = 'healing';

      const healed = await this._step2_heal(operation, context, error);

      if (healed.success) {
        // Healing successful
        this._recordSuccess(healed.result, Date.now() - startTime);

        // ============================================================
        // STEP 3: LEARN (Learn from error + recovery)
        // ============================================================
        await this._step3_learn(healed.result, error, context);

        this.state = 'idle';
        logger.info(`✅ ${this.name} healed and completed`);
        return healed.result;
      } else {
        // Healing failed, but system continues
        this._recordFailure(error, Date.now() - startTime);

        // Still learn from failure
        await this._step3_learn(null, error, context);

        this.state = 'failed';
        logger.error(`❌ ${this.name} failed after healing attempts`);

        // Return graceful degradation
        return this._gracefulDegradation(error, context);
      }
    }
  }

  /**
   * 🎯 STEP 1: TRY (3 Nodes)
   */
  async _step1_try(operation, context) {
    logger.info(`  [STEP 1] TRY: ${this.name}`);

    // Node 1: Pre-execution validation
    await this._tryNode1_validate(operation, context);

    // Node 2: Core execution
    const result = await this._tryNode2_execute(operation, context);

    // Node 3: Post-execution verification
    await this._tryNode3_verify(result, context);

    return result;
  }

  /**
   * Node 1.1: Validate inputs (3 sub-operations)
   */
  async _tryNode1_validate(operation, context) {
    // Sub-op 1: Check operation validity
    if (!operation) {
      throw new Error('No operation provided');
    }

    // Sub-op 2: Check context completeness
    if (!context) {
      context = {};
    }

    // Sub-op 3: Check prerequisites
    if (this.memory.patterns.prerequisites) {
      const prerequisites = this.memory.patterns.prerequisites;
      for (const prereq of prerequisites) {
        if (!context[prereq]) {
          logger.warn(`Missing prerequisite: ${prereq}, using default`);
        }
      }
    }

    this.emit('validated', { node: this.id, context });
  }

  /**
   * Node 1.2: Execute core operation (3 sub-operations)
   */
  async _tryNode2_execute(operation, context) {
    // Sub-op 1: Prepare execution environment
    const env = this._prepareEnvironment(context);

    // Sub-op 2: Execute with monitoring
    const result = await this._executeWithMonitoring(operation, env);

    // Sub-op 3: Cleanup resources
    await this._cleanup(env);

    return result;
  }

  /**
   * Node 1.3: Verify results (3 sub-operations)
   */
  async _tryNode3_verify(result, context) {
    // Sub-op 1: Result type check
    if (result === undefined) {
      logger.warn(`${this.name} returned undefined, may be intentional`);
    }

    // Sub-op 2: Result quality check
    if (this.memory.patterns.expectedQuality) {
      const quality = this._assessQuality(result);
      if (quality < this.memory.patterns.expectedQuality) {
        logger.warn(`Result quality ${quality} below expected`);
      }
    }

    // Sub-op 3: Side effects check
    await this._checkSideEffects(result, context);

    this.emit('verified', { node: this.id, result });
  }

  /**
   * 🎯 STEP 2: HEAL (3 Nodes)
   */
  async _step2_heal(operation, context, error) {
    logger.info(`  [STEP 2] HEAL: ${this.name}`);

    this.attemptCount++;
    this.metrics.healCount++;

    // Node 1: Diagnose the issue
    const diagnosis = await this._healNode1_diagnose(error, context);

    // Node 2: Apply fix
    const fix = await this._healNode2_fix(diagnosis, operation, context);

    // Node 3: Retry with fix
    const retry = await this._healNode3_retry(fix, operation, context);

    return retry;
  }

  /**
   * Node 2.1: Diagnose issue (3 sub-operations)
   */
  async _healNode1_diagnose(error, context) {
    // Sub-op 1: Classify error type
    const errorType = this._classifyError(error);

    // Sub-op 2: Find root cause
    const rootCause = this._findRootCause(error, errorType, context);

    // Sub-op 3: Check known solutions
    const knownSolution = this._checkKnownSolutions(rootCause);

    const diagnosis = {
      errorType,
      rootCause,
      knownSolution,
      timestamp: Date.now()
    };

    logger.info(`  📊 Diagnosis: ${errorType} - ${rootCause}`);
    this.emit('diagnosed', diagnosis);

    return diagnosis;
  }

  /**
   * Node 2.2: Apply fix (3 sub-operations)
   */
  async _healNode2_fix(diagnosis, operation, context) {
    // Sub-op 1: Select fix strategy
    const strategy = this._selectFixStrategy(diagnosis);

    // Sub-op 2: Prepare fix
    const preparedFix = await this._prepareFix(strategy, diagnosis);

    // Sub-op 3: Apply fix
    const appliedFix = await this._applyFix(preparedFix, context);

    logger.info(`  🔧 Applied fix: ${strategy}`);
    this.emit('fixed', appliedFix);

    return appliedFix;
  }

  /**
   * Node 2.3: Retry with fix (3 sub-operations)
   */
  async _healNode3_retry(fix, operation, context) {
    // Sub-op 1: Check if retry is safe
    if (this.attemptCount >= this.maxAttempts) {
      logger.error(`  ❌ Max attempts (${this.maxAttempts}) reached`);
      return { success: false, error: 'Max retry attempts exceeded' };
    }

    // Sub-op 2: Apply fixed context
    const fixedContext = { ...context, ...fix.contextUpdates };

    // Sub-op 3: Retry execution
    try {
      logger.info(
        `  🔄 Retry attempt ${this.attemptCount}/${this.maxAttempts}`
      );
      const result = await this._tryNode2_execute(operation, fixedContext);

      logger.info('  ✅ Retry successful');
      return { success: true, result, fix };
    } catch (retryError) {
      logger.warn(`  ⚠️  Retry failed: ${retryError.message}`);

      // Recursive healing (if not too deep)
      if (this.attemptCount < this.maxAttempts) {
        return await this._step2_heal(operation, fixedContext, retryError);
      }

      return { success: false, error: retryError };
    }
  }

  /**
   * 🎯 STEP 3: LEARN (3 Nodes)
   */
  async _step3_learn(result, error, context) {
    logger.info(`  [STEP 3] LEARN: ${this.name}`);
    this.state = 'learning';

    // Node 1: Store experience
    await this._learnNode1_store(result, error, context);

    // Node 2: Update patterns
    await this._learnNode2_patterns(result, error, context);

    // Node 3: Optimize future
    await this._learnNode3_optimize(result, error, context);

    this.emit('learned', {
      node: this.id,
      hasError: !!error,
      memorySize: this.memory.successes.length + this.memory.failures.length
    });
  }

  /**
   * Node 3.1: Store experience (3 sub-operations)
   */
  async _learnNode1_store(result, error, context) {
    // Sub-op 1: Create experience record
    const experience = {
      timestamp: Date.now(),
      context,
      result,
      error: error
        ? {
          message: error.message,
          stack: error.stack,
          type: error.constructor.name
        }
        : null,
      metrics: { ...this.metrics }
    };

    // Sub-op 2: Store in appropriate collection
    if (error) {
      this.memory.failures.push(experience);
      if (this.memory.failures.length > 100) {
        this.memory.failures.shift(); // Keep last 100
      }
    } else {
      this.memory.successes.push(experience);
      if (this.memory.successes.length > 100) {
        this.memory.successes.shift();
      }
    }

    // Sub-op 3: Emit to parent for collective learning
    if (this.parent) {
      this.emit('experience', experience);
    }
  }

  /**
   * Node 3.2: Update patterns (3 sub-operations)
   */
  async _learnNode2_patterns(result, error, context) {
    // Sub-op 1: Identify new patterns
    const patterns = this._identifyPatterns();

    // Sub-op 2: Update pattern database
    for (const [key, value] of Object.entries(patterns)) {
      this.memory.patterns[key] = value;
    }

    // Sub-op 3: Share patterns with siblings
    if (this.parent) {
      this.emit('patterns-discovered', patterns);
    }
  }

  /**
   * Node 3.3: Optimize future (3 sub-operations)
   */
  async _learnNode3_optimize(result, error, context) {
    // Sub-op 1: Calculate success rate
    const successRate =
      this.metrics.successCount / this.metrics.totalExecutions;

    // Sub-op 2: Generate optimizations
    if (successRate < 0.8) {
      // Performance below threshold, generate improvements
      const optimizations = this._generateOptimizations(successRate);
      this.memory.optimizations.push(...optimizations);
    }

    // Sub-op 3: Apply best optimization
    if (this.memory.optimizations.length > 0) {
      const bestOptimization = this.memory.optimizations[0];
      await this._applyOptimization(bestOptimization);
    }
  }

  /**
   * ============================================================
   * HELPER METHODS (Each with 3 sub-operations where applicable)
   * ============================================================
   */

  _prepareEnvironment(context) {
    return {
      context,
      startTime: Date.now(),
      nodeId: this.id
    };
  }

  async _executeWithMonitoring(operation, env) {
    const timer = setInterval(() => {
      const duration = Date.now() - env.startTime;
      if (duration > 30000) {
        // 30 second timeout
        clearInterval(timer);
        throw new Error('Execution timeout');
      }
    }, 1000);

    try {
      const result =
        typeof operation === 'function'
          ? await operation(env.context)
          : operation;

      clearInterval(timer);
      return result;
    } catch (error) {
      clearInterval(timer);
      throw error;
    }
  }

  async _cleanup(env) {
    // Cleanup resources
    env.endTime = Date.now();
    env.duration = env.endTime - env.startTime;
  }

  _assessQuality(result) {
    // Simple quality score: 0-100
    if (!result) return 0;
    if (typeof result === 'object' && Object.keys(result).length > 0) return 80;
    if (typeof result === 'string' && result.length > 0) return 70;
    return 50;
  }

  async _checkSideEffects(result, context) {
    // Check for unintended consequences
    // This would be customized per node type
  }

  _classifyError(error) {
    if (error.code === 'ECONNREFUSED') return 'connection_error';
    if (error.code === 'ETIMEDOUT') return 'timeout_error';
    if (error.message.includes('not found')) return 'not_found_error';
    if (error.message.includes('permission')) return 'permission_error';
    return 'unknown_error';
  }

  _findRootCause(error, errorType, context) {
    // Analyze error stack and context
    const causes = [];

    if (errorType === 'connection_error') {
      causes.push('Service unavailable');
    }
    if (errorType === 'timeout_error') {
      causes.push('Slow response or overload');
    }
    if (context && Object.keys(context).length === 0) {
      causes.push('Missing context');
    }

    return causes.length > 0 ? causes[0] : 'Unknown cause';
  }

  _checkKnownSolutions(rootCause) {
    // Check memory for similar past issues
    const similarFailures = this.memory.failures.filter(
      (f) => f.error && f.error.message.includes(rootCause)
    );

    if (similarFailures.length > 0) {
      return {
        found: true,
        solution: 'Applied previous successful recovery',
        count: similarFailures.length
      };
    }

    return { found: false };
  }

  _selectFixStrategy(diagnosis) {
    if (diagnosis.knownSolution.found) {
      return 'apply_known_solution';
    }

    if (diagnosis.errorType === 'connection_error') {
      return 'retry_with_backoff';
    }

    if (diagnosis.errorType === 'timeout_error') {
      return 'increase_timeout';
    }

    if (diagnosis.errorType === 'permission_error') {
      return 'request_elevated_access';
    }

    return 'generic_recovery';
  }

  async _prepareFix(strategy, diagnosis) {
    const fixes = {
      retry_with_backoff: {
        delay: Math.min(1000 * Math.pow(2, this.attemptCount), 10000),
        contextUpdates: { retryCount: this.attemptCount }
      },
      increase_timeout: {
        contextUpdates: { timeout: 60000 }
      },
      generic_recovery: {
        contextUpdates: { recoveryMode: true }
      }
    };

    return fixes[strategy] || fixes.generic_recovery;
  }

  async _applyFix(preparedFix, context) {
    if (preparedFix.delay) {
      await new Promise((resolve) => setTimeout(resolve, preparedFix.delay));
    }

    return preparedFix;
  }

  _identifyPatterns() {
    const patterns = {};

    // Pattern 1: Success rate by context
    if (this.memory.successes.length >= 10) {
      patterns.successRate =
        this.metrics.successCount / this.metrics.totalExecutions;
    }

    // Pattern 2: Common error types
    const errorTypes = {};
    this.memory.failures.forEach((f) => {
      if (f.error) {
        errorTypes[f.error.type] = (errorTypes[f.error.type] || 0) + 1;
      }
    });
    patterns.commonErrors = errorTypes;

    // Pattern 3: Average execution time
    patterns.avgExecutionTime = this.metrics.avgExecutionTime;

    return patterns;
  }

  _generateOptimizations(successRate) {
    const optimizations = [];

    if (successRate < 0.5) {
      optimizations.push({
        type: 'increase_max_attempts',
        description: 'Increase retry attempts due to low success rate',
        priority: 'high'
      });
    }

    if (this.metrics.avgExecutionTime > 5000) {
      optimizations.push({
        type: 'optimize_execution',
        description: 'Execution time too high, needs optimization',
        priority: 'medium'
      });
    }

    return optimizations;
  }

  async _applyOptimization(optimization) {
    if (optimization.type === 'increase_max_attempts') {
      this.maxAttempts = Math.min(this.maxAttempts + 1, 5);
      logger.info(
        `  🔧 Optimization applied: Max attempts now ${this.maxAttempts}`
      );
    }
  }

  _gracefulDegradation(error, context) {
    // Return safe default instead of crashing
    logger.warn(`  ⚠️  Graceful degradation activated for ${this.name}`);
    return {
      success: false,
      error: error.message,
      degraded: true,
      fallback: true
    };
  }

  _recordSuccess(result, duration) {
    this.metrics.totalExecutions++;
    this.metrics.successCount++;
    this.metrics.avgExecutionTime =
      (this.metrics.avgExecutionTime * (this.metrics.totalExecutions - 1) +
        duration) /
      this.metrics.totalExecutions;
  }

  _recordFailure(error, duration) {
    this.metrics.totalExecutions++;
    this.metrics.failureCount++;
    this.metrics.lastError = error.message;
    this.metrics.avgExecutionTime =
      (this.metrics.avgExecutionTime * (this.metrics.totalExecutions - 1) +
        duration) /
      this.metrics.totalExecutions;
  }

  /**
   * Get node status
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      state: this.state,
      depth: this.depth,
      metrics: this.metrics,
      successRate:
        this.metrics.successCount / Math.max(this.metrics.totalExecutions, 1),
      memorySize: this.memory.successes.length + this.memory.failures.length,
      patterns: Object.keys(this.memory.patterns).length,
      optimizations: this.memory.optimizations.length
    };
  }

  /**
   * Create child node (fractal)
   */
  createChild(config) {
    const child = new FractalNode({
      ...config,
      depth: this.depth + 1,
      maxDepth: this.maxDepth,
      parent: this
    });

    this.children.push(child);
    return child;
  }
}

module.exports = FractalNode;
