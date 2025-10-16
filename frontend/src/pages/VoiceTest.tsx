/**
 * Voice Interface Test Page
 * Complete testing environment for voice features
 */

import React, { useState } from 'react';
import VoiceControl from '../components/VoiceControl';
import VoiceSettings from '../components/VoiceSettings';
import { useVoiceControl } from '../hooks/useVoiceControl';
import '../components/VoiceControl.css';
import './VoiceTest.css';

interface Message {
  id: number;
  role: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
}

const VoiceTest: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'system',
      text: 'مرحباً! أنا Amrikyy، مساعدك الصوتي للسفر. اضغط على زر الميكروفون وابدأ التحدث.',
      timestamp: new Date()
    }
  ]);

  const [testResults, setTestResults] = useState<{
    speechRecognition: boolean | null;
    speechSynthesis: boolean | null;
    microphone: boolean | null;
    arabicSupport: boolean | null;
  }>({
    speechRecognition: null,
    speechSynthesis: null,
    microphone: null,
    arabicSupport: null
  });

  const {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    error,
    isSupported,
    preferences,
    updatePreferences,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript,
    clearError
  } = useVoiceControl({
    onTranscript: (text) => {
      addMessage('user', text);
    },
    onResponse: (text) => {
      addMessage('ai', text);
    }
  });

  const addMessage = (role: 'user' | 'ai' | 'system', text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      role,
      text,
      timestamp: new Date()
    }]);
  };

  const runDiagnostics = () => {
    const results = {
      speechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
      speechSynthesis: 'speechSynthesis' in window,
      microphone: false,
      arabicSupport: false
    };

    // Test microphone access
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          results.microphone = true;
          setTestResults(prev => ({ ...prev, microphone: true }));
        })
        .catch(() => {
          results.microphone = false;
          setTestResults(prev => ({ ...prev, microphone: false }));
        });
    }

    // Test Arabic voice support
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      results.arabicSupport = voices.some(v => v.lang.startsWith('ar'));
      
      if (voices.length === 0) {
        // Voices might load asynchronously
        window.speechSynthesis.onvoiceschanged = () => {
          const newVoices = window.speechSynthesis.getVoices();
          const hasArabic = newVoices.some(v => v.lang.startsWith('ar'));
          setTestResults(prev => ({ ...prev, arabicSupport: hasArabic }));
        };
      }
    }

    setTestResults(prev => ({
      ...prev,
      speechRecognition: results.speechRecognition,
      speechSynthesis: results.speechSynthesis,
      arabicSupport: results.arabicSupport
    }));

    addMessage('system', `تم إجراء الفحص التشخيصي:
- التعرف على الصوت: ${results.speechRecognition ? '✅' : '❌'}
- تشغيل الصوت: ${results.speechSynthesis ? '✅' : '❌'}
- الميكروفون: ${results.microphone ? '✅' : '⏳ جاري الفحص...'}
- دعم العربية: ${results.arabicSupport ? '✅' : '⏳ جاري الفحص...'}`);
  };

  const testArabicRecognition = () => {
    addMessage('system', 'اختبار التعرف على العربية: قل "مرحباً، كيف حالك؟"');
    startListening();
  };

  const testArabicSynthesis = () => {
    const testText = 'مرحباً، أنا Amrikyy. هذا اختبار للصوت العربي.';
    addMessage('system', `اختبار تشغيل الصوت العربي: "${testText}"`);
    speak(testText);
  };

  const testEnglishRecognition = () => {
    updatePreferences({ language: 'en-US' });
    addMessage('system', 'English recognition test: Say "Hello, how are you?"');
    startListening();
  };

  const testEnglishSynthesis = () => {
    const testText = 'Hello, I am Amrikyy. This is an English voice test.';
    addMessage('system', `English synthesis test: "${testText}"`);
    speak(testText);
  };

  const clearMessages = () => {
    setMessages([{
      id: 0,
      role: 'system',
      text: 'تم مسح السجل.',
      timestamp: new Date()
    }]);
    clearTranscript();
  };

  return (
    <div className="voice-test-page">
      <div className="test-header">
        <h1>🎤 اختبار الواجهة الصوتية</h1>
        <p>صفحة اختبار شاملة لجميع ميزات الصوت</p>
      </div>

      <div className="test-container">
        {/* Left Panel: Voice Control */}
        <div className="test-panel voice-panel">
          <h2>🎙️ التحكم الصوتي</h2>
          
          {/* Main Voice Control */}
          <div className="voice-control-wrapper">
            <VoiceControl
              language={preferences.language}
              autoSpeak={preferences.autoSpeak}
              onTranscript={(text) => addMessage('user', text)}
              onResponse={(text) => addMessage('ai', text)}
            />
          </div>

          {/* Status Indicators */}
          <div className="status-indicators">
            <div className={`status-item ${isSupported ? 'supported' : 'not-supported'}`}>
              {isSupported ? '✅' : '❌'} دعم المتصفح
            </div>
            <div className={`status-item ${isListening ? 'active' : ''}`}>
              {isListening ? '🎤' : '⏸️'} الاستماع
            </div>
            <div className={`status-item ${isSpeaking ? 'active' : ''}`}>
              {isSpeaking ? '🔊' : '🔇'} التشغيل
            </div>
          </div>

          {/* Current Transcript */}
          {(transcript || interimTranscript) && (
            <div className="current-transcript">
              <h3>النص الحالي:</h3>
              {transcript && <p className="final">{transcript}</p>}
              {interimTranscript && <p className="interim">{interimTranscript}</p>}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="error-display">
              <p>⚠️ {error}</p>
              <button onClick={clearError}>مسح الخطأ</button>
            </div>
          )}

          {/* Voice Settings */}
          <VoiceSettings
            preferences={preferences}
            onChange={updatePreferences}
          />
        </div>

        {/* Right Panel: Testing Tools */}
        <div className="test-panel tools-panel">
          <h2>🧪 أدوات الاختبار</h2>

          {/* Diagnostics */}
          <div className="test-section">
            <h3>الفحص التشخيصي</h3>
            <button onClick={runDiagnostics} className="test-button">
              🔍 تشغيل الفحص
            </button>
            
            {testResults.speechRecognition !== null && (
              <div className="diagnostic-results">
                <div className={`result-item ${testResults.speechRecognition ? 'pass' : 'fail'}`}>
                  {testResults.speechRecognition ? '✅' : '❌'} التعرف على الصوت
                </div>
                <div className={`result-item ${testResults.speechSynthesis ? 'pass' : 'fail'}`}>
                  {testResults.speechSynthesis ? '✅' : '❌'} تشغيل الصوت
                </div>
                <div className={`result-item ${testResults.microphone ? 'pass' : testResults.microphone === false ? 'fail' : 'pending'}`}>
                  {testResults.microphone ? '✅' : testResults.microphone === false ? '❌' : '⏳'} الميكروفون
                </div>
                <div className={`result-item ${testResults.arabicSupport ? 'pass' : testResults.arabicSupport === false ? 'fail' : 'pending'}`}>
                  {testResults.arabicSupport ? '✅' : testResults.arabicSupport === false ? '❌' : '⏳'} دعم العربية
                </div>
              </div>
            )}
          </div>

          {/* Arabic Tests */}
          <div className="test-section">
            <h3>اختبارات العربية</h3>
            <button onClick={testArabicRecognition} className="test-button">
              🎤 اختبار التعرف على العربية
            </button>
            <button onClick={testArabicSynthesis} className="test-button">
              🔊 اختبار تشغيل الصوت العربي
            </button>
          </div>

          {/* English Tests */}
          <div className="test-section">
            <h3>English Tests</h3>
            <button onClick={testEnglishRecognition} className="test-button">
              🎤 Test English Recognition
            </button>
            <button onClick={testEnglishSynthesis} className="test-button">
              🔊 Test English Synthesis
            </button>
          </div>

          {/* Quick Actions */}
          <div className="test-section">
            <h3>إجراءات سريعة</h3>
            <button 
              onClick={isListening ? stopListening : startListening}
              className="test-button"
            >
              {isListening ? '⏹️ إيقاف الاستماع' : '▶️ بدء الاستماع'}
            </button>
            <button 
              onClick={isSpeaking ? stopSpeaking : () => speak('مرحباً')}
              className="test-button"
            >
              {isSpeaking ? '⏹️ إيقاف التشغيل' : '▶️ تشغيل تجريبي'}
            </button>
            <button onClick={clearMessages} className="test-button">
              🗑️ مسح السجل
            </button>
          </div>

          {/* Browser Info */}
          <div className="test-section">
            <h3>معلومات المتصفح</h3>
            <div className="browser-info">
              <p><strong>المتصفح:</strong> {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                                            navigator.userAgent.includes('Firefox') ? 'Firefox' :
                                            navigator.userAgent.includes('Safari') ? 'Safari' :
                                            navigator.userAgent.includes('Edge') ? 'Edge' : 'Unknown'}</p>
              <p><strong>اللغة:</strong> {navigator.language}</p>
              <p><strong>المنصة:</strong> {navigator.platform}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Log */}
      <div className="messages-panel">
        <h2>📝 سجل المحادثات</h2>
        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message message-${msg.role}`}>
              <div className="message-header">
                <span className="message-role">
                  {msg.role === 'user' ? '👤 أنت' : 
                   msg.role === 'ai' ? '🤖 Amrikyy' : 
                   '⚙️ النظام'}
                </span>
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString('ar-EG')}
                </span>
              </div>
              <div className="message-text">{msg.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceTest;
