/**
 * API Configuration Validator
 * Checks if all required APIs are properly configured
 */

require('dotenv').config();
const apiConfig = require('../config/apis');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkAPI(name, config) {
  log(`\n📡 Checking ${name}...`, 'blue');
  
  if (!config.enabled) {
    log(`  ❌ Not configured`, 'red');
    return false;
  }
  
  log(`  ✅ Configured`, 'green');
  
  if (config.rateLimit) {
    log(`  ⏱️  Rate Limit: ${config.rateLimit.requestsPerMinute}/min, ${config.rateLimit.requestsPerHour}/hour`, 'yellow');
  }
  
  return true;
}

async function validateAPIs() {
  log('\n🔍 Validating API Configuration...', 'blue');
  log('=' .repeat(50), 'blue');
  
  const results = {
    kiwi: checkAPI('Kiwi Tequila (Flights)', apiConfig.kiwi),
    bookingCom: checkAPI('Booking.com (Hotels)', apiConfig.bookingCom),
    mapbox: checkAPI('Mapbox (Maps)', apiConfig.mapbox),
    zai: checkAPI('Z.ai (AI Model)', apiConfig.zai),
    stripe: checkAPI('Stripe (Payments)', apiConfig.stripe),
    supabase: checkAPI('Supabase (Database)', apiConfig.supabase),
    telegram: checkAPI('Telegram (Bot)', apiConfig.telegram)
  };
  
  log('\n' + '='.repeat(50), 'blue');
  log('\n📊 Summary:', 'blue');
  
  const configured = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  log(`  Configured: ${configured}/${total}`, configured === total ? 'green' : 'yellow');
  
  if (configured < total) {
    log('\n⚠️  Missing Configuration:', 'yellow');
    Object.entries(results).forEach(([key, value]) => {
      if (!value) {
        log(`  - ${key}`, 'red');
      }
    });
    
    log('\n💡 Tip: Check TRAVEL_APIS_SETUP_GUIDE.md for setup instructions', 'blue');
  } else {
    log('\n✅ All APIs configured!', 'green');
  }
  
  log('\n');
}

// Run validation
validateAPIs().catch(error => {
  log(`\n❌ Validation failed: ${error.message}`, 'red');
  process.exit(1);
});
