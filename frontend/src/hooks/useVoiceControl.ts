/**
 * useVoiceControl Hook
 * Custom React hook for managing voice control functionality
 * 
 * Features:
 * - Speech recognition management
 * - Text-to-speech management
 * - Voice preferences persistence
 * - Backend integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

export interface VoicePreferences {
  language: 'ar-EG' | 'ar-SA' | 'en-US';
  voiceName?: string;
  rate: number;
  pitch: number;
  volume: number;
  autoSpeak: boolean;
}

interface UseVoiceControlOptions {
  initialPreferences?: Partial<VoicePreferences>;
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  apiEndpoint?: string;
}

interface UseVoiceControlReturn {
  // State
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  preferences: VoicePreferences;
  
  // Actions
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  updatePreferences: (prefs: Partial<VoicePreferences>) => void;
  clearTranscript: () => void;
  clearError: () => void;
}

const DEFAULT_PREFERENCES: VoicePreferences = {
  language: 'ar-EG',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  autoSpeak: true
};

const STORAGE_KEY = 'amrikyy_voice_preferences';

export const useVoiceControl = (
  options: UseVoiceControlOptions = {}
): UseVoiceControlReturn => {
  const {
    initialPreferences = {},
    onTranscript,
    onResponse,
    apiEndpoint = '/api/ai/chat'
  } = options;

  // Load preferences from localStorage
  const loadPreferences = (): VoicePreferences => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored), ...initialPreferences };
      }
    } catch (error) {
      console.error('Error loading voice preferences:', error);
    }
    return { ...DEFAULT_PREFERENCES, ...initialPreferences };
  };

  // State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [preferences, setPreferences] = useState<VoicePreferences>(loadPreferences);

  // Refs
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  /**
   * Save preferences to localStorage
   */
  const savePreferences = useCallback((prefs: VoicePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving voice preferences:', error);
    }
  }, []);

  /**
   * Update preferences
   */
  const updatePreferences = useCallback((newPrefs: Partial<VoicePreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPrefs };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  /**
   * Check browser support
   */
  useEffect(() => {
    const speechRecognitionSupported = 
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    
    const speechSynthesisSupported = 'speechSynthesis' in window;

    setIsSupported(speechRecognitionSupported && speechSynthesisSupported);

    if (speechSynthesisSupported) {
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  /**
   * Initialize speech recognition
   */
  const initRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognitionAPI = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = preferences.language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
      setInterimTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          final += transcriptText;
        } else {
          interim += transcriptText;
        }
      }

      setInterimTranscript(interim);
      
      if (final) {
        setTranscript(final);
        
        if (onTranscript) {
          onTranscript(final);
        }

        // Send to backend
        sendToBackend(final);
      }
    };

    recognition.onerror = (event: any) => {
      let errorMessage = 'حدث خطأ في التعرف على الصوت';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'لم يتم اكتشاف أي صوت';
          break;
        case 'audio-capture':
          errorMessage = 'لا يمكن الوصول إلى الميكروفون';
          break;
        case 'not-allowed':
          errorMessage = 'تم رفض إذن الميكروفون';
          break;
        case 'network':
          errorMessage = 'خطأ في الشبكة';
          break;
      }

      setError(errorMessage);
      setIsListening(false);
    };

    return recognition;
  }, [isSupported, preferences.language, onTranscript]);

  /**
   * Send transcript to backend
   */
  const sendToBackend = async (text: string) => {
    try {
      const response = await axios.post(apiEndpoint, {
        message: text,
        mode: 'voice',
        language: preferences.language.split('-')[0]
      });

      if (response.data.success && response.data.response) {
        const aiResponse = response.data.response;
        
        if (onResponse) {
          onResponse(aiResponse);
        }

        if (preferences.autoSpeak) {
          speak(aiResponse);
        }
      }
    } catch (error) {
      console.error('Error sending to backend:', error);
      setError('فشل الاتصال بالخادم');
    }
  };

  /**
   * Start listening
   */
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('المتصفح لا يدعم التعرف على الصوت');
      return;
    }

    if (isListening) return;

    try {
      if (!recognitionRef.current) {
        recognitionRef.current = initRecognition();
      }

      recognitionRef.current?.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setError('فشل بدء التعرف على الصوت');
    }
  }, [isSupported, isListening, initRecognition]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  /**
   * Speak text
   */
  const speak = useCallback((text: string) => {
    if (!synthesisRef.current) {
      console.error('Speech synthesis not available');
      return;
    }

    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = preferences.language;
    utterance.rate = preferences.rate;
    utterance.pitch = preferences.pitch;
    utterance.volume = preferences.volume;

    if (preferences.voiceName) {
      const voice = window.speechSynthesis.getVoices()
        .find(v => v.name === preferences.voiceName);
      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setError('فشل تشغيل الصوت');
    };

    synthesisRef.current.speak(utterance);
  }, [preferences]);

  /**
   * Stop speaking
   */
  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  /**
   * Clear transcript
   */
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Update recognition language when preferences change
   */
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = preferences.language;
    }
  }, [preferences.language]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  return {
    // State
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    error,
    isSupported,
    preferences,
    
    // Actions
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    updatePreferences,
    clearTranscript,
    clearError
  };
};

export default useVoiceControl;
