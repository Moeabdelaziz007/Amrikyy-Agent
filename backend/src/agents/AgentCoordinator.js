/**
 * Agent Coordinator
 * Orchestrates Luna, Karim, and Scout agents with MCP tools
 * Enhanced with LangSmith tracing for complete visibility
 */

const LunaWithMCP = require('./LunaWithMCP');
const KarimWithMCP = require('./KarimWithMCP');
const ScoutWithMCP = require('./ScoutWithMCP');
const logger = require('../utils/logger');
const { wrapOrchestrator, wrapAsyncOperation } = require('../utils/langsmith_helpers');
const redis = require('redis');

// Create and connect Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.connect();

class AgentCoordinator {
  constructor() {
    this.agents = {
      luna: LunaWithMCP,
      karim: KarimWithMCP,
      scout: ScoutWithMCP
    };

    this.activeRequests = new Map();
    
    logger.info('🎯 Agent Coordinator initialized with 3 agents and connected to Redis');
  }

  /**
   * Handle a travel request by coordinating multiple agents
   * @param {Object} request - Travel request
   * @returns {Promise<Object>} Coordinated response
   */
  handleTravelRequest = wrapOrchestrator(async function(request) {
    const requestId = this.generateRequestId();
    logger.info('🎯 Coordinating travel request', {
      requestId,
      type: request.type,
      destination: request.destination
    });

    // Create the initial shared plan object (the "workbench")
    const initialPlan = {
      status: 'planning',
      requestId,
      userId: request.userId,
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      itinerary: {
        destination: request.destination,
        error: null
      },
      budget: {
        initialBudget: request.budget,
        optimizationStatus: 'pending',
        error: null
      },
      deals: {
        foundDeals: [],
        error: null
      }
    };

    try {
      // Save the initial plan to Redis
      await redisClient.set(`plan:${requestId}`, JSON.stringify(initialPlan));

      this.activeRequests.set(requestId, {
        startTime: Date.now(),
        status: 'processing',
        agents: []
      });

      let finalPlan = {};

      // Route request based on type
      switch (request.type) {
        case 'plan_trip':
          finalPlan = await this.coordinateTripPlanning(request, requestId);
          break;

        case 'optimize_budget':
          finalPlan = await this.coordinateBudgetOptimization(request, requestId);
          break;

        case 'find_deals':
          finalPlan = await this.coordinateDealDiscovery(request, requestId);
          break;

        case 'full_service':
          finalPlan = await this.coordinateFullService(request, requestId);
          break;

        default:
          throw new Error(`Unknown request type: ${request.type}`);
      }

      // Update request status
      const requestInfo = this.activeRequests.get(requestId);
      requestInfo.status = 'completed';
      requestInfo.endTime = Date.now();
      requestInfo.duration = requestInfo.endTime - requestInfo.startTime;

      finalPlan.processingTime = requestInfo.duration;

      logger.info('✅ Travel request completed', {
        requestId,
        duration: requestInfo.duration,
        success: true
      });

      return { success: true, ...finalPlan };

    } catch (error) {
      logger.error('❌ Agent coordination failed', {
        requestId,
        error: error.message,
        stack: error.stack
      });

      // Update the plan in Redis with the error
      const currentPlanJSON = await redisClient.get(`plan:${requestId}`);
      const currentPlan = currentPlanJSON ? JSON.parse(currentPlanJSON) : initialPlan;
      currentPlan.status = 'failed';
      currentPlan.error = error.message;
      currentPlan.lastUpdatedAt = new Date().toISOString();
      await redisClient.set(`plan:${requestId}`, JSON.stringify(currentPlan));

      return {
        success: false,
        requestId,
        error: error.message
      };
    }
  }, 'agent_coordinator');

  /**
   * Coordinate trip planning (Luna primary)
   */
  coordinateTripPlanning = wrapAsyncOperation(async function(request, requestId) {
    // Step 1: Fetch the initial plan from Redis
    let planJSON = await redisClient.get(`plan:${requestId}`);
    let plan = JSON.parse(planJSON);

    // Step 2: Luna plans the trip
    const lunaResult = await LunaWithMCP.planTrip(request);
    this.trackAgentUsage(requestId, 'luna');

    // Update plan with Luna's output
    plan.itinerary = lunaResult.success ? lunaResult.plan : { error: lunaResult.error };
    plan.lastUpdatedAt = new Date().toISOString();
    await redisClient.set(`plan:${requestId}`, JSON.stringify(plan));

    if (!lunaResult.success) {
      throw new Error('Luna failed to create a plan.');
    }

    // Step 3: Karim optimizes the budget based on Luna's plan
    const karimResult = await KarimWithMCP.optimizeBudget({
      ...request,
      currentPlan: lunaResult.plan
    });
    this.trackAgentUsage(requestId, 'karim');

    // Update plan with Karim's output
    plan.budget.optimizationStatus = karimResult.success ? 'complete' : 'failed';
    plan.budget.optimizedPlan = karimResult.success ? karimResult.optimization : { error: karimResult.error };
    plan.lastUpdatedAt = new Date().toISOString();
    plan.status = 'complete'; // Mark the overall plan as complete
    await redisClient.set(`plan:${requestId}`, JSON.stringify(plan));

    if (!karimResult.success) {
        // Even if Karim fails, we can still return Luna's work
        logger.warn('Karim failed to optimize budget, but returning Luna\'s plan.', { requestId });
    }

    // Step 4: Return the final, consolidated plan from Redis
    const finalPlanJSON = await redisClient.get(`plan:${requestId}`);
    return JSON.parse(finalPlanJSON);
  }, 'coordinate_trip_planning');

  /**
   * Coordinate budget optimization (Karim primary)
   */
  coordinateBudgetOptimization = wrapAsyncOperation(async function(request, requestId) {
    // Step 1: Fetch the plan from Redis
    let planJSON = await redisClient.get(`plan:${requestId}`);
    let plan = JSON.parse(planJSON);

    // Step 2: Karim optimizes the budget
    const karimResult = await KarimWithMCP.optimizeBudget(request);
    this.trackAgentUsage(requestId, 'karim');

    // Update plan with Karim's output
    plan.budget.optimizationStatus = karimResult.success ? 'complete' : 'failed';
    plan.budget.optimizedPlan = karimResult.success ? karimResult.optimization : { error: karimResult.error };
    plan.lastUpdatedAt = new Date().toISOString();
    await redisClient.set(`plan:${requestId}`, JSON.stringify(plan));

    if (!karimResult.success) {
      throw new Error('Karim failed to optimize budget.');
    }

    // Step 3: Scout finds additional deals based on the optimized budget
    const scoutResult = await ScoutWithMCP.discoverDeals({
      origins: [request.origin],
      budgetRange: {
        min: 0,
        max: karimResult.optimization.optimizedBudget
      },
      interests: request.preferences?.interests
    });
    this.trackAgentUsage(requestId, 'scout');

    // Update plan with Scout's output
    plan.deals = scoutResult.success ? scoutResult.deals : { error: scoutResult.error };
    plan.lastUpdatedAt = new Date().toISOString();
    plan.status = 'complete';
    await redisClient.set(`plan:${requestId}`, JSON.stringify(plan));

    // Step 4: Return the final plan
    const finalPlanJSON = await redisClient.get(`plan:${requestId}`);
    return JSON.parse(finalPlanJSON);
  }, 'coordinate_budget_optimization');

  /**
   * Coordinate deal discovery (Scout primary)
   */
  coordinateDealDiscovery = wrapAsyncOperation(async function(request, requestId) {
    // Step 1: Fetch the plan from Redis
    let planJSON = await redisClient.get(`plan:${requestId}`);
    let plan = JSON.parse(planJSON);

    // Step 2: Scout discovers deals
    const scoutResult = await ScoutWithMCP.discoverDeals({
      origins: request.origins || [request.origin],
      budgetRange: request.budgetRange,
      travelMonths: request.travelMonths,
      interests: request.preferences?.interests
    });
    this.trackAgentUsage(requestId, 'scout');

    // Update plan with Scout's output
    plan.deals = scoutResult.success ? scoutResult.deals : { error: scoutResult.error };
    plan.lastUpdatedAt = new Date().toISOString();
    await redisClient.set(`plan:${requestId}`, JSON.stringify(plan));

    if (!scoutResult.success || scoutResult.deals.flights.length === 0) {
      logger.warn('Scout found no deals, ending coordination early.', { requestId });
      plan.status = 'complete';
      await redisClient.set(`plan:${requestId}`, JSON.stringify(plan));
      const finalPlanJSON = await redisClient.get(`plan:${requestId}`);
      return JSON.parse(finalPlanJSON);
    }

    // Step 3: Karim analyzes budget for the top deal found by Scout
    const topDeal = scoutResult.deals.flights[0];
    const karimResult = await KarimWithMCP.analyzeBudget({
      destination: topDeal.destination,
      budget: request.budgetRange?.max || 2000,
      duration: 7,
      travelers: request.travelers || 1
    });
    this.trackAgentUsage(requestId, 'karim');

    // Update plan with Karim's analysis
    plan.budget.analysis = karimResult.success ? karimResult.breakdown : { error: karimResult.error };
    plan.lastUpdatedAt = new Date().toISOString();
    plan.status = 'complete';
    await redisClient.set(`plan:${requestId}`, JSON.stringify(plan));

    // Step 4: Return the final plan
    const finalPlanJSON = await redisClient.get(`plan:${requestId}`);
    return JSON.parse(finalPlanJSON);
  }, 'coordinate_deal_discovery');

  /**
   * Coordinate full service (all agents)
   */
  coordinateFullService = wrapAsyncOperation(async function(request, requestId) {
    // Step 1: Fetch the initial plan from Redis
    let planJSON = await redisClient.get(`plan:${requestId}`);
    let plan = JSON.parse(planJSON);

    // Step 2: Scout finds deals
    const scoutResult = await ScoutWithMCP.discoverDeals({
      origins: [request.origin],
      budgetRange: { min: 0, max: request.budget },
      interests: request.preferences?.interests
    });
    this.trackAgentUsage(requestId, 'scout');
    plan.deals = scoutResult.success ? scoutResult.deals : { error: scoutResult.error };
    plan.lastUpdatedAt = new Date().toISOString();
    await redisClient.set(`plan:${requestId}`, JSON.stringify(plan));

    if (!scoutResult.success || scoutResult.deals.flights.length === 0) {
      logger.warn('Scout found no deals for full service, ending coordination early.', { requestId });
      plan.status = 'complete';
      await redisClient.set(`plan:${requestId}`, JSON.stringify(plan));
      const finalPlanJSON = await redisClient.get(`plan:${requestId}`);
      return JSON.parse(finalPlanJSON);
    }

    // Step 3: Luna plans trip for the best deal
    const bestDeal = scoutResult.deals.flights[0];
    const lunaResult = await LunaWithMCP.planTrip({
      destination: bestDeal.destinationCode,
      origin: request.origin,
      departureDate: bestDeal.date,
      returnDate: this.calculateReturnDate(bestDeal.date, 7),
      budget: request.budget,
      travelers: request.travelers || 1,
      preferences: request.preferences
    });
    this.trackAgentUsage(requestId, 'luna');
    plan.itinerary = lunaResult.success ? lunaResult.plan : { error: lunaResult.error };
    plan.lastUpdatedAt = new Date().toISOString();
    await redisClient.set(`plan:${requestId}`, JSON.stringify(plan));

    if (!lunaResult.success) {
      throw new Error('Luna failed to create a plan for the full service request.');
    }

    // Step 4: Karim optimizes the final budget
    const karimResult = await KarimWithMCP.optimizeBudget({
      destination: bestDeal.destinationCode,
      origin: request.origin,
      budget: request.budget,
      travelers: request.travelers || 1,
      flexibleDates: true,
      dateRange: {
        start: bestDeal.date,
        end: this.calculateReturnDate(bestDeal.date, 14),
        duration: 7
      }
    });
    this.trackAgentUsage(requestId, 'karim');
    plan.budget.optimizationStatus = karimResult.success ? 'complete' : 'failed';
    plan.budget.optimizedPlan = karimResult.success ? karimResult.optimization : { error: karimResult.error };
    plan.lastUpdatedAt = new Date().toISOString();
    plan.status = 'complete';
    await redisClient.set(`plan:${requestId}`, JSON.stringify(plan));

    // Step 5: Return the final, consolidated plan
    const finalPlanJSON = await redisClient.get(`plan:${requestId}`);
    return JSON.parse(finalPlanJSON);
  }, 'coordinate_full_service');

  /**
   * Track agent usage
   */
  trackAgentUsage(requestId, agentName) {
    const requestInfo = this.activeRequests.get(requestId);
    if (requestInfo) {
      requestInfo.agents.push({
        name: agentName,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Calculate percentage
   */
  calculatePercentage(value, total) {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(2);
  }

  /**
   * Calculate return date
   */
  calculateReturnDate(departureDate, daysLater) {
    const [day, month, year] = departureDate.split('/');
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + daysLater);
    
    const newDay = String(date.getDate()).padStart(2, '0');
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newYear = date.getFullYear();
    
    return `${newDay}/${newMonth}/${newYear}`;
  }

  /**
   * Generate request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all agent capabilities
   */
  getAllCapabilities() {
    return {
      luna: LunaWithMCP.getCapabilities(),
      karim: KarimWithMCP.getCapabilities(),
      scout: ScoutWithMCP.getCapabilities()
    };
  }

  /**
   * Get active requests
   */
  getActiveRequests() {
    return Array.from(this.activeRequests.entries()).map(([id, info]) => ({
      requestId: id,
      ...info
    }));
  }
}

module.exports = new AgentCoordinator();
