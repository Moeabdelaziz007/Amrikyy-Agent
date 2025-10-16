#!/usr/bin/env node

/**
 * اختبار بوت Telegram مع LLM
 * اختبار مبسط من المجلد الرئيسي
 */

console.log('🧪 اختبار بوت Telegram مع LLM...\n');

// تغيير إلى مجلد backend
process.chdir('./backend');

// تشغيل الاختبار
require('./test-bot-simple.js');
