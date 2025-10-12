// backend/src/middleware/verifyWebhook.js
const crypto = require('crypto');

/**
 * 🔐 Webhook HMAC Verification Middleware
 * يتحقق من توقيع HMAC لـ webhooks (Sumsub, Chainalysis, etc.)
 * 
 * Based on Sumsub docs: https://docs.sumsub.com/reference/webhooks
 */

function mapAlg(headerAlg) {
  // Sumsub sends header X-Payload-Digest-Alg, e.g. HMAC_SHA256_HEX
  if (!headerAlg) return 'sha256';
  if (headerAlg.includes('SHA512')) return 'sha512';
  if (headerAlg.includes('SHA1')) return 'sha1';
  return 'sha256';
}

// headerName: the header where provider puts signature (adjust if provider uses different name)
const SIGNATURE_HEADER = process.env.SUMSUB_SIGNATURE_HEADER || 'x-payload-digest';

function verifyHmac(req, res, next) {
  try {
    const secret = process.env.SUMSUB_WEBHOOK_SECRET;
    if (!secret) {
      console.error('❌ Webhook secret not configured');
      return res.status(500).json({ error: 'webhook secret not configured' });
    }

    // raw body required for exact HMAC — make sure server uses express.raw() for this route
    const payload = req.rawBody || JSON.stringify(req.body || {});
    const algHeader = (req.headers['x-payload-digest-alg'] || '').toString();
    const alg = mapAlg(algHeader);
    const signature = (req.headers[SIGNATURE_HEADER] || '').toString();

    if (!signature) {
      console.warn('⚠️ No signature in webhook request');
      return res.status(401).json({ ok: false, error: 'missing signature' });
    }

    const hmac = crypto.createHmac(alg, secret);
    hmac.update(payload);
    const digest = hmac.digest('hex');

    // Compare timing-safe
    try {
      if (!crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
        console.warn('❌ Webhook signature mismatch', { 
          expected: digest.substring(0, 20) + '...', 
          got: signature.substring(0, 20) + '...',
          algHeader 
        });
        return res.status(401).json({ ok: false, error: 'invalid signature' });
      }
    } catch (e) {
      // Buffer length mismatch
      console.warn('❌ Webhook signature length mismatch');
      return res.status(401).json({ ok: false, error: 'invalid signature' });
    }

    console.log('✅ Webhook signature verified');
    return next();

  } catch (e) {
    console.error('❌ verifyHmac error', e);
    return res.status(400).json({ ok: false, error: 'bad request' });
  }
}

module.exports = verifyHmac;

