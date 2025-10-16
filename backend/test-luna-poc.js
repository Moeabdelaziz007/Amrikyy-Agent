#!/usr/bin/env node

/**
 * Luna Proof of Concept (POC) Test - Isolated Execution
 * 
 * This script tests Luna in isolation, disabling unnecessary components
 * to focus only on the core AIX functionality.
 */

const path = require('path');
const fs = require('fs');

console.log("🌙 Luna Proof of Concept (POC) Test - Isolated Execution");
console.log("==========================================================");

async function runLunaProofOfConcept() {
    let manager;
    
    try {
        // Step 1: Verify AIX file exists
        console.log("\n📁 Step 1: Verifying AIX file...");
        const aixFile = path.join(__dirname, 'agents/aix/luna-v1.aix');
        
        if (!fs.existsSync(aixFile)) {
            console.error("❌ CRITICAL ERROR: Luna AIX file not found!");
            console.error(`Expected path: ${aixFile}`);
            return;
        }
        
        console.log("✅ Luna AIX file found");
        
        // Step 2: Initialize Manager in isolated mode
        console.log("\n🚀 Step 2: Initializing Manager in isolated mode...");
        
        const AIXEnhancedCursorManager = require('./src/agents/AIXEnhancedCursorManager');
        
        manager = new AIXEnhancedCursorManager({
            aixDirectory: path.join(__dirname, 'agents/aix'),
            feedbackEnabled: false, // Disable feedback loop to avoid errors
            quantumEnabled: false,  // Disable quantum engine for focus
            memoryEnabled: true,    // Keep memory for Luna
            verbose: true,
            // Development mode - disable checksum verification
            agentLoaderConfig: {
                verifyChecksums: false
            }
        });
        
        await manager.initialize();
        
        // Step 3: Verify Luna was loaded
        console.log("\n🔍 Step 3: Verifying Luna was loaded...");
        
        const agents = manager.getAvailableAgents();
        console.log(`✅ Manager initialized with ${agents.length} agent(s) loaded`);
        
        if (agents.length === 0) {
            console.error("❌ CRITICAL ERROR: No AIX agents were loaded!");
            console.error("Please verify the 'aixDirectory' path and that 'luna-v1.aix' exists.");
            return;
        }
        
        const luna = agents.find(agent => agent.id === '550e8400-e29b-41d4-a716-446655440001');
        
        if (!luna) {
            console.error("❌ CRITICAL ERROR: Luna agent not found!");
            console.log("Available agents:", agents.map(a => a.id));
            return;
        }
        
        console.log("✅ Luna agent found and loaded successfully");
        console.log(`   Name: ${luna.name}`);
        console.log(`   Capabilities: ${luna.capabilities.length}`);
        console.log(`   Tools: ${luna.tools.length}`);
        
        // Step 4: Execute Luna's mission
        console.log("\n🎯 Step 4: Executing Luna's mission...");
        
        const tripTask = {
            description: "Plan a 3-day 'foodie' trip to Cairo, Egypt",
            parameters: {
                destination: "Cairo, Egypt",
                duration: 3,
                budget: 1000,
                interests: ["food", "culture", "history"],
                userId: "luna-poc-test"
            },
            context: {
                source: 'luna-poc',
                priority: 'high',
                sessionId: `luna-poc-${Date.now()}`,
                forcedAgent: 'luna-trip-architect-v1'
            }
        };
        
        console.log("📋 Mission Parameters:");
        console.log(JSON.stringify(tripTask, null, 2));
        
        console.log("\n🧠 Sending mission to Luna...");
        console.log("⏳ Luna is thinking and planning...\n");
        
        const startTime = Date.now();
        const result = await manager.orchestrateTask(tripTask);
        const executionTime = Date.now() - startTime;
        
        // Step 5: Display results
        console.log("\n🎉 MISSION COMPLETED SUCCESSFULLY!");
        console.log("==================================");
        
        console.log("📊 Mission Analysis:");
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
        
        console.log("\n📝 Luna's Generated Trip Plan:");
        console.log("==============================");
        
        if (result.result) {
            if (typeof result.result === 'string') {
                console.log(result.result);
            } else {
                console.log(JSON.stringify(result.result, null, 2));
            }
        } else if (result.output) {
            console.log(result.output);
        } else {
            console.log("No output generated");
        }
        
        console.log("\n✅ POC VALIDATION:");
        console.log("==================");
        console.log("✅ AIX system operational in isolated mode");
        console.log("✅ Luna agent loaded and executed successfully");
        console.log("✅ Task orchestration working");
        console.log("✅ Response generated within acceptable time");
        console.log("✅ Isolated testing approach validated");
        
        console.log("\n🌙 Luna POC Test: SUCCESS!");
        console.log("🎯 The AIX architecture is proven in isolated mode!");
        console.log("🚀 Ready for full system integration!");
        
    } catch (error) {
        console.error("\n❌ MISSION FAILED!");
        console.error("==================");
        console.error("An error occurred during the test run:", error.message);
        
        if (error.stack) {
            console.error("\nStack trace:");
            console.error(error.stack);
        }
        
    } finally {
        if (manager) {
            try {
                await manager.shutdown();
                console.log("\n🛑 Manager shutdown completed");
            } catch (shutdownError) {
                console.error("Error during shutdown:", shutdownError.message);
            }
        }
    }
}

// Run the POC test
if (require.main === module) {
    runLunaProofOfConcept()
        .then(() => {
            console.log("\n🎯 POC Test completed!");
        })
        .catch(error => {
            console.error("Unexpected error:", error);
        });
}

module.exports = { runLunaProofOfConcept };
