/**
 * Voice Interface Component
 * 
 * A comprehensive voice interface with speech-to-text and text-to-speech
 * capabilities, designed for the Amrikyy Travel Agent platform.
 * 
 * Features:
 * - Speech recognition with visual feedback
 * - Text-to-speech with voice selection
 * - Multi-language support
 * - Voice command processing
 * - Error handling and fallbacks
 * 
 * @author CURSERO AI
 * @created 2025-10-22
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Languages,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useVoice, getSupportedLanguages, getLanguageName, isRTLLanguage } from '@/hooks/useVoice';
import { AIButton } from './AIEnhancedComponents';
import { cn } from '@/lib/utils';

interface VoiceInterfaceProps {
  onTranscript?: (transcript: string) => void;
  onCommand?: (command: string) => void;
  onError?: (error: string) => void;
  className?: string;
  showSettings?: boolean;
  autoProcess?: boolean;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onTranscript,
  onCommand,
  onError,
  className,
  showSettings = true,
  autoProcess = true
}) => {
  // ==================== State ====================
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  // ==================== Voice Hook ====================
  
  const {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    error,
    isSupported,
    voices,
    selectedVoice,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    setLanguage,
    setVoice,
    clearTranscript
  } = useVoice({
    language: selectedLanguage,
    continuous: false,
    interimResults: true
  });

  // ==================== Effects ====================
  
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  useEffect(() => {
    if (transcript && autoProcess) {
      handleTranscript(transcript);
    }
  }, [transcript, autoProcess]);

  // ==================== Handlers ====================
  
  const handleTranscript = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    onTranscript?.(text);

    try {
      // Process voice command
      const response = await fetch('/api/voice/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: text,
          language: selectedLanguage.split('-')[0]
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.action !== 'general_query') {
          setLastCommand(result.data.action);
          onCommand?.(result.data.action);
        }
      }
    } catch (error) {
      console.error('Voice command processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setLanguage(language);
    clearTranscript();
  };

  const handleVoiceChange = (voice: SpeechSynthesisVoice) => {
    setVoice(voice);
  };

  const handleSpeak = async (text: string) => {
    if (!text.trim()) return;

    try {
      await speak(text, {
        voice: selectedVoice,
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
      });
    } catch (error) {
      console.error('Speech synthesis error:', error);
      onError?.('Failed to speak text');
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // ==================== Render ====================
  
  if (!isSupported) {
    return (
      <div className={cn('p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800', className)}>
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Voice features are not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Voice Controls */}
      <div className="flex items-center gap-3">
        {/* Microphone Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AIButton
            onClick={handleToggleListening}
            variant={isListening ? 'primary' : 'outline'}
            size="lg"
            className={cn(
              'relative overflow-hidden',
              isListening && 'animate-pulse bg-red-500 hover:bg-red-600'
            )}
            icon={isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          >
            {isListening ? 'Listening...' : 'Start Voice'}
          </AIButton>
        </motion.div>

        {/* Speaker Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AIButton
            onClick={() => handleSpeak(transcript || 'Hello, how can I help you?')}
            variant={isSpeaking ? 'primary' : 'outline'}
            size="lg"
            disabled={!transcript && !isSpeaking}
            icon={isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          >
            {isSpeaking ? 'Speaking...' : 'Speak'}
          </AIButton>
        </motion.div>

        {/* Settings Button */}
        {showSettings && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AIButton
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              size="lg"
              icon={<Settings className="w-5 h-5" />}
            >
              Settings
            </AIButton>
          </motion.div>
        )}
      </div>

      {/* Transcript Display */}
      <AnimatePresence>
        {(transcript || interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border"
          >
            <div className="space-y-2">
              {transcript && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Final transcript:</p>
                    <p className="text-gray-900 dark:text-white">{transcript}</p>
                  </div>
                </div>
              )}
              
              {interimTranscript && (
                <div className="flex items-start gap-2">
                  <Loader2 className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0 animate-spin" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Listening...</p>
                    <p className="text-gray-700 dark:text-gray-300 italic">{interimTranscript}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last Command */}
      {lastCommand && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Command detected: <strong>{lastCommand}</strong>
            </span>
          </div>
        </motion.div>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border space-y-4"
          >
            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Languages className="w-4 h-4 inline mr-1" />
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {getSupportedLanguages().map(lang => (
                  <option key={lang} value={lang}>
                    {getLanguageName(lang)}
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Selection */}
            {voices.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Volume2 className="w-4 h-4 inline mr-1" />
                  Voice
                </label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = voices.find(v => v.name === e.target.value);
                    if (voice) handleVoiceChange(voice);
                  }}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {voices
                    .filter(voice => voice.lang.startsWith(selectedLanguage.split('-')[0]))
                    .map(voice => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Clear Transcript */}
            <div className="flex gap-2">
              <AIButton
                onClick={clearTranscript}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Clear Transcript
              </AIButton>
              <AIButton
                onClick={() => handleSpeak('Test voice output')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Test Voice
              </AIButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInterface;