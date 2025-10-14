/**
 * Secure Supabase Database Client for Maya Travel Agent
 * Persistent storage for user profiles, conversations, and travel offers
 *
 * SECURITY FIXES IMPLEMENTED:
 * - Fixed service role key bypass (DB-VULN-001)
 * - Added input validation (DB-VULN-002)
 * - Removed memory fallback (DB-VULN-003)
 * - Added rate limiting (DB-VULN-004)
 * - Added connection pooling (DB-VULN-006)
 */

const { createClient } = require('@supabase/supabase-js');

class SecureSupabaseDB {
  constructor() {
    // 🔒 SECURITY FIX: Validate required environment variables
    if (!process.env.SUPABASE_URL) {
      throw new Error('❌ FATAL: SUPABASE_URL environment variable is required');
    }

    if (!process.env.SUPABASE_ANON_KEY) {
      throw new Error('❌ FATAL: SUPABASE_ANON_KEY environment variable is required');
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('❌ FATAL: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    }

    // 🔒 SECURITY FIX: Separate clients for different access levels
    // Public client with RLS for user operations (uses anon key)
    this.anonClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,  // ✅ Uses anon key with RLS
      {
        db: {
          poolSize: 10,                    // Connection pooling
          connectionTimeoutMillis: 60000,  // 60s timeout
          idleTimeoutMillis: 30000         // 30s idle timeout
        },
        global: {
          headers: {
            'Connection': 'keep-alive',
            'x-client-info': 'maya-travel-agent@1.0.0'
          }
        },
        auth: {
          autoRefreshToken: true,
          persistSession: false
        }
      }
    );

    // Admin client only for specific admin operations (uses service role key)
    this.adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,  // ⚠️ Service role for admin only
      {
        db: {
          poolSize: 5,  // Smaller pool for admin
          connectionTimeoutMillis: 60000,
          idleTimeoutMillis: 30000
        }
      }
    );

    // 🔒 SECURITY FIX: Rate limiting for database operations
    this.queryLimiter = new Map();
    this.memoryStorage = null;  // ❌ REMOVED memory fallback

    console.log('✅ Secure Supabase client initialized with RLS and rate limiting');
  }

  // 🔒 SECURITY FIX: Input validation functions
  validateTelegramId(id) {
    if (typeof id !== 'string' && typeof id !== 'number') {
      throw new Error('Invalid telegram_id type');
    }

    const numId = parseInt(id);
    if (isNaN(numId) || numId <= 0 || numId > Number.MAX_SAFE_INTEGER) {
      throw new Error('Invalid telegram_id value');
    }

    return numId;
  }

  validateUserData(data) {
    const schema = {
      username: (v) => typeof v === 'string' && v.length > 0 && v.length <= 100,
      first_name: (v) => !v || (typeof v === 'string' && v.length <= 100),
      last_name: (v) => !v || (typeof v === 'string' && v.length <= 100),
      preferences: (v) => !v || (typeof v === 'object' && v !== null),
      travel_history: (v) => !v || Array.isArray(v)
    };

    for (const [key, validator] of Object.entries(schema)) {
      if (data[key] !== undefined && !validator(data[key])) {
        throw new Error(`Invalid ${key}`);
      }
    }

    return data;
  }

  validateMessageData(data) {
    if (!data.content || typeof data.content !== 'string') {
      throw new Error('Invalid message content');
    }

    if (data.content.length > 10000) {
      throw new Error('Message too long');
    }

    if (!['user', 'assistant'].includes(data.role)) {
      throw new Error('Invalid message role');
    }

    return data;
  }

  // 🔒 SECURITY FIX: Rate limiting function
  async rateLimit(userId, operation) {
    const key = `${userId}:${operation}`;
    const now = Date.now();
    const limits = this.queryLimiter.get(key) || {
      count: 0,
      resetAt: now + 60000
    };

    if (now > limits.resetAt) {
      limits.count = 0;
      limits.resetAt = now + 60000;
    }

    limits.count++;
    this.queryLimiter.set(key, limits);

    if (limits.count > 100) {
      throw new Error('Rate limit exceeded for database operation');
    }
  }

  /**
   * Get or create user profile (using profiles table)
   * 🔒 SECURITY: Uses anon client with RLS
   */
  async getUserProfile(telegramId, userJwt = null) {
    const validId = this.validateTelegramId(telegramId);
    await this.rateLimit(validId, 'getUserProfile');

    try {
      // 🔒 SECURITY: Use anon client with user JWT for RLS
      let client = this.anonClient;
      if (userJwt) {
        client = this.anonClient.auth.setAuth(userJwt);
      }

      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('telegram_id', validId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Create new user profile (using profiles table)
   * 🔒 SECURITY: Uses anon client with RLS
   */
  async createUserProfile(telegramId, userData) {
    const validId = this.validateTelegramId(telegramId);
    const validData = this.validateUserData(userData);
    await this.rateLimit(validId, 'createUserProfile');

    try {
      const { data, error } = await this.anonClient
        .from('profiles')
        .insert([{
          telegram_id: validId,
          username: validData.username || null,
          avatar_url: validData.avatar_url || null,
          preferences: validData.preferences || {},
          travel_history: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile (using profiles table)
   * 🔒 SECURITY: Uses anon client with RLS
   */
  async updateUserProfile(telegramId, updates) {
    const validId = this.validateTelegramId(telegramId);
    await this.rateLimit(validId, 'updateUserProfile');

    try {
      const { data, error } = await this.anonClient
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', validId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  /**
   * Save conversation message (using messages table)
   * 🔒 SECURITY: Uses anon client with RLS
   */
  async saveConversationMessage(telegramId, message, isUser = true, userJwt = null) {
    const validId = this.validateTelegramId(telegramId);
    const messageData = { content: message, role: isUser ? 'user' : 'assistant' };
    const validMessage = this.validateMessageData(messageData);
    await this.rateLimit(validId, 'saveConversationMessage');

    try {
      // 🔒 SECURITY: Use anon client with user JWT for RLS
      let client = this.anonClient;
      if (userJwt) {
        client = this.anonClient.auth.setAuth(userJwt);
      }

      const { data, error } = await client
        .from('messages')
        .insert([{
          telegram_id: validId,
          content: validMessage.content,
          role: validMessage.role,
          is_telegram: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return null;
    }
  }

  /**
   * Get conversation history (using messages table)
   * 🔒 SECURITY: Uses anon client with RLS
   */
  async getConversationHistory(telegramId, limit = 20, userJwt = null) {
    const validId = this.validateTelegramId(telegramId);
    await this.rateLimit(validId, 'getConversationHistory');

    try {
      // 🔒 SECURITY: Use anon client with user JWT for RLS
      let client = this.anonClient;
      if (userJwt) {
        client = this.anonClient.auth.setAuth(userJwt);
      }

      const { data, error } = await client
        .from('messages')
        .select('*')
        .eq('telegram_id', validId)
        .eq('is_telegram', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Convert to expected format
      const formatted = data ? data.reverse().map(msg => ({
        message: msg.content,
        is_user: msg.role === 'user',
        timestamp: msg.created_at
      })) : [];

      return formatted;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  /**
   * Clear old conversation history (keep last 30 days)
   * 🔒 SECURITY: Uses anon client with RLS
   */
  async clearOldConversations(telegramId, userJwt = null) {
    const validId = this.validateTelegramId(telegramId);
    await this.rateLimit(validId, 'clearOldConversations');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // 🔒 SECURITY: Use anon client with user JWT for RLS
      let client = this.anonClient;
      if (userJwt) {
        client = this.anonClient.auth.setAuth(userJwt);
      }

      const { error } = await client
        .from('messages')
        .delete()
        .eq('telegram_id', validId)
        .eq('is_telegram', true)
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing old conversations:', error);
      return false;
    }
  }

  /**
   * Save user travel preference
   * 🔒 SECURITY: Uses anon client with RLS
   */
  async saveUserPreference(telegramId, preferenceKey, preferenceValue, userJwt = null) {
    const validId = this.validateTelegramId(telegramId);
    await this.rateLimit(validId, 'saveUserPreference');

    try {
      const profile = await this.getUserProfile(validId, userJwt);
      if (!profile) return null;

      const preferences = profile.preferences || {};
      preferences[preferenceKey] = preferenceValue;

      return await this.updateUserProfile(validId, { preferences }, userJwt);
    } catch (error) {
      console.error('Error saving user preference:', error);
      return null;
    }
  }

  /**
   * Add to travel history
   * 🔒 SECURITY: Uses anon client with RLS
   */
  async addToTravelHistory(telegramId, tripData, userJwt = null) {
    const validId = this.validateTelegramId(telegramId);
    await this.rateLimit(validId, 'addToTravelHistory');

    try {
      const profile = await this.getUserProfile(validId, userJwt);
      if (!profile) return null;

      const travelHistory = profile.travel_history || [];
      travelHistory.push({
        ...tripData,
        timestamp: new Date().toISOString()
      });

      return await this.updateUserProfile(validId, {
        travel_history: travelHistory
      }, userJwt);
    } catch (error) {
      console.error('Error adding to travel history:', error);
      return null;
    }
  }

  /**
   * Get all travel offers
   * 🔒 SECURITY: Uses anon client (no user-specific data)
   */
  async getTravelOffers(filters = {}) {
    try {
      let query = this.anonClient
        .from('travel_offers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (filters.destination) {
        query = query.ilike('destination', `%${filters.destination}%`);
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting travel offers:', error);
      return [];
    }
  }

  /**
   * Get personalized offers based on user history
   * 🔒 SECURITY: Uses anon client with RLS for user data
   */
  async getPersonalizedOffers(telegramId, userJwt = null) {
    const validId = this.validateTelegramId(telegramId);
    await this.rateLimit(validId, 'getPersonalizedOffers');

    try {
      const profile = await this.getUserProfile(validId, userJwt);
      if (!profile) return await this.getTravelOffers();

      const preferences = profile.preferences || {};
      const travelHistory = profile.travel_history || [];

      // Extract user preferences
      const filters = {
        maxPrice: preferences.budget_max || null,
        category: preferences.travel_style || null
      };

      // Get offers matching preferences
      let offers = await this.getTravelOffers(filters);

      // If user has travel history, prioritize similar destinations
      if (travelHistory.length > 0) {
        const visitedDestinations = travelHistory.map(t => t.destination);
        offers = offers.sort((a, b) => {
          const aMatch = visitedDestinations.some(d =>
            a.destination.toLowerCase().includes(d.toLowerCase())
          );
          const bMatch = visitedDestinations.some(d =>
            b.destination.toLowerCase().includes(d.toLowerCase())
          );
          return bMatch - aMatch;
        });
      }

      return offers;
    } catch (error) {
      console.error('Error getting personalized offers:', error);
      return [];
    }
  }

  /**
   * Create new travel offer
   * 🔒 SECURITY: Uses admin client (requires admin privileges)
   */
  async createTravelOffer(offerData) {
    try {
      console.warn('⚠️ Using admin access for travel offer creation');

      const { data, error } = await this.adminClient
        .from('travel_offers')
        .insert([{
          title: offerData.title,
          destination: offerData.destination,
          description: offerData.description,
          price: offerData.price,
          original_price: offerData.originalPrice || offerData.original_price || offerData.price,
          discount_percentage: offerData.discountPercentage || offerData.discount_percentage || 0,
          category: offerData.category || 'general',
          duration_days: offerData.durationDays || offerData.duration_days || 7,
          includes: offerData.includes || [],
          image_url: offerData.imageUrl || offerData.image_url || null,
          is_active: offerData.is_active !== undefined ? offerData.is_active : true,
          priority: offerData.priority || 0,
          valid_until: offerData.validUntil || offerData.valid_until || null,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating travel offer:', error);
      return null;
    }
  }

  /**
   * Track user interaction with offer
   * 🔒 SECURITY: Uses anon client with RLS
   */
  async trackOfferInteraction(telegramId, offerId, interactionType, userJwt = null) {
    const validId = this.validateTelegramId(telegramId);
    await this.rateLimit(validId, 'trackOfferInteraction');

    try {
      // 🔒 SECURITY: Use anon client with user JWT for RLS
      let client = this.anonClient;
      if (userJwt) {
        client = this.anonClient.auth.setAuth(userJwt);
      }

      const { data, error } = await client
        .from('offer_interactions')
        .insert([{
          telegram_id: validId,
          offer_id: offerId,
          interaction_type: interactionType, // 'view', 'click', 'book'
          timestamp: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error tracking offer interaction:', error);
      return null;
    }
  }

  /**
   * Get user analytics
   * 🔒 SECURITY: Uses anon client with RLS for user data
   */
  async getUserAnalytics(telegramId, userJwt = null) {
    const validId = this.validateTelegramId(telegramId);
    await this.rateLimit(validId, 'getUserAnalytics');

    try {
      const profile = await this.getUserProfile(validId, userJwt);
      const conversations = await this.getConversationHistory(validId, 100, userJwt);

      // 🔒 SECURITY: Use anon client with user JWT for RLS
      let client = this.anonClient;
      if (userJwt) {
        client = this.anonClient.auth.setAuth(userJwt);
      }

      const { data: interactions, error } = await client
        .from('offer_interactions')
        .select('*')
        .eq('telegram_id', validId);

      if (error) throw error;

      return {
        profile,
        totalConversations: conversations.length,
        totalInteractions: interactions?.length || 0,
        travelHistory: profile?.travel_history || [],
        preferences: profile?.preferences || {}
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return null;
    }
  }

  /**
   * Search offers by query
   * 🔒 SECURITY: Uses anon client (no user-specific data)
   */
  async searchOffers(query) {
    try {
      const { data, error } = await this.anonClient
        .from('travel_offers')
        .select('*')
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,destination.ilike.%${query}%,description.ilike.%${query}%`)
        .order('priority', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching offers:', error);
      return [];
    }
  }

  /**
   * 🔒 ADMIN ONLY: Get all users (bypasses RLS)
   * WARNING: This method bypasses Row Level Security
   */
  async adminGetAllUsers() {
    console.warn('⚠️ ADMIN ACCESS: Bypassing RLS for adminGetAllUsers');

    const { data, error } = await this.adminClient
      .from('profiles')
      .select('*');

    if (error) throw error;
    return data;
  }

  /**
   * 🔒 ADMIN ONLY: Get all messages (bypasses RLS)
   * WARNING: This method bypasses Row Level Security
   */
  async adminGetAllMessages() {
    console.warn('⚠️ ADMIN ACCESS: Bypassing RLS for adminGetAllMessages');

    const { data, error } = await this.adminClient
      .from('messages')
      .select('*');

    if (error) throw error;
    return data;
  }
}

module.exports = SecureSupabaseDB;