/**
 * Audit Service
 * Complete audit trail for compliance
 * 7-year retention, tamper-proof logging
 */

const supabase = require('../lib/supabaseClient');
const crypto = require('crypto');

class AuditService {
  constructor() {
    this.previousHash = null; // For hash chaining
  }

  /**
   * Log an audit event
   * @param {Object} event - Audit event details
   * @returns {Promise<Object>} Created audit log
   */
  async logEvent(event) {
    try {
      const {
        eventType,
        eventCategory,
        userId = null,
        transactionId = null,
        bookingId = null,
        kycId = null,
        riskId = null,
        alertId = null,
        action,
        actionBy = null,
        actionByType = 'system',
        status = 'success',
        metadata = {},
        changes = {},
        ipAddress = null,
        userAgent = null,
        requestId = null,
        sessionId = null
      } = event;

      // Generate hash for tamper detection
      const logData = JSON.stringify({
        eventType,
        action,
        userId,
        transactionId,
        timestamp: new Date().toISOString(),
        metadata
      });

      const logHash = this.generateHash(logData);

      // Insert audit log
      const { data, error } = await supabase
        .from('payment_audit_log')
        .insert({
          event_type: eventType,
          event_category: eventCategory,
          user_id: userId,
          transaction_id: transactionId,
          booking_id: bookingId,
          kyc_id: kycId,
          risk_id: riskId,
          alert_id: alertId,
          action,
          action_by: actionBy,
          action_by_type: actionByType,
          status,
          metadata,
          changes,
          ip_address: ipAddress,
          user_agent: userAgent,
          request_id: requestId,
          session_id: sessionId,
          previous_log_hash: this.previousHash,
          log_hash: logHash
        })
        .select()
        .single();

      if (error) throw error;

      // Update previous hash for next log
      this.previousHash = logHash;

      return { success: true, log: data };
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw - audit failures shouldn't break main flow
      return { success: false, error: error.message };
    }
  }

  /**
   * Log payment event
   */
  async logPayment(action, transactionId, userId, status, metadata = {}) {
    return this.logEvent({
      eventType: `payment_${action}`,
      eventCategory: 'payment',
      transactionId,
      userId,
      action: `Payment ${action}`,
      status,
      metadata
    });
  }

  /**
   * Log KYC event
   */
  async logKYC(action, kycId, userId, status, metadata = {}) {
    return this.logEvent({
      eventType: `kyc_${action}`,
      eventCategory: 'kyc',
      kycId,
      userId,
      action: `KYC ${action}`,
      status,
      metadata
    });
  }

  /**
   * Log risk assessment
   */
  async logRisk(action, riskId, transactionId, userId, status, metadata = {}) {
    return this.logEvent({
      eventType: `risk_${action}`,
      eventCategory: 'risk',
      riskId,
      transactionId,
      userId,
      action: `Risk ${action}`,
      status,
      metadata
    });
  }

  /**
   * Log monitoring alert
   */
  async logAlert(
    action,
    alertId,
    transactionId,
    userId,
    status,
    metadata = {}
  ) {
    return this.logEvent({
      eventType: `alert_${action}`,
      eventCategory: 'monitoring',
      alertId,
      transactionId,
      userId,
      action: `Alert ${action}`,
      status,
      metadata
    });
  }

  /**
   * Log admin action
   */
  async logAdminAction(action, actionBy, targetUserId, metadata = {}) {
    return this.logEvent({
      eventType: 'admin_action',
      eventCategory: 'admin',
      userId: targetUserId,
      action,
      actionBy,
      actionByType: 'admin',
      status: 'success',
      metadata
    });
  }

  /**
   * Get user audit trail
   */
  async getUserAuditTrail(userId, limit = 100) {
    try {
      const { data, error } = await supabase.rpc('get_user_audit_trail', {
        p_user_id: userId,
        p_limit: limit
      });

      if (error) throw error;

      return { success: true, logs: data };
    } catch (error) {
      console.error('Failed to get user audit trail:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get transaction audit trail
   */
  async getTransactionAuditTrail(transactionId) {
    try {
      const { data, error } = await supabase.rpc(
        'get_transaction_audit_trail',
        {
          p_transaction_id: transactionId
        }
      );

      if (error) throw error;

      return { success: true, logs: data };
    } catch (error) {
      console.error('Failed to get transaction audit trail:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get recent audit activity (last 24 hours)
   */
  async getRecentActivity() {
    try {
      const { data, error } = await supabase
        .from('recent_audit_activity')
        .select('*');

      if (error) throw error;

      return { success: true, activity: data };
    } catch (error) {
      console.error('Failed to get recent activity:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get failed events for investigation
   */
  async getFailedEvents(limit = 100) {
    try {
      const { data, error } = await supabase
        .from('failed_audit_events')
        .select('*')
        .limit(limit);

      if (error) throw error;

      return { success: true, events: data };
    } catch (error) {
      console.error('Failed to get failed events:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get admin actions audit
   */
  async getAdminActions(limit = 100) {
    try {
      const { data, error } = await supabase
        .from('admin_actions_audit')
        .select('*')
        .limit(limit);

      if (error) throw error;

      return { success: true, actions: data };
    } catch (error) {
      console.error('Failed to get admin actions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export audit logs to CSV
   */
  async exportToCSV(filters = {}) {
    try {
      let query = supabase
        .from('payment_audit_log')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.transactionId) {
        query = query.eq('transaction_id', filters.transactionId);
      }
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Convert to CSV
      const csv = this.convertToCSV(data);

      return { success: true, csv, count: data.length };
    } catch (error) {
      console.error('Failed to export to CSV:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export audit logs to JSON
   */
  async exportToJSON(filters = {}) {
    try {
      let query = supabase
        .from('payment_audit_log')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters (same as CSV)
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.transactionId) {
        query = query.eq('transaction_id', filters.transactionId);
      }
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data,
        count: data.length,
        exportedAt: new Date().toISOString(),
        filters
      };
    } catch (error) {
      console.error('Failed to export to JSON:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get audit statistics
   */
  async getStatistics(days = 30) {
    try {
      const { data, error } = await supabase
        .from('audit_log_summary')
        .select('*')
        .gte(
          'date',
          new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]
        )
        .order('date', { ascending: false });

      if (error) throw error;

      // Calculate totals
      const totals = data.reduce(
        (acc, row) => {
          acc.totalEvents += row.count;
          acc.successCount += row.success_count;
          acc.failedCount += row.failed_count;
          acc.uniqueUsers += row.unique_users;
          return acc;
        },
        { totalEvents: 0, successCount: 0, failedCount: 0, uniqueUsers: 0 }
      );

      // Group by category
      const byCategory = {};
      data.forEach((row) => {
        if (!byCategory[row.event_category]) {
          byCategory[row.event_category] = {
            count: 0,
            success: 0,
            failed: 0
          };
        }
        byCategory[row.event_category].count += row.count;
        byCategory[row.event_category].success += row.success_count;
        byCategory[row.event_category].failed += row.failed_count;
      });

      return {
        success: true,
        totals,
        byCategory,
        dailyStats: data,
        period: `${days} days`
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify audit log integrity
   */
  async verifyIntegrity(logId) {
    try {
      const { data, error } = await supabase
        .from('payment_audit_log')
        .select('*')
        .eq('id', logId)
        .single();

      if (error) throw error;

      // Reconstruct log data
      const logData = JSON.stringify({
        eventType: data.event_type,
        action: data.action,
        userId: data.user_id,
        transactionId: data.transaction_id,
        timestamp: data.created_at,
        metadata: data.metadata
      });

      // Generate hash
      const computedHash = this.generateHash(logData);

      // Compare with stored hash
      const isValid = computedHash === data.log_hash;

      return {
        success: true,
        valid: isValid,
        log: data,
        computedHash,
        storedHash: data.log_hash
      };
    } catch (error) {
      console.error('Failed to verify integrity:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Generate SHA256 hash
   */
  generateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Helper: Convert to CSV
   */
  convertToCSV(data) {
    if (!data || data.length === 0) return '';

    // Get headers
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    // Get rows
    const csvRows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle special cases
          if (value === null) return '';
          if (typeof value === 'object')
            return JSON.stringify(value).replace(/"/g, '""');
          if (typeof value === 'string' && value.includes(','))
            return `"${value}"`;
          return value;
        })
        .join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  }
}

module.exports = new AuditService();
