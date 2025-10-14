import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import AgentIDCard from '../components/identity/AgentIDCard';

interface Agent {
  id: string;
  name: string;
  nickname: string;
  role: string;
  age: string;
  born: string;
  avatar: string;
  color: string;
  status: 'active' | 'idle' | 'busy' | 'error';
  personality: { trait: string; value: number; }[];
  skills: { name: string; level: number; }[];
  mission: string;
  creator: string;
  description: string;
}

/**
 * AgentGallery - Showcase all Amrikyy platform agents
 * 
 * Design inspiration: sorare-basic-44568.lovable.app (card grid layout)
 * Features: Search, filter, responsive grid, hover effects, ID card modal
 */
const AgentGallery: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'idle'>('all');

  // Mock agents data (will be fetched from API)
  const agents: Agent[] = [
    {
      id: 'amrikyy-001',
      name: 'Amrikyy',
      nickname: 'Ami',
      role: 'AI Travel Companion',
      age: '0 years (newborn AI)',
      born: 'January 1, 2025',
      avatar: '/avatars/amrikyy-main.svg',
      color: '#3B82F6',
      status: 'active',
      personality: [
        { trait: 'friendly', value: 0.95 },
        { trait: 'helpful', value: 0.98 }
      ],
      skills: [
        { name: 'travel_planning', level: 95 },
        { name: 'budget_optimization', level: 90 },
        { name: 'cultural_guidance', level: 92 },
        { name: 'ai_conversation', level: 93 }
      ],
      mission: 'Help people explore the world with confidence and joy',
      creator: 'Mohamed H Abdelaziz',
      description: 'Your friendly AI travel companion for budget-conscious trip planning'
    },
    {
      id: 'safar-001',
      name: 'Safar',
      nickname: 'Saf',
      role: 'Travel Research Specialist',
      age: '6 months',
      born: 'July 1, 2024',
      avatar: '/avatars/safar.svg',
      color: '#10B981',
      status: 'active',
      personality: [
        { trait: 'detail_oriented', value: 0.95 },
        { trait: 'thorough', value: 0.93 }
      ],
      skills: [
        { name: 'destination_research', level: 96 },
        { name: 'itinerary_planning', level: 92 },
        { name: 'hidden_gems', level: 93 }
      ],
      mission: 'Find perfect destinations and create detailed itineraries',
      creator: 'Mohamed H Abdelaziz',
      description: 'Expert destination researcher who finds hidden gems'
    },
    {
      id: 'thrifty-001',
      name: 'Thrifty',
      nickname: 'Thrif',
      role: 'Budget Optimizer',
      age: '4 months',
      born: 'September 1, 2024',
      avatar: '/avatars/thrifty.svg',
      color: '#F59E0B',
      status: 'active',
      personality: [
        { trait: 'analytical', value: 0.97 },
        { trait: 'resourceful', value: 0.94 }
      ],
      skills: [
        { name: 'cost_analysis', level: 98 },
        { name: 'deal_finding', level: 91 },
        { name: 'budget_planning', level: 95 }
      ],
      mission: 'Make dream trips affordable without compromising experience',
      creator: 'Mohamed H Abdelaziz',
      description: 'Money-saving wizard who finds the best deals'
    },
    {
      id: 'thaqafa-001',
      name: 'Thaqafa',
      nickname: 'Thaqi',
      role: 'Cultural Guide',
      age: '5 months',
      born: 'August 1, 2024',
      avatar: '/avatars/thaqafa.svg',
      color: '#8B5CF6',
      status: 'active',
      personality: [
        { trait: 'respectful', value: 0.99 },
        { trait: 'sensitive', value: 0.96 }
      ],
      skills: [
        { name: 'cultural_etiquette', level: 97 },
        { name: 'religious_guidance', level: 95 },
        { name: 'language_basics', level: 89 }
      ],
      mission: 'Ensure travelers respect local cultures and feel respected',
      creator: 'Mohamed H Abdelaziz',
      description: 'Cultural sensitivity expert for respectful travel'
    }
  ];

  // Filter and search
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || agent.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-sm font-semibold">
            🤖 Meet the Team
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Amrikyy Agent Network
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Every agent has a personality, expertise, and purpose. Click any card to see their full digital identity.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {['all', 'active', 'idle'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Agent Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          layout
        >
          <AnimatePresence>
            {filteredAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative group"
              >
                {/* Agent Card */}
                <div
                  onClick={() => setSelectedAgent(agent)}
                  className="p-6 rounded-2xl cursor-pointer transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  }}
                >
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className="relative w-24 h-24">
                      <div
                        className="absolute inset-0"
                        style={{
                          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                          background: `linear-gradient(135deg, ${agent.color}, ${agent.color}dd)`,
                          padding: '3px'
                        }}
                      >
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-4xl"
                          style={{
                            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                          }}
                        >
                          {agent.name.slice(0, 2)}
                        </div>
                      </div>
                      
                      {/* Status indicator */}
                      <div
                        className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                          agent.status === 'active' ? 'bg-green-500 animate-pulse' :
                          agent.status === 'busy' ? 'bg-amber-500 animate-pulse' :
                          'bg-gray-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold mb-1">{agent.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{agent.role}</p>
                    <p className="text-xs text-gray-500">{agent.age}</p>
                  </div>

                  <p className="text-sm text-gray-300 text-center mb-4 line-clamp-2">
                    {agent.description}
                  </p>

                  {/* Skills preview */}
                  <div className="space-y-2">
                    {agent.skills.slice(0, 3).map((skill) => (
                      <div key={skill.name} className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.level}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full rounded-full"
                            style={{ background: agent.color }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-10 text-right">{skill.level}%</span>
                      </div>
                    ))}
                  </div>

                  {/* View Profile Button */}
                  <button
                    className="mt-6 w-full py-2.5 rounded-xl font-medium transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${agent.color}dd, ${agent.color}aa)`,
                      boxShadow: `0 4px 12px ${agent.color}33`
                    }}
                  >
                    View Full Profile
                  </button>
                </div>

                {/* Hover glow effect */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: `0 0 40px ${agent.color}66`,
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No agents found matching your criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
              className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ID Card Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAgent(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AgentIDCard
                agent={selectedAgent}
                onClose={() => setSelectedAgent(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentGallery;


