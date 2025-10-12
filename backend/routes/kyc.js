/**
 * 🔐 KYC API Routes
 * المسارات الخاصة بالتحقق من الهوية (KYC)
 */

const express = require('express');
const router = express.Router();
const kycService = require('../src/services/kyc-service');
const verifyHmac = require('../src/middleware/verifyWebhook');

/**
 * POST /api/kyc/start
 * بدء عملية التحقق من الهوية
 */
router.post('/start', async (req, res) => {
  try {
    const { userId, email, firstName, lastName, phone } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        error: 'userId required' 
      });
    }

    // Construct user profile
    const user = { 
      id: userId, 
      email: email || null,
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null
    };

    console.log(`🔐 Starting KYC for user: ${userId}`);
    const result = await kycService.startKycForUser(user);

    res.json({ 
      success: true,
      ...result 
    });

  } catch (err) {
    console.error('❌ KYC start error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message || 'internal error' 
    });
  }
});

/**
 * GET /api/kyc/status/:userId
 * التحقق من حالة KYC للمستخدم
 */
router.get('/status/:userId', async (req, res) => {
  try {
    const status = await kycService.checkUserKYC(req.params.userId);

    res.json({
      success: true,
      ...status
    });

  } catch (err) {
    console.error('❌ KYC status error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

/**
 * POST /api/kyc/webhook/sumsub
 * Webhook endpoint لاستقبال تحديثات من Sumsub
 * 
 * IMPORTANT: Must use express.raw() to capture raw body for HMAC verification
 * 
 * Example setup in server.js:
 * app.post('/api/kyc/webhook/sumsub', 
 *   express.raw({ type: '*' }), 
 *   kyc الروتر)
 */
router.post('/webhook/sumsub', 
  // Capture raw body first
  express.raw({ type: '*/*' }), 
  (req, res, next) => {
    // Store raw body as string for HMAC verification
    req.rawBody = req.body.toString('utf8');
    next();
  },
  // Verify HMAC signature
  verifyHmac,
  // Handle webhook payload
  async (req, res) => {
    try {
      // Parse body as JSON
      const payload = JSON.parse(req.rawBody);

      console.log('📨 Sumsub webhook received:', {
        type: payload.type,
        applicantId: payload.applicantId,
        reviewStatus: payload.reviewStatus
      });

      // Extract applicant ID (Sumsub may use different field names)
      const providerApplicantId = 
        payload.applicantId || 
        payload.id || 
        payload.resource || 
        payload.externalUserId;

      if (!providerApplicantId) {
        console.warn('⚠️ No applicant ID in webhook payload');
        return res.status(400).json({ 
          ok: false, 
          error: 'missing applicant ID' 
        });
      }

      // Extract review status
      const reviewStatus = 
        payload.reviewResult || 
        payload.reviewStatus || 
        payload.review?.status || 
        payload.review;

      // Map Sumsub statuses to our statuses
      // See: https://docs.sumsub.com/reference/webhooks
      const statusMap = { 
        'GREEN': 'approved',
        'RED': 'rejected',
        'PENDING': 'pending',
        'YELLOW': 'pending',
        'completed': 'approved',
        'rejected': 'rejected',
      };

      const mapped = statusMap[reviewStatus] || 
                     (payload.reviewStatus === 'APPROVED' ? 'approved' : 
                      (payload.reviewStatus === 'REJECTED' ? 'rejected' : 'pending'));

      // Update KYC status in database
      await kycService.updateKycStatusByProvider(
        providerApplicantId, 
        mapped, 
        payload
      );

      console.log(`✅ KYC webhook processed: ${providerApplicantId} → ${mapped}`);

      res.json({ ok: true, status: mapped });

    } catch (e) {
      console.error('❌ Webhook handler error:', e);
      res.status(500).json({ 
        ok: false, 
        error: e.message 
      });
    }
  }
);

/**
 * GET /api/kyc/stats
 * إحصائيات KYC
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await kycService.getStats();

    res.json({
      success: true,
      stats
    });

  } catch (err) {
    console.error('❌ KYC stats error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

module.exports = router;

