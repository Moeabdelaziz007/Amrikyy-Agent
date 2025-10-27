module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest"
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@google/genai|cheerio|lucide-react|framer-motion|zustand|sinon)/)"
  ],
  moduleFileExtensions: ["js", "jsx", "mjs", "ts", "tsx"],
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
    "<rootDir>/frontend/src/**/*.test.tsx"
  ],
  collectCoverageFrom: [
    "components/**/*.tsx",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!jest.config.js"
  ],
  setupFilesAfterEnv: ['<rootDir>/docs/setup/jest-setup.cjs'],
  testTimeout: 60000,
  testPathIgnorePatterns: ['/node_modules/', '/e2e/', '<rootDir>/backend/'],
};
