module.exports = {
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