/**
 * 🔒 Environment Configuration with Validation
 * Centralized environment variable management with strict validation
 * Part of Amrikyy-Agent Phase 1: Security Foundation
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
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'REDIS_URL',
  'PORT',
  'JWT_SECRET',
  'NODE_ENV'
];

// ============================================
// OPTIONAL ENVIRONMENT VARIABLES (warnings only)
// ============================================
const optionalEnvVars = [
  'KIWI_API_KEY',
  'BOOKING_COM_API_KEY',
  'GEMINI_API_KEY',
  'KELO_API_KEY',
  'TELEGRAM_BOT_TOKEN',
  'WHATSAPP_ACCESS_TOKEN',
  'STRIPE_SECRET_KEY',
  'LANGCHAIN_API_KEY'
];

/**
 * Validate required environment variables
 * Exits process if any required variables are missing
 */
export function validateRequiredEnv(): void {
  const missing: string[] = [];
  
  requiredEnvVars.forEach(key => {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error('');
    console.error('🚨 ═══════════════════════════════════════════════════════');
    console.error('🚨 CRITICAL ERROR: Missing Required Environment Variables');
    console.error('🚨 ═══════════════════════════════════════════════════════');
    console.error('');
    console.error('Missing variables:');
    missing.forEach(key => console.error(`  ❌ ${key}`));
    console.error('');
    console.error('📝 To fix this:');
    console.error('   1. Copy .env.example to .env');
    console.error('   2. Fill in all required values');
    console.error('   3. Restart the server');
    console.error('');
    console.error('   Command: cp backend/.env.example backend/.env');
    console.error('');
    console.error('🚨 ═══════════════════════════════════════════════════════');
    console.error('');
    process.exit(1);
  }
}

/**
 * Check optional environment variables and warn if missing
 */
export function checkOptionalEnv(): void {
  const missing: string[] = [];
  
  optionalEnvVars.forEach(key => {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.warn('');
    console.warn('⚠️  Warning: Some optional features may not work:');
    missing.forEach(key => console.warn(`   - ${key} not configured`));
    console.warn('');
  }
}

/**
 * Validated configuration object
 * All required fields are guaranteed to be present after validation
 */
export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // AI Providers
  openRouterKey: process.env.OPENROUTER_API_KEY!,
  keloApiKey: process.env.KELO_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  moonshotApiKey: process.env.MOONSHOT_API_KEY,
  zaiApiKey: process.env.ZAI_API_KEY,
  
  // Database
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Cache & Memory
  redisUrl: process.env.REDIS_URL!,
  
  // Security
  jwtSecret: process.env.JWT_SECRET!,
  encryptionKey: process.env.ENCRYPTION_KEY,
  
  // External Travel APIs
  kiwiApiKey: process.env.KIWI_API_KEY,
  bookingComApiKey: process.env.BOOKING_COM_API_KEY,
  bookingComAffiliateId: process.env.BOOKING_COM_AFFILIATE_ID,
  mapboxApiKey: process.env.MAPBOX_API_KEY,
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  
  // Messaging & Bots
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  
  // Payment Providers
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  paypalClientId: process.env.PAYPAL_CLIENT_ID,
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
  
  // Monitoring & Tracing
  langsmithApiKey: process.env.LANGCHAIN_API_KEY,
  sentryDsn: process.env.SENTRY_DSN,
  
  // Features Configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
} as const;

// Run validation on import
validateRequiredEnv();
checkOptionalEnv();

console.log('✅ Environment configuration loaded successfully');
console.log(`📊 Environment: ${config.nodeEnv}`);
console.log(`🚀 Server will run on port: ${config.port}`);
