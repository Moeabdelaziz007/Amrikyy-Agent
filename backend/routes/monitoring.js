/**
 * 📊 Transaction Monitoring API Routes
 * المسارات الخاصة بمراقبة المعاملات
 */

const express = require('express');
const router = express.Router();
const monitoringService = require('../src/services/monitoring-service');

/**
 * GET /api/monitoring/alerts
 * Get alerts for manual review
 */
router.get('/alerts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const alerts = await monitoringService.getAlertsForReview(limit);

    res.json({
      success: true,
      total: alerts.length,
      alerts,
    });

  } catch (error) {
    console.error('❌ Get alerts error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/monitoring/alerts/:id/acknowledge
 * Acknowledge an alert
 */
router.post('/alerts/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    const success = await monitoringService.acknowledgeAlert(id, adminId);

    res.json({
      success,
      alertId: id,
    });

  } catch (error) {
    console.error('❌ Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/monitoring/stats
 * Get monitoring statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // TODO: Implement statistics from database views
    res.json({
      success: true,
      stats: {
        totalMonitored: 0,
        alertsToday: 0,
        criticalAlerts: 0,
        pendingReview: 0,
      },
    });

  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/monitoring/test
 * Test monitoring service (development only)
 */
router.post('/test', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Test endpoint disabled in production',
    });
  }

  try {
    const testTx = {
      bookingId: 'test-booking-' + Date.now(),
      userId: req.body.userId || 'test-user',
      amountUSD: req.body.amountUSD || 1000,
      cryptocurrency: 'USDT',
      ipCountry: req.body.ipCountry || 'US',
      cryptoAddress: req.body.cryptoAddress || '0x0000000000000000000000000000000000000test',
    };

    const result = await monitoringService.monitorTransaction(testTx);

    res.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error('❌ Test monitoring error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

