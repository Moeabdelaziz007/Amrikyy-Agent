/**
 * 💎 Crypto Payment API Routes
 * المسارات الخاصة بنظام الدفع بالعملات المشفرة
 */

const express = require('express');
const router = express.Router();
const cryptoPaymentService = require('../src/services/crypto-payment-service');

// Phase 2: Risk Engine Integration
const riskEngine = require('../src/services/risk-engine');

// Phase 3: Transaction Monitoring
const monitoringService = require('../src/services/monitoring-service');

// Phase 1: KYC Service (will be added when implemented)
// const kycService = require('../src/services/kyc-service');

/**
 * GET /api/crypto/supported
 * الحصول على قائمة العملات المشفرة المدعومة
 */
router.get('/supported', async (req, res) => {
  try {
    const cryptocurrencies =
      cryptoPaymentService.getSupportedCryptocurrencies();

    res.json({
      success: true,
      cryptocurrencies,
      total: cryptocurrencies.length
    });
  } catch (error) {
    console.error('[Crypto API] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/crypto/price/:symbol
 * الحصول على سعر عملة مشفرة
 */
router.get('/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const price = await cryptoPaymentService.getCryptoPrice(
      symbol.toUpperCase()
    );

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      priceUSD: price,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Crypto API] Error fetching price:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/crypto/invoice/create
 * إنشاء فاتورة دفع بالعملات المشفرة
 */
router.post('/invoice/create', async (req, res) => {
  try {
    const {
      bookingId,
      userId,
      amountUSD,
      cryptocurrency,
      customerEmail,
      description,
      ipCountry,
      cryptoAddress
    } = req.body;

    // Validation
    if (!bookingId || !userId || !amountUSD) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: bookingId, userId, amountUSD'
      });
    }

    if (amountUSD < 10) {
      return res.status(400).json({
        success: false,
        error: 'Minimum payment amount is $10'
      });
    }

    // ============================================
    // Phase 1: KYC Check (TODO: Uncomment when KYC service is ready)
    // ============================================
    /*
    const kycStatus = await kycService.checkUserKYC(userId);
    const LIMIT_NO_KYC = Number(process.env.LIMIT_NO_KYC || 500);
    const LIMIT_BASIC_KYC = Number(process.env.LIMIT_BASIC_KYC || 10000);

    if (kycStatus.level === 'none' && amountUSD > LIMIT_NO_KYC) {
      return res.status(403).json({
        success: false,
        error: `KYC required for amounts over $${LIMIT_NO_KYC}`,
        code: 'KYC_REQUIRED',
        kycStatus,
      });
    }

    if (kycStatus.level === 'basic' && amountUSD > LIMIT_BASIC_KYC) {
      return res.status(403).json({
        success: false,
        error: `Advanced KYC required for amounts over $${LIMIT_BASIC_KYC}`,
        code: 'ADVANCED_KYC_REQUIRED',
        kycStatus,
      });
    }
    */

    // ============================================
    // Phase 2: Risk Assessment ✅
    // ============================================
    console.log(`🎯 Running risk assessment for user ${userId}...`);

    const riskAssessment = await riskEngine.assessTransaction({
      bookingId,
      userId,
      amountUSD,
      cryptocurrency: cryptocurrency || 'USDT',
      ipCountry,
      cryptoAddress,
      location: ipCountry
    });

    console.log(`🎯 Risk Score: ${riskAssessment.score}, Action: ${riskAssessment.action}`);

    // Handle high-risk transactions
    if (riskAssessment.action === 'reject') {
      return res.status(403).json({
        success: false,
        error: 'Transaction rejected due to high risk',
        code: 'HIGH_RISK_REJECTED',
        riskScore: riskAssessment.score,
        riskLevel: riskAssessment.level,
        message: 'This transaction has been flagged as high risk. Please contact support.'
      });
    }

    if (riskAssessment.action === 'manual_review') {
      // Create invoice but flag it for manual review
      console.log(`⚠️ Transaction flagged for manual review (Score: ${riskAssessment.score})`);
    }

    // ============================================
    // Phase 3: Transaction Monitoring ✅
    // ============================================
    console.log('📊 Running transaction monitoring...');

    const monitoringResult = await monitoringService.monitorTransaction({
      bookingId,
      userId,
      amountUSD,
      cryptocurrency: cryptocurrency || 'USDT',
      cryptoAddress,
      walletAddress: cryptoAddress,
      ipCountry,
      id: bookingId
    });

    console.log(`📊 Monitoring: ${monitoringResult.checks} checks, ${monitoringResult.alerts} alerts`);

    // If critical alerts, reject transaction
    if (monitoringResult.alertDetails && monitoringResult.alertDetails.some(a => a.severity === 'critical')) {
      return res.status(403).json({
        success: false,
        error: 'Transaction blocked due to critical security alert',
        code: 'CRITICAL_ALERT',
        monitoring: monitoringResult,
        message: 'This transaction has been blocked for security reasons. Please contact support.'
      });
    }

    // ============================================
    // Phase 4: Create Invoice (proceed if approved)
    // ============================================
    const result = await cryptoPaymentService.createPaymentInvoice({
      bookingId,
      userId,
      amountUSD,
      cryptocurrency: cryptocurrency || 'USDT',
      customerEmail,
      description: description || `Amrikyy Booking #${bookingId}`
    });

    console.log(`💳 Invoice created: ${result.invoice.id} (Risk Score: ${riskAssessment.score})`);

    // Add risk assessment to response
    res.json({
      ...result,
      riskAssessment: {
        score: riskAssessment.score,
        level: riskAssessment.level,
        action: riskAssessment.action,
        requiresReview: riskAssessment.action === 'manual_review'
      }
    });
  } catch (error) {
    console.error('[Crypto API] Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/crypto/invoice/:invoiceId
 * الحصول على تفاصيل فاتورة
 */
router.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const status = await cryptoPaymentService.verifyTransaction(invoiceId);

    res.json({
      success: true,
      invoiceId,
      ...status
    });
  } catch (error) {
    console.error('[Crypto API] Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/crypto/invoice/:invoiceId/verify
 * التحقق من حالة الدفع
 */
router.post('/invoice/:invoiceId/verify', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const verification = await cryptoPaymentService.verifyTransaction(
      invoiceId
    );

    res.json({
      success: true,
      verification
    });
  } catch (error) {
    console.error('[Crypto API] Error verifying transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/crypto/refund
 * طلب استرداد الأموال
 */
router.post('/refund', async (req, res) => {
  try {
    const { invoiceId, reason } = req.body;

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing invoiceId'
      });
    }

    const result = await cryptoPaymentService.processRefund(
      invoiceId,
      reason || 'Customer requested refund'
    );

    res.json(result);
  } catch (error) {
    console.error('[Crypto API] Error processing refund:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/crypto/fee/:cryptocurrency
 * حساب رسوم الشبكة المقدرة
 */
router.get('/fee/:cryptocurrency', async (req, res) => {
  try {
    const { cryptocurrency } = req.params;

    const fee = await cryptoPaymentService.estimateNetworkFee(
      cryptocurrency.toUpperCase()
    );

    res.json({
      success: true,
      cryptocurrency: cryptocurrency.toUpperCase(),
      fee
    });
  } catch (error) {
    console.error('[Crypto API] Error estimating fee:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/crypto/webhook
 * Webhook للتحديثات من خدمات blockchain
 */
router.post('/webhook', express.json(), async (req, res) => {
  try {
    const { event, data } = req.body;

    console.log(`📨 Crypto webhook received: ${event}`, data);

    // Handle different webhook events
    switch (event) {
    case 'transaction.confirmed':
      // Update invoice status
      await cryptoPaymentService.updateInvoiceStatus(
        data.invoiceId,
        'confirmed'
      );
      break;

    case 'transaction.failed':
      await cryptoPaymentService.updateInvoiceStatus(
        data.invoiceId,
        'failed'
      );
      break;

    default:
      console.log(`Unknown webhook event: ${event}`);
    }

    res.json({ success: true, received: true });
  } catch (error) {
    console.error('[Crypto API] Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/crypto/stats
 * إحصائيات الدفع بالعملات المشفرة
 */
router.get('/stats', async (req, res) => {
  try {
    // This would aggregate data from crypto_payments table
    // Simplified for now
    res.json({
      success: true,
      stats: {
        totalVolume: 0,
        totalTransactions: 0,
        popularCurrency: 'USDT',
        avgConfirmationTime: '2 minutes'
      }
    });
  } catch (error) {
    console.error('[Crypto API] Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
