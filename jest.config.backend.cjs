module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  setupFilesAfterEnv: ['<rootDir>/backend/tests/setup.js'],
  collectCoverageFrom: [
    'backend/src/**/*.js',
    'backend/services/**/*.js',
    'backend/routes/**/*.js',
    '!**/node_modules/**',
    '!**/*.test.js',
  ],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    "<rootDir>/backend/tests/unit/**/*.js",
    "<rootDir>/backend/tests/integration/**/*.js",
    "<rootDir>/backend/tests/api/**/*.js",
    "<rootDir>/backend/tests/agents/**/*.js",
    "<rootDir>/backend/tests/middleware/**/*.js",
    "<rootDir>/backend/tests/security/**/*.js",
    "<rootDir>/backend/tests/utils/**/*.js",
    "<rootDir>/backend/tests/*.test.js",
  ],
};
