/**
 * Voice Interface Component
 * Provides real-time voice communication with Cursor Manager via WebSocket
 * Uses browser Web Speech API for speech recognition and synthesis
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';

interface VoiceInterfaceProps {
  userId: string;
  onVoiceResponse?: (response: any) => void;
  className?: string;
}

interface VoiceSession {
  sessionId: string;
  isActive: boolean;
  isListening: boolean;
  language: string;
  quality: string;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  userId,
  onVoiceResponse,
  className = ''
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [rate, setRate] = useState(1.0);
  const [language, setLanguage] = useState('en-US');
  const [showSettings, setShowSettings] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    const checkSupport = () => {
      const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      const speechSynthesisSupported = 'speechSynthesis' in window;

      setIsSupported(speechRecognitionSupported && speechSynthesisSupported);

      if (speechRecognitionSupported) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language;
      }

      if (speechSynthesisSupported) {
        synthesisRef.current = window.speechSynthesis;
      }
    };

    checkSupport();
  }, [language]);

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:8080');
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('🎤 Voice WebSocket connected');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          handleWebSocketMessage(JSON.parse(event.data));
        };

        ws.onclose = () => {
          console.log('🎤 Voice WebSocket disconnected');
          setIsConnected(false);
          setSession(null);
        };

        ws.onerror = (error) => {
          console.error('🎤 Voice WebSocket error:', error);
          setIsConnected(false);
        };

      } catch (error) {
        console.error('Failed to connect to voice WebSocket:', error);
      }
    };

    if (isSupported) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isSupported]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'welcome':
        console.log('🎤 Voice server ready:', data.message);
        break;

      case 'session_started':
        setSession({
          sessionId: data.sessionId,
          isActive: true,
          isListening: false,
          language: data.language,
          quality: data.quality
        });
        break;

      case 'voice_response':
        handleVoiceResponse(data);
        break;

      case 'session_ended':
        setSession(null);
        setIsListening(false);
        setIsSpeaking(false);
        break;

      case 'error':
        console.error('Voice error:', data.error);
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const handleVoiceResponse = (data: any) => {
    setTranscript(data.transcript);

    // Speak the response
    if (data.cursorResponse && synthesisRef.current) {
      speakText(extractSpeakableText(data.cursorResponse));
    }

    // Notify parent component
    if (onVoiceResponse) {
      onVoiceResponse(data);
    }
  };

  const extractSpeakableText = (cursorResponse: any): string => {
    if (cursorResponse.success && cursorResponse.result) {
      if (typeof cursorResponse.result === 'string') {
        return cursorResponse.result;
      } else if (cursorResponse.result.summary) {
        return cursorResponse.result.summary;
      } else if (cursorResponse.result.message) {
        return cursorResponse.result.message;
      }
    }
    return cursorResponse.error || 'Sorry, I encountered an error processing your request.';
  };

  const speakText = (text: string) => {
    if (!synthesisRef.current) return;

    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume;
    utterance.rate = rate;
    utterance.lang = language;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    };

    synthesisRef.current.speak(utterance);
  };

  const startVoiceSession = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert('Voice server not connected. Please check your connection.');
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'start_session',
      payload: {
        userId,
        language,
        quality: 'high'
      }
    }));
  };

  const startListening = () => {
    if (!recognitionRef.current || !session) return;

    setIsListening(true);
    setTranscript('');

    recognitionRef.current.onstart = () => {
      console.log('🎤 Listening started...');
    };

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      // Send final results to server
      if (finalTranscript && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'voice_input',
          payload: {
            transcript: finalTranscript,
            confidence: 0.9,
            isFinal: true
          }
        }));
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      console.log('🎤 Listening ended');
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const endVoiceSession = () => {
    if (wsRef.current && session) {
      wsRef.current.send(JSON.stringify({
        type: 'end_session',
        payload: {
          reason: 'user_request'
        }
      }));
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  if (!isSupported) {
    return (
      <div className={`p-4 border rounded-lg bg-red-50 ${className}`}>
        <div className="text-red-600 font-medium">Voice Interface Not Supported</div>
        <div className="text-sm text-red-500 mt-1">
          Your browser doesn't support the Web Speech API. Please use Chrome, Edge, or Safari.
        </div>
      </div>
    );
  }

  return (
    <div className={`voice-interface p-4 border rounded-lg bg-white ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Voice Assistant</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <button
            onClick={toggleSettings}
            className="p-1 rounded hover:bg-gray-100"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <h4 className="font-medium mb-2">Voice Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-1 border rounded text-sm"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="ar-SA">Arabic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Speed</label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">{rate.toFixed(1)}x</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Volume</label>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">{Math.round(volume * 100)}%</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4 mb-4">
        {!session ? (
          <button
            onClick={startVoiceSession}
            disabled={!isConnected}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            <Mic className="w-4 h-4" />
            <span>Start Voice Session</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`flex items-center space-x-2 px-4 py-2 rounded ${
                isListening
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isListening ? 'Stop Listening' : 'Start Listening'}</span>
            </button>

            <button
              onClick={endVoiceSession}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              End Session
            </button>
          </div>
        )}

        {isSpeaking && (
          <div className="flex items-center space-x-2 text-blue-600">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Speaking...</span>
          </div>
        )}
      </div>

      {transcript && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-1">Transcript:</div>
          <div className="p-3 bg-gray-50 rounded border text-sm">
            {transcript}
          </div>
        </div>
      )}

      {session && (
        <div className="text-xs text-gray-500">
          Session: {session.sessionId} | Language: {session.language} | Quality: {session.quality}
        </div>
      )}
    </div>
  );
};

export default VoiceInterface;