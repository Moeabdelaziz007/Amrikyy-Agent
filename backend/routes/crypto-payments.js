/**
 * Crypto Payment Routes - Blockchain Security & Multi-Currency Support
 * Maya Travel Agent - Cryptocurrency Payment API
 */

const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const CryptoPaymentManager = require('../src/crypto/CryptoPaymentManager');
const AIXConnectionManager = require('../src/aix/AIXConnectionManager');

const log = logger.child('CryptoPaymentRoutes');

// Initialize crypto payment manager
const cryptoPaymentManager = new CryptoPaymentManager();

// Initialize AIX Connection Manager
const aixConnectionManager = new AIXConnectionManager();

/**
 * Get supported cryptocurrencies
 */
router.get('/currencies', async (req, res) => {
  try {
    const supportedCurrencies = cryptoPaymentManager.getSupportedCurrencies();

    res.status(200).json({
      success: true,
      currencies: supportedCurrencies,
      message: 'Supported cryptocurrencies retrieved successfully',
    });
  } catch (error) {
    log.error('Error getting supported currencies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve supported currencies',
    });
  }
});

/**
 * Create crypto payment request
 */
router.post('/create-payment', async (req, res) => {
  try {
    const { userId, amount, currency, chainType, description, metadata = {} } = req.body;

    // Validate required fields
    if (!userId || !amount || !currency || !chainType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, amount, currency, chainType',
      });
    }

    // Create payment request
    const paymentRequest = await cryptoPaymentManager.createPaymentRequest({
      userId,
      amount: parseFloat(amount),
      currency,
      chainType,
      description,
      metadata,
    });

    // Notify AI agents about payment creation
    await aixConnectionManager.processMessage({
      from: 'crypto-payment-system',
      to: 'tariq-payment-manager',
      content: `Crypto payment request created: ${paymentRequest.paymentId} for ${amount} ${currency}`,
      type: 'crypto_payment_created',
      metadata: {
        paymentId: paymentRequest.paymentId,
        userId,
        amount,
        currency,
        chainType,
        source: 'crypto-payments',
      },
    });

    res.status(201).json({
      success: true,
      paymentRequest,
      message: 'Crypto payment request created successfully',
    });
  } catch (error) {
    log.error('Error creating crypto payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create crypto payment request',
    });
  }
});

/**
 * Verify crypto transaction
 */
router.post('/verify-transaction', async (req, res) => {
  try {
    const { paymentId, txHash, chainType, expectedAmount, expectedAddress } = req.body;

    // Validate required fields
    if (!paymentId || !txHash || !chainType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: paymentId, txHash, chainType',
      });
    }

    // Verify transaction on blockchain
    const verification = await cryptoPaymentManager.verifyTransaction(
      txHash,
      chainType,
      expectedAmount,
      expectedAddress
    );

    if (verification.verified) {
      // Update payment status
      await aixConnectionManager.processMessage({
        from: 'crypto-payment-system',
        to: 'tariq-payment-manager',
        content: `Crypto payment verified: ${paymentId} with tx ${txHash}`,
        type: 'crypto_payment_verified',
        metadata: {
          paymentId,
          txHash,
          chainType,
          amount: verification.amount,
          confirmations: verification.confirmations,
          source: 'crypto-payments',
        },
      });

      res.status(200).json({
        success: true,
        verification,
        message: 'Transaction verified successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Transaction verification failed',
      });
    }
  } catch (error) {
    log.error('Error verifying crypto transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify transaction',
    });
  }
});

/**
 * Get payment status
 */
router.get('/payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID is required',
      });
    }

    const paymentStatus = await cryptoPaymentManager.getPaymentStatus(paymentId);

    res.status(200).json({
      success: true,
      paymentStatus,
      message: 'Payment status retrieved successfully',
    });
  } catch (error) {
    log.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve payment status',
    });
  }
});

/**
 * Generate wallet address for user
 */
router.post('/generate-wallet', async (req, res) => {
  try {
    const { userId, chainType } = req.body;

    if (!userId || !chainType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, chainType',
      });
    }

    const walletAddress = await cryptoPaymentManager.generateWalletAddress(chainType, userId);

    // Remove private key from response for security
    const publicWalletInfo = {
      address: walletAddress.address,
      publicKey: walletAddress.publicKey,
      chainType: walletAddress.chainType,
    };

    res.status(201).json({
      success: true,
      wallet: publicWalletInfo,
      message: 'Wallet address generated successfully',
    });
  } catch (error) {
    log.error('Error generating wallet address:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate wallet address',
    });
  }
});

/**
 * Get crypto payment statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalPayments: 0, // Would be retrieved from database
      totalVolume: 0,
      supportedChains: Object.keys(cryptoPaymentManager.supportedChains).length,
      activeWallets: 0,
      successfulTransactions: 0,
      pendingTransactions: 0,
      failedTransactions: 0,
      averageConfirmationTime: 0,
      popularCurrencies: [
        { currency: 'BTC', count: 45 },
        { currency: 'ETH', count: 32 },
        { currency: 'USDT', count: 28 },
        { currency: 'BNB', count: 15 },
      ],
      chainUsage: [
        { chain: 'Bitcoin', percentage: 35 },
        { chain: 'Ethereum', percentage: 25 },
        { chain: 'BSC', percentage: 20 },
        { chain: 'Polygon', percentage: 15 },
        { chain: 'Solana', percentage: 5 },
      ],
    };

    res.status(200).json({
      success: true,
      stats,
      message: 'Crypto payment statistics retrieved successfully',
    });
  } catch (error) {
    log.error('Error getting crypto payment stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve crypto payment statistics',
    });
  }
});

/**
 * Webhook for blockchain events (for future integration)
 */
router.post('/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;

    log.info('Crypto payment webhook received:', { event, data });

    // Process different webhook events
    switch (event) {
      case 'transaction_confirmed':
        await handleTransactionConfirmed(data);
        break;

      case 'transaction_failed':
        await handleTransactionFailed(data);
        break;

      case 'wallet_created':
        await handleWalletCreated(data);
        break;

      default:
        log.warn('Unknown webhook event:', event);
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    log.error('Error processing crypto payment webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
    });
  }
});

/**
 * Handle transaction confirmed event
 */
async function handleTransactionConfirmed(data) {
  try {
    await aixConnectionManager.processMessage({
      from: 'crypto-payment-system',
      to: 'tariq-payment-manager',
      content: `Transaction confirmed: ${data.txHash}`,
      type: 'crypto_transaction_confirmed',
      metadata: {
        txHash: data.txHash,
        amount: data.amount,
        currency: data.currency,
        confirmations: data.confirmations,
        source: 'crypto-webhook',
      },
    });
  } catch (error) {
    log.error('Error handling transaction confirmed:', error);
  }
}

/**
 * Handle transaction failed event
 */
async function handleTransactionFailed(data) {
  try {
    await aixConnectionManager.processMessage({
      from: 'crypto-payment-system',
      to: 'tariq-payment-manager',
      content: `Transaction failed: ${data.txHash}`,
      type: 'crypto_transaction_failed',
      metadata: {
        txHash: data.txHash,
        error: data.error,
        source: 'crypto-webhook',
      },
    });
  } catch (error) {
    log.error('Error handling transaction failed:', error);
  }
}

/**
 * Handle wallet created event
 */
async function handleWalletCreated(data) {
  try {
    await aixConnectionManager.processMessage({
      from: 'crypto-payment-system',
      to: 'tariq-payment-manager',
      content: `Wallet created for user: ${data.userId}`,
      type: 'crypto_wallet_created',
      metadata: {
        userId: data.userId,
        chainType: data.chainType,
        address: data.address,
        source: 'crypto-webhook',
      },
    });
  } catch (error) {
    log.error('Error handling wallet created:', error);
  }
}

/**
 * Get user's crypto wallets
 */
router.get('/user/:userId/wallets', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    // In production, retrieve from database
    const wallets = [
      {
        chainType: 'bitcoin',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Example address
        balance: 0,
        lastUsed: new Date().toISOString(),
      },
      {
        chainType: 'ethereum',
        address: '0x742d35Cc6634C0532925a3b8D0c4c4e4c4e4c4e4', // Example address
        balance: 0,
        lastUsed: new Date().toISOString(),
      },
    ];

    res.status(200).json({
      success: true,
      wallets,
      message: 'User wallets retrieved successfully',
    });
  } catch (error) {
    log.error('Error getting user wallets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user wallets',
    });
  }
});

/**
 * Get crypto payment history
 */
router.get('/user/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    // In production, retrieve from database
    const paymentHistory = [
      {
        paymentId: 'crypto_123',
        amount: 0.001,
        currency: 'BTC',
        chainType: 'bitcoin',
        status: 'confirmed',
        txHash: 'abc123...',
        createdAt: new Date().toISOString(),
        description: 'Trip booking payment',
      },
      {
        paymentId: 'crypto_124',
        amount: 50,
        currency: 'USDT',
        chainType: 'ethereum',
        status: 'pending',
        txHash: null,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        description: 'Hotel reservation',
      },
    ];

    res.status(200).json({
      success: true,
      payments: paymentHistory.slice(offset, offset + parseInt(limit)),
      total: paymentHistory.length,
      message: 'Payment history retrieved successfully',
    });
  } catch (error) {
    log.error('Error getting payment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve payment history',
    });
  }
});

module.exports = router;
