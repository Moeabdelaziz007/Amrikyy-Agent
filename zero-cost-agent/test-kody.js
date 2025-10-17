#!/usr/bin/env node

import KodyMarketingAgent from './kody-marketing-agent.js';

async function testKody() {
    console.log('🧪 Testing Kody Marketing Agent...\n');
    
    const kody = new KodyMarketingAgent();
    
    // Test 1: Market Analysis
    console.log('Test 1: Market Analysis');
    console.log('=======================');
    const analysis = await kody.analyzeMarket('AI travel agents');
    console.log('Results:', JSON.stringify(analysis, null, 2));
    console.log('\n');
    
    // Test 2: Content Generation
    console.log('Test 2: Content Generation');
    console.log('==========================');
    const content = await kody.generateContent('sustainable tourism', 'blog');
    console.log('Results:', JSON.stringify(content, null, 2));
    console.log('\n');
    
    // Test 3: Social Media Monitoring
    console.log('Test 3: Social Media Monitoring');
    console.log('================================');
    const monitoring = await kody.monitorSocialMedia('Amrikyy');
    console.log('Results:', JSON.stringify(monitoring, null, 2));
    console.log('\n');
    
    console.log('✅ All tests completed!');
}

testKody().catch(console.error);
