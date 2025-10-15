/**
 * Logger Performance Test
 * 
 * Tests the Ultra-Smart Logger performance improvements
 */

const logger = require('./logger');

console.log('🚀 Starting Logger Performance Test...\n');

// Test 1: High-frequency logging
console.log('Test 1: High-frequency logging (10,000 logs)');
const start1 = Date.now();

for (let i = 0; i < 10000; i++) {
  logger.debug('Processing item', { itemId: i, timestamp: Date.now() });
}

const duration1 = Date.now() - start1;
console.log(`✅ Completed in ${duration1}ms\n`);

// Test 2: Similar message aggregation
console.log('Test 2: Similar message aggregation (1,000 similar logs)');
const start2 = Date.now();

for (let i = 0; i < 1000; i++) {
  logger.info('User connected');
}

const duration2 = Date.now() - start2;
console.log(`✅ Completed in ${duration2}ms\n`);

// Test 3: Mixed log levels
console.log('Test 3: Mixed log levels (5,000 logs)');
const start3 = Date.now();

for (let i = 0; i < 5000; i++) {
  const level = i % 4;
  switch (level) {
    case 0:
      logger.error('Error message', null, { code: i });
      break;
    case 1:
      logger.warn('Warning message', { code: i });
      break;
    case 2:
      logger.info('Info message', { code: i });
      break;
    case 3:
      logger.debug('Debug message', { code: i });
      break;
  }
}

const duration3 = Date.now() - start3;
console.log(`✅ Completed in ${duration3}ms\n`);

// Test 4: Specialized logging methods
console.log('Test 4: Specialized logging methods (1,000 logs)');
const start4 = Date.now();

for (let i = 0; i < 1000; i++) {
  logger.apiCall('GET', `/api/users/${i}`, 200, 45);
  logger.userAction(i, 'view_profile', { page: 'profile' });
  logger.performance('database_query', 120);
}

const duration4 = Date.now() - start4;
console.log(`✅ Completed in ${duration4}ms\n`);

// Wait for buffer to flush
setTimeout(() => {
  // Get metrics
  console.log('📊 Logger Performance Metrics:\n');
  const metrics = logger.getMetrics();
  
  console.log('Total Logs:', metrics.totalLogs);
  console.log('Sampled (skipped):', metrics.sampledLogs);
  console.log('Aggregated:', metrics.aggregatedLogs);
  console.log('Console Writes:', metrics.consoleWrites);
  console.log('File Writes:', metrics.fileWrites);
  console.log('Flushes:', metrics.flushes);
  console.log('Errors:', metrics.errors);
  console.log('Avg Flush Time:', metrics.avgFlushTime.toFixed(2) + 'ms');
  console.log('Buffer Size:', metrics.bufferSize);
  console.log('Aggregation Map Size:', metrics.aggregationMapSize);
  
  console.log('\n📈 Performance Efficiency:\n');
  console.log('Sampling Efficiency:', metrics.performance.samplingEfficiency);
  console.log('Aggregation Efficiency:', metrics.performance.aggregationEfficiency);
  console.log('Avg Flush Time:', metrics.performance.avgFlushTimeMs + 'ms');
  
  console.log('\n⚙️ Configuration:\n');
  console.log('Log to Console:', metrics.config.logToConsole);
  console.log('Log to File:', metrics.config.logToFile);
  console.log('Sampling Rate:', metrics.config.samplingRate);
  console.log('Batch Size:', metrics.config.batchSize);
  console.log('Flush Interval:', metrics.config.flushInterval + 'ms');
  console.log('Log Format:', metrics.config.logFormat);
  console.log('Compress Logs:', metrics.config.compressLogs);
  
  // Health check
  console.log('\n🏥 Logger Health Check:\n');
  const health = logger.healthCheck();
  console.log('Status:', health.status);
  if (health.issues.length > 0) {
    console.log('Issues:', health.issues);
  } else {
    console.log('No issues detected ✅');
  }
  
  // Calculate performance improvement
  console.log('\n🚀 Performance Summary:\n');
  const totalTime = duration1 + duration2 + duration3 + duration4;
  const logsPerSecond = (metrics.totalLogs / (totalTime / 1000)).toFixed(0);
  
  console.log('Total Test Time:', totalTime + 'ms');
  console.log('Total Logs Generated:', metrics.totalLogs);
  console.log('Logs per Second:', logsPerSecond);
  console.log('Actual Writes:', metrics.consoleWrites + metrics.fileWrites);
  console.log('Write Reduction:', 
    ((1 - (metrics.consoleWrites + metrics.fileWrites) / metrics.totalLogs) * 100).toFixed(2) + '%');
  
  console.log('\n✅ Performance test complete!');
  
  // Force flush and exit
  setTimeout(() => {
    process.exit(0);
  }, 2000);
}, 1000);
