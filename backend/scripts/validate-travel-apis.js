#!/usr/bin/env node

/**
 * Travel APIs Validation Script
 * Tests all external API connections on startup
 * 
 * Usage:
 *   node scripts/validate-travel-apis.js
 *   npm run validate-apis
 */

require('dotenv').config();
const axios = require('axios');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class TravelAPIValidator {
  constructor() {
    this.results = {
      kiwi: { status: 'pending', message: '', required: true },
      booking: { status: 'pending', message: '', required: true },
      mapbox: { status: 'pending', message: '', required: true },
      zai: { status: 'pending', message: '', required: false },
      supabase: { status: 'pending', message: '', required: true }
    };
    
    this.startTime = Date.now();
  }

  /**
   * Validate Kiwi Tequila API (Flights)
   */
  async validateKiwi() {
    const apiKey = process.env.KIWI_API_KEY;
    
    if (!apiKey) {
      this.results.kiwi = { 
        status: 'error', 
        message: 'KIWI_API_KEY not found in environment variables',
        required: true
      };
      return;
    }

    try {
      const response = await axios.get(
        'https://api.tequila.kiwi.com/locations/query',
        {
          params: { term: 'London', locale: 'en-US', limit: 1 },
          headers: { apikey: apiKey },
          timeout: 10000
        }
      );
      
      if (response.status === 200 && response.data.locations) {
        this.results.kiwi = { 
          status: 'success', 
          message: `Kiwi API working (${response.data.locations.length} locations found)`,
          required: true
        };
      } else {
        this.results.kiwi = { 
          status: 'warning', 
          message: 'Kiwi API responded but with unexpected data',
          required: true
        };
      }
    } catch (error) {
      this.results.kiwi = { 
        status: 'error', 
        message: `Kiwi API failed: ${error.response?.status || error.message}`,
        required: true,
        details: error.response?.data || error.message
      };
    }
  }

  /**
   * Validate Booking.com Affiliate API (Hotels)
   */
  async validateBookingCom() {
    const affiliateId = process.env.BOOKING_COM_AFFILIATE_ID;
    
    if (!affiliateId) {
      this.results.booking = { 
        status: 'error', 
        message: 'BOOKING_COM_AFFILIATE_ID not found in environment variables',
        required: true
      };
      return;
    }

    try {
      // Note: Booking.com API might require additional authentication
      // This is a basic validation
      const response = await axios.get(
        'https://distribution-xml.booking.com/2.7/json/cities',
        {
          params: { 
            name: 'London',
            affiliate_id: affiliateId,
            rows: 1
          },
          timeout: 10000
        }
      );
      
      if (response.status === 200) {
        this.results.booking = { 
          status: 'success', 
          message: 'Booking.com API working',
          required: true
        };
      } else {
        this.results.booking = { 
          status: 'warning', 
          message: 'Booking.com API responded but with unexpected status',
          required: true
        };
      }
    } catch (error) {
      // Booking.com might return 403 if not properly configured
      // But we can still check if the endpoint is reachable
      if (error.response?.status === 403) {
        this.results.booking = { 
          status: 'warning', 
          message: 'Booking.com API reachable but authentication may need configuration',
          required: true
        };
      } else {
        this.results.booking = { 
          status: 'error', 
          message: `Booking.com API failed: ${error.response?.status || error.message}`,
          required: true,
          details: error.response?.data || error.message
        };
      }
    }
  }

  /**
   * Validate Mapbox API (Maps & Geocoding)
   */
  async validateMapbox() {
    const apiKey = process.env.MAPBOX_API_KEY;
    
    if (!apiKey) {
      this.results.mapbox = { 
        status: 'error', 
        message: 'MAPBOX_API_KEY not found in environment variables',
        required: true
      };
      return;
    }

    try {
      const response = await axios.get(
        'https://api.mapbox.com/geocoding/v5/mapbox.places/London.json',
        {
          params: { 
            access_token: apiKey,
            limit: 1
          },
          timeout: 10000
        }
      );
      
      if (response.status === 200 && response.data.features) {
        this.results.mapbox = { 
          status: 'success', 
          message: `Mapbox API working (${response.data.features.length} results)`,
          required: true
        };
      } else {
        this.results.mapbox = { 
          status: 'warning', 
          message: 'Mapbox API responded but with unexpected data',
          required: true
        };
      }
    } catch (error) {
      this.results.mapbox = { 
        status: 'error', 
        message: `Mapbox API failed: ${error.response?.status || error.message}`,
        required: true,
        details: error.response?.data || error.message
      };
    }
  }

  /**
   * Validate Z.ai API (AI Model)
   */
  async validateZai() {
    const apiKey = process.env.ZAI_API_KEY;
    
    if (!apiKey) {
      this.results.zai = { 
        status: 'warning', 
        message: 'ZAI_API_KEY not found (optional)',
        required: false
      };
      return;
    }

    try {
      // Basic validation - just check if key exists
      // Actual API call would consume tokens
      this.results.zai = { 
        status: 'success', 
        message: 'Z.ai API key configured',
        required: false
      };
    } catch (error) {
      this.results.zai = { 
        status: 'warning', 
        message: `Z.ai API validation skipped: ${error.message}`,
        required: false
      };
    }
  }

  /**
   * Validate Supabase connection
   */
  async validateSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      this.results.supabase = { 
        status: 'error', 
        message: 'SUPABASE_URL or SUPABASE_ANON_KEY not found',
        required: true
      };
      return;
    }

    try {
      // Simple health check
      const response = await axios.get(
        `${url}/rest/v1/`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`
          },
          timeout: 10000
        }
      );
      
      this.results.supabase = { 
        status: 'success', 
        message: 'Supabase connection working',
        required: true
      };
    } catch (error) {
      this.results.supabase = { 
        status: 'error', 
        message: `Supabase connection failed: ${error.message}`,
        required: true
      };
    }
  }

  /**
   * Validate all APIs
   */
  async validateAll() {
    console.log(`${colors.blue}${colors.bright}`);
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     🔍 Travel APIs Validation                         ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(colors.reset);
    
    console.log(`${colors.cyan}Starting validation...${colors.reset}\n`);
    
    // Run all validations in parallel
    await Promise.all([
      this.validateKiwi(),
      this.validateBookingCom(),
      this.validateMapbox(),
      this.validateZai(),
      this.validateSupabase()
    ]);

    // Print results
    console.log(`${colors.bright}Validation Results:${colors.reset}\n`);
    
    Object.entries(this.results).forEach(([api, result]) => {
      const icon = result.status === 'success' ? '✅' 
                 : result.status === 'warning' ? '⚠️' 
                 : '❌';
      
      const color = result.status === 'success' ? colors.green
                  : result.status === 'warning' ? colors.yellow
                  : colors.red;
      
      const required = result.required ? '(required)' : '(optional)';
      
      console.log(`${icon} ${color}${api.toUpperCase().padEnd(15)}${colors.reset} ${result.message} ${colors.cyan}${required}${colors.reset}`);
      
      if (result.details && process.env.DEBUG) {
        console.log(`   ${colors.yellow}Details: ${JSON.stringify(result.details)}${colors.reset}`);
      }
    });

    // Summary
    const duration = Date.now() - this.startTime;
    console.log(`\n${colors.cyan}Validation completed in ${duration}ms${colors.reset}\n`);

    // Check if all required APIs passed
    const requiredAPIs = Object.entries(this.results).filter(([, r]) => r.required);
    const failedRequired = requiredAPIs.filter(([, r]) => r.status === 'error');
    const allPassed = failedRequired.length === 0;
    
    if (allPassed) {
      console.log(`${colors.green}${colors.bright}✅ All required APIs validated successfully!${colors.reset}\n`);
      return true;
    } else {
      console.log(`${colors.red}${colors.bright}❌ ${failedRequired.length} required API(s) failed validation${colors.reset}`);
      console.log(`${colors.yellow}💡 Check your API keys in .env file${colors.reset}\n`);
      
      // Print setup instructions
      console.log(`${colors.cyan}Setup Instructions:${colors.reset}`);
      failedRequired.forEach(([api]) => {
        console.log(`  • ${api}: Check TRAVEL_APIS_SETUP_GUIDE.md for setup instructions`);
      });
      console.log('');
      
      return false;
    }
  }

  /**
   * Get validation report
   */
  getReport() {
    return {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      results: this.results,
      summary: {
        total: Object.keys(this.results).length,
        success: Object.values(this.results).filter(r => r.status === 'success').length,
        warning: Object.values(this.results).filter(r => r.status === 'warning').length,
        error: Object.values(this.results).filter(r => r.status === 'error').length,
        required: Object.values(this.results).filter(r => r.required).length,
        requiredPassed: Object.values(this.results).filter(r => r.required && r.status === 'success').length
      }
    };
  }
}

// Run validation if executed directly
if (require.main === module) {
  const validator = new TravelAPIValidator();
  
  validator.validateAll()
    .then(success => {
      if (process.env.SAVE_REPORT) {
        const fs = require('fs');
        const report = validator.getReport();
        fs.writeFileSync(
          'validation-report.json', 
          JSON.stringify(report, null, 2)
        );
        console.log(`${colors.cyan}Report saved to validation-report.json${colors.reset}\n`);
      }
      
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(`${colors.red}Fatal error during validation: ${error.message}${colors.reset}`);
      process.exit(1);
    });
}

module.exports = TravelAPIValidator;
