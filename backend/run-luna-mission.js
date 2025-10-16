#!/usr/bin/env node

/**
 * Run Luna Mission - Quick Execution
 * 
 * Quick script to execute Luna's first mission
 */

const { lunaFirstMission } = require('./luna-first-mission.js');

console.log('🚀 Executing Luna\'s First Mission...\n');

lunaFirstMission()
    .then(result => {
        if (result.success) {
            console.log('\n🎉 MISSION SUCCESS!');
            console.log('==================');
            console.log('✅ Luna executed her first real-world mission');
            console.log('✅ AIX architecture validated in production');
            console.log('✅ System ready for user interactions');
        } else {
            console.log('\n❌ MISSION FAILED');
            console.log('=================');
            console.log('🔧 System needs debugging');
        }
    })
    .catch(error => {
        console.error('💥 Unexpected error:', error);
    });
