/**
 * Environment Configuration Fix
 * Configures missing API keys and environment variables
 * Provides fallback configurations and validation
 */

const fs = require('fs').promises;
const path = require('path');
const winston = require('winston');

class EnvironmentConfigFix {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'backend/logs/env-config-fix.log' }),
        new winston.transports.Console()
      ]
    });

    this.requiredKeys = {
      telegram: ['TELEGRAM_BOT_TOKEN'],
      weather: ['WEATHER_API_KEY', 'OPENWEATHER_API_KEY'],
      currency: ['EXCHANGERATE_API_KEY'],
      amadeus: ['AMADEUS_CLIENT_ID', 'AMADEUS_CLIENT_SECRET'],
      supabase: ['SUPABASE_URL', 'SUPABASE_ANON_KEY'],
      zai: ['ZAI_API_KEY', 'ZAI_API_URL']
    };

    this.fallbackConfigs = {
      telegram: {
        TELEGRAM_BOT_TOKEN: 'demo_token_for_testing'
      },
      weather: {
        WEATHER_API_KEY: 'demo_weather_key',
        OPENWEATHER_API_KEY: 'demo_openweather_key'
      },
      currency: {
        EXCHANGERATE_API_KEY: 'demo_currency_key'
      },
      amadeus: {
        AMADEUS_CLIENT_ID: 'demo_amadeus_id',
        AMADEUS_CLIENT_SECRET: 'demo_amadeus_secret'
      },
      supabase: {
        SUPABASE_URL: 'https://demo.supabase.co',
        SUPABASE_ANON_KEY: 'demo_anon_key'
      },
      zai: {
        ZAI_API_KEY: 'demo_zai_key',
        ZAI_API_URL: 'https://api.z.ai/v1'
      }
    };
  }

  /**
   * Check and validate environment variables
   */
  async validateEnvironment() {
    const results = {
      valid: {},
      missing: {},
      invalid: {},
      recommendations: []
    };

    for (const [service, keys] of Object.entries(this.requiredKeys)) {
      results.valid[service] = [];
      results.missing[service] = [];
      results.invalid[service] = [];

      for (const key of keys) {
        const value = process.env[key];
        
        if (!value) {
          results.missing[service].push(key);
          results.recommendations.push(`Set ${key} in your .env file`);
        } else if (this.isValidKey(key, value)) {
          results.valid[service].push(key);
        } else {
          results.invalid[service].push(key);
          results.recommendations.push(`Invalid format for ${key}`);
        }
      }
    }

    return results;
  }

  /**
   * Validate API key format
   */
  isValidKey(key, value) {
    // Basic validation patterns
    const patterns = {
      TELEGRAM_BOT_TOKEN: /^\d+:[A-Za-z0-9_-]+$/,
      WEATHER_API_KEY: /^[A-Za-z0-9]{32}$/,
      OPENWEATHER_API_KEY: /^[A-Za-z0-9]{32}$/,
      EXCHANGERATE_API_KEY: /^[A-Za-z0-9]{32}$/,
      AMADEUS_CLIENT_ID: /^[A-Za-z0-9]{32}$/,
      AMADEUS_CLIENT_SECRET: /^[A-Za-z0-9]{64}$/,
      SUPABASE_URL: /^https:\/\/[a-z0-9-]+\.supabase\.co$/,
      SUPABASE_ANON_KEY: /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
      ZAI_API_KEY: /^[A-Za-z0-9]{32}$/,
      ZAI_API_URL: /^https:\/\/api\.z\.ai\/v\d+$/
    };

    const pattern = patterns[key];
    if (!pattern) {
      return value.length > 0; // Basic non-empty check
    }

    return pattern.test(value);
  }

  /**
   * Create fallback environment file
   */
  async createFallbackEnv() {
    const envPath = path.join(process.cwd(), '.env.fallback');
    const envContent = [];

    envContent.push('# Fallback Environment Configuration');
    envContent.push('# This file contains demo/fallback values for testing');
    envContent.push('# Replace with real API keys for production use');
    envContent.push('');

    for (const [service, config] of Object.entries(this.fallbackConfigs)) {
      envContent.push(`# ${service.toUpperCase()} Configuration`);
      for (const [key, value] of Object.entries(config)) {
        envContent.push(`${key}=${value}`);
      }
      envContent.push('');
    }

    envContent.push('# Development Settings');
    envContent.push('NODE_ENV=development');
    envContent.push('PORT=5000');
    envContent.push('LOG_LEVEL=info');
    envContent.push('');

    envContent.push('# Feature Flags');
    envContent.push('ENABLE_MOCK_SERVICES=true');
    envContent.push('ENABLE_FALLBACK_APIS=true');
    envContent.push('ENABLE_DEVELOPMENT_RATE_LIMITS=true');

    try {
      await fs.writeFile(envPath, envContent.join('\n'));
      this.logger.info('✅ Fallback environment file created', { path: envPath });
      return envPath;
    } catch (error) {
      this.logger.error('❌ Failed to create fallback environment file', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Load fallback configuration
   */
  loadFallbackConfig() {
    const config = {};

    for (const [service, serviceConfig] of Object.entries(this.fallbackConfigs)) {
      for (const [key, value] of Object.entries(serviceConfig)) {
        if (!process.env[key]) {
          process.env[key] = value;
          config[key] = value;
        }
      }
    }

    this.logger.info('✅ Fallback configuration loaded', {
      keysLoaded: Object.keys(config).length
    });

    return config;
  }

  /**
   * Create environment template
   */
  async createEnvTemplate() {
    const templatePath = path.join(process.cwd(), '.env.template');
    const templateContent = [];

    templateContent.push('# Maya Travel Agent Environment Configuration');
    templateContent.push('# Copy this file to .env and fill in your actual API keys');
    templateContent.push('');

    for (const [service, keys] of Object.entries(this.requiredKeys)) {
      templateContent.push(`# ${service.toUpperCase()} Configuration`);
      for (const key of keys) {
        const description = this.getKeyDescription(key);
        templateContent.push(`# ${description}`);
        templateContent.push(`${key}=your_${key.toLowerCase()}_here`);
        templateContent.push('');
      }
    }

    templateContent.push('# Development Settings');
    templateContent.push('NODE_ENV=development');
    templateContent.push('PORT=5000');
    templateContent.push('LOG_LEVEL=info');
    templateContent.push('');

    templateContent.push('# Feature Flags');
    templateContent.push('ENABLE_MOCK_SERVICES=false');
    templateContent.push('ENABLE_FALLBACK_APIS=false');
    templateContent.push('ENABLE_DEVELOPMENT_RATE_LIMITS=false');

    try {
      await fs.writeFile(templatePath, templateContent.join('\n'));
      this.logger.info('✅ Environment template created', { path: templatePath });
      return templatePath;
    } catch (error) {
      this.logger.error('❌ Failed to create environment template', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get key description
   */
  getKeyDescription(key) {
    const descriptions = {
      TELEGRAM_BOT_TOKEN: 'Telegram Bot Token from @BotFather',
      WEATHER_API_KEY: 'Weather API key from weather service provider',
      OPENWEATHER_API_KEY: 'OpenWeatherMap API key',
      EXCHANGERATE_API_KEY: 'ExchangeRate API key for currency conversion',
      AMADEUS_CLIENT_ID: 'Amadeus Self-Service API Client ID',
      AMADEUS_CLIENT_SECRET: 'Amadeus Self-Service API Client Secret',
      SUPABASE_URL: 'Supabase project URL',
      SUPABASE_ANON_KEY: 'Supabase anonymous key',
      ZAI_API_KEY: 'Z.ai API key for LLM integration',
      ZAI_API_URL: 'Z.ai API endpoint URL'
    };

    return descriptions[key] || `${key} configuration value`;
  }

  /**
   * Setup mock services configuration
   */
  setupMockServices() {
    const mockConfig = {
      telegram: {
        enabled: process.env.ENABLE_MOCK_SERVICES === 'true' || !process.env.TELEGRAM_BOT_TOKEN,
        mockResponses: true
      },
      weather: {
        enabled: process.env.ENABLE_MOCK_SERVICES === 'true' || !process.env.WEATHER_API_KEY,
        fallbackData: {
          temperature: 25,
          condition: 'Sunny',
          humidity: 60
        }
      },
      currency: {
        enabled: process.env.ENABLE_MOCK_SERVICES === 'true' || !process.env.EXCHANGERATE_API_KEY,
        mockRates: {
          'USD-EUR': 0.85,
          'EUR-USD': 1.18,
          'USD-GBP': 0.73,
          'GBP-USD': 1.37
        }
      }
    };

    this.logger.info('✅ Mock services configuration created', {
      services: Object.keys(mockConfig)
    });

    return mockConfig;
  }

  /**
   * Validate API connectivity
   */
  async validateApiConnectivity() {
    const results = {
      telegram: { status: 'unknown', error: null },
      weather: { status: 'unknown', error: null },
      currency: { status: 'unknown', error: null },
      amadeus: { status: 'unknown', error: null },
      supabase: { status: 'unknown', error: null },
      zai: { status: 'unknown', error: null }
    };

    // Test Telegram API
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'demo_token_for_testing') {
      try {
        const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`);
        if (response.ok) {
          results.telegram.status = 'connected';
        } else {
          results.telegram.status = 'error';
          results.telegram.error = 'Invalid token';
        }
      } catch (error) {
        results.telegram.status = 'error';
        results.telegram.error = error.message;
      }
    } else {
      results.telegram.status = 'mock';
    }

    // Test Currency API
    if (process.env.EXCHANGERATE_API_KEY && process.env.EXCHANGERATE_API_KEY !== 'demo_currency_key') {
      try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
        if (response.ok) {
          results.currency.status = 'connected';
        } else {
          results.currency.status = 'error';
          results.currency.error = 'API error';
        }
      } catch (error) {
        results.currency.status = 'error';
        results.currency.error = error.message;
      }
    } else {
      results.currency.status = 'mock';
    }

    // Test Z.ai API
    if (process.env.ZAI_API_KEY && process.env.ZAI_API_KEY !== 'demo_zai_key') {
      try {
        const response = await fetch(`${process.env.ZAI_API_URL}/health`, {
          headers: {
            'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
          }
        });
        if (response.ok) {
          results.zai.status = 'connected';
        } else {
          results.zai.status = 'error';
          results.zai.error = 'Invalid API key';
        }
      } catch (error) {
        results.zai.status = 'error';
        results.zai.error = error.message;
      }
    } else {
      results.zai.status = 'mock';
    }

    this.logger.info('✅ API connectivity validation completed', results);
    return results;
  }

  /**
   * Get configuration status
   */
  getConfigurationStatus() {
    const status = {
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000,
      services: {},
      recommendations: []
    };

    for (const [service, keys] of Object.entries(this.requiredKeys)) {
      status.services[service] = {
        configured: keys.every(key => process.env[key] && process.env[key] !== this.fallbackConfigs[service]?.[key]),
        keys: keys.map(key => ({
          name: key,
          configured: !!process.env[key],
          isFallback: process.env[key] === this.fallbackConfigs[service]?.[key]
        }))
      };

      if (!status.services[service].configured) {
        status.recommendations.push(`Configure ${service} API keys for production use`);
      }
    }

    return status;
  }

  /**
   * Initialize environment configuration
   */
  async initialize() {
    try {
      this.logger.info('🔧 Initializing Environment Configuration Fix...');

      // Validate current environment
      const validation = await this.validateEnvironment();
      this.logger.info('Environment validation completed', {
        valid: Object.keys(validation.valid).length,
        missing: Object.keys(validation.missing).length,
        recommendations: validation.recommendations.length
      });

      // Load fallback configuration if needed
      const fallbackConfig = this.loadFallbackConfig();

      // Setup mock services
      const mockConfig = this.setupMockServices();

      // Create environment template
      await this.createEnvTemplate();

      // Create fallback environment file
      await this.createFallbackEnv();

      // Validate API connectivity
      const connectivity = await this.validateApiConnectivity();

      this.logger.info('✅ Environment Configuration Fix initialized successfully');

      return {
        validation,
        fallbackConfig,
        mockConfig,
        connectivity,
        status: this.getConfigurationStatus()
      };

    } catch (error) {
      this.logger.error('❌ Failed to initialize Environment Configuration Fix', {
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = EnvironmentConfigFix;
