/**
 * Travel Agent SquadOS - Collaborative Multi-Agent System
 * Orchestrates Luna, Karim, and Zara for comprehensive travel planning
 * Implements the squadOS architecture with inter-agent communication
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

// Import our specialized agents
const LunaTripArchitect = require('./LunaTripArchitect');
const KarimBudgetOptimizer = require('./KarimBudgetOptimizer');
const ZaraResearchSpecialist = require('./ZaraResearchSpecialist');

class TravelAgentSquadOS extends EventEmitter {
  constructor(manager) {
    super();
    this.squadId = 'travel-agent-squados';
    this.role = 'collaborative_travel_planner';
    this.status = 'initializing';
    this.manager = manager;
    
    // Squad capabilities
    this.capabilities = [
      'comprehensive_trip_planning',
      'collaborative_itinerary_design',
      'real_time_budget_optimization',
      'fact_checked_research',
      'multi_agent_coordination',
      'workflow_management',
      'quality_assurance',
      'user_experience_optimization'
    ];

    // Initialize specialized agents
    this.agents = {
      luna: null,
      karim: null,
      zara: null
    };

    // Squad coordination
    this.activeProjects = new Map();
    this.workflowStates = new Map();
    this.interAgentMessages = [];
    
    // Performance metrics
    this.metrics = {
      tripsPlanned: 0,
      collaborationCycles: 0,
      averagePlanningTime: 0,
      userSatisfactionScore: 0,
      successRate: 0
    };

    this.initializeSquadOS();
  }

  /**
   * Initialize the squadOS system
   */
  async initializeSquadOS() {
    try {
      console.log('🚀 Initializing Travel Agent SquadOS...');
      
      // Initialize Luna - Trip Architect
      console.log('🌙 Initializing Luna...');
      this.agents.luna = new LunaTripArchitect(this);
      await this.setupAgentListeners(this.agents.luna, 'luna');
      
      // Initialize Karim - Budget Optimizer
      console.log('💰 Initializing Karim...');
      this.agents.karim = new KarimBudgetOptimizer(this);
      await this.setupAgentListeners(this.agents.karim, 'karim');
      
      // Initialize Zara - Research Specialist
      console.log('🔍 Initializing Zara...');
      this.agents.zara = new ZaraResearchSpecialist(this);
      await this.setupAgentListeners(this.agents.zara, 'zara');
      
      // Initialize workflow management
      this.initializeWorkflowManagement();
      
      // Initialize inter-agent communication
      this.initializeInterAgentCommunication();
      
      this.status = 'ready';
      console.log('✅ Travel Agent SquadOS initialized successfully');
      
      this.emit('squadReady', {
        squadId: this.squadId,
        agents: Object.keys(this.agents).length,
        capabilities: this.capabilities.length,
        status: this.status
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize SquadOS:', error);
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Setup listeners for individual agents
   */
  async setupAgentListeners(agent, agentName) {
    agent.on('agentReady', (data) => {
      console.log(`✅ ${agentName} ready:`, data);
    });

    agent.on('taskComplete', (data) => {
      this.handleTaskComplete(agentName, data);
    });

    agent.on('taskError', (data) => {
      this.handleTaskError(agentName, data);
    });

    agent.on('interAgentMessage', (data) => {
      this.handleInterAgentMessage(agentName, data);
    });
  }

  /**
   * Initialize workflow management system
   */
  initializeWorkflowManagement() {
    this.workflowStates.set('IDLE', {
      description: 'Squad waiting for new requests',
      nextStates: ['PLANNING']
    });

    this.workflowStates.set('PLANNING', {
      description: 'Luna creating initial itinerary',
      nextStates: ['VALIDATION', 'ERROR']
    });

    this.workflowStates.set('VALIDATION', {
      description: 'Karim and Zara validating and researching',
      nextStates: ['REFINEMENT', 'ERROR']
    });

    this.workflowStates.set('REFINEMENT', {
      description: 'Luna refining based on feedback',
      nextStates: ['FINALIZATION', 'ERROR']
    });

    this.workflowStates.set('FINALIZATION', {
      description: 'Final quality check and presentation',
      nextStates: ['COMPLETED', 'ERROR']
    });

    this.workflowStates.set('COMPLETED', {
      description: 'Trip planning completed successfully',
      nextStates: ['IDLE']
    });

    this.workflowStates.set('ERROR', {
      description: 'Error state - requires intervention',
      nextStates: ['IDLE']
    });

    this.currentState = 'IDLE';
    console.log('🔄 Workflow management initialized');
  }

  /**
   * Initialize inter-agent communication system
   */
  initializeInterAgentCommunication() {
    this.messageBus = {
      publish: (message) => {
        this.interAgentMessages.push({
          ...message,
          timestamp: Date.now(),
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
        this.processMessage(message);
      },
      
      subscribe: (agentName, callback) => {
        // Agents can subscribe to specific message types
        this.messageHandlers = this.messageHandlers || {};
        this.messageHandlers[agentName] = callback;
      }
    };

    console.log('📡 Inter-agent communication initialized');
  }

  /**
   * Main method: Plan comprehensive trip using squadOS
   */
  async planTrip(request) {
    const startTime = Date.now();
    const projectId = `squad_${request.destination}_${Date.now()}`;
    
    try {
      console.log(`🚀 SquadOS planning trip to ${request.destination}...`);
      
      // Create squad project
      const project = {
        id: projectId,
        destination: request.destination,
        duration: request.duration || 7,
        budget: request.budget || 2000,
        travelers: request.travelers || 1,
        interests: request.interests || [],
        budgetLevel: request.budgetLevel || 'midrange',
        status: 'planning',
        workflowState: 'PLANNING',
        createdAt: new Date(),
        agents: {
          luna: { status: 'idle', tasks: [] },
          karim: { status: 'idle', tasks: [] },
          zara: { status: 'idle', tasks: [] }
        }
      };

      this.activeProjects.set(projectId, project);
      this.transitionToState('PLANNING', projectId);

      // Phase 1: Luna creates initial itinerary
      console.log('🌙 Phase 1: Luna designing initial itinerary...');
      const lunaResult = await this.agents.luna.designTripItinerary({
        destination: request.destination,
        duration: request.duration,
        budget: request.budget,
        travelers: request.travelers,
        interests: request.interests,
        budgetLevel: request.budgetLevel
      });

      project.itineraryV1 = lunaResult.itinerary;
      project.agents.luna.status = 'completed';
      project.agents.luna.tasks.push('initial_itinerary_design');

      // Phase 2: Parallel validation by Karim and Zara
      console.log('💰🔍 Phase 2: Karim and Zara validating in parallel...');
      this.transitionToState('VALIDATION', projectId);

      const [karimResult, zaraResult] = await Promise.all([
        this.agents.karim.analyzeBudget({
          destination: request.destination,
          budget: request.budget,
          duration: request.duration,
          travelers: request.travelers,
          budgetLevel: request.budgetLevel
        }),
        this.agents.zara.factCheckItinerary({
          itineraryId: projectId,
          itinerary: project.itineraryV1
        })
      ]);

      project.budgetAnalysis = karimResult.budget;
      project.researchReport = zaraResult.report;
      project.agents.karim.status = 'completed';
      project.agents.karim.tasks.push('budget_analysis');
      project.agents.zara.status = 'completed';
      project.agents.zara.tasks.push('fact_checking');

      // Phase 3: Luna refines based on feedback
      console.log('🌙 Phase 3: Luna refining itinerary based on feedback...');
      this.transitionToState('REFINEMENT', projectId);

      const refinementRequest = this.createRefinementRequest(
        project.itineraryV1,
        karimResult.budget,
        zaraResult.report
      );

      const lunaRefinement = await this.agents.luna.designTripItinerary(refinementRequest);
      project.itineraryV2 = lunaRefinement.itinerary;
      project.agents.luna.tasks.push('itinerary_refinement');

      // Phase 4: Final quality assurance
      console.log('✅ Phase 4: Final quality assurance...');
      this.transitionToState('FINALIZATION', projectId);

      const finalValidation = await this.performFinalValidation(project);
      
      // Phase 5: Complete and present
      console.log('🎉 Phase 5: Finalizing and presenting results...');
      this.transitionToState('COMPLETED', projectId);

      const finalResult = await this.createFinalTripPlan(project, finalValidation);

      // Complete project
      project.status = 'completed';
      project.finalResult = finalResult;
      project.planningTime = Date.now() - startTime;
      project.workflowState = 'COMPLETED';
      
      this.activeProjects.delete(projectId);
      this.completedProjects.set(projectId, project);

      // Update metrics
      this.metrics.tripsPlanned++;
      this.metrics.collaborationCycles += 2; // Luna → Karim/Zara → Luna
      this.updateAveragePlanningTime(project.planningTime);
      this.updateSuccessRate(true);

      console.log(`🎉 SquadOS trip planning completed successfully!`);
      
      return {
        success: true,
        projectId,
        tripPlan: finalResult,
        planningTime: project.planningTime,
        collaborationSummary: this.generateCollaborationSummary(project),
        qualityMetrics: this.generateQualityMetrics(project),
        recommendations: this.generateFinalRecommendations(project)
      };

    } catch (error) {
      console.error('❌ SquadOS trip planning failed:', error);
      this.transitionToState('ERROR', projectId);
      this.updateSuccessRate(false);
      throw new Error(`SquadOS planning failed: ${error.message}`);
    }
  }

  /**
   * Create refinement request based on feedback
   */
  createRefinementRequest(originalItinerary, budgetAnalysis, researchReport) {
    const refinement = {
      destination: originalItinerary.destination,
      duration: originalItinerary.duration,
      budget: budgetAnalysis.totalBudget,
      travelers: originalItinerary.travelers || 1,
      interests: originalItinerary.interests || [],
      budgetLevel: budgetAnalysis.budgetLevel,
      constraints: [],
      modifications: []
    };

    // Add budget constraints
    if (budgetAnalysis.savingsIdentified > 0) {
      refinement.constraints.push({
        type: 'budget_optimization',
        message: `Optimize for savings of $${budgetAnalysis.savingsIdentified}`,
        priority: 'high'
      });
    }

    // Add research constraints
    for (const issue of researchReport.issues) {
      refinement.constraints.push({
        type: 'fact_verification',
        message: issue.issue,
        priority: issue.severity === 'high' ? 'high' : 'medium'
      });
    }

    // Add booking modifications
    for (const bookingLink of researchReport.bookingLinks) {
      refinement.modifications.push({
        type: 'booking_link',
        activity: bookingLink.activity,
        url: bookingLink.bookingUrl,
        platform: bookingLink.platform
      });
    }

    return refinement;
  }

  /**
   * Perform final validation
   */
  async performFinalValidation(project) {
    const validation = {
      budgetCheck: this.validateBudget(project),
      logisticsCheck: this.validateLogistics(project),
      factCheck: this.validateFacts(project),
      qualityScore: 0
    };

    // Calculate overall quality score
    validation.qualityScore = (
      validation.budgetCheck.score +
      validation.logisticsCheck.score +
      validation.factCheck.score
    ) / 3;

    return validation;
  }

  /**
   * Validate budget compliance
   */
  validateBudget(project) {
    const budgetVariance = Math.abs(project.budgetAnalysis.estimatedTotal - project.budget);
    const variancePercentage = (budgetVariance / project.budget) * 100;
    
    let score = 100;
    if (variancePercentage > 20) score = 60;
    else if (variancePercentage > 10) score = 80;

    return {
      score,
      variance: budgetVariance,
      percentage: variancePercentage,
      compliant: variancePercentage < 15
    };
  }

  /**
   * Validate logistics
   */
  validateLogistics(project) {
    const logisticsIssues = project.researchReport.issues.filter(issue => 
      issue.severity === 'high'
    ).length;

    let score = 100;
    if (logisticsIssues > 2) score = 60;
    else if (logisticsIssues > 0) score = 80;

    return {
      score,
      issues: logisticsIssues,
      compliant: logisticsIssues === 0
    };
  }

  /**
   * Validate facts
   */
  validateFacts(project) {
    const accuracy = project.researchReport.confidence;
    
    return {
      score: accuracy,
      accuracy,
      compliant: accuracy > 85
    };
  }

  /**
   * Create final trip plan
   */
  async createFinalTripPlan(project, validation) {
    const tripPlan = {
      destination: project.destination,
      duration: project.duration,
      travelers: project.travelers,
      budget: project.budgetAnalysis,
      itinerary: project.itineraryV2,
      research: project.researchReport,
      quality: {
        score: validation.qualityScore,
        budgetCompliant: validation.budgetCheck.compliant,
        logisticsCompliant: validation.logisticsCheck.compliant,
        factsCompliant: validation.factCheck.compliant
      },
      booking: {
        links: project.researchReport.bookingLinks,
        alternatives: project.budgetAnalysis.alternatives
      },
      recommendations: this.generateFinalRecommendations(project),
      emergency: {
        contacts: project.researchReport.emergencyContacts || [],
        insurance: 'Recommended',
        backupPlans: 'Included in itinerary'
      }
    };

    // Store final trip plan
    await this.storeTripPlan(tripPlan, project);

    return tripPlan;
  }

  /**
   * Generate collaboration summary
   */
  generateCollaborationSummary(project) {
    return {
      agentsInvolved: Object.keys(this.agents).length,
      workflowPhases: ['PLANNING', 'VALIDATION', 'REFINEMENT', 'FINALIZATION'],
      iterations: 2, // Initial design + refinement
      collaborationCycles: 2,
      interAgentMessages: this.interAgentMessages.length,
      qualityImprovements: this.calculateQualityImprovements(project)
    };
  }

  /**
   * Calculate quality improvements
   */
  calculateQualityImprovements(project) {
    const improvements = {
      budgetOptimization: project.budgetAnalysis.savingsIdentified,
      factAccuracy: project.researchReport.confidence,
      logisticsVerified: project.researchReport.issues.length === 0,
      bookingLinksFound: project.researchReport.bookingLinks.length
    };

    return improvements;
  }

  /**
   * Generate quality metrics
   */
  generateQualityMetrics(project) {
    return {
      planningTime: project.planningTime,
      agentUtilization: this.calculateAgentUtilization(project),
      collaborationEfficiency: this.calculateCollaborationEfficiency(project),
      userSatisfaction: this.estimateUserSatisfaction(project),
      overallQuality: project.finalValidation?.qualityScore || 0
    };
  }

  /**
   * Calculate agent utilization
   */
  calculateAgentUtilization(project) {
    const totalTasks = Object.values(project.agents)
      .reduce((sum, agent) => sum + agent.tasks.length, 0);
    
    return {
      luna: project.agents.luna.tasks.length,
      karim: project.agents.karim.tasks.length,
      zara: project.agents.zara.tasks.length,
      total: totalTasks
    };
  }

  /**
   * Calculate collaboration efficiency
   */
  calculateCollaborationEfficiency(project) {
    const planningTime = project.planningTime;
    const agentsUsed = Object.keys(this.agents).length;
    const tasksCompleted = Object.values(project.agents)
      .reduce((sum, agent) => sum + agent.tasks.length, 0);
    
    return {
      timePerAgent: planningTime / agentsUsed,
      timePerTask: planningTime / tasksCompleted,
      parallelProcessing: true,
      efficiency: tasksCompleted / planningTime * 1000 // tasks per second
    };
  }

  /**
   * Estimate user satisfaction
   */
  estimateUserSatisfaction(project) {
    let score = 100;
    
    // Deduct for budget variance
    const budgetVariance = Math.abs(project.budgetAnalysis.estimatedTotal - project.budget);
    if (budgetVariance > project.budget * 0.2) score -= 20;
    else if (budgetVariance > project.budget * 0.1) score -= 10;
    
    // Deduct for research issues
    const criticalIssues = project.researchReport.issues.filter(i => i.severity === 'high').length;
    score -= criticalIssues * 15;
    
    // Deduct for fact accuracy
    if (project.researchReport.confidence < 90) score -= 10;
    
    return Math.max(0, score);
  }

  /**
   * Generate final recommendations
   */
  generateFinalRecommendations(project) {
    const recommendations = [];
    
    // Budget recommendations
    if (project.budgetAnalysis.savingsIdentified > 0) {
      recommendations.push({
        type: 'budget',
        message: `Save $${project.budgetAnalysis.savingsIdentified} with optimized choices`,
        priority: 'high'
      });
    }
    
    // Research recommendations
    for (const rec of project.researchReport.recommendations) {
      recommendations.push({
        type: 'research',
        message: rec,
        priority: 'medium'
      });
    }
    
    // General recommendations
    recommendations.push({
      type: 'general',
      message: 'Book accommodations and activities in advance',
      priority: 'high'
    });
    
    recommendations.push({
      type: 'general',
      message: 'Download offline maps and translation apps',
      priority: 'medium'
    });
    
    return recommendations;
  }

  /**
   * Transition to new workflow state
   */
  transitionToState(newState, projectId) {
    const project = this.activeProjects.get(projectId);
    if (project) {
      project.workflowState = newState;
      console.log(`🔄 Project ${projectId} transitioned to state: ${newState}`);
    }
    this.currentState = newState;
  }

  /**
   * Handle task completion from agents
   */
  handleTaskComplete(agentName, data) {
    console.log(`✅ ${agentName} completed task:`, data.taskType);
    this.metrics.collaborationCycles++;
  }

  /**
   * Handle task errors from agents
   */
  handleTaskError(agentName, data) {
    console.error(`❌ ${agentName} task error:`, data.error);
    this.transitionToState('ERROR', data.projectId);
  }

  /**
   * Handle inter-agent messages
   */
  handleInterAgentMessage(fromAgent, data) {
    console.log(`📡 Message from ${fromAgent}:`, data.message);
    this.interAgentMessages.push({
      from: fromAgent,
      to: data.to,
      message: data.message,
      timestamp: Date.now()
    });
  }

  /**
   * Process messages on the message bus
   */
  processMessage(message) {
    // Route messages to appropriate handlers
    if (this.messageHandlers && this.messageHandlers[message.to]) {
      this.messageHandlers[message.to](message);
    }
  }

  /**
   * Update average planning time
   */
  updateAveragePlanningTime(newTime) {
    const total = this.metrics.averagePlanningTime * (this.metrics.tripsPlanned - 1) + newTime;
    this.metrics.averagePlanningTime = total / this.metrics.tripsPlanned;
  }

  /**
   * Update success rate
   */
  updateSuccessRate(success) {
    const totalAttempts = this.metrics.tripsPlanned;
    const currentSuccesses = this.metrics.successRate * totalAttempts / 100;
    const newSuccesses = success ? currentSuccesses + 1 : currentSuccesses;
    this.metrics.successRate = (newSuccesses / (totalAttempts + 1)) * 100;
  }

  // Data persistence methods
  async storeTripPlan(tripPlan, project) {
    try {
      const dataDir = path.join('backend', 'data', 'trip_plans');
      await fs.mkdir(dataDir, { recursive: true });
      
      const filename = `squados_trip_${project.id}.json`;
      const filepath = path.join(dataDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify({ tripPlan, project }, null, 2));
      console.log(`💾 SquadOS trip plan stored: ${filename}`);
      
    } catch (error) {
      console.error('❌ Failed to store trip plan:', error);
    }
  }

  // Agent status and metrics
  async getSquadStatus() {
    return {
      squad_id: this.squadId,
      role: this.role,
      status: this.status,
      current_state: this.currentState,
      capabilities: this.capabilities.length,
      active_projects: this.activeProjects.size,
      completed_projects: this.completedProjects.size,
      agents: {
        luna: await this.agents.luna.getAgentStatus(),
        karim: await this.agents.karim.getAgentStatus(),
        zara: await this.agents.zara.getAgentStatus()
      },
      metrics: this.metrics
    };
  }

  async getSquadMetrics() {
    return {
      trips_planned: this.metrics.tripsPlanned,
      collaboration_cycles: this.metrics.collaborationCycles,
      average_planning_time: this.metrics.averagePlanningTime,
      user_satisfaction_score: this.metrics.userSatisfactionScore,
      success_rate: this.metrics.successRate,
      active_projects: this.activeProjects.size,
      inter_agent_messages: this.interAgentMessages.length,
      uptime: Date.now() - (this.startTime || Date.now())
    };
  }
}

module.exports = TravelAgentSquadOS;
