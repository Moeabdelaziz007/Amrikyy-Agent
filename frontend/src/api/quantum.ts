/**
 * Quantum System V3 API Client
 * Type-safe API calls to backend
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface QuantumConfig {
  explorationRate?: number;
  circuitBreakerFailureThreshold?: number;
  circuitBreakerTimeoutMs?: number;
  maxRetries?: number;
  baseBackoffMs?: number;
  learningRateAlpha?: number;
  learningThreshold?: number;
  strategyEvolutionInterval?: number;
}

export interface QuantumMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  healedRequests: number;
  avgResponseTime: number;
  systemHealth: number;
  learnedRules: number;
  strategiesEvolved: number;
  isCircuitOpen: boolean;
}

export interface QuantumRequest {
  id: string;
  type: 'api_call' | 'database' | 'payment';
}

export interface QuantumScenario {
  name: string;
  failureRate: number;
  avgLatency: number;
  description?: string;
}

export const quantumAPI = {
  /**
   * Start a new quantum system
   */
  async startSystem(config?: QuantumConfig) {
    try {
      const response = await axios.post(`${API_BASE}/api/quantum-v3/start`, {
        config,
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to start quantum system:', error);
      throw error;
    }
  },

  /**
   * Get current status and metrics
   */
  async getStatus(runId: string) {
    try {
      const response = await axios.get(
        `${API_BASE}/api/quantum-v3/status/${runId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to get status:', error);
      throw error;
    }
  },

  /**
   * Process a request through the quantum system
   */
  async processRequest(
    runId: string,
    request: QuantumRequest,
    scenario: QuantumScenario
  ) {
    try {
      const response = await axios.post(
        `${API_BASE}/api/quantum-v3/process/${runId}`,
        { request, scenario }
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to process request:', error);
      throw error;
    }
  },

  /**
   * Stop a quantum system
   */
  async stopSystem(runId: string) {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/quantum-v3/${runId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to stop system:', error);
      throw error;
    }
  },

  /**
   * List all active quantum systems
   */
  async listSystems() {
    try {
      const response = await axios.get(`${API_BASE}/api/quantum-v3/list`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to list systems:', error);
      throw error;
    }
  },

  /**
   * Health check
   */
  async health() {
    try {
      const response = await axios.get(`${API_BASE}/api/quantum-v3/health`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get health:', error);
      throw error;
    }
  },
};
