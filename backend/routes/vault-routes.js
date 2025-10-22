/**
 * vault-routes.js
 * 
 * API routes for secure credential management
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @date October 22, 2025
 */

const express = require('express');
const router = express.Router();
const secureVault = require('../src/services/SecureVaultService');
const encryptionService = require('../src/services/EncryptionService');

/**
 * POST /api/vault/store
 * Store encrypted credential
 */
router.post('/store', async (req, res) => {
  try {
    const { provider, keyName, value, metadata } = req.body;

    if (!provider || !keyName || !value) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: provider, keyName, value'
      });
    }

    const result = await secureVault.storeCredential(
      provider,
      keyName,
      value,
      metadata
    );

    res.json({
      success: true,
      message: 'Credential stored successfully',
      data: {
        provider: result.provider,
        keyName: result.key_name,
        createdAt: result.created_at
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/vault/get/:provider/:keyName
 * Retrieve decrypted credential
 */
router.get('/get/:provider/:keyName', async (req, res) => {
  try {
    const { provider, keyName } = req.params;

    const value = await secureVault.getCredential(provider, keyName);

    res.json({
      success: true,
      data: {
        provider,
        keyName,
        value
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/vault/delete/:provider/:keyName
 * Delete credential
 */
router.delete('/delete/:provider/:keyName', async (req, res) => {
  try {
    const { provider, keyName } = req.params;

    await secureVault.deleteCredential(provider, keyName);

    res.json({
      success: true,
      message: 'Credential deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/vault/list/:provider
 * List all credentials for a provider
 */
router.get('/list/:provider', async (req, res) => {
  try {
    const { provider } = req.params;

    const credentials = await secureVault.listCredentials(provider);

    res.json({
      success: true,
      data: credentials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/vault/coinbase
 * Store Coinbase credentials
 */
router.post('/coinbase', async (req, res) => {
  try {
    const { apiKey, webhookSecret } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: apiKey'
      });
    }

    await secureVault.storeCoinbaseCredentials(apiKey, webhookSecret);

    res.json({
      success: true,
      message: 'Coinbase credentials stored successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/vault/coinbase
 * Get Coinbase credentials
 */
router.get('/coinbase', async (req, res) => {
  try {
    const credentials = await secureVault.getCoinbaseCredentials();

    res.json({
      success: true,
      data: credentials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/vault/sabre
 * Store Sabre API credentials
 */
router.post('/sabre', async (req, res) => {
  try {
    const { clientId, clientSecret, pcc } = req.body;

    if (!clientId || !clientSecret) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: clientId, clientSecret'
      });
    }

    await secureVault.storeSabreCredentials(clientId, clientSecret, pcc);

    res.json({
      success: true,
      message: 'Sabre credentials stored successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/vault/sabre
 * Get Sabre credentials
 */
router.get('/sabre', async (req, res) => {
  try {
    const credentials = await secureVault.getSabreCredentials();

    res.json({
      success: true,
      data: credentials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/vault/stripe
 * Store Stripe credentials
 */
router.post('/stripe', async (req, res) => {
  try {
    const { secretKey, publishableKey, webhookSecret } = req.body;

    if (!secretKey || !publishableKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: secretKey, publishableKey'
      });
    }

    await secureVault.storeStripeCredentials(
      secretKey,
      publishableKey,
      webhookSecret
    );

    res.json({
      success: true,
      message: 'Stripe credentials stored successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/vault/stripe
 * Get Stripe credentials
 */
router.get('/stripe', async (req, res) => {
  try {
    const credentials = await secureVault.getStripeCredentials();

    res.json({
      success: true,
      data: credentials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/vault/stats
 * Get vault statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await secureVault.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/vault/encrypt
 * Encrypt arbitrary data
 */
router.post('/encrypt', async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: data'
      });
    }

    const encrypted = encryptionService.encrypt(data);

    res.json({
      success: true,
      data: { encrypted }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/vault/decrypt
 * Decrypt arbitrary data
 */
router.post('/decrypt', async (req, res) => {
  try {
    const { encrypted } = req.body;

    if (!encrypted) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: encrypted'
      });
    }

    const decrypted = encryptionService.decrypt(encrypted);

    res.json({
      success: true,
      data: { decrypted }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/vault/info
 * Get encryption service info
 */
router.get('/info', (req, res) => {
  const info = encryptionService.getInfo();
  res.json({
    success: true,
    data: info
  });
});

/**
 * POST /api/vault/generate-key
 * Generate new master encryption key
 */
router.post('/generate-key', (req, res) => {
  const key = encryptionService.generateMasterKey();
  res.json({
    success: true,
    data: { key },
    warning: 'Store this key securely in your .env file!'
  });
});

module.exports = router;
