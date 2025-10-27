const WebAnalysisService = require('../src/services/WebAnalysisService');
const SearchService = require('../src/services/SearchService');
const ContentExtractor = require('../src/services/ContentExtractor');
const LLMService = require('../src/services/LLMService');

// Mock the dependencies
jest.mock('../src/services/SearchService');
jest.mock('../src/services/ContentExtractor');
jest.mock('../src/services/LLMService');

describe('Quantum Explorer Engine - WebAnalysisService', () => {
  let searchService;
  let contentExtractor;
  let llmService;
  let webAnalysisService;

  beforeEach(() => {
    // Clear all instances and mocks before each test
    SearchService.mockClear();
    ContentExtractor.mockClear();
    LLMService.mockClear();

    // Create instances of the mocked services
    searchService = new SearchService();
    contentExtractor = new ContentExtractor();
    llmService = new LLMService();

    // Instantiate the service under test with mocked dependencies
    webAnalysisService = new WebAnalysisService(
      searchService,
      contentExtractor,
      undefined, // ContentChunker is not mocked as it's simple
      undefined, // PromptBuilder is not mocked
      llmService
    );
  });

  test('should return a synthesized answer for a web query', async () => {
    // Arrange: Setup mock return values
    const mockQuestion = 'What is Quantum Computing?';
    const mockSearchResults = [
      { url: 'http://example.com/qc1', title: 'QC Intro', snippet: '...' },
      { url: 'http://example.com/qc2', title: 'QC Explained', snippet: '...' },
    ];
    const mockExtractedContent = {
      title: 'QC Intro',
      content: 'Quantum computing is a new paradigm...',
      url: 'http://example.com/qc1',
    };
    const mockAiAnswer = {
      answer: 'Quantum computing is a revolutionary computing paradigm [1].',
      sources: [{ id: 1, url: 'http://example.com/qc1' }],
    };

    searchService.performMultiEngineSearch.mockResolvedValue(mockSearchResults);
    contentExtractor.extract.mockResolvedValue(mockExtractedContent);
    llmService.generateAnswer.mockResolvedValue(mockAiAnswer);

    // Act: Call the method to be tested
    const result = await webAnalysisService.getAnswerFromWeb(mockQuestion);

    // Assert: Check if the components were called and the result is correct
    expect(searchService.performMultiEngineSearch).toHaveBeenCalledWith(mockQuestion, { count: 5 });
    expect(contentExtractor.extract).toHaveBeenCalledWith('http://example.com/qc1');
    expect(llmService.generateAnswer).toHaveBeenCalled();
    expect(result.answer).toContain('Quantum computing');
    expect(result.sources[0].url).toBe('http://example.com/qc1');
  });

  test('should handle cases with no search results', async () => {
    // Arrange
    searchService.performMultiEngineSearch.mockResolvedValue([]);

    // Act
    const result = await webAnalysisService.getAnswerFromWeb('An obscure query');

    // Assert
    expect(result.answer).toContain('could not find any relevant information');
    expect(result.sources).toEqual([]);
    expect(llmService.generateAnswer).not.toHaveBeenCalled();
  });
});