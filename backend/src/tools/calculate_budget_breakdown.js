/**
 * CalculateBudgetBreakdownTool - Tool for comprehensive travel budget calculation
 * Provides detailed budget breakdown for trips with cost optimization insights
 * 
 * @author Amrikyy AI Solutions
 * @version 1.0.0
 */

const BaseTool = require('./BaseTool');

class CalculateBudgetBreakdownTool extends BaseTool {
    constructor() {
        super();
        this.name = 'calculate_budget_breakdown';
        this.description = 'Calculates comprehensive travel budget breakdown including flights, hotels, food, activities, and provides cost optimization recommendations.';
        
        this.parameters = {
            type: 'object',
            properties: {
                destination: {
                    type: 'string',
                    description: 'Travel destination (e.g., Cairo, London, Tokyo)'
                },
                origin: {
                    type: 'string',
                    description: 'Departure location (e.g., Cairo, London, Tokyo)'
                },
                departure_date: {
                    type: 'string',
                    description: 'Departure date in YYYY-MM-DD format'
                },
                return_date: {
                    type: 'string',
                    description: 'Return date in YYYY-MM-DD format'
                },
                travelers: {
                    type: 'number',
                    description: 'Number of travelers',
                    minimum: 1,
                    maximum: 10,
                    default: 1
                },
                travel_class: {
                    type: 'string',
                    description: 'Flight class preference',
                    enum: ['economy', 'premium_economy', 'business', 'first'],
                    default: 'economy'
                },
                hotel_rating: {
                    type: 'number',
                    description: 'Preferred hotel star rating (1-5)',
                    minimum: 1,
                    maximum: 5,
                    default: 3
                },
                trip_duration_days: {
                    type: 'number',
                    description: 'Trip duration in days (calculated automatically if dates provided)',
                    minimum: 1,
                    maximum: 365
                },
                budget_currency: {
                    type: 'string',
                    description: 'Budget currency (USD, EUR, GBP, EGP, etc.)',
                    default: 'USD'
                },
                include_activities: {
                    type: 'boolean',
                    description: 'Include activity costs in budget',
                    default: true
                },
                meal_preferences: {
                    type: 'string',
                    description: 'Meal preference affecting food costs',
                    enum: ['budget', 'moderate', 'luxury'],
                    default: 'moderate'
                },
                shopping_budget: {
                    type: 'number',
                    description: 'Additional shopping/souvenir budget in specified currency',
                    minimum: 0
                }
            },
            required: ['destination', 'origin']
        };

        // Cost estimation data (can be enhanced with real-time data)
        this.costData = {
            // Daily costs per person in USD
            daily_costs: {
                'cairo': { budget: 30, moderate: 60, luxury: 120 },
                'london': { budget: 80, moderate: 150, luxury: 300 },
                'paris': { budget: 70, moderate: 140, luxury: 280 },
                'tokyo': { budget: 60, moderate: 120, luxury: 250 },
                'dubai': { budget: 50, moderate: 100, luxury: 200 },
                'new york': { budget: 90, moderate: 180, luxury: 350 },
                'istanbul': { budget: 40, moderate: 80, luxury: 160 }
            },
            // Flight cost multipliers
            flight_multipliers: {
                'economy': 1.0,
                'premium_economy': 1.8,
                'business': 3.5,
                'first': 6.0
            },
            // Hotel cost per night in USD
            hotel_costs: {
                1: { budget: 25, moderate: 40, luxury: 70 },
                2: { budget: 40, moderate: 70, luxury: 120 },
                3: { budget: 60, moderate: 100, luxury: 180 },
                4: { budget: 90, moderate: 150, luxury: 250 },
                5: { budget: 150, moderate: 250, luxury: 400 }
            }
        };
    }

    /**
     * Perform the actual budget calculation
     * @param {Object} args - Validated arguments
     * @returns {Promise<Object>} Budget breakdown
     */
    async performExecution(args) {
        const {
            destination,
            origin,
            departure_date,
            return_date,
            travelers = 1,
            travel_class = 'economy',
            hotel_rating = 3,
            trip_duration_days,
            budget_currency = 'USD',
            include_activities = true,
            meal_preferences = 'moderate',
            shopping_budget = 0
        } = args;

        this.logger.info('Calculating budget breakdown', {
            destination,
            origin,
            travelers,
            travel_class,
            hotel_rating,
            meal_preferences,
            budget_currency
        });

        try {
            // Calculate trip duration
            const duration = trip_duration_days || this.calculateDuration(departure_date, return_date);
            
            // Get destination cost data
            const destinationData = this.getDestinationCostData(destination.toLowerCase());
            
            // Calculate individual cost components
            const flightCost = this.calculateFlightCost(origin, destination, travelers, travel_class);
            const accommodationCost = this.calculateAccommodationCost(destination, hotel_rating, duration, travelers);
            const foodCost = this.calculateFoodCost(destination, duration, travelers, meal_preferences);
            const activitiesCost = include_activities ? this.calculateActivitiesCost(destination, duration, travelers) : 0;
            const localTransportCost = this.calculateLocalTransportCost(destination, duration, travelers);
            const miscellaneousCost = this.calculateMiscellaneousCost(destination, duration, travelers);
            
            // Calculate total and per person costs
            const subtotal = flightCost + accommodationCost + foodCost + activitiesCost + 
                           localTransportCost + miscellaneousCost + shopping_budget;
            const emergencyFund = subtotal * 0.15; // 15% emergency fund
            const totalCost = subtotal + emergencyFund;
            
            // Generate cost optimization tips
            const optimizationTips = this.generateOptimizationTips({
                destination,
                duration,
                travelers,
                costs: {
                    flight: flightCost,
                    accommodation: accommodationCost,
                    food: foodCost,
                    activities: activitiesCost,
                    transport: localTransportCost,
                    miscellaneous: miscellaneousCost,
                    shopping: shopping_budget
                }
            });

            // Currency conversion if needed
            const convertedCosts = await this.convertCurrency(totalCost, 'USD', budget_currency);

            return {
                trip_details: {
                    origin,
                    destination,
                    departure_date,
                    return_date,
                    duration_days: duration,
                    travelers,
                    travel_class,
                    hotel_rating,
                    meal_preferences
                },
                budget_breakdown: {
                    flights: {
                        cost_usd: flightCost,
                        cost_per_person: Math.round(flightCost / travelers),
                        details: `${travelers} × ${travel_class} class tickets`
                    },
                    accommodation: {
                        cost_usd: accommodationCost,
                        cost_per_person: Math.round(accommodationCost / travelers),
                        cost_per_night: Math.round(accommodationCost / duration),
                        details: `${duration} nights × ${hotel_rating}-star hotel`
                    },
                    food_and_dining: {
                        cost_usd: foodCost,
                        cost_per_person: Math.round(foodCost / travelers),
                        cost_per_day: Math.round(foodCost / duration),
                        details: `${meal_preferences} dining for ${duration} days`
                    },
                    activities: {
                        cost_usd: activitiesCost,
                        cost_per_person: Math.round(activitiesCost / travelers),
                        details: include_activities ? 'Tours, attractions, and experiences' : 'Not included'
                    },
                    local_transportation: {
                        cost_usd: localTransportCost,
                        cost_per_person: Math.round(localTransportCost / travelers),
                        details: 'Local transport within destination'
                    },
                    miscellaneous: {
                        cost_usd: miscellaneousCost,
                        cost_per_person: Math.round(miscellaneousCost / travelers),
                        details: 'Insurance, visa, tips, and other expenses'
                    },
                    shopping_souvenirs: {
                        cost_usd: shopping_budget,
                        cost_per_person: Math.round(shopping_budget / travelers),
                        details: 'Additional shopping budget'
                    },
                    emergency_fund: {
                        cost_usd: Math.round(emergencyFund),
                        percentage: 15,
                        details: 'Recommended emergency buffer (15% of subtotal)'
                    }
                },
                summary: {
                    subtotal_usd: Math.round(subtotal),
                    emergency_fund_usd: Math.round(emergencyFund),
                    total_cost_usd: Math.round(totalCost),
                    total_cost_per_person: Math.round(totalCost / travelers),
                    converted_costs: convertedCosts
                },
                cost_optimization: {
                    tips: optimizationTips,
                    potential_savings: this.calculatePotentialSavings({
                        destination,
                        duration,
                        travelers,
                        costs: {
                            flight: flightCost,
                            accommodation: accommodationCost,
                            food: foodCost
                        }
                    })
                },
                budget_recommendations: this.generateBudgetRecommendations({
                    total_cost: totalCost,
                    duration,
                    travelers,
                    destination_type: destinationData.type
                }),
                calculated_at: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error('Budget calculation failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Calculate trip duration from dates
     * @param {string} departureDate - Departure date
     * @param {string} returnDate - Return date
     * @returns {number} Duration in days
     */
    calculateDuration(departureDate, returnDate) {
        if (!departureDate || !returnDate) {
            return 7; // Default 7 days
        }
        
        const departure = new Date(departureDate);
        const returnD = new Date(returnDate);
        const diffTime = Math.abs(returnD - departure);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Get destination cost data
     * @param {string} destination - Destination name
     * @returns {Object} Destination cost data
     */
    getDestinationCostData(destination) {
        const destinations = {
            'cairo': { type: 'budget_friendly', region: 'africa', daily_cost_index: 0.4 },
            'london': { type: 'expensive', region: 'europe', daily_cost_index: 1.2 },
            'paris': { type: 'expensive', region: 'europe', daily_cost_index: 1.1 },
            'tokyo': { type: 'moderate', region: 'asia', daily_cost_index: 0.9 },
            'dubai': { type: 'moderate', region: 'middle_east', daily_cost_index: 0.8 },
            'new york': { type: 'expensive', region: 'north_america', daily_cost_index: 1.3 },
            'istanbul': { type: 'budget_friendly', region: 'europe', daily_cost_index: 0.5 }
        };
        
        return destinations[destination] || { 
            type: 'moderate', 
            region: 'unknown', 
            daily_cost_index: 0.7 
        };
    }

    /**
     * Calculate flight cost
     * @param {string} origin - Origin city
     * @param {string} destination - Destination city
     * @param {number} travelers - Number of travelers
     * @param {string} travelClass - Travel class
     * @returns {number} Flight cost in USD
     */
    calculateFlightCost(origin, destination, travelers, travelClass) {
        // Base flight cost estimation (round trip)
        const baseCosts = {
            'cairo-london': 600,
            'cairo-paris': 550,
            'cairo-tokyo': 800,
            'cairo-dubai': 300,
            'london-paris': 200,
            'london-new-york': 500,
            'tokyo-dubai': 700,
            'istanbul-london': 400
        };
        
        const route = `${origin.toLowerCase()}-${destination.toLowerCase()}`;
        const reverseRoute = `${destination.toLowerCase()}-${origin.toLowerCase()}`;
        const baseCost = baseCosts[route] || baseCosts[reverseRoute] || 500;
        
        const multiplier = this.costData.flight_multipliers[travelClass] || 1.0;
        return Math.round(baseCost * multiplier * travelers);
    }

    /**
     * Calculate accommodation cost
     * @param {string} destination - Destination
     * @param {number} hotelRating - Hotel star rating
     * @param {number} duration - Trip duration
     * @param {number} travelers - Number of travelers
     * @returns {number} Accommodation cost in USD
     */
    calculateAccommodationCost(destination, hotelRating, duration, travelers) {
        const destinationData = this.getDestinationCostData(destination.toLowerCase());
        const hotelCosts = this.costData.hotel_costs[hotelRating] || this.costData.hotel_costs[3];
        const baseCostPerNight = hotelCosts.moderate * destinationData.daily_cost_index;
        
        // Calculate rooms needed (2 people per room max)
        const roomsNeeded = Math.ceil(travelers / 2);
        return Math.round(baseCostPerNight * duration * roomsNeeded);
    }

    /**
     * Calculate food cost
     * @param {string} destination - Destination
     * @param {number} duration - Trip duration
     * @param {number} travelers - Number of travelers
     * @param {string} mealPreferences - Meal preference
     * @returns {number} Food cost in USD
     */
    calculateFoodCost(destination, duration, travelers, mealPreferences) {
        const destinationData = this.getDestinationCostData(destination.toLowerCase());
        const dailyCosts = this.costData.daily_costs[destination.toLowerCase()] || 
                          { budget: 50, moderate: 100, luxury: 200 };
        
        const dailyCost = dailyCosts[mealPreferences] || dailyCosts.moderate;
        return Math.round(dailyCost * duration * travelers * destinationData.daily_cost_index);
    }

    /**
     * Calculate activities cost
     * @param {string} destination - Destination
     * @param {number} duration - Trip duration
     * @param {number} travelers - Number of travelers
     * @returns {number} Activities cost in USD
     */
    calculateActivitiesCost(destination, duration, travelers) {
        const destinationData = this.getDestinationCostData(destination.toLowerCase());
        const baseDailyActivityCost = 50; // Base cost per person per day
        
        return Math.round(baseDailyActivityCost * duration * travelers * destinationData.daily_cost_index);
    }

    /**
     * Calculate local transport cost
     * @param {string} destination - Destination
     * @param {number} duration - Trip duration
     * @param {number} travelers - Number of travelers
     * @returns {number} Local transport cost in USD
     */
    calculateLocalTransportCost(destination, duration, travelers) {
        const destinationData = this.getDestinationCostData(destination.toLowerCase());
        const baseDailyTransportCost = 20; // Base cost per person per day
        
        return Math.round(baseDailyTransportCost * duration * travelers * destinationData.daily_cost_index);
    }

    /**
     * Calculate miscellaneous costs
     * @param {string} destination - Destination
     * @param {number} duration - Trip duration
     * @param {number} travelers - Number of travelers
     * @returns {number} Miscellaneous cost in USD
     */
    calculateMiscellaneousCost(destination, duration, travelers) {
        const destinationData = this.getDestinationCostData(destination.toLowerCase());
        const baseDailyMiscCost = 15; // Base cost per person per day
        
        return Math.round(baseDailyMiscCost * duration * travelers * destinationData.daily_cost_index);
    }

    /**
     * Generate cost optimization tips
     * @param {Object} params - Calculation parameters
     * @returns {Array} Array of optimization tips
     */
    generateOptimizationTips(params) {
        const { destination, duration, travelers, costs } = params;
        const tips = [];
        
        // Flight optimization
        if (costs.flight > costs.accommodation) {
            tips.push({
                category: 'flights',
                tip: 'Consider booking flights 6-8 weeks in advance for better prices',
                potential_saving: '10-20%',
                priority: 'high'
            });
        }
        
        // Accommodation optimization
        if (duration > 7) {
            tips.push({
                category: 'accommodation',
                tip: 'For stays longer than a week, consider vacation rentals for better value',
                potential_saving: '15-30%',
                priority: 'medium'
            });
        }
        
        // Food optimization
        tips.push({
            category: 'food',
            tip: 'Mix local street food with restaurant dining to experience authentic cuisine while saving money',
            potential_saving: '20-40%',
            priority: 'medium'
        });
        
        // Activity optimization
        tips.push({
            category: 'activities',
            tip: 'Look for city tourism cards that offer free public transport and museum entries',
            potential_saving: '15-25%',
            priority: 'low'
        });
        
        // Seasonal optimization
        tips.push({
            category: 'timing',
            tip: 'Travel during shoulder season (spring/autumn) for better prices and fewer crowds',
            potential_saving: '20-35%',
            priority: 'high'
        });
        
        return tips;
    }

    /**
     * Calculate potential savings
     * @param {Object} params - Calculation parameters
     * @returns {Object} Potential savings breakdown
     */
    calculatePotentialSavings(params) {
        const { destination, duration, travelers, costs } = params;
        
        return {
            flights: Math.round(costs.flight * 0.15), // 15% potential saving
            accommodation: Math.round(costs.accommodation * 0.20), // 20% potential saving
            food: Math.round(costs.food * 0.30), // 30% potential saving
            total_potential_saving: Math.round((costs.flight * 0.15) + (costs.accommodation * 0.20) + (costs.food * 0.30)),
            percentage_of_total: Math.round(((costs.flight * 0.15) + (costs.accommodation * 0.20) + (costs.food * 0.30)) / (costs.flight + costs.accommodation + costs.food) * 100)
        };
    }

    /**
     * Generate budget recommendations
     * @param {Object} params - Budget parameters
     * @returns {Object} Budget recommendations
     */
    generateBudgetRecommendations(params) {
        const { total_cost, duration, travelers, destination_type } = params;
        const dailyBudget = total_cost / duration / travelers;
        
        let budgetCategory;
        if (dailyBudget < 100) budgetCategory = 'budget';
        else if (dailyBudget < 200) budgetCategory = 'moderate';
        else budgetCategory = 'luxury';
        
        return {
            daily_budget_per_person: Math.round(dailyBudget),
            budget_category: budgetCategory,
            recommendations: [
                `Allocate ${Math.round(total_cost * 0.4)} (${40}%) for flights and accommodation`,
                `Allocate ${Math.round(total_cost * 0.3)} (${30}%) for food and dining`,
                `Allocate ${Math.round(total_cost * 0.2)} (${20}%) for activities and transport`,
                `Keep ${Math.round(total_cost * 0.1)} (${10}%) as flexible spending money`
            ],
            payment_tips: [
                'Use credit cards with no foreign transaction fees',
                'Notify your bank of travel plans',
                'Carry some local currency for small purchases',
                'Consider travel insurance for expensive trips'
            ]
        };
    }

    /**
     * Convert currency (simplified for now)
     * @param {number} amount - Amount in USD
     * @param {string} fromCurrency - Source currency
     * @param {string} toCurrency - Target currency
     * @returns {Promise<Object>} Converted amounts
     */
    async convertCurrency(amount, fromCurrency, toCurrency) {
        // Simplified exchange rates (in production, use real API)
        const exchangeRates = {
            'USD': 1.0,
            'EUR': 0.85,
            'GBP': 0.73,
            'EGP': 31.0,
            'JPY': 110.0,
            'AED': 3.67
        };
        
        const rate = exchangeRates[toCurrency] || 1.0;
        const convertedAmount = Math.round(amount * rate);
        
        return {
            amount: convertedAmount,
            currency: toCurrency,
            exchange_rate: rate,
            converted_at: new Date().toISOString()
        };
    }

    /**
     * Validate date format
     * @param {string} date - Date string
     * @returns {boolean} Is valid date
     */
    isValidDate(date) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(date)) return false;
        
        const d = new Date(date);
        return d instanceof Date && !isNaN(d);
    }

    /**
     * Override validation to add custom checks
     * @param {Object} args - Input arguments
     * @returns {Object} Validation result
     */
    validateParameters(args) {
        const baseValidation = super.validateParameters(args);
        if (!baseValidation.valid) {
            return baseValidation;
        }
        
        // Check date formats if provided
        if (args.departure_date && !this.isValidDate(args.departure_date)) {
            return {
                valid: false,
                error: 'departure_date must be in YYYY-MM-DD format'
            };
        }
        
        if (args.return_date && !this.isValidDate(args.return_date)) {
            return {
                valid: false,
                error: 'return_date must be in YYYY-MM-DD format'
            };
        }
        
        // Check if return date is after departure date
        if (args.return_date && args.departure_date) {
            const departure = new Date(args.departure_date);
            const returnDate = new Date(args.return_date);
            
            if (returnDate <= departure) {
                return {
                    valid: false,
                    error: 'return_date must be after departure_date'
                };
            }
        }
        
        // Check trip duration if provided
        if (args.trip_duration_days && (args.trip_duration_days < 1 || args.trip_duration_days > 365)) {
            return {
                valid: false,
                error: 'trip_duration_days must be between 1 and 365'
            };
        }
        
        return { valid: true };
    }
}

module.exports = new CalculateBudgetBreakdownTool();