import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  Play,
  RefreshCw,
  Filter,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAladdinStore } from '@/store/aladdinStore';
import { aladdinApi } from '@/api/aladdin';
import { toast } from 'sonner';

export default function Aladdin() {
  const {
    opportunities,
    stats,
    isHunting,
    isLoadingStats,
    lastHuntTime,
    filters,
    startHunt,
    fetchOpportunities,
    fetchStats,
    setFilters,
    setSelectedOpportunity,
  } = useAladdinStore();

  const [agentHealth, setAgentHealth] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchStats();
    checkAgentHealth();
  }, []);

  const checkAgentHealth = async () => {
    try {
      const health = await aladdinApi.checkHealth();
      setAgentHealth(health);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  const handleStartHunt = async () => {
    await startHunt();
    checkAgentHealth();
  };

  // Filter opportunities by search term
  const filteredOpportunities = opportunities.filter((opp) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      opp.id?.toLowerCase().includes(search) ||
      opp.category?.toLowerCase().includes(search) ||
      opp.description?.toLowerCase().includes(search)
    );
  });

  // Calculate stats
  const totalOpportunities = opportunities.length;
  const bestScore = opportunities.length > 0
    ? Math.max(...opportunities.map((o) => o.score || 0))
    : 0;
  const totalProfit = opportunities.reduce(
    (sum, o) => sum + (o.profit || o.estimatedProfit || 0),
    0
  );

  const metricCards = [
    {
      title: 'Opportunities Found',
      value: totalOpportunities.toString(),
      icon: Target,
      trend: stats?.opportunities?.total
        ? `${stats.opportunities.total} total`
        : 'No data',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Best Score',
      value: bestScore.toFixed(0),
      icon: TrendingUp,
      trend: bestScore >= 70 ? 'Excellent' : bestScore >= 50 ? 'Good' : 'Fair',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Est. Total Profit',
      value: `$${(totalProfit / 1000).toFixed(1)}K`,
      icon: DollarSign,
      trend: `${opportunities.length} opportunities`,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Agent Status',
      value: agentHealth?.status || 'checking',
      icon: Activity,
      trend: agentHealth?.agents ? '4 agents active' : 'Initializing',
      color:
        agentHealth?.status === 'healthy'
          ? 'text-green-500'
          : 'text-yellow-500',
      bgColor:
        agentHealth?.status === 'healthy'
          ? 'bg-green-500/10'
          : 'bg-yellow-500/10',
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'arbitrage':
        return 'text-blue-500 bg-blue-500/10';
      case 'trading':
        return 'text-green-500 bg-green-500/10';
      case 'affiliate':
        return 'text-purple-500 bg-purple-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-green-500">Excellent</Badge>;
    if (score >= 50) return <Badge className="bg-blue-500">Good</Badge>;
    if (score >= 30) return <Badge className="bg-yellow-500">Fair</Badge>;
    return <Badge variant="destructive">Low</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            💰 Mini-Aladdin Money Hunter
          </h1>
          <p className="text-muted-foreground">
            AI-powered multi-agent system for finding profitable opportunities
          </p>
        </div>

        {/* Hunt Control Panel */}
        <Card className="mb-8 animate-fade-in-up">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Money Hunt Control
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lastHuntTime
                    ? `Last hunt: ${new Date(lastHuntTime).toLocaleString()}`
                    : 'No hunts yet - start your first hunt!'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Rate limit: 10 hunts per 15 minutes
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleStartHunt}
                  disabled={isHunting}
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90"
                >
                  {isHunting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Hunting...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Hunt
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    fetchOpportunities(filters);
                    fetchStats();
                    checkAgentHealth();
                  }}
                  variant="outline"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricCards.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 ${metric.bgColor} rounded-lg`}>
                      <metric.icon className={`w-5 h-5 ${metric.color}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {metric.trend}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold capitalize">
                    {metric.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Opportunities Section */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Opportunities
                </CardTitle>
                <CardDescription>
                  {filteredOpportunities.length} opportunities found
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={filters.category || 'all'}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      category: value === 'all' ? undefined : (value as any),
                    })
                  }
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="arbitrage">Arbitrage</SelectItem>
                    <SelectItem value="trading">Trading</SelectItem>
                    <SelectItem value="affiliate">Affiliate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">
                  All ({opportunities.length})
                </TabsTrigger>
                <TabsTrigger value="arbitrage">
                  Arbitrage (
                  {opportunities.filter((o) => o.category === 'arbitrage').length}
                  )
                </TabsTrigger>
                <TabsTrigger value="trading">
                  Trading (
                  {opportunities.filter((o) => o.category === 'trading').length})
                </TabsTrigger>
                <TabsTrigger value="affiliate">
                  Affiliate (
                  {opportunities.filter((o) => o.category === 'affiliate').length}
                  )
                </TabsTrigger>
              </TabsList>

              {['all', 'arbitrage', 'trading', 'affiliate'].map((tab) => (
                <TabsContent key={tab} value={tab}>
                  {filteredOpportunities.filter(
                    (o) => tab === 'all' || o.category === tab
                  ).length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No opportunities found. Start a hunt to find opportunities!
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Profit</TableHead>
                            <TableHead>Risk</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOpportunities
                            .filter((o) => tab === 'all' || o.category === tab)
                            .map((opp) => (
                              <TableRow key={opp.id}>
                                <TableCell className="font-mono text-xs">
                                  {opp.id?.substring(0, 8)}...
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={getCategoryColor(opp.category)}
                                  >
                                    {opp.category}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">
                                      {opp.score?.toFixed(0) || 0}
                                    </span>
                                    {getScoreBadge(opp.score || 0)}
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold text-green-600">
                                  $
                                  {(
                                    opp.profit ||
                                    opp.estimatedProfit ||
                                    0
                                  ).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {opp.risk || 'Unknown'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedOpportunity(opp);
                                      toast.info('Analysis feature coming soon!');
                                    }}
                                  >
                                    Analyze
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Agent Status Panel */}
        {agentHealth?.agents && (
          <Card className="mt-8 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Agent Status
              </CardTitle>
              <CardDescription>
                Multi-agent system health monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(agentHealth.agents).map(([key, name]) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-4 rounded-lg border bg-card"
                  >
                    <div className="p-2 bg-green-500/10 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold capitalize">{key} Agent</p>
                      <p className="text-xs text-muted-foreground">{name as string}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
