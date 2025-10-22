/**
 * NotebookLM Integration Service
 * 
 * Features:
 * - Research-based content generation
 * - Document ingestion (PDFs, URLs, text)
 * - Fact-checking and verification
 * - Source citation
 * - Multi-document synthesis
 * 
 * Use Cases:
 * - Educational content
 * - News analysis
 * - Technical tutorials
 * - Documentary scripts
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');

class NotebookLMService {
  constructor() {
    // Initialize Gemini (NotebookLM uses Gemini under the hood)
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });
    
    // Storage for notebooks and sources
    this.notebooks = new Map();
    this.sources = new Map();
    
    logger.info('📚 NotebookLM Service initialized');
  }

  // ============================================================================
  // NOTEBOOK MANAGEMENT
  // ============================================================================

  /**
   * Create a new notebook with sources
   */
  async createNotebook(params) {
    const {
      title,
      description,
      sources = [], // Array of { type, content, url }
      topic
    } = params;

    const notebookId = this.generateId();
    
    // Process and store sources
    const processedSources = [];
    for (const source of sources) {
      const processedSource = await this.processSource(source);
      processedSources.push(processedSource);
      this.sources.set(processedSource.id, processedSource);
    }

    const notebook = {
      id: notebookId,
      title,
      description,
      topic,
      sources: processedSources,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.notebooks.set(notebookId, notebook);
    
    logger.info(`📓 Created notebook: ${title} (${notebookId})`);
    
    return notebook;
  }

  /**
   * Process a source (PDF, URL, text)
   */
  async processSource(source) {
    const sourceId = this.generateId();
    
    let content = '';
    let metadata = {};

    switch (source.type) {
      case 'url':
        content = await this.fetchUrlContent(source.url);
        metadata = { url: source.url, type: 'web' };
        break;
        
      case 'pdf':
        content = await this.extractPdfText(source.path);
        metadata = { path: source.path, type: 'pdf' };
        break;
        
      case 'text':
        content = source.content;
        metadata = { type: 'text' };
        break;
        
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }

    // Extract key information using Gemini
    const analysis = await this.analyzeSource(content);

    return {
      id: sourceId,
      type: source.type,
      content,
      metadata,
      analysis,
      processedAt: new Date().toISOString()
    };
  }

  /**
   * Analyze source content
   */
  async analyzeSource(content) {
    const prompt = `
Analyze this source document and extract:
1. Main topics (list of 3-5 topics)
2. Key facts (list of important facts)
3. Statistics (any numbers, dates, percentages)
4. Quotes (notable quotes)
5. Summary (2-3 sentence summary)

Return as JSON:
{
  "topics": ["topic1", "topic2", ...],
  "facts": ["fact1", "fact2", ...],
  "statistics": ["stat1", "stat2", ...],
  "quotes": ["quote1", "quote2", ...],
  "summary": "..."
}

Source content:
${content.substring(0, 10000)} // First 10K chars
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      return JSON.parse(response);
    } catch (error) {
      logger.error('Failed to parse source analysis:', error);
      return {
        topics: [],
        facts: [],
        statistics: [],
        quotes: [],
        summary: 'Analysis failed'
      };
    }
  }

  // ============================================================================
  // CONTENT GENERATION
  // ============================================================================

  /**
   * Generate research-based script
   */
  async generateResearchedScript(params) {
    const {
      notebookId,
      topic,
      duration = 60,
      tone = 'educational',
      targetAudience = 'general',
      includeCitations = true
    } = params;

    const notebook = this.notebooks.get(notebookId);
    if (!notebook) {
      throw new Error(`Notebook not found: ${notebookId}`);
    }

    // Compile all source content
    const sourceContext = this.compileSourceContext(notebook);

    const prompt = `
You are a professional scriptwriter creating research-based content.

Topic: ${topic}
Duration: ${duration} seconds
Tone: ${tone}
Audience: ${targetAudience}

Research Sources:
${sourceContext}

Create a YouTube video script that:
1. Opens with a strong hook (first 5 seconds)
2. Presents information backed by research
3. Uses facts and statistics from sources
4. ${includeCitations ? 'Includes source citations' : 'Flows naturally without citations'}
5. Ends with a clear call-to-action

Return as JSON:
{
  "title": "Engaging title",
  "description": "SEO-optimized description",
  "hashtags": ["#tag1", "#tag2", ...],
  "scenes": [
    {
      "scene": 1,
      "narration": "Script text...",
      "visualPrompt": "What to show on screen",
      "duration": 5,
      "sources": ["source1", "source2"] // if citations enabled
    }
  ],
  "totalDuration": ${duration},
  "wordCount": 150,
  "citations": [
    {
      "source": "Source name",
      "fact": "Fact cited",
      "timestamp": "0:15"
    }
  ]
}
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      const script = JSON.parse(response);
      
      logger.info(`📝 Generated researched script: ${script.title}`);
      
      return script;
    } catch (error) {
      logger.error('Failed to parse script:', error);
      throw new Error('Script generation failed');
    }
  }

  /**
   * Compile source context for prompts
   */
  compileSourceContext(notebook) {
    let context = '';
    
    for (const source of notebook.sources) {
      context += `\n\n--- Source ${source.id} ---\n`;
      context += `Type: ${source.type}\n`;
      context += `Summary: ${source.analysis.summary}\n`;
      context += `Key Facts:\n`;
      source.analysis.facts.forEach((fact, i) => {
        context += `  ${i + 1}. ${fact}\n`;
      });
      if (source.analysis.statistics.length > 0) {
        context += `Statistics:\n`;
        source.analysis.statistics.forEach((stat, i) => {
          context += `  ${i + 1}. ${stat}\n`;
        });
      }
    }
    
    return context;
  }

  // ============================================================================
  // FACT CHECKING
  // ============================================================================

  /**
   * Fact-check a script against sources
   */
  async factCheck(params) {
    const {
      notebookId,
      script
    } = params;

    const notebook = this.notebooks.get(notebookId);
    if (!notebook) {
      throw new Error(`Notebook not found: ${notebookId}`);
    }

    const sourceContext = this.compileSourceContext(notebook);

    const prompt = `
You are a fact-checker. Verify the claims in this script against the provided sources.

Script:
${JSON.stringify(script)}

Sources:
${sourceContext}

For each claim in the script, determine:
1. Is it supported by sources? (true/false)
2. Confidence level (0-100%)
3. Supporting source (if any)
4. Suggested correction (if needed)

Return as JSON:
{
  "overallAccuracy": 95,
  "claims": [
    {
      "claim": "The claim text",
      "verified": true,
      "confidence": 95,
      "source": "Source ID",
      "correction": null
    }
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ]
}
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      const factCheck = JSON.parse(response);
      
      logger.info(`✅ Fact-check complete: ${factCheck.overallAccuracy}% accuracy`);
      
      return factCheck;
    } catch (error) {
      logger.error('Failed to parse fact-check:', error);
      throw new Error('Fact-checking failed');
    }
  }

  // ============================================================================
  // RESEARCH QUERIES
  // ============================================================================

  /**
   * Query notebook sources
   */
  async queryNotebook(params) {
    const {
      notebookId,
      question
    } = params;

    const notebook = this.notebooks.get(notebookId);
    if (!notebook) {
      throw new Error(`Notebook not found: ${notebookId}`);
    }

    const sourceContext = this.compileSourceContext(notebook);

    const prompt = `
Answer this question based ONLY on the provided sources.

Question: ${question}

Sources:
${sourceContext}

Provide:
1. Direct answer
2. Supporting evidence from sources
3. Source citations
4. Confidence level (0-100%)

Return as JSON:
{
  "answer": "Direct answer to question",
  "evidence": ["Evidence 1", "Evidence 2"],
  "sources": ["Source ID 1", "Source ID 2"],
  "confidence": 95
}
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      return JSON.parse(response);
    } catch (error) {
      logger.error('Failed to parse query response:', error);
      throw new Error('Query failed');
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Fetch content from URL
   */
  async fetchUrlContent(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NotebookLMBot/1.0)'
        },
        timeout: 10000
      });
      
      // Extract text from HTML (basic implementation)
      const text = response.data.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      return text;
    } catch (error) {
      logger.error(`Failed to fetch URL ${url}:`, error);
      throw new Error(`Failed to fetch URL: ${url}`);
    }
  }

  /**
   * Extract text from PDF
   */
  async extractPdfText(pdfPath) {
    // Note: Requires pdf-parse package
    // npm install pdf-parse
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = await fs.readFile(pdfPath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      logger.error(`Failed to extract PDF ${pdfPath}:`, error);
      throw new Error(`Failed to extract PDF: ${pdfPath}`);
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `nb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get notebook by ID
   */
  getNotebook(notebookId) {
    return this.notebooks.get(notebookId);
  }

  /**
   * List all notebooks
   */
  listNotebooks() {
    return Array.from(this.notebooks.values());
  }

  /**
   * Delete notebook
   */
  deleteNotebook(notebookId) {
    const notebook = this.notebooks.get(notebookId);
    if (notebook) {
      // Delete associated sources
      for (const source of notebook.sources) {
        this.sources.delete(source.id);
      }
      this.notebooks.delete(notebookId);
      logger.info(`🗑️ Deleted notebook: ${notebookId}`);
      return true;
    }
    return false;
  }

  /**
   * Add source to existing notebook
   */
  async addSource(notebookId, source) {
    const notebook = this.notebooks.get(notebookId);
    if (!notebook) {
      throw new Error(`Notebook not found: ${notebookId}`);
    }

    const processedSource = await this.processSource(source);
    notebook.sources.push(processedSource);
    notebook.updatedAt = new Date().toISOString();
    
    this.sources.set(processedSource.id, processedSource);
    
    logger.info(`📎 Added source to notebook ${notebookId}`);
    
    return processedSource;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      service: 'notebooklm',
      version: '1.0.0',
      status: 'active',
      notebooks: this.notebooks.size,
      sources: this.sources.size,
      features: {
        documentIngestion: true,
        factChecking: true,
        researchGeneration: true,
        sourceAnalysis: true,
        queryAnswering: true
      }
    };
  }
}

module.exports = new NotebookLMService();
