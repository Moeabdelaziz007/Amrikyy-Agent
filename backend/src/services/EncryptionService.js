/**
 * EncryptionService.js
 * 
 * Secure encryption/decryption service using AES-256-GCM
 * Handles API keys, tokens, and sensitive credentials
 * 
 * Features:
 * - AES-256-GCM encryption (authenticated encryption)
 * - Secure key derivation (PBKDF2)
 * - Random IV generation for each encryption
 * - Base64 encoding for storage
 * - Key rotation support
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @date October 22, 2025
 */

const crypto = require('crypto');

class EncryptionService {
  constructor() {
    // Get master key from environment
    this.masterKey = process.env.ENCRYPTION_KEY || this.generateMasterKey();
    
    // Encryption algorithm
    this.algorithm = 'aes-256-gcm';
    
    // Key derivation settings
    this.saltLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
    this.keyLength = 32;
    this.iterations = 100000;
    
    // Validate master key
    if (!this.masterKey || this.masterKey.length < 32) {
      console.warn('⚠️ ENCRYPTION_KEY not set or too short. Using generated key.');
      console.warn('⚠️ Set ENCRYPTION_KEY in .env for production!');
    }
  }

  /**
   * Generate a secure master key
   */
  generateMasterKey() {
    return crypto.randomBytes(32).toString('base64');
  }

  /**
   * Derive encryption key from master key using PBKDF2
   */
  deriveKey(salt) {
    return crypto.pbkdf2Sync(
      this.masterKey,
      salt,
      this.iterations,
      this.keyLength,
      'sha256'
    );
  }

  /**
   * Encrypt data using AES-256-GCM
   * 
   * @param {string} plaintext - Data to encrypt
   * @returns {string} Encrypted data (base64)
   */
  encrypt(plaintext) {
    try {
      // Generate random salt and IV
      const salt = crypto.randomBytes(this.saltLength);
      const iv = crypto.randomBytes(this.ivLength);
      
      // Derive key from master key
      const key = this.deriveKey(salt);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      // Encrypt data
      let encrypted = cipher.update(plaintext, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      // Get authentication tag
      const tag = cipher.getAuthTag();
      
      // Combine salt + iv + tag + encrypted data
      const combined = Buffer.concat([
        salt,
        iv,
        tag,
        Buffer.from(encrypted, 'base64')
      ]);
      
      // Return as base64
      return combined.toString('base64');
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   * 
   * @param {string} encryptedData - Encrypted data (base64)
   * @returns {string} Decrypted plaintext
   */
  decrypt(encryptedData) {
    try {
      // Convert from base64
      const combined = Buffer.from(encryptedData, 'base64');
      
      // Extract components
      const salt = combined.slice(0, this.saltLength);
      const iv = combined.slice(this.saltLength, this.saltLength + this.ivLength);
      const tag = combined.slice(
        this.saltLength + this.ivLength,
        this.saltLength + this.ivLength + this.tagLength
      );
      const encrypted = combined.slice(this.saltLength + this.ivLength + this.tagLength);
      
      // Derive key from master key
      const key = this.deriveKey(salt);
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(tag);
      
      // Decrypt data
      let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt an object (converts to JSON first)
   */
  encryptObject(obj) {
    const json = JSON.stringify(obj);
    return this.encrypt(json);
  }

  /**
   * Decrypt to an object (parses JSON)
   */
  decryptObject(encryptedData) {
    const json = this.decrypt(encryptedData);
    return JSON.parse(json);
  }

  /**
   * Hash data using SHA-256 (one-way)
   */
  hash(data) {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  /**
   * Generate a secure random token
   */
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure API key
   */
  generateApiKey() {
    const prefix = 'amk'; // Amrikyy key
    const random = crypto.randomBytes(32).toString('base64url');
    return `${prefix}_${random}`;
  }

  /**
   * Encrypt API key for storage
   */
  encryptApiKey(apiKey, provider) {
    const data = {
      key: apiKey,
      provider,
      createdAt: new Date().toISOString()
    };
    return this.encryptObject(data);
  }

  /**
   * Decrypt API key from storage
   */
  decryptApiKey(encryptedKey) {
    const data = this.decryptObject(encryptedKey);
    return data.key;
  }

  /**
   * Validate encrypted data format
   */
  isValidEncryptedData(data) {
    try {
      const buffer = Buffer.from(data, 'base64');
      const minLength = this.saltLength + this.ivLength + this.tagLength + 1;
      return buffer.length >= minLength;
    } catch {
      return false;
    }
  }

  /**
   * Rotate encryption key (re-encrypt with new key)
   */
  rotateKey(encryptedData, newMasterKey) {
    // Decrypt with old key
    const plaintext = this.decrypt(encryptedData);
    
    // Temporarily switch to new key
    const oldKey = this.masterKey;
    this.masterKey = newMasterKey;
    
    // Encrypt with new key
    const newEncrypted = this.encrypt(plaintext);
    
    // Restore old key
    this.masterKey = oldKey;
    
    return newEncrypted;
  }

  /**
   * Secure compare (timing-safe)
   */
  secureCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(
      Buffer.from(a),
      Buffer.from(b)
    );
  }

  /**
   * Generate encryption key for new installation
   */
  static generateNewMasterKey() {
    const key = crypto.randomBytes(32).toString('base64');
    console.log('\n🔐 Generated new encryption master key:');
    console.log(`ENCRYPTION_KEY=${key}`);
    console.log('\n⚠️ Add this to your .env file!');
    console.log('⚠️ Keep this key secure - losing it means losing encrypted data!\n');
    return key;
  }

  /**
   * Get encryption info (for debugging)
   */
  getInfo() {
    return {
      algorithm: this.algorithm,
      keyLength: this.keyLength,
      saltLength: this.saltLength,
      ivLength: this.ivLength,
      tagLength: this.tagLength,
      iterations: this.iterations,
      masterKeySet: !!this.masterKey && this.masterKey.length >= 32
    };
  }
}

// Export singleton instance
module.exports = new EncryptionService();

// Export class for testing
module.exports.EncryptionService = EncryptionService;
