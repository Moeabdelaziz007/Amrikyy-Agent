/**
 * Window Manager Context
 * Placeholder for window management state
 * TODO: Implement full window management with Zustand
 */

import { createContext, useContext } from 'react';

interface WindowManagerContextType {
  // Placeholder
}

const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined);

export function useWindowManager() {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error('useWindowManager must be used within WindowManagerProvider');
  }
  return context;
}

export default WindowManagerContext;
