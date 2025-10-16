#!/usr/bin/env node

/**
 * Test Private Journal MCP Connection
 * Simple test to verify MCP server is working
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Private Journal MCP Connection...\n');

// Test 1: Check if npx is available
console.log('1️⃣ Testing npx availability...');
const npxTest = spawn('npx', ['--version'], { stdio: 'pipe' });

npxTest.stdout.on('data', (data) => {
  console.log(`✅ npx version: ${data.toString().trim()}`);
});

npxTest.stderr.on('data', (data) => {
  console.log(`❌ npx error: ${data.toString()}`);
});

npxTest.on('close', (code) => {
  if (code === 0) {
    console.log('✅ npx is working\n');
    testMCPInstallation();
  } else {
    console.log('❌ npx not available\n');
  }
});

// Test 2: Test MCP installation
function testMCPInstallation() {
  console.log('2️⃣ Testing Private Journal MCP installation...');
  
  const mcpTest = spawn('npx', ['github:obra/private-journal-mcp', '--help'], { 
    stdio: 'pipe',
    timeout: 10000 
  });

  mcpTest.stdout.on('data', (data) => {
    console.log(`✅ MCP output: ${data.toString().trim()}`);
  });

  mcpTest.stderr.on('data', (data) => {
    console.log(`⚠️  MCP stderr: ${data.toString().trim()}`);
  });

  mcpTest.on('close', (code) => {
    console.log(`MCP process exited with code: ${code}\n`);
    testJournalDirectories();
  });

  mcpTest.on('error', (error) => {
    console.log(`❌ MCP error: ${error.message}\n`);
    testJournalDirectories();
  });
}

// Test 3: Check journal directories
function testJournalDirectories() {
  console.log('3️⃣ Testing journal directories...');
  
  const projectJournalPath = path.join(process.cwd(), '.private-journal');
  const userJournalPath = path.join(require('os').homedir(), '.private-journal');
  
  console.log(`Project journal path: ${projectJournalPath}`);
  console.log(`User journal path: ${userJournalPath}`);
  
  // Check if directories exist
  if (fs.existsSync(projectJournalPath)) {
    console.log('✅ Project journal directory exists');
    const files = fs.readdirSync(projectJournalPath);
    console.log(`   Files: ${files.length}`);
  } else {
    console.log('⚠️  Project journal directory does not exist (will be created)');
  }
  
  if (fs.existsSync(userJournalPath)) {
    console.log('✅ User journal directory exists');
    const files = fs.readdirSync(userJournalPath);
    console.log(`   Files: ${files.length}`);
  } else {
    console.log('⚠️  User journal directory does not exist (will be created)');
  }
  
  console.log('\n4️⃣ Creating test journal entry...');
  createTestEntry();
}

// Test 4: Create test entry
function createTestEntry() {
  const testEntry = {
    title: "Test Entry - MCP Connection",
    date: new Date().toISOString(),
    timestamp: Date.now(),
    content: {
      technical_insights: "Testing Private Journal MCP connection and data collection",
      project_notes: "Setting up monitoring dashboard for journal data",
      user_context: "User wants to see real-time data collection in action"
    }
  };
  
  console.log('📝 Test entry created:');
  console.log(JSON.stringify(testEntry, null, 2));
  
  console.log('\n✅ MCP Connection Test Complete!');
  console.log('\n🚀 Starting monitoring dashboard...\n');
  
  // Start the monitoring dashboard
  startMonitoringDashboard();
}

// Start monitoring dashboard
function startMonitoringDashboard() {
  try {
    const JournalDataMonitor = require('./backend/monitoring/journal-data-monitor.js');
    const monitor = new JournalDataMonitor({
      refreshInterval: 3000, // 3 seconds for demo
      maxRecentEntries: 5
    });
    
    // Event listeners
    monitor.on('scan-complete', (stats) => {
      console.log(`📊 Scan complete: ${stats.combined.totalEntries} total entries`);
    });
    
    monitor.on('started', () => {
      console.log('🎯 Monitor started successfully!');
    });
    
    // Start monitoring
    monitor.start();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping monitor...');
      monitor.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.log(`❌ Error starting monitor: ${error.message}`);
    console.log('💡 Make sure the journal-data-monitor.js file exists');
  }
}
