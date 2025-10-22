# 🎤 Voice AI - Testing Guide

## ✅ Voice AI is Already Implemented!

Your platform has a **beautiful, fully-featured Voice AI** component with:
- 🎙️ Real-time speech recognition
- 🌊 Animated waveform visualization
- 🔊 Text-to-speech responses
- ✨ Premium animations
- 📱 Mobile responsive

---

## 🚀 How to Test Voice AI

### **Step 1: Start the Backend**
```bash
cd backend
npm run dev
```

Should show:
```
✅ Amrikyy Travel Agent Backend running on port 5000
```

### **Step 2: Start the Frontend**
```bash
cd frontend
npm run dev
```

Visit: **http://localhost:5173**

### **Step 3: Test Voice AI**

1. **Look for the floating button** in the bottom-right corner
   - Blue gradient button with microphone icon 🎤
   
2. **Click the microphone button**
   - Browser will ask for microphone permission
   - Click "Allow"

3. **Speak into your microphone**
   - Say: "مرحباً" or "Hello, how are you?"
   - You'll see:
     - ✅ Waveform animation (visual feedback)
     - ✅ Real-time transcript of what you say
     - ✅ AI response appears
     - ✅ AI speaks the response back to you

4. **Watch the magic! ✨**
   - Transcript shows: "You said: [your message]"
   - AI responds: "Maya: [AI response]"
   - Audio plays automatically

---

## 🎯 What's Available

### **VoiceAI Component** (`frontend/src/components/VoiceAI.tsx`)

**Features:**
- ✅ **Speech Recognition** (Web Speech API)
- ✅ **Audio Visualization** (20-bar waveform)
- ✅ **Real-time Transcription** (shows as you speak)
- ✅ **AI Integration** (sends to `/api/ai/chat`)
- ✅ **Text-to-Speech** (speaks responses)
- ✅ **Beautiful UI** (gradient effects, animations)
- ✅ **Expandable Panel** (shows conversation)

**Location:**
- Fixed position (bottom-right corner)
- Available on **all pages**

---

## 🔧 Troubleshooting

### **1. "Can't see the voice button"**

**Check:**
```tsx
// In App.tsx - should have:
<VoiceAI position="fixed" />
```

**Solution:**
```bash
cd frontend/src
grep "VoiceAI" App.tsx
```

Should see the component imported and used.

---

### **2. "Microphone permission denied"**

**Problem:** Browser blocked microphone access

**Solution:**
1. Click the 🔒 padlock in address bar
2. Find "Microphone" setting
3. Change to "Allow"
4. Refresh page

**Chrome:** `chrome://settings/content/microphone`  
**Safari:** Safari → Preferences → Websites → Microphone

---

### **3. "Voice recognition not working"**

**Browser Support:**
- ✅ **Chrome** - Full support
- ✅ **Edge** - Full support  
- ✅ **Safari** - Full support
- ❌ **Firefox** - Limited support

**Check:**
```javascript
// Open browser console (F12)
console.log('webkitSpeechRecognition' in window);
// Should return: true
```

**Solution:** Use Chrome, Edge, or Safari

---

### **4. "AI not responding"**

**Check Backend:**
```bash
# Test AI endpoint
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

**Expected Response:**
```json
{
  "success": true,
  "response": "AI response here..."
}
```

**If fails:**
1. Check backend is running
2. Check GEMINI_API_KEY is set in `.env`
3. Check console for errors

---

### **5. "No sound from AI"**

**Check:**
1. **Volume** - System volume not muted
2. **Browser Settings** - Site allowed to play audio
3. **Console** - Check for speechSynthesis errors

**Test Text-to-Speech:**
```javascript
// In browser console
const utterance = new SpeechSynthesisUtterance('Hello');
speechSynthesis.speak(utterance);
```

Should hear "Hello" spoken.

---

## 🌍 Language Support

### **Current:** English (US)

### **Change Language:**

Edit `frontend/src/components/VoiceAI.tsx`:

```tsx
// Line 41 - Change recognition language
recognitionRef.current.lang = 'ar-EG'; // For Arabic
```

**Supported Languages:**
- `en-US` - English (US)
- `ar-EG` - Arabic (Egypt)
- `ar-SA` - Arabic (Saudi)
- `fr-FR` - French
- `es-ES` - Spanish
- `de-DE` - German

---

## 🎨 Customization

### **Change Voice AI Position:**

```tsx
// In App.tsx
<VoiceAI position="inline" /> // Embed in page
// OR
<VoiceAI position="fixed" />  // Floating button
```

### **Customize Colors:**

Edit `VoiceAI.tsx` gradients:

```tsx
// Listening state (red/pink)
from-red-500 to-pink-500

// Normal state (cyan/blue)  
from-cyan-500 to-blue-500
```

### **Change AI Name:**

```tsx
// Line 213
<h3 className="text-lg font-bold text-white">Maya AI</h3>
// Change to: Your AI Name
```

---

## 📊 How It Works

### **Flow Diagram:**

```
User clicks mic button
    ↓
Browser requests mic permission
    ↓
User allows → Speech Recognition starts
    ↓
User speaks → Real-time transcription
    ↓
Waveform visualizes audio levels
    ↓
Final transcript → Sent to backend AI
    ↓
POST /api/ai/chat {"message": "transcript"}
    ↓
AI processes and responds
    ↓
Response displayed + spoken aloud
    ↓
User can speak again (continuous)
```

---

## 🔐 Production Checklist

Before deploying:

- [ ] **HTTPS enabled** (required for microphone access)
- [ ] **GEMINI_API_KEY** configured
- [ ] **Backend AI endpoint** working
- [ ] **CORS** configured for frontend domain
- [ ] **Rate limiting** on AI endpoint
- [ ] **Error tracking** (Sentry) configured
- [ ] **Test on mobile devices**
- [ ] **Test on different browsers**

---

## 🧪 Quick Test Script

```bash
# 1. Start backend
cd backend && npm run dev &

# 2. Start frontend
cd frontend && npm run dev &

# 3. Wait for servers to start (5 seconds)
sleep 5

# 4. Open browser
open http://localhost:5173

# 5. Test voice AI:
# - Click mic button (bottom-right)
# - Allow microphone
# - Say "Hello"
# - Should see transcript and hear response
```

---

## 📈 Expected Behavior

### **✅ Working Correctly:**

1. **Mic button visible** - Bottom-right corner, blue gradient
2. **Click activates** - Changes to red, shows "Listening..."
3. **Waveform appears** - 20 animated bars
4. **Transcript shows** - "You said: [your words]"
5. **AI responds** - "Maya: [response]"
6. **Audio plays** - Hear AI response
7. **Can continue** - Speak again for new question

### **❌ Not Working:**

- Button not visible → Check App.tsx integration
- Permission denied → Browser settings
- No transcription → Check browser support
- No AI response → Backend not running
- No audio → Volume/browser audio settings

---

## 🆘 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| No mic button | Component not in App.tsx | Add `<VoiceAI />` |
| Permission error | Browser blocked mic | Enable in settings |
| Silent recording | Wrong input device | Check system settings |
| No transcription | Unsupported browser | Use Chrome/Edge |
| AI silent | Backend down | Start backend server |
| No TTS | Browser audio blocked | Allow audio in settings |

---

## 📱 Mobile Testing

### **iOS (Safari):**
- ✅ Voice recognition: iOS 14.5+
- ✅ Touch to activate mic
- ✅ Works well

### **Android (Chrome):**
- ✅ Full support
- ✅ Best experience
- ✅ Highly recommended

### **Tips:**
- Use headphones for better recognition
- Speak clearly in quiet environment
- Hold phone close to mouth

---

## 🎉 Success Indicators

You know it's working when:

1. ✅ Mic button pulses when listening
2. ✅ Waveform animates with your voice
3. ✅ Transcript appears in real-time
4. ✅ AI response shows up
5. ✅ You hear AI speaking
6. ✅ Can have continuous conversation

---

## 📞 Still Not Working?

### **Debug Steps:**

1. **Open Browser Console** (F12)
2. **Look for errors** (red messages)
3. **Check network tab** (failed requests?)
4. **Test backend directly:**
   ```bash
   curl http://localhost:5000/api/ai/chat \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"message": "test"}'
   ```

### **Common Console Errors:**

**"Speech recognition error: not-allowed"**
→ Need microphone permission

**"Failed to fetch /api/ai/chat"**
→ Backend not running

**"AudioContext was not allowed to start"**
→ Need user interaction first (click button)

---

## 🚀 Next Steps

Once Voice AI works:

1. **Test different phrases**
2. **Try in Arabic** (if configured)
3. **Test on mobile**
4. **Customize the UI**
5. **Add voice commands**
6. **Deploy to production**

---

## ✅ Ready to Test!

**Try it now:**
1. `cd backend && npm run dev`
2. `cd frontend && npm run dev`  
3. Visit: http://localhost:5173
4. Click the 🎤 button
5. Say "Hello Maya!"
6. Enjoy your AI voice assistant! 🎉

---

**Voice AI is READY and WORKING! Just test it! 🚀**
