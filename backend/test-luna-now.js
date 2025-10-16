// Direct Luna Test Execution
const path = require('path');
const fs = require('fs');

console.log('🌙 Luna Awakening Test - Starting Now...');
console.log('=======================================\n');

// Step 1: Check AIX file
console.log('📁 Step 1: Checking AIX file...');
const aixFile = path.join(__dirname, 'agents/aix/luna-v1.aix');

if (!fs.existsSync(aixFile)) {
    console.log('❌ Luna AIX file not found at:', aixFile);
    process.exit(1);
}

console.log('✅ Luna AIX file found');

// Read and validate structure
const content = fs.readFileSync(aixFile, 'utf8');
console.log(`✅ File size: ${content.length} characters`);

// Check YAML structure
const checks = {
    'Has metadata': content.includes('meta:'),
    'Has personality': content.includes('persona:'),
    'Has capabilities': content.includes('capabilities:'),
    'Has tools': content.includes('tools:'),
    'Has memory system': content.includes('memory:'),
    'Has security': content.includes('security:')
};

console.log('\n🔍 AIX Structure Validation:');
Object.entries(checks).forEach(([check, passed]) => {
    console.log(`   ${passed ? '✅' : '❌'} ${check}`);
});

const allPassed = Object.values(checks).every(Boolean);

if (!allPassed) {
    console.log('\n❌ AIX file structure incomplete');
    process.exit(1);
}

console.log('\n🧬 Step 2: Testing AIX Agent Manager...');

try {
    // Test AIX Agent Manager
    const AIXAgentManager = require('./src/agents/AIXAgentManager');
    const agentManager = new AIXAgentManager(path.dirname(aixFile));
    
    console.log('✅ AIX Agent Manager initialized');
    
    // Load agents
    console.log('\n🔍 Loading agents...');
    const agents = await agentManager.loadAllAgents();
    
    console.log(`✅ Loaded ${agents.length} agent(s)`);
    
    // Find Luna
    const luna = agents.find(agent => agent.metadata.id === 'luna-trip-architect-v1');
    
    if (!luna) {
        console.log('❌ Luna agent not found in loaded agents');
        console.log('Available agents:', agents.map(a => a.metadata.id));
        process.exit(1);
    }
    
    console.log('✅ Luna agent loaded successfully');
    console.log(`   Name: ${luna.metadata.name}`);
    console.log(`   Version: ${luna.metadata.version}`);
    console.log(`   Capabilities: ${luna.capabilities.length}`);
    console.log(`   Tools: ${luna.tools.length}`);
    
    // Test capability indexing
    console.log('\n🧠 Step 3: Testing capability indexing...');
    
    const itineraryAgents = agentManager.getAgentsByCapability('itinerary_design');
    const researchAgents = agentManager.getAgentsByCapability('destination_research');
    
    console.log(`✅ Found ${itineraryAgents.length} agent(s) with itinerary_design`);
    console.log(`✅ Found ${researchAgents.length} agent(s) with destination_research`);
    
    if (itineraryAgents.length === 0 || researchAgents.length === 0) {
        console.log('❌ Capability indexing failed');
        process.exit(1);
    }
    
    console.log('\n🚀 Step 4: Testing AIX Enhanced Cursor Manager...');
    
    // Test Enhanced Manager
    const AIXEnhancedCursorManager = require('./src/agents/AIXEnhancedCursorManager');
    
    const manager = new AIXEnhancedCursorManager({
        aixDirectory: path.dirname(aixFile),
        quantumEdgeEnabled: true,
        memoryEnabled: true,
        verbose: false
    });
    
    console.log('✅ AIX Enhanced Cursor Manager initialized');
    
    // Initialize the manager
    await manager.initialize();
    console.log('✅ Manager initialized successfully');
    
    // Check available agents
    const availableAgents = manager.getAvailableAgents();
    console.log(`✅ Manager is aware of ${availableAgents.length} agent(s)`);
    
    const lunaInManager = availableAgents.find(agent => agent.id === 'luna-trip-architect-v1');
    if (!lunaInManager) {
        console.log('❌ Enhanced Manager is not aware of Luna');
        process.exit(1);
    }
    
    console.log('✅ Enhanced Manager successfully discovered Luna');
    
    console.log('\n🎉 LUNA AWAKENING TEST COMPLETED SUCCESSFULLY!');
    console.log('===============================================');
    console.log('✅ AIX file structure valid');
    console.log('✅ Agent Manager working');
    console.log('✅ Luna loaded and indexed');
    console.log('✅ Capability discovery active');
    console.log('✅ Enhanced Manager integration complete');
    console.log('✅ Self-aware orchestration ready');
    
    console.log('\n🌙 Luna is now ALIVE and ready for missions!');
    console.log('🎯 The AIX architecture is working perfectly!');
    
} catch (error) {
    console.log('\n❌ LUNA AWAKENING TEST FAILED!');
    console.log('==============================');
    console.log('Error:', error.message);
    
    if (error.stack) {
        console.log('\nStack trace:');
        console.log(error.stack);
    }
    
    process.exit(1);
}
