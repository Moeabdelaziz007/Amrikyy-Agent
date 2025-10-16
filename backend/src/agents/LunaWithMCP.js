/**
 * Luna Trip Architect - Enhanced with MCP Tools
 * AI agent specialized in trip planning with real-time flight/hotel search
 */

const TravelMCPServer = require('../mcp/TravelMCPServer');
const logger = require('../utils/logger');

class LunaWithMCP {
  constructor() {
    this.name = 'Luna';
    this.role = 'Trip Architect';
    this.description = 'AI travel planner with real-time search capabilities';
    this.capabilities = [
      'flight_search',
      'price_comparison',
      'budget_analysis',
      'itinerary_planning',
      'destination_research'
    ];
    
    logger.info('✨ Luna initialized with MCP tools');
  }

  /**
   * Plan a trip using MCP tools
   * @param {Object} request - Trip planning request
   * @returns {Promise<Object>} Trip plan
   */
  async planTrip(request) {
    try {
      const {
        destination,
        origin,
        departureDate,
        returnDate,
        budget,
        travelers,
        preferences
      } = request;

      logger.info('🌙 Luna planning trip', {
        destination,
        origin,
        budget
      });

      const plan = {
        destination,
        origin,
        dates: { departure: departureDate, return: returnDate },
        travelers,
        budget,
        recommendations: []
      };

      // Step 1: Search for flights
      const flightSearch = await this.searchFlights({
        from: origin,
        to: destination,
        departureDate,
        returnDate,
        adults: travelers
      });

      if (flightSearch.success) {
        plan.flights = flightSearch.flights;
        plan.recommendations.push({
          type: 'flight',
          message: `Found ${flightSearch.flights.length} flight options`,
          bestPrice: flightSearch.flights[0]?.price
        });
      }

      // Step 2: Analyze budget
      const budgetAnalysis = await this.analyzeBudget({
        destination,
        budget,
        duration: this.calculateDuration(departureDate, returnDate),
        travelers
      });

      if (budgetAnalysis.success) {
        plan.budgetBreakdown = budgetAnalysis.breakdown;
        plan.recommendations.push({
          type: 'budget',
          message: 'Budget analysis complete',
          perDay: budgetAnalysis.perDay,
          perPerson: budgetAnalysis.perPerson
        });
      }

      // Step 3: Generate itinerary suggestions
      plan.itinerary = await this.generateItinerary({
        destination,
        duration: this.calculateDuration(departureDate, returnDate),
        budget: budgetAnalysis.breakdown,
        preferences
      });

      logger.info('✅ Luna completed trip plan', {
        destination,
        flightCount: plan.flights?.length || 0
      });

      return {
        success: true,
        agent: 'Luna',
        plan
      };

    } catch (error) {
      logger.error('❌ Luna trip planning failed', {
        error: error.message
      });

      return {
        success: false,
        agent: 'Luna',
        error: error.message
      };
    }
  }

  /**
   * Search flights using MCP
   */
  async searchFlights(params) {
    try {
      const result = await TravelMCPServer.callTool('search_flights', params, {
        agentId: 'luna',
        agentName: this.name
      });

      return {
        success: result.success,
        flights: result.data || []
      };

    } catch (error) {
      logger.error('❌ Luna flight search failed', {
        error: error.message
      });

      return {
        success: false,
        flights: []
      };
    }
  }

  /**
   * Compare prices across dates using MCP
   */
  async comparePrices(params) {
    try {
      const result = await TravelMCPServer.callTool('compare_prices', params, {
        agentId: 'luna',
        agentName: this.name
      });

      return {
        success: result.success,
        comparison: result.data || {}
      };

    } catch (error) {
      logger.error('❌ Luna price comparison failed', {
        error: error.message
      });

      return {
        success: false,
        comparison: {}
      };
    }
  }

  /**
   * Analyze budget using MCP
   */
  async analyzeBudget(params) {
    try {
      const result = await TravelMCPServer.callTool('analyze_budget', params, {
        agentId: 'luna',
        agentName: this.name
      });

      return {
        success: result.success,
        ...result.data
      };

    } catch (error) {
      logger.error('❌ Luna budget analysis failed', {
        error: error.message
      });

      return {
        success: false
      };
    }
  }

  /**
   * Search locations using MCP
   */
  async searchLocations(query) {
    try {
      const result = await TravelMCPServer.callTool('search_locations', { query }, {
        agentId: 'luna',
        agentName: this.name
      });

      return {
        success: result.success,
        locations: result.data || []
      };

    } catch (error) {
      logger.error('❌ Luna location search failed', {
        error: error.message
      });

      return {
        success: false,
        locations: []
      };
    }
  }

  /**
   * Generate itinerary suggestions
   */
  async generateItinerary(params) {
    const { destination, duration, budget, preferences } = params;

    const itinerary = [];

    // Generate day-by-day suggestions
    for (let day = 1; day <= duration; day++) {
      const dayPlan = {
        day,
        activities: [],
        estimatedCost: budget.activities?.perDay || 0
      };

      if (day === 1) {
        dayPlan.activities.push({
          time: 'Morning',
          activity: 'Arrival and hotel check-in',
          type: 'logistics'
        });
        dayPlan.activities.push({
          time: 'Afternoon',
          activity: `Explore ${destination} city center`,
          type: 'sightseeing'
        });
      } else if (day === duration) {
        dayPlan.activities.push({
          time: 'Morning',
          activity: 'Last-minute shopping and souvenirs',
          type: 'shopping'
        });
        dayPlan.activities.push({
          time: 'Afternoon',
          activity: 'Hotel checkout and departure',
          type: 'logistics'
        });
      } else {
        dayPlan.activities.push({
          time: 'Morning',
          activity: 'Visit main attractions',
          type: 'sightseeing'
        });
        dayPlan.activities.push({
          time: 'Afternoon',
          activity: 'Local cuisine experience',
          type: 'dining'
        });
        dayPlan.activities.push({
          time: 'Evening',
          activity: 'Cultural activities or entertainment',
          type: 'entertainment'
        });
      }

      itinerary.push(dayPlan);
    }

    return itinerary;
  }

  /**
   * Calculate trip duration in days
   */
  calculateDuration(departureDate, returnDate) {
    const departure = new Date(departureDate);
    const returnD = new Date(returnDate);
    const diffTime = Math.abs(returnD - departure);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  }

  /**
   * Get agent capabilities
   */
  getCapabilities() {
    return {
      name: this.name,
      role: this.role,
      description: this.description,
      capabilities: this.capabilities,
      mcpTools: TravelMCPServer.listTools().map(t => t.name)
    };
  }
}

module.exports = new LunaWithMCP();
