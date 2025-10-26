/**
 * @fileoverview Centralized Application Contexts
 * @module contexts/AppContexts
 * @description This file contains all React contexts used throughout the application.
 * Importing contexts from here prevents circular dependencies.
 *
 * DO NOT import contexts from App.tsx - always use this file instead!
 */

import { createContext } from 'react';

// ============================================
// Language Context
// ============================================

/**
 * @interface LanguageContextType
 * @description The shape of the LanguageContext.
 * @property {'en' | 'ar'} lang - The current language.
 * @property {(lang: 'en' | 'ar') => void} setLang - A function to set the language.
 */
export interface LanguageContextType {
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
}

/**
 * @const {React.Context<LanguageContextType>} LanguageContext
 * @description The context for managing the application's language.
 */
export const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
});

// ============================================
// Notification Context
// ============================================

/**
 * @interface NotificationContextType
 * @description The shape of the NotificationContext.
 * @property {boolean} notificationsEnabled - Whether notifications are enabled.
 * @property {(enabled: boolean) => void} setNotificationsEnabled - A function to enable or disable notifications.
 */
export interface NotificationContextType {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

/**
 * @const {React.Context<NotificationContextType>} NotificationContext
 * @description The context for managing notification settings.
 */
export const NotificationContext = createContext<NotificationContextType>({
  notificationsEnabled: true,
  setNotificationsEnabled: () => {},
});

// ============================================
// TTS (Text-to-Speech) Context
// ============================================

/**
 * @interface TTSContextType
 * @description The shape of the TTSContext.
 * @property {string} selectedVoice - The currently selected voice for text-to-speech.
 * @property {(voice: string) => void} setSelectedVoice - A function to set the voice.
 * @property {number} playbackSpeed - The playback speed for text-to-speech.
 * @property {(speed: number) => void} setPlaybackSpeed - A function to set the playback speed.
 */
export interface TTSContextType {
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
}

/**
 * @const {React.Context<TTSContextType>} TTSContext
 * @description The context for managing text-to-speech settings.
 */
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
