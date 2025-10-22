/**
 * DesktopOS - Complete AI Operating System Desktop
 *
 * Combines all OS features:
 * - QuickSearch (Cmd+K)
 * - SystemTray (Clock, Notifications, Volume, User Menu)
 * - Keyboard Shortcuts
 * - Window Management
 * - Taskbar
 *
 * @component
 * @example
 * ```tsx
 * <DesktopOS>
 *   <YourApps />
 * </DesktopOS>
 * ```
 *
 * @author CURSERO AI
 * @created 2025-10-22
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { QuickSearch, type SearchItem } from './QuickSearch';
import { SystemTray, type Notification, type User } from './SystemTray';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { WindowManagerProvider } from '@/contexts/WindowManagerContext';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export interface DesktopOSProps {
  children?: React.ReactNode;
  user?: User;
  searchItems?: SearchItem[];
  notifications?: Notification[];
  onLogout?: () => void;
  onSettings?: () => void;
  onProfile?: () => void;
  className?: string;
  showWallpaper?: boolean;
  wallpaperUrl?: string;
}

// ============================================
// DEMO DATA
// ============================================

const DEMO_USER: User = {
  name: 'Amrikyy User',
  email: 'user@amrikyy.ai',
  role: 'Explorer',
  avatar: undefined
};

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Welcome to Amrikyy AI OS',
    message: 'Your AI-powered desktop experience is ready!',
    time: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    type: 'success'
  },
  {
    id: '2',
    title: 'Maya Travel Assistant',
    message: 'Your trip to Istanbul has been optimized',
    time: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    type: 'info'
  },
  {
    id: '3',
    title: 'System Update',
    message: 'New features available. Update recommended.',
    time: new Date(Date.now() - 60 * 60 * 1000),
    read: true,
    type: 'warning'
  }
];

// ============================================
// COMPONENT
// ============================================

export function DesktopOS({
  children,
  user = DEMO_USER,
  searchItems,
  notifications = DEMO_NOTIFICATIONS,
  onLogout,
  onSettings,
  onProfile,
  className,
  showWallpaper = true,
  wallpaperUrl
}: DesktopOSProps) {

  // ==================== State ====================

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notificationList, setNotificationList] = useState(notifications);
  const [volume, setVolume] = useState(75);

  // ==================== Handlers ====================

  const handleNewWindow = useCallback(() => {
    console.log('[DesktopOS] New Window (Cmd+N)');
    // Implement window creation logic
  }, []);

  const handleCloseWindow = useCallback(() => {
    console.log('[DesktopOS] Close Window (Cmd+W)');
    // Implement window close logic
  }, []);

  const handleMinimizeWindow = useCallback(() => {
    console.log('[DesktopOS] Minimize Window (Cmd+M)');
    // Implement window minimize logic
  }, []);

  const handleQuickSearch = useCallback(() => {
    console.log('[DesktopOS] Quick Search (Cmd+K)');
    setIsSearchOpen(true);
  }, []);

  const handleSwitchWindow = useCallback(() => {
    console.log('[DesktopOS] Switch Window (Alt+Tab)');
    // Implement window switching logic
  }, []);

  const handleNotificationClick = useCallback((notification: Notification) => {
    console.log('[DesktopOS] Notification clicked:', notification);

    // Mark as read
    setNotificationList(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotificationList(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const handleClearNotifications = useCallback(() => {
    setNotificationList([]);
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    console.log('[DesktopOS] Volume changed:', newVolume);
  }, []);

  const handleLogout = useCallback(() => {
    console.log('[DesktopOS] Logout');
    onLogout?.();
  }, [onLogout]);

  const handleSettings = useCallback(() => {
    console.log('[DesktopOS] Settings');
    onSettings?.();
  }, [onSettings]);

  const handleProfile = useCallback(() => {
    console.log('[DesktopOS] Profile');
    onProfile?.();
  }, [onProfile]);

  // ==================== Keyboard Shortcuts ====================

  useKeyboardShortcuts({
    onNewWindow: handleNewWindow,
    onCloseWindow: handleCloseWindow,
    onMinimizeWindow: handleMinimizeWindow,
    onQuickSearch: handleQuickSearch,
    onSwitchWindowNext: handleSwitchWindow,
    onSettings: handleSettings,
    enabled: true,
    debug: true
  });

  // ==================== Wallpaper Style ====================

  const wallpaperStyle = showWallpaper ? {
    backgroundImage: wallpaperUrl
      ? `url(${wallpaperUrl})`
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  // ==================== Render ====================

  return (
    <WindowManagerProvider>
      <div
        className={cn(
          'relative w-full h-screen overflow-hidden',
          'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
          className
        )}
        style={wallpaperStyle}
      >
        {/* Desktop Content */}
        <div className="relative h-full flex flex-col">
          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden relative">
            {children}
          </div>

          {/* Taskbar */}
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="
              relative z-50
              h-14
              bg-slate-900/80 backdrop-blur-xl
              border-t border-white/10
              shadow-2xl
            "
          >
            <div className="h-full flex items-center justify-between px-4">
              {/* Left: App Icons / Start Menu */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleQuickSearch}
                  className="
                    px-4 py-2 rounded-lg
                    bg-gradient-to-r from-blue-500 to-purple-500
                    text-white text-sm font-semibold
                    hover:from-blue-600 hover:to-purple-600
                    transition-all
                    shadow-lg
                  "
                >
                  Search
                </button>
              </div>

              {/* Center: Active Windows (placeholder) */}
              <div className="flex-1 flex items-center justify-center gap-2">
                {/* Window indicators can go here */}
              </div>

              {/* Right: System Tray */}
              <SystemTray
                user={user}
                notifications={notificationList}
                onNotificationClick={handleNotificationClick}
                onMarkAllRead={handleMarkAllRead}
                onClearNotifications={handleClearNotifications}
                onVolumeChange={handleVolumeChange}
                onLogout={handleLogout}
                onSettings={handleSettings}
                onProfile={handleProfile}
              />
            </div>
          </motion.div>
        </div>

        {/* Quick Search Modal */}
        <QuickSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          items={searchItems}
        />

        {/* Keyboard Shortcut Hint (optional, can be toggled) */}
        <div className="fixed bottom-20 left-4 z-40">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="
              px-3 py-2 rounded-lg
              bg-slate-900/80 backdrop-blur-xl
              border border-white/10
              text-xs text-white/70
              shadow-lg
            "
          >
            Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20 text-white/90 font-mono">⌘K</kbd> to search
          </motion.div>
        </div>
      </div>
    </WindowManagerProvider>
  );
}

export default DesktopOS;
