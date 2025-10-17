/**
 * Environment Variable Security Validator
 * CRITICAL: Validates all required environment variables on startup
 */

const requiredEnvVars = {
  // Database Configuration
  SUPABASE_URL: {
    required: true,
    pattern: /^https:\/\/[a-z0-9-]+\.supabase\.co$/,
    description: 'Supabase project URL',
  },
  SUPABASE_ANON_KEY: {
    required: true,
    pattern: /^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
    description: 'Supabase anonymous key',
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    required: true,
    pattern: /^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
    description: 'Supabase service role key',
  },

  // AI API Keys
  GEMINI_API_KEY: {
    required: true,
    pattern: /^AIza[0-9A-Za-z_-]{35}$/,
    description: 'Google Gemini API key',
  },
  ZAI_API_KEY: {
    required: true,
    pattern: /^[a-f0-9]{32}\.[A-Za-z0-9_-]+$/,
    description: 'Z.ai GLM-4.6 API key',
  },
  OPENROUTER_API_KEY: {
    required: true,
    pattern: /^sk-or-v1-[a-f0-9]{64}$/,
    description: 'OpenRouter API key',
  },

  // Telegram Configuration
  TELEGRAM_BOT_TOKEN: {
    required: true,
    pattern: /^[0-9]+:[A-Za-z0-9_-]{35}$/,
    description: 'Telegram bot token',
  },

  // Payment Processing
  STRIPE_SECRET_KEY: {
    required: true,
    pattern: /^sk_(test_|live_)[a-zA-Z0-9]{24}$/,
    description: 'Stripe secret key',
  },

  // Server Configuration
  JWT_SECRET: {
    required: true,
    minLength: 32,
    description: 'JWT signing secret',
  },
  NODE_ENV: {
    required: true,
    allowedValues: ['development', 'staging', 'production'],
    description: 'Node environment',
  },
};

class EnvironmentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate all environment variables
   */
  validate() {
    console.log('🔍 Starting environment validation...');

    for (const [varName, config] of Object.entries(requiredEnvVars)) {
      this.validateVariable(varName, config);
    }

    if (this.errors.length > 0) {
      console.error('❌ Environment validation failed:');
      this.errors.forEach((error) => console.error(`  - ${error}`));
      throw new Error(`Environment validation failed: ${this.errors.length} errors`);
    }

    if (this.warnings.length > 0) {
      console.warn('⚠️ Environment validation warnings:');
      this.warnings.forEach((warning) => console.warn(`  - ${warning}`));
    }

    console.log('✅ Environment validation passed');
    return true;
  }

  /**
   * Validate individual environment variable
   */
  validateVariable(varName, config) {
    const value = process.env[varName];

    // Check if required variable exists
    if (config.required && !value) {
      this.errors.push(`Missing required environment variable: ${varName} (${config.description})`);
      return;
    }

    if (!value) return; // Skip validation for optional variables

    // Check pattern match
    if (config.pattern && !config.pattern.test(value)) {
      this.errors.push(`Invalid format for ${varName}: ${config.description}`);
      return;
    }

    // Check allowed values
    if (config.allowedValues && !config.allowedValues.includes(value)) {
      this.errors.push(
        `Invalid value for ${varName}: must be one of [${config.allowedValues.join(', ')}]`
      );
      return;
    }

    // Check minimum length
    if (config.minLength && value.length < config.minLength) {
      this.errors.push(
        `Invalid length for ${varName}: must be at least ${config.minLength} characters`
      );
      return;
    }

    // Security checks
    this.performSecurityChecks(varName, value);
  }

  /**
   * Perform security-specific checks
   */
  performSecurityChecks(varName, value) {
    // Check for placeholder values
    if (value.includes('your_') || value.includes('placeholder')) {
      this.warnings.push(`Potential placeholder value detected in ${varName}`);
    }

    // Check for development keys in production
    if (process.env.NODE_ENV === 'production') {
      if (varName.includes('API_KEY') && value.includes('test_')) {
        this.warnings.push(`Test API key detected in production for ${varName}`);
      }
    }

    // Log key access for security monitoring
    console.log(`🔑 Environment variable loaded: ${varName}`);
  }

  /**
   * Get validation summary
   */
  getSummary() {
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      totalVariables: Object.keys(requiredEnvVars).length,
    };
  }
}

// Export singleton instance
const envValidator = new EnvironmentValidator();

module.exports = {
  EnvironmentValidator,
  envValidator,
  validateEnvironment: () => envValidator.validate(),
  getValidationSummary: () => envValidator.getSummary(),
};
