import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  Play,
  Pause,
  RotateCcw,
  Settings,
  BookOpen,
  Code2,
  Zap,
  CheckCircle,
  Circle,
  ArrowRight,
  Star,
  Trophy,
  Clock,
} from 'lucide-react';

interface QuantumGate {
  id: string;
  name: string;
  symbol: string;
  description: string;
  matrix: string[][];
  effect: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface QuantumCircuit {
  id: string;
  name: string;
  gates: string[];
  qubits: number;
  description: string;
  result: string;
}

const QuantumComputingDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'learn' | 'build' | 'simulate'>(
    'learn'
  );
  const [selectedGate, setSelectedGate] = useState<QuantumGate | null>(null);
  const [circuit, setCircuit] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const quantumGates: QuantumGate[] = [
    {
      id: 'pauli-x',
      name: 'Pauli-X (NOT)',
      symbol: 'X',
      description: 'Flips the qubit state from |0⟩ to |1⟩ and vice versa',
      matrix: [
        ['0', '1'],
        ['1', '0'],
      ],
      effect: 'Bit flip operation',
      difficulty: 'beginner',
    },
    {
      id: 'pauli-y',
      name: 'Pauli-Y',
      symbol: 'Y',
      description: 'Rotates qubit around Y-axis by π radians',
      matrix: [
        ['0', '-i'],
        ['i', '0'],
      ],
      effect: 'Y-axis rotation',
      difficulty: 'beginner',
    },
    {
      id: 'pauli-z',
      name: 'Pauli-Z',
      symbol: 'Z',
      description: 'Rotates qubit around Z-axis by π radians',
      matrix: [
        ['1', '0'],
        ['0', '-1'],
      ],
      effect: 'Z-axis rotation',
      difficulty: 'beginner',
    },
    {
      id: 'hadamard',
      name: 'Hadamard',
      symbol: 'H',
      description: 'Creates superposition: |0⟩ → (|0⟩ + |1⟩)/√2',
      matrix: [
        ['1/√2', '1/√2'],
        ['1/√2', '-1/√2'],
      ],
      effect: 'Creates superposition',
      difficulty: 'beginner',
    },
    {
      id: 'cnot',
      name: 'CNOT (Controlled-NOT)',
      symbol: 'CNOT',
      description: 'Controlled NOT gate - flips target qubit if control is |1⟩',
      matrix: [
        ['1', '0', '0', '0'],
        ['0', '1', '0', '0'],
        ['0', '0', '0', '1'],
        ['0', '0', '1', '0'],
      ],
      effect: 'Entangles two qubits',
      difficulty: 'intermediate',
    },
    {
      id: 'toffoli',
      name: 'Toffoli (CCNOT)',
      symbol: 'CCNOT',
      description:
        'Double-controlled NOT gate - universal for quantum computation',
      matrix: [
        ['1', '0', '0', '0', '0', '0', '0', '0'],
        ['0', '1', '0', '0', '0', '0', '0', '0'],
        ['0', '0', '1', '0', '0', '0', '0', '0'],
        ['0', '0', '0', '1', '0', '0', '0', '0'],
        ['0', '0', '0', '0', '1', '0', '0', '0'],
        ['0', '0', '0', '0', '0', '1', '0', '0'],
        ['0', '0', '0', '0', '0', '0', '0', '1'],
        ['0', '0', '0', '0', '0', '0', '1', '0'],
      ],
      effect: 'Universal quantum gate',
      difficulty: 'advanced',
    },
  ];

  const quantumCircuits: QuantumCircuit[] = [
    {
      id: 'bell-state',
      name: 'Bell State Creation',
      gates: ['H', 'CNOT'],
      qubits: 2,
      description: 'Creates an entangled Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2',
      result: 'Entangled state with perfect correlation',
    },
    {
      id: 'superposition',
      name: 'Superposition Demo',
      gates: ['H'],
      qubits: 1,
      description: 'Creates a superposition state from |0⟩',
      result: 'Equal superposition of |0⟩ and |1⟩',
    },
    {
      id: 'quantum-teleportation',
      name: 'Quantum Teleportation',
      gates: ['H', 'CNOT', 'X', 'Z'],
      qubits: 3,
      description: 'Teleports quantum information between qubits',
      result: 'Information transferred without physical movement',
    },
  ];

  const lessons = [
    {
      id: 'lesson-1',
      title: 'Introduction to Quantum Computing',
      duration: '15 min',
      difficulty: 'beginner',
      description:
        'Learn the fundamental concepts of quantum computing and qubits',
      completed: completedLessons.includes('lesson-1'),
    },
    {
      id: 'lesson-2',
      title: 'Quantum Gates and Operations',
      duration: '25 min',
      difficulty: 'beginner',
      description: 'Master the basic quantum gates: X, Y, Z, and Hadamard',
      completed: completedLessons.includes('lesson-2'),
    },
    {
      id: 'lesson-3',
      title: 'Entanglement and Bell States',
      duration: '30 min',
      difficulty: 'intermediate',
      description: 'Understand quantum entanglement and create Bell states',
      completed: completedLessons.includes('lesson-3'),
    },
    {
      id: 'lesson-4',
      title: 'Quantum Algorithms',
      duration: '45 min',
      difficulty: 'advanced',
      description: 'Explore famous quantum algorithms like Grover and Shor',
      completed: completedLessons.includes('lesson-4'),
    },
  ];

  const addGateToCircuit = (gateId: string) => {
    if (circuit.length < 5) {
      setCircuit([...circuit, gateId]);
    }
  };

  const removeGateFromCircuit = (index: number) => {
    setCircuit(circuit.filter((_, i) => i !== index));
  };

  const simulateCircuit = () => {
    setIsSimulating(true);
    setSimulationResult(null);

    // Simulate quantum circuit execution
    setTimeout(() => {
      let result = '|0⟩';
      circuit.forEach((gateId, index) => {
        const gate = quantumGates.find(g => g.id === gateId);
        if (gate) {
          if (gate.id === 'hadamard') {
            result = index === 0 ? '(|0⟩ + |1⟩)/√2' : 'Entangled superposition';
          } else if (gate.id === 'pauli-x') {
            result = result.includes('|0⟩') ? '|1⟩' : '|0⟩';
          } else if (gate.id === 'cnot') {
            result = 'Entangled state |Φ⁺⟩';
          }
        }
      });

      setSimulationResult(result);
      setIsSimulating(false);
    }, 2000);
  };

  const resetCircuit = () => {
    setCircuit([]);
    setSimulationResult(null);
  };

  const completeLesson = (lessonId: string) => {
    setCompletedLessons([...completedLessons, lessonId]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-400';
      case 'intermediate':
        return 'text-yellow-400';
      case 'advanced':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030712] via-[#0A0F1C] to-[#111827] text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Network size={48} className="text-cyan-400" />
          </motion.div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            Quantum Computing Lab
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Master quantum gates, build circuits, and simulate quantum
            algorithms in our interactive quantum computing environment
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Learning Progress</span>
            <span className="text-sm text-cyan-400">
              {completedLessons.length}/4 lessons completed
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedLessons.length / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 rounded-xl p-1 flex space-x-1">
            {[
              { id: 'learn', label: 'Learn', icon: BookOpen },
              { id: 'build', label: 'Build', icon: Code2 },
              { id: 'simulate', label: 'Simulate', icon: Zap },
            ].map(tab => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'learn' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Lessons */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Learning Path
                </h2>
                {lessons.map((lesson, index) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-xl border transition-all duration-300 ${
                      lesson.completed
                        ? 'bg-green-900/20 border-green-500/50'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {lesson.completed ? (
                            <CheckCircle size={20} className="text-green-400" />
                          ) : (
                            <Circle size={20} className="text-slate-400" />
                          )}
                          <h3 className="text-lg font-semibold text-white">
                            {lesson.title}
                          </h3>
                          <span
                            className={`text-sm font-medium ${getDifficultyColor(
                              lesson.difficulty
                            )}`}
                          >
                            {lesson.difficulty}
                          </span>
                        </div>
                        <p className="text-slate-300 mb-3">
                          {lesson.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <Clock size={16} />
                            <span>{lesson.duration}</span>
                          </div>
                        </div>
                      </div>
                      {!lesson.completed && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => completeLesson(lesson.id)}
                          className="ml-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                        >
                          Start
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quantum Gates Library */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Quantum Gates Library
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {quantumGates.map((gate, index) => (
                    <motion.div
                      key={gate.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedGate(gate)}
                      className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl cursor-pointer hover:border-cyan-500/50 transition-all duration-300"
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                          {gate.symbol}
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-1">
                          {gate.name}
                        </h3>
                        <span
                          className={`text-xs ${getDifficultyColor(
                            gate.difficulty
                          )}`}
                        >
                          {gate.difficulty}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'build' && (
            <motion.div
              key="build"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Circuit Builder */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Circuit Builder
                  </h2>
                  <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Your Quantum Circuit
                      </h3>
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={resetCircuit}
                          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                        >
                          <RotateCcw size={16} className="text-white" />
                        </motion.button>
                      </div>
                    </div>
                    <div className="min-h-[200px] bg-slate-900/50 rounded-lg p-4 border-2 border-dashed border-slate-600">
                      {circuit.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-400">
                          <div className="text-center">
                            <Network
                              size={48}
                              className="mx-auto mb-2 opacity-50"
                            />
                            <p>Add quantum gates to build your circuit</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <span className="text-slate-400">|0⟩</span>
                          {circuit.map((gateId, index) => {
                            const gate = quantumGates.find(
                              g => g.id === gateId
                            );
                            return (
                              <motion.div
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="relative"
                              >
                                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                  {gate?.symbol}
                                </div>
                                <button
                                  onClick={() => removeGateFromCircuit(index)}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors"
                                >
                                  ×
                                </button>
                              </motion.div>
                            );
                          })}
                          <ArrowRight className="text-slate-400" size={24} />
                          <span className="text-cyan-400">Result</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gate Palette */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Available Gates
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {quantumGates.map(gate => (
                      <motion.button
                        key={gate.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addGateToCircuit(gate.id)}
                        disabled={circuit.length >= 5}
                        className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="text-center">
                          <div className="w-8 h-8 mx-auto mb-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">
                            {gate.symbol}
                          </div>
                          <p className="text-xs text-slate-300">
                            {gate.name.split(' ')[0]}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preset Circuits */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Preset Circuits
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quantumCircuits.map((circuit, index) => (
                    <motion.div
                      key={circuit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-cyan-500/50 transition-all duration-300"
                    >
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {circuit.name}
                      </h3>
                      <p className="text-slate-300 text-sm mb-3">
                        {circuit.description}
                      </p>
                      <div className="flex items-center space-x-2 mb-3">
                        {circuit.gates.map((gateSymbol, gateIndex) => (
                          <div
                            key={gateIndex}
                            className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded flex items-center justify-center text-white font-bold text-sm"
                          >
                            {gateSymbol}
                          </div>
                        ))}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCircuit(circuit.gates)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                      >
                        Load Circuit
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'simulate' && (
            <motion.div
              key="simulate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Quantum Circuit Simulator
                </h2>
                <p className="text-slate-300 mb-8">
                  Run your quantum circuit and see the results
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="p-8 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                  <div className="flex items-center justify-center space-x-8 mb-8">
                    <span className="text-slate-400">|0⟩</span>
                    {circuit.map((gateId, index) => {
                      const gate = quantumGates.find(g => g.id === gateId);
                      return (
                        <motion.div
                          key={index}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 0.5, delay: index * 0.2 }}
                          className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                        >
                          {gate?.symbol}
                        </motion.div>
                      );
                    })}
                    <ArrowRight className="text-slate-400" size={32} />
                    <div className="text-2xl font-bold text-cyan-400">
                      {isSimulating ? '...' : simulationResult || 'Ready'}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={simulateCircuit}
                      disabled={circuit.length === 0 || isSimulating}
                      className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSimulating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Simulating...</span>
                        </>
                      ) : (
                        <>
                          <Play size={20} />
                          <span>Run Simulation</span>
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetCircuit}
                      className="flex items-center space-x-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all duration-300"
                    >
                      <RotateCcw size={20} />
                      <span>Reset</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gate Details Modal */}
        <AnimatePresence>
          {selectedGate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedGate(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">
                    {selectedGate.name}
                  </h3>
                  <button
                    onClick={() => setSelectedGate(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                      {selectedGate.symbol}
                    </div>
                    <div>
                      <p className="text-slate-300 mb-2">
                        {selectedGate.description}
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                          selectedGate.difficulty
                        )}`}
                      >
                        {selectedGate.difficulty}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Matrix Representation
                    </h4>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-2 max-w-fit">
                        {selectedGate.matrix.map((row, rowIndex) =>
                          row.map((cell, colIndex) => (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              className="p-2 bg-slate-800 rounded text-center font-mono text-white"
                            >
                              {cell}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Effect
                    </h4>
                    <p className="text-slate-300">{selectedGate.effect}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuantumComputingDemo;
