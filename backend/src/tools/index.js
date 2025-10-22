/**
 * Tools Index - Central export for all AIX agent tools
 * Provides easy access to all available tools
 * 
 * @author Maya Travel Agent
 * @version 1.0.0
 */

const ToolRegistry = require('./ToolRegistry');

// Import all tools
const searchFlights = require('./search_flights');
const findHotels = require('./find_hotels');
const getDestinationInfo = require('./get_destination_info');
const webSearch = require('./web_search');

// Import new critical production tools
const calculateBudgetBreakdown = require('./calculate_budget_breakdown');
const currencyConverter = require('./currency_converter');
const secureCurrencyConverter = require('./currency_converter_secure');
const weatherForecast = require('./weather_forecast');
const sendTelegramNotification = require('./send_telegram_notification');

// Import Kody's notebook execution tool
const executeNotebookCode = require('./execute_notebook_code');

// Import Scout's Senses tools
const monitorUserInterests = require('./monitor_user_interests');
const trackPriceChanges = require('./track_price_changes');
const generateProactiveOffers = require('./generate_proactive_offers');

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
    
    // New Critical Production Tools
    calculateBudgetBreakdown,
    currencyConverter,
    weatherForecast,
    sendTelegramNotification,
    
    // Kody's Data Analysis Tools
    executeNotebookCode,
    
    // Scout's Senses Tools
    monitorUserInterests,
    trackPriceChanges,
    generateProactiveOffers,
    
    // Tool Metadata
    getToolMetadata: () => ({
        searchFlights: searchFlights.getMetadata(),
        findHotels: findHotels.getMetadata(),
        getDestinationInfo: getDestinationInfo.getMetadata(),
        webSearch: webSearch.getMetadata(),
        
        // New Critical Production Tools Metadata
        calculateBudgetBreakdown: calculateBudgetBreakdown.getMetadata(),
        currencyConverter: currencyConverter.getMetadata(),
        weatherForecast: weatherForecast.getMetadata(),
        sendTelegramNotification: sendTelegramNotification.getMetadata(),
        
        // Kody's Data Analysis Tools Metadata
        executeNotebookCode: executeNotebookCode.getMetadata(),
        
        // Scout's Senses Tools Metadata
        monitorUserInterests: monitorUserInterests.getMetadata(),
        trackPriceChanges: trackPriceChanges.getMetadata(),
        generateProactiveOffers: generateProactiveOffers.getMetadata()
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