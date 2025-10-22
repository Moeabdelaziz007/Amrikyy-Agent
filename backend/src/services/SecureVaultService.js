/**
 * SecureVaultService.js
 * 
 * Secure vault for storing encrypted API keys and credentials
 * Supports multiple providers: Coinbase, Sabre, Stripe, etc.
 * 
 * Features:
 * - Encrypted storage of API keys
 * - Provider-specific credential management
 * - Automatic encryption/decryption
 * - Key rotation support
 * - Audit logging
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @date October 22, 2025
 */

const encryptionService = require('./EncryptionService');
const { createClient } = require('@supabase/supabase-js');

class SecureVaultService {
  constructor() {
    // Check if Supabase is configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      this.enabled = true;
    } else {
      console.warn('⚠️ Supabase not configured. Secure vault will use environment variables only.');
      this.supabase = null;
      this.enabled = false;
    }
    
    // In-memory cache for frequently accessed keys
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Store encrypted credential
   * 
   * @param {string} provider - Provider name (coinbase, sabre, stripe, etc.)
   * @param {string} keyName - Key identifier (api_key, secret_key, etc.)
   * @param {string} value - Credential value
   * @param {object} metadata - Additional metadata
   */
  async storeCredential(provider, keyName, value, metadata = {}) {
    if (!this.enabled) {
      throw new Error('Secure vault not enabled. Configure Supabase credentials.');
    }
    
    try {
      // Encrypt the credential
      const encrypted = encryptionService.encrypt(value);
      
      // Store in database
      const { data, error } = await this.supabase
        .from('secure_vault')
        .upsert({
          provider,
          key_name: keyName,
          encrypted_value: encrypted,
          metadata: {
            ...metadata,
            updatedAt: new Date().toISOString()
          }
        }, {
          onConflict: 'provider,key_name'
        })
        .select()
        .single();

      if (error) throw error;

      // Clear cache for this key
      this.clearCache(provider, keyName);

      console.log(`✅ Stored credential: ${provider}.${keyName}`);
      return data;
    } catch (error) {
      console.error('Failed to store credential:', error);
      throw new Error(`Failed to store credential: ${error.message}`);
    }
  }

  /**
   * Retrieve and decrypt credential
   * 
   * @param {string} provider - Provider name
   * @param {string} keyName - Key identifier
   * @returns {string} Decrypted credential
   */
  async getCredential(provider, keyName) {
    if (!this.enabled) {
      throw new Error('Secure vault not enabled. Configure Supabase credentials.');
    }
    
    try {
      // Check cache first
      const cacheKey = `${provider}.${keyName}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.value;
      }

      // Fetch from database
      const { data, error } = await this.supabase
        .from('secure_vault')
        .select('encrypted_value')
        .eq('provider', provider)
        .eq('key_name', keyName)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Credential not found');

      // Decrypt
      const decrypted = encryptionService.decrypt(data.encrypted_value);

      // Cache the decrypted value
      this.cache.set(cacheKey, {
        value: decrypted,
        timestamp: Date.now()
      });

      return decrypted;
    } catch (error) {
      console.error('Failed to retrieve credential:', error);
      throw new Error(`Failed to retrieve credential: ${error.message}`);
    }
  }

  /**
   * Delete credential
   */
  async deleteCredential(provider, keyName) {
    try {
      const { error } = await this.supabase
        .from('secure_vault')
        .delete()
        .eq('provider', provider)
        .eq('key_name', keyName);

      if (error) throw error;

      this.clearCache(provider, keyName);
      console.log(`✅ Deleted credential: ${provider}.${keyName}`);
    } catch (error) {
      console.error('Failed to delete credential:', error);
      throw new Error(`Failed to delete credential: ${error.message}`);
    }
  }

  /**
   * List all credentials for a provider
   */
  async listCredentials(provider) {
    try {
      const { data, error } = await this.supabase
        .from('secure_vault')
        .select('key_name, metadata, created_at, updated_at')
        .eq('provider', provider);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to list credentials:', error);
      throw new Error(`Failed to list credentials: ${error.message}`);
    }
  }

  /**
   * Store Coinbase credentials
   */
  async storeCoinbaseCredentials(apiKey, webhookSecret) {
    await this.storeCredential('coinbase', 'api_key', apiKey, {
      type: 'commerce',
      description: 'Coinbase Commerce API Key'
    });
    
    if (webhookSecret) {
      await this.storeCredential('coinbase', 'webhook_secret', webhookSecret, {
        type: 'webhook',
        description: 'Coinbase Webhook Secret'
      });
    }
  }

  /**
   * Get Coinbase credentials
   */
  async getCoinbaseCredentials() {
    const apiKey = await this.getCredential('coinbase', 'api_key');
    const webhookSecret = await this.getCredential('coinbase', 'webhook_secret').catch(() => null);
    
    return { apiKey, webhookSecret };
  }

  /**
   * Store Sabre API credentials
   */
  async storeSabreCredentials(clientId, clientSecret, pcc) {
    await this.storeCredential('sabre', 'client_id', clientId, {
      type: 'authentication',
      description: 'Sabre API Client ID'
    });
    
    await this.storeCredential('sabre', 'client_secret', clientSecret, {
      type: 'authentication',
      description: 'Sabre API Client Secret'
    });
    
    if (pcc) {
      await this.storeCredential('sabre', 'pcc', pcc, {
        type: 'configuration',
        description: 'Sabre PCC (Pseudo City Code)'
      });
    }
  }

  /**
   * Get Sabre credentials
   */
  async getSabreCredentials() {
    const clientId = await this.getCredential('sabre', 'client_id');
    const clientSecret = await this.getCredential('sabre', 'client_secret');
    const pcc = await this.getCredential('sabre', 'pcc').catch(() => null);
    
    return { clientId, clientSecret, pcc };
  }

  /**
   * Store Stripe credentials
   */
  async storeStripeCredentials(secretKey, publishableKey, webhookSecret) {
    await this.storeCredential('stripe', 'secret_key', secretKey, {
      type: 'authentication',
      description: 'Stripe Secret Key'
    });
    
    await this.storeCredential('stripe', 'publishable_key', publishableKey, {
      type: 'public',
      description: 'Stripe Publishable Key'
    });
    
    if (webhookSecret) {
      await this.storeCredential('stripe', 'webhook_secret', webhookSecret, {
        type: 'webhook',
        description: 'Stripe Webhook Secret'
      });
    }
  }

  /**
   * Get Stripe credentials
   */
  async getStripeCredentials() {
    const secretKey = await this.getCredential('stripe', 'secret_key');
    const publishableKey = await this.getCredential('stripe', 'publishable_key');
    const webhookSecret = await this.getCredential('stripe', 'webhook_secret').catch(() => null);
    
    return { secretKey, publishableKey, webhookSecret };
  }

  /**
   * Store Gemini API key
   */
  async storeGeminiKey(apiKey) {
    await this.storeCredential('gemini', 'api_key', apiKey, {
      type: 'ai',
      description: 'Google Gemini API Key'
    });
  }

  /**
   * Get Gemini API key
   */
  async getGeminiKey() {
    return await this.getCredential('gemini', 'api_key');
  }

  /**
   * Clear cache for specific credential
   */
  clearCache(provider, keyName) {
    const cacheKey = `${provider}.${keyName}`;
    this.cache.delete(cacheKey);
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cache.clear();
  }

  /**
   * Rotate encryption key for all credentials
   */
  async rotateEncryptionKey(newMasterKey) {
    try {
      // Get all credentials
      const { data, error } = await this.supabase
        .from('secure_vault')
        .select('*');

      if (error) throw error;

      console.log(`🔄 Rotating encryption key for ${data.length} credentials...`);

      // Re-encrypt each credential
      for (const credential of data) {
        const newEncrypted = encryptionService.rotateKey(
          credential.encrypted_value,
          newMasterKey
        );

        await this.supabase
          .from('secure_vault')
          .update({ encrypted_value: newEncrypted })
          .eq('id', credential.id);
      }

      // Clear cache
      this.clearAllCache();

      console.log('✅ Encryption key rotation complete');
    } catch (error) {
      console.error('Failed to rotate encryption key:', error);
      throw new Error(`Failed to rotate encryption key: ${error.message}`);
    }
  }

  /**
   * Initialize vault (create table if not exists)
   */
  async initialize() {
    try {
      // Check if table exists
      const { error } = await this.supabase
        .from('secure_vault')
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') {
        console.log('📦 Creating secure_vault table...');
        
        // Create table using SQL
        const { error: createError } = await this.supabase.rpc('create_secure_vault_table');
        
        if (createError) {
          console.warn('⚠️ Could not create table automatically. Please run migration manually.');
        } else {
          console.log('✅ Secure vault table created');
        }
      }
    } catch (error) {
      console.error('Failed to initialize vault:', error);
    }
  }

  /**
   * Get vault statistics
   */
  async getStats() {
    try {
      const { data, error } = await this.supabase
        .from('secure_vault')
        .select('provider');

      if (error) throw error;

      const stats = data.reduce((acc, item) => {
        acc[item.provider] = (acc[item.provider] || 0) + 1;
        return acc;
      }, {});

      return {
        total: data.length,
        byProvider: stats,
        cacheSize: this.cache.size
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return { total: 0, byProvider: {}, cacheSize: 0 };
    }
  }
}

// Export singleton instance
module.exports = new SecureVaultService();

// Export class for testing
module.exports.SecureVaultService = SecureVaultService;
