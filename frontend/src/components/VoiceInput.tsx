import React, { useState, useEffect, useRef } from 'react';
import './VoiceInput.css';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  language?: string;
  continuous?: boolean;
  autoSend?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onFinalTranscript,
  language = 'en-US',
  continuous = false,
  autoSend = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition not supported in this browser');
      return;
    }

    // Initialize Speech Recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      startAudioVisualization();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ' ';
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);
      onTranscript(fullTranscript);

      if (finalTranscript && onFinalTranscript) {
        onFinalTranscript(finalTranscript.trim());
        
        if (autoSend && !continuous) {
          stopListening();
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
      stopAudioVisualization();
    };

    recognition.onend = () => {
      setIsListening(false);
      stopAudioVisualization();
      
      // Restart if continuous mode
      if (continuous && recognitionRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopAudioVisualization();
    };
  }, [language, continuous, autoSend]);

  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      updateAudioLevel();
    } catch (err) {
      console.error('Failed to start audio visualization:', err);
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

  const updateAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255);
    
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const startListening = async () => {
    if (!recognitionRef.current) return;

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (err: any) {
      console.error('Failed to start recognition:', err);
      setError(err.message || 'Failed to access microphone');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    onTranscript('');
  };

  if (!isSupported) {
    return (
      <div className="voice-input-error">
        <span>🎤 Voice input not supported</span>
      </div>
    );
  }

  return (
    <div className="voice-input-container">
      <button
        onClick={toggleListening}
        className={`voice-button ${isListening ? 'listening' : ''}`}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        <div className="voice-icon">
          {isListening ? (
            <div className="voice-pulse" style={{ transform: `scale(${1 + audioLevel})` }}>
              🎤
            </div>
          ) : (
            '🎤'
          )}
        </div>
        <span className="voice-label">
          {isListening ? 'Listening...' : 'Voice'}
        </span>
      </button>

      {isListening && (
        <div className="voice-visualizer">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="voice-bar"
              style={{
                height: `${Math.random() * audioLevel * 100}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      )}

      {transcript && (
        <div className="voice-transcript">
          <div className="transcript-text">{transcript}</div>
          <button
            onClick={clearTranscript}
            className="transcript-clear"
            title="Clear transcript"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="voice-error">
          <span>⚠️ {error}</span>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
