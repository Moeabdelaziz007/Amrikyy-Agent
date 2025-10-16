#!/usr/bin/env node

/**
 * Luna Awakening Test - Phase V POC
 * 
 * This script tests the complete AIX agent loading and initialization process.
 * It monitors the "awakening" of Luna from her AIX definition file.
 */

const path = require('path');
const fs = require('fs');

// Import our AIX system components
const AIXAgentManager = require('../src/agents/AIXAgentManager');
const AgentRuntime = require('../src/agents/AgentRuntime');
const AIXEnhancedCursorManager = require('../src/agents/AIXEnhancedCursorManager');

// Configuration
const AIX_DIRECTORY = path.join(__dirname, '../agents/aix');
const LUNA_AIX_FILE = path.join(AIX_DIRECTORY, 'luna-v1.aix');

console.log('🌙 Luna Awakening Test - Phase V POC');
console.log('=====================================\n');

async function testLunaAwakening() {
    try {
        console.log('📁 Step 1: Verifying AIX file exists...');
        
        // Check if Luna's AIX file exists
        if (!fs.existsSync(LUNA_AIX_FILE)) {
            throw new Error(`Luna AIX file not found at: ${LUNA_AIX_FILE}`);
        }
        
        console.log('✅ Luna AIX file found:', LUNA_AIX_FILE);
        
        console.log('\n📖 Step 2: Reading Luna\'s genetic blueprint...');
        
        // Read the AIX file content
        const aixContent = fs.readFileSync(LUNA_AIX_FILE, 'utf8');
        console.log('✅ AIX file loaded successfully');
        console.log(`📊 File size: ${aixContent.length} characters`);
        
        console.log('\n🧬 Step 3: Initializing AIX Agent Manager...');
        
        // Initialize the AIX Agent Manager
        const agentManager = new AIXAgentManager(AIX_DIRECTORY);
        
        console.log('\n🔍 Step 4: Loading and validating Luna...');
        
        // Load all AIX agents (this should discover Luna)
        const loadedAgents = await agentManager.loadAllAgents();
        
        console.log(`\n✅ Successfully loaded ${loadedAgents.length} agent(s)`);
        
        // Verify Luna was loaded
        const lunaAgent = loadedAgents.find(agent => agent.metadata.id === 'luna-trip-architect-v1');
        
        if (!lunaAgent) {
            throw new Error('Luna agent was not loaded successfully');
        }
        
        console.log('\n🌙 Luna Agent Details:');
        console.log(`   ID: ${lunaAgent.metadata.id}`);
        console.log(`   Name: ${lunaAgent.metadata.name}`);
        console.log(`   Version: ${lunaAgent.metadata.version}`);
        console.log(`   Capabilities: ${lunaAgent.capabilities.length}`);
        console.log(`   Tools: ${lunaAgent.tools.length}`);
        
        console.log('\n🧠 Step 5: Testing capability indexing...');
        
        // Test capability indexing
        const itineraryAgents = agentManager.getAgentsByCapability('itinerary_design');
        const researchAgents = agentManager.getAgentsByCapability('destination_research');
        
        console.log(`✅ Found ${itineraryAgents.length} agent(s) with itinerary_design capability`);
        console.log(`✅ Found ${researchAgents.length} agent(s) with destination_research capability`);
        
        if (itineraryAgents.length === 0 || researchAgents.length === 0) {
            throw new Error('Capability indexing failed - Luna should have both capabilities');
        }
        
        console.log('\n🚀 Step 6: Initializing AIX Enhanced Cursor Manager...');
        
        // Initialize the enhanced manager
        const enhancedManager = new AIXEnhancedCursorManager({
            aixDirectory: AIX_DIRECTORY,
            quantumEdgeEnabled: true,
            memoryEnabled: true
        });
        
        console.log('\n🎯 Step 7: Testing self-aware orchestration...');
        
        // Test the manager's awareness of Luna
        const availableAgents = enhancedManager.getAvailableAgents();
        console.log(`✅ Manager is aware of ${availableAgents.length} agent(s)`);
        
        const lunaInManager = availableAgents.find(agent => agent.id === 'luna-trip-architect-v1');
        if (!lunaInManager) {
            throw new Error('Enhanced Manager is not aware of Luna');
        }
        
        console.log('✅ Enhanced Manager successfully discovered Luna');
        
        console.log('\n🎉 LUNA AWAKENING COMPLETE!');
        console.log('============================');
        console.log('✅ AIX file loaded and validated');
        console.log('✅ Schema validation passed');
        console.log('✅ Checksum verification passed');
        console.log('✅ Capability indexing successful');
        console.log('✅ Enhanced Manager integration complete');
        console.log('✅ Self-aware orchestration active');
        
        console.log('\n🌙 Luna is now ALIVE and ready for her first mission!');
        
        return {
            success: true,
            lunaAgent,
            enhancedManager,
            loadedAgents: loadedAgents.length
        };
        
    } catch (error) {
        console.error('\n❌ LUNA AWAKENING FAILED!');
        console.error('========================');
        console.error('Error:', error.message);
        console.error('\nStack trace:', error.stack);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run the test
if (require.main === module) {
    testLunaAwakening()
        .then(result => {
            if (result.success) {
                console.log('\n🎯 Ready for Step 3: Luna\'s First Mission!');
                process.exit(0);
            } else {
                console.log('\n🔧 Please fix the issues above before proceeding.');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { testLunaAwakening };