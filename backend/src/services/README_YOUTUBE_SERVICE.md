# YouTubeAutomationService - Technical Documentation

## Overview

Complete YouTube content automation service that generates, produces, and uploads videos automatically using Google's AI ecosystem.

## Architecture

```
YouTubeAutomationService
├── Gemini Pro 2.5 (Script Generation)
├── Google Cloud TTS (Voiceover)
├── Veo 3 (Video Generation) + FFmpeg Fallback
├── Imagen 3 (Thumbnails) + Banana.dev Fallback
└── YouTube Data API v3 (Upload & Analytics)
```

## Class Structure

### Constructor
```javascript
constructor()
```

Initializes all API clients:
- Gemini AI (script generation)
- Google Cloud TTS (voiceover)
- YouTube Data API (upload)
- Banana.dev (thumbnail fallback)

### Core Methods

#### 1. generateTopicIdeas(options)
Generates viral video ideas using Gemini.

**Parameters:**
```javascript
{
  niche: string,           // e.g., 'travel', 'tech', 'cooking'
  count: number,           // Number of ideas (default: 5)
  language: string,        // Language code (default: 'en')
  targetAudience: string,  // e.g., 'millennials', 'gen-z'
  videoType: string        // 'shorts' or 'long-form'
}
```

**Returns:**
```javascript
{
  ideas: [
    {
      title: string,
      hook: string,
      angle: string,
      suggestedHashtags: string[],
      estimatedViews: number,
      difficulty: string
    }
  ]
}
```

**Example:**
```javascript
const ideas = await service.generateTopicIdeas({
  niche: 'travel',
  count: 5,
  videoType: 'shorts'
});
```

---

#### 2. generateScript(options)
Writes complete video script with scenes.

**Parameters:**
```javascript
{
  title: string,
  audience: string,
  duration: number,        // Target duration in seconds
  language: string,
  tone: string            // 'exciting', 'educational', 'casual'
}
```

**Returns:**
```javascript
{
  title: string,
  description: string,
  hashtags: string[],
  scenes: [
    {
      scene: number,
      narration: string,
      visualPrompt: string,
      duration: number
    }
  ],
  totalDuration: number,
  wordCount: number
}
```

**Example:**
```javascript
const script = await service.generateScript({
  title: '5 Hidden Gems in Tokyo',
  duration: 60,
  tone: 'exciting'
});
```

---

#### 3. generateThumbnail(options)
Creates eye-catching thumbnail using Imagen 3 or Banana.dev.

**Parameters:**
```javascript
{
  title: string,
  style: string,          // 'vibrant', 'minimal', 'dramatic'
  text: string,           // Optional overlay text
  useImagen: boolean      // Try Imagen 3 first (default: true)
}
```

**Returns:**
```javascript
{
  thumbnailUrl: string,
  thumbnailBase64: string,
  width: number,
  height: number,
  generatedWith: string   // 'imagen-3' or 'banana-dev'
}
```

**Example:**
```javascript
const thumbnail = await service.generateThumbnail({
  title: '5 Hidden Gems in Tokyo',
  style: 'vibrant',
  text: '5 SECRET SPOTS'
});
```

---

#### 4. generateVoiceover(options)
Creates professional voiceover using Google Cloud TTS.

**Parameters:**
```javascript
{
  text: string,
  languageCode: string,   // e.g., 'en-US', 'ar-XA'
  voiceName: string,      // e.g., 'en-US-Neural2-C'
  speakingRate: number,   // 0.8 - 1.2 (default: 1.0)
  pitch: number          // -20 to +20 (default: 0)
}
```

**Returns:**
```javascript
{
  audioPath: string,      // Path to generated MP3
  duration: number,       // Duration in seconds
  fileSize: number,       // File size in bytes
  format: string         // 'mp3'
}
```

**Example:**
```javascript
const voiceover = await service.generateVoiceover({
  text: script.scenes.map(s => s.narration).join(' '),
  languageCode: 'en-US',
  voiceName: 'en-US-Neural2-C'
});
```

**Available Voices:**
- English: `en-US-Neural2-C` (Female), `en-US-Neural2-D` (Male)
- Arabic: `ar-XA-Standard-A` (Female), `ar-XA-Standard-B` (Male)
- See: https://cloud.google.com/text-to-speech/docs/voices

---

#### 5. generateVideo(options)
Produces final video using Veo 3 or FFmpeg.

**Parameters:**
```javascript
{
  script: object,         // Script from generateScript()
  audioPath: string,      // Path to voiceover MP3
  useVeo: boolean        // Try Veo 3 first (default: true)
}
```

**Returns:**
```javascript
{
  videoPath: string,      // Path to generated MP4
  duration: number,       // Duration in seconds
  resolution: string,     // e.g., '1920x1080'
  fileSize: number,       // File size in bytes
  generatedWith: string  // 'veo-3' or 'ffmpeg'
}
```

**Example:**
```javascript
const video = await service.generateVideo({
  script,
  audioPath: voiceover.audioPath,
  useVeo: true
});
```

**Methods:**
- **Veo 3**: AI-generated video from text prompts (when available)
- **FFmpeg**: Assembles video from images + audio (fallback)

---

#### 6. uploadToYouTube(options)
Uploads video to YouTube with metadata.

**Parameters:**
```javascript
{
  filepath: string,
  title: string,
  description: string,
  tags: string[],
  privacyStatus: string,  // 'public', 'private', 'unlisted'
  thumbnailBase64: string,
  categoryId: string,     // '19' for Travel, '22' for People & Blogs
  madeForKids: boolean
}
```

**Returns:**
```javascript
{
  videoId: string,
  url: string,
  title: string,
  publishedAt: string,
  privacyStatus: string
}
```

**Example:**
```javascript
const upload = await service.uploadToYouTube({
  filepath: video.videoPath,
  title: script.title,
  description: script.description,
  tags: script.hashtags,
  privacyStatus: 'public',
  thumbnailBase64: thumbnail.thumbnailBase64
});
```

**YouTube Categories:**
- `1` - Film & Animation
- `10` - Music
- `19` - Travel & Events
- `22` - People & Blogs
- `23` - Comedy
- `24` - Entertainment
- `25` - News & Politics
- `26` - Howto & Style
- `27` - Education
- `28` - Science & Technology

---

#### 7. getVideoAnalytics(videoId)
Fetches video performance metrics.

**Parameters:**
```javascript
videoId: string  // YouTube video ID
```

**Returns:**
```javascript
{
  videoId: string,
  views: number,
  likes: number,
  comments: number,
  shares: number,
  duration: string,
  fetchedAt: string
}
```

**Example:**
```javascript
const analytics = await service.getVideoAnalytics('dQw4w9WgXcQ');
console.log(`Views: ${analytics.views}`);
```

---

#### 8. runCompletePipeline(options)
Executes entire automation pipeline.

**Parameters:**
```javascript
{
  niche: string,
  videoType: string,
  language: string,
  autoUpload: boolean     // Upload automatically (default: false)
}
```

**Returns:**
```javascript
{
  idea: object,           // Selected video idea
  script: object,         // Generated script
  thumbnail: object,      // Generated thumbnail
  voiceover: object,      // Generated voiceover
  video: object,          // Generated video
  upload: object | null   // Upload result (if autoUpload: true)
}
```

**Example:**
```javascript
const result = await service.runCompletePipeline({
  niche: 'travel',
  videoType: 'shorts',
  language: 'en',
  autoUpload: false  // Review before uploading
});

console.log('Video ready:', result.video.videoPath);
```

---

#### 9. getStatus()
Returns service health and statistics.

**Returns:**
```javascript
{
  service: string,
  version: string,
  status: string,
  components: {
    gemini: string,
    tts: string,
    youtube: string,
    veo: string,
    imagen: string,
    banana: string
  },
  stats: {
    videosGenerated: number,
    videosUploaded: number,
    totalViews: number,
    averageCTR: number,
    successRate: number
  }
}
```

**Example:**
```javascript
const status = service.getStatus();
console.log('Service status:', status.status);
```

---

## Error Handling

All methods throw descriptive errors:

```javascript
try {
  const result = await service.runCompletePipeline(options);
} catch (error) {
  if (error.message.includes('quota')) {
    // Handle API quota exceeded
  } else if (error.message.includes('authentication')) {
    // Handle auth errors
  } else {
    // Handle other errors
  }
}
```

## Environment Variables

Required:
```bash
GEMINI_API_KEY=your_key
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REFRESH_TOKEN=your_refresh_token
```

Optional:
```bash
BANANA_API_KEY=your_key
BANANA_MODEL_KEY_SDXL=your_model_key
VEO_API_KEY=your_key
```

## Performance

**Typical Pipeline Duration:**
- Idea Generation: 2-3 seconds
- Script Writing: 5-8 seconds
- Thumbnail Creation: 8-15 seconds
- Voiceover: 10-20 seconds
- Video Production: 30-120 seconds
- Upload: 20-60 seconds
- **Total: 75-226 seconds (1-4 minutes)**

## Cost Analysis

**Free Tier:**
- Gemini API: FREE (Student Pack)
- Google TTS: FREE (1M chars/month)
- YouTube API: FREE (10K units/day)
- FFmpeg: FREE (open source)
- **Total: $0/month for ~100 videos**

**Paid Services:**
- Banana.dev: $0.03/thumbnail
- Imagen 3: $0.02-0.10/image (when available)
- Veo 3: TBD (when available)
- **Total: $3-10/month for 100 videos**

## Best Practices

### 1. Cache Generated Content
```javascript
const redis = require('redis');
const client = redis.createClient();

async function getCachedScript(title) {
  const cached = await client.get(`script:${title}`);
  if (cached) return JSON.parse(cached);
  
  const script = await service.generateScript({ title });
  await client.setex(`script:${title}`, 3600, JSON.stringify(script));
  return script;
}
```

### 2. Implement Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10
});

app.use('/api/youtube', limiter);
```

### 3. Queue Long-Running Tasks
```javascript
const Queue = require('bull');
const videoQueue = new Queue('video-generation');

videoQueue.process(async (job) => {
  return await service.runCompletePipeline(job.data);
});
```

### 4. Monitor API Usage
```javascript
const usage = {
  gemini: 0,
  tts: 0,
  youtube: 0
};

// Track in each method
usage.gemini += 1;
console.log('API Usage:', usage);
```

## Testing

```javascript
const service = require('./YouTubeAutomationService');

async function test() {
  // Test idea generation
  const ideas = await service.generateTopicIdeas({
    niche: 'travel',
    count: 3
  });
  console.log('✅ Ideas:', ideas.ideas.length);
  
  // Test script generation
  const script = await service.generateScript({
    title: ideas.ideas[0].title,
    duration: 60
  });
  console.log('✅ Script:', script.scenes.length, 'scenes');
  
  // Test complete pipeline
  const result = await service.runCompletePipeline({
    niche: 'travel',
    videoType: 'shorts',
    autoUpload: false
  });
  console.log('✅ Pipeline complete:', result.video.videoPath);
}

test();
```

## Troubleshooting

### FFmpeg Not Found
```bash
# Install FFmpeg
brew install ffmpeg  # Mac
sudo apt install ffmpeg  # Linux

# Verify
ffmpeg -version
```

### YouTube Quota Exceeded
```
Default: 10,000 units/day
Upload cost: 1,600 units
Max uploads: 6/day

Solution: Request quota increase at:
https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas
```

### TTS Authentication Failed
```bash
# Check credentials
echo $GOOGLE_APPLICATION_CREDENTIALS

# Verify service account
gcloud auth list

# Test TTS
gcloud ml speech recognize-long-running --help
```

## Support

- Documentation: See YOUTUBE_AUTOMATION_COMPLETE.md
- Setup Guide: See YOUTUBE_AUTOMATION_SETUP.md
- Issues: GitHub Issues
- Email: amrikyy@gmail.com

---

**Built by Mohamed Hossameldin Abdelaziz**  
**Date: October 22, 2025**  
**Version: 1.0.0**
