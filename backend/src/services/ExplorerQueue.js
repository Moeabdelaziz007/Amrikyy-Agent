const { Queue, Worker } = require('bullmq');
const WebAnalysisService = require('../services/WebAnalysisService');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

const explorerQueue = new Queue('explorer-jobs', { connection });

const explorerWorker = new Worker(
  'explorer-jobs',
  async (job) => {
    const { question, options } = job.data;
    // It's better to use dependency injection here, but for simplicity, we instantiate it.
    const webAnalysisService = new WebAnalysisService();

    try {
      await job.updateProgress(10);
      const result = await webAnalysisService.getAnswerFromWeb(question, options);
      await job.updateProgress(100);
      return result;
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      throw error; // This will mark the job as failed
    }
  },
  { connection, concurrency: 5 }
);

console.log('Explorer worker started.');

module.exports = { explorerQueue, explorerWorker };
