/**
 * Operating System Type Definitions
 *
 * Comprehensive type system for the Amrikyy AI OS
 * Provides type safety and IntelliSense support across the application
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Unique identifier for OS applications
 */
export type AppId = string;

/**
 * Window state
 */
export type WindowState = 'minimized' | 'maximized' | 'normal' | 'fullscreen';

/**
 * Device type based on viewport
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Notification priority
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// ============================================================================
// APPLICATION TYPES
// ============================================================================

/**
 * Application metadata
 */
export interface AppMetadata {
  /** Unique application identifier */
  id: AppId;
  /** Display name */
  name: string;
  /** Short description */
  description?: string;
  /** Application version */
  version?: string;
  /** Author information */
  author?: string;
  /** Application category */
  category?: AppCategory;
  /** Keywords for search */
  keywords?: string[];
}

/**
 * Application category
 */
export type AppCategory =
  | 'productivity'
  | 'utilities'
  | 'development'
  | 'communication'
  | 'entertainment'
  | 'system'
  | 'ai';

/**
 * Application icon configuration
 */
export interface AppIcon {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Icon color (CSS color value) */
  color?: string;
  /** Background gradient */
  gradient?: string;
  /** Icon size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Application configuration
 */
export interface AppConfig {
  /** Application metadata */
  metadata: AppMetadata;
  /** Icon configuration */
  icon: AppIcon;
  /** Whether app can be pinned to dock */
  pinnable?: boolean;
  /** Whether app supports multiple instances */
  multiInstance?: boolean;
  /** Minimum window size */
  minSize?: { width: number; height: number };
  /** Maximum window size */
  maxSize?: { width: number; height: number };
  /** Default window size */
  defaultSize?: { width: number; height: number };
  /** Supported device types */
  supportedDevices?: DeviceType[];
  /** Keyboard shortcuts */
  shortcuts?: KeyboardShortcut[];
}

/**
 * Application instance
 */
export interface AppInstance {
  /** Unique instance ID */
  instanceId: string;
  /** Application ID */
  appId: AppId;
  /** Application configuration */
  config: AppConfig;
  /** Window state */
  windowState: WindowState;
  /** Window position */
  position?: { x: number; y: number };
  /** Window size */
  size?: { width: number; height: number };
  /** Z-index for stacking */
  zIndex: number;
  /** Whether window is focused */
  isFocused: boolean;
  /** Application-specific data */
  data?: Record<string, any>;
  /** Creation timestamp */
  createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
}

// ============================================================================
// WINDOW MANAGEMENT
// ============================================================================

/**
 * Window manager state
 */
export interface WindowManagerState {
  /** All open windows */
  windows: AppInstance[];
  /** Currently focused window ID */
  focusedWindowId: string | null;
  /** Next available z-index */
  nextZIndex: number;
}

/**
 * Window manager actions
 */
export interface WindowManagerActions {
  /** Open a new application window */
  openWindow: (appId: AppId, data?: Record<string, any>) => void;
  /** Close a window */
  closeWindow: (instanceId: string) => void;
  /** Focus a window */
  focusWindow: (instanceId: string) => void;
  /** Minimize a window */
  minimizeWindow: (instanceId: string) => void;
  /** Maximize a window */
  maximizeWindow: (instanceId: string) => void;
  /** Restore a window to normal state */
  restoreWindow: (instanceId: string) => void;
  /** Update window position */
  updateWindowPosition: (instanceId: string, position: { x: number; y: number }) => void;
  /** Update window size */
  updateWindowSize: (instanceId: string, size: { width: number; height: number }) => void;
  /** Close all windows */
  closeAllWindows: () => void;
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  /** Shortcut key combination */
  keys: string[];
  /** Shortcut description */
  description: string;
  /** Handler function */
  handler: () => void;
  /** Whether shortcut is enabled */
  enabled?: boolean;
  /** Device types where shortcut is available */
  devices?: DeviceType[];
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * System notification
 */
export interface Notification {
  /** Unique notification ID */
  id: string;
  /** Notification title */
  title: string;
  /** Notification message */
  message: string;
  /** Priority level */
  priority: NotificationPriority;
  /** Icon to display */
  icon?: LucideIcon;
  /** Action buttons */
  actions?: NotificationAction[];
  /** Auto-dismiss timeout (ms) */
  timeout?: number;
  /** Creation timestamp */
  timestamp: Date;
  /** Whether notification has been read */
  read: boolean;
}

/**
 * Notification action button
 */
export interface NotificationAction {
  /** Action label */
  label: string;
  /** Action handler */
  handler: () => void;
  /** Action style */
  variant?: 'primary' | 'secondary' | 'danger';
}

// ============================================================================
// SYSTEM TRAY
// ============================================================================

/**
 * System tray item
 */
export interface SystemTrayItem {
  /** Unique item ID */
  id: string;
  /** Display label */
  label: string;
  /** Icon component */
  icon: LucideIcon;
  /** Click handler */
  onClick?: () => void;
  /** Whether item is active */
  active?: boolean;
  /** Badge count */
  badge?: number;
  /** Submenu items */
  submenu?: SystemTrayItem[];
}

// ============================================================================
// TOUCH GESTURES
// ============================================================================

/**
 * Gesture direction
 */
export type GestureDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Touch gesture event
 */
export interface GestureEvent {
  /** Gesture direction */
  direction: GestureDirection;
  /** Distance traveled (px) */
  distance: number;
  /** Gesture duration (ms) */
  duration: number;
  /** Gesture velocity (px/ms) */
  velocity: number;
  /** Start coordinates */
  start: { x: number; y: number };
  /** End coordinates */
  end: { x: number; y: number };
}

/**
 * Gesture configuration
 */
export interface GestureConfig {
  /** Minimum distance to trigger (px) */
  threshold?: number;
  /** Maximum duration (ms) */
  maxDuration?: number;
  /** Minimum velocity (px/ms) */
  minVelocity?: number;
  /** Enable gesture detection */
  enabled?: boolean;
  /** Prevent default touch behavior */
  preventDefault?: boolean;
}

// ============================================================================
// ACCESSIBILITY
// ============================================================================

/**
 * Accessibility preferences
 */
export interface AccessibilityPreferences {
  /** Reduce motion */
  reduceMotion: boolean;
  /** High contrast mode */
  highContrast: boolean;
  /** Screen reader enabled */
  screenReader: boolean;
  /** Keyboard navigation only */
  keyboardOnly: boolean;
  /** Font size multiplier */
  fontScale: number;
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

/**
 * User preferences
 */
export interface UserPreferences {
  /** Theme mode */
  theme: ThemeMode;
  /** Accessibility settings */
  accessibility: AccessibilityPreferences;
  /** Pinned applications */
  pinnedApps: AppId[];
  /** Recent applications */
  recentApps: AppId[];
  /** Custom keyboard shortcuts */
  customShortcuts: KeyboardShortcut[];
  /** Notification settings */
  notifications: {
    enabled: boolean;
    sound: boolean;
    badge: boolean;
  };
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * Base component props
 */
export interface BaseComponentProps {
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Children elements */
  children?: ReactNode;
  /** Test ID for testing */
  testId?: string;
}

/**
 * Interactive component props
 */
export interface InteractiveComponentProps extends BaseComponentProps {
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** ARIA label */
  ariaLabel?: string;
  /** ARIA description */
  ariaDescription?: string;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * OS Error
 */
export interface OSError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Error details */
  details?: Record<string, any>;
  /** Stack trace */
  stack?: string;
  /** Timestamp */
  timestamp: Date;
}

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  /** Whether error occurred */
  hasError: boolean;
  /** Error object */
  error: Error | null;
  /** Error info */
  errorInfo: React.ErrorInfo | null;
}

// ============================================================================
// PERFORMANCE
// ============================================================================

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** First contentful paint (ms) */
  fcp: number;
  /** Largest contentful paint (ms) */
  lcp: number;
  /** Time to interactive (ms) */
  tti: number;
  /** Total blocking time (ms) */
  tbt: number;
  /** Cumulative layout shift */
  cls: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract keys of type T that have value type V
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Async function type
 */
export type AsyncFunction<T = void> = () => Promise<T>;

/**
 * Event handler type
 */
export type EventHandler<T = void> = (event: T) => void;
