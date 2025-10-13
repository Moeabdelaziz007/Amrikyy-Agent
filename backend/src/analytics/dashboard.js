/**
 * Analytics Dashboard Service
 * Real-time analytics and metrics for Maya Travel Agent
 */

class AnalyticsDashboard {
  constructor() {
    this.metrics = {
      ai: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        costPerRequest: 0,
        modelUsage: {}
      },
      revenue: {
        totalRevenue: 0,
        monthlyRevenue: 0,
        dailyRevenue: 0,
        topRevenueSources: [],
        conversionRate: 0
      },
      users: {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        userEngagement: 0,
        topFeatures: []
      },
      system: {
        uptime: 0,
        errorRate: 0,
        responseTime: 0,
        memoryUsage: 0,
        cpuUsage: 0
      }
    };
    
    this.realTimeData = new Map();
    this.alerts = [];
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(timeRange = '24h') {
    try {
      const data = {
        overview: await this.getOverviewMetrics(timeRange),
        ai: await this.getAIMetrics(timeRange),
        revenue: await this.getRevenueMetrics(timeRange),
        users: await this.getUserMetrics(timeRange),
        system: await this.getSystemMetrics(timeRange),
        realTime: this.getRealTimeData(),
        alerts: this.getActiveAlerts(),
        timestamp: new Date().toISOString()
      };

      return {
        success: true,
        data,
        timeRange
      };
    } catch (error) {
      console.error('Dashboard data error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get overview metrics
   */
  async getOverviewMetrics(timeRange) {
    return {
      totalRequests: this.metrics.ai.totalRequests,
      totalRevenue: this.metrics.revenue.totalRevenue,
      activeUsers: this.metrics.users.activeUsers,
      systemHealth: this.calculateSystemHealth(),
      costSavings: this.calculateCostSavings(),
      performanceScore: this.calculatePerformanceScore()
    };
  }

  /**
   * Get AI metrics
   */
  async getAIMetrics(timeRange) {
    return {
      requests: {
        total: this.metrics.ai.totalRequests,
        successful: this.metrics.ai.successfulRequests,
        failed: this.metrics.ai.failedRequests,
        successRate: this.calculateSuccessRate()
      },
      performance: {
        averageResponseTime: this.metrics.ai.averageResponseTime,
        costPerRequest: this.metrics.ai.costPerRequest,
        totalCost: this.calculateTotalCost()
      },
      modelUsage: this.metrics.ai.modelUsage,
      trends: await this.getAITrends(timeRange)
    };
  }

  /**
   * Get revenue metrics
   */
  async getRevenueMetrics(timeRange) {
    return {
      totals: {
        total: this.metrics.revenue.totalRevenue,
        monthly: this.metrics.revenue.monthlyRevenue,
        daily: this.metrics.revenue.dailyRevenue
      },
      sources: this.metrics.revenue.topRevenueSources,
      conversion: {
        rate: this.metrics.revenue.conversionRate,
        totalConversions: this.calculateTotalConversions()
      },
      trends: await this.getRevenueTrends(timeRange)
    };
  }

  /**
   * Get user metrics
   */
  async getUserMetrics(timeRange) {
    return {
      counts: {
        total: this.metrics.users.totalUsers,
        active: this.metrics.users.activeUsers,
        new: this.metrics.users.newUsers
      },
      engagement: {
        rate: this.metrics.users.userEngagement,
        averageSessionTime: this.calculateAverageSessionTime(),
        retentionRate: this.calculateRetentionRate()
      },
      features: this.metrics.users.topFeatures,
      trends: await this.getUserTrends(timeRange)
    };
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(timeRange) {
    return {
      performance: {
        uptime: this.metrics.system.uptime,
        errorRate: this.metrics.system.errorRate,
        responseTime: this.metrics.system.responseTime
      },
      resources: {
        memoryUsage: this.metrics.system.memoryUsage,
        cpuUsage: this.metrics.system.cpuUsage,
        diskUsage: this.calculateDiskUsage()
      },
      health: {
        status: this.getSystemStatus(),
        lastCheck: new Date().toISOString()
      }
    };
  }

  /**
   * Get real-time data
   */
  getRealTimeData() {
    return {
      activeConnections: this.realTimeData.get('activeConnections') || 0,
      currentRequests: this.realTimeData.get('currentRequests') || 0,
      liveUsers: this.realTimeData.get('liveUsers') || 0,
      systemLoad: this.realTimeData.get('systemLoad') || 0,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts() {
    return this.alerts.filter(alert => alert.status === 'active');
  }

  /**
   * Calculate system health score
   */
  calculateSystemHealth() {
    const factors = {
      uptime: this.metrics.system.uptime / 100,
      errorRate: Math.max(0, 100 - (this.metrics.system.errorRate * 100)),
      responseTime: Math.max(0, 100 - (this.metrics.system.responseTime / 100)),
      memoryUsage: Math.max(0, 100 - this.metrics.system.memoryUsage),
      cpuUsage: Math.max(0, 100 - this.metrics.system.cpuUsage)
    };

    const weights = {
      uptime: 0.3,
      errorRate: 0.25,
      responseTime: 0.2,
      memoryUsage: 0.15,
      cpuUsage: 0.1
    };

    let score = 0;
    for (const [factor, value] of Object.entries(factors)) {
      score += value * weights[factor];
    }

    return Math.round(score);
  }

  /**
   * Calculate cost savings
   */
  calculateCostSavings() {
    const originalCost = this.metrics.ai.totalRequests * 0.003; // Premium model cost
    const actualCost = this.metrics.ai.totalRequests * this.metrics.ai.costPerRequest;
    const savings = originalCost - actualCost;
    
    return {
      amount: savings,
      percentage: originalCost > 0 ? (savings / originalCost) * 100 : 0,
      monthlyProjection: savings * 30
    };
  }

  /**
   * Calculate performance score
   */
  calculatePerformanceScore() {
    const factors = {
      successRate: this.calculateSuccessRate(),
      responseTime: Math.max(0, 100 - (this.metrics.ai.averageResponseTime / 10)),
      costEfficiency: this.calculateCostEfficiency(),
      userSatisfaction: this.calculateUserSatisfaction()
    };

    const weights = {
      successRate: 0.4,
      responseTime: 0.3,
      costEfficiency: 0.2,
      userSatisfaction: 0.1
    };

    let score = 0;
    for (const [factor, value] of Object.entries(factors)) {
      score += value * weights[factor];
    }

    return Math.round(score);
  }

  /**
   * Calculate success rate
   */
  calculateSuccessRate() {
    if (this.metrics.ai.totalRequests === 0) return 100;
    return (this.metrics.ai.successfulRequests / this.metrics.ai.totalRequests) * 100;
  }

  /**
   * Calculate total cost
   */
  calculateTotalCost() {
    return this.metrics.ai.totalRequests * this.metrics.ai.costPerRequest;
  }

  /**
   * Calculate total conversions
   */
  calculateTotalConversions() {
    return Math.round(this.metrics.revenue.totalRevenue * this.metrics.revenue.conversionRate);
  }

  /**
   * Calculate average session time
   */
  calculateAverageSessionTime() {
    // Mock calculation - would be based on actual session data
    return 15.5; // minutes
  }

  /**
   * Calculate retention rate
   */
  calculateRetentionRate() {
    // Mock calculation - would be based on actual user data
    return 78.5; // percentage
  }

  /**
   * Calculate disk usage
   */
  calculateDiskUsage() {
    // Mock calculation - would be based on actual system data
    return 45.2; // percentage
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    const healthScore = this.calculateSystemHealth();
    
    if (healthScore >= 90) return 'excellent';
    if (healthScore >= 80) return 'good';
    if (healthScore >= 70) return 'fair';
    if (healthScore >= 60) return 'poor';
    return 'critical';
  }

  /**
   * Get AI trends
   */
  async getAITrends(timeRange) {
    // Mock trend data - would be based on actual historical data
    return {
      requests: [120, 135, 150, 140, 160, 175, 180],
      costs: [2.1, 2.3, 2.5, 2.2, 2.7, 2.9, 3.1],
      successRate: [95, 96, 94, 97, 95, 96, 98]
    };
  }

  /**
   * Get revenue trends
   */
  async getRevenueTrends(timeRange) {
    // Mock trend data - would be based on actual revenue data
    return {
      daily: [1200, 1350, 1500, 1400, 1600, 1750, 1800],
      monthly: [36000, 40500, 45000, 42000, 48000, 52500, 54000],
      sources: {
        bookings: 60,
        subscriptions: 25,
        premium: 15
      }
    };
  }

  /**
   * Get user trends
   */
  async getUserTrends(timeRange) {
    // Mock trend data - would be based on actual user data
    return {
      active: [450, 480, 520, 500, 550, 580, 600],
      new: [25, 30, 35, 28, 40, 45, 50],
      engagement: [75, 78, 80, 77, 82, 85, 88]
    };
  }

  /**
   * Update metrics
   */
  updateMetrics(type, data) {
    if (this.metrics[type]) {
      Object.assign(this.metrics[type], data);
    }
  }

  /**
   * Add alert
   */
  addAlert(alert) {
    this.alerts.push({
      id: Date.now(),
      ...alert,
      timestamp: new Date().toISOString(),
      status: 'active'
    });
  }

  /**
   * Update real-time data
   */
  updateRealTimeData(key, value) {
    this.realTimeData.set(key, value);
  }
}

module.exports = AnalyticsDashboard;