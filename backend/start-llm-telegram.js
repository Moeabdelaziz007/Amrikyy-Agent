// ═══════════════════════════════════════════════════════════════
// 🚀 START LLM TELEGRAM BOT
// Simple script to start the LLM Telegram Bot
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const LLMTelegramBot = require('./src/telegram/LLMTelegramBot');
const { logger } = require('./src/utils/logger');

async function startBot() {
  console.log('🚀 Starting Amrikyy LLM Telegram Bot...\n');

  try {
    // Check for required environment variables
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.error('❌ TELEGRAM_BOT_TOKEN is required');
      console.log('Please set your Telegram bot token in .env file');
      process.exit(1);
    }

    // Initialize and start the bot
    const bot = new LLMTelegramBot({
      token: process.env.TELEGRAM_BOT_TOKEN,
    });

    await bot.start();

    console.log('✅ Amrikyy LLM Telegram Bot started successfully!');
    console.log('🤖 Bot is now listening for messages...');
    console.log('📱 Users can start chatting with: /start');
    console.log('');
    console.log('🛑 Press Ctrl+C to stop the bot');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down bot...');
      await bot.stop();
      console.log('✅ Bot stopped gracefully');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down bot...');
      await bot.stop();
      console.log('✅ Bot stopped gracefully');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start bot:', error.message);
    process.exit(1);
  }
}

// Start the bot
startBot();
