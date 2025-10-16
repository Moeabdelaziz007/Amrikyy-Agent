/**
 * REPL Luna Test - Interactive Node.js Testing
 * 
 * This script provides an interactive testing environment
 * that you can run directly in Node.js REPL or any Node.js environment.
 */

const path = require('path');
const fs = require('fs');

console.log('🌙 REPL Luna Test - Interactive Testing Environment');
console.log('==================================================\n');

// Test functions that can be called interactively
const LunaTestSuite = {
    
    // Test 1: AIX File Validation
    async testAIXFile() {
        console.log('📁 Testing AIX file structure...');
        
        try {
            const aixFile = path.join(__dirname, '../agents/aix/luna-v1.aix');
            
            if (!fs.existsSync(aixFile)) {
                console.log('❌ Luna AIX file not found at:', aixFile);
                return false;
            }
            
            const content = fs.readFileSync(aixFile, 'utf8');
            console.log(`✅ File found: ${content.length} characters`);
            
            const checks = {
                'Has metadata': content.includes('<metadata>'),
                'Has personality': content.includes('<personality>'),
                'Has capabilities': content.includes('<capabilities>'),
                'Has tools': content.includes('<tools>'),
                'Has memory system': content.includes('<memory>'),
                'Has security': content.includes('<security>')
            };
            
            console.log('\n🔍 Structure validation:');
            Object.entries(checks).forEach(([check, passed]) => {
                console.log(`   ${passed ? '✅' : '❌'} ${check}`);
            });
            
            const allPassed = Object.values(checks).every(Boolean);
            console.log(`\n${allPassed ? '✅' : '❌'} AIX file structure: ${allPassed ? 'VALID' : 'INVALID'}`);
            
            return allPassed;
            
        } catch (error) {
            console.log('❌ Error testing AIX file:', error.message);
            return false;
        }
    },
    
    // Test 2: Agent Manager
    async testAgentManager() {
        console.log('🧬 Testing AIX Agent Manager...');
        
        try {
            const AIXAgentManager = require('../src/agents/AIXAgentManager');
            const agentManager = new AIXAgentManager(path.join(__dirname, '../agents/aix'));
            
            console.log('✅ Agent Manager initialized');
            
            const agents = await agentManager.loadAllAgents();
            console.log(`✅ Loaded ${agents.length} agent(s)`);
            
            const luna = agents.find(agent => agent.metadata.id === 'luna-trip-architect-v1');
            
            if (!luna) {
                console.log('❌ Luna agent not found');
                return false;
            }
            
            console.log('✅ Luna agent found:');
            console.log(`   Name: ${luna.metadata.name}`);
            console.log(`   Capabilities: ${luna.capabilities.length}`);
            console.log(`   Tools: ${luna.tools.length}`);
            
            // Test capability indexing
            const itineraryAgents = agentManager.getAgentsByCapability('itinerary_design');
            const researchAgents = agentManager.getAgentsByCapability('destination_research');
            
            console.log(`✅ Found ${itineraryAgents.length} agent(s) with itinerary_design`);
            console.log(`✅ Found ${researchAgents.length} agent(s) with destination_research`);
            
            return true;
            
        } catch (error) {
            console.log('❌ Error testing Agent Manager:', error.message);
            return false;
        }
    },
    
    // Test 3: Enhanced Cursor Manager
    async testEnhancedManager() {
        console.log('🚀 Testing AIX Enhanced Cursor Manager...');
        
        try {
            const AIXEnhancedCursorManager = require('../src/agents/AIXEnhancedCursorManager');
            
            const manager = new AIXEnhancedCursorManager({
                aixDirectory: path.join(__dirname, '../agents/aix'),
                quantumEdgeEnabled: true,
                memoryEnabled: true,
                verbose: false
            });
            
            console.log('✅ Enhanced Manager initialized');
            
            await manager.initialize();
            console.log('✅ Manager initialized successfully');
            
            const agents = manager.getAvailableAgents();
            console.log(`✅ Manager is aware of ${agents.length} agent(s)`);
            
            const luna = agents.find(agent => agent.id === 'luna-trip-architect-v1');
            
            if (!luna) {
                console.log('❌ Enhanced Manager is not aware of Luna');
                return false;
            }
            
            console.log('✅ Enhanced Manager successfully discovered Luna');
            return true;
            
        } catch (error) {
            console.log('❌ Error testing Enhanced Manager:', error.message);
            return false;
        }
    },
    
    // Test 4: Luna's First Mission
    async testLunaMission() {
        console.log('🎯 Testing Luna\'s first mission...');
        
        try {
            const AIXEnhancedCursorManager = require('../src/agents/AIXEnhancedCursorManager');
            
            const manager = new AIXEnhancedCursorManager({
                aixDirectory: path.join(__dirname, '../agents/aix'),
                quantumEdgeEnabled: true,
                memoryEnabled: true,
                verbose: false
            });
            
            await manager.initialize();
            
            const testTask = {
                description: "Plan a 3-day 'foodie' trip to Cairo, Egypt",
                parameters: {
                    destination: "Cairo, Egypt",
                    duration: 3,
                    budget: 1000,
                    interests: ["food", "culture", "history"],
                    userId: "luna-test-user"
                },
                context: {
                    source: 'repl-test',
                    priority: 'high',
                    sessionId: `repl-test-${Date.now()}`,
                    forcedAgent: 'luna-trip-architect-v1'
                }
            };
            
            console.log('📋 Test Task:');
            console.log(`   Description: ${testTask.description}`);
            console.log(`   Destination: ${testTask.parameters.destination}`);
            console.log(`   Duration: ${testTask.parameters.duration} days`);
            console.log(`   Budget: $${testTask.parameters.budget}`);
            
            console.log('\n🚀 Sending task to Luna...');
            
            const result = await manager.orchestrateTask(testTask);
            
            console.log('\n✅ Task completed successfully!');
            
            if (result.analysis) {
                console.log('📊 Analysis:');
                console.log(`   Selected Agent: ${result.analysis.selectedAgent}`);
                console.log(`   Confidence: ${result.analysis.confidence}%`);
            }
            
            if (result.result) {
                console.log('\n📝 Luna\'s Response:');
                if (typeof result.result === 'string') {
                    console.log(result.result);
                } else {
                    console.log(JSON.stringify(result.result, null, 2));
                }
            }
            
            return true;
            
        } catch (error) {
            console.log('❌ Error testing Luna mission:', error.message);
            return false;
        }
    },
    
    // Run all tests
    async runAllTests() {
        console.log('🎯 Running complete Luna awakening test suite...\n');
        
        const results = {
            aixFile: await this.testAIXFile(),
            agentManager: await this.testAgentManager(),
            enhancedManager: await this.testEnhancedManager(),
            lunaMission: await this.testLunaMission()
        };
        
        console.log('\n📊 Test Results Summary:');
        console.log('========================');
        
        Object.entries(results).forEach(([test, passed]) => {
            const status = passed ? '✅ PASSED' : '❌ FAILED';
            const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            console.log(`${status} - ${testName}`);
        });
        
        const allPassed = Object.values(results).every(Boolean);
        
        console.log(`\nOverall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
        
        if (allPassed) {
            console.log('\n🎉 Luna is ready for production missions!');
            console.log('🎯 The AIX architecture is working perfectly!');
        } else {
            console.log('\n🔧 Please fix the failed tests before proceeding.');
        }
        
        return results;
    }
};

// Export for use in REPL
module.exports = LunaTestSuite;

// Auto-run if this file is executed directly
if (require.main === module) {
    console.log('Available test functions:');
    console.log('- LunaTestSuite.testAIXFile()');
    console.log('- LunaTestSuite.testAgentManager()');
    console.log('- LunaTestSuite.testEnhancedManager()');
    console.log('- LunaTestSuite.testLunaMission()');
    console.log('- LunaTestSuite.runAllTests()');
    console.log('\nTo run all tests: await LunaTestSuite.runAllTests()');
    
    // Make it available globally in REPL
    global.LunaTestSuite = LunaTestSuite;
    
    console.log('\n🌙 Luna Test Suite loaded and ready!');
    console.log('Type: await LunaTestSuite.runAllTests() to start testing');
}
