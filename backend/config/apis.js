/**
 * API Configuration
 * Centralized configuration for all external APIs
 */

module.exports = {
  // Kiwi Tequila (Flights)
  kiwi: {
    apiKey: process.env.KIWI_API_KEY,
    baseURL: 'https://api.tequila.kiwi.com',
    enabled: !!process.env.KIWI_API_KEY,
    rateLimit: {
      requestsPerMinute: 10,
      requestsPerHour: 100
    }
  },

  // Booking.com (Hotels)
  bookingCom: {
    affiliateId: process.env.BOOKING_COM_AFFILIATE_ID,
    apiKey: process.env.BOOKING_COM_API_KEY,
    baseURL: 'https://distribution-xml.booking.com/2.7/json',
    enabled: !!process.env.BOOKING_COM_AFFILIATE_ID,
    rateLimit: {
      requestsPerMinute: 10,
      requestsPerHour: 100
    }
  },

  // Mapbox (Maps & Geocoding)
  mapbox: {
    accessToken: process.env.MAPBOX_ACCESS_TOKEN,
    baseURL: 'https://api.mapbox.com',
    enabled: !!process.env.MAPBOX_ACCESS_TOKEN,
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1000
    }
  },

  // Gemini AI (Google)
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    proModel: process.env.GEMINI_PRO_MODEL || 'gemini-2.5-pro',
    enabled: !!process.env.GEMINI_API_KEY,
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1500
    }
  },

  // Stripe (Payments)
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    enabled: !!process.env.STRIPE_SECRET_KEY
  },

  // Supabase (Database)
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    enabled: !!process.env.SUPABASE_URL
  },

  // Telegram
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    webhookURL: process.env.TELEGRAM_WEBHOOK_URL,
    enabled: !!process.env.TELEGRAM_BOT_TOKEN
  }
};
