const BaseTool = require('./BaseTool'); // Assuming a BaseTool exists
const WebAnalysisService = require('../services/WebAnalysisService');
const SearchService = require('../services/SearchService');
const ContentExtractor = require('../services/ContentExtractor');
const ContentChunker = require('../services/ContentChunker');
const PromptBuilder = require('../services/PromptBuilder');
const LLMService = require('../services/LLMService');

/**
 * Quantum Explorer MCP Tool
 * Provides intelligent web search and content analysis capabilities
 * for other agents in the QuantumOS ecosystem
 */
class QuantumExplorerTool extends BaseTool {
  constructor(webAnalysisService) {
    super('quantum_explorer', 'أداة البحث الذكي والتحليل على الويب مع استشهادات AI', {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['search', 'analyze_url'],
          description:
            "نوع العملية: 'search' للحصول على إجابة من الويب، 'analyze_url' لتحليل رابط معين.",
        },
        query: {
          type: 'string',
          description: 'سؤال البحث الذي سيتم استخدامه (مطلوب لـ action: search).',
        },
        url: {
          type: 'string',
          description: 'رابط الصفحة المراد تحليلها (مطلوب لـ action: analyze_url).',
        },
        analysisTypes: {
          type: 'array',
          items: { type: 'string' },
          description:
            "أنواع التحليل المطلوبة: ['summary', 'keywords', 'qa'] (اختياري لـ action: analyze_url).",
        },
      },
      required: ['action'],
    });
    // In a real app, this should be injected.
    this.webAnalysisService =
      webAnalysisService ||
      new WebAnalysisService(
        new SearchService(),
        new ContentExtractor(),
        new ContentChunker(),
        new PromptBuilder(),
        new LLMService()
      );
  }

  /**
   * Execute the tool with given parameters
   * @param {Object} args - Tool arguments
   * @returns {Promise<Object>} - Tool execution result
   */
  async execute(args) {
    const { action, query, url, analysisTypes } = args;
    if (action === 'search') {
      if (!query) throw new Error("The 'query' parameter is required for the 'search' action.");
      // Note: This is a long-running task. The tool should ideally handle async job IDs.
      // For simplicity here, we await the result directly.
      return await this.webAnalysisService.getAnswerFromWeb(query);
    } else if (action === 'analyze_url') {
      if (!url) throw new Error("The 'url' parameter is required for the 'analyze_url' action.");
      return await this.webAnalysisService.analyzeUrl(url, analysisTypes, query); // query can be used for 'qa'
    } else {
      throw new Error(
        `Unknown action: ${action}. Available actions are 'search' and 'analyze_url'.`
      );
    }
  }
}

module.exports = new QuantumExplorerTool();
