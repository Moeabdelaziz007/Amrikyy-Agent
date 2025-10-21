import type React from "react"

export interface WindowState {
  id: string
  appId: string
  title: string
  icon?: string
  x: number
  y: number
  width: number
  height: number
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  component: React.ReactNode
}

export interface MiniApp {
  id: string
  title: string
  icon: string
  defaultWidth?: number
  defaultHeight?: number
  component: React.ReactNode
}
