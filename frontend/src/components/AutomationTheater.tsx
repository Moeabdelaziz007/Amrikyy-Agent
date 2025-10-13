import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  CheckCircle2,
  Clock,
  Loader2,
  MousePointer2,
  Eye,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Search,
  Edit3,
  MousePointerClick,
  Award,
} from 'lucide-react';

interface Action {
  id: string;
  type: 'typing' | 'clicking' | 'analyzing' | 'waiting' | 'success';
  description: string;
  timestamp: Date;
  screenshot?: string;
  status: 'pending' | 'in-progress' | 'completed';
  estimatedTime?: number;
}

interface CursorPosition {
  x: number;
  y: number;
}

interface HighlightBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

const mockActions: Action[] = [
  {
    id: '1',
    type: 'clicking',
    description: 'Opening Booking.com to start your search...',
    timestamp: new Date(),
    status: 'completed',
  },
  {
    id: '2',
    type: 'typing',
    description: 'Filling in Cairo as destination and your dates...',
    timestamp: new Date(),
    status: 'completed',
  },
  {
    id: '3',
    type: 'analyzing',
    description: 'Found 243 hotels! Now filtering by your $150/night budget...',
    timestamp: new Date(),
    status: 'in-progress',
    estimatedTime: 45,
  },
  {
    id: '4',
    type: 'analyzing',
    description: 'Comparing top-rated options - This could take 30 seconds...',
    timestamp: new Date(),
    status: 'pending',
  },
  {
    id: '5',
    type: 'success',
    description: 'Done! Here are my top recommendations based on value and ratings.',
    timestamp: new Date(),
    status: 'pending',
  },
];

const actionIcons = {
  typing: Edit3,
  clicking: MousePointerClick,
  analyzing: Search,
  waiting: Clock,
  success: Award,
};

export function AutomationTheater() {
  const [actions, setActions] = useState<Action[]>(mockActions);
  const [currentActionIndex, setCurrentActionIndex] = useState(2);
  const [progress, setProgress] = useState(45);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 50, y: 50 });
  const [showClickRipple, setShowClickRipple] = useState(false);
  const [highlightBoxes, setHighlightBoxes] = useState<HighlightBox[]>([]);
  const [showAiVision, setShowAiVision] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const [showDealBadge, setShowDealBadge] = useState(false);

  // Simulate cursor movement - Optimized timing
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorPosition({
        x: Math.random() * 80 + 10,
        y: Math.random() * 70 + 15,
      });

      // Occasionally show click ripple
      if (Math.random() > 0.8) {
        setShowClickRipple(true);
        setTimeout(() => setShowClickRipple(false), 800);
      }

      // Occasionally show AI vision
      if (Math.random() > 0.85) {
        setShowAiVision(true);
        setHighlightBoxes([
          { x: 20, y: 30, width: 30, height: 8, label: 'Search Button' },
          { x: 55, y: 45, width: 35, height: 12, label: 'Hotel Card' },
        ]);
        setTimeout(() => {
          setShowAiVision(false);
          setHighlightBoxes([]);
        }, 1500);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Simulate progress and time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 100));
      setTimeRemaining((prev) => Math.max(prev - 1, 0));

      if (Math.random() > 0.9) {
        setShowDealBadge(true);
        setTimeout(() => setShowDealBadge(false), 3000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentAction = actions[currentActionIndex];
  const ActionIcon = currentAction ? actionIcons[currentAction.type] : Bot;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden">
      {/* Top Bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="absolute top-0 left-0 right-0 h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-30"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bot className="w-6 h-6 text-blue-500" />
          </motion.div>
          <h1 className="text-xl font-bold text-white">Amrikyy AI Agent</h1>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-500"
          />
          <span className="text-sm text-white/60">Active</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-white/60">
            Progress: <span className="text-white font-semibold">{progress}%</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="pt-16 pb-32 px-6 h-full flex items-center justify-center">
        <div className="relative w-full max-w-6xl aspect-video">
          {/* Browser Viewport */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          >
            {/* Mock Screenshot Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-purple-950/20 to-gray-950/20" />

            {/* Mock Browser Content */}
            <div className="absolute inset-0 p-8 flex flex-col gap-4 opacity-30">
              <div className="h-12 bg-white/10 rounded-lg" />
              <div className="grid grid-cols-3 gap-4 flex-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/10 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Animated Cursor */}
            <motion.div
              animate={{
                x: `${cursorPosition.x}%`,
                y: `${cursorPosition.y}%`,
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="absolute pointer-events-none z-20"
            >
              <MousePointer2 className="w-6 h-6 text-blue-400 filter drop-shadow-lg" />

              {/* Click Ripple */}
              <AnimatePresence>
                {showClickRipple && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0.8 }}
                        animate={{ scale: i * 1.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="absolute top-0 left-0 w-8 h-8 border-2 border-blue-400 rounded-full"
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Highlight Boxes */}
            <AnimatePresence>
              {highlightBoxes.map((box, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                  }}
                  className="absolute border-2 border-blue-500 rounded-lg bg-blue-500/10 backdrop-blur-sm z-10"
                >
                  {box.label && (
                    <motion.div
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: -8, opacity: 1 }}
                      className="absolute -top-6 left-0 px-2 py-1 bg-blue-500 text-white text-xs rounded font-medium"
                    >
                      {box.label}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* AI Vision Overlay */}
            <AnimatePresence>
              {showAiVision && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-purple-500/20 backdrop-blur-xl border border-purple-500/30 rounded-full z-20"
                >
                  <Eye className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-200 font-medium">AI Vision Active</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Great Deal Badge */}
            <AnimatePresence>
              {showDealBadge && (
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 10 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
                >
                  <div className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-2xl flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-white" />
                    <span className="text-xl font-bold text-white">Great Price Found!</span>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Narration Card (Bottom Floating) */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-40"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            {/* Action Icon */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0"
            >
              <ActionIcon className="w-6 h-6 text-white" />
            </motion.div>

            {/* Description */}
            <div className="flex-1">
              <motion.p
                key={currentAction?.description}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white text-lg font-medium"
              >
                {currentAction?.description}
              </motion.p>
            </div>

            {/* Time Remaining */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/80 font-medium">{timeRemaining}s</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Action Timeline (Right Sidebar) */}
      <motion.div
        initial={{ x: 400 }}
        animate={{ x: sidebarCollapsed ? 340 : 0 }}
        className="absolute top-16 right-0 bottom-0 w-96 bg-white/5 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto z-20"
      >
        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -left-10 top-6 w-10 h-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-l-xl flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronLeft className="w-5 h-5 text-white/60" />
          ) : (
            <ChevronRight className="w-5 h-5 text-white/60" />
          )}
        </button>

        <h2 className="text-lg font-bold text-white mb-6">Action Timeline</h2>

        <div className="space-y-4">
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative pl-8 pb-6 ${
                index < actions.length - 1 ? 'border-l-2 border-white/10' : ''
              }`}
            >
              {/* Status Icon */}
              <div
                className={`absolute -left-3 top-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  action.status === 'completed'
                    ? 'bg-green-500'
                    : action.status === 'in-progress'
                    ? 'bg-blue-500'
                    : 'bg-white/20'
                }`}
              >
                {action.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : action.status === 'in-progress' ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                )}
              </div>

              {/* Content */}
              <div
                className={`p-4 rounded-xl ${
                  action.status === 'in-progress'
                    ? 'bg-blue-500/10 border border-blue-500/30'
                    : 'bg-white/5'
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  {React.createElement(actionIcons[action.type], {
                    className: 'w-4 h-4 text-white/60 flex-shrink-0 mt-0.5',
                  })}
                  <p className="text-sm text-white/80 flex-1">{action.description}</p>
                </div>
                <div className="text-xs text-white/40">
                  {action.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
