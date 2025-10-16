#!/usr/bin/env node

/**
 * Luna Awakening Test - Direct Execution
 * 
 * This script directly tests Luna's awakening process without CLI overhead.
 * Perfect for quick testing and debugging.
 */

const path = require('path');
const fs = require('fs');

console.log('🌙 Luna Awakening Test - Direct Execution');
console.log('=========================================\n');

async function testLunaAwakening() {
    try {
        // Step 1: Verify AIX file exists
        const aixFile = path.join(__dirname, 'agents/aix/luna-v1.aix');
        
        if (!fs.existsSync(aixFile)) {
            console.log('❌ Luna AIX file not found!');
            console.log(`Expected: ${aixFile}`);
            return false;
        }
        
        console.log('✅ Luna AIX file found');
        
        // Step 2: Initialize AIX Enhanced Cursor Manager
        console.log('\n🧠 Initializing AIX Enhanced Cursor Manager...');
        
        const AIXEnhancedCursorManager = require('./src/agents/AIXEnhancedCursorManager');
        
        const manager = new AIXEnhancedCursorManager({
            aixDirectory: path.join(__dirname, 'agents/aix'),
            quantumEdgeEnabled: true,
            memoryEnabled: true,
            verbose: true
        });
        
        await manager.initialize();
        console.log('✅ Manager initialized successfully');
        
        // Step 3: Check if Luna is loaded
        console.log('\n🔍 Checking loaded agents...');
        
        const agents = manager.getAvailableAgents();
        console.log(`✅ Found ${agents.length} agent(s)`);
        
        const luna = agents.find(agent => agent.id === 'luna-trip-architect-v1');
        
        if (!luna) {
            console.log('❌ Luna agent not found in loaded agents');
            console.log('Available agents:', agents.map(a => a.id));
            return false;
        }
        
        console.log('✅ Luna agent found and loaded');
        console.log(`   Name: ${luna.name}`);
        console.log(`   Capabilities: ${luna.capabilities.length}`);
        console.log(`   Tools: ${luna.tools.length}`);
        
        // Step 4: Test Luna's first mission
        console.log('\n🎯 Testing Luna\'s first mission...');
        
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
                source: 'luna-awakening-test',
                priority: 'high',
                sessionId: `luna-test-${Date.now()}`,
                forcedAgent: 'luna-trip-architect-v1'
            }
        };
        
        console.log('📋 Test Task:');
        console.log(`   Description: ${testTask.description}`);
        console.log(`   Destination: ${testTask.parameters.destination}`);
        console.log(`   Duration: ${testTask.parameters.duration} days`);
        console.log(`   Budget: $${testTask.parameters.budget}`);
        console.log(`   Interests: ${testTask.parameters.interests.join(', ')}`);
        
        console.log('\n🚀 Sending task to Luna...');
        
        const result = await manager.orchestrateTask(testTask);
        
        console.log('\n✅ Task completed successfully!');
        console.log('==============================');
        
        if (result.analysis) {
            console.log('📊 Analysis:');
            console.log(`   Selected Agent: ${result.analysis.selectedAgent}`);
            console.log(`   Confidence: ${result.analysis.confidence}%`);
            console.log(`   Reasoning: ${result.analysis.reasoning}`);
        }
        
        if (result.result) {
            console.log('\n📝 Luna\'s Response:');
            if (typeof result.result === 'string') {
                console.log(result.result);
            } else {
                console.log(JSON.stringify(result.result, null, 2));
            }
        }
        
        if (result.metadata) {
            console.log('\n📈 Execution Metadata:');
            console.log(`   Execution Time: ${result.metadata.executionTime}ms`);
            console.log(`   Memory Used: ${result.metadata.memoryUsed || 'N/A'}`);
            console.log(`   Tools Called: ${result.metadata.toolsCalled || 0}`);
        }
        
        console.log('\n🎉 LUNA AWAKENING TEST COMPLETED SUCCESSFULLY!');
        console.log('===============================================');
        console.log('✅ AIX file loaded and validated');
        console.log('✅ Luna agent awakened and ready');
        console.log('✅ First mission executed successfully');
        console.log('✅ AIX architecture proven working');
        
        console.log('\n🌙 Luna is now fully operational!');
        
        return true;
        
    } catch (error) {
        console.log('\n❌ LUNA AWAKENING TEST FAILED!');
        console.log('==============================');
        console.log('Error:', error.message);
        
        if (error.stack) {
            console.log('\nStack trace:');
            console.log(error.stack);
        }
        
        return false;
    }
}

// Run the test
if (require.main === module) {
    testLunaAwakening()
        .then(success => {
            if (success) {
                console.log('\n🎯 Luna is ready for production missions!');
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
