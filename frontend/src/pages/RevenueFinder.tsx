import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Zap,
  Target,
  Clock,
  Star,
  ArrowRight,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Opportunity {
  name: string;
  category: string;
  score: number;
  estimatedRevenue: number;
  difficulty: string;
  timeToRevenue: string;
  scalability: string;
  priority: string;
  matchScore: number;
  description: string;
  effort?: string;
}

interface ActionPlan {
  immediate: Array<{
    opportunity: string;
    score: number;
    estimatedRevenue: number;
    nextSteps: string[];
  }>;
  shortTerm: Array<{ opportunity: string; estimatedRevenue: number }>;
  longTerm: Array<{ opportunity: string; estimatedRevenue: number }>;
}

interface ForecastMonth {
  month: number;
  monthlyRevenue: number;
  cumulativeRevenue: number;
  activeOpportunities: number;
}

interface RevenueData {
  opportunities: Opportunity[];
  actionPlan: ActionPlan;
  forecast: ForecastMonth[];
  quickWins: Opportunity[];
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    opportunities: string[];
  }>;
}

export default function RevenueFinder() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RevenueData | null>(null);
  const [skills, setSkills] = useState(
    'javascript,security,ai,automation,api,development'
  );
  const [timeAvailable, setTimeAvailable] = useState('15');
  const [minRevenue, setMinRevenue] = useState('500');

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/revenue/opportunities?skills=${skills}&timeAvailable=${timeAvailable}&minRevenue=${minRevenue}`
      );
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch opportunities, using mock data:', error);
      // Use mock data for testing
      setData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  // Mock data for testing UI without backend
  const getMockData = (): RevenueData => ({
    opportunities: [
      {
        name: 'Build Security Audit API',
        category: 'api_product',
        score: 88,
        estimatedRevenue: 1000,
        difficulty: 'medium',
        timeToRevenue: '3-4 months',
        scalability: 'very high',
        priority: 'high',
        matchScore: 100,
        description:
          'Create API for security auditing (based on your AIX auditor)',
        effort: 'medium',
      },
      {
        name: 'Security Audit Template Pack',
        category: 'digital_product',
        score: 85,
        estimatedRevenue: 600,
        difficulty: 'low',
        timeToRevenue: '1 month',
        scalability: 'very high',
        priority: 'high',
        matchScore: 50,
        description: 'Sell audit templates, checklists, and reports',
        effort: 'low',
      },
      {
        name: 'AI Agent Development Course',
        category: 'digital_product',
        score: 82,
        estimatedRevenue: 1500,
        difficulty: 'medium',
        timeToRevenue: '2-3 months',
        scalability: 'very high',
        priority: 'high',
        matchScore: 67,
        description: 'Create course on building AI agents',
        effort: 'high',
      },
      {
        name: 'AI Integration Specialist',
        category: 'freelance',
        score: 76,
        estimatedRevenue: 3000,
        difficulty: 'medium',
        timeToRevenue: '1-2 months',
        scalability: 'medium',
        priority: 'medium',
        matchScore: 67,
        description: 'Help businesses integrate AI tools',
        effort: 'high',
      },
      {
        name: 'GitHub Action Marketplace',
        category: 'automation_tool',
        score: 76,
        estimatedRevenue: 400,
        difficulty: 'medium',
        timeToRevenue: '2-3 months',
        scalability: 'very high',
        priority: 'medium',
        matchScore: 67,
        description: 'Publish security audit GitHub Action',
        effort: 'medium',
      },
    ],
    actionPlan: {
      immediate: [
        {
          opportunity: 'Security Audit Template Pack',
          score: 85,
          estimatedRevenue: 600,
          nextSteps: [
            '1. Outline content/product structure',
            '2. Create high-quality product',
            '3. Set up sales page with Gumroad/Stripe',
            '4. Build email list',
            '5. Launch with special offer',
          ],
        },
      ],
      shortTerm: [
        { opportunity: 'AI Integration Specialist', estimatedRevenue: 3000 },
        { opportunity: 'GitHub Action Marketplace', estimatedRevenue: 400 },
      ],
      longTerm: [
        { opportunity: 'Build Security Audit API', estimatedRevenue: 1000 },
        { opportunity: 'AI Agent Development Course', estimatedRevenue: 1500 },
      ],
    },
    forecast: [
      {
        month: 1,
        monthlyRevenue: 1820,
        cumulativeRevenue: 1820,
        activeOpportunities: 4,
      },
      {
        month: 2,
        monthlyRevenue: 3620,
        cumulativeRevenue: 5440,
        activeOpportunities: 7,
      },
      {
        month: 3,
        monthlyRevenue: 5520,
        cumulativeRevenue: 10960,
        activeOpportunities: 11,
      },
      {
        month: 4,
        monthlyRevenue: 6620,
        cumulativeRevenue: 17580,
        activeOpportunities: 13,
      },
      {
        month: 5,
        monthlyRevenue: 8620,
        cumulativeRevenue: 26200,
        activeOpportunities: 17,
      },
      {
        month: 6,
        monthlyRevenue: 8620,
        cumulativeRevenue: 34820,
        activeOpportunities: 17,
      },
    ],
    quickWins: [
      {
        name: 'Security Audit Template Pack',
        category: 'digital_product',
        score: 85,
        estimatedRevenue: 600,
        difficulty: 'low',
        timeToRevenue: '1 month',
        scalability: 'very high',
        priority: 'high',
        matchScore: 50,
        description: 'Sell audit templates, checklists, and reports',
        effort: 'low',
      },
    ],
    recommendations: [
      {
        type: 'quick_win',
        title: 'Start with Quick Wins',
        description:
          'You have 1 easy opportunity with high score. Start here for fast momentum.',
        opportunities: ['Security Audit Template Pack'],
      },
      {
        type: 'high_revenue',
        title: 'High Revenue Opportunities',
        description:
          '3 opportunities with $1000+/month potential. Worth the extra effort.',
        opportunities: [
          'Build Security Audit API',
          'AI Agent Development Course',
          'AI Integration Specialist',
        ],
      },
      {
        type: 'skill_leverage',
        title: 'Leverage Your Strengths',
        description:
          '1 opportunity matches your skills perfectly. Highest success probability.',
        opportunities: ['Build Security Audit API'],
      },
    ],
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const exportToCSV = () => {
    if (!data) return;

    const headers = [
      'Name',
      'Category',
      'Score',
      'Revenue',
      'Difficulty',
      'Time to Revenue',
      'Scalability',
      'Priority',
    ];
    const rows = data.opportunities.map((o) => [
      o.name,
      o.category,
      o.score,
      o.estimatedRevenue,
      o.difficulty,
      o.timeToRevenue,
      o.scalability || 'N/A',
      o.priority,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-opportunities-${
      new Date().toISOString().split('T')[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-600 bg-green-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <RefreshCw className="w-16 h-16 mx-auto mb-4 animate-spin text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Finding Revenue Opportunities...
          </h2>
          <p className="text-gray-600 mt-2">
            Analyzing your skills and market data
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <DollarSign className="w-12 h-12 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              MoneyFinder AI
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Discover personalized revenue opportunities based on your skills
          </p>
        </motion.div>

        {/* Configuration Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="skills">Your Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="javascript,ai,security"
                  />
                </div>
                <div>
                  <Label htmlFor="time">Hours Available/Week</Label>
                  <Input
                    id="time"
                    type="number"
                    value={timeAvailable}
                    onChange={(e) => setTimeAvailable(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="revenue">Min Monthly Revenue ($)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    value={minRevenue}
                    onChange={(e) => setMinRevenue(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={fetchOpportunities}
                className="mt-4 w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Find Opportunities
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {data && (
          <>
            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">
                    Total Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data.opportunities.length}
                  </div>
                  <p className="text-xs opacity-75 mt-1">
                    Revenue streams found
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">
                    High Priority
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {
                      data.opportunities.filter((o) => o.priority === 'high')
                        .length
                    }
                  </div>
                  <p className="text-xs opacity-75 mt-1">Start with these</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">
                    Quick Wins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data.quickWins.length}
                  </div>
                  <p className="text-xs opacity-75 mt-1">Easy & fast revenue</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">
                    6-Month Potential
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${data.forecast[5]?.cumulativeRevenue.toLocaleString() || 0}
                  </div>
                  <p className="text-xs opacity-75 mt-1">Projected earnings</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="opportunities" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur">
                <TabsTrigger value="opportunities">
                  🏆 Top Opportunities
                </TabsTrigger>
                <TabsTrigger value="action">📋 Action Plan</TabsTrigger>
                <TabsTrigger value="forecast">📈 Forecast</TabsTrigger>
                <TabsTrigger value="recommendations">
                  💡 Recommendations
                </TabsTrigger>
              </TabsList>

              {/* Top Opportunities Tab */}
              <TabsContent value="opportunities" className="space-y-4">
                {data.opportunities.slice(0, 10).map((opp, index) => (
                  <motion.div
                    key={opp.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="hover:shadow-lg transition-shadow border-l-4"
                      style={{
                        borderLeftColor:
                          opp.priority === 'high'
                            ? '#ef4444'
                            : opp.priority === 'medium'
                            ? '#eab308'
                            : '#22c55e',
                      }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-xl">
                                {opp.name}
                              </CardTitle>
                              <Badge className={getPriorityColor(opp.priority)}>
                                {opp.priority.toUpperCase()}
                              </Badge>
                            </div>
                            <CardDescription className="flex items-center gap-4 flex-wrap">
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />$
                                {opp.estimatedRevenue}/mo
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {opp.timeToRevenue}
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="w-4 h-4" />
                                {opp.scalability}
                              </span>
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-purple-600">
                              {opp.score}
                            </div>
                            <div className="text-xs text-gray-500">Score</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{opp.description}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge
                            variant="outline"
                            className={getDifficultyColor(opp.difficulty)}
                          >
                            Difficulty: {opp.difficulty}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-blue-600 bg-blue-50"
                          >
                            Match: {opp.matchScore}%
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-purple-600 bg-purple-50"
                          >
                            {opp.category}
                          </Badge>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Skill Match</span>
                            <span className="font-medium">
                              {opp.matchScore}%
                            </span>
                          </div>
                          <Progress value={opp.matchScore} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              {/* Action Plan Tab */}
              <TabsContent value="action" className="space-y-6">
                <Card className="border-2 border-red-200">
                  <CardHeader className="bg-red-50">
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <Target className="w-5 h-5" />
                      🔴 Immediate (Start This Week)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {data.actionPlan.immediate.map((action, index) => (
                      <div key={index} className="mb-6 last:mb-0">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-lg">
                            {action.opportunity}
                          </h4>
                          <Badge className="bg-red-500">
                            ${action.estimatedRevenue}/mo
                          </Badge>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Next Steps:
                          </p>
                          <ul className="space-y-2">
                            {action.nextSteps.map((step, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-gray-600"
                              >
                                <ArrowRight className="w-4 h-4 mt-0.5 text-red-500" />
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200">
                  <CardHeader className="bg-yellow-50">
                    <CardTitle className="flex items-center gap-2 text-yellow-600">
                      <Clock className="w-5 h-5" />
                      🟡 Short Term (Start This Month)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {data.actionPlan.shortTerm.map((action, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                        >
                          <span className="font-medium">
                            {action.opportunity}
                          </span>
                          <span className="text-sm text-gray-600">
                            ${action.estimatedRevenue}/mo
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="w-5 h-5" />
                      🟢 Long Term (Start This Quarter)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {data.actionPlan.longTerm.map((action, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                        >
                          <span className="font-medium">
                            {action.opportunity}
                          </span>
                          <span className="text-sm text-gray-600">
                            ${action.estimatedRevenue}/mo
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Forecast Tab */}
              <TabsContent value="forecast">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      6-Month Revenue Forecast
                    </CardTitle>
                    <CardDescription>
                      Projected earnings based on opportunity success rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.forecast.map((month) => (
                        <div
                          key={month.month}
                          className="border-b pb-4 last:border-0"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              Month {month.month}
                            </span>
                            <div className="text-right">
                              <div className="text-lg font-bold text-purple-600">
                                ${month.cumulativeRevenue.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                +${month.monthlyRevenue.toLocaleString()} this
                                month
                              </div>
                            </div>
                          </div>
                          <Progress
                            value={
                              (month.cumulativeRevenue /
                                data.forecast[5].cumulativeRevenue) *
                              100
                            }
                            className="h-3"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {month.activeOpportunities} active opportunities
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-4">
                {data.recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-2 border-purple-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-purple-600" />
                          {rec.title}
                        </CardTitle>
                        <CardDescription>{rec.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-purple-900 mb-3">
                            Focus on:
                          </p>
                          <ul className="space-y-2">
                            {rec.opportunities.map((opp, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-2 text-sm text-purple-700"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                {opp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex gap-4 justify-center"
            >
              <Button
                onClick={exportToCSV}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                <Download className="w-5 h-5 mr-2" />
                Export to CSV
              </Button>
              <Button size="lg" variant="outline">
                <Star className="w-5 h-5 mr-2" />
                Save Favorites
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
