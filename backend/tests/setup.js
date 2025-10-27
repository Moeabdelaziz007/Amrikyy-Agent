// tests/setup.js
const MemoryCache = require('../src/cache/MemoryCache');

// Set test environment variables BEFORE any imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-12345';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';

// Increase timeout globally
jest.setTimeout(30000);

// Mock console to reduce noise (optional)
global.console = {
  ...console,
  log: jest.fn(), // Suppress logs
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
  error: console.error,
};

// Clean up after all tests
afterAll(async () => {
  // Close any database connections
  // Close any server instances
  MemoryCache.shutdown();
  await new Promise(resolve => setTimeout(resolve, 500));
});
