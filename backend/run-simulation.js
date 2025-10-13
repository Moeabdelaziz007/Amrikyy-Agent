#!/usr/bin/env node

/**
 * Run Simulation - Direct execution of ping pattern simulation
 * Created by Cursor - Team Lead
 * 
 * Run this file to start the live simulation dashboard
 * Usage: node run-simulation.js
 */

const LiveSimulation = require('./src/aix/LiveSimulation');
const { logger } = require('./src/utils/logger');

// Create logger
const log = logger.child('RunSimulation');

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Ping Pattern Simulation Dashboard...\n');
  
  const simulation = new LiveSimulation();
  
  try {
    // Initialize simulation
    await simulation.initialize();
    
    // Start simulation
    simulation.start();
    
    console.log('✅ Simulation started! Press Ctrl+C to stop.\n');
    
    // Run demo sequence
    await simulation.runDemo();
    
    // Keep running until interrupted
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping simulation...');
      simulation.stop();
      console.log('✅ Simulation stopped. Goodbye!');
      process.exit(0);
    });
    
    // Keep the process alive
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Simulation failed:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main };