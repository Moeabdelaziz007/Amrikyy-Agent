/**
 * MCP Server Template - Amadeus + Supabase Integration
 * يربط Amadeus API مع Supabase للمشروع
 * 
 * @author Maya Travel Agent Team
 * @version 1.0.0
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

// Amadeus API
const Amadeus = require('amadeus');

// Supabase
const { createClient } = require('@supabase/supabase-js');

class AmadeusSupabaseMCP {
    constructor() {
        this.server = new Server(
            {
                name: 'amadeus-supabase-mcp',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        // Initialize Amadeus client
        this.amadeus = new Amadeus({
            clientId: process.env.AMADEUS_API_KEY,
            clientSecret: process.env.AMADEUS_API_SECRET,
        });

        // Initialize Supabase client
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        this.setupHandlers();
    }

    setupHandlers() {
        // List tools handler
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'search_flights',
                        description: 'البحث عن رحلات طيران بين مدينتين',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                origin: {
                                    type: 'string',
                                    description: 'رمز المطار المبدئي (مثل: CAI)',
                                },
                                destination: {
                                    type: 'string',
                                    description: 'رمز المطار الهدف (مثل: DXB)',
                                },
                                departureDate: {
                                    type: 'string',
                                    description: 'تاريخ السفر (YYYY-MM-DD)',
                                },
                                adults: {
                                    type: 'number',
                                    description: 'عدد البالغين',
                                    default: 1,
                                },
                            },
                            required: ['origin', 'destination', 'departureDate'],
                        },
                    },
                    {
                        name: 'search_hotels',
                        description: 'البحث عن فنادق في مدينة معينة',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                cityCode: {
                                    type: 'string',
                                    description: 'رمز المدينة (مثل: DXB)',
                                },
                                checkInDate: {
                                    type: 'string',
                                    description: 'تاريخ الوصول (YYYY-MM-DD)',
                                },
                                checkOutDate: {
                                    type: 'string',
                                    description: 'تاريخ المغادرة (YYYY-MM-DD)',
                                },
                                adults: {
                                    type: 'number',
                                    description: 'عدد البالغين',
                                    default: 2,
                                },
                            },
                            required: ['cityCode', 'checkInDate', 'checkOutDate'],
                        },
                    },
                    {
                        name: 'save_search_to_db',
                        description: 'حفظ نتائج البحث في قاعدة البيانات',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                searchType: {
                                    type: 'string',
                                    enum: ['flight', 'hotel'],
                                    description: 'نوع البحث',
                                },
                                searchParams: {
                                    type: 'object',
                                    description: 'معاملات البحث',
                                },
                                results: {
                                    type: 'array',
                                    description: 'نتائج البحث',
                                },
                                userId: {
                                    type: 'string',
                                    description: 'معرف المستخدم',
                                },
                            },
                            required: ['searchType', 'searchParams', 'results'],
                        },
                    },
                    {
                        name: 'get_user_search_history',
                        description: 'جلب تاريخ البحث للمستخدم',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                userId: {
                                    type: 'string',
                                    description: 'معرف المستخدم',
                                },
                                limit: {
                                    type: 'number',
                                    description: 'عدد النتائج',
                                    default: 10,
                                },
                            },
                            required: ['userId'],
                        },
                    },
                    {
                        name: 'get_airport_info',
                        description: 'معلومات المطارات',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                keyword: {
                                    type: 'string',
                                    description: 'اسم أو رمز المطار',
                                },
                            },
                            required: ['keyword'],
                        },
                    },
                ],
            };
        });

        // Call tool handler
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'search_flights':
                        return await this.searchFlights(args);
                    case 'search_hotels':
                        return await this.searchHotels(args);
                    case 'save_search_to_db':
                        return await this.saveSearchToDB(args);
                    case 'get_user_search_history':
                        return await this.getUserSearchHistory(args);
                    case 'get_airport_info':
                        return await this.getAirportInfo(args);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `خطأ في تنفيذ الأداة ${name}: ${error.message}`,
                        },
                    ],
                };
            }
        });
    }

    async searchFlights(args) {
        const { origin, destination, departureDate, adults = 1 } = args;

        try {
            const response = await this.amadeus.shopping.flightOffersSearch.get({
                originLocationCode: origin,
                destinationLocationCode: destination,
                departureDate: departureDate,
                adults: adults,
            });

            const flights = response.data.slice(0, 5).map(flight => ({
                id: flight.id,
                price: flight.price.total,
                currency: flight.price.currency,
                departure: {
                    airport: flight.itineraries[0].segments[0].departure.iataCode,
                    time: flight.itineraries[0].segments[0].departure.at,
                },
                arrival: {
                    airport: flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode,
                    time: flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.at,
                },
                duration: flight.itineraries[0].duration,
                stops: flight.itineraries[0].segments.length - 1,
                airline: flight.itineraries[0].segments[0].carrierCode,
            }));

            return {
                content: [
                    {
                        type: 'text',
                        text: `تم العثور على ${flights.length} رحلة طيران:\n\n${flights.map(f => 
                            `✈️ ${f.departure.airport} → ${f.arrival.airport}\n` +
                            `💰 ${f.price} ${f.currency}\n` +
                            `🕐 ${f.departure.time} - ${f.arrival.time}\n` +
                            `⏱️ ${f.duration}\n` +
                            `🛑 ${f.stops} توقف\n` +
                            `---\n`
                        ).join('')}`,
                    },
                ],
            };
        } catch (error) {
            throw new Error(`خطأ في البحث عن رحلات الطيران: ${error.message}`);
        }
    }

    async searchHotels(args) {
        const { cityCode, checkInDate, checkOutDate, adults = 2 } = args;

        try {
            const response = await this.amadeus.shopping.hotelOffers.get({
                cityCode: cityCode,
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                adults: adults,
            });

            const hotels = response.data.slice(0, 5).map(hotel => ({
                id: hotel.hotel.hotelId,
                name: hotel.hotel.name,
                price: hotel.offers[0].price.total,
                currency: hotel.offers[0].price.currency,
                rating: hotel.hotel.rating,
                address: hotel.hotel.address.lines[0],
                amenities: hotel.hotel.amenities || [],
            }));

            return {
                content: [
                    {
                        type: 'text',
                        text: `تم العثور على ${hotels.length} فندق:\n\n${hotels.map(h => 
                            `🏨 ${h.name}\n` +
                            `💰 ${h.price} ${h.currency}\n` +
                            `⭐ ${h.rating}/5\n` +
                            `📍 ${h.address}\n` +
                            `---\n`
                        ).join('')}`,
                    },
                ],
            };
        } catch (error) {
            throw new Error(`خطأ في البحث عن الفنادق: ${error.message}`);
        }
    }

    async saveSearchToDB(args) {
        const { searchType, searchParams, results, userId } = args;

        try {
            const { data, error } = await this.supabase
                .from('travel_searches')
                .insert([
                    {
                        user_id: userId || 'anonymous',
                        search_type: searchType,
                        search_params: searchParams,
                        results: results,
                        created_at: new Date().toISOString(),
                    },
                ]);

            if (error) {
                throw new Error(`خطأ في حفظ البحث: ${error.message}`);
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: `تم حفظ البحث بنجاح في قاعدة البيانات`,
                    },
                ],
            };
        } catch (error) {
            throw new Error(`خطأ في حفظ البحث: ${error.message}`);
        }
    }

    async getUserSearchHistory(args) {
        const { userId, limit = 10 } = args;

        try {
            const { data, error } = await this.supabase
                .from('travel_searches')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                throw new Error(`خطأ في جلب تاريخ البحث: ${error.message}`);
            }

            if (!data || data.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'لا يوجد تاريخ بحث للمستخدم',
                        },
                    ],
                };
            }

            const history = data.map(search => 
                `🔍 ${search.search_type} - ${new Date(search.created_at).toLocaleDateString('ar-SA')}\n` +
                `📊 ${search.results.length} نتيجة\n` +
                `---\n`
            ).join('');

            return {
                content: [
                    {
                        type: 'text',
                        text: `تاريخ البحث للمستخدم:\n\n${history}`,
                    },
                ],
            };
        } catch (error) {
            throw new Error(`خطأ في جلب تاريخ البحث: ${error.message}`);
        }
    }

    async getAirportInfo(args) {
        const { keyword } = args;

        try {
            const response = await this.amadeus.referenceData.locations.get({
                keyword: keyword,
                subType: 'AIRPORT',
            });

            const airports = response.data.slice(0, 5).map(airport => ({
                code: airport.iataCode,
                name: airport.name,
                city: airport.address.cityName,
                country: airport.address.countryName,
            }));

            return {
                content: [
                    {
                        type: 'text',
                        text: `معلومات المطارات:\n\n${airports.map(a => 
                            `✈️ ${a.code} - ${a.name}\n` +
                            `🏙️ ${a.city}, ${a.country}\n` +
                            `---\n`
                        ).join('')}`,
                    },
                ],
            };
        } catch (error) {
            throw new Error(`خطأ في جلب معلومات المطارات: ${error.message}`);
        }
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.log('🚀 Amadeus + Supabase MCP Server started');
    }
}

// تشغيل الخادم
if (require.main === module) {
    const server = new AmadeusSupabaseMCP();
    server.run().catch(console.error);
}

module.exports = AmadeusSupabaseMCP;
