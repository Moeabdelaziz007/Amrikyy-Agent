/**
 * ============================================
 * OPENMEMORY MCP - UNIFIED MEMORY SERVICE
 * Phase 1: Core Foundation with AIX Integration
 * © 2025 Mohamed H Abdelaziz / AMRIKYY AI Solutions
 * ============================================
 * 
 * This service implements the OpenMemory MCP protocol,
 * providing a unified interface for agent memory across:
 * - Redis (ephemeral/short-term memory)
 * - Supabase (long-term/persistent memory)
 * 
 * Integrated with AIX Format for:
 * - user_id & project_id tracking
 * - Namespace management
 * - Memory type definitions
 * - Pattern learning storage
 */

import { createClient as createRedisClient, RedisClientType } from 'redis';
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env';

// ============================================
// TYPE DEFINITIONS (AIX-AWARE)
// ============================================

export type MemoryType = 'ephemeral' | 'short_term' | 'long_term' | 'pattern';
export type QueryType = 'semantic' | 'keyword' | 'ephemeral' | 'pattern';

/**
 * AIX-compliant memory context
 * Based on AIX meta.openmemory proposal
 */
export interface MemoryContext {
  userId?: string;          // AIX: meta.openmemory.user_id
  projectId?: string;       // AIX: meta.openmemory.project_id
  namespace?: string;       // AIX: meta.openmemory.namespace
  agentId: string;          // Agent identifier
  sessionId?: string;       // Session tracking
}

/**
 * Memory item with AIX metadata
 */
export interface MemoryItem {
  id?: string;
  key: string;
  value: any;
  type: MemoryType;
  context: MemoryContext;
  contentType?: string;     // e.g., 'component', 'task', 'conversation'
  createdAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Pattern learning entry
 * For adaptive agent behavior
 */
export interface PatternLearning {
  id?: string;
  pattern: string;
  context: string;
  frequency: number;
  confidence: number;
  lastSeen: Date;
  metadata?: Record<string, any>;
  memoryContext: MemoryContext;
}

/**
 * Memory query options
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  minConfidence?: number;
  sortBy?: 'createdAt' | 'confidence' | 'frequency';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Memory statistics
 */
export interface MemoryStats {
  ephemeralHits: number;
  ephemeralMisses: number;
  longTermHits: number;
  longTermMisses: number;
  patternsLearned: number;
  totalMemoryItems: number;
}

// ============================================
// MEMORY SERVICE CLASS
// ============================================

export class MemoryService {
  private redisClient: RedisClientType;
  private supabase: SupabaseClient;
  private isRedisConnected: boolean = false;
  private stats: MemoryStats = {
    ephemeralHits: 0,
    ephemeralMisses: 0,
    longTermHits: 0,
    longTermMisses: 0,
    patternsLearned: 0,
    totalMemoryItems: 0
  };

  constructor() {
    // Initialize Redis client
    this.redisClient = createRedisClient({ 
      url: config.redis.url,
      password: config.redis.password
    });

    this.redisClient.on('error', (err) => {
      console.error('🚨 MemoryService: Redis error:', err);
      this.isRedisConnected = false;
    });

    this.redisClient.on('connect', () => {
      console.log('✅ MemoryService: Redis connected');
      this.isRedisConnected = true;
    });

    // Initialize Supabase client
    this.supabase = createSupabaseClient(
      config.supabase.url,
      config.supabase.serviceRoleKey || config.supabase.anonKey
    );

    console.log('🧠 OpenMemory MCP: MemoryService initialized');
  }

  /**
   * Initialize the service and verify connections
   */
  async initialize(): Promise<void> {
    try {
      await this.redisClient.connect();
      console.log('✅ OpenMemory MCP: Redis connection established');
      
      // Verify Supabase tables exist
      await this.verifyLongTermStorage();
      
      console.log('✅ OpenMemory MCP: Fully initialized');
    } catch (error) {
      console.error('🚨 MemoryService initialization failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from all services
   */
  async disconnect(): Promise<void> {
    if (this.isRedisConnected && this.redisClient.isOpen) {
      await this.redisClient.quit();
      console.log('✅ MemoryService: Disconnected');
    }
  }

  // ============================================
  // EPHEMERAL MEMORY (Redis - Short TTL)
  // ============================================

  /**
   * Store ephemeral data (cache, temporary states)
   * TTL: seconds (default 1 hour)
   * 
   * AIX Integration: Uses namespace from context
   */
  async saveEphemeral<T>(
    context: MemoryContext,
    key: string, 
    data: T, 
    ttl: number = 3600
  ): Promise<void> {
    if (!this.isRedisConnected) {
      console.warn('⚠️  Redis not connected. Cannot save ephemeral data.');
      return;
    }

    try {
      const namespaceKey = this.buildKey(context, key, 'ephemeral');
      const serialized = JSON.stringify({
        data,
        context,
        createdAt: new Date().toISOString()
      });
      
      await this.redisClient.set(namespaceKey, serialized, { EX: ttl });
      console.log(`💾 OpenMemory: Ephemeral saved [${context.namespace}:${key}] TTL=${ttl}s`);
    } catch (error) {
      console.error(`Failed to save ephemeral data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get ephemeral data
   */
  async getEphemeral<T>(context: MemoryContext, key: string): Promise<T | null> {
    if (!this.isRedisConnected) {
      return null;
    }

    try {
      const namespaceKey = this.buildKey(context, key, 'ephemeral');
      const data = await this.redisClient.get(namespaceKey);
      
      if (data) {
        this.stats.ephemeralHits++;
        const parsed = JSON.parse(data);
        return parsed.data as T;
      }
      
      this.stats.ephemeralMisses++;
      return null;
    } catch (error) {
      console.error(`Failed to get ephemeral data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete ephemeral data
   */
  async deleteEphemeral(context: MemoryContext, key: string): Promise<void> {
    if (!this.isRedisConnected) return;
    
    const namespaceKey = this.buildKey(context, key, 'ephemeral');
    await this.redisClient.del(namespaceKey);
  }

  // ============================================
  // SHORT-TERM MEMORY (Redis - Longer TTL)
  // ============================================

  /**
   * Store short-term memory (session data, user context)
   * TTL: seconds (default 24 hours)
   */
  async saveShortTerm<T>(
    context: MemoryContext,
    key: string, 
    data: T, 
    ttl: number = 86400
  ): Promise<void> {
    await this.saveEphemeral(context, key, data, ttl);
  }

  async getShortTerm<T>(context: MemoryContext, key: string): Promise<T | null> {
    return await this.getEphemeral<T>(context, key);
  }

  // ============================================
  // LONG-TERM MEMORY (Supabase - Permanent)
  // ============================================

  /**
   * Verify long-term memory tables exist
   */
  private async verifyLongTermStorage(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('agent_memory')
        .select('id')
        .limit(1);

      if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
        console.warn('⚠️  Long-term memory tables not found. Please run Supabase migrations.');
        console.warn('   Tables needed: agent_memory, pattern_learning, user_preferences');
      } else {
        console.log('✅ OpenMemory: Long-term storage verified');
      }
    } catch (error) {
      console.warn('Could not verify long-term memory tables:', error);
    }
  }

  /**
   * Save long-term memory
   * 
   * AIX Integration: Includes user_id, project_id, namespace
   */
  async saveLongTerm(item: Omit<MemoryItem, 'createdAt'>): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('agent_memory')
        .insert({
          key: item.key,
          value: item.value,
          type: item.type,
          content_type: item.contentType,
          user_id: item.context.userId,
          project_id: item.context.projectId,
          namespace: item.context.namespace,
          agent_id: item.context.agentId,
          metadata: item.metadata,
          expires_at: item.expiresAt,
          created_at: new Date()
        })
        .select('id')
        .single();

      if (error) throw error;
      
      console.log(`💾 OpenMemory: Long-term saved [${item.context.namespace}:${item.key}]`);
      this.stats.totalMemoryItems++;
      
      return data?.id || null;
    } catch (error) {
      console.error(`Failed to save long-term data for key ${item.key}:`, error);
      throw error;
    }
  }

  /**
   * Get long-term memory
   */
  async getLongTerm(
    context: MemoryContext, 
    key: string
  ): Promise<any | null> {
    try {
      let query = this.supabase
        .from('agent_memory')
        .select('*')
        .eq('key', key)
        .eq('agent_id', context.agentId);

      // Apply AIX context filters
      if (context.userId) query = query.eq('user_id', context.userId);
      if (context.projectId) query = query.eq('project_id', context.projectId);
      if (context.namespace) query = query.eq('namespace', context.namespace);

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.message.includes('No rows found')) {
          this.stats.longTermMisses++;
          return null;
        }
        throw error;
      }

      this.stats.longTermHits++;
      return data.value;
    } catch (error) {
      console.error(`Failed to get long-term data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Query long-term memory by content type
   */
  async queryLongTerm(
    context: MemoryContext,
    contentType: string,
    options: QueryOptions = {}
  ): Promise<any[]> {
    try {
      let query = this.supabase
        .from('agent_memory')
        .select('*')
        .eq('content_type', contentType)
        .eq('agent_id', context.agentId);

      // Apply AIX context filters
      if (context.userId) query = query.eq('user_id', context.userId);
      if (context.projectId) query = query.eq('project_id', context.projectId);
      if (context.namespace) query = query.eq('namespace', context.namespace);

      // Apply options
      const limit = options.limit || 10;
      const offset = options.offset || 0;
      const sortBy = options.sortBy || 'created_at';
      const sortOrder = options.sortOrder === 'asc';

      const { data, error } = await query
        .order(sortBy, { ascending: sortOrder })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      
      return data?.map(item => item.value) || [];
    } catch (error) {
      console.error('Failed to query long-term memory:', error);
      return [];
    }
  }

  // ============================================
  // PATTERN LEARNING
  // ============================================

  /**
   * Save a learned pattern
   * 
   * AIX Integration: Pattern learning with context awareness
   */
  async savePattern(pattern: Omit<PatternLearning, 'id' | 'lastSeen'>): Promise<void> {
    try {
      // Check if pattern exists
      const { data: existing } = await this.supabase
        .from('pattern_learning')
        .select('*')
        .eq('pattern', pattern.pattern)
        .eq('context', pattern.context)
        .eq('agent_id', pattern.memoryContext.agentId)
        .maybeSingle();

      if (existing) {
        // Update frequency and confidence
        const { error } = await this.supabase
          .from('pattern_learning')
          .update({
            frequency: existing.frequency + 1,
            confidence: Math.min(existing.confidence + 0.05, 1.0),
            last_seen: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
        console.log(`📈 OpenMemory: Pattern updated [${pattern.pattern}]`);
      } else {
        // Create new pattern
        const { error } = await this.supabase
          .from('pattern_learning')
          .insert({
            pattern: pattern.pattern,
            context: pattern.context,
            frequency: pattern.frequency,
            confidence: pattern.confidence,
            user_id: pattern.memoryContext.userId,
            project_id: pattern.memoryContext.projectId,
            namespace: pattern.memoryContext.namespace,
            agent_id: pattern.memoryContext.agentId,
            metadata: pattern.metadata,
            last_seen: new Date().toISOString()
          });

        if (error) throw error;
        console.log(`✨ OpenMemory: New pattern learned [${pattern.pattern}]`);
        this.stats.patternsLearned++;
      }
    } catch (error) {
      console.error('Failed to save pattern:', error);
    }
  }

  /**
   * Get learned patterns
   */
  async getPatterns(
    context: MemoryContext,
    patternContext?: string,
    options: QueryOptions = {}
  ): Promise<PatternLearning[]> {
    try {
      let query = this.supabase
        .from('pattern_learning')
        .select('*')
        .eq('agent_id', context.agentId)
        .gte('confidence', options.minConfidence || 0.5);

      // Apply AIX context filters
      if (context.userId) query = query.eq('user_id', context.userId);
      if (context.projectId) query = query.eq('project_id', context.projectId);
      if (context.namespace) query = query.eq('namespace', context.namespace);
      if (patternContext) query = query.eq('context', patternContext);

      const { data, error } = await query
        .order('confidence', { ascending: false })
        .limit(options.limit || 10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get patterns:', error);
      return [];
    }
  }

  // ============================================
  // UNIFIED QUERY INTERFACE (MCP-STYLE)
  // ============================================

  /**
   * Unified memory query interface
   * Supports multiple query types and automatically routes to appropriate storage
   */
  async queryMemory<T>(
    context: MemoryContext,
    query: string,
    queryType: QueryType,
    options?: QueryOptions
  ): Promise<T[]> {
    console.log(`🔍 OpenMemory MCP: Query [${queryType}] for ${context.agentId}`);

    switch (queryType) {
      case 'ephemeral': {
        const result = await this.getEphemeral<T>(context, query);
        return result ? [result] : [];
      }

      case 'keyword': {
        // Query long-term by content type
        return await this.queryLongTerm(context, query, options) as T[];
      }

      case 'pattern': {
        // Query patterns
        const patterns = await this.getPatterns(context, query, options);
        return patterns as any as T[];
      }

      case 'semantic': {
        // TODO: Semantic search with vector DB
        // Will be implemented in Phase 2 with Qdrant/Pinecone
        console.warn('⚠️  Semantic search not yet implemented. Falling back to keyword.');
        return await this.queryLongTerm(context, query, options) as T[];
      }

      default:
        return [];
    }
  }

  /**
   * Unified memory storage interface
   */
  async storeMemory(
    context: MemoryContext,
    memoryType: MemoryType,
    key: string,
    content: any,
    options?: {
      contentType?: string;
      ttl?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<void | string> {
    console.log(`💾 OpenMemory MCP: Store [${memoryType}] ${key}`);

    if (memoryType === 'ephemeral') {
      await this.saveEphemeral(context, key, content, options?.ttl || 3600);
    } else if (memoryType === 'short_term') {
      await this.saveShortTerm(context, key, content, options?.ttl || 86400);
    } else if (memoryType === 'long_term') {
      return await this.saveLongTerm({
        key,
        value: content,
        type: memoryType,
        context,
        contentType: options?.contentType,
        metadata: options?.metadata
      });
    } else if (memoryType === 'pattern') {
      await this.savePattern({
        pattern: key,
        context: options?.contentType || 'general',
        frequency: 1,
        confidence: 0.7,
        memoryContext: context,
        metadata: options?.metadata
      });
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Build namespaced key for Redis
   * Format: namespace:agentId:userId:key:type
   */
  private buildKey(
    context: MemoryContext,
    key: string,
    type: string
  ): string {
    const parts = [
      context.namespace || 'default',
      context.agentId,
      context.userId || 'anonymous',
      key,
      type
    ];
    return parts.join(':');
  }

  /**
   * Get memory statistics
   */
  getStats(): MemoryStats & { hitRate: { ephemeral: number; longTerm: number } } {
    const ephemeralTotal = this.stats.ephemeralHits + this.stats.ephemeralMisses;
    const longTermTotal = this.stats.longTermHits + this.stats.longTermMisses;

    return {
      ...this.stats,
      hitRate: {
        ephemeral: ephemeralTotal > 0 ? this.stats.ephemeralHits / ephemeralTotal : 0,
        longTerm: longTermTotal > 0 ? this.stats.longTermHits / longTermTotal : 0
      }
    };
  }

  /**
   * Clear all ephemeral memory (use with caution!)
   */
  async clearEphemeral(context?: MemoryContext): Promise<void> {
    if (!this.isRedisConnected) return;

    if (context && context.namespace) {
      // Clear only namespace
      const pattern = `${context.namespace}:*`;
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
      }
      console.log(`🗑️  OpenMemory: Cleared ephemeral for namespace ${context.namespace}`);
    } else {
      await this.redisClient.flushDb();
      console.log('🗑️  OpenMemory: All ephemeral memory cleared');
    }
  }

  /**
   * Get memory usage
   */
  async getMemoryUsage(): Promise<{ redis: any; supabase: any }> {
    const redisInfo = this.isRedisConnected 
      ? await this.redisClient.info('memory')
      : 'Not connected';

    const { count: memoryCount } = await this.supabase
      .from('agent_memory')
      .select('id', { count: 'exact', head: true });

    const { count: patternCount } = await this.supabase
      .from('pattern_learning')
      .select('id', { count: 'exact', head: true });

    return {
      redis: redisInfo,
      supabase: {
        memoryRecords: memoryCount || 0,
        patternRecords: patternCount || 0,
        total: (memoryCount || 0) + (patternCount || 0)
      }
    };
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const memoryService = new MemoryService();
export default memoryService;
