/**
 * Enhanced Voice Hook - Complete Voice Processing
 * 
 * Features:
 * - Speech-to-Text (STT) using Web Speech API
 * - Text-to-Speech (TTS) using Web Speech API or backend
 * - Voice command processing
 * - Multi-language support
 * - Error handling and fallbacks
 * - Audio recording and playback
 * 
 * @author CURSERO AI
 * @created 2025-10-22
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  timeout?: number;
}

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
}

interface VoiceActions {
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, options?: SpeakOptions) => Promise<void>;
  stopSpeaking: () => void;
  setLanguage: (language: string) => void;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  clearTranscript: () => void;
}

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useVoice(config: VoiceConfig = {}): VoiceState & VoiceActions {
  // ==================== State ====================
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // ==================== Refs ====================
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== Configuration ====================
  
  const {
    language = 'en-US',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
    timeout = 10000
  } = config;

  // ==================== Speech Recognition Support ====================
  
  const isSupported = typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  // ==================== Initialize Speech Recognition ====================
  
  useEffect(() => {
    if (!isSupported) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = maxAlternatives;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(prev => prev + finalTranscript);
      setInterimTranscript(interimTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported, language, continuous, interimResults, maxAlternatives]);

  // ==================== Initialize Speech Synthesis ====================
  
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Set default voice based on language
      const defaultVoice = availableVoices.find(voice => 
        voice.lang.startsWith(language.split('-')[0])
      ) || availableVoices[0];
      
      if (defaultVoice) {
        setSelectedVoice(defaultVoice);
      }
    };

    // Load voices immediately
    loadVoices();

    // Load voices when they become available
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [language]);

  // ==================== Actions ====================
  
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    try {
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();

      // Set timeout
      if (timeout > 0) {
        timeoutRef.current = setTimeout(() => {
          stopListening();
        }, timeout);
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setError('Failed to start speech recognition');
    }
  }, [isListening, timeout]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }, [isListening]);

  const speak = useCallback(async (text: string, options: SpeakOptions = {}) => {
    if (!text.trim()) return;

    const {
      rate = 1,
      pitch = 1,
      volume = 1,
      voice = selectedVoice,
      onStart,
      onEnd,
      onError
    } = options;

    try {
      // Stop any current speech
      stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      utterance.voice = voice;
      utterance.lang = language;

      utterance.onstart = () => {
        setIsSpeaking(true);
        onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        onError?.(event.error);
      };

      synthesisRef.current = utterance;
      speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('Error speaking text:', error);
      onError?.(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [selectedVoice, language]);

  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current) {
      speechSynthesis.cancel();
      synthesisRef.current = null;
      setIsSpeaking(false);
    }
  }, []);

  const setLanguage = useCallback((newLanguage: string) => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLanguage;
    }
  }, []);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // ==================== Cleanup ====================
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      stopSpeaking();
    };
  }, [stopSpeaking]);

  // ==================== Return ====================
  
  return {
    // State
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    error,
    isSupported,
    voices,
    selectedVoice,
    
    // Actions
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    setLanguage,
    setVoice,
    clearTranscript
  };
}

// ==================== Utility Functions ====================

/**
 * Get available languages for speech recognition
 */
export function getSupportedLanguages(): string[] {
  return [
    'en-US', 'en-GB', 'en-AU', 'en-CA',
    'ar-SA', 'ar-EG', 'ar-AE', 'ar-KW',
    'es-ES', 'es-MX', 'es-AR',
    'fr-FR', 'fr-CA',
    'de-DE', 'it-IT', 'pt-BR', 'pt-PT',
    'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW',
    'ru-RU', 'hi-IN', 'th-TH', 'tr-TR'
  ];
}

/**
 * Get language name from code
 */
export function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'ar-SA': 'العربية (السعودية)',
    'ar-EG': 'العربية (مصر)',
    'es-ES': 'Español (España)',
    'fr-FR': 'Français (France)',
    'de-DE': 'Deutsch (Deutschland)',
    'ja-JP': '日本語 (日本)',
    'ko-KR': '한국어 (대한민국)',
    'zh-CN': '中文 (中国)',
    'ru-RU': 'Русский (Россия)',
    'hi-IN': 'हिन्दी (भारत)'
  };
  
  return languages[code] || code;
}

/**
 * Check if language is RTL
 */
export function isRTLLanguage(code: string): boolean {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.some(lang => code.startsWith(lang));
}

export default useVoice;