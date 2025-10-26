module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@google/genai|cheerio)/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testTimeout: 60000,
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
};
