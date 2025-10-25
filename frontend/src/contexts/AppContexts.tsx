/**
 * Centralized Application Contexts
 *
 * This file contains all React contexts used throughout the application.
 * Importing contexts from here prevents circular dependencies.
 *
 * DO NOT import contexts from App.tsx - always use this file instead!
 */

import { createContext } from 'react';

// ============================================
// Language Context
// ============================================

export interface LanguageContextType {
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
});

// ============================================
// Notification Context
// ============================================

export interface NotificationContextType {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  notificationsEnabled: true,
  setNotificationsEnabled: () => {},
});

// ============================================
// TTS (Text-to-Speech) Context
// ============================================

export interface TTSContextType {
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
}

export const TTSContext = createContext<TTSContextType>({
  selectedVoice: 'Zephyr',
  setSelectedVoice: () => {},
  playbackSpeed: 1.0,
  setPlaybackSpeed: () => {},
});

// ============================================
// Export all contexts
// ============================================

export default {
  LanguageContext,
  NotificationContext,
  TTSContext,
};
