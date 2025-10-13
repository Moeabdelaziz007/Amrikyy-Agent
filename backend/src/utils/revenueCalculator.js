/**
 * Revenue Calculator Utility Functions
 * Provides calculations for revenue analytics, forecasting, and reporting
 */

class RevenueCalculator {
  /**
   * Calculate total revenue for a given period
   * @param {Array} revenueEvents - Array of revenue events
   * @param {Object} options - Calculation options
   * @returns {Object} Calculated revenue totals
   */
  static calculateTotalRevenue(revenueEvents, options = {}) {
    const {
      startDate,
      endDate,
      currency = 'SAR',
      includeRefunds = false
    } = options;

    let filteredEvents = revenueEvents;

    // Filter by date range if provided
    if (startDate || endDate) {
      filteredEvents = revenueEvents.filter(event => {
        const eventDate = new Date(event.event_date);
        if (startDate && eventDate < new Date(startDate)) return false;
        if (endDate && eventDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Filter by currency if specified
    if (currency) {
      filteredEvents = filteredEvents.filter(event => event.currency === currency);
    }

    // Calculate totals by category
    const totals = {
      total: 0,
      byCategory: {},
      bySource: {},
      transactionCount: filteredEvents.length,
      uniqueUsers: new Set(filteredEvents.map(e => e.user_id)).size,
      averageTransactionValue: 0
    };

    filteredEvents.forEach(event => {
      // Skip refunds if not included
      if (!includeRefunds && event.source === 'refund') return;

      const amount = parseFloat(event.amount);

      // Total revenue
      totals.total += amount;

      // By category
      const category = event.category_id || 'uncategorized';
      totals.byCategory[category] = (totals.byCategory[category] || 0) + amount;

      // By source
      totals.bySource[event.source] = (totals.bySource[event.source] || 0) + amount;
    });

    // Calculate average transaction value
    if (totals.transactionCount > 0) {
      totals.averageTransactionValue = totals.total / totals.transactionCount;
    }

    return totals;
  }

  /**
   * Calculate revenue growth rate
   * @param {Array} currentPeriodEvents - Revenue events for current period
   * @param {Array} previousPeriodEvents - Revenue events for previous period
   * @returns {Object} Growth rate calculations
   */
  static calculateGrowthRate(currentPeriodEvents, previousPeriodEvents) {
    const currentTotal = this.calculateTotalRevenue(currentPeriodEvents).total;
    const previousTotal = this.calculateTotalRevenue(previousPeriodEvents).total;

    const growthRate = previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : 0;

    return {
      currentPeriodTotal: currentTotal,
      previousPeriodTotal: previousTotal,
      growthRate: growthRate,
      growthAmount: currentTotal - previousTotal,
      isPositive: growthRate > 0
    };
  }

  /**
   * Calculate revenue forecast using simple linear regression
   * @param {Array} historicalData - Array of {date, revenue} objects
   * @param {number} periods - Number of periods to forecast
   * @returns {Object} Forecast results
   */
  static calculateRevenueForecast(historicalData, periods = 30) {
    if (historicalData.length < 2) {
      return {
        forecast: [],
        confidence: 0,
        trend: 'insufficient_data'
      };
    }

    // Sort data by date
    const sortedData = historicalData.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Simple linear regression
    const n = sortedData.length;
    const sumX = sortedData.reduce((sum, item, index) => sum + index, 0);
    const sumY = sortedData.reduce((sum, item) => sum + item.revenue, 0);
    const sumXY = sortedData.reduce((sum, item, index) => sum + (index * item.revenue), 0);
    const sumXX = sortedData.reduce((sum, item, index) => sum + (index * index), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate forecast
    const forecast = [];
    for (let i = 1; i <= periods; i++) {
      const predictedIndex = n + i - 1;
      const predictedRevenue = slope * predictedIndex + intercept;
      const forecastDate = new Date(sortedData[n - 1].date);
      forecastDate.setDate(forecastDate.getDate() + i);

      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        predictedRevenue: Math.max(0, predictedRevenue), // Ensure non-negative
        confidence: Math.max(0.1, Math.min(0.9, 1 - (i / periods))) // Decreasing confidence
      });
    }

    // Determine trend
    const trend = slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable';

    return {
      forecast,
      slope,
      intercept,
      trend,
      confidence: 0.7, // Base confidence for simple model
      historicalPoints: n
    };
  }

  /**
   * Calculate revenue by time periods
   * @param {Array} revenueEvents - Revenue events
   * @param {string} period - 'daily', 'weekly', 'monthly'
   * @returns {Array} Revenue by period
   */
  static calculateRevenueByPeriod(revenueEvents, period = 'daily') {
    const grouped = {};

    revenueEvents.forEach(event => {
      const date = new Date(event.event_date);
      let periodKey;

      switch (period) {
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default: // daily
          periodKey = date.toISOString().split('T')[0];
      }

      if (!grouped[periodKey]) {
        grouped[periodKey] = {
          period: periodKey,
          total: 0,
          count: 0,
          bySource: {}
        };
      }

      const amount = parseFloat(event.amount);
      grouped[periodKey].total += amount;
      grouped[periodKey].count += 1;

      if (!grouped[periodKey].bySource[event.source]) {
        grouped[periodKey].bySource[event.source] = 0;
      }
      grouped[periodKey].bySource[event.source] += amount;
    });

    return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Calculate customer acquisition cost (CAC) and lifetime value (LTV)
   * @param {Array} revenueEvents - Revenue events
   * @param {Array} userAcquisitionCosts - Array of {date, cost} for user acquisition
   * @returns {Object} CAC and LTV calculations
   */
  static calculateCustomerMetrics(revenueEvents, userAcquisitionCosts = []) {
    const userRevenues = {};
    const userFirstPurchase = {};

    // Group revenue by user
    revenueEvents.forEach(event => {
      if (!event.user_id) return;

      if (!userRevenues[event.user_id]) {
        userRevenues[event.user_id] = 0;
        userFirstPurchase[event.user_id] = event.event_date;
      }

      userRevenues[event.user_id] += parseFloat(event.amount);
    });

    const totalRevenue = Object.values(userRevenues).reduce((sum, rev) => sum + rev, 0);
    const uniqueUsers = Object.keys(userRevenues).length;
    const totalAcquisitionCost = userAcquisitionCosts.reduce((sum, cost) => sum + cost.cost, 0);

    const averageRevenuePerUser = uniqueUsers > 0 ? totalRevenue / uniqueUsers : 0;
    const customerAcquisitionCost = uniqueUsers > 0 ? totalAcquisitionCost / uniqueUsers : 0;
    const customerLifetimeValue = averageRevenuePerUser;

    return {
      totalRevenue,
      uniqueUsers,
      averageRevenuePerUser,
      customerAcquisitionCost,
      customerLifetimeValue,
      ltvToCacRatio: customerAcquisitionCost > 0 ? customerLifetimeValue / customerAcquisitionCost : 0,
      totalAcquisitionCost
    };
  }

  /**
   * Calculate commission and fee revenue
   * @param {Array} revenueEvents - Revenue events
   * @param {Object} commissionRates - Commission rates by category
   * @returns {Object} Commission calculations
   */
  static calculateCommissions(revenueEvents, commissionRates = {}) {
    const commissions = {
      totalCommission: 0,
      byCategory: {},
      details: []
    };

    revenueEvents.forEach(event => {
      if (event.source !== 'booking') return;

      const baseAmount = parseFloat(event.amount);
      const category = event.category_id || 'default';
      const rate = commissionRates[category] || commissionRates.default || 0.1; // 10% default

      const commission = baseAmount * rate;

      commissions.totalCommission += commission;
      commissions.byCategory[category] = (commissions.byCategory[category] || 0) + commission;

      commissions.details.push({
        eventId: event.id,
        baseAmount,
        commissionRate: rate,
        commission,
        category
      });
    });

    return commissions;
  }

  /**
   * Generate revenue report summary
   * @param {Array} revenueEvents - Revenue events
   * @param {Object} options - Report options
   * @returns {Object} Revenue report
   */
  static generateRevenueReport(revenueEvents, options = {}) {
    const {
      period = 'monthly',
      includeForecast = false,
      forecastPeriods = 3
    } = options;

    const periodData = this.calculateRevenueByPeriod(revenueEvents, period);
    const totalRevenue = this.calculateTotalRevenue(revenueEvents);

    const report = {
      summary: {
        totalRevenue: totalRevenue.total,
        transactionCount: totalRevenue.transactionCount,
        uniqueUsers: totalRevenue.uniqueUsers,
        averageTransactionValue: totalRevenue.averageTransactionValue,
        currency: 'SAR'
      },
      byPeriod: periodData,
      byCategory: totalRevenue.byCategory,
      bySource: totalRevenue.bySource,
      generatedAt: new Date().toISOString()
    };

    // Add growth rate if we have enough data
    if (periodData.length >= 2) {
      const currentPeriod = periodData[periodData.length - 1];
      const previousPeriod = periodData[periodData.length - 2];

      const currentEvents = revenueEvents.filter(e =>
        e.event_date.startsWith(currentPeriod.period)
      );
      const previousEvents = revenueEvents.filter(e =>
        e.event_date.startsWith(previousPeriod.period)
      );

      report.growth = this.calculateGrowthRate(currentEvents, previousEvents);
    }

    // Add forecast if requested
    if (includeForecast && periodData.length >= 3) {
      const historicalData = periodData.map(p => ({
        date: p.period,
        revenue: p.total
      }));

      report.forecast = this.calculateRevenueForecast(historicalData, forecastPeriods);
    }

    return report;
  }
}

module.exports = RevenueCalculator;