/**
 * Track Price Changes Tool
 * Monitors flight prices for specific destinations and detects significant price drops
 * 
 * @author Maya Travel Agent
 * @version 1.0.0
 */

const BaseTool = require('./BaseTool');
const SupabaseDB = require('../database/supabase');

class TrackPriceChangesTool extends BaseTool {
    constructor() {
        super();
        this.name = 'track_price_changes';
        this.description = 'Monitors flight prices for specific destinations and detects significant price drops';
        this.parameters = {
            type: 'object',
            properties: {
                destinations: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            origin: {
                                type: 'string',
                                description: 'Origin airport code (e.g., CAI)'
                            },
                            destination: {
                                type: 'string',
                                description: 'Destination airport code (e.g., IST)'
                            },
                            departureDate: {
                                type: 'string',
                                description: 'Departure date in YYYY-MM-DD format'
                            },
                            returnDate: {
                                type: 'string',
                                description: 'Return date in YYYY-MM-DD format (optional for one-way)'
                            }
                        },
                        required: ['origin', 'destination', 'departureDate']
                    },
                    description: 'Array of destination routes to monitor'
                },
                priceThreshold: {
                    type: 'number',
                    description: 'Percentage drop to trigger alert (default: 20)',
                    default: 20
                },
                checkFrequency: {
                    type: 'string',
                    description: 'How often to check prices (hourly, daily, weekly)',
                    default: 'daily',
                    enum: ['hourly', 'daily', 'weekly']
                },
                saveToDatabase: {
                    type: 'boolean',
                    description: 'Save price history to database (default: true)',
                    default: true
                }
            },
            required: ['destinations']
        };
        
        this.db = new SupabaseDB();
        this.priceHistory = new Map(); // In-memory cache for recent prices
    }

    /**
     * Track price changes for specified destinations
     */
    async performExecution(args) {
        const { 
            destinations, 
            priceThreshold = 20, 
            checkFrequency = 'daily',
            saveToDatabase = true 
        } = args;
        
        try {
            this.logger.info('Starting price tracking', { 
                destinationsCount: destinations.length,
                priceThreshold,
                checkFrequency 
            });
            
            const results = [];
            
            for (const route of destinations) {
                const routeResult = await this.trackSingleRoute(
                    route, 
                    priceThreshold, 
                    saveToDatabase
                );
                results.push(routeResult);
            }
            
            // Calculate summary statistics
            const summary = this.calculateSummary(results);
            
            this.logger.info('Price tracking completed', { 
                routesChecked: results.length,
                significantDrops: summary.significantDrops,
                averageChange: summary.averageChange
            });
            
            return {
                results,
                summary,
                timestamp: new Date().toISOString(),
                checkFrequency
            };
            
        } catch (error) {
            this.logger.error('Failed to track price changes', { 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Track price changes for a single route
     */
    async trackSingleRoute(route, priceThreshold, saveToDatabase) {
        const { origin, destination, departureDate, returnDate } = route;
        const routeKey = `${origin}-${destination}-${departureDate}-${returnDate || 'oneway'}`;
        
        try {
            // Get current price from flight API
            const currentPrice = await this.getCurrentPrice(route);
            
            if (!currentPrice) {
                return {
                    route: routeKey,
                    status: 'error',
                    message: 'Failed to fetch current price',
                    timestamp: new Date().toISOString()
                };
            }
            
            // Get previous price from cache or database
            const previousPrice = await this.getPreviousPrice(routeKey);
            
            // Calculate price change
            const priceChange = this.calculatePriceChange(previousPrice, currentPrice);
            
            // Determine if this is a significant drop
            const isSignificantDrop = priceChange.percentageChange <= -priceThreshold;
            
            // Save price history if requested
            if (saveToDatabase) {
                await this.savePriceHistory(routeKey, currentPrice, priceChange);
            }
            
            // Update cache
            this.priceHistory.set(routeKey, {
                price: currentPrice,
                timestamp: new Date().toISOString()
            });
            
            const result = {
                route: routeKey,
                origin,
                destination,
                departureDate,
                returnDate,
                currentPrice,
                previousPrice,
                priceChange,
                isSignificantDrop,
                status: 'success',
                timestamp: new Date().toISOString()
            };
            
            if (isSignificantDrop) {
                this.logger.info('Significant price drop detected', { 
                    route: routeKey,
                    dropPercentage: Math.abs(priceChange.percentageChange),
                    currentPrice,
                    previousPrice 
                });
            }
            
            return result;
            
        } catch (error) {
            this.logger.error('Failed to track route', { 
                route: routeKey,
                error: error.message 
            });
            
            return {
                route: routeKey,
                status: 'error',
                message: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get current price from flight API
     */
    async getCurrentPrice(route) {
        const { origin, destination, departureDate, returnDate } = route;
        
        try {
            // For now, we'll simulate API calls with mock data
            // In production, this would integrate with Kiwi API, Amadeus, or similar
            const mockPrice = this.generateMockPrice(route);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 100));
            
            return mockPrice;
            
        } catch (error) {
            this.logger.error('Failed to get current price', { 
                route: `${origin}-${destination}`,
                error: error.message 
            });
            return null;
        }
    }

    /**
     * Generate mock price for testing (replace with real API integration)
     */
    generateMockPrice(route) {
        const { origin, destination } = route;
        
        // Base prices for common routes (in USD)
        const basePrices = {
            'CAI-IST': 350,
            'CAI-DXB': 280,
            'CAI-JED': 220,
            'CAI-RUH': 250,
            'CAI-CDG': 450,
            'CAI-LHR': 480,
            'CAI-FRA': 420,
            'CAI-FCO': 380,
            'CAI-MAD': 460
        };
        
        const routeKey = `${origin}-${destination}`;
        let basePrice = basePrices[routeKey] || 400;
        
        // Add some randomness to simulate price fluctuations
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const price = Math.round(basePrice * randomFactor);
        
        return {
            amount: price,
            currency: 'USD',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get previous price from cache or database
     */
    async getPreviousPrice(routeKey) {
        // First check in-memory cache
        if (this.priceHistory.has(routeKey)) {
            return this.priceHistory.get(routeKey).price;
        }
        
        // If not in cache, try to get from database
        try {
            const previousRecord = await this.db.getLatestPriceRecord(routeKey);
            return previousRecord ? previousRecord.price : null;
        } catch (error) {
            this.logger.error('Failed to get previous price from database', { 
                routeKey,
                error: error.message 
            });
            return null;
        }
    }

    /**
     * Calculate price change between previous and current prices
     */
    calculatePriceChange(previousPrice, currentPrice) {
        if (!previousPrice) {
            return {
                absoluteChange: 0,
                percentageChange: 0,
                direction: 'new'
            };
        }
        
        const absoluteChange = currentPrice.amount - previousPrice.amount;
        const percentageChange = (absoluteChange / previousPrice.amount) * 100;
        
        return {
            absoluteChange,
            percentageChange,
            direction: percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'stable'
        };
    }

    /**
     * Save price history to database
     */
    async savePriceHistory(routeKey, currentPrice, priceChange) {
        try {
            const priceRecord = {
                route_key: routeKey,
                price: currentPrice.amount,
                currency: currentPrice.currency,
                absolute_change: priceChange.absoluteChange,
                percentage_change: priceChange.percentageChange,
                direction: priceChange.direction,
                timestamp: new Date().toISOString()
            };
            
            await this.db.savePriceRecord(priceRecord);
            
        } catch (error) {
            this.logger.error('Failed to save price history', { 
                routeKey,
                error: error.message 
            });
        }
    }

    /**
     * Calculate summary statistics for all tracked routes
     */
    calculateSummary(results) {
        const successfulResults = results.filter(r => r.status === 'success');
        const significantDrops = successfulResults.filter(r => r.isSignificantDrop);
        
        const totalChange = successfulResults.reduce((sum, r) => {
            return sum + (r.priceChange ? r.priceChange.percentageChange : 0);
        }, 0);
        
        const averageChange = successfulResults.length > 0 ? totalChange / successfulResults.length : 0;
        
        return {
            routesChecked: results.length,
            successfulChecks: successfulResults.length,
            significantDrops: significantDrops.length,
            averageChange: Math.round(averageChange * 100) / 100,
            dropRoutes: significantDrops.map(r => r.route)
        };
    }
}

// Add database methods to SupabaseDB prototype
const SupabaseDBPrototype = SupabaseDB.prototype;

/**
 * Get latest price record for a route
 */
SupabaseDBPrototype.getLatestPriceRecord = async function(routeKey) {
    if (!this.supabase) {
        // Return mock data for in-memory storage
        return null;
    }

    try {
        const { data, error } = await this.supabase
            .from('price_history')
            .select('*')
            .eq('route_key', routeKey)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error getting latest price record:', error);
        return null;
    }
};

/**
 * Save price record to database
 */
SupabaseDBPrototype.savePriceRecord = async function(priceRecord) {
    if (!this.supabase) {
        // For in-memory storage, just log the record
        console.log('Price record saved (in-memory):', priceRecord);
        return priceRecord;
    }

    try {
        const { data, error } = await this.supabase
            .from('price_history')
            .insert([priceRecord])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving price record:', error);
        return null;
    }
};

// Create and export tool instance
const trackPriceChangesTool = new TrackPriceChangesTool();
module.exports = trackPriceChangesTool;