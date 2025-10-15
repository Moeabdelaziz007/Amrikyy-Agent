#!/usr/bin/env node

/**
 * Test script for Travel MCP Server
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing Travel MCP Server...\n');

// Test the MCP server
const serverPath = path.join(__dirname, 'backend/src/ai/travelMCP.js');

console.log('📁 Server path:', serverPath);
console.log('🚀 Starting MCP server test...\n');

const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    NODE_ENV: 'test'
  }
});

// Send a test request
const testRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

server.stdin.write(JSON.stringify(testRequest) + '\n');

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  output += data.toString();
});

server.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

server.on('close', (code) => {
  console.log('📊 Test Results:');
  console.log('Exit code:', code);
  
  if (output) {
    console.log('\n✅ Server Output:');
    console.log(output);
  }
  
  if (errorOutput) {
    console.log('\n⚠️ Server Errors:');
    console.log(errorOutput);
  }
  
  if (code === 0) {
    console.log('\n🎉 MCP Server test completed successfully!');
  } else {
    console.log('\n❌ MCP Server test failed.');
  }
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('\n⏰ Test timeout reached. Stopping server...');
  server.kill();
}, 10000);
