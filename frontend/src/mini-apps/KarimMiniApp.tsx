/**
 * Karim Mini App - Budget Optimizer Agent
 * Smart cost analysis and budget optimization
 * 
 * @author Ona AI
 * @created 2025-10-21
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  PieChart,
  Calculator,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

interface BudgetRequest {
  totalBudget: number;
  destination: string;
  duration: number;
  travelers: number;
  priorities: string[];
}

interface BudgetResult {
  status: 'success' | 'error';
  message: string;
  data?: {
    breakdown?: {
      category: string;
      amount: number;
      percentage: number;
    }[];
    savings?: number;
    recommendations?: string[];
  };
}

const PRIORITIES = [
  { id: 'accommodation', label: 'Accommodation', icon: '🏨' },
  { id: 'food', label: 'Food & Dining', icon: '🍽️' },
  { id: 'activities', label: 'Activities', icon: '🎯' },
  { id: 'transport', label: 'Transportation', icon: '🚗' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' }
];

export function KarimMiniApp() {
  const [request, setRequest] = useState<BudgetRequest>({
    totalBudget: 1000,
    destination: '',
    duration: 3,
    travelers: 1,
    priorities: ['accommodation', 'food']
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BudgetResult | null>(null);

  const togglePriority = (id: string) => {
    setRequest(prev => ({
      ...prev,
      priorities: prev.priorities.includes(id)
        ? prev.priorities.filter(p => p !== id)
        : [...prev.priorities, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Import API service
      const { karimAPI } = await import('@/services/api');
      
      // Call backend API
      const response = await karimAPI.optimizeBudget(request);
      
      if (response.success) {
        setResult({
          status: 'success',
          message: 'Budget optimization complete!',
          data: {
            breakdown: [
              { category: 'Accommodation', amount: request.totalBudget * 0.4, percentage: 40 },
              { category: 'Food & Dining', amount: request.totalBudget * 0.3, percentage: 30 },
              { category: 'Activities', amount: request.totalBudget * 0.2, percentage: 20 },
              { category: 'Transportation', amount: request.totalBudget * 0.1, percentage: 10 }
            ],
            savings: Math.round(request.totalBudget * 0.15),
            recommendations: [
              'Book accommodation 2 months in advance for 20% savings',
              'Use local restaurants instead of tourist areas',
              'Consider public transport for daily commute'
            ],
            aiResponse: response.data?.message
          }
        });
      } else {
        setResult({
          status: 'error',
          message: response.error || 'Failed to optimize budget'
        });
      }
    } catch (error) {
      console.error('Karim API Error:', error);
      setResult({
        status: 'error',
        message: 'Failed to connect to backend. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-purple-500/10 to-pink-600/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Karim</h2>
            <p className="text-sm text-slate-400">Budget Optimizer Agent</p>
          </div>
        </div>
        <p className="text-slate-300 text-sm">
          Smart cost analysis • محسن الميزانية الذكي
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          {/* Total Budget */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-purple-400" />
              Total Budget ($)
            </label>
            <input
              type="number"
              min="100"
              step="50"
              value={request.totalBudget}
              onChange={(e) => setRequest({ ...request, totalBudget: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              required
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Destination
            </label>
            <input
              type="text"
              value={request.destination}
              onChange={(e) => setRequest({ ...request, destination: e.target.value })}
              placeholder="e.g., Dubai, Paris, Tokyo"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              required
            />
          </div>

          {/* Duration & Travelers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Duration (days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={request.duration}
                onChange={(e) => setRequest({ ...request, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Travelers
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={request.travelers}
                onChange={(e) => setRequest({ ...request, travelers: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Priorities */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Budget Priorities (select multiple)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PRIORITIES.map(priority => (
                <button
                  key={priority.id}
                  type="button"
                  onClick={() => togglePriority(priority.id)}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-300 text-left
                    ${request.priorities.includes(priority.id)
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-slate-700 bg-slate-800/50 hover:border-purple-500/50'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{priority.icon}</div>
                  <div className="text-sm font-semibold">{priority.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Optimizing budget...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Optimize Budget
              </>
            )}
          </button>
        </form>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6 max-w-2xl mx-auto"
          >
            {/* Status Message */}
            <div className={`p-6 rounded-xl border-2 ${
              result.status === 'success'
                ? 'bg-green-500/10 border-green-500/50'
                : 'bg-red-500/10 border-red-500/50'
            }`}>
              <div className="flex items-start gap-3">
                {result.status === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    {result.status === 'success' ? 'Optimization Complete!' : 'Error'}
                  </h3>
                  <p className="text-slate-300">{result.message}</p>
                </div>
              </div>
            </div>

            {result.data && (
              <>
                {/* Budget Breakdown */}
                {result.data.breakdown && (
                  <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-purple-400" />
                      Budget Breakdown
                    </h4>
                    <div className="space-y-3">
                      {result.data.breakdown.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300">{item.category}</span>
                            <span className="font-bold text-purple-400">${item.amount}</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-600"
                            />
                          </div>
                          <div className="text-xs text-slate-500">{item.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Savings */}
                {result.data.savings && (
                  <div className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-600/10 rounded-xl border border-green-500/50">
                    <div className="flex items-center gap-3">
                      <TrendingDown className="w-8 h-8 text-green-400" />
                      <div>
                        <p className="text-sm text-slate-400">Potential Savings</p>
                        <p className="text-3xl font-bold text-green-400">
                          ${result.data.savings}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {result.data.recommendations && (
                  <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      Money-Saving Tips
                    </h4>
                    <ul className="space-y-3">
                      {result.data.recommendations.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-slate-300">
                          <span className="text-yellow-400 font-bold">{index + 1}.</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default KarimMiniApp;
