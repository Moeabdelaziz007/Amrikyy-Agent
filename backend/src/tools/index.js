/**
 * Tools Index - Central export for all AIX agent tools
 * Provides easy access to all available tools
 * 
 * @author Amrikyy AI Solutions
 * @version 1.0.0
 */

const ToolRegistry = require('./ToolRegistry');

// Import all tools
const searchFlights = require('./search_flights');
const findHotels = require('./find_hotels');
const getDestinationInfo = require('./get_destination_info');
const webSearch = require('./web_search');

// Create tool registry instance
const toolRegistry = new ToolRegistry();

// Export tools and registry
module.exports = {
    // Tool Registry
    ToolRegistry,
    toolRegistry,
    
    // Individual Tools
    searchFlights,
    findHotels,
    getDestinationInfo,
    webSearch,
    
    // Tool Metadata
    getToolMetadata: () => ({
        searchFlights: searchFlights.getMetadata(),
        findHotels: findHotels.getMetadata(),
        getDestinationInfo: getDestinationInfo.getMetadata(),
        webSearch: webSearch.getMetadata()
    }),
    
    // Initialize all tools
    initialize: async () => {
        console.log('🔧 Initializing AIX Tools...');
        
        try {
            await toolRegistry.initialize();
            console.log('✅ AIX Tools initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize AIX Tools:', error.message);
            return false;
        }
    },
    
    // Test all tools
    testAll: async () => {
        console.log('🧪 Testing all AIX Tools...');
        
        try {
            const results = await toolRegistry.testAllTools();
            const passed = results.filter(r => r.success).length;
            const total = results.length;
            
            console.log(`📊 Test Results: ${passed}/${total} tools passed`);
            
            results.forEach(result => {
                const status = result.success ? '✅' : '❌';
                console.log(`${status} ${result.tool}: ${result.message || result.error}`);
            });
            
            return results;
        } catch (error) {
            console.error('❌ Failed to test AIX Tools:', error.message);
            return [];
        }
    }
};
