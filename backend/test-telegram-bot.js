#!/usr/bin/env node
/**
 * Telegram Bot Connection Test
 * Tests the new bot token and verifies basic functionality
 */

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in .env file');
  process.exit(1);
}

console.log('🤖 Testing Telegram Bot Connection...\n');
console.log(`Token: ${token.substring(0, 20)}...${token.substring(token.length - 10)}\n`);

// Create bot instance
const bot = new TelegramBot(token, { polling: false });

// Test 1: Get bot info
async function testBotInfo() {
  try {
    console.log('📋 Test 1: Getting bot information...');
    const me = await bot.getMe();
    console.log('✅ Bot connected successfully!\n');
    console.log('Bot Details:');
    console.log(`  - ID: ${me.id}`);
    console.log(`  - Username: @${me.username}`);
    console.log(`  - Name: ${me.first_name}`);
    console.log(`  - Can Join Groups: ${me.can_join_groups}`);
    console.log(`  - Can Read Messages: ${me.can_read_all_group_messages}`);
    console.log(`  - Supports Inline: ${me.supports_inline_queries}\n`);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to bot:');
    console.error(`   Error: ${error.message}\n`);
    return false;
  }
}

// Test 2: Set bot commands
async function testSetCommands() {
  try {
    console.log('📋 Test 2: Setting bot commands...');
    const commands = [
      { command: 'start', description: 'Start the bot' },
      { command: 'help', description: 'Show help message' },
      { command: 'plan', description: 'Plan a new trip' },
      { command: 'search', description: 'Search flights and hotels' },
      { command: 'budget', description: 'Budget analysis' },
      { command: 'destinations', description: 'Browse destinations' },
      { command: 'profile', description: 'View your profile' },
      { command: 'settings', description: 'Bot settings' }
    ];
    
    await bot.setMyCommands(commands);
    console.log('✅ Bot commands set successfully!\n');
    
    // Verify commands
    const setCommands = await bot.getMyCommands();
    console.log('Configured Commands:');
    setCommands.forEach(cmd => {
      console.log(`  /${cmd.command} - ${cmd.description}`);
    });
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Failed to set commands:');
    console.error(`   Error: ${error.message}\n`);
    return false;
  }
}

// Test 3: Get webhook info
async function testWebhookInfo() {
  try {
    console.log('📋 Test 3: Checking webhook status...');
    const webhookInfo = await bot.getWebHookInfo();
    
    if (webhookInfo.url) {
      console.log('⚠️  Webhook is currently set:');
      console.log(`   URL: ${webhookInfo.url}`);
      console.log(`   Pending Updates: ${webhookInfo.pending_update_count}`);
      console.log('   Note: You may want to remove webhook for polling mode\n');
    } else {
      console.log('✅ No webhook set (good for polling mode)\n');
    }
    return true;
  } catch (error) {
    console.error('❌ Failed to get webhook info:');
    console.error(`   Error: ${error.message}\n`);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('═══════════════════════════════════════════════════════\n');
  
  const test1 = await testBotInfo();
  const test2 = await testSetCommands();
  const test3 = await testWebhookInfo();
  
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('📊 Test Results:');
  console.log(`   Bot Connection: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Commands Setup: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Webhook Check:  ${test3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  if (test1 && test2 && test3) {
    console.log('🎉 All tests passed! Bot is ready to use.\n');
    console.log('Next steps:');
    console.log('  1. Start the bot: npm run dev (in backend folder)');
    console.log('  2. Open Telegram and search for your bot');
    console.log('  3. Send /start to test the bot\n');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.\n');
  }
  
  process.exit(test1 && test2 && test3 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
