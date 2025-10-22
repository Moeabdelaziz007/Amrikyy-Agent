/**
 * SystemTray Component - OS-level system tray
 * Features:
 * - Real-time clock with date
 * - Notification bell with badge counter
 * - Volume control with slider
 * - User menu (profile, settings, logout)
 * - Smooth dropdown animations
 * - Glassmorphism design
 *
 * @component
 * @example
 * ```tsx
 * <SystemTray
 *   user={{ name: 'John Doe', avatar: '/avatar.jpg' }}
 *   onLogout={() => console.log('Logout')}
 * />
 * ```
 *
 * @author CURSERO AI
 * @created 2025-10-22
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Volume2,
  VolumeX,
  Volume1,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Circle,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// ============================================
// TYPES
// ============================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
}

export interface User {
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface SystemTrayProps {
  user?: User;
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  onClearNotifications?: () => void;
  onVolumeChange?: (volume: number) => void;
  onLogout?: () => void;
  onSettings?: () => void;
  onProfile?: () => void;
  className?: string;
}

// ============================================
// COMPONENT
// ============================================

export function SystemTray({
  user,
  notifications = [],
  onNotificationClick,
  onMarkAllRead,
  onClearNotifications,
  onVolumeChange,
  onLogout,
  onSettings,
  onProfile,
  className
}: SystemTrayProps) {

  // ==================== State ====================

  const [currentTime, setCurrentTime] = useState(new Date());
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ==================== Computed Values ====================

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasNotifications = notifications.length > 0;

  // ==================== Effects ====================

  /**
   * Update clock every second
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /**
   * Close dropdowns when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
        setShowVolumeControl(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== Handlers ====================

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    onVolumeChange?.(newVolume);
  }, [onVolumeChange]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(75);
      onVolumeChange?.(75);
    } else {
      setIsMuted(true);
      setVolume(0);
      onVolumeChange?.(0);
    }
  }, [isMuted, onVolumeChange]);

  const handleNotificationClick = useCallback((notification: Notification) => {
    onNotificationClick?.(notification);
    setShowNotifications(false);
  }, [onNotificationClick]);

  // ==================== Get Volume Icon ====================

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-4 h-4" />;
    if (volume < 50) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };

  // ==================== Get Notification Type Color ====================

  const getNotificationColor = (type?: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  // ==================== Render ====================

  return (
    <div className={cn('flex items-center gap-2 px-4 py-2', className)}>

      {/* Clock */}
      <div className="flex flex-col items-end text-white/90 mr-2">
        <div className="text-sm font-semibold tabular-nums">
          {format(currentTime, 'HH:mm:ss')}
        </div>
        <div className="text-xs text-white/60">
          {format(currentTime, 'EEE, MMM d')}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-white/10" />

      {/* Notifications */}
      <div ref={notificationsRef} className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={cn(
            'p-2 rounded-lg transition-colors relative',
            showNotifications
              ? 'bg-blue-500/20 text-blue-400'
              : 'hover:bg-white/10 text-white/70 hover:text-white'
          )}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="
              absolute -top-1 -right-1
              min-w-[18px] h-[18px] px-1
              flex items-center justify-center
              bg-red-500 text-white text-[10px] font-bold
              rounded-full
            ">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="
                absolute right-0 top-full mt-2
                w-80 max-h-96
                bg-slate-900/95 backdrop-blur-xl
                border border-white/10 rounded-xl
                shadow-2xl overflow-hidden
                z-50
              "
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/10 bg-slate-950/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    Notifications
                  </h3>
                  {hasNotifications && (
                    <div className="flex gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={onMarkAllRead}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={onClearNotifications}
                        className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'w-full px-4 py-3 text-left',
                        'border-b border-white/5 last:border-b-0',
                        'hover:bg-white/5 transition-colors',
                        !notification.read && 'bg-blue-500/5'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'flex-shrink-0 p-2 rounded-lg',
                          getNotificationColor(notification.type),
                          'bg-current/10'
                        )}>
                          {notification.icon || <Bell className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-white truncate">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <Circle className="w-2 h-2 text-blue-400 fill-current flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(notification.time, 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Volume Control */}
      <div ref={volumeRef} className="relative">
        <button
          onClick={() => setShowVolumeControl(!showVolumeControl)}
          onDoubleClick={toggleMute}
          className={cn(
            'p-2 rounded-lg transition-colors',
            showVolumeControl
              ? 'bg-blue-500/20 text-blue-400'
              : 'hover:bg-white/10 text-white/70 hover:text-white'
          )}
          aria-label="Volume"
        >
          {getVolumeIcon()}
        </button>

        {/* Volume Dropdown */}
        <AnimatePresence>
          {showVolumeControl && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="
                absolute right-0 top-full mt-2
                w-64 p-4
                bg-slate-900/95 backdrop-blur-xl
                border border-white/10 rounded-xl
                shadow-2xl
                z-50
              "
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  {getVolumeIcon()}
                </button>

                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="
                      w-full h-1.5 rounded-full
                      appearance-none cursor-pointer
                      bg-white/10
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-3.5
                      [&::-webkit-slider-thumb]:h-3.5
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-blue-500
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:hover:bg-blue-400
                      [&::-webkit-slider-thumb]:transition-colors
                    "
                  />
                </div>

                <span className="text-sm text-white/70 font-medium tabular-nums min-w-[3ch]">
                  {volume}%
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Menu */}
      {user && (
        <>
          <div className="w-px h-8 bg-white/10" />

          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors',
                showUserMenu
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'hover:bg-white/10 text-white/90'
              )}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium max-w-[100px] truncate">
                {user.name}
              </span>
              <ChevronDown className={cn(
                'w-3 h-3 transition-transform',
                showUserMenu && 'rotate-180'
              )} />
            </button>

            {/* User Menu Dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="
                    absolute right-0 top-full mt-2
                    w-56
                    bg-slate-900/95 backdrop-blur-xl
                    border border-white/10 rounded-xl
                    shadow-2xl overflow-hidden
                    z-50
                  "
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-white/10 bg-slate-950/50">
                    <div className="text-sm font-medium text-white">
                      {user.name}
                    </div>
                    {user.email && (
                      <div className="text-xs text-gray-400 truncate">
                        {user.email}
                      </div>
                    )}
                    {user.role && (
                      <div className="text-xs text-blue-400 mt-1">
                        {user.role}
                      </div>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onProfile?.();
                        setShowUserMenu(false);
                      }}
                      className="
                        w-full px-4 py-2
                        flex items-center gap-3
                        text-left text-sm text-white/90
                        hover:bg-white/5
                        transition-colors
                      "
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>

                    <button
                      onClick={() => {
                        onSettings?.();
                        setShowUserMenu(false);
                      }}
                      className="
                        w-full px-4 py-2
                        flex items-center gap-3
                        text-left text-sm text-white/90
                        hover:bg-white/5
                        transition-colors
                      "
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>

                    <div className="my-1 h-px bg-white/10" />

                    <button
                      onClick={() => {
                        onLogout?.();
                        setShowUserMenu(false);
                      }}
                      className="
                        w-full px-4 py-2
                        flex items-center gap-3
                        text-left text-sm text-red-400
                        hover:bg-red-500/10
                        transition-colors
                      "
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

export default SystemTray;
