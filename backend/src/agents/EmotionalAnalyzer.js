/**
 * @fileoverview Emotional Analyzer for SAAAAS Platform
 * @description Advanced emotional intelligence analysis using multiple models and techniques
 * @author AMRIKYY AI Solutions
 * @version 2.0-emotional
 */

const EventEmitter = require('events');
const winston = require('winston');
const { ZaiClient } = require('../ai/zaiClient');

class EmotionalAnalyzer extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      model: config.model || 'gemini-2.5-pro',
      confidenceThreshold: config.confidenceThreshold || 0.7,
      empathyLevel: config.empathyLevel || 'high',
      sentimentAnalysisEnabled: config.sentimentAnalysisEnabled !== false,
      emotionalMemoryEnabled: config.emotionalMemoryEnabled !== false,
      ...config
    };
    
    this.agentId = 'emotional-analyzer';
    this.status = 'initializing';
    
    // Initialize AI client
    this.zaiClient = new ZaiClient();
    
    // Emotional state mappings
    this.emotionalStates = {
      'happy': { valence: 0.8, arousal: 0.6, dominance: 0.7 },
      'sad': { valence: -0.8, arousal: -0.3, dominance: -0.5 },
      'angry': { valence: -0.6, arousal: 0.8, dominance: 0.3 },
      'excited': { valence: 0.9, arousal: 0.9, dominance: 0.8 },
      'calm': { valence: 0.6, arousal: -0.2, dominance: 0.5 },
      'stressed': { valence: -0.4, arousal: 0.7, dominance: -0.2 },
      'frustrated': { valence: -0.5, arousal: 0.6, dominance: -0.1 },
      'content': { valence: 0.7, arousal: 0.2, dominance: 0.6 },
      'worried': { valence: -0.3, arousal: 0.5, dominance: -0.3 },
      'confident': { valence: 0.8, arousal: 0.4, dominance: 0.9 }
    };
    
    // Setup logger
    this.setupLogger();
    
    // Initialize analyzer
    this.initialize();
  }
  
  setupLogger() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { 
        service: 'emotional-analyzer',
        agentId: this.agentId 
      },
      transports: [
        new winston.transports.File({ filename: 'logs/emotional-analyzer.log' }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }
  
  async initialize() {
    try {
      this.logger.info('Initializing Emotional Analyzer...');
      
      // Initialize AI client
      await this.zaiClient.initialize();
      
      this.status = 'ready';
      this.logger.info('Emotional Analyzer initialized successfully');
      this.emit('initialized');
      
    } catch (error) {
      this.logger.error('Failed to initialize Emotional Analyzer', { error: error.message });
      this.status = 'error';
      this.emit('error', error);
    }
  }
  
  /**
   * Analyze emotional context from text and context
   * @param {string} text - Text to analyze
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Emotional analysis result
   */
  async analyze(text, context = {}) {
    try {
      const analysis = {
        text,
        context,
        timestamp: new Date().toISOString(),
        agentId: this.agentId
      };
      
      // Perform sentiment analysis
      if (this.config.sentimentAnalysisEnabled) {
        analysis.sentiment = await this.analyzeSentiment(text);
      }
      
      // Detect emotional state
      analysis.emotionalState = await this.detectEmotionalState(text, context);
      
      // Calculate emotional scores
      analysis.scores = this.calculateEmotionalScores(analysis.emotionalState);
      
      // Determine confidence level
      analysis.confidence = this.calculateConfidence(analysis);
      
      // Generate empathy score
      analysis.empathyScore = this.calculateEmpathyScore(analysis);
      
      // Extract emotional keywords
      analysis.keywords = this.extractEmotionalKeywords(text);
      
      // Determine communication style preference
      analysis.preferredStyle = this.determineCommunicationStyle(analysis);
      
      this.logger.info('Emotional analysis completed', {
        emotionalState: analysis.emotionalState,
        confidence: analysis.confidence,
        empathyScore: analysis.empathyScore
      });
      
      this.emit('analysisCompleted', analysis);
      return analysis;
      
    } catch (error) {
      this.logger.error('Failed to analyze emotional context', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Analyze sentiment using AI model
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} Sentiment analysis result
   */
  async analyzeSentiment(text) {
    try {
      const prompt = `
        Analyze the sentiment of the following text and provide a detailed analysis:
        
        Text: "${text}"
        
        Please provide:
        1. Overall sentiment (positive, negative, neutral)
        2. Sentiment intensity (0-1 scale)
        3. Emotional tone (professional, casual, frustrated, excited, etc.)
        4. Confidence level (0-1 scale)
        
        Respond in JSON format.
      `;
      
      const response = await this.zaiClient.chatCompletion(prompt, {
        model: this.config.model,
        temperature: 0.3,
        maxTokens: 500
      });
      
      const sentiment = JSON.parse(response.content);
      
      this.logger.debug('Sentiment analysis completed', { sentiment });
      return sentiment;
      
    } catch (error) {
      this.logger.error('Failed to analyze sentiment', { error: error.message });
      return {
        sentiment: 'neutral',
        intensity: 0.5,
        tone: 'professional',
        confidence: 0.5
      };
    }
  }
  
  /**
   * Detect emotional state from text and context
   * @param {string} text - Text to analyze
   * @param {Object} context - Additional context
   * @returns {Promise<string>} Detected emotional state
   */
  async detectEmotionalState(text, context = {}) {
    try {
      const prompt = `
        Analyze the emotional state of the user based on the following text and context:
        
        Text: "${text}"
        Context: ${JSON.stringify(context)}
        
        Determine the primary emotional state from these options:
        - happy: Positive, joyful, satisfied
        - sad: Negative, disappointed, down
        - angry: Frustrated, irritated, upset
        - excited: Enthusiastic, eager, motivated
        - calm: Peaceful, relaxed, composed
        - stressed: Anxious, overwhelmed, pressured
        - frustrated: Annoyed, blocked, struggling
        - content: Satisfied, peaceful, comfortable
        - worried: Concerned, anxious, uncertain
        - confident: Assured, self-assured, certain
        
        Respond with only the emotional state name.
      `;
      
      const response = await this.zaiClient.chatCompletion(prompt, {
        model: this.config.model,
        temperature: 0.2,
        maxTokens: 50
      });
      
      const emotionalState = response.content.trim().toLowerCase();
      
      // Validate emotional state
      if (this.emotionalStates[emotionalState]) {
        return emotionalState;
      } else {
        // Fallback to neutral state
        return 'calm';
      }
      
    } catch (error) {
      this.logger.error('Failed to detect emotional state', { error: error.message });
      return 'calm'; // Default to calm state
    }
  }
  
  /**
   * Calculate emotional scores based on detected state
   * @param {string} emotionalState - Detected emotional state
   * @returns {Object} Emotional scores
   */
  calculateEmotionalScores(emotionalState) {
    const stateData = this.emotionalStates[emotionalState] || this.emotionalStates['calm'];
    
    return {
      valence: stateData.valence, // Positive/negative emotion
      arousal: stateData.arousal, // High/low energy
      dominance: stateData.dominance, // Control/influence level
      emotionalState,
      score: this.calculateOverallScore(stateData)
    };
  }
  
  /**
   * Calculate overall emotional score
   * @param {Object} stateData - Emotional state data
   * @returns {number} Overall score (0-1)
   */
  calculateOverallScore(stateData) {
    // Normalize scores to 0-1 range
    const normalizedValence = (stateData.valence + 1) / 2;
    const normalizedArousal = (stateData.arousal + 1) / 2;
    const normalizedDominance = (stateData.dominance + 1) / 2;
    
    // Weighted average
    return (normalizedValence * 0.4) + (normalizedArousal * 0.3) + (normalizedDominance * 0.3);
  }
  
  /**
   * Calculate confidence level for analysis
   * @param {Object} analysis - Analysis result
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(analysis) {
    let confidence = 0.5; // Base confidence
    
    // Text length factor
    if (analysis.text.length > 50) confidence += 0.1;
    if (analysis.text.length > 100) confidence += 0.1;
    
    // Keyword presence factor
    if (analysis.keywords && analysis.keywords.length > 0) confidence += 0.1;
    
    // Context factor
    if (analysis.context && Object.keys(analysis.context).length > 0) confidence += 0.1;
    
    // Sentiment consistency factor
    if (analysis.sentiment && analysis.sentiment.confidence > 0.7) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }
  
  /**
   * Calculate empathy score based on analysis
   * @param {Object} analysis - Analysis result
   * @returns {number} Empathy score (0-1)
   */
  calculateEmpathyScore(analysis) {
    let empathyScore = 0.5; // Base empathy
    
    // Emotional state factor
    const emotionalState = analysis.emotionalState;
    if (['sad', 'stressed', 'worried', 'frustrated'].includes(emotionalState)) {
      empathyScore += 0.2; // Higher empathy for negative states
    } else if (['happy', 'excited', 'confident'].includes(emotionalState)) {
      empathyScore += 0.1; // Moderate empathy for positive states
    }
    
    // Confidence factor
    if (analysis.confidence > 0.8) empathyScore += 0.1;
    
    // Context awareness factor
    if (analysis.context && Object.keys(analysis.context).length > 0) empathyScore += 0.1;
    
    return Math.min(empathyScore, 1.0);
  }
  
  /**
   * Extract emotional keywords from text
   * @param {string} text - Text to analyze
   * @returns {Array} Extracted keywords
   */
  extractEmotionalKeywords(text) {
    const emotionalKeywords = {
      positive: ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'good', 'perfect', 'awesome'],
      negative: ['bad', 'terrible', 'awful', 'hate', 'dislike', 'wrong', 'error', 'problem', 'issue', 'fail'],
      urgent: ['urgent', 'asap', 'immediately', 'quickly', 'fast', 'emergency', 'critical', 'important'],
      uncertain: ['maybe', 'perhaps', 'possibly', 'might', 'could', 'unsure', 'uncertain', 'confused'],
      confident: ['sure', 'certain', 'definitely', 'absolutely', 'confident', 'know', 'understand'],
      frustrated: ['frustrated', 'annoyed', 'irritated', 'upset', 'angry', 'mad', 'bothered']
    };
    
    const keywords = [];
    const lowerText = text.toLowerCase();
    
    for (const [category, words] of Object.entries(emotionalKeywords)) {
      for (const word of words) {
        if (lowerText.includes(word)) {
          keywords.push({ word, category });
        }
      }
    }
    
    return keywords;
  }
  
  /**
   * Determine preferred communication style based on analysis
   * @param {Object} analysis - Analysis result
   * @returns {string} Preferred communication style
   */
  determineCommunicationStyle(analysis) {
    const emotionalState = analysis.emotionalState;
    const scores = analysis.scores;
    
    // High arousal states prefer direct communication
    if (scores.arousal > 0.6) {
      return 'direct';
    }
    
    // Low arousal states prefer gentle communication
    if (scores.arousal < -0.2) {
      return 'gentle';
    }
    
    // High dominance states prefer authoritative communication
    if (scores.dominance > 0.6) {
      return 'authoritative';
    }
    
    // Low dominance states prefer supportive communication
    if (scores.dominance < -0.2) {
      return 'supportive';
    }
    
    // Default to professional
    return 'professional';
  }
  
  /**
   * Generate empathetic response based on analysis
   * @param {Object} analysis - Emotional analysis
   * @param {string} responseType - Type of response needed
   * @returns {Promise<string>} Empathetic response
   */
  async generateEmpatheticResponse(analysis, responseType = 'general') {
    try {
      const prompt = `
        Generate an empathetic response based on the following emotional analysis:
        
        Emotional State: ${analysis.emotionalState}
        Confidence: ${analysis.confidence}
        Empathy Score: ${analysis.empathyScore}
        Preferred Style: ${analysis.preferredStyle}
        Response Type: ${responseType}
        
        Create a response that:
        1. Acknowledges the user's emotional state
        2. Shows understanding and empathy
        3. Uses the preferred communication style
        4. Maintains professionalism
        5. Provides appropriate support
        
        Keep the response concise but warm.
      `;
      
      const response = await this.zaiClient.chatCompletion(prompt, {
        model: this.config.model,
        temperature: 0.7,
        maxTokens: 200
      });
      
      return response.content;
      
    } catch (error) {
      this.logger.error('Failed to generate empathetic response', { error: error.message });
      return "I understand how you're feeling. Let me help you with that.";
    }
  }
  
  /**
   * Analyze emotional patterns over time
   * @param {Array} historicalAnalyses - Historical emotional analyses
   * @returns {Object} Pattern analysis result
   */
  analyzeEmotionalPatterns(historicalAnalyses) {
    const patterns = {
      dominantStates: {},
      averageScores: { valence: 0, arousal: 0, dominance: 0 },
      trends: {},
      recommendations: []
    };
    
    // Count dominant emotional states
    for (const analysis of historicalAnalyses) {
      const state = analysis.emotionalState;
      patterns.dominantStates[state] = (patterns.dominantStates[state] || 0) + 1;
    }
    
    // Calculate average scores
    const totalAnalyses = historicalAnalyses.length;
    for (const analysis of historicalAnalyses) {
      patterns.averageScores.valence += analysis.scores.valence;
      patterns.averageScores.arousal += analysis.scores.arousal;
      patterns.averageScores.dominance += analysis.scores.dominance;
    }
    
    patterns.averageScores.valence /= totalAnalyses;
    patterns.averageScores.arousal /= totalAnalyses;
    patterns.averageScores.dominance /= totalAnalyses;
    
    // Generate recommendations based on patterns
    if (patterns.averageScores.valence < -0.3) {
      patterns.recommendations.push('Consider providing more positive reinforcement');
    }
    
    if (patterns.averageScores.arousal > 0.5) {
      patterns.recommendations.push('User may benefit from calming communication style');
    }
    
    if (patterns.averageScores.dominance < -0.3) {
      patterns.recommendations.push('Provide more supportive and encouraging responses');
    }
    
    return patterns;
  }
  
  /**
   * Get analyzer status
   * @returns {Object} Analyzer status
   */
  getStatus() {
    return {
      status: this.status,
      agentId: this.agentId,
      config: this.config,
      emotionalStates: Object.keys(this.emotionalStates).length
    };
  }
  
  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    try {
      this.logger.info('Shutting down Emotional Analyzer...');
      this.status = 'shutdown';
      this.logger.info('Emotional Analyzer shutdown complete');
    } catch (error) {
      this.logger.error('Error during shutdown', { error: error.message });
    }
  }
}

module.exports = EmotionalAnalyzer;
