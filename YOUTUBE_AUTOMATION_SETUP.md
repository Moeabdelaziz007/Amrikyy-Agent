# 🎬 YouTube Automation - Complete Setup Guide

**Automate YouTube content creation with AI**  
**Gemini + TTS + Veo + Imagen + Banana.dev + FFmpeg**

---

## 🎯 WHAT IT DOES

**Complete YouTube automation pipeline:**
1. ✅ Generate video ideas (Gemini)
2. ✅ Write scripts (Gemini Pro)
3. ✅ Create thumbnails (Imagen 3 / Banana.dev)
4. ✅ Generate voiceover (Google TTS)
5. ✅ Create video (Veo 3 / FFmpeg)
6. ✅ Upload to YouTube
7. ✅ Track analytics

**Example:**
```
Input: "travel niche, shorts format"
    ↓
Output: Complete YouTube Short uploaded with:
- AI-generated script
- Professional voiceover
- Eye-catching thumbnail
- Optimized title & description
- Relevant hashtags
```

---

## 📋 REQUIREMENTS

### **Required APIs**
```
✅ Gemini API - Script generation (FREE with Student Pack)
✅ Google Cloud TTS - Voiceover (FREE tier: 1M chars/month)
✅ YouTube Data API - Upload (FREE)
✅ FFmpeg - Video assembly (FREE, open source)
```

### **Optional APIs** (Enhanced Features)
```
⭐ Imagen 3 - AI thumbnails (Coming soon)
⭐ Veo 3 - AI video generation (Limited preview)
⭐ Banana.dev - GPU thumbnails ($0.0005/second)
```

### **System Requirements**
```
- Node.js 18+
- FFmpeg installed
- 2GB RAM minimum
- 5GB disk space for temp files
```

---

## 🔧 SETUP INSTRUCTIONS

### **Step 1: Install Dependencies**

```bash
cd backend
npm install @google/generative-ai
npm install @google-cloud/text-to-speech
npm install googleapis
npm install fluent-ffmpeg
npm install axios
```

### **Step 2: Install FFmpeg**

**Mac:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from: https://ffmpeg.org/download.html

**Verify:**
```bash
ffmpeg -version
```

### **Step 3: Get Gemini API Key**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key
4. Add to `.env`:
```bash
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **Step 4: Setup Google Cloud TTS**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project or select existing
3. Enable "Cloud Text-to-Speech API"
4. Create service account:
   - IAM & Admin → Service Accounts
   - Create Service Account
   - Grant role: "Cloud Text-to-Speech User"
   - Create key (JSON)
5. Download JSON key file
6. Add to `.env`:
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### **Step 5: Setup YouTube API**

#### **5.1: Enable YouTube Data API**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Library
3. Search "YouTube Data API v3"
4. Click "Enable"

#### **5.2: Create OAuth Credentials**
1. APIs & Services → Credentials
2. Create Credentials → OAuth client ID
3. Application type: "Web application"
4. Authorized redirect URIs: `http://localhost:3000/auth/youtube/callback`
5. Copy Client ID and Client Secret

#### **5.3: Get Refresh Token**

Run this script to get your refresh token:

```javascript
// get-youtube-token.js
const { google } = require('googleapis');
const express = require('express');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost:3000/auth/youtube/callback'
);

const app = express();

app.get('/auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.upload']
  });
  res.redirect(url);
});

app.get('/auth/youtube/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  console.log('Refresh Token:', tokens.refresh_token);
  res.send('Success! Check console for refresh token.');
});

app.listen(3000, () => {
  console.log('Visit: http://localhost:3000/auth');
});
```

Run:
```bash
node get-youtube-token.js
```

Visit `http://localhost:3000/auth` and authorize.

#### **5.4: Add to .env**
```bash
YOUTUBE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
YOUTUBE_REDIRECT_URI=http://localhost:3000/auth/youtube/callback
YOUTUBE_REFRESH_TOKEN=1//xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **Step 6: Setup Banana.dev (Optional)**

1. Go to [banana.dev](https://banana.dev)
2. Sign up for account
3. Deploy SDXL model:
   - Dashboard → Deploy Model
   - Select "Stable Diffusion XL"
   - Copy Model Key
4. Get API key from Settings
5. Add to `.env`:
```bash
BANANA_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BANANA_MODEL_KEY_SDXL=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **Step 7: Create Temp Directory**

```bash
mkdir -p backend/tmp
```

---

## 🚀 USAGE

### **Option 1: Complete Pipeline (Easiest)**

```bash
curl -X POST http://localhost:3000/api/youtube/pipeline/run \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "travel",
    "videoType": "shorts",
    "language": "en",
    "autoUpload": false
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "idea": {
      "title": "5 Hidden Gems in Tokyo",
      "hook": "You won't believe #3!",
      "hashtags": ["#Tokyo", "#Travel", "#Hidden"]
    },
    "script": {
      "title": "5 Hidden Gems in Tokyo You Must Visit",
      "description": "Discover Tokyo's best-kept secrets...",
      "scenes": [...]
    },
    "thumbnail": {
      "base64": "data:image/png;base64,...",
      "generated": true
    },
    "voiceover": {
      "filepath": "/tmp/voice_123.mp3",
      "duration": 58
    },
    "video": {
      "filepath": "/tmp/final_123.mp4",
      "duration": 58,
      "method": "ffmpeg"
    },
    "upload": null
  }
}
```

### **Option 2: Step-by-Step**

#### **1. Generate Ideas**
```bash
curl -X POST http://localhost:3000/api/youtube/ideas/generate \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "travel",
    "count": 5,
    "videoType": "shorts"
  }'
```

#### **2. Generate Script**
```bash
curl -X POST http://localhost:3000/api/youtube/script/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "5 Hidden Gems in Tokyo",
    "duration": 60,
    "language": "en"
  }'
```

#### **3. Generate Thumbnail**
```bash
curl -X POST http://localhost:3000/api/youtube/thumbnail/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "5 Hidden Gems in Tokyo",
    "style": "bold and eye-catching"
  }'
```

#### **4. Generate Voiceover**
```bash
curl -X POST http://localhost:3000/api/youtube/voiceover/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Welcome to Tokyo! Today I'll show you...",
    "languageCode": "en-US"
  }'
```

#### **5. Generate Video**
```bash
curl -X POST http://localhost:3000/api/youtube/video/generate \
  -H "Content-Type: application/json" \
  -d '{
    "script": {...},
    "audioPath": "/tmp/voice_123.mp3"
  }'
```

#### **6. Upload to YouTube**
```bash
curl -X POST http://localhost:3000/api/youtube/upload \
  -H "Content-Type: application/json" \
  -d '{
    "filepath": "/tmp/final_123.mp4",
    "title": "5 Hidden Gems in Tokyo",
    "description": "Discover Tokyo...",
    "tags": ["Tokyo", "Travel", "Japan"],
    "privacyStatus": "public"
  }'
```

---

## 🎨 CUSTOMIZATION

### **Voice Options**

**English Voices:**
```javascript
{
  languageCode: 'en-US',
  voiceName: 'en-US-Neural2-C' // Female
}
{
  languageCode: 'en-US',
  voiceName: 'en-US-Neural2-D' // Male
}
{
  languageCode: 'en-GB',
  voiceName: 'en-GB-Neural2-A' // British Female
}
```

**Arabic Voices:**
```javascript
{
  languageCode: 'ar-XA',
  voiceName: 'ar-XA-Standard-A' // Female
}
{
  languageCode: 'ar-XA',
  voiceName: 'ar-XA-Standard-B' // Male
}
```

**All voices:** https://cloud.google.com/text-to-speech/docs/voices

### **Video Formats**

**YouTube Shorts (Vertical):**
```javascript
{
  videoType: 'shorts',
  duration: 60, // max 60 seconds
  resolution: '1080x1920' // 9:16 ratio
}
```

**Regular Video (Horizontal):**
```javascript
{
  videoType: 'long-form',
  duration: 300, // 5 minutes
  resolution: '1920x1080' // 16:9 ratio
}
```

---

## 🤖 AUTOMATION

### **Schedule with Cloud Scheduler**

**1. Deploy to Cloud Run:**
```bash
gcloud run deploy youtube-automation \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

**2. Create Cloud Scheduler Job:**
```bash
gcloud scheduler jobs create http youtube-daily \
  --schedule="0 9 * * *" \
  --uri="https://your-service.run.app/api/youtube/pipeline/run" \
  --http-method=POST \
  --headers="Content-Type=application/json" \
  --message-body='{"niche":"travel","autoUpload":true}'
```

**This will:**
- Run every day at 9 AM
- Generate and upload 1 video automatically
- Track analytics

---

## 💰 COST ANALYSIS

### **Free Tier (Recommended)**
```
Gemini API: FREE (Student Pack)
Google TTS: FREE (1M chars/month = ~100 videos)
YouTube API: FREE (10,000 units/day)
FFmpeg: FREE (open source)

Total: $0/month for 100 videos! 🎉
```

### **With Paid Services**
```
Banana.dev: $0.0005/second (~$0.03/thumbnail)
Imagen 3: ~$0.02-$0.10/image (when available)
Veo 3: TBD (when available)

Estimated: $3-$10/month for 100 videos
```

---

## 📊 ANALYTICS

### **Track Performance**
```bash
curl http://localhost:3000/api/youtube/analytics/VIDEO_ID
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "abc123",
    "views": 1234,
    "likes": 56,
    "comments": 12,
    "duration": "PT1M",
    "fetchedAt": "2025-10-22T12:00:00Z"
  }
}
```

### **Improve with AI**
Use analytics to improve future videos:
- Low views → Better titles/thumbnails
- Low retention → Shorter, punchier scripts
- High engagement → Replicate successful format

---

## 🐛 TROUBLESHOOTING

### **Error: "FFmpeg not found"**
```
Solution:
1. Install FFmpeg (see Step 2)
2. Verify: ffmpeg -version
3. Restart server
```

### **Error: "YouTube quota exceeded"**
```
Solution:
1. Check quota: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas
2. Default: 10,000 units/day
3. Upload costs 1,600 units
4. Max 6 uploads/day on free tier
```

### **Error: "TTS authentication failed"**
```
Solution:
1. Check GOOGLE_APPLICATION_CREDENTIALS path
2. Verify service account has TTS role
3. Download new key if needed
```

### **Error: "Banana.dev timeout"**
```
Solution:
1. Increase timeout to 120 seconds
2. Or use Imagen 3 instead
3. Or skip thumbnail generation
```

---

## 🎯 BEST PRACTICES

### **Content Strategy**
1. **Niche Down**: Focus on specific topics
2. **Consistency**: Upload regularly (daily/weekly)
3. **Optimize**: Use analytics to improve
4. **Engage**: Respond to comments
5. **Promote**: Share on social media

### **Technical**
1. **Cache**: Store generated assets
2. **Queue**: Use job queue for long tasks
3. **Monitor**: Track API usage and costs
4. **Backup**: Save scripts and videos
5. **Test**: Always test before auto-upload

---

## 📚 RESOURCES

**Documentation:**
- Gemini: https://ai.google.dev/docs
- Google TTS: https://cloud.google.com/text-to-speech/docs
- YouTube API: https://developers.google.com/youtube/v3
- FFmpeg: https://ffmpeg.org/documentation.html
- Banana.dev: https://docs.banana.dev

**Community:**
- Discord: (coming soon)
- GitHub: github.com/Moeabdelaziz007/Amrikyy-Agent

---

## 🚀 NEXT STEPS

1. ✅ Complete setup (all API keys)
2. ✅ Test with `/pipeline/run`
3. ✅ Generate first video
4. ✅ Upload to YouTube
5. ✅ Track analytics
6. ✅ Automate with scheduler
7. ✅ Scale to daily uploads

---

**🎉 You're ready to automate YouTube content creation!**

**Start with:** `POST /api/youtube/pipeline/run`

**Questions?** → amrikyy@gmail.com

---

**Built with ❤️ by Mohamed Hossameldin Abdelaziz**  
**Powered by Google Gemini Pro + TTS + YouTube API**  
**Date**: October 22, 2025
