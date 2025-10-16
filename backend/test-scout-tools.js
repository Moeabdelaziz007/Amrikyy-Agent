/**
 * Scout Tools Integration Test
 * Tests the three Scout's Senses tools for proper functionality
 * 
 * @author Maya Travel Agent
 * @version 1.0.0
 */

const { toolRegistry } = require('./src/tools');

class ScoutToolsTest {
    constructor() {
        this.testResults = [];
        this.testUserId = 'test_user_123';
    }

    async runAllTests() {
        console.log('🧪 Starting Scout Tools Integration Tests...\n');

        try {
            // Initialize tool registry
            await this.initializeTools();

            // Test each tool
            await this.testMonitorUserInterests();
            await this.testTrackPriceChanges();
            await this.testGenerateProactiveOffers();

            // Test integration workflow
            await this.testIntegrationWorkflow();

            // Display results
            this.displayResults();

        } catch (error) {
            console.error('❌ Test suite failed:', error);
            process.exit(1);
        }
    }

    async initializeTools() {
        console.log('🔧 Initializing tool registry...');
        
        try {
            await toolRegistry.initialize();
            this.addResult('Tool Registry Initialization', true, 'All tools loaded successfully');
            console.log('✅ Tool registry initialized\n');
        } catch (error) {
            this.addResult('Tool Registry Initialization', false, error.message);
            throw error;
        }
    }

    async testMonitorUserInterests() {
        console.log('🧠 Testing Monitor User Interests Tool...');
        
        try {
            const tool = toolRegistry.getTool('monitor_user_interests');
            
            if (!tool) {
                this.addResult('Monitor User Interests', false, 'Tool not found in registry');
                return;
            }

            // Test with mock user ID
            const result = await tool.execute({
                telegramId: this.testUserId,
                conversationLimit: 10,
                forceRefresh: true
            });

            if (result.success) {
                const interests = result.data.interests;
                this.addResult('Monitor User Interests', true, 
                    `Extracted ${interests.destinations.length} destinations, confidence: ${interests.confidenceScore}`);
            } else {
                this.addResult('Monitor User Interests', false, result.error);
            }

        } catch (error) {
            this.addResult('Monitor User Interests', false, error.message);
        }
        
        console.log('');
    }

    async testTrackPriceChanges() {
        console.log('💰 Testing Track Price Changes Tool...');
        
        try {
            const tool = toolRegistry.getTool('track_price_changes');
            
            if (!tool) {
                this.addResult('Track Price Changes', false, 'Tool not found in registry');
                return;
            }

            // Test with sample routes
            const result = await tool.execute({
                destinations: [
                    {
                        origin: 'CAI',
                        destination: 'IST',
                        departureDate: '2024-12-15',
                        returnDate: '2024-12-22'
                    },
                    {
                        origin: 'CAI',
                        destination: 'DXB',
                        departureDate: '2024-12-20',
                        returnDate: '2024-12-25'
                    }
                ],
                priceThreshold: 15,
                saveToDatabase: true
            });

            if (result.success) {
                const { results, summary } = result.data;
                this.addResult('Track Price Changes', true, 
                    `Checked ${results.length} routes, ${summary.significantDrops} significant drops found`);
            } else {
                this.addResult('Track Price Changes', false, result.error);
            }

        } catch (error) {
            this.addResult('Track Price Changes', false, error.message);
        }
        
        console.log('');
    }

    async testGenerateProactiveOffers() {
        console.log('🎯 Testing Generate Proactive Offers Tool...');
        
        try {
            const tool = toolRegistry.getTool('generate_proactive_offers');
            
            if (!tool) {
                this.addResult('Generate Proactive Offers', false, 'Tool not found in registry');
                return;
            }

            // Test with mock interests and price data
            const mockInterests = {
                destinations: ['Turkey', 'Dubai'],
                travelTypes: ['cultural', 'beach'],
                budgetRange: 'mid-range',
                preferredDurations: ['7 days', '10 days'],
                activities: ['sightseeing', 'shopping'],
                confidenceScore: 0.8
            };

            const mockPriceData = [
                {
                    route: 'CAI-IST',
                    currentPrice: 280,
                    previousPrice: 350,
                    isSignificantDrop: true
                }
            ];

            const result = await tool.execute({
                telegramId: this.testUserId,
                userInterests: mockInterests,
                priceData: mockPriceData,
                maxOffers: 3,
                includePersonalizedMessage: true
            });

            if (result.success) {
                const { offers, personalizedMessage } = result.data;
                this.addResult('Generate Proactive Offers', true, 
                    `Generated ${offers.length} offers, personalized message: ${personalizedMessage ? 'Yes' : 'No'}`);
            } else {
                this.addResult('Generate Proactive Offers', false, result.error);
            }

        } catch (error) {
            this.addResult('Generate Proactive Offers', false, error.message);
        }
        
        console.log('');
    }

    async testIntegrationWorkflow() {
        console.log('🔄 Testing Integration Workflow...');
        
        try {
            // Step 1: Monitor user interests
            const monitorTool = toolRegistry.getTool('monitor_user_interests');
            const interestsResult = await monitorTool.execute({
                telegramId: this.testUserId,
                forceRefresh: true
            });

            if (!interestsResult.success) {
                this.addResult('Integration Workflow', false, 'Failed to get user interests');
                return;
            }

            // Step 2: Track price changes
            const priceTool = toolRegistry.getTool('track_price_changes');
            const priceResult = await priceTool.execute({
                destinations: [
                    {
                        origin: 'CAI',
                        destination: 'IST',
                        departureDate: '2024-12-15'
                    }
                ],
                priceThreshold: 10
            });

            if (!priceResult.success) {
                this.addResult('Integration Workflow', false, 'Failed to track prices');
                return;
            }

            // Step 3: Generate proactive offers
            const offersTool = toolRegistry.getTool('generate_proactive_offers');
            const offersResult = await offersTool.execute({
                telegramId: this.testUserId,
                userInterests: interestsResult.data.interests,
                priceData: priceResult.data.results,
                maxOffers: 2
            });

            if (offersResult.success) {
                this.addResult('Integration Workflow', true, 
                    'Complete workflow executed successfully');
            } else {
                this.addResult('Integration Workflow', false, 'Failed to generate offers');
            }

        } catch (error) {
            this.addResult('Integration Workflow', false, error.message);
        }
        
        console.log('');
    }

    addResult(testName, success, message) {
        this.testResults.push({
            test: testName,
            success,
            message,
            timestamp: new Date().toISOString()
        });
    }

    displayResults() {
        console.log('📊 Test Results Summary');
        console.log('======================\n');

        const passed = this.testResults.filter(r => r.success).length;
        const total = this.testResults.length;

        this.testResults.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${result.test}: ${result.message}`);
        });

        console.log(`\n📈 Overall: ${passed}/${total} tests passed`);

        if (passed === total) {
            console.log('🎉 All Scout Tools tests passed! The Scout\'s Senses are ready.\n');
            
            console.log('🚀 Next Steps:');
            console.log('1. Run the deployment script: ./scripts/deploy-scout-tools.sh');
            console.log('2. Start the Scout agent: node src/agents/scout-agent.js');
            console.log('3. Monitor proactive recommendations in your Telegram bot');
        } else {
            console.log('\n⚠️  Some tests failed. Please review the errors above.');
            process.exit(1);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const test = new ScoutToolsTest();
    test.runAllTests().catch(error => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });
}

module.exports = ScoutToolsTest;