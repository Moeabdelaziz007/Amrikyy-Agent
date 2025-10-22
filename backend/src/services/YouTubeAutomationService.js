/**
 * YouTube Automation Service - Complete Content Pipeline
 * 
 * Features:
 * - Gemini Pro: Script generation
 * - Google TTS: Voiceover generation
 * - Veo 3: AI video generation (when available)
 * - Imagen 3: Thumbnail generation
 * - Banana.dev: GPU-powered image generation (fallback)
 * - FFmpeg: Video assembly (fallback)
 * - YouTube Data API: Upload & management
 * 
 * Pipeline:
 * 1. Topic ideation (Gemini)
 * 2. Script writing (Gemini Pro)
 * 3. Thumbnail generation (Imagen 3 / Banana.dev)
 * 4. Voiceover (Google TTS)
 * 5. Video generation (Veo 3 / FFmpeg)
 * 6. YouTube upload
 * 7. Analytics tracking
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const textToSpeech = require('@google-cloud/text-to-speech');
const { google } = require('googleapis');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const logger = require('../../utils/logger');

const execAsync = promisify(exec);

class YouTubeAutomationService {
  constructor() {
    // Initialize Gemini
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.geminiFlash = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    this.geminiPro = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    
    // Initialize Google TTS
    this.ttsClient = new textToSpeech.TextToSpeechClient();
    
    // Initialize YouTube API
    this.oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );
    
    if (process.env.YOUTUBE_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
      });
    }
    
    this.youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
    
    // Temp directory for files
    this.tmpDir = path.join(__dirname, '../../../tmp');
    this.ensureTmpDir();
    
    logger.info('🎬 YouTube Automation Service initialized');
  }

  async ensureTmpDir() {
    try {
      await fs.mkdir(this.tmpDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create tmp directory:', error);
    }
  }

  // ============================================================================
  // STEP 1: TOPIC IDEATION
  // ============================================================================

  /**
   * Generate video topic ideas using Gemini
   */
  async generateTopicIdeas(params) {
    const {
      niche = 'travel',
      count = 5,
      language = 'en',
      targetAudience = 'general',
      videoType = 'shorts' // shorts, long-form
    } = params;

    const prompt = `
You are a YouTube content strategist expert.

Generate ${count} high-CTR YouTube ${videoType} video ideas for:
- Niche: ${niche}
- Language: ${language}
- Target Audience: ${targetAudience}

For each idea, provide:
- Title (catchy, SEO-optimized)
- Hook (first 3 seconds)
- Angle (unique perspective)
- Suggested hashtags
- Estimated views potential
- Difficulty (easy/medium/hard)

Return JSON format:
{
  "ideas": [
    {
      "title": "Title here",
      "hook": "Hook here",
      "angle": "Angle here",
      "hashtags": ["#tag1", "#tag2"],
      "viewsPotential": "10K-50K",
      "difficulty": "easy",
      "reasoning": "Why this will work"
    }
  ]
}

Make them viral-worthy and data-driven!
`;

    try {
      const result = await this.geminiFlash.generateContent(prompt);
      const response = result.response.text();
      return this.parseJSON(response);
    } catch (error) {
      logger.error('Topic ideation error:', error);
      throw error;
    }
  }

  // ============================================================================
  // STEP 2: SCRIPT GENERATION
  // ============================================================================

  /**
   * Generate complete video script using Gemini Pro
   */
  async generateScript(params) {
    const {
      title,
      audience = 'general',
      duration = 60, // seconds
      language = 'en',
      tone = 'engaging',
      includeHooks = true
    } = params;

    const prompt = `
You are a professional YouTube scriptwriter.

Create a ${duration}-second ${language} video script for:
Title: "${title}"
Audience: ${audience}
Tone: ${tone}

Script Requirements:
- Hook in first 3 seconds
- Clear structure (intro, main, outro)
- Natural pacing for voiceover
- Visual cues for each scene
- Call-to-action at end

Return JSON format:
{
  "title": "Final title",
  "description": "YouTube description (SEO optimized)",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "scenes": [
    {
      "timestamp": "0:00",
      "duration": 5,
      "narration": "What to say",
      "visualPrompt": "What to show (for AI video generation)",
      "textOverlay": "On-screen text (optional)",
      "musicCue": "Background music mood"
    }
  ],
  "totalDuration": ${duration},
  "callToAction": "CTA text"
}

Make it engaging and optimized for retention!
`;

    try {
      const result = await this.geminiPro.generateContent(prompt);
      const response = result.response.text();
      return this.parseJSON(response);
    } catch (error) {
      logger.error('Script generation error:', error);
      throw error;
    }
  }

  // ============================================================================
  // STEP 3: THUMBNAIL GENERATION
  // ============================================================================

  /**
   * Generate thumbnail using Imagen 3 (primary) or Banana.dev (fallback)
   */
  async generateThumbnail(params) {
    const {
      title,
      style = 'bold and eye-catching',
      text = null,
      useImagen = true
    } = params;

    const prompt = `
Create a YouTube thumbnail for: "${title}"
Style: ${style}
${text ? `Include text: "${text}"` : ''}
Requirements:
- 1280x720 resolution
- Bold, high-contrast colors
- Clear focal point
- Professional quality
- Eye-catching design
`;

    try {
      if (useImagen && process.env.GOOGLE_AI_API_KEY) {
        // Try Imagen 3 first
        return await this.generateWithImagen(prompt);
      } else if (process.env.BANANA_API_KEY) {
        // Fallback to Banana.dev
        return await this.generateWithBanana(prompt);
      } else {
        throw new Error('No image generation service available');
      }
    } catch (error) {
      logger.error('Thumbnail generation error:', error);
      throw error;
    }
  }

  /**
   * Generate image with Imagen 3
   */
  async generateWithImagen(prompt) {
    try {
      // Placeholder for Imagen 3 API
      // When available, use: const imagen = this.genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' });
      
      logger.info('Imagen 3 API not yet available, using placeholder');
      
      return {
        url: `https://placeholder.com/1280x720?text=Thumbnail`,
        base64: null,
        model: 'imagen-3.0',
        generated: false
      };
    } catch (error) {
      logger.error('Imagen 3 error:', error);
      throw error;
    }
  }

  /**
   * Generate image with Banana.dev (SDXL)
   */
  async generateWithBanana(prompt) {
    try {
      const response = await axios.post('https://api.banana.dev/start/v4/', {
        apiKey: process.env.BANANA_API_KEY,
        modelKey: process.env.BANANA_MODEL_KEY_SDXL,
        modelInputs: {
          prompt,
          width: 1280,
          height: 720,
          steps: 30,
          cfg_scale: 7.5
        }
      }, {
        timeout: 120000
      });

      const imageBase64 = response.data?.modelOutputs?.[0]?.image_base64;
      
      if (!imageBase64) {
        throw new Error('No image returned from Banana.dev');
      }

      return {
        url: null,
        base64: `data:image/png;base64,${imageBase64}`,
        model: 'sdxl-banana',
        generated: true
      };
    } catch (error) {
      logger.error('Banana.dev error:', error);
      throw error;
    }
  }

  // ============================================================================
  // STEP 4: VOICEOVER GENERATION
  // ============================================================================

  /**
   * Generate voiceover using Google TTS
   */
  async generateVoiceover(params) {
    const {
      text,
      languageCode = 'en-US',
      voiceName = 'en-US-Neural2-C',
      speakingRate = 1.05,
      pitch = 0
    } = params;

    try {
      const [response] = await this.ttsClient.synthesizeSpeech({
        input: { text },
        voice: {
          languageCode,
          name: voiceName
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate,
          pitch
        }
      });

      const filename = `voice_${Date.now()}.mp3`;
      const filepath = path.join(this.tmpDir, filename);
      
      await fs.writeFile(filepath, response.audioContent, 'binary');
      
      logger.info(`Voiceover generated: ${filepath}`);
      
      return {
        filepath,
        filename,
        duration: await this.getAudioDuration(filepath)
      };
    } catch (error) {
      logger.error('TTS error:', error);
      throw error;
    }
  }

  /**
   * Get audio duration in seconds
   */
  async getAudioDuration(filepath) {
    try {
      const { stdout } = await execAsync(
        `ffprobe -v error -show_entries format=duration -of csv=p=0 "${filepath}"`
      );
      return Math.floor(parseFloat(stdout) || 60);
    } catch (error) {
      logger.error('FFprobe error:', error);
      return 60; // Default fallback
    }
  }

  // ============================================================================
  // STEP 5: VIDEO GENERATION
  // ============================================================================

  /**
   * Generate video using Veo 3 (primary) or FFmpeg slideshow (fallback)
   */
  async generateVideo(params) {
    const {
      script,
      audioPath,
      useVeo = true
    } = params;

    try {
      if (useVeo && process.env.VEO_API_KEY) {
        // Try Veo 3 first
        return await this.generateWithVeo(script, audioPath);
      } else {
        // Fallback to FFmpeg slideshow
        return await this.generateWithFFmpeg(script, audioPath);
      }
    } catch (error) {
      logger.error('Video generation error:', error);
      // Always fallback to FFmpeg
      return await this.generateWithFFmpeg(script, audioPath);
    }
  }

  /**
   * Generate video with Veo 3
   */
  async generateWithVeo(script, audioPath) {
    try {
      // Placeholder for Veo 3 API
      logger.info('Veo 3 API not yet available, falling back to FFmpeg');
      
      return await this.generateWithFFmpeg(script, audioPath);
    } catch (error) {
      logger.error('Veo 3 error:', error);
      throw error;
    }
  }

  /**
   * Generate video with FFmpeg (slideshow + audio)
   */
  async generateWithFFmpeg(script, audioPath) {
    try {
      const scenes = script.scenes || [];
      const audioDuration = await this.getAudioDuration(audioPath);
      const durationPerScene = Math.max(3, Math.floor(audioDuration / scenes.length));

      // Create text overlays for each scene
      const videoSegments = [];
      
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const segmentPath = await this.createSceneVideo(scene, durationPerScene, i);
        videoSegments.push(segmentPath);
      }

      // Concatenate all segments
      const concatFile = path.join(this.tmpDir, `concat_${Date.now()}.txt`);
      const concatContent = videoSegments.map(p => `file '${p}'`).join('\n');
      await fs.writeFile(concatFile, concatContent);

      const videoOnly = path.join(this.tmpDir, `video_only_${Date.now()}.mp4`);
      
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(concatFile)
          .inputOptions(['-f', 'concat', '-safe', '0'])
          .outputOptions(['-c', 'copy'])
          .output(videoOnly)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      // Merge with audio
      const finalVideo = path.join(this.tmpDir, `final_${Date.now()}.mp4`);
      
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(videoOnly)
          .input(audioPath)
          .outputOptions([
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-shortest'
          ])
          .output(finalVideo)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      logger.info(`Video generated: ${finalVideo}`);
      
      return {
        filepath: finalVideo,
        duration: audioDuration,
        method: 'ffmpeg'
      };
    } catch (error) {
      logger.error('FFmpeg video generation error:', error);
      throw error;
    }
  }

  /**
   * Create individual scene video
   */
  async createSceneVideo(scene, duration, index) {
    const outputPath = path.join(this.tmpDir, `scene_${index}_${Date.now()}.mp4`);
    
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(`color=c=black:s=1280x720:d=${duration}`)
        .inputFormat('lavfi')
        .outputOptions([
          '-vf', `drawtext=text='${this.escapeText(scene.narration)}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2`,
          '-pix_fmt', 'yuv420p',
          '-r', '30'
        ])
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  /**
   * Escape text for FFmpeg
   */
  escapeText(text) {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/:/g, '\\:')
      .substring(0, 100); // Limit length
  }

  // ============================================================================
  // STEP 6: YOUTUBE UPLOAD
  // ============================================================================

  /**
   * Upload video to YouTube
   */
  async uploadToYouTube(params) {
    const {
      filepath,
      title,
      description,
      tags = [],
      privacyStatus = 'public',
      thumbnailBase64 = null,
      categoryId = '22', // People & Blogs
      madeForKids = false
    } = params;

    try {
      const fileSize = (await fs.stat(filepath)).size;
      
      logger.info(`Uploading video to YouTube: ${title} (${fileSize} bytes)`);

      const response = await this.youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description,
            tags,
            categoryId
          },
          status: {
            privacyStatus,
            selfDeclaredMadeForKids: madeForKids
          }
        },
        media: {
          body: require('fs').createReadStream(filepath)
        }
      });

      const videoId = response.data.id;
      
      logger.info(`Video uploaded successfully: ${videoId}`);

      // Upload thumbnail if provided
      if (thumbnailBase64) {
        await this.uploadThumbnail(videoId, thumbnailBase64);
      }

      return {
        success: true,
        videoId,
        url: `https://youtube.com/watch?v=${videoId}`,
        title,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('YouTube upload error:', error);
      throw error;
    }
  }

  /**
   * Upload custom thumbnail
   */
  async uploadThumbnail(videoId, base64Data) {
    try {
      const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
      
      await this.youtube.thumbnails.set({
        videoId,
        media: {
          body: buffer
        }
      });

      logger.info(`Thumbnail uploaded for video: ${videoId}`);
    } catch (error) {
      logger.error('Thumbnail upload error:', error);
      // Don't throw - thumbnail is optional
    }
  }

  // ============================================================================
  // STEP 7: ANALYTICS
  // ============================================================================

  /**
   * Get video analytics
   */
  async getVideoAnalytics(videoId) {
    try {
      const response = await this.youtube.videos.list({
        part: ['statistics', 'contentDetails'],
        id: [videoId]
      });

      const video = response.data.items[0];
      
      if (!video) {
        throw new Error(`Video not found: ${videoId}`);
      }

      return {
        videoId,
        views: parseInt(video.statistics.viewCount) || 0,
        likes: parseInt(video.statistics.likeCount) || 0,
        comments: parseInt(video.statistics.commentCount) || 0,
        duration: video.contentDetails.duration,
        fetchedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Analytics fetch error:', error);
      throw error;
    }
  }

  // ============================================================================
  // COMPLETE PIPELINE
  // ============================================================================

  /**
   * Run complete automation pipeline
   */
  async runCompletePipeline(params) {
    const {
      niche = 'travel',
      videoType = 'shorts',
      language = 'en',
      autoUpload = false
    } = params;

    try {
      logger.info('🚀 Starting complete YouTube automation pipeline');

      // Step 1: Generate topic ideas
      logger.info('Step 1: Generating topic ideas...');
      const ideas = await this.generateTopicIdeas({ niche, count: 1, videoType, language });
      const selectedIdea = ideas.ideas[0];
      
      // Step 2: Generate script
      logger.info('Step 2: Generating script...');
      const script = await this.generateScript({
        title: selectedIdea.title,
        duration: videoType === 'shorts' ? 60 : 300,
        language
      });

      // Step 3: Generate thumbnail
      logger.info('Step 3: Generating thumbnail...');
      const thumbnail = await this.generateThumbnail({
        title: script.title
      });

      // Step 4: Generate voiceover
      logger.info('Step 4: Generating voiceover...');
      const narration = script.scenes.map(s => s.narration).join(' ');
      const voiceover = await this.generateVoiceover({
        text: narration,
        languageCode: language === 'ar' ? 'ar-XA' : 'en-US'
      });

      // Step 5: Generate video
      logger.info('Step 5: Generating video...');
      const video = await this.generateVideo({
        script,
        audioPath: voiceover.filepath
      });

      // Step 6: Upload to YouTube (if enabled)
      let uploadResult = null;
      if (autoUpload) {
        logger.info('Step 6: Uploading to YouTube...');
        uploadResult = await this.uploadToYouTube({
          filepath: video.filepath,
          title: script.title,
          description: script.description,
          tags: script.hashtags,
          thumbnailBase64: thumbnail.base64
        });
      }

      logger.info('✅ Pipeline completed successfully!');

      return {
        success: true,
        idea: selectedIdea,
        script,
        thumbnail,
        voiceover,
        video,
        upload: uploadResult,
        completedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Pipeline error:', error);
      throw error;
    }
  }

  /**
   * Parse JSON from Gemini response
   */
  parseJSON(response) {
    try {
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(response);
    } catch (error) {
      logger.warn('Failed to parse JSON, returning raw response');
      return { raw: response };
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      service: 'YouTubeAutomationService',
      features: {
        gemini: !!process.env.GEMINI_API_KEY,
        tts: true,
        youtube: !!process.env.YOUTUBE_REFRESH_TOKEN,
        imagen: !!process.env.GOOGLE_AI_API_KEY,
        banana: !!process.env.BANANA_API_KEY,
        veo: !!process.env.VEO_API_KEY,
        ffmpeg: true
      },
      tmpDir: this.tmpDir
    };
  }
}

module.exports = new YouTubeAutomationService();
