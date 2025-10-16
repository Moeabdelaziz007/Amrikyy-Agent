/**
 * VoiceControl Component
 * Handles voice input (Speech-to-Text) and voice output (Text-to-Speech)
 * 
 * Phase 1: Web Speech API (Browser-based)
 * Phase 2: Google Cloud Speech API (Production-ready)
 * 
 * Features:
 * - Arabic language support (ar-EG, ar-SA)
 * - Real-time speech recognition
 * - Natural voice synthesis
 * - Error handling and fallbacks
 * - Browser compatibility checks
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface VoiceControlProps {
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  language?: 'ar-EG' | 'ar-SA' | 'en-US';
  autoSpeak?: boolean;
  className?: string;
}

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({
  onTranscript,
  onResponse,
  language = 'ar-EG',
  autoSpeak = true,
  className = ''
}) => {
  // State management
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    isSupported: false
  });

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  /**
   * Check browser support for Web Speech API
   */
  const checkSupport = useCallback(() => {
    const speechRecognitionSupported = 
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    
    const speechSynthesisSupported = 'speechSynthesis' in window;

    const isSupported = speechRecognitionSupported && speechSynthesisSupported;

    setState(prev => ({ ...prev, isSupported }));

    if (!isSupported) {
      console.warn('Web Speech API not supported in this browser');
    }

    return isSupported;
  }, []);

  /**
   * Initialize Speech Recognition
   */
  const initializeSpeechRecognition = useCallback(() => {
    if (!checkSupport()) return null;

    const SpeechRecognitionAPI = 
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognitionAPI();

    // Configuration
    recognition.continuous = false;        // Stop after one phrase
    recognition.interimResults = true;     // Get interim results
    recognition.lang = language;           // Set language
    recognition.maxAlternatives = 1;       // Get best match only

    // Event handlers
    recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      setState(prev => ({ 
        ...prev, 
        isListening: true, 
        error: null,
        transcript: '',
        interimTranscript: ''
      }));
    };

    recognition.onend = () => {
      console.log('🎤 Voice recognition ended');
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update state
      setState(prev => ({
        ...prev,
        transcript: finalTranscript || prev.transcript,
        interimTranscript
      }));

      // If we have a final transcript, process it
      if (finalTranscript) {
        console.log('📝 Final transcript:', finalTranscript);
        
        // Call callback
        if (onTranscript) {
          onTranscript(finalTranscript);
        }

        // Send to backend
        sendToBackend(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('🎤 Speech recognition error:', event.error);
      
      let errorMessage = 'حدث خطأ في التعرف على الصوت';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'لم يتم اكتشاف أي صوت. حاول مرة أخرى.';
          break;
        case 'audio-capture':
          errorMessage = 'لا يمكن الوصول إلى الميكروفون. تحقق من الأذونات.';
          break;
        case 'not-allowed':
          errorMessage = 'تم رفض إذن الميكروفون. يرجى السماح بالوصول.';
          break;
        case 'network':
          errorMessage = 'خطأ في الشبكة. تحقق من اتصال الإنترنت.';
          break;
        case 'aborted':
          errorMessage = 'تم إلغاء التعرف على الصوت.';
          break;
      }

      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isListening: false 
      }));
    };

    return recognition;
  }, [language, onTranscript]);

  /**
   * Initialize Speech Synthesis
   */
  const initializeSpeechSynthesis = useCallback(() => {
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
      return true;
    }
    return false;
  }, []);

  /**
   * Start listening
   */
  const startListening = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({ 
        ...prev, 
        error: 'المتصفح لا يدعم التعرف على الصوت' 
      }));
      return;
    }

    if (state.isListening) {
      console.warn('Already listening');
      return;
    }

    try {
      if (!recognitionRef.current) {
        recognitionRef.current = initializeSpeechRecognition();
      }

      recognitionRef.current?.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'فشل بدء التعرف على الصوت' 
      }));
    }
  }, [state.isSupported, state.isListening, initializeSpeechRecognition]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  }, [state.isListening]);

  /**
   * Speak text using Text-to-Speech
   */
  const speak = useCallback((text: string) => {
    if (!synthesisRef.current) {
      console.error('Speech synthesis not available');
      return;
    }

    // Cancel any ongoing speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;      // Normal speed
    utterance.pitch = 1.0;     // Normal pitch
    utterance.volume = 1.0;    // Full volume

    // Event handlers
    utterance.onstart = () => {
      console.log('🔊 Speaking started');
      setState(prev => ({ ...prev, isSpeaking: true }));
    };

    utterance.onend = () => {
      console.log('🔊 Speaking ended');
      setState(prev => ({ ...prev, isSpeaking: false }));
    };

    utterance.onerror = (event) => {
      console.error('🔊 Speech synthesis error:', event);
      setState(prev => ({ 
        ...prev, 
        isSpeaking: false,
        error: 'فشل تشغيل الصوت'
      }));
    };

    // Speak
    synthesisRef.current.speak(utterance);
  }, [language]);

  /**
   * Stop speaking
   */
  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  /**
   * Send transcript to backend
   */
  const sendToBackend = async (text: string) => {
    try {
      console.log('📤 Sending to backend:', text);

      const response = await axios.post('/api/ai/chat', {
        message: text,
        mode: 'voice',
        language: language.split('-')[0] // 'ar' or 'en'
      });

      if (response.data.success && response.data.response) {
        const aiResponse = response.data.response;
        console.log('📥 AI Response:', aiResponse);

        // Call callback
        if (onResponse) {
          onResponse(aiResponse);
        }

        // Auto-speak response if enabled
        if (autoSpeak) {
          speak(aiResponse);
        }
      }
    } catch (error) {
      console.error('Error sending to backend:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'فشل الاتصال بالخادم' 
      }));
    }
  };

  /**
   * Initialize on mount
   */
  useEffect(() => {
    checkSupport();
    initializeSpeechSynthesis();

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, [checkSupport, initializeSpeechSynthesis]);

  /**
   * Update language when prop changes
   */
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  // Render
  return (
    <div className={`voice-control ${className}`}>
      {/* Microphone Button */}
      <button
        onClick={state.isListening ? stopListening : startListening}
        disabled={!state.isSupported}
        className={`voice-button ${state.isListening ? 'listening' : ''} ${!state.isSupported ? 'disabled' : ''}`}
        title={state.isListening ? 'إيقاف الاستماع' : 'ابدأ التحدث'}
      >
        {state.isListening ? '🎤 جاري الاستماع...' : '🎤 اضغط للتحدث'}
      </button>

      {/* Speaker Button */}
      {state.isSpeaking && (
        <button
          onClick={stopSpeaking}
          className="voice-button speaking"
          title="إيقاف التشغيل"
        >
          🔊 جاري التشغيل...
        </button>
      )}

      {/* Transcript Display */}
      {(state.transcript || state.interimTranscript) && (
        <div className="transcript-display">
          {state.transcript && (
            <div className="final-transcript">
              <strong>أنت:</strong> {state.transcript}
            </div>
          )}
          {state.interimTranscript && (
            <div className="interim-transcript">
              <em>{state.interimTranscript}</em>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="error-message">
          ⚠️ {state.error}
        </div>
      )}

      {/* Browser Support Warning */}
      {!state.isSupported && (
        <div className="warning-message">
          ⚠️ المتصفح الحالي لا يدعم الواجهة الصوتية. 
          يرجى استخدام Chrome أو Edge للحصول على أفضل تجربة.
        </div>
      )}
    </div>
  );
};

export default VoiceControl;
