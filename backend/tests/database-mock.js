/**
 * Database Mock Setup for Jest Tests
 * Provides mock implementations for database operations
 */

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => {
  const mockClient = {
    auth: {
      getUser: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      then: jest.fn(),
    })),
    rpc: jest.fn(),
  };

  return {
    createClient: jest.fn(() => mockClient),
    SupabaseClient: jest.fn(() => mockClient),
  };
});

// Mock Redis client
jest.mock('redis', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
  };

  return {
    createClient: jest.fn(() => mockRedis),
    RedisClientType: jest.fn(),
  };
});

// Mock WebSocket
jest.mock('ws', () => {
  const mockWebSocket = {
    send: jest.fn(),
    close: jest.fn(),
    on: jest.fn(),
    emit: jest.fn(),
  };

  const mockServer = {
    on: jest.fn(),
    close: jest.fn(),
    clients: new Set(),
  };

  return {
    WebSocket: jest.fn(() => mockWebSocket),
    WebSocketServer: jest.fn(() => mockServer),
  };
});

// Global test setup
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.REDIS_URL = 'redis://localhost:6379';
