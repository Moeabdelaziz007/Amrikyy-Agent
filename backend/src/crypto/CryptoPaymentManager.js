/**
 * Crypto Payment Manager - Blockchain Security & Multi-Currency Support
 * Maya Travel Agent - Secure Cryptocurrency Payment System
 *
 * Supported Blockchains:
 * - Bitcoin (BTC)
 * - Ethereum (ETH) + ERC-20 tokens
 * - Binance Smart Chain (BNB) + BEP-20 tokens
 * - Polygon (MATIC)
 * - Solana (SOL)
 * - Cardano (ADA)
 */

const { logger } = require('../utils/logger');
const crypto = require('crypto');
const Web3 = require('web3');
const bitcoin = require('bitcoinjs-lib');
const { Keypair } = require('@solana/web3.js');

const log = logger.child('CryptoPaymentManager');

class CryptoPaymentManager {
  constructor() {
    this.supportedChains = {
      bitcoin: {
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 8,
        network: 'mainnet', // or 'testnet' for testing
        explorer: 'https://blockstream.info',
      },
      ethereum: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        network: 'mainnet',
        explorer: 'https://etherscan.io',
        rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-key',
      },
      bsc: {
        name: 'Binance Smart Chain',
        symbol: 'BNB',
        decimals: 18,
        network: 'mainnet',
        explorer: 'https://bscscan.com',
        rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
      },
      polygon: {
        name: 'Polygon',
        symbol: 'MATIC',
        decimals: 18,
        network: 'mainnet',
        explorer: 'https://polygonscan.com',
        rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
      },
      solana: {
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9,
        network: 'mainnet-beta',
        explorer: 'https://explorer.solana.com',
        rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      },
      cardano: {
        name: 'Cardano',
        symbol: 'ADA',
        decimals: 6,
        network: 'mainnet',
        explorer: 'https://cardanoscan.io',
      },
    };

    this.web3Instances = {};
    this.initializeWeb3Connections();

    // Security settings
    this.securityConfig = {
      encryptionKey: process.env.CRYPTO_ENCRYPTION_KEY,
      hmacSecret: process.env.CRYPTO_HMAC_SECRET,
      nonceLength: 32,
      keyDerivationIterations: 100000,
    };

    log.info('Crypto Payment Manager initialized with blockchain support');
  }

  /**
   * Initialize Web3 connections for supported chains
   */
  initializeWeb3Connections() {
    try {
      // Ethereum connection
      if (this.supportedChains.ethereum.rpcUrl) {
        this.web3Instances.ethereum = new Web3(this.supportedChains.ethereum.rpcUrl);
      }

      // BSC connection
      if (this.supportedChains.bsc.rpcUrl) {
        this.web3Instances.bsc = new Web3(this.supportedChains.bsc.rpcUrl);
      }

      // Polygon connection
      if (this.supportedChains.polygon.rpcUrl) {
        this.web3Instances.polygon = new Web3(this.supportedChains.polygon.rpcUrl);
      }

      log.info('Web3 connections initialized for supported chains');
    } catch (error) {
      log.error('Error initializing Web3 connections:', error);
    }
  }

  /**
   * Generate secure wallet addresses for supported cryptocurrencies
   */
  async generateWalletAddress(chainType, userId) {
    try {
      const timestamp = Date.now();
      const userSeed = `${userId}_${timestamp}_${crypto.randomBytes(16).toString('hex')}`;

      switch (chainType) {
        case 'bitcoin':
          return await this.generateBitcoinAddress(userSeed);

        case 'ethereum':
        case 'bsc':
        case 'polygon':
          return await this.generateEthereumAddress(userSeed, chainType);

        case 'solana':
          return await this.generateSolanaAddress(userSeed);

        case 'cardano':
          return await this.generateCardanoAddress(userSeed);

        default:
          throw new Error(`Unsupported chain type: ${chainType}`);
      }
    } catch (error) {
      log.error(`Error generating wallet address for ${chainType}:`, error);
      throw error;
    }
  }

  /**
   * Generate Bitcoin address
   */
  async generateBitcoinAddress(seed) {
    try {
      const network = bitcoin.networks[this.supportedChains.bitcoin.network];
      const seedBuffer = crypto.createHash('sha256').update(seed).digest();
      const keyPair = bitcoin.ECPair.fromPrivateKey(seedBuffer, { network });

      const { address } = bitcoin.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network,
      });

      return {
        address,
        privateKey: keyPair.privateKey.toString('hex'),
        publicKey: keyPair.publicKey.toString('hex'),
        chainType: 'bitcoin',
      };
    } catch (error) {
      log.error('Error generating Bitcoin address:', error);
      throw error;
    }
  }

  /**
   * Generate Ethereum-compatible address (ETH, BSC, Polygon)
   */
  async generateEthereumAddress(seed, chainType) {
    try {
      const web3 = this.web3Instances[chainType];
      if (!web3) {
        throw new Error(`Web3 instance not available for ${chainType}`);
      }

      const account = web3.eth.accounts.create(seed);

      return {
        address: account.address,
        privateKey: account.privateKey,
        publicKey: account.publicKey,
        chainType,
      };
    } catch (error) {
      log.error(`Error generating ${chainType} address:`, error);
      throw error;
    }
  }

  /**
   * Generate Solana address
   */
  async generateSolanaAddress(seed) {
    try {
      const seedBuffer = crypto.createHash('sha256').update(seed).digest();
      const keypair = Keypair.fromSeed(seedBuffer.slice(0, 32));

      return {
        address: keypair.publicKey.toString(),
        privateKey: Buffer.from(keypair.secretKey).toString('hex'),
        publicKey: keypair.publicKey.toString(),
        chainType: 'solana',
      };
    } catch (error) {
      log.error('Error generating Solana address:', error);
      throw error;
    }
  }

  /**
   * Generate Cardano address
   */
  async generateCardanoAddress(seed) {
    try {
      // Simplified Cardano address generation
      // In production, use cardano-serialization-lib
      const seedBuffer = crypto.createHash('sha256').update(seed).digest();
      const address = 'addr1' + seedBuffer.toString('hex').slice(0, 58);

      return {
        address,
        privateKey: seedBuffer.toString('hex'),
        publicKey: seedBuffer.toString('hex'),
        chainType: 'cardano',
      };
    } catch (error) {
      log.error('Error generating Cardano address:', error);
      throw error;
    }
  }

  /**
   * Create secure payment request
   */
  async createPaymentRequest(paymentData) {
    try {
      const { userId, amount, currency, chainType, description, metadata = {} } = paymentData;

      // Validate payment data
      await this.validatePaymentData(paymentData);

      // Generate unique payment ID
      const paymentId = crypto.randomUUID();

      // Create wallet address for this payment
      const walletAddress = await this.generateWalletAddress(chainType, userId);

      // Encrypt sensitive data
      const encryptedPrivateKey = await this.encryptData(walletAddress.privateKey);

      // Create payment request
      const paymentRequest = {
        paymentId,
        userId,
        amount,
        currency,
        chainType,
        walletAddress: walletAddress.address,
        encryptedPrivateKey,
        description,
        metadata,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        securityHash: await this.generateSecurityHash(paymentData),
      };

      // Store payment request securely
      await this.storePaymentRequest(paymentRequest);

      log.info(`Payment request created: ${paymentId} for ${amount} ${currency}`);

      return {
        success: true,
        paymentId,
        walletAddress: walletAddress.address,
        amount,
        currency,
        chainType,
        qrCode: await this.generateQRCode(paymentRequest),
        expiresAt: paymentRequest.expiresAt,
      };
    } catch (error) {
      log.error('Error creating payment request:', error);
      throw error;
    }
  }

  /**
   * Verify blockchain transaction
   */
  async verifyTransaction(txHash, chainType, expectedAmount, expectedAddress) {
    try {
      log.info(`Verifying transaction ${txHash} on ${chainType}`);

      switch (chainType) {
        case 'bitcoin':
          return await this.verifyBitcoinTransaction(txHash, expectedAmount, expectedAddress);

        case 'ethereum':
        case 'bsc':
        case 'polygon':
          return await this.verifyEthereumTransaction(
            txHash,
            chainType,
            expectedAmount,
            expectedAddress
          );

        case 'solana':
          return await this.verifySolanaTransaction(txHash, expectedAmount, expectedAddress);

        case 'cardano':
          return await this.verifyCardanoTransaction(txHash, expectedAmount, expectedAddress);

        default:
          throw new Error(`Unsupported chain type for verification: ${chainType}`);
      }
    } catch (error) {
      log.error(`Error verifying transaction on ${chainType}:`, error);
      throw error;
    }
  }

  /**
   * Verify Bitcoin transaction
   */
  async verifyBitcoinTransaction(txHash, expectedAmount, expectedAddress) {
    try {
      // In production, use a Bitcoin API like Blockstream or Blockchain.info
      const response = await fetch(`${this.supportedChains.bitcoin.explorer}/api/tx/${txHash}`);
      const txData = await response.json();

      if (!txData || !txData.vout) {
        throw new Error('Invalid transaction data');
      }

      // Check if transaction sends to expected address
      const output = txData.vout.find((vout) => vout.scriptpubkey_address === expectedAddress);

      if (!output) {
        throw new Error('Transaction does not send to expected address');
      }

      // Verify amount (convert from satoshis to BTC)
      const actualAmount = output.value / Math.pow(10, this.supportedChains.bitcoin.decimals);

      if (Math.abs(actualAmount - expectedAmount) > 0.00000001) {
        // Allow for small rounding differences
        throw new Error(`Amount mismatch: expected ${expectedAmount}, got ${actualAmount}`);
      }

      return {
        verified: true,
        txHash,
        amount: actualAmount,
        address: expectedAddress,
        confirmations: txData.status?.confirmed ? txData.status.block_height : 0,
        timestamp: txData.status?.block_time,
      };
    } catch (error) {
      log.error('Error verifying Bitcoin transaction:', error);
      throw error;
    }
  }

  /**
   * Verify Ethereum transaction
   */
  async verifyEthereumTransaction(txHash, chainType, expectedAmount, expectedAddress) {
    try {
      const web3 = this.web3Instances[chainType];
      if (!web3) {
        throw new Error(`Web3 instance not available for ${chainType}`);
      }

      const txData = await web3.eth.getTransactionReceipt(txHash);

      if (!txData) {
        throw new Error('Transaction not found');
      }

      if (txData.status !== '0x1') {
        throw new Error('Transaction failed');
      }

      // Get transaction details
      const tx = await web3.eth.getTransaction(txHash);

      // Verify recipient address
      if (tx.to.toLowerCase() !== expectedAddress.toLowerCase()) {
        throw new Error('Transaction does not send to expected address');
      }

      // Verify amount
      const actualAmount = web3.utils.fromWei(tx.value, 'ether');

      if (Math.abs(parseFloat(actualAmount) - expectedAmount) > 0.00000001) {
        throw new Error(`Amount mismatch: expected ${expectedAmount}, got ${actualAmount}`);
      }

      return {
        verified: true,
        txHash,
        amount: parseFloat(actualAmount),
        address: expectedAddress,
        confirmations: txData.blockNumber
          ? (await web3.eth.getBlockNumber()) - txData.blockNumber + 1
          : 0,
        timestamp: txData.timestamp,
      };
    } catch (error) {
      log.error(`Error verifying ${chainType} transaction:`, error);
      throw error;
    }
  }

  /**
   * Generate QR code for payment
   */
  async generateQRCode(paymentRequest) {
    try {
      const qrData = {
        address: paymentRequest.walletAddress,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        chainType: paymentRequest.chainType,
        paymentId: paymentRequest.paymentId,
      };

      // In production, use a QR code library like 'qrcode'
      const qrCodeString = JSON.stringify(qrData);

      return {
        data: qrCodeString,
        imageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
          qrCodeString
        )}`,
      };
    } catch (error) {
      log.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Encrypt sensitive data
   */
  async encryptData(data) {
    try {
      const algorithm = 'aes-256-gcm';
      const key = crypto.scryptSync(this.securityConfig.encryptionKey, 'salt', 32);
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipher(algorithm, key);
      cipher.setAAD(Buffer.from('maya-travel-agent'));

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
      };
    } catch (error) {
      log.error('Error encrypting data:', error);
      throw error;
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decryptData(encryptedData) {
    try {
      const algorithm = 'aes-256-gcm';
      const key = crypto.scryptSync(this.securityConfig.encryptionKey, 'salt', 32);

      const decipher = crypto.createDecipher(algorithm, key);
      decipher.setAAD(Buffer.from('maya-travel-agent'));
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      log.error('Error decrypting data:', error);
      throw error;
    }
  }

  /**
   * Generate security hash for payment verification
   */
  async generateSecurityHash(paymentData) {
    try {
      const dataString = JSON.stringify(paymentData);
      const hmac = crypto.createHmac('sha256', this.securityConfig.hmacSecret);
      hmac.update(dataString);
      return hmac.digest('hex');
    } catch (error) {
      log.error('Error generating security hash:', error);
      throw error;
    }
  }

  /**
   * Validate payment data
   */
  async validatePaymentData(paymentData) {
    const { amount, currency, chainType } = paymentData;

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!currency || !this.supportedChains[chainType]) {
      throw new Error('Unsupported currency or chain type');
    }

    return true;
  }

  /**
   * Store payment request securely
   */
  async storePaymentRequest(paymentRequest) {
    try {
      // In production, store in secure database
      // For now, we'll just log it
      log.info('Payment request stored:', {
        paymentId: paymentRequest.paymentId,
        userId: paymentRequest.userId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        chainType: paymentRequest.chainType,
        status: paymentRequest.status,
      });

      return true;
    } catch (error) {
      log.error('Error storing payment request:', error);
      throw error;
    }
  }

  /**
   * Get supported cryptocurrencies
   */
  getSupportedCurrencies() {
    return Object.keys(this.supportedChains).map((chainType) => ({
      chainType,
      name: this.supportedChains[chainType].name,
      symbol: this.supportedChains[chainType].symbol,
      decimals: this.supportedChains[chainType].decimals,
      explorer: this.supportedChains[chainType].explorer,
    }));
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId) {
    try {
      // In production, retrieve from database
      log.info(`Getting payment status for: ${paymentId}`);

      return {
        paymentId,
        status: 'pending', // pending, confirmed, failed, expired
        confirmations: 0,
        txHash: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log.error('Error getting payment status:', error);
      throw error;
    }
  }
}

module.exports = CryptoPaymentManager;
