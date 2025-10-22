/**
 * SabreService.js
 * 
 * Sabre GDS (Global Distribution System) Integration
 * Provides flight search, booking, hotel search, and car rental
 * 
 * Features:
 * - OAuth 2.0 authentication
 * - Flight search and booking
 * - Hotel search and booking
 * - Car rental search
 * - Fare rules and baggage info
 * - Seat maps
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @date October 22, 2025
 */

const axios = require('axios');
const secureVault = require('./SecureVaultService');

class SabreService {
  constructor() {
    this.baseURL = process.env.SABRE_API_URL || 'https://api.havail.sabre.com';
    this.restURL = 'https://api.sabre.com';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get Sabre credentials from secure vault
   */
  async getCredentials() {
    try {
      return await secureVault.getSabreCredentials();
    } catch (error) {
      // Fallback to environment variables
      return {
        clientId: process.env.SABRE_CLIENT_ID,
        clientSecret: process.env.SABRE_CLIENT_SECRET,
        pcc: process.env.SABRE_PCC
      };
    }
  }

  /**
   * Authenticate with Sabre API (OAuth 2.0)
   */
  async authenticate() {
    try {
      // Check if token is still valid
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const credentials = await this.getCredentials();
      
      if (!credentials.clientId || !credentials.clientSecret) {
        throw new Error('Sabre credentials not configured');
      }

      // Create base64 encoded credentials
      const auth = Buffer.from(
        `${credentials.clientId}:${credentials.clientSecret}`
      ).toString('base64');

      const response = await axios.post(
        `${this.restURL}/v2/auth/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      console.log('✅ Sabre authentication successful');
      return this.accessToken;
    } catch (error) {
      console.error('Sabre authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Sabre API');
    }
  }

  /**
   * Make authenticated API request
   */
  async makeRequest(endpoint, method = 'POST', data = null) {
    try {
      const token = await this.authenticate();

      const config = {
        method,
        url: `${this.restURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('Sabre API request failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Search for flights
   * 
   * @param {object} params - Search parameters
   * @returns {Promise<object>} Flight search results
   */
  async searchFlights(params) {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers = 1,
      cabinClass = 'Y' // Y=Economy, C=Business, F=First
    } = params;

    try {
      const requestData = {
        OTA_AirLowFareSearchRQ: {
          Version: '1',
          POS: {
            Source: [
              {
                PseudoCityCode: (await this.getCredentials()).pcc || 'F9CE',
                RequestorID: {
                  Type: '1',
                  ID: '1',
                  CompanyName: {
                    Code: 'TN'
                  }
                }
              }
            ]
          },
          OriginDestinationInformation: [
            {
              RPH: '1',
              DepartureDateTime: departureDate,
              OriginLocation: {
                LocationCode: origin
              },
              DestinationLocation: {
                LocationCode: destination
              }
            }
          ],
          TravelPreferences: {
            CabinPref: [
              {
                Cabin: cabinClass,
                PreferLevel: 'Preferred'
              }
            ]
          },
          TravelerInfoSummary: {
            AirTravelerAvail: [
              {
                PassengerTypeQuantity: [
                  {
                    Code: 'ADT',
                    Quantity: passengers
                  }
                ]
              }
            ]
          }
        }
      };

      // Add return flight if round trip
      if (returnDate) {
        requestData.OTA_AirLowFareSearchRQ.OriginDestinationInformation.push({
          RPH: '2',
          DepartureDateTime: returnDate,
          OriginLocation: {
            LocationCode: destination
          },
          DestinationLocation: {
            LocationCode: origin
          }
        });
      }

      const response = await this.makeRequest(
        '/v4/offers/shop',
        'POST',
        requestData
      );

      return this.parseFlightResults(response);
    } catch (error) {
      console.error('Flight search failed:', error);
      throw new Error('Failed to search flights');
    }
  }

  /**
   * Parse flight search results
   */
  parseFlightResults(response) {
    try {
      const itineraries = response.groupedItineraryResponse?.itineraryGroups || [];
      
      return itineraries.map(group => {
        const itinerary = group.itineraries?.[0];
        const pricing = group.groupDescription?.legDescriptions?.[0];

        return {
          id: itinerary?.id,
          price: {
            total: pricing?.totalFare?.totalPrice,
            currency: pricing?.totalFare?.currency,
            base: pricing?.totalFare?.equivalentAmount
          },
          legs: itinerary?.legs?.map(leg => ({
            departure: {
              airport: leg.ref,
              time: leg.schedules?.[0]?.departure?.time
            },
            arrival: {
              airport: leg.ref,
              time: leg.schedules?.[0]?.arrival?.time
            },
            duration: leg.elapsedTime,
            stops: leg.schedules?.length - 1,
            carrier: leg.schedules?.[0]?.carrier?.marketing,
            flightNumber: leg.schedules?.[0]?.carrier?.marketingFlightNumber
          }))
        };
      });
    } catch (error) {
      console.error('Failed to parse flight results:', error);
      return [];
    }
  }

  /**
   * Search for hotels
   */
  async searchHotels(params) {
    const {
      location,
      checkIn,
      checkOut,
      guests = 1,
      rooms = 1
    } = params;

    try {
      const requestData = {
        GetHotelAvailRQ: {
          SearchCriteria: {
            OffSet: 1,
            SortBy: 'TotalRate',
            SortOrder: 'ASC',
            PageSize: 20,
            TierLabels: false,
            GeoSearch: {
              GeoRef: {
                Radius: 50,
                UOM: 'MI',
                RefPoint: {
                  Value: location,
                  ValueContext: 'CODE',
                  RefPointType: '6'
                }
              }
            },
            RateInfoRef: {
              ConvertedRateInfoOnly: false,
              CurrencyCode: 'USD',
              BestOnly: '2',
              PrepaidQualifier: 'IncludePrepaid',
              StayDateTimeRange: {
                StartDate: checkIn,
                EndDate: checkOut
              },
              Rooms: {
                Room: Array(rooms).fill({
                  Index: 1,
                  Adults: Math.ceil(guests / rooms),
                  Children: 0
                })
              },
              InfoSource: '100,110,112,113'
            }
          }
        }
      };

      const response = await this.makeRequest(
        '/v2.4.0/shop/hotels',
        'POST',
        requestData
      );

      return this.parseHotelResults(response);
    } catch (error) {
      console.error('Hotel search failed:', error);
      throw new Error('Failed to search hotels');
    }
  }

  /**
   * Parse hotel search results
   */
  parseHotelResults(response) {
    try {
      const hotels = response.GetHotelAvailRS?.HotelAvailInfos?.HotelAvailInfo || [];

      return hotels.map(hotel => ({
        id: hotel.HotelInfo?.HotelCode,
        name: hotel.HotelInfo?.HotelName,
        address: {
          street: hotel.HotelInfo?.LocationInfo?.Address?.AddressLine,
          city: hotel.HotelInfo?.LocationInfo?.Address?.CityName?.value,
          country: hotel.HotelInfo?.LocationInfo?.Address?.CountryName?.value,
          postalCode: hotel.HotelInfo?.LocationInfo?.Address?.PostalCode
        },
        rating: hotel.HotelInfo?.Award?.[0]?.Rating,
        price: {
          total: hotel.HotelRateInfo?.RateInfos?.RateInfo?.[0]?.AmountAfterTax,
          currency: hotel.HotelRateInfo?.RateInfos?.RateInfo?.[0]?.CurrencyCode,
          perNight: hotel.HotelRateInfo?.RateInfos?.RateInfo?.[0]?.AmountBeforeTax
        },
        amenities: hotel.HotelInfo?.Amenities?.Amenity?.map(a => a.Description) || [],
        images: hotel.HotelInfo?.ImageItems?.ImageItem?.map(img => img.URL) || []
      }));
    } catch (error) {
      console.error('Failed to parse hotel results:', error);
      return [];
    }
  }

  /**
   * Get flight fare rules
   */
  async getFareRules(fareReference) {
    try {
      const response = await this.makeRequest(
        '/v1/shop/flights/farerules',
        'POST',
        { fareReference }
      );

      return response;
    } catch (error) {
      console.error('Failed to get fare rules:', error);
      throw new Error('Failed to get fare rules');
    }
  }

  /**
   * Get seat map
   */
  async getSeatMap(flightSegment) {
    try {
      const response = await this.makeRequest(
        '/v1/shop/flights/seatmaps',
        'POST',
        { flightSegment }
      );

      return response;
    } catch (error) {
      console.error('Failed to get seat map:', error);
      throw new Error('Failed to get seat map');
    }
  }

  /**
   * Create flight booking
   */
  async createBooking(bookingData) {
    try {
      const response = await this.makeRequest(
        '/v2.4.0/passenger/records',
        'POST',
        bookingData
      );

      return {
        pnr: response.CreatePassengerNameRecordRS?.ItineraryRef?.ID,
        status: 'confirmed',
        details: response
      };
    } catch (error) {
      console.error('Booking creation failed:', error);
      throw new Error('Failed to create booking');
    }
  }

  /**
   * Get booking details
   */
  async getBooking(pnr) {
    try {
      const response = await this.makeRequest(
        `/v1.0.0/passenger/records/${pnr}`,
        'GET'
      );

      return response;
    } catch (error) {
      console.error('Failed to get booking:', error);
      throw new Error('Failed to get booking details');
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(pnr) {
    try {
      const response = await this.makeRequest(
        `/v1.0.0/passenger/records/${pnr}`,
        'DELETE'
      );

      return {
        success: true,
        pnr,
        status: 'cancelled'
      };
    } catch (error) {
      console.error('Booking cancellation failed:', error);
      throw new Error('Failed to cancel booking');
    }
  }

  /**
   * Search for car rentals
   */
  async searchCars(params) {
    const {
      location,
      pickupDate,
      returnDate,
      pickupTime = '10:00',
      returnTime = '10:00'
    } = params;

    try {
      const requestData = {
        GetCarAvailRQ: {
          VehAvailRQCore: {
            VehRentalCore: {
              PickUpDateTime: `${pickupDate}T${pickupTime}:00`,
              ReturnDateTime: `${returnDate}T${returnTime}:00`,
              PickUpLocation: {
                LocationCode: location
              },
              ReturnLocation: {
                LocationCode: location
              }
            }
          }
        }
      };

      const response = await this.makeRequest(
        '/v2.3.0/shop/cars',
        'POST',
        requestData
      );

      return this.parseCarResults(response);
    } catch (error) {
      console.error('Car search failed:', error);
      throw new Error('Failed to search cars');
    }
  }

  /**
   * Parse car rental results
   */
  parseCarResults(response) {
    try {
      const cars = response.VehAvailRSCore?.VehVendorAvails || [];

      return cars.flatMap(vendor =>
        vendor.VehAvails?.map(car => ({
          id: car.VehAvailCore?.Reference?.ID,
          vendor: vendor.Vendor?.CompanyShortName,
          category: car.VehAvailCore?.Vehicle?.VehMakeModel?.Name,
          type: car.VehAvailCore?.Vehicle?.VehType?.VehicleCategory,
          price: {
            total: car.VehAvailCore?.TotalCharge?.RateTotalAmount,
            currency: car.VehAvailCore?.TotalCharge?.CurrencyCode,
            perDay: car.VehAvailCore?.RentalRate?.VehicleCharges?.VehicleCharge?.[0]?.Amount
          },
          capacity: {
            passengers: car.VehAvailCore?.Vehicle?.PassengerQuantity,
            bags: car.VehAvailCore?.Vehicle?.BaggageQuantity
          },
          transmission: car.VehAvailCore?.Vehicle?.TransmissionType,
          airConditioning: car.VehAvailCore?.Vehicle?.AirConditionInd
        })) || []
      );
    } catch (error) {
      console.error('Failed to parse car results:', error);
      return [];
    }
  }

  /**
   * Get service status
   */
  async getStatus() {
    try {
      await this.authenticate();
      return {
        status: 'operational',
        authenticated: !!this.accessToken,
        tokenExpiry: this.tokenExpiry
      };
    } catch (error) {
      return {
        status: 'error',
        authenticated: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
module.exports = new SabreService();

// Export class for testing
module.exports.SabreService = SabreService;
