/**
 * Centralized Data Collection System
 * Tracks all user interactions, API calls, and business metrics
 * 
 * Features:
 * - User behavior tracking
 * - API usage analytics
 * - Search pattern analysis
 * - Booking conversion tracking
 * - Error monitoring
 * - Performance metrics
 * - Real-time aggregation
 */

const EventEmitter = require('events');
const logger = require('../../utils/logger');

class DataCollector extends EventEmitter {
  constructor() {
    super();
    
    // Raw metrics storage (in-memory, limited size)
    this.metrics = {
      userActions: [],      // User behavior tracking
      apiCalls: [],         // External API usage
      searches: [],         // Search queries
      bookings: [],         // Booking attempts
      errors: [],           // Error tracking
      performance: []       // Performance metrics
    };

    // Aggregated statistics
    this.aggregates = {
      totalUsers: new Set(),
      totalSearches: 0,
      totalBookings: 0,
      totalRevenue: 0,
      apiCallsByService: {},
      popularDestinations: {},
      conversionRate: 0,
      errorsByType: {},
      avgResponseTime: 0
    };

    // Configuration
    this.config = {
      maxUserActions: 10000,
      maxAPICalls: 5000,
      maxSearches: 5000,
      maxBookings: 5000,
      maxErrors: 1000,
      maxPerformance: 5000,
      cleanupInterval: 3600000, // 1 hour
      dataRetentionDays: 30
    };

    // Start automatic cleanup
    this.startCleanup();

    logger.info('📊 DataCollector initialized');
  }

  /**
   * Track user action
   */
  trackUserAction(userId, action, metadata = {}) {
    const event = {
      timestamp: Date.now(),
      userId: userId || 'anonymous',
      action,
      metadata: {
        ...metadata,
        sessionId: metadata.sessionId || null,
        ip: metadata.ip || null,
        userAgent: metadata.userAgent || null
      }
    };

    this.metrics.userActions.push(event);
    this.emit('user-action', event);
    
    // Update aggregates
    if (userId && userId !== 'anonymous') {
      this.aggregates.totalUsers.add(userId);
    }

    // Maintain size limit
    if (this.metrics.userActions.length > this.config.maxUserActions) {
      this.metrics.userActions.shift();
    }

    logger.debug(`User action tracked: ${userId} - ${action}`);
  }

  /**
   * Track external API call
   */
  trackAPICall(service, endpoint, duration, success, metadata = {}) {
    const event = {
      timestamp: Date.now(),
      service,        // 'kiwi', 'booking', 'mapbox', 'zai', etc.
      endpoint,
      duration,
      success,
      statusCode: metadata.statusCode || null,
      errorMessage: metadata.errorMessage || null,
      metadata
    };

    this.metrics.apiCalls.push(event);
    this.emit('api-call', event);

    // Update aggregates
    if (!this.aggregates.apiCallsByService[service]) {
      this.aggregates.apiCallsByService[service] = { 
        total: 0, 
        success: 0, 
        failed: 0,
        totalDuration: 0,
        avgDuration: 0
      };
    }
    
    const serviceStats = this.aggregates.apiCallsByService[service];
    serviceStats.total++;
    serviceStats.totalDuration += duration;
    serviceStats.avgDuration = Math.round(serviceStats.totalDuration / serviceStats.total);
    
    if (success) {
      serviceStats.success++;
    } else {
      serviceStats.failed++;
    }

    // Maintain size limit
    if (this.metrics.apiCalls.length > this.config.maxAPICalls) {
      this.metrics.apiCalls.shift();
    }

    logger.debug(`API call tracked: ${service}/${endpoint} - ${duration}ms - ${success ? 'success' : 'failed'}`);
  }

  /**
   * Track search query
   */
  trackSearch(userId, searchType, query, resultsCount, metadata = {}) {
    const event = {
      timestamp: Date.now(),
      userId: userId || 'anonymous',
      searchType,     // 'flight', 'hotel', 'destination', 'location'
      query,
      resultsCount,
      metadata
    };

    this.metrics.searches.push(event);
    this.emit('search', event);

    this.aggregates.totalSearches++;

    // Track popular destinations
    if (query.destination) {
      const dest = query.destination.toLowerCase();
      this.aggregates.popularDestinations[dest] = 
        (this.aggregates.popularDestinations[dest] || 0) + 1;
    }

    // Track origin-destination pairs for flights
    if (searchType === 'flight' && query.from && query.to) {
      const route = `${query.from}-${query.to}`;
      if (!this.aggregates.popularRoutes) {
        this.aggregates.popularRoutes = {};
      }
      this.aggregates.popularRoutes[route] = 
        (this.aggregates.popularRoutes[route] || 0) + 1;
    }

    // Maintain size limit
    if (this.metrics.searches.length > this.config.maxSearches) {
      this.metrics.searches.shift();
    }

    logger.debug(`Search tracked: ${userId} - ${searchType} - ${resultsCount} results`);
  }

  /**
   * Track booking attempt
   */
  trackBooking(userId, bookingType, amount, success, metadata = {}) {
    const event = {
      timestamp: Date.now(),
      userId: userId || 'anonymous',
      bookingType,    // 'flight', 'hotel', 'package'
      amount,
      currency: metadata.currency || 'USD',
      success,
      failureReason: metadata.failureReason || null,
      metadata
    };

    this.metrics.bookings.push(event);
    this.emit('booking', event);

    this.aggregates.totalBookings++;
    
    if (success) {
      this.aggregates.totalRevenue += amount;
    }

    // Calculate conversion rate
    if (this.aggregates.totalSearches > 0) {
      const successfulBookings = this.metrics.bookings.filter(b => b.success).length;
      this.aggregates.conversionRate = 
        ((successfulBookings / this.aggregates.totalSearches) * 100).toFixed(2);
    }

    // Maintain size limit
    if (this.metrics.bookings.length > this.config.maxBookings) {
      this.metrics.bookings.shift();
    }

    logger.info(`Booking tracked: ${userId} - ${bookingType} - $${amount} - ${success ? 'success' : 'failed'}`);
  }

  /**
   * Track error
   */
  trackError(errorType, message, stack, metadata = {}) {
    const event = {
      timestamp: Date.now(),
      errorType,
      message,
      stack,
      userId: metadata.userId || null,
      path: metadata.path || null,
      method: metadata.method || null,
      metadata
    };

    this.metrics.errors.push(event);
    this.emit('error', event);

    // Update aggregates
    this.aggregates.errorsByType[errorType] = 
      (this.aggregates.errorsByType[errorType] || 0) + 1;

    // Maintain size limit
    if (this.metrics.errors.length > this.config.maxErrors) {
      this.metrics.errors.shift();
    }

    logger.error(`Error tracked: ${errorType} - ${message}`);
  }

  /**
   * Track performance metric
   */
  trackPerformance(operation, duration, metadata = {}) {
    const event = {
      timestamp: Date.now(),
      operation,
      duration,
      statusCode: metadata.statusCode || null,
      success: metadata.success !== false,
      metadata
    };

    this.metrics.performance.push(event);
    this.emit('performance', event);

    // Update average response time
    const recentPerf = this.metrics.performance.slice(-100);
    const totalDuration = recentPerf.reduce((sum, p) => sum + p.duration, 0);
    this.aggregates.avgResponseTime = Math.round(totalDuration / recentPerf.length);

    // Maintain size limit
    if (this.metrics.performance.length > this.config.maxPerformance) {
      this.metrics.performance.shift();
    }
  }

  /**
   * Get analytics summary for a time range
   */
  getAnalyticsSummary(timeRange = '24h') {
    const now = Date.now();
    const ranges = {
      '1h': 3600000,
      '24h': 86400000,
      '7d': 604800000,
      '30d': 2592000000
    };
    const cutoff = now - (ranges[timeRange] || ranges['24h']);

    // Filter metrics by time range
    const recentActions = this.metrics.userActions.filter(e => e.timestamp > cutoff);
    const recentAPICalls = this.metrics.apiCalls.filter(e => e.timestamp > cutoff);
    const recentSearches = this.metrics.searches.filter(e => e.timestamp > cutoff);
    const recentBookings = this.metrics.bookings.filter(e => e.timestamp > cutoff);
    const recentErrors = this.metrics.errors.filter(e => e.timestamp > cutoff);
    const recentPerformance = this.metrics.performance.filter(e => e.timestamp > cutoff);

    // Calculate metrics
    const uniqueUsers = new Set(recentActions.map(a => a.userId)).size;
    const successfulBookings = recentBookings.filter(b => b.success);
    const totalRevenue = successfulBookings.reduce((sum, b) => sum + b.amount, 0);
    const conversionRate = recentSearches.length > 0
      ? ((successfulBookings.length / recentSearches.length) * 100).toFixed(2)
      : 0;

    return {
      timeRange,
      period: {
        start: new Date(cutoff).toISOString(),
        end: new Date(now).toISOString()
      },
      users: {
        total: uniqueUsers,
        actions: recentActions.length,
        avgActionsPerUser: uniqueUsers > 0 ? Math.round(recentActions.length / uniqueUsers) : 0
      },
      searches: {
        total: recentSearches.length,
        byType: this.groupBy(recentSearches, 'searchType'),
        avgResultsPerSearch: this.average(recentSearches.map(s => s.resultsCount))
      },
      bookings: {
        total: recentBookings.length,
        successful: successfulBookings.length,
        failed: recentBookings.length - successfulBookings.length,
        revenue: parseFloat(totalRevenue.toFixed(2)),
        avgBookingValue: successfulBookings.length > 0 
          ? parseFloat((totalRevenue / successfulBookings.length).toFixed(2))
          : 0,
        byType: this.groupBy(recentBookings, 'bookingType')
      },
      apiCalls: {
        total: recentAPICalls.length,
        successful: recentAPICalls.filter(c => c.success).length,
        failed: recentAPICalls.filter(c => !c.success).length,
        successRate: recentAPICalls.length > 0
          ? ((recentAPICalls.filter(c => c.success).length / recentAPICalls.length) * 100).toFixed(2)
          : 0,
        byService: this.groupBy(recentAPICalls, 'service'),
        avgDuration: this.average(recentAPICalls.map(c => c.duration))
      },
      performance: {
        avgResponseTime: this.average(recentPerformance.map(p => p.duration)),
        p50: this.percentile(recentPerformance.map(p => p.duration), 50),
        p95: this.percentile(recentPerformance.map(p => p.duration), 95),
        p99: this.percentile(recentPerformance.map(p => p.duration), 99),
        slowestOperations: this.getSlowOperations(recentPerformance, 10)
      },
      errors: {
        total: recentErrors.length,
        byType: this.groupBy(recentErrors, 'errorType'),
        errorRate: recentActions.length > 0
          ? ((recentErrors.length / recentActions.length) * 100).toFixed(2)
          : 0
      },
      conversionRate: parseFloat(conversionRate),
      popularDestinations: this.getTopN(this.aggregates.popularDestinations, 10),
      popularRoutes: this.getTopN(this.aggregates.popularRoutes || {}, 10)
    };
  }

  /**
   * Get real-time metrics (last 5 minutes)
   */
  getRealTimeMetrics() {
    const fiveMinutesAgo = Date.now() - 300000;
    
    const recentActions = this.metrics.userActions.filter(e => e.timestamp > fiveMinutesAgo);
    const recentAPICalls = this.metrics.apiCalls.filter(e => e.timestamp > fiveMinutesAgo);
    const recentSearches = this.metrics.searches.filter(e => e.timestamp > fiveMinutesAgo);
    const recentBookings = this.metrics.bookings.filter(e => e.timestamp > fiveMinutesAgo);
    const recentErrors = this.metrics.errors.filter(e => e.timestamp > fiveMinutesAgo);

    return {
      timestamp: new Date().toISOString(),
      activeUsers: new Set(recentActions.map(a => a.userId)).size,
      requestsPerMinute: Math.round(recentActions.length / 5),
      searchesPerMinute: Math.round(recentSearches.length / 5),
      bookingsPerMinute: Math.round(recentBookings.length / 5),
      errorsPerMinute: Math.round(recentErrors.length / 5),
      apiCallsPerMinute: Math.round(recentAPICalls.length / 5),
      currentLoad: this.calculateLoad(recentActions.length)
    };
  }

  /**
   * Get service health status
   */
  getServiceHealth() {
    const summary = this.getAnalyticsSummary('1h');
    
    const health = {
      overall: 'healthy',
      services: {},
      issues: []
    };

    // Check API success rates
    Object.entries(summary.apiCalls.byService).forEach(([service, count]) => {
      const serviceCalls = this.metrics.apiCalls
        .filter(c => c.service === service && c.timestamp > Date.now() - 3600000);
      
      const successRate = serviceCalls.length > 0
        ? (serviceCalls.filter(c => c.success).length / serviceCalls.length) * 100
        : 100;

      health.services[service] = {
        status: successRate > 95 ? 'healthy' : successRate > 80 ? 'degraded' : 'unhealthy',
        successRate: successRate.toFixed(2),
        totalCalls: serviceCalls.length
      };

      if (successRate < 95) {
        health.issues.push(`${service} API success rate is ${successRate.toFixed(2)}%`);
        health.overall = successRate < 80 ? 'unhealthy' : 'degraded';
      }
    });

    // Check error rate
    if (parseFloat(summary.errors.errorRate) > 5) {
      health.issues.push(`High error rate: ${summary.errors.errorRate}%`);
      health.overall = 'degraded';
    }

    // Check response time
    if (summary.performance.p95 > 2000) {
      health.issues.push(`Slow response time: P95 is ${summary.performance.p95}ms`);
      health.overall = 'degraded';
    }

    return health;
  }

  /**
   * Export data for analysis
   */
  exportData(format = 'json') {
    if (format === 'json') {
      return {
        exportedAt: new Date().toISOString(),
        metrics: {
          userActions: this.metrics.userActions.length,
          apiCalls: this.metrics.apiCalls.length,
          searches: this.metrics.searches.length,
          bookings: this.metrics.bookings.length,
          errors: this.metrics.errors.length,
          performance: this.metrics.performance.length
        },
        aggregates: {
          ...this.aggregates,
          totalUsers: this.aggregates.totalUsers.size
        },
        summary24h: this.getAnalyticsSummary('24h'),
        summary7d: this.getAnalyticsSummary('7d'),
        realTime: this.getRealTimeMetrics(),
        health: this.getServiceHealth()
      };
    }
    
    // Future: Add CSV, Excel export
    throw new Error(`Export format '${format}' not supported`);
  }

  /**
   * Clear old data based on retention policy
   */
  clearOldData() {
    const cutoff = Date.now() - (this.config.dataRetentionDays * 86400000);
    let totalCleared = 0;
    
    Object.keys(this.metrics).forEach(key => {
      const before = this.metrics[key].length;
      this.metrics[key] = this.metrics[key].filter(e => e.timestamp > cutoff);
      const after = this.metrics[key].length;
      totalCleared += (before - after);
    });

    if (totalCleared > 0) {
      logger.info(`🗑️ Cleared ${totalCleared} old data points (retention: ${this.config.dataRetentionDays} days)`);
    }
  }

  /**
   * Start automatic cleanup
   */
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.clearOldData();
    }, this.config.cleanupInterval);

    logger.info(`🧹 Automatic cleanup started (interval: ${this.config.cleanupInterval / 1000}s)`);
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      logger.info('🛑 Automatic cleanup stopped');
    }
  }

  // Helper methods

  groupBy(array, field) {
    return array.reduce((acc, item) => {
      const key = item[field] || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  average(numbers) {
    if (numbers.length === 0) return 0;
    return Math.round(numbers.reduce((sum, n) => sum + n, 0) / numbers.length);
  }

  percentile(numbers, p) {
    if (numbers.length === 0) return 0;
    const sorted = numbers.sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  getTopN(object, n) {
    return Object.entries(object)
      .sort(([, a], [, b]) => b - a)
      .slice(0, n)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  }

  getSlowOperations(performanceData, n) {
    return performanceData
      .sort((a, b) => b.duration - a.duration)
      .slice(0, n)
      .map(p => ({
        operation: p.operation,
        duration: p.duration,
        timestamp: new Date(p.timestamp).toISOString()
      }));
  }

  calculateLoad(requestsInLast5Min) {
    // Simple load calculation: low < 100, medium < 500, high >= 500
    if (requestsInLast5Min < 100) return 'low';
    if (requestsInLast5Min < 500) return 'medium';
    return 'high';
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      metrics: {
        userActions: this.metrics.userActions.length,
        apiCalls: this.metrics.apiCalls.length,
        searches: this.metrics.searches.length,
        bookings: this.metrics.bookings.length,
        errors: this.metrics.errors.length,
        performance: this.metrics.performance.length
      },
      aggregates: {
        totalUsers: this.aggregates.totalUsers.size,
        totalSearches: this.aggregates.totalSearches,
        totalBookings: this.aggregates.totalBookings,
        totalRevenue: this.aggregates.totalRevenue.toFixed(2),
        conversionRate: this.aggregates.conversionRate,
        avgResponseTime: this.aggregates.avgResponseTime
      }
    };
  }
}

// Singleton instance
const dataCollector = new DataCollector();

module.exports = dataCollector;
