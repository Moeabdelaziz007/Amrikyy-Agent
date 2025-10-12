/**
 * 📊 Transaction Monitoring Service - Phase 3
 * خدمة مراقبة المعاملات في الوقت الحقيقي
 * 
 * Features:
 * - Real-time transaction monitoring
 * - Sanctions screening (Chainalysis/OFAC)
 * - Pattern detection (velocity, amount, behavior)
 * - Alert system (Slack, Email, SMS)
 * - AML compliance checks
 */

const axios = require('axios');
const supabase = require('../lib/supabaseClient');

// Chainalysis API Configuration
const CHAINALYSIS_API_BASE = process.env.CHAINALYSIS_API_BASE || 'https://api.chainalysis.com';
const CHAINALYSIS_API_KEY = process.env.CHAINALYSIS_API_KEY || '';

// Alert Configuration
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@amrikyy.com';
const ALERT_ENABLED = process.env.ALERT_ENABLED !== 'false';

class MonitoringService {
  /**
   * Main monitoring function - called for every transaction
   */
  async monitorTransaction(tx) {
    try {
      console.log(`📊 Monitoring transaction: ${tx.bookingId || tx.id}`);

      const checks = await Promise.all([
        this.checkSanctions(tx.cryptoAddress || tx.walletAddress),
        this.checkVelocityPatterns(tx.userId),
        this.checkAmountPatterns(tx.userId, tx.amountUSD),
        this.checkGeolocation(tx.ipCountry, tx.userId),
        this.checkWalletReputation(tx.cryptoAddress),
      ]);

      // Filter alerts by severity
      const alerts = checks.filter(check => check && check.severity);

      // Store all checks
      await this.storeMonitoringChecks(tx, checks);

      // Process alerts if any
      if (alerts.length > 0) {
        console.log(`⚠️ Found ${alerts.length} alerts for transaction ${tx.bookingId}`);
        await this.processAlerts(tx, alerts);
      }

      return {
        monitored: true,
        checks: checks.length,
        alerts: alerts.length,
        alertDetails: alerts,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('❌ Monitoring error:', error);
      return {
        monitored: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Check wallet address against sanctions lists
   * Uses Chainalysis API or OFAC lists
   */
  async checkSanctions(walletAddress) {
    if (!walletAddress) {
      return null;
    }

    try {
      // TODO: Replace with real Chainalysis API call
      if (CHAINALYSIS_API_KEY) {
        const response = await axios.get(
          `${CHAINALYSIS_API_BASE}/v1/sanctions/screening`,
          {
            params: { address: walletAddress },
            headers: { 'Authorization': `Bearer ${CHAINALYSIS_API_KEY}` },
            timeout: 5000,
          }
        );

        if (response.data.sanctioned) {
          return {
            check: 'sanctions',
            severity: 'critical',
            passed: false,
            message: `Wallet address ${walletAddress} is on sanctions list`,
            details: response.data,
          };
        }
      }

      // Placeholder: Basic check against known sanctioned addresses
      const SANCTIONED_ADDRESSES = process.env.SANCTIONED_ADDRESSES?.split(',') || [];
      
      if (SANCTIONED_ADDRESSES.includes(walletAddress.toLowerCase())) {
        return {
          check: 'sanctions',
          severity: 'critical',
          passed: false,
          message: `Wallet address is on local sanctions list`,
          details: { address: walletAddress },
        };
      }

      return {
        check: 'sanctions',
        severity: null,
        passed: true,
        message: 'Wallet address clean',
        details: { address: walletAddress },
      };

    } catch (error) {
      console.error('Sanctions check error:', error.message);
      return {
        check: 'sanctions',
        severity: 'low',
        passed: false,
        message: 'Sanctions check failed - review manually',
        error: error.message,
      };
    }
  }

  /**
   * Check for velocity patterns (too many transactions)
   */
  async checkVelocityPatterns(userId) {
    if (!userId) return null;

    try {
      // Check transactions in last 24 hours
      const { data: recent24h } = await supabase
        .from('crypto_payments')
        .select('id, amount_usd, created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const count24h = recent24h?.length || 0;
      const volume24h = recent24h?.reduce((sum, tx) => sum + parseFloat(tx.amount_usd || 0), 0) || 0;

      // Velocity thresholds
      const HIGH_VELOCITY_COUNT = 10;
      const HIGH_VELOCITY_VOLUME = 50000;

      if (count24h > HIGH_VELOCITY_COUNT) {
        return {
          check: 'velocity',
          severity: 'high',
          passed: false,
          message: `High transaction velocity: ${count24h} transactions in 24h`,
          details: { count24h, volume24h, threshold: HIGH_VELOCITY_COUNT },
        };
      }

      if (volume24h > HIGH_VELOCITY_VOLUME) {
        return {
          check: 'velocity',
          severity: 'high',
          passed: false,
          message: `High transaction volume: $${volume24h} in 24h`,
          details: { count24h, volume24h, threshold: HIGH_VELOCITY_VOLUME },
        };
      }

      return {
        check: 'velocity',
        severity: null,
        passed: true,
        message: 'Normal velocity',
        details: { count24h, volume24h },
      };

    } catch (error) {
      console.error('Velocity check error:', error);
      return null;
    }
  }

  /**
   * Check for unusual amount patterns
   */
  async checkAmountPatterns(userId, currentAmount) {
    if (!userId || !currentAmount) return null;

    try {
      // Get user's transaction history
      const { data: history } = await supabase
        .from('crypto_payments')
        .select('amount_usd')
        .eq('user_id', userId)
        .eq('status', 'confirmed')
        .limit(50);

      if (!history || history.length < 3) {
        // Not enough history
        return null;
      }

      // Calculate average and standard deviation
      const amounts = history.map(tx => parseFloat(tx.amount_usd || 0));
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const stdDev = Math.sqrt(
        amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length
      );

      // Check if current amount is > 3 standard deviations from average
      const zScore = Math.abs((currentAmount - avg) / stdDev);

      if (zScore > 3) {
        return {
          check: 'amount_pattern',
          severity: 'medium',
          passed: false,
          message: `Unusual amount: $${currentAmount} vs avg $${avg.toFixed(2)}`,
          details: { 
            currentAmount, 
            avgAmount: avg.toFixed(2), 
            stdDev: stdDev.toFixed(2),
            zScore: zScore.toFixed(2)
          },
        };
      }

      return {
        check: 'amount_pattern',
        severity: null,
        passed: true,
        message: 'Normal amount pattern',
        details: { currentAmount, avgAmount: avg.toFixed(2) },
      };

    } catch (error) {
      console.error('Amount pattern check error:', error);
      return null;
    }
  }

  /**
   * Check geolocation patterns
   */
  async checkGeolocation(ipCountry, userId) {
    if (!ipCountry || !userId) return null;

    try {
      // Get user's recent locations
      const { data: recentTxs } = await supabase
        .from('crypto_payments')
        .select('metadata')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!recentTxs || recentTxs.length === 0) return null;

      // Extract countries from metadata
      const recentCountries = recentTxs
        .map(tx => tx.metadata?.ipCountry || tx.metadata?.country)
        .filter(Boolean);

      // Check if current country is significantly different
      if (recentCountries.length > 0) {
        const mostCommonCountry = this.getMostCommon(recentCountries);
        
        if (mostCommonCountry && mostCommonCountry !== ipCountry) {
          return {
            check: 'geolocation',
            severity: 'medium',
            passed: false,
            message: `Unusual location: ${ipCountry} (usually ${mostCommonCountry})`,
            details: { 
              currentCountry: ipCountry, 
              usualCountry: mostCommonCountry,
              recentCountries 
            },
          };
        }
      }

      return {
        check: 'geolocation',
        severity: null,
        passed: true,
        message: 'Normal location',
        details: { country: ipCountry },
      };

    } catch (error) {
      console.error('Geolocation check error:', error);
      return null;
    }
  }

  /**
   * Check wallet reputation (placeholder for blockchain analytics)
   */
  async checkWalletReputation(walletAddress) {
    if (!walletAddress) return null;

    // TODO: Integrate with Chainalysis, Elliptic, or TRM Labs
    // Check:
    // - Mixer/Tumbler usage
    // - Darknet market associations
    // - Scam addresses
    // - High-risk exchanges

    return {
      check: 'wallet_reputation',
      severity: null,
      passed: true,
      message: 'Wallet reputation check placeholder',
      details: { address: walletAddress },
    };
  }

  /**
   * Store monitoring checks in database
   */
  async storeMonitoringChecks(tx, checks) {
    try {
      const validChecks = checks.filter(c => c !== null);

      const { error } = await supabase
        .from('transaction_monitoring')
        .insert({
          transaction_id: tx.bookingId || tx.id,
          user_id: tx.userId,
          checks: validChecks,
          alert_count: validChecks.filter(c => c.severity).length,
          highest_severity: this.getHighestSeverity(validChecks),
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to store monitoring checks:', error);
      }
    } catch (error) {
      console.error('Store monitoring error:', error);
    }
  }

  /**
   * Process and send alerts
   */
  async processAlerts(tx, alerts) {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const highAlerts = alerts.filter(a => a.severity === 'high');
    const mediumAlerts = alerts.filter(a => a.severity === 'medium');

    // Send alerts based on severity
    if (criticalAlerts.length > 0) {
      await this.sendCriticalAlert(tx, criticalAlerts);
    } else if (highAlerts.length > 0) {
      await this.sendHighAlert(tx, highAlerts);
    } else if (mediumAlerts.length > 0) {
      await this.sendMediumAlert(tx, mediumAlerts);
    }

    // Store alerts in database
    for (const alert of alerts) {
      await this.storeAlert(tx, alert);
    }
  }

  /**
   * Send critical alert (Slack + Email + SMS)
   */
  async sendCriticalAlert(tx, alerts) {
    if (!ALERT_ENABLED) return;

    const message = `🚨 CRITICAL ALERT: Transaction ${tx.bookingId || tx.id}\n\n` +
      `User: ${tx.userId}\n` +
      `Amount: $${tx.amountUSD}\n` +
      `Alerts: ${alerts.map(a => a.message).join(', ')}\n\n` +
      `Action Required: IMMEDIATE REVIEW`;

    console.log('🚨', message);

    // Send to Slack
    if (SLACK_WEBHOOK_URL) {
      try {
        await axios.post(SLACK_WEBHOOK_URL, {
          text: message,
          username: 'Amrikyy Compliance Bot',
          icon_emoji: ':rotating_light:',
        });
      } catch (error) {
        console.error('Slack alert failed:', error.message);
      }
    }

    // TODO: Send Email (using SendGrid, AWS SES, etc.)
    // TODO: Send SMS (using Twilio, AWS SNS, etc.)
  }

  /**
   * Send high alert (Slack + Email)
   */
  async sendHighAlert(tx, alerts) {
    if (!ALERT_ENABLED) return;

    const message = `⚠️ HIGH ALERT: Transaction ${tx.bookingId || tx.id}\n\n` +
      `Alerts: ${alerts.map(a => a.message).join(', ')}`;

    console.log('⚠️', message);

    if (SLACK_WEBHOOK_URL) {
      try {
        await axios.post(SLACK_WEBHOOK_URL, { text: message });
      } catch (error) {
        console.error('Slack alert failed:', error.message);
      }
    }
  }

  /**
   * Send medium alert (log only, review later)
   */
  async sendMediumAlert(tx, alerts) {
    console.log(`ℹ️ Medium alerts for ${tx.bookingId}:`, alerts.map(a => a.message));
  }

  /**
   * Store alert in database
   */
  async storeAlert(tx, alert) {
    try {
      await supabase
        .from('transaction_alerts')
        .insert({
          transaction_id: tx.bookingId || tx.id,
          user_id: tx.userId,
          alert_type: alert.check,
          severity: alert.severity || 'info',
          message: alert.message,
          data: alert.details || {},
          acknowledged: false,
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Store alert error:', error);
    }
  }

  /**
   * Utility: Get most common element in array
   */
  getMostCommon(arr) {
    if (!arr || arr.length === 0) return null;
    
    const counts = {};
    arr.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });

    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  /**
   * Utility: Get highest severity from checks
   */
  getHighestSeverity(checks) {
    const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    const severities = checks.map(c => c.severity).filter(Boolean);
    
    if (severities.length === 0) return null;

    return severities.reduce((highest, current) => {
      return severityOrder[current] > severityOrder[highest] ? current : highest;
    });
  }

  /**
   * Get alerts for manual review
   */
  async getAlertsForReview(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('transaction_alerts')
        .select('*')
        .eq('acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Get alerts error:', error);
      return [];
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId, adminId) {
    try {
      const { error } = await supabase
        .from('transaction_alerts')
        .update({
          acknowledged: true,
          acknowledged_by: adminId,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;
      return true;

    } catch (error) {
      console.error('Acknowledge alert error:', error);
      return false;
    }
  }
}

module.exports = new MonitoringService();

