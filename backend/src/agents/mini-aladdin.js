/**
 * Mini-Aladdin Agent
 * A money-finding agent that hunts for financial opportunities
 */

const { logger } = require('../utils/logger');

// Create child logger for Mini-Aladdin agent
const log = logger.child('MiniAladdin');

/**
 * DataAgent class for finding money-making opportunities
 */
class DataAgent {
  constructor(options = {}) {
    this.name = 'Mini-Aladdin';
    this.version = '1.0.0';
    this.options = {
      maxOpportunities: 10,
      minReturnThreshold: 0.05, // 5% minimum return
      riskTolerance: 'medium',
      ...options
    };
    
    log.info('DataAgent initialized', { 
      name: this.name, 
      version: this.version,
      options: this.options 
    });
  }

  /**
   * Hunt for money-making opportunities
   * @param {Object} params - Hunt parameters
   * @param {number} params.budget - Available budget
   * @param {Object} params.preferences - User preferences
   * @returns {Promise<Object>} Hunt results
   */
  async hunt(params = {}) {
    const { budget = 1000, preferences = {} } = params;
    
    log.info('Starting money hunt', { budget, preferences });
    
    try {
      // Validate input parameters
      if (typeof budget !== 'number' || budget <= 0) {
        throw new Error('Budget must be a positive number');
      }

      // Generate opportunities based on budget and preferences
      const opportunities = await this.generateOpportunities(budget, preferences);
      
      // Analyze and rank opportunities
      const analyzedOpportunities = await this.analyzeOpportunities(opportunities, budget);
      
      // Find the best opportunity
      const best = this.findBestOpportunity(analyzedOpportunities);
      
      // Calculate potential gains
      const totalPotentialGain = analyzedOpportunities.reduce((sum, opp) => 
        sum + (opp.estimatedReturn || opp.estimatedSaving || 0), 0
      );
      
      const results = {
        success: true,
        opportunities: analyzedOpportunities,
        bestOpportunity: best,
        totalPotentialGain,
        confidence: this.calculateConfidence(analyzedOpportunities),
        huntId: this.generateHuntId(),
        timestamp: new Date().toISOString()
      };

      log.success('Money hunt completed', { 
        opportunitiesFound: analyzedOpportunities.length,
        totalPotentialGain,
        bestOpportunity: best?.title
      });

      return results;

    } catch (error) {
      log.error('Error during money hunt', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate money-making opportunities
   * @param {number} budget - Available budget
   * @param {Object} preferences - User preferences
   * @returns {Promise<Array>} List of opportunities
   */
  async generateOpportunities(budget, preferences) {
    const opportunities = [];

    // Investment opportunities
    if (budget >= 100) {
      opportunities.push({
        id: 1,
        type: 'investment',
        title: 'High-yield savings account',
        description: 'Earn 4-5% APY on your savings',
        estimatedReturn: budget * 0.045,
        risk: 'low',
        timeframe: '1 year',
        minimumInvestment: 100,
        category: 'banking'
      });
    }

    if (budget >= 500) {
      opportunities.push({
        id: 2,
        type: 'investment',
        title: 'Travel rewards credit card',
        description: 'Earn points and miles on travel purchases',
        estimatedReturn: budget * 0.08,
        risk: 'low',
        timeframe: '6 months',
        minimumInvestment: 0,
        category: 'credit'
      });
    }

    // Cost-saving opportunities
    opportunities.push({
      id: 3,
      type: 'cost-saving',
      title: 'Travel package optimization',
      description: 'Find better deals on flights and hotels',
      estimatedSaving: budget * 0.15,
      risk: 'very-low',
      timeframe: 'immediate',
      minimumInvestment: 0,
      category: 'travel'
    });

    opportunities.push({
      id: 4,
      type: 'cost-saving',
      title: 'Subscription audit',
      description: 'Cancel unused subscriptions and optimize plans',
      estimatedSaving: budget * 0.10,
      risk: 'very-low',
      timeframe: '1 month',
      minimumInvestment: 0,
      category: 'lifestyle'
    });

    // Side hustle opportunities
    if (preferences.timeAvailable && preferences.timeAvailable > 10) {
      opportunities.push({
        id: 5,
        type: 'side-hustle',
        title: 'Freelance travel consulting',
        description: 'Help others plan trips for a fee',
        estimatedReturn: budget * 0.20,
        risk: 'medium',
        timeframe: '3 months',
        minimumInvestment: 0,
        category: 'services'
      });
    }

    // Investment opportunities for larger budgets
    if (budget >= 1000) {
      opportunities.push({
        id: 6,
        type: 'investment',
        title: 'Index fund investment',
        description: 'Diversified stock market investment',
        estimatedReturn: budget * 0.10,
        risk: 'medium',
        timeframe: '1 year',
        minimumInvestment: 1000,
        category: 'stocks'
      });
    }

    // Filter by user preferences
    let filteredOpportunities = opportunities;
    
    if (preferences.categories && preferences.categories.length > 0) {
      filteredOpportunities = filteredOpportunities.filter(opp => 
        preferences.categories.includes(opp.category)
      );
    }

    if (preferences.maxRisk) {
      const riskLevels = { 'very-low': 1, 'low': 2, 'medium': 3, 'high': 4 };
      filteredOpportunities = filteredOpportunities.filter(opp => 
        riskLevels[opp.risk] <= riskLevels[preferences.maxRisk]
      );
    }

    return filteredOpportunities.slice(0, this.options.maxOpportunities);
  }

  /**
   * Analyze opportunities for suitability
   * @param {Array} opportunities - List of opportunities
   * @param {number} budget - Available budget
   * @returns {Promise<Array>} Analyzed opportunities
   */
  async analyzeOpportunities(opportunities, budget) {
    return opportunities.map(opportunity => {
      const suitabilityScore = this.calculateSuitabilityScore(opportunity, budget);
      const roi = this.calculateROI(opportunity, budget);
      
      return {
        ...opportunity,
        suitabilityScore,
        roi,
        recommended: suitabilityScore > 0.7,
        pros: this.generatePros(opportunity),
        cons: this.generateCons(opportunity)
      };
    });
  }

  /**
   * Calculate suitability score for an opportunity
   * @param {Object} opportunity - Opportunity to analyze
   * @param {number} budget - Available budget
   * @returns {number} Suitability score (0-1)
   */
  calculateSuitabilityScore(opportunity, budget) {
    let score = 0.5; // Base score

    // Budget compatibility
    if (opportunity.minimumInvestment <= budget) {
      score += 0.2;
    }

    // Risk assessment
    const riskScores = { 'very-low': 0.3, 'low': 0.2, 'medium': 0.1, 'high': -0.1 };
    score += riskScores[opportunity.risk] || 0;

    // Return potential
    const returnAmount = opportunity.estimatedReturn || opportunity.estimatedSaving || 0;
    const returnRate = returnAmount / budget;
    if (returnRate > 0.1) score += 0.2;
    else if (returnRate > 0.05) score += 0.1;

    // Timeframe preference
    if (opportunity.timeframe === 'immediate') score += 0.1;
    else if (opportunity.timeframe === '1 month') score += 0.05;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate ROI for an opportunity
   * @param {Object} opportunity - Opportunity to analyze
   * @param {number} budget - Available budget
   * @returns {number} ROI percentage
   */
  calculateROI(opportunity, budget) {
    const returnAmount = opportunity.estimatedReturn || opportunity.estimatedSaving || 0;
    const investment = opportunity.minimumInvestment || budget;
    return (returnAmount / investment) * 100;
  }

  /**
   * Generate pros for an opportunity
   * @param {Object} opportunity - Opportunity to analyze
   * @returns {Array} List of pros
   */
  generatePros(opportunity) {
    const pros = [];
    
    if (opportunity.risk === 'very-low' || opportunity.risk === 'low') {
      pros.push('Low risk investment');
    }
    
    if (opportunity.timeframe === 'immediate') {
      pros.push('Quick returns');
    }
    
    if (opportunity.minimumInvestment === 0) {
      pros.push('No upfront investment required');
    }
    
    if (opportunity.type === 'cost-saving') {
      pros.push('Immediate savings');
    }
    
    return pros;
  }

  /**
   * Generate cons for an opportunity
   * @param {Object} opportunity - Opportunity to analyze
   * @returns {Array} List of cons
   */
  generateCons(opportunity) {
    const cons = [];
    
    if (opportunity.risk === 'high') {
      cons.push('High risk');
    }
    
    if (opportunity.timeframe === '1 year') {
      cons.push('Long-term commitment');
    }
    
    if (opportunity.minimumInvestment > 500) {
      cons.push('Requires significant upfront investment');
    }
    
    if (opportunity.type === 'investment') {
      cons.push('Market dependent');
    }
    
    return cons;
  }

  /**
   * Find the best opportunity from analyzed list
   * @param {Array} opportunities - Analyzed opportunities
   * @returns {Object} Best opportunity
   */
  findBestOpportunity(opportunities) {
    if (opportunities.length === 0) return null;
    
    return opportunities.reduce((best, current) => {
      const bestScore = (best.suitabilityScore || 0) + (best.roi || 0) / 100;
      const currentScore = (current.suitabilityScore || 0) + (current.roi || 0) / 100;
      
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Calculate overall confidence in the hunt results
   * @param {Array} opportunities - Analyzed opportunities
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(opportunities) {
    if (opportunities.length === 0) return 0;
    
    const avgSuitability = opportunities.reduce((sum, opp) => 
      sum + (opp.suitabilityScore || 0), 0) / opportunities.length;
    
    const recommendedCount = opportunities.filter(opp => opp.recommended).length;
    const recommendationRate = recommendedCount / opportunities.length;
    
    return (avgSuitability + recommendationRate) / 2;
  }

  /**
   * Generate unique hunt ID
   * @returns {string} Hunt ID
   */
  generateHuntId() {
    return `hunt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get agent statistics
   * @returns {Object} Agent statistics
   */
  getStats() {
    return {
      name: this.name,
      version: this.version,
      totalHunts: 0, // Would be tracked in production
      successRate: 0.85, // Mock data
      averageReturn: 0.12,
      lastHunt: null
    };
  }
}

/**
 * Create and return a new DataAgent instance
 * @param {Object} options - Agent options
 * @returns {DataAgent} New agent instance
 */
function createAgent(options = {}) {
  return new DataAgent(options);
}

module.exports = {
  DataAgent,
  createAgent
};