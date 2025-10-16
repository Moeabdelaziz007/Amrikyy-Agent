#!/usr/bin/env node

/**
 * Start AIX Telegram Bot
 * 
 * This script starts the AIX-integrated Telegram bot
 */

require('dotenv').config();
const AIXTelegramBot = require('./src/telegram/AIXTelegramBot');
const logger = require('./utils/logger');

console.log('🚀 Starting AIX Telegram Bot...');
console.log('===============================\n');

async function startBot() {
    try {
        // Check required environment variables
        if (!process.env.TELEGRAM_BOT_TOKEN) {
            console.error('❌ TELEGRAM_BOT_TOKEN environment variable is required');
            process.exit(1);
        }

        console.log('📋 Configuration:');
        console.log(`   Token: ${process.env.TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
        console.log(`   AIX Directory: ./agents/aix`);
        console.log(`   Quantum Edge: Enabled`);
        console.log(`   Memory System: Enabled`);

        // Initialize and start the bot
        const bot = new AIXTelegramBot({
            token: process.env.TELEGRAM_BOT_TOKEN,
            aixDirectory: './agents/aix',
            quantumEdgeEnabled: true,
            memoryEnabled: true,
            verbose: true
        });

        console.log('\n✅ AIX Telegram Bot started successfully!');
        console.log('🌙 Luna and other agents are ready for conversations');
        console.log('💬 Users can now chat with the AIX system through Telegram');

        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 Shutting down AIX Telegram Bot...');
            await bot.stop();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('\n🛑 Shutting down AIX Telegram Bot...');
            await bot.stop();
            process.exit(0);
        });

    } catch (error) {
        console.error('\n❌ Failed to start AIX Telegram Bot:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}

// Start the bot
startBot();
