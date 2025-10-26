/**
 * Media Agent - YouTube & Video Content
 * Specialization: Video search and media content
 */

const axios = require('axios');
const logger = require('../../utils/logger');

class MediaAgent {
  constructor() {
    this.name = 'Media';
    this.icon = '🎥';
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
  }

  /**
   * Execute a task
   */
  async executeTask(task) {
    logger.info(`[MediaAgent] Executing task: ${task.type}`);
    
    try {
      switch (task.type) {
        case 'SEARCH_VIDEOS':
          return await this.searchVideos(task.query, task.maxResults);
        case 'GET_VIDEO_DETAILS':
          return await this.getVideoDetails(task.videoId);
        case 'GET_CHANNEL_INFO':
          return await this.getChannelInfo(task.channelId);
        case 'SEARCH_TRAVEL_VIDEOS':
          return await this.searchTravelVideos(task.destination);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      logger.error(`[MediaAgent] Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search YouTube videos
   */
  async searchVideos(query, maxResults = 10) {
    if (!this.youtubeApiKey) {
      return this.getMockVideoResults(query);
    }

    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: this.youtubeApiKey,
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults,
          order: 'relevance'
        }
      });

      return {
        success: true,
        query,
        videos: response.data.items.map(item => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }))
      };
    } catch (error) {
      logger.warn(`[MediaAgent] YouTube API error, using fallback`);
      return this.getMockVideoResults(query);
    }
  }

  /**
   * Get video details
   */
  async getVideoDetails(videoId) {
    if (!this.youtubeApiKey) {
      return this.getMockVideoDetails(videoId);
    }

    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          key: this.youtubeApiKey,
          part: 'snippet,statistics,contentDetails',
          id: videoId
        }
      });

      const video = response.data.items[0];

      return {
        success: true,
        video: {
          videoId,
          title: video.snippet.title,
          description: video.snippet.description,
          channelTitle: video.snippet.channelTitle,
          publishedAt: video.snippet.publishedAt,
          thumbnail: video.snippet.thumbnails.high.url,
          viewCount: video.statistics.viewCount,
          likeCount: video.statistics.likeCount,
          commentCount: video.statistics.commentCount,
          duration: video.contentDetails.duration,
          url: `https://www.youtube.com/watch?v=${videoId}`
        }
      };
    } catch (error) {
      logger.warn(`[MediaAgent] YouTube API error, using fallback`);
      return this.getMockVideoDetails(videoId);
    }
  }

  /**
   * Get channel info
   */
  async getChannelInfo(channelId) {
    if (!this.youtubeApiKey) {
      return { success: false, message: 'YouTube API key not configured' };
    }

    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
          key: this.youtubeApiKey,
          part: 'snippet,statistics',
          id: channelId
        }
      });

      const channel = response.data.items[0];

      return {
        success: true,
        channel: {
          channelId,
          title: channel.snippet.title,
          description: channel.snippet.description,
          thumbnail: channel.snippet.thumbnails.high.url,
          subscriberCount: channel.statistics.subscriberCount,
          videoCount: channel.statistics.videoCount,
          viewCount: channel.statistics.viewCount
        }
      };
    } catch (error) {
      logger.error(`[MediaAgent] Channel info error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search travel videos for destination
   */
  async searchTravelVideos(destination) {
    const query = `${destination} travel guide vlog`;
    const results = await this.searchVideos(query, 15);

    // Filter for travel-related content
    const travelVideos = results.videos.filter(video =>
      video.title.toLowerCase().includes('travel') ||
      video.title.toLowerCase().includes('tour') ||
      video.title.toLowerCase().includes('visit') ||
      video.title.toLowerCase().includes('guide')
    );

    return {
      success: true,
      destination,
      videos: travelVideos,
      count: travelVideos.length
    };
  }

  /**
   * Get mock video results (fallback)
   */
  getMockVideoResults(query) {
    return {
      success: true,
      query,
      videos: [
        {
          videoId: 'mock1',
          title: `${query} - Complete Travel Guide`,
          description: `Comprehensive travel guide for ${query}. Everything you need to know!`,
          thumbnail: 'https://via.placeholder.com/480x360?text=Video+1',
          channelTitle: 'Travel Channel',
          publishedAt: new Date().toISOString(),
          url: `https://www.youtube.com/watch?v=mock1`
        },
        {
          videoId: 'mock2',
          title: `Best Places to Visit in ${query}`,
          description: `Discover the top attractions and hidden gems in ${query}.`,
          thumbnail: 'https://via.placeholder.com/480x360?text=Video+2',
          channelTitle: 'Adventure Vlog',
          publishedAt: new Date().toISOString(),
          url: `https://www.youtube.com/watch?v=mock2`
        },
        {
          videoId: 'mock3',
          title: `${query} Travel Tips and Tricks`,
          description: `Essential tips for traveling to ${query}. Save money and time!`,
          thumbnail: 'https://via.placeholder.com/480x360?text=Video+3',
          channelTitle: 'Travel Tips',
          publishedAt: new Date().toISOString(),
          url: `https://www.youtube.com/watch?v=mock3`
        }
      ]
    };
  }

  /**
   * Get mock video details (fallback)
   */
  getMockVideoDetails(videoId) {
    return {
      success: true,
      video: {
        videoId,
        title: 'Travel Video',
        description: 'Amazing travel content',
        channelTitle: 'Travel Channel',
        publishedAt: new Date().toISOString(),
        thumbnail: 'https://via.placeholder.com/480x360?text=Video',
        viewCount: '10000',
        likeCount: '500',
        commentCount: '50',
        duration: 'PT10M30S',
        url: `https://www.youtube.com/watch?v=${videoId}`
      }
    };
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      name: this.name,
      icon: this.icon,
      status: this.youtubeApiKey ? 'active' : 'fallback',
      capabilities: [
        'SEARCH_VIDEOS',
        'GET_VIDEO_DETAILS',
        'GET_CHANNEL_INFO',
        'SEARCH_TRAVEL_VIDEOS'
      ]
    };
  }
}

module.exports = MediaAgent;
