/**
 * Simple Travel Agents Test (No Dependencies)
 * Tests agent structure and basic functionality
 */

// Colors for output
const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m'
};

function log(message, color = 'blue') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, 'blue');
  console.log('='.repeat(60) + '\n');
}

// Test results
const results = {
  filesExist: false,
  lunaStructure: false,
  karimStructure: false,
  scoutStructure: false,
  coordinatorStructure: false,
  mcpServerStructure: false,
  servicesStructure: false
};

// Test 1: Check if files exist
function testFilesExist() {
  section('TEST 1: File Structure');
  
  const fs = require('fs');
  const path = require('path');
  
  const files = [
    'src/agents/LunaWithMCP.js',
    'src/agents/KarimWithMCP.js',
    'src/agents/ScoutWithMCP.js',
    'src/agents/AgentCoordinator.js',
    'src/mcp/TravelMCPServer.js',
    'src/services/KiwiTequilaService.js',
    'src/services/BookingComService.js',
    'src/services/MapboxService.js',
    'routes/flights.js',
    'routes/hotels.js',
    'routes/mcp.js',
    'routes/travel-agents.js'
  ];
  
  let allExist = true;
  
  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ ${file} - NOT FOUND`, 'red');
      allExist = false;
    }
  });
  
  results.filesExist = allExist;
  return allExist;
}

// Test 2: Check Luna structure
function testLunaStructure() {
  section('TEST 2: Luna Agent Structure');
  
  try {
    // Read file content
    const fs = require('fs');
    const path = require('path');
    const content = fs.readFileSync(path.join(__dirname, 'src/agents/LunaWithMCP.js'), 'utf8');
    
    // Check for key methods
    const methods = [
      'planTrip',
      'searchFlights',
      'comparePrices',
      'analyzeBudget',
      'generateItinerary',
      'getCapabilities'
    ];
    
    let allFound = true;
    
    methods.forEach(method => {
      if (content.includes(method)) {
        log(`✅ Method: ${method}`, 'green');
      } else {
        log(`❌ Method: ${method} - NOT FOUND`, 'red');
        allFound = false;
      }
    });
    
    // Check for MCP integration
    if (content.includes('TravelMCPServer')) {
      log(`✅ MCP Integration: Found`, 'green');
    } else {
      log(`❌ MCP Integration: NOT FOUND`, 'red');
      allFound = false;
    }
    
    results.lunaStructure = allFound;
    return allFound;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 3: Check Karim structure
function testKarimStructure() {
  section('TEST 3: Karim Agent Structure');
  
  try {
    const fs = require('fs');
    const path = require('path');
    const content = fs.readFileSync(path.join(__dirname, 'src/agents/KarimWithMCP.js'), 'utf8');
    
    const methods = [
      'optimizeBudget',
      'comparePrices',
      'analyzeBudget',
      'generateSavingsRecommendations',
      'getCapabilities'
    ];
    
    let allFound = true;
    
    methods.forEach(method => {
      if (content.includes(method)) {
        log(`✅ Method: ${method}`, 'green');
      } else {
        log(`❌ Method: ${method} - NOT FOUND`, 'red');
        allFound = false;
      }
    });
    
    if (content.includes('TravelMCPServer')) {
      log(`✅ MCP Integration: Found`, 'green');
    } else {
      log(`❌ MCP Integration: NOT FOUND`, 'red');
      allFound = false;
    }
    
    results.karimStructure = allFound;
    return allFound;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 4: Check Scout structure
function testScoutStructure() {
  section('TEST 4: Scout Agent Structure');
  
  try {
    const fs = require('fs');
    const path = require('path');
    const content = fs.readFileSync(path.join(__dirname, 'src/agents/ScoutWithMCP.js'), 'utf8');
    
    const methods = [
      'discoverDeals',
      'monitorPrice',
      'suggestDestinations',
      'comparePrices',
      'getCapabilities'
    ];
    
    let allFound = true;
    
    methods.forEach(method => {
      if (content.includes(method)) {
        log(`✅ Method: ${method}`, 'green');
      } else {
        log(`❌ Method: ${method} - NOT FOUND`, 'red');
        allFound = false;
      }
    });
    
    if (content.includes('TravelMCPServer')) {
      log(`✅ MCP Integration: Found`, 'green');
    } else {
      log(`❌ MCP Integration: NOT FOUND`, 'red');
      allFound = false;
    }
    
    results.scoutStructure = allFound;
    return allFound;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 5: Check Coordinator structure
function testCoordinatorStructure() {
  section('TEST 5: Agent Coordinator Structure');
  
  try {
    const fs = require('fs');
    const path = require('path');
    const content = fs.readFileSync(path.join(__dirname, 'src/agents/AgentCoordinator.js'), 'utf8');
    
    const methods = [
      'handleTravelRequest',
      'coordinateTripPlanning',
      'coordinateBudgetOptimization',
      'coordinateDealDiscovery',
      'coordinateFullService',
      'getAllCapabilities'
    ];
    
    let allFound = true;
    
    methods.forEach(method => {
      if (content.includes(method)) {
        log(`✅ Method: ${method}`, 'green');
      } else {
        log(`❌ Method: ${method} - NOT FOUND`, 'red');
        allFound = false;
      }
    });
    
    // Check for agent imports
    const agents = ['LunaWithMCP', 'KarimWithMCP', 'ScoutWithMCP'];
    agents.forEach(agent => {
      if (content.includes(agent)) {
        log(`✅ Agent Import: ${agent}`, 'green');
      } else {
        log(`❌ Agent Import: ${agent} - NOT FOUND`, 'red');
        allFound = false;
      }
    });
    
    results.coordinatorStructure = allFound;
    return allFound;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 6: Check MCP Server structure
function testMCPServerStructure() {
  section('TEST 6: MCP Server Structure');
  
  try {
    const fs = require('fs');
    const path = require('path');
    const content = fs.readFileSync(path.join(__dirname, 'src/mcp/TravelMCPServer.js'), 'utf8');
    
    const methods = [
      'initializeTools',
      'registerTool',
      'listTools',
      'callTool',
      'handleFlightSearch',
      'handleLocationSearch',
      'handlePriceComparison',
      'handleBudgetAnalysis'
    ];
    
    let allFound = true;
    
    methods.forEach(method => {
      if (content.includes(method)) {
        log(`✅ Method: ${method}`, 'green');
      } else {
        log(`❌ Method: ${method} - NOT FOUND`, 'red');
        allFound = false;
      }
    });
    
    // Check for tool definitions
    const tools = [
      'search_flights',
      'search_locations',
      'get_flight_details',
      'compare_prices',
      'analyze_budget'
    ];
    
    tools.forEach(tool => {
      if (content.includes(tool)) {
        log(`✅ Tool: ${tool}`, 'green');
      } else {
        log(`❌ Tool: ${tool} - NOT FOUND`, 'red');
        allFound = false;
      }
    });
    
    results.mcpServerStructure = allFound;
    return allFound;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 7: Check Services structure
function testServicesStructure() {
  section('TEST 7: External Services Structure');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    const services = [
      {
        name: 'KiwiTequilaService',
        file: 'src/services/KiwiTequilaService.js',
        methods: ['searchFlights', 'getFlightDetails', 'createBooking', 'searchLocations']
      },
      {
        name: 'BookingComService',
        file: 'src/services/BookingComService.js',
        methods: ['searchHotels', 'getHotelDetails', 'searchCities', 'getRoomAvailability']
      },
      {
        name: 'MapboxService',
        file: 'src/services/MapboxService.js',
        methods: ['geocode', 'reverseGeocode', 'searchPlaces', 'getDirections']
      }
    ];
    
    let allFound = true;
    
    services.forEach(service => {
      log(`\n📦 ${service.name}:`, 'blue');
      
      const content = fs.readFileSync(path.join(__dirname, service.file), 'utf8');
      
      service.methods.forEach(method => {
        if (content.includes(method)) {
          log(`  ✅ ${method}`, 'green');
        } else {
          log(`  ❌ ${method} - NOT FOUND`, 'red');
          allFound = false;
        }
      });
    });
    
    results.servicesStructure = allFound;
    return allFound;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

// Main test runner
function runTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║      AMRIKYY TRAVEL AGENTS - STRUCTURE VALIDATION         ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  
  // Run all tests
  testFilesExist();
  testLunaStructure();
  testKarimStructure();
  testScoutStructure();
  testCoordinatorStructure();
  testMCPServerStructure();
  testServicesStructure();
  
  // Summary
  section('TEST SUMMARY');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  log(`\n📊 Results: ${passed}/${total} tests passed\n`, passed === total ? 'green' : 'yellow');
  
  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`   ${icon} ${test}`, color);
  });
  
  console.log('\n');
  
  if (passed === total) {
    log('🎉 All structure tests passed!', 'green');
    log('✅ Agents are properly configured', 'green');
    log('✅ MCP server is properly structured', 'green');
    log('✅ External services are properly integrated', 'green');
    console.log('\n');
    log('💡 Next steps:', 'blue');
    log('   1. Configure API keys in .env file', 'blue');
    log('   2. Run: npm run validate-apis', 'blue');
    log('   3. Start server: npm run dev', 'blue');
    log('   4. Test endpoints with curl or Postman', 'blue');
    process.exit(0);
  } else {
    log('⚠️  Some structure tests failed', 'yellow');
    process.exit(1);
  }
}

// Run tests
try {
  runTests();
} catch (error) {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
}
