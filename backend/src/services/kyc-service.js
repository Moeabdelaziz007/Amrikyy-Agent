// backend/src/services/kyc-service.js
/**
 * 🔐 KYC Service - Identity Verification
 * خدمة التحقق من الهوية (KYC/AML)
 * 
 * Provider: Sumsub (can be replaced with Onfido, Jumio, etc.)
 * Docs: https://docs.sumsub.com/reference/getting-started
 */

const axios = require('axios');
const supabase = require('../lib/supabaseClient');

const SUMSUB_API_BASE = process.env.SUMSUB_API_BASE || 'https://api.sumsub.com';
const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN || '';
const SUMSUB_WEBHOOK_SECRET = process.env.SUMSUB_WEBHOOK_SECRET || '';

class KYCService {
  /**
   * Get latest KYC verification for user
   */
  async getKycByUser(userId) {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('KYC fetch error:', error);
      throw error;
    }

    return data && data[0] ? data[0] : null;
  }

  /**
   * Check user's KYC status
   */
  async checkUserKYC(userId) {
    const kyc = await this.getKycByUser(userId);
    
    if (!kyc) {
      return { 
        level: 'none', 
        status: 'none',
        verified: false
      };
    }

    return { 
      level: kyc.level || 'none', 
      status: kyc.status || 'pending',
      provider_applicant_id: kyc.provider_applicant_id,
      verified: kyc.status === 'approved',
      expires_at: kyc.expires_at,
      approved_at: kyc.approved_at
    };
  }

  /**
   * Create local KYC record in database
   */
  async createLocalKycRow(userId, level = 'basic') {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .insert([{ 
        user_id: userId, 
        level, 
        status: 'pending', 
        provider: 'sumsub' 
      }])
      .select()
      .single();

    if (error) {
      console.error('KYC creation error:', error);
      throw error;
    }

    return data;
  }

  /**
   * Create applicant on Sumsub
   * TODO: Replace with official SDK for production
   * See: https://github.com/SumSubstance/AppTokenUsageExamples-NodeJS
   */
  async createApplicantSumsub(userProfile = {}) {
    if (!SUMSUB_APP_TOKEN) {
      console.warn('⚠️ SUMSUB_APP_TOKEN not configured, using placeholder');
      return { 
        applicantId: `placeholder_${Date.now()}`,
        placeholder: true,
        message: 'Configure SUMSUB_APP_TOKEN for real integration'
      };
    }

    const url = `${SUMSUB_API_BASE}/resources/applicants`;
    const payload = {
      externalUserId: userProfile.id || userProfile.userId,
      email: userProfile.email || null,
      phone: userProfile.phone || null,
      fixedInfo: {
        firstName: userProfile.firstName || null,
        lastName: userProfile.lastName || null
      }
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-App-Token': SUMSUB_APP_TOKEN
    };

    try {
      const resp = await axios.post(url, payload, { headers });
      console.log('✅ Sumsub applicant created:', resp.data.id);
      return resp.data;
    } catch (err) {
      console.error('❌ createApplicantSumsub error:', err.response ? err.response.data : err.message);
      throw err;
    }
  }

  /**
   * Start KYC verification flow for user
   */
  async startKycForUser(user) {
    try {
      // 1) Create local record
      const local = await this.createLocalKycRow(user.id);
      console.log(`📝 Local KYC record created for user ${user.id}`);

      // 2) Create applicant on Sumsub
      try {
        const created = await this.createApplicantSumsub({ 
          id: user.id,
          userId: user.id,
          email: user.email,
          ...user 
        });

        const providerId = created.id || created.applicantId || created.applicantId;

        if (providerId) {
          // Update local record with provider ID
          await supabase
            .from('kyc_verifications')
            .update({ provider_applicant_id: providerId })
            .eq('id', local.id);

          console.log(`✅ Sumsub applicant linked: ${providerId}`);
        }

        return { 
          success: true,
          local, 
          provider: created,
          applicantId: providerId,
          // Verification URL (Sumsub will provide this)
          verificationUrl: created.verificationUrl || null
        };

      } catch (providerError) {
        console.error('⚠️ Provider error, but local record exists:', providerError.message);
        return { 
          success: false,
          local, 
          error: providerError.message || 'sumsub error',
          placeholder: true
        };
      }

    } catch (error) {
      console.error('❌ startKycForUser error:', error);
      throw error;
    }
  }

  /**
   * Update KYC status from provider webhook
   */
  async updateKycStatusByProvider(providerApplicantId, status, data) {
    const { error } = await supabase
      .from('kyc_verifications')
      .update({
        status,
        verification_data: data,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
        // Set expiry to 1 year from approval
        expires_at: status === 'approved' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() 
          : null
      })
      .eq('provider_applicant_id', providerApplicantId);

    if (error) {
      console.error('KYC update error:', error);
      throw error;
    }

    console.log(`✅ KYC status updated: ${providerApplicantId} → ${status}`);
    return true;
  }

  /**
   * Get KYC statistics
   */
  async getStats() {
    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('status, level');

      if (error) throw error;

      const stats = {
        total: data.length,
        by_status: {
          pending: data.filter(k => k.status === 'pending').length,
          approved: data.filter(k => k.status === 'approved').length,
          rejected: data.filter(k => k.status === 'rejected').length
        },
        by_level: {
          none: data.filter(k => k.level === 'none').length,
          basic: data.filter(k => k.level === 'basic').length,
          advanced: data.filter(k => k.level === 'advanced').length,
          premium: data.filter(k => k.level === 'premium').length
        }
      };

      return stats;

    } catch (error) {
      console.error('KYC stats error:', error);
      return null;
    }
  }
}

module.exports = new KYCService();

