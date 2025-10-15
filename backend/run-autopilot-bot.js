#!/usr/bin/env node

/**
 * 🤖 AMRIKYY AUTOPILOT BOT
 * 
 * Full autonomous bot with:
 * - Auto-reply with AI
 * - Pattern learning
 * - Self-healing
 * - Analytics & monitoring
 * - Scheduled tasks
 * - Multi-agent system
 */

require('dotenv').config();

const UnifiedBot = require('./src/bot/UnifiedBot');
const NoAIStrategy = require('./src/bot/strategies/NoAIStrategy');
const ZaiStrategy = require('./src/bot/strategies/ZaiStrategy');
const GeminiStrategy = require('./src/bot/strategies/GeminiStrategy');
const AutopilotEngine = require('./src/autopilot/AutopilotEngine');
const logger = require('./utils/logger');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const AI_STRATEGY = process.env.AI_STRATEGY || 'NoAI';
const AUTOPILOT_ENABLED = process.env.AUTOPILOT_ENABLED !== 'false'; // Default: true

/**
 * Select AI Strategy
 */
function selectAIStrategy() {
  switch (AI_STRATEGY.toLowerCase()) {
    case 'zai':
      logger.info('🧠 Using Z.ai strategy');
      return new ZaiStrategy();
    case 'gemini':
      logger.info('🧠 Using Gemini strategy');
      return new GeminiStrategy();
    case 'noai':
    default:
      logger.info('🧠 Using NoAI strategy');
      return new NoAIStrategy();
  }
}

/**
 * Main Function
 */
async function main() {
  console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🤖 AMRIKYY AUTOPILOT BOT v1.0              ║
║   Your Intelligent Travel Assistant           ║
║                                               ║
║   Features:                                   ║
║   ✅ Auto-Reply with AI                      ║
║   ✅ Pattern Learning                        ║
║   ✅ Self-Healing System                     ║
║   ✅ Analytics & Monitoring                  ║
║   ✅ Scheduled Tasks                         ║
║   ✅ Multi-Agent Coordination                ║
║                                               ║
╚═══════════════════════════════════════════════╝
  `);

  // Validate bot token
  if (!BOT_TOKEN) {
    logger.error('❌ TELEGRAM_BOT_TOKEN is not set!');
    console.error('Please set TELEGRAM_BOT_TOKEN in your .env file');
    process.exit(1);
  }

  try {
    // Initialize AI Strategy
    logger.info('🔧 Initializing AI strategy...');
    const aiStrategy = selectAIStrategy();

    // Initialize Bot
    logger.info('🤖 Initializing Telegram bot...');
    const bot = new UnifiedBot(BOT_TOKEN, aiStrategy, { 
      polling: true,
      polling: {
        params: {
          timeout: 10
        }
      }
    });

    // Start Bot
    logger.info('🚀 Starting bot...');
    bot.start();
    logger.info(`✅ Bot started with ${aiStrategy.name} strategy`);

    // Initialize Autopilot if enabled
    if (AUTOPILOT_ENABLED) {
      logger.info('🤖 Initializing Autopilot Engine...');
      const autopilot = new AutopilotEngine(bot.bot, aiStrategy);
      
      const result = await autopilot.start();
      
      console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   ✅ AUTOPILOT ACTIVATED!                    ║
║                                               ║
║   Active Features:                            ║
${result.features.map(f => `║   • ${f.padEnd(42)}║`).join('\n')}
║                                               ║
║   Bot is now running autonomously! 🚀        ║
║                                               ║
╚═══════════════════════════════════════════════╝
      `);

      // Expose autopilot for monitoring
      global.autopilot = autopilot;

      // Setup monitoring commands
      bot.bot.onText(/\/autopilot_stats/, async (msg) => {
        const stats = autopilot.getStats();
        await bot.bot.sendMessage(
          msg.chat.id,
          `📊 *Autopilot Statistics*\n\n` +
          `⏱️ Uptime: ${Math.floor(stats.uptime_seconds / 60)} minutes\n` +
          `📨 Messages: ${stats.messagesProcessed}\n` +
          `🤖 Auto-replies: ${stats.autoRepliesSent}\n` +
          `🛡️ Errors handled: ${stats.errorsHandled}\n` +
          `🧠 Patterns learned: ${stats.patternsLearned}\n` +
          `👥 Active users: ${stats.active_users}\n` +
          `🟢 Status: ${stats.is_active ? 'Active' : 'Inactive'}`,
          { parse_mode: 'Markdown' }
        );
      });

      bot.bot.onText(/\/autopilot_health/, async (msg) => {
        const health = await autopilot.performHealthCheck();
        await bot.bot.sendMessage(
          msg.chat.id,
          `🏥 *Autopilot Health Check*\n\n` +
          `Status: ${health.status}\n` +
          `Autopilot: ${health.autopilot ? '✅ Active' : '❌ Inactive'}\n\n` +
          `*Agents Status:*\n` +
          health.agents.map(a => `• ${a.name}: ${a.available ? '✅' : '❌'}`).join('\n'),
          { parse_mode: 'Markdown' }
        );
      });

      // Log statistics every 5 minutes
      setInterval(() => {
        const stats = autopilot.getStats();
        logger.info('📊 Autopilot Stats', stats);
      }, 5 * 60 * 1000);

    } else {
      logger.info('⚠️ Autopilot is disabled');
      console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   ⚠️  AUTOPILOT DISABLED                     ║
║                                               ║
║   Bot is running in manual mode               ║
║   Set AUTOPILOT_ENABLED=true to enable       ║
║                                               ║
╚═══════════════════════════════════════════════╝
      `);
    }

    // Log success
    logger.info('🎉 Amrikyy Bot is fully operational!');
    logger.info(`📡 Bot username: @${(await bot.bot.getMe()).username}`);
    
  } catch (error) {
    logger.error('❌ Failed to start bot', error);
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  if (global.autopilot) {
    await global.autopilot.stop();
  }
  
  logger.info('👋 Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  
  if (global.autopilot) {
    await global.autopilot.stop();
  }
  
  process.exit(0);
});

// Start the bot
main().catch(error => {
  logger.error('Fatal error in main()', error);
  process.exit(1);
});

