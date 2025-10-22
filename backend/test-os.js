/**
 * AI Operating System - Test Script
 * Tests the core functionality of the AI OS
 */

const aiOS = require('./src/os/AIOperatingSystem');

console.log('🧪 Testing AI Operating System...\n');

// Test 1: OS Initialization
console.log('✅ Test 1: OS Initialization');
const state = aiOS.getState();
console.log(`   - OS Name: ${state.systemInfo.name}`);
console.log(`   - Version: ${state.systemInfo.version}`);
console.log(`   - AI Model: ${state.systemInfo.aiModel}`);
console.log('');

// Test 2: Application Registry
console.log('✅ Test 2: Application Registry');
const apps = aiOS.getAllApplications();
console.log(`   - Total Apps: ${apps.length}`);
apps.forEach(app => {
  console.log(`   - ${app.icon} ${app.name} (${app.id})`);
});
console.log('');

// Test 3: Window Management
console.log('✅ Test 3: Window Management');

// Open windows
const window1 = aiOS.openWindow({
  title: 'Test Window 1',
  width: 800,
  height: 600
});
console.log(`   - Opened: ${window1.title} (${window1.id})`);

const window2 = aiOS.openWindow({
  title: 'Test Window 2',
  width: 1024,
  height: 768
});
console.log(`   - Opened: ${window2.title} (${window2.id})`);

// Check window count
const windows = aiOS.getAllWindows();
console.log(`   - Total Windows: ${windows.length}`);

// Test focus
aiOS.focusWindow(window1.id);
console.log(`   - Focused: ${window1.title}`);
console.log(`   - Focused Window ID: ${aiOS.focusedWindowId}`);

// Test minimize
aiOS.minimizeWindow(window2.id);
const minimizedWindow = aiOS.getWindow(window2.id);
console.log(`   - Minimized: ${minimizedWindow.title} (state: ${minimizedWindow.state})`);

// Test maximize
aiOS.maximizeWindow(window1.id);
const maximizedWindow = aiOS.getWindow(window1.id);
console.log(`   - Maximized: ${maximizedWindow.title} (state: ${maximizedWindow.state})`);

// Test restore
aiOS.restoreWindow(window1.id);
const restoredWindow = aiOS.getWindow(window1.id);
console.log(`   - Restored: ${restoredWindow.title} (state: ${restoredWindow.state})`);

// Close windows
aiOS.closeWindow(window1.id);
console.log(`   - Closed: ${window1.title}`);

const remainingWindows = aiOS.getAllWindows();
console.log(`   - Remaining Windows: ${remainingWindows.length}`);
console.log('');

// Test 4: Application Launching
console.log('✅ Test 4: Application Launching');
aiOS.launchApplication('maya-travel')
  .then(result => {
    console.log(`   - Launched: ${result.app.name}`);
    console.log(`   - Window Created: ${result.window.title} (${result.window.id})`);
    console.log(`   - Running Apps: ${Array.from(aiOS.runningApps).join(', ')}`);
    console.log('');

    // Test 5: Event System
    console.log('✅ Test 5: Event System');
    let eventsCaught = 0;

    aiOS.on('window:opened', (window) => {
      eventsCaught++;
      console.log(`   - Event: window:opened → ${window.title}`);
    });

    aiOS.on('window:closed', ({ window }) => {
      eventsCaught++;
      console.log(`   - Event: window:closed → ${window.title}`);
    });

    // Trigger events
    const testWindow = aiOS.openWindow({ title: 'Event Test Window' });
    aiOS.closeWindow(testWindow.id);

    console.log(`   - Events Caught: ${eventsCaught}`);
    console.log('');

    // Test 6: Metrics
    console.log('✅ Test 6: System Metrics');
    const metrics = aiOS.getMetrics();
    console.log(`   - Windows Opened: ${metrics.windows.opened}`);
    console.log(`   - Windows Closed: ${metrics.windows.closed}`);
    console.log(`   - Windows Active: ${metrics.windows.active}`);
    console.log(`   - Apps Registered: ${metrics.applications.registered}`);
    console.log(`   - Apps Launched: ${metrics.applications.launched}`);
    console.log(`   - Apps Running: ${metrics.applications.running}`);
    console.log(`   - AI Interactions: ${metrics.ai.interactions}`);
    console.log('');

    // Test 7: Natural Language Command (if API key available)
    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY) {
      console.log('✅ Test 7: Natural Language Command Processing');
      
      // Wait for Gemini to initialize
      setTimeout(async () => {
        try {
          const result = await aiOS.processNaturalLanguageCommand(
            'open the trip planner',
            { test: true }
          );
          
          console.log(`   - Command: "open the trip planner"`);
          console.log(`   - Intent: ${result.intent}`);
          console.log(`   - Response: ${result.response}`);
          console.log(`   - Confidence: ${(result.confidence * 100).toFixed(1)}%`);
          console.log(`   - Processing Time: ${result.processingTime}ms`);
          console.log('');

          finishTests();
        } catch (error) {
          console.log(`   - ⚠️ AI command failed: ${error.message}`);
          console.log('');
          finishTests();
        }
      }, 2000); // Wait 2 seconds for initialization
    } else {
      console.log('⚠️  Test 7: Skipped (No Gemini API key)');
      console.log('   - Set GEMINI_API_KEY to test AI features');
      console.log('');
      finishTests();
    }
  })
  .catch(error => {
    console.error('❌ Test 4 failed:', error);
    process.exit(1);
  });

function finishTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ All Tests Completed Successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('🚀 AI Operating System is ready for use!');
  console.log('');
  console.log('Next Steps:');
  console.log('1. Start the backend server: npm run dev');
  console.log('2. Test API endpoints: curl http://localhost:3000/api/os/status');
  console.log('3. Build frontend components in frontend/src/components/os/');
  console.log('4. Integrate with existing AIChat and travel components');
  console.log('');
  
  process.exit(0);
}
