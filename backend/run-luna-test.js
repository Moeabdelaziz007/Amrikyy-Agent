#!/usr/bin/env node

/**
 * Run Luna Test - Direct Execution
 * 
 * This script directly executes the Luna awakening test
 */

const { directLunaTest } = require('./examples/direct-luna-test.js');

console.log('🚀 Starting Luna Awakening Test...\n');

directLunaTest()
    .then(success => {
        if (success) {
            console.log('\n🎉 LUNA AWAKENING SUCCESSFUL!');
            console.log('==============================');
            console.log('✅ All tests passed');
            console.log('✅ Luna is ready for missions');
            console.log('✅ AIX architecture validated');
            console.log('\n🌙 Luna is now ALIVE and operational!');
        } else {
            console.log('\n❌ LUNA AWAKENING FAILED');
            console.log('========================');
            console.log('🔧 Please check the errors above');
        }
    })
    .catch(error => {
        console.error('\n💥 Unexpected error:', error);
    });
