/**
 * Monitor User Interests Tool
 * Analyzes user conversation history to extract key interests and preferences
 * 
 * @author Maya Travel Agent
 * @version 1.0.0
 */

const BaseTool = require('./BaseTool');
const SupabaseDB = require('../database/supabase');
const LLMService = require('../services/LLMService');

class MonitorUserInterestsTool extends BaseTool {
    constructor() {
        super();
        this.name = 'monitor_user_interests';
        this.description = 'Analyzes user conversation history to extract key interests and preferences';
        this.parameters = {
            type: 'object',
            properties: {
                telegramId: {
                    type: 'string',
                    description: 'Telegram user ID to analyze interests for'
                },
                conversationLimit: {
                    type: 'number',
                    description: 'Number of recent conversations to analyze (default: 50)',
                    default: 50
                },
                forceRefresh: {
                    type: 'boolean',
                    description: 'Force refresh of cached interests (default: false)',
                    default: false
                }
            },
            required: ['telegramId']
        };
        
        this.db = new SupabaseDB();
        this.llmService = new LLMService();
    }

    /**
     * Extract interests from conversation history using LLM
     */
    async performExecution(args) {
        const { telegramId, conversationLimit = 50, forceRefresh = false } = args;
        
        try {
            // Check if we have cached interests and refresh is not forced
            if (!forceRefresh) {
                const cachedInterests = await this.getCachedInterests(telegramId);
                if (cachedInterests) {
                    this.logger.info('Using cached interests', { telegramId });
                    return {
                        interests: cachedInterests,
                        source: 'cache',
                        timestamp: new Date().toISOString()
                    };
                }
            }
            
            // Get conversation history
            const conversations = await this.db.getConversationHistory(telegramId, conversationLimit);
            
            if (conversations.length === 0) {
                this.logger.info('No conversation history found', { telegramId });
                return {
                    interests: [],
                    source: 'no_data',
                    timestamp: new Date().toISOString()
                };
            }
            
            // Prepare conversation text for analysis
            const conversationText = this.prepareConversationText(conversations);
            
            // Use LLM to extract interests
            const interests = await this.extractInterestsWithLLM(conversationText);
            
            // Cache the extracted interests
            await this.cacheInterests(telegramId, interests);
            
            this.logger.info('Successfully extracted user interests', { 
                telegramId, 
                interestsCount: interests.length 
            });
            
            return {
                interests,
                source: 'analysis',
                conversationsAnalyzed: conversations.length,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            this.logger.error('Failed to monitor user interests', { 
                telegramId, 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Prepare conversation text for LLM analysis
     */
    prepareConversationText(conversations) {
        return conversations
            .map(conv => `${conv.is_user ? 'User' : 'Assistant'}: ${conv.message}`)
            .join('\n');
    }

    /**
     * Extract interests using LLM analysis
     */
    async extractInterestsWithLLM(conversationText) {
        const prompt = `
You are analyzing a user's conversation history to extract their travel interests and preferences.

Analyze the following conversation and extract:
1. Preferred destinations (countries, cities, regions)
2. Travel types (beach, mountain, city, cultural, adventure, etc.)
3. Budget preferences (economy, mid-range, luxury)
4. Travel duration preferences
5. Activities mentioned (sightseeing, food, shopping, nature, etc.)
6. Any specific travel patterns or recurring interests

Return your analysis as a JSON object with the following structure:
{
  "destinations": ["destination1", "destination2"],
  "travelTypes": ["type1", "type2"],
  "budgetRange": "economy|mid-range|luxury",
  "preferredDurations": ["duration1", "duration2"],
  "activities": ["activity1", "activity2"],
  "patterns": ["pattern1", "pattern2"],
  "confidenceScore": 0.95
}

Conversation history:
${conversationText}
`;

        const response = await this.llmService.generateResponse({
            prompt,
            maxTokens: 1000,
            temperature: 0.3
        });

        try {
            const interests = JSON.parse(response);
            return this.validateAndCleanInterests(interests);
        } catch (parseError) {
            this.logger.error('Failed to parse LLM response', { 
                error: parseError.message,
                response 
            });
            return this.getDefaultInterests();
        }
    }

    /**
     * Validate and clean extracted interests
     */
    validateAndCleanInterests(interests) {
        const cleaned = {
            destinations: Array.isArray(interests.destinations) ? interests.destinations : [],
            travelTypes: Array.isArray(interests.travelTypes) ? interests.travelTypes : [],
            budgetRange: interests.budgetRange || 'mid-range',
            preferredDurations: Array.isArray(interests.preferredDurations) ? interests.preferredDurations : [],
            activities: Array.isArray(interests.activities) ? interests.activities : [],
            patterns: Array.isArray(interests.patterns) ? interests.patterns : [],
            confidenceScore: Math.min(1, Math.max(0, interests.confidenceScore || 0.5))
        };

        // Clean arrays
        Object.keys(cleaned).forEach(key => {
            if (Array.isArray(cleaned[key])) {
                cleaned[key] = cleaned[key]
                    .filter(item => typeof item === 'string' && item.trim().length > 0)
                    .map(item => item.trim())
                    .slice(0, 10); // Limit to top 10 items
            }
        });

        return cleaned;
    }

    /**
     * Get default interests structure
     */
    getDefaultInterests() {
        return {
            destinations: [],
            travelTypes: [],
            budgetRange: 'mid-range',
            preferredDurations: [],
            activities: [],
            patterns: [],
            confidenceScore: 0.1
        };
    }

    /**
     * Get cached interests from database
     */
    async getCachedInterests(telegramId) {
        try {
            const profile = await this.db.getUserProfile(telegramId);
            if (profile && profile.cached_interests) {
                // Check if cache is recent (less than 24 hours old)
                const cacheTime = new Date(profile.interests_cached_at || 0);
                const now = new Date();
                const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);
                
                if (hoursDiff < 24) {
                    return profile.cached_interests;
                }
            }
            return null;
        } catch (error) {
            this.logger.error('Failed to get cached interests', { error: error.message });
            return null;
        }
    }

    /**
     * Cache extracted interests in database
     */
    async cacheInterests(telegramId, interests) {
        try {
            await this.db.updateUserProfile(telegramId, {
                cached_interests: interests,
                interests_cached_at: new Date().toISOString()
            });
        } catch (error) {
            this.logger.error('Failed to cache interests', { error: error.message });
        }
    }
}

// Create and export tool instance
const monitorUserInterestsTool = new MonitorUserInterestsTool();
module.exports = monitorUserInterestsTool;