/**
 * ============================================
 * ENVIRONMENT CONFIGURATION & VALIDATION
 * Amrikyy-Agent - Phase 1: Core Foundation
 * © 2025 Mohamed H Abdelaziz / AMRIKYY AI Solutions
 * ============================================
 * 
 * This module validates and exports environment variables.
 * The server will NOT start if required variables are missing.
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// ============================================
// REQUIRED ENVIRONMENT VARIABLES
// ============================================

const requiredEnvVars = [
  'OPENROUTER_API_KEY',
  'ZAI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'REDIS_URL',
  'JWT_SECRET',
  'PORT',
  'GEMINI_API_KEY' // For GeminiCreativeAgent
];

// ============================================
// OPTIONAL ENVIRONMENT VARIABLES WITH DEFAULTS
// ============================================

const optionalEnvVars: Record<string, string> = {
  NODE_ENV: 'development',
  AI_BUDGET_TIER: 'free',
  MAX_DAILY_COST: '10.0',
  OPENROUTER_MAX_TOKENS: '4000',
  OPENROUTER_TEMPERATURE: '0.7',
  LANGCHAIN_PROJECT: 'amrikyy-agent',
  CORS_ORIGIN: 'http://localhost:3000',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100',
  GEMINI_MODEL: 'gemini-1.5-flash' // Default Gemini model
};

// ============================================
// VALIDATION FUNCTION
// ============================================

function validateEnv(): void {
  const missing: string[] = [];
  
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error('\n🚨 ERROR: Missing required environment variables:');
    console.error('═══════════════════════════════════════════════════════');
    missing.forEach(key => console.error(`  ❌ ${key}`));
    console.error('═══════════════════════════════════════════════════════');
    console.error('\n💡 SOLUTION:');
    console.error('  1. Copy backend/env.example to backend/.env');
    console.error('  2. Fill in all required values');
    console.error('  3. Restart the server\n');
    console.error('📝 Reference file: backend/env.example\n');
    process.exit(1);
  }

  // Set defaults for optional variables
  for (const [key, defaultValue] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  }

  console.log('✅ Environment validation passed');
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
}

// Run validation immediately when this module is imported
validateEnv();

// ============================================
// TYPED CONFIGURATION EXPORT
// ============================================

export const config = {
  // AI Providers
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY!,
    maxTokens: parseInt(process.env.OPENROUTER_MAX_TOKENS!),
    temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE!),
    baseUrl: 'https://openrouter.ai/api/v1'
  },
  
  zai: {
    apiKey: process.env.ZAI_API_KEY!,
    baseUrl: process.env.ZAI_API_BASE_URL || 'https://api.z.ai/api/coding/paas/v4',
    model: process.env.ZAI_MODEL || 'glm-4.6',
  },
  
  gemini: {
    apiKey: process.env.GEMINI_API_KEY!,
    model: process.env.GEMINI_MODEL!,
  },
  
  // Database
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  // Cache & Queue
  redis: {
    url: process.env.REDIS_URL!,
    password: process.env.REDIS_PASSWORD,
  },
  
  // Server
  server: {
    port: parseInt(process.env.PORT!),
    nodeEnv: process.env.NODE_ENV!,
    corsOrigin: process.env.CORS_ORIGIN!,
  },
  
  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET!,
    encryptionKey: process.env.ENCRYPTION_KEY,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS!),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS!),
  },
  
  // AI Configuration
  ai: {
    budgetTier: process.env.AI_BUDGET_TIER as 'free' | 'budget' | 'premium',
    maxDailyCost: parseFloat(process.env.MAX_DAILY_COST!),
  },
  
  // LangSmith
  langsmith: {
    apiKey: process.env.LANGCHAIN_API_KEY,
    project: process.env.LANGCHAIN_PROJECT!,
    endpoint: process.env.LANGCHAIN_ENDPOINT || 'https://api.smith.langchain.com',
  },
  
  // Telegram
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
  },
  
  // WhatsApp
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
  },
  
  // Payment
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    }
  }
};

export default config;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if running in production
 */
export const isProduction = (): boolean => {
  return config.server.nodeEnv === 'production';
};

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => {
  return config.server.nodeEnv === 'development';
};

/**
 * Get a safe version of config for logging (without sensitive data)
 */
export const getSafeConfig = () => {
  return {
    nodeEnv: config.server.nodeEnv,
    port: config.server.port,
    aiProvider: 'ZAI GLM-4.6',
    budgetTier: config.ai.budgetTier,
    redis: {
      connected: !!config.redis.url,
      hasPassword: !!config.redis.password
    },
    supabase: {
      connected: !!config.supabase.url
    },
    integrations: {
      telegram: !!config.telegram.botToken,
      whatsapp: !!config.whatsapp.accessToken,
      stripe: !!config.payment.stripe.secretKey,
      paypal: !!config.payment.paypal.clientId
    }
  };
};
