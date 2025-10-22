const SearchService = require('./SearchService');
const ContentExtractor = require('./ContentExtractor');
const ContentChunker = require('./ContentChunker');
const PromptBuilder = require('./PromptBuilder');
const LLMService = require('./LLMService');

/**
 * Quantum Explorer Engine - Web Analysis Service
 * Provides intelligent web search and content analysis capabilities
 */
class WebAnalysisService {
  constructor(searchService, contentExtractor, contentChunker, promptBuilder, llmService) {
    this.searchService = searchService || new SearchService();
    this.contentExtractor = contentExtractor || new ContentExtractor();
    this.contentChunker = contentChunker || new ContentChunker();
    this.promptBuilder = promptBuilder || new PromptBuilder();
    this.llmService = llmService || new LLMService();
    // The old implementation of scraping is now deprecated in favor of ContentExtractor
    // this.userAgent = '...';
    // this.searchEngines = {...};
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

      // 1. الاسترجاع (Retrieve)
      const searchResults = await this.searchService.performMultiEngineSearch(question, {
        count: options.source_count || 5,
      });

      if (!searchResults || searchResults.length === 0) {
        return {
          answer: 'I could not find any relevant information for your question.',
          sources: [],
        };
      }

      // 2. التعزيز (Augment)
      const extractedContent = await Promise.all(
        searchResults.map((result) =>
          this.contentExtractor.extract(result.url).catch((e) => {
            console.error(`Skipping failed extraction for ${result.url}: ${e.message}`);
            return null; // Return null for failed extractions
          })
        )
      );
      const validContent = extractedContent.filter((c) => c !== null);
      const chunks = validContent.flatMap((content) => this.contentChunker.chunk(content));

      // 3. التوليد (Generate)
      const prompt = this.promptBuilder.buildRAGPrompt(question, chunks);
      const aiAnswer = await this.llmService.generateAnswer(prompt);

      return {
        answer: aiAnswer.answer,
        sources: aiAnswer.sources,
        metadata: {
          search_results_count: searchResults.length,
          chunks_processed: chunks.length,
        },
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

      const content = await this.contentExtractor.extract(url);
      const analyses = {};

      const analysisTypesArr = Array.isArray(analysisType) ? analysisType : [analysisType];

      if (analysisTypesArr.includes('summary')) {
        analyses.summary = await this.llmService.summarize(content.content, url);
      }
      if (analysisTypesArr.includes('keywords')) {
        analyses.keywords = await this.llmService.extractKeywords(content.content);
      }
      if (analysisTypesArr.includes('qa') && question) {
        analyses.qa = await this.llmService.answerQuestionFromContent(
          content.content,
          question,
          url
        );
      }

      return analyses;
    } catch (error) {
      console.error('Error in analyzeUrl:', error);
      throw error;
    }
  }
}

module.exports = WebAnalysisService;
