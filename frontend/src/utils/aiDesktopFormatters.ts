// String formatting utilities for AI Desktop

import type { Language, AppType } from '../types/aiDesktop';

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatPhoneNumber = (phone: string, countryCode: string): string => {
  return `${countryCode} ${phone}`;
};

export const formatLanguage = (lang: Language): string => {
  const languageMap: Record<Language, string> = {
    [Language.ENGLISH]: 'English (Default)',
    [Language.SPANISH]: 'Spanish',
    [Language.FRENCH]: 'French',
    [Language.GERMAN]: 'German',
    [Language.ARABIC]: 'Arabic'
  };
  return languageMap[lang] || 'English (Default)';
};

export const formatAppName = (appType: AppType): string => {
  const appNames: Record<AppType, string> = {
    [AppType.TERMINAL]: 'Terminal',
    [AppType.FILES]: 'Files',
    [AppType.DASHBOARD]: 'Dashboard',
    [AppType.NEWS]: 'News',
    [AppType.QUANTUM_TRAVEL]: 'Quantum Travel',
    [AppType.DEBUGGER]: 'Debugger',
    [AppType.AI_NOTES]: 'AI Notes'
  };
  return appNames[appType];
};