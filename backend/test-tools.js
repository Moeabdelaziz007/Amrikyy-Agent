/**
 * Test Script for AIX Tools
 * Tests all implemented tools to ensure they work correctly
 * 
 * @author Amrikyy AI Solutions
 * @version 1.0.0
 */

const { initialize, testAll, toolRegistry } = require('./src/tools');

async function testAixTools() {
    console.log('🧪 AIX Tools Test Suite');
    console.log('========================\n');
    
    try {
        // Step 1: Initialize tools
        console.log('🚀 Step 1: Initializing tools...');
        const initialized = await initialize();
        
        if (!initialized) {
            console.error('❌ Failed to initialize tools');
            return;
        }
        
        console.log('✅ Tools initialized successfully\n');
        
        // Step 2: Test individual tools
        console.log('🧪 Step 2: Testing individual tools...\n');
        
        // Test search_flights
        console.log('✈️ Testing search_flights tool...');
        const flightResult = await toolRegistry.executeTool('search_flights', {
            origin: 'CAI',
            destination: 'LHR',
            departure_date: '2025-12-01',
            passengers: 2,
            class: 'economy'
        });
        console.log('📊 Flight search result:', flightResult.success ? '✅ SUCCESS' : '❌ FAILED');
        if (flightResult.success) {
            console.log(`   Found ${flightResult.data.flights.length} flights`);
            console.log(`   Price range: $${flightResult.data.flights[0]?.price?.amount} - $${flightResult.data.flights[flightResult.data.flights.length - 1]?.price?.amount}`);
        }
        console.log();
        
        // Test find_hotels
        console.log('🏨 Testing find_hotels tool...');
        const hotelResult = await toolRegistry.executeTool('find_hotels', {
            destination: 'Cairo',
            check_in: '2025-12-01',
            check_out: '2025-12-05',
            guests: 2,
            rooms: 1,
            star_rating: 4
        });
        console.log('📊 Hotel search result:', hotelResult.success ? '✅ SUCCESS' : '❌ FAILED');
        if (hotelResult.success) {
            console.log(`   Found ${hotelResult.data.hotels.length} hotels`);
            console.log(`   Price range: $${hotelResult.data.hotels[0]?.price?.per_night} - $${hotelResult.data.hotels[hotelResult.data.hotels.length - 1]?.price?.per_night} per night`);
        }
        console.log();
        
        // Test get_destination_info
        console.log('🌍 Testing get_destination_info tool...');
        const destinationResult = await toolRegistry.executeTool('get_destination_info', {
            destination: 'Cairo',
            info_type: 'overview',
            include_images: true
        });
        console.log('📊 Destination info result:', destinationResult.success ? '✅ SUCCESS' : '❌ FAILED');
        if (destinationResult.success) {
            console.log(`   Country: ${destinationResult.data.data.overview.country}`);
            console.log(`   Currency: ${destinationResult.data.data.overview.currency}`);
            console.log(`   Best time to visit: ${destinationResult.data.data.overview.best_time_to_visit}`);
        }
        console.log();
        
        // Test web_search
        console.log('🔍 Testing web_search tool...');
        const searchResult = await toolRegistry.executeTool('web_search', {
            query: 'best restaurants in Cairo',
            destination: 'Cairo',
            search_type: 'reviews',
            max_results: 5
        });
        console.log('📊 Web search result:', searchResult.success ? '✅ SUCCESS' : '❌ FAILED');
        if (searchResult.success) {
            console.log(`   Found ${searchResult.data.results.length} results`);
            console.log(`   First result: ${searchResult.data.results[0]?.title}`);
        }
        console.log();
        
        // Step 3: Test all tools at once
        console.log('🧪 Step 3: Running comprehensive test suite...');
        const testResults = await testAll();
        
        // Step 4: Summary
        console.log('\n📊 TEST SUMMARY');
        console.log('================');
        
        const passed = testResults.filter(r => r.success).length;
        const total = testResults.length;
        
        console.log(`Overall Results: ${passed}/${total} tools passed`);
        console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
        
        if (passed === total) {
            console.log('\n🎉 ALL TESTS PASSED!');
            console.log('✅ AIX Tools are ready for production use');
        } else {
            console.log('\n⚠️ Some tests failed. Check the details above.');
        }
        
        // Step 5: Tool registry stats
        console.log('\n📈 Tool Registry Statistics:');
        const stats = toolRegistry.getStats();
        console.log(`Total Tools: ${stats.totalTools}`);
        console.log(`Available Tools: ${stats.tools.join(', ')}`);
        
    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
        console.error(error.stack);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testAixTools()
        .then(() => {
            console.log('\n🏁 Test suite completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Test suite crashed:', error.message);
            process.exit(1);
        });
}

module.exports = { testAixTools };
