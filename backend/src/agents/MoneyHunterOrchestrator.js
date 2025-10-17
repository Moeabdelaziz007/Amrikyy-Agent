#!/usr/bin/env node

/**
 * 🚀 MONEY HUNTER ORCHESTRATOR
 * Advanced AI-powered revenue opportunity detection and execution system
 * 
 * Features:
 * - Multi-source opportunity scanning (Upwork, Fiverr, freelance platforms)
 * - AI-powered opportunity validation and scoring
 * - Automated proposal generation and submission
 * - Real-time monitoring and analytics
 * - Self-learning optimization algorithms
 */

const EventEmitter = require('events');
const { OpportunityScanner } = require('./OpportunityScanner');
const { SmartValidator } = require('./SmartValidator');
const { ExecutionEngine } = require('./ExecutionEngine');
const { AnalyticsEngine } = require('./AnalyticsEngine');

class MoneyHunterOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      scanInterval: config.scanInterval || 60000, // 1 minute default
      confidenceThreshold: config.confidenceThreshold || 0.75,
      maxConcurrentOpportunities: config.maxConcurrentOpportunities || 10,
      autoExecute: config.autoExecute || false,
      learningMode: config.learningMode || true,
      ...config
    };

    // Initialize sub-systems
    this.scanner = new OpportunityScanner(this.config);
    this.validator = new SmartValidator(this.config);
    this.executor = new ExecutionEngine(this.config);
    this.analytics = new AnalyticsEngine(this.config);

    // System state
    this.state = {
      status: 'idle', // idle, scanning, validating, executing
      totalOpportunities: 0,
      validatedOpportunities: 0,
      executedOpportunities: 0,
      totalRevenue: 0,
      successRate: 0,
      uptime: 0,
      lastScan: null,
      activeOpportunities: new Map(),
      performance: {
        scansPerHour: 0,
        validationAccuracy: 0,
        executionSuccessRate: 0,
        averageOpportunityValue: 0
      }
    };

    // Bind event handlers
    this.setupEventHandlers();
    
    // Performance tracking
    this.metrics = {
      scans: 0,
      validations: 0,
      executions: 0,
      startTime: Date.now()
    };
  }

  /**
   * Setup event handlers for sub-systems
   */
  setupEventHandlers() {
    // Scanner events
    this.scanner.on('opportunity-found', this.handleOpportunityFound.bind(this));
    this.scanner.on('scan-complete', this.handleScanComplete.bind(this));
    this.scanner.on('error', this.handleError.bind(this));

    // Validator events
    this.validator.on('validation-complete', this.handleValidationComplete.bind(this));
    this.validator.on('opportunity-approved', this.handleOpportunityApproved.bind(this));
    this.validator.on('opportunity-rejected', this.handleOpportunityRejected.bind(this));

    // Executor events
    this.executor.on('execution-started', this.handleExecutionStarted.bind(this));
    this.executor.on('execution-complete', this.handleExecutionComplete.bind(this));
    this.executor.on('execution-failed', this.handleExecutionFailed.bind(this));
  }

  /**
   * Start the Money Hunter system
   */
  async start() {
    console.log('🚀 Money Hunter Orchestrator starting...');
    this.emit('system-starting');

    try {
      // Initialize sub-systems
      await this.scanner.initialize();
      await this.validator.initialize();
      await this.executor.initialize();
      await this.analytics.initialize();

      // Start monitoring
      this.state.status = 'active';
      this.state.uptime = Date.now();
      this.metrics.startTime = Date.now();

      // Start scanning loop
      this.startScanningLoop();

      // Start analytics
      this.startAnalytics();

      this.emit('system-started', this.getSystemStatus());
      console.log('✅ Money Hunter Orchestrator started successfully!');

      return { success: true, status: this.getSystemStatus() };

    } catch (error) {
      console.error('❌ Failed to start Money Hunter:', error);
      this.emit('system-error', error);
      throw error;
    }
  }

  /**
   * Stop the Money Hunter system
   */
  async stop() {
    console.log('🛑 Money Hunter Orchestrator stopping...');
    this.emit('system-stopping');

    try {
      // Stop scanning loop
      if (this.scanInterval) {
        clearInterval(this.scanInterval);
        this.scanInterval = null;
      }

      if (this.analyticsInterval) {
        clearInterval(this.analyticsInterval);
        this.analyticsInterval = null;
      }

      // Cleanup sub-systems
      await this.scanner.cleanup();
      await this.validator.cleanup();
      await this.executor.cleanup();

      this.state.status = 'stopped';
      this.emit('system-stopped');
      console.log('✅ Money Hunter Orchestrator stopped successfully!');

      return { success: true };

    } catch (error) {
      console.error('❌ Failed to stop Money Hunter:', error);
      this.emit('system-error', error);
      throw error;
    }
  }

  /**
   * Start the scanning loop
   */
  startScanningLoop() {
    // Initial scan
    this.performScan();

    // Schedule recurring scans
    this.scanInterval = setInterval(() => {
      this.performScan();
    }, this.config.scanInterval);

    console.log(`📡 Scanning loop started (interval: ${this.config.scanInterval}ms)`);
  }

  /**
   * Perform a single scan cycle
   */
  async performScan() {
    if (this.state.status !== 'active') {
      return;
    }

    try {
      this.state.status = 'scanning';
      this.state.lastScan = new Date();
      this.metrics.scans++;

      this.emit('scan-started', { timestamp: this.state.lastScan });
      console.log('🔍 Starting opportunity scan...');

      // Trigger scanner
      await this.scanner.scan();

    } catch (error) {
      console.error('❌ Scan error:', error);
      this.emit('scan-error', error);
      this.state.status = 'active'; // Resume
    }
  }

  /**
   * Handle opportunity found event
   */
  async handleOpportunityFound(opportunity) {
    console.log(`💰 Opportunity found: ${opportunity.title} (Est. $${opportunity.estimatedValue})`);
    
    this.state.totalOpportunities++;
    this.state.activeOpportunities.set(opportunity.id, {
      ...opportunity,
      status: 'pending',
      discoveredAt: new Date()
    });

    this.emit('opportunity-discovered', opportunity);

    // Validate opportunity
    try {
      this.state.status = 'validating';
      this.metrics.validations++;
      
      await this.validator.validate(opportunity);
      
    } catch (error) {
      console.error(`❌ Validation error for ${opportunity.id}:`, error);
      this.handleOpportunityRejected(opportunity.id, 'validation_error');
    }
  }

  /**
   * Handle scan complete event
   */
  handleScanComplete(stats) {
    console.log(`✅ Scan complete: ${stats.opportunitiesFound} opportunities found`);
    this.state.status = 'active';
    this.emit('scan-completed', stats);
  }

  /**
   * Handle validation complete event
   */
  handleValidationComplete(validation) {
    const opportunity = this.state.activeOpportunities.get(validation.opportunityId);
    
    if (!opportunity) return;

    opportunity.validation = validation;
    opportunity.status = 'validated';

    console.log(`✅ Validation complete: ${opportunity.title} (Score: ${validation.score})`);
    
    this.emit('opportunity-validated', {
      opportunity,
      validation
    });
  }

  /**
   * Handle opportunity approved event
   */
  async handleOpportunityApproved(opportunityId, validation) {
    const opportunity = this.state.activeOpportunities.get(opportunityId);
    
    if (!opportunity) return;

    opportunity.status = 'approved';
    opportunity.approvedAt = new Date();
    
    this.state.validatedOpportunities++;

    console.log(`🎯 Opportunity approved: ${opportunity.title}`);
    console.log(`   💡 Confidence: ${(validation.confidence * 100).toFixed(1)}%`);
    console.log(`   💰 Value: $${opportunity.estimatedValue}`);
    
    this.emit('opportunity-approved', { opportunity, validation });

    // Auto-execute if enabled
    if (this.config.autoExecute && validation.confidence >= this.config.confidenceThreshold) {
      await this.executeOpportunity(opportunityId);
    }
  }

  /**
   * Handle opportunity rejected event
   */
  handleOpportunityRejected(opportunityId, reason) {
    const opportunity = this.state.activeOpportunities.get(opportunityId);
    
    if (!opportunity) return;

    opportunity.status = 'rejected';
    opportunity.rejectedAt = new Date();
    opportunity.rejectionReason = reason;

    console.log(`❌ Opportunity rejected: ${opportunity.title} (${reason})`);
    
    this.emit('opportunity-rejected', { opportunity, reason });

    // Remove from active opportunities
    this.state.activeOpportunities.delete(opportunityId);
  }

  /**
   * Execute an approved opportunity
   */
  async executeOpportunity(opportunityId) {
    const opportunity = this.state.activeOpportunities.get(opportunityId);
    
    if (!opportunity || opportunity.status !== 'approved') {
      throw new Error(`Cannot execute opportunity ${opportunityId} - not approved`);
    }

    try {
      this.state.status = 'executing';
      this.metrics.executions++;
      
      console.log(`⚡ Executing opportunity: ${opportunity.title}`);
      
      await this.executor.execute(opportunity);
      
    } catch (error) {
      console.error(`❌ Execution error for ${opportunityId}:`, error);
      this.handleExecutionFailed(opportunityId, error);
    }
  }

  /**
   * Handle execution started event
   */
  handleExecutionStarted(opportunityId) {
    const opportunity = this.state.activeOpportunities.get(opportunityId);
    
    if (!opportunity) return;

    opportunity.status = 'executing';
    opportunity.executionStartedAt = new Date();

    console.log(`🚀 Execution started: ${opportunity.title}`);
    
    this.emit('execution-started', opportunity);
  }

  /**
   * Handle execution complete event
   */
  handleExecutionComplete(result) {
    const opportunity = this.state.activeOpportunities.get(result.opportunityId);
    
    if (!opportunity) return;

    opportunity.status = 'completed';
    opportunity.executionCompletedAt = new Date();
    opportunity.result = result;

    this.state.executedOpportunities++;
    this.state.totalRevenue += result.revenue || 0;
    
    console.log(`✅ Execution complete: ${opportunity.title}`);
    console.log(`   💰 Revenue: $${result.revenue || 0}`);
    
    this.emit('execution-completed', { opportunity, result });

    // Move to history
    this.state.activeOpportunities.delete(result.opportunityId);
    
    // Update success rate
    this.updateMetrics();

    // Resume scanning
    this.state.status = 'active';
  }

  /**
   * Handle execution failed event
   */
  handleExecutionFailed(opportunityId, error) {
    const opportunity = this.state.activeOpportunities.get(opportunityId);
    
    if (!opportunity) return;

    opportunity.status = 'failed';
    opportunity.executionFailedAt = new Date();
    opportunity.error = error.message;

    console.log(`❌ Execution failed: ${opportunity.title}`);
    console.log(`   Error: ${error.message}`);
    
    this.emit('execution-failed', { opportunity, error });

    // Remove from active
    this.state.activeOpportunities.delete(opportunityId);

    // Resume scanning
    this.state.status = 'active';
  }

  /**
   * Handle general errors
   */
  handleError(error) {
    console.error('❌ System error:', error);
    this.emit('error', error);
  }

  /**
   * Start analytics tracking
   */
  startAnalytics() {
    this.analyticsInterval = setInterval(() => {
      this.updateMetrics();
      this.emitAnalytics();
    }, 10000); // Every 10 seconds

    console.log('📊 Analytics tracking started');
  }

  /**
   * Update system metrics
   */
  updateMetrics() {
    const uptimeHours = (Date.now() - this.metrics.startTime) / (1000 * 60 * 60);
    
    this.state.performance = {
      scansPerHour: this.metrics.scans / uptimeHours,
      validationAccuracy: this.state.validatedOpportunities / Math.max(1, this.state.totalOpportunities),
      executionSuccessRate: this.state.executedOpportunities / Math.max(1, this.state.validatedOpportunities),
      averageOpportunityValue: this.state.totalRevenue / Math.max(1, this.state.executedOpportunities)
    };

    this.state.successRate = (this.state.executedOpportunities / Math.max(1, this.state.totalOpportunities) * 100);
  }

  /**
   * Emit analytics event
   */
  emitAnalytics() {
    const analytics = this.analytics.getAnalytics(this.state);
    this.emit('analytics-update', analytics);
  }

  /**
   * Get current system status
   */
  getSystemStatus() {
    return {
      status: this.state.status,
      uptime: Date.now() - this.state.uptime,
      stats: {
        totalOpportunities: this.state.totalOpportunities,
        validatedOpportunities: this.state.validatedOpportunities,
        executedOpportunities: this.state.executedOpportunities,
        activeOpportunities: this.state.activeOpportunities.size,
        totalRevenue: this.state.totalRevenue,
        successRate: this.state.successRate.toFixed(2) + '%'
      },
      performance: this.state.performance,
      lastScan: this.state.lastScan,
      activeOpportunities: Array.from(this.state.activeOpportunities.values())
    };
  }

  /**
   * Get detailed analytics
   */
  getAnalytics() {
    return this.analytics.getDetailedAnalytics(this.state);
  }
}

module.exports = MoneyHunterOrchestrator;
