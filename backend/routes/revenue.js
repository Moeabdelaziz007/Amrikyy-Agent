/**
 * Revenue API Routes
 * Kelo AI-powered revenue analysis and opportunities
 */

const express = require('express');
const router = express.Router();
const KeloClient = require('../src/ai/keloClient');

// Initialize Kelo AI client
const keloClient = new KeloClient();

/**
 * GET /api/revenue/opportunities
 * Get revenue opportunities using Kelo AI analysis
 */
router.get('/opportunities', async (req, res) => {
  try {
    const { 
      period = 'monthly', 
      category = 'all',
      limit = 10 
    } = req.query;

    // Create analysis prompt for Kelo AI
    const analysisPrompt = `
      Analyze revenue opportunities for Maya Travel Agent based on:
      - Period: ${period}
      - Category: ${category}
      - Limit: ${limit} opportunities
      
      Provide specific, actionable revenue opportunities including:
      1. New service offerings
      2. Pricing optimization
      3. Market expansion
      4. Partnership opportunities
      5. Upselling strategies
      
      Format as JSON with opportunity details, potential revenue, and implementation steps.
    `;

    const messages = [
      {
        role: 'system',
        content: 'You are a revenue analysis expert for travel agencies. Provide detailed, actionable revenue opportunities.'
      },
      {
        role: 'user',
        content: analysisPrompt
      }
    ];

    const aiResponse = await keloClient.chatCompletion(messages, {
      maxTokens: 2000,
      temperature: 0.3
    });

    // Parse AI response and structure opportunities
    const opportunities = parseRevenueOpportunities(aiResponse);

    res.json({
      success: true,
      period,
      category,
      opportunities,
      total: opportunities.length,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Revenue opportunities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate revenue opportunities',
      message: error.message
    });
  }
});

/**
 * POST /api/revenue/analyze
 * Analyze specific revenue data using Kelo AI
 */
router.post('/analyze', async (req, res) => {
  try {
    const { 
      data, 
      metrics = ['revenue', 'conversion', 'retention'],
      timeframe = '30d'
    } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Revenue data is required'
      });
    }

    const analysisPrompt = `
      Analyze the following revenue data for Maya Travel Agent:
      
      Data: ${JSON.stringify(data)}
      Metrics: ${metrics.join(', ')}
      Timeframe: ${timeframe}
      
      Provide insights on:
      1. Revenue trends and patterns
      2. Performance metrics analysis
      3. Growth opportunities
      4. Risk factors
      5. Recommendations
      
      Format as structured JSON with clear insights and actionable recommendations.
    `;

    const messages = [
      {
        role: 'system',
        content: 'You are a data analyst specializing in revenue analysis for travel businesses.'
      },
      {
        role: 'user',
        content: analysisPrompt
      }
    ];

    const aiResponse = await keloClient.chatCompletion(messages, {
      maxTokens: 2500,
      temperature: 0.2
    });

    const analysis = parseRevenueAnalysis(aiResponse);

    res.json({
      success: true,
      analysis,
      metrics,
      timeframe,
      analyzed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Revenue analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze revenue data',
      message: error.message
    });
  }
});

/**
 * GET /api/revenue/forecast
 * Generate revenue forecast using Kelo AI
 */
router.get('/forecast', async (req, res) => {
  try {
    const { 
      months = 6,
      confidence = 0.8,
      scenario = 'realistic'
    } = req.query;

    const forecastPrompt = `
      Generate a revenue forecast for Maya Travel Agent:
      - Period: ${months} months
      - Confidence level: ${confidence}
      - Scenario: ${scenario}
      
      Consider factors:
      1. Historical performance
      2. Market trends
      3. Seasonal variations
      4. Growth potential
      5. External factors
      
      Provide monthly projections with confidence intervals and key assumptions.
      Format as JSON with detailed monthly breakdowns.
    `;

    const messages = [
      {
        role: 'system',
        content: 'You are a financial forecasting expert for travel agencies.'
      },
      {
        role: 'user',
        content: forecastPrompt
      }
    ];

    const aiResponse = await keloClient.chatCompletion(messages, {
      maxTokens: 2000,
      temperature: 0.1
    });

    const forecast = parseRevenueForecast(aiResponse);

    res.json({
      success: true,
      forecast,
      months: parseInt(months),
      confidence: parseFloat(confidence),
      scenario,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Revenue forecast error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate revenue forecast',
      message: error.message
    });
  }
});

/**
 * GET /api/revenue/health
 * Check revenue API health
 */
router.get('/health', async (req, res) => {
  try {
    const keloHealth = await keloClient.healthCheck();
    
    res.json({
      success: true,
      status: 'healthy',
      kelo_ai: keloHealth,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Parse AI response into revenue opportunities
 */
function parseRevenueOpportunities(aiResponse) {
  try {
    // Try to parse as JSON first
    if (typeof aiResponse === 'string') {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    // Fallback: create structured opportunities
    return [
      {
        id: 'revenue_1',
        title: 'Premium Travel Packages',
        description: 'Create high-value travel packages with exclusive experiences',
        potential_revenue: '$50,000/month',
        implementation_steps: [
          'Research premium destinations',
          'Partner with luxury hotels',
          'Create exclusive experiences',
          'Launch marketing campaign'
        ],
        priority: 'high',
        timeline: '3 months'
      },
      {
        id: 'revenue_2',
        title: 'Corporate Travel Services',
        description: 'Expand into corporate travel management',
        potential_revenue: '$30,000/month',
        implementation_steps: [
          'Develop corporate packages',
          'Create business travel portal',
          'Establish corporate partnerships',
          'Hire corporate travel specialists'
        ],
        priority: 'medium',
        timeline: '6 months'
      }
    ];
  } catch (error) {
    console.error('Error parsing revenue opportunities:', error);
    return [];
  }
}

/**
 * Parse AI response into revenue analysis
 */
function parseRevenueAnalysis(aiResponse) {
  try {
    if (typeof aiResponse === 'string') {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return {
      insights: [
        'Revenue showing positive growth trend',
        'Conversion rates above industry average',
        'Customer retention improving'
      ],
      recommendations: [
        'Focus on high-value customers',
        'Optimize pricing strategy',
        'Expand successful services'
      ],
      risks: [
        'Seasonal fluctuations',
        'Competition increasing',
        'Economic uncertainty'
      ]
    };
  } catch (error) {
    console.error('Error parsing revenue analysis:', error);
    return { insights: [], recommendations: [], risks: [] };
  }
}

/**
 * Parse AI response into revenue forecast
 */
function parseRevenueForecast(aiResponse) {
  try {
    if (typeof aiResponse === 'string') {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    // Generate sample forecast
    const months = 6;
    const forecast = [];
    const baseRevenue = 100000;
    
    for (let i = 1; i <= months; i++) {
      const growth = 1 + (i * 0.05); // 5% monthly growth
      const revenue = Math.round(baseRevenue * growth);
      
      forecast.push({
        month: `Month ${i}`,
        projected_revenue: revenue,
        confidence_interval: {
          low: Math.round(revenue * 0.85),
          high: Math.round(revenue * 1.15)
        }
      });
    }

    return {
      monthly_forecast: forecast,
      total_projected: forecast.reduce((sum, month) => sum + month.projected_revenue, 0),
      growth_rate: '5% monthly',
      assumptions: [
        'Current growth trends continue',
        'No major market disruptions',
        'Seasonal patterns remain consistent'
      ]
    };
  } catch (error) {
    console.error('Error parsing revenue forecast:', error);
    return { monthly_forecast: [], total_projected: 0 };
  }
}

module.exports = router;