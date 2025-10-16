/**
 * Scout Proactive Agent - Enhanced with MCP Tools
 * AI agent specialized in discovering travel deals and opportunities
 */

const TravelMCPServer = require('../mcp/TravelMCPServer');
const logger = require('../utils/logger');

class ScoutWithMCP {
  constructor() {
    this.name = 'Scout';
    this.role = 'Proactive Deal Finder';
    this.description = 'AI agent that discovers travel deals and opportunities';
    this.capabilities = [
      'deal_discovery',
      'price_monitoring',
      'destination_suggestions',
      'seasonal_recommendations',
      'flash_deals'
    ];
    
    this.monitoredRoutes = new Map();
    this.priceAlerts = new Map();
    
    logger.info('🕵️ Scout initialized with MCP tools');
  }

  /**
   * Discover travel deals
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object>} Discovered deals
   */
  async discoverDeals(preferences) {
    try {
      const {
        origins,
        budgetRange,
        travelMonths,
        interests,
        maxFlightDuration
      } = preferences;

      logger.info('🕵️ Scout discovering deals', {
        origins: origins?.length || 0,
        budgetRange
      });

      const deals = {
        flights: [],
        destinations: [],
        recommendations: []
      };

      // Popular destinations to check
      const popularDestinations = this.getPopularDestinations(interests);

      // Search for deals from each origin
      for (const origin of origins || ['NYC']) {
        for (const destination of popularDestinations.slice(0, 5)) {
          // Get flexible date range
          const dateRange = this.getFlexibleDateRange(travelMonths);

          // Compare prices across dates
          const priceComparison = await this.comparePrices({
            from: origin,
            to: destination.code,
            startDate: dateRange.start,
            endDate: dateRange.end
          });

          if (priceComparison.success) {
            const bestPrice = priceComparison.comparison.bestPrice;

            // Check if it's a good deal
            if (this.isGoodDeal(bestPrice.price, budgetRange)) {
              deals.flights.push({
                origin,
                destination: destination.name,
                destinationCode: destination.code,
                price: bestPrice.price,
                currency: bestPrice.currency,
                date: bestPrice.date,
                dealScore: this.calculateDealScore(bestPrice.price, budgetRange),
                bookingToken: bestPrice.bookingToken
              });
            }
          }

          // Small delay to avoid rate limiting
          await this.delay(500);
        }
      }

      // Sort deals by score
      deals.flights.sort((a, b) => b.dealScore - a.dealScore);

      // Generate recommendations
      deals.recommendations = this.generateDealRecommendations(deals.flights);

      logger.info('✅ Scout discovered deals', {
        dealCount: deals.flights.length
      });

      return {
        success: true,
        agent: 'Scout',
        deals
      };

    } catch (error) {
      logger.error('❌ Scout deal discovery failed', {
        error: error.message
      });

      return {
        success: false,
        agent: 'Scout',
        error: error.message
      };
    }
  }

  /**
   * Monitor price for a specific route
   * @param {Object} route - Route to monitor
   * @returns {Promise<Object>} Monitoring status
   */
  async monitorPrice(route) {
    try {
      const { from, to, targetPrice, userId } = route;

      const monitorId = `${from}-${to}-${userId}`;

      logger.info('🕵️ Scout monitoring price', {
        from,
        to,
        targetPrice
      });

      // Search current price
      const searchResult = await TravelMCPServer.callTool('search_flights', {
        from,
        to,
        departureDate: this.getNextMonthDate(),
        adults: 1
      }, {
        agentId: 'scout',
        agentName: this.name
      });

      if (searchResult.success && searchResult.data.length > 0) {
        const currentPrice = searchResult.data[0].price.amount;

        // Store monitoring info
        this.monitoredRoutes.set(monitorId, {
          from,
          to,
          targetPrice,
          currentPrice,
          userId,
          lastChecked: new Date(),
          priceHistory: [{ price: currentPrice, date: new Date() }]
        });

        // Check if price alert should be triggered
        if (currentPrice <= targetPrice) {
          this.triggerPriceAlert(monitorId, currentPrice);
        }

        return {
          success: true,
          monitoring: true,
          currentPrice,
          targetPrice,
          priceDropNeeded: Math.max(0, currentPrice - targetPrice)
        };
      }

      return {
        success: false,
        error: 'Could not find flights for this route'
      };

    } catch (error) {
      logger.error('❌ Scout price monitoring failed', {
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get destination suggestions based on budget
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Destination suggestions
   */
  async suggestDestinations(params) {
    try {
      const { origin, budget, interests } = params;

      logger.info('🕵️ Scout suggesting destinations', {
        origin,
        budget
      });

      const destinations = this.getPopularDestinations(interests);
      const suggestions = [];

      for (const destination of destinations.slice(0, 10)) {
        // Estimate if destination fits budget
        const estimatedCost = this.estimateDestinationCost(destination);

        if (estimatedCost <= budget) {
          suggestions.push({
            name: destination.name,
            code: destination.code,
            country: destination.country,
            estimatedCost,
            budgetFit: ((budget - estimatedCost) / budget) * 100,
            highlights: destination.highlights,
            bestMonths: destination.bestMonths
          });
        }
      }

      // Sort by budget fit
      suggestions.sort((a, b) => b.budgetFit - a.budgetFit);

      return {
        success: true,
        agent: 'Scout',
        suggestions: suggestions.slice(0, 5)
      };

    } catch (error) {
      logger.error('❌ Scout destination suggestions failed', {
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Compare prices using MCP
   */
  async comparePrices(params) {
    try {
      const result = await TravelMCPServer.callTool('compare_prices', params, {
        agentId: 'scout',
        agentName: this.name
      });

      return {
        success: result.success,
        comparison: result.data || {}
      };

    } catch (error) {
      return {
        success: false,
        comparison: {}
      };
    }
  }

  /**
   * Get popular destinations based on interests
   */
  getPopularDestinations(interests = []) {
    const allDestinations = [
      { name: 'Paris', code: 'PAR', country: 'France', highlights: ['Culture', 'Food', 'Art'], bestMonths: ['Apr', 'May', 'Sep', 'Oct'] },
      { name: 'London', code: 'LON', country: 'UK', highlights: ['History', 'Culture', 'Shopping'], bestMonths: ['May', 'Jun', 'Jul', 'Aug'] },
      { name: 'Dubai', code: 'DXB', country: 'UAE', highlights: ['Luxury', 'Shopping', 'Beach'], bestMonths: ['Nov', 'Dec', 'Jan', 'Feb'] },
      { name: 'Tokyo', code: 'TYO', country: 'Japan', highlights: ['Culture', 'Food', 'Technology'], bestMonths: ['Mar', 'Apr', 'Oct', 'Nov'] },
      { name: 'Barcelona', code: 'BCN', country: 'Spain', highlights: ['Beach', 'Culture', 'Food'], bestMonths: ['May', 'Jun', 'Sep', 'Oct'] },
      { name: 'Istanbul', code: 'IST', country: 'Turkey', highlights: ['History', 'Culture', 'Food'], bestMonths: ['Apr', 'May', 'Sep', 'Oct'] },
      { name: 'New York', code: 'NYC', country: 'USA', highlights: ['Culture', 'Shopping', 'Food'], bestMonths: ['Apr', 'May', 'Sep', 'Oct'] },
      { name: 'Bangkok', code: 'BKK', country: 'Thailand', highlights: ['Food', 'Culture', 'Budget'], bestMonths: ['Nov', 'Dec', 'Jan', 'Feb'] },
      { name: 'Rome', code: 'ROM', country: 'Italy', highlights: ['History', 'Food', 'Art'], bestMonths: ['Apr', 'May', 'Sep', 'Oct'] },
      { name: 'Singapore', code: 'SIN', country: 'Singapore', highlights: ['Food', 'Shopping', 'Modern'], bestMonths: ['Feb', 'Mar', 'Apr', 'Nov'] }
    ];

    // Filter by interests if provided
    if (interests && interests.length > 0) {
      return allDestinations.filter(dest =>
        dest.highlights.some(h => interests.includes(h.toLowerCase()))
      );
    }

    return allDestinations;
  }

  /**
   * Check if price is a good deal
   */
  isGoodDeal(price, budgetRange) {
    if (!budgetRange) return true;
    return price <= budgetRange.max && price >= budgetRange.min;
  }

  /**
   * Calculate deal score (0-100)
   */
  calculateDealScore(price, budgetRange) {
    if (!budgetRange) return 50;

    const range = budgetRange.max - budgetRange.min;
    const position = budgetRange.max - price;
    const score = (position / range) * 100;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate deal recommendations
   */
  generateDealRecommendations(deals) {
    const recommendations = [];

    if (deals.length === 0) {
      recommendations.push({
        type: 'no_deals',
        message: 'No deals found matching your criteria. Try adjusting your budget or dates.'
      });
      return recommendations;
    }

    // Best overall deal
    const bestDeal = deals[0];
    recommendations.push({
      type: 'best_deal',
      priority: 'high',
      message: `Best deal: ${bestDeal.destination} for $${bestDeal.price}`,
      deal: bestDeal
    });

    // Budget-friendly options
    const budgetDeals = deals.filter(d => d.price < 500);
    if (budgetDeals.length > 0) {
      recommendations.push({
        type: 'budget_friendly',
        priority: 'medium',
        message: `${budgetDeals.length} budget-friendly options under $500`,
        deals: budgetDeals.slice(0, 3)
      });
    }

    return recommendations;
  }

  /**
   * Estimate destination cost
   */
  estimateDestinationCost(destination) {
    // Simple estimation based on destination
    const baseCosts = {
      'Bangkok': 800,
      'Istanbul': 1000,
      'Barcelona': 1200,
      'Rome': 1300,
      'Paris': 1500,
      'London': 1600,
      'Dubai': 1800,
      'Tokyo': 2000,
      'New York': 2200,
      'Singapore': 1400
    };

    return baseCosts[destination.name] || 1500;
  }

  /**
   * Get flexible date range
   */
  getFlexibleDateRange(months = []) {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 30); // Start 30 days from now

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 60); // 60-day window

    return {
      start: this.formatDate(startDate),
      end: this.formatDate(endDate)
    };
  }

  /**
   * Get next month date
   */
  getNextMonthDate() {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return this.formatDate(date);
  }

  /**
   * Format date as DD/MM/YYYY
   */
  formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Trigger price alert
   */
  triggerPriceAlert(monitorId, currentPrice) {
    logger.info('🚨 Scout price alert triggered', {
      monitorId,
      currentPrice
    });

    this.priceAlerts.set(monitorId, {
      triggeredAt: new Date(),
      price: currentPrice
    });

    // TODO: Send notification to user
    // TODO: Send email/push notification
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
      mcpTools: TravelMCPServer.listTools().map(t => t.name),
      monitoredRoutes: this.monitoredRoutes.size,
      activeAlerts: this.priceAlerts.size
    };
  }
}

module.exports = new ScoutWithMCP();
