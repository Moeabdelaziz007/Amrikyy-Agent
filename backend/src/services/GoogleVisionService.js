const { ImageAnnotatorClient } = require('@google-cloud/vision');

/**
 * A service to interact with the Google Cloud Vision API.
 * Make sure your environment is authenticated by setting the
 * GOOGLE_APPLICATION_CREDENTIALS environment variable.
 *
 * @see https://cloud.google.com/vision/docs/setup
 */
class GoogleVisionService {
  constructor() {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn(
        'GOOGLE_APPLICATION_CREDENTIALS environment variable not set. GoogleVisionService may not function correctly.'
      );
    }
    this.client = new ImageAnnotatorClient();
    console.log('✅ GoogleVisionService initialized.');
  }

  /**
   * Analyzes an image from a public URL and extracts labels.
   * @param {string} imageUrl The public URL of the image to analyze.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of label annotations.
   */
  async analyzeImageFromUrl(imageUrl) {
    try {
      console.log(`Analyzing image from URL: ${imageUrl}`);
      const [result] = await this.client.labelDetection(imageUrl);
      const labels = result.labelAnnotations;
      console.log(`Found ${labels.length} labels.`);
      // Return a simplified version of the labels
      return labels.map((label) => ({
        description: label.description,
        score: label.score,
        topicality: label.topicality,
      }));
    } catch (error) {
      console.error('Google Vision API Error:', error.message);
      // In a real app, you might want to throw a more specific error
      throw new Error(`Failed to analyze image with Google Vision: ${error.message}`);
    }
  }

  // You can add more methods here for other Vision API features:
  // - analyzeText(imageUrl) for OCR
  // - analyzeFaces(imageUrl) for face detection
  // - etc.
}

// Export a singleton instance
const googleVisionService = new GoogleVisionService();
module.exports = googleVisionService;
