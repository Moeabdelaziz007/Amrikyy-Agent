#!/usr/bin/env node

/**
 * Money Hunter Runner
 * Executes the Mini-Aladdin money-finding agent
 */

const path = require('path');
const { createAgent } = require('./backend/src/agents/mini-aladdin');

console.log('💰 Starting Money Hunter (Mini-Aladdin Agent)...\n');

// Configuration
const config = {
  budget: process.argv[2] ? parseFloat(process.argv[2]) : 5000,
  preferences: {
    categories: ['travel', 'investment', 'cost-saving'],
    maxRisk: 'medium',
    timeAvailable: 15 // hours per week
  }
};

console.log('📊 Configuration:');
console.log(`   Budget: $${config.budget}`);
console.log(`   Categories: ${config.preferences.categories.join(', ')}`);
console.log(`   Max Risk: ${config.preferences.maxRisk}`);
console.log(`   Time Available: ${config.preferences.timeAvailable}h/week\n`);

// Create and run the agent
async function runMoneyHunter() {
  try {
    const agent = createAgent({
      maxOpportunities: 10,
      minReturnThreshold: 0.05,
      riskTolerance: config.preferences.maxRisk
    });

    console.log('🔍 Hunting for money-making opportunities...\n');

    const results = await agent.hunt({
      budget: config.budget,
      preferences: config.preferences
    });

    // Display results
    console.log('✅ Hunt Complete!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Hunt ID: ${results.huntId}`);
    console.log(`Confidence: ${(results.confidence * 100).toFixed(1)}%`);
    console.log(`Total Potential Gain: $${results.totalPotentialGain.toFixed(2)}`);
    console.log(`Opportunities Found: ${results.opportunities.length}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // Display best opportunity
    if (results.bestOpportunity) {
      const best = results.bestOpportunity;
      console.log('🏆 BEST OPPORTUNITY:');
      console.log(`   ${best.title}`);
      console.log(`   Type: ${best.type}`);
      console.log(`   ${best.description}`);
      console.log(`   ROI: ${best.roi.toFixed(2)}%`);
      console.log(`   Risk: ${best.risk}`);
      console.log(`   Timeframe: ${best.timeframe}`);
      console.log(`   Suitability Score: ${(best.suitabilityScore * 100).toFixed(1)}%`);
      
      if (best.estimatedReturn) {
        console.log(`   Estimated Return: $${best.estimatedReturn.toFixed(2)}`);
      }
      if (best.estimatedSaving) {
        console.log(`   Estimated Saving: $${best.estimatedSaving.toFixed(2)}`);
      }
      
      console.log(`   Pros: ${best.pros.join(', ')}`);
      console.log(`   Cons: ${best.cons.join(', ')}`);
      console.log('');
    }

    // Display all opportunities
    console.log('📋 ALL OPPORTUNITIES:\n');
    results.opportunities.forEach((opp, index) => {
      const gain = opp.estimatedReturn || opp.estimatedSaving || 0;
      const recommended = opp.recommended ? '⭐' : '  ';
      
      console.log(`${recommended} ${index + 1}. ${opp.title}`);
      console.log(`      Type: ${opp.type} | Risk: ${opp.risk} | ROI: ${opp.roi.toFixed(1)}%`);
      console.log(`      Potential Gain: $${gain.toFixed(2)} | Timeframe: ${opp.timeframe}`);
      console.log(`      Suitability: ${(opp.suitabilityScore * 100).toFixed(1)}%`);
      console.log('');
    });

    // Agent stats
    const stats = agent.getStats();
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 AGENT STATISTICS:');
    console.log(`   Agent: ${stats.name} v${stats.version}`);
    console.log(`   Success Rate: ${(stats.successRate * 100).toFixed(1)}%`);
    console.log(`   Average Return: ${(stats.averageReturn * 100).toFixed(1)}%`);
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('💡 TIP: Run with custom budget: node run-money-hunter.js 10000\n');

  } catch (error) {
    console.error('❌ Error running money hunter:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the money hunter
runMoneyHunter();
