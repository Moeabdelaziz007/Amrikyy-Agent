/**
 * MINI-ALADDIN: Multi-Agent Orchestration System
 * Inspired by BlackRock's Aladdin - The $20 Trillion Money Machine
 *
 * ARCHITECTURE:
 * - Central Orchestrator (Main Brain) coordinates specialized agents
 * - Mini-Agents with specific expertise (Math, Trading, Risk, Data)
 * - MCP Protocol for tool integration (APIs, databases, exchanges)
 * - Real-time decision making with Monte Carlo simulation
 * - Multi-strategy profit optimization
 *
 * CAPABILITIES:
 * 1. Crypto Arbitrage (Cross-exchange, Triangular, DeFi)
 * 2. Market Pattern Recognition
 * 3. Risk Assessment & Portfolio Optimization
 * 4. Automated Trading Execution
 * 5. Affiliate Opportunity Discovery
 * 6. Revenue Stream Diversification
 */

const crypto = require('crypto');
const EventEmitter = require('events');

// ============================================================================
// MINI-AGENTS - Specialized Workers
// ============================================================================

/**
 * MathAgent - Advanced Mathematical Analysis
 * The genius mathematician of the team
 */
class MathAgent {
  constructor() {
    this.name = 'MathAgent';
    this.specialty = 'Advanced Mathematics & Statistics';
  }

  /**
   * Monte Carlo Simulation (Like BlackRock's Aladdin)
   * Generates thousands of possible future scenarios
   */
  monteCarloSimulation(
    currentPrice,
    volatility,
    days = 30,
    simulations = 10000
  ) {
    const results = [];
    const dt = 1 / 365; // daily time step

    for (let sim = 0; sim < simulations; sim++) {
      let price = currentPrice;
      const path = [price];

      for (let day = 0; day < days; day++) {
        // Geometric Brownian Motion (Black-Scholes model)
        const drift = 0.0001; // small positive drift
        const shock = this._boxMullerRandom() * volatility * Math.sqrt(dt);
        price = price * Math.exp(drift * dt + shock);
        path.push(price);
      }

      results.push({
        finalPrice: price,
        return: ((price - currentPrice) / currentPrice) * 100,
        path,
      });
    }

    return this._analyzeSimulations(results, currentPrice);
  }

  /**
   * Box-Muller transform for normally distributed random numbers
   */
  _boxMullerRandom() {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  /**
   * Analyze Monte Carlo results
   */
  _analyzeSimulations(results, currentPrice) {
    const returns = results.map((r) => r.return).sort((a, b) => a - b);
    const finalPrices = results.map((r) => r.finalPrice).sort((a, b) => a - b);

    return {
      expectedReturn: this._mean(returns),
      volatility: this._stdDev(returns),
      var95: returns[Math.floor(returns.length * 0.05)], // 95% Value at Risk
      var99: returns[Math.floor(returns.length * 0.01)], // 99% Value at Risk
      bestCase: returns[returns.length - 1],
      worstCase: returns[0],
      medianReturn: returns[Math.floor(returns.length / 2)],
      probabilityOfProfit:
        (returns.filter((r) => r > 0).length / returns.length) * 100,
      expectedPrice: this._mean(finalPrices),
      priceRange: {
        low: finalPrices[Math.floor(finalPrices.length * 0.05)],
        high: finalPrices[Math.floor(finalPrices.length * 0.95)],
      },
    };
  }

  /**
   * Calculate arbitrage opportunity profitability
   */
  calculateArbitrage(buyPrice, sellPrice, amount, fees = 0.001) {
    const buyFee = buyPrice * amount * fees;
    const sellFee = sellPrice * amount * fees;
    const buyCost = buyPrice * amount + buyFee;
    const sellRevenue = sellPrice * amount - sellFee;
    const profit = sellRevenue - buyCost;
    const profitPercent = (profit / buyCost) * 100;

    return {
      profit,
      profitPercent,
      buyCost,
      sellRevenue,
      fees: buyFee + sellFee,
      worthIt: profitPercent > 0.5, // minimum 0.5% profit
      roi: (profit / buyCost) * 100,
    };
  }

  /**
   * Triangular Arbitrage Detection
   * Example: BTC/USDT -> ETH/BTC -> ETH/USDT
   */
  calculateTriangularArbitrage(
    pair1Price,
    pair2Price,
    pair3Price,
    startAmount = 1000
  ) {
    // Forward path
    const step1 = startAmount / pair1Price; // USDT -> BTC
    const step2 = step1 * pair2Price; // BTC -> ETH
    const step3 = step2 * pair3Price; // ETH -> USDT
    const forwardProfit = step3 - startAmount;
    const forwardPercent = (forwardProfit / startAmount) * 100;

    // Reverse path
    const revStep1 = startAmount / pair3Price; // USDT -> ETH
    const revStep2 = revStep1 / pair2Price; // ETH -> BTC
    const revStep3 = revStep2 * pair1Price; // BTC -> USDT
    const reverseProfit = revStep3 - startAmount;
    const reversePercent = (reverseProfit / startAmount) * 100;

    const bestPath = forwardPercent > reversePercent ? 'forward' : 'reverse';
    const bestProfit = Math.max(forwardProfit, reverseProfit);
    const bestPercent = Math.max(forwardPercent, reversePercent);

    return {
      forward: { profit: forwardProfit, percent: forwardPercent },
      reverse: { profit: reverseProfit, percent: reversePercent },
      bestPath,
      bestProfit,
      bestPercent,
      worthIt: bestPercent > 0.3, // 0.3% minimum after fees
    };
  }

  /**
   * Kelly Criterion - Optimal bet sizing
   */
  kellyCalculator(winProbability, winLossRatio, bankroll) {
    // Kelly Formula: f* = (bp - q) / b
    // where b = odds (win/loss ratio), p = win probability, q = lose probability
    const q = 1 - winProbability;
    const kellyPercent = (winLossRatio * winProbability - q) / winLossRatio;
    const kellyAmount = Math.max(0, kellyPercent * bankroll);

    // Use fractional Kelly (1/4 Kelly) for safety
    const fractionalKelly = kellyAmount * 0.25;

    return {
      fullKellyPercent: kellyPercent * 100,
      fullKellyAmount: kellyAmount,
      recommendedPercent: kellyPercent * 0.25 * 100,
      recommendedAmount: fractionalKelly,
      maxRisk: fractionalKelly,
    };
  }

  /**
   * Sharpe Ratio - Risk-adjusted returns
   */
  sharpeRatio(returns, riskFreeRate = 0.02) {
    const avgReturn = this._mean(returns);
    const stdDev = this._stdDev(returns);
    return (avgReturn - riskFreeRate) / stdDev;
  }

  /**
   * Statistical helpers
   */
  _mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  _stdDev(arr) {
    const avg = this._mean(arr);
    const squareDiffs = arr.map((val) => Math.pow(val - avg, 2));
    return Math.sqrt(this._mean(squareDiffs));
  }

  /**
   * Correlation coefficient between two assets
   */
  correlation(returns1, returns2) {
    const n = Math.min(returns1.length, returns2.length);
    const mean1 = this._mean(returns1.slice(0, n));
    const mean2 = this._mean(returns2.slice(0, n));

    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = returns1[i] - mean1;
      const diff2 = returns2[i] - mean2;
      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }

    return numerator / Math.sqrt(sum1Sq * sum2Sq);
  }
}

/**
 * MarketAgent - Real-time Market Analysis
 * The market watcher with pattern recognition
 */
class MarketAgent {
  constructor() {
    this.name = 'MarketAgent';
    this.specialty = 'Market Analysis & Pattern Recognition';
    this.patterns = [];
  }

  /**
   * Detect price patterns
   */
  detectPatterns(priceHistory) {
    const patterns = [];

    // Moving average crossover
    const sma20 = this._sma(priceHistory, 20);
    const sma50 = this._sma(priceHistory, 50);

    if (
      sma20[sma20.length - 1] > sma50[sma50.length - 1] &&
      sma20[sma20.length - 2] <= sma50[sma50.length - 2]
    ) {
      patterns.push({
        type: 'golden_cross',
        signal: 'bullish',
        strength: 8,
        description: 'Short-term MA crossed above long-term MA',
      });
    }

    // RSI analysis
    const rsi = this._rsi(priceHistory, 14);
    const currentRSI = rsi[rsi.length - 1];

    if (currentRSI < 30) {
      patterns.push({
        type: 'oversold',
        signal: 'buy',
        strength: 7,
        description: `RSI at ${currentRSI.toFixed(2)} - oversold territory`,
      });
    } else if (currentRSI > 70) {
      patterns.push({
        type: 'overbought',
        signal: 'sell',
        strength: 7,
        description: `RSI at ${currentRSI.toFixed(2)} - overbought territory`,
      });
    }

    // Volatility analysis
    const volatility = this._calculateVolatility(priceHistory);
    if (volatility > 0.05) {
      patterns.push({
        type: 'high_volatility',
        signal: 'caution',
        strength: 6,
        description: `High volatility (${(volatility * 100).toFixed(
          2
        )}%) - opportunity for arbitrage`,
      });
    }

    return patterns;
  }

  /**
   * Simple Moving Average
   */
  _sma(prices, period) {
    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      sma.push(slice.reduce((a, b) => a + b) / period);
    }
    return sma;
  }

  /**
   * Relative Strength Index
   */
  _rsi(prices, period = 14) {
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    const rsi = [];
    for (let i = period; i < changes.length; i++) {
      const slice = changes.slice(i - period, i);
      const gains =
        slice.filter((c) => c > 0).reduce((a, b) => a + b, 0) / period;
      const losses =
        Math.abs(slice.filter((c) => c < 0).reduce((a, b) => a + b, 0)) /
        period;

      const rs = gains / (losses || 0.0001);
      rsi.push(100 - 100 / (1 + rs));
    }

    return rsi;
  }

  /**
   * Calculate price volatility
   */
  _calculateVolatility(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const mean = returns.reduce((a, b) => a + b) / returns.length;
    const variance =
      returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) /
      returns.length;
    return Math.sqrt(variance);
  }

  /**
   * Find cross-exchange arbitrage opportunities
   */
  findArbitrage(exchangePrices) {
    const opportunities = [];
    const exchanges = Object.keys(exchangePrices);

    for (let i = 0; i < exchanges.length; i++) {
      for (let j = i + 1; j < exchanges.length; j++) {
        const ex1 = exchanges[i];
        const ex2 = exchanges[j];
        const price1 = exchangePrices[ex1];
        const price2 = exchangePrices[ex2];

        const diff = Math.abs(price2 - price1);
        const percent = (diff / Math.min(price1, price2)) * 100;

        if (percent > 0.5) {
          // More than 0.5% difference
          opportunities.push({
            buyExchange: price1 < price2 ? ex1 : ex2,
            sellExchange: price1 < price2 ? ex2 : ex1,
            buyPrice: Math.min(price1, price2),
            sellPrice: Math.max(price1, price2),
            spreadPercent: percent,
            estimatedProfit: percent - 0.2, // minus fees
          });
        }
      }
    }

    return opportunities.sort((a, b) => b.spreadPercent - a.spreadPercent);
  }
}

/**
 * RiskAgent - Portfolio Risk Management
 * The cautious guardian of the money
 */
class RiskAgent {
  constructor() {
    this.name = 'RiskAgent';
    this.specialty = 'Risk Assessment & Management';
    this.maxRiskPercent = 2; // Never risk more than 2% per trade
  }

  /**
   * Assess trade risk
   */
  assessRisk(trade, portfolio) {
    const riskScore = this._calculateRiskScore(trade, portfolio);
    const positionSize = this._calculatePositionSize(trade, portfolio);
    const stopLoss = this._calculateStopLoss(trade);

    return {
      riskScore,
      riskLevel: this._getRiskLevel(riskScore),
      approved: riskScore < 70,
      positionSize,
      stopLoss,
      maxLoss: positionSize * (stopLoss / 100),
      recommendation: this._getRecommendation(riskScore),
    };
  }

  /**
   * Calculate risk score (0-100)
   */
  _calculateRiskScore(trade, portfolio) {
    let score = 0;

    // Volatility risk
    if (trade.volatility > 0.05) score += 20;
    else if (trade.volatility > 0.03) score += 10;

    // Liquidity risk
    if (trade.volume < 1000000) score += 20;
    else if (trade.volume < 10000000) score += 10;

    // Correlation risk
    if (portfolio.correlation && portfolio.correlation > 0.7) score += 15;

    // Leverage risk
    if (trade.leverage > 3) score += 25;
    else if (trade.leverage > 1) score += 10;

    // Market conditions
    if (trade.marketCondition === 'extreme_volatility') score += 20;

    return Math.min(score, 100);
  }

  /**
   * Calculate optimal position size
   */
  _calculatePositionSize(trade, portfolio) {
    const totalValue = portfolio.totalValue || 10000;
    const riskAmount = totalValue * (this.maxRiskPercent / 100);
    const stopLossPercent = trade.stopLossPercent || 5;

    return (riskAmount / stopLossPercent) * 100;
  }

  /**
   * Calculate stop loss level
   */
  _calculateStopLoss(trade) {
    const atr = trade.atr || trade.price * 0.03; // 3% default
    return (atr / trade.price) * 100;
  }

  _getRiskLevel(score) {
    if (score < 30) return 'low';
    if (score < 60) return 'medium';
    return 'high';
  }

  _getRecommendation(score) {
    if (score < 30) return 'Execute trade with standard position size';
    if (score < 60) return 'Reduce position size by 50%';
    return 'REJECT - Risk too high';
  }

  /**
   * Portfolio diversification analysis
   */
  analyzeDiversification(positions) {
    const assets = positions.map((p) => p.asset);
    const values = positions.map((p) => p.value);
    const total = values.reduce((a, b) => a + b, 0);

    // Calculate Herfindahl index (concentration)
    const concentrationIndex = values.reduce((sum, val) => {
      const share = val / total;
      return sum + share * share;
    }, 0);

    // 0 = perfect diversification, 1 = total concentration
    const diversificationScore = (1 - concentrationIndex) * 100;

    return {
      numAssets: assets.length,
      concentrationIndex,
      diversificationScore,
      isWellDiversified: diversificationScore > 60,
      largestPosition: Math.max(...values.map((v) => (v / total) * 100)),
    };
  }
}

/**
 * DataAgent - Data Collection & Integration
 * The information gatherer with MCP integration
 */
class DataAgent {
  constructor() {
    this.name = 'DataAgent';
    this.specialty = 'Data Collection & MCP Integration';
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  /**
   * Simulate fetching crypto prices from multiple exchanges
   * In real implementation, this would use MCP to connect to exchange APIs
   */
  async fetchPrices(symbol) {
    const cached = this._getCache(`prices_${symbol}`);
    if (cached) return cached;

    // Simulate real exchange data
    const basePrice = this._getBasePrice(symbol);
    const prices = {
      binance: basePrice * (1 + (Math.random() - 0.5) * 0.01),
      coinbase: basePrice * (1 + (Math.random() - 0.5) * 0.015),
      kraken: basePrice * (1 + (Math.random() - 0.5) * 0.012),
      kucoin: basePrice * (1 + (Math.random() - 0.5) * 0.02),
      bybit: basePrice * (1 + (Math.random() - 0.5) * 0.018),
      timestamp: Date.now(),
    };

    this._setCache(`prices_${symbol}`, prices);
    return prices;
  }

  /**
   * Get historical price data
   */
  async fetchHistoricalData(symbol, days = 30) {
    const prices = [];
    let price = this._getBasePrice(symbol);

    for (let i = 0; i < days; i++) {
      price = price * (1 + (Math.random() - 0.5) * 0.05);
      prices.push(price);
    }

    return prices;
  }

  /**
   * Fetch affiliate program data
   */
  async fetchAffiliateOpportunities() {
    return [
      {
        name: 'Binance Affiliate',
        commission: '50%',
        type: 'crypto_exchange',
        avgRevenue: 500,
        difficulty: 'medium',
      },
      {
        name: 'Coinbase Affiliate',
        commission: '$10 per referral',
        type: 'crypto_exchange',
        avgRevenue: 300,
        difficulty: 'easy',
      },
      {
        name: 'TradingView Affiliate',
        commission: '30%',
        type: 'trading_tools',
        avgRevenue: 400,
        difficulty: 'easy',
      },
    ];
  }

  _getBasePrice(symbol) {
    const basePrices = {
      BTC: 45000,
      ETH: 2500,
      SOL: 100,
      BNB: 350,
    };
    return basePrices[symbol] || 100;
  }

  _getCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  _setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

// ============================================================================
// MINI-ALADDIN ORCHESTRATOR - The Brain
// ============================================================================

class MiniAladdin extends EventEmitter {
  constructor(config = {}) {
    super();

    // Input validation for constructor
    this.validateConfig(config);

    this.config = {
      initialCapital: config.initialCapital || 10000,
      riskTolerance: config.riskTolerance || 'medium',
      strategies: config.strategies || ['arbitrage', 'pattern', 'affiliate'],
      autoExecute: config.autoExecute || false,
    };

    // Initialize mini-agents
    this.agents = {
      math: new MathAgent(),
      market: new MarketAgent(),
      risk: new RiskAgent(),
      data: new DataAgent(),
    };

    this.portfolio = {
      cash: this.config.initialCapital,
      positions: [],
      totalValue: this.config.initialCapital,
      totalProfit: 0,
    };

    this.opportunities = [];
    this.trades = [];

    console.log('🎯 MINI-ALADDIN initialized with agents:');
    Object.values(this.agents).forEach((agent) => {
      console.log(`   ✓ ${agent.name}: ${agent.specialty}`);
    });
  }

  /**
   * Main orchestration loop with comprehensive error handling
   */
  async hunt() {
    console.log('\n💰 Starting Money Hunt...\n');

    try {
      // Parallel execution of all strategies with individual error handling
      const [arbOpps, patterns, affiliates] = await Promise.allSettled([
        this.findArbitrageOpportunities().catch(err => {
          console.error('❌ Arbitrage strategy failed:', err.message);
          return [];
        }),
        this.analyzeTrendingOpportunities().catch(err => {
          console.error('❌ Pattern analysis failed:', err.message);
          return [];
        }),
        this.findAffiliateOpportunities().catch(err => {
          console.error('❌ Affiliate search failed:', err.message);
          return [];
        }),
      ]);

      // Extract successful results
      const arbResults = arbOpps.status === 'fulfilled' ? arbOpps.value : [];
      const patternResults = patterns.status === 'fulfilled' ? patterns.value : [];
      const affiliateResults = affiliates.status === 'fulfilled' ? affiliates.value : [];

      // Aggregate all opportunities
      this.opportunities = [
        ...arbResults.map((o) => ({ ...o, category: 'arbitrage' })),
        ...patternResults.map((o) => ({ ...o, category: 'trading' })),
        ...affiliateResults.map((o) => ({ ...o, category: 'affiliate' })),
      ];

      // Validate opportunities
      this.opportunities = this.opportunities.filter(opp => {
        try {
          this.validateOpportunity(opp);
          return true;
        } catch (err) {
          console.warn(`⚠️  Invalid opportunity filtered out: ${err.message}`);
          return false;
        }
      });

      // Score and rank opportunities
      try {
        this.opportunities = this.scoreOpportunities(this.opportunities);
      } catch (err) {
        console.error('❌ Scoring failed:', err.message);
        // Continue with unscored opportunities
      }

      // Generate execution plan
      let plan = null;
      try {
        plan = this.generateExecutionPlan();
      } catch (err) {
        console.error('❌ Plan generation failed:', err.message);
        plan = { error: 'Plan generation failed', message: err.message };
      }

      // Get analytics
      let analytics = null;
      try {
        analytics = this.getAnalytics();
      } catch (err) {
        console.error('❌ Analytics generation failed:', err.message);
        analytics = { error: 'Analytics unavailable', message: err.message };
      }

      console.log(`\n✅ Hunt completed: ${this.opportunities.length} opportunities found\n`);

      return {
        success: true,
        opportunities: this.opportunities,
        plan,
        portfolio: this.portfolio,
        analytics,
        errors: this._collectErrors(arbOpps, patterns, affiliates),
      };

    } catch (error) {
      console.error('\n❌ CRITICAL ERROR in hunt():', error.message);
      console.error(error.stack);

      // Return safe fallback
      return {
        success: false,
        error: 'Hunt failed',
        message: error.message,
        opportunities: [],
        plan: null,
        portfolio: this.portfolio,
        analytics: null,
      };
    }
  }

  /**
   * Collect errors from Promise.allSettled results
   */
  _collectErrors(...results) {
    const errors = [];
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        errors.push({
          strategy: ['arbitrage', 'pattern', 'affiliate'][index],
          error: result.reason?.message || 'Unknown error',
        });
      }
    });
    return errors.length > 0 ? errors : null;
  }

  /**
   * Find arbitrage opportunities across exchanges
   */
  async findArbitrageOpportunities() {
    const opportunities = [];
    const symbols = ['BTC', 'ETH', 'SOL', 'BNB'];

    for (const symbol of symbols) {
      const prices = await this.agents.data.fetchPrices(symbol);
      delete prices.timestamp;

      const arbOpps = this.agents.market.findArbitrage(prices);

      for (const opp of arbOpps) {
        // Calculate profitability with MathAgent
        const calc = this.agents.math.calculateArbitrage(
          opp.buyPrice,
          opp.sellPrice,
          1000, // $1000 trade
          0.001 // 0.1% fees
        );

        if (calc.worthIt) {
          // Risk assessment
          const riskAssessment = this.agents.risk.assessRisk(
            {
              price: opp.buyPrice,
              volatility: 0.02,
              volume: 50000000,
              leverage: 1,
              stopLossPercent: 2,
            },
            this.portfolio
          );

          opportunities.push({
            type: 'cross_exchange_arbitrage',
            symbol,
            ...opp,
            ...calc,
            risk: riskAssessment,
            timeToExecute: '< 30 seconds',
            confidence: 85,
          });
        }
      }
    }

    return opportunities;
  }

  /**
   * Analyze trending opportunities with pattern recognition
   */
  async analyzeTrendingOpportunities() {
    const opportunities = [];
    const symbols = ['BTC', 'ETH'];

    for (const symbol of symbols) {
      const historicalPrices = await this.agents.data.fetchHistoricalData(
        symbol,
        50
      );
      const currentPrice = historicalPrices[historicalPrices.length - 1];

      // Pattern detection
      const patterns = this.agents.market.detectPatterns(historicalPrices);

      // Monte Carlo simulation
      const simulation = this.agents.math.monteCarloSimulation(
        currentPrice,
        0.03, // 3% volatility
        30,
        5000
      );

      if (simulation.probabilityOfProfit > 60) {
        opportunities.push({
          type: 'pattern_trading',
          symbol,
          currentPrice,
          patterns,
          simulation,
          expectedReturn: simulation.expectedReturn,
          confidence: simulation.probabilityOfProfit,
          timeHorizon: '30 days',
        });
      }
    }

    return opportunities;
  }

  /**
   * Find affiliate opportunities
   */
  async findAffiliateOpportunities() {
    const affiliates = await this.agents.data.fetchAffiliateOpportunities();

    return affiliates.map((aff) => ({
      type: 'affiliate_program',
      ...aff,
      estimatedMonthlyRevenue: aff.avgRevenue,
      timeToFirstDollar: '2-4 weeks',
      confidence: 70,
      effort: 'low',
    }));
  }

  /**
   * Score and rank all opportunities
   */
  scoreOpportunities(opportunities) {
    return opportunities
      .map((opp) => {
        let score = 0;

        // Confidence weight
        score += (opp.confidence || 50) * 0.3;

        // Profit potential weight
        if (opp.profitPercent) score += Math.min(opp.profitPercent * 10, 30);
        if (opp.estimatedMonthlyRevenue)
          score += Math.min(opp.estimatedMonthlyRevenue / 20, 30);

        // Risk weight (inverse)
        if (opp.risk) {
          const riskScore = opp.risk.riskScore || 50;
          score += (100 - riskScore) * 0.2;
        } else {
          score += 15;
        }

        // Time factor
        if (opp.timeToExecute && opp.timeToExecute.includes('second'))
          score += 15;
        else if (opp.timeToExecute && opp.timeToExecute.includes('minute'))
          score += 10;

        return {
          ...opp,
          score: Math.round(score),
          priority: score > 75 ? 'high' : score > 50 ? 'medium' : 'low',
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Generate execution plan
   */
  generateExecutionPlan() {
    const plan = {
      immediate: [],
      today: [],
      thisWeek: [],
    };

    this.opportunities.forEach((opp) => {
      const action = {
        opportunity: opp,
        steps: this._generateSteps(opp),
        estimatedReturn: this._estimateReturn(opp),
      };

      if (opp.category === 'arbitrage' && opp.score > 70) {
        plan.immediate.push(action);
      } else if (opp.category === 'trading' && opp.score > 60) {
        plan.today.push(action);
      } else {
        plan.thisWeek.push(action);
      }
    });

    return plan;
  }

  /**
   * Generate specific execution steps
   */
  _generateSteps(opp) {
    const steps = {
      arbitrage: [
        `1. Connect to ${opp.buyExchange} and ${opp.sellExchange}`,
        `2. Verify liquidity (minimum $10,000 volume)`,
        `3. Execute simultaneous buy on ${
          opp.buyExchange
        } at $${opp.buyPrice?.toFixed(2)}`,
        `4. Execute simultaneous sell on ${
          opp.sellExchange
        } at $${opp.sellPrice?.toFixed(2)}`,
        `5. Withdraw funds and reinvest`,
        `Expected profit: $${opp.profit?.toFixed(
          2
        )} (${opp.profitPercent?.toFixed(2)}%)`,
      ],
      pattern_trading: [
        `1. Set up position on exchange`,
        `2. Entry price: $${opp.currentPrice?.toFixed(2)}`,
        `3. Set stop loss at $${(opp.currentPrice * 0.95)?.toFixed(2)}`,
        `4. Set take profit at $${opp.simulation?.expectedPrice?.toFixed(2)}`,
        `5. Monitor patterns: ${opp.patterns?.map((p) => p.type).join(', ')}`,
        `Expected return: ${opp.simulation?.expectedReturn?.toFixed(
          2
        )}% over 30 days`,
      ],
      affiliate_program: [
        `1. Sign up for ${opp.name}`,
        `2. Get affiliate links`,
        `3. Create content: blog post + YouTube video`,
        `4. Promote on social media`,
        `5. Track conversions`,
        `Expected revenue: $${opp.estimatedMonthlyRevenue}/month`,
      ],
    };

    return steps[opp.type] || steps[opp.category] || ['Execute opportunity'];
  }

  /**
   * Estimate return for opportunity
   */
  _estimateReturn(opp) {
    if (opp.profit) return { amount: opp.profit, percent: opp.profitPercent };
    if (opp.estimatedMonthlyRevenue)
      return { amount: opp.estimatedMonthlyRevenue, period: 'monthly' };
    if (opp.simulation)
      return { percent: opp.simulation.expectedReturn, period: '30 days' };
    return { amount: 0 };
  }

  /**
   * Execute a trade (simulation mode)
   */
  executeTrade(opportunity) {
    // Input validation
    try {
      const amount = opportunity.risk?.positionSize || 1000;
      this.validateTradeParams(opportunity, amount);
    } catch (error) {
      return { success: false, reason: error.message };
    }

    if (!opportunity.risk?.approved) {
      return { success: false, reason: 'Risk assessment failed' };
    }

    const trade = {
      id: this._generateTradeId(),
      opportunity,
      entryTime: new Date().toISOString(),
      status: 'executed',
      amount: opportunity.risk?.positionSize || 1000,
    };

    this.trades.push(trade);
    this.emit('trade_executed', trade);

    return { success: true, trade };
  }

  /**
   * Get portfolio analytics
   */
  getAnalytics() {
    const totalTrades = this.trades.length;
    const profitableTrades = this.trades.filter((t) => t.profit > 0).length;
    const winRate =
      totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;

    return {
      totalOpportunities: this.opportunities.length,
      highPriorityOpps: this.opportunities.filter((o) => o.priority === 'high')
        .length,
      portfolio: this.portfolio,
      totalTrades,
      winRate,
      bestOpportunity: this.opportunities[0],
      estimatedDailyProfit: this._estimateDailyProfit(),
    };
  }

  /**
   * Estimate daily profit potential
   */
  _estimateDailyProfit() {
    const arbOpps = this.opportunities.filter(
      (o) => o.category === 'arbitrage'
    );
    const dailyArb = arbOpps
      .slice(0, 5)
      .reduce((sum, o) => sum + (o.profit || 0), 0);

    return Math.round(dailyArb * 0.7); // 70% success rate
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const analytics = this.getAnalytics();

    return {
      summary: {
        totalOpportunities: analytics.totalOpportunities,
        highPriority: analytics.highPriorityOpps,
        portfolioValue: this.portfolio.totalValue,
        estimatedDailyProfit: analytics.estimatedDailyProfit,
        estimatedMonthlyProfit: analytics.estimatedDailyProfit * 30,
      },
      bestOpportunities: this.opportunities.slice(0, 10),
      portfolio: this.portfolio,
      agents: Object.values(this.agents).map((a) => ({
        name: a.name,
        specialty: a.specialty,
      })),
      strategies: {
        arbitrage: this.opportunities.filter((o) => o.category === 'arbitrage')
          .length,
        trading: this.opportunities.filter((o) => o.category === 'trading')
          .length,
        affiliate: this.opportunities.filter((o) => o.category === 'affiliate')
          .length,
      },
    };
  }

  /**
   * Generate trade ID
   */
  _generateTradeId() {
    return `TRADE-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Real-time monitoring (would run continuously)
   */
  async startMonitoring(interval = 30000) {
    // Input validation
    if (typeof interval !== 'number' || interval < 1000) {
      throw new Error('Interval must be a number >= 1000ms');
    }

    console.log(
      `\n🔄 Starting real-time monitoring (${interval}ms intervals)...\n`
    );

    setInterval(async () => {
      const result = await this.hunt();

      if (result.opportunities.filter((o) => o.score > 80).length > 0) {
        console.log(`\n🚨 HIGH SCORE OPPORTUNITY DETECTED!`);
        const best = result.opportunities[0];
        console.log(`   ${best.type}: ${best.symbol || best.name}`);
        console.log(`   Score: ${best.score}/100`);
        console.log(
          `   Profit: ${
            best.profit
              ? `$${best.profit.toFixed(2)}`
              : `$${best.estimatedMonthlyRevenue}/mo`
          }`
        );

        if (this.config.autoExecute && best.category === 'arbitrage') {
          this.executeTrade(best);
        }
      }
    }, interval);
  }

  /**
   * Validate configuration
   */
  validateConfig(config) {
    if (config.initialCapital !== undefined) {
      if (typeof config.initialCapital !== 'number' || config.initialCapital <= 0) {
        throw new Error('initialCapital must be a positive number');
      }
    }

    if (config.riskTolerance !== undefined) {
      const validRiskLevels = ['low', 'medium', 'high'];
      if (!validRiskLevels.includes(config.riskTolerance)) {
        throw new Error(`riskTolerance must be one of: ${validRiskLevels.join(', ')}`);
      }
    }

    if (config.strategies !== undefined) {
      if (!Array.isArray(config.strategies) || config.strategies.length === 0) {
        throw new Error('strategies must be a non-empty array');
      }
      const validStrategies = ['arbitrage', 'pattern', 'affiliate'];
      const invalidStrategies = config.strategies.filter(s => !validStrategies.includes(s));
      if (invalidStrategies.length > 0) {
        throw new Error(`Invalid strategies: ${invalidStrategies.join(', ')}. Valid: ${validStrategies.join(', ')}`);
      }
    }

    if (config.autoExecute !== undefined && typeof config.autoExecute !== 'boolean') {
      throw new Error('autoExecute must be a boolean');
    }
  }

  /**
   * Validate opportunity data
   */
  validateOpportunity(opportunity) {
    if (!opportunity || typeof opportunity !== 'object') {
      throw new Error('Opportunity must be an object');
    }

    if (!opportunity.id) {
      throw new Error('Opportunity must have an id');
    }

    if (!opportunity.category || !['arbitrage', 'trading', 'affiliate'].includes(opportunity.category)) {
      throw new Error('Opportunity must have a valid category (arbitrage, trading, or affiliate)');
    }

    if (typeof opportunity.score !== 'number' || opportunity.score < 0 || opportunity.score > 100) {
      throw new Error('Opportunity score must be a number between 0 and 100');
    }

    return true;
  }

  /**
   * Validate trade execution parameters
   */
  validateTradeParams(opportunity, amount) {
    this.validateOpportunity(opportunity);

    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Trade amount must be a positive number');
    }

    if (amount > this.portfolio.cash) {
      throw new Error(`Insufficient funds. Available: $${this.portfolio.cash}, Required: $${amount}`);
    }

    return true;
  }
}

// ============================================================================
// EXPORT & DEMO
// ============================================================================

module.exports = { MiniAladdin, MathAgent, MarketAgent, RiskAgent, DataAgent };

// Demo execution
if (require.main === module) {
  console.clear();
  console.log('═'.repeat(80));
  console.log('🎯 MINI-ALADDIN: Multi-Agent Money Machine');
  console.log("   Inspired by BlackRock's $20 Trillion System");
  console.log('═'.repeat(80));
  console.log('\n');

  (async () => {
    // Initialize Mini-Aladdin
    const aladdin = new MiniAladdin({
      initialCapital: 10000,
      riskTolerance: 'medium',
      strategies: ['arbitrage', 'pattern', 'affiliate'],
      autoExecute: false,
    });

    // Event listeners
    aladdin.on('trade_executed', (trade) => {
      console.log(`\n✅ Trade executed: ${trade.id}`);
    });

    console.log('\n🎯 Agent Team Ready:\n');

    // Demo individual agents
    console.log('━'.repeat(80));
    console.log('📊 MATH AGENT - Monte Carlo Simulation');
    console.log('━'.repeat(80));

    const simulation = aladdin.agents.math.monteCarloSimulation(
      45000,
      0.03,
      30,
      10000
    );
    console.log(`Current BTC Price: $45,000`);
    console.log(`\nSimulation Results (10,000 scenarios, 30 days):`);
    console.log(`  Expected Return: ${simulation.expectedReturn.toFixed(2)}%`);
    console.log(
      `  Probability of Profit: ${simulation.probabilityOfProfit.toFixed(1)}%`
    );
    console.log(`  Expected Price: $${simulation.expectedPrice.toFixed(2)}`);
    console.log(
      `  95% Confidence Range: $${simulation.priceRange.low.toFixed(
        2
      )} - $${simulation.priceRange.high.toFixed(2)}`
    );
    console.log(`  Best Case: +${simulation.bestCase.toFixed(2)}%`);
    console.log(`  Worst Case: ${simulation.worstCase.toFixed(2)}%`);
    console.log(`  Value at Risk (95%): ${simulation.var95.toFixed(2)}%`);

    console.log('\n━'.repeat(80));
    console.log('🔺 TRIANGULAR ARBITRAGE');
    console.log('━'.repeat(80));

    const triArb = aladdin.agents.math.calculateTriangularArbitrage(
      45000,
      0.055,
      2500,
      10000
    );
    console.log(`Path: USDT -> BTC -> ETH -> USDT`);
    console.log(`Starting Amount: $10,000`);
    console.log(
      `\nForward Path: ${triArb.forward.percent.toFixed(
        3
      )}% profit ($${triArb.forward.profit.toFixed(2)})`
    );
    console.log(
      `Reverse Path: ${triArb.reverse.percent.toFixed(
        3
      )}% profit ($${triArb.reverse.profit.toFixed(2)})`
    );
    console.log(`Best Strategy: ${triArb.bestPath.toUpperCase()}`);
    console.log(
      `Best Profit: $${triArb.bestProfit.toFixed(
        2
      )} (${triArb.bestPercent.toFixed(3)}%)`
    );
    console.log(`Worth It? ${triArb.worthIt ? '✅ YES' : '❌ NO'}`);

    console.log('\n━'.repeat(80));
    console.log('🎲 KELLY CRITERION - Optimal Position Sizing');
    console.log('━'.repeat(80));

    const kelly = aladdin.agents.math.kellyCalculator(0.65, 2, 10000);
    console.log(`Win Probability: 65%`);
    console.log(`Win/Loss Ratio: 2:1`);
    console.log(`Bankroll: $10,000`);
    console.log(
      `\nFull Kelly: ${kelly.fullKellyPercent.toFixed(
        2
      )}% ($${kelly.fullKellyAmount.toFixed(2)})`
    );
    console.log(
      `Recommended (1/4 Kelly): ${kelly.recommendedPercent.toFixed(
        2
      )}% ($${kelly.recommendedAmount.toFixed(2)})`
    );
    console.log(`Max Risk: $${kelly.maxRisk.toFixed(2)}`);

    // Run the main hunt
    console.log('\n\n═'.repeat(80));
    console.log('💰 STARTING FULL MONEY HUNT');
    console.log('═'.repeat(80));

    const results = await aladdin.hunt();

    console.log('\n━'.repeat(80));
    console.log('🏆 TOP 10 OPPORTUNITIES');
    console.log('━'.repeat(80) + '\n');

    results.opportunities.slice(0, 10).forEach((opp, i) => {
      console.log(
        `${i + 1}. [${opp.category.toUpperCase()}] ${
          opp.symbol || opp.name || opp.type
        }`
      );
      console.log(
        `   Score: ${opp.score}/100 | Priority: ${opp.priority.toUpperCase()}`
      );

      if (opp.category === 'arbitrage') {
        console.log(
          `   💰 Profit: $${opp.profit?.toFixed(
            2
          )} (${opp.profitPercent?.toFixed(2)}%)`
        );
        console.log(`   📊 ${opp.buyExchange} → ${opp.sellExchange}`);
        console.log(`   ⚡ Execute in: ${opp.timeToExecute}`);
      } else if (opp.category === 'trading') {
        console.log(
          `   💰 Expected Return: ${opp.expectedReturn?.toFixed(2)}%`
        );
        console.log(`   📈 Probability: ${opp.confidence}%`);
        console.log(
          `   🎯 Patterns: ${opp.patterns?.map((p) => p.type).join(', ')}`
        );
      } else if (opp.category === 'affiliate') {
        console.log(
          `   💰 Est. Revenue: $${opp.estimatedMonthlyRevenue}/month`
        );
        console.log(`   📊 Commission: ${opp.commission}`);
      }

      if (opp.risk) {
        console.log(
          `   🛡️  Risk: ${opp.risk.riskLevel.toUpperCase()} (${
            opp.risk.riskScore
          }/100)`
        );
      }
      console.log('');
    });

    // Execution Plan
    console.log('\n━'.repeat(80));
    console.log('📋 EXECUTION PLAN');
    console.log('━'.repeat(80) + '\n');

    console.log('🔴 IMMEDIATE (Execute Now):');
    results.plan.immediate.slice(0, 3).forEach((action) => {
      console.log(
        `\n  ✓ ${action.opportunity.symbol || action.opportunity.name}`
      );
      console.log(`    Category: ${action.opportunity.category}`);
      action.steps.forEach((step) => console.log(`    ${step}`));
    });

    if (results.plan.today.length > 0) {
      console.log('\n\n🟡 TODAY:');
      results.plan.today.slice(0, 2).forEach((action) => {
        console.log(
          `\n  ✓ ${action.opportunity.symbol || action.opportunity.name}`
        );
        console.log(
          `    Expected: ${action.estimatedReturn.percent?.toFixed(2)}%`
        );
      });
    }

    if (results.plan.thisWeek.length > 0) {
      console.log('\n\n🟢 THIS WEEK:');
      results.plan.thisWeek.slice(0, 2).forEach((action) => {
        console.log(
          `\n  ✓ ${action.opportunity.name || action.opportunity.type}`
        );
      });
    }

    // Generate full report
    const report = aladdin.generateReport();

    console.log('\n\n━'.repeat(80));
    console.log('📊 FINANCIAL SUMMARY');
    console.log('━'.repeat(80) + '\n');

    console.log(
      `Portfolio Value: $${report.portfolio.totalValue.toLocaleString()}`
    );
    console.log(`Available Cash: $${report.portfolio.cash.toLocaleString()}`);
    console.log(`Total Opportunities: ${report.summary.totalOpportunities}`);
    console.log(`High Priority: ${report.summary.highPriority}`);
    console.log(`\n💰 PROFIT PROJECTIONS:`);
    console.log(`  Daily: $${report.summary.estimatedDailyProfit}`);
    console.log(
      `  Monthly: $${report.summary.estimatedMonthlyProfit.toLocaleString()}`
    );
    console.log(
      `  Yearly: $${(
        report.summary.estimatedMonthlyProfit * 12
      ).toLocaleString()}`
    );

    console.log('\n━'.repeat(80));
    console.log('🎯 STRATEGY BREAKDOWN');
    console.log('━'.repeat(80) + '\n');

    console.log(`Arbitrage Opportunities: ${report.strategies.arbitrage}`);
    console.log(`Pattern Trading: ${report.strategies.trading}`);
    console.log(`Affiliate Programs: ${report.strategies.affiliate}`);

    console.log('\n━'.repeat(80));
    console.log('🤖 AGENT INTELLIGENCE');
    console.log('━'.repeat(80) + '\n');

    report.agents.forEach((agent) => {
      console.log(`✓ ${agent.name}`);
      console.log(`  ${agent.specialty}\n`);
    });

    // Best opportunity details
    const best = report.bestOpportunities[0];
    console.log('\n━'.repeat(80));
    console.log('🥇 BEST OPPORTUNITY RIGHT NOW');
    console.log('━'.repeat(80) + '\n');

    console.log(`Type: ${best.type || best.category}`);
    console.log(`Symbol: ${best.symbol || best.name || 'N/A'}`);
    console.log(`Score: ${best.score}/100`);
    console.log(`Priority: ${best.priority.toUpperCase()}`);
    console.log(`Confidence: ${best.confidence}%`);

    if (best.profit) {
      console.log(`\n💰 PROFIT POTENTIAL:`);
      console.log(`  Amount: $${best.profit.toFixed(2)}`);
      console.log(`  Percentage: ${best.profitPercent.toFixed(2)}%`);
      console.log(`  ROI: ${best.roi.toFixed(2)}%`);
    }

    if (best.risk) {
      console.log(`\n🛡️  RISK ASSESSMENT:`);
      console.log(`  Risk Score: ${best.risk.riskScore}/100`);
      console.log(`  Risk Level: ${best.risk.riskLevel.toUpperCase()}`);
      console.log(`  Approved: ${best.risk.approved ? '✅ YES' : '❌ NO'}`);
      console.log(`  Position Size: $${best.risk.positionSize?.toFixed(2)}`);
      console.log(`  Stop Loss: ${best.risk.stopLoss?.toFixed(2)}%`);
      console.log(`  Max Loss: $${best.risk.maxLoss?.toFixed(2)}`);
    }

    console.log('\n\n═'.repeat(80));
    console.log('🚀 GETTING STARTED');
    console.log('═'.repeat(80) + '\n');

    console.log('Next Steps:');
    console.log('1. Review top opportunities above');
    console.log('2. Connect exchange APIs for real execution');
    console.log('3. Set up MCP protocol for data sources');
    console.log('4. Enable auto-execute for arbitrage opportunities');
    console.log('5. Monitor the system 24/7');

    console.log('\n💡 Pro Tips:');
    console.log('• Start with arbitrage - fastest ROI');
    console.log('• Diversify across all 3 categories');
    console.log('• Never risk more than 2% per trade');
    console.log('• Let the agents handle the math');
    console.log('• Monitor real-time with: aladdin.startMonitoring()');

    console.log('\n📈 To enable real-time monitoring:');
    console.log('   aladdin.startMonitoring(30000); // Check every 30 seconds');

    console.log('\n💰 To execute a trade:');
    console.log('   aladdin.executeTrade(opportunity);');

    console.log('\n\n═'.repeat(80));
    console.log('✅ MINI-ALADDIN READY TO MAKE MONEY!');
    console.log('═'.repeat(80));
    console.log(
      `\n🎯 ${report.summary.totalOpportunities} opportunities found`
    );
    console.log(
      `💰 Potential: $${report.summary.estimatedMonthlyProfit.toLocaleString()}/month\n`
    );

    console.log('🔥 THE MONEY MACHINE IS ONLINE! 🔥\n');
  })();
}
