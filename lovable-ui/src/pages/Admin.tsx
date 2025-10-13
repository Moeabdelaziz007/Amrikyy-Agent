import { TrendingUp, Users, DollarSign, Activity, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockDashboardData } from '@/lib/mockApi';

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
          <p className="text-muted-foreground">Monitor performance and manage your travel platform</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <Badge variant={metric.trendUp ? 'default' : 'destructive'} className="text-xs">
                    {metric.trend}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                <p className="text-3xl font-bold">{metric.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Agent Performance */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                AI Agent Performance
              </CardTitle>
              <CardDescription>Comparative metrics across destinations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {agentPerformance.map((agent, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{agent.name}</span>
                      <Badge variant="secondary">{agent.satisfaction}/5.0</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Queries</p>
                        <p className="font-semibold">{agent.queries}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-semibold">${(agent.revenue / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rating</p>
                        <p className="font-semibold">{agent.satisfaction}</p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                        style={{ width: `${(agent.satisfaction / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Real-time platform status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { name: 'API Response Time', value: 98, status: 'Excellent' },
                  { name: 'Database Performance', value: 95, status: 'Excellent' },
                  { name: 'AI Model Accuracy', value: 92, status: 'Good' },
                  { name: 'Payment Gateway', value: 100, status: 'Operational' },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant={item.value >= 95 ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.value >= 95 ? 'bg-gradient-primary' : 'bg-secondary'
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
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest transactions and reservations</CardDescription>
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
                    <TableCell className="font-mono text-sm">{booking.id}</TableCell>
                    <TableCell className="font-medium">{booking.customer}</TableCell>
                    <TableCell>{booking.destination}</TableCell>
                    <TableCell className="text-muted-foreground">{booking.date}</TableCell>
                    <TableCell className="font-semibold">${booking.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
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
      </div>
    </div>
  );
}
