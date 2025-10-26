// backend/src/services/YouTubeService.js
const { google } = require('googleapis');
const logger = require('../utils/logger');

/**
 * @class YouTubeService
 * @description A service class for interacting with the YouTube Data API.
 * This class provides methods for searching for videos and retrieving details about a specific video.
 * It handles the initialization of the YouTube API client and requires the `YOUTUBE_API_KEY` environment variable to be set.
 */
class YouTubeService {
  /**
   * @constructor
   * @description Initializes the YouTubeService.
   * It sets up the YouTube API client using the API key from the environment variables.
   * If the API key is not found, it logs a warning and disables the client to prevent runtime errors.
   */
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    if (!this.apiKey) {
      logger.warn('[YouTubeService] YOUTUBE_API_KEY is not set. Real API calls will fail.');
      this.youtube = null;
    } else {
      this.youtube = google.youtube({
        version: 'v3',
        auth: this.apiKey,
      });
      logger.info('[YouTubeService] Initialized successfully.');
    }
  }

  /**
   * @private
   * @method _checkClient
   * @description Checks if the YouTube API client is initialized.
   * Throws an error if the client is not available, preventing API calls from being made without a valid configuration.
   * @throws {Error} If the YouTube API client is not configured.
   */
  _checkClient() {
    if (!this.youtube) {
      throw new Error('YouTube Service is not configured. Please provide YOUTUBE_API_KEY.');
    }
  }

  /**
   * @method searchVideos
   * @description Searches for videos on YouTube based on a query.
   * @param {string} query - The search term.
   * @param {number} [maxResults=5] - The maximum number of results to return.
   * @returns {Promise<object>} An object containing an array of simplified video objects.
   * @throws {Error} If the API call fails.
   */
  async searchVideos(query, maxResults = 5) {
    this._checkClient();
    try {
      const response = await this.youtube.search.list({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults,
        order: 'relevance',
      });
      
      const videos = response.data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.default.url,
        channelTitle: item.snippet.channelTitle,
      }));
      return { videos };
    } catch (error) {
      logger.error('[YouTubeService] Error searching videos:', error.message);
      throw new Error('Failed to search videos from YouTube API.');
    }
  }

  /**
   * @method getVideoDetails
   * @description Retrieves detailed information about a specific YouTube video.
   * @param {string} videoId - The ID of the video to retrieve details for.
   * @returns {Promise<object>} An object containing the detailed information of the video.
   * @throws {Error} If the API call fails.
   */
  async getVideoDetails(videoId) {
    this._checkClient();
    try {
      const response = await this.youtube.videos.list({
        part: 'snippet,statistics,contentDetails',
        id: videoId,
      });

      if (!response.data.items || response.data.items.length === 0) {
        return { details: null, message: 'Video not found.' };
      }
      
      const item = response.data.items[0];
      const details = {
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        viewCount: item.statistics.viewCount,
        likeCount: item.statistics.likeCount,
        duration: item.contentDetails.duration, // ISO 8601 format
      };
      return { details };
    } catch (error) {
      logger.error('[YouTubeService] Error getting video details:', error.message);
      throw new Error('Failed to get video details from YouTube API.');
    }
  }
}

module.exports = YouTubeService;
