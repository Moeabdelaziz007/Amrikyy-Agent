/**
 * MCP Travel Tools Server
 * Model Context Protocol implementation for travel agents
 * Provides standardized tool calling for flight/hotel search, booking, payments
 */

const KiwiTequilaService = require('../services/KiwiTequilaService');
const ChatHistoryIndexer = require('./ChatHistoryIndexer');
const ChatIndexer = require('../tools/ChatIndexer');
const CodeScanner = require('../tools/CodeScanner');
const CodebaseIndexer = require('../tools/CodebaseIndexer');
const ComprehensiveScanner = require('../tools/ComprehensiveScanner');
const { logger } = require('../utils/logger');

class TravelMCPServer {
  constructor() {
    this.tools = new Map();
    this.initializeTools();
  }

  /**
   * Initialize all MCP tools
   */
  initializeTools() {
    // Flight search tool
    this.registerTool({
      name: 'search_flights',
      description: 'Search for flights between two locations with dates',
      inputSchema: {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            description: 'Departure city or airport code (e.g., "NYC", "JFK")',
          },
          to: {
            type: 'string',
            description: 'Arrival city or airport code (e.g., "LON", "LHR")',
          },
          departureDate: {
            type: 'string',
            description: 'Departure date in DD/MM/YYYY format',
          },
          returnDate: {
            type: 'string',
            description: 'Return date in DD/MM/YYYY format (optional for one-way)',
          },
          adults: {
            type: 'number',
            description: 'Number of adult passengers',
            default: 1,
          },
          children: {
            type: 'number',
            description: 'Number of children',
            default: 0,
          },
          currency: {
            type: 'string',
            description: 'Currency code (USD, EUR, etc.)',
            default: 'USD',
          },
        },
        required: ['from', 'to', 'departureDate'],
      },
      handler: this.handleFlightSearch.bind(this),
    });

    // Location search tool
    this.registerTool({
      name: 'search_locations',
      description: 'Search for airports and cities by name',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'City or airport name to search',
          },
        },
        required: ['query'],
      },
      handler: this.handleLocationSearch.bind(this),
    });

    // Get flight details tool
    this.registerTool({
      name: 'get_flight_details',
      description: 'Get detailed information about a specific flight',
      inputSchema: {
        type: 'object',
        properties: {
          bookingToken: {
            type: 'string',
            description: 'Booking token from flight search results',
          },
        },
        required: ['bookingToken'],
      },
      handler: this.handleGetFlightDetails.bind(this),
    });

    // Price comparison tool
    this.registerTool({
      name: 'compare_prices',
      description: 'Compare prices across multiple dates for flexible travel',
      inputSchema: {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            description: 'Departure location',
          },
          to: {
            type: 'string',
            description: 'Arrival location',
          },
          startDate: {
            type: 'string',
            description: 'Start of date range (DD/MM/YYYY)',
          },
          endDate: {
            type: 'string',
            description: 'End of date range (DD/MM/YYYY)',
          },
        },
        required: ['from', 'to', 'startDate', 'endDate'],
      },
      handler: this.handlePriceComparison.bind(this),
    });

    // Budget analysis tool
    this.registerTool({
      name: 'analyze_budget',
      description: 'Analyze trip budget and suggest cost-saving options',
      inputSchema: {
        type: 'object',
        properties: {
          destination: {
            type: 'string',
            description: 'Destination city',
          },
          budget: {
            type: 'number',
            description: 'Total budget in USD',
          },
          duration: {
            type: 'number',
            description: 'Trip duration in days',
          },
          travelers: {
            type: 'number',
            description: 'Number of travelers',
          },
        },
        required: ['destination', 'budget', 'duration', 'travelers'],
      },
      handler: this.handleBudgetAnalysis.bind(this),
    });

    // Register Advanced Chat Indexer
    this.registerTool({
      name: 'advanced_chat_indexer',
      description: 'فهرسة متقدمة للمحادثات مع تحليل المهارات وجودة الكود',
      inputSchema: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'الرسالة' },
          response: { type: 'string', description: 'الرد' },
          context: { type: 'string', description: 'السياق' },
          topic: { type: 'string', description: 'الموضوع' },
          metadata: { type: 'object', description: 'بيانات إضافية' },
        },
        required: ['message', 'response'],
      },
      handler: ChatIndexer.indexChatMessage.bind(ChatIndexer),
    });

    // Register Code Scanner
    this.registerTool({
      name: 'code_scanner',
      description: 'فحص شامل للكود للبحث عن الأخطاء والمشاكل الأمنية وجودة الكود',
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: { type: 'string', description: 'مسار المشروع' },
          options: { type: 'object', description: 'خيارات الفحص' },
        },
        required: ['projectPath'],
      },
      handler: CodeScanner.scanProject.bind(CodeScanner),
    });

    // Register Codebase Indexer
    this.registerTool({
      name: 'codebase_indexer',
      description: 'فهرسة شاملة للمستودع البرمجي مع تحليل معماري ونمط',
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: { type: 'string', description: 'مسار المشروع' },
          options: { type: 'object', description: 'خيارات الفهرسة' },
        },
        required: ['projectPath'],
      },
      handler: CodebaseIndexer.indexProject.bind(CodebaseIndexer),
    });

    // Register Comprehensive Scanner
    this.registerTool({
      name: 'comprehensive_scanner',
      description: 'فحص شامل يجمع بين فهرسة المحادثات وفحص الكود وفهرسة المستودع',
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: { type: 'string', description: 'مسار المشروع' },
          options: { type: 'object', description: 'خيارات الفحص الشامل' },
        },
        required: ['projectPath'],
      },
      handler: ComprehensiveScanner.scanComprehensive.bind(ComprehensiveScanner),
    });

    logger.info('✅ MCP Travel Tools initialized', {
      toolCount: this.tools.size,
    });
  }

  /**
   * Register a new tool
   * @param {Object} tool - Tool definition
   */
  registerTool(tool) {
    if (!tool.name || !tool.handler) {
      throw new Error('Tool must have name and handler');
    }

    this.tools.set(tool.name, tool);
    logger.info(`📝 Registered MCP tool: ${tool.name}`);
  }

  /**
   * Get all available tools
   * @returns {Array} List of tools
   */
  listTools() {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));
  }

  /**
   * Call a tool by name
   * @param {string} toolName - Name of the tool
   * @param {Object} params - Tool parameters
   * @param {Object} context - Execution context (user, session, etc.)
   * @returns {Promise<Object>} Tool result
   */
  async callTool(toolName, params, context = {}) {
    const tool = this.tools.get(toolName);

    if (!tool) {
      logger.error('❌ Tool not found', { toolName });
      return {
        success: false,
        error: `Tool '${toolName}' not found`,
      };
    }

    try {
      // Validate parameters against schema
      const validationError = this.validateParams(params, tool.inputSchema);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      // Log tool call for audit
      logger.info('🔧 MCP tool called', {
        tool: toolName,
        userId: context.userId,
        sessionId: context.sessionId,
      });

      // Execute tool handler
      const result = await tool.handler(params, context);

      // Log result
      logger.info('✅ MCP tool completed', {
        tool: toolName,
        success: result.success,
      });

      return result;
    } catch (error) {
      logger.error('❌ MCP tool execution failed', {
        tool: toolName,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        error: error.message,
        toolName,
      };
    }
  }

  /**
   * Validate parameters against JSON schema
   * @param {Object} params - Parameters to validate
   * @param {Object} schema - JSON schema
   * @returns {string|null} Error message or null if valid
   */
  validateParams(params, schema) {
    if (!schema || !schema.required) {
      return null;
    }

    for (const field of schema.required) {
      if (params[field] === undefined || params[field] === null) {
        return `Missing required parameter: ${field}`;
      }
    }

    return null;
  }

  // ==================== Tool Handlers ====================

  /**
   * Handle flight search
   */
  async handleFlightSearch(params, context) {
    try {
      const result = await KiwiTequilaService.searchFlights({
        flyFrom: params.from,
        flyTo: params.to,
        dateFrom: this.formatDate(params.departureDate),
        dateTo: params.returnDate
          ? this.formatDate(params.returnDate)
          : this.formatDate(params.departureDate),
        adults: params.adults || 1,
        children: params.children || 0,
        curr: params.currency || 'USD',
      });

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle location search
   */
  async handleLocationSearch(params, context) {
    try {
      const result = await KiwiTequilaService.searchLocations(params.query);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle get flight details
   */
  async handleGetFlightDetails(params, context) {
    try {
      const result = await KiwiTequilaService.getFlightDetails(params.bookingToken);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle price comparison
   */
  async handlePriceComparison(params, context) {
    try {
      // Search flights for multiple dates
      const startDate = new Date(this.parseDate(params.startDate));
      const endDate = new Date(this.parseDate(params.endDate));
      const results = [];

      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = this.formatDate(currentDate.toLocaleDateString('en-GB'));

        const searchResult = await KiwiTequilaService.searchFlights({
          flyFrom: params.from,
          flyTo: params.to,
          dateFrom: dateStr,
          dateTo: dateStr,
          limit: 3,
        });

        if (searchResult.success && searchResult.data.length > 0) {
          const cheapest = searchResult.data[0];
          results.push({
            date: dateStr,
            price: cheapest.price.amount,
            currency: cheapest.price.currency,
            bookingToken: cheapest.bookingToken,
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Find best price
      const bestPrice = results.reduce(
        (min, curr) => (curr.price < min.price ? curr : min),
        results[0]
      );

      return {
        success: true,
        data: {
          pricesByDate: results,
          bestPrice,
          averagePrice: results.reduce((sum, r) => sum + r.price, 0) / results.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle budget analysis
   */
  async handleBudgetAnalysis(params, context) {
    try {
      const { destination, budget, duration, travelers } = params;

      // Estimate costs
      const estimatedFlightCost = budget * 0.4; // 40% for flights
      const estimatedHotelCost = budget * 0.35; // 35% for accommodation
      const estimatedFoodCost = budget * 0.15; // 15% for food
      const estimatedActivitiesCost = budget * 0.1; // 10% for activities

      const perPersonBudget = budget / travelers;
      const dailyBudget = budget / duration;

      return {
        success: true,
        data: {
          breakdown: {
            flights: {
              total: estimatedFlightCost,
              perPerson: estimatedFlightCost / travelers,
            },
            accommodation: {
              total: estimatedHotelCost,
              perNight: estimatedHotelCost / duration,
            },
            food: {
              total: estimatedFoodCost,
              perDay: estimatedFoodCost / duration,
            },
            activities: {
              total: estimatedActivitiesCost,
              perDay: estimatedActivitiesCost / duration,
            },
          },
          perPerson: perPersonBudget,
          perDay: dailyBudget,
          recommendations: this.generateBudgetRecommendations(budget, duration, travelers),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate budget recommendations
   */
  generateBudgetRecommendations(budget, duration, travelers) {
    const recommendations = [];

    const perPersonPerDay = budget / (duration * travelers);

    if (perPersonPerDay < 50) {
      recommendations.push('Consider hostels or budget hotels');
      recommendations.push('Look for free walking tours');
      recommendations.push('Cook some meals instead of eating out');
    } else if (perPersonPerDay < 150) {
      recommendations.push('Mix of mid-range hotels and Airbnb');
      recommendations.push('Balance between restaurants and street food');
      recommendations.push('Book activities in advance for discounts');
    } else {
      recommendations.push('Comfortable hotels with good amenities');
      recommendations.push('Try local fine dining experiences');
      recommendations.push('Consider private tours and premium activities');
    }

    return recommendations;
  }

  /**
   * Format date for API (DD/MM/YYYY)
   */
  formatDate(dateStr) {
    if (dateStr.includes('/')) {
      return dateStr;
    }
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Parse date from DD/MM/YYYY
   */
  parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const kiwiHealth = await KiwiTequilaService.healthCheck();

      return {
        success: true,
        services: {
          kiwi: kiwiHealth,
          mcp: true,
        },
        toolCount: this.tools.size,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new TravelMCPServer();
