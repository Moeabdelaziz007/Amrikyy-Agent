const axios = require('axios');
const cheerio = require('cheerio');
const { ZaiClient } = require('../ai/zaiClient');

/**
 * Quantum Explorer Engine - Web Analysis Service
 * Provides intelligent web search and content analysis capabilities
 */
class WebAnalysisService {
  constructor() {
    this.zaiClient = new ZaiClient();
    this.searchEngines = {
      google: 'https://www.google.com/search?q=',
      bing: 'https://www.bing.com/search?q=',
      duckduckgo: 'https://duckduckgo.com/?q=',
    };
    this.userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  /**
   * Get intelligent answer from web search
   * @param {string} question - The question to search for
   * @param {Object} options - Search options
   * @returns {Promise<Object>} - Structured answer with sources
   */
  async getAnswerFromWeb(question, options = {}) {
    try {
      console.log(`🔍 Searching web for: "${question}"`);

      // Step 1: Perform web search
      const searchResults = await this.performWebSearch(question, options);

      if (!searchResults || searchResults.length === 0) {
        return {
          success: false,
          error: 'No search results found',
          question,
          answer: 'I could not find any relevant information for your question.',
          sources: [],
        };
      }

      // Step 2: Analyze top results
      const analyzedResults = await this.analyzeSearchResults(searchResults.slice(0, 5));

      // Step 3: Generate intelligent answer using AI
      const aiAnswer = await this.generateIntelligentAnswer(question, analyzedResults);

      return {
        success: true,
        question,
        answer: aiAnswer.answer,
        sources: aiAnswer.sources,
        confidence: aiAnswer.confidence,
        searchResults: analyzedResults,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in getAnswerFromWeb:', error);
      return {
        success: false,
        error: error.message,
        question,
        answer: 'Sorry, I encountered an error while searching for your question.',
        sources: [],
      };
    }
  }

  /**
   * Analyze a specific URL
   * @param {string} url - URL to analyze
   * @param {string} analysisType - Type of analysis (summary, keywords, qa)
   * @param {string} question - Optional question about the content
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeUrl(url, analysisType = 'summary', question = null) {
    try {
      console.log(`📄 Analyzing URL: ${url}`);

      // Step 1: Fetch and parse webpage content
      const pageContent = await this.fetchPageContent(url);

      if (!pageContent.success) {
        return {
          success: false,
          error: pageContent.error,
          url,
          analysis: null,
        };
      }

      // Step 2: Perform analysis based on type
      let analysis;
      switch (analysisType) {
        case 'summary':
          analysis = await this.generateSummary(pageContent.content, url);
          break;
        case 'keywords':
          analysis = await this.extractKeywords(pageContent.content);
          break;
        case 'qa':
          if (!question) {
            return { success: false, error: 'Question required for Q&A analysis' };
          }
          analysis = await this.answerQuestionFromContent(pageContent.content, question, url);
          break;
        case 'full':
          analysis = await this.performFullAnalysis(pageContent.content, url);
          break;
        default:
          analysis = await this.generateSummary(pageContent.content, url);
      }

      return {
        success: true,
        url,
        title: pageContent.title,
        analysisType,
        analysis,
        metadata: {
          wordCount: pageContent.content.split(' ').length,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error in analyzeUrl:', error);
      return {
        success: false,
        error: error.message,
        url,
        analysis: null,
      };
    }
  }

  /**
   * Perform web search using multiple engines
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Search results
   */
  async performWebSearch(query, options = {}) {
    const { engine = 'google', maxResults = 10 } = options;

    try {
      const searchUrl = this.searchEngines[engine] + encodeURIComponent(query);

      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          Connection: 'keep-alive',
        },
        timeout: 10000,
      });

      return this.parseSearchResults(response.data, engine);
    } catch (error) {
      console.error('Search error:', error.message);
      return [];
    }
  }

  /**
   * Parse search results from HTML
   * @param {string} html - HTML content
   * @param {string} engine - Search engine used
   * @returns {Array} - Parsed results
   */
  parseSearchResults(html, engine) {
    const $ = cheerio.load(html);
    const results = [];

    if (engine === 'google') {
      $('.g').each((i, element) => {
        if (i >= 10) return false; // Limit results

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
          });
        }
      });
    }

    return results;
  }

  /**
   * Analyze search results content
   * @param {Array} results - Search results
   * @returns {Promise<Array>} - Analyzed results with content
   */
  async analyzeSearchResults(results) {
    const analyzedResults = [];

    for (const result of results) {
      try {
        const content = await this.fetchPageContent(result.url);
        if (content.success) {
          analyzedResults.push({
            ...result,
            content: content.content,
            title: content.title,
            wordCount: content.content.split(' ').length,
            relevanceScore: this.calculateRelevanceScore(result.snippet, content.content),
          });
        }
      } catch (error) {
        console.error(`Error analyzing ${result.url}:`, error.message);
        analyzedResults.push({
          ...result,
          content: result.snippet,
          error: error.message,
        });
      }
    }

    return analyzedResults;
  }

  /**
   * Generate intelligent answer using AI
   * @param {string} question - Original question
   * @param {Array} analyzedResults - Analyzed search results
   * @returns {Promise<Object>} - AI-generated answer
   */
  async generateIntelligentAnswer(question, analyzedResults) {
    try {
      const context = analyzedResults.map((result) => ({
        title: result.title,
        url: result.url,
        content: result.content?.substring(0, 2000) || result.snippet, // Limit content length
        relevanceScore: result.relevanceScore || 0,
      }));

      const prompt = `
You are a Quantum Explorer AI assistant. Based on the following web search results, provide a comprehensive and accurate answer to the user's question.

Question: "${question}"

Search Results Context:
${context
  .map(
    (c, i) => `${i + 1}. ${c.title} (${c.url})
Content: ${c.content}
Relevance Score: ${c.relevanceScore}
---`
  )
  .join('\n')}

Instructions:
1. Provide a direct, comprehensive answer to the question
2. Synthesize information from multiple sources when relevant
3. Include specific facts, numbers, and details when available
4. Cite your sources by referencing the URLs
5. If information is conflicting, mention the different perspectives
6. If the answer is uncertain, express the level of confidence
7. Keep the answer informative but concise (2-4 paragraphs)

Format your response as JSON:
{
  "answer": "Your comprehensive answer here...",
  "sources": ["url1", "url2", "url3"],
  "confidence": 0.85,
  "keyPoints": ["point1", "point2", "point3"]
}
`;

      const response = await this.zaiClient.generateText(prompt, {
        maxTokens: 1000,
        temperature: 0.3,
      });

      const aiResponse = JSON.parse(response.text);

      return {
        answer: aiResponse.answer,
        sources: aiResponse.sources || analyzedResults.slice(0, 3).map((r) => r.url),
        confidence: aiResponse.confidence || 0.8,
        keyPoints: aiResponse.keyPoints || [],
      };
    } catch (error) {
      console.error('Error generating AI answer:', error);

      // Fallback to simple synthesis
      const topResult = analyzedResults[0];
      return {
        answer: `Based on the search results, here's what I found: ${
          topResult?.snippet || 'No relevant information found.'
        }`,
        sources: analyzedResults.slice(0, 3).map((r) => r.url),
        confidence: 0.6,
        keyPoints: [],
      };
    }
  }

  /**
   * Fetch and parse webpage content
   * @param {string} url - URL to fetch
   * @returns {Promise<Object>} - Page content and metadata
   */
  async fetchPageContent(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 15000,
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);

      // Remove script and style elements
      $('script, style, nav, header, footer, aside').remove();

      // Extract main content
      const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled';

      const content = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 10000); // Limit content length

      return {
        success: true,
        title,
        content,
        url,
        wordCount: content.split(' ').length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        url,
      };
    }
  }

  /**
   * Generate summary of content
   * @param {string} content - Page content
   * @param {string} url - Page URL
   * @returns {Promise<string>} - Generated summary
   */
  async generateSummary(content, url) {
    try {
      const prompt = `
Summarize the following web page content in 2-3 concise paragraphs. Focus on the main points and key information.

URL: ${url}
Content: ${content.substring(0, 3000)}

Provide a clear, informative summary that captures the essence of the content.
`;

      const response = await this.zaiClient.generateText(prompt, {
        maxTokens: 500,
        temperature: 0.3,
      });

      return response.text;
    } catch (error) {
      console.error('Error generating summary:', error);
      return content.substring(0, 500) + '...';
    }
  }

  /**
   * Extract keywords from content
   * @param {string} content - Page content
   * @returns {Promise<Array>} - Extracted keywords
   */
  async extractKeywords(content) {
    try {
      const prompt = `
Extract the most important keywords and key phrases from the following content. Return them as a JSON array.

Content: ${content.substring(0, 2000)}

Return format: ["keyword1", "keyword2", "keyword3", ...]
`;

      const response = await this.zaiClient.generateText(prompt, {
        maxTokens: 200,
        temperature: 0.2,
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error('Error extracting keywords:', error);
      return [];
    }
  }

  /**
   * Answer question based on content
   * @param {string} content - Page content
   * @param {string} question - Question to answer
   * @param {string} url - Page URL
   * @returns {Promise<string>} - Answer
   */
  async answerQuestionFromContent(content, question, url) {
    try {
      const prompt = `
Based on the following web page content, answer the specific question asked.

URL: ${url}
Question: ${question}
Content: ${content.substring(0, 3000)}

Provide a direct, accurate answer based only on the content provided. If the answer is not available in the content, state that clearly.
`;

      const response = await this.zaiClient.generateText(prompt, {
        maxTokens: 300,
        temperature: 0.2,
      });

      return response.text;
    } catch (error) {
      console.error('Error answering question:', error);
      return 'Unable to answer the question based on the provided content.';
    }
  }

  /**
   * Perform full analysis of content
   * @param {string} content - Page content
   * @param {string} url - Page URL
   * @returns {Promise<Object>} - Full analysis results
   */
  async performFullAnalysis(content, url) {
    try {
      const [summary, keywords] = await Promise.all([
        this.generateSummary(content, url),
        this.extractKeywords(content),
      ]);

      return {
        summary,
        keywords,
        wordCount: content.split(' ').length,
        mainTopics: keywords.slice(0, 5),
        readabilityScore: this.calculateReadabilityScore(content),
      };
    } catch (error) {
      console.error('Error in full analysis:', error);
      return {
        summary: content.substring(0, 500),
        keywords: [],
        error: error.message,
      };
    }
  }

  /**
   * Calculate relevance score
   * @param {string} snippet - Search snippet
   * @param {string} content - Full content
   * @returns {number} - Relevance score (0-1)
   */
  calculateRelevanceScore(snippet, content) {
    if (!snippet || !content) return 0.5;

    const snippetWords = snippet.toLowerCase().split(' ');
    const contentWords = content.toLowerCase().split(' ');

    let matches = 0;
    snippetWords.forEach((word) => {
      if (contentWords.includes(word)) matches++;
    });

    return matches / snippetWords.length;
  }

  /**
   * Calculate readability score
   * @param {string} content - Text content
   * @returns {number} - Readability score
   */
  calculateReadabilityScore(content) {
    const words = content.split(' ').length;
    const sentences = content.split(/[.!?]+/).length;
    const syllables = content.split('').filter((char) => 'aeiouAEIOU'.includes(char)).length;

    if (sentences === 0 || words === 0) return 0;

    // Simple readability formula
    return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  }
}

module.exports = WebAnalysisService;
