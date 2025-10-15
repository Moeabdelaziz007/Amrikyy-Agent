import React, { useState, useEffect, useRef } from 'react';
import './VoiceOutput.css';

interface VoiceOutputProps {
  text: string;
  autoPlay?: boolean;
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

export const VoiceOutput: React.FC<VoiceOutputProps> = ({
  text,
  autoPlay = false,
  language = 'en-US',
  rate = 1.0,
  pitch = 1.0,
  volume = 1.0,
  onStart,
  onEnd,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [progress, setProgress] = useState(0);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Check browser support
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Select default voice for language
      const defaultVoice = availableVoices.find(
        voice => voice.lang.startsWith(language.split('-')[0])
      ) || availableVoices[0];
      
      setSelectedVoice(defaultVoice);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      stopSpeaking();
    };
  }, [language]);

  useEffect(() => {
    if (autoPlay && text && !isSpeaking) {
      speak();
    }
  }, [text, autoPlay]);

  const speak = () => {
    if (!text || isSpeaking) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setProgress(0);
      startProgressTracking();
      onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setProgress(100);
      stopProgressTracking();
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
      stopProgressTracking();
    };

    utterance.onpause = () => {
      setIsPaused(true);
      stopProgressTracking();
    };

    utterance.onresume = () => {
      setIsPaused(false);
      startProgressTracking();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress(0);
    stopProgressTracking();
  };

  const pauseSpeaking = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
    }
  };

  const resumeSpeaking = () => {
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
    }
  };

  const startProgressTracking = () => {
    const estimatedDuration = (text.length / 15) * 1000 / rate; // Rough estimate
    const updateInterval = 100;
    let elapsed = 0;

    progressIntervalRef.current = window.setInterval(() => {
      elapsed += updateInterval;
      const newProgress = Math.min((elapsed / estimatedDuration) * 100, 99);
      setProgress(newProgress);
    }, updateInterval);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const changeVoice = (voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
    if (isSpeaking) {
      stopSpeaking();
      setTimeout(() => speak(), 100);
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-output-error">
        <span>🔊 Text-to-speech not supported</span>
      </div>
    );
  }

  return (
    <div className="voice-output-container">
      <div className="voice-controls">
        {!isSpeaking ? (
          <button
            onClick={speak}
            className="voice-play-button"
            title="Play audio"
            disabled={!text}
          >
            <span className="voice-icon">🔊</span>
            <span className="voice-label">Play</span>
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button
                onClick={pauseSpeaking}
                className="voice-pause-button"
                title="Pause audio"
              >
                <span className="voice-icon">⏸️</span>
                <span className="voice-label">Pause</span>
              </button>
            ) : (
              <button
                onClick={resumeSpeaking}
                className="voice-resume-button"
                title="Resume audio"
              >
                <span className="voice-icon">▶️</span>
                <span className="voice-label">Resume</span>
              </button>
            )}
            
            <button
              onClick={stopSpeaking}
              className="voice-stop-button"
              title="Stop audio"
            >
              <span className="voice-icon">⏹️</span>
              <span className="voice-label">Stop</span>
            </button>
          </>
        )}
      </div>

      {isSpeaking && (
        <div className="voice-progress">
          <div 
            className="voice-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {voices.length > 1 && (
        <div className="voice-selector">
          <label htmlFor="voice-select">Voice:</label>
          <select
            id="voice-select"
            value={selectedVoice?.name || ''}
            onChange={(e) => {
              const voice = voices.find(v => v.name === e.target.value);
              if (voice) changeVoice(voice);
            }}
            className="voice-select"
          >
            {voices
              .filter(voice => voice.lang.startsWith(language.split('-')[0]))
              .map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default VoiceOutput;
