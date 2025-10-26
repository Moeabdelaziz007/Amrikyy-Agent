const { describe, it, expect, jest: vi, beforeEach } = require('@jest/globals');
import WebAnalysisService from '../services/WebAnalysisService';

// Mock dependencies
vi.mock('axios');
vi.mock('cheerio');
vi.mock('puppeteer');
vi.mock('@google/generative-ai');

describe('WebAnalysisService', () => {
  let webAnalysisService;

  beforeEach(() => {
    vi.clearAllMocks();
    webAnalysisService = new WebAnalysisService();
  });

  describe('performWebSearch', () => {
    it('performs multi-engine search successfully', async () => {
      const mockResults = [
        { url: 'https://example1.com', title: 'Example 1', snippet: 'Snippet 1' },
        { url: 'https://example2.com', title: 'Example 2', snippet: 'Snippet 2' },
      ];

      // Mock Google Custom Search
      vi.spyOn(webAnalysisService, 'searchGoogle').mockResolvedValue(mockResults);

      const results = await webAnalysisService.performWebSearch('test query');

      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('url', 'https://example1.com');
      expect(results[0]).toHaveProperty('title', 'Example 1');
    });

    it('handles search errors gracefully', async () => {
      vi.spyOn(webAnalysisService, 'searchGoogle').mockRejectedValue(new Error('Search failed'));

      await expect(webAnalysisService.performWebSearch('test query')).rejects.toThrow(
        'Search failed'
      );
    });

    it('removes duplicate URLs', async () => {
      const mockResults = [
        { url: 'https://example.com', title: 'Example 1', snippet: 'Snippet 1' },
        { url: 'https://example.com', title: 'Example 2', snippet: 'Snippet 2' },
        { url: 'https://different.com', title: 'Different', snippet: 'Different' },
      ];

      vi.spyOn(webAnalysisService, 'searchGoogle').mockResolvedValue(mockResults);

      const results = await webAnalysisService.performWebSearch('test query');

      expect(results).toHaveLength(2); // Duplicate removed
    });
  });

  describe('extractContent', () => {
    it('extracts content using Cheerio successfully', async () => {
      const mockHtml = '<html><body><h1>Test Title</h1><p>Test content</p></body></html>';
      const mockResponse = { data: mockHtml };

      vi.spyOn(require('axios'), 'get').mockResolvedValue(mockResponse);
      vi.spyOn(require('cheerio'), 'load').mockReturnValue({
        text: () => 'Test Title Test content',
        html: () => mockHtml,
      });

      const content = await webAnalysisService.extractContent('https://example.com');

      expect(content).toHaveProperty('title', 'Test Title');
      expect(content).toHaveProperty('content', 'Test Title Test content');
    });

    it('falls back to Puppeteer when Cheerio fails', async () => {
      const mockHtml = '<html><body><h1>Dynamic Title</h1><p>Dynamic content</p></body></html>';

      vi.spyOn(require('axios'), 'get').mockRejectedValue(new Error('Network error'));
      vi.spyOn(require('puppeteer'), 'launch').mockResolvedValue({
        newPage: vi.fn().mockResolvedValue({
          goto: vi.fn().mockResolvedValue(undefined),
          content: vi.fn().mockResolvedValue(mockHtml),
        }),
        close: vi.fn().mockResolvedValue(undefined),
      });

      const content = await webAnalysisService.extractContent('https://example.com');

      expect(content).toBeDefined();
      expect(require('puppeteer').launch).toHaveBeenCalled();
    });

    it('handles extraction errors gracefully', async () => {
      vi.spyOn(require('axios'), 'get').mockRejectedValue(new Error('Network error'));
      vi.spyOn(require('puppeteer'), 'launch').mockRejectedValue(new Error('Puppeteer error'));

      await expect(webAnalysisService.extractContent('https://invalid.com')).rejects.toThrow(
        'Puppeteer error'
      );
    });
  });

  describe('analyzeContent', () => {
    it('performs content analysis successfully', async () => {
      const mockText = 'This is a positive review about our product.';
      const mockAnalysis = {
        summary: 'Positive product review',
        keywords: ['positive', 'review', 'product'],
        sentiment: { score: 0.8, label: 'positive' },
      };

      vi.spyOn(webAnalysisService.model, 'generateContent').mockResolvedValue({
        response: { text: () => JSON.stringify(mockAnalysis) },
      });

      const analysis = await webAnalysisService.analyzeContent(mockText);

      expect(analysis).toHaveProperty('summary', 'Positive product review');
      expect(analysis).toHaveProperty('keywords');
      expect(analysis).toHaveProperty('sentiment');
    });

    it('handles analysis errors gracefully', async () => {
      vi.spyOn(webAnalysisService.model, 'generateContent').mockRejectedValue(
        new Error('AI analysis failed')
      );

      await expect(webAnalysisService.analyzeContent('test content')).rejects.toThrow(
        'AI analysis failed'
      );
    });
  });

  describe('getAnswerFromWeb', () => {
    it('generates intelligent answer with sources', async () => {
      const mockSearchResults = [
        { url: 'https://example1.com', title: 'Source 1', snippet: 'Content 1' },
        { url: 'https://example2.com', title: 'Source 2', snippet: 'Content 2' },
      ];

      const mockAnswer = {
        answer: 'This is the answer based on sources',
        sources: [
          { id: 1, url: 'https://example1.com', title: 'Source 1' },
          { id: 2, url: 'https://example2.com', title: 'Source 2' },
        ],
      };

      vi.spyOn(webAnalysisService, 'performWebSearch').mockResolvedValue(mockSearchResults);
      vi.spyOn(webAnalysisService, 'extractContent').mockResolvedValue({
        title: 'Test Title',
        content: 'Test content',
        excerpt: 'Test excerpt',
      });
      vi.spyOn(webAnalysisService.model, 'generateContent').mockResolvedValue({
        response: { text: () => JSON.stringify(mockAnswer) },
      });

      const result = await webAnalysisService.getAnswerFromWeb('test question');

      expect(result).toHaveProperty('answer', 'This is the answer based on sources');
      expect(result).toHaveProperty('sources');
      expect(result.sources).toHaveLength(2);
    });

    it('handles insufficient sources gracefully', async () => {
      const mockSearchResults = [];

      vi.spyOn(webAnalysisService, 'performWebSearch').mockResolvedValue(mockSearchResults);

      const result = await webAnalysisService.getAnswerFromWeb('test question');

      expect(result.answer).toContain('insufficient sources');
    });
  });

  describe('analyzeUrl', () => {
    it('analyzes URL with multiple perspectives', async () => {
      const mockContent = {
        title: 'Test Article',
        content: 'This is a test article about technology.',
        excerpt: 'Technology article excerpt',
      };

      vi.spyOn(webAnalysisService, 'extractContent').mockResolvedValue(mockContent);
      vi.spyOn(webAnalysisService, 'analyzeContent').mockResolvedValue({
        summary: 'Article summary',
        keywords: ['technology', 'test'],
        sentiment: { score: 0.5, label: 'neutral' },
      });

      const analysis = await webAnalysisService.analyzeUrl('https://example.com', [
        'summary',
        'keywords',
        'sentiment',
      ]);

      expect(analysis).toHaveProperty('summary');
      expect(analysis).toHaveProperty('keywords');
      expect(analysis).toHaveProperty('sentiment');
    });

    it('handles URL analysis errors gracefully', async () => {
      vi.spyOn(webAnalysisService, 'extractContent').mockRejectedValue(
        new Error('URL extraction failed')
      );

      await expect(webAnalysisService.analyzeUrl('https://invalid.com')).rejects.toThrow(
        'URL extraction failed'
      );
    });
  });

  describe('Performance', () => {
    it('completes search within reasonable time', async () => {
      const mockResults = [{ url: 'https://example.com', title: 'Example', snippet: 'Snippet' }];

      vi.spyOn(webAnalysisService, 'searchGoogle').mockResolvedValue(mockResults);

      const start = performance.now();
      await webAnalysisService.performWebSearch('test query');
      const end = performance.now();

      expect(end - start).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('handles concurrent requests efficiently', async () => {
      const mockResults = [{ url: 'https://example.com', title: 'Example', snippet: 'Snippet' }];

      vi.spyOn(webAnalysisService, 'searchGoogle').mockResolvedValue(mockResults);

      const start = performance.now();
      const promises = Array(5)
        .fill()
        .map(() => webAnalysisService.performWebSearch('test query'));
      await Promise.all(promises);
      const end = performance.now();

      expect(end - start).toBeLessThan(10000); // Should handle 5 concurrent requests within 10 seconds
    });
  });

  describe('Security', () => {
    it('validates URLs before processing', async () => {
      await expect(webAnalysisService.extractContent('invalid-url')).rejects.toThrow();
    });

    it('sanitizes user input', async () => {
      const maliciousQuery = '<script>alert("xss")</script>';

      vi.spyOn(webAnalysisService, 'searchGoogle').mockResolvedValue([]);

      await webAnalysisService.performWebSearch(maliciousQuery);

      // Should not execute the script
      expect(webAnalysisService.searchGoogle).toHaveBeenCalledWith(
        expect.not.stringContaining('<script>')
      );
    });
  });
});
