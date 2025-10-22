import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Circle,
  Clock,
  Star,
  Trophy,
  Zap,
  Target,
  TrendingUp,
  BookOpen,
  Settings,
  Copy,
  Download,
} from 'lucide-react';

interface Algorithm {
  id: string;
  name: string;
  category:
    | 'sorting'
    | 'searching'
    | 'graph'
    | 'dynamic-programming'
    | 'greedy';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  code: string;
  visualization: string[];
}

interface Problem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  acceptance: number;
  description: string;
  examples: { input: string; output: string; explanation: string }[];
  constraints: string[];
  tags: string[];
}

interface TestCase {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
}

const ProgrammingAlgorithmsDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'learn' | 'practice' | 'code'>(
    'learn'
  );
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm | null>(
    null
  );
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [completedProblems, setCompletedProblems] = useState<string[]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);

  const algorithms: Algorithm[] = [
    {
      id: 'bubble-sort',
      name: 'Bubble Sort',
      category: 'sorting',
      difficulty: 'beginner',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      description:
        'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
      code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
      visualization: [
        'Compare adjacent elements',
        'Swap if in wrong order',
        'Repeat until sorted',
      ],
    },
    {
      id: 'quick-sort',
      name: 'Quick Sort',
      category: 'sorting',
      difficulty: 'intermediate',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(log n)',
      description:
        'An efficient sorting algorithm that uses divide and conquer strategy. It picks a pivot element and partitions the array around the pivot.',
      code: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivotIndex = partition(arr, low, high);
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
      visualization: [
        'Choose pivot',
        'Partition array',
        'Recursively sort subarrays',
      ],
    },
    {
      id: 'binary-search',
      name: 'Binary Search',
      category: 'searching',
      difficulty: 'beginner',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      description:
        'An efficient search algorithm that finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.',
      code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1; // Target not found
}`,
      visualization: [
        'Compare with middle element',
        'Eliminate half of array',
        'Repeat until found',
      ],
    },
    {
      id: 'dijkstra',
      name: "Dijkstra's Algorithm",
      category: 'graph',
      difficulty: 'advanced',
      timeComplexity: 'O((V + E) log V)',
      spaceComplexity: 'O(V)',
      description:
        'An algorithm for finding the shortest paths between nodes in a graph, which may represent road networks.',
      code: `function dijkstra(graph, start) {
  const distances = {};
  const previous = {};
  const pq = new PriorityQueue();
  
  // Initialize distances
  for (let vertex in graph) {
    distances[vertex] = vertex === start ? 0 : Infinity;
    pq.enqueue(vertex, distances[vertex]);
  }
  
  while (!pq.isEmpty()) {
    const current = pq.dequeue().element;
    
    for (let neighbor in graph[current]) {
      const distance = distances[current] + graph[current][neighbor];
      
      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
        previous[neighbor] = current;
        pq.enqueue(neighbor, distance);
      }
    }
  }
  
  return { distances, previous };
}`,
      visualization: [
        'Initialize distances',
        'Visit nearest unvisited node',
        'Update neighbor distances',
        'Repeat until all visited',
      ],
    },
  ];

  const problems: Problem[] = [
    {
      id: 'two-sum',
      title: 'Two Sum',
      difficulty: 'easy',
      acceptance: 45.7,
      description:
        'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
        },
        {
          input: 'nums = [3,2,4], target = 6',
          output: '[1,2]',
          explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
        },
      ],
      constraints: [
        '2 <= nums.length <= 10⁴',
        '-10⁹ <= nums[i] <= 10⁹',
        '-10⁹ <= target <= 10⁹',
        'Only one valid answer exists.',
      ],
      tags: ['Array', 'Hash Table'],
    },
    {
      id: 'valid-parentheses',
      title: 'Valid Parentheses',
      difficulty: 'easy',
      acceptance: 38.4,
      description:
        "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      examples: [
        {
          input: 's = "()"',
          output: 'true',
          explanation: 'The string contains valid parentheses.',
        },
        {
          input: 's = "([)]"',
          output: 'false',
          explanation: 'The string contains invalid parentheses.',
        },
      ],
      constraints: [
        '1 <= s.length <= 10⁴',
        "s consists of parentheses only '()[]{}'.",
      ],
      tags: ['String', 'Stack'],
    },
    {
      id: 'merge-two-sorted-lists',
      title: 'Merge Two Sorted Lists',
      difficulty: 'easy',
      acceptance: 56.3,
      description:
        'Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.',
      examples: [
        {
          input: 'l1 = [1,2,4], l2 = [1,3,4]',
          output: '[1,1,2,3,4,4]',
          explanation: 'Merge the two sorted lists.',
        },
      ],
      constraints: [
        'The number of nodes in both lists is in the range [0, 50].',
        '-100 <= Node.val <= 100',
        'Both l1 and l2 are sorted in non-decreasing order.',
      ],
      tags: ['Linked List', 'Recursion'],
    },
    {
      id: 'longest-substring-without-repeating-characters',
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'medium',
      acceptance: 33.1,
      description:
        'Given a string s, find the length of the longest substring without repeating characters.',
      examples: [
        {
          input: 's = "abcabcbb"',
          output: '3',
          explanation: 'The answer is "abc", with the length of 3.',
        },
        {
          input: 's = "bbbbb"',
          output: '1',
          explanation: 'The answer is "b", with the length of 1.',
        },
      ],
      constraints: [
        '0 <= s.length <= 5 * 10⁴',
        's consists of English letters, digits, symbols and spaces.',
      ],
      tags: ['Hash Table', 'String', 'Sliding Window'],
    },
  ];

  const lessons = [
    {
      id: 'lesson-1',
      title: 'Data Structures Fundamentals',
      duration: '30 min',
      difficulty: 'beginner',
      description: 'Learn arrays, linked lists, stacks, and queues',
      completed: true,
    },
    {
      id: 'lesson-2',
      title: 'Sorting Algorithms',
      duration: '45 min',
      difficulty: 'beginner',
      description:
        'Master bubble sort, selection sort, insertion sort, and merge sort',
      completed: true,
    },
    {
      id: 'lesson-3',
      title: 'Searching Algorithms',
      duration: '35 min',
      difficulty: 'beginner',
      description: 'Learn linear search, binary search, and their applications',
      completed: false,
    },
    {
      id: 'lesson-4',
      title: 'Graph Algorithms',
      duration: '60 min',
      difficulty: 'intermediate',
      description: 'Explore BFS, DFS, Dijkstra, and topological sorting',
      completed: false,
    },
    {
      id: 'lesson-5',
      title: 'Dynamic Programming',
      duration: '75 min',
      difficulty: 'advanced',
      description: 'Master memoization, tabulation, and common DP patterns',
      completed: false,
    },
  ];

  const runCode = async () => {
    if (!selectedProblem) return;

    setIsRunning(true);
    setTestResults([]);
    setExecutionTime(0);

    // Simulate code execution
    const startTime = Date.now();

    // Mock test cases based on the problem
    const mockTestCases: TestCase[] = [
      {
        input: selectedProblem.examples[0].input,
        expectedOutput: selectedProblem.examples[0].output,
      },
      {
        input: selectedProblem.examples[1]?.input || 'additional test case',
        expectedOutput:
          selectedProblem.examples[1]?.output || 'expected output',
      },
    ];

    // Simulate execution time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const endTime = Date.now();
    setExecutionTime(endTime - startTime);

    // Mock results (in real implementation, this would run the actual code)
    const results = mockTestCases.map(testCase => ({
      ...testCase,
      actualOutput: testCase.expectedOutput, // Mock success
      passed: Math.random() > 0.2, // 80% success rate for demo
    }));

    setTestResults(results);
    setIsRunning(false);

    // Check if all tests passed
    if (results.every(r => r.passed)) {
      setCompletedProblems([...completedProblems, selectedProblem.id]);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
      case 'beginner':
        return 'text-green-400';
      case 'medium':
      case 'intermediate':
        return 'text-yellow-400';
      case 'hard':
      case 'advanced':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sorting':
        return '🔄';
      case 'searching':
        return '🔍';
      case 'graph':
        return '🕸️';
      case 'dynamic-programming':
        return '🧮';
      case 'greedy':
        return '🎯';
      default:
        return '📚';
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
            <Code2 size={48} className="text-blue-400" />
          </motion.div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
            Programming & Algorithms Lab
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Master data structures, algorithms, and problem-solving techniques
            with interactive coding challenges and visualizations
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Learning Progress</span>
            <span className="text-sm text-blue-400">
              {completedProblems.length}/{problems.length} problems solved
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(completedProblems.length / problems.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 rounded-xl p-1 flex space-x-1">
            {[
              { id: 'learn', label: 'Learn', icon: BookOpen },
              { id: 'practice', label: 'Practice', icon: Target },
              { id: 'code', label: 'Code', icon: Code2 },
            ].map(tab => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
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
                    open={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-xl border transition-all duration-300 ${
                      lesson.completed
                        ? 'bg-green-900/20 border-green-500/50'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50'
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
                            className={`text-sm font-medium ${getDifficultyColor(lesson.difficulty)}`}
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
                          className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                        >
                          Start
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Algorithms Library */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Algorithm Library
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {algorithms.map((algorithm, index) => (
                    <motion.div
                      key={algorithm.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedAlgorithm(algorithm)}
                      className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl cursor-pointer hover:border-blue-500/50 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {getCategoryIcon(algorithm.category)}
                          </span>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {algorithm.name}
                            </h3>
                            <p className="text-sm text-slate-400 capitalize">
                              {algorithm.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-300">
                            <div>Time: {algorithm.timeComplexity}</div>
                            <div>Space: {algorithm.spaceComplexity}</div>
                          </div>
                          <span
                            className={`text-xs font-medium ${getDifficultyColor(algorithm.difficulty)}`}
                          >
                            {algorithm.difficulty}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'practice' && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Coding Problems
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {problems.map((problem, index) => (
                  <motion.div
                    key={problem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
                      completedProblems.includes(problem.id)
                        ? 'bg-green-900/20 border-green-500/50'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50'
                    }`}
                    onClick={() => setSelectedProblem(problem)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {completedProblems.includes(problem.id) ? (
                            <CheckCircle size={20} className="text-green-400" />
                          ) : (
                            <Circle size={20} className="text-slate-400" />
                          )}
                          <h3 className="text-xl font-semibold text-white">
                            {problem.title}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}
                          >
                            {problem.difficulty}
                          </span>
                        </div>
                        <p className="text-slate-300 mb-3">
                          {problem.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <TrendingUp size={16} />
                            <span>{problem.acceptance}% acceptance</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {problem.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'code' && selectedProblem && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Problem Description */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                      {selectedProblem.title}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedProblem.difficulty)}`}
                    >
                      {selectedProblem.difficulty}
                    </span>
                  </div>
                  <p className="text-slate-300">
                    {selectedProblem.description}
                  </p>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Examples
                    </h3>
                    {selectedProblem.examples.map((example, index) => (
                      <div
                        key={index}
                        className="bg-slate-800/50 rounded-lg p-4 mb-3"
                      >
                        <div className="text-sm text-slate-400 mb-1">
                          Example {index + 1}:
                        </div>
                        <div className="text-sm text-white mb-2">
                          <strong>Input:</strong> {example.input}
                        </div>
                        <div className="text-sm text-white mb-2">
                          <strong>Output:</strong> {example.output}
                        </div>
                        <div className="text-sm text-slate-300">
                          <strong>Explanation:</strong> {example.explanation}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Constraints
                    </h3>
                    <ul className="text-sm text-slate-300 space-y-1">
                      {selectedProblem.constraints.map((constraint, index) => (
                        <li key={index}>• {constraint}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Code Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Code Editor
                    </h3>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                      >
                        <Copy size={16} className="text-white" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                      >
                        <Download size={16} className="text-white" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-lg p-4">
                    <textarea
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      placeholder="// Write your solution here..."
                      className="w-full h-64 bg-transparent text-white font-mono text-sm resize-none outline-none"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={runCode}
                      disabled={isRunning || !code.trim()}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRunning ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <Play size={20} />
                          <span>Run Code</span>
                        </>
                      )}
                    </motion.button>

                    {executionTime > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <Clock size={16} />
                        <span>Execution time: {executionTime}ms</span>
                      </div>
                    )}
                  </div>

                  {/* Test Results */}
                  {testResults.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-white">
                        Test Results
                      </h4>
                      {testResults.map((result, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            result.passed
                              ? 'bg-green-900/20 border-green-500/50'
                              : 'bg-red-900/20 border-red-500/50'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            {result.passed ? (
                              <CheckCircle
                                size={16}
                                className="text-green-400"
                              />
                            ) : (
                              <Circle size={16} className="text-red-400" />
                            )}
                            <span className="text-sm font-medium">
                              Test Case {index + 1} -{' '}
                              {result.passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                          <div className="text-sm text-slate-300">
                            <div>
                              <strong>Input:</strong> {result.input}
                            </div>
                            <div>
                              <strong>Expected:</strong> {result.expectedOutput}
                            </div>
                            <div>
                              <strong>Actual:</strong> {result.actualOutput}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Algorithm Details Modal */}
        <AnimatePresence>
          {selectedAlgorithm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedAlgorithm(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">
                    {selectedAlgorithm.name}
                  </h3>
                  <button
                    onClick={() => setSelectedAlgorithm(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Time Complexity
                      </h4>
                      <p className="text-blue-400 font-mono">
                        {selectedAlgorithm.timeComplexity}
                      </p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Space Complexity
                      </h4>
                      <p className="text-blue-400 font-mono">
                        {selectedAlgorithm.spaceComplexity}
                      </p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Difficulty
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedAlgorithm.difficulty)}`}
                      >
                        {selectedAlgorithm.difficulty}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Description
                    </h4>
                    <p className="text-slate-300">
                      {selectedAlgorithm.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Implementation
                    </h4>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                        <code>{selectedAlgorithm.code}</code>
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Visualization Steps
                    </h4>
                    <ol className="list-decimal list-inside space-y-2">
                      {selectedAlgorithm.visualization.map((step, index) => (
                        <li key={index} className="text-slate-300">
                          {step}
                        </li>
                      ))}
                    </ol>
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

export default ProgrammingAlgorithmsDemo;
