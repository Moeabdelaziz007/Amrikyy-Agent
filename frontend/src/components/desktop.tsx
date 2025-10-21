import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { DashboardMiniApp } from "@/mini-apps/DashboardMiniApp"
import { LunaMiniApp } from "@/mini-apps/LunaMiniApp"
import { KarimMiniApp } from "@/mini-apps/KarimMiniApp"
import { KodyMiniApp } from "@/mini-apps/KodyMiniApp"
import type { MiniApp } from "@/types/desktop"

interface DesktopProps {
  onAppOpen: (app: MiniApp) => void
}

const MINI_APPS: MiniApp[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: "📊",
    defaultWidth: 1200,
    defaultHeight: 800,
    component: (
      <Suspense fallback={<div className="p-6">Loading Dashboard...</div>}>
        <DashboardMiniApp />
      </Suspense>
    ),
  },
  {
    id: "luna",
    title: "Luna - Trip Planner",
    icon: "🗺️",
    defaultWidth: 900,
    defaultHeight: 700,
    component: (
      <Suspense fallback={<div className="p-6">Loading Luna...</div>}>
        <LunaMiniApp />
      </Suspense>
    ),
  },
  {
    id: "karim",
    title: "Karim - Budget Optimizer",
    icon: "💰",
    defaultWidth: 900,
    defaultHeight: 700,
    component: (
      <Suspense fallback={<div className="p-6">Loading Karim...</div>}>
        <KarimMiniApp />
      </Suspense>
    ),
  },
  {
    id: "kody",
    title: "Kody - Content Creator",
    icon: "💻",
    defaultWidth: 1000,
    defaultHeight: 800,
    component: (
      <Suspense fallback={<div className="p-6">Loading Kody...</div>}>
        <KodyMiniApp />
      </Suspense>
    ),
  },
]

export function Desktop({ onAppOpen }: DesktopProps) {
  return (
    <div className="absolute inset-0 p-8 pointer-events-none">
      <div className="grid grid-cols-2 gap-8 w-fit pointer-events-auto">
        {MINI_APPS.map((app) => (
          <Button
            key={app.id}
            variant="ghost"
            className="flex flex-col items-center justify-center h-24 w-24 gap-2 hover:bg-primary/10 rounded-lg transition-all"
            onClick={() => onAppOpen(app)}
          >
            <span className="text-4xl">{app.icon}</span>
            <span className="text-xs text-center">{app.title}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
