/**
 * Demo Desktop - Showcase Window Manager
 * Example of Desktop OS Experience with multiple windows
 *
 * @page
 * @author CURSERO AI
 * @created 2025-10-21
 */

import React, { useState } from 'react';
import { WindowManagerProvider } from '@/contexts/WindowManagerContext';
import { Window } from '@/components/layout';
import {
  Terminal,
  FileText,
  Settings,
  Mail,
  Calendar,
  Plus
} from 'lucide-react';

// ============================================
// DEMO DESKTOP PAGE
// ============================================

export function DemoDesktop() {
  const [windows, setWindows] = useState([
    { id: 'terminal-1', title: 'Terminal', icon: <Terminal size={16} />, active: true },
    { id: 'notes-1', title: 'Notes', icon: <FileText size={16} />, active: true },
    { id: 'settings-1', title: 'Settings', icon: <Settings size={16} />, active: false }
  ]);

  const addWindow = () => {
    const newId = `window-${Date.now()}`;
    setWindows([
      ...windows,
      {
        id: newId,
        title: `New Window ${windows.length + 1}`,
        icon: <FileText size={16} />,
        active: true
      }
    ]);
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  return (
    <WindowManagerProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Desktop Background */}
        <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>

        {/* Windows */}
        {windows.map((win, index) => (
          win.active && (
            <Window
              key={win.id}
              id={win.id}
              title={win.title}
              icon={win.icon}
              initialPosition={{
                x: 100 + index * 50,
                y: 100 + index * 50
              }}
              initialSize={{ width: 600, height: 400 }}
              onClose={() => closeWindow(win.id)}
            >
              <WindowContent title={win.title} />
            </Window>
          )
        ))}

        {/* Taskbar */}
        <div className="fixed bottom-0 left-0 right-0 h-14 bg-slate-900/80 backdrop-blur-xl border-t border-white/10">
          <div className="h-full flex items-center justify-between px-4">
            {/* Left: App Launcher */}
            <button
              onClick={addWindow}
              className="
                p-2 rounded-lg
                bg-gradient-to-r from-blue-500 to-purple-600
                hover:from-blue-600 hover:to-purple-700
                text-white
                transition-all
                shadow-lg hover:shadow-xl
              "
              aria-label="Add Window"
            >
              <Plus size={20} />
            </button>

            {/* Center: Open Windows */}
            <div className="flex items-center gap-2">
              {windows.map(win => (
                <button
                  key={win.id}
                  className={`
                    px-4 py-2 rounded-lg
                    flex items-center gap-2
                    transition-all
                    ${win.active
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }
                  `}
                  onClick={() => {
                    // Focus window logic would go here
                  }}
                >
                  {win.icon}
                  <span className="text-sm font-medium">{win.title}</span>
                </button>
              ))}
            </div>

            {/* Right: System Tray */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-400">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Icons (Optional) */}
        <div className="absolute top-4 left-4 space-y-4">
          <DesktopIcon icon={<Mail />} label="Mail" />
          <DesktopIcon icon={<Calendar />} label="Calendar" />
          <DesktopIcon icon={<Settings />} label="Settings" />
        </div>
      </div>
    </WindowManagerProvider>
  );
}

// ============================================
// WINDOW CONTENT COMPONENT
// ============================================

interface WindowContentProps {
  title: string;
}

function WindowContent({ title }: WindowContentProps) {
  return (
    <div className="p-6 h-full">
      <div className="bg-slate-800/50 rounded-lg p-6 h-full">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">
          This is a demo window showcasing the Desktop OS experience in AMRIKYY AI OS.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-2">Features:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✅ Drag to move</li>
              <li>✅ Resize from edges and corners</li>
              <li>✅ Minimize, Maximize, Close</li>
              <li>✅ Glassmorphism design</li>
              <li>✅ Smooth animations (Framer Motion)</li>
              <li>✅ Multiple windows management</li>
              <li>✅ Z-index auto-management</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              💡 <strong>Tip:</strong> Double-click the title bar to maximize/restore the window.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DESKTOP ICON COMPONENT
// ============================================

interface DesktopIconProps {
  icon: React.ReactNode;
  label: string;
}

function DesktopIcon({ icon, label }: DesktopIconProps) {
  return (
    <button className="
      flex flex-col items-center gap-2
      p-3 rounded-lg
      hover:bg-white/10
      transition-colors
      group
    ">
      <div className="
        p-3 rounded-xl
        bg-white/5
        text-white
        group-hover:bg-white/10
        group-hover:scale-110
        transition-all
      ">
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <span className="text-xs text-white font-medium">{label}</span>
    </button>
  );
}

// ============================================
// DISPLAY NAME
// ============================================

DemoDesktop.displayName = 'DemoDesktop';

export default DemoDesktop;
