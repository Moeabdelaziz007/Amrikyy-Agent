import React, { memo } from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TouchButton } from './TouchButton';
import { usePrefersReducedMotion } from '@/hooks/useAccessibility';
import type { AppConfig, AppId } from '@/types/os.types';

/**
 * Mobile dock props
 */
export interface MobileDockProps {
  /** Pinned applications */
  apps: AppConfig[];
  /** Running app IDs */
  runningApps?: AppId[];
  /** Active app ID */
  activeAppId?: AppId | null;
  /** App launch handler */
  onAppLaunch: (appId: AppId) => void;
  /** Drawer open handler */
  onDrawerOpen: () => void;
  /** Maximum pinned apps to show */
  maxPinnedApps?: number;
  /** Custom className */
  className?: string;
}

/**
 * App icon component
 */
const AppIcon = memo<{
  app: AppConfig;
  isRunning: boolean;
  isActive: boolean;
  onClick: () => void;
}>(({ app, isRunning, isActive, onClick }) => {
  const Icon = app.icon.icon;
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 p-2 rounded-2xl',
        'transition-all duration-150',
        'active:scale-95 touch-manipulation',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
        !prefersReducedMotion && 'hover:scale-105'
      )}
      style={{ minWidth: '44px', minHeight: '44px' }}
      aria-label={`Launch ${app.metadata.name}`}
      aria-pressed={isActive}
    >
      {/* Icon Container */}
      <div
        className={cn(
          'relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg',
          'transition-all duration-200',
          app.icon.gradient || app.icon.color || 'bg-gray-700',
          isActive && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900'
        )}
      >
        <Icon className="w-6 h-6 text-white" />

        {/* Running indicator */}
        {isRunning && (
          <div
            className={cn(
              'absolute -bottom-1 left-1/2 -translate-x-1/2',
              'w-1 h-1 rounded-full bg-blue-400',
              !prefersReducedMotion && 'animate-pulse'
            )}
            aria-hidden="true"
          />
        )}
      </div>

      {/* App Name */}
      <span className="text-xs text-gray-300 font-medium truncate max-w-[60px]">
        {app.metadata.name}
      </span>
    </button>
  );
});

AppIcon.displayName = 'AppIcon';

/**
 * Mobile dock component with pinned apps and drawer button
 *
 * Features:
 * - Fixed bottom position with safe area support
 * - Touch-optimized buttons (44px minimum)
 * - Running app indicators
 * - Active app highlighting
 * - Smooth animations
 * - Accessibility support
 * - Backdrop blur effect
 *
 * @example
 * ```tsx
 * <MobileDock
 *   apps={pinnedApps}
 *   runningApps={['maya', 'files']}
 *   activeAppId="maya"
 *   onAppLaunch={(id) => console.log('Launch', id)}
 *   onDrawerOpen={() => setDrawerOpen(true)}
 * />
 * ```
 */
export const MobileDock = memo<MobileDockProps>(({
  apps,
  runningApps = [],
  activeAppId = null,
  onAppLaunch,
  onDrawerOpen,
  maxPinnedApps = 4,
  className,
}) => {
  const pinnedApps = apps.slice(0, maxPinnedApps);
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-gray-900/95 backdrop-blur-xl',
        'border-t border-gray-800',
        'px-4 py-3',
        'safe-area-bottom',
        !prefersReducedMotion && 'transition-transform duration-300',
        className
      )}
      role="navigation"
      aria-label="Mobile dock"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Pinned Apps */}
        {pinnedApps.map((app) => (
          <AppIcon
            key={app.metadata.id}
            app={app}
            isRunning={runningApps.includes(app.metadata.id)}
            isActive={activeAppId === app.metadata.id}
            onClick={() => onAppLaunch(app.metadata.id)}
          />
        ))}

        {/* More Button (Drawer) */}
        <button
          onClick={onDrawerOpen}
          className={cn(
            'flex flex-col items-center gap-1 p-2 rounded-2xl',
            'transition-all duration-150',
            'active:scale-95 touch-manipulation',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
            !prefersReducedMotion && 'hover:scale-105'
          )}
          style={{ minWidth: '44px', minHeight: '44px' }}
          aria-label="Open app drawer"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg border border-gray-600">
            <Menu className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-gray-300 font-medium">More</span>
        </button>
      </div>
    </div>
  );
});

MobileDock.displayName = 'MobileDock';
