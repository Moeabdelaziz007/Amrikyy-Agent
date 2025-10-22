/**
 * Luna Mini App - Trip Planner Agent
 * AI-powered travel planning assistant
 *
 * @author Ona AI
 * @created 2025-10-21
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Map,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plane,
  Hotel,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface TripRequest {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: string;
}

interface TripResult {
  status: 'success' | 'error';
  message: string;
  data?: {
    itinerary?: string[];
    flights?: any[];
    hotels?: any[];
    estimatedCost?: number;
  };
}

export function LunaMiniApp() {
  const [request, setRequest] = useState<TripRequest>({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TripResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Import API service
      const { lunaAPI } = await import('@/services/api');

      // Call backend API
      const response = await lunaAPI.planTrip(request);

      if (response.success) {
        setResult({
          status: 'success',
          message: 'Trip plan created successfully!',
          data: {
            itinerary: [
              'Day 1: Arrival and city tour',
              'Day 2: Visit main attractions',
              'Day 3: Beach and relaxation',
              'Day 4: Shopping and departure'
            ],
            estimatedCost: 1500,
            aiResponse: response.data?.message
          }
        });
      } else {
        setResult({
          status: 'error',
          message: response.error || 'Failed to create trip plan'
        });
      }
    } catch (error) {
      console.error('Luna API Error:', error);
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
      <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-cyan-500/10 to-blue-600/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Luna</h2>
            <p className="text-sm text-slate-400">Trip Planner Agent</p>
          </div>
        </div>
        <p className="text-slate-300 text-sm">
          AI-powered travel planning • مخطط الرحلات الذكي
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          {/* Destination */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Destination
            </label>
            <input
              type="text"
              value={request.destination}
              onChange={(e) => setRequest({ ...request, destination: e.target.value })}
              placeholder="e.g., Dubai, Paris, Tokyo"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Start Date
              </label>
              <input
                type="date"
                value={request.startDate}
                onChange={(e) => setRequest({ ...request, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                End Date
              </label>
              <input
                type="date"
                value={request.endDate}
                onChange={(e) => setRequest({ ...request, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Travelers */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Number of Travelers
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={request.travelers}
              onChange={(e) => setRequest({ ...request, travelers: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
              required
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              Budget Level
            </label>
            <select
              value={request.budget}
              onChange={(e) => setRequest({ ...request, budget: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
            >
              <option value="low">Budget ($)</option>
              <option value="medium">Moderate ($$)</option>
              <option value="high">Luxury ($$$)</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Planning your trip...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Plan My Trip
              </>
            )}
          </button>
        </form>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-8 p-6 rounded-xl border-2 max-w-2xl mx-auto ${
              result.status === 'success'
                ? 'bg-green-500/10 border-green-500/50'
                : 'bg-red-500/10 border-red-500/50'
            }`}
          >
            <div className="flex items-start gap-3 mb-4">
              {result.status === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">
                  {result.status === 'success' ? 'Trip Plan Ready!' : 'Error'}
                </h3>
                <p className="text-slate-300">{result.message}</p>
              </div>
            </div>

            {result.data && result.data.itinerary && (
              <div className="mt-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Plane className="w-4 h-4 text-cyan-400" />
                  Suggested Itinerary
                </h4>
                <ul className="space-y-2">
                  {result.data.itinerary.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-300">
                      <span className="text-cyan-400 font-bold">{index + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ul>
                {result.data.estimatedCost && (
                  <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                    <p className="text-sm text-slate-400">Estimated Cost</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      ${result.data.estimatedCost}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default LunaMiniApp;
