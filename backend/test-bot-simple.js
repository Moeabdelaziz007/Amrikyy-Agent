#!/usr/bin/env node

/**
 * اختبار بسيط لبوت Telegram مع LLM
 */

require('dotenv').config();

async function testBot() {
    console.log('🚀 بدء اختبار بوت Telegram مع LLM...\n');
    
    try {
        // التحقق من متغيرات البيئة
        if (!process.env.TELEGRAM_BOT_TOKEN) {
            throw new Error('TELEGRAM_BOT_TOKEN غير محدد');
        }
        
        if (!process.env.ZAI_API_KEY) {
            throw new Error('ZAI_API_KEY غير محدد');
        }
        
        console.log('✅ متغيرات البيئة محددة');
        
        // اختبار Z.ai
        const ZaiClient = require('./src/ai/zaiClient');
        const zaiClient = new ZaiClient();
        
        console.log('🔗 اختبار الاتصال بـ Z.ai...');
        const healthCheck = await zaiClient.healthCheck();
        
        if (healthCheck.success) {
            console.log('✅ الاتصال بـ Z.ai يعمل');
        } else {
            throw new Error('فشل الاتصال بـ Z.ai');
        }
        
        // اختبار محادثة
        console.log('💬 اختبار محادثة...');
        const response = await zaiClient.chatCompletion([
            { role: 'system', content: 'أنت مساعد ذكي. أجب بجملة قصيرة.' },
            { role: 'user', content: 'مرحبا، كيف حالك؟' }
        ], {
            maxTokens: 50,
            temperature: 0.7
        });
        
        if (response.success) {
            console.log('✅ المحادثة تعمل');
            console.log(`الرد: ${response.content.substring(0, 100)}...`);
        } else {
            throw new Error('فشل في المحادثة');
        }
        
        // تهيئة البوت
        console.log('🤖 تهيئة البوت...');
        const LLMTelegramBot = require('./src/telegram/LLMTelegramBot');
        const bot = new LLMTelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
            polling: false
        });
        
        const botInfo = await bot.getBotInfo();
        if (botInfo) {
            console.log(`✅ البوت: @${botInfo.username}`);
            console.log(`✅ الاسم: ${botInfo.first_name}`);
        }
        
        console.log('\n🎉 جميع الاختبارات نجحت!');
        console.log('\nلبدء البوت استخدم:');
        console.log('node start-llm-telegram.js');
        console.log('\nأو أرسل رسالة للبوت على Telegram:');
        console.log(`https://t.me/${botInfo.username}`);
        
    } catch (error) {
        console.error('❌ خطأ:', error.message);
        process.exit(1);
    }
}

testBot();
