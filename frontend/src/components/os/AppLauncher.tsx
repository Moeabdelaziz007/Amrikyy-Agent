/**
 * AppLauncher - Enhanced Start Menu with micro-interactions
 *
 * Features:
 * - Animated app grid with spring physics
 * - Search with real-time filtering
 * - Categories and sections
 * - Launch animations and transitions
 * - Keyboard navigation
 * - Recent apps section
 *
 * @component
 * @example
 * ```tsx
 * <AppLauncher
 *   apps={availableApps}
 *   onAppLaunch={handleAppLaunch}
 *   isOpen={showLauncher}
 *   onClose={() => setShowLauncher(false)}
 * />
 * ```
 *
 * @author CURSERO AI
 * @created 2025-01-25
 */

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Grid,
  List,
  Star,
  Clock,
  Folder,
  Settings,
  User,
  Power,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { RippleEffect } from '@/components/ui/RippleEffect';
import { useMicroInteractions } from '@/hooks/useMicroInteractions';

// ============================================
// TYPES
// ============================================

export interface AppItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  description?: string;
  isFavorite?: boolean;
  isRecent?: boolean;
  launchCount?: number;
  lastLaunched?: Date;
  color?: string;
}

export interface AppCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

export interface AppLauncherProps {
  /** Array of available apps */
  apps: AppItem[];

  /** App categories */
  categories?: AppCategory[];

  /** Whether launcher is open */
  isOpen: boolean;

  /** Search placeholder */
  searchPlaceholder?: string;

  /** Enable animations */
  animated?: boolean;

  /** View mode */
  viewMode?: 'grid' | 'list';

  /** Custom className */
  className?: string;

  /** Event handlers */
  onAppLaunch?: (app: AppItem) => void;
  onClose?: () => void;
  onSearch?: (query: string) => void;
  onCategorySelect?: (category: AppCategory) => void;
  onSettings?: () => void;
  onProfile?: () => void;
  onLogout?: () => void;
}

// ============================================
// DEFAULT CATEGORIES
// ============================================

const DEFAULT_CATEGORIES: AppCategory[] = [
  {
    id: 'recent',
    name: 'Recent',
    icon: <Clock className="w-4 h-4" />,
    color: 'text-blue-400',
  },
  {
    id: 'favorites',
    name: 'Favorites',
    icon: <Star className="w-4 h-4" />,
    color: 'text-yellow-400',
  },
  {
    id: 'productivity',
    name: 'Productivity',
    icon: <Folder className="w-4 h-4" />,
    color: 'text-green-400',
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: <User className="w-4 h-4" />,
    color: 'text-purple-400',
  },
];

// ============================================
// APP ITEM COMPONENT
// ============================================

interface AppItemComponentProps {
  app: AppItem;
  viewMode: 'grid' | 'list';
  onLaunch: (app: AppItem) => void;
  animated: boolean;
  index: number;
}

const AppItemComponent: React.FC<AppItemComponentProps> = ({
  app,
  viewMode,
  onLaunch,
  animated,
  index,
}) => {
  const { interactionVariants } = useMicroInteractions({
    scaleFactor: 1.05,
    stiffness: 400,
    damping: 17,
  });

  const handleClick = useCallback(() => {
    onLaunch(app);
  }, [app, onLaunch]);

  if (viewMode === 'list') {
    return (
      <RippleEffect color="rgba(255, 255, 255, 0.1)">
        <motion.button
          className="
            w-full flex items-center gap-3 p-3 rounded-lg
            hover:bg-white/5 transition-colors
            text-left group
          "
          onClick={handleClick}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: animated ? index * 0.05 : 0,
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          whileHover={interactionVariants.hover}
          whileTap={interactionVariants.tap}
        >
          <div className="flex-shrink-0">
            <AnimatedIcon
              icon={app.icon}
              animation="scale"
              size="w-8 h-8"
              hover={false}
              tap={false}
              ripple={false}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium truncate">
                {app.name}
              </span>
              {app.isFavorite && (
                <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
              )}
            </div>
            {app.description && (
              <p className="text-sm text-gray-400 truncate">
                {app.description}
              </p>
            )}
          </div>

          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
        </motion.button>
      </RippleEffect>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: animated ? index * 0.05 : 0,
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      <RippleEffect color="rgba(255, 255, 255, 0.1)">
        <motion.button
          className="
            flex flex-col items-center gap-2 p-4 rounded-xl
            hover:bg-white/5 transition-colors
            group min-h-[100px]
          "
          onClick={handleClick}
          whileHover={interactionVariants.hover}
          whileTap={interactionVariants.tap}
        >
          <div className="relative">
            <AnimatedIcon
              icon={app.icon}
              animation="bounce"
              size="w-12 h-12"
              hover={false}
              tap={false}
              ripple={false}
            />
            {app.isFavorite && (
              <motion.div
                className="absolute -top-1 -right-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              </motion.div>
            )}
          </div>

          <span className="text-sm text-white font-medium text-center leading-tight max-w-full truncate">
            {app.name}
          </span>
        </motion.button>
      </RippleEffect>
    </motion.div>
  );
};

// ============================================
// CATEGORY ITEM COMPONENT
// ============================================

interface CategoryItemProps {
  category: AppCategory;
  isActive: boolean;
  onClick: () => void;
  animated: boolean;
  index: number;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  isActive,
  onClick,
  animated,
  index,
}) => {
  const { interactionVariants } = useMicroInteractions();

  return (
    <motion.button
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left',
        isActive
          ? 'bg-blue-500/20 text-blue-400'
          : 'hover:bg-white/5 text-white/70 hover:text-white'
      )}
      onClick={onClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: animated ? index * 0.1 : 0,
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      whileHover={interactionVariants.hover}
      whileTap={interactionVariants.tap}
    >
      <div className={cn('flex-shrink-0', category.color)}>{category.icon}</div>
      <span className="font-medium truncate">{category.name}</span>
    </motion.button>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const AppLauncher: React.FC<AppLauncherProps> = ({
  apps,
  categories = DEFAULT_CATEGORIES,
  isOpen,
  searchPlaceholder = 'Search apps...',
  animated = true,
  viewMode = 'grid',
  className,
  onAppLaunch,
  onClose,
  onSearch,
  onCategorySelect,
  onSettings,
  onProfile,
  onLogout,
}) => {
  // ==================== State ====================

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentViewMode, setCurrentViewMode] = useState<'grid' | 'list'>(
    viewMode
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ==================== Effects ====================

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // ==================== Computed Values ====================

  const filteredApps = useMemo(() => {
    let filtered = apps;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        app =>
          app.name.toLowerCase().includes(query) ||
          app.description?.toLowerCase().includes(query) ||
          app.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'recent') {
        filtered = filtered.filter(app => app.isRecent);
      } else if (selectedCategory === 'favorites') {
        filtered = filtered.filter(app => app.isFavorite);
      } else {
        filtered = filtered.filter(app => app.category === selectedCategory);
      }
    }

    // Sort by relevance
    return filtered.sort((a, b) => {
      // Favorites first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      // Recent first
      if (a.isRecent && !b.isRecent) return -1;
      if (!a.isRecent && b.isRecent) return 1;

      // Launch count
      return (b.launchCount || 0) - (a.launchCount || 0);
    });
  }, [apps, searchQuery, selectedCategory]);

  // ==================== Handlers ====================

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      onSearch?.(query);
    },
    [onSearch]
  );

  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      setSelectedCategory(categoryId);
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        onCategorySelect?.(category);
      }
    },
    [categories, onCategorySelect]
  );

  const handleAppLaunch = useCallback(
    (app: AppItem) => {
      onAppLaunch?.(app);
      onClose?.();
    },
    [onAppLaunch, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    },
    [onClose]
  );

  // ==================== Animation Variants ====================

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const launcherVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  // ==================== Render ====================

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Launcher */}
          <motion.div
            className={cn(
              'fixed inset-4 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-50',
              'flex flex-col overflow-hidden',
              className
            )}
            variants={launcherVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-white/10">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="
                    w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg
                    text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                    transition-colors
                  "
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setCurrentViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    currentViewMode === 'grid'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    currentViewMode === 'list'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Close Button */}
              <RippleEffect>
                <button
                  onClick={onClose}
                  className="
                    p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white
                  "
                >
                  <X className="w-5 h-5" />
                </button>
              </RippleEffect>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-64 border-r border-white/10 p-4">
                <div className="space-y-2">
                  <CategoryItem
                    category={{
                      id: 'all',
                      name: 'All Apps',
                      icon: <Grid className="w-4 h-4" />,
                      color: 'text-gray-400',
                    }}
                    isActive={selectedCategory === 'all'}
                    onClick={() => handleCategorySelect('all')}
                    animated={animated}
                    index={0}
                  />

                  {categories.map((category, index) => (
                    <CategoryItem
                      key={category.id}
                      category={category}
                      isActive={selectedCategory === category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      animated={animated}
                      index={index + 1}
                    />
                  ))}
                </div>

                {/* User Actions */}
                <div className="mt-8 pt-4 border-t border-white/10 space-y-2">
                  <button
                    onClick={onSettings}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors w-full text-left text-white/70 hover:text-white"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>

                  <button
                    onClick={onProfile}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors w-full text-left text-white/70 hover:text-white"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>

                  <button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors w-full text-left text-red-400 hover:text-red-300"
                  >
                    <Power className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>

              {/* Apps Grid/List */}
              <div className="flex-1 p-6 overflow-y-auto">
                {filteredApps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-gray-400 mb-4">
                      <Search className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      No apps found
                    </h3>
                    <p className="text-gray-400">
                      Try adjusting your search or category filter
                    </p>
                  </div>
                ) : (
                  <div
                    className={cn(
                      currentViewMode === 'grid'
                        ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'
                        : 'space-y-2'
                    )}
                  >
                    {filteredApps.map((app, index) => (
                      <AppItemComponent
                        key={app.id}
                        app={app}
                        viewMode={currentViewMode}
                        onLaunch={handleAppLaunch}
                        animated={animated}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AppLauncher;
