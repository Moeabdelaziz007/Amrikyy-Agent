/**
 * Enhanced Travel Agency Agent - EXAMPLE
 * Shows how to integrate new utilities into existing agents
 * 
 * This is a reference implementation - copy patterns to other agents
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-23
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const AgentErrorHandler = require('../utils/AgentErrorHandler');
const AgentCacheManager = require('../utils/AgentCacheManager');
const AgentMCPIntegration = require('../utils/AgentMCPIntegration');
const logger = require('../../utils/logger');

class EnhancedTravelAgent {
  constructor() {
    // Basic setup
    this.id = 'travel_agency_agent';
    this.name = 'Enhanced Travel Agency';
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
    
    // NEW: Add enhancement utilities
    this.errorHandler = new AgentErrorHandler(this.id);
    this.cache = new AgentCacheManager(this.id);
    this.mcp = new AgentMCPIntegration(this.id);
    
    // Gemini setup
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.gemini = this.genAI.getGenerativeModel({ 
      model: this.model,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 8192
      }
    });
    
    logger.info('✈️ Enhanced Travel Agent initialized with utilities');
  }

  /**
   * Initialize MCP integration
   */
  async initialize(mcpManager) {
    try {
      await this.mcp.initialize(mcpManager);
      logger.info(`${this.name}: MCP integration ready`);
      return true;
    } catch (error) {
      logger.error(`${this.name}: MCP initialization failed:`, error);
      return false;
    }
  }

  /**
   * ENHANCED: Search flights with caching and error handling
   */
  async searchFlights(params) {
    const operation = 'flight_search';
    
    try {
      // STEP 1: Check cache first (exact match)
      const cached = await this.cache.get(operation, params);
      if (cached) {
        logger.debug(`${this.name}: Cache HIT for flight search`);
        return cached;
      }
      
      // STEP 2: Try semantic cache (similar queries)
      const semantic = await this.cache.findSemantic(operation, params, 0.85);
      if (semantic) {
        logger.debug(`${this.name}: Semantic match for flight search`);
        return semantic;
      }
      
      // STEP 3: Cache miss - generate new response with error handling
      logger.debug(`${this.name}: Cache MISS for flight search, generating...`);
      
      const result = await this.errorHandler.executeWithRetry(async () => {
        // Generate prompt
        const prompt = this.createFlightSearchPrompt(params);
        
        // Call Gemini with retry logic
        const response = await this.errorHandler.callGeminiWithRetry(
          this.gemini,
          prompt
        );
        
        // Parse with fallback
        const data = this.errorHandler.parseJSONWithFallback(response, {
          flights: [],
          error: 'Failed to parse response'
        });
        
        // Validate required fields
        this.errorHandler.validateResponse(data, ['flights']);
        
        return {
          success: true,
          data,
          agent: this.name,
          cached: false
        };
      });
      
      // STEP 4: Cache the result
      if (result.success) {
        await this.cache.set(operation, params, result);
      }
      
      return result;
      
    } catch (error) {
      logger.error(`${this.name}: Flight search error:`, error);
      return {
        success: false,
        error: error.message,
        agent: this.name
      };
    }
  }

  /**
   * ENHANCED: Generate itinerary with MCP tools
   */
  async generateItinerary(params) {
    const operation = 'itinerary_planning';
    
    try {
      // Check cache
      const cached = await this.cache.get(operation, params);
      if (cached) {
        return cached;
      }
      
      // Use MCP tools for research
      let context = '';
      if (this.mcp.mcpManager) {
        // Search memory for previous trips to destination
        const memory = await this.mcp.searchMemory(
          `destination:${params.destination}`,
          5
        );
        
        if (memory.success && memory.result) {
          context = `\nPrevious trip data: ${JSON.stringify(memory.result)}`;
        }
        
        // Use sequential thinking for complex itinerary
        const thinking = await this.mcp.think(
          `Plan a ${params.duration}-day itinerary for ${params.destination} ` +
          `with interests: ${params.interests.join(', ')}`,
          params.duration
        );
        
        if (thinking.success) {
          context += `\n\nReasoning steps: ${JSON.stringify(thinking.result)}`;
        }
      }
      
      // Generate with error handling
      const result = await this.errorHandler.executeWithRetry(async () => {
        const prompt = this.createItineraryPrompt(params, context);
        const response = await this.errorHandler.callGeminiWithRetry(
          this.gemini,
          prompt
        );
        
        const data = this.errorHandler.parseJSONWithFallback(response, {
          days: [],
          error: 'Failed to parse itinerary'
        });
        
        this.errorHandler.validateResponse(data, ['days', 'budgetBreakdown']);
        
        return {
          success: true,
          data,
          agent: this.name,
          usedMCP: !!this.mcp.mcpManager
        };
      });
      
      // Cache and store in memory
      if (result.success) {
        await this.cache.set(operation, params, result);
        
        if (this.mcp.mcpManager) {
          await this.mcp.storeMemory(
            `itinerary:${params.destination}:${Date.now()}`,
            result.data,
            { params, agent: this.id }
          );
        }
      }
      
      return result;
      
    } catch (error) {
      logger.error(`${this.name}: Itinerary generation error:`, error);
      return {
        success: false,
        error: error.message,
        agent: this.name
      };
    }
  }

  /**
   * Create flight search prompt
   */
  createFlightSearchPrompt(params) {
    const { from, to, date, passengers = 1, class: travelClass = 'economy' } = params;
    
    return `
You are a Travel Agency AI Agent specializing in flight bookings.

Task: Search for flights with the following criteria:
- From: ${from}
- To: ${to}
- Date: ${date}
- Passengers: ${passengers}
- Class: ${travelClass}

Provide realistic flight options in JSON format with 3-5 flights.
Include: airline, flightNumber, departure/arrival times, duration, price, amenities.
`;
  }

  /**
   * Create itinerary prompt
   */
  createItineraryPrompt(params, context = '') {
    const { destination, duration, interests = [], budget } = params;
    
    return `
You are a Travel Agency AI Agent specializing in itinerary planning.

Task: Create a detailed ${duration}-day itinerary for ${destination}

Details:
- Duration: ${duration} days
- Interests: ${interests.join(', ') || 'General sightseeing'}
- Budget: ${budget ? `$${budget}` : 'Moderate'}

${context}

Provide comprehensive itinerary in JSON format with day-by-day activities, meals, costs.
`;
  }

  /**
   * Get enhanced agent status with utility stats
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      model: this.model,
      capabilities: ['flight_search', 'hotel_search', 'itinerary_planning'],
      
      // NEW: Utility statistics
      errorHandling: this.errorHandler.getStats(),
      cache: this.cache.getStats(),
      mcp: this.mcp.getStats(),
      
      timestamp: Date.now()
    };
  }

  /**
   * Get comprehensive health check
   */
  async getHealth() {
    return {
      agent: this.name,
      healthy: true,
      
      cache: await this.cache.getHealth(),
      mcp: await this.mcp.getHealth(),
      errorHandler: {
        ...this.errorHandler.getStats(),
        circuitBreaker: {
          state: this.errorHandler.circuitBreaker.state,
          failures: this.errorHandler.circuitBreaker.failures
        }
      },
      
      timestamp: Date.now()
    };
  }

  /**
   * Clear caches (admin operation)
   */
  async clearCaches() {
    this.cache.resetStats();
    this.mcp.clearCache();
    logger.info(`${this.name}: All caches cleared`);
  }

  /**
   * Reset statistics (admin operation)
   */
  resetStats() {
    this.errorHandler.resetStats();
    this.cache.resetStats();
    this.mcp.resetStats();
    logger.info(`${this.name}: All statistics reset`);
  }
}

module.exports = EnhancedTravelAgent;

// USAGE EXAMPLE:
// ===============
//
// const EnhancedTravelAgent = require('./agents/EnhancedTravelAgent');
// const MCPServerManager = require('./services/MCPServerManager');
//
// // Initialize
// const agent = new EnhancedTravelAgent();
// const mcpManager = new MCPServerManager();
// await mcpManager.initialize();
// await agent.initialize(mcpManager);
//
// // Use with automatic caching and error handling
// const flights = await agent.searchFlights({
//   from: 'NYC',
//   to: 'LON',
//   date: '2025-11-01',
//   passengers: 2
// });
//
// // Check health
// const health = await agent.getHealth();
// console.log('Agent health:', health);
//
// // Get statistics
// const status = agent.getStatus();
// console.log('Cache hit rate:', status.cache.hitRate);
// console.log('Error success rate:', status.errorHandling.successRate);
// console.log('MCP tool calls:', status.mcp.totalCalls);
