module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'backend/src/**/*.js',
    '!backend/src/**/*.test.js',
    '!backend/src/**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 10000,
  transformIgnorePatterns: [
    "/node_modules/(?!chai)/"
  ]
};