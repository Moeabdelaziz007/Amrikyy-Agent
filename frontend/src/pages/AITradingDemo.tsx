import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Circle,
  Clock,
  Star,
  Trophy,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BookOpen,
  Settings,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

interface TradingStrategy {
  id: string;
  name: string;
  type: 'momentum' | 'mean-reversion' | 'arbitrage' | 'ml-based';
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: number;
  description: string;
  code: string;
  performance: {
    sharpe: number;
    maxDrawdown: number;
    winRate: number;
    avgReturn: number;
  };
}

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
}

interface BacktestResult {
  strategy: string;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitableTrades: number;
  startDate: Date;
  endDate: Date;
}

const AITradingDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'learn' | 'strategy' | 'backtest'>(
    'learn'
  );
  const [selectedStrategy, setSelectedStrategy] =
    useState<TradingStrategy | null>(null);
  const [isRunningBacktest, setIsRunningBacktest] = useState(false);
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [completedLessons, setCompletedLessons] = useState<string[]>([
    'lesson-1',
    'lesson-2',
  ]);

  const tradingStrategies: TradingStrategy[] = [
    {
      id: 'moving-average-crossover',
      name: 'Moving Average Crossover',
      type: 'momentum',
      riskLevel: 'medium',
      expectedReturn: 12.5,
      description:
        'A classic momentum strategy that generates buy/sell signals when short-term moving average crosses above/below long-term moving average.',
      code: `def moving_average_crossover(data, short_window=20, long_window=50):
    # Calculate moving averages
    data['SMA_short'] = data['close'].rolling(window=short_window).mean()
    data['SMA_long'] = data['close'].rolling(window=long_window).mean()
    
    # Generate signals
    data['signal'] = 0
    data.loc[data['SMA_short'] > data['SMA_long'], 'signal'] = 1
    data.loc[data['SMA_short'] < data['SMA_long'], 'signal'] = -1
    
    # Calculate positions
    data['position'] = data['signal'].diff()
    
    return data`,
      performance: {
        sharpe: 1.2,
        maxDrawdown: -15.3,
        winRate: 58.2,
        avgReturn: 8.7,
      },
    },
    {
      id: 'rsi-mean-reversion',
      name: 'RSI Mean Reversion',
      type: 'mean-reversion',
      riskLevel: 'medium',
      expectedReturn: 9.8,
      description:
        'A mean reversion strategy using RSI indicator to identify oversold/overbought conditions and generate contrarian signals.',
      code: `def rsi_mean_reversion(data, rsi_period=14, oversold=30, overbought=70):
    # Calculate RSI
    delta = data['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=rsi_period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=rsi_period).mean()
    rs = gain / loss
    data['rsi'] = 100 - (100 / (1 + rs))
    
    # Generate signals
    data['signal'] = 0
    data.loc[data['rsi'] < oversold, 'signal'] = 1  # Buy
    data.loc[data['rsi'] > overbought, 'signal'] = -1  # Sell
    
    return data`,
      performance: {
        sharpe: 0.9,
        maxDrawdown: -12.1,
        winRate: 62.4,
        avgReturn: 7.3,
      },
    },
    {
      id: 'ml-momentum',
      name: 'ML Momentum Strategy',
      type: 'ml-based',
      riskLevel: 'high',
      expectedReturn: 18.2,
      description:
        'An advanced machine learning strategy that uses multiple features to predict price movements and generate trading signals.',
      code: `def ml_momentum_strategy(data):
    # Feature engineering
    data['returns'] = data['close'].pct_change()
    data['volatility'] = data['returns'].rolling(20).std()
    data['momentum'] = data['close'].pct_change(10)
    data['volume_sma'] = data['volume'].rolling(20).mean()
    data['volume_ratio'] = data['volume'] / data['volume_sma']
    
    # Prepare features
    features = ['returns', 'volatility', 'momentum', 'volume_ratio']
    X = data[features].dropna()
    
    # Train ML model (simplified)
    from sklearn.ensemble import RandomForestClassifier
    model = RandomForestClassifier(n_estimators=100)
    
    # Generate signals
    data['signal'] = model.predict(X)
    
    return data`,
      performance: {
        sharpe: 1.8,
        maxDrawdown: -22.4,
        winRate: 68.7,
        avgReturn: 15.2,
      },
    },
    {
      id: 'pairs-trading',
      name: 'Pairs Trading',
      type: 'arbitrage',
      riskLevel: 'low',
      expectedReturn: 7.5,
      description:
        'A market-neutral strategy that trades on the price relationship between two correlated assets.',
      code: `def pairs_trading(data1, data2, window=60, threshold=2):
    # Calculate spread
    spread = data1['close'] - data2['close']
    
    # Calculate z-score
    spread_mean = spread.rolling(window=window).mean()
    spread_std = spread.rolling(window=window).std()
    z_score = (spread - spread_mean) / spread_std
    
    # Generate signals
    data1['signal'] = 0
    data1.loc[z_score > threshold, 'signal'] = -1  # Short spread
    data1.loc[z_score < -threshold, 'signal'] = 1   # Long spread
    
    return data1, data2`,
      performance: {
        sharpe: 1.5,
        maxDrawdown: -8.7,
        winRate: 55.3,
        avgReturn: 6.8,
      },
    },
  ];

  const lessons = [
    {
      id: 'lesson-1',
      title: 'Financial Markets Fundamentals',
      duration: '25 min',
      difficulty: 'beginner',
      description:
        'Learn about stocks, bonds, commodities, and market mechanics',
      completed: completedLessons.includes('lesson-1'),
    },
    {
      id: 'lesson-2',
      title: 'Technical Analysis Basics',
      duration: '35 min',
      difficulty: 'beginner',
      description: 'Master chart patterns, indicators, and trend analysis',
      completed: completedLessons.includes('lesson-2'),
    },
    {
      id: 'lesson-3',
      title: 'Quantitative Trading Strategies',
      duration: '45 min',
      difficulty: 'intermediate',
      description: 'Build and test algorithmic trading strategies',
      completed: completedLessons.includes('lesson-3'),
    },
    {
      id: 'lesson-4',
      title: 'Machine Learning for Trading',
      duration: '60 min',
      difficulty: 'advanced',
      description: 'Apply ML algorithms to predict market movements',
      completed: completedLessons.includes('lesson-4'),
    },
    {
      id: 'lesson-5',
      title: 'Risk Management',
      duration: '30 min',
      difficulty: 'intermediate',
      description:
        'Learn position sizing, stop losses, and portfolio optimization',
      completed: completedLessons.includes('lesson-5'),
    },
  ];

  const symbols = [
    'AAPL',
    'GOOGL',
    'MSFT',
    'TSLA',
    'AMZN',
    'META',
    'NVDA',
    'NFLX',
  ];

  useEffect(() => {
    // Simulate real-time market data
    const interval = setInterval(() => {
      const newData = symbols.map(symbol => ({
        symbol,
        price: Math.random() * 1000 + 100,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 1000000),
        timestamp: new Date(),
      }));
      setMarketData(newData);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const runBacktest = async (strategy: TradingStrategy) => {
    setIsRunningBacktest(true);

    // Simulate backtest execution
    await new Promise(resolve => setTimeout(resolve, 3000));

    const result: BacktestResult = {
      strategy: strategy.name,
      totalReturn: Math.random() * 50 - 10,
      sharpeRatio: Math.random() * 2,
      maxDrawdown: Math.random() * -30,
      winRate: Math.random() * 40 + 40,
      totalTrades: Math.floor(Math.random() * 500 + 100),
      profitableTrades: Math.floor(Math.random() * 300 + 50),
      startDate: new Date('2023-01-01'),
      endDate: new Date('2024-01-01'),
    };

    setBacktestResults([result, ...backtestResults]);
    setIsRunningBacktest(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'momentum':
        return '🚀';
      case 'mean-reversion':
        return '🔄';
      case 'arbitrage':
        return '⚖️';
      case 'ml-based':
        return '🤖';
      default:
        return '📊';
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
            <LineChart size={48} className="text-emerald-400" />
          </motion.div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-transparent bg-clip-text">
            AI Trading Lab
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Master algorithmic trading, build AI-powered strategies, and
            backtest your ideas with real market data
          </p>
        </motion.div>

        {/* Market Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Live Market Data
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {marketData.slice(0, 8).map((data, index) => (
              <motion.div
                key={data.symbol}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-emerald-500/50 transition-all duration-300"
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-white mb-1">
                    {data.symbol}
                  </div>
                  <div className="text-lg font-semibold text-white mb-1">
                    ${data.price.toFixed(2)}
                  </div>
                  <div
                    className={`flex items-center justify-center space-x-1 ${
                      data.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {data.change >= 0 ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                    <span className="text-sm">
                      {data.change >= 0 ? '+' : ''}
                      {data.change.toFixed(2)} ({data.changePercent.toFixed(2)}
                      %)
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Learning Progress</span>
            <span className="text-sm text-emerald-400">
              {completedLessons.length}/5 lessons completed
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedLessons.length / 5) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 rounded-xl p-1 flex space-x-1">
            {[
              { id: 'learn', label: 'Learn', icon: BookOpen },
              { id: 'strategy', label: 'Strategies', icon: Target },
              { id: 'backtest', label: 'Backtest', icon: BarChart3 },
            ].map(tab => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
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
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Trading Education
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {lessons.map((lesson, index) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-xl border transition-all duration-300 ${
                      lesson.completed
                        ? 'bg-green-900/20 border-green-500/50'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-emerald-500/50'
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
                            className={`text-sm font-medium ${
                              lesson.difficulty === 'beginner'
                                ? 'text-green-400'
                                : lesson.difficulty === 'intermediate'
                                ? 'text-yellow-400'
                                : 'text-red-400'
                            }`}
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
                          className="ml-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                        >
                          Start
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'strategy' && (
            <motion.div
              key="strategy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Trading Strategies
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tradingStrategies.map((strategy, index) => (
                  <motion.div
                    key={strategy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedStrategy(strategy)}
                    className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl cursor-pointer hover:border-emerald-500/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {getTypeIcon(strategy.type)}
                        </span>
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {strategy.name}
                          </h3>
                          <p className="text-sm text-slate-400 capitalize">
                            {strategy.type.replace('-', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-400">
                          {strategy.expectedReturn.toFixed(1)}%
                        </div>
                        <span
                          className={`text-sm font-medium ${getRiskColor(
                            strategy.riskLevel
                          )}`}
                        >
                          {strategy.riskLevel} risk
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-4">
                      {strategy.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-sm text-slate-400 mb-1">
                          Sharpe Ratio
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {strategy.performance.sharpe.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-sm text-slate-400 mb-1">
                          Win Rate
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {strategy.performance.winRate.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-sm text-slate-400 mb-1">
                          Max Drawdown
                        </div>
                        <div className="text-lg font-semibold text-red-400">
                          {strategy.performance.maxDrawdown.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-sm text-slate-400 mb-1">
                          Avg Return
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {strategy.performance.avgReturn.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'backtest' && (
            <motion.div
              key="backtest"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Strategy Backtesting
                </h2>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedSymbol}
                    onChange={e => setSelectedSymbol(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    {symbols.map(symbol => (
                      <option key={symbol} value={symbol}>
                        {symbol}
                      </option>
                    ))}
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      selectedStrategy && runBacktest(selectedStrategy)
                    }
                    disabled={!selectedStrategy || isRunningBacktest}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRunningBacktest ? 'Running...' : 'Run Backtest'}
                  </motion.button>
                </div>
              </div>

              {backtestResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">
                    Backtest Results
                  </h3>
                  {backtestResults.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="bg-slate-900/50 rounded-lg p-4">
                          <div className="text-sm text-slate-400 mb-1">
                            Strategy
                          </div>
                          <div className="text-lg font-semibold text-white">
                            {result.strategy}
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-4">
                          <div className="text-sm text-slate-400 mb-1">
                            Total Return
                          </div>
                          <div
                            className={`text-lg font-semibold ${
                              result.totalReturn >= 0
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            {result.totalReturn.toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-4">
                          <div className="text-sm text-slate-400 mb-1">
                            Sharpe Ratio
                          </div>
                          <div className="text-lg font-semibold text-white">
                            {result.sharpeRatio.toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-4">
                          <div className="text-sm text-slate-400 mb-1">
                            Max Drawdown
                          </div>
                          <div className="text-lg font-semibold text-red-400">
                            {result.maxDrawdown.toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-4">
                          <div className="text-sm text-slate-400 mb-1">
                            Win Rate
                          </div>
                          <div className="text-lg font-semibold text-white">
                            {result.winRate.toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-4">
                          <div className="text-sm text-slate-400 mb-1">
                            Total Trades
                          </div>
                          <div className="text-lg font-semibold text-white">
                            {result.totalTrades}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {selectedStrategy && (
                <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Selected Strategy: {selectedStrategy.name}
                  </h3>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                      <code>{selectedStrategy.code}</code>
                    </pre>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Strategy Details Modal */}
        <AnimatePresence>
          {selectedStrategy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedStrategy(null)}
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
                    {selectedStrategy.name}
                  </h3>
                  <button
                    onClick={() => setSelectedStrategy(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Expected Return
                      </h4>
                      <p className="text-emerald-400 font-bold text-2xl">
                        {selectedStrategy.expectedReturn.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Risk Level
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(
                          selectedStrategy.riskLevel
                        )}`}
                      >
                        {selectedStrategy.riskLevel}
                      </span>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Sharpe Ratio
                      </h4>
                      <p className="text-white font-bold text-xl">
                        {selectedStrategy.performance.sharpe.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Win Rate
                      </h4>
                      <p className="text-white font-bold text-xl">
                        {selectedStrategy.performance.winRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Description
                    </h4>
                    <p className="text-slate-300">
                      {selectedStrategy.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Implementation
                    </h4>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                        <code>{selectedStrategy.code}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        runBacktest(selectedStrategy);
                        setSelectedStrategy(null);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                    >
                      Run Backtest
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedStrategy(null)}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all duration-300"
                    >
                      Close
                    </motion.button>
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

export default AITradingDemo;
