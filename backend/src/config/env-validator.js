/**
 * Environment Variable Validation
 * Validates all required environment variables on startup
 * Prevents runtime errors due to missing configuration
 * 
 * @module config/env-validator
 */

const Joi = require('joi');

/**
 * Environment variable schema
 * Add all required environment variables here
 */
const envSchema = Joi.object({
  // Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  
  // Server
  PORT: Joi.number()
    .default(5000)
    .description('Server port'),
  
  // Database
  DATABASE_URL: Joi.string()
    .uri()
    .required()
    .description('PostgreSQL connection string'),
  
  REDIS_URL: Joi.string()
    .uri()
    .optional()
    .description('Redis connection string'),
  
  // Authentication
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('JWT signing secret (minimum 32 characters)'),
  
  JWT_EXPIRES_IN: Joi.string()
    .default('7d')
    .description('JWT expiration time'),
  
  // Crypto Payment
  STRIPE_SECRET_KEY: Joi.string()
    .optional()
    .description('Stripe secret key for crypto payments'),
  
  STRIPE_WEBHOOK_SECRET: Joi.string()
    .optional()
    .description('Stripe webhook signing secret'),
  
  // Travel APIs
  AMADEUS_API_KEY: Joi.string()
    .optional()
    .description('Amadeus API key for flight/hotel data'),
  
  AMADEUS_API_SECRET: Joi.string()
    .optional()
    .description('Amadeus API secret'),
  
  // AI Services
  OPENAI_API_KEY: Joi.string()
    .optional()
    .description('OpenAI API key'),
  
  GLM_API_KEY: Joi.string()
    .optional()
    .description('GLM-4 API key for Z.AI'),
  
  // Monitoring & Logging
  SENTRY_DSN: Joi.string()
    .uri()
    .optional()
    .description('Sentry DSN for error tracking'),
  
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'trace')
    .default('info'),
  
  // Email
  SENDGRID_API_KEY: Joi.string()
    .optional()
    .description('SendGrid API key for emails'),
  
  EMAIL_FROM: Joi.string()
    .email()
    .default('noreply@amrikyy.com')
    .description('From email address'),
  
  // SMS
  TWILIO_ACCOUNT_SID: Joi.string()
    .optional()
    .description('Twilio account SID'),
  
  TWILIO_AUTH_TOKEN: Joi.string()
    .optional()
    .description('Twilio auth token'),
  
  TWILIO_PHONE_NUMBER: Joi.string()
    .optional()
    .description('Twilio phone number'),
  
  // Telegram
  TELEGRAM_BOT_TOKEN: Joi.string()
    .optional()
    .description('Telegram bot token'),
  
  // CORS
  CORS_ORIGIN: Joi.string()
    .default('http://localhost:3000')
    .description('Allowed CORS origins (comma-separated)'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number()
    .default(900000) // 15 minutes
    .description('Rate limit window in milliseconds'),
  
  RATE_LIMIT_MAX_REQUESTS: Joi.number()
    .default(100)
    .description('Max requests per window'),
  
  // File Uploads
  MAX_FILE_SIZE_MB: Joi.number()
    .default(10)
    .description('Maximum file upload size in MB'),
  
  // Session
  SESSION_SECRET: Joi.string()
    .min(32)
    .optional()
    .description('Session secret for cookie signing'),
  
  // Feature Flags
  ENABLE_SWAGGER: Joi.boolean()
    .default(false)
    .description('Enable Swagger API documentation'),
  
  ENABLE_QUANTUM_V3: Joi.boolean()
    .default(true)
    .description('Enable Quantum V3 self-healing system'),
  
  // Compliance
  KYC_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable KYC verification'),
  
  AML_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable AML checks'),
  
}).unknown(true); // Allow additional environment variables

/**
 * Validate environment variables
 * @throws {Error} If validation fails
 * @returns {Object} Validated environment configuration
 */
function validateEnv() {
  const { error, value, warning } = envSchema.validate(process.env, {
    abortEarly: false, // Report all errors
    stripUnknown: false // Keep all env vars
  });
  
  if (error) {
    const errorMessages = error.details.map(detail => {
      return `  ❌ ${detail.message}`;
    }).join('\n');
    
    console.error('\n🔴 Environment Variable Validation Failed:\n');
    console.error(errorMessages);
    console.error('\n💡 Check your .env file and ensure all required variables are set.\n');
    
    throw new Error('Environment validation failed');
  }
  
  // Log warnings if any
  if (warning) {
    console.warn('\n⚠️  Environment Variable Warnings:');
    warning.details.forEach(detail => {
      console.warn(`  ⚠️  ${detail.message}`);
    });
    console.warn('');
  }
  
  // Log validation success in development
  if (value.NODE_ENV === 'development') {
    console.log('✅ Environment variables validated successfully');
    console.log(`📝 Environment: ${value.NODE_ENV}`);
    console.log(`🚀 Server will run on port: ${value.PORT}`);
    console.log('');
  }
  
  return value;
}

/**
 * Check for missing optional but recommended variables
 * @param {Object} env - Validated environment
 * @returns {Array<string>} List of missing recommended variables
 */
function checkRecommendedVars(env) {
  const recommended = {
    production: [
      'SENTRY_DSN',
      'SENDGRID_API_KEY',
      'AMADEUS_API_KEY',
      'STRIPE_SECRET_KEY'
    ],
    development: [
      'OPENAI_API_KEY',
      'GLM_API_KEY'
    ]
  };
  
  const missing = [];
  const checkList = recommended[env.NODE_ENV] || [];
  
  checkList.forEach(varName => {
    if (!env[varName]) {
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    console.warn('\n⚠️  Missing recommended environment variables:');
    missing.forEach(varName => {
      console.warn(`  - ${varName}`);
    });
    console.warn('\nSome features may not work without these variables.\n');
  }
  
  return missing;
}

/**
 * Generate .env.example file from schema
 * Useful for documentation and onboarding
 */
function generateEnvExample() {
  const exampleLines = [
    '# Amrikyy Backend - Environment Variables',
    '# Copy this file to .env and fill in your values',
    '',
    '# Environment',
    'NODE_ENV=development',
    'PORT=5000',
    '',
    '# Database',
    'DATABASE_URL=postgresql://user:password@localhost:5432/amrikyy',
    'REDIS_URL=redis://localhost:6379',
    '',
    '# Authentication (generate with: openssl rand -base64 32)',
    'JWT_SECRET=your-secret-key-minimum-32-characters-long',
    'JWT_EXPIRES_IN=7d',
    'SESSION_SECRET=your-session-secret-minimum-32-characters',
    '',
    '# Crypto Payment',
    'STRIPE_SECRET_KEY=sk_test_...',
    'STRIPE_WEBHOOK_SECRET=whsec_...',
    '',
    '# Travel APIs',
    'AMADEUS_API_KEY=your-amadeus-api-key',
    'AMADEUS_API_SECRET=your-amadeus-secret',
    '',
    '# AI Services',
    'OPENAI_API_KEY=sk-...',
    'GLM_API_KEY=your-glm-api-key',
    '',
    '# Monitoring',
    'SENTRY_DSN=https://...@sentry.io/...',
    'LOG_LEVEL=info',
    '',
    '# Email',
    'SENDGRID_API_KEY=SG....',
    'EMAIL_FROM=noreply@amrikyy.com',
    '',
    '# SMS',
    'TWILIO_ACCOUNT_SID=AC...',
    'TWILIO_AUTH_TOKEN=...',
    'TWILIO_PHONE_NUMBER=+1234567890',
    '',
    '# Telegram',
    'TELEGRAM_BOT_TOKEN=...',
    '',
    '# CORS',
    'CORS_ORIGIN=http://localhost:3000,http://localhost:5173',
    '',
    '# Rate Limiting',
    'RATE_LIMIT_WINDOW_MS=900000',
    'RATE_LIMIT_MAX_REQUESTS=100',
    '',
    '# File Uploads',
    'MAX_FILE_SIZE_MB=10',
    '',
    '# Feature Flags',
    'ENABLE_SWAGGER=true',
    'ENABLE_QUANTUM_V3=true',
    '',
    '# Compliance',
    'KYC_ENABLED=true',
    'AML_ENABLED=true'
  ];
  
  return exampleLines.join('\n');
}

// Validate on module load
let config;
try {
  config = validateEnv();
  if (process.env.NODE_ENV !== 'test') {
    checkRecommendedVars(config);
  }
} catch (error) {
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

module.exports = {
  config,
  validateEnv,
  checkRecommendedVars,
  generateEnvExample
};

