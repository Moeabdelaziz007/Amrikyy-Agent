/**
 * Audit API Routes
 * Complete audit trail access and export
 */

const express = require('express');
const router = express.Router();
const auditService = require('../src/services/audit-service');

/**
 * POST /api/audit/log
 * Manually log an audit event
 */
router.post('/log', async (req, res) => {
  try {
    const event = req.body;

    // Add request context
    event.ipAddress = req.ip;
    event.userAgent = req.get('user-agent');
    event.requestId = req.id;

    const result = await auditService.logEvent(event);

    if (result.success) {
      res.json({
        success: true,
        log: result.log
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Failed to log audit event:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/audit/user/:userId
 * Get audit trail for specific user
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100 } = req.query;

    const result = await auditService.getUserAuditTrail(
      userId,
      parseInt(limit)
    );

    if (result.success) {
      res.json({
        success: true,
        logs: result.logs,
        count: result.logs.length
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Failed to get user audit trail:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/audit/transaction/:transactionId
 * Get audit trail for specific transaction
 */
router.get('/transaction/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;

    const result = await auditService.getTransactionAuditTrail(transactionId);

    if (result.success) {
      res.json({
        success: true,
        logs: result.logs,
        count: result.logs.length
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Failed to get transaction audit trail:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/audit/activity/recent
 * Get recent audit activity (last 24 hours)
 */
router.get('/activity/recent', async (req, res) => {
  try {
    const result = await auditService.getRecentActivity();

    if (result.success) {
      res.json({
        success: true,
        activity: result.activity
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Failed to get recent activity:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/audit/events/failed
 * Get failed events for investigation
 */
router.get('/events/failed', async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const result = await auditService.getFailedEvents(parseInt(limit));

    if (result.success) {
      res.json({
        success: true,
        events: result.events,
        count: result.events.length
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Failed to get failed events:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/audit/actions/admin
 * Get admin actions audit
 */
router.get('/actions/admin', async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const result = await auditService.getAdminActions(parseInt(limit));

    if (result.success) {
      res.json({
        success: true,
        actions: result.actions,
        count: result.actions.length
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Failed to get admin actions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/audit/statistics
 * Get audit statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const result = await auditService.getStatistics(parseInt(days));

    if (result.success) {
      res.json({
        success: true,
        ...result
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Failed to get statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/audit/export/csv
 * Export audit logs to CSV
 */
router.get('/export/csv', async (req, res) => {
  try {
    const filters = {
      userId: req.query.userId,
      transactionId: req.query.transactionId,
      eventType: req.query.eventType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit ? parseInt(req.query.limit) : 10000
    };

    const result = await auditService.exportToCSV(filters);

    if (result.success) {
      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="audit_log_${new Date().toISOString()}.csv"`
      );
      res.send(result.csv);
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Failed to export CSV:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/audit/export/json
 * Export audit logs to JSON
 */
router.get('/export/json', async (req, res) => {
  try {
    const filters = {
      userId: req.query.userId,
      transactionId: req.query.transactionId,
      eventType: req.query.eventType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit ? parseInt(req.query.limit) : 10000
    };

    const result = await auditService.exportToJSON(filters);

    if (result.success) {
      // Set headers for JSON download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="audit_log_${new Date().toISOString()}.json"`
      );
      res.json(result);
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Failed to export JSON:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/audit/verify/:logId
 * Verify audit log integrity
 */
router.get('/verify/:logId', async (req, res) => {
  try {
    const { logId } = req.params;

    const result = await auditService.verifyIntegrity(logId);

    if (result.success) {
      res.json({
        success: true,
        valid: result.valid,
        log: result.log,
        hashes: {
          computed: result.computedHash,
          stored: result.storedHash
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Failed to verify integrity:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
