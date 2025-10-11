/**
 * AgentDNA API Service
 * Frontend service for communicating with AgentDNA backend
 */

import axios from 'axios';
import type {
  AgentDNA,
  CreateAgentRequest,
  UpdateAgentRequest,
  AgentDashboard,
  APIResponse,
} from '../types/agentDNA';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class AgentDNAService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/agent-dna`;
  }

  /**
   * Create a new agent
   */
  async createAgent(data: CreateAgentRequest): Promise<AgentDNA> {
    try {
      const response = await axios.post<{ success: boolean; agent: AgentDNA }>(
        `${this.baseURL}/create`,
        data
      );

      if (!response.data.success) {
        throw new Error('Failed to create agent');
      }

      return response.data.agent;
    } catch (error) {
      console.error('Create agent error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId: string): Promise<AgentDNA> {
    try {
      const response = await axios.get<{ success: boolean; agent: AgentDNA }>(
        `${this.baseURL}/${agentId}`
      );

      if (!response.data.success) {
        throw new Error('Agent not found');
      }

      return response.data.agent;
    } catch (error) {
      console.error('Get agent error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update agent
   */
  async updateAgent(
    agentId: string,
    updates: UpdateAgentRequest
  ): Promise<AgentDNA> {
    try {
      const response = await axios.put<{ success: boolean; agent: AgentDNA }>(
        `${this.baseURL}/${agentId}`,
        updates
      );

      if (!response.data.success) {
        throw new Error('Failed to update agent');
      }

      return response.data.agent;
    } catch (error) {
      console.error('Update agent error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete agent
   */
  async deleteAgent(agentId: string): Promise<void> {
    try {
      const response = await axios.delete<{ success: boolean }>(
        `${this.baseURL}/${agentId}`
      );

      if (!response.data.success) {
        throw new Error('Failed to delete agent');
      }
    } catch (error) {
      console.error('Delete agent error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all agents
   */
  async getAllAgents(): Promise<AgentDNA[]> {
    try {
      const response = await axios.get<{
        success: boolean;
        agents: AgentDNA[];
      }>(`${this.baseURL}`);

      if (!response.data.success) {
        throw new Error('Failed to fetch agents');
      }

      return response.data.agents;
    } catch (error) {
      console.error('Get all agents error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboard(): Promise<AgentDashboard> {
    try {
      const response = await axios.get<{
        success: boolean;
        dashboard: AgentDashboard;
      }>(`${this.baseURL}/dashboard/stats`);

      if (!response.data.success) {
        throw new Error('Failed to fetch dashboard');
      }

      return response.data.dashboard;
    } catch (error) {
      console.error('Get dashboard error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update agent performance
   */
  async updatePerformance(
    agentId: string,
    metrics: {
      tasksCompleted?: number;
      qualityScore?: number;
      innovations?: number;
    }
  ): Promise<AgentDNA> {
    try {
      const response = await axios.post<{ success: boolean; agent: AgentDNA }>(
        `${this.baseURL}/${agentId}/performance`,
        metrics
      );

      if (!response.data.success) {
        throw new Error('Failed to update performance');
      }

      return response.data.agent;
    } catch (error) {
      console.error('Update performance error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get agents by type
   */
  async getAgentsByType(type: string): Promise<AgentDNA[]> {
    try {
      const response = await axios.get<{
        success: boolean;
        agents: AgentDNA[];
      }>(`${this.baseURL}/by-type/${type}`);

      if (!response.data.success) {
        throw new Error('Failed to fetch agents by type');
      }

      return response.data.agents;
    } catch (error) {
      console.error('Get agents by type error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;
      return new Error(message);
    }
    return error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

// Export singleton instance
export const agentDNAService = new AgentDNAService();
export default agentDNAService;

