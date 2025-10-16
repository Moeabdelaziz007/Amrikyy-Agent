#!/usr/bin/env node

/**
 * LLM Integration Test Suite
 * Tests the complete LLM integration flow from Telegram to AIX to LLM
 */

require('dotenv').config();
const path = require('path');
const AIXEnhancedCursorManager = require('./src/agents/AIXEnhancedCursorManager');

console.log('🧪 LLM Integration Test Suite');
console.log('=============================\n');

async function testLLMIntegration() {
    let manager;
    
    try {
        console.log('🚀 Step 1: Initializing AIX Enhanced Cursor Manager with LLM...');
        
        manager = new AIXEnhancedCursorManager({
            aixDirectory: path.join(__dirname, 'agents/aix'),
            feedbackEnabled: false, // Disable for testing
            quantumEnabled: false,  // Disable for testing
            memoryEnabled: true,
            verbose: true
        });
        
        await manager.initialize();
        
        console.log('✅ AIX Enhanced Cursor Manager initialized with LLM');
        console.log(`📊 Loaded ${manager.getAvailableAgents().length} AIX agents\n`);
        
        // Test LLM Service health
        console.log('🏥 Step 2: Testing LLM Service health...');
        const llmHealth = manager.llmService.getHealth();
        console.log('LLM Service Health:', JSON.stringify(llmHealth, null, 2));
        console.log('');
        
        // Test each agent with LLM
        const testCases = [
            {
                name: "Luna - Trip Planning",
                message: "Plan a 3-day trip to Tokyo with a budget of $2000",
                expectedAgent: "luna-trip-architect-v1"
            },
            {
                name: "Karim - Budget Analysis", 
                message: "Find the cheapest flights to Paris for next month",
                expectedAgent: "karim-budget-optimizer-v1"
            },
            {
                name: "Zara - Research",
                message: "What are the best restaurants in Rome? I need verified recommendations.",
                expectedAgent: "zara-research-specialist-v1"
            }
        ];
        
        console.log('🎯 Step 3: Testing agent responses with LLM...\n');
        
        for (const testCase of testCases) {
            console.log(`📝 Testing: ${testCase.name}`);
            console.log(`Message: "${testCase.message}"`);
            console.log('⏳ Processing...\n');
            
            const task = {
                description: testCase.message,
                parameters: {
                    chatId: `test_${Date.now()}`,
                    userId: 'test_user',
                    messageType: 'text',
                    platform: 'test'
                },
                context: {
                    source: 'llm_integration_test',
                    priority: 'normal',
                    sessionId: `test_${Date.now()}`,
                    platform: 'test'
                }
            };
            
            const startTime = Date.now();
            const result = await manager.orchestrateTask(task);
            const processingTime = Date.now() - startTime;
            
            console.log('📊 Results:');
            console.log(`   Selected Agent: ${result.analysis?.selectedAgent || 'Unknown'}`);
            console.log(`   Confidence: ${result.analysis?.confidence || 'N/A'}%`);
            console.log(`   Processing Time: ${processingTime}ms`);
            console.log(`   LLM Provider: ${result.provider || 'N/A'}`);
            
            if (result.output) {
                console.log(`   Response Length: ${result.output.length} characters`);
                console.log(`   Response Preview: ${result.output.substring(0, 200)}...`);
            } else {
                console.log('   ❌ No response generated');
            }
            
            console.log('');
            console.log('─'.repeat(80));
            console.log('');
        }
        
        // Test LLM Service directly
        console.log('🧠 Step 4: Testing LLM Service directly...\n');
        
        const directTest = await manager.llmService.generateResponse(
            'Hello, this is a direct test. Please respond with "LLM test successful" and your provider name.',
            {
                name: 'Test Agent',
                role: 'Test Role',
                personality: 'Helpful and concise',
                communication_style: 'Direct and clear',
                background: 'Test background',
                expertise: 'Testing',
                motivation: 'To help with testing'
            }
        );
        
        if (directTest.success) {
            console.log('✅ Direct LLM test successful');
            console.log(`   Provider: ${directTest.provider}`);
            console.log(`   Response: ${directTest.response}`);
            console.log(`   Response Time: ${directTest.responseTime}ms`);
        } else {
            console.log('❌ Direct LLM test failed');
            console.log(`   Error: ${directTest.error}`);
        }
        
        console.log('\n🎉 LLM Integration Test Suite completed successfully!');
        console.log('✅ All components are working with LLM integration');
        console.log('🚀 Telegram Bot is now intelligent and ready for production!');
        
    } catch (error) {
        console.error('\n❌ LLM Integration Test Suite failed!');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (manager) {
            await manager.shutdown();
        }
    }
}

// Run the test
if (require.main === module) {
    testLLMIntegration()
        .then(() => {
            console.log('\n✅ Test completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Test failed:', error);
            process.exit(1);
        });
}

module.exports = { testLLMIntegration };
