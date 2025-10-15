/**
 * Agent Monitor Dashboard
 * Real-time monitoring of Maya Voice-First Multi-Agent System
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Zap,
  BookOpen,
  Cpu,
  Wifi,
  WifiOff
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  status: 'idle' | 'processing' | 'error';
  load: number;
  tasksProcessed: number;
  successRate: number;
  currentTask: string | null;
  responseTime: number;
  health: 'healthy' | 'warning' | 'critical';
}

interface SystemMetrics {
  totalRequests: number;
  activeConversations: number;
  systemHealth: string;
  lastUpdate: string;
}

interface JournalMetrics {
  journalConnected: boolean;
  patternsCount: number;
  insightsCount: number;
  totalJournalEntries: number;
}

const AgentMonitorDashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [journalMetrics, setJournalMetrics] = useState<JournalMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3001/ws/agent-monitor`);
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('Connected to agent monitor WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'initial_data' || data.type === 'real_time_update') {
        setAgents(data.data.agents || []);
        setSystemMetrics(data.data.system);
        setJournalMetrics(data.data.journal);
        setLastUpdate(data.data.timestamp);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from agent monitor WebSocket');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-500';
      case 'idle': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getLoadColor = (load: number) => {
    if (load > 80) return 'bg-red-500';
    if (load > 60) return 'bg-yellow-500';
    if (load > 40) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Maya Voice-First Multi-Agent System
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time monitoring and performance tracking
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                <span className="text-sm font-medium">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {lastUpdate && (
                <div className="text-sm text-gray-500">
                  Last update: {new Date(lastUpdate).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemMetrics?.systemHealth || 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Conversations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemMetrics?.activeConversations || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Journal Patterns</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {journalMetrics?.patternsCount || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemMetrics?.totalRequests || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="journal">Journal Learning</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{agent.avatar}</span>
                        <div>
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <Badge 
                            className={`mt-1 ${getHealthColor(agent.health)}`}
                            variant="outline"
                          >
                            {agent.health}
                          </Badge>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Load Bar */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Load</span>
                        <span>{agent.load}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getLoadColor(agent.load)}`}
                          style={{ width: `${agent.load}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Tasks Processed</p>
                        <p className="font-semibold">{agent.tasksProcessed}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Success Rate</p>
                        <p className="font-semibold">{agent.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Response Time</p>
                        <p className="font-semibold">{agent.responseTime}ms</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Health</p>
                        <p className={`font-semibold ${getHealthColor(agent.health)}`}>
                          {agent.health}
                        </p>
                      </div>
                    </div>

                    {/* Current Task */}
                    {agent.currentTask && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600">Current Task</p>
                        <p className="text-sm font-medium text-gray-900">{agent.currentTask}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Journal Learning Tab */}
          <TabsContent value="journal" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Journal Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Connection Status</span>
                    <Badge 
                      variant={journalMetrics?.journalConnected ? "default" : "destructive"}
                    >
                      {journalMetrics?.journalConnected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Entries</span>
                    <span className="font-semibold">{journalMetrics?.totalJournalEntries || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Patterns Extracted</span>
                    <span className="font-semibold">{journalMetrics?.patternsCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Insights Generated</span>
                    <span className="font-semibold">{journalMetrics?.insightsCount || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5" />
                    <span>Learning Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Learning patterns in real-time</p>
                      <p className="text-lg font-semibold text-gray-900 mt-2">
                        Continuous Improvement Active
                      </p>
                    </div>
                    <Button className="w-full" variant="outline">
                      View Learning Patterns
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Performance charts and analytics</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Real-time performance data visualization coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Automation Workflows</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Automated workflow management</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Cline automation workflows and scheduling
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentMonitorDashboard;
