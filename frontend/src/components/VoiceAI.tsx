/**
 * Voice AI Component
 * Animated voice interface with waveform visualization
 * Allows users to interact with AI using voice commands
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, X, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceAIProps {
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  position?: 'fixed' | 'inline';
}

export default function VoiceAI({ 
  onTranscript, 
  onResponse,
  position = 'fixed' 
}: VoiceAIProps) {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      // Set language based on current selection
      recognitionRef.current.lang = language === 'ar' ? 'ar-EG' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        
        if (event.results[current].isFinal) {
          onTranscript?.(transcriptText);
          handleAIResponse(transcriptText);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Audio visualization
  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      stopAudioVisualization();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      startAudioVisualization();
      setIsListening(true);
      setIsExpanded(true);
      setTranscript('');
      setResponse('');
    }
  };

  const handleAIResponse = async (text: string) => {
    setIsProcessing(true);
    try {
      // Get backend URL from environment or use relative path
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const res = await fetch(`${backendUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      
      const data = await res.json();
      const aiResponse = data.response || 'I can help you with that!';
      setResponse(aiResponse);
      onResponse?.(aiResponse);
      
      // Speak the response in correct language
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.lang = language === 'ar' ? 'ar-EG' : 'en-US';
        utterance.rate = language === 'ar' ? 0.9 : 1.0; // Slightly slower for Arabic
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('AI response error:', error);
      setResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Animated waveform bars
  const WaveformBars = () => (
    <div className="flex items-center justify-center gap-1 h-16">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full"
          animate={{
            height: isListening 
              ? [8, 32 + audioLevel * 40, 8]
              : [8, 16, 8],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.05,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  const containerClass = position === 'fixed' 
    ? "fixed bottom-8 right-8 z-50"
    : "relative";

  return (
    <div className={containerClass}>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl max-w-md"
          >
            {/* Close button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{
                  scale: isListening ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 1,
                  repeat: isListening ? Infinity : 0,
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-lg opacity-50" />
                <Sparkles className="relative w-8 h-8 text-cyan-400" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-white">{t('voice.title')}</h3>
                <p className="text-sm text-slate-400">
                  {isListening ? t('voice.listening') : isProcessing ? t('voice.thinking') : t('voice.ready')}
                </p>
              </div>
            </div>

            {/* Waveform Visualization */}
            {isListening && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4"
              >
                <WaveformBars />
              </motion.div>
            )}

            {/* Transcript */}
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700"
              >
                <p className="text-sm text-slate-300 mb-1 font-semibold">{t('voice.you.said')}</p>
                <p className="text-white">{transcript}</p>
              </motion.div>
            )}

            {/* AI Response */}
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <p className="text-sm text-cyan-400 font-semibold">{t('voice.amrikyy.says')}</p>
                </div>
                <p className="text-white">{response}</p>
              </motion.div>
            )}

            {/* Processing indicator */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 text-slate-400"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                <span className="text-sm">{t('voice.processing')}</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleListening}
        className={`
          relative w-16 h-16 rounded-full flex items-center justify-center
          ${isListening 
            ? 'bg-gradient-to-r from-red-500 to-pink-500' 
            : 'bg-gradient-to-r from-cyan-500 to-blue-500'
          }
          shadow-2xl transition-all duration-300
        `}
      >
        {/* Pulse effect when listening */}
        {isListening && (
          <>
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-pink-500"
            />
            <motion.div
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-pink-500"
            />
          </>
        )}

        {/* Icon */}
        <motion.div
          animate={{
            scale: isListening ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: isListening ? Infinity : 0,
          }}
          className="relative z-10"
        >
          {isListening ? (
            <MicOff className="w-7 h-7 text-white" />
          ) : (
            <Mic className="w-7 h-7 text-white" />
          )}
        </motion.div>
      </motion.button>

      {/* Tooltip */}
      {!isExpanded && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-20 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap pointer-events-none"
        >
          {t('voice.tooltip')}
        </motion.div>
      )}
    </div>
  );
}
