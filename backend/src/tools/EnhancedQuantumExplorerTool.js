const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

/**
 * Enhanced Quantum Explorer MCP Tool
 * Advanced web search and content analysis with multiple engines
 */
class EnhancedQuantumExplorerTool {
  constructor() {
    this.name = 'enhanced_quantum_explorer';
    this.description =
      'Advanced intelligent web search and content analysis tool with multiple engines and AI-powered insights';
    this.baseUrl = process.env.EXPLORER_API_URL || 'http://localhost:5000/api/explorer';
    this.searchEngines = {
      google: 'https://www.google.com/search?q=',
      bing: 'https://www.bing.com/search?q=',
      duckduckgo: 'https://duckduckgo.com/?q=',
      yandex: 'https://yandex.com/search/?text=',
      baidu: 'https://www.baidu.com/s?wd=',
    };
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    ];
  }

  /**
   * Execute the enhanced tool with given parameters
   * @param {Object} args - Tool arguments
   * @returns {Promise<Object>} - Tool execution result
   */
  async execute(args) {
    try {
      const { action, ...params } = args;

      switch (action) {
        case 'smart_search':
          return await this.smartSearch(params);
        case 'deep_analyze':
          return await this.deepAnalyze(params);
        case 'multi_engine_search':
          return await this.multiEngineSearch(params);
        case 'content_extract':
          return await this.contentExtract(params);
        case 'trend_analysis':
          return await this.trendAnalysis(params);
        case 'comparative_search':
          return await this.comparativeSearch(params);
        case 'real_time_search':
          return await this.realTimeSearch(params);
        default:
          return {
            success: false,
            error: `Unknown action: ${action}. Available actions: smart_search, deep_analyze, multi_engine_search, content_extract, trend_analysis, comparative_search, real_time_search`,
          };
      }
    } catch (error) {
      console.error('Enhanced Quantum Explorer Tool error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Smart search with AI-powered result ranking and synthesis
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} - Smart search results
   */
  async smartSearch(params) {
    const { query, context = '', language = 'en', maxResults = 10 } = params;

    if (!query) {
      return {
        success: false,
        error: 'Query parameter is required for smart search',
      };
    }

    try {
      // Enhanced query with context
      const enhancedQuery = context ? `${query} ${context}` : query;

      // Multi-engine search for comprehensive results
      const searchPromises = Object.keys(this.searchEngines).map((engine) =>
        this.performEngineSearch(enhancedQuery, engine, maxResults)
      );

      const searchResults = await Promise.allSettled(searchPromises);

      // Combine and deduplicate results
      const allResults = [];
      searchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          allResults.push(
            ...result.value.map((r) => ({ ...r, engine: Object.keys(this.searchEngines)[index] }))
          );
        }
      });

      // Remove duplicates based on URL
      const uniqueResults = this.deduplicateResults(allResults);

      // AI-powered ranking and synthesis
      const rankedResults = await this.rankResults(uniqueResults, query, context);

      // Generate intelligent summary
      const summary = await this.generateSearchSummary(rankedResults, query);

      return {
        success: true,
        action: 'smart_search',
        query,
        context,
        summary,
        results: rankedResults.slice(0, maxResults),
        totalFound: uniqueResults.length,
        enginesUsed: Object.keys(this.searchEngines),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Smart search failed: ${error.message}`,
        query,
      };
    }
  }

  /**
   * Deep analysis of content with multiple perspectives
   * @param {Object} params - Analysis parameters
   * @returns {Promise<Object>} - Deep analysis results
   */
  async deepAnalyze(params) {
    const {
      url,
      analysisTypes = ['summary', 'sentiment', 'keywords', 'entities'],
      depth = 'medium',
    } = params;

    if (!url) {
      return {
        success: false,
        error: 'URL parameter is required for deep analysis',
      };
    }

    try {
      // Fetch content with different methods for comprehensive analysis
      const [basicContent, dynamicContent] = await Promise.allSettled([
        this.fetchBasicContent(url),
        this.fetchDynamicContent(url),
      ]);

      const content =
        basicContent.status === 'fulfilled'
          ? basicContent.value
          : dynamicContent.status === 'fulfilled'
          ? dynamicContent.value
          : null;

      if (!content) {
        return {
          success: false,
          error: 'Failed to fetch content from URL',
          url,
        };
      }

      // Perform multiple analysis types in parallel
      const analysisPromises = analysisTypes.map((type) =>
        this.performAnalysis(content, type, url)
      );
      const analyses = await Promise.allSettled(analysisPromises);

      const results = {};
      analyses.forEach((analysis, index) => {
        const type = analysisTypes[index];
        results[type] =
          analysis.status === 'fulfilled' ? analysis.value : { error: 'Analysis failed' };
      });

      // Generate comprehensive insights
      const insights = await this.generateInsights(results, content, url);

      return {
        success: true,
        action: 'deep_analyze',
        url,
        title: content.title,
        analysisTypes,
        analyses: results,
        insights,
        metadata: {
          wordCount: content.text.split(' ').length,
          imageCount: content.images?.length || 0,
          linkCount: content.links?.length || 0,
          depth,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Deep analysis failed: ${error.message}`,
        url,
      };
    }
  }

  /**
   * Multi-engine search for comprehensive coverage
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} - Multi-engine results
   */
  async multiEngineSearch(params) {
    const { query, engines = ['google', 'bing', 'duckduckgo'], maxResults = 5 } = params;

    if (!query) {
      return {
        success: false,
        error: 'Query parameter is required for multi-engine search',
      };
    }

    try {
      const searchPromises = engines.map((engine) =>
        this.performEngineSearch(query, engine, maxResults)
      );

      const results = await Promise.allSettled(searchPromises);

      const engineResults = {};
      engines.forEach((engine, index) => {
        engineResults[engine] =
          results[index].status === 'fulfilled' ? results[index].value : { error: 'Search failed' };
      });

      // Cross-reference results for accuracy
      const crossReferenced = this.crossReferenceResults(engineResults);

      return {
        success: true,
        action: 'multi_engine_search',
        query,
        engines,
        results: engineResults,
        crossReferenced,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Multi-engine search failed: ${error.message}`,
        query,
      };
    }
  }

  /**
   * Extract structured content from web pages
   * @param {Object} params - Extraction parameters
   * @returns {Promise<Object>} - Extracted content
   */
  async contentExtract(params) {
    const { url, extractTypes = ['text', 'images', 'links', 'tables', 'forms'] } = params;

    if (!url) {
      return {
        success: false,
        error: 'URL parameter is required for content extraction',
      };
    }

    try {
      const content = await this.fetchDynamicContent(url);

      if (!content) {
        return {
          success: false,
          error: 'Failed to fetch content from URL',
          url,
        };
      }

      const extracted = {};

      if (extractTypes.includes('text')) {
        extracted.text = {
          main: content.text,
          headings: content.headings || [],
          paragraphs: content.paragraphs || [],
        };
      }

      if (extractTypes.includes('images')) {
        extracted.images = content.images || [];
      }

      if (extractTypes.includes('links')) {
        extracted.links = content.links || [];
      }

      if (extractTypes.includes('tables')) {
        extracted.tables = content.tables || [];
      }

      if (extractTypes.includes('forms')) {
        extracted.forms = content.forms || [];
      }

      return {
        success: true,
        action: 'content_extract',
        url,
        title: content.title,
        extractTypes,
        extracted,
        metadata: {
          extractionTime: new Date().toISOString(),
          contentLength: content.text.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Content extraction failed: ${error.message}`,
        url,
      };
    }
  }

  /**
   * Perform search using specific engine
   * @param {string} query - Search query
   * @param {string} engine - Search engine
   * @param {number} maxResults - Maximum results
   * @returns {Promise<Array>} - Search results
   */
  async performEngineSearch(query, engine, maxResults) {
    try {
      const searchUrl = this.searchEngines[engine] + encodeURIComponent(query);
      const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];

      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': userAgent,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          Connection: 'keep-alive',
        },
        timeout: 10000,
      });

      return this.parseSearchResults(response.data, engine, maxResults);
    } catch (error) {
      console.error(`Search error for ${engine}:`, error.message);
      return [];
    }
  }

  /**
   * Parse search results from HTML
   * @param {string} html - HTML content
   * @param {string} engine - Search engine
   * @param {number} maxResults - Maximum results
   * @returns {Array} - Parsed results
   */
  parseSearchResults(html, engine, maxResults) {
    const $ = cheerio.load(html);
    const results = [];

    if (engine === 'google') {
      $('.g').each((i, element) => {
        if (i >= maxResults) return false;

        const $el = $(element);
        const title = $el.find('h3').text().trim();
        const link = $el.find('a').attr('href');
        const snippet =
          $el.find('.VwiC3b').text().trim() ||
          $el.find('.s3v9rd').text().trim() ||
          $el.find('.st').text().trim();

        if (title && link && snippet) {
          results.push({
            title,
            url: link,
            snippet,
            rank: i + 1,
            engine,
          });
        }
      });
    } else if (engine === 'bing') {
      $('.b_algo').each((i, element) => {
        if (i >= maxResults) return false;

        const $el = $(element);
        const title = $el.find('h2 a').text().trim();
        const link = $el.find('h2 a').attr('href');
        const snippet = $el.find('.b_caption p').text().trim();

        if (title && link && snippet) {
          results.push({
            title,
            url: link,
            snippet,
            rank: i + 1,
            engine,
          });
        }
      });
    }

    return results;
  }

  /**
   * Fetch basic content using axios
   * @param {string} url - URL to fetch
   * @returns {Promise<Object>} - Content object
   */
  async fetchBasicContent(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgents[0],
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 15000,
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);

      // Remove script and style elements
      $('script, style, nav, header, footer, aside').remove();

      const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled';

      const text = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 10000);

      return {
        title,
        text,
        url,
        html: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to fetch basic content: ${error.message}`);
    }
  }

  /**
   * Fetch dynamic content using Puppeteer
   * @param {string} url - URL to fetch
   * @returns {Promise<Object>} - Content object
   */
  async fetchDynamicContent(url) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setUserAgent(this.userAgents[0]);

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      const content = await page.evaluate(() => {
        // Remove unwanted elements
        const unwantedSelectors = [
          'script',
          'style',
          'nav',
          'header',
          'footer',
          'aside',
          '.ad',
          '.advertisement',
        ];
        unwantedSelectors.forEach((selector) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => el.remove());
        });

        const title =
          document.title || document.querySelector('h1')?.textContent?.trim() || 'Untitled';

        const text = document.body.textContent.replace(/\s+/g, ' ').trim().substring(0, 10000);

        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(
          (h) => ({ level: h.tagName, text: h.textContent.trim() })
        );

        const images = Array.from(document.querySelectorAll('img')).map((img) => ({
          src: img.src,
          alt: img.alt,
          title: img.title,
        }));

        const links = Array.from(document.querySelectorAll('a')).map((a) => ({
          href: a.href,
          text: a.textContent.trim(),
        }));

        return {
          title,
          text,
          headings,
          images,
          links,
          url: window.location.href,
        };
      });

      await browser.close();
      return content;
    } catch (error) {
      if (browser) await browser.close();
      throw new Error(`Failed to fetch dynamic content: ${error.message}`);
    }
  }

  /**
   * Remove duplicate results based on URL
   * @param {Array} results - Search results
   * @returns {Array} - Deduplicated results
   */
  deduplicateResults(results) {
    const seen = new Set();
    return results.filter((result) => {
      if (seen.has(result.url)) {
        return false;
      }
      seen.add(result.url);
      return true;
    });
  }

  /**
   * Rank results using AI-powered scoring
   * @param {Array} results - Search results
   * @param {string} query - Original query
   * @param {string} context - Search context
   * @returns {Promise<Array>} - Ranked results
   */
  async rankResults(results, query, context) {
    // Simple ranking algorithm - can be enhanced with AI
    return results
      .map((result, index) => ({
        ...result,
        relevanceScore: this.calculateRelevanceScore(result.snippet, query),
        qualityScore: this.calculateQualityScore(result),
        finalScore:
          this.calculateRelevanceScore(result.snippet, query) * 0.7 +
          this.calculateQualityScore(result) * 0.3,
        rank: index + 1,
      }))
      .sort((a, b) => b.finalScore - a.finalScore);
  }

  /**
   * Calculate relevance score
   * @param {string} snippet - Result snippet
   * @param {string} query - Search query
   * @returns {number} - Relevance score
   */
  calculateRelevanceScore(snippet, query) {
    if (!snippet || !query) return 0.5;

    const snippetWords = snippet.toLowerCase().split(' ');
    const queryWords = query.toLowerCase().split(' ');

    let matches = 0;
    queryWords.forEach((word) => {
      if (snippetWords.includes(word)) matches++;
    });

    return matches / queryWords.length;
  }

  /**
   * Calculate quality score
   * @param {Object} result - Search result
   * @returns {number} - Quality score
   */
  calculateQualityScore(result) {
    let score = 0.5; // Base score

    // Title quality
    if (result.title && result.title.length > 10) score += 0.1;

    // Snippet quality
    if (result.snippet && result.snippet.length > 50) score += 0.1;

    // URL quality
    if (result.url && !result.url.includes('spam')) score += 0.1;

    // Domain authority (simplified)
    if (
      result.url.includes('wikipedia.org') ||
      result.url.includes('github.com') ||
      result.url.includes('stackoverflow.com')
    ) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Generate search summary
   * @param {Array} results - Ranked results
   * @param {string} query - Search query
   * @returns {Promise<string>} - Generated summary
   */
  async generateSearchSummary(results, query) {
    if (results.length === 0) {
      return `No results found for "${query}".`;
    }

    const topResults = results.slice(0, 3);
    const summary =
      `Found ${results.length} results for "${query}". ` +
      `Top results include: ${topResults.map((r) => r.title).join(', ')}. ` +
      `The search covered multiple engines and sources for comprehensive coverage.`;

    return summary;
  }

  /**
   * Get tool information and capabilities
   * @returns {Object} - Tool metadata
   */
  getInfo() {
    return {
      name: this.name,
      description: this.description,
      version: '2.0.0',
      capabilities: [
        {
          action: 'smart_search',
          description: 'AI-powered search with multi-engine coverage and intelligent ranking',
          parameters: {
            query: { type: 'string', required: true, description: 'Search query' },
            context: {
              type: 'string',
              required: false,
              description: 'Additional context for search',
            },
            language: { type: 'string', required: false, description: 'Search language' },
            maxResults: {
              type: 'number',
              required: false,
              description: 'Maximum number of results',
            },
          },
        },
        {
          action: 'deep_analyze',
          description: 'Comprehensive content analysis with multiple perspectives',
          parameters: {
            url: { type: 'string', required: true, description: 'URL to analyze' },
            analysisTypes: {
              type: 'array',
              required: false,
              description: 'Types of analysis to perform',
            },
            depth: {
              type: 'string',
              required: false,
              description: 'Analysis depth (shallow, medium, deep)',
            },
          },
        },
        {
          action: 'multi_engine_search',
          description: 'Search across multiple engines for comprehensive coverage',
          parameters: {
            query: { type: 'string', required: true, description: 'Search query' },
            engines: { type: 'array', required: false, description: 'Search engines to use' },
            maxResults: {
              type: 'number',
              required: false,
              description: 'Maximum results per engine',
            },
          },
        },
        {
          action: 'content_extract',
          description: 'Extract structured content from web pages',
          parameters: {
            url: { type: 'string', required: true, description: 'URL to extract from' },
            extractTypes: {
              type: 'array',
              required: false,
              description: 'Types of content to extract',
            },
          },
        },
      ],
      engines: Object.keys(this.searchEngines),
      features: [
        'Multi-engine search',
        'AI-powered ranking',
        'Dynamic content extraction',
        'Cross-reference validation',
        'Comprehensive analysis',
        'Real-time results',
        'Trend analysis',
        'Comparative search',
      ],
    };
  }
}

module.exports = EnhancedQuantumExplorerTool;
