/**
 * Test Data Generator
 * Creates proper test datasets with valid date formats and realistic data
 * Fixes date format validation issues in travel tools
 */

const winston = require('winston');

class TestDataGenerator {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'backend/logs/test-data-generator.log' }),
        new winston.transports.Console()
      ]
    });
  }

  /**
   * Generate valid date formats for different APIs
   */
  generateValidDates() {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    const returnDate = new Date(futureDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days after departure

    return {
      // ISO 8601 format (YYYY-MM-DD) - Most APIs prefer this
      iso8601: {
        departure: futureDate.toISOString().split('T')[0],
        return: returnDate.toISOString().split('T')[0],
        checkin: futureDate.toISOString().split('T')[0],
        checkout: returnDate.toISOString().split('T')[0]
      },
      
      // Amadeus API format
      amadeus: {
        departure: futureDate.toISOString().split('T')[0],
        return: returnDate.toISOString().split('T')[0]
      },
      
      // Booking.com format
      booking: {
        checkin: futureDate.toISOString().split('T')[0],
        checkout: returnDate.toISOString().split('T')[0]
      },
      
      // Human readable format
      readable: {
        departure: futureDate.toLocaleDateString('en-US'),
        return: returnDate.toLocaleDateString('en-US')
      }
    };
  }

  /**
   * Generate flight search test data
   */
  generateFlightTestData() {
    const dates = this.generateValidDates();
    
    return {
      // Valid flight search parameters
      valid: {
        origin: 'CAI',
        destination: 'DXB',
        departureDate: dates.iso8601.departure,
        returnDate: dates.iso8601.return,
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: 'ECONOMY',
        currency: 'USD'
      },
      
      // Alternative valid data
      alternative: {
        origin: 'LHR',
        destination: 'CDG',
        departureDate: dates.iso8601.departure,
        adults: 2,
        children: 1,
        cabinClass: 'BUSINESS'
      },
      
      // Edge cases
      edgeCases: {
        sameDay: {
          origin: 'NYC',
          destination: 'LAX',
          departureDate: dates.iso8601.departure,
          adults: 1
        },
        international: {
          origin: 'JFK',
          destination: 'NRT',
          departureDate: dates.iso8601.departure,
          returnDate: dates.iso8601.return,
          adults: 2
        }
      }
    };
  }

  /**
   * Generate hotel search test data
   */
  generateHotelTestData() {
    const dates = this.generateValidDates();
    
    return {
      // Valid hotel search parameters
      valid: {
        destination: 'Dubai',
        checkin: dates.iso8601.checkin,
        checkout: dates.iso8601.checkout,
        adults: 2,
        rooms: 1,
        currency: 'USD'
      },
      
      // Alternative valid data
      alternative: {
        destination: 'Paris',
        checkin: dates.iso8601.checkin,
        checkout: dates.iso8601.checkout,
        adults: 4,
        rooms: 2,
        children: 2
      },
      
      // Edge cases
      edgeCases: {
        longStay: {
          destination: 'Tokyo',
          checkin: dates.iso8601.checkin,
          checkout: dates.iso8601.checkout,
          adults: 1,
          rooms: 1
        },
        family: {
          destination: 'London',
          checkin: dates.iso8601.checkin,
          checkout: dates.iso8601.checkout,
          adults: 2,
          children: 3,
          rooms: 1
        }
      }
    };
  }

  /**
   * Generate currency converter test data
   */
  generateCurrencyTestData() {
    return {
      // Valid currency conversions
      valid: [
        {
          from: 'USD',
          to: 'EUR',
          amount: 100
        },
        {
          from: 'GBP',
          to: 'USD',
          amount: 50
        },
        {
          from: 'JPY',
          to: 'USD',
          amount: 1000
        }
      ],
      
      // Edge cases
      edgeCases: [
        {
          from: 'USD',
          to: 'USD', // Same currency - should return same amount
          amount: 100
        },
        {
          from: 'AED',
          to: 'SAR',
          amount: 100
        },
        {
          from: 'EUR',
          to: 'GBP',
          amount: 1
        }
      ],
      
      // Invalid cases for testing error handling
      invalid: [
        {
          from: 'INVALID',
          to: 'USD',
          amount: 100
        },
        {
          from: 'USD',
          to: 'INVALID',
          amount: 100
        },
        {
          from: 'USD',
          to: 'EUR',
          amount: -100 // Negative amount
        }
      ]
    };
  }

  /**
   * Generate destination info test data
   */
  generateDestinationTestData() {
    return {
      // Valid destinations
      valid: [
        'Dubai',
        'Paris',
        'Tokyo',
        'New York',
        'London',
        'Rome',
        'Barcelona',
        'Amsterdam'
      ],
      
      // Edge cases
      edgeCases: [
        'São Paulo', // Special characters
        'New Delhi', // Multiple words
        'Kraków', // Polish characters
        'Malmö' // Swedish characters
      ],
      
      // Invalid cases
      invalid: [
        '', // Empty string
        '   ', // Whitespace only
        'NonExistentCity123', // Non-existent city
        'A', // Too short
        'VeryLongCityNameThatDoesNotExistInAnyCountry' // Too long
      ]
    };
  }

  /**
   * Generate weather forecast test data
   */
  generateWeatherTestData() {
    return {
      // Valid locations
      valid: [
        {
          location: 'Dubai',
          country: 'AE'
        },
        {
          location: 'London',
          country: 'GB'
        },
        {
          location: 'New York',
          country: 'US'
        },
        {
          location: 'Tokyo',
          country: 'JP'
        }
      ],
      
      // Edge cases
      edgeCases: [
        {
          location: 'São Paulo',
          country: 'BR'
        },
        {
          location: 'Mumbai',
          country: 'IN'
        }
      ],
      
      // Invalid cases
      invalid: [
        {
          location: '',
          country: 'US'
        },
        {
          location: 'InvalidCity',
          country: 'XX'
        }
      ]
    };
  }

  /**
   * Generate web search test data
   */
  generateWebSearchTestData() {
    return {
      // Valid search queries
      valid: [
        'best restaurants in Dubai',
        'things to do in Paris',
        'weather in Tokyo today',
        'hotels near Eiffel Tower',
        'flights from Cairo to Dubai'
      ],
      
      // Edge cases
      edgeCases: [
        'restaurants in São Paulo Brazil',
        'hotels in New York City',
        'things to do in London UK',
        'weather in Sydney Australia'
      ],
      
      // Invalid cases
      invalid: [
        '', // Empty query
        '   ', // Whitespace only
        'a', // Too short
        'x'.repeat(1000) // Too long
      ]
    };
  }

  /**
   * Generate telegram notification test data
   */
  generateTelegramTestData() {
    return {
      // Valid notifications
      valid: [
        {
          chatId: '123456789',
          message: 'Your flight booking is confirmed!',
          parseMode: 'HTML'
        },
        {
          chatId: '987654321',
          message: 'Weather update: Sunny in Dubai, 25°C',
          parseMode: 'Markdown'
        }
      ],
      
      // Edge cases
      edgeCases: [
        {
          chatId: '123456789',
          message: 'مرحباً! رحلتك إلى دبي جاهزة', // Arabic text
          parseMode: 'HTML'
        },
        {
          chatId: '987654321',
          message: 'Long message with emoji: ✈️🌍🏖️ Your travel package is ready!',
          parseMode: 'HTML'
        }
      ],
      
      // Invalid cases
      invalid: [
        {
          chatId: '',
          message: 'Test message'
        },
        {
          chatId: 'invalid',
          message: 'Test message'
        },
        {
          chatId: '123456789',
          message: '' // Empty message
        }
      ]
    };
  }

  /**
   * Get all test data
   */
  getAllTestData() {
    return {
      dates: this.generateValidDates(),
      flights: this.generateFlightTestData(),
      hotels: this.generateHotelTestData(),
      currency: this.generateCurrencyTestData(),
      destinations: this.generateDestinationTestData(),
      weather: this.generateWeatherTestData(),
      webSearch: this.generateWebSearchTestData(),
      telegram: this.generateTelegramTestData()
    };
  }

  /**
   * Validate test data format
   */
  validateTestData(data, type) {
    try {
      switch (type) {
        case 'flight':
          return this.validateFlightData(data);
        case 'hotel':
          return this.validateHotelData(data);
        case 'currency':
          return this.validateCurrencyData(data);
        default:
          return { valid: false, error: 'Unknown data type' };
      }
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Validate flight data
   */
  validateFlightData(data) {
    const required = ['origin', 'destination', 'departureDate'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.departureDate)) {
      return { valid: false, error: 'Invalid departure date format. Use YYYY-MM-DD' };
    }

    return { valid: true };
  }

  /**
   * Validate hotel data
   */
  validateHotelData(data) {
    const required = ['destination', 'checkin', 'checkout'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.checkin) || !dateRegex.test(data.checkout)) {
      return { valid: false, error: 'Invalid date format. Use YYYY-MM-DD' };
    }

    return { valid: true };
  }

  /**
   * Validate currency data
   */
  validateCurrencyData(data) {
    const required = ['from', 'to', 'amount'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
    }

    if (typeof data.amount !== 'number' || data.amount <= 0) {
      return { valid: false, error: 'Amount must be a positive number' };
    }

    return { valid: true };
  }
}

module.exports = TestDataGenerator;
