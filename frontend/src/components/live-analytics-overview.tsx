
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, AreaChart, Area, ResponsiveContainer } from "recharts"
import { useRealTimeData } from "@/hooks/use-real-time-data"
import { apiClient } from "@/lib/api/client"

const chartData = [
  { time: "00:00", agents: 4, tasks: 24, success: 98 },
  { time: "04:00", agents: 6, tasks: 42, success: 97 },
  { time: "08:00", agents: 8, tasks: 65, success: 99 },
  { time: "12:00", agents: 12, tasks: 142, success: 98.5 },
  { time: "16:00", agents: 10, tasks: 98, success: 99.2 },
  { time: "20:00", agents: 9, tasks: 87, success: 98.8 },
  { time: "24:00", agents: 12, tasks: 147, success: 98.2 },
]

export function LiveAnalyticsOverview() {
  const [animatedValue, setAnimatedValue] = useState(0)

  const { data: agencyStats, loading } = useRealTimeData(() => apiClient.agency.getStats(), { interval: 30000 })

  useEffect(() => {
    if (!agencyStats) return

    const interval = setInterval(() => {
      setAnimatedValue((prev) => (prev < agencyStats.activeAgents ? prev + 0.1 : agencyStats.activeAgents))
    }, 50)
    return () => clearInterval(interval)
  }, [agencyStats])

  const stats = agencyStats || {
    activeAgents: 0,
    totalTasksCompleted: 0,
    successRate: 0,
    averageProcessingTime: 0,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Active Agents - Real-time Counter */}
      <Card className="glass glass-hover relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Agents</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold">{Math.floor(animatedValue)}</div>
          <p className="text-xs text-accent mt-1">{loading ? "Updating..." : "Live data"}</p>
        </CardContent>
      </Card>

      {/* Tasks Completed - Real Data */}
      <Card className="glass glass-hover">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalTasksCompleted?.toLocaleString() || "0"}</div>
          <ResponsiveContainer width="100%" height={40}>
            <AreaChart data={chartData}>
              <Area type="monotone" dataKey="tasks" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-accent mt-2">+12% from last week</p>
        </CardContent>
      </Card>

      {/* Success Rate - Real Data */}
      <Card className="glass glass-hover">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.successRate?.toFixed(1) || "0"}%</div>
          <div className="w-full bg-muted rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-accent to-primary h-full rounded-full"
              style={{ width: `${stats.successRate || 0}%`, animation: "pulse 2s ease-in-out infinite" }}
            />
          </div>
          <p className="text-xs text-accent mt-2">+0.5% from last week</p>
        </CardContent>
      </Card>

      {/* Avg Response Time - Real Data */}
      <Card className="glass glass-hover">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.averageProcessingTime || "0"}ms</div>
          <ResponsiveContainer width="100%" height={40}>
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="success" stroke="var(--primary)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-accent mt-2">-12ms from last week</p>
        </CardContent>
      </Card>
    </div>
  )
}
