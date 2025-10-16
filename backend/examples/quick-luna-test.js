#!/usr/bin/env node

/**
 * Quick Luna Awakening Test
 * Simple script to test Luna's AIX loading process
 */

const path = require('path');
const fs = require('fs');

console.log('🌙 Luna Awakening Test - Quick Version');
console.log('=====================================\n');

async function quickTest() {
    try {
        // Step 1: Check AIX file exists
        const aixFile = path.join(__dirname, '../agents/aix/luna-v1.aix');
        
        if (!fs.existsSync(aixFile)) {
            console.log('❌ Luna AIX file not found!');
            console.log(`Expected location: ${aixFile}`);
            return false;
        }
        
        console.log('✅ Luna AIX file found');
        
        // Step 2: Read and validate basic structure
        const content = fs.readFileSync(aixFile, 'utf8');
        
        // Check for key AIX elements
        const hasMetadata = content.includes('<metadata>');
        const hasPersonality = content.includes('<personality>');
        const hasCapabilities = content.includes('<capabilities>');
        const hasTools = content.includes('<tools>');
        
        console.log(`✅ File size: ${content.length} characters`);
        console.log(`✅ Has metadata: ${hasMetadata}`);
        console.log(`✅ Has personality: ${hasPersonality}`);
        console.log(`✅ Has capabilities: ${hasCapabilities}`);
        console.log(`✅ Has tools: ${hasTools}`);
        
        if (!hasMetadata || !hasPersonality || !hasCapabilities || !hasTools) {
            console.log('❌ AIX file structure incomplete');
            return false;
        }
        
        // Step 3: Test AIX Agent Manager loading
        console.log('\n🧬 Testing AIX Agent Manager...');
        
        const AIXAgentManager = require('../src/agents/AIXAgentManager');
        const agentManager = new AIXAgentManager(path.dirname(aixFile));
        
        console.log('✅ AIX Agent Manager initialized');
        
        // Step 4: Load agents
        console.log('\n🔍 Loading agents...');
        const agents = await agentManager.loadAllAgents();
        
        console.log(`✅ Loaded ${agents.length} agent(s)`);
        
        // Find Luna
        const luna = agents.find(agent => agent.metadata.id === 'luna-trip-architect-v1');
        
        if (!luna) {
            console.log('❌ Luna agent not found in loaded agents');
            return false;
        }
        
        console.log('✅ Luna agent loaded successfully');
        console.log(`   Name: ${luna.metadata.name}`);
        console.log(`   Capabilities: ${luna.capabilities.length}`);
        console.log(`   Tools: ${luna.tools.length}`);
        
        // Step 5: Test capability indexing
        console.log('\n🧠 Testing capability indexing...');
        
        const itineraryAgents = agentManager.getAgentsByCapability('itinerary_design');
        const researchAgents = agentManager.getAgentsByCapability('destination_research');
        
        console.log(`✅ Found ${itineraryAgents.length} agent(s) with itinerary_design`);
        console.log(`✅ Found ${researchAgents.length} agent(s) with destination_research`);
        
        console.log('\n🎉 LUNA AWAKENING SUCCESSFUL!');
        console.log('==============================');
        console.log('✅ AIX file structure valid');
        console.log('✅ Agent Manager working');
        console.log('✅ Luna loaded and indexed');
        console.log('✅ Capability discovery active');
        
        console.log('\n🌙 Luna is ready for her first mission!');
        
        return true;
        
    } catch (error) {
        console.log('\n❌ LUNA AWAKENING FAILED!');
        console.log('========================');
        console.log('Error:', error.message);
        return false;
    }
}

// Run the test
quickTest().then(success => {
    if (success) {
        console.log('\n🎯 Ready for Step 3: Luna\'s First Mission!');
        process.exit(0);
    } else {
        console.log('\n🔧 Please fix the issues above.');
        process.exit(1);
    }
});
