
require('dotenv').config();

const UnifiedBot = require('./src/bot/UnifiedBot');
const NoAIStrategy = require('./src/bot/strategies/NoAIStrategy');
const ZaiStrategy = require('./src/bot/strategies/ZaiStrategy');
const GeminiStrategy = require('./src/bot/strategies/GeminiStrategy');
const logger = require('./utils/logger');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const AI_STRATEGY = process.env.AI_STRATEGY || 'NoAI'; // Default to NoAI

/**
 * Selects and instantiates the appropriate AI strategy based on environment variables.
 * @returns {AIStrategy} An instance of an AI strategy.
 */
function selectAIStrategy() {
  switch (AI_STRATEGY.toLowerCase()) {
    case 'zai':
      logger.info('Using Z.ai strategy.');
      return new ZaiStrategy();
    case 'gemini':
      logger.info('Using Gemini strategy.');
      return new GeminiStrategy();
    case 'noai':
    default:
      logger.info('Using NoAI strategy.');
      return new NoAIStrategy();
  }
}

/**
 * Main function to initialize and run the bot.
 */
function main() {
  if (!BOT_TOKEN) {
    logger.error('TELEGRAM_BOT_TOKEN is not set in the environment variables.');
    process.exit(1);
  }

  const aiStrategy = selectAIStrategy();

  const bot = new UnifiedBot(BOT_TOKEN, aiStrategy, { polling: true });

  bot.start();

  logger.info(`Unified Telegram Bot started successfully with ${aiStrategy.name} strategy.`);
}

main();
