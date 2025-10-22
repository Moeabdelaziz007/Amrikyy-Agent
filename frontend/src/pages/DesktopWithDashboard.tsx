/**
 * Desktop with Dashboard Demo
 * Shows Window Manager with Dashboard Mini-App
 *
 * @page
 * @author CURSERO AI
 * @created 2025-10-21
 */

import React from 'react';
import { WindowManagerProvider } from '@/contexts/WindowManagerContext';
import { Window } from '@/components/layout';
import { DashboardMiniApp } from '@/mini-apps';
import {
  LayoutDashboard,
  Terminal,
  Settings
} from 'lucide-react';

export function DesktopWithDashboard() {
  return (
    <WindowManagerProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Desktop Background Pattern */}
        <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>

        {/* Dashboard Window */}
        <Window
          id="dashboard-main"
          title="Dashboard"
          icon={<LayoutDashboard size={16} />}
          initialPosition={{ x: 50, y: 50 }}
          initialSize={{ width: 1200, height: 800 }}
          minSize={{ width: 800, height: 600 }}
          glassIntensity={0.85}
          variant="primary"
        >
          <DashboardMiniApp />
        </Window>

        {/* Optional: Terminal Window (minimized by default) */}
        {/*
        <Window
          id="terminal-1"
          title="Terminal"
          icon={<Terminal size={16} />}
          initialPosition={{ x: 100, y: 100 }}
          initialSize={{ width: 600, height: 400 }}
        >
          <div className="p-4 font-mono text-sm text-green-400">
            <p>$ amrikyy-os --version</p>
            <p>AMRIKYY AI OS v1.0.0</p>
            <p className="text-slate-500 mt-2">Ready for commands...</p>
          </div>
        </Window>
        */}

        {/* Taskbar */}
        <div className="fixed bottom-0 left-0 right-0 h-14 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 z-50">
          <div className="h-full flex items-center justify-between px-4">
            {/* Left: App Icons */}
            <div className="flex items-center gap-2">
              <button className="
                px-4 py-2 rounded-lg
                flex items-center gap-2
                bg-white/20 text-white
                hover:bg-white/30
                transition-all
              ">
                <LayoutDashboard size={18} />
                <span className="text-sm font-medium">Dashboard</span>
              </button>
            </div>

            {/* Right: System Tray */}
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-400">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WindowManagerProvider>
  );
}

DesktopWithDashboard.displayName = 'DesktopWithDashboard';

export default DesktopWithDashboard;
