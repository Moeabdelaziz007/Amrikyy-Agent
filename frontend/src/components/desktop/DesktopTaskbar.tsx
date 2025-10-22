import React, { memo } from 'react';
import { Menu, Search, Bell, Settings, Power } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AppConfig, AppId, AppInstance, Notification } from '@/types/os.types';

/**
 * Desktop taskbar props
 */
export interface DesktopTaskbarProps {
  /** Pinned applications */
  pinnedApps: AppConfig[];
  /** Running app instances */
  runningApps: AppInstance[];
  /** Focused window ID */
  focusedWindowId: string | null;
  /** Notifications */
  notifications: Notification[];
  /** App launch handler */
  onAppLaunch: (appId: AppId) => void;
  /** App focus handler */
  onAppFocus: (instanceId: string) => void;
  /** Search open handler */
  onSearchOpen: () => void;
  /** Notifications open handler */
  onNotificationsOpen: () => void;
  /** Settings open handler */
  onSettingsOpen: () => void;
  /** Power menu handler */
  onPowerMenu: () => void;
  /** Custom className */
  className?: string;
}

/**
 * Desktop taskbar - full-featured taskbar for desktop OS
 *
 * Features:
 * - App launcher button
 * - Pinned apps
 * - Running apps with indicators
 * - Search button
 * - System tray (notifications, settings, power)
 * - Clock
 * - Hover effects
 * - Keyboard shortcuts
 *
 * @example
 * ```tsx
 * <DesktopTaskbar
 *   pinnedApps={pinnedApps}
 *   runningApps={runningInstances}
 *   focusedWindowId={focusedId}
 *   notifications={notifications}
 *   onAppLaunch={(id) => launchApp(id)}
 *   onAppFocus={(id) => focusApp(id)}
 *   onSearchOpen={() => setSearchOpen(true)}
 * />
 * ```
 */
export const DesktopTaskbar = memo<DesktopTaskbarProps>(({
  pinnedApps,
  runningApps,
  focusedWindowId,
  notifications,
  onAppLaunch,
  onAppFocus,
  onSearchOpen,
  onNotificationsOpen,
  onSettingsOpen,
  onPowerMenu,
  className,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-gray-900/95 backdrop-blur-xl',
        'border-t border-gray-800',
        'px-4 py-2',
        className
      )}
      role="navigation"
      aria-label="Desktop taskbar"
    >
      <div className="flex items-center gap-2 max-w-screen-2xl mx-auto">
        {/* App Launcher */}
        <button
          onClick={onSearchOpen}
          className={cn(
            'w-10 h-10 rounded-lg',
            'bg-gradient-to-br from-blue-500 to-purple-500',
            'flex items-center justify-center',
            'hover:scale-110 active:scale-95',
            'transition-transform duration-150',
            'focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
          aria-label="Open app launcher"
          title="App Launcher (Ctrl+K)"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        {/* Pinned & Running Apps */}
        <div className="flex items-center gap-1 flex-1">
          {pinnedApps.map((app) => {
            const runningInstances = runningApps.filter((r) => r.appId === app.metadata.id);
            const isRunning = runningInstances.length > 0;
            const isFocused = runningInstances.some((r) => r.instanceId === focusedWindowId);
            const Icon = app.icon.icon;

            return (
              <button
                key={app.metadata.id}
                onClick={() => {
                  if (isRunning) {
                    onAppFocus(runningInstances[0].instanceId);
                  } else {
                    onAppLaunch(app.metadata.id);
                  }
                }}
                className={cn(
                  'relative w-10 h-10 rounded-lg',
                  'flex items-center justify-center',
                  'hover:scale-110 active:scale-95',
                  'transition-all duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  app.icon.gradient || app.icon.color || 'bg-gray-700',
                  isFocused && 'ring-2 ring-blue-500'
                )}
                aria-label={app.metadata.name}
                title={app.metadata.name}
              >
                <Icon className="w-5 h-5 text-white" />

                {/* Running indicator */}
                {isRunning && (
                  <div
                    className={cn(
                      'absolute -bottom-1 left-1/2 -translate-x-1/2',
                      'w-1 h-1 rounded-full',
                      isFocused ? 'bg-blue-400' : 'bg-gray-400'
                    )}
                    aria-hidden="true"
                  />
                )}

                {/* Multiple instances indicator */}
                {runningInstances.length > 1 && (
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold"
                    aria-label={`${runningInstances.length} instances`}
                  >
                    {runningInstances.length}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onClick={onSearchOpen}
            className={cn(
              'w-10 h-10 rounded-lg',
              'bg-gray-800 hover:bg-gray-700',
              'flex items-center justify-center',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
            aria-label="Search"
            title="Search (Ctrl+K)"
          >
            <Search className="w-5 h-5 text-gray-300" />
          </button>

          {/* Notifications */}
          <button
            onClick={onNotificationsOpen}
            className={cn(
              'relative w-10 h-10 rounded-lg',
              'bg-gray-800 hover:bg-gray-700',
              'flex items-center justify-center',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-300" />
            {unreadCount > 0 && (
              <div
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold"
                aria-hidden="true"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onSettingsOpen}
            className={cn(
              'w-10 h-10 rounded-lg',
              'bg-gray-800 hover:bg-gray-700',
              'flex items-center justify-center',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-300" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-700" />

          {/* Clock */}
          <div className="px-3 text-sm text-gray-300 font-medium min-w-[80px] text-center">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          {/* Power */}
          <button
            onClick={onPowerMenu}
            className={cn(
              'w-10 h-10 rounded-lg',
              'bg-gray-800 hover:bg-red-600',
              'flex items-center justify-center',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-red-500'
            )}
            aria-label="Power menu"
            title="Power Menu"
          >
            <Power className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
});

DesktopTaskbar.displayName = 'DesktopTaskbar';
