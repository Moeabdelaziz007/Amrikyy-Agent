import { useState, useCallback } from "react"
import { Window } from "./layout/Window"
import { Taskbar } from "./taskbar"
import { Desktop } from "./desktop"
import type { MiniApp, WindowState } from "@/types/desktop"

export function DesktopOS() {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [zIndex, setZIndex] = useState(1000)

  const openApp = useCallback(
    (app: MiniApp) => {
      const windowId = `${app.id}-${Date.now()}`
      const newWindow: WindowState = {
        id: windowId,
        appId: app.id,
        title: app.title,
        icon: app.icon,
        x: Math.random() * 200 + 100,
        y: Math.random() * 200 + 100,
        width: app.defaultWidth || 800,
        height: app.defaultHeight || 600,
        isMinimized: false,
        isMaximized: false,
        zIndex: zIndex,
        component: app.component,
      }
      setWindows((prev) => [...prev, newWindow])
      setActiveWindowId(windowId)
      setZIndex((prev) => prev + 1)
    },
    [zIndex],
  )

  const closeWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) => prev.filter((w) => w.id !== windowId))
      if (activeWindowId === windowId) {
        setActiveWindowId(null)
      }
    },
    [activeWindowId],
  )

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w)))
  }, [])

  const maximizeWindow = useCallback((windowId: string) => {
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w)))
  }, [])

  const focusWindow = useCallback(
    (windowId: string) => {
      setActiveWindowId(windowId)
      setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, zIndex: zIndex } : w)))
      setZIndex((prev) => prev + 1)
    },
    [zIndex],
  )

  const updateWindowPosition = useCallback((windowId: string, x: number, y: number) => {
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, x, y } : w)))
  }, [])

  const updateWindowSize = useCallback((windowId: string, width: number, height: number) => {
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, width, height } : w)))
  }, [])

  return (
    <div className="w-full h-screen bg-background overflow-hidden">
      <Desktop onAppOpen={openApp} />

      <div className="relative w-full h-full">
        {windows.map((window) => (
          <Window
            key={window.id}
            window={window}
            isActive={activeWindowId === window.id}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onMaximize={() => maximizeWindow(window.id)}
            onFocus={() => focusWindow(window.id)}
            onPositionChange={updateWindowPosition}
            onSizeChange={updateWindowSize}
          />
        ))}
      </div>

      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onWindowClick={(windowId) => {
          const window = windows.find((w) => w.id === windowId)
          if (window?.isMinimized) {
            minimizeWindow(windowId)
          } else {
            focusWindow(windowId)
          }
        }}
      />
    </div>
  )
}
