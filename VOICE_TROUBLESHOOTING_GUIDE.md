# 🎤 Voice System Troubleshooting Guide

**Date**: October 22, 2025  
**Status**: ✅ Complete Implementation  
**Author**: CURSERO AI

---

## 🎯 Overview

This guide provides comprehensive troubleshooting steps for the voice functionality in the Amrikyy Travel Agent platform. The voice system includes speech-to-text, text-to-speech, and voice command processing.

## 🚀 Voice System Components

### 1. **Frontend Voice Hook** (`/frontend/src/hooks/useVoice.ts`)
- Web Speech API integration
- Speech recognition and synthesis
- Multi-language support
- Error handling and fallbacks

### 2. **Voice Interface Component** (`/frontend/src/components/ui/VoiceInterface.tsx`)
- Complete voice UI with controls
- Real-time transcript display
- Voice command processing
- Settings and configuration

### 3. **Backend Voice Service** (`/backend/src/services/VoiceService.js`)
- Google Cloud TTS integration
- Voice command processing
- Audio caching and optimization
- Fallback mechanisms

### 4. **Voice API Routes** (`/backend/routes/voice.js`)
- RESTful API endpoints
- TTS and STT processing
- Voice command handling
- Status and health checks

## 🔧 Common Issues and Solutions

### Issue 1: "Speech recognition not supported in this browser"

**Symptoms:**
- Voice interface shows error message
- Microphone button is disabled
- Console shows "Speech recognition not supported"

**Causes:**
- Browser doesn't support Web Speech API
- Using HTTP instead of HTTPS
- Browser security settings blocking microphone access

**Solutions:**

1. **Check Browser Support:**
```javascript
// Test in browser console
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  console.log('Speech recognition supported');
} else {
  console.log('Speech recognition NOT supported');
}
```

2. **Use HTTPS:**
```bash
# For development
npm run dev -- --https

# For production
# Ensure your domain uses HTTPS
```

3. **Browser Compatibility:**
- ✅ Chrome 25+
- ✅ Safari 14.1+
- ✅ Edge 79+
- ❌ Firefox (limited support)
- ❌ Internet Explorer

### Issue 2: "Microphone permission denied"

**Symptoms:**
- Microphone button doesn't work
- Browser shows permission prompt
- Console shows permission denied error

**Solutions:**

1. **Grant Microphone Permission:**
   - Click the microphone icon in browser address bar
   - Select "Allow" for microphone access
   - Refresh the page

2. **Check Browser Settings:**
   - Chrome: Settings > Privacy and Security > Site Settings > Microphone
   - Safari: Safari > Preferences > Websites > Microphone
   - Edge: Settings > Site permissions > Microphone

3. **Reset Permissions:**
```javascript
// Reset microphone permission (run in console)
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(() => console.log('Microphone access granted'))
  .catch(err => console.log('Microphone access denied:', err));
```

### Issue 3: "No speech detected" or poor recognition

**Symptoms:**
- Speech recognition starts but doesn't detect speech
- Inaccurate transcriptions
- Recognition stops immediately

**Solutions:**

1. **Check Microphone Quality:**
   - Use a good quality microphone
   - Reduce background noise
   - Speak clearly and at normal volume

2. **Adjust Language Settings:**
```typescript
// Set correct language
const { setLanguage } = useVoice();
setLanguage('en-US'); // or 'ar-SA' for Arabic
```

3. **Test Microphone:**
```javascript
// Test microphone in browser console
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('Microphone working');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.log('Microphone error:', err));
```

### Issue 4: Text-to-Speech not working

**Symptoms:**
- No audio output when using speak function
- Console shows synthesis errors
- Voice selection not working

**Solutions:**

1. **Check Browser Support:**
```javascript
// Test speech synthesis
if ('speechSynthesis' in window) {
  console.log('Speech synthesis supported');
  const utterance = new SpeechSynthesisUtterance('Test');
  speechSynthesis.speak(utterance);
} else {
  console.log('Speech synthesis NOT supported');
}
```

2. **Check Voice Selection:**
```typescript
// Ensure voice is selected
const { voices, selectedVoice, setVoice } = useVoice();

// Wait for voices to load
useEffect(() => {
  if (voices.length > 0 && !selectedVoice) {
    setVoice(voices[0]);
  }
}, [voices, selectedVoice, setVoice]);
```

3. **Test with Different Voices:**
```javascript
// Test all available voices
speechSynthesis.getVoices().forEach((voice, index) => {
  console.log(`${index}: ${voice.name} (${voice.lang})`);
});
```

### Issue 5: Voice commands not processing

**Symptoms:**
- Speech is recognized but commands aren't processed
- Backend API calls failing
- No response to voice commands

**Solutions:**

1. **Check Backend Connection:**
```bash
# Test voice API endpoint
curl -X POST http://localhost:5000/api/voice/command \
  -H "Content-Type: application/json" \
  -d '{"transcript": "book flight", "language": "en"}'
```

2. **Check Network Requests:**
   - Open browser DevTools > Network tab
   - Look for failed requests to `/api/voice/*`
   - Check for CORS errors

3. **Verify Backend Service:**
```bash
# Check if voice service is running
curl http://localhost:5000/api/voice/status
```

### Issue 6: Google TTS not working

**Symptoms:**
- Backend TTS errors
- "Google TTS not configured" warnings
- Audio generation fails

**Solutions:**

1. **Set up Google Cloud Credentials:**
```bash
# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"

# Or add to .env file
GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

2. **Enable TTS API:**
   - Go to Google Cloud Console
   - Enable Cloud Text-to-Speech API
   - Create service account and download key

3. **Test TTS Service:**
```bash
# Test TTS endpoint
curl -X POST http://localhost:5000/api/voice/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "languageCode": "en-US"}'
```

## 🧪 Testing Voice Functionality

### 1. **Voice Test Page**
Navigate to `/voice-test` to access the comprehensive voice testing interface.

### 2. **Browser Console Tests**
```javascript
// Test speech recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.onresult = (event) => console.log(event.results[0][0].transcript);
recognition.start();

// Test speech synthesis
const utterance = new SpeechSynthesisUtterance('Hello world');
speechSynthesis.speak(utterance);
```

### 3. **API Testing**
```bash
# Test voice status
curl http://localhost:5000/api/voice/status

# Test TTS
curl -X POST http://localhost:5000/api/voice/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Test speech", "languageCode": "en-US"}'

# Test voice command
curl -X POST http://localhost:5000/api/voice/command \
  -H "Content-Type: application/json" \
  -d '{"transcript": "book flight", "language": "en"}'
```

## 🔍 Debugging Steps

### 1. **Check Browser Console**
Look for errors related to:
- Speech recognition
- Microphone access
- Network requests
- CORS issues

### 2. **Check Network Tab**
Verify that:
- Voice API calls are being made
- Responses are successful
- No CORS errors

### 3. **Check Backend Logs**
```bash
# Check backend logs
cd backend
npm run dev

# Look for voice-related errors
```

### 4. **Test Individual Components**
```typescript
// Test voice hook
const { isSupported, error, voices } = useVoice();
console.log('Supported:', isSupported);
console.log('Error:', error);
console.log('Voices:', voices);
```

## 🛠️ Configuration

### Frontend Configuration
```typescript
// Voice hook configuration
const voiceConfig = {
  language: 'en-US',        // or 'ar-SA' for Arabic
  continuous: false,        // continuous listening
  interimResults: true,     // show interim results
  maxAlternatives: 1,       // number of alternatives
  timeout: 10000           // timeout in milliseconds
};
```

### Backend Configuration
```bash
# Environment variables
GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
GOOGLE_TTS_ENABLED=true
GOOGLE_TTS_LANGUAGE="en-US"
GOOGLE_TTS_VOICE="en-US-Neural2-C"
```

## 📱 Mobile Considerations

### iOS Safari
- Requires user interaction to start speech recognition
- Limited voice selection
- May have audio playback restrictions

### Android Chrome
- Generally good support
- May require HTTPS
- Check microphone permissions

## 🔒 Security Considerations

### HTTPS Requirement
- Speech recognition requires HTTPS in production
- Use Let's Encrypt or similar for SSL certificates

### Privacy
- Voice data is processed locally (browser) and on server
- No voice data is stored permanently
- Consider GDPR compliance for EU users

## 📊 Performance Optimization

### Caching
```javascript
// Voice service uses audio caching
const voiceService = new VoiceService();
voiceService.clearCache(); // Clear cache if needed
```

### Error Handling
```typescript
// Implement proper error handling
const { error, onError } = useVoice();

useEffect(() => {
  if (error) {
    // Handle error appropriately
    console.error('Voice error:', error);
  }
}, [error]);
```

## 🆘 Getting Help

### Common Error Messages

1. **"Speech recognition not supported"**
   - Use supported browser
   - Enable HTTPS

2. **"Microphone permission denied"**
   - Grant microphone permission
   - Check browser settings

3. **"No speech detected"**
   - Check microphone quality
   - Reduce background noise
   - Speak clearly

4. **"TTS error"**
   - Check Google Cloud credentials
   - Verify TTS API is enabled

### Support Resources

- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Google Cloud TTS Documentation](https://cloud.google.com/text-to-speech/docs)
- [Browser Compatibility](https://caniuse.com/speech-recognition)

## 🎉 Success Indicators

When voice functionality is working correctly, you should see:

- ✅ Microphone button responds to clicks
- ✅ Speech is transcribed accurately
- ✅ Text is spoken clearly
- ✅ Voice commands are processed
- ✅ No console errors
- ✅ Smooth user experience

---

**Built with ❤️ by CURSERO AI**  
**Powered by Web Speech API and Google Cloud TTS**

🎤 **Your voice system is now working perfectly!**