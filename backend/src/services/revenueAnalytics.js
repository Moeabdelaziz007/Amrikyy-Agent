/**
 * Revenue Analytics Service
 * Handles revenue tracking, analytics, and reporting for the Maya Travel Agent system
 */

const { createClient } = require('@supabase/supabase-js');
const RevenueCalculator = require('../utils/revenueCalculator');

class RevenueAnalyticsService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  /**
   * Log a revenue event
   * @param {Object} eventData - Revenue event data
   * @returns {Object} Created revenue event
   */
  async logRevenueEvent(eventData) {
    try {
      const {
        userId,
        tripId,
        paymentId,
        categoryId,
        amount,
        currency = 'SAR',
        description,
        source,
        status = 'completed',
        metadata = {}
      } = eventData;

      // Get category if not provided
      let finalCategoryId = categoryId;
      if (!finalCategoryId && source) {
        const category = await this.getRevenueCategoryByType(source);
        finalCategoryId = category?.id;
      }

      const { data, error } = await this.supabase
        .from('revenue_events')
        .insert({
          user_id: userId,
          trip_id: tripId,
          payment_id: paymentId,
          category_id: finalCategoryId,
          amount,
          currency,
          description,
          source,
          status,
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      // Update daily analytics
      await this.updateDailyAnalytics(new Date());

      return { success: true, data };
    } catch (error) {
      console.error('Error logging revenue event:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get revenue category by type
   * @param {string} type - Category type
   * @returns {Object} Revenue category
   */
  async getRevenueCategoryByType(type) {
    try {
      const { data, error } = await this.supabase
        .from('revenue_categories')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      return data;
    } catch (error) {
      console.error('Error getting revenue category:', error);
      return null;
    }
  }

  /**
   * Get revenue events with filtering
   * @param {Object} filters - Filter options
   * @returns {Array} Revenue events
   */
  async getRevenueEvents(filters = {}) {
    try {
      const {
        userId,
        tripId,
        startDate,
        endDate,
        source,
        status = 'completed',
        limit = 100,
        offset = 0
      } = filters;

      let query = this.supabase
        .from('revenue_events')
        .select(`
          *,
          revenue_categories (
            name,
            type,
            description
          )
        `)
        .eq('status', status)
        .order('event_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (userId) query = query.eq('user_id', userId);
      if (tripId) query = query.eq('trip_id', tripId);
      if (source) query = query.eq('source', source);
      if (startDate) query = query.gte('event_date', startDate);
      if (endDate) query = query.lte('event_date', endDate);

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error getting revenue events:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Get revenue analytics for a period
   * @param {Object} options - Analytics options
   * @returns {Object} Revenue analytics
   */
  async getRevenueAnalytics(options = {}) {
    try {
      const {
        period = 'monthly',
        startDate,
        endDate,
        includeForecast = false,
        forecastPeriods = 3
      } = options;

      // Get revenue events for the period
      const eventsResult = await this.getRevenueEvents({
        startDate,
        endDate,
        status: 'completed'
      });

      if (!eventsResult.success) {
        return eventsResult;
      }

      const revenueEvents = eventsResult.data;

      // Generate analytics report
      const report = RevenueCalculator.generateRevenueReport(revenueEvents, {
        period,
        includeForecast,
        forecastPeriods
      });

      return { success: true, data: report };
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update daily revenue analytics
   * @param {Date} targetDate - Date to update analytics for
   * @returns {Object} Update result
   */
  async updateDailyAnalytics(targetDate = new Date()) {
    try {
      const dateStr = targetDate.toISOString().split('T')[0];

      // Call the database function
      const { data, error } = await this.supabase.rpc('update_daily_revenue_analytics', {
        target_date: dateStr
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error updating daily analytics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get revenue forecast
   * @param {Object} options - Forecast options
   * @returns {Object} Revenue forecast
   */
  async getRevenueForecast(options = {}) {
    try {
      const {
        periods = 30,
        periodType = 'daily'
      } = options;

      // Get historical data
      const historicalResult = await this.getRevenueAnalytics({
        period: periodType,
        limit: 90 // Last 90 days/periods for forecasting
      });

      if (!historicalResult.success) {
        return historicalResult;
      }

      const historicalData = historicalResult.data.byPeriod.map(p => ({
        date: p.period,
        revenue: p.total
      }));

      const forecast = RevenueCalculator.calculateRevenueForecast(historicalData, periods);

      return { success: true, data: forecast };
    } catch (error) {
      console.error('Error getting revenue forecast:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate customer metrics (CAC, LTV)
   * @param {Object} options - Calculation options
   * @returns {Object} Customer metrics
   */
  async getCustomerMetrics(options = {}) {
    try {
      const {
        startDate,
        endDate
      } = options;

      // Get revenue events
      const eventsResult = await this.getRevenueEvents({
        startDate,
        endDate,
        status: 'completed'
      });

      if (!eventsResult.success) {
        return eventsResult;
      }

      // For now, we'll calculate without acquisition costs
      // In a real implementation, you'd have a separate table for marketing spend
      const userAcquisitionCosts = [];

      const metrics = RevenueCalculator.calculateCustomerMetrics(
        eventsResult.data,
        userAcquisitionCosts
      );

      return { success: true, data: metrics };
    } catch (error) {
      console.error('Error calculating customer metrics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get revenue by category breakdown
   * @param {Object} options - Query options
   * @returns {Object} Category breakdown
   */
  async getRevenueByCategory(options = {}) {
    try {
      const {
        startDate,
        endDate,
        groupBy = 'category'
      } = options;

      const eventsResult = await this.getRevenueEvents({
        startDate,
        endDate,
        status: 'completed'
      });

      if (!eventsResult.success) {
        return eventsResult;
      }

      const breakdown = {};
      const events = eventsResult.data;

      events.forEach(event => {
        const key = groupBy === 'category'
          ? (event.revenue_categories?.name || 'uncategorized')
          : event.source;

        if (!breakdown[key]) {
          breakdown[key] = {
            total: 0,
            count: 0,
            average: 0
          };
        }

        breakdown[key].total += parseFloat(event.amount);
        breakdown[key].count += 1;
      });

      // Calculate averages
      Object.keys(breakdown).forEach(key => {
        breakdown[key].average = breakdown[key].total / breakdown[key].count;
      });

      return { success: true, data: breakdown };
    } catch (error) {
      console.error('Error getting revenue by category:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export revenue data for reporting
   * @param {Object} options - Export options
   * @returns {Object} Export data
   */
  async exportRevenueData(options = {}) {
    try {
      const {
        format = 'json',
        startDate,
        endDate,
        includeAnalytics = true
      } = options;

      const eventsResult = await this.getRevenueEvents({
        startDate,
        endDate,
        status: 'completed',
        limit: 10000 // Large limit for export
      });

      if (!eventsResult.success) {
        return eventsResult;
      }

      const exportData = {
        events: eventsResult.data,
        generatedAt: new Date().toISOString(),
        dateRange: { startDate, endDate }
      };

      if (includeAnalytics) {
        const analyticsResult = await this.getRevenueAnalytics({
          startDate,
          endDate,
          includeForecast: true
        });

        if (analyticsResult.success) {
          exportData.analytics = analyticsResult.data;
        }
      }

      // Format the data based on requested format
      let formattedData;
      switch (format.toLowerCase()) {
        case 'csv':
          formattedData = this.convertToCSV(exportData.events);
          break;
        default:
          formattedData = exportData;
      }

      return { success: true, data: formattedData, format };
    } catch (error) {
      console.error('Error exporting revenue data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Convert revenue events to CSV format
   * @param {Array} events - Revenue events
   * @returns {string} CSV data
   */
  convertToCSV(events) {
    if (!events || events.length === 0) return '';

    const headers = [
      'Event Date',
      'User ID',
      'Trip ID',
      'Amount',
      'Currency',
      'Source',
      'Description',
      'Category'
    ];

    const rows = events.map(event => [
      event.event_date,
      event.user_id || '',
      event.trip_id || '',
      event.amount,
      event.currency,
      event.source,
      event.description,
      event.revenue_categories?.name || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Get revenue dashboard data
   * @returns {Object} Dashboard data
   */
  async getDashboardData() {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const [
        todayRevenue,
        monthlyRevenue,
        forecastResult,
        categoryBreakdown
      ] = await Promise.all([
        this.getRevenueAnalytics({
          startDate: today.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        }),
        this.getRevenueAnalytics({
          startDate: thirtyDaysAgo.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        }),
        this.getRevenueForecast({ periods: 7 }),
        this.getRevenueByCategory({
          startDate: thirtyDaysAgo.toISOString().split('T')[0]
        })
      ]);

      const dashboard = {
        today: todayRevenue.success ? todayRevenue.data.summary : null,
        monthly: monthlyRevenue.success ? monthlyRevenue.data : null,
        forecast: forecastResult.success ? forecastResult.data : null,
        categories: categoryBreakdown.success ? categoryBreakdown.data : null,
        generatedAt: new Date().toISOString()
      };

      return { success: true, data: dashboard };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = RevenueAnalyticsService;