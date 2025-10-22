import { useState, useEffect, useCallback } from 'react';

/**
 * Device type based on viewport width
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Breakpoint configuration
 */
export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

/**
 * Default breakpoints matching our responsive CSS system
 */
const DEFAULT_BREAKPOINTS: Breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
};

/**
 * Hook options
 */
interface UseDeviceTypeOptions {
  breakpoints?: Partial<Breakpoints>;
  debounceMs?: number;
}

/**
 * Debounce utility for resize events
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Detect device type based on viewport width with debounced resize handling
 *
 * @param options - Configuration options
 * @returns Current device type
 *
 * @example
 * ```tsx
 * const deviceType = useDeviceType();
 *
 * if (deviceType === 'mobile') {
 *   return <MobileLayout />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Custom breakpoints
 * const deviceType = useDeviceType({
 *   breakpoints: { mobile: 640, tablet: 1024 },
 *   debounceMs: 150
 * });
 * ```
 */
export function useDeviceType(options: UseDeviceTypeOptions = {}): DeviceType {
  const { breakpoints: customBreakpoints, debounceMs = 100 } = options;

  const breakpoints: Breakpoints = {
    ...DEFAULT_BREAKPOINTS,
    ...customBreakpoints,
  };

  /**
   * Calculate device type from window width
   */
  const getDeviceType = useCallback((): DeviceType => {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;

    if (width < breakpoints.mobile) return 'mobile';
    if (width < breakpoints.tablet) return 'tablet';
    return 'desktop';
  }, [breakpoints]);

  const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType);

  useEffect(() => {
    // Handle resize with debouncing for performance
    const handleResize = debounce(() => {
      setDeviceType(getDeviceType());
    }, debounceMs);

    // Set initial value
    setDeviceType(getDeviceType());

    // Listen for resize events
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [getDeviceType, debounceMs]);

  return deviceType;
}

/**
 * Hook to check if current device matches a specific type
 *
 * @param targetType - Device type to check
 * @returns True if current device matches target type
 *
 * @example
 * ```tsx
 * const isMobile = useIsDeviceType('mobile');
 *
 * return (
 *   <div>
 *     {isMobile && <MobileMenu />}
 *   </div>
 * );
 * ```
 */
export function useIsDeviceType(targetType: DeviceType): boolean {
  const deviceType = useDeviceType();
  return deviceType === targetType;
}

/**
 * Hook to get device capabilities
 *
 * @returns Object with device capability flags
 *
 * @example
 * ```tsx
 * const { isTouchDevice, hasHover } = useDeviceCapabilities();
 *
 * if (isTouchDevice) {
 *   return <TouchOptimizedUI />;
 * }
 * ```
 */
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    isTouchDevice: false,
    hasHover: true,
    hasPointer: true,
  });

  useEffect(() => {
    setCapabilities({
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hasHover: window.matchMedia('(hover: hover)').matches,
      hasPointer: window.matchMedia('(pointer: fine)').matches,
    });
  }, []);

  return capabilities;
}
