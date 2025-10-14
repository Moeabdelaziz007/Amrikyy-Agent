/**
 * Workflow Enforcer - Ensures ALL AI Agents Follow Professional Standards
 * 
 * Tracks and validates that every agent follows the mandatory workflow:
 * 1. ANALYZE
 * 2. THINK
 * 3. DECIDE
 * 4. BUILD
 * 
 * Provides feedback and prevents incomplete work
 */

const { logger } = require('../utils/logger');
const log = logger.child('WorkflowEnforcer');

class WorkflowEnforcer {
  constructor(options = {}) {
    // Track workflow compliance
    this.sessions = new Map(); // sessionId -> workflow state
    this.agentCompliance = new Map(); // agentId -> compliance stats
    
    // Quality thresholds
    this.thresholds = {
      minAnalysisRating: 5, // Must rate current state
      minThinkingDepth: 3, // At least 3 considerations
      minDecisionClarity: 0.7, // Clear plan required
      minBuildQuality: 8 // Quality score must be 8+
    };

    // Workflow steps
    this.requiredSteps = ['analyze', 'think', 'decide', 'build'];

    log.info('Workflow Enforcer initialized');
  }

  /**
   * Start a new workflow session
   */
  startSession(agentId, taskDescription) {
    const sessionId = `session-${Date.now()}-${agentId}`;
    
    const session = {
      id: sessionId,
      agentId,
      task: taskDescription,
      startedAt: Date.now(),
      completedAt: null,
      steps: {
        analyze: { completed: false, quality: 0, data: null },
        think: { completed: false, quality: 0, data: null },
        decide: { completed: false, quality: 0, data: null },
        build: { completed: false, quality: 0, data: null }
      },
      currentStep: 'analyze',
      issues: [],
      overallQuality: 0,
      compliant: false
    };

    this.sessions.set(sessionId, session);

    log.info('Workflow session started', {
      sessionId,
      agentId,
      task: taskDescription
    });

    return sessionId;
  }

  /**
   * Record ANALYZE step
   */
  recordAnalyze(sessionId, analysis) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Validate analysis
    const validation = this.validateAnalysis(analysis);
    
    session.steps.analyze = {
      completed: true,
      quality: validation.score,
      data: analysis,
      timestamp: Date.now(),
      issues: validation.issues
    };

    if (validation.issues.length > 0) {
      session.issues.push(...validation.issues);
    }

    session.currentStep = 'think';

    log.info('ANALYZE step recorded', {
      sessionId,
      quality: validation.score,
      issues: validation.issues.length
    });

    return validation;
  }

  /**
   * Validate ANALYZE step
   */
  validateAnalysis(analysis) {
    const issues = [];
    let score = 10;

    // Must have current state assessment
    if (!analysis.currentState) {
      issues.push({
        severity: 'error',
        message: 'Missing current state assessment',
        fix: 'Describe what exists now'
      });
      score -= 3;
    }

    // Must have rating
    if (!analysis.rating || analysis.rating < 0 || analysis.rating > 10) {
      issues.push({
        severity: 'error',
        message: 'Missing or invalid rating (0-10)',
        fix: 'Rate current state objectively'
      });
      score -= 2;
    }

    // Must identify gaps
    if (!analysis.gaps || analysis.gaps.length === 0) {
      issues.push({
        severity: 'warning',
        message: 'No gaps identified',
        fix: 'List what is missing or incomplete'
      });
      score -= 1;
    }

    // Should have what's working
    if (!analysis.working) {
      issues.push({
        severity: 'info',
        message: 'No positive aspects mentioned',
        fix: 'Mention what is working well'
      });
      score -= 0.5;
    }

    return {
      score: Math.max(0, score),
      compliant: score >= this.thresholds.minAnalysisRating,
      issues
    };
  }

  /**
   * Record THINK step
   */
  recordThink(sessionId, thinking) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (!session.steps.analyze.completed) {
      throw new Error('Cannot THINK before ANALYZE is complete');
    }

    // Validate thinking
    const validation = this.validateThinking(thinking);
    
    session.steps.think = {
      completed: true,
      quality: validation.score,
      data: thinking,
      timestamp: Date.now(),
      issues: validation.issues
    };

    if (validation.issues.length > 0) {
      session.issues.push(...validation.issues);
    }

    session.currentStep = 'decide';

    log.info('THINK step recorded', {
      sessionId,
      quality: validation.score,
      issues: validation.issues.length
    });

    return validation;
  }

  /**
   * Validate THINK step
   */
  validateThinking(thinking) {
    const issues = [];
    let score = 10;

    // Must have senior engineer perspective
    if (!thinking.seniorPerspective) {
      issues.push({
        severity: 'error',
        message: 'Missing senior engineer perspective',
        fix: 'Describe what a senior engineer would do'
      });
      score -= 3;
    }

    // Must have best practices
    if (!thinking.bestPractices || thinking.bestPractices.length < this.thresholds.minThinkingDepth) {
      issues.push({
        severity: 'error',
        message: `Need at least ${this.thresholds.minThinkingDepth} best practices`,
        fix: 'List relevant industry best practices'
      });
      score -= 2;
    }

    // Must have unique value proposition
    if (!thinking.uniqueValue) {
      issues.push({
        severity: 'warning',
        message: 'Missing unique value explanation',
        fix: 'Explain what makes this truly unique/excellent'
      });
      score -= 1;
    }

    // Should consider production requirements
    if (!thinking.productionRequirements) {
      issues.push({
        severity: 'info',
        message: 'Production requirements not explicitly stated',
        fix: 'List what makes it production-ready'
      });
      score -= 0.5;
    }

    return {
      score: Math.max(0, score),
      compliant: score >= 7,
      issues
    };
  }

  /**
   * Record DECIDE step
   */
  recordDecide(sessionId, decision) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (!session.steps.think.completed) {
      throw new Error('Cannot DECIDE before THINK is complete');
    }

    // Validate decision
    const validation = this.validateDecision(decision);
    
    session.steps.decide = {
      completed: true,
      quality: validation.score,
      data: decision,
      timestamp: Date.now(),
      issues: validation.issues
    };

    if (validation.issues.length > 0) {
      session.issues.push(...validation.issues);
    }

    session.currentStep = 'build';

    log.info('DECIDE step recorded', {
      sessionId,
      quality: validation.score,
      issues: validation.issues.length
    });

    return validation;
  }

  /**
   * Validate DECIDE step
   */
  validateDecision(decision) {
    const issues = [];
    let score = 10;

    // Must have architecture
    if (!decision.architecture) {
      issues.push({
        severity: 'error',
        message: 'Missing architecture design',
        fix: 'Define the technical architecture'
      });
      score -= 3;
    }

    // Must have technology stack
    if (!decision.techStack) {
      issues.push({
        severity: 'error',
        message: 'Missing technology stack',
        fix: 'List technologies and tools to be used'
      });
      score -= 2;
    }

    // Must have implementation plan
    if (!decision.plan || decision.plan.length === 0) {
      issues.push({
        severity: 'error',
        message: 'Missing implementation plan',
        fix: 'Break down into clear steps'
      });
      score -= 3;
    }

    // Should have dependencies identified
    if (!decision.dependencies) {
      issues.push({
        severity: 'warning',
        message: 'Dependencies not identified',
        fix: 'List what is needed before building'
      });
      score -= 1;
    }

    return {
      score: Math.max(0, score),
      compliant: score >= this.thresholds.minDecisionClarity * 10,
      issues
    };
  }

  /**
   * Record BUILD step
   */
  recordBuild(sessionId, build) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (!session.steps.decide.completed) {
      throw new Error('Cannot BUILD before DECIDE is complete');
    }

    // Validate build
    const validation = this.validateBuild(build);
    
    session.steps.build = {
      completed: true,
      quality: validation.score,
      data: build,
      timestamp: Date.now(),
      issues: validation.issues
    };

    if (validation.issues.length > 0) {
      session.issues.push(...validation.issues);
    }

    // Calculate overall quality
    session.overallQuality = this.calculateOverallQuality(session);
    session.compliant = session.overallQuality >= this.thresholds.minBuildQuality;
    session.completedAt = Date.now();

    // Update agent compliance stats
    this.updateAgentCompliance(session.agentId, session);

    log.info('BUILD step recorded - Session complete', {
      sessionId,
      quality: validation.score,
      overallQuality: session.overallQuality,
      compliant: session.compliant
    });

    return validation;
  }

  /**
   * Validate BUILD step
   */
  validateBuild(build) {
    const issues = [];
    let score = 10;

    // Must have error handling
    if (!build.hasErrorHandling) {
      issues.push({
        severity: 'error',
        message: 'Missing error handling',
        fix: 'Add try-catch and error boundaries'
      });
      score -= 3;
    }

    // Must have type safety
    if (!build.isTypeSafe) {
      issues.push({
        severity: 'error',
        message: 'Not type-safe',
        fix: 'Use TypeScript/Swift strict mode'
      });
      score -= 2;
    }

    // Must have documentation
    if (!build.hasDocumentation) {
      issues.push({
        severity: 'warning',
        message: 'Missing documentation',
        fix: 'Add JSDoc/DocComments'
      });
      score -= 1;
    }

    // Should have tests
    if (!build.hasTests) {
      issues.push({
        severity: 'warning',
        message: 'No tests',
        fix: 'Write unit/integration tests'
      });
      score -= 2;
    }

    // Should be accessible
    if (!build.isAccessible) {
      issues.push({
        severity: 'info',
        message: 'Accessibility not verified',
        fix: 'Add ARIA labels and keyboard support'
      });
      score -= 1;
    }

    // Should be responsive
    if (!build.isResponsive) {
      issues.push({
        severity: 'info',
        message: 'Responsiveness not verified',
        fix: 'Test on mobile, tablet, desktop'
      });
      score -= 1;
    }

    return {
      score: Math.max(0, score),
      compliant: score >= this.thresholds.minBuildQuality,
      issues
    };
  }

  /**
   * Calculate overall session quality
   */
  calculateOverallQuality(session) {
    const weights = {
      analyze: 0.2,
      think: 0.3,
      decide: 0.2,
      build: 0.3
    };

    let total = 0;
    for (const [step, weight] of Object.entries(weights)) {
      total += session.steps[step].quality * weight;
    }

    return Math.round(total * 10) / 10;
  }

  /**
   * Update agent compliance statistics
   */
  updateAgentCompliance(agentId, session) {
    if (!this.agentCompliance.has(agentId)) {
      this.agentCompliance.set(agentId, {
        totalSessions: 0,
        compliantSessions: 0,
        averageQuality: 0,
        stepQuality: {
          analyze: [],
          think: [],
          decide: [],
          build: []
        },
        lastSession: null
      });
    }

    const stats = this.agentCompliance.get(agentId);
    stats.totalSessions++;
    
    if (session.compliant) {
      stats.compliantSessions++;
    }

    // Update average quality (exponential moving average)
    stats.averageQuality = 
      0.8 * stats.averageQuality + 0.2 * session.overallQuality;

    // Track step quality
    for (const step of this.requiredSteps) {
      stats.stepQuality[step].push(session.steps[step].quality);
      
      // Keep last 20
      if (stats.stepQuality[step].length > 20) {
        stats.stepQuality[step].shift();
      }
    }

    stats.lastSession = Date.now();
  }

  /**
   * Get session status
   */
  getSessionStatus(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    return {
      id: session.id,
      agentId: session.agentId,
      task: session.task,
      currentStep: session.currentStep,
      progress: this.calculateProgress(session),
      steps: Object.entries(session.steps).map(([name, data]) => ({
        name,
        completed: data.completed,
        quality: data.quality
      })),
      issues: session.issues,
      overallQuality: session.overallQuality,
      compliant: session.compliant,
      duration: session.completedAt ? 
        session.completedAt - session.startedAt : 
        Date.now() - session.startedAt
    };
  }

  /**
   * Calculate session progress
   */
  calculateProgress(session) {
    const completed = this.requiredSteps.filter(step => 
      session.steps[step].completed
    ).length;

    return (completed / this.requiredSteps.length) * 100;
  }

  /**
   * Get agent compliance report
   */
  getAgentReport(agentId) {
    const stats = this.agentCompliance.get(agentId);
    if (!stats) {
      return {
        agentId,
        totalSessions: 0,
        complianceRate: 0,
        message: 'No sessions recorded'
      };
    }

    const complianceRate = stats.totalSessions > 0 ?
      (stats.compliantSessions / stats.totalSessions) * 100 : 0;

    return {
      agentId,
      totalSessions: stats.totalSessions,
      compliantSessions: stats.compliantSessions,
      complianceRate,
      averageQuality: stats.averageQuality,
      stepAverages: {
        analyze: this.average(stats.stepQuality.analyze),
        think: this.average(stats.stepQuality.think),
        decide: this.average(stats.stepQuality.decide),
        build: this.average(stats.stepQuality.build)
      },
      lastSession: stats.lastSession,
      grade: this.calculateGrade(complianceRate, stats.averageQuality)
    };
  }

  /**
   * Calculate average
   */
  average(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  /**
   * Calculate grade
   */
  calculateGrade(complianceRate, quality) {
    const score = (complianceRate + quality * 10) / 2;

    if (score >= 90) return 'A+ (Excellent)';
    if (score >= 80) return 'A (Very Good)';
    if (score >= 70) return 'B (Good)';
    if (score >= 60) return 'C (Acceptable)';
    return 'F (Needs Improvement)';
  }

  /**
   * Get all agents report
   */
  getAllAgentsReport() {
    const reports = [];

    for (const agentId of this.agentCompliance.keys()) {
      reports.push(this.getAgentReport(agentId));
    }

    return reports.sort((a, b) => b.averageQuality - a.averageQuality);
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalSessions: this.sessions.size,
      activeAgents: this.agentCompliance.size,
      overallCompliance: this.calculateOverallCompliance(),
      topPerformers: this.getTopPerformers(3)
    };
  }

  /**
   * Calculate overall compliance
   */
  calculateOverallCompliance() {
    let total = 0;
    let compliant = 0;

    for (const stats of this.agentCompliance.values()) {
      total += stats.totalSessions;
      compliant += stats.compliantSessions;
    }

    return total > 0 ? (compliant / total) * 100 : 0;
  }

  /**
   * Get top performers
   */
  getTopPerformers(count = 3) {
    const reports = this.getAllAgentsReport();
    return reports.slice(0, count).map(r => ({
      agentId: r.agentId,
      quality: r.averageQuality,
      compliance: r.complianceRate,
      grade: r.grade
    }));
  }
}

module.exports = WorkflowEnforcer;

