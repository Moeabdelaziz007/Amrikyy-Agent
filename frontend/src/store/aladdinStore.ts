import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { aladdinApi, Opportunity, AgentStats, OpportunityAnalysis, AladdinApiError } from '@/api/aladdin';
import { toast } from 'sonner';

export interface OpportunityFilters {
  category?: 'arbitrage' | 'trading' | 'affiliate';
  minScore?: number;
  minProfit?: number;
}

interface AladdinStore {
  // State
  opportunities: Opportunity[];
  stats: AgentStats | null;
  selectedOpportunity: Opportunity | null;
  analysis: OpportunityAnalysis | null;
  isHunting: boolean;
  isLoadingStats: boolean;
  isLoadingOpportunities: boolean;
  isAnalyzing: boolean;
  lastHuntTime: string | null;
  filters: OpportunityFilters;
  error: string | null;
  rateLimitInfo: {
    isLimited: boolean;
    retryAfter: number;
    message: string;
  } | null;

  // Actions
  startHunt: () => Promise<void>;
  fetchOpportunities: (filters?: OpportunityFilters) => Promise<void>;
  analyzeOpportunity: (opportunityId: string, depth?: 'quick' | 'standard' | 'deep') => Promise<void>;
  fetchStats: () => Promise<void>;
  setSelectedOpportunity: (opportunity: Opportunity | null) => void;
  setFilters: (filters: OpportunityFilters) => void;
  clearAnalysis: () => void;
  clearError: () => void;
  clearRateLimit: () => void;
}

export const useAladdinStore = create<AladdinStore>()(
  persist(
    (set, get) => ({
      // Initial state
      opportunities: [],
      stats: null,
      selectedOpportunity: null,
      analysis: null,
      isHunting: false,
      isLoadingStats: false,
      isLoadingOpportunities: false,
      isAnalyzing: false,
      lastHuntTime: null,
      filters: {},
      error: null,
      rateLimitInfo: null,

      // Start a money hunt
      startHunt: async () => {
        const state = get();
        
        // Check if already hunting
        if (state.isHunting) {
          toast.warning('Hunt already in progress');
          return;
        }

        // Check rate limit
        if (state.rateLimitInfo?.isLimited) {
          const minutes = Math.ceil(state.rateLimitInfo.retryAfter / 60);
          toast.error(`Rate limited. Try again in ${minutes} minutes`);
          return;
        }

        set({ isHunting: true, error: null });

        try {
          const result = await aladdinApi.startHunt();
          
          set({
            opportunities: result.opportunities,
            lastHuntTime: new Date().toISOString(),
            isHunting: false,
          });

          toast.success(`Found ${result.opportunities.length} opportunities!`, {
            description: `${result.summary.byCategory.arbitrage} arbitrage, ${result.summary.byCategory.trading} trading, ${result.summary.byCategory.affiliate} affiliate`,
          });

          // Auto-fetch stats after successful hunt
          get().fetchStats();
        } catch (error) {
          if (error instanceof AladdinApiError) {
            if (error.statusCode === 429) {
              set({
                rateLimitInfo: {
                  isLimited: true,
                  retryAfter: error.retryAfter || 900,
                  message: error.message,
                },
              });
              toast.error('Rate limit exceeded', {
                description: `Please wait ${Math.ceil((error.retryAfter || 900) / 60)} minutes`,
              });
            } else {
              set({ error: error.message });
              toast.error('Hunt failed', { description: error.message });
            }
          } else {
            set({ error: 'Unknown error occurred' });
            toast.error('Hunt failed', { description: 'Please try again' });
          }
          set({ isHunting: false });
        }
      },

      // Fetch opportunities with filters
      fetchOpportunities: async (filters?: OpportunityFilters) => {
        set({ isLoadingOpportunities: true, error: null });

        try {
          const opportunities = await aladdinApi.getOpportunities(filters);
          set({
            opportunities,
            filters: filters || {},
            isLoadingOpportunities: false,
          });
        } catch (error) {
          if (error instanceof AladdinApiError) {
            set({ error: error.message });
            toast.error('Failed to fetch opportunities', { description: error.message });
          } else {
            set({ error: 'Unknown error occurred' });
            toast.error('Failed to fetch opportunities');
          }
          set({ isLoadingOpportunities: false });
        }
      },

      // Analyze a specific opportunity
      analyzeOpportunity: async (opportunityId: string, depth = 'standard') => {
        const state = get();

        if (state.isAnalyzing) {
          toast.warning('Analysis already in progress');
          return;
        }

        set({ isAnalyzing: true, error: null });

        try {
          const analysis = await aladdinApi.analyzeOpportunity(opportunityId, depth);
          set({
            analysis,
            isAnalyzing: false,
          });

          toast.success('Analysis complete', {
            description: `Recommendation: ${analysis.recommendation}`,
          });
        } catch (error) {
          if (error instanceof AladdinApiError) {
            if (error.statusCode === 429) {
              set({
                rateLimitInfo: {
                  isLimited: true,
                  retryAfter: error.retryAfter || 900,
                  message: error.message,
                },
              });
              toast.error('Rate limit exceeded', {
                description: `Please wait ${Math.ceil((error.retryAfter || 900) / 60)} minutes`,
              });
            } else {
              set({ error: error.message });
              toast.error('Analysis failed', { description: error.message });
            }
          } else {
            set({ error: 'Unknown error occurred' });
            toast.error('Analysis failed');
          }
          set({ isAnalyzing: false });
        }
      },

      // Fetch agent statistics
      fetchStats: async () => {
        set({ isLoadingStats: true, error: null });

        try {
          const stats = await aladdinApi.getStats();
          set({
            stats,
            isLoadingStats: false,
          });
        } catch (error) {
          if (error instanceof AladdinApiError) {
            set({ error: error.message });
            // Don't show toast for stats errors (non-critical)
          }
          set({ isLoadingStats: false });
        }
      },

      // Set selected opportunity
      setSelectedOpportunity: (opportunity) => {
        set({ selectedOpportunity: opportunity });
      },

      // Set filters
      setFilters: (filters) => {
        set({ filters });
        get().fetchOpportunities(filters);
      },

      // Clear analysis
      clearAnalysis: () => {
        set({ analysis: null });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Clear rate limit info
      clearRateLimit: () => {
        set({ rateLimitInfo: null });
      },
    }),
    {
      name: 'amrikyy-aladdin-storage',
      partialize: (state) => ({
        // Only persist these fields
        lastHuntTime: state.lastHuntTime,
        filters: state.filters,
      }),
    }
  )
);
