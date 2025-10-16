/**
 * Proactive Scout Agent - The Intelligent Travel Scout
 * Monitors user interests, analyzes patterns, and proactively generates personalized travel offers
 * Transforms the system from reactive to proactive travel assistance
 */

const EventEmitter = require('events');
const winston = require('winston');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

class ProactiveScoutAgent extends EventEmitter {
  constructor(manager) {
    super();
    
    this.agentId = 'proactive-scout-agent';
    this.role = 'proactive_scout';
    this.status = 'initializing';
    this.version = '1.0.0';
    this.manager = manager;
    
    // Core capabilities
    this.capabilities = [
      'user_interest_monitoring',
      'pattern_analysis',
      'proactive_offer_generation',
      'price_tracking',
      'notification_management',
      'personalization_engine',
      'behavioral_analysis',
      'market_intelligence'
    ];

    // Configuration
    this.config = {
      monitoringInterval: 5 * 60 * 1000, // 5 minutes
      offerGenerationInterval: 30 * 60 * 1000, // 30 minutes
      maxOffersPerUser: 3,
      offerValidityDays: 7,
      priceDropThreshold: 0.15, // 15% price drop triggers offer
      interestThreshold: 3, // Minimum mentions to consider interest
      notificationChannels: ['telegram', 'whatsapp'],
      ...manager?.config?.scout || {}
    };

    // Initialize logger
    this.setupLogger();
    
    // Scout data structures
    this.userInterests = new Map(); // userId -> interest data
    this.activeOffers = new Map(); // userId -> active offers
    this.priceHistory = new Map(); // destination -> price history
    this.notificationQueue = new Map(); // userId -> pending notifications
    this.scoutingMetrics = new Map(); // destination -> scouting data

    // Performance metrics
    this.metrics = {
      usersMonitored: 0,
      offersGenerated: 0,
      notificationsSent: 0,
      priceAlertsTriggered: 0,
      userEngagementRate: 0,
      averageOfferResponseTime: 0,
      totalSavingsIdentified: 0
    };

    // Monitoring intervals
    this.monitoringIntervals = new Set();
    
    this.logger.info('🎯 Proactive Scout Agent initialized', { 
      version: this.version,
      config: this.config 
    });
  }

  /**
   * Setup Winston logger
   */
  setupLogger() {
    const LOG_DIR = path.join('backend', 'logs');
    if (!fsSync.existsSync(LOG_DIR)) {
      fsSync.mkdirSync(LOG_DIR, { recursive: true });
    }

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ 
          filename: path.join(LOG_DIR, 'proactive-scout-agent.log') 
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  /**
   * Initialize the Proactive Scout Agent
   */
  async initialize() {
    try {
      this.logger.info('🚀 Initializing Proactive Scout Agent...');
      this.status = 'initializing';

      // Load existing user interests and offers
      await this.loadScoutingData();
      
      // Initialize monitoring systems
      await this.initializeMonitoringSystems();
      
      // Start background monitoring
      this.startBackgroundMonitoring();
      
      // Initialize offer generation system
      await this.initializeOfferGenerationSystem();

      this.status = 'active';
      this.logger.info('✅ Proactive Scout Agent initialized successfully');
      
      this.emit('scout_agent_ready', {
        agentId: this.agentId,
        usersMonitored: this.userInterests.size,
        activeOffers: this.activeOffers.size
      });

    } catch (error) {
      this.logger.error('❌ Failed to initialize Proactive Scout Agent:', error);
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Load existing scouting data from storage
   */
  async loadScoutingData() {
    try {
      const dataDir = path.join('backend', 'data', 'scout');
      await fs.mkdir(dataDir, { recursive: true });
      
      // Load user interests
      const interestsFile = path.join(dataDir, 'user_interests.json');
      if (fsSync.existsSync(interestsFile)) {
        const interestsData = await fs.readFile(interestsFile, 'utf8');
        const interests = JSON.parse(interestsData);
        this.userInterests = new Map(Object.entries(interests));
        this.logger.info(`📊 Loaded ${this.userInterests.size} user interest profiles`);
      }

      // Load active offers
      const offersFile = path.join(dataDir, 'active_offers.json');
      if (fsSync.existsSync(offersFile)) {
        const offersData = await fs.readFile(offersFile, 'utf8');
        const offers = JSON.parse(offersData);
        this.activeOffers = new Map(Object.entries(offers));
        this.logger.info(`🎯 Loaded ${this.activeOffers.size} active offers`);
      }

      // Load price history
      const priceFile = path.join(dataDir, 'price_history.json');
      if (fsSync.existsSync(priceFile)) {
        const priceData = await fs.readFile(priceFile, 'utf8');
        const prices = JSON.parse(priceData);
        this.priceHistory = new Map(Object.entries(prices));
        this.logger.info(`💰 Loaded price history for ${this.priceHistory.size} destinations`);
      }

    } catch (error) {
      this.logger.warn('⚠️ Failed to load scouting data:', error.message);
    }
  }

  /**
   * Save scouting data to storage
   */
  async saveScoutingData() {
    try {
      const dataDir = path.join('backend', 'data', 'scout');
      await fs.mkdir(dataDir, { recursive: true });
      
      // Save user interests
      const interestsFile = path.join(dataDir, 'user_interests.json');
      await fs.writeFile(interestsFile, JSON.stringify(
        Object.fromEntries(this.userInterests), null, 2
      ));

      // Save active offers
      const offersFile = path.join(dataDir, 'active_offers.json');
      await fs.writeFile(offersFile, JSON.stringify(
        Object.fromEntries(this.activeOffers), null, 2
      ));

      // Save price history
      const priceFile = path.join(dataDir, 'price_history.json');
      await fs.writeFile(priceFile, JSON.stringify(
        Object.fromEntries(this.priceHistory), null, 2
      ));

      this.logger.debug('💾 Scouting data saved successfully');
    } catch (error) {
      this.logger.error('❌ Failed to save scouting data:', error);
    }
  }

  /**
   * Initialize monitoring systems
   */
  async initializeMonitoringSystems() {
    // Initialize user interest tracking
    this.userInterestTracker = {
      trackUserInterest: this.trackUserInterest.bind(this),
      analyzeConversationPatterns: this.analyzeConversationPatterns.bind(this),
      updateUserProfile: this.updateUserProfile.bind(this)
    };

    // Initialize price monitoring
    this.priceMonitor = {
      trackPriceChanges: this.trackPriceChanges.bind(this),
      detectPriceDrops: this.detectPriceDrops.bind(this),
      updatePriceHistory: this.updatePriceHistory.bind(this)
    };

    // Initialize offer generator
    this.offerGenerator = {
      generatePersonalizedOffer: this.generatePersonalizedOffer.bind(this),
      validateOfferRelevance: this.validateOfferRelevance.bind(this),
      calculateOfferScore: this.calculateOfferScore.bind(this)
    };

    this.logger.info('✅ Monitoring systems initialized');
  }

  /**
   * Start background monitoring
   */
  startBackgroundMonitoring() {
    // Monitor user conversations and interests
    const interestMonitoringInterval = setInterval(() => {
      this.monitorUserInterests();
    }, this.config.monitoringInterval);

    // Generate offers periodically
    const offerGenerationInterval = setInterval(() => {
      this.generateProactiveOffers();
    }, this.config.offerGenerationInterval);

    // Process notification queue
    const notificationInterval = setInterval(() => {
      this.processNotificationQueue();
    }, 2 * 60 * 1000); // Every 2 minutes

    // Save data periodically
    const saveInterval = setInterval(() => {
      this.saveScoutingData();
    }, 10 * 60 * 1000); // Every 10 minutes

    this.monitoringIntervals.add(interestMonitoringInterval);
    this.monitoringIntervals.add(offerGenerationInterval);
    this.monitoringIntervals.add(notificationInterval);
    this.monitoringIntervals.add(saveInterval);

    this.logger.info('🔄 Background monitoring started');
  }

  /**
   * Monitor user interests from conversations and behavior
   */
  async monitorUserInterests() {
    try {
      this.logger.debug('🔍 Monitoring user interests...');

      // Get recent conversations from database
      const recentConversations = await this.getRecentConversations();
      
      for (const conversation of recentConversations) {
        await this.analyzeConversationForInterests(conversation);
      }

      // Update user interest profiles
      await this.updateUserInterestProfiles();

      this.logger.debug('✅ User interest monitoring completed');
    } catch (error) {
      this.logger.error('❌ User interest monitoring failed:', error);
    }
  }

  /**
   * Get recent conversations from database
   */
  async getRecentConversations() {
    try {
      // This would integrate with the existing conversation system
      // For now, we'll simulate getting recent conversations
      const conversations = [];
      
      // In production, this would query the ai_conversations table
      // const { data } = await this.manager.db.supabase
      //   .from('ai_conversations')
      //   .select('*')
      //   .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      //   .order('created_at', { ascending: false })
      //   .limit(100);

      return conversations;
    } catch (error) {
      this.logger.error('❌ Failed to get recent conversations:', error);
      return [];
    }
  }

  /**
   * Analyze conversation for user interests
   */
  async analyzeConversationForInterests(conversation) {
    const userId = conversation.user_id;
    const message = conversation.message.toLowerCase();
    
    // Extract travel-related keywords
    const travelKeywords = {
      destinations: ['tokyo', 'paris', 'dubai', 'istanbul', 'malaysia', 'thailand', 'japan', 'france', 'turkey'],
      activities: ['sightseeing', 'shopping', 'food', 'culture', 'adventure', 'relaxation'],
      budget: ['budget', 'cheap', 'expensive', 'luxury', 'affordable'],
      timing: ['next month', 'summer', 'winter', 'spring', 'autumn', 'weekend', 'holiday']
    };

    const interests = this.userInterests.get(userId) || {
      userId,
      destinations: new Map(),
      activities: new Map(),
      budgetPreferences: new Map(),
      timingPreferences: new Map(),
      lastUpdated: new Date(),
      conversationCount: 0
    };

    // Analyze destinations
    for (const destination of travelKeywords.destinations) {
      if (message.includes(destination)) {
        const count = interests.destinations.get(destination) || 0;
        interests.destinations.set(destination, count + 1);
      }
    }

    // Analyze activities
    for (const activity of travelKeywords.activities) {
      if (message.includes(activity)) {
        const count = interests.activities.get(activity) || 0;
        interests.activities.set(activity, count + 1);
      }
    }

    // Analyze budget preferences
    for (const budget of travelKeywords.budget) {
      if (message.includes(budget)) {
        const count = interests.budgetPreferences.get(budget) || 0;
        interests.budgetPreferences.set(budget, count + 1);
      }
    }

    // Analyze timing preferences
    for (const timing of travelKeywords.timing) {
      if (message.includes(timing)) {
        const count = interests.timingPreferences.get(timing) || 0;
        interests.timingPreferences.set(timing, count + 1);
      }
    }

    interests.conversationCount++;
    interests.lastUpdated = new Date();
    
    this.userInterests.set(userId, interests);
    this.metrics.usersMonitored = this.userInterests.size;
  }

  /**
   * Update user interest profiles
   */
  async updateUserInterestProfiles() {
    for (const [userId, interests] of this.userInterests) {
      // Calculate interest scores
      const topDestinations = Array.from(interests.destinations.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const topActivities = Array.from(interests.activities.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      // Update interest profile
      interests.topDestinations = topDestinations;
      interests.topActivities = topActivities;
      interests.interestScore = this.calculateInterestScore(interests);

      this.userInterests.set(userId, interests);
    }
  }

  /**
   * Calculate interest score for a user
   */
  calculateInterestScore(interests) {
    let score = 0;
    
    // Destination interest score
    const destinationScore = Array.from(interests.destinations.values())
      .reduce((sum, count) => sum + count, 0);
    
    // Activity interest score
    const activityScore = Array.from(interests.activities.values())
      .reduce((sum, count) => sum + count, 0);
    
    // Conversation engagement score
    const engagementScore = Math.min(interests.conversationCount * 2, 20);
    
    score = (destinationScore * 3) + (activityScore * 2) + engagementScore;
    
    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Generate proactive offers based on user interests
   */
  async generateProactiveOffers() {
    try {
      this.logger.info('🎯 Generating proactive offers...');

      for (const [userId, interests] of this.userInterests) {
        // Skip if user already has max offers
        const userOffers = this.activeOffers.get(userId) || [];
        if (userOffers.length >= this.config.maxOffersPerUser) {
          continue;
        }

        // Generate offers for top destinations
        for (const [destination, mentionCount] of interests.topDestinations) {
          if (mentionCount >= this.config.interestThreshold) {
            const offer = await this.generateOfferForDestination(userId, destination, interests);
            if (offer) {
              await this.addOfferToUser(userId, offer);
            }
          }
        }
      }

      this.logger.info('✅ Proactive offer generation completed');
    } catch (error) {
      this.logger.error('❌ Proactive offer generation failed:', error);
    }
  }

  /**
   * Generate offer for specific destination
   */
  async generateOfferForDestination(userId, destination, interests) {
    try {
      // Get current prices for destination
      const currentPrices = await this.getCurrentPrices(destination);
      if (!currentPrices) {
        return null;
      }

      // Check for price drops
      const priceDrop = this.detectPriceDrop(destination, currentPrices);
      if (priceDrop < this.config.priceDropThreshold) {
        return null; // No significant price drop
      }

      // Generate personalized offer
      const offer = {
        id: `offer_${userId}_${destination}_${Date.now()}`,
        userId,
        destination,
        title: this.generateOfferTitle(destination, priceDrop),
        description: this.generateOfferDescription(destination, interests),
        originalPrice: currentPrices.originalPrice,
        currentPrice: currentPrices.currentPrice,
        discountPercentage: Math.round(priceDrop * 100),
        savings: currentPrices.originalPrice - currentPrices.currentPrice,
        validityDays: this.config.offerValidityDays,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + (this.config.offerValidityDays * 24 * 60 * 60 * 1000)),
        status: 'active',
        personalizationScore: this.calculatePersonalizationScore(interests, destination),
        notificationSent: false
      };

      this.metrics.offersGenerated++;
      this.metrics.totalSavingsIdentified += offer.savings;

      return offer;
    } catch (error) {
      this.logger.error(`❌ Failed to generate offer for ${destination}:`, error);
      return null;
    }
  }

  /**
   * Get current prices for destination (simulated)
   */
  async getCurrentPrices(destination) {
    // In production, this would integrate with flight/hotel APIs
    // For now, we'll simulate price data
    const basePrices = {
      'tokyo': { originalPrice: 2500, currentPrice: 2000 },
      'paris': { originalPrice: 1800, currentPrice: 1500 },
      'dubai': { originalPrice: 1200, currentPrice: 1000 },
      'istanbul': { originalPrice: 800, currentPrice: 650 },
      'malaysia': { originalPrice: 1500, currentPrice: 1200 }
    };

    return basePrices[destination.toLowerCase()] || null;
  }

  /**
   * Detect price drop for destination
   */
  detectPriceDrop(destination, currentPrices) {
    const history = this.priceHistory.get(destination) || [];
    if (history.length === 0) {
      // First time tracking this destination
      this.updatePriceHistory(destination, currentPrices);
      return 0;
    }

    const lastPrice = history[history.length - 1].price;
    const drop = (lastPrice - currentPrices.currentPrice) / lastPrice;
    
    this.updatePriceHistory(destination, currentPrices);
    return drop;
  }

  /**
   * Update price history for destination
   */
  updatePriceHistory(destination, prices) {
    const history = this.priceHistory.get(destination) || [];
    history.push({
      price: prices.currentPrice,
      timestamp: new Date(),
      originalPrice: prices.originalPrice
    });

    // Keep only last 30 entries
    if (history.length > 30) {
      history.splice(0, history.length - 30);
    }

    this.priceHistory.set(destination, history);
  }

  /**
   * Generate offer title
   */
  generateOfferTitle(destination, priceDrop) {
    const discount = Math.round(priceDrop * 100);
    const destinationNames = {
      'tokyo': 'طوكيو',
      'paris': 'باريس',
      'dubai': 'دبي',
      'istanbul': 'إسطنبول',
      'malaysia': 'ماليزيا'
    };

    const name = destinationNames[destination.toLowerCase()] || destination;
    return `عرض خاص: ${name} بخصم ${discount}%`;
  }

  /**
   * Generate offer description
   */
  generateOfferDescription(destination, interests) {
    const descriptions = {
      'tokyo': 'اكتشف الثقافة اليابانية الأصيلة في طوكيو مع أفضل العروض',
      'paris': 'استمتع بالرومانسية الفرنسية في مدينة النور',
      'dubai': 'تجربة فاخرة في دبي مع أفضل الفنادق والأنشطة',
      'istanbul': 'رحلة تاريخية في إسطنبول بين القارات',
      'malaysia': 'مغامرة استوائية في ماليزيا مع الطبيعة الخلابة'
    };

    let description = descriptions[destination.toLowerCase()] || `رحلة مميزة إلى ${destination}`;
    
    // Add personalized elements based on interests
    if (interests.topActivities.length > 0) {
      const topActivity = interests.topActivities[0][0];
      description += ` - مثالية لمحبي ${topActivity}`;
    }

    return description;
  }

  /**
   * Calculate personalization score for offer
   */
  calculatePersonalizationScore(interests, destination) {
    let score = 0;
    
    // Destination interest score
    const destScore = interests.destinations.get(destination) || 0;
    score += destScore * 10;
    
    // Activity alignment score
    const activityScore = interests.topActivities.reduce((sum, [activity, count]) => {
      return sum + (count * 5);
    }, 0);
    score += activityScore;
    
    // Engagement score
    score += Math.min(interests.conversationCount * 2, 20);
    
    return Math.min(score, 100);
  }

  /**
   * Add offer to user
   */
  async addOfferToUser(userId, offer) {
    const userOffers = this.activeOffers.get(userId) || [];
    userOffers.push(offer);
    this.activeOffers.set(userId, userOffers);
    
    // Add to notification queue
    await this.addToNotificationQueue(userId, offer);
    
    this.logger.info(`🎯 Offer added for user ${userId}: ${offer.title}`);
  }

  /**
   * Add offer to notification queue
   */
  async addToNotificationQueue(userId, offer) {
    const notifications = this.notificationQueue.get(userId) || [];
    notifications.push({
      type: 'new_offer',
      offer,
      timestamp: new Date(),
      channels: this.config.notificationChannels
    });
    this.notificationQueue.set(userId, notifications);
  }

  /**
   * Process notification queue
   */
  async processNotificationQueue() {
    try {
      for (const [userId, notifications] of this.notificationQueue) {
        for (const notification of notifications) {
          await this.sendNotification(userId, notification);
        }
        
        // Clear processed notifications
        this.notificationQueue.set(userId, []);
      }
    } catch (error) {
      this.logger.error('❌ Failed to process notification queue:', error);
    }
  }

  /**
   * Send notification to user
   */
  async sendNotification(userId, notification) {
    try {
      if (notification.type === 'new_offer') {
        const message = this.formatOfferNotification(notification.offer);
        
        // Send via Telegram if available
        if (notification.channels.includes('telegram')) {
          await this.sendTelegramNotification(userId, message);
        }
        
        // Send via WhatsApp if available
        if (notification.channels.includes('whatsapp')) {
          await this.sendWhatsAppNotification(userId, message);
        }
        
        // Mark offer as notified
        notification.offer.notificationSent = true;
        this.metrics.notificationsSent++;
        
        this.logger.info(`📱 Notification sent to user ${userId}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to send notification to user ${userId}:`, error);
    }
  }

  /**
   * Format offer notification message
   */
  formatOfferNotification(offer) {
    return `🎯 ${offer.title}

${offer.description}

💰 السعر الأصلي: $${offer.originalPrice}
💸 السعر الحالي: $${offer.currentPrice}
🎉 وفرت: $${offer.savings} (${offer.discountPercentage}%)

⏰ العرض صالح حتى: ${offer.expiresAt.toLocaleDateString('ar-SA')}

هل تريد رؤية التفاصيل الكاملة؟`;
  }

  /**
   * Send Telegram notification
   */
  async sendTelegramNotification(userId, message) {
    // This would integrate with the existing Telegram bot
    // For now, we'll log the notification
    this.logger.info(`📱 Telegram notification for user ${userId}: ${message.substring(0, 100)}...`);
  }

  /**
   * Send WhatsApp notification
   */
  async sendWhatsAppNotification(userId, message) {
    // This would integrate with the existing WhatsApp client
    // For now, we'll log the notification
    this.logger.info(`📱 WhatsApp notification for user ${userId}: ${message.substring(0, 100)}...`);
  }

  /**
   * Get scout agent status
   */
  getStatus() {
    return {
      agentId: this.agentId,
      status: this.status,
      version: this.version,
      metrics: {
        usersMonitored: this.metrics.usersMonitored,
        offersGenerated: this.metrics.offersGenerated,
        notificationsSent: this.metrics.notificationsSent,
        priceAlertsTriggered: this.metrics.priceAlertsTriggered,
        totalSavingsIdentified: this.metrics.totalSavingsIdentified,
        activeOffers: Array.from(this.activeOffers.values()).flat().length,
        notificationQueue: Array.from(this.notificationQueue.values()).flat().length
      },
      config: this.config,
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Shutdown scout agent
   */
  async shutdown() {
    this.logger.info('🛑 Shutting down Proactive Scout Agent...');
    this.status = 'shutting_down';
    
    try {
      // Stop monitoring intervals
      this.monitoringIntervals.forEach(intervalId => clearInterval(intervalId));
      this.monitoringIntervals.clear();
      
      // Save final data
      await this.saveScoutingData();
      
      this.status = 'stopped';
      this.logger.info('✅ Proactive Scout Agent shut down successfully');
    } catch (error) {
      this.logger.error('❌ Error during shutdown:', error);
      throw error;
    }
  }
}

module.exports = ProactiveScoutAgent;
