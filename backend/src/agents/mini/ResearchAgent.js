/**
 * Research Agent - Google Search Integration
 * Specialization: Web research and information gathering
 */

const axios = require('axios');
const logger = require('../../utils/logger');

class ResearchAgent {
  constructor() {
    this.name = 'Research';
    this.icon = '🔍';
    this.searchApiKey = process.env.GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_API_KEY;
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || 'YOUR_SEARCH_ENGINE_ID';
  }

  /**
   * Execute a task
   */
  async executeTask(task) {
    logger.info(`[ResearchAgent] Executing task: ${task.type}`);
    
    try {
      switch (task.type) {
        case 'WEB_SEARCH':
          return await this.webSearch(task.query, task.options);
        case 'FIND_HOTELS':
          return await this.findHotels(task.location, task.filters);
        case 'FIND_FLIGHTS':
          return await this.findFlights(task.origin, task.destination, task.date);
        case 'GET_REVIEWS':
          return await this.getReviews(task.placeName);
        case 'COMPARE_PRICES':
          return await this.comparePrices(task.item);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      logger.error(`[ResearchAgent] Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Perform web search
   */
  async webSearch(query, options = {}) {
    const { num = 10, dateRestrict = null, language = 'en' } = options;

    if (!this.searchApiKey) {
      // Fallback: return mock data if no API key
      return this.getMockSearchResults(query);
    }

    try {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: this.searchApiKey,
          cx: this.searchEngineId,
          q: query,
          num,
          dateRestrict,
          lr: `lang_${language}`
        }
      });

      return {
        success: true,
        query,
        totalResults: response.data.searchInformation.totalResults,
        results: response.data.items.map(item => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          displayLink: item.displayLink,
          image: item.pagemap?.cse_image?.[0]?.src
        }))
      };
    } catch (error) {
      logger.warn(`[ResearchAgent] Search API error, using fallback`);
      return this.getMockSearchResults(query);
    }
  }

  /**
   * Find hotels in a location
   */
  async findHotels(location, filters = {}) {
    const { priceRange, rating, amenities } = filters;
    
    let query = `hotels in ${location}`;
    if (priceRange) query += ` ${priceRange}`;
    if (rating) query += ` ${rating} stars`;
    if (amenities) query += ` with ${amenities.join(' ')}`;

    const results = await this.webSearch(query, { num: 15 });
    
    // Filter results to only hotel-related
    const hotelResults = results.results.filter(r => 
      r.title.toLowerCase().includes('hotel') ||
      r.snippet.toLowerCase().includes('hotel') ||
      r.displayLink.includes('booking') ||
      r.displayLink.includes('hotels')
    );

    return {
      success: true,
      location,
      hotels: hotelResults.map(r => ({
        name: r.title,
        url: r.link,
        description: r.snippet,
        source: r.displayLink
      }))
    };
  }

  /**
   * Find flights
   */
  async findFlights(origin, destination, date) {
    const query = `flights from ${origin} to ${destination} ${date}`;
    const results = await this.webSearch(query, { num: 10 });

    const flightResults = results.results.filter(r =>
      r.displayLink.includes('flight') ||
      r.displayLink.includes('airline') ||
      r.displayLink.includes('kayak') ||
      r.displayLink.includes('skyscanner')
    );

    return {
      success: true,
      route: `${origin} → ${destination}`,
      date,
      flights: flightResults.map(r => ({
        title: r.title,
        url: r.link,
        description: r.snippet,
        source: r.displayLink
      }))
    };
  }

  /**
   * Get reviews for a place
   */
  async getReviews(placeName) {
    const query = `${placeName} reviews`;
    const results = await this.webSearch(query, { num: 10 });

    const reviewResults = results.results.filter(r =>
      r.snippet.toLowerCase().includes('review') ||
      r.displayLink.includes('tripadvisor') ||
      r.displayLink.includes('yelp') ||
      r.displayLink.includes('google')
    );

    return {
      success: true,
      place: placeName,
      reviews: reviewResults.map(r => ({
        source: r.displayLink,
        title: r.title,
        snippet: r.snippet,
        url: r.link
      }))
    };
  }

  /**
   * Compare prices for an item
   */
  async comparePrices(item) {
    const query = `${item} price comparison`;
    const results = await this.webSearch(query, { num: 15 });

    return {
      success: true,
      item,
      sources: results.results.map(r => ({
        source: r.displayLink,
        title: r.title,
        snippet: r.snippet,
        url: r.link
      }))
    };
  }

  /**
   * Get mock search results (fallback)
   */
  getMockSearchResults(query) {
    return {
      success: true,
      query,
      totalResults: '5',
      results: [
        {
          title: `${query} - Travel Guide`,
          link: `https://example.com/guide/${query.replace(/\s+/g, '-')}`,
          snippet: `Comprehensive travel guide for ${query}. Find the best places to visit, hotels, and activities.`,
          displayLink: 'example.com'
        },
        {
          title: `Best ${query} Deals`,
          link: `https://example.com/deals/${query.replace(/\s+/g, '-')}`,
          snippet: `Find the best deals and offers for ${query}. Compare prices and save money.`,
          displayLink: 'example.com'
        },
        {
          title: `${query} Reviews`,
          link: `https://example.com/reviews/${query.replace(/\s+/g, '-')}`,
          snippet: `Read reviews and ratings for ${query}. Real traveler experiences and recommendations.`,
          displayLink: 'example.com'
        }
      ]
    };
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      name: this.name,
      icon: this.icon,
      status: this.searchApiKey ? 'active' : 'fallback',
      capabilities: [
        'WEB_SEARCH',
        'FIND_HOTELS',
        'FIND_FLIGHTS',
        'GET_REVIEWS',
        'COMPARE_PRICES'
      ]
    };
  }
}

module.exports = ResearchAgent;
