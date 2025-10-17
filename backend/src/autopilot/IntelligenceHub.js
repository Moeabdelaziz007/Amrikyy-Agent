#!/usr/bin/env node

/**
 * 🧠 INTELLIGENCE HUB - Cross-System Intelligence Sharing
 * Bridges Maya Travel Agent and Money Hunter for unified intelligence
 */

/* eslint-disable no-console */
/* global setInterval */

const EventEmitter = require('events');

class IntelligenceHub extends EventEmitter {
  constructor() {
    super();

    // Intelligence Data Stores
    this.userInsights = new Map(); // Shared user preferences and patterns
    this.marketIntelligence = new Map(); // Cross-system market data
    this.performanceMetrics = new Map(); // Unified performance tracking
    this.patternDatabase = new Map(); // Shared pattern learning
    this.resourceOptimization = new Map(); // Cross-system resource management

    // System References (will be injected)
    this.mayaTravelAgent = null;
    this.moneyHunter = null;
    this.autopilotEngine = null;

    // Configuration
    this.config = {
      syncInterval: 30000, // 30 seconds
      maxInsightsHistory: 1000,
      enableCrossSystemLearning: true,
      enableResourceOptimization: true,
      enablePerformanceSharing: true
    };

    // Intelligence Analytics
    this.analytics = {
      insightsShared: 0,
      crossSystemOptimizations: 0,
      resourceSavings: 0,
      performanceImprovements: 0,
      lastSync: null
    };

    this.initialize();
  }

  /**
   * Initialize the Intelligence Hub
   */
  async initialize() {
    console.log('🧠 Initializing Intelligence Hub...');

    try {
      // Start periodic intelligence sync
      this.startIntelligenceSync();

      // Setup event listeners for cross-system communication
      this.setupEventListeners();

      console.log('✅ Intelligence Hub initialized successfully');
      this.emit('intelligence:ready');

    } catch (error) {
      console.error('❌ Failed to initialize Intelligence Hub:', error);
      this.emit('intelligence:error', error);
    }
  }

  /**
   * Inject system references
   */
  injectSystems(mayaTravelAgent, moneyHunter, autopilotEngine) {
    this.mayaTravelAgent = mayaTravelAgent;
    this.moneyHunter = moneyHunter;
    this.autopilotEngine = autopilotEngine;

    console.log('🔗 Systems injected into Intelligence Hub');
    this.setupCrossSystemListeners();
  }

  /**
   * Setup cross-system event listeners
   */
  setupCrossSystemListeners() {
    // Maya Travel Agent events
    if (this.mayaTravelAgent) {
      this.mayaTravelAgent.on('user:preference_learned', this.handleUserPreferenceLearned.bind(this));
      this.mayaTravelAgent.on('booking:completed', this.handleBookingCompleted.bind(this));
      this.mayaTravelAgent.on('conversation:insight', this.handleConversationInsight.bind(this));
    }

    // Money Hunter events
    if (this.moneyHunter) {
      this.moneyHunter.on('opportunity:found', this.handleOpportunityFound.bind(this));
      this.moneyHunter.on('revenue:generated', this.handleRevenueGenerated.bind(this));
      this.moneyHunter.on('market:trend_detected', this.handleMarketTrendDetected.bind(this));
    }

    // Autopilot Engine events
    if (this.autopilotEngine) {
      this.autopilotEngine.on('performance:optimized', this.handlePerformanceOptimized.bind(this));
      this.autopilotEngine.on('resource:optimized', this.handleResourceOptimized.bind(this));
    }
  }

  /**
   * Handle user preference learned from Maya Travel Agent
   */
  handleUserPreferenceLearned(preference) {
    console.log('📊 User preference learned:', preference);

    // Store in shared intelligence
    const userId = preference.userId;
    if (!this.userInsights.has(userId)) {
      this.userInsights.set(userId, {
        preferences: new Map(),
        patterns: [],
        lastUpdated: Date.now()
      });
    }

    const userData = this.userInsights.get(userId);
    userData.preferences.set(preference.type, preference.data);
    userData.lastUpdated = Date.now();

    // Share with Money Hunter for targeted opportunities
    if (this.moneyHunter) {
      this.moneyHunter.updateUserProfile(userId, {
        travelPreferences: preference.data,
        userSegment: this.categorizeUserSegment(preference.data)
      });
    }

    this.analytics.insightsShared++;
    this.emit('intelligence:user_insight_shared', { userId, preference });
  }

  /**
   * Handle booking completed from Maya Travel Agent
   */
  handleBookingCompleted(booking) {
    console.log('✈️ Booking completed:', booking);

    // Extract spending patterns
    const spendingInsight = {
      userId: booking.userId,
      type: 'spending_pattern',
      data: {
        budget: booking.budget,
        destination: booking.destination,
        accommodation: booking.accommodation,
        activities: booking.activities,
        timestamp: Date.now()
      }
    };

    this.handleUserPreferenceLearned(spendingInsight);

    // Share with Money Hunter for revenue opportunity matching
    if (this.moneyHunter) {
      this.moneyHunter.analyzeSpendingPattern(booking);
    }

    this.emit('intelligence:booking_insight_shared', booking);
  }

  /**
   * Handle conversation insight (placeholder)
   */
  handleConversationInsight(insight) {
    console.log('💬 Conversation insight:', insight);
    // Implement conversation insight handling
  }

  /**
   * Handle opportunity found from Money Hunter
   */
  handleOpportunityFound(opportunity) {
    console.log('💰 Opportunity found:', opportunity);

    // Store in market intelligence
    this.marketIntelligence.set(opportunity.id, {
      ...opportunity,
      timestamp: Date.now(),
      crossSystemRelevance: this.assessCrossSystemRelevance(opportunity)
    });

    // Check if relevant to Maya Travel Agent users
    if (this.mayaTravelAgent && opportunity.category === 'travel_services') {
      this.mayaTravelAgent.notifyTravelOpportunity(opportunity);
    }

    this.emit('intelligence:opportunity_shared', opportunity);
  }

  /**
   * Handle revenue generated from Money Hunter
   */
  handleRevenueGenerated(revenue) {
    console.log('💵 Revenue generated:', revenue);

    // Update performance metrics
    const today = new Date().toDateString();
    if (!this.performanceMetrics.has(today)) {
      this.performanceMetrics.set(today, {
        revenue: 0,
        opportunities: 0,
        conversions: 0
      });
    }

    const dayMetrics = this.performanceMetrics.get(today);
    dayMetrics.revenue += revenue.amount;
    dayMetrics.conversions++;

    // Share performance insights with Autopilot Engine
    if (this.autopilotEngine) {
      this.autopilotEngine.updateRevenueMetrics({
        source: 'money_hunter',
        amount: revenue.amount,
        opportunity: revenue.opportunity,
        timestamp: Date.now()
      });
    }

    this.emit('intelligence:revenue_shared', revenue);
  }

  /**
   * Handle market trend detected from Money Hunter
   */
  handleMarketTrendDetected(trend) {
    console.log('📈 Market trend detected:', trend);

    // Store trend data
    this.marketIntelligence.set(`trend_${trend.id}`, {
      ...trend,
      timestamp: Date.now(),
      crossSystemImpact: this.assessTrendImpact(trend)
    });

    // Share with Maya Travel Agent if travel-related
    if (trend.category === 'travel' && this.mayaTravelAgent) {
      this.mayaTravelAgent.updateMarketTrend(trend);
    }

    this.emit('intelligence:trend_shared', trend);
  }

  /**
   * Handle performance optimized from Autopilot Engine
   */
  handlePerformanceOptimized(optimization) {
    console.log('⚡ Performance optimized:', optimization);

    this.analytics.performanceImprovements++;

    // Share optimization insights across systems
    if (optimization.system === 'maya_travel') {
      this.moneyHunter?.applyPerformanceOptimization(optimization);
    } else if (optimization.system === 'money_hunter') {
      this.mayaTravelAgent?.applyPerformanceOptimization(optimization);
    }

    this.emit('intelligence:optimization_shared', optimization);
  }

  /**
   * Handle resource optimized from Autopilot Engine
   */
  handleResourceOptimized(optimization) {
    console.log('🔧 Resource optimized:', optimization);

    this.analytics.resourceSavings += optimization.savings;
    this.analytics.crossSystemOptimizations++;

    // Update resource optimization database
    this.resourceOptimization.set(optimization.id, {
      ...optimization,
      timestamp: Date.now()
    });

    this.emit('intelligence:resource_optimization_shared', optimization);
  }

  /**
   * Start periodic intelligence synchronization
   */
  startIntelligenceSync() {
    setInterval(() => {
      this.syncIntelligence();
    }, this.config.syncInterval);
  }

  /**
   * Synchronize intelligence across systems
   */
  async syncIntelligence() {
    try {
      console.log('🔄 Syncing intelligence across systems...');

      // Sync user insights
      await this.syncUserInsights();

      // Sync market intelligence
      await this.syncMarketIntelligence();

      // Sync performance metrics
      await this.syncPerformanceMetrics();

      // Optimize resources
      if (this.config.enableResourceOptimization) {
        await this.optimizeResources();
      }

      this.analytics.lastSync = Date.now();
      this.emit('intelligence:synced');

    } catch (error) {
      console.error('❌ Intelligence sync failed:', error);
      this.emit('intelligence:sync_error', error);
    }
  }

  /**
   * Sync user insights across systems
   */
  async syncUserInsights() {
    // Export user insights for cross-system learning
    const insights = Array.from(this.userInsights.entries());

    if (this.moneyHunter) {
      await this.moneyHunter.updateUserInsights(insights);
    }

    if (this.mayaTravelAgent) {
      await this.mayaTravelAgent.updateUserInsights(insights);
    }
  }

  /**
   * Sync market intelligence across systems
   */
  async syncMarketIntelligence() {
    const marketData = Array.from(this.marketIntelligence.entries());

    // Share relevant market data
    for (const [_key, data] of marketData) {
      if (data.category === 'travel' && this.mayaTravelAgent) {
        await this.mayaTravelAgent.updateMarketData(data);
      }

      if (data.category === 'freelance' && this.moneyHunter) {
        await this.moneyHunter.updateMarketData(data);
      }
    }
  }

  /**
   * Sync performance metrics across systems
   */
  async syncPerformanceMetrics() {
    const metrics = Array.from(this.performanceMetrics.entries());

    if (this.autopilotEngine) {
      await this.autopilotEngine.updateCrossSystemMetrics(metrics);
    }
  }

  /**
   * Optimize resources across systems
   */
  async optimizeResources() {
    // Analyze resource usage patterns
    const optimization = await this.analyzeResourceUsage();

    if (optimization.recommendations.length > 0) {
      console.log('💡 Resource optimization recommendations:', optimization.recommendations);

      // Apply optimizations
      for (const recommendation of optimization.recommendations) {
        await this.applyResourceOptimization(recommendation);
      }
    }
  }

  /**
   * Analyze resource usage patterns
   */
  async analyzeResourceUsage() {
    const recommendations = [];

    // Analyze CPU usage patterns
    const cpuPatterns = this.analyzeCPUPatterns();
    if (cpuPatterns.canOptimize) {
      recommendations.push({
        type: 'cpu_optimization',
        system: cpuPatterns.targetSystem,
        action: cpuPatterns.action,
        expectedSavings: cpuPatterns.savings
      });
    }

    // Analyze memory usage patterns
    const memoryPatterns = this.analyzeMemoryPatterns();
    if (memoryPatterns.canOptimize) {
      recommendations.push({
        type: 'memory_optimization',
        system: memoryPatterns.targetSystem,
        action: memoryPatterns.action,
        expectedSavings: memoryPatterns.savings
      });
    }

    return { recommendations };
  }

  /**
   * Apply resource optimization recommendation
   */
  async applyResourceOptimization(recommendation) {
    console.log('🔧 Applying resource optimization:', recommendation);

    try {
      if (recommendation.system === 'maya_travel' && this.mayaTravelAgent) {
        await this.mayaTravelAgent.optimizeResources(recommendation);
      } else if (recommendation.system === 'money_hunter' && this.moneyHunter) {
        await this.moneyHunter.optimizeResources(recommendation);
      }

      this.analytics.crossSystemOptimizations++;

    } catch (error) {
      console.error('❌ Failed to apply resource optimization:', error);
    }
  }

  /**
   * Get unified analytics dashboard data
   */
  getUnifiedAnalytics() {
    return {
      intelligence: {
        insightsShared: this.analytics.insightsShared,
        crossSystemOptimizations: this.analytics.crossSystemOptimizations,
        resourceSavings: this.analytics.resourceSavings,
        performanceImprovements: this.analytics.performanceImprovements,
        lastSync: this.analytics.lastSync
      },
      userInsights: {
        totalUsers: this.userInsights.size,
        recentUpdates: Array.from(this.userInsights.values())
          .filter(user => Date.now() - user.lastUpdated < 86400000) // Last 24 hours
          .length
      },
      marketIntelligence: {
        totalOpportunities: this.marketIntelligence.size,
        activeTrends: Array.from(this.marketIntelligence.values())
          .filter(data => data.timestamp > Date.now() - 86400000)
          .length
      },
      performance: {
        dailyRevenue: this.getDailyRevenue(),
        weeklyTrend: this.getWeeklyTrend(),
        systemHealth: this.getSystemHealth()
      }
    };
  }

  /**
   * Get daily revenue across systems
   */
  getDailyRevenue() {
    const today = new Date().toDateString();
    const todayMetrics = this.performanceMetrics.get(today);

    return todayMetrics ? todayMetrics.revenue : 0;
  }

  /**
   * Get weekly trend analysis
   */
  getWeeklyTrend() {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyData = Array.from(this.performanceMetrics.entries())
      .filter(([date]) => new Date(date) >= new Date(weekAgo))
      .map(([, metrics]) => metrics);

    if (weeklyData.length === 0) {
      return { trend: 'no_data', percentage: 0 };
    }

    const totalRevenue = weeklyData.reduce((sum, day) => sum + day.revenue, 0);

    // Simple trend calculation
    const recent = weeklyData.slice(-3).reduce((sum, day) => sum + day.revenue, 0) / 3;
    const older = weeklyData.slice(0, -3).reduce((sum, day) => sum + day.revenue, 0) / Math.max(1, weeklyData.length - 3);

    const percentage = older > 0 ? ((recent - older) / older) * 100 : 0;

    return {
      trend: percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable',
      percentage: Math.round(percentage),
      totalRevenue
    };
  }

  /**
   * Get system health across all systems
   */
  getSystemHealth() {
    const health = {
      maya_travel: 'unknown',
      money_hunter: 'unknown',
      autopilot: 'unknown'
    };

    // Check Maya Travel Agent health
    if (this.mayaTravelAgent) {
      health.maya_travel = this.mayaTravelAgent.isHealthy ? 'healthy' : 'unhealthy';
    }

    // Check Money Hunter health
    if (this.moneyHunter) {
      health.money_hunter = this.moneyHunter.isHealthy ? 'healthy' : 'unhealthy';
    }

    // Check Autopilot Engine health
    if (this.autopilotEngine) {
      health.autopilot = this.autopilotEngine.isHealthy ? 'healthy' : 'unhealthy';
    }

    return health;
  }

  // Utility methods
  categorizeUserSegment(preferenceData) {
    // Simple user segmentation based on preferences
    if (preferenceData.budget > 5000) {
      return 'premium';
    }
    if (preferenceData.budget > 2000) {
      return 'business';
    }
    return 'budget';
  }

  assessCrossSystemRelevance(opportunity) {
    // Assess how relevant an opportunity is to other systems
    let relevance = 0;

    if (opportunity.category === 'travel_services') {
      relevance += 0.8;
    }
    if (opportunity.category === 'data_analysis') {
      relevance += 0.6;
    }
    if (opportunity.category === 'automation') {
      relevance += 0.7;
    }

    return relevance;
  }

  assessTrendImpact(trend) {
    // Assess the impact of a market trend on other systems
    const impacts = {
      maya_travel: 0,
      money_hunter: 0,
      autopilot: 0
    };

    if (trend.category === 'travel') {
      impacts.maya_travel = 0.9;
    }
    if (trend.category === 'freelance') {
      impacts.money_hunter = 0.9;
    }
    if (trend.category === 'ai_automation') {
      impacts.autopilot = 0.8;
    }

    return impacts;
  }

  analyzeCPUPatterns() {
    // Simple CPU pattern analysis (would be more sophisticated in production)
    return {
      canOptimize: false,
      targetSystem: null,
      action: null,
      savings: 0
    };
  }

  analyzeMemoryPatterns() {
    // Simple memory pattern analysis (would be more sophisticated in production)
    return {
      canOptimize: false,
      targetSystem: null,
      action: null,
      savings: 0
    };
  }

  setupEventListeners() {
    // Setup internal event listeners
    this.on('intelligence:ready', () => {
      console.log('🧠 Intelligence Hub ready for cross-system coordination');
    });

    this.on('intelligence:error', (error) => {
      console.error('❌ Intelligence Hub error:', error);
    });
  }
}

module.exports = IntelligenceHub;
