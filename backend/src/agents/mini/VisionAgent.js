/**
 * Vision Agent - Gemini Vision Integration
 * Specialization: Image analysis and visual intelligence
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../utils/logger');
const axios = require('axios');

class VisionAgent {
  constructor() {
    this.name = 'Vision';
    this.icon = '👁️';
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  /**
   * Execute a task
   */
  async executeTask(task) {
    logger.info(`[VisionAgent] Executing task: ${task.type}`);
    
    try {
      switch (task.type) {
        case 'ANALYZE_IMAGE':
          return await this.analyzeImage(task.imageUrl, task.prompt);
        case 'EXTRACT_TEXT':
          return await this.extractText(task.imageUrl);
        case 'IDENTIFY_LANDMARK':
          return await this.identifyLandmark(task.imageUrl);
        case 'DETECT_OBJECTS':
          return await this.detectObjects(task.imageUrl);
        case 'DESCRIBE_SCENE':
          return await this.describeScene(task.imageUrl);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      logger.error(`[VisionAgent] Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze image with custom prompt
   */
  async analyzeImage(imageUrl, prompt = "Describe this image in detail") {
    const imageData = await this.fetchImageAsBase64(imageUrl);
    
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: 'image/jpeg'
      }
    };

    const result = await this.model.generateContent([prompt, imagePart]);
    const response = result.response.text();

    return {
      success: true,
      description: response,
      confidence: 0.95
    };
  }

  /**
   * Extract text from image (OCR)
   */
  async extractText(imageUrl) {
    const imageData = await this.fetchImageAsBase64(imageUrl);
    
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: 'image/jpeg'
      }
    };

    const prompt = "Extract all text from this image. Return only the text, nothing else.";
    const result = await this.model.generateContent([prompt, imagePart]);
    const text = result.response.text();

    return {
      success: true,
      text: text.trim(),
      language: 'auto-detected'
    };
  }

  /**
   * Identify landmarks in image
   */
  async identifyLandmark(imageUrl) {
    const imageData = await this.fetchImageAsBase64(imageUrl);
    
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: 'image/jpeg'
      }
    };

    const prompt = `Identify any landmarks in this image. 
    If you find a landmark, provide:
    1. Name of the landmark
    2. Location (city, country)
    3. Brief description
    4. Historical significance
    
    If no landmark is found, say "No landmark detected".`;

    const result = await this.model.generateContent([prompt, imagePart]);
    const response = result.response.text();

    return {
      success: true,
      landmark: response,
      confidence: 0.90
    };
  }

  /**
   * Detect objects in image
   */
  async detectObjects(imageUrl) {
    const imageData = await this.fetchImageAsBase64(imageUrl);
    
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: 'image/jpeg'
      }
    };

    const prompt = `List all objects you can see in this image. 
    Format: object name, confidence level (high/medium/low)
    Example: "car, high confidence"`;

    const result = await this.model.generateContent([prompt, imagePart]);
    const response = result.response.text();

    // Parse response into structured format
    const objects = response.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [name, confidence] = line.split(',').map(s => s.trim());
        return { name, confidence: confidence || 'medium' };
      });

    return {
      success: true,
      objects,
      totalCount: objects.length
    };
  }

  /**
   * Describe the scene in the image
   */
  async describeScene(imageUrl) {
    const imageData = await this.fetchImageAsBase64(imageUrl);
    
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: 'image/jpeg'
      }
    };

    const prompt = `Describe this scene in detail. Include:
    1. Setting (indoor/outdoor, location type)
    2. Main subjects
    3. Activities happening
    4. Mood/atmosphere
    5. Notable details`;

    const result = await this.model.generateContent([prompt, imagePart]);
    const description = result.response.text();

    return {
      success: true,
      description,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Fetch image and convert to base64
   */
  async fetchImageAsBase64(imageUrl) {
    try {
      // If already base64, return as is
      if (imageUrl.startsWith('data:image')) {
        return imageUrl.split(',')[1];
      }

      // Fetch image from URL
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      });

      return Buffer.from(response.data).toString('base64');
    } catch (error) {
      logger.error(`[VisionAgent] Error fetching image: ${error.message}`);
      throw new Error('Failed to fetch image');
    }
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      name: this.name,
      icon: this.icon,
      status: this.model ? 'active' : 'inactive',
      capabilities: [
        'ANALYZE_IMAGE',
        'EXTRACT_TEXT',
        'IDENTIFY_LANDMARK',
        'DETECT_OBJECTS',
        'DESCRIBE_SCENE'
      ]
    };
  }
}

module.exports = VisionAgent;
