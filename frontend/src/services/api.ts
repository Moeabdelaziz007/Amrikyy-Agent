/**
 * API Client - Backend communication layer
 * @author Ona AI
 * @created 2025-10-21
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// API Base URL from environment or default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AGENTS API
// ============================================

export interface AgentExecuteRequest {
  action: string;
  params: Record<string, any>;
  context?: Record<string, any>;
}

export interface AgentExecuteResponse {
  success: boolean;
  data: any;
  error?: string;
  executionTime?: number;
}

export const agentsAPI = {
  /**
   * Get list of all available agents
   */
  getAgents: async () => {
    const response = await apiClient.get('/api/agents');
    return response.data;
  },

  /**
   * Get specific agent details
   */
  getAgent: async (agentId: string) => {
    const response = await apiClient.get(`/api/agents/${agentId}`);
    return response.data;
  },

  /**
   * Execute agent task
   */
  executeTask: async (agentId: string, request: AgentExecuteRequest): Promise<AgentExecuteResponse> => {
    const response = await apiClient.post(`/api/agents/${agentId}/execute`, request);
    return response.data;
  },

  /**
   * Get agent status
   */
  getAgentStatus: async (agentId: string) => {
    const response = await apiClient.get(`/api/agents/${agentId}/status`);
    return response.data;
  },

  /**
   * Get agent statistics
   */
  getAgentStats: async (agentId: string) => {
    const response = await apiClient.get(`/api/agents/${agentId}/stats`);
    return response.data;
  }
};

// ============================================
// LUNA API (Trip Planner)
// ============================================

export interface TripPlanRequest {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: string;
}

export const lunaAPI = {
  /**
   * Plan a trip
   */
  planTrip: async (request: TripPlanRequest) => {
    return agentsAPI.executeTask('luna', {
      action: 'plan_trip',
      params: request
    });
  },

  /**
   * Search flights
   */
  searchFlights: async (from: string, to: string, date: string) => {
    return agentsAPI.executeTask('luna', {
      action: 'search_flights',
      params: { from, to, date }
    });
  },

  /**
   * Search hotels
   */
  searchHotels: async (destination: string, checkIn: string, checkOut: string) => {
    return agentsAPI.executeTask('luna', {
      action: 'search_hotels',
      params: { destination, checkIn, checkOut }
    });
  }
};

// ============================================
// KARIM API (Budget Optimizer)
// ============================================

export interface BudgetOptimizeRequest {
  totalBudget: number;
  destination: string;
  duration: number;
  travelers: number;
  priorities: string[];
}

export const karimAPI = {
  /**
   * Optimize budget
   */
  optimizeBudget: async (request: BudgetOptimizeRequest) => {
    return agentsAPI.executeTask('karim', {
      action: 'optimize_budget',
      params: request
    });
  },

  /**
   * Analyze expenses
   */
  analyzeExpenses: async (expenses: any[]) => {
    return agentsAPI.executeTask('karim', {
      action: 'analyze_expenses',
      params: { expenses }
    });
  },

  /**
   * Get savings recommendations
   */
  getSavingsRecommendations: async (budget: number, destination: string) => {
    return agentsAPI.executeTask('karim', {
      action: 'get_savings',
      params: { budget, destination }
    });
  }
};

// ============================================
// KODY API (Content Creator)
// ============================================

export interface ContentCreateRequest {
  type: 'video' | 'article' | 'research' | 'youtube';
  topic: string;
  model: 'notebooklm' | 'veo3' | 'nano-banana' | 'gemini-pro';
  style: string;
  duration?: number;
  format?: string;
}

export const kodyAPI = {
  /**
   * Create content
   */
  createContent: async (request: ContentCreateRequest) => {
    return agentsAPI.executeTask('kody', {
      action: 'create_content',
      params: request
    });
  },

  /**
   * Generate video with Veo3
   */
  generateVideo: async (topic: string, duration: number, style: string) => {
    return agentsAPI.executeTask('kody', {
      action: 'generate_video',
      params: { topic, duration, style, model: 'veo3' }
    });
  },

  /**
   * Write article with Nano Banana
   */
  writeArticle: async (topic: string, style: string) => {
    return agentsAPI.executeTask('kody', {
      action: 'write_article',
      params: { topic, style, model: 'nano-banana' }
    });
  },

  /**
   * Research with NotebookLM
   */
  research: async (topic: string) => {
    return agentsAPI.executeTask('kody', {
      action: 'research',
      params: { topic, model: 'notebooklm' }
    });
  },

  /**
   * YouTube content generation
   */
  createYouTubeContent: async (topic: string, style: string) => {
    return agentsAPI.executeTask('kody', {
      action: 'youtube_content',
      params: { topic, style, model: 'gemini-pro' }
    });
  }
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardAPI = {
  /**
   * Get dashboard stats
   */
  getStats: async () => {
    const response = await apiClient.get('/api/dashboard/stats');
    return response.data;
  },

  /**
   * Get recent activity
   */
  getActivity: async (limit: number = 10) => {
    const response = await apiClient.get(`/api/dashboard/activity?limit=${limit}`);
    return response.data;
  },

  /**
   * Get agent performance
   */
  getAgentPerformance: async () => {
    const response = await apiClient.get('/api/dashboard/performance');
    return response.data;
  }
};

// ============================================
// HEALTH CHECK
// ============================================

export const healthAPI = {
  /**
   * Check API health
   */
  check: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  }
};

// ============================================
// ERROR HANDLING UTILITIES
// ============================================

export interface APIError {
  message: string;
  code?: string;
  status?: number;
}

export const handleAPIError = (error: any): APIError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code,
      status: error.response?.status
    };
  }
  return {
    message: error.message || 'An unknown error occurred'
  };
};

// Export default client
export default apiClient;
