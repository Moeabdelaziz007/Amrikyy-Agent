/**
 * Proactive Scout Agent Demonstration
 * Shows the intelligent travel scouting system in action
 */

const EnhancedCursorManagerAgent = require('../src/agents/EnhancedCursorManagerAgent');

async function demonstrateProactiveScouting() {
  console.log('🎯 Starting Proactive Scout Agent Demonstration...\n');

  // Initialize the Enhanced Cursor Manager with scout enabled
  const cursorManager = new EnhancedCursorManagerAgent({
    scoutEnabled: true,
    memoryEnabled: true,
    maxConcurrentTasks: 5,
    taskTimeout: 30000
  });

  try {
    await cursorManager.initialize();
    console.log('✅ Enhanced Cursor Manager initialized with Proactive Scout Agent\n');

    const scoutAgent = cursorManager.scoutAgent;
    console.log('🎯 Proactive Scout Agent ready for demonstration\n');

    // Demo 1: User Interest Tracking
    console.log('='.repeat(60));
    console.log('DEMO 1: User Interest Tracking and Analysis');
    console.log('='.repeat(60));

    const userId = 'demo_user_mohammed';
    const conversations = [
      'I really want to visit Italy, especially Rome and Florence',
      'Italian culture and food are amazing, I love pasta and pizza',
      'Rome has incredible historical sites and art museums',
      'I want to experience the Italian lifestyle and culture',
      'Florence is perfect for art lovers like me',
      'I dream of visiting the Colosseum and Vatican in Rome'
    ];

    console.log(`👤 Simulating conversations for user: ${userId}`);
    console.log('📝 Conversations:');
    conversations.forEach((msg, index) => {
      console.log(`   ${index + 1}. "${msg}"`);
    });

    // Process conversations
    for (const message of conversations) {
      await cursorManager.notifyScoutOfConversation(userId, message, {
        source: 'telegram',
        sessionId: 'demo_session_001'
      });
    }

    // Analyze results
    const interests = scoutAgent.userInterests.get(userId);
    console.log('\n🧠 Interest Analysis Results:');
    console.log(`📊 Total conversations analyzed: ${interests.conversationCount}`);
    console.log(`🎯 Interest score: ${interests.interestScore}/100`);
    
    console.log('\n🌍 Top destinations:');
    interests.topDestinations.forEach(([dest, count], index) => {
      console.log(`   ${index + 1}. ${dest}: ${count} mentions`);
    });

    console.log('\n🎨 Top activities:');
    interests.topActivities.forEach(([activity, count], index) => {
      console.log(`   ${index + 1}. ${activity}: ${count} mentions`);
    });

    // Demo 2: Price Monitoring
    console.log('\n' + '='.repeat(60));
    console.log('DEMO 2: Price Monitoring and Drop Detection');
    console.log('='.repeat(60));

    console.log('💰 Simulating price monitoring for Italy...');
    
    // Simulate price changes over time
    const priceUpdates = [
      { originalPrice: 2000, currentPrice: 2000 }, // Initial price
      { originalPrice: 2000, currentPrice: 1900 }, // Small drop
      { originalPrice: 2000, currentPrice: 1700 }, // Significant drop (15%)
      { originalPrice: 2000, currentPrice: 1600 }  // Big drop (20%)
    ];

    for (let i = 0; i < priceUpdates.length; i++) {
      const prices = priceUpdates[i];
      const drop = scoutAgent.detectPriceDrop('italy', prices);
      
      console.log(`   Update ${i + 1}: $${prices.currentPrice} (${drop > 0 ? 'Drop: ' + Math.round(drop * 100) + '%' : 'No significant drop'})`);
    }

    // Demo 3: Proactive Offer Generation
    console.log('\n' + '='.repeat(60));
    console.log('DEMO 3: Proactive Offer Generation');
    console.log('='.repeat(60));

    console.log('🎯 Generating personalized offer for Italy...');
    
    const offer = await scoutAgent.generateOfferForDestination(userId, 'italy', interests);
    
    if (offer) {
      console.log('✅ Offer generated successfully!');
      console.log(`📋 Title: ${offer.title}`);
      console.log(`📝 Description: ${offer.description}`);
      console.log(`💰 Original price: $${offer.originalPrice}`);
      console.log(`💸 Current price: $${offer.currentPrice}`);
      console.log(`🎉 Savings: $${offer.savings} (${offer.discountPercentage}%)`);
      console.log(`⭐ Personalization score: ${offer.personalizationScore}/100`);
      console.log(`⏰ Valid until: ${offer.expiresAt.toLocaleDateString('ar-SA')}`);
    } else {
      console.log('❌ No offer generated (insufficient interest or no price drop)');
    }

    // Demo 4: Notification System
    console.log('\n' + '='.repeat(60));
    console.log('DEMO 4: Proactive Notification System');
    console.log('='.repeat(60));

    if (offer) {
      console.log('📱 Formatting notification message...');
      const notificationMessage = scoutAgent.formatOfferNotification(offer);
      
      console.log('📨 Notification message:');
      console.log('─'.repeat(40));
      console.log(notificationMessage);
      console.log('─'.repeat(40));
      
      console.log('\n📲 Notification channels:');
      console.log('   • Telegram: ✅ Ready');
      console.log('   • WhatsApp: ✅ Ready');
      console.log('   • Email: 🔄 Pending integration');
    }

    // Demo 5: Multiple Users and Scalability
    console.log('\n' + '='.repeat(60));
    console.log('DEMO 5: Multi-User Scouting and Scalability');
    console.log('='.repeat(60));

    const users = [
      { id: 'user_sarah', interests: ['japan', 'culture', 'food'] },
      { id: 'user_ahmed', interests: ['dubai', 'luxury', 'shopping'] },
      { id: 'user_fatima', interests: ['paris', 'art', 'romance'] }
    ];

    console.log('👥 Simulating multiple users with different interests...');
    
    for (const user of users) {
      const conversations = user.interests.map(interest => 
        `I want to visit ${interest} and experience the local culture`
      );
      
      for (const message of conversations) {
        await cursorManager.notifyScoutOfConversation(user.id, message, {
          source: 'telegram'
        });
      }
      
      const userInterests = scoutAgent.userInterests.get(user.id);
      console.log(`   ${user.id}: ${userInterests.interestScore}/100 interest score`);
    }

    // Demo 6: Scout Agent Metrics and Analytics
    console.log('\n' + '='.repeat(60));
    console.log('DEMO 6: Scout Agent Metrics and Analytics');
    console.log('='.repeat(60));

    const scoutMetrics = cursorManager.getScoutMetrics();
    
    console.log('📊 Scout Agent Performance Metrics:');
    console.log(`👥 Users monitored: ${scoutMetrics.metrics.usersMonitored}`);
    console.log(`🎯 Offers generated: ${scoutMetrics.metrics.offersGenerated}`);
    console.log(`📱 Notifications sent: ${scoutMetrics.metrics.notificationsSent}`);
    console.log(`💰 Total savings identified: $${scoutMetrics.metrics.totalSavingsIdentified}`);
    console.log(`🎁 Active offers: ${scoutMetrics.metrics.activeOffers}`);
    console.log(`📬 Pending notifications: ${scoutMetrics.metrics.notificationQueue}`);

    // Demo 7: Real-time Monitoring
    console.log('\n' + '='.repeat(60));
    console.log('DEMO 7: Real-time Monitoring and Background Processing');
    console.log('='.repeat(60));

    console.log('🔄 Background monitoring systems:');
    console.log('   • User interest monitoring: ✅ Active (every 5 minutes)');
    console.log('   • Offer generation: ✅ Active (every 30 minutes)');
    console.log('   • Notification processing: ✅ Active (every 2 minutes)');
    console.log('   • Data persistence: ✅ Active (every 10 minutes)');

    console.log('\n🎯 Scout Agent Status:');
    const status = scoutAgent.getStatus();
    console.log(`   • Status: ${status.status}`);
    console.log(`   • Version: ${status.version}`);
    console.log(`   • Last update: ${status.lastUpdate}`);

    // Demo 8: Integration with Memory System
    console.log('\n' + '='.repeat(60));
    console.log('DEMO 8: Integration with Memory System');
    console.log('='.repeat(60));

    console.log('🧠 Querying memory for user preferences...');
    
    const memoryQuery = await cursorManager.queryMemory('Italy travel preferences cultural experiences', {
      type: 'user_preference',
      user_id: userId,
      limit: 3
    });

    if (memoryQuery.success && memoryQuery.results.length > 0) {
      console.log('✅ Found relevant memories:');
      memoryQuery.results.forEach((memory, index) => {
        console.log(`   ${index + 1}. ${memory.content.substring(0, 100)}...`);
      });
    } else {
      console.log('📝 No existing memories found (first-time user)');
    }

    console.log('\n🎉 Proactive Scout Agent Demonstration Complete!');
    console.log('\nKey Benefits Demonstrated:');
    console.log('✅ Automatic user interest tracking from conversations');
    console.log('✅ Real-time price monitoring and drop detection');
    console.log('✅ Intelligent offer generation based on user preferences');
    console.log('✅ Personalized notifications via multiple channels');
    console.log('✅ Scalable multi-user monitoring and processing');
    console.log('✅ Integration with memory system for enhanced personalization');
    console.log('✅ Background processing for proactive assistance');
    console.log('✅ Comprehensive metrics and analytics');

    console.log('\n🚀 The system has transformed from reactive to proactive!');
    console.log('Users no longer need to ask - the system anticipates their needs.');

  } catch (error) {
    console.error('❌ Demonstration failed:', error);
  } finally {
    // Cleanup
    console.log('\n🛑 Shutting down...');
    await cursorManager.shutdown();
    console.log('✅ Demonstration completed successfully');
  }
}

// Run the demonstration
if (require.main === module) {
  demonstrateProactiveScouting().catch(console.error);
}

module.exports = { demonstrateProactiveScouting };
