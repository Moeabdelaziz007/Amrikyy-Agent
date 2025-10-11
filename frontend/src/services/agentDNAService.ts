/**
 * AgentDNA API Service
 * Client for communicating with AgentDNA backend
 */

import axios, { AxiosInstance } from 'axios';
import {
  AgentDNA,
  CreateAgentRequest,
  UpdateAgentRequest,
  AgentDashboard,
  APIResponse,
} from '../types/agentDNA';

class AgentDNAService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  /**
   * Create a new agent
   */
  async createAgent(data: CreateAgentRequest): Promise<AgentDNA> {
    const response = await this.api.post<APIResponse<{ agent: AgentDNA }>>(
      '/agent-dna/create',
      data
    );
    return response.data.data!.agent;
  }

  /**
   * Get agent by ID
   */
  async getAgent(id: string): Promise<AgentDNA> {
    const response = await this.api.get<APIResponse<{ agent: AgentDNA }>>(
      `/agent-dna/${id}`
    );
    return response.data.data!.agent;
  }

  /**
   * Get all agents
   */
  async getAllAgents(): Promise<AgentDNA[]> {
    const response = await this.api.get<
      APIResponse<{ agents: AgentDNA[]; count: number }>
    >('/agent-dna');
    return response.data.data!.agents;
  }

  /**
   * Update agent
   */
  async updateAgent(id: string, data: UpdateAgentRequest): Promise<AgentDNA> {
    const response = await this.api.put<APIResponse<{ agent: AgentDNA }>>(
      `/agent-dna/${id}`,
      data
    );
    return response.data.data!.agent;
  }

  /**
   * Delete agent
   */
  async deleteAgent(id: string): Promise<void> {
    await this.api.delete(`/agent-dna/${id}`);
  }

  /**
   * Get dashboard statistics
   */
  async getDashboard(): Promise<AgentDashboard> {
    const response = await this.api.get<
      APIResponse<{ dashboard: AgentDashboard }>
    >('/agent-dna/dashboard/stats');
    return response.data.data!.dashboard;
  }

  /**
   * Update agent performance
   */
  async updatePerformance(
    id: string,
    metrics: {
      tasksCompleted?: number;
      qualityScore?: number;
      innovations?: number;
    }
  ): Promise<AgentDNA> {
    const response = await this.api.post<APIResponse<{ agent: AgentDNA }>>(
      `/agent-dna/${id}/performance`,
      metrics
    );
    return response.data.data!.agent;
  }

  /**
   * Get agents by type
   */
  async getAgentsByType(type: string): Promise<AgentDNA[]> {
    const response = await this.api.get<
      APIResponse<{ agents: AgentDNA[]; count: number }>
    >(`/agent-dna/by-type/${type}`);
    return response.data.data!.agents;
  }
}

// Export singleton instance
export const agentDNAService = new AgentDNAService();
export default agentDNAService;
