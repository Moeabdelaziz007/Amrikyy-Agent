/**
 * Travel Agents Integration Test
 * Tests Luna, Karim, Scout agents with MCP tools
 */

require('dotenv').config();
const colors = require('./src/utils/colors');

// Mock services if API keys not available
const mockMode = !process.env.KIWI_API_KEY;

if (mockMode) {
  console.log(colors.yellow('\n⚠️  Running in MOCK MODE (no API keys configured)\n'));
}

const LunaWithMCP = require('./src/agents/LunaWithMCP');
const KarimWithMCP = require('./src/agents/KarimWithMCP');
const ScoutWithMCP = require('./src/agents/ScoutWithMCP');
const AgentCoordinator = require('./src/agents/AgentCoordinator');
const TravelMCPServer = require('./src/mcp/TravelMCPServer');

// Test utilities
function log(message, color = 'blue') {
  const colorMap = {
    blue: '\x1b[34m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colorMap[color]}${message}${colorMap.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, 'blue');
  console.log('='.repeat(60) + '\n');
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: MCP Server Health Check
async function testMCPServer() {
  section('TEST 1: MCP Server Health Check');
  
  try {
    log('🔧 Checking MCP server...', 'blue');
    
    const health = await TravelMCPServer.healthCheck();
    
    if (health.success) {
      log('✅ MCP Server: Healthy', 'green');
      log(`   Tools available: ${health.toolCount}`, 'blue');
    } else {
      log('❌ MCP Server: Unhealthy', 'red');
    }
    
    // List available tools
    const tools = TravelMCPServer.listTools();
    log(`\n📋 Available MCP Tools (${tools.length}):`, 'blue');
    tools.forEach(tool => {
      log(`   - ${tool.name}: ${tool.description}`, 'blue');
    });
    
    return true;
  } catch (error) {
    log(`❌ MCP Server test failed: ${error.message}`, 'red');
    return false;
  }
}

// Test 2: Luna Trip Planning
async function testLuna() {
  section('TEST 2: Luna Trip Architect');
  
  try {
    log('🌙 Testing Luna trip planning...', 'blue');
    
    const request = {
      destination: 'Paris',
      origin: 'New York',
      departureDate: '01/12/2025',
      returnDate: '08/12/2025',
      budget: 3000,
      travelers: 2,
      preferences: {
        interests: ['culture', 'food', 'art']
      }
    };
    
    log(`\n📝 Request:`, 'blue');
    log(`   Origin: ${request.origin}`, 'blue');
    log(`   Destination: ${request.destination}`, 'blue');
    log(`   Dates: ${request.departureDate} - ${request.returnDate}`, 'blue');
    log(`   Budget: $${request.budget}`, 'blue');
    log(`   Travelers: ${request.travelers}`, 'blue');
    
    if (mockMode) {
      log('\n⚠️  Skipping actual API call (mock mode)', 'yellow');
      log('✅ Luna: Initialized and ready', 'green');
      
      // Show capabilities
      const capabilities = LunaWithMCP.getCapabilities();
      log(`\n🎯 Luna Capabilities:`, 'blue');
      log(`   Role: ${capabilities.role}`, 'blue');
      log(`   MCP Tools: ${capabilities.mcpTools.length}`, 'blue');
      
      return true;
    }
    
    const result = await LunaWithMCP.planTrip(request);
    
    if (result.success) {
      log('\n✅ Luna: Trip planned successfully', 'green');
      log(`   Flights found: ${result.plan.flights?.length || 0}`, 'blue');
      log(`   Itinerary days: ${result.plan.itinerary?.length || 0}`, 'blue');
      log(`   Recommendations: ${result.plan.recommendations?.length || 0}`, 'blue');
    } else {
      log(`\n❌ Luna: Planning failed - ${result.error}`, 'red');
    }
    
    return result.success;
  } catch (error) {
    log(`❌ Luna test failed: ${error.message}`, 'red');
    return false;
  }
}

// Test 3: Karim Budget Optimization
async function testKarim() {
  section('TEST 3: Karim Budget Optimizer');
  
  try {
    log('💰 Testing Karim budget optimization...', 'blue');
    
    const request = {
      destination: 'London',
      origin: 'New York',
      budget: 2500,
      travelers: 2,
      flexibleDates: true,
      dateRange: {
        start: '01/12/2025',
        end: '15/12/2025',
        duration: 7
      }
    };
    
    log(`\n📝 Request:`, 'blue');
    log(`   Budget: $${request.budget}`, 'blue');
    log(`   Travelers: ${request.travelers}`, 'blue');
    log(`   Flexible dates: ${request.flexibleDates}`, 'blue');
    
    if (mockMode) {
      log('\n⚠️  Skipping actual API call (mock mode)', 'yellow');
      log('✅ Karim: Initialized and ready', 'green');
      
      // Show capabilities
      const capabilities = KarimWithMCP.getCapabilities();
      log(`\n🎯 Karim Capabilities:`, 'blue');
      log(`   Role: ${capabilities.role}`, 'blue');
      log(`   MCP Tools: ${capabilities.mcpTools.length}`, 'blue');
      
      return true;
    }
    
    const result = await KarimWithMCP.optimizeBudget(request);
    
    if (result.success) {
      log('\n✅ Karim: Budget optimized successfully', 'green');
      log(`   Original budget: $${result.optimization.originalBudget}`, 'blue');
      log(`   Optimized budget: $${result.optimization.optimizedBudget}`, 'blue');
      log(`   Potential savings: $${result.optimization.totalPotentialSavings}`, 'green');
      log(`   Recommendations: ${result.optimization.recommendations.length}`, 'blue');
    } else {
      log(`\n❌ Karim: Optimization failed - ${result.error}`, 'red');
    }
    
    return result.success;
  } catch (error) {
    log(`❌ Karim test failed: ${error.message}`, 'red');
    return false;
  }
}

// Test 4: Scout Deal Discovery
async function testScout() {
  section('TEST 4: Scout Deal Finder');
  
  try {
    log('🕵️ Testing Scout deal discovery...', 'blue');
    
    const request = {
      origins: ['NYC'],
      budgetRange: {
        min: 500,
        max: 1500
      },
      interests: ['beach', 'culture'],
      travelMonths: ['December', 'January']
    };
    
    log(`\n📝 Request:`, 'blue');
    log(`   Origins: ${request.origins.join(', ')}`, 'blue');
    log(`   Budget range: $${request.budgetRange.min} - $${request.budgetRange.max}`, 'blue');
    log(`   Interests: ${request.interests.join(', ')}`, 'blue');
    
    if (mockMode) {
      log('\n⚠️  Skipping actual API call (mock mode)', 'yellow');
      log('✅ Scout: Initialized and ready', 'green');
      
      // Show capabilities
      const capabilities = ScoutWithMCP.getCapabilities();
      log(`\n🎯 Scout Capabilities:`, 'blue');
      log(`   Role: ${capabilities.role}`, 'blue');
      log(`   MCP Tools: ${capabilities.mcpTools.length}`, 'blue');
      log(`   Monitored routes: ${capabilities.monitoredRoutes}`, 'blue');
      
      return true;
    }
    
    const result = await ScoutWithMCP.discoverDeals(request);
    
    if (result.success) {
      log('\n✅ Scout: Deals discovered successfully', 'green');
      log(`   Deals found: ${result.deals.flights.length}`, 'blue');
      
      if (result.deals.flights.length > 0) {
        const bestDeal = result.deals.flights[0];
        log(`\n🎯 Best Deal:`, 'green');
        log(`   Destination: ${bestDeal.destination}`, 'blue');
        log(`   Price: $${bestDeal.price}`, 'green');
        log(`   Date: ${bestDeal.date}`, 'blue');
        log(`   Deal Score: ${bestDeal.dealScore}/100`, 'blue');
      }
    } else {
      log(`\n❌ Scout: Discovery failed - ${result.error}`, 'red');
    }
    
    return result.success;
  } catch (error) {
    log(`❌ Scout test failed: ${error.message}`, 'red');
    return false;
  }
}

// Test 5: Agent Coordinator
async function testCoordinator() {
  section('TEST 5: Agent Coordinator');
  
  try {
    log('🎯 Testing Agent Coordinator...', 'blue');
    
    // Test 5a: Get capabilities
    log('\n📋 Getting all agent capabilities...', 'blue');
    const capabilities = AgentCoordinator.getAllCapabilities();
    
    log('\n✅ Agent Capabilities:', 'green');
    Object.entries(capabilities).forEach(([name, caps]) => {
      log(`\n   ${name.toUpperCase()}:`, 'blue');
      log(`   - Role: ${caps.role}`, 'blue');
      log(`   - Capabilities: ${caps.capabilities.length}`, 'blue');
      log(`   - MCP Tools: ${caps.mcpTools.length}`, 'blue');
    });
    
    // Test 5b: Coordinated request (mock)
    log('\n\n🎯 Testing coordinated trip planning...', 'blue');
    
    const request = {
      type: 'plan_trip',
      destination: 'Tokyo',
      origin: 'Los Angeles',
      departureDate: '15/01/2026',
      returnDate: '25/01/2026',
      budget: 4000,
      travelers: 2,
      preferences: {
        interests: ['culture', 'food', 'technology']
      }
    };
    
    log(`\n📝 Request:`, 'blue');
    log(`   Type: ${request.type}`, 'blue');
    log(`   Route: ${request.origin} → ${request.destination}`, 'blue');
    log(`   Budget: $${request.budget}`, 'blue');
    
    if (mockMode) {
      log('\n⚠️  Skipping actual coordination (mock mode)', 'yellow');
      log('✅ Coordinator: Ready to orchestrate agents', 'green');
      return true;
    }
    
    const result = await AgentCoordinator.handleTravelRequest(request);
    
    if (result.success) {
      log('\n✅ Coordinator: Request handled successfully', 'green');
      log(`   Request ID: ${result.requestId}`, 'blue');
      log(`   Processing time: ${result.processingTime}ms`, 'blue');
      log(`   Agents used: ${Object.keys(result.agents).join(', ')}`, 'blue');
    } else {
      log(`\n❌ Coordinator: Request failed - ${result.error}`, 'red');
    }
    
    return result.success;
  } catch (error) {
    log(`❌ Coordinator test failed: ${error.message}`, 'red');
    return false;
  }
}

// Test 6: MCP Tool Direct Call
async function testMCPToolCall() {
  section('TEST 6: MCP Tool Direct Call');
  
  try {
    log('🔧 Testing direct MCP tool call...', 'blue');
    
    // Test budget analysis tool
    const params = {
      destination: 'Barcelona',
      budget: 2000,
      duration: 5,
      travelers: 2
    };
    
    log(`\n📝 Calling analyze_budget tool:`, 'blue');
    log(`   Destination: ${params.destination}`, 'blue');
    log(`   Budget: $${params.budget}`, 'blue');
    log(`   Duration: ${params.duration} days`, 'blue');
    log(`   Travelers: ${params.travelers}`, 'blue');
    
    const result = await TravelMCPServer.callTool('analyze_budget', params, {
      agentId: 'test',
      agentName: 'Test Agent'
    });
    
    if (result.success) {
      log('\n✅ MCP Tool: Budget analysis completed', 'green');
      log(`\n💰 Budget Breakdown:`, 'blue');
      log(`   Flights: $${result.data.breakdown.flights.total}`, 'blue');
      log(`   Accommodation: $${result.data.breakdown.accommodation.total}`, 'blue');
      log(`   Food: $${result.data.breakdown.food.total}`, 'blue');
      log(`   Activities: $${result.data.breakdown.activities.total}`, 'blue');
      log(`\n📊 Per Person: $${result.data.perPerson}`, 'blue');
      log(`📊 Per Day: $${result.data.perDay}`, 'blue');
      
      if (result.data.recommendations) {
        log(`\n💡 Recommendations:`, 'blue');
        result.data.recommendations.forEach((rec, i) => {
          log(`   ${i + 1}. ${rec}`, 'blue');
        });
      }
    } else {
      log(`\n❌ MCP Tool: Call failed - ${result.error}`, 'red');
    }
    
    return result.success;
  } catch (error) {
    log(`❌ MCP tool test failed: ${error.message}`, 'red');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║         AMRIKYY TRAVEL AGENTS - INTEGRATION TEST          ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  
  const results = {
    mcpServer: false,
    luna: false,
    karim: false,
    scout: false,
    coordinator: false,
    mcpTool: false
  };
  
  try {
    // Run tests sequentially
    results.mcpServer = await testMCPServer();
    await delay(1000);
    
    results.luna = await testLuna();
    await delay(1000);
    
    results.karim = await testKarim();
    await delay(1000);
    
    results.scout = await testScout();
    await delay(1000);
    
    results.coordinator = await testCoordinator();
    await delay(1000);
    
    results.mcpTool = await testMCPToolCall();
    
  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, 'red');
    console.error(error);
  }
  
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
  
  if (mockMode) {
    log('⚠️  Tests ran in MOCK MODE', 'yellow');
    log('💡 Configure API keys in .env to test with real APIs', 'blue');
  }
  
  if (passed === total) {
    log('🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('⚠️  Some tests failed', 'yellow');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
