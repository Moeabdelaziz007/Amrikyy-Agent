export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@google/genai|cheerio)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
