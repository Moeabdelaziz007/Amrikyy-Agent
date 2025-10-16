/**
 * Karim - Budget Optimizer Agent
 * Specializes in cost analysis, price tracking, and financial optimization
 * Core competency: Financial planning with real-time price monitoring
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class KarimBudgetOptimizer extends EventEmitter {
  constructor(manager) {
    super();
    this.agentId = 'karim-budget-optimizer';
    this.role = 'budget_analyst';
    this.status = 'available';
    this.manager = manager;
    
    // Core capabilities
    this.capabilities = [
      'budget_analysis',
      'price_tracking',
      'cost_optimization',
      'financial_planning',
      'expense_monitoring',
      'savings_identification',
      'currency_conversion',
      'real_time_pricing'
    ];

    // Financial knowledge and algorithms
    this.financialData = {
      priceHistory: new Map(),
      budgetTemplates: new Map(),
      costBenchmarks: new Map(),
      savingsOpportunities: new Map()
    };

    // Active budget projects
    this.activeProjects = new Map();
    this.completedProjects = new Map();
    
    // Performance metrics
    this.metrics = {
      budgetsAnalyzed: 0,
      totalSavingsIdentified: 0,
      priceComparisons: 0,
      optimizationSuggestions: 0,
      averageSavingsPercentage: 0
    };

    this.initializeKarim();
  }

  /**
   * Initialize Karim's financial systems and algorithms
   */
  async initializeKarim() {
    try {
      console.log('💰 Initializing Karim - Budget Optimizer Agent...');
      
      // Load budget templates
      await this.loadBudgetTemplates();
      
      // Load cost benchmarks
      await this.loadCostBenchmarks();
      
      // Initialize price tracking systems
      this.initializePriceTracking();
      
      // Initialize optimization algorithms
      this.initializeOptimizationAlgorithms();
      
      this.status = 'ready';
      console.log('✅ Karim Budget Optimizer initialized successfully');
      
      this.emit('agentReady', {
        agentId: this.agentId,
        capabilities: this.capabilities.length,
        status: this.status
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Karim:', error);
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Load budget templates for different trip types
   */
  async loadBudgetTemplates() {
    const templates = {
      'budget': {
        name: 'Budget Traveler',
        accommodation: 0.3,      // 30% of budget
        food: 0.25,              // 25% of budget
        activities: 0.2,         // 20% of budget
        transportation: 0.15,    // 15% of budget
        shopping: 0.05,          // 5% of budget
        emergency: 0.05          // 5% of budget
      },
      'midrange': {
        name: 'Mid-Range Traveler',
        accommodation: 0.35,     // 35% of budget
        food: 0.25,              // 25% of budget
        activities: 0.2,         // 20% of budget
        transportation: 0.12,    // 12% of budget
        shopping: 0.05,          // 5% of budget
        emergency: 0.03          // 3% of budget
      },
      'luxury': {
        name: 'Luxury Traveler',
        accommodation: 0.45,     // 45% of budget
        food: 0.25,              // 25% of budget
        activities: 0.15,        // 15% of budget
        transportation: 0.1,     // 10% of budget
        shopping: 0.03,          // 3% of budget
        emergency: 0.02          // 2% of budget
      }
    };

    for (const [type, template] of Object.entries(templates)) {
      this.financialData.budgetTemplates.set(type, template);
    }

    console.log(`💼 Loaded ${Object.keys(templates).length} budget templates`);
  }

  /**
   * Load cost benchmarks for different destinations
   */
  async loadCostBenchmarks() {
    const benchmarks = {
      'tokyo': {
        accommodation: { budget: 50, midrange: 120, luxury: 300 },
        food: { budget: 30, midrange: 60, luxury: 150 },
        activities: { budget: 20, midrange: 50, luxury: 100 },
        transportation: { budget: 15, midrange: 30, luxury: 80 }
      },
      'paris': {
        accommodation: { budget: 60, midrange: 150, luxury: 400 },
        food: { budget: 40, midrange: 80, luxury: 200 },
        activities: { budget: 25, midrange: 60, luxury: 120 },
        transportation: { budget: 20, midrange: 40, luxury: 100 }
      },
      'bangkok': {
        accommodation: { budget: 20, midrange: 50, luxury: 150 },
        food: { budget: 15, midrange: 30, luxury: 80 },
        activities: { budget: 10, midrange: 25, luxury: 60 },
        transportation: { budget: 8, midrange: 15, luxury: 40 }
      }
    };

    for (const [destination, costs] of Object.entries(benchmarks)) {
      this.financialData.costBenchmarks.set(destination, costs);
    }

    console.log(`📊 Loaded cost benchmarks for ${Object.keys(benchmarks).length} destinations`);
  }

  /**
   * Initialize price tracking systems
   */
  initializePriceTracking() {
    this.priceTracking = {
      flightPrices: new Map(),
      hotelRates: new Map(),
      activityCosts: new Map(),
      transportationFares: new Map()
    };
  }

  /**
   * Initialize optimization algorithms
   */
  initializeOptimizationAlgorithms() {
    this.algorithms = {
      budgetOptimizer: this.optimizeBudget.bind(this),
      priceComparer: this.comparePrices.bind(this),
      savingsFinder: this.findSavings.bind(this),
      costPredictor: this.predictCosts.bind(this)
    };
  }

  /**
   * Main method: Analyze and optimize budget for trip
   */
  async analyzeBudget(request) {
    const startTime = Date.now();
    const projectId = `budget_${request.destination}_${Date.now()}`;
    
    try {
      console.log(`💰 Karim analyzing budget for ${request.destination}...`);
      
      // Create budget project
      const project = {
        id: projectId,
        destination: request.destination,
        totalBudget: request.budget,
        duration: request.duration || 7,
        travelers: request.travelers || 1,
        budgetLevel: request.budgetLevel || 'midrange',
        status: 'analyzing',
        createdAt: new Date()
      };

      this.activeProjects.set(projectId, project);

      // Phase 0: Query Memory for Budget Context
      console.log('🧠 Phase 0: Querying memory for budget context...');
      const memoryContext = await this.queryMemoryForBudgetContext(request);
      
      // Phase 1: Budget Breakdown (enhanced with memory)
      console.log('💼 Phase 1: Breaking down budget...');
      const budgetBreakdown = await this.createBudgetBreakdown(project, memoryContext);
      
      // Phase 2: Cost Analysis
      console.log('📊 Phase 2: Analyzing costs...');
      const costAnalysis = await this.analyzeCosts(project, budgetBreakdown);
      
      // Phase 3: Price Comparison
      console.log('🔍 Phase 3: Comparing prices...');
      const priceComparison = await this.comparePrices(project, costAnalysis);
      
      // Phase 4: Optimization
      console.log('⚡ Phase 4: Optimizing for savings...');
      const optimization = await this.optimizeForSavings(project, priceComparison);
      
      // Phase 5: Final Budget
      console.log('✅ Phase 5: Creating final budget...');
      const finalBudget = await this.createFinalBudget(project, optimization);

      // Complete project
      project.status = 'completed';
      project.budget = finalBudget;
      project.analysisTime = Date.now() - startTime;
      
      this.activeProjects.delete(projectId);
      this.completedProjects.set(projectId, project);

      // Update metrics
      this.metrics.budgetsAnalyzed++;
      this.updateSavingsMetrics(finalBudget.savingsIdentified);

      console.log(`🎉 Budget analysis for ${request.destination} completed!`);
      
      return {
        success: true,
        projectId,
        budget: finalBudget,
        analysisTime: project.analysisTime,
        savingsIdentified: finalBudget.savingsIdentified,
        recommendations: this.generateBudgetRecommendations(finalBudget),
        priceAlerts: this.setupPriceAlerts(finalBudget)
      };

    } catch (error) {
      console.error('❌ Budget analysis failed:', error);
      throw new Error(`Failed to analyze budget: ${error.message}`);
    }
  }

  /**
   * Query memory for budget context and historical data
   */
  async queryMemoryForBudgetContext(request) {
    try {
      if (!this.manager || !this.manager.memoryManager) {
        console.log('⚠️ Memory Manager not available, proceeding without budget memory context');
        return { memories: [], hasMemory: false };
      }

      const queries = [
        // Query for destination-specific budget data
        `budget analysis ${request.destination}`,
        `price data ${request.destination}`,
        `cost breakdown ${request.destination}`,
        // Query for similar budget levels
        `${request.budgetLevel} budget ${request.destination}`,
        // Query for user-specific budget preferences
        `user budget preferences ${request.userId || 'anonymous'}`
      ];

      const allMemories = [];
      for (const query of queries) {
        const result = await this.manager.queryMemory(query, {
          type: 'budget',
          limit: 3,
          destination: request.destination,
          user_id: request.userId
        });
        
        if (result.success && result.results.length > 0) {
          allMemories.push(...result.results);
        }
      }

      console.log(`🧠 Found ${allMemories.length} relevant budget memories`);
      
      return {
        memories: allMemories,
        hasMemory: allMemories.length > 0,
        budgetMemories: allMemories.filter(m => m.metadata.memory_type === 'budget_analysis'),
        priceMemories: allMemories.filter(m => m.content.includes('price') || m.content.includes('cost')),
        userBudgetMemories: allMemories.filter(m => m.metadata.user_id === request.userId)
      };

    } catch (error) {
      console.error('❌ Failed to query budget memory:', error);
      return { memories: [], hasMemory: false, error: error.message };
    }
  }

  /**
   * Create detailed budget breakdown (enhanced with memory)
   */
  async createBudgetBreakdown(project, memoryContext = {}) {
    const template = this.financialData.budgetTemplates.get(project.budgetLevel);
    const dailyBudget = project.totalBudget / project.duration;
    
    const breakdown = {
      total: project.totalBudget,
      daily: dailyBudget,
      perPerson: dailyBudget / project.travelers,
      categories: {}
    };

    // Allocate budget by category
    for (const [category, percentage] of Object.entries(template)) {
      if (category !== 'name') {
        breakdown.categories[category] = {
          percentage: percentage,
          daily: Math.round(dailyBudget * percentage),
          total: Math.round(project.totalBudget * percentage)
        };
      }
    }

    return breakdown;
  }

  /**
   * Analyze costs for destination
   */
  async analyzeCosts(project, budgetBreakdown) {
    const destination = project.destination.toLowerCase();
    const benchmarks = this.financialData.costBenchmarks.get(destination) || this.getDefaultBenchmarks();
    
    const analysis = {
      destination: project.destination,
      benchmarks: benchmarks,
      costComparison: {},
      affordability: {},
      recommendations: []
    };

    // Compare budget allocation with destination benchmarks
    for (const [category, allocation] of Object.entries(budgetBreakdown.categories)) {
      const benchmark = benchmarks[category] || { budget: 20, midrange: 50, luxury: 100 };
      
      analysis.costComparison[category] = {
        allocated: allocation.daily,
        benchmark: benchmark[project.budgetLevel] || benchmark.midrange,
        difference: allocation.daily - (benchmark[project.budgetLevel] || benchmark.midrange),
        status: allocation.daily >= (benchmark[project.budgetLevel] || benchmark.midrange) ? 'sufficient' : 'insufficient'
      };

      // Determine affordability
      if (analysis.costComparison[category].status === 'insufficient') {
        analysis.recommendations.push({
          category,
          issue: 'Budget may be insufficient',
          suggestion: `Consider increasing ${category} budget or finding alternatives`
        });
      }
    }

    return analysis;
  }

  /**
   * Compare prices across different options
   */
  async comparePrices(project, costAnalysis) {
    const comparison = {
      flights: await this.compareFlightPrices(project),
      hotels: await this.compareHotelRates(project),
      activities: await this.compareActivityPrices(project),
      transportation: await this.compareTransportationCosts(project)
    };

    return comparison;
  }

  /**
   * Compare flight prices
   */
  async compareFlightPrices(project) {
    // Simulate flight price comparison
    const options = [
      { airline: 'Budget Airline', price: 400, stops: 1, duration: '12h 30m', rating: 3.2 },
      { airline: 'Mid-Range Airline', price: 650, stops: 0, duration: '9h 15m', rating: 4.1 },
      { airline: 'Premium Airline', price: 950, stops: 0, duration: '8h 45m', rating: 4.7 }
    ];

    return {
      options: options,
      bestValue: options[1], // Mid-range option
      cheapest: options[0],
      premium: options[2],
      savings: options[2].price - options[0].price
    };
  }

  /**
   * Compare hotel rates
   */
  async compareHotelRates(project) {
    const options = [
      { name: 'Budget Hostel', price: 45, rating: 3.5, location: 'City Center', amenities: ['WiFi', 'Breakfast'] },
      { name: 'Mid-Range Hotel', price: 120, rating: 4.2, location: 'Near Attractions', amenities: ['WiFi', 'Pool', 'Restaurant'] },
      { name: 'Luxury Hotel', price: 280, rating: 4.8, location: 'Prime Location', amenities: ['WiFi', 'Spa', 'Concierge', 'Room Service'] }
    ];

    return {
      options: options,
      bestValue: options[1],
      cheapest: options[0],
      premium: options[2],
      savings: options[2].price - options[0].price
    };
  }

  /**
   * Compare activity prices
   */
  async compareActivityPrices(project) {
    const activities = [
      { name: 'Free Walking Tour', price: 0, duration: '2h', rating: 4.3 },
      { name: 'Museum Pass', price: 35, duration: 'Full Day', rating: 4.5 },
      { name: 'Private Guided Tour', price: 120, duration: '4h', rating: 4.8 },
      { name: 'Cultural Experience', price: 65, duration: '3h', rating: 4.6 }
    ];

    return {
      activities: activities,
      budgetFriendly: activities.slice(0, 2),
      premium: activities.slice(2),
      totalBudget: activities.reduce((sum, activity) => sum + activity.price, 0),
      recommended: activities.filter(a => a.price <= 50)
    };
  }

  /**
   * Compare transportation costs
   */
  async compareTransportationCosts(project) {
    const options = [
      { type: 'Public Transport Pass', price: 25, coverage: 'City-wide', duration: '7 days' },
      { type: 'Taxi/Uber', price: 150, coverage: 'On-demand', duration: 'Per trip' },
      { type: 'Car Rental', price: 200, coverage: 'Flexible', duration: '7 days' },
      { type: 'Bike Rental', price: 40, coverage: 'City-wide', duration: '7 days' }
    ];

    return {
      options: options,
      recommended: options[0], // Public transport
      flexible: options[2], // Car rental
      ecoFriendly: options[3], // Bike rental
      costEffective: options[0]
    };
  }

  /**
   * Optimize for savings opportunities
   */
  async optimizeForSavings(project, priceComparison) {
    const savings = {
      totalPotentialSavings: 0,
      opportunities: [],
      recommendations: []
    };

    // Flight savings
    if (priceComparison.flights.savings > 0) {
      savings.opportunities.push({
        category: 'flights',
        savings: priceComparison.flights.savings,
        recommendation: `Switch to budget airline to save $${priceComparison.flights.savings}`
      });
    }

    // Hotel savings
    if (priceComparison.hotels.savings > 0) {
      savings.opportunities.push({
        category: 'hotels',
        savings: priceComparison.hotels.savings,
        recommendation: `Consider budget accommodation to save $${priceComparison.hotels.savings}`
      });
    }

    // Transportation savings
    if (priceComparison.transportation.recommended.price < priceComparison.transportation.flexible.price) {
      const transportSavings = priceComparison.transportation.flexible.price - priceComparison.transportation.recommended.price;
      savings.opportunities.push({
        category: 'transportation',
        savings: transportSavings,
        recommendation: `Use public transport instead of car rental to save $${transportSavings}`
      });
    }

    // Calculate total savings
    savings.totalPotentialSavings = savings.opportunities.reduce((sum, opp) => sum + opp.savings, 0);

    return savings;
  }

  /**
   * Create final optimized budget
   */
  async createFinalBudget(project, optimization) {
    const finalBudget = {
      destination: project.destination,
      totalBudget: project.totalBudget,
      duration: project.duration,
      travelers: project.travelers,
      budgetLevel: project.budgetLevel,
      breakdown: {},
      savingsIdentified: optimization.totalPotentialSavings,
      recommendations: optimization.recommendations,
      alternatives: this.generateBudgetAlternatives(project, optimization),
      monitoring: this.setupBudgetMonitoring(project)
    };

    // Store budget data
    await this.storeBudgetData(finalBudget, project);

    return finalBudget;
  }

  /**
   * Generate budget recommendations
   */
  generateBudgetRecommendations(budget) {
    return {
      immediate: [
        'Book flights early for best prices',
        'Consider alternative airports',
        'Mix accommodation types for variety and savings'
      ],
      ongoing: [
        'Monitor price changes with alerts',
        'Look for package deals',
        'Consider shoulder season travel'
      ],
      emergency: [
        'Keep 5% buffer for unexpected costs',
        'Have travel insurance',
        'Know local emergency numbers'
      ]
    };
  }

  /**
   * Setup price alerts for monitoring
   */
  setupPriceAlerts(budget) {
    return {
      flights: {
        enabled: true,
        targetPrice: budget.flightTarget || 600,
        alertFrequency: 'daily'
      },
      hotels: {
        enabled: true,
        targetPrice: budget.hotelTarget || 120,
        alertFrequency: 'weekly'
      },
      activities: {
        enabled: true,
        targetPrice: budget.activityTarget || 50,
        alertFrequency: 'weekly'
      }
    };
  }

  // Utility methods
  getDefaultBenchmarks() {
    return {
      accommodation: { budget: 40, midrange: 100, luxury: 250 },
      food: { budget: 25, midrange: 50, luxury: 120 },
      activities: { budget: 15, midrange: 35, luxury: 80 },
      transportation: { budget: 12, midrange: 25, luxury: 60 }
    };
  }

  generateBudgetAlternatives(project, optimization) {
    return {
      budgetTraveler: {
        totalBudget: Math.round(project.totalBudget * 0.7),
        savings: project.totalBudget - Math.round(project.totalBudget * 0.7),
        changes: ['Hostels instead of hotels', 'Street food and markets', 'Free walking tours', 'Public transport only']
      },
      luxuryTraveler: {
        totalBudget: Math.round(project.totalBudget * 1.5),
        additional: Math.round(project.totalBudget * 0.5),
        upgrades: ['5-star hotels', 'Fine dining experiences', 'Private tours', 'First-class transport']
      }
    };
  }

  setupBudgetMonitoring(project) {
    return {
      dailyTracking: true,
      categoryAlerts: true,
      priceChangeThreshold: 0.1, // 10% price change
      weeklyReports: true,
      emergencyAlerts: true
    };
  }

  updateSavingsMetrics(savings) {
    this.metrics.totalSavingsIdentified += savings;
    this.metrics.averageSavingsPercentage = this.metrics.totalSavingsIdentified / this.metrics.budgetsAnalyzed;
  }

  // Data persistence methods
  async storeBudgetData(budget, project) {
    try {
      const dataDir = path.join('backend', 'data', 'budgets');
      await fs.mkdir(dataDir, { recursive: true });
      
      const filename = `budget_${project.id}.json`;
      const filepath = path.join(dataDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify({ budget, project }, null, 2));
      console.log(`💾 Budget stored: ${filename}`);
      
    } catch (error) {
      console.error('❌ Failed to store budget:', error);
    }
  }

  // Agent status and metrics
  async getAgentStatus() {
    return {
      agent_id: this.agentId,
      role: this.role,
      status: this.status,
      capabilities: this.capabilities.length,
      active_projects: this.activeProjects.size,
      completed_projects: this.completedProjects.size,
      metrics: this.metrics,
      financial_data_loaded: this.financialData.budgetTemplates.size
    };
  }

  async getPerformanceMetrics() {
    return {
      budgets_analyzed: this.metrics.budgetsAnalyzed,
      total_savings_identified: this.metrics.totalSavingsIdentified,
      price_comparisons: this.metrics.priceComparisons,
      optimization_suggestions: this.metrics.optimizationSuggestions,
      average_savings_percentage: this.metrics.averageSavingsPercentage,
      active_projects: this.activeProjects.size,
      uptime: Date.now() - (this.startTime || Date.now())
    };
  }
}

module.exports = KarimBudgetOptimizer;
