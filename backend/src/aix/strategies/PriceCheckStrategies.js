/**
 * Price Check Strategies for NanoAgent
 * 
 * Example strategies for price comparison across multiple sources
 * Used by Thrifty agent for budget optimization
 */

const fetch = require('node-fetch');

/**
 * Strategy A: Official API
 */
async function apiPriceCheck(task, context) {
  const { apiUrl, apiKey } = context;
  
  if (!apiUrl) {
    throw new Error('API URL not provided');
  }

  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 5000
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    price: data.price || data.amount || null,
    currency: data.currency || 'USD',
    source: 'api',
    available: data.available !== false,
    details: data
  };
}

/**
 * Strategy B: Web Scraping (Simple)
 */
async function simpleScrape(task, context) {
  const { pageUrl } = context;
  
  if (!pageUrl) {
    throw new Error('Page URL not provided');
  }

  const response = await fetch(pageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AmrikyyBot/1.0)'
    },
    timeout: 8000
  });

  const html = await response.text();
  
  // Simple regex to find price (adjust per site)
  const priceMatch = html.match(/\$?([0-9,]+\.?[0-9]*)/);
  
  if (!priceMatch) {
    throw new Error('Price not found in page');
  }

  const price = parseFloat(priceMatch[1].replace(/,/g, ''));

  return {
    price,
    currency: 'USD',
    source: 'scrape',
    available: true,
    confidence: 0.7 // Lower confidence for scraping
  };
}

/**
 * Strategy C: Cached Data (Fast Fallback)
 */
async function cachedPrice(task, context) {
  const { cache } = context;
  
  if (!cache) {
    throw new Error('No cache available');
  }

  const cacheKey = `price:${task.product}:${task.destination || 'any'}`;
  const cached = cache.get(cacheKey);

  if (!cached) {
    throw new Error('No cached data');
  }

  // Check if cache is fresh (< 1 hour old)
  const age = Date.now() - cached.timestamp;
  if (age > 60 * 60 * 1000) {
    throw new Error('Cache too old');
  }

  return {
    price: cached.price,
    currency: cached.currency || 'USD',
    source: 'cache',
    available: true,
    cacheAge: age,
    confidence: 0.9 - (age / (60 * 60 * 1000)) * 0.2 // Decay confidence with age
  };
}

/**
 * Strategy D: Aggregator API (Multiple sources)
 */
async function aggregatorCheck(task, context) {
  const { aggregatorUrl } = context;
  
  if (!aggregatorUrl) {
    throw new Error('Aggregator URL not provided');
  }

  const response = await fetch(aggregatorUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product: task.product,
      destination: task.destination,
      sources: ['skyscanner', 'kayak', 'google']
    }),
    timeout: 10000
  });

  const data = await response.json();

  // Return lowest price from all sources
  const prices = data.results?.map(r => r.price).filter(p => p != null) || [];
  
  if (prices.length === 0) {
    throw new Error('No prices found');
  }

  const lowestPrice = Math.min(...prices);

  return {
    price: lowestPrice,
    currency: data.currency || 'USD',
    source: 'aggregator',
    available: true,
    pricesChecked: prices.length,
    allPrices: prices,
    confidence: 0.95 // High confidence from multiple sources
  };
}

/**
 * Strategy E: Historical Data + Prediction
 */
async function predictivePrice(task, context) {
  const { historicalData } = context;
  
  if (!historicalData || historicalData.length < 10) {
    throw new Error('Insufficient historical data');
  }

  // Simple trend analysis
  const recentPrices = historicalData.slice(-30).map(d => d.price);
  const average = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
  
  // Calculate trend
  const trend = recentPrices[recentPrices.length - 1] - recentPrices[0];
  const trendPercent = (trend / recentPrices[0]) * 100;

  // Predict next price
  const predicted = average + (trend * 0.5); // Conservative prediction

  return {
    price: predicted,
    currency: 'USD',
    source: 'prediction',
    available: true,
    confidence: 0.6,
    trend: trendPercent > 0 ? 'increasing' : 'decreasing',
    trendPercent: Math.abs(trendPercent).toFixed(1) + '%',
    basedOnSamples: recentPrices.length
  };
}

module.exports = {
  apiPriceCheck,
  simpleScrape,
  cachedPrice,
  aggregatorCheck,
  predictivePrice
};

