/**
 * Production Configuration
 *
 * This configuration is used when the application is running in a production environment
 * (i.e., when `NODE_ENV` is set to 'production'). It should contain settings that are
 * optimized for performance, security, and stability.
 */

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 8080,
    host: process.env.HOST || '0.0.0.0',
  },

  // Database configuration
  database: {
    mongodb_uri: process.env.MONGODB_URI,
    supabase_url: process.env.SUPABASE_URL,
    supabase_service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Security configuration
  security: {
    jwt_secret: process.env.JWT_SECRET,
    cors_origin: process.env.FRONTEND_URL,
    rate_limit_max: 100, // Stricter rate limit for production
  },

  // Logging configuration
  logging: {
    level: 'info', // Less verbose logging for production
    file: '/var/log/maya-travel-agent/app.log',
  },

  // AI Services configuration
  ai: {
    gemini_api_key: process.env.GEMINI_API_KEY,
    zai_api_key: process.env.ZAI_API_KEY,
    langsmith_api_key: process.env.LANGCHAIN_API_KEY,
    langsmith_project: process.env.LANGCHAIN_PROJECT,
  },

  // Add other production-specific settings here
};
