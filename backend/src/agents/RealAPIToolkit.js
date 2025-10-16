/**
 * Real API Toolkit - Production-Grade API Integration
 * Implements the 5 core tools following consistent patterns:
 * 1. Tool Definition, 2. API Call & Auth, 3. Error Handling, 4. Data Parsing & Simplification
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class RealAPIToolkit {
  constructor() {
    this.toolkitId = 'real-api-toolkit';
    this.status = 'initializing';
    
    // API configurations from environment variables
    this.apiKeys = {
      googlePlaces: process.env.GOOGLE_PLACES_API_KEY || 'your_google_places_api_key',
      skyscanner: process.env.SKYSCANNER_API_KEY || 'your_skyscanner_api_key',
      booking: process.env.BOOKING_API_KEY || 'your_booking_api_key',
      googleCustomSearch: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || 'your_google_custom_search_api_key',
      openWeather: process.env.OPENWEATHER_API_KEY || 'your_openweather_api_key'
    };

    // API endpoints
    this.endpoints = {
      googlePlaces: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
      skyscanner: 'https://partners.api.skyscanner.net/apiservices/browsequotes/v1.0',
      booking: 'https://distribution-xml.booking.com/2.0/json',
      googleCustomSearch: 'https://www.googleapis.com/customsearch/v1',
      openWeather: 'https://api.openweathermap.org/data/2.5/forecast'
    };

    // Performance metrics
    this.metrics = {
      apiCallsMade: 0,
      successfulCalls: 0,
      failedCalls: 0,
      averageResponseTime: 0
    };

    this.initializeToolkit();
  }

  /**
   * Initialize the toolkit
   */
  async initializeToolkit() {
    console.log('🔧 Initializing Real API Toolkit...');
    
    // Validate API keys
    this.validateAPIKeys();
    
    this.status = 'ready';
    console.log('✅ Real API Toolkit initialized successfully');
  }

  /**
   * Validate API keys
   */
  validateAPIKeys() {
    const missingKeys = [];
    
    for (const [service, key] of Object.entries(this.apiKeys)) {
      if (key.includes('your_') || !key) {
        missingKeys.push(service);
      }
    }
    
    if (missingKeys.length > 0) {
      console.warn(`⚠️ Missing API keys for: ${missingKeys.join(', ')}`);
      console.warn('Using enhanced mock implementations for missing APIs');
    } else {
      console.log('✅ All API keys validated');
    }
  }

  /**
   * Tool 1: get_destination_info
   * Agent(s) Using It: Luna (primarily), Zara
   * Powered by Google Places API
   */
  async get_destination_info(query) {
    const startTime = Date.now();
    
    try {
      console.log(`🌍 Getting destination info for: ${query}`);
      
      // Check if we have a valid API key
      if (!this.apiKeys.googlePlaces.includes('your_')) {
        return await this.getDestinationInfoFromGooglePlaces(query);
      } else {
        return await this.getDestinationInfoMock(query);
      }
      
    } catch (error) {
      console.error(`ERROR: API call to Google Places failed: ${error.message}`);
      return {
        status: 'error',
        message: 'Failed to connect to Google Places API.',
        data: []
      };
    } finally {
      this.updateMetrics(Date.now() - startTime, true);
    }
  }

  /**
   * Get destination info from Google Places API (Real Implementation)
   */
  async getDestinationInfoFromGooglePlaces(query) {
    const params = {
      query: query,
      key: this.apiKeys.googlePlaces
    };

    try {
      const response = await axios.get(this.endpoints.googlePlaces, { params });
      response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS' && 
        response.raise_for_status(); // Raises an HTTPError for bad responses (4xx or 5xx)

      // --- Data Parsing & Simplification ---
      const rawResults = response.data.results || [];

      // Check if there are no results
      if (!rawResults || rawResults.length === 0) {
        return {
          status: 'success',
          data: [],
          message: 'No results found.'
        };
      }

      const simplifiedResults = [];
      for (const place of rawResults.slice(0, 5)) { // Limit to top 5
        simplifiedResults.push({
          name: place.name || 'Unknown',
          address: place.formatted_address || 'Address not available',
          rating: place.rating || null,
          type: place.types && place.types.length > 0 ? place.types[0] : 'unknown',
          priceLevel: place.price_level || null,
          openingHours: place.opening_hours ? place.opening_hours.open_now : null
        });
      }

      return {
        status: 'success',
        data: simplifiedResults,
        message: `Found ${simplifiedResults.length} results for "${query}"`
      };

    } catch (error) {
      console.error(`ERROR: Google Places API call failed: ${error.message}`);
      return {
        status: 'error',
        message: 'Failed to connect to Google Places API.',
        data: []
      };
    }
  }

  /**
   * Enhanced mock for destination info
   */
  async getDestinationInfoMock(query) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockData = {
      'museums in Tokyo': [
        { name: 'Tokyo National Museum', address: '13-9 Ueno Park, Taito City, Tokyo', rating: 4.3, type: 'museum', priceLevel: 3, openingHours: true },
        { name: 'Edo-Tokyo Museum', address: '1-4-1 Yokoami, Sumida City, Tokyo', rating: 4.2, type: 'museum', priceLevel: 2, openingHours: true },
        { name: 'Ghibli Museum', address: '1-1-83 Shimorenjaku, Mitaka City, Tokyo', rating: 4.6, type: 'museum', priceLevel: 3, openingHours: true }
      ],
      'restaurants in Paris': [
        { name: 'Le Comptoir du Relais', address: '9 Carrefour de l\'Odéon, Paris', rating: 4.7, type: 'restaurant', priceLevel: 3, openingHours: true },
        { name: 'L\'As du Fallafel', address: '34 Rue des Rosiers, Paris', rating: 4.3, type: 'restaurant', priceLevel: 2, openingHours: true },
        { name: 'Pierre Hermé', address: '72 Rue Bonaparte, Paris', rating: 4.5, type: 'bakery', priceLevel: 2, openingHours: true }
      ]
    };

    const results = mockData[query] || [
      { name: `${query} - Place 1`, address: 'Sample Address 1', rating: 4.2, type: 'point_of_interest', priceLevel: 2, openingHours: true },
      { name: `${query} - Place 2`, address: 'Sample Address 2', rating: 4.0, type: 'point_of_interest', priceLevel: 3, openingHours: true }
    ];

    return {
      status: 'success',
      data: results,
      message: `Found ${results.length} mock results for "${query}"`,
      source: 'mock_data'
    };
  }

  /**
   * Tool 2: search_flights
   * Agent(s) Using It: Karim
   * Powered by Skyscanner API
   */
  async search_flights(origin, destination, departureDate, returnDate = null, passengers = 1) {
    const startTime = Date.now();
    
    try {
      console.log(`✈️ Searching flights: ${origin} → ${destination}`);
      
      if (!this.apiKeys.skyscanner.includes('your_')) {
        return await this.searchFlightsFromSkyscanner(origin, destination, departureDate, returnDate, passengers);
      } else {
        return await this.searchFlightsMock(origin, destination, departureDate, returnDate, passengers);
      }
      
    } catch (error) {
      console.error(`ERROR: Skyscanner API call failed: ${error.message}`);
      return {
        status: 'error',
        message: 'Failed to connect to Skyscanner API.',
        data: []
      };
    } finally {
      this.updateMetrics(Date.now() - startTime, true);
    }
  }

  /**
   * Search flights from Skyscanner API (Real Implementation)
   */
  async searchFlightsFromSkyscanner(origin, destination, departureDate, returnDate, passengers) {
    const params = {
      country: 'US',
      currency: 'USD',
      locale: 'en-US',
      originPlace: origin,
      destinationPlace: destination,
      outboundDate: departureDate,
      inboundDate: returnDate,
      adults: passengers
    };

    try {
      // Note: This is a simplified version - real Skyscanner API requires more complex setup
      const response = await axios.get(this.endpoints.skyscanner, {
        params,
        headers: {
          'X-RapidAPI-Key': this.apiKeys.skyscanner,
          'X-RapidAPI-Host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com'
        }
      });

      // --- Data Parsing & Simplification ---
      const rawResults = response.data.Quotes || [];

      if (!rawResults || rawResults.length === 0) {
        return {
          status: 'success',
          data: [],
          message: 'No flights found for the specified criteria.'
        };
      }

      const simplifiedResults = [];
      for (const quote of rawResults.slice(0, 5)) { // Limit to top 5
        simplifiedResults.push({
          airline: quote.OutboundLeg?.CarrierNames?.[0] || 'Unknown Airline',
          price: quote.MinPrice || 0,
          duration: this.calculateDuration(quote.OutboundLeg),
          stops: quote.OutboundLeg?.StopsCount || 0,
          departureTime: quote.OutboundLeg?.DepartureDate,
          arrivalTime: quote.OutboundLeg?.ArrivalDate,
          bookingUrl: `https://skyscanner.com/flight/${origin}-${destination}`
        });
      }

      return {
        status: 'success',
        data: simplifiedResults,
        message: `Found ${simplifiedResults.length} flights from ${origin} to ${destination}`
      };

    } catch (error) {
      console.error(`ERROR: Skyscanner API call failed: ${error.message}`);
      return {
        status: 'error',
        message: 'Failed to connect to Skyscanner API.',
        data: []
      };
    }
  }

  /**
   * Enhanced mock for flight search
   */
  async searchFlightsMock(origin, destination, departureDate, returnDate, passengers) {
    await new Promise(resolve => setTimeout(resolve, 1200));

    const mockFlights = [
      {
        airline: 'American Airlines',
        price: Math.floor(Math.random() * 400) + 300,
        duration: '3h 15m',
        stops: 0,
        departureTime: departureDate + 'T08:30:00',
        arrivalTime: departureDate + 'T11:45:00',
        bookingUrl: `https://aa.com/flight/${origin}-${destination}`
      },
      {
        airline: 'Delta Air Lines',
        price: Math.floor(Math.random() * 450) + 350,
        duration: '3h 45m',
        stops: 1,
        departureTime: departureDate + 'T14:20:00',
        arrivalTime: departureDate + 'T18:05:00',
        bookingUrl: `https://delta.com/flight/${origin}-${destination}`
      },
      {
        airline: 'United Airlines',
        price: Math.floor(Math.random() * 380) + 320,
        duration: '3h 30m',
        stops: 0,
        departureTime: departureDate + 'T16:15:00',
        arrivalTime: departureDate + 'T19:45:00',
        bookingUrl: `https://united.com/flight/${origin}-${destination}`
      }
    ];

    return {
      status: 'success',
      data: mockFlights,
      message: `Found ${mockFlights.length} mock flights from ${origin} to ${destination}`,
      source: 'mock_data'
    };
  }

  /**
   * Tool 3: find_hotels
   * Agent(s) Using It: Karim, Zara
   * Powered by Booking.com API
   */
  async find_hotels(destination, checkIn, checkOut, guests = 1, rooms = 1) {
    const startTime = Date.now();
    
    try {
      console.log(`🏨 Finding hotels in: ${destination}`);
      
      if (!this.apiKeys.booking.includes('your_')) {
        return await this.findHotelsFromBooking(destination, checkIn, checkOut, guests, rooms);
      } else {
        return await this.findHotelsMock(destination, checkIn, checkOut, guests, rooms);
      }
      
    } catch (error) {
      console.error(`ERROR: Booking.com API call failed: ${error.message}`);
      return {
        status: 'error',
        message: 'Failed to connect to Booking.com API.',
        data: []
      };
    } finally {
      this.updateMetrics(Date.now() - startTime, true);
    }
  }

  /**
   * Find hotels from Booking.com API (Real Implementation)
   */
  async findHotelsFromBooking(destination, checkIn, checkOut, guests, rooms) {
    const params = {
      destination: destination,
      checkIn: checkIn,
      checkOut: checkOut,
      guests: guests,
      rooms: rooms,
      apiKey: this.apiKeys.booking
    };

    try {
      const response = await axios.get(this.endpoints.booking + '/hotels', {
        params,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TravelBot/1.0'
        }
      });

      // --- Data Parsing & Simplification ---
      const rawResults = response.data.result || [];

      if (!rawResults || rawResults.length === 0) {
        return {
          status: 'success',
          data: [],
          message: 'No hotels found for the specified criteria.'
        };
      }

      const simplifiedResults = [];
      for (const hotel of rawResults.slice(0, 5)) { // Limit to top 5
        simplifiedResults.push({
          name: hotel.name || 'Unknown Hotel',
          pricePerNight: hotel.price || 0,
          rating: hotel.rating || null,
          neighborhood: hotel.neighborhood || 'Unknown Area',
          amenities: hotel.amenities || [],
          bookingUrl: hotel.bookingUrl || `https://booking.com/hotel/${hotel.id}`
        });
      }

      return {
        status: 'success',
        data: simplifiedResults,
        message: `Found ${simplifiedResults.length} hotels in ${destination}`
      };

    } catch (error) {
      console.error(`ERROR: Booking.com API call failed: ${error.message}`);
      return {
        status: 'error',
        message: 'Failed to connect to Booking.com API.',
        data: []
      };
    }
  }

  /**
   * Enhanced mock for hotel search
   */
  async findHotelsMock(destination, checkIn, checkOut, guests, rooms) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockHotels = [
      {
        name: `${destination} Grand Hotel`,
        pricePerNight: Math.floor(Math.random() * 200) + 150,
        rating: 4.5,
        neighborhood: 'Downtown',
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
        bookingUrl: `https://booking.com/hotel/${destination.toLowerCase()}-grand`
      },
      {
        name: `${destination} Business Hotel`,
        pricePerNight: Math.floor(Math.random() * 150) + 100,
        rating: 4.2,
        neighborhood: 'Business District',
        amenities: ['WiFi', 'Business Center', 'Restaurant'],
        bookingUrl: `https://booking.com/hotel/${destination.toLowerCase()}-business`
      },
      {
        name: `${destination} Budget Inn`,
        pricePerNight: Math.floor(Math.random() * 80) + 60,
        rating: 3.8,
        neighborhood: 'City Center',
        amenities: ['WiFi', 'Restaurant'],
        bookingUrl: `https://booking.com/hotel/${destination.toLowerCase()}-budget`
      }
    ];

    return {
      status: 'success',
      data: mockHotels,
      message: `Found ${mockHotels.length} mock hotels in ${destination}`,
      source: 'mock_data'
    };
  }

  /**
   * Tool 4: web_search
   * Agent(s) Using It: Zara
   * Powered by Google Custom Search API
   */
  async web_search(query) {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Web searching: ${query}`);
      
      if (!this.apiKeys.googleCustomSearch.includes('your_')) {
        return await this.webSearchFromGoogle(query);
      } else {
        return await this.webSearchMock(query);
      }
      
    } catch (error) {
      console.error(`ERROR: Google Custom Search API call failed: ${error.message}`);
      return {
        status: 'error',
        message: 'Failed to connect to Google Custom Search API.',
        data: []
      };
    } finally {
      this.updateMetrics(Date.now() - startTime, true);
    }
  }

  /**
   * Web search from Google Custom Search API (Real Implementation)
   */
  async webSearchFromGoogle(query) {
    const params = {
      key: this.apiKeys.googleCustomSearch,
      cx: process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || 'your_search_engine_id',
      q: query,
      num: 3 // Limit to top 3 results
    };

    try {
      const response = await axios.get(this.endpoints.googleCustomSearch, { params });
      response.raise_for_status();

      // --- Data Parsing & Simplification ---
      const rawResults = response.data.items || [];

      if (!rawResults || rawResults.length === 0) {
        return {
          status: 'success',
          data: [],
          message: 'No search results found.'
        };
      }

      const simplifiedResults = [];
      for (const item of rawResults) {
        simplifiedResults.push({
          title: item.title || 'Untitled',
          link: item.link || '',
          snippet: item.snippet || 'No description available'
        });
      }

      return {
        status: 'success',
        data: simplifiedResults,
        message: `Found ${simplifiedResults.length} search results for "${query}"`
      };

    } catch (error) {
      console.error(`ERROR: Google Custom Search API call failed: ${error.message}`);
      return {
        status: 'error',
        message: 'Failed to connect to Google Custom Search API.',
        data: []
      };
    }
  }

  /**
   * Enhanced mock for web search
   */
  async webSearchMock(query) {
    await new Promise(resolve => setTimeout(resolve, 600));

    const mockResults = [
      {
        title: `${query} - Official Information`,
        link: `https://example.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
        snippet: `Comprehensive information about ${query} including details, facts, and current data.`
      },
      {
        title: `${query} - Wikipedia`,
        link: `https://en.wikipedia.org/wiki/${query.replace(/\s+/g, '_')}`,
        snippet: `Wikipedia article about ${query} with historical context and detailed information.`
      },
      {
        title: `${query} - Latest News and Updates`,
        link: `https://news.example.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
        snippet: `Recent news and updates about ${query} from reliable sources.`
      }
    ];

    return {
      status: 'success',
      data: mockResults,
      message: `Found ${mockResults.length} mock search results for "${query}"`,
      source: 'mock_data'
    };
  }

  /**
   * Tool 5: get_weather_forecast
   * Agent(s) Using It: Luna, Zara
   * Powered by OpenWeather API
   */
  async get_weather_forecast(destination, date = null) {
    const startTime = Date.now();
    
    try {
      console.log(`🌤️ Getting weather forecast for: ${destination}`);
      
      if (!this.apiKeys.openWeather.includes('your_')) {
        return await this.getWeatherFromOpenWeather(destination, date);
      } else {
        return await this.getWeatherMock(destination, date);
      }
      
    } catch (error) {
      console.error(`ERROR: OpenWeather API call failed: ${error.message}`);
      return {
        status: 'error',
        message: 'Failed to connect to OpenWeather API.',
        data: {}
      };
    } finally {
      this.updateMetrics(Date.now() - startTime, true);
    }
  }

  /**
   * Get weather from OpenWeather API (Real Implementation)
   */
  async getWeatherFromOpenWeather(destination, date) {
    const params = {
      q: destination,
      appid: this.apiKeys.openWeather,
      units: 'metric',
      cnt: 5 // 5-day forecast
    };

    try {
      const response = await axios.get(this.endpoints.openWeather, { params });
      response.raise_for_status();

      // --- Data Parsing & Simplification ---
      const rawData = response.data;

      if (!rawData || !rawData.list) {
        return {
          status: 'success',
          data: {},
          message: 'No weather data available.'
        };
      }

      // Get forecast for specific date or first available
      const forecast = date ? 
        rawData.list.find(item => item.dt_txt.includes(date)) || rawData.list[0] :
        rawData.list[0];

      const simplifiedForecast = {
        destination: destination,
        date: forecast.dt_txt || new Date().toISOString(),
        highTemp: Math.round(forecast.main.temp_max),
        lowTemp: Math.round(forecast.main.temp_min),
        condition: forecast.weather[0].description,
        precipitationChance: Math.round(forecast.pop * 100),
        humidity: forecast.main.humidity,
        windSpeed: forecast.wind.speed
      };

      return {
        status: 'success',
        data: simplifiedForecast,
        message: `Weather forecast for ${destination}`
      };

    } catch (error) {
      console.error(`ERROR: OpenWeather API call failed: ${error.message}`);
      return {
        status: 'error',
        message: 'Failed to connect to OpenWeather API.',
        data: {}
      };
    }
  }

  /**
   * Enhanced mock for weather forecast
   */
  async getWeatherMock(destination, date) {
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockForecast = {
      destination: destination,
      date: date || new Date().toISOString().split('T')[0],
      highTemp: Math.floor(Math.random() * 15) + 20,
      lowTemp: Math.floor(Math.random() * 10) + 10,
      condition: ['sunny', 'partly cloudy', 'cloudy', 'rainy'][Math.floor(Math.random() * 4)],
      precipitationChance: Math.floor(Math.random() * 50),
      humidity: Math.floor(Math.random() * 40) + 40,
      windSpeed: Math.floor(Math.random() * 10) + 5
    };

    return {
      status: 'success',
      data: mockForecast,
      message: `Mock weather forecast for ${destination}`,
      source: 'mock_data'
    };
  }

  // Utility methods
  calculateDuration(leg) {
    if (!leg) return 'Unknown';
    const departure = new Date(leg.DepartureDate);
    const arrival = new Date(leg.ArrivalDate);
    const diffMs = arrival - departure;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  }

  /**
   * Update performance metrics
   */
  updateMetrics(responseTime, success) {
    this.metrics.apiCallsMade++;
    
    if (success) {
      this.metrics.successfulCalls++;
    } else {
      this.metrics.failedCalls++;
    }
    
    const total = this.metrics.averageResponseTime * (this.metrics.apiCallsMade - 1) + responseTime;
    this.metrics.averageResponseTime = total / this.metrics.apiCallsMade;
  }

  /**
   * Get toolkit status
   */
  async getToolkitStatus() {
    return {
      toolkit_id: this.toolkitId,
      status: this.status,
      api_keys_configured: Object.values(this.apiKeys).filter(key => !key.includes('your_')).length,
      total_apis: Object.keys(this.apiKeys).length,
      metrics: this.metrics
    };
  }
}

module.exports = RealAPIToolkit;
