import React, { Suspense } from 'react';
import { TrendingUp, Users, DollarSign, Activity, Award } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { mockDashboardData } from '@/lib/mockApi';
import ComplianceDashboard from './ComplianceDashboard';

// Lazy load Quantum Stress Test Panel for better performance
const StressTestPanel = React.lazy(
  () => import('@/components/admin/StressTestPanel')
);

export default function Admin() {
  const { metrics, recentBookings, agentPerformance } = mockDashboardData;

  const metricCards = [
    {
      title: 'Total Bookings',
      value: metrics.totalBookings.toLocaleString(),
      icon: TrendingUp,
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Revenue',
      value: `$${(metrics.revenue / 1000).toFixed(1)}K`,
      icon: DollarSign,
      trend: '+23.1%',
      trendUp: true,
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers.toLocaleString(),
      icon: Users,
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Avg Response',
      value: metrics.avgResponseTime,
      icon: Activity,
      trend: '-0.3s',
      trendUp: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor performance and manage your travel platform
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="quantum">⚡ Quantum System</TabsTrigger>
            <TabsTrigger value="compliance">🛡️ Compliance</TabsTrigger>
            <TabsTrigger value="aladdin">💰 Aladdin</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metricCards.map((metric, index) => (
                <Card
                  key={index}
                  className="animate-fade-in-up hover:shadow-elegant transition-all duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-gradient-primary rounded-lg">
                        <metric.icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <Badge
                        variant={metric.trendUp ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {metric.trend}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {metric.title}
                    </p>
                    <p className="text-3xl font-bold">{metric.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Agent Performance */}
              <Card
                className="animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    AI Agent Performance
                  </CardTitle>
                  <CardDescription>
                    Comparative metrics across destinations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {agentPerformance.map((agent, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{agent.name}</span>
                          <Badge variant="secondary">
                            {agent.satisfaction}/5.0
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Queries</p>
                            <p className="font-semibold">{agent.queries}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Revenue</p>
                            <p className="font-semibold">
                              ${(agent.revenue / 1000).toFixed(0)}K
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Rating</p>
                            <p className="font-semibold">
                              {agent.satisfaction}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                            style={{
                              width: `${(agent.satisfaction / 5) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card
                className="animate-fade-in-up"
                style={{ animationDelay: '0.25s' }}
              >
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Real-time platform status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      {
                        name: 'API Response Time',
                        value: 98,
                        status: 'Excellent',
                      },
                      {
                        name: 'Database Performance',
                        value: 95,
                        status: 'Excellent',
                      },
                      { name: 'AI Model Accuracy', value: 92, status: 'Good' },
                      {
                        name: 'Payment Gateway',
                        value: 100,
                        status: 'Operational',
                      },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.name}</span>
                          <Badge
                            variant={item.value >= 95 ? 'default' : 'secondary'}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.value >= 95
                                ? 'bg-gradient-primary'
                                : 'bg-secondary'
                            }`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings Table */}
            <Card
              className="animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>
                  Latest transactions and reservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-sm">
                          {booking.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {booking.customer}
                        </TableCell>
                        <TableCell>{booking.destination}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {booking.date}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${booking.amount}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              booking.status === 'confirmed'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quantum System Tab */}
          <TabsContent value="quantum">
            <Suspense
              fallback={
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="animate-pulse">
                      Loading Quantum System Panel...
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <StressTestPanel />
            </Suspense>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <ComplianceDashboard />
          </TabsContent>

          {/* Aladdin Tab */}
          <TabsContent value="aladdin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💰 Mini-Aladdin Money Hunter
                </CardTitle>
                <CardDescription>
                  AI-powered opportunity finder - Quick stats overview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    View full Aladdin dashboard for detailed opportunities and analytics
                  </p>
                  <a
                    href="/aladdin"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    Open Aladdin Dashboard →
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-2xl font-bold">Active</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Agents</p>
                      <p className="text-2xl font-bold">4 Running</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Last Hunt</p>
                      <p className="text-2xl font-bold">Ready</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
