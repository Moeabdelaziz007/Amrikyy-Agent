/**
 * Aladdin API Client
 * TypeScript client for Mini-Aladdin money-hunting agent endpoints
 */

const API_BASE = '/api/aladdin';

export interface Opportunity {
  id: string;
  category: 'arbitrage' | 'trading' | 'affiliate';
  score: number;
  profit?: number;
  estimatedProfit?: number;
  risk?: string;
  description?: string;
  metadata?: any;
  [key: string]: any;
}

export interface HuntResult {
  opportunities: Opportunity[];
  plan: any;
  portfolio: any;
  analytics: any;
  summary: {
    total: number;
    byCategory: {
      arbitrage: number;
      trading: number;
      affiliate: number;
    };
  };
}

export interface AgentStats {
  portfolio: any;
  performance: any;
  riskMetrics: any;
  opportunities: {
    total: number;
    byCategory: {
      arbitrage: number;
      trading: number;
      affiliate: number;
    };
  };
  agents: {
    math: string;
    market: string;
    risk: string;
    data: string;
  };
  timestamp: string;
}

export interface HealthCheck {
  success: boolean;
  message: string;
  status: 'healthy' | 'initializing' | 'error';
  agents: {
    math: string;
    market: string;
    risk: string;
    data: string;
  } | null;
  timestamp: string;
}

export interface OpportunityAnalysis {
  opportunityId: string;
  opportunity: Opportunity;
  analytics: {
    portfolio: any;
    performance: any;
    riskMetrics: any;
  };
  recommendation: 'STRONG BUY' | 'BUY' | 'HOLD' | 'AVOID';
  confidence: number;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  retryAfter?: number;
}

class AladdinApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'AladdinApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 429) {
      throw new AladdinApiError(
        data.message || 'Rate limit exceeded. Please try again later.',
        429,
        data.retryAfter || 900
      );
    }

    if (response.status >= 500) {
      throw new AladdinApiError(
        data.message || 'Server error. Please try again.',
        response.status
      );
    }

    throw new AladdinApiError(
      data.message || data.error || 'Request failed',
      response.status
    );
  }

  return data;
}

export const aladdinApi = {
  /**
   * Health check - verify agent is running
   * Rate limit: 100 requests per 15 minutes
   */
  async checkHealth(): Promise<HealthCheck> {
    try {
      const response = await fetch(`${API_BASE}/health`);
      const data = await handleResponse<HealthCheck>(response);
      return data.data || data as any;
    } catch (error) {
      if (error instanceof AladdinApiError) {
        throw error;
      }
      throw new AladdinApiError('Failed to check agent health');
    }
  },

  /**
   * Start a money hunt - find opportunities
   * Rate limit: 10 requests per 15 minutes (STRICT)
   */
  async startHunt(): Promise<HuntResult> {
    try {
      const response = await fetch(`${API_BASE}/hunt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await handleResponse<HuntResult>(response);
      return data.data!;
    } catch (error) {
      if (error instanceof AladdinApiError) {
        throw error;
      }
      throw new AladdinApiError('Failed to start money hunt');
    }
  },

  /**
   * Get opportunities with optional filters
   * Rate limit: 100 requests per 15 minutes
   */
  async getOpportunities(filters?: {
    category?: 'arbitrage' | 'trading' | 'affiliate';
    minScore?: number;
    minProfit?: number;
  }): Promise<Opportunity[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.minScore) params.append('minScore', filters.minScore.toString());
      if (filters?.minProfit) params.append('minProfit', filters.minProfit.toString());

      const url = `${API_BASE}/opportunities${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const data = await handleResponse<{ opportunities: Opportunity[]; total: number }>(response);
      return data.data?.opportunities || [];
    } catch (error) {
      if (error instanceof AladdinApiError) {
        throw error;
      }
      throw new AladdinApiError('Failed to fetch opportunities');
    }
  },

  /**
   * Analyze a specific opportunity in detail
   * Rate limit: 50 requests per 15 minutes
   */
  async analyzeOpportunity(
    opportunityId: string,
    depth: 'quick' | 'standard' | 'deep' = 'standard'
  ): Promise<OpportunityAnalysis> {
    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ opportunityId, depth }),
      });
      const data = await handleResponse<OpportunityAnalysis>(response);
      return data.data!;
    } catch (error) {
      if (error instanceof AladdinApiError) {
        throw error;
      }
      throw new AladdinApiError('Failed to analyze opportunity');
    }
  },

  /**
   * Get agent statistics and performance metrics
   * Rate limit: 100 requests per 15 minutes
   */
  async getStats(): Promise<AgentStats> {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      const data = await handleResponse<AgentStats>(response);
      return data.data!;
    } catch (error) {
      if (error instanceof AladdinApiError) {
        throw error;
      }
      throw new AladdinApiError('Failed to fetch statistics');
    }
  },
};

export { AladdinApiError };
