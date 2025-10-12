#!/usr/bin/env node

/**
 * Environment Variable Validator for Load Testing
 *
 * Validates that all required environment variables are set
 * and provides helpful error messages if not
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Required environment variables
const REQUIRED_VARS = [
  {
    name: 'BASE_URL',
    description: 'Backend API URL',
    default: 'http://localhost:5000',
    required: false,
  },
];

// Optional but recommended variables
const OPTIONAL_VARS = [
  {
    name: 'AMADEUS_CLIENT_ID',
    description: 'Amadeus API Client ID',
    hint: 'Get from https://developers.amadeus.com',
    required: false,
  },
  {
    name: 'AMADEUS_CLIENT_SECRET',
    description: 'Amadeus API Client Secret',
    hint: 'Get from https://developers.amadeus.com',
    required: false,
    sensitive: true,
  },
  {
    name: 'AGENT_TIMEOUT',
    description: 'Agent timeout in milliseconds',
    default: '10000',
    required: false,
  },
  {
    name: 'AGENT_PRIORITY',
    description: 'Agent priority level',
    default: '1',
    required: false,
  },
  {
    name: 'REDIS_URL',
    description: 'Redis connection URL for rate limiting',
    default: 'redis://localhost:6379',
    required: false,
  },
];

function validateEnvironment() {
  log('blue', '\n╔════════════════════════════════════════════════════════╗');
  log('blue', '║   Environment Variable Validation for Load Testing    ║');
  log('blue', '╚════════════════════════════════════════════════════════╝\n');

  let hasErrors = false;
  let hasWarnings = false;

  // Load .env file if it exists
  const envPath = path.join(__dirname, '../../backend/.env');
  if (fs.existsSync(envPath)) {
    log('green', '✓ Found .env file at backend/.env');

    // Parse .env file
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        envVars[match[1].trim()] = match[2].trim();
      }
    });

    // Load into process.env for validation
    Object.assign(process.env, envVars);
  } else {
    log('yellow', '⚠  No .env file found at backend/.env');
    hasWarnings = true;
  }

  console.log('\n' + '─'.repeat(60));
  console.log('Checking Required Variables:');
  console.log('─'.repeat(60) + '\n');

  // Check required variables
  REQUIRED_VARS.forEach((varInfo) => {
    const value = process.env[varInfo.name];

    if (!value && varInfo.required) {
      log('red', `✗ ${varInfo.name}: MISSING (Required)`);
      log('red', `  ${varInfo.description}`);
      if (varInfo.hint) {
        log('yellow', `  Hint: ${varInfo.hint}`);
      }
      hasErrors = true;
    } else if (!value && varInfo.default) {
      log('cyan', `ℹ ${varInfo.name}: Using default value`);
      log('cyan', `  Default: ${varInfo.default}`);
    } else if (value) {
      const displayValue = varInfo.sensitive ? '***' : value;
      log('green', `✓ ${varInfo.name}: ${displayValue}`);
    }
  });

  console.log('\n' + '─'.repeat(60));
  console.log('Checking Optional Variables:');
  console.log('─'.repeat(60) + '\n');

  // Check optional variables
  OPTIONAL_VARS.forEach((varInfo) => {
    const value = process.env[varInfo.name];

    if (!value && varInfo.default) {
      log('cyan', `ℹ ${varInfo.name}: Using default value`);
      log('cyan', `  Default: ${varInfo.default}`);
    } else if (!value) {
      log('yellow', `⚠ ${varInfo.name}: Not set (Optional)`);
      log('yellow', `  ${varInfo.description}`);
      if (varInfo.hint) {
        log('cyan', `  Hint: ${varInfo.hint}`);
      }
      hasWarnings = true;
    } else {
      const displayValue = varInfo.sensitive ? '***' : value;
      log('green', `✓ ${varInfo.name}: ${displayValue}`);
    }
  });

  // Summary
  console.log('\n' + '═'.repeat(60));
  if (hasErrors) {
    log('red', '✗ Validation Failed');
    log('red', '  Please set all required environment variables');
    console.log('\nTo fix:');
    console.log('  1. Copy backend/env.example to backend/.env');
    console.log('  2. Fill in the required values');
    console.log('  3. Run this validation again');
    process.exit(1);
  } else if (hasWarnings) {
    log('yellow', '⚠ Validation Passed with Warnings');
    log('yellow', '  Some optional variables are not set');
    log('yellow', '  Load tests will run but may have reduced functionality');
  } else {
    log('green', '✓ Validation Passed');
    log('green', '  All environment variables are properly configured');
  }
  console.log('═'.repeat(60) + '\n');

  return !hasErrors;
}

// Check if backend is reachable
async function checkBackendHealth() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

  log('blue', '\nChecking Backend Health...');

  try {
    const response = await fetch(`${baseUrl}/health`);

    if (response.ok) {
      log('green', `✓ Backend is reachable at ${baseUrl}`);
      return true;
    } else {
      log('yellow', `⚠ Backend responded with status ${response.status}`);
      return false;
    }
  } catch (error) {
    log('red', `✗ Backend is not reachable at ${baseUrl}`);
    log('red', `  Error: ${error.message}`);
    log('yellow', '\nMake sure the backend is running:');
    log('cyan', '  cd backend && npm run dev');
    return false;
  }
}

// Main execution
if (require.main === module) {
  const isValid = validateEnvironment();

  if (isValid) {
    // Also check backend health if validation passed
    checkBackendHealth()
      .then((isHealthy) => {
        if (!isHealthy) {
          process.exit(1);
        }
      })
      .catch(() => {
        process.exit(1);
      });
  }
}

module.exports = { validateEnvironment, checkBackendHealth };
