/**
 * VoiceSettings Component
 * Allows users to configure voice preferences
 * 
 * Features:
 * - Language selection (Arabic dialects, English)
 * - Voice selection (male/female, different accents)
 * - Speech rate control
 * - Pitch control
 * - Volume control
 * - Auto-speak toggle
 */

import React, { useState, useEffect } from 'react';

export interface VoicePreferences {
  language: 'ar-EG' | 'ar-SA' | 'en-US';
  voiceName?: string;
  rate: number;      // 0.1 to 10 (1 = normal)
  pitch: number;     // 0 to 2 (1 = normal)
  volume: number;    // 0 to 1 (1 = full)
  autoSpeak: boolean;
}

interface VoiceSettingsProps {
  preferences: VoicePreferences;
  onChange: (preferences: VoicePreferences) => void;
  className?: string;
}

interface VoiceOption {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  preferences,
  onChange,
  className = ''
}) => {
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Load available voices
   */
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        
        // Filter voices by language
        const voiceOptions: VoiceOption[] = voices.map(voice => ({
          name: voice.name,
          lang: voice.lang,
          localService: voice.localService,
          default: voice.default
        }));

        setAvailableVoices(voiceOptions);
        console.log('Available voices:', voiceOptions);
      }
    };

    // Load voices
    loadVoices();

    // Some browsers load voices asynchronously
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  /**
   * Get voices for selected language
   */
  const getVoicesForLanguage = (lang: string): VoiceOption[] => {
    return availableVoices.filter(voice => 
      voice.lang.startsWith(lang.split('-')[0])
    );
  };

  /**
   * Handle language change
   */
  const handleLanguageChange = (language: 'ar-EG' | 'ar-SA' | 'en-US') => {
    const voicesForLang = getVoicesForLanguage(language);
    const defaultVoice = voicesForLang.find(v => v.default) || voicesForLang[0];

    onChange({
      ...preferences,
      language,
      voiceName: defaultVoice?.name
    });
  };

  /**
   * Handle voice selection
   */
  const handleVoiceChange = (voiceName: string) => {
    onChange({
      ...preferences,
      voiceName
    });
  };

  /**
   * Handle rate change
   */
  const handleRateChange = (rate: number) => {
    onChange({
      ...preferences,
      rate
    });
  };

  /**
   * Handle pitch change
   */
  const handlePitchChange = (pitch: number) => {
    onChange({
      ...preferences,
      pitch
    });
  };

  /**
   * Handle volume change
   */
  const handleVolumeChange = (volume: number) => {
    onChange({
      ...preferences,
      volume
    });
  };

  /**
   * Handle auto-speak toggle
   */
  const handleAutoSpeakToggle = () => {
    onChange({
      ...preferences,
      autoSpeak: !preferences.autoSpeak
    });
  };

  /**
   * Test current voice settings
   */
  const testVoice = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        preferences.language.startsWith('ar') 
          ? 'مرحباً، هذا اختبار للصوت' 
          : 'Hello, this is a voice test'
      );

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

      window.speechSynthesis.speak(utterance);
    }
  };

  const voicesForCurrentLang = getVoicesForLanguage(preferences.language);

  return (
    <div className={`voice-settings ${className}`}>
      {/* Settings Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="settings-toggle"
      >
        ⚙️ إعدادات الصوت {isExpanded ? '▲' : '▼'}
      </button>

      {/* Settings Panel */}
      {isExpanded && (
        <div className="settings-panel">
          {/* Language Selection */}
          <div className="setting-group">
            <label>اللغة:</label>
            <select
              value={preferences.language}
              onChange={(e) => handleLanguageChange(e.target.value as any)}
              className="setting-select"
            >
              <option value="ar-EG">العربية (مصر)</option>
              <option value="ar-SA">العربية (السعودية)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>

          {/* Voice Selection */}
          {voicesForCurrentLang.length > 0 && (
            <div className="setting-group">
              <label>الصوت:</label>
              <select
                value={preferences.voiceName || ''}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="setting-select"
              >
                {voicesForCurrentLang.map((voice, index) => (
                  <option key={index} value={voice.name}>
                    {voice.name} {voice.default ? '(افتراضي)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Speech Rate */}
          <div className="setting-group">
            <label>
              سرعة الكلام: {preferences.rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={preferences.rate}
              onChange={(e) => handleRateChange(parseFloat(e.target.value))}
              className="setting-slider"
            />
            <div className="slider-labels">
              <span>بطيء</span>
              <span>عادي</span>
              <span>سريع</span>
            </div>
          </div>

          {/* Pitch */}
          <div className="setting-group">
            <label>
              نبرة الصوت: {preferences.pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={preferences.pitch}
              onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
              className="setting-slider"
            />
            <div className="slider-labels">
              <span>منخفض</span>
              <span>عادي</span>
              <span>مرتفع</span>
            </div>
          </div>

          {/* Volume */}
          <div className="setting-group">
            <label>
              مستوى الصوت: {Math.round(preferences.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={preferences.volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="setting-slider"
            />
            <div className="slider-labels">
              <span>🔇</span>
              <span>🔊</span>
            </div>
          </div>

          {/* Auto-speak Toggle */}
          <div className="setting-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.autoSpeak}
                onChange={handleAutoSpeakToggle}
              />
              <span>تشغيل الردود تلقائياً</span>
            </label>
          </div>

          {/* Test Button */}
          <button
            onClick={testVoice}
            className="test-voice-button"
          >
            🔊 اختبار الصوت
          </button>

          {/* Reset Button */}
          <button
            onClick={() => onChange({
              language: 'ar-EG',
              rate: 1.0,
              pitch: 1.0,
              volume: 1.0,
              autoSpeak: true
            })}
            className="reset-button"
          >
            إعادة تعيين الإعدادات
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceSettings;
