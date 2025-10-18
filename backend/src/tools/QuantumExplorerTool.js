const axios = require('axios');

/**
 * Quantum Explorer MCP Tool
 * Provides intelligent web search and content analysis capabilities
 * for other agents in the QuantumOS ecosystem
 */
class QuantumExplorerTool {
  constructor() {
    this.name = 'quantum_explorer';
    this.description = 'Intelligent web search and content analysis tool powered by AI';
    this.baseUrl = process.env.EXPLORER_API_URL || 'http://localhost:3001/api/explorer';
  }

  /**
   * Execute the tool with given parameters
   * @param {Object} args - Tool arguments
   * @returns {Promise<Object>} - Tool execution result
   */
  async execute(args) {
    try {
      const { action, ...params } = args;

      switch (action) {
        case 'search':
          return await this.performSearch(params);
        case 'analyze':
          return await this.analyzeUrl(params);
        case 'query':
          return await this.intelligentQuery(params);
        case 'batch_analyze':
          return await this.batchAnalyze(params);
        default:
          return {
            success: false,
            error: `Unknown action: ${action}. Available actions: search, analyze, query, batch_analyze`
          };
      }
    } catch (error) {
      console.error('Quantum Explorer Tool error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Perform intelligent web search and get AI-generated answer
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} - Search results with AI answer
   */
  async intelligentQuery(params) {
    const { question, options = {} } = params;

    if (!question) {
      return {
        success: false,
        error: 'Question parameter is required for intelligent query'
      };
    }

    try {
      const response = await axios.post(`${this.baseUrl}/query`, {
        question,
        options
      });

      return {
        success: true,
        action: 'intelligent_query',
        question,
        answer: response.data.answer,
        sources: response.data.sources,
        confidence: response.data.confidence,
        keyPoints: response.data.keyPoints || [],
        searchResults: response.data.searchResults || [],
        timestamp: response.data.timestamp
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to perform intelligent query: ${error.message}`,
        question
      };
    }
  }

  /**
   * Perform basic web search
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} - Search results
   */
  async performSearch(params) {
    const { query, engine = 'google', maxResults = 10 } = params;

    if (!query) {
      return {
        success: false,
        error: 'Query parameter is required for search'
      };
    }

    try {
      const response = await axios.post(`${this.baseUrl}/search`, {
        query,
        engine,
        maxResults
      });

      return {
        success: true,
        action: 'search',
        query,
        engine,
        results: response.data.results,
        count: response.data.count,
        timestamp: response.data.timestamp
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to perform search: ${error.message}`,
        query
      };
    }
  }

  /**
   * Analyze a specific URL
   * @param {Object} params - Analysis parameters
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeUrl(params) {
    const { url, analysisType = 'summary', question = null } = params;

    if (!url) {
      return {
        success: false,
        error: 'URL parameter is required for analysis'
      };
    }

    try {
      const response = await axios.post(`${this.baseUrl}/analyze`, {
        url,
        analysisType,
        question
      });

      return {
        success: true,
        action: 'analyze_url',
        url,
        analysisType,
        title: response.data.title,
        analysis: response.data.analysis,
        metadata: response.data.metadata,
        timestamp: response.data.metadata?.timestamp
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to analyze URL: ${error.message}`,
        url
      };
    }
  }

  /**
   * Analyze multiple URLs in batch
   * @param {Object} params - Batch analysis parameters
   * @returns {Promise<Object>} - Batch analysis results
   */
  async batchAnalyze(params) {
    const { urls, analysisType = 'summary' } = params;

    if (!Array.isArray(urls) || urls.length === 0) {
      return {
        success: false,
        error: 'URLs array parameter is required for batch analysis'
      };
    }

    try {
      const response = await axios.post(`${this.baseUrl}/batch-analyze`, {
        urls,
        analysisType
      });

      return {
        success: true,
        action: 'batch_analyze',
        results: response.data.results,
        total: response.data.total,
        successful: response.data.successful,
        failed: response.data.failed,
        timestamp: response.data.timestamp
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to perform batch analysis: ${error.message}`,
        urls
      };
    }
  }

  /**
   * Get tool information and capabilities
   * @returns {Object} - Tool metadata
   */
  getInfo() {
    return {
      name: this.name,
      description: this.description,
      version: '1.0.0',
      capabilities: [
        {
          action: 'query',
          description: 'Perform intelligent web search and get AI-generated answers',
          parameters: {
            question: { type: 'string', required: true, description: 'Question to search for' },
            options: { type: 'object', required: false, description: 'Search options' }
          }
        },
        {
          action: 'search',
          description: 'Perform basic web search and return raw results',
          parameters: {
            query: { type: 'string', required: true, description: 'Search query' },
            engine: { type: 'string', required: false, description: 'Search engine (google, bing, duckduckgo)' },
            maxResults: { type: 'number', required: false, description: 'Maximum number of results' }
          }
        },
        {
          action: 'analyze',
          description: 'Analyze a specific URL for content, keywords, or Q&A',
          parameters: {
            url: { type: 'string', required: true, description: 'URL to analyze' },
            analysisType: { type: 'string', required: false, description: 'Type of analysis (summary, keywords, qa, full)' },
            question: { type: 'string', required: false, description: 'Question for Q&A analysis' }
          }
        },
        {
          action: 'batch_analyze',
          description: 'Analyze multiple URLs in batch',
          parameters: {
            urls: { type: 'array', required: true, description: 'Array of URLs to analyze' },
            analysisType: { type: 'string', required: false, description: 'Type of analysis for all URLs' }
          }
        }
      ],
      examples: [
        {
          action: 'query',
          params: { question: 'What are the latest developments in AI?' },
          description: 'Get intelligent answer about AI developments'
        },
        {
          action: 'search',
          params: { query: 'quantum computing news', engine: 'google', maxResults: 5 },
          description: 'Search for quantum computing news'
        },
        {
          action: 'analyze',
          params: { url: 'https://example.com', analysisType: 'summary' },
          description: 'Get summary of a webpage'
        },
        {
          action: 'analyze',
          params: { url: 'https://example.com', analysisType: 'qa', question: 'What is this page about?' },
          description: 'Ask a specific question about webpage content'
        }
      ]
    };
  }
}

module.exports = QuantumExplorerTool;
