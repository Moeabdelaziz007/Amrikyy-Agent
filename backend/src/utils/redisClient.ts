
import * as redis from 'redis';
import logger from './logger';

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));

// We only connect once and export the connected client.
redisClient.connect();

logger.info('Central Redis client connected.');

export default redisClient;
