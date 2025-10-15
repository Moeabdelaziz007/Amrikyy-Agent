/**
 * ESLint Configuration v9.0.0
 * Modern configuration for Amrikyy Travel Agent Backend
 */

import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly'
      }
    },
    rules: {
      // Error prevention
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      
      // Code style
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      
      // Best practices
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-assign': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'error',
      'no-var': 'error',
      
      // Node.js specific
      'no-process-exit': 'error',
      'no-path-concat': 'error',
      'no-new-require': 'error',
      'no-mixed-requires': 'error',
      'handle-callback-err': 'error',
      'no-sync': 'warn'
    }
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/tests/**/*.js'],
    rules: {
      'no-console': 'off',
      'no-unused-expressions': 'off'
    }
  },
  {
    files: ['**/config/**/*.js', '**/migrations/**/*.js'],
    rules: {
      'no-console': 'off'
    }
  }
];