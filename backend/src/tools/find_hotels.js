/**
 * FindHotelsTool - Tool for searching hotel accommodations
 * Integrates with Booking.com API for real-time hotel data
 * 
 * @author Amrikyy AI Solutions
 * @version 1.0.0
 */

const BaseTool = require('./BaseTool');
const fetch = require('node-fetch');

class FindHotelsTool extends BaseTool {
    constructor() {
        super();
        this.name = 'find_hotels';
        this.description = 'Searches for hotel accommodations in a destination. Use this to find hotels, prices, availability, and amenities.';
        
        this.parameters = {
            type: 'object',
            properties: {
                destination: {
                    type: 'string',
                    description: 'The destination city or location (e.g., Cairo, London, Paris)'
                },
                check_in: {
                    type: 'string',
                    description: 'Check-in date in YYYY-MM-DD format'
                },
                check_out: {
                    type: 'string',
                    description: 'Check-out date in YYYY-MM-DD format'
                },
                guests: {
                    type: 'number',
                    description: 'Number of guests (default: 2)',
                    minimum: 1,
                    maximum: 10
                },
                rooms: {
                    type: 'number',
                    description: 'Number of rooms (default: 1)',
                    minimum: 1,
                    maximum: 5
                },
                price_min: {
                    type: 'number',
                    description: 'Minimum price per night in USD'
                },
                price_max: {
                    type: 'number',
                    description: 'Maximum price per night in USD'
                },
                star_rating: {
                    type: 'number',
                    description: 'Minimum star rating (1-5)',
                    minimum: 1,
                    maximum: 5
                },
                amenities: {
                    type: 'array',
                    description: 'Required amenities (wifi, pool, gym, spa, restaurant, parking)',
                    items: {
                        type: 'string',
                        enum: ['wifi', 'pool', 'gym', 'spa', 'restaurant', 'parking', 'air_conditioning', 'pet_friendly']
                    }
                },
                hotel_type: {
                    type: 'string',
                    description: 'Type of accommodation',
                    enum: ['hotel', 'resort', 'apartment', 'hostel', 'villa', 'any']
                }
            },
            required: ['destination', 'check_in', 'check_out']
        };

        // API configuration
        this.apiKey = process.env.BOOKING_API_KEY;
        this.apiUrl = 'https://booking-com.p.rapidapi.com/v1/hotels';
    }

    /**
     * Perform the actual hotel search
     * @param {Object} args - Validated arguments
     * @returns {Promise<Object>} Hotel search results
     */
    async performExecution(args) {
        const {
            destination,
            check_in,
            check_out,
            guests = 2,
            rooms = 1,
            price_min,
            price_max,
            star_rating,
            amenities = [],
            hotel_type = 'any'
        } = args;

        this.logger.info('Searching for hotels', {
            destination,
            check_in,
            check_out,
            guests,
            rooms,
            price_range: { min: price_min, max: price_max },
            star_rating,
            amenities,
            hotel_type
        });

        try {
            // For now, return simulated data since we need API keys
            // In production, this would call the actual Booking.com API
            const results = await this.simulateHotelSearch({
                destination,
                check_in,
                check_out,
                guests,
                rooms,
                price_min,
                price_max,
                star_rating,
                amenities,
                hotel_type
            });

            return {
                search_params: {
                    destination,
                    check_in,
                    check_out,
                    guests,
                    rooms,
                    price_range: { min: price_min, max: price_max },
                    star_rating,
                    amenities,
                    hotel_type
                },
                hotels: results,
                total_results: results.length,
                search_timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error('Hotel search failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Simulate hotel search with realistic data
     * @param {Object} params - Search parameters
     * @returns {Promise<Array>} Simulated hotel results
     */
    async simulateHotelSearch(params) {
        const { 
            destination, 
            check_in, 
            check_out, 
            guests, 
            rooms, 
            price_min, 
            price_max, 
            star_rating, 
            amenities, 
            hotel_type 
        } = params;
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));
        
        const hotelNames = [
            'Grand Plaza Hotel', 'Sunset Resort', 'City Center Inn', 'Royal Palace Hotel',
            'Garden View Lodge', 'Ocean Breeze Resort', 'Metropolitan Suites', 'Heritage Hotel',
            'Modern Business Hotel', 'Luxury Spa Resort', 'Budget Friendly Inn', 'Boutique Hotel'
        ];
        
        const hotelChains = [
            'Marriott', 'Hilton', 'Hyatt', 'InterContinental', 'Radisson', 'Holiday Inn',
            'Best Western', 'Novotel', 'Mercure', 'Ibis', 'Local Chain', 'Independent'
        ];
        
        const results = [];
        const numResults = Math.floor(Math.random() * 12) + 5; // 5-16 results
        
        for (let i = 0; i < numResults; i++) {
            const hotelName = hotelNames[Math.floor(Math.random() * hotelNames.length)];
            const chain = hotelChains[Math.floor(Math.random() * hotelChains.length)];
            const stars = Math.floor(Math.random() * 5) + 1; // 1-5 stars
            
            // Apply star rating filter
            if (star_rating && stars < star_rating) {
                continue;
            }
            
            const basePrice = Math.floor(Math.random() * 200) + 50; // $50-$250
            const pricePerNight = Math.round(basePrice * (1 + (stars - 1) * 0.3)); // Higher stars = higher price
            
            // Apply price filters
            if (price_min && pricePerNight < price_min) continue;
            if (price_max && pricePerNight > price_max) continue;
            
            const totalNights = this.calculateNights(check_in, check_out);
            const totalPrice = pricePerNight * totalNights * rooms;
            
            const availableAmenities = this.generateAmenities(stars);
            const rating = (Math.random() * 2 + 3).toFixed(1); // 3.0-5.0 rating
            
            results.push({
                id: `hotel_${i + 1}`,
                name: `${hotelName} ${chain}`,
                chain: chain,
                star_rating: stars,
                address: `${Math.floor(Math.random() * 999) + 1} ${destination} Street, ${destination}`,
                location: {
                    city: destination,
                    coordinates: {
                        lat: (Math.random() - 0.5) * 0.1 + 30.0444, // Around destination
                        lng: (Math.random() - 0.5) * 0.1 + 31.2357
                    }
                },
                price: {
                    per_night: pricePerNight,
                    total: totalPrice,
                    currency: 'USD',
                    formatted_per_night: `$${pricePerNight}`,
                    formatted_total: `$${totalPrice}`
                },
                availability: {
                    check_in,
                    check_out,
                    nights: totalNights,
                    rooms_available: Math.floor(Math.random() * 5) + 1,
                    guests_per_room: Math.floor(guests / rooms)
                },
                amenities: availableAmenities,
                rating: {
                    score: parseFloat(rating),
                    reviews_count: Math.floor(Math.random() * 1000) + 50,
                    source: 'Booking.com'
                },
                images: [
                    `https://example.com/hotels/${i + 1}/main.jpg`,
                    `https://example.com/hotels/${i + 1}/room.jpg`,
                    `https://example.com/hotels/${i + 1}/pool.jpg`
                ],
                booking_url: `https://booking.com/hotel/${i + 1}`,
                cancellation_policy: 'Free cancellation until 24 hours before check-in',
                special_offers: Math.random() > 0.7 ? ['Breakfast included', 'Free WiFi'] : []
            });
        }
        
        // Sort by price
        results.sort((a, b) => a.price.per_night - b.price.per_night);
        
        return results;
    }

    /**
     * Calculate number of nights between check-in and check-out
     * @param {string} checkIn - Check-in date
     * @param {string} checkOut - Check-out date
     * @returns {number} Number of nights
     */
    calculateNights(checkIn, checkOut) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const diffTime = Math.abs(checkOutDate - checkInDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Generate amenities based on hotel star rating
     * @param {number} stars - Hotel star rating
     * @returns {Array} Array of amenities
     */
    generateAmenities(stars) {
        const allAmenities = [
            'wifi', 'air_conditioning', 'parking', 'restaurant', 'bar', 'room_service',
            'pool', 'gym', 'spa', 'business_center', 'concierge', 'laundry',
            'pet_friendly', 'airport_shuttle', 'beach_access', 'mountain_view'
        ];
        
        const amenities = ['wifi']; // Always include WiFi
        
        // Add amenities based on star rating
        if (stars >= 2) amenities.push('air_conditioning', 'parking');
        if (stars >= 3) amenities.push('restaurant', 'bar', 'room_service');
        if (stars >= 4) amenities.push('pool', 'gym', 'business_center', 'concierge');
        if (stars >= 5) amenities.push('spa', 'laundry', 'airport_shuttle');
        
        // Add some random amenities
        const remainingAmenities = allAmenities.filter(a => !amenities.includes(a));
        const randomCount = Math.floor(Math.random() * 3);
        for (let i = 0; i < randomCount; i++) {
            const randomAmenity = remainingAmenities[Math.floor(Math.random() * remainingAmenities.length)];
            if (randomAmenity && !amenities.includes(randomAmenity)) {
                amenities.push(randomAmenity);
            }
        }
        
        return amenities;
    }

    /**
     * Validate date format and logic
     * @param {Object} args - Input arguments
     * @returns {Object} Validation result
     */
    validateParameters(args) {
        const baseValidation = super.validateParameters(args);
        if (!baseValidation.valid) {
            return baseValidation;
        }
        
        // Check date format
        if (args.check_in && !this.isValidDate(args.check_in)) {
            return {
                valid: false,
                error: 'check_in must be in YYYY-MM-DD format'
            };
        }
        
        if (args.check_out && !this.isValidDate(args.check_out)) {
            return {
                valid: false,
                error: 'check_out must be in YYYY-MM-DD format'
            };
        }
        
        // Check if check-out is after check-in
        if (args.check_out && args.check_in) {
            const checkIn = new Date(args.check_in);
            const checkOut = new Date(args.check_out);
            
            if (checkOut <= checkIn) {
                return {
                    valid: false,
                    error: 'check_out must be after check_in'
                };
            }
        }
        
        // Check price range logic
        if (args.price_min && args.price_max && args.price_min > args.price_max) {
            return {
                valid: false,
                error: 'price_min cannot be greater than price_max'
            };
        }
        
        return { valid: true };
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
}

module.exports = new FindHotelsTool();
