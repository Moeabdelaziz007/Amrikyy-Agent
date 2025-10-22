import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Code,
  TrendingUp,
  BookOpen,
  PlayCircle,
  Award,
  Target,
  Users,
  Zap,
  Globe,
  Rocket,
  Star,
  CheckCircle,
  Clock,
  BarChart3,
  Cpu,
  Database,
  Network,
} from 'lucide-react';

export default function AIAgentsEducationSystem() {
  const [activeTab, setActiveTab] = useState('quantum');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [progress, setProgress] = useState({
    quantum: 25,
    algorithms: 15,
    trading: 10,
  });

  const domains = [
    {
      id: 'quantum',
      title: 'الحوسبة الكمومية',
      icon: <Brain className="text-neonGreen w-8 h-8" />,
      description: 'تعلم أساسيات الحوسبة الكمومية والخوارزميات المتقدمة',
      color: 'from-purple-900 to-purple-600',
      courses: [
        {
          title: 'IBM Qiskit Textbook',
          level: 'مبتدئ-متقدم',
          duration: '16 أسبوع',
          description: 'كتاب تفاعلي شامل لتعلم الحوسبة الكمومية',
          resources: ['Qiskit Textbook', 'IBM Quantum Lab', 'مشاريع عملية'],
          progress: 30,
        },
        {
          title: 'MIT 8.370 - Quantum Computation',
          level: 'متقدم',
          duration: '12 أسبوع',
          description: 'كورس جامعي متقدم من معهد ماساتشوستس',
          resources: ['محاضرات MIT', 'واجبات', 'امتحانات'],
          progress: 15,
        },
        {
          title: 'Stanford CS269I',
          level: 'متقدم',
          duration: '10 أسبوع',
          description: 'خوارزميات كمومية متقدمة',
          resources: ['محاضرات Stanford', 'أبحاث', 'مشاريع'],
          progress: 5,
        },
      ],
    },
    {
      id: 'algorithms',
      title: 'البرمجة والخوارزميات',
      icon: <Code className="text-neonGreen w-8 h-8" />,
      description: 'إتقان البرمجة والخوارزميات المتقدمة',
      color: 'from-blue-900 to-blue-600',
      courses: [
        {
          title: 'MIT 6.006 - Introduction to Algorithms',
          level: 'متوسط',
          duration: '16 أسبوع',
          description: 'مقدمة شاملة للخوارزميات وهياكل البيانات',
          resources: ['محاضرات MIT', 'LeetCode', 'مسابقات'],
          progress: 40,
        },
        {
          title: 'Stanford CS161 - Design and Analysis',
          level: 'متقدم',
          duration: '10 أسبوع',
          description: 'تصميم وتحليل الخوارزميات المتقدمة',
          resources: ['محاضرات Stanford', 'HackerRank', 'CodeForces'],
          progress: 20,
        },
        {
          title: 'Princeton COS226 - Data Structures',
          level: 'متوسط',
          duration: '12 أسبوع',
          description: 'هياكل البيانات والخوارزميات الأساسية',
          resources: ['محاضرات Princeton', 'مشاريع', 'اختبارات'],
          progress: 35,
        },
      ],
    },
    {
      id: 'trading',
      title: 'التداول الذكي',
      icon: <TrendingUp className="text-neonGreen w-8 h-8" />,
      description: 'تطوير استراتيجيات تداول ذكية باستخدام الذكاء الاصطناعي',
      color: 'from-green-900 to-green-600',
      courses: [
        {
          title: 'QuantConnect Platform',
          level: 'متوسط',
          duration: '14 أسبوع',
          description: 'منصة التداول الكمي والتطوير',
          resources: ['QuantConnect', 'Backtesting', 'Live Trading'],
          progress: 25,
        },
        {
          title: 'MIT 15.401 - Finance Theory',
          level: 'متقدم',
          duration: '12 أسبوع',
          description: 'نظرية المالية والأسواق',
          resources: ['محاضرات MIT', 'دراسات حالة', 'محاكاة'],
          progress: 10,
        },
        {
          title: 'Machine Learning for Trading',
          level: 'متقدم',
          duration: '16 أسبوع',
          description: 'تعلم الآلة في التداول والتنبؤ',
          resources: ['TensorFlow', 'PyTorch', 'OpenAI Gym'],
          progress: 5,
        },
      ],
    },
  ];

  const learningPaths = [
    {
      title: 'المسار السريع',
      duration: '90 يوم',
      description: 'تعلم أساسي في جميع المجالات',
      icon: <Rocket className="w-6 h-6" />,
      features: ['أساسيات كل مجال', 'مشاريع عملية', 'شهادة إتمام'],
      price: 'مجاني',
    },
    {
      title: 'المسار المتقدم',
      duration: '6 أشهر',
      description: 'تعمق في التخصصات المتقدمة',
      icon: <Star className="w-6 h-6" />,
      features: ['تعمق أكاديمي', 'مشاريع بحثية', 'شهادات معتمدة'],
      price: '$299',
    },
    {
      title: 'المسار الخبير',
      duration: '12 شهر',
      description: 'إعداد للبحث والتطوير المتقدم',
      icon: <Award className="w-6 h-6" />,
      features: ['بحث أكاديمي', 'نشر أوراق', 'شهادات دولية'],
      price: '$599',
    },
  ];

  const achievements = [
    {
      title: 'أساسيات الحوسبة الكمومية',
      icon: <Brain className="w-5 h-5" />,
      earned: true,
    },
    {
      title: 'خبير الخوارزميات',
      icon: <Code className="w-5 h-5" />,
      earned: false,
    },
    {
      title: 'مطور التداول الذكي',
      icon: <TrendingUp className="w-5 h-5" />,
      earned: false,
    },
    { title: 'باحث متقدم', icon: <Globe className="w-5 h-5" />, earned: false },
  ];

  const tools = [
    {
      category: 'الحوسبة الكمومية',
      items: [
        {
          name: 'IBM Qiskit',
          description: 'منصة البرمجة الكمومية',
          icon: <Cpu className="w-5 h-5" />,
        },
        {
          name: 'Microsoft Q#',
          description: 'لغة البرمجة الكمومية',
          icon: <Code className="w-5 h-5" />,
        },
        {
          name: 'Google Cirq',
          description: 'مكتبة الحوسبة الكمومية',
          icon: <Network className="w-5 h-5" />,
        },
      ],
    },
    {
      category: 'البرمجة والخوارزميات',
      items: [
        {
          name: 'LeetCode',
          description: 'منصة حل المشاكل',
          icon: <Target className="w-5 h-5" />,
        },
        {
          name: 'HackerRank',
          description: 'مسابقات البرمجة',
          icon: <Award className="w-5 h-5" />,
        },
        {
          name: 'CodeForces',
          description: 'مسابقات دولية',
          icon: <Star className="w-5 h-5" />,
        },
      ],
    },
    {
      category: 'التداول الذكي',
      items: [
        {
          name: 'QuantConnect',
          description: 'منصة التداول الكمي',
          icon: <BarChart3 className="w-5 h-5" />,
        },
        {
          name: 'Backtrader',
          description: 'مكتبة المحاكاة',
          icon: <Database className="w-5 h-5" />,
        },
        {
          name: 'OpenAI Gym',
          description: 'بيئة التعلم المعزز',
          icon: <Brain className="w-5 h-5" />,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-bold text-neonGreen mb-4 neon-glow">
          🤖 نظام تعليم الوكلاء الذكيين
        </h1>
        <p className="text-xl text-gray-300 max-w-4xl mx-auto">
          تعلم الحوسبة الكمومية والبرمجة المتقدمة والتداول الذكي من أفضل
          الجامعات والمصادر العالمية
        </p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        {domains.map((domain, index) => (
          <motion.div
            key={domain.id}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-gray-900 to-black border border-neonGreen/40 rounded-xl p-6"
          >
            <div className="flex items-center mb-4">
              <div className="mr-4">{domain.icon}</div>
              <div>
                <h3 className="text-lg font-bold text-neonGreen">
                  {domain.title}
                </h3>
                <p className="text-gray-400 text-sm">{domain.description}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">التقدم</span>
                <span className="text-neonGreen">{progress[domain.id]}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-neonGreen h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${progress[domain.id]}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab(domain.id)}
              className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                activeTab === domain.id
                  ? 'bg-neonGreen text-black'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {activeTab === domain.id ? 'محدد حالياً' : 'اختيار المجال'}
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Course Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold text-neonGreen mb-6 text-center">
          📚 الكورسات المتاحة
        </h2>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {domains
              .find(d => d.id === activeTab)
              ?.courses.map((course, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-gray-900 to-black border border-neonGreen/40 rounded-xl p-6"
                >
                  <h3 className="text-xl font-bold text-neonGreen mb-2">
                    {course.title}
                  </h3>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-400">
                      المستوى: {course.level}
                    </span>
                    <span className="text-gray-400">{course.duration}</span>
                  </div>

                  <p className="text-gray-300 text-sm mb-4">
                    {course.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">التقدم</span>
                      <span className="text-neonGreen">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-neonGreen h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-gray-300 font-semibold mb-2">
                      الموارد:
                    </h4>
                    <div className="space-y-1">
                      {course.resources.map((resource, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded"
                        >
                          {resource}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="w-full bg-neonGreen text-black py-2 px-4 rounded-lg font-semibold hover:bg-green-400 transition-all"
                  >
                    ابدأ التعلم
                  </button>
                </motion.div>
              ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Learning Paths */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold text-neonGreen mb-6 text-center">
          🚀 مسارات التعلم
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {learningPaths.map((path, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-gray-900 to-black border border-neonGreen/40 rounded-xl p-6"
            >
              <div className="flex items-center mb-4">
                <div className="mr-3 text-neonGreen">{path.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-neonGreen">
                    {path.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{path.duration}</p>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4">{path.description}</p>

              <div className="mb-4">
                <h4 className="text-gray-300 font-semibold mb-2">المميزات:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  {path.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-neonGreen mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-neonGreen">
                  {path.price}
                </span>
                <button className="bg-neonGreen text-black px-6 py-2 rounded-lg font-semibold hover:bg-green-400 transition-all">
                  اختر المسار
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tools and Resources */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold text-neonGreen mb-6 text-center">
          🛠️ الأدوات والموارد
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((toolCategory, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-gray-900 to-black border border-neonGreen/40 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-neonGreen mb-4">
                {toolCategory.category}
              </h3>
              <div className="space-y-3">
                {toolCategory.items.map((tool, idx) => (
                  <div
                    key={idx}
                    className="flex items-center p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="mr-3 text-neonGreen">{tool.icon}</div>
                    <div>
                      <h4 className="text-white font-semibold">{tool.name}</h4>
                      <p className="text-gray-400 text-sm">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold text-neonGreen mb-6 text-center">
          🏆 الإنجازات والشهادات
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className={`bg-gradient-to-br from-gray-900 to-black border rounded-xl p-6 text-center ${
                achievement.earned
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-gray-700'
              }`}
            >
              <div
                className={`mb-4 ${
                  achievement.earned ? 'text-green-400' : 'text-gray-400'
                }`}
              >
                {achievement.icon}
              </div>
              <h3
                className={`font-semibold ${
                  achievement.earned ? 'text-green-400' : 'text-gray-400'
                }`}
              >
                {achievement.title}
              </h3>
              {achievement.earned && (
                <div className="mt-2 text-xs text-green-400">✅ مكتمل</div>
              )}
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
        <h2 className="text-3xl font-bold text-neonGreen mb-6">⚡ ابدأ الآن</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            {
              label: 'ابدأ مع Qiskit',
              url: 'https://qiskit.org/textbook/',
              icon: <Brain className="w-5 h-5" />,
            },
            {
              label: 'LeetCode',
              url: 'https://leetcode.com/',
              icon: <Code className="w-5 h-5" />,
            },
            {
              label: 'QuantConnect',
              url: 'https://www.quantconnect.com/',
              icon: <TrendingUp className="w-5 h-5" />,
            },
            {
              label: 'MIT OCW',
              url: 'https://ocw.mit.edu/',
              icon: <BookOpen className="w-5 h-5" />,
            },
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
        <p className="mb-2">
          © 2025 AMRIKYY AI Solutions — تعليم الوكلاء الذكيين للجيل القادم
        </p>
        <p className="text-neonGreen text-sm">
          "تعلم الحوسبة الكمومية والبرمجة المتقدمة والتداول الذكي من أفضل
          المصادر العالمية"
        </p>
      </motion.div>
    </div>
  );
}
