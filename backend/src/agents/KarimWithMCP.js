/**
 * Karim Budget Optimizer - Enhanced with MCP Tools
 * AI agent specialized in budget optimization and cost-saving strategies
 */

const TravelMCPServer = require('../mcp/TravelMCPServer');
const logger = require('../utils/logger');

class KarimWithMCP {
  constructor() {
    this.name = 'Karim';
    this.role = 'Budget Optimizer';
    this.description = 'AI budget expert with real-time price comparison';
    this.capabilities = [
      'budget_analysis',
      'price_comparison',
      'cost_optimization',
      'savings_recommendations',
      'flexible_dates_search'
    ];
    
    logger.info('💰 Karim initialized with MCP tools');
  }

  /**
   * Optimize trip budget
   * @param {Object} request - Budget optimization request
   * @returns {Promise<Object>} Optimization results
   */
  async optimizeBudget(request) {
    try {
      const {
        destination,
        origin,
        budget,
        travelers,
        flexibleDates,
        dateRange
      } = request;

      logger.info('💰 Karim optimizing budget', {
        destination,
        budget,
        travelers
      });

      const optimization = {
        originalBudget: budget,
        optimizedBudget: budget,
        savings: 0,
        recommendations: []
      };

      // Step 1: Analyze current budget
      const budgetAnalysis = await this.analyzeBudget({
        destination,
        budget,
        duration: dateRange?.duration || 7,
        travelers
      });

      if (budgetAnalysis.success) {
        optimization.breakdown = budgetAnalysis.breakdown;
        optimization.perDay = budgetAnalysis.perDay;
        optimization.perPerson = budgetAnalysis.perPerson;
      }

      // Step 2: Find cheapest flight dates (if flexible)
      if (flexibleDates && dateRange) {
        const priceComparison = await this.comparePrices({
          from: origin,
          to: destination,
          startDate: dateRange.start,
          endDate: dateRange.end
        });

        if (priceComparison.success) {
          const bestPrice = priceComparison.comparison.bestPrice;
          const averagePrice = priceComparison.comparison.averagePrice;
          const potentialSavings = averagePrice - bestPrice.price;

          optimization.flightOptimization = {
            bestDate: bestPrice.date,
            bestPrice: bestPrice.price,
            averagePrice,
            savings: potentialSavings
          };

          optimization.savings += potentialSavings * travelers;

          optimization.recommendations.push({
            type: 'flight_timing',
            priority: 'high',
            message: `Save $${potentialSavings.toFixed(2)} per person by flying on ${bestPrice.date}`,
            savings: potentialSavings * travelers
          });
        }
      }

      // Step 3: Generate cost-saving recommendations
      const savingsRecommendations = this.generateSavingsRecommendations(
        budgetAnalysis.breakdown,
        travelers
      );

      optimization.recommendations.push(...savingsRecommendations);

      // Calculate total potential savings
      optimization.totalPotentialSavings = optimization.recommendations.reduce(
        (sum, rec) => sum + (rec.savings || 0),
        0
      );

      optimization.optimizedBudget = budget - optimization.totalPotentialSavings;

      logger.info('✅ Karim completed budget optimization', {
        originalBudget: budget,
        optimizedBudget: optimization.optimizedBudget,
        savings: optimization.totalPotentialSavings
      });

      return {
        success: true,
        agent: 'Karim',
        optimization
      };

    } catch (error) {
      logger.error('❌ Karim budget optimization failed', {
        error: error.message
      });

      return {
        success: false,
        agent: 'Karim',
        error: error.message
      };
    }
  }

  /**
   * Compare prices across dates using MCP
   */
  async comparePrices(params) {
    try {
      const result = await TravelMCPServer.callTool('compare_prices', params, {
        agentId: 'karim',
        agentName: this.name
      });

      return {
        success: result.success,
        comparison: result.data || {}
      };

    } catch (error) {
      logger.error('❌ Karim price comparison failed', {
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
        agentId: 'karim',
        agentName: this.name
      });

      return {
        success: result.success,
        ...result.data
      };

    } catch (error) {
      logger.error('❌ Karim budget analysis failed', {
        error: error.message
      });

      return {
        success: false
      };
    }
  }

  /**
   * Generate cost-saving recommendations
   */
  generateSavingsRecommendations(breakdown, travelers) {
    const recommendations = [];

    // Accommodation savings
    if (breakdown.accommodation) {
      const accommodationSavings = breakdown.accommodation.total * 0.15; // 15% potential savings
      recommendations.push({
        type: 'accommodation',
        priority: 'high',
        message: 'Consider Airbnb or hostels instead of hotels',
        savings: accommodationSavings,
        details: [
          'Book accommodations with kitchen facilities',
          'Look for properties outside tourist areas',
          'Consider shared accommodations for solo travelers'
        ]
      });
    }

    // Food savings
    if (breakdown.food) {
      const foodSavings = breakdown.food.total * 0.25; // 25% potential savings
      recommendations.push({
        type: 'food',
        priority: 'medium',
        message: 'Mix dining out with self-catering',
        savings: foodSavings,
        details: [
          'Cook breakfast at accommodation',
          'Try local street food for lunch',
          'Reserve restaurants for special dinners only'
        ]
      });
    }

    // Activities savings
    if (breakdown.activities) {
      const activitiesSavings = breakdown.activities.total * 0.30; // 30% potential savings
      recommendations.push({
        type: 'activities',
        priority: 'medium',
        message: 'Take advantage of free attractions',
        savings: activitiesSavings,
        details: [
          'Look for free walking tours',
          'Visit museums on free admission days',
          'Explore parks and public spaces',
          'Use city tourism cards for discounts'
        ]
      });
    }

    // Transportation savings
    const transportSavings = 50 * travelers; // Estimated $50 per person
    recommendations.push({
      type: 'transportation',
      priority: 'low',
      message: 'Use public transportation instead of taxis',
      savings: transportSavings,
      details: [
        'Buy multi-day transit passes',
        'Walk or bike when possible',
        'Use ride-sharing apps instead of taxis',
        'Book airport transfers in advance'
      ]
    });

    // Booking timing
    recommendations.push({
      type: 'booking_strategy',
      priority: 'high',
      message: 'Book in advance for better rates',
      savings: 0, // Already factored into other savings
      details: [
        'Book flights 6-8 weeks in advance',
        'Reserve hotels 2-3 weeks ahead',
        'Purchase attraction tickets online',
        'Look for package deals'
      ]
    });

    return recommendations;
  }

  /**
   * Calculate savings percentage
   */
  calculateSavingsPercentage(original, optimized) {
    if (original === 0) return 0;
    return ((original - optimized) / original) * 100;
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

module.exports = new KarimWithMCP();
