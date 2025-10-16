/**
 * Analytics Routes
 * API endpoints for accessing analytics data
 * 
 * Endpoints:
 * - GET /api/analytics/summary - Get analytics summary
 * - GET /api/analytics/realtime - Get real-time metrics
 * - GET /api/analytics/health - Get service health status
 * - GET /api/analytics/export - Export all data
 * - GET /api/analytics/stats - Get current statistics
 * - POST /api/analytics/clear - Clear old data
 */

const express = require('express');
const router = express.Router();
const dataCollector = require('../src/analytics/DataCollector');
const logger = require('../utils/logger');

/**
 * GET /api/analytics/summary
 * Get analytics summary for a time range
 * Query params: range (1h, 24h, 7d, 30d)
 */
router.get('/summary', (req, res) => {
  try {
    const timeRange = req.query.range || '24h';
    const validRanges = ['1h', '24h', '7d', '30d'];
    
    if (!validRanges.includes(timeRange)) {
      return res.status(400).json({
        success: false,
        error: `Invalid time range. Must be one of: ${validRanges.join(', ')}`
      });
    }
    
    const summary = dataCollector.getAnalyticsSummary(timeRange);
    
    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString()
    });
    
    logger.debug(`Analytics summary requested: ${timeRange}`);
  } catch (error) {
    logger.error(`Error getting analytics summary: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics summary',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/realtime
 * Get real-time metrics (last 5 minutes)
 */
router.get('/realtime', (req, res) => {
  try {
    const metrics = dataCollector.getRealTimeMetrics();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
    
    logger.debug('Real-time metrics requested');
  } catch (error) {
    logger.error(`Error getting real-time metrics: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get real-time metrics',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/health
 * Get service health status
 */
router.get('/health', (req, res) => {
  try {
    const health = dataCollector.getServiceHealth();
    
    // Set status code based on health
    const statusCode = health.overall === 'healthy' ? 200 
                     : health.overall === 'degraded' ? 200 
                     : 503;
    
    res.status(statusCode).json({
      success: true,
      data: health,
      timestamp: new Date().toISOString()
    });
    
    logger.debug(`Service health checked: ${health.overall}`);
  } catch (error) {
    logger.error(`Error checking service health: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to check service health',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/export
 * Export all analytics data
 * Query params: format (json, csv - future)
 */
router.get('/export', (req, res) => {
  try {
    const format = req.query.format || 'json';
    
    if (format !== 'json') {
      return res.status(400).json({
        success: false,
        error: 'Only JSON format is currently supported'
      });
    }
    
    const data = dataCollector.exportData(format);
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-export-${Date.now()}.json"`);
    
    res.json({
      success: true,
      data,
      exportedAt: new Date().toISOString()
    });
    
    logger.info('Analytics data exported');
  } catch (error) {
    logger.error(`Error exporting analytics data: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to export analytics data',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/stats
 * Get current statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = dataCollector.getStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
    
    logger.debug('Analytics stats requested');
  } catch (error) {
    logger.error(`Error getting analytics stats: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics stats',
      message: error.message
    });
  }
});

/**
 * POST /api/analytics/clear
 * Clear old data based on retention policy
 * Body: { daysToKeep: number } (optional)
 */
router.post('/clear', (req, res) => {
  try {
    const daysToKeep = req.body.daysToKeep || 30;
    
    if (daysToKeep < 1 || daysToKeep > 365) {
      return res.status(400).json({
        success: false,
        error: 'daysToKeep must be between 1 and 365'
      });
    }
    
    dataCollector.clearOldData(daysToKeep);
    
    res.json({
      success: true,
      message: `Cleared data older than ${daysToKeep} days`,
      timestamp: new Date().toISOString()
    });
    
    logger.info(`Analytics data cleared: ${daysToKeep} days retention`);
  } catch (error) {
    logger.error(`Error clearing analytics data: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to clear analytics data',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/dashboard
 * Get comprehensive dashboard data
 */
router.get('/dashboard', (req, res) => {
  try {
    const timeRange = req.query.range || '24h';
    
    const dashboard = {
      summary: dataCollector.getAnalyticsSummary(timeRange),
      realtime: dataCollector.getRealTimeMetrics(),
      health: dataCollector.getServiceHealth(),
      stats: dataCollector.getStats()
    };
    
    res.json({
      success: true,
      data: dashboard,
      timestamp: new Date().toISOString()
    });
    
    logger.debug(`Dashboard data requested: ${timeRange}`);
  } catch (error) {
    logger.error(`Error getting dashboard data: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/trends
 * Get trend analysis
 */
router.get('/trends', (req, res) => {
  try {
    const summary24h = dataCollector.getAnalyticsSummary('24h');
    const summary7d = dataCollector.getAnalyticsSummary('7d');
    
    // Calculate trends
    const trends = {
      users: {
        current: summary24h.users.total,
        previous: summary7d.users.total / 7,
        change: calculateChange(summary24h.users.total, summary7d.users.total / 7)
      },
      searches: {
        current: summary24h.searches.total,
        previous: summary7d.searches.total / 7,
        change: calculateChange(summary24h.searches.total, summary7d.searches.total / 7)
      },
      bookings: {
        current: summary24h.bookings.successful,
        previous: summary7d.bookings.successful / 7,
        change: calculateChange(summary24h.bookings.successful, summary7d.bookings.successful / 7)
      },
      revenue: {
        current: summary24h.bookings.revenue,
        previous: summary7d.bookings.revenue / 7,
        change: calculateChange(summary24h.bookings.revenue, summary7d.bookings.revenue / 7)
      },
      conversionRate: {
        current: parseFloat(summary24h.conversionRate),
        previous: parseFloat(summary7d.conversionRate),
        change: parseFloat(summary24h.conversionRate) - parseFloat(summary7d.conversionRate)
      }
    };
    
    res.json({
      success: true,
      data: trends,
      timestamp: new Date().toISOString()
    });
    
    logger.debug('Trends analysis requested');
  } catch (error) {
    logger.error(`Error getting trends: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get trends',
      message: error.message
    });
  }
});

/**
 * Helper: Calculate percentage change
 */
function calculateChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  const change = ((current - previous) / previous) * 100;
  return parseFloat(change.toFixed(2));
}

module.exports = router;
