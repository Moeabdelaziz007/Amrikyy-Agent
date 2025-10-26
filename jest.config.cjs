module.exports = {
 fix-jest-esm-config
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(lucide-react|framer-motion|zustand)/)"
  ],
  moduleFileExtensions: ["js", "jsx", "mjs", "ts", "tsx"],
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
    "<rootDir>/frontend/src/**/*.test.tsx"
  ],
  setupFilesAfterEnv: ['<rootDir>/jest-setup.cjs'],
};
=======
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
 main
