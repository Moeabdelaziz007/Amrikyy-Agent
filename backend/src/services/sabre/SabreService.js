/**
 * Sabre API Service
 * Complete travel booking system (flights, hotels, cars)
 * Part of Amrikyy Travel Agent
 */

const axios = require('axios');
const logger = require('../../utils/logger');
const redisService = require('../redis-service');

const SABRE_BASE_URL = process.env.SABRE_BASE_URL || 'https://api.havail.sabre.com';
const SABRE_REST_URL = process.env.SABRE_REST_URL || 'https://api.sabre.com';

class SabreService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.isProduction = process.env.NODE_ENV === 'production';

    // API Client
    this.api = axios.create({
      baseURL: this.isProduction ? SABRE_REST_URL : SABRE_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for automatic token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          logger.warn('Sabre token expired, refreshing...');
          await this.authenticate();
          // Retry the request
          error.config.headers.Authorization = `Bearer ${this.accessToken}`;
          return this.api.request(error.config);
        }
        throw error;
      }
    );

    logger.info('SabreService initialized');
  }

  /**
   * Authenticate with Sabre API (OAuth 2.0)
   */
  async authenticate() {
    try {
      const clientId = process.env.SABRE_CLIENT_ID;
      const clientSecret = process.env.SABRE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        logger.warn('Sabre credentials not configured');
        return null;
      }

      // Check cached token
      if (redisService.isConnected) {
        const cached = await redisService.get('sabre_access_token');
        if (cached) {
          this.accessToken = cached;
          logger.info('Using cached Sabre token');
          return this.accessToken;
        }
      }

      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const response = await axios.post(
        `${SABRE_REST_URL}/v2/auth/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

      // Cache token
      if (redisService.isConnected) {
        await redisService.set(
          'sabre_access_token',
          this.accessToken,
          response.data.expires_in - 60 // Expire 1 min early
        );
      }

      logger.info('Sabre authentication successful');
      return this.accessToken;
    } catch (error) {
      logger.error('Sabre authentication failed:', error.message);
      throw error;
    }
  }

  /**
   * Search for flights
   */
  async searchFlights(searchParams) {
    try {
      await this.ensureAuthenticated();

      const {
        origin,
        destination,
        departureDate,
        returnDate,
        adults = 1,
        children = 0,
        infants = 0,
        cabinClass = 'Y', // Y=Economy, C=Business, F=First
      } = searchParams;

      const cacheKey = `sabre_flights:${origin}:${destination}:${departureDate}:${returnDate}:${adults}`;
      
      // Check cache
      if (redisService.isConnected) {
        const cached = await redisService.get(cacheKey);
        if (cached) {
          logger.info('Flight search cache hit');
          return cached;
        }
      }

      // Build request
      const request = {
        OTA_AirLowFareSearchRQ: {
          Version: '5',
          POS: {
            Source: [
              {
                PseudoCityCode: process.env.SABRE_PCC || 'F9CE',
                RequestorID: {
                  Type: '1',
                  ID: '1',
                  CompanyName: {
                    Code: 'TN',
                  },
                },
              },
            ],
          },
          OriginDestinationInformation: [
            {
              RPH: '1',
              DepartureDateTime: `${departureDate}T00:00:00`,
              OriginLocation: { LocationCode: origin },
              DestinationLocation: { LocationCode: destination },
            },
          ],
          TravelPreferences: {
            CabinPref: [{ Cabin: cabinClass }],
          },
          TravelerInfoSummary: {
            AirTravelerAvail: [
              {
                PassengerTypeQuantity: [
                  { Code: 'ADT', Quantity: adults },
                  { Code: 'CNN', Quantity: children },
                  { Code: 'INF', Quantity: infants },
                ],
              },
            ],
          },
        },
      };

      // Add return flight if round trip
      if (returnDate) {
        request.OTA_AirLowFareSearchRQ.OriginDestinationInformation.push({
          RPH: '2',
          DepartureDateTime: `${returnDate}T00:00:00`,
          OriginLocation: { LocationCode: destination },
          DestinationLocation: { LocationCode: origin },
        });
      }

      const response = await this.api.post('/v5/offers/shop', request, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      const flights = this.parseFlightResults(response.data);

      // Cache results
      if (redisService.isConnected) {
        await redisService.set(cacheKey, flights, 1800); // 30 min cache
      }

      logger.info(`Found ${flights.length} flight options`);
      return flights;
    } catch (error) {
      logger.error('Flight search error:', error.message);
      throw error;
    }
  }

  /**
   * Parse flight search results
   */
  parseFlightResults(data) {
    try {
      const results = [];
      const priceItineraries =
        data?.OTA_AirLowFareSearchRS?.PricedItineraries?.PricedItinerary || [];

      priceItineraries.forEach((itinerary, index) => {
        const airItinerary = itinerary.AirItinerary;
        const pricing = itinerary.AirItineraryPricingInfo;

        results.push({
          id: `flight_${index}`,
          price: {
            total: parseFloat(pricing.ItinTotalFare.TotalFare.Amount),
            currency: pricing.ItinTotalFare.TotalFare.CurrencyCode,
            perPerson: parseFloat(pricing.ItinTotalFare.BaseFare.Amount),
          },
          segments: this.parseSegments(airItinerary.OriginDestinationOptions),
          validatingCarrier: pricing.ValidatingCarrier?.Code,
        });
      });

      return results;
    } catch (error) {
      logger.error('Error parsing flight results:', error.message);
      return [];
    }
  }

  /**
   * Parse flight segments
   */
  parseSegments(options) {
    const segments = [];
    
    options.OriginDestinationOption?.forEach((option) => {
      option.FlightSegment?.forEach((segment) => {
        segments.push({
          flightNumber: `${segment.MarketingAirline.Code}${segment.FlightNumber}`,
          airline: segment.MarketingAirline.Code,
          origin: segment.DepartureAirport.LocationCode,
          destination: segment.ArrivalAirport.LocationCode,
          departure: segment.DepartureDateTime,
          arrival: segment.ArrivalDateTime,
          duration: segment.ElapsedTime || 'N/A',
          aircraft: segment.Equipment?.[0]?.AirEquipType || 'N/A',
        });
      });
    });

    return segments;
  }

  /**
   * Search for hotels
   */
  async searchHotels(searchParams) {
    try {
      await this.ensureAuthenticated();

      const {
        location,
        checkIn,
        checkOut,
        adults = 1,
        rooms = 1,
        maxResults = 20,
      } = searchParams;

      const cacheKey = `sabre_hotels:${location}:${checkIn}:${checkOut}:${adults}:${rooms}`;
      
      // Check cache
      if (redisService.isConnected) {
        const cached = await redisService.get(cacheKey);
        if (cached) {
          logger.info('Hotel search cache hit');
          return cached;
        }
      }

      const request = {
        GetHotelAvailRQ: {
          SearchCriteria: {
            OffSet: 1,
            SortBy: 'TotalRate',
            SortOrder: 'ASC',
            PageSize: maxResults,
            TierLabels: false,
            GeoSearch: {
              GeoRef: {
                Radius: 50,
                UOM: 'MI',
                RefPoint: {
                  Value: location,
                  ValueContext: 'CODE',
                },
              },
            },
            RateInfoRef: {
              ConvertedRateInfoOnly: false,
              CurrencyCode: 'USD',
              BestOnly: '2',
              PrepaidQualifier: 'IncludePrepaid',
              StayDateTimeRange: {
                StartDate: checkIn,
                EndDate: checkOut,
              },
              Rooms: {
                Room: Array(rooms).fill({
                  Index: 1,
                  Adults: adults,
                }),
              },
            },
          },
        },
      };

      const response = await this.api.post('/v3.0.0/get/hotelavail', request, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      const hotels = this.parseHotelResults(response.data);

      // Cache results
      if (redisService.isConnected) {
        await redisService.set(cacheKey, hotels, 1800); // 30 min cache
      }

      logger.info(`Found ${hotels.length} hotel options`);
      return hotels;
    } catch (error) {
      logger.error('Hotel search error:', error.message);
      throw error;
    }
  }

  /**
   * Parse hotel search results
   */
  parseHotelResults(data) {
    try {
      const results = [];
      const hotels = data?.GetHotelAvailRS?.HotelAvailInfos?.HotelAvailInfo || [];

      hotels.forEach((hotel, index) => {
        results.push({
          id: `hotel_${index}`,
          name: hotel.HotelInfo?.HotelName || 'Unknown Hotel',
          address: hotel.HotelInfo?.Address?.AddressLine || 'N/A',
          city: hotel.HotelInfo?.Address?.CityName || 'N/A',
          rating: hotel.HotelInfo?.Rating || 0,
          price: {
            total: parseFloat(hotel.RateInfo?.AmountAfterTax || 0),
            currency: hotel.RateInfo?.CurrencyCode || 'USD',
            perNight: parseFloat(hotel.RateInfo?.AmountBeforeTax || 0),
          },
          amenities: hotel.HotelInfo?.Amenities || [],
          images: hotel.HotelInfo?.Media?.Image?.map((img) => img.URL) || [],
        });
      });

      return results;
    } catch (error) {
      logger.error('Error parsing hotel results:', error.message);
      return [];
    }
  }

  /**
   * Create a booking (PNR - Passenger Name Record)
   */
  async createBooking(bookingData) {
    try {
      await this.ensureAuthenticated();

      const {
        type, // 'flight' or 'hotel'
        travelerInfo,
        contact,
        payment,
        itinerary,
      } = bookingData;

      logger.info(`Creating ${type} booking...`);

      // Create PNR request
      const request = {
        CreatePassengerNameRecordRQ: {
          version: '2.3.0',
          haltOnAirPriceError: true,
          TravelItineraryAddInfo: {
            AgencyInfo: {
              Address: {
                AddressLine: process.env.COMPANY_ADDRESS || 'Amrikyy Travel',
                CityName: process.env.COMPANY_CITY || 'Cairo',
                CountryCode: process.env.COMPANY_COUNTRY || 'EG',
                PostalCode: process.env.COMPANY_POSTAL || '11511',
                StateCountyProv: { StateCode: process.env.COMPANY_STATE || 'C' },
              },
              Ticketing: {
                TicketType: '7TAW',
              },
            },
            CustomerInfo: {
              ContactNumbers: {
                ContactNumber: [
                  {
                    Phone: contact.phone,
                    PhoneUseType: 'H',
                  },
                ],
              },
              Email: [
                {
                  Address: contact.email,
                },
              ],
              PersonName: travelerInfo.map((traveler, index) => ({
                NameNumber: `${index + 1}.1`,
                GivenName: traveler.firstName,
                Surname: traveler.lastName,
              })),
            },
          },
        },
      };

      // Add flight or hotel specific data
      if (type === 'flight') {
        request.CreatePassengerNameRecordRQ.AirBook = this.buildAirBook(itinerary);
      } else if (type === 'hotel') {
        request.CreatePassengerNameRecordRQ.HotelBook = this.buildHotelBook(itinerary);
      }

      const response = await this.api.post('/v2.3.0/passenger/records', request, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      const pnr = this.parsePNR(response.data);

      logger.info(`Booking created successfully: PNR ${pnr.recordLocator}`);

      return {
        success: true,
        pnr: pnr.recordLocator,
        bookingReference: pnr.recordLocator,
        status: 'confirmed',
        details: pnr,
      };
    } catch (error) {
      logger.error('Booking creation error:', error.message);
      throw error;
    }
  }

  /**
   * Build air booking segment
   */
  buildAirBook(itinerary) {
    return {
      OriginDestinationInformation: {
        FlightSegment: itinerary.segments.map((segment, index) => ({
          DepartureDateTime: segment.departure,
          ArrivalDateTime: segment.arrival,
          FlightNumber: segment.flightNumber,
          NumberInParty: itinerary.passengers,
          ResBookDesigCode: segment.bookingClass || 'Y',
          Status: 'NN',
          DestinationLocation: { LocationCode: segment.destination },
          MarketingAirline: { Code: segment.airline },
          OriginLocation: { LocationCode: segment.origin },
        })),
      },
    };
  }

  /**
   * Build hotel booking segment
   */
  buildHotelBook(itinerary) {
    return {
      HotelProperty: {
        ChainCode: itinerary.chainCode || '',
        HotelCode: itinerary.hotelCode,
      },
      RoomStay: {
        CheckInDate: itinerary.checkIn,
        CheckOutDate: itinerary.checkOut,
        RoomTypeCode: itinerary.roomType || 'K1',
        RoomRate: {
          NumberOfUnits: itinerary.rooms || 1,
        },
      },
    };
  }

  /**
   * Parse PNR response
   */
  parsePNR(data) {
    try {
      const pnr = data?.CreatePassengerNameRecordRS;
      
      return {
        recordLocator: pnr?.ItineraryRef?.ID || 'UNKNOWN',
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        travelers: pnr?.TravelItineraryRead?.TravelItinerary?.CustomerInfo?.PersonName || [],
        itinerary: pnr?.TravelItineraryRead?.TravelItinerary || {},
      };
    } catch (error) {
      logger.error('Error parsing PNR:', error.message);
      return null;
    }
  }

  /**
   * Get booking details
   */
  async getBooking(pnr) {
    try {
      await this.ensureAuthenticated();

      const response = await this.api.get(`/v1/trip/orders/getBooking`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        params: {
          recordLocator: pnr,
        },
      });

      return response.data;
    } catch (error) {
      logger.error(`Error fetching booking ${pnr}:`, error.message);
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(pnr) {
    try {
      await this.ensureAuthenticated();

      const response = await this.api.post(
        `/v1/trip/orders/cancelBooking`,
        { recordLocator: pnr },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      logger.info(`Booking ${pnr} cancelled successfully`);
      return {
        success: true,
        message: 'Booking cancelled',
        pnr,
      };
    } catch (error) {
      logger.error(`Error cancelling booking ${pnr}:`, error.message);
      throw error;
    }
  }

  /**
   * Ensure we have a valid token
   */
  async ensureAuthenticated() {
    if (!this.accessToken || Date.now() >= this.tokenExpiry - 60000) {
      await this.authenticate();
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!process.env.SABRE_CLIENT_ID || !process.env.SABRE_CLIENT_SECRET) {
        return {
          status: 'warning',
          message: 'Sabre credentials not configured',
          configured: false,
        };
      }

      await this.authenticate();

      return {
        status: 'healthy',
        message: 'Sabre API is operational',
        configured: true,
        authenticated: !!this.accessToken,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Sabre API error: ${error.message}`,
        configured: true,
        authenticated: false,
      };
    }
  }
}

// Export singleton instance
const sabreService = new SabreService();
module.exports = sabreService;

