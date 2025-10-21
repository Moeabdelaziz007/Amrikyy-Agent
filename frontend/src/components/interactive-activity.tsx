
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronRight } from "lucide-react"

const activities = [
  {
    id: 1,
    agent: "Email Assistant",
    action: "Processed 45 emails",
    time: "2 minutes ago",
    type: "success",
    details: {
      taskLogs: [
        "Email 1: Processed successfully",
        "Email 2: Processed successfully",
        "Email 3: Processed successfully",
      ],
      inputs: "45 emails from inbox",
      memory: "2.3 MB",
      duration: "45 seconds",
    },
  },
  {
    id: 2,
    agent: "Data Analyzer",
    action: "Completed analysis",
    time: "15 minutes ago",
    type: "success",
    details: {
      taskLogs: ["Data loaded", "Analysis started", "Results generated"],
      inputs: "500 data points",
      memory: "5.1 MB",
      duration: "2 minutes",
    },
  },
  {
    id: 3,
    agent: "Content Creator",
    action: "Generated 3 articles",
    time: "1 hour ago",
    type: "success",
    details: {
      taskLogs: ["Article 1: Generated", "Article 2: Generated", "Article 3: Generated"],
      inputs: "3 topics",
      memory: "3.8 MB",
      duration: "8 minutes",
    },
  },
  {
    id: 4,
    agent: "Customer Support",
    action: "Resolved 12 tickets",
    time: "2 hours ago",
    type: "success",
    details: {
      taskLogs: ["Ticket 1: Resolved", "Ticket 2: Resolved", "Ticket 3: Resolved"],
      inputs: "12 support tickets",
      memory: "1.9 MB",
      duration: "15 minutes",
    },
  },
  {
    id: 5,
    agent: "Report Generator",
    action: "Failed to generate report",
    time: "3 hours ago",
    type: "error",
    details: {
      taskLogs: ["Report generation started", "Error: Missing data source", "Retrying..."],
      inputs: "Q4 financial data",
      memory: "0.8 MB",
      duration: "30 seconds",
    },
  },
]

export function InteractiveActivity() {
  const [selectedActivity, setSelectedActivity] = useState<(typeof activities)[0] | null>(null)

  return (
    <>
      <Card className="glass h-full">
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription className="text-xs">Click on any activity for details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => setSelectedActivity(activity)}
                className="w-full flex items-start gap-3 p-3 rounded-lg border border-border/30 hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">
                    {activity.agent}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={activity.type === "success" ? "default" : "destructive"} className="text-xs">
                    {activity.type}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Details Modal */}
      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedActivity?.agent}</DialogTitle>
            <DialogDescription>{selectedActivity?.action}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Task Logs</h4>
              <div className="space-y-1 bg-muted/30 p-3 rounded-lg">
                {selectedActivity?.details.taskLogs.map((log, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    {log}
                  </p>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Inputs</p>
                <p className="text-sm font-medium">{selectedActivity?.details.inputs}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Memory Used</p>
                <p className="text-sm font-medium">{selectedActivity?.details.memory}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-medium">{selectedActivity?.details.duration}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={selectedActivity?.type === "success" ? "default" : "destructive"}>
                  {selectedActivity?.type}
                </Badge>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
