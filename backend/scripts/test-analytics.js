#!/usr/bin/env node

/**
 * Test Analytics System
 * Generates sample data to test the DataCollector
 */

require('dotenv').config();
const dataCollector = require('../src/analytics/DataCollector');

console.log('📊 Testing Analytics System\n');

// Test 1: Track User Actions
console.log('Test 1: Tracking user actions...');
for (let i = 0; i < 10; i++) {
  dataCollector.trackUserAction(`user${i % 3}`, 'VIEW_PAGE', {
    page: ['home', 'destinations', 'flights'][i % 3],
    timestamp: Date.now()
  });
}
console.log('✅ Tracked 10 user actions\n');

// Test 2: Track API Calls
console.log('Test 2: Tracking API calls...');
const services = ['kiwi', 'booking', 'mapbox'];
for (let i = 0; i < 15; i++) {
  const service = services[i % 3];
  const success = Math.random() > 0.1; // 90% success rate
  const duration = Math.floor(Math.random() * 500) + 100;
  
  dataCollector.trackAPICall(service, '/search', duration, success, {
    statusCode: success ? 200 : 500
  });
}
console.log('✅ Tracked 15 API calls\n');

// Test 3: Track Searches
console.log('Test 3: Tracking searches...');
const searchTypes = ['flight', 'hotel', 'destination'];
const destinations = ['London', 'Paris', 'Tokyo', 'New York', 'Dubai'];

for (let i = 0; i < 20; i++) {
  dataCollector.trackSearch(
    `user${i % 5}`,
    searchTypes[i % 3],
    {
      destination: destinations[i % 5],
      from: 'NYC',
      to: destinations[i % 5]
    },
    Math.floor(Math.random() * 20) + 5
  );
}
console.log('✅ Tracked 20 searches\n');

// Test 4: Track Bookings
console.log('Test 4: Tracking bookings...');
const bookingTypes = ['flight', 'hotel', 'package'];

for (let i = 0; i < 8; i++) {
  const success = Math.random() > 0.2; // 80% success rate
  const amount = Math.floor(Math.random() * 1000) + 200;
  
  dataCollector.trackBooking(
    `user${i % 3}`,
    bookingTypes[i % 3],
    amount,
    success,
    {
      bookingId: `BK${1000 + i}`,
      currency: 'USD'
    }
  );
}
console.log('✅ Tracked 8 bookings\n');

// Test 5: Track Errors
console.log('Test 5: Tracking errors...');
const errorTypes = ['ValidationError', 'APIError', 'DatabaseError'];

for (let i = 0; i < 3; i++) {
  dataCollector.trackError(
    errorTypes[i],
    `Test error ${i + 1}`,
    `Error stack trace ${i + 1}`,
    {
      userId: `user${i}`,
      path: '/api/test'
    }
  );
}
console.log('✅ Tracked 3 errors\n');

// Test 6: Track Performance
console.log('Test 6: Tracking performance...');
const operations = ['SEARCH_FLIGHT', 'BOOK_HOTEL', 'PROCESS_PAYMENT'];

for (let i = 0; i < 12; i++) {
  const duration = Math.floor(Math.random() * 1000) + 50;
  
  dataCollector.trackPerformance(
    operations[i % 3],
    duration,
    {
      success: true
    }
  );
}
console.log('✅ Tracked 12 performance metrics\n');

// Display Results
console.log('═══════════════════════════════════════════════════════\n');
console.log('📈 Analytics Summary:\n');

const stats = dataCollector.getStats();
console.log('Current Statistics:');
console.log(`  • User Actions: ${stats.metrics.userActions}`);
console.log(`  • API Calls: ${stats.metrics.apiCalls}`);
console.log(`  • Searches: ${stats.metrics.searches}`);
console.log(`  • Bookings: ${stats.metrics.bookings}`);
console.log(`  • Errors: ${stats.metrics.errors}`);
console.log(`  • Performance Metrics: ${stats.metrics.performance}`);
console.log('');

console.log('Aggregates:');
console.log(`  • Total Users: ${stats.aggregates.totalUsers}`);
console.log(`  • Total Searches: ${stats.aggregates.totalSearches}`);
console.log(`  • Total Bookings: ${stats.aggregates.totalBookings}`);
console.log(`  • Total Revenue: $${stats.aggregates.totalRevenue}`);
console.log(`  • Conversion Rate: ${stats.aggregates.conversionRate}%`);
console.log(`  • Avg Response Time: ${stats.aggregates.avgResponseTime}ms`);
console.log('');

// Get detailed summary
const summary = dataCollector.getAnalyticsSummary('1h');
console.log('Detailed Summary (Last Hour):');
console.log(`  • Users: ${summary.users.total} (${summary.users.actions} actions)`);
console.log(`  • Searches: ${summary.searches.total}`);
console.log(`  • Bookings: ${summary.bookings.successful}/${summary.bookings.total} successful`);
console.log(`  • Revenue: $${summary.bookings.revenue}`);
console.log(`  • API Success Rate: ${summary.apiCalls.successRate}%`);
console.log(`  • Conversion Rate: ${summary.conversionRate}%`);
console.log('');

// Popular destinations
console.log('Popular Destinations:');
Object.entries(summary.popularDestinations).forEach(([dest, count]) => {
  console.log(`  • ${dest}: ${count} searches`);
});
console.log('');

// API calls by service
console.log('API Calls by Service:');
Object.entries(summary.apiCalls.byService).forEach(([service, count]) => {
  console.log(`  • ${service}: ${count} calls`);
});
console.log('');

// Performance metrics
console.log('Performance Metrics:');
console.log(`  • Average: ${summary.performance.avgResponseTime}ms`);
console.log(`  • P50: ${summary.performance.p50}ms`);
console.log(`  • P95: ${summary.performance.p95}ms`);
console.log(`  • P99: ${summary.performance.p99}ms`);
console.log('');

// Real-time metrics
const realtime = dataCollector.getRealTimeMetrics();
console.log('Real-Time Metrics (Last 5 minutes):');
console.log(`  • Active Users: ${realtime.activeUsers}`);
console.log(`  • Requests/min: ${realtime.requestsPerMinute}`);
console.log(`  • Searches/min: ${realtime.searchesPerMinute}`);
console.log(`  • Bookings/min: ${realtime.bookingsPerMinute}`);
console.log(`  • Current Load: ${realtime.currentLoad}`);
console.log('');

// Service health
const health = dataCollector.getServiceHealth();
console.log('Service Health:');
console.log(`  • Overall Status: ${health.overall}`);
Object.entries(health.services).forEach(([service, status]) => {
  console.log(`  • ${service}: ${status.status} (${status.successRate}% success)`);
});
if (health.issues.length > 0) {
  console.log('  • Issues:');
  health.issues.forEach(issue => console.log(`    - ${issue}`));
}
console.log('');

console.log('═══════════════════════════════════════════════════════\n');
console.log('✅ Analytics system test completed successfully!\n');
console.log('Next steps:');
console.log('  1. Start the server: npm start');
console.log('  2. Access analytics API: http://localhost:5000/api/analytics/summary');
console.log('  3. View dashboard: http://localhost:5000/api/analytics/dashboard');
console.log('');
