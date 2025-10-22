// String formatting utilities for AI Desktop

import type { Language, AppType } from '../types/aiDesktop';

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const formatPhoneNumber = (
  phone: string,
  countryCode: string
): string => {
  return `${countryCode} ${phone}`;
};

export const formatLanguage = (lang: Language): string => {
  const languageMap: Record<Language, string> = {
    [Language.ENGLISH]: 'English (Default)',
    [Language.SPANISH]: 'Spanish',
    [Language.FRENCH]: 'French',
    [Language.GERMAN]: 'German',
    [Language.ARABIC]: 'Arabic',
  };
  return languageMap[lang] || 'English (Default)';
};

export const formatAppName = (name: string): string => {
  return name.replace(/([A-Z])/g, ' $1').trim();
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'core':
      return 'text-blue-400';
    case 'utility':
      return 'text-green-400';
    case 'creative':
      return 'text-purple-400';
    case 'system':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};
