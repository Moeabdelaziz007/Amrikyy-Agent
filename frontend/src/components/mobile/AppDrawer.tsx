import React, { memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFocusTrap, useKeyboardNavigation, usePrefersReducedMotion } from '@/hooks/useAccessibility';
import type { AppConfig, AppId, AppCategory } from '@/types/os.types';

/**
 * App drawer props
 */
export interface AppDrawerProps {
  /** All available apps */
  apps: AppConfig[];
  /** Whether drawer is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** App launch handler */
  onAppLaunch: (appId: AppId) => void;
  /** Search query */
  searchQuery?: string;
  /** Search change handler */
  onSearchChange?: (query: string) => void;
  /** Group apps by category */
  groupByCategory?: boolean;
}

/**
 * App grid item
 */
const AppGridItem = memo<{
  app: AppConfig;
  onClick: () => void;
}>(({ app, onClick }) => {
  const Icon = app.icon.icon;
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-2 rounded-2xl',
        'transition-all duration-150',
        'active:scale-95 touch-manipulation',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
        !prefersReducedMotion && 'hover:scale-105'
      )}
      aria-label={`Launch ${app.metadata.name}`}
    >
      <div
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg',
          app.icon.gradient || app.icon.color || 'bg-gray-700'
        )}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <span className="text-xs text-gray-300 text-center font-medium max-w-[70px] truncate">
        {app.metadata.name}
      </span>
    </button>
  );
});

AppGridItem.displayName = 'AppGridItem';

/**
 * Category section
 */
const CategorySection = memo<{
  category: AppCategory;
  apps: AppConfig[];
  onAppLaunch: (appId: AppId) => void;
  onClose: () => void;
}>(({ category, apps, onAppLaunch, onClose }) => {
  const categoryLabels: Record<AppCategory, string> = {
    productivity: 'Productivity',
    utilities: 'Utilities',
    development: 'Development',
    communication: 'Communication',
    entertainment: 'Entertainment',
    system: 'System',
    ai: 'AI & Intelligence',
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-2">
        {categoryLabels[category]}
      </h3>
      <div className="grid grid-cols-4 gap-4">
        {apps.map((app) => (
          <AppGridItem
            key={app.metadata.id}
            app={app}
            onClick={() => {
              onAppLaunch(app.metadata.id);
              onClose();
            }}
          />
        ))}
      </div>
    </div>
  );
});

CategorySection.displayName = 'CategorySection';

/**
 * Mobile app drawer component with search and categories
 *
 * Features:
 * - Full-screen overlay
 * - App grid layout (4 columns)
 * - Search functionality
 * - Category grouping
 * - Smooth animations
 * - Focus trap
 * - Keyboard navigation
 * - Portal rendering
 *
 * @example
 * ```tsx
 * <AppDrawer
 *   apps={allApps}
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onAppLaunch={(id) => launchApp(id)}
 *   groupByCategory
 * />
 * ```
 */
export const AppDrawer = memo<AppDrawerProps>(({
  apps,
  isOpen,
  onClose,
  onAppLaunch,
  searchQuery = '',
  onSearchChange,
  groupByCategory = true,
}) => {
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Focus trap
  useFocusTrap(drawerRef, isOpen);

  // Keyboard navigation
  useKeyboardNavigation({
    onEscape: onClose,
  });

  /**
   * Filter apps by search query
   */
  const filteredApps = useMemo(() => {
    if (!searchQuery) return apps;

    const query = searchQuery.toLowerCase();
    return apps.filter(
      (app) =>
        app.metadata.name.toLowerCase().includes(query) ||
        app.metadata.description?.toLowerCase().includes(query) ||
        app.metadata.keywords?.some((keyword) => keyword.toLowerCase().includes(query))
    );
  }, [apps, searchQuery]);

  /**
   * Group apps by category
   */
  const groupedApps = useMemo(() => {
    if (!groupByCategory) return null;

    const groups = new Map<AppCategory, AppConfig[]>();

    filteredApps.forEach((app) => {
      const category = app.metadata.category || 'utilities';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(app);
    });

    return groups;
  }, [filteredApps, groupByCategory]);

  /**
   * Prevent body scroll when open
   */
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50',
        !prefersReducedMotion && 'animate-in fade-in duration-200'
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="App drawer"
        className={cn(
          'absolute inset-x-0 bottom-0 bg-gray-900 rounded-t-3xl p-6',
          'max-h-[80vh] overflow-y-auto',
          !prefersReducedMotion && 'animate-in slide-in-from-bottom duration-300'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Apps</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search */}
        {onSearchChange && (
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search apps..."
              className={cn(
                'w-full bg-gray-800 text-white rounded-2xl pl-12 pr-4 py-3',
                'text-base outline-none',
                'focus:ring-2 focus:ring-blue-500',
                'transition-all duration-150'
              )}
              aria-label="Search apps"
            />
          </div>
        )}

        {/* Apps Grid */}
        {groupByCategory && groupedApps ? (
          <div className="space-y-6">
            {Array.from(groupedApps.entries()).map(([category, categoryApps]) => (
              <CategorySection
                key={category}
                category={category}
                apps={categoryApps}
                onAppLaunch={onAppLaunch}
                onClose={onClose}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filteredApps.map((app) => (
              <AppGridItem
                key={app.metadata.id}
                app={app}
                onClick={() => {
                  onAppLaunch(app.metadata.id);
                  onClose();
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredApps.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">No apps found</div>
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.('')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
});

AppDrawer.displayName = 'AppDrawer';
