module.exports = {
  testEnvironment: "node",
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
    "<rootDir>/backend/tests/**/*.test.ts"
  ],
  testTimeout: 60000,
  testPathIgnorePatterns: ['/node_modules/', '/e2e/', 'aix-agents.test.js', '<rootDir>/frontend/'],
};
