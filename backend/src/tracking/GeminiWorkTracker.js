/**
 * @class GeminiWorkTracker
 * @description Tracks Gemini AI agent work performance, Arabic content quality, and replay functionality
 * @author AMRIKYY AI Solutions
 * @version 1.0.0
 */

const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

class GeminiWorkTracker {
  constructor() {
    this.trackingData = {
      sessions: new Map(),
      performance: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        arabicContentRequests: 0,
        arabicContentQuality: [],
      },
      arabicContent: {
        ratings: new Map(),
        replays: new Map(),
        qualityMetrics: {
          accuracy: 0,
          fluency: 0,
          culturalAppropriateness: 0,
          userSatisfaction: 0,
        },
      },
    };
    this.dataFilePath = path.join(__dirname, '../../data/gemini-tracking.json');
    this.initializeTracking();
  }

  /**
   * Initialize tracking system and load existing data
   */
  async initializeTracking() {
    try {
      await fs.mkdir(path.dirname(this.dataFilePath), { recursive: true });
      const existingData = await fs.readFile(this.dataFilePath, 'utf8');
      if (existingData) {
        const parsed = JSON.parse(existingData);
        this.trackingData = {
          ...this.trackingData,
          ...parsed,
          sessions: new Map(parsed.sessions || []),
          arabicContent: {
            ...this.trackingData.arabicContent,
            ...parsed.arabicContent,
            ratings: new Map(parsed.arabicContent?.ratings || []),
            replays: new Map(parsed.arabicContent?.replays || []),
          },
        };
      }
    } catch (error) {
      console.log('Initializing new Gemini tracking system');
    }
  }

  /**
   * Track a Gemini work session
   * @param {Object} sessionData - Session information
   * @returns {string} - Session ID
   */
  trackSession(sessionData) {
    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      timestamp: new Date().toISOString(),
      userAgent: sessionData.userAgent || 'Unknown',
      requestType: sessionData.requestType || 'general',
      language: sessionData.language || 'en',
      isArabic: sessionData.language === 'ar' || sessionData.isArabic || false,
      complexity: sessionData.complexity || 'medium',
      duration: 0,
      status: 'active',
      metrics: {
        responseTime: 0,
        quality: 0,
        userSatisfaction: 0,
        errors: [],
      },
    };

    this.trackingData.sessions.set(sessionId, session);
    this.updatePerformanceMetrics('session_started');

    if (session.isArabic) {
      this.trackingData.performance.arabicContentRequests++;
    }

    return sessionId;
  }

  /**
   * Complete a Gemini work session
   * @param {string} sessionId - Session ID
   * @param {Object} completionData - Completion information
   */
  completeSession(sessionId, completionData) {
    const session = this.trackingData.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.status = completionData.status || 'completed';
    session.duration = completionData.duration || 0;
    session.metrics.responseTime = completionData.responseTime || 0;
    session.metrics.quality = completionData.quality || 0;
    session.metrics.userSatisfaction = completionData.userSatisfaction || 0;
    session.metrics.errors = completionData.errors || [];
    session.completedAt = new Date().toISOString();

    // Update performance metrics
    this.updatePerformanceMetrics('session_completed', completionData);

    // If Arabic content, update Arabic-specific metrics
    if (session.isArabic) {
      this.updateArabicContentMetrics(session.id, completionData);
      // Automatically track a replay for every successful Arabic interaction
      if (completionData.status === 'success') {
        this.trackReplay(session.id, { reason: 'auto_replay_for_quality' });
      }
    }

    this.saveTrackingData();
  }

  /**
   * Rate Arabic content quality
   * @param {string} contentId - Content identifier
   * @param {Object} ratingData - Rating information
   */
  rateArabicContent(contentId, ratingData) {
    const rating = {
      id: uuidv4(),
      contentId,
      timestamp: new Date().toISOString(),
      accuracy: ratingData.accuracy || 0, // 1-10 scale
      fluency: ratingData.fluency || 0, // 1-10 scale
      culturalAppropriateness: ratingData.culturalAppropriateness || 0, // 1-10 scale
      userSatisfaction: ratingData.userSatisfaction || 0, // 1-10 scale
      overallRating: 0,
      feedback: ratingData.feedback || '',
      reviewer: ratingData.reviewer || 'system',
    };

    // Calculate overall rating
    rating.overallRating =
      (rating.accuracy +
        rating.fluency +
        rating.culturalAppropriateness +
        rating.userSatisfaction) /
      4;

    // Store rating
    if (!this.trackingData.arabicContent.ratings.has(contentId)) {
      this.trackingData.arabicContent.ratings.set(contentId, []);
    }
    this.trackingData.arabicContent.ratings.get(contentId).push(rating);

    // Update quality metrics
    this.updateArabicQualityMetrics();

    this.saveTrackingData();
    return rating;
  }

  /**
   * Track content replay
   * @param {string} contentId - Content identifier
   * @param {Object} replayData - Replay information
   */
  trackReplay(contentId, replayData) {
    const replay = {
      id: uuidv4(),
      contentId,
      timestamp: new Date().toISOString(),
      replayReason: replayData.reason || 'user_request',
      originalSessionId: replayData.originalSessionId,
      improvements: replayData.improvements || [],
      userFeedback: replayData.userFeedback || '',
    };

    if (!this.trackingData.arabicContent.replays.has(contentId)) {
      this.trackingData.arabicContent.replays.set(contentId, []);
    }
    this.trackingData.arabicContent.replays.get(contentId).push(replay);

    this.saveTrackingData();
    return replay;
  }

  /**
   * Update performance metrics
   * @param {string} event - Event type
   * @param {Object} data - Event data
   */
  updatePerformanceMetrics(event, data = {}) {
    switch (event) {
      case 'session_started':
        this.trackingData.performance.totalRequests++;
        break;

      case 'session_completed':
        if (data.status === 'success') {
          this.trackingData.performance.successfulRequests++;
        } else {
          this.trackingData.performance.failedRequests++;
        }

        // Update average response time
        const currentAvg = this.trackingData.performance.averageResponseTime;
        const totalCompleted =
          this.trackingData.performance.successfulRequests +
          this.trackingData.performance.failedRequests;

        if (data.responseTime) {
          this.trackingData.performance.averageResponseTime =
            (currentAvg * (totalCompleted - 1) + data.responseTime) / totalCompleted;
        }
        break;
    }
  }

  /**
   * Update Arabic content metrics
   * @param {string} sessionId - Session ID
   * @param {Object} completionData - Completion data
   */
  updateArabicContentMetrics(sessionId, completionData) {
    const session = this.trackingData.sessions.get(sessionId);
    if (!session || !session.isArabic) return;

    const metrics = {
      sessionId,
      timestamp: new Date().toISOString(),
      quality: completionData.quality || 0,
      userSatisfaction: completionData.userSatisfaction || 0,
      responseTime: completionData.responseTime || 0,
    };

    this.trackingData.arabicContent.qualityMetrics.push(metrics);
  }

  /**
   * Update Arabic quality metrics
   */
  updateArabicQualityMetrics() {
    const ratings = Array.from(this.trackingData.arabicContent.ratings.values()).flat();

    if (ratings.length > 0) {
      this.trackingData.arabicContent.qualityMetrics.accuracy =
        ratings.reduce((sum, r) => sum + r.accuracy, 0) / ratings.length;

      this.trackingData.arabicContent.qualityMetrics.fluency =
        ratings.reduce((sum, r) => sum + r.fluency, 0) / ratings.length;

      this.trackingData.arabicContent.qualityMetrics.culturalAppropriateness =
        ratings.reduce((sum, r) => sum + r.culturalAppropriateness, 0) / ratings.length;

      this.trackingData.arabicContent.qualityMetrics.userSatisfaction =
        ratings.reduce((sum, r) => sum + r.userSatisfaction, 0) / ratings.length;
    }
  }

  /**
   * Get performance analytics
   * @returns {Object} Performance analytics
   */
  getAnalytics() {
    const totalRequests = this.trackingData.performance.totalRequests;
    const successRate =
      totalRequests > 0
        ? (this.trackingData.performance.successfulRequests / totalRequests) * 100
        : 0;

    return {
      performance: {
        ...this.trackingData.performance,
        successRate: Math.round(successRate * 100) / 100,
        failureRate: Math.round((100 - successRate) * 100) / 100,
      },
      arabicContent: {
        totalRequests: this.trackingData.performance.arabicContentRequests,
        qualityMetrics: this.trackingData.arabicContent.qualityMetrics,
        totalRatings: Array.from(this.trackingData.arabicContent.ratings.values()).flat().length,
        totalReplays: Array.from(this.trackingData.arabicContent.replays.values()).flat().length,
      },
      sessions: {
        total: this.trackingData.sessions.size,
        active: Array.from(this.trackingData.sessions.values()).filter((s) => s.status === 'active')
          .length,
        completed: Array.from(this.trackingData.sessions.values()).filter(
          (s) => s.status === 'completed'
        ).length,
      },
    };
  }

  /**
   * Get Arabic content quality report
   * @param {string} contentId - Optional content ID filter
   * @returns {Object} Quality report
   */
  getArabicQualityReport(contentId = null) {
    const ratings = contentId
      ? this.trackingData.arabicContent.ratings.get(contentId) || []
      : Array.from(this.trackingData.arabicContent.ratings.values()).flat();

    const replays = contentId
      ? this.trackingData.arabicContent.replays.get(contentId) || []
      : Array.from(this.trackingData.arabicContent.replays.values()).flat();

    return {
      contentId,
      ratings: ratings.map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        overallRating: r.overallRating,
        accuracy: r.accuracy,
        fluency: r.fluency,
        culturalAppropriateness: r.culturalAppropriateness,
        userSatisfaction: r.userSatisfaction,
        feedback: r.feedback,
        reviewer: r.reviewer,
      })),
      replays: replays.map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        replayReason: r.replayReason,
        improvements: r.improvements,
        userFeedback: r.userFeedback,
      })),
      summary: {
        averageRating:
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length
            : 0,
        totalRatings: ratings.length,
        totalReplays: replays.length,
        qualityTrend: this.calculateQualityTrend(ratings),
      },
    };
  }

  /**
   * Calculate quality trend
   * @param {Array} ratings - Array of ratings
   * @returns {string} Quality trend
   */
  calculateQualityTrend(ratings) {
    if (ratings.length < 2) return 'insufficient_data';

    const sorted = ratings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    const firstAvg = firstHalf.reduce((sum, r) => sum + r.overallRating, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + r.overallRating, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  }

  /**
   * Save tracking data to file
   */
  async saveTrackingData() {
    try {
      const dataToSave = {
        ...this.trackingData,
        sessions: Array.from(this.trackingData.sessions.entries()),
        arabicContent: {
          ...this.trackingData.arabicContent,
          ratings: Array.from(this.trackingData.arabicContent.ratings.entries()),
          replays: Array.from(this.trackingData.arabicContent.replays.entries()),
        },
      };

      await fs.writeFile(this.dataFilePath, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
      console.error('Error saving Gemini tracking data:', error);
    }
  }

  /**
   * Export tracking data
   * @param {string} format - Export format (json, csv)
   * @returns {string} Exported data
   */
  exportData(format = 'json') {
    const analytics = this.getAnalytics();

    if (format === 'csv') {
      return this.convertToCSV(analytics);
    }

    return JSON.stringify(analytics, null, 2);
  }

  /**
   * Convert analytics to CSV format
   * @param {Object} analytics - Analytics data
   * @returns {string} CSV data
   */
  convertToCSV(analytics) {
    const headers = [
      'timestamp',
      'total_requests',
      'success_rate',
      'average_response_time',
      'arabic_requests',
      'arabic_quality_avg',
      'total_ratings',
      'total_replays',
    ];

    const row = [
      new Date().toISOString(),
      analytics.performance.totalRequests,
      analytics.performance.successRate,
      analytics.performance.averageResponseTime,
      analytics.arabicContent.totalRequests,
      analytics.arabicContent.qualityMetrics.userSatisfaction,
      analytics.arabicContent.totalRatings,
      analytics.arabicContent.totalReplays,
    ];

    return [headers.join(','), row.join(',')].join('\n');
  }
}

module.exports = GeminiWorkTracker;
      analytics.arabicContent.totalReplays,
    ];

    return [headers.join(','), row.join(',')].join('\n');
  }
}

module.exports = GeminiWorkTracker;
