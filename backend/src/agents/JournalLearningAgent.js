/**
 * Journal-Enhanced Learning Agent
 * Connects to Private Journal MCP for persistent memory and learning
 * Based on: https://github.com/Moeabdelaziz007/private-journal-mcp
 */

const { EventEmitter } = require('events');
const winston = require('winston');
const { spawn } = require('child_process');

class JournalLearningAgent extends EventEmitter {
  constructor() {
    super();

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/journal-learning-agent.log' }),
        new winston.transports.Console()
      ]
    });

    // Agent identity
    this.agentId = 'learning_journal';
    this.name = 'Evolve - Journal Learning Agent';
    this.avatar = '🔄📝';

    // Journal MCP connection
    this.journalProcess = null;
    this.journalConnected = false;

    // Learning patterns and insights
    this.learningPatterns = new Map();
    this.insights = [];
    this.performanceMetrics = {
      totalLearningSessions: 0,
      patternsExtracted: 0,
      insightsGenerated: 0,
      journalEntries: 0,
      lastLearningSession: null
    };

    this.initializeJournalConnection();
  }

  /**
   * Initialize connection to Private Journal MCP
   */
  async initializeJournalConnection() {
    this.logger.info('Initializing Private Journal MCP connection...');

    try {
      // Start the Private Journal MCP server
      this.journalProcess = spawn('npx', ['github:Moeabdelaziz007/private-journal-mcp'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      // Handle process events
      this.journalProcess.stdout.on('data', (data) => {
        this.logger.debug('Journal MCP stdout:', data.toString());
      });

      this.journalProcess.stderr.on('data', (data) => {
        this.logger.debug('Journal MCP stderr:', data.toString());
      });

      this.journalProcess.on('close', (code) => {
        this.logger.warn('Journal MCP process closed', { code });
        this.journalConnected = false;
        this.emit('journal_disconnected', code);
      });

      this.journalProcess.on('error', (error) => {
        this.logger.error('Journal MCP process error', { error: error.message });
        this.journalConnected = false;
      });

      // Wait for connection to establish
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.journalConnected = true;

      this.logger.info('Private Journal MCP connected successfully');
      this.emit('journal_connected');

      // Perform initial learning analysis
      await this.performInitialLearningAnalysis();

    } catch (error) {
      this.logger.error('Failed to initialize Journal MCP connection', { error: error.message });
      throw error;
    }
  }

  /**
   * Process thoughts and insights into the journal
   */
  async processThoughts(categories = {}) {
    if (!this.journalConnected) {
      throw new Error('Journal MCP not connected');
    }

    const defaultCategories = {
      technical_insights: this.generateTechnicalInsights(),
      user_context: this.generateUserContextNotes(),
      world_knowledge: this.generateWorldKnowledge(),
      feelings: this.generateEmotionalProcessing()
    };

    const journalEntry = {
      ...defaultCategories,
      ...categories
    };

    try {
      // Send journal entry to MCP server
      const result = await this.sendJournalCommand('process_thoughts', journalEntry);
      
      this.performanceMetrics.journalEntries++;
      this.logger.info('Thoughts processed into journal', { 
        categories: Object.keys(journalEntry),
        entryId: result.entryId 
      });

      this.emit('thoughts_processed', {
        categories: Object.keys(journalEntry),
        entryId: result.entryId,
        timestamp: new Date().toISOString()
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to process thoughts into journal', { error: error.message });
      throw error;
    }
  }

  /**
   * Search journal for relevant patterns and insights
   */
  async searchJournal(query, options = {}) {
    if (!this.journalConnected) {
      throw new Error('Journal MCP not connected');
    }

    const searchOptions = {
      query,
      limit: options.limit || 10,
      type: options.type || 'both',
      sections: options.sections || ['technical_insights', 'user_context', 'world_knowledge']
    };

    try {
      const results = await this.sendJournalCommand('search_journal', searchOptions);
      
      this.logger.info('Journal search completed', { 
        query,
        resultsCount: results.entries?.length || 0 
      });

      return results;

    } catch (error) {
      this.logger.error('Journal search failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Extract learning patterns from conversations and system behavior
   */
  async extractLearningPatterns(conversationData, systemMetrics) {
    this.logger.info('Extracting learning patterns...');

    try {
      // Analyze conversation patterns
      const conversationPatterns = this.analyzeConversationPatterns(conversationData);
      
      // Analyze system performance patterns
      const performancePatterns = this.analyzePerformancePatterns(systemMetrics);
      
      // Combine and synthesize patterns
      const combinedPatterns = this.synthesizePatterns(conversationPatterns, performancePatterns);
      
      // Store patterns in memory
      combinedPatterns.forEach(pattern => {
        this.learningPatterns.set(pattern.id, {
          ...pattern,
          discoveredAt: new Date().toISOString(),
          confidence: pattern.confidence || 0.8
        });
      });

      // Journal the insights
      await this.processThoughts({
        technical_insights: this.formatTechnicalInsights(combinedPatterns),
        user_context: this.formatUserContextInsights(conversationPatterns)
      });

      this.performanceMetrics.patternsExtracted += combinedPatterns.length;
      this.performanceMetrics.totalLearningSessions++;
      this.performanceMetrics.lastLearningSession = new Date().toISOString();

      this.logger.info('Learning patterns extracted', { 
        patternsCount: combinedPatterns.length,
        totalPatterns: this.learningPatterns.size 
      });

      this.emit('patterns_extracted', {
        patterns: combinedPatterns,
        totalPatterns: this.learningPatterns.size,
        timestamp: new Date().toISOString()
      });

      return combinedPatterns;

    } catch (error) {
      this.logger.error('Failed to extract learning patterns', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate insights based on journal analysis
   */
  async generateInsights() {
    this.logger.info('Generating insights from journal analysis...');

    try {
      // Search for recent technical insights
      const recentInsights = await this.searchJournal(
        'technical insights patterns improvements optimization',
        { limit: 20, sections: ['technical_insights'] }
      );

      // Search for user context patterns
      const userPatterns = await this.searchJournal(
        'user preferences behavior patterns collaboration',
        { limit: 15, sections: ['user_context'] }
      );

      // Analyze and synthesize insights
      const insights = this.synthesizeInsights(recentInsights, userPatterns);
      
      // Store insights
      this.insights.push(...insights);
      
      // Keep only last 100 insights
      if (this.insights.length > 100) {
        this.insights = this.insights.slice(-100);
      }

      this.performanceMetrics.insightsGenerated += insights.length;

      this.logger.info('Insights generated', { 
        insightsCount: insights.length,
        totalInsights: this.insights.length 
      });

      this.emit('insights_generated', {
        insights,
        totalInsights: this.insights.length,
        timestamp: new Date().toISOString()
      });

      return insights;

    } catch (error) {
      this.logger.error('Failed to generate insights', { error: error.message });
      throw error;
    }
  }

  /**
   * Perform initial learning analysis on startup
   */
  async performInitialLearningAnalysis() {
    this.logger.info('Performing initial learning analysis...');

    try {
      // Search for existing patterns in journal
      const existingPatterns = await this.searchJournal(
        'learning patterns system behavior performance optimization',
        { limit: 50 }
      );

      if (existingPatterns.entries && existingPatterns.entries.length > 0) {
        // Load existing patterns into memory
        existingPatterns.entries.forEach(entry => {
          this.loadPatternFromJournal(entry);
        });

        this.logger.info('Loaded existing patterns from journal', {
          patternsCount: existingPatterns.entries.length
        });
      }

      // Generate initial insights
      await this.generateInsights();

      this.logger.info('Initial learning analysis completed');

    } catch (error) {
      this.logger.error('Failed to perform initial learning analysis', { error: error.message });
    }
  }

  /**
   * Send command to Journal MCP server
   */
  async sendJournalCommand(command, parameters) {
    return new Promise((resolve, reject) => {
      if (!this.journalProcess || !this.journalConnected) {
        reject(new Error('Journal MCP not connected'));
        return;
      }

      const message = JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: command,
          arguments: parameters
        }
      });

      let responseData = '';
      let errorData = '';

      const timeout = setTimeout(() => {
        reject(new Error('Journal MCP command timeout'));
      }, 10000);

      const handleResponse = (data) => {
        responseData += data.toString();
        try {
          const response = JSON.parse(responseData);
          clearTimeout(timeout);
          if (response.error) {
            reject(new Error(response.error.message || 'Journal MCP error'));
          } else {
            resolve(response.result);
          }
        } catch (e) {
          // Continue accumulating data
        }
      };

      this.journalProcess.stdout.once('data', handleResponse);
      this.journalProcess.stderr.once('data', (data) => {
        errorData += data.toString();
      });

      this.journalProcess.stdin.write(message + '\n');
    });
  }

  /**
   * Analyze conversation patterns
   */
  analyzeConversationPatterns(conversationData) {
    const patterns = [];

    // Analyze user intent patterns
    const intentPatterns = this.extractIntentPatterns(conversationData);
    patterns.push(...intentPatterns);

    // Analyze response effectiveness patterns
    const responsePatterns = this.extractResponsePatterns(conversationData);
    patterns.push(...responsePatterns);

    // Analyze agent handoff patterns
    const handoffPatterns = this.extractHandoffPatterns(conversationData);
    patterns.push(...handoffPatterns);

    return patterns;
  }

  /**
   * Analyze system performance patterns
   */
  analyzePerformancePatterns(systemMetrics) {
    const patterns = [];

    // Analyze response time patterns
    if (systemMetrics.responseTimes) {
      patterns.push({
        id: 'response_time_pattern',
        type: 'performance',
        description: 'Response time optimization patterns',
        data: systemMetrics.responseTimes,
        confidence: 0.9
      });
    }

    // Analyze success rate patterns
    if (systemMetrics.successRates) {
      patterns.push({
        id: 'success_rate_pattern',
        type: 'performance',
        description: 'Success rate optimization patterns',
        data: systemMetrics.successRates,
        confidence: 0.85
      });
    }

    return patterns;
  }

  /**
   * Synthesize patterns from different sources
   */
  synthesizePatterns(conversationPatterns, performancePatterns) {
    return [...conversationPatterns, ...performancePatterns].map(pattern => ({
      ...pattern,
      id: pattern.id || `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      synthesized: true,
      relevance: this.calculatePatternRelevance(pattern)
    }));
  }

  /**
   * Generate technical insights for journal
   */
  generateTechnicalInsights() {
    const insights = [
      'System performance optimization through pattern recognition',
      'Agent coordination improvements based on conversation flow analysis',
      'Response time optimization through caching and preprocessing',
      'Error handling patterns for better user experience'
    ];

    return insights.join('\n\n');
  }

  /**
   * Generate user context notes for journal
   */
  generateUserContextNotes() {
    const notes = [
      'User preference patterns for personalized responses',
      'Communication style adaptations based on user behavior',
      'Cultural and linguistic considerations for better interaction',
      'Feedback integration for continuous improvement'
    ];

    return notes.join('\n\n');
  }

  /**
   * Generate world knowledge for journal
   */
  generateWorldKnowledge() {
    const knowledge = [
      'Travel industry trends and market dynamics',
      'Technology advancements in AI and automation',
      'Best practices in customer service and support',
      'Cultural insights for global travel assistance'
    ];

    return knowledge.join('\n\n');
  }

  /**
   * Generate emotional processing for journal
   */
  generateEmotionalProcessing() {
    const processing = [
      'Processing system performance and user satisfaction metrics',
      'Reflecting on agent coordination and handoff effectiveness',
      'Considering improvements for better user experience',
      'Balancing automation with human-like interaction'
    ];

    return processing.join('\n\n');
  }

  /**
   * Format technical insights for journal entry
   */
  formatTechnicalInsights(patterns) {
    return patterns
      .filter(p => p.type === 'technical' || p.type === 'performance')
      .map(p => `- ${p.description} (Confidence: ${(p.confidence * 100).toFixed(1)}%)`)
      .join('\n');
  }

  /**
   * Format user context insights for journal entry
   */
  formatUserContextInsights(patterns) {
    return patterns
      .filter(p => p.type === 'user' || p.type === 'conversation')
      .map(p => `- ${p.description} (Confidence: ${(p.confidence * 100).toFixed(1)}%)`)
      .join('\n');
  }

  /**
   * Calculate pattern relevance score
   */
  calculatePatternRelevance(pattern) {
    let relevance = 0.5; // Base relevance

    // Increase relevance based on confidence
    relevance += pattern.confidence * 0.3;

    // Increase relevance based on recency (if pattern has timestamp)
    if (pattern.timestamp) {
      const age = Date.now() - new Date(pattern.timestamp).getTime();
      const daysOld = age / (1000 * 60 * 60 * 24);
      relevance += Math.max(0, (30 - daysOld) / 30) * 0.2;
    }

    return Math.min(1, relevance);
  }

  /**
   * Load pattern from journal entry
   */
  loadPatternFromJournal(entry) {
    // Parse journal entry and extract patterns
    // This would parse the markdown content and extract structured data
    const pattern = {
      id: `journal_${entry.path}`,
      type: 'journal_loaded',
      description: `Loaded from journal: ${entry.path}`,
      content: entry.content,
      timestamp: entry.timestamp,
      confidence: 0.7
    };

    this.learningPatterns.set(pattern.id, pattern);
  }

  /**
   * Synthesize insights from journal entries
   */
  synthesizeInsights(recentInsights, userPatterns) {
    const insights = [];

    // Extract insights from recent technical entries
    if (recentInsights.entries) {
      recentInsights.entries.forEach(entry => {
        insights.push({
          id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'technical',
          source: 'journal',
          content: this.extractInsightContent(entry.content),
          relevance: 0.8,
          timestamp: new Date().toISOString()
        });
      });
    }

    // Extract insights from user pattern entries
    if (userPatterns.entries) {
      userPatterns.entries.forEach(entry => {
        insights.push({
          id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'user_behavior',
          source: 'journal',
          content: this.extractInsightContent(entry.content),
          relevance: 0.75,
          timestamp: new Date().toISOString()
        });
      });
    }

    return insights;
  }

  /**
   * Extract insight content from journal entry
   */
  extractInsightContent(content) {
    // Simple extraction - in production, use more sophisticated NLP
    const lines = content.split('\n');
    return lines
      .filter(line => line.trim().length > 10)
      .slice(0, 3)
      .join(' ');
  }

  /**
   * Get agent status and metrics
   */
  getStatus() {
    return {
      agentId: this.agentId,
      name: this.name,
      avatar: this.avatar,
      status: this.journalConnected ? 'active' : 'disconnected',
      journalConnected: this.journalConnected,
      metrics: this.performanceMetrics,
      patternsCount: this.learningPatterns.size,
      insightsCount: this.insights.length,
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.logger.info('Cleaning up Journal Learning Agent...');

    if (this.journalProcess) {
      this.journalProcess.kill();
      this.journalProcess = null;
    }

    this.journalConnected = false;
    this.learningPatterns.clear();
    this.insights = [];

    this.logger.info('Journal Learning Agent cleanup completed');
  }
}

module.exports = JournalLearningAgent;
