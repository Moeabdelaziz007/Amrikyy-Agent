import React, { memo } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TouchButton } from '../mobile/TouchButton';
import { usePrefersReducedMotion } from '@/hooks/useAccessibility';
import type { AppConfig, AppId, AppInstance } from '@/types/os.types';

/**
 * Tablet taskbar props
 */
export interface TabletTaskbarProps {
  /** Pinned applications */
  pinnedApps: AppConfig[];
  /** Running app instances */
  runningApps: AppInstance[];
  /** Active app IDs (for split view) */
  activeAppIds: AppId[];
  /** App launch handler */
  onAppLaunch: (appId: AppId) => void;
  /** App close handler */
  onAppClose: (instanceId: string) => void;
  /** App focus handler */
  onAppFocus: (instanceId: string) => void;
  /** Drawer open handler */
  onDrawerOpen: () => void;
  /** Maximum running apps to show */
  maxRunningApps?: number;
  /** Custom className */
  className?: string;
}

/**
 * Running app button
 */
const RunningAppButton = memo<{
  instance: AppInstance;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
}>(({ instance, isActive, onFocus, onClose }) => {
  const Icon = instance.config.icon.icon;
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="relative group">
      <button
        onClick={onFocus}
        className={cn(
          'relative w-12 h-12 rounded-xl',
          'flex items-center justify-center',
          'transition-all duration-150',
          'active:scale-95 touch-manipulation',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
          !prefersReducedMotion && 'hover:scale-110',
          instance.config.icon.gradient || instance.config.icon.color || 'bg-gray-700',
          isActive && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900'
        )}
        aria-label={`Switch to ${instance.config.metadata.name}`}
        aria-pressed={isActive}
      >
        <Icon className="w-6 h-6 text-white" />

        {/* Active indicator */}
        {isActive && (
          <div
            className={cn(
              'absolute -bottom-1 left-1/2 -translate-x-1/2',
              'w-1 h-1 rounded-full bg-blue-400',
              !prefersReducedMotion && 'animate-pulse'
            )}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Close button (on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className={cn(
          'absolute -top-1 -right-1',
          'w-5 h-5 rounded-full',
          'bg-red-500 hover:bg-red-600',
          'flex items-center justify-center',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-150',
          'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500'
        )}
        aria-label={`Close ${instance.config.metadata.name}`}
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  );
});

RunningAppButton.displayName = 'RunningAppButton';

/**
 * Pinned app button
 */
const PinnedAppButton = memo<{
  app: AppConfig;
  isRunning: boolean;
  onClick: () => void;
}>(({ app, isRunning, onClick }) => {
  const Icon = app.icon.icon;
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-12 h-12 rounded-xl',
        'flex items-center justify-center',
        'transition-all duration-150',
        'active:scale-95 touch-manipulation',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
        !prefersReducedMotion && 'hover:scale-110',
        app.icon.gradient || app.icon.color || 'bg-gray-700'
      )}
      aria-label={`Launch ${app.metadata.name}`}
    >
      <Icon className="w-6 h-6 text-white" />

      {/* Running indicator */}
      {isRunning && (
        <div
          className={cn(
            'absolute -bottom-1 left-1/2 -translate-x-1/2',
            'w-1 h-1 rounded-full bg-gray-400'
          )}
          aria-hidden="true"
        />
      )}
    </button>
  );
});

PinnedAppButton.displayName = 'PinnedAppButton';

/**
 * Tablet taskbar component with running apps and pinned apps
 *
 * Features:
 * - Shows running apps with close buttons
 * - Shows pinned apps
 * - Active app highlighting
 * - Touch-optimized buttons (48px)
 * - Smooth animations
 * - Overflow handling
 * - App drawer button
 *
 * @example
 * ```tsx
 * <TabletTaskbar
 *   pinnedApps={pinnedApps}
 *   runningApps={runningInstances}
 *   activeAppIds={['maya', 'files']}
 *   onAppLaunch={(id) => launchApp(id)}
 *   onAppClose={(id) => closeApp(id)}
 *   onAppFocus={(id) => focusApp(id)}
 *   onDrawerOpen={() => setDrawerOpen(true)}
 * />
 * ```
 */
export const TabletTaskbar = memo<TabletTaskbarProps>(({
  pinnedApps,
  runningApps,
  activeAppIds,
  onAppLaunch,
  onAppClose,
  onAppFocus,
  onDrawerOpen,
  maxRunningApps = 6,
  className,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Get running app IDs
  const runningAppIds = runningApps.map((app) => app.appId);

  // Filter pinned apps that aren't running
  const pinnedNotRunning = pinnedApps.filter(
    (app) => !runningAppIds.includes(app.metadata.id)
  );

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-gray-900/95 backdrop-blur-xl',
        'border-t border-gray-800',
        'px-6 py-3',
        !prefersReducedMotion && 'transition-transform duration-300',
        className
      )}
      role="navigation"
      aria-label="Tablet taskbar"
    >
      <div className="flex items-center gap-3 max-w-5xl mx-auto">
        {/* App Drawer Button */}
        <button
          onClick={onDrawerOpen}
          className={cn(
            'w-12 h-12 rounded-xl',
            'bg-gradient-to-br from-blue-500 to-purple-500',
            'flex items-center justify-center',
            'transition-all duration-150',
            'active:scale-95 touch-manipulation',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
            !prefersReducedMotion && 'hover:scale-110'
          )}
          aria-label="Open app drawer"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-700" />

        {/* Running Apps */}
        {runningApps.slice(0, maxRunningApps).map((instance) => (
          <RunningAppButton
            key={instance.instanceId}
            instance={instance}
            isActive={activeAppIds.includes(instance.appId)}
            onFocus={() => onAppFocus(instance.instanceId)}
            onClose={() => onAppClose(instance.instanceId)}
          />
        ))}

        {/* Overflow indicator */}
        {runningApps.length > maxRunningApps && (
          <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 text-sm font-medium">
            +{runningApps.length - maxRunningApps}
          </div>
        )}

        {/* Divider (if there are pinned apps) */}
        {pinnedNotRunning.length > 0 && (
          <div className="w-px h-8 bg-gray-700" />
        )}

        {/* Pinned Apps (not running) */}
        {pinnedNotRunning.slice(0, 4).map((app) => (
          <PinnedAppButton
            key={app.metadata.id}
            app={app}
            isRunning={false}
            onClick={() => onAppLaunch(app.metadata.id)}
          />
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* System Info */}
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
});

TabletTaskbar.displayName = 'TabletTaskbar';
