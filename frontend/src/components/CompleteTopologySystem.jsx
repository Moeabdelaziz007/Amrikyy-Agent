import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Brain, 
  Globe, 
  Atom, 
  Clock, 
  CheckCircle, 
  PlayCircle,
  Target,
  TrendingUp,
  Award,
  Users,
  Zap
} from 'lucide-react';

export default function CompleteTopologySystem() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [studyTime, setStudyTime] = useState(0);
  const [completedMilestones, setCompletedMilestones] = useState([]);
  const [isStudying, setIsStudying] = useState(false);

  const phases = [
    {
      title: 'Visual Foundations',
      duration: 'Weeks 1-2',
      icon: <Brain className="text-neonGreen w-8 h-8" />,
      resources: [
        { name: '3Blue1Brown', type: 'YouTube', hours: 10, status: 'pending' },
        { name: 'Numberphile', type: 'YouTube', hours: 5, status: 'pending' },
        { name: 'Mathologer', type: 'YouTube', hours: 8, status: 'pending' }
      ],
      objectives: ['Build intuitive understanding', 'Learn continuity concepts', 'Explore surfaces']
    },
    {
      title: 'Theoretical Mastery',
      duration: 'Weeks 3-6',
      icon: <BookOpen className="text-neonGreen w-8 h-8" />,
      resources: [
        { name: 'Topology Without Tears', type: 'Textbook', hours: 15, status: 'pending' },
        { name: 'Munkres Topology', type: 'Textbook', hours: 20, status: 'pending' },
        { name: 'Hatcher Algebraic', type: 'Textbook', hours: 25, status: 'pending' }
      ],
      objectives: ['Master rigorous proofs', 'Understand metric spaces', 'Learn homology theory']
    },
    {
      title: 'University Courses',
      duration: 'Weeks 7-10',
      icon: <Globe className="text-neonGreen w-8 h-8" />,
      resources: [
        { name: 'MIT 18.901', type: 'Course', hours: 30, status: 'pending' },
        { name: 'MIT 18.905', type: 'Course', hours: 35, status: 'pending' },
        { name: 'MIT 18.966', type: 'Course', hours: 40, status: 'pending' }
      ],
      objectives: ['Complete structured courses', 'Master university-level content', 'Prepare for research']
    },
    {
      title: 'Interactive Tools',
      duration: 'Weeks 11-12',
      icon: <Atom className="text-neonGreen w-8 h-8" />,
      resources: [
        { name: 'Brilliant.org', type: 'Platform', hours: 10, status: 'pending' },
        { name: 'Wolfram MathWorld', type: 'Reference', hours: 5, status: 'pending' },
        { name: 'Desmos/GeoGebra', type: 'Visualization', hours: 8, status: 'pending' }
      ],
      objectives: ['Reinforce with visualization', 'Practice interactive learning', 'Apply concepts']
    }
  ];

  const milestones = [
    { id: 1, title: 'Complete 3Blue1Brown Linear Algebra', phase: 0, completed: false },
    { id: 2, title: 'Read Topology Without Tears Ch.1-4', phase: 1, completed: false },
    { id: 3, title: 'Finish MIT 18.901 Course', phase: 2, completed: false },
    { id: 4, title: 'Master Algebraic Topology', phase: 3, completed: false },
    { id: 5, title: 'Complete 90-Day Program', phase: 3, completed: false }
  ];

  const studyRoutine = [
    { time: '20 min', activity: 'Video Lecture', icon: <PlayCircle className="w-5 h-5" /> },
    { time: '30 min', activity: 'Textbook Reading', icon: <BookOpen className="w-5 h-5" /> },
    { time: '10 min', activity: 'Visualization', icon: <Atom className="w-5 h-5" /> },
    { time: '15 min', activity: 'Reflection', icon: <Brain className="w-5 h-5" /> }
  ];

  useEffect(() => {
    let interval;
    if (isStudying) {
      interval = setInterval(() => {
        setStudyTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleStudy = () => {
    setIsStudying(!isStudying);
  };

  const resetTimer = () => {
    setStudyTime(0);
    setIsStudying(false);
  };

  const toggleMilestone = (milestoneId) => {
    setCompletedMilestones(prev => 
      prev.includes(milestoneId) 
        ? prev.filter(id => id !== milestoneId)
        : [...prev, milestoneId]
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-bold text-neonGreen mb-4 neon-glow">
          🎓 Complete Topology Learning System
        </h1>
        <p className="text-xl text-gray-300 max-w-4xl mx-auto">
          Master topology from beginner to advanced through our comprehensive 90-day quantum learning pathway
        </p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
      >
        {[
          { label: 'Total Study Time', value: formatTime(studyTime), icon: <Clock className="w-6 h-6" />, color: 'text-blue-400' },
          { label: 'Completed Milestones', value: `${completedMilestones.length}/${milestones.length}`, icon: <CheckCircle className="w-6 h-6" />, color: 'text-green-400' },
          { label: 'Current Phase', value: `${currentPhase + 1}/4`, icon: <Target className="w-6 h-6" />, color: 'text-yellow-400' },
          { label: 'Progress Score', value: `${Math.round((completedMilestones.length / milestones.length) * 100)}%`, icon: <TrendingUp className="w-6 h-6" />, color: 'text-purple-400' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-gray-900 to-black border border-neonGreen/40 rounded-xl p-6 text-center"
          >
            <div className="flex justify-center mb-3">
              <div className={`${stat.color}`}>{stat.icon}</div>
            </div>
            <div className={`${stat.color} text-2xl font-bold mb-2`}>{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Study Timer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-neonGreen/40 rounded-xl p-8 mb-12"
      >
        <h2 className="text-3xl font-bold text-neonGreen mb-6 text-center">
          ⏰ Quantum Study Timer
        </h2>
        <div className="text-center">
          <div className="text-6xl font-mono text-neonGreen mb-6 neon-glow">
            {formatTime(studyTime)}
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleStudy}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                isStudying 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-neonGreen hover:bg-green-400 text-black'
              }`}
            >
              {isStudying ? 'Pause' : 'Start'} Study
            </button>
            <button
              onClick={resetTimer}
              className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </motion.div>

      {/* Study Routine */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold text-neonGreen mb-6 text-center">
          🧠 Daily Quantum Study Cycle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {studyRoutine.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-gray-900 to-black border border-neonGreen/40 rounded-xl p-6 text-center"
            >
              <div className="flex justify-center mb-3">
                <div className="text-neonGreen">{item.icon}</div>
              </div>
              <div className="text-neonGreen text-xl font-bold mb-2">{item.time}</div>
              <div className="text-gray-300 text-sm">{item.activity}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Learning Phases */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold text-neonGreen mb-6 text-center">
          🚀 90-Day Mastery Roadmap
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {phases.map((phase, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`bg-gradient-to-br from-gray-900 to-black border rounded-xl p-6 ${
                currentPhase === index ? 'border-neonGreen' : 'border-gray-700'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className="mr-4">{phase.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-neonGreen">{phase.title}</h3>
                  <p className="text-gray-400 text-sm">{phase.duration}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-gray-300 font-semibold mb-2">Resources:</h4>
                {phase.resources.map((resource, idx) => (
                  <div key={idx} className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-gray-400">{resource.name}</span>
                    <span className="text-neonGreen">{resource.hours}h</span>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="text-gray-300 font-semibold mb-2">Objectives:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  {phase.objectives.map((objective, idx) => (
                    <li key={idx}>• {objective}</li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={() => setCurrentPhase(index)}
                className={`mt-4 w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                  currentPhase === index
                    ? 'bg-neonGreen text-black'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {currentPhase === index ? 'Current Phase' : 'Select Phase'}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold text-neonGreen mb-6 text-center">
          🏆 Learning Milestones
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              whileHover={{ scale: 1.05 }}
              className={`bg-gradient-to-br from-gray-900 to-black border rounded-xl p-6 cursor-pointer transition-all ${
                completedMilestones.includes(milestone.id)
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-gray-700 hover:border-neonGreen'
              }`}
              onClick={() => toggleMilestone(milestone.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`mr-3 ${
                    completedMilestones.includes(milestone.id) ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {completedMilestones.includes(milestone.id) ? 
                      <CheckCircle className="w-6 h-6" /> : 
                      <Award className="w-6 h-6" />
                    }
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      completedMilestones.includes(milestone.id) ? 'text-green-400' : 'text-white'
                    }`}>
                      {milestone.title}
                    </h3>
                    <p className="text-gray-400 text-sm">Phase {milestone.phase + 1}</p>
                  </div>
                </div>
              </div>
              
              <div className={`w-full h-2 rounded-full ${
                completedMilestones.includes(milestone.id) ? 'bg-green-500' : 'bg-gray-700'
              }`}>
                <div className={`h-full rounded-full transition-all duration-500 ${
                  completedMilestones.includes(milestone.id) ? 'w-full bg-green-400' : 'w-0'
                }`}></div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-neonGreen mb-6">
          ⚡ Quick Actions
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { label: 'Start 3Blue1Brown', url: 'https://www.youtube.com/c/3blue1brown', icon: <PlayCircle className="w-5 h-5" /> },
            { label: 'Topology Without Tears', url: 'https://topologywithouttears.net', icon: <BookOpen className="w-5 h-5" /> },
            { label: 'MIT OCW 18.901', url: 'https://ocw.mit.edu/courses/mathematics/18-901-introduction-to-topology-fall-2004/', icon: <Globe className="w-5 h-5" /> },
            { label: 'Brilliant.org', url: 'https://brilliant.org', icon: <Zap className="w-5 h-5" /> }
          ].map((action, index) => (
            <motion.a
              key={index}
              href={action.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-neonGreen text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-400 transition-all"
            >
              <div>{action.icon}</div>
              <span>{action.label}</span>
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="mt-16 text-center text-gray-400"
      >
        <p className="mb-2">© 2025 AMRIKYY AI Solutions | Quantum Education for the Next Era</p>
        <p className="text-neonGreen text-sm">
          "Mastering topology isn't about memorizing shapes — it's about learning to see continuity in chaos."
        </p>
      </motion.div>
    </div>
  );
}
