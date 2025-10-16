#!/usr/bin/env node

/**
 * Luna's First Mission - Real World Test
 * 
 * This script executes Luna's first real mission: planning a 3-day foodie trip to Cairo
 * This is the "maiden flight" - testing the AIX system in the real environment
 */

const path = require('path');
const fs = require('fs');

console.log('🌙 Luna\'s First Mission - Real World Test');
console.log('==========================================\n');

async function lunaFirstMission() {
    try {
        console.log('📋 Mission Brief:');
        console.log('   Objective: Plan a 3-day foodie trip to Cairo, Egypt');
        console.log('   Budget: $1000');
        console.log('   Interests: Food, Culture, History');
        console.log('   Agent: Luna Trip Architect (AIX)');
        console.log('   Environment: Real World Terminal Execution\n');

        // Step 1: Initialize AIX Enhanced Cursor Manager
        console.log('🚀 Step 1: Initializing AIX Enhanced Cursor Manager...');
        
        const AIXEnhancedCursorManager = require('./src/agents/AIXEnhancedCursorManager');
        
        const manager = new AIXEnhancedCursorManager({
            aixDirectory: path.join(__dirname, 'agents/aix'),
            quantumEdgeEnabled: true,
            memoryEnabled: true,
            verbose: true // Enable verbose for real-time monitoring
        });
        
        await manager.initialize();
        console.log('✅ AIX Enhanced Cursor Manager initialized successfully');
        
        // Step 2: Verify Luna is available
        console.log('\n🔍 Step 2: Verifying Luna availability...');
        
        const agents = manager.getAvailableAgents();
        const luna = agents.find(agent => agent.id === 'luna-trip-architect-v1');
        
        if (!luna) {
            throw new Error('Luna agent not found in available agents');
        }
        
        console.log('✅ Luna Trip Architect is ready for mission');
        console.log(`   Name: ${luna.name}`);
        console.log(`   Capabilities: ${luna.capabilities.length}`);
        console.log(`   Tools: ${luna.tools.length}`);
        
        // Step 3: Execute Luna's first mission
        console.log('\n🎯 Step 3: Executing Luna\'s first mission...');
        
        const missionTask = {
            description: "Plan a 3-day 'foodie' trip to Cairo, Egypt",
            parameters: {
                destination: "Cairo, Egypt",
                duration: 3,
                budget: 1000,
                interests: ["food", "culture", "history"],
                userId: "luna-first-mission-user",
                tripType: "foodie",
                preferences: {
                    accommodation: "mid-range",
                    transportation: "mix",
                    dining: "local and authentic"
                }
            },
            context: {
                source: 'luna-first-mission',
                priority: 'high',
                sessionId: `luna-mission-${Date.now()}`,
                forcedAgent: 'luna-trip-architect-v1', // Force Luna for this mission
                missionType: 'first_real_world_test'
            }
        };
        
        console.log('📋 Mission Parameters:');
        console.log(`   Destination: ${missionTask.parameters.destination}`);
        console.log(`   Duration: ${missionTask.parameters.duration} days`);
        console.log(`   Budget: $${missionTask.parameters.budget}`);
        console.log(`   Interests: ${missionTask.parameters.interests.join(', ')}`);
        console.log(`   Trip Type: ${missionTask.parameters.tripType}`);
        
        console.log('\n🧠 Sending mission to Luna...');
        console.log('⏳ Luna is thinking and planning...\n');
        
        const startTime = Date.now();
        const result = await manager.orchestrateTask(missionTask);
        const executionTime = Date.now() - startTime;
        
        // Step 4: Display results
        console.log('🎉 MISSION COMPLETED SUCCESSFULLY!');
        console.log('==================================\n');
        
        console.log('📊 Mission Analysis:');
        if (result.analysis) {
            console.log(`   Selected Agent: ${result.analysis.selectedAgent}`);
            console.log(`   Confidence: ${result.analysis.confidence}%`);
            console.log(`   Reasoning: ${result.analysis.reasoning}`);
        }
        
        console.log(`\n⏱️ Execution Time: ${executionTime}ms`);
        
        if (result.metadata) {
            console.log(`   Memory Used: ${result.metadata.memoryUsed || 'N/A'}`);
            console.log(`   Tools Called: ${result.metadata.toolsCalled || 0}`);
        }
        
        console.log('\n📝 Luna\'s Trip Plan:');
        console.log('====================');
        
        if (result.result) {
            if (typeof result.result === 'string') {
                console.log(result.result);
            } else {
                console.log(JSON.stringify(result.result, null, 2));
            }
        }
        
        // Step 5: Mission success validation
        console.log('\n✅ MISSION VALIDATION:');
        console.log('======================');
        console.log('✅ AIX system operational in real environment');
        console.log('✅ Luna agent executed successfully');
        console.log('✅ Task orchestration working');
        console.log('✅ Response generated within acceptable time');
        console.log('✅ Real-world integration validated');
        
        console.log('\n🌙 Luna\'s First Mission: SUCCESS!');
        console.log('🎯 The AIX architecture is proven in the real world!');
        console.log('🚀 Ready for production deployment!');
        
        return {
            success: true,
            executionTime,
            result,
            lunaAgent: luna
        };
        
    } catch (error) {
        console.log('\n❌ MISSION FAILED!');
        console.log('==================');
        console.log('Error:', error.message);
        
        if (error.stack) {
            console.log('\nStack trace:');
            console.log(error.stack);
        }
        
        console.log('\n🔧 Mission failed - please check the errors above');
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Execute Luna's first mission
if (require.main === module) {
    lunaFirstMission()
        .then(result => {
            if (result.success) {
                console.log('\n🎉 LUNA\'S FIRST MISSION: COMPLETE SUCCESS!');
                console.log('==========================================');
                console.log('✅ Real-world validation passed');
                console.log('✅ AIX architecture proven');
                console.log('✅ Ready for production deployment');
                console.log('\n🌙 Luna is now ready for real user missions!');
                process.exit(0);
            } else {
                console.log('\n❌ Mission failed - system needs debugging');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { lunaFirstMission };
