const { google } = require('@googleapis/customsearch');
const axios = require('axios');
const Redis = require('ioredis');

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

class SearchService {
  async searchGoogle(query, count = 5) {
    if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
      console.warn('Google Search API key or Engine ID is not configured. Skipping Google search.');
      return [];
    }
    const customsearch = google.customsearch('v1');
    const res = await customsearch.cse.list({
      auth: process.env.GOOGLE_SEARCH_API_KEY,
      cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
      q: query,
      num: count,
    });
    return (
      res.data.items?.map((item) => ({
        url: item.link,
        title: item.title,
        snippet: item.snippet,
        source: 'Google',
      })) || []
    );
  }

  async searchBrave(query, count = 5) {
    if (!process.env.BRAVE_SEARCH_API_KEY) {
      console.warn('Brave Search API key is not configured. Skipping Brave search.');
      return [];
    }
    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: { 'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY },
      params: { q: query, count: count },
    });
    return (
      response.data.web?.results.map((item) => ({
        url: item.url,
        title: item.title,
        snippet: item.description,
        source: 'Brave',
      })) || []
    );
  }

  async performMultiEngineSearch(query, options = {}) {
    const { count = 5 } = options;
    const cacheKey = `multi-search:${query}:${count}`;

    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      console.log(`[SearchService] Serving results from cache for query: ${query}`);
      return JSON.parse(cachedResult);
    }

    const [googleResults, braveResults] = await Promise.all([
      this.searchGoogle(query, count).catch((e) => {
        console.error('Google Search failed:', e);
        return [];
      }),
      this.searchBrave(query, count).catch((e) => {
        console.error('Brave Search failed:', e);
        return [];
      }),
    ]);

    const combinedResults = [...googleResults, ...braveResults];
    const uniqueResults = Array.from(
      new Map(combinedResults.map((item) => [item.url, item])).values()
    );

    await redisClient.set(cacheKey, JSON.stringify(uniqueResults), 'EX', 3600); // Cache for 1 hour
    return uniqueResults;
  }
}

module.exports = SearchService;
