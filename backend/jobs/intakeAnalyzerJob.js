/**
 * Intake Analyzer Cron Job
 * Runs every minute to process unprocessed messages
 */

const cron = require('node-cron');
const IntakeAnalyzer = require('../services/automation/IntakeAnalyzer');
const logger = require('../utils/logger');

// Track job statistics
const stats = {
  totalRuns: 0,
  totalProcessed: 0,
  totalSuccessful: 0,
  totalFailed: 0,
  lastRun: null,
  lastResult: null
};

/**
 * Run the intake analyzer job
 */
async function runJob() {
  const startTime = Date.now();
  stats.totalRuns++;
  stats.lastRun = new Date().toISOString();

  try {
    logger.info('🤖 Running Intake Analyzer job', {
      run: stats.totalRuns
    });

    // Process up to 10 messages per run
    const result = await IntakeAnalyzer.processUnprocessedMessages(10);

    // Update statistics
    stats.totalProcessed += result.processed;
    stats.totalSuccessful += result.successful;
    stats.totalFailed += result.failed;
    stats.lastResult = result;

    const duration = Date.now() - startTime;

    logger.info('✅ Intake Analyzer job completed', {
      run: stats.totalRuns,
      duration: `${duration}ms`,
      processed: result.processed,
      successful: result.successful,
      failed: result.failed,
      avgTime: result.avgTime ? `${result.avgTime}ms` : 'N/A'
    });

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('❌ Intake Analyzer job failed', {
      run: stats.totalRuns,
      duration: `${duration}ms`,
      error: error.message,
      stack: error.stack
    });

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get job statistics
 */
function getStats() {
  return {
    ...stats,
    successRate: stats.totalProcessed > 0
      ? Math.round((stats.totalSuccessful / stats.totalProcessed) * 100)
      : 0
  };
}

/**
 * Initialize and start the cron job
 */
function start() {
  // Run every minute
  const job = cron.schedule('* * * * *', async () => {
    await runJob();
  });

  logger.info('🚀 Intake Analyzer cron job started (runs every minute)');

  // Run immediately on start
  setTimeout(() => {
    runJob();
  }, 5000); // Wait 5 seconds after server start

  return job;
}

/**
 * Stop the cron job
 */
function stop(job) {
  if (job) {
    job.stop();
    logger.info('🛑 Intake Analyzer cron job stopped');
  }
}

module.exports = {
  start,
  stop,
  runJob,
  getStats
};
