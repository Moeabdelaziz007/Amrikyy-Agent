import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Globe, Atom } from 'lucide-react';

export default function TopologyHologram() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="text-5xl font-bold text-neonGreen mb-6 text-center drop-shadow-[0_0_15px_#39FF14]"
      >
        🌀 Topology Learning Hologram
      </motion.h1>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.3,
            },
          },
        }}
      >
        {[
          {
            icon: <Brain className="text-neonGreen w-12 h-12" />,
            title: 'Visual Learning',
            desc: 'Explore 3Blue1Brown and Mathologer for intuitive visualization of topology.',
            resources: ['3Blue1Brown', 'Numberphile', 'Mathologer'],
          },
          {
            icon: <BookOpen className="text-neonGreen w-12 h-12" />,
            title: 'Textbook Foundations',
            desc: "Study Topology Without Tears and Hatcher's Algebraic Topology for structured understanding.",
            resources: [
              'Topology Without Tears',
              'Hatcher Algebraic Topology',
              'Munkres Topology',
            ],
          },
          {
            icon: <Globe className="text-neonGreen w-12 h-12" />,
            title: 'MIT OpenCourseWare',
            desc: 'Access 18.901 and 18.905 courses to deepen your geometric and algebraic topology knowledge.',
            resources: [
              '18.901 Introduction to Topology',
              '18.905 Algebraic Topology',
              '18.966 Geometry of Manifolds',
            ],
          },
          {
            icon: <Atom className="text-neonGreen w-12 h-12" />,
            title: 'Interactive Tools',
            desc: 'Use Brilliant, Wolfram, and Desmos to simulate topological transformations and manifolds.',
            resources: [
              'Wolfram MathWorld',
              'Brilliant.org',
              'Desmos',
              "Paul's Online Math Notes",
            ],
          },
        ].map((card, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05, rotateY: 10 }}
            transition={{ type: 'spring', stiffness: 150 }}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-neonGreen/40 rounded-2xl p-6 text-center shadow-[0_0_20px_#39FF14]/20"
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <div className="flex justify-center mb-4">{card.icon}</div>
            <h2 className="text-2xl font-semibold mb-2 text-neonGreen">
              {card.title}
            </h2>
            <p className="text-gray-300 text-sm mb-4">{card.desc}</p>

            {/* Resource Links */}
            <div className="space-y-1">
              {card.resources.map((resource, idx) => (
                <div
                  key={idx}
                  className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded"
                >
                  {resource}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Learning Path Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="mt-12 max-w-4xl"
      >
        <h3 className="text-2xl font-semibold text-neonGreen mb-6 text-center">
          🎯 30-Day Learning Path
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              week: 1,
              focus: 'Foundations',
              tasks: ['3Blue1Brown Linear Algebra', 'Numberphile Topology'],
            },
            {
              week: 2,
              focus: 'Visual Learning',
              tasks: ['Mathologer Series', 'Topology Without Tears Ch.1-2'],
            },
            {
              week: 3,
              focus: 'Conceptual Depth',
              tasks: ['3Blue1Brown Calculus', 'Topology Applications'],
            },
            {
              week: 4,
              focus: 'Integration',
              tasks: ['MIT OCW 18.901', 'Textbook Practice'],
            },
          ].map((week, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2 + index * 0.2 }}
              className="bg-gradient-to-br from-gray-900 to-black border border-neonGreen/30 rounded-lg p-4"
            >
              <div className="text-neonGreen font-semibold mb-2">
                Week {week.week}
              </div>
              <div className="text-white text-sm font-medium mb-2">
                {week.focus}
              </div>
              <div className="space-y-1">
                {week.tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-gray-400 bg-gray-800/30 px-2 py-1 rounded"
                  >
                    {task}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Progress Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5 }}
        className="mt-12 max-w-4xl"
      >
        <h3 className="text-2xl font-semibold text-neonGreen mb-6 text-center">
          🏆 Learning Milestones
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              timeframe: '30 Days',
              achievements: [
                'Understand topology basics',
                'Recognize topological properties',
                'Solve simple problems',
              ],
              color: 'text-green-400',
            },
            {
              timeframe: '90 Days',
              achievements: [
                'Master general topology',
                'Work with topological spaces',
                'Begin algebraic topology',
              ],
              color: 'text-yellow-400',
            },
            {
              timeframe: '6 Months',
              achievements: [
                'Complete algebraic topology',
                'Apply to complex problems',
                'Read research papers',
              ],
              color: 'text-purple-400',
            },
          ].map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3 + index * 0.2 }}
              className="bg-gradient-to-br from-gray-900 to-black border border-neonGreen/30 rounded-lg p-6"
            >
              <div className={`${milestone.color} font-semibold text-lg mb-3`}>
                {milestone.timeframe}
              </div>
              <div className="space-y-2">
                {milestone.achievements.map((achievement, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-neonGreen rounded-full"></div>
                    <span className="text-gray-300 text-sm">{achievement}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 4 }}
        className="mt-10 text-center"
      >
        <p className="text-gray-400 text-sm mb-2">
          © 2025 AMRIKYY AI Solutions | Quantum Learning Environment
        </p>
        <p className="text-neonGreen text-xs">
          "Learn visually, prove rigorously, and think topologically."
        </p>
      </motion.div>
    </div>
  );
}
