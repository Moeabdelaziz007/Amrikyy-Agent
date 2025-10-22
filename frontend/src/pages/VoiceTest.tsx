/**
 * Voice Test Page
 * 
 * A comprehensive test page for voice functionality including
 * speech-to-text, text-to-speech, and voice commands.
 * 
 * @author CURSERO AI
 * @created 2025-10-22
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  Volume2, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Languages,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import VoiceInterface from '@/components/ui/VoiceInterface';
import { useVoice } from '@/hooks/useVoice';
import { AIButton, AICard } from '@/components/ui/AIEnhancedComponents';
import { cn } from '@/lib/utils';

const VoiceTest: React.FC = () => {
  const [testText, setTestText] = useState('Hello, this is a test of the voice system. How are you today?');
  const [testResults, setTestResults] = useState<Array<{
    id: string;
    type: 'transcript' | 'command' | 'error';
    content: string;
    timestamp: Date;
  }>>([]);

  const {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    error,
    isSupported,
    voices,
    selectedVoice,
    speak,
    stopSpeaking,
    setLanguage,
    setVoice,
    clearTranscript
  } = useVoice({
    language: 'en-US',
    continuous: false,
    interimResults: true
  });

  const handleTranscript = (text: string) => {
    const result = {
      id: Date.now().toString(),
      type: 'transcript' as const,
      content: text,
      timestamp: new Date()
    };
    setTestResults(prev => [result, ...prev]);
  };

  const handleCommand = (command: string) => {
    const result = {
      id: Date.now().toString(),
      type: 'command' as const,
      content: command,
      timestamp: new Date()
    };
    setTestResults(prev => [result, ...prev]);
  };

  const handleError = (error: string) => {
    const result = {
      id: Date.now().toString(),
      type: 'error' as const,
      content: error,
      timestamp: new Date()
    };
    setTestResults(prev => [result, ...prev]);
  };

  const handleTestSpeak = async () => {
    try {
      await speak(testText, {
        voice: selectedVoice,
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
      });
    } catch (error) {
      console.error('Test speak error:', error);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    clearTranscript();
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'transcript':
        return <Mic className="w-4 h-4 text-blue-500" />;
      case 'command':
        return <Zap className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'transcript':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      case 'command':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Voice System Test</h1>
          <p className="text-xl text-gray-300">
            Test speech recognition, text-to-speech, and voice commands
          </p>
        </motion.div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AICard className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                isSupported ? 'bg-green-500' : 'bg-red-500'
              )}>
                {isSupported ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Browser Support</h3>
            <p className="text-gray-300">
              {isSupported ? 'Voice features supported' : 'Voice features not supported'}
            </p>
          </AICard>

          <AICard className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
              )}>
                <Mic className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Listening</h3>
            <p className="text-gray-300">
              {isListening ? 'Active' : 'Inactive'}
            </p>
          </AICard>

          <AICard className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'
              )}>
                <Volume2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Speaking</h3>
            <p className="text-gray-300">
              {isSpeaking ? 'Active' : 'Inactive'}
            </p>
          </AICard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Voice Interface */}
          <AICard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Voice Interface</h2>
            <VoiceInterface
              onTranscript={handleTranscript}
              onCommand={handleCommand}
              onError={handleError}
              showSettings={true}
              autoProcess={true}
            />
          </AICard>

          {/* Test Controls */}
          <AICard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Test Controls</h2>
            
            <div className="space-y-4">
              {/* Test Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Test Text for Speech
                </label>
                <textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={4}
                  placeholder="Enter text to test speech synthesis..."
                />
              </div>

              {/* Test Buttons */}
              <div className="flex gap-3">
                <AIButton
                  onClick={handleTestSpeak}
                  disabled={!testText.trim() || isSpeaking}
                  className="flex-1"
                  icon={<Play className="w-4 h-4" />}
                >
                  {isSpeaking ? 'Speaking...' : 'Test Speech'}
                </AIButton>
                
                <AIButton
                  onClick={stopSpeaking}
                  disabled={!isSpeaking}
                  variant="outline"
                  icon={<Pause className="w-4 h-4" />}
                >
                  Stop
                </AIButton>
              </div>

              {/* Clear Results */}
              <AIButton
                onClick={clearResults}
                variant="outline"
                className="w-full"
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Clear All Results
              </AIButton>
            </div>
          </AICard>
        </div>

        {/* Current Status */}
        {(transcript || interimTranscript || error) && (
          <AICard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Current Status</h2>
            
            <div className="space-y-3">
              {transcript && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Final Transcript:</p>
                      <p className="text-blue-800 dark:text-blue-200">{transcript}</p>
                    </div>
                  </div>
                </div>
              )}

              {interimTranscript && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-2">
                    <Mic className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0 animate-pulse" />
                    <div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Listening...</p>
                      <p className="text-yellow-800 dark:text-yellow-200 italic">{interimTranscript}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">Error:</p>
                      <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AICard>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <AICard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Test Results</h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'p-3 rounded-lg border',
                    getResultColor(result.type)
                  )}
                >
                  <div className="flex items-start gap-2">
                    {getResultIcon(result.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium capitalize">
                          {result.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {result.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{result.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AICard>
        )}

        {/* Voice Information */}
        <AICard className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Voice Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Available Voices</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {voices.map((voice, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-2 rounded-lg text-sm',
                      selectedVoice?.name === voice.name
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300'
                    )}
                  >
                    <div className="font-medium">{voice.name}</div>
                    <div className="text-xs opacity-80">
                      {voice.lang} • {voice.gender}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Selected Voice</h3>
              {selectedVoice ? (
                <div className="p-4 bg-gray-700 rounded-lg">
                  <div className="font-medium text-white">{selectedVoice.name}</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Language: {selectedVoice.lang}
                  </div>
                  <div className="text-sm text-gray-300">
                    Gender: {selectedVoice.gender}
                  </div>
                  {selectedVoice.naturalSampleRateHertz && (
                    <div className="text-sm text-gray-300">
                      Sample Rate: {selectedVoice.naturalSampleRateHertz}Hz
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-700 rounded-lg text-gray-300">
                  No voice selected
                </div>
              )}
            </div>
          </div>
        </AICard>
      </div>
    </div>
  );
};

export default VoiceTest;