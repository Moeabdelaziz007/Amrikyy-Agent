import { Button } from "@/components/ui/button"
import type { WindowState } from "@/types/desktop"

interface TaskbarProps {
  windows: WindowState[]
  activeWindowId: string | null
  onWindowClick: (windowId: string) => void
}

export function Taskbar({ windows, activeWindowId, onWindowClick }: TaskbarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-md border-t border-border/30 flex items-center px-4 gap-2 z-50">
      <div className="flex items-center gap-2">
        {windows.map((window) => (
          <Button
            key={window.id}
            variant={activeWindowId === window.id ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => onWindowClick(window.id)}
          >
            {window.icon && <span>{window.icon}</span>}
            <span className="text-xs truncate max-w-[100px]">{window.title}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
