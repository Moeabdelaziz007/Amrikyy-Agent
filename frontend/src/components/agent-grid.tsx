import { Play, Settings, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const agents = [
  {
    id: 1,
    name: "Email Assistant",
    description: "Manages and responds to emails",
    status: "active",
    tasks: 342,
    uptime: "99.8%",
  },
  {
    id: 2,
    name: "Data Analyzer",
    description: "Processes and analyzes data",
    status: "active",
    tasks: 1203,
    uptime: "99.5%",
  },
  {
    id: 3,
    name: "Content Creator",
    description: "Generates and edits content",
    status: "idle",
    tasks: 567,
    uptime: "98.9%",
  },
  {
    id: 4,
    name: "Customer Support",
    description: "Handles customer inquiries",
    status: "active",
    tasks: 735,
    uptime: "99.2%",
  },
  {
    id: 5,
    name: "Report Generator",
    description: "Creates automated reports",
    status: "active",
    tasks: 289,
    uptime: "99.9%",
  },
  {
    id: 6,
    name: "Scheduler Bot",
    description: "Manages scheduling and reminders",
    status: "idle",
    tasks: 156,
    uptime: "99.1%",
  },
]

export function AgentGrid() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Your Agents</h2>
        <p className="text-sm text-muted-foreground">Manage and monitor your AI agents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="glass glass-hover group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <CardDescription className="text-xs mt-1">{agent.description}</CardDescription>
                </div>
                <Badge variant={agent.status === "active" ? "default" : "secondary"} className="ml-2">
                  {agent.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Tasks</p>
                  <p className="font-semibold">{agent.tasks}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Uptime</p>
                  <p className="font-semibold">{agent.uptime}</p>
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Play className="w-4 h-4 mr-1" />
                  Run
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Settings className="w-4 h-4 mr-1" />
                  Config
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
