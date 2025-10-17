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

class AgentCoordinator {
  constructor() {
    this.agents = {
      luna: LunaWithMCP,
      karim: KarimWithMCP,
      scout: ScoutWithMCP
    };

    this.activeRequests = new Map();
    
    logger.info('🎯 Agent Coordinator initialized with 3 agents');
  }

  /**
   * Handle a travel request by coordinating multiple agents
   * @param {Object} request - Travel request
   * @returns {Promise<Object>} Coordinated response
   */
  handleTravelRequest = wrapOrchestrator(async function(request) {
    try {
      const {
        type,
        destination,
        origin,
        budget,
        travelers,
        departureDate,
        returnDate,
        preferences
      } = request;

      const requestId = this.generateRequestId();
      
      logger.info('🎯 Coordinating travel request', {
        requestId,
        type,
        destination
      });

      this.activeRequests.set(requestId, {
        startTime: Date.now(),
        status: 'processing',
        agents: []
      });

      let response = {
        requestId,
        success: true,
        agents: {},
        summary: {}
      };

      // Route request based on type
      switch (type) {
        case 'plan_trip':
          response = await this.coordinateTripPlanning(request, requestId);
          break;

        case 'optimize_budget':
          response = await this.coordinateBudgetOptimization(request, requestId);
          break;

        case 'find_deals':
          response = await this.coordinateDealDiscovery(request, requestId);
          break;

        case 'full_service':
          response = await this.coordinateFullService(request, requestId);
          break;

        default:
          response.success = false;
          response.error = `Unknown request type: ${type}`;
      }

      // Update request status
      const requestInfo = this.activeRequests.get(requestId);
      requestInfo.status = 'completed';
      requestInfo.endTime = Date.now();
      requestInfo.duration = requestInfo.endTime - requestInfo.startTime;

      response.processingTime = requestInfo.duration;

      logger.info('✅ Travel request completed', {
        requestId,
        duration: requestInfo.duration,
        success: response.success
      });

      return response;

    } catch (error) {
      logger.error('❌ Agent coordination failed', {
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        error: error.message
      };
    }
  }, 'agent_coordinator');

  /**
   * Coordinate trip planning (Luna primary)
   */
  coordinateTripPlanning = wrapAsyncOperation(async function(request, requestId) {
    const response = {
      requestId,
      success: true,
      agents: {},
      summary: {}
    };

    // Luna plans the trip
    const lunaPlan = await LunaWithMCP.planTrip(request);
    response.agents.luna = lunaPlan;
    this.trackAgentUsage(requestId, 'luna');

    if (lunaPlan.success) {
      // Karim optimizes the budget
      const karimOptimization = await KarimWithMCP.optimizeBudget({
        ...request,
        currentPlan: lunaPlan.plan
      });
      response.agents.karim = karimOptimization;
      this.trackAgentUsage(requestId, 'karim');

      // Generate summary
      response.summary = {
        destination: request.destination,
        dates: {
          departure: request.departureDate,
          return: request.returnDate
        },
        budget: {
          original: request.budget,
          optimized: karimOptimization.optimization?.optimizedBudget,
          savings: karimOptimization.optimization?.totalPotentialSavings
        },
        flights: lunaPlan.plan?.flights?.length || 0,
        itinerary: lunaPlan.plan?.itinerary?.length || 0
      };
    }

    return response;
  }, 'coordinate_trip_planning');

  /**
   * Coordinate budget optimization (Karim primary)
   */
  coordinateBudgetOptimization = wrapAsyncOperation(async function(request, requestId) {
    const response = {
      requestId,
      success: true,
      agents: {},
      summary: {}
    };

    // Karim optimizes budget
    const karimOptimization = await KarimWithMCP.optimizeBudget(request);
    response.agents.karim = karimOptimization;
    this.trackAgentUsage(requestId, 'karim');

    if (karimOptimization.success) {
      // Scout finds additional deals
      const scoutDeals = await ScoutWithMCP.discoverDeals({
        origins: [request.origin],
        budgetRange: {
          min: 0,
          max: karimOptimization.optimization.optimizedBudget
        },
        interests: request.preferences?.interests
      });
      response.agents.scout = scoutDeals;
      this.trackAgentUsage(requestId, 'scout');

      // Generate summary
      response.summary = {
        originalBudget: request.budget,
        optimizedBudget: karimOptimization.optimization.optimizedBudget,
        totalSavings: karimOptimization.optimization.totalPotentialSavings,
        savingsPercentage: this.calculatePercentage(
          karimOptimization.optimization.totalPotentialSavings,
          request.budget
        ),
        recommendations: karimOptimization.optimization.recommendations.length,
        dealsFound: scoutDeals.deals?.flights?.length || 0
      };
    }

    return response;
  }, 'coordinate_budget_optimization');

  /**
   * Coordinate deal discovery (Scout primary)
   */
  coordinateDealDiscovery = wrapAsyncOperation(async function(request, requestId) {
    const response = {
      requestId,
      success: true,
      agents: {},
      summary: {}
    };

    // Scout discovers deals
    const scoutDeals = await ScoutWithMCP.discoverDeals({
      origins: request.origins || [request.origin],
      budgetRange: request.budgetRange,
      travelMonths: request.travelMonths,
      interests: request.preferences?.interests
    });
    response.agents.scout = scoutDeals;
    this.trackAgentUsage(requestId, 'scout');

    if (scoutDeals.success && scoutDeals.deals.flights.length > 0) {
      // Karim analyzes budget for top deal
      const topDeal = scoutDeals.deals.flights[0];
      const karimAnalysis = await KarimWithMCP.analyzeBudget({
        destination: topDeal.destination,
        budget: request.budgetRange?.max || 2000,
        duration: 7,
        travelers: request.travelers || 1
      });
      response.agents.karim = karimAnalysis;
      this.trackAgentUsage(requestId, 'karim');

      // Generate summary
      response.summary = {
        dealsFound: scoutDeals.deals.flights.length,
        bestDeal: {
          destination: topDeal.destination,
          price: topDeal.price,
          date: topDeal.date,
          dealScore: topDeal.dealScore
        },
        budgetAnalysis: karimAnalysis.breakdown
      };
    }

    return response;
  }, 'coordinate_deal_discovery');

  /**
   * Coordinate full service (all agents)
   */
  coordinateFullService = wrapAsyncOperation(async function(request, requestId) {
    const response = {
      requestId,
      success: true,
      agents: {},
      summary: {}
    };

    // Step 1: Scout finds deals
    const scoutDeals = await ScoutWithMCP.discoverDeals({
      origins: [request.origin],
      budgetRange: { min: 0, max: request.budget },
      interests: request.preferences?.interests
    });
    response.agents.scout = scoutDeals;
    this.trackAgentUsage(requestId, 'scout');

    // Step 2: Luna plans trip for best deal
    if (scoutDeals.success && scoutDeals.deals.flights.length > 0) {
      const bestDeal = scoutDeals.deals.flights[0];
      
      const lunaPlan = await LunaWithMCP.planTrip({
        destination: bestDeal.destinationCode,
        origin: request.origin,
        departureDate: bestDeal.date,
        returnDate: this.calculateReturnDate(bestDeal.date, 7),
        budget: request.budget,
        travelers: request.travelers || 1,
        preferences: request.preferences
      });
      response.agents.luna = lunaPlan;
      this.trackAgentUsage(requestId, 'luna');

      // Step 3: Karim optimizes budget
      if (lunaPlan.success) {
        const karimOptimization = await KarimWithMCP.optimizeBudget({
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
        response.agents.karim = karimOptimization;
        this.trackAgentUsage(requestId, 'karim');

        // Generate comprehensive summary
        response.summary = {
          destination: bestDeal.destination,
          dealPrice: bestDeal.price,
          originalBudget: request.budget,
          optimizedBudget: karimOptimization.optimization?.optimizedBudget,
          totalSavings: karimOptimization.optimization?.totalPotentialSavings,
          flights: lunaPlan.plan?.flights?.length || 0,
          itinerary: lunaPlan.plan?.itinerary || [],
          recommendations: [
            ...scoutDeals.deals.recommendations,
            ...karimOptimization.optimization?.recommendations || []
          ]
        };
      }
    }

    return response;
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
