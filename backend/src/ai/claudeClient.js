/**
 * Claude Client - Anthropic Claude API Integration
 * Professional integration for business intelligence and code generation
 * Version: 1.0.0
 * Author: AMRIKYY
 */

const fetch = require('node-fetch');

class ClaudeClient {
  constructor() {
    // Initialize Claude API configuration
    this.apiKey = process.env.CLAUDE_API_KEY;
    this.model = 'claude-3-5-sonnet-20241022';
    this.baseUrl = 'https://api.anthropic.com/v1/messages';
    this.maxTokens = 2000;
    this.temperature = 0.7;
    
    // Validate API key
    if (!this.apiKey) {
      console.warn('⚠️ CLAUDE_API_KEY not found. Claude features will be disabled.');
      this.enabled = false;
    } else {
      this.enabled = true;
      console.log('✅ Claude Client initialized');
    }
  }

  /**
   * Send chat completion request to Claude
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} API response
   */
  async chatCompletion(messages, options = {}) {
    if (!this.enabled) {
      return {
        success: false,
        error: 'Claude API key not configured',
        content: 'Claude features are not available. Please configure CLAUDE_API_KEY.'
      };
    }

    try {
      const requestBody = {
        model: options.model || this.model,
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature || this.temperature,
        messages: messages
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        content: data.content[0].text,
        usage: data.usage,
        model: this.model,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Claude API Error:', error);
      return {
        success: false,
        error: error.message,
        content: 'Sorry, I encountered an error processing your request with Claude.'
      };
    }
  }

  /**
   * Generate presentation content using Claude
   * @param {Object} data - Data for presentation
   * @param {Object} options - Presentation options
   * @returns {Promise<Object>} Presentation content
   */
  async generatePresentation(data, options = {}) {
    const template = options.template || 'travel';
    const style = options.style || 'professional';
    
    const messages = [
      {
        role: 'user',
        content: `Create a professional ${template} presentation about: ${JSON.stringify(data)}

Requirements:
- Style: ${style}
- Format: Markdown with clear sections
- Include: Title, overview, key points, recommendations
- Language: ${options.language || 'English'}
- Tone: Professional and engaging

Please structure it as a presentation with clear headings and bullet points.`
      }
    ];
    
    return await this.chatCompletion(messages, {
      temperature: 0.3, // Lower temperature for consistent output
      maxTokens: 3000
    });
  }

  /**
   * Analyze business data using Claude
   * @param {Object} data - Business data to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeBusinessData(data, options = {}) {
    const analysisType = options.analysisType || 'general';
    
    const messages = [
      {
        role: 'user',
        content: `Analyze this business data and provide insights: ${JSON.stringify(data)}

Analysis Type: ${analysisType}
Requirements:
- Provide key insights and trends
- Identify opportunities and risks
- Suggest actionable recommendations
- Use data-driven conclusions
- Format: Structured analysis with clear sections

Please provide a comprehensive business analysis.`
      }
    ];
    
    return await this.chatCompletion(messages, {
      temperature: 0.1, // Very low temperature for analytical tasks
      maxTokens: 2500
    });
  }

  /**
   * Generate code using Claude
   * @param {string} description - Code description
   * @param {Object} options - Code generation options
   * @returns {Promise<Object>} Generated code
   */
  async generateCode(description, options = {}) {
    const language = options.language || 'javascript';
    const framework = options.framework || '';
    
    const messages = [
      {
        role: 'user',
        content: `Generate ${language} code for: ${description}

Requirements:
- Language: ${language}
- Framework: ${framework || 'vanilla'}
- Include proper error handling
- Add comments for clarity
- Follow best practices
- Return only the code with brief explanation

Please provide clean, production-ready code.`
      }
    ];
    
    return await this.chatCompletion(messages, {
      temperature: 0.2, // Low temperature for code generation
      maxTokens: 2000
    });
  }

  /**
   * Create revenue forecast using Claude
   * @param {Object} data - Historical data and parameters
   * @param {Object} options - Forecast options
   * @returns {Promise<Object>} Revenue forecast
   */
  async createRevenueForecast(data, options = {}) {
    const timeframe = options.timeframe || '12 months';
    const method = options.method || 'trend analysis';
    
    const messages = [
      {
        role: 'user',
        content: `Create a revenue forecast based on this data: ${JSON.stringify(data)}

Requirements:
- Timeframe: ${timeframe}
- Method: ${method}
- Include confidence intervals
- Provide assumptions
- Suggest growth strategies
- Format: Professional forecast report

Please provide a detailed revenue forecast with supporting analysis.`
      }
    ];
    
    return await this.chatCompletion(messages, {
      temperature: 0.1, // Very low temperature for forecasting
      maxTokens: 2500
    });
  }

  /**
   * Analyze sales pipeline health using Claude
   * @param {Object} pipelineData - Sales pipeline data
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Pipeline analysis
   */
  async analyzeSalesPipeline(pipelineData, options = {}) {
    const metrics = options.metrics || ['conversion', 'velocity', 'health'];
    
    const messages = [
      {
        role: 'user',
        content: `Analyze this sales pipeline data: ${JSON.stringify(pipelineData)}

Metrics to analyze: ${metrics.join(', ')}
Requirements:
- Calculate key performance indicators
- Identify bottlenecks and opportunities
- Provide actionable recommendations
- Include risk assessment
- Format: Comprehensive pipeline health report

Please provide a detailed sales pipeline analysis.`
      }
    ];
    
    return await this.chatCompletion(messages, {
      temperature: 0.1, // Very low temperature for analysis
      maxTokens: 2500
    });
  }

  /**
   * Convert CSV to slides using Claude
   * @param {string} csvData - CSV data as string
   * @param {Object} options - Conversion options
   * @returns {Promise<Object>} Slides content
   */
  async convertCsvToSlides(csvData, options = {}) {
    const theme = options.theme || 'business';
    const slideCount = options.slideCount || 10;
    
    const messages = [
      {
        role: 'user',
        content: `Convert this CSV data into presentation slides: ${csvData}

Requirements:
- Theme: ${theme}
- Number of slides: ${slideCount}
- Include charts and visualizations
- Add insights and conclusions
- Format: Markdown presentation
- Structure: Title, overview, data insights, conclusions

Please create a professional presentation from the CSV data.`
      }
    ];
    
    return await this.chatCompletion(messages, {
      temperature: 0.3, // Moderate temperature for creative presentation
      maxTokens: 3000
    });
  }

  /**
   * Get Claude capabilities
   * @returns {Object} - Claude capabilities
   */
  getCapabilities() {
    return {
      enabled: this.enabled,
      model: this.model,
      capabilities: [
        'presentation_generation',
        'business_analysis',
        'code_generation',
        'revenue_forecasting',
        'sales_pipeline_analysis',
        'csv_to_slides_conversion',
        'data_analysis',
        'strategic_planning'
      ],
      languages: ['en', 'ar'],
      specialties: [
        'business_intelligence',
        'code_generation',
        'presentation_creation',
        'data_analysis',
        'strategic_thinking'
      ],
      maxTokens: this.maxTokens,
      temperature: this.temperature
    };
  }

  /**
   * Health check for Claude API
   * @returns {Promise<Object>} - Health status
   */
  async healthCheck() {
    if (!this.enabled) {
      return {
        status: 'disabled',
        message: 'Claude API key not configured',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const testResponse = await this.chatCompletion([
        {
          role: 'user',
          content: 'Hello, this is a health check. Please respond with "OK".'
        }
      ], {
        maxTokens: 10,
        temperature: 0
      });

      return {
        status: testResponse.success ? 'healthy' : 'error',
        message: testResponse.success ? 'Claude API is working' : testResponse.error,
        timestamp: new Date().toISOString(),
        responseTime: testResponse.responseTime || 0
      };

    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = { ClaudeClient };
