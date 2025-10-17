#!/usr/bin/env node

/**
 * 🚀 MONEY HUNTER - SMART TASK EXECUTION
 * Launch the complete autonomous revenue detection and execution system
 * 
 * This demonstrates:
 * - Complex multi-agent orchestration
 * - Real-time monitoring with WebSocket dashboard
 * - AI-powered opportunity validation
 * - Automated execution pipeline
 * - Live analytics and reporting
 */

const MoneyHunterOrchestrator = require('./MoneyHunterOrchestrator');
const { MoneyHunterMonitor } = require('./MoneyHunterMonitor');

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              💰 MONEY HUNTER SYSTEM v1.0                     ║
║        Autonomous Revenue Detection & Execution              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

📋 SYSTEM CAPABILITIES:
  ✅ Multi-source opportunity scanning (Upwork, Fiverr, etc.)
  ✅ AI-powered opportunity validation with 7-dimension analysis
  ✅ Automated execution and revenue capture
  ✅ Real-time WebSocket monitoring dashboard
  ✅ Advanced analytics and performance tracking
  ✅ Self-learning optimization algorithms

🎯 CONFIGURATION:
  • Scan Interval: Every 60 seconds
  • Auto-Execute: Enabled for high-confidence opportunities
  • Confidence Threshold: 75%
  • Max Concurrent Opportunities: 10
  
🚀 STARTING SYSTEM...
`);

async function main() {
  try {
    // Create orchestrator with configuration
    const orchestrator = new MoneyHunterOrchestrator({
      scanInterval: 60000, // 1 minute
      confidenceThreshold: 0.75,
      maxConcurrentOpportunities: 10,
      autoExecute: true,
      learningMode: true
    });

    // Create monitoring dashboard
    const monitor = new MoneyHunterMonitor(orchestrator, 8080);

    // Setup graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Shutting down Money Hunter System...');
      await orchestrator.stop();
      await monitor.stop();
      console.log('👋 Goodbye!\n');
      process.exit(0);
    });

    // Start monitoring dashboard
    console.log('\n📊 Starting real-time monitoring dashboard...');
    await monitor.start();

    // Start orchestrator
    console.log('\n🚀 Starting Money Hunter Orchestrator...');
    const result = await orchestrator.start();

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║         ✅ MONEY HUNTER SYSTEM FULLY OPERATIONAL!            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

🌐 REAL-TIME DASHBOARD:
   ➜ Open your browser to: http://localhost:8080

📊 WHAT YOU'LL SEE:
   • Live opportunity discovery and validation
   • Real-time revenue metrics and analytics
   • Active execution pipeline
   • System performance monitoring
   • Event stream with detailed logging

⚡ SYSTEM STATUS:
   ${JSON.stringify(result.status.stats, null, 2)}

🎯 WATCHING FOR OPPORTUNITIES...

💡 TIP: The system is now autonomously scanning for revenue 
   opportunities across multiple platforms. Watch the dashboard 
   to see opportunities being discovered, validated, and executed 
   in real-time!

🔴 Press Ctrl+C to stop the system
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    // Log some live events to console as well
    orchestrator.on('opportunity-discovered', (opp) => {
      console.log(`\n💰 NEW OPPORTUNITY: ${opp.title}`);
      console.log(`   💵 Value: $${opp.estimatedValue}`);
      console.log(`   📍 Source: ${opp.source}`);
      console.log(`   🔗 Watch live: http://localhost:8080`);
    });

    orchestrator.on('opportunity-approved', ({ opportunity, validation }) => {
      console.log(`\n✅ APPROVED: ${opportunity.title}`);
      console.log(`   💯 Confidence: ${(validation.confidence * 100).toFixed(1)}%`);
      console.log(`   💰 Expected Revenue: $${opportunity.estimatedValue}`);
      console.log(`   ⚡ Status: ${orchestrator.config.autoExecute ? 'Auto-executing...' : 'Awaiting manual execution'}`);
    });

    orchestrator.on('execution-completed', ({ opportunity, result }) => {
      console.log(`\n🎉 EXECUTION COMPLETE: ${opportunity.title}`);
      console.log(`   💰 Revenue Captured: $${result.revenue}`);
      console.log(`   ✅ Status: SUCCESS`);
      console.log(`   📊 Total Revenue: $${orchestrator.state.totalRevenue}`);
    });

    orchestrator.on('scan-completed', (stats) => {
      const time = new Date().toLocaleTimeString();
      console.log(`\n🔍 [${time}] Scan complete: ${stats.opportunitiesFound} opportunities found`);
    });

  } catch (error) {
    console.error('\n❌ Fatal error starting Money Hunter System:');
    console.error(error);
    process.exit(1);
  }
}

// ASCII Art Banner
console.log(`
    ███╗   ███╗ ██████╗ ███╗   ██╗███████╗██╗   ██╗
    ████╗ ████║██╔═══██╗████╗  ██║██╔════╝╚██╗ ██╔╝
    ██╔████╔██║██║   ██║██╔██╗ ██║█████╗   ╚████╔╝ 
    ██║╚██╔╝██║██║   ██║██║╚██╗██║██╔══╝    ╚██╔╝  
    ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║███████╗   ██║   
    ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝   
                                                     
    ██╗  ██╗██╗   ██╗███╗   ██╗████████╗███████╗██████╗ 
    ██║  ██║██║   ██║████╗  ██║╚══██╔══╝██╔════╝██╔══██╗
    ███████║██║   ██║██╔██╗ ██║   ██║   █████╗  ██████╔╝
    ██╔══██║██║   ██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗
    ██║  ██║╚██████╔╝██║ ╚████║   ██║   ███████╗██║  ██║
    ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
                                                          
`);

// Launch the system
main().catch(console.error);
