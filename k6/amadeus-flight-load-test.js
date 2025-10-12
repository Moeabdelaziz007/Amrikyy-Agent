/**
 * Amadeus Flight API Load Test
 * 
 * Tests the Amadeus Flight Search integration with focus on:
 * - Rate limiter behavior under load
 * - API response times and error rates
 * - Backend timeout and priority settings
 * - Concurrent request handling
 * 
 * Run with:
 *   k6 run k6/amadeus-flight-load-test.js
 *   k6 run k6/amadeus-flight-load-test.js --env LOAD_PROFILE=smoke
 *   k6 run k6/amadeus-flight-load-test.js --env LOAD_PROFILE=stress
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend, Gauge } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// ============================================================================
// CUSTOM METRICS
// ============================================================================

// Response time metrics
const flightSearchDuration = new Trend('amadeus_flight_search_duration', true);
const flightPricingDuration = new Trend('amadeus_flight_pricing_duration', true);
const locationSearchDuration = new Trend('amadeus_location_search_duration', true);

// Rate limiting metrics
const rateLimitHits = new Counter('rate_limit_hits');
const rateLimitResets = new Counter('rate_limit_resets');
const rateLimitRemaining = new Gauge('rate_limit_remaining');

// Error tracking
const apiErrors = new Counter('api_errors');
const timeoutErrors = new Counter('timeout_errors');
const validationErrors = new Counter('validation_errors');
const successRate = new Rate('success_rate');

// Request type distribution
const flightSearchRequests = new Counter('flight_search_requests');
const pricingRequests = new Counter('pricing_requests');
const locationSearchRequests = new Counter('location_search_requests');

// ============================================================================
// CONFIGURATION & ENVIRONMENT
// ============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const AMADEUS_CLIENT_ID = __ENV.AMADEUS_CLIENT_ID || '';
const AMADEUS_CLIENT_SECRET = __ENV.AMADEUS_CLIENT_SECRET || '';
const LOAD_PROFILE = __ENV.LOAD_PROFILE || 'default';

// Agent configuration from environment
const AGENT_TIMEOUT = parseInt(__ENV.AGENT_TIMEOUT || '10000');
const AGENT_PRIORITY = parseInt(__ENV.AGENT_PRIORITY || '1');

// Load test profiles
const LOAD_PROFILES = {
  smoke: {
    stages: [
      { duration: '1m', target: 5 },
      { duration: '2m', target: 5 },
      { duration: '1m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<10000'],
      http_req_failed: ['rate<0.1'],
      'success_rate': ['rate>0.85'],
    }
  },
  default: {
    stages: [
      { duration: '2m', target: 20 },   // Ramp up
      { duration: '5m', target: 50 },   // Moderate load
      { duration: '3m', target: 50 },   // Sustain
      { duration: '2m', target: 0 },    // Ramp down
    ],
    thresholds: {
      http_req_duration: ['p(95)<8000'],
      http_req_failed: ['rate<0.05'],
      'amadeus_flight_search_duration': ['p(95)<12000'],
      'rate_limit_hits': ['count<50'],
      'success_rate': ['rate>0.9'],
    }
  },
  stress: {
    stages: [
      { duration: '2m', target: 50 },
      { duration: '5m', target: 100 },
      { duration: '5m', target: 150 },
      { duration: '5m', target: 200 },
      { duration: '3m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<15000'],
      http_req_failed: ['rate<0.15'],
      'success_rate': ['rate>0.75'],
    }
  },
  spike: {
    stages: [
      { duration: '1m', target: 20 },
      { duration: '30s', target: 200 },  // Spike
      { duration: '2m', target: 200 },
      { duration: '1m', target: 20 },
      { duration: '1m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<20000'],
      http_req_failed: ['rate<0.2'],
      'success_rate': ['rate>0.7'],
    }
  },
  soak: {
    stages: [
      { duration: '5m', target: 50 },
      { duration: '30m', target: 50 },  // Long sustained load
      { duration: '5m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<8000'],
      http_req_failed: ['rate<0.05'],
      'success_rate': ['rate>0.9'],
    }
  }
};

// Apply selected profile
export const options = LOAD_PROFILES[LOAD_PROFILE];

// ============================================================================
// TEST DATA
// ============================================================================

// Popular flight routes for realistic testing
const flightRoutes = new SharedArray('flight_routes', function() {
  return [
    { origin: 'JFK', destination: 'LAX', route: 'New York to Los Angeles' },
    { origin: 'LHR', destination: 'JFK', route: 'London to New York' },
    { origin: 'DXB', destination: 'LHR', route: 'Dubai to London' },
    { origin: 'CDG', destination: 'JFK', route: 'Paris to New York' },
    { origin: 'NRT', destination: 'LAX', route: 'Tokyo to Los Angeles' },
    { origin: 'SIN', destination: 'LHR', route: 'Singapore to London' },
    { origin: 'HKG', destination: 'SFO', route: 'Hong Kong to San Francisco' },
    { origin: 'SYD', destination: 'LAX', route: 'Sydney to Los Angeles' },
    { origin: 'ORD', destination: 'LAX', route: 'Chicago to Los Angeles' },
    { origin: 'ATL', destination: 'MIA', route: 'Atlanta to Miami' },
    { origin: 'DFW', destination: 'LAX', route: 'Dallas to Los Angeles' },
    { origin: 'FRA', destination: 'JFK', route: 'Frankfurt to New York' },
    { origin: 'AMS', destination: 'JFK', route: 'Amsterdam to New York' },
    { origin: 'IST', destination: 'LHR', route: 'Istanbul to London' },
    { origin: 'MAD', destination: 'JFK', route: 'Madrid to New York' },
  ];
});

const travelClasses = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'];
const airports = ['JFK', 'LAX', 'LHR', 'CDG', 'DXB', 'NRT', 'SIN', 'HKG', 'SYD'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate random date between today and 6 months from now
 */
function getRandomFutureDate(daysFromNow = 30, daysRange = 150) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow + Math.floor(Math.random() * daysRange));
  return date.toISOString().split('T')[0];
}

/**
 * Generate random flight search parameters
 */
function generateFlightSearchParams() {
  const route = flightRoutes[Math.floor(Math.random() * flightRoutes.length)];
  const departureDate = getRandomFutureDate(7, 60);
  const returnDate = getRandomFutureDate(14, 70);
  
  return {
    origin: route.origin,
    destination: route.destination,
    departure_date: departureDate,
    return_date: Math.random() > 0.3 ? returnDate : undefined, // 70% round trip
    travelers: Math.floor(Math.random() * 4) + 1,
    travel_class: travelClasses[Math.floor(Math.random() * travelClasses.length)],
    non_stop: Math.random() > 0.7, // 30% non-stop preference
    max_results: Math.floor(Math.random() * 10) + 5,
  };
}

/**
 * Extract rate limit info from response headers
 */
function extractRateLimitInfo(response) {
  const remaining = response.headers['X-RateLimit-Remaining'] || 
                    response.headers['x-ratelimit-remaining'];
  const limit = response.headers['X-RateLimit-Limit'] || 
                response.headers['x-ratelimit-limit'];
  const reset = response.headers['X-RateLimit-Reset'] || 
                response.headers['x-ratelimit-reset'];
  
  return {
    remaining: remaining ? parseInt(remaining) : null,
    limit: limit ? parseInt(limit) : null,
    reset: reset ? parseInt(reset) : null,
  };
}

/**
 * Check if response indicates rate limiting
 */
function isRateLimited(response) {
  return response.status === 429 || 
         (response.status === 503 && 
          response.body && 
          response.body.includes('rate limit'));
}

// ============================================================================
// TEST SCENARIOS
// ============================================================================

/**
 * Test Amadeus flight search endpoint
 */
function testFlightSearch() {
  const params = generateFlightSearchParams();
  const startTime = Date.now();
  
  const payload = JSON.stringify(params);
  const response = http.post(
    `${BASE_URL}/api/agents/amadeus/search`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Agent-Timeout': AGENT_TIMEOUT.toString(),
        'X-Agent-Priority': AGENT_PRIORITY.toString(),
      },
      timeout: '30s',
    }
  );
  
  const duration = Date.now() - startTime;
  flightSearchDuration.add(duration);
  flightSearchRequests.add(1);
  
  // Extract rate limit info
  const rateLimitInfo = extractRateLimitInfo(response);
  if (rateLimitInfo.remaining !== null) {
    rateLimitRemaining.add(rateLimitInfo.remaining);
  }
  
  // Check for rate limiting
  if (isRateLimited(response)) {
    rateLimitHits.add(1);
    console.log(`⚠️  Rate limit hit! Response: ${response.status}`);
  }
  
  // Validate response
  const checks = check(response, {
    'flight search: status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'flight search: has response body': (r) => r.body && r.body.length > 0,
    'flight search: response time < 15s': () => duration < 15000,
    'flight search: valid JSON response': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
  });
  
  if (response.status === 200) {
    try {
      const data = JSON.parse(response.body);
      
      const validationChecks = check(data, {
        'flight search: success field exists': (d) => d.success !== undefined,
        'flight search: has results or error': (d) => d.results || d.error,
        'flight search: agent is flight_search': (d) => d.agent === 'flight_search',
      });
      
      if (data.success) {
        successRate.add(true);
        
        // Additional validation for successful responses
        check(data, {
          'flight search: has search params': (d) => d.search_params !== undefined,
          'flight search: results is array': (d) => Array.isArray(d.results),
          'flight search: has timestamp': (d) => d.timestamp !== undefined,
        });
      } else {
        successRate.add(false);
        apiErrors.add(1);
        
        // Log errors for analysis
        if (data.error) {
          console.log(`❌ Flight search error: ${data.error}`);
        }
        
        // Check for timeout errors
        if (data.error && data.error.includes('timeout')) {
          timeoutErrors.add(1);
        }
        
        // Check for validation errors
        if (data.error && data.error.includes('required')) {
          validationErrors.add(1);
        }
      }
    } catch (e) {
      successRate.add(false);
      apiErrors.add(1);
      console.log(`❌ Failed to parse response: ${e.message}`);
    }
  } else if (response.status === 429) {
    // Rate limited - don't count as failure
    successRate.add(false);
  } else {
    successRate.add(false);
    apiErrors.add(1);
  }
  
  return response;
}

/**
 * Test flight pricing endpoint
 */
function testFlightPricing(flightOfferId = 'test-offer-id') {
  const startTime = Date.now();
  
  const response = http.get(
    `${BASE_URL}/api/agents/amadeus/pricing/${flightOfferId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Agent-Timeout': AGENT_TIMEOUT.toString(),
      },
      timeout: '20s',
    }
  );
  
  const duration = Date.now() - startTime;
  flightPricingDuration.add(duration);
  pricingRequests.add(1);
  
  // Extract rate limit info
  const rateLimitInfo = extractRateLimitInfo(response);
  if (rateLimitInfo.remaining !== null) {
    rateLimitRemaining.add(rateLimitInfo.remaining);
  }
  
  if (isRateLimited(response)) {
    rateLimitHits.add(1);
  }
  
  check(response, {
    'pricing: status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'pricing: response time < 10s': () => duration < 10000,
  });
  
  if (response.status === 200) {
    successRate.add(true);
  } else if (response.status !== 429) {
    successRate.add(false);
    apiErrors.add(1);
  }
  
  return response;
}

/**
 * Test location search endpoint
 */
function testLocationSearch() {
  const keywords = ['New York', 'London', 'Paris', 'Tokyo', 'Dubai', 'Los Angeles'];
  const keyword = keywords[Math.floor(Math.random() * keywords.length)];
  const startTime = Date.now();
  
  const response = http.get(
    `${BASE_URL}/api/agents/amadeus/locations?keyword=${keyword}&subType=AIRPORT`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: '10s',
    }
  );
  
  const duration = Date.now() - startTime;
  locationSearchDuration.add(duration);
  locationSearchRequests.add(1);
  
  // Extract rate limit info
  const rateLimitInfo = extractRateLimitInfo(response);
  if (rateLimitInfo.remaining !== null) {
    rateLimitRemaining.add(rateLimitInfo.remaining);
  }
  
  if (isRateLimited(response)) {
    rateLimitHits.add(1);
  }
  
  check(response, {
    'location search: status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'location search: response time < 5s': () => duration < 5000,
  });
  
  if (response.status === 200) {
    successRate.add(true);
  } else if (response.status !== 429) {
    successRate.add(false);
    apiErrors.add(1);
  }
  
  return response;
}

// ============================================================================
// MAIN TEST EXECUTION
// ============================================================================

export default function() {
  // Weighted distribution of request types
  const random = Math.random();
  
  if (random < 0.70) {
    // 70% - Flight search (primary load)
    testFlightSearch();
    sleep(Math.random() * 2 + 0.5); // 0.5-2.5 seconds
  } else if (random < 0.85) {
    // 15% - Location search
    testLocationSearch();
    sleep(Math.random() * 1 + 0.5); // 0.5-1.5 seconds
  } else {
    // 15% - Pricing (requires flight offer ID, may fail)
    testFlightPricing();
    sleep(Math.random() * 1.5 + 0.5); // 0.5-2 seconds
  }
  
  // Occasionally check multiple endpoints in sequence (realistic user flow)
  if (Math.random() < 0.1) {
    sleep(0.5);
    testLocationSearch();
    sleep(1);
    testFlightSearch();
  }
}

// ============================================================================
// SETUP AND TEARDOWN
// ============================================================================

export function setup() {
  console.log('🚀 Starting Amadeus Flight API Load Test');
  console.log(`📊 Load Profile: ${LOAD_PROFILE}`);
  console.log(`🔗 Target URL: ${BASE_URL}`);
  console.log(`⏱️  Agent Timeout: ${AGENT_TIMEOUT}ms`);
  console.log(`⭐ Agent Priority: ${AGENT_PRIORITY}`);
  console.log(`\n${'='.repeat(60)}\n`);
  
  // Verify backend is reachable
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    console.error('❌ Backend health check failed! Aborting test.');
    throw new Error('Backend not reachable');
  }
  
  console.log('✅ Backend health check passed');
  
  return {
    startTime: new Date().toISOString(),
    profile: LOAD_PROFILE,
  };
}

export function teardown(data) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🏁 Load test completed');
  console.log(`📅 Started: ${data.startTime}`);
  console.log(`📅 Ended: ${new Date().toISOString()}`);
  console.log(`${'='.repeat(60)}\n`);
}

// ============================================================================
// RESULTS SUMMARY
// ============================================================================

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    [`test-outputs/amadeus-load-test-${timestamp}.json`]: JSON.stringify(data, null, 2),
    [`test-outputs/amadeus-load-test-${timestamp}.html`]: htmlReport(data),
  };
}

