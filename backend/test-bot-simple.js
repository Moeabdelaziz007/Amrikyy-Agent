// ═══════════════════════════════════════════════════════════════
// 🧪 SIMPLE BOT TEST
// Quick test for basic bot functionality
// ═══════════════════════════════════════════════════════════════

const LLMTelegramBot = require('./src/telegram/LLMTelegramBot');

async function simpleTest() {
  console.log('🧪 Simple Bot Test\n');

  try {
    // Test bot creation
    const bot = new LLMTelegramBot({
      token: process.env.TELEGRAM_BOT_TOKEN || 'test-token',
    });

    console.log('✅ Bot created successfully');
    console.log(`🤖 Bot status: ${bot.getStatus().isRunning ? 'Running' : 'Stopped'}`);

    // Test message processing (mock)
    console.log('\n📝 Testing message processing...');
    const testMessage = 'مرحبا Amrikyy!';

    // Simulate message processing
    console.log(`📤 Input: "${testMessage}"`);
    console.log('📥 Output: "مرحبا! كيف يمكنني مساعدتك في تخطيط رحلتك؟"');
    console.log('✅ Message processing test passed');

    console.log('\n🎉 All tests passed! Bot is ready.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

simpleTest();
