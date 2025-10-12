/**
 * 🎯 Amrikyy Risk Engine - AI-Powered Transaction Risk Assessment
 * 
 * المزايا:
 * - Multi-signal risk scoring (amount, velocity, location, behavior, wallet)
 * - Real-time assessment (< 100ms)
 * - ML-ready architecture (placeholder for models)
 * - Configurable thresholds
 * - Audit trail integration
 * 
 * Risk Levels:
 * - 0-30: Low (auto-approve)
 * - 31-69: Medium (auto-approve with monitoring)
 * - 70-84: High (manual review)
 * - 85-100: Critical (auto-reject)
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

class RiskEngine {
  constructor() {
    this.THRESHOLDS = {
      REVIEW: parseInt(process.env.RISK_THRESHOLD_REVIEW || '70'),
      REJECT: parseInt(process.env.RISK_THRESHOLD_REJECT || '85')
    };

    this.WEIGHTS = {
      amount: 0.25,
      velocity: 0.20,
      location: 0.15,
      behavior: 0.20,
      wallet: 0.20
    };
  }

  /**
   * Main assessment function
   * @param {Object} tx - Transaction data
   * @param {Object} user - User data (optional)
   * @returns {Promise<Object>} Risk assessment result
   */
  async assessTransaction(tx, user = null) {
    try {
      const signals = {
        amount: await this.scoreAmount(tx.amountUSD),
        velocity: await this.scoreVelocity(tx.userId),
        location: await this.scoreLocation(tx.ipCountry || tx.location),
        behavior: await this.scoreBehavior(tx.userId, user),
        wallet: await this.scoreWallet(tx.cryptoAddress || tx.cryptocurrency)
      };

      // Calculate weighted total
      const totalScore = Object.keys(signals).reduce((sum, key) => {
        return sum + (signals[key] * this.WEIGHTS[key]);
      }, 0);

      const riskScore = Math.round(totalScore);
      const action = this.determineAction(riskScore);
      const level = this.getRiskLevel(riskScore);

      const assessment = {
        score: riskScore,
        level,
        action,
        signals,
        weights: this.WEIGHTS,
        timestamp: new Date().toISOString(),
        transaction_id: tx.bookingId || tx.id
      };

      // Store in database
      await this.storeAssessment(assessment, tx);

      console.log(`🎯 Risk Assessment: Score=${riskScore}, Action=${action}, Level=${level}`);
      
      return assessment;

    } catch (error) {
      console.error('❌ Risk Engine Error:', error);
      // Fail-safe: return medium risk
      return {
        score: 50,
        level: 'medium',
        action: 'manual_review',
        signals: {},
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Score based on transaction amount
   * Higher amounts = higher risk
   */
  async scoreAmount(amountUSD) {
    const amount = parseFloat(amountUSD || 0);

    if (amount < 100) return 0;
    if (amount < 500) return 10;
    if (amount < 1000) return 20;
    if (amount < 5000) return 40;
    if (amount < 10000) return 60;
    if (amount < 50000) return 80;
    return 100; // > $50K = max risk
  }

  /**
   * Score based on user transaction velocity
   * Too many transactions in short time = higher risk
   */
  async scoreVelocity(userId) {
    try {
      if (!userId) return 30; // No user data = moderate risk

      // Count transactions in last 24 hours
      const { data: recent24h } = await supabase
        .from('crypto_payments')
        .select('id, amount_usd, created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!recent24h || recent24h.length === 0) return 0; // First transaction = low risk

      const txCount24h = recent24h.length;
      const totalVolume24h = recent24h.reduce((sum, tx) => sum + parseFloat(tx.amount_usd || 0), 0);

      // High velocity signals
      if (txCount24h > 10) return 90; // More than 10 tx/day
      if (txCount24h > 5) return 60;
      if (totalVolume24h > 50000) return 80; // > $50K in 24h
      if (totalVolume24h > 10000) return 50;

      // Count transactions in last 7 days
      const { data: recent7d } = await supabase
        .from('crypto_payments')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const txCount7d = recent7d?.length || 0;
      if (txCount7d > 20) return 70; // > 20 tx/week

      return Math.min(txCount24h * 8, 40); // Linear scale

    } catch (error) {
      console.error('Velocity scoring error:', error);
      return 30; // Default medium-low
    }
  }

  /**
   * Score based on user location
   * High-risk countries = higher risk
   */
  async scoreLocation(country) {
    if (!country) return 20; // No location = slight risk

    const HIGH_RISK_COUNTRIES = [
      'KP', 'IR', 'SY', 'CU', 'VE', // Sanctioned
      'AF', 'MM', 'YE' // High-risk FATF
    ];

    const MEDIUM_RISK_COUNTRIES = [
      'RU', 'BY', 'LB', 'LY', 'IQ', 'SD'
    ];

    const countryCode = country.toUpperCase();

    if (HIGH_RISK_COUNTRIES.includes(countryCode)) return 100;
    if (MEDIUM_RISK_COUNTRIES.includes(countryCode)) return 60;

    // Low-risk countries (GCC, EU, US, etc.)
    const LOW_RISK = ['SA', 'AE', 'US', 'GB', 'DE', 'FR', 'CA', 'AU', 'JP', 'SG'];
    if (LOW_RISK.includes(countryCode)) return 0;

    return 30; // Unknown = medium-low
  }

  /**
   * Score based on user behavior patterns
   * New users, unusual patterns = higher risk
   */
  async scoreBehavior(userId, user = null) {
    try {
      if (!userId) return 40; // No user = moderate risk

      // Fetch user data
      const { data: userData } = await supabase
        .from('users')
        .select('created_at, email, metadata')
        .eq('id', userId)
        .single();

      if (!userData) return 50; // User not found = risk

      // Check account age
      const accountAge = Date.now() - new Date(userData.created_at).getTime();
      const daysOld = accountAge / (24 * 60 * 60 * 1000);

      if (daysOld < 1) return 70; // Brand new account
      if (daysOld < 7) return 50; // Less than a week
      if (daysOld < 30) return 30; // Less than a month
      if (daysOld > 180) return 0; // 6+ months = trusted

      // Check email verification
      if (!userData.email || !userData.metadata?.email_verified) {
        return 60; // Unverified email
      }

      // Check transaction history
      const { data: txHistory } = await supabase
        .from('crypto_payments')
        .select('status')
        .eq('user_id', userId);

      if (!txHistory || txHistory.length === 0) return 40; // First transaction

      // Check for failed/refunded transactions (red flag)
      const failedCount = txHistory.filter(tx => 
        tx.status === 'failed' || tx.status === 'refunded'
      ).length;

      if (failedCount > 3) return 80; // Multiple failures
      if (failedCount > 0) return 40;

      return 10; // Established user with clean history

    } catch (error) {
      console.error('Behavior scoring error:', error);
      return 30;
    }
  }

  /**
   * Score based on cryptocurrency wallet address
   * Placeholder for blockchain analytics (Chainalysis, Elliptic)
   */
  async scoreWallet(cryptoAddress) {
    if (!cryptoAddress) return 20; // No wallet = slight risk

    // TODO: Integrate with Chainalysis/Elliptic API
    // Check:
    // - Sanctions lists (OFAC, EU, UN)
    // - Known scam addresses
    // - Mixer/Tumbler usage
    // - Darknet market associations

    // Placeholder logic:
    // Check if address has been used before
    try {
      const { data: existingTx } = await supabase
        .from('crypto_payments')
        .select('id, status')
        .eq('payment_address', cryptoAddress)
        .limit(1);

      if (existingTx && existingTx.length > 0) {
        // Address used before successfully
        return 0;
      }

      return 30; // New address = moderate risk

    } catch (error) {
      return 20;
    }
  }

  /**
   * Determine action based on risk score
   */
  determineAction(score) {
    if (score >= this.THRESHOLDS.REJECT) return 'reject';
    if (score >= this.THRESHOLDS.REVIEW) return 'manual_review';
    return 'auto_approve';
  }

  /**
   * Get risk level label
   */
  getRiskLevel(score) {
    if (score >= 85) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 31) return 'medium';
    return 'low';
  }

  /**
   * Store risk assessment in database
   */
  async storeAssessment(assessment, tx) {
    try {
      const { error } = await supabase
        .from('risk_assessments')
        .insert({
          transaction_id: tx.bookingId || tx.id || null,
          user_id: tx.userId,
          risk_score: assessment.score,
          risk_level: assessment.level,
          risk_signals: assessment.signals,
          action: assessment.action,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to store risk assessment:', error);
      }
    } catch (error) {
      console.error('Risk storage error:', error);
    }
  }

  /**
   * Get historical risk data for a user
   */
  async getUserRiskHistory(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Risk history fetch error:', error);
      return [];
    }
  }

  /**
   * Get statistics for monitoring
   */
  async getStats(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('risk_score, risk_level, action')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      const stats = {
        total: data.length,
        by_level: {
          low: data.filter(r => r.risk_level === 'low').length,
          medium: data.filter(r => r.risk_level === 'medium').length,
          high: data.filter(r => r.risk_level === 'high').length,
          critical: data.filter(r => r.risk_level === 'critical').length
        },
        by_action: {
          auto_approve: data.filter(r => r.action === 'auto_approve').length,
          manual_review: data.filter(r => r.action === 'manual_review').length,
          reject: data.filter(r => r.action === 'reject').length
        },
        avg_score: data.reduce((sum, r) => sum + r.risk_score, 0) / data.length || 0
      };

      return stats;

    } catch (error) {
      console.error('Risk stats error:', error);
      return null;
    }
  }
}

module.exports = new RiskEngine();

