#!/usr/bin/env node

/**
 * Quantum Agent Runner
 * Standalone script to run QuantumGeminiCore agent
 * Can be executed directly by Gitpod Agents
 */

require('dotenv').config();
const path = require('path');

// Set up paths
const projectRoot = path.join(__dirname, '..');
process.env.PROJECT_ROOT = projectRoot;

console.log('🚀 Starting Quantum Gemini Core Agent...');
console.log('📁 Project Root:', projectRoot);
console.log('🔑 Gemini API Key:', process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing');

// Import and initialize the agent
const QuantumGeminiCore = require('./src/agents/QuantumGeminiCore');

async function main() {
  try {
    console.log('\n🧠 Initializing Quantum Gemini Core...');
    
    const agent = new QuantumGeminiCore();
    
    // Wait for initialization
    await new Promise((resolve) => {
      agent.once('initialized', (data) => {
        console.log('\n✅ Quantum Gemini Core Initialized!');
        console.log('📊 Model:', data.model);
        console.log('🌀 Quantum State:', data.quantumState);
        console.log('⚡ Superpowers:', data.superpowers);
        resolve();
      });
    });

    console.log('\n🎯 Agent is ready to process tasks!');
    console.log('📖 Loading AI OS Plan from AMRIKYY_AI_OS_PLAN.md...');
    
    // Load the AI OS plan
    const fs = require('fs');
    const planPath = path.join(projectRoot, 'AMRIKYY_AI_OS_PLAN.md');
    
    if (fs.existsSync(planPath)) {
      const plan = fs.readFileSync(planPath, 'utf-8');
      console.log('✅ AI OS Plan loaded successfully');
      console.log('📄 Plan size:', (plan.length / 1024).toFixed(2), 'KB');
      
      // Test the agent with a simple query
      console.log('\n🧪 Testing agent with sample query...');
      const testResult = await agent.quantumReasoning(
        'Analyze the Amrikyy AI OS implementation plan and provide a brief summary of Phase 1',
        { plan: plan.substring(0, 5000) } // Send first 5KB as context
      );
      
      if (testResult && testResult.solution) {
        console.log('\n✅ Agent Test Successful!');
        console.log('📝 Response:', testResult.solution.substring(0, 200) + '...');
      }
    } else {
      console.log('⚠️  AI OS Plan not found at:', planPath);
    }

    console.log('\n🎉 Quantum Agent is running and ready!');
    console.log('💡 The agent will continue running in the background...');
    
    // Keep the process alive
    setInterval(() => {
      console.log('💓 Agent heartbeat:', new Date().toISOString());
    }, 60000); // Every minute

  } catch (error) {
    console.error('\n❌ Error starting Quantum Agent:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Quantum Agent...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down Quantum Agent...');
  process.exit(0);
});

// Run the agent
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
