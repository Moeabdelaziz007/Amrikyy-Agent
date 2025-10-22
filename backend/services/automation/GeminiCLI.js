/**
 * Gemini CLI Integration Service
 * Provides interface to Gemini 2.5 Pro via CLI and SDK
 * Enhanced for QuantumOS mini-apps integration
 */

const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../utils/logger');

class GeminiCLI {
  constructor() {
    // Initialize SDK for advanced features
    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.1, // Low temperature for consistent extraction
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        }
      });
      logger.info('Gemini SDK initialized for QuantumOS integration');
    } else {
      logger.warn('GEMINI_API_KEY not found, CLI-only mode');
    }
    
    // QuantumOS specific configurations
    this.quantumOSConfig = {
      miniApps: {
        'ai-maps': {
          capabilities: ['location_analysis', 'route_optimization', 'traffic_prediction'],
          model: 'gemini-2.0-flash-exp'
        },
        'ai-studio': {
          capabilities: ['video_analysis', 'scene_detection', 'auto_editing'],
          model: 'gemini-2.0-flash-exp'
        },
        'ai-gallery': {
          capabilities: ['image_recognition', 'auto_tagging', 'face_detection'],
          model: 'gemini-2.0-flash-exp'
        },
        'ai-travel': {
          capabilities: ['trip_planning', 'budget_optimization', 'cultural_insights'],
          model: 'gemini-2.0-flash-exp'
        },
        'ai-market': {
          capabilities: ['price_analysis', 'trend_prediction', 'market_insights'],
          model: 'gemini-2.0-flash-exp'
        },
        'agents-kit': {
          capabilities: ['agent_coordination', 'workflow_optimization', 'performance_analysis'],
          model: 'gemini-2.0-flash-exp'
        },
        'mcp-kit': {
          capabilities: ['protocol_optimization', 'context_management', 'tool_integration'],
          model: 'gemini-2.0-flash-exp'
        }
      }
    };
  }

  /**
   * Extract structured data from text using CLI
   * @param {string} text - Input text to analyze
   * @param {string} prompt - Extraction instructions
   * @returns {Promise<Object>} Parsed JSON response
   */
  static async extractCLI(text, prompt) {
    try {
      // Escape text for shell
      const escapedText = text.replace(/"/g, '\\"').replace(/\n/g, ' ');
      const escapedPrompt = prompt.replace(/"/g, '\\"');

      const command = `echo "${escapedText}" | gemini --format json "${escapedPrompt}"`;
      
      logger.debug('Executing Gemini CLI command', { 
        textLength: text.length,
        promptLength: prompt.length 
      });

      const result = execSync(command, { 
        encoding: 'utf-8',
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024 // 1MB buffer
      });

      // Parse JSON response
      const parsed = JSON.parse(result.trim());
      
      logger.info('Gemini CLI extraction successful', {
        outputSize: result.length
      });

      return parsed;

    } catch (error) {
      logger.error('Gemini CLI extraction failed', {
        error: error.message,
        stderr: error.stderr?.toString()
      });

      // Fallback to SDK if CLI fails
      if (this.model) {
        logger.info('Falling back to Gemini SDK');
        return await this.extractSDK(text, prompt);
      }

      throw new Error(`Gemini CLI failed: ${error.message}`);
    }
  }

  /**
   * Extract structured data using SDK
   * @param {string} text - Input text to analyze
   * @param {string} prompt - Extraction instructions
   * @returns {Promise<Object>} Parsed JSON response
   */
  async extractSDK(text, prompt) {
    try {
      const fullPrompt = `${prompt}

Input text:
${text}

CRITICAL: Output MUST be valid JSON only. No markdown, no explanations, no additional text.`;

      logger.debug('Executing Gemini SDK request', {
        textLength: text.length,
        promptLength: fullPrompt.length
      });

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      let jsonText = response.text().trim();

      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Parse JSON
      const parsed = JSON.parse(jsonText);

      logger.info('Gemini SDK extraction successful');

      return parsed;

    } catch (error) {
      logger.error('Gemini SDK extraction failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Analyze data with Gemini
   * @param {Object} data - Data to analyze
   * @param {string} prompt - Analysis instructions
   * @returns {Promise<Object>} Analysis result
   */
  async analyze(data, prompt) {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      
      const fullPrompt = `${prompt}

Data to analyze:
${jsonData}

Output ONLY valid JSON.`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      let jsonText = response.text().trim();

      // Clean up response
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      return JSON.parse(jsonText);

    } catch (error) {
      logger.error('Gemini analysis failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Analyze image with Gemini
   * @param {Buffer} imageBuffer - Image data
   * @param {string} prompt - Analysis instructions
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeImage(imageBuffer, prompt) {
    try {
      if (!this.model) {
        throw new Error('Gemini SDK not initialized');
      }

      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: 'image/jpeg'
        }
      };

      const fullPrompt = `${prompt}

Output ONLY valid JSON.`;

      const result = await this.model.generateContent([fullPrompt, imagePart]);
      const response = await result.response;
      let jsonText = response.text().trim();

      // Clean up response
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      return JSON.parse(jsonText);

    } catch (error) {
      logger.error('Gemini image analysis failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate content with Gemini
   * @param {string} prompt - Generation instructions
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated content
   */
  async generate(prompt, options = {}) {
    try {
      if (!this.model) {
        throw new Error('Gemini SDK not initialized');
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      logger.info('Gemini content generation successful', {
        outputLength: text.length
      });

      return text;

    } catch (error) {
      logger.error('Gemini content generation failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Process QuantumOS mini-app request
   * @param {string} miniAppId - Mini-app identifier
   * @param {string} action - Action to perform
   * @param {Object} data - Input data
   * @returns {Promise<Object>} Processed result
   */
  async processMiniAppRequest(miniAppId, action, data) {
    try {
      const config = this.quantumOSConfig.miniApps[miniAppId];
      if (!config) {
        throw new Error(`Unknown mini-app: ${miniAppId}`);
      }

      const prompt = this.buildMiniAppPrompt(miniAppId, action, data);
      
      logger.info('Processing QuantumOS mini-app request', {
        miniAppId,
        action,
        dataSize: JSON.stringify(data).length
      });

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let jsonText = response.text().trim();

      // Clean up response
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const parsed = JSON.parse(jsonText);

      logger.info('QuantumOS mini-app request processed successfully', {
        miniAppId,
        action,
        resultSize: JSON.stringify(parsed).length
      });

      return parsed;

    } catch (error) {
      logger.error('QuantumOS mini-app request failed', {
        miniAppId,
        action,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Build mini-app specific prompt
   * @param {string} miniAppId - Mini-app identifier
   * @param {string} action - Action to perform
   * @param {Object} data - Input data
   * @returns {string} Formatted prompt
   */
  buildMiniAppPrompt(miniAppId, action, data) {
    const config = this.quantumOSConfig.miniApps[miniAppId];
    
    const prompts = {
      'ai-maps': {
        'location_analysis': `Analyze the location data: ${JSON.stringify(data)}. Provide insights about:
        - Nearby attractions and their ratings
        - Traffic patterns and optimal visit times
        - Weather conditions and recommendations
        - Local events and activities
        - Safety considerations
        Return as JSON with structured recommendations.`,
        
        'route_optimization': `Optimize the route with data: ${JSON.stringify(data)}. Consider:
        - Traffic conditions and real-time updates
        - Multiple transportation modes
        - Time constraints and preferences
        - Fuel efficiency and cost optimization
        - Alternative routes and backup plans
        Return optimized route with alternatives and estimated times.`,
        
        'traffic_prediction': `Predict traffic conditions for: ${JSON.stringify(data)}. Analyze:
        - Historical traffic patterns
        - Current conditions and incidents
        - Time of day and day of week factors
        - Weather impact on traffic
        - Special events and construction
        Return traffic predictions with confidence levels.`
      },
      
      'ai-studio': {
        'video_analysis': `Analyze the video content: ${JSON.stringify(data)}. Provide:
        - Scene detection and transitions
        - Audio analysis and synchronization
        - Quality assessment and recommendations
        - Auto-editing suggestions
        - Content categorization and tagging
        Return structured analysis with improvement suggestions.`,
        
        'scene_detection': `Detect scenes in video: ${JSON.stringify(data)}. Identify:
        - Scene boundaries and transitions
        - Key moments and highlights
        - Audio-visual synchronization points
        - Recommended cut points
        - Content flow optimization
        Return scene analysis with editing recommendations.`,
        
        'auto_editing': `Generate auto-editing suggestions for: ${JSON.stringify(data)}. Consider:
        - Content pacing and rhythm
        - Visual flow and transitions
        - Audio enhancement opportunities
        - Color grading recommendations
        - Effect suggestions
        Return editing plan with specific recommendations.`
      },
      
      'ai-gallery': {
        'image_recognition': `Analyze images: ${JSON.stringify(data)}. Identify:
        - Objects, people, and scenes
        - Colors, composition, and quality
        - Similar images and duplicates
        - Metadata and EXIF information
        - Content categorization
        Return structured image analysis with tags and metadata.`,
        
        'auto_tagging': `Generate tags for images: ${JSON.stringify(data)}. Create:
        - Descriptive tags for searchability
        - Category classifications
        - Mood and style tags
        - Location and time-based tags
        - Custom tag suggestions
        Return comprehensive tagging system with confidence scores.`,
        
        'face_detection': `Detect faces in images: ${JSON.stringify(data)}. Analyze:
        - Face locations and bounding boxes
        - Facial expressions and emotions
        - Age and gender estimation
        - Face similarity matching
        - Privacy and consent considerations
        Return face detection results with privacy controls.`
      },
      
      'ai-travel': {
        'trip_planning': `Plan trip with data: ${JSON.stringify(data)}. Create:
        - Detailed itinerary with timing
        - Activity recommendations
        - Budget breakdown and optimization
        - Transportation options
        - Accommodation suggestions
        Return comprehensive trip plan with alternatives.`,
        
        'budget_optimization': `Optimize travel budget for: ${JSON.stringify(data)}. Consider:
        - Cost-effective alternatives
        - Seasonal pricing variations
        - Package deals and discounts
        - Hidden costs and fees
        - Value-for-money recommendations
        Return budget optimization with savings opportunities.`,
        
        'cultural_insights': `Provide cultural insights for: ${JSON.stringify(data)}. Include:
        - Local customs and etiquette
        - Cultural attractions and experiences
        - Language tips and phrases
        - Food and dining recommendations
        - Safety and cultural sensitivity
        Return cultural guide with practical advice.`
      },
      
      'ai-market': {
        'price_analysis': `Analyze market prices for: ${JSON.stringify(data)}. Evaluate:
        - Current market trends
        - Competitor pricing strategies
        - Price elasticity and demand
        - Seasonal variations
        - Optimal pricing recommendations
        Return price analysis with strategic insights.`,
        
        'trend_prediction': `Predict market trends for: ${JSON.stringify(data)}. Forecast:
        - Upcoming market movements
        - Consumer behavior changes
        - Technology adoption rates
        - Economic indicators impact
        - Investment opportunities
        Return trend predictions with confidence intervals.`,
        
        'market_insights': `Generate market insights for: ${JSON.stringify(data)}. Provide:
        - Market size and growth potential
        - Competitive landscape analysis
        - Customer segmentation insights
        - Product positioning opportunities
        - Strategic recommendations
        Return comprehensive market intelligence.`
      },
      
      'agents-kit': {
        'agent_coordination': `Coordinate agents for: ${JSON.stringify(data)}. Optimize:
        - Task distribution and load balancing
        - Agent communication protocols
        - Workflow orchestration
        - Performance monitoring
        - Error handling and recovery
        Return coordination strategy with monitoring metrics.`,
        
        'workflow_optimization': `Optimize workflow: ${JSON.stringify(data)}. Improve:
        - Process efficiency and speed
        - Resource utilization
        - Quality control measures
        - Automation opportunities
        - Bottleneck identification
        Return workflow optimization plan with metrics.`,
        
        'performance_analysis': `Analyze agent performance: ${JSON.stringify(data)}. Evaluate:
        - Success rates and error patterns
        - Response times and efficiency
        - Resource consumption
        - Quality metrics
        - Improvement opportunities
        Return performance analysis with recommendations.`
      },
      
      'mcp-kit': {
        'protocol_optimization': `Optimize MCP protocol for: ${JSON.stringify(data)}. Enhance:
        - Message efficiency and compression
        - Context window utilization
        - Tool integration performance
        - Error handling and recovery
        - Protocol versioning
        Return protocol optimization with performance gains.`,
        
        'context_management': `Manage context for: ${JSON.stringify(data)}. Optimize:
        - Context window allocation
        - Memory management strategies
        - Context compression techniques
        - Relevance scoring
        - Context persistence
        Return context management strategy with efficiency metrics.`,
        
        'tool_integration': `Integrate tools for: ${JSON.stringify(data)}. Enhance:
        - Tool discovery and registration
        - API compatibility and versioning
        - Error handling and fallbacks
        - Performance monitoring
        - Security and validation
        Return tool integration plan with security measures.`
      }
    };

    const appPrompts = prompts[miniAppId];
    if (!appPrompts || !appPrompts[action]) {
      throw new Error(`Unknown action ${action} for mini-app ${miniAppId}`);
    }

    return `${appPrompts[action]}

CRITICAL: Output MUST be valid JSON only. No markdown, no explanations, no additional text.
Use the capabilities: ${config.capabilities.join(', ')}`;
  }

  /**
   * Health check for Gemini service
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const testPrompt = 'Respond with JSON: {"status": "healthy", "timestamp": "' + new Date().toISOString() + '", "quantumOS": true}';
      
      const result = await this.model.generateContent(testPrompt);
      const response = await result.response;
      const text = response.text().trim();
      
      const parsed = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

      return {
        healthy: true,
        sdk: true,
        quantumOS: true,
        miniApps: Object.keys(this.quantumOSConfig.miniApps),
        response: parsed
      };

    } catch (error) {
      logger.error('Gemini health check failed', {
        error: error.message
      });

      return {
        healthy: false,
        sdk: false,
        quantumOS: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
module.exports = new GeminiCLI();
