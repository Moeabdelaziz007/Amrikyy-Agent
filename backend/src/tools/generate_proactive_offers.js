/**
 * Generate Proactive Offers Tool
 * Combines user interests with price data to create personalized travel offers
 * 
 * @author Maya Travel Agent
 * @version 1.0.0
 */

const BaseTool = require('./BaseTool');
const SupabaseDB = require('../database/supabase');
const LLMService = require('../services/LLMService');

class GenerateProactiveOffersTool extends BaseTool {
    constructor() {
        super();
        this.name = 'generate_proactive_offers';
        this.description = 'Combines user interests with price data to create personalized travel offers';
        this.parameters = {
            type: 'object',
            properties: {
                telegramId: {
                    type: 'string',
                    description: 'Telegram user ID to generate offers for'
                },
                userInterests: {
                    type: 'object',
                    description: 'User interests data (optional, will fetch if not provided)',
                    properties: {
                        destinations: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        travelTypes: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        budgetRange: {
                            type: 'string',
                            enum: ['economy', 'mid-range', 'luxury']
                        },
                        preferredDurations: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        activities: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    }
                },
                priceData: {
                    type: 'array',
                    description: 'Price data for destinations (optional, will fetch if not provided)',
                    items: {
                        type: 'object',
                        properties: {
                            route: { type: 'string' },
                            currentPrice: { type: 'number' },
                            previousPrice: { type: 'number' },
                            isSignificantDrop: { type: 'boolean' }
                        }
                    }
                },
                maxOffers: {
                    type: 'number',
                    description: 'Maximum number of offers to generate (default: 5)',
                    default: 5
                },
                includePersonalizedMessage: {
                    type: 'boolean',
                    description: 'Include personalized message with offers (default: true)',
                    default: true
                }
            },
            required: ['telegramId']
        };
        
        this.db = new SupabaseDB();
        this.llmService = new LLMService();
    }

    /**
     * Generate proactive offers based on user interests and price data
     */
    async performExecution(args) {
        const { 
            telegramId, 
            userInterests, 
            priceData, 
            maxOffers = 5,
            includePersonalizedMessage = true 
        } = args;
        
        try {
            this.logger.info('Generating proactive offers', { 
                telegramId,
                hasInterests: !!userInterests,
                hasPriceData: !!priceData,
                maxOffers 
            });
            
            // Step 1: Get user interests if not provided
            const interests = userInterests || await this.getUserInterests(telegramId);
            
            // Step 2: Get price data if not provided
            const prices = priceData || await this.getRelevantPriceData(interests);
            
            // Step 3: Generate offers based on interests and prices
            const offers = await this.generateOffers(interests, prices, maxOffers);
            
            // Step 4: Generate personalized message if requested
            let personalizedMessage = null;
            if (includePersonalizedMessage && offers.length > 0) {
                personalizedMessage = await this.generatePersonalizedMessage(telegramId, interests, offers);
            }
            
            // Step 5: Save offers to database for tracking
            await this.saveGeneratedOffers(telegramId, offers);
            
            this.logger.info('Successfully generated proactive offers', { 
                telegramId,
                offersCount: offers.length,
                hasPersonalizedMessage: !!personalizedMessage 
            });
            
            return {
                offers,
                personalizedMessage,
                userInterests: interests,
                priceData: prices,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            this.logger.error('Failed to generate proactive offers', { 
                telegramId, 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Get user interests from cache or by calling the monitor tool
     */
    async getUserInterests(telegramId) {
        try {
            const cachedInterests = await this.db.getUserProfile(telegramId);
            if (cachedInterests && cachedInterests.cached_interests) {
                this.logger.info('Using cached user interests', { telegramId });
                return cachedInterests.cached_interests;
            }
            
            // If no cached interests, return default structure
            this.logger.info('No cached interests found, using defaults', { telegramId });
            return this.getDefaultInterests();
            
        } catch (error) {
            this.logger.error('Failed to get user interests', { 
                telegramId,
                error: error.message 
            });
            return this.getDefaultInterests();
        }
    }

    /**
     * Get relevant price data based on user interests
     */
    async getRelevantPriceData(interests) {
        try {
            // Get recent price drops from database
            const recentDrops = await this.db.getRecentPriceDrops();
            
            // Filter by user's preferred destinations if available
            if (interests.destinations && interests.destinations.length > 0) {
                return recentDrops.filter(drop => {
                    const routeParts = drop.route_key.split('-');
                    const destination = routeParts[1]; // destination is after the dash
                    return interests.destinations.some(pref => 
                        destination.toLowerCase().includes(pref.toLowerCase()) ||
                        pref.toLowerCase().includes(destination.toLowerCase())
                    );
                });
            }
            
            return recentDrops.slice(0, 10); // Limit to top 10
            
        } catch (error) {
            this.logger.error('Failed to get relevant price data', { 
                error: error.message 
            });
            return [];
        }
    }

    /**
     * Generate offers based on interests and price data
     */
    async generateOffers(interests, priceData, maxOffers) {
        const offers = [];
        
        try {
            // Get existing travel offers from database
            const existingOffers = await this.db.getTravelOffers();
            
            // Generate personalized offers using LLM
            const prompt = this.buildOfferGenerationPrompt(interests, priceData, existingOffers);
            
            const response = await this.llmService.generateResponse({
                prompt,
                maxTokens: 2000,
                temperature: 0.7
            });
            
            // Parse LLM response to extract offers
            const generatedOffers = this.parseLLMOffersResponse(response);
            
            // Enhance offers with price data and limit results
            for (const offer of generatedOffers.slice(0, maxOffers)) {
                const enhancedOffer = await this.enhanceOfferWithPriceData(offer, priceData);
                if (enhancedOffer) {
                    offers.push(enhancedOffer);
                }
            }
            
            return offers;
            
        } catch (error) {
            this.logger.error('Failed to generate offers', { 
                error: error.message 
            });
            return [];
        }
    }

    /**
     * Build prompt for LLM offer generation
     */
    buildOfferGenerationPrompt(interests, priceData, existingOffers) {
        return `
You are a travel expert creating personalized travel offers for a user based on their interests and current price trends.

User Interests:
${JSON.stringify(interests, null, 2)}

Current Price Drops Available:
${priceData.map(p => `${p.route_key}: $${p.price} (${p.percentage_change > 0 ? '+' : ''}${p.percentage_change.toFixed(1)}%)`).join('\n')}

Existing Travel Offers (for reference):
${existingOffers.slice(0, 3).map(o => `${o.title} - $${o.price} to ${o.destination}`).join('\n')}

Generate 3-5 personalized travel offers that:
1. Match the user's interests and preferences
2. Take advantage of current price drops when relevant
3. Are compelling and personalized
4. Include realistic pricing and details

Return your response as a JSON array with this structure:
[
  {
    "title": "Offer title",
    "destination": "Destination name",
    "description": "Detailed description",
    "price": 999,
    "originalPrice": 1299,
    "discountPercentage": 23,
    "duration": "7 days",
    "includes": ["item1", "item2"],
    "bestFor": ["budget_travel", "family", "adventure"],
    "urgency": "high|medium|low",
    "route": "origin-destination"
  }
]
`;
    }

    /**
     * Parse LLM response to extract offers
     */
    parseLLMOffersResponse(response) {
        try {
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const offers = JSON.parse(jsonMatch[0]);
                return Array.isArray(offers) ? offers : [];
            }
            return [];
        } catch (error) {
            this.logger.error('Failed to parse LLM offers response', { 
                error: error.message,
                response 
            });
            return [];
        }
    }

    /**
     * Enhance offer with price data and additional details
     */
    async enhanceOfferWithPriceData(offer, priceData) {
        try {
            // Find matching price data
            const matchingPrice = priceData.find(p => 
                p.route_key === offer.route || 
                p.route_key.includes(offer.destination.toLowerCase()) ||
                offer.destination.toLowerCase().includes(p.route_key.split('-')[1])
            );
            
            if (matchingPrice) {
                offer.currentPrice = matchingPrice.price;
                offer.priceDrop = matchingPrice.percentage_change;
                offer.isSignificantDrop = matchingPrice.percentage_change <= -20;
            }
            
            // Add unique ID and timestamp
            offer.id = `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            offer.generatedAt = new Date().toISOString();
            offer.validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
            
            return offer;
            
        } catch (error) {
            this.logger.error('Failed to enhance offer with price data', { 
                error: error.message 
            });
            return null;
        }
    }

    /**
     * Generate personalized message for the user
     */
    async generatePersonalizedMessage(telegramId, interests, offers) {
        try {
            const prompt = `
Create a personalized message for a user with these interests:
${JSON.stringify(interests, null, 2)}

And these available offers:
${offers.map(o => `${o.title} - $${o.price} to ${o.destination}`).join('\n')}

Write a friendly, personalized message that:
1. Acknowledges their interests
2. Highlights the best offers for them
3. Creates urgency without being pushy
4. Is concise and engaging
5. Uses Arabic language since this is for Arabic-speaking users

Keep it under 200 words and make it sound exciting!
`;

            const response = await this.llmService.generateResponse({
                prompt,
                maxTokens: 300,
                temperature: 0.8
            });

            return response.trim();
            
        } catch (error) {
            this.logger.error('Failed to generate personalized message', { 
                error: error.message 
            });
            return "لدينا عروض خاصة تناسب اهتماماتك! تحقق من هذه الفرص الرائعة للسفر.";
        }
    }

    /**
     * Save generated offers to database
     */
    async saveGeneratedOffers(telegramId, offers) {
        try {
            for (const offer of offers) {
                await this.db.saveGeneratedOffer(telegramId, offer);
            }
        } catch (error) {
            this.logger.error('Failed to save generated offers', { 
                error: error.message 
            });
        }
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
}

// Add database methods to SupabaseDB prototype
const SupabaseDBPrototype = SupabaseDB.prototype;

/**
 * Get recent price drops
 */
SupabaseDBPrototype.getRecentPriceDrops = async function(limit = 20) {
    if (!this.supabase) {
        // Return mock data for in-memory storage
        return [
            {
                route_key: 'CAI-IST',
                price: 280,
                percentage_change: -20,
                timestamp: new Date().toISOString()
            },
            {
                route_key: 'CAI-DXB',
                price: 220,
                percentage_change: -15,
                timestamp: new Date().toISOString()
            }
        ];
    }

    try {
        const { data, error } = await this.supabase
            .from('price_history')
            .select('*')
            .lte('percentage_change', -10) // Only drops of 10% or more
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting recent price drops:', error);
        return [];
    }
};

/**
 * Save generated offer
 */
SupabaseDBPrototype.saveGeneratedOffer = async function(telegramId, offer) {
    if (!this.supabase) {
        // For in-memory storage, just log the offer
        console.log('Generated offer saved (in-memory):', { telegramId, offer });
        return { telegramId, ...offer };
    }

    try {
        const { data, error } = await this.supabase
            .from('generated_offers')
            .insert([{
                telegram_id: telegramId,
                offer_id: offer.id,
                offer_data: offer,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving generated offer:', error);
        return null;
    }
};

// Create and export tool instance
const generateProactiveOffersTool = new GenerateProactiveOffersTool();
module.exports = generateProactiveOffersTool;