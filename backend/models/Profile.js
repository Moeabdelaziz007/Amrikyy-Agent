/**
 * Profile Model for Maya Travel Agent
 * Handles user profile database operations with Supabase integration
 */

const SupabaseDB = require('../database/supabase');

class Profile {
  constructor() {
    this.db = new SupabaseDB();
  }

  /**
   * Get user profile by telegram ID
   */
  async getProfile(telegramId) {
    try {
      return await this.db.getUserProfile(telegramId);
    } catch (error) {
      console.error('Error getting profile:', error);
      throw new Error('Failed to retrieve profile');
    }
  }

  /**
   * Create new user profile
   */
  async createProfile(telegramId, profileData) {
    try {
      const profile = {
        username: profileData.username,
        avatar_url: profileData.avatarUrl,
        preferences: profileData.preferences || {},
        travel_history: [],
        stats: {
          totalTrips: 0,
          totalSpent: 0,
          favoriteDestinations: [],
          lastActive: new Date().toISOString(),
          joinedAt: new Date().toISOString()
        }
      };

      return await this.db.createUserProfile(telegramId, profile);
    } catch (error) {
      console.error('Error creating profile:', error);
      throw new Error('Failed to create profile');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(telegramId, updates) {
    try {
      // Add updated timestamp
      const enhancedUpdates = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      return await this.db.updateUserProfile(telegramId, enhancedUpdates);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Update user avatar
   */
  async updateAvatar(telegramId, avatarUrl) {
    try {
      return await this.updateProfile(telegramId, { avatar_url: avatarUrl });
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw new Error('Failed to update avatar');
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(telegramId, preferences) {
    try {
      return await this.updateProfile(telegramId, { preferences });
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw new Error('Failed to update preferences');
    }
  }

  /**
   * Add trip to travel history
   */
  async addToTravelHistory(telegramId, tripData) {
    try {
      return await this.db.addToTravelHistory(telegramId, tripData);
    } catch (error) {
      console.error('Error adding to travel history:', error);
      throw new Error('Failed to update travel history');
    }
  }

  /**
   * Update user stats
   */
  async updateStats(telegramId, statsUpdates) {
    try {
      const profile = await this.getProfile(telegramId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      const currentStats = profile.stats || {};
      const updatedStats = {
        ...currentStats,
        ...statsUpdates,
        lastActive: new Date().toISOString()
      };

      return await this.updateProfile(telegramId, { stats: updatedStats });
    } catch (error) {
      console.error('Error updating stats:', error);
      throw new Error('Failed to update stats');
    }
  }

  /**
   * Get user stats
   */
  async getUserStats(telegramId) {
    try {
      const profile = await this.getProfile(telegramId);
      if (!profile) {
        return null;
      }

      const stats = profile.stats || {};
      const travelHistory = profile.travel_history || [];
      const preferences = profile.preferences || {};

      // Calculate additional stats
      const totalTrips = travelHistory.length;
      const completedTrips = travelHistory.filter(trip => trip.status === 'completed').length;
      const totalSpent = travelHistory.reduce((sum, trip) => sum + (trip.cost || 0), 0);

      // Get favorite destinations
      const destinationCounts = {};
      travelHistory.forEach(trip => {
        if (trip.destination) {
          destinationCounts[trip.destination] = (destinationCounts[trip.destination] || 0) + 1;
        }
      });

      const favoriteDestinations = Object.entries(destinationCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([destination]) => destination);

      return {
        totalTrips,
        completedTrips,
        totalSpent,
        favoriteDestinations,
        preferences,
        joinedAt: stats.joinedAt,
        lastActive: stats.lastActive,
        loyaltyScore: stats.loyaltyScore || 0,
        engagementLevel: stats.engagementLevel || 'medium'
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error('Failed to retrieve user stats');
    }
  }

  /**
   * Delete user profile
   */
  async deleteProfile(telegramId) {
    try {
      // Note: In a real implementation, you might want to soft delete
      // For now, we'll just clear the profile data
      return await this.updateProfile(telegramId, {
        deleted: true,
        deleted_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw new Error('Failed to delete profile');
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateAccount(telegramId) {
    try {
      return await this.updateProfile(telegramId, {
        is_active: false,
        deactivated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error deactivating account:', error);
      throw new Error('Failed to deactivate account');
    }
  }

  /**
   * Reactivate user account
   */
  async reactivateAccount(telegramId) {
    try {
      return await this.updateProfile(telegramId, {
        is_active: true,
        reactivated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error reactivating account:', error);
      throw new Error('Failed to reactivate account');
    }
  }

  /**
   * Get user activity summary
   */
  async getActivitySummary(telegramId, days = 30) {
    try {
      const profile = await this.getProfile(telegramId);
      if (!profile) {
        return null;
      }

      const travelHistory = profile.travel_history || [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentTrips = travelHistory.filter(trip =>
        new Date(trip.timestamp) >= cutoffDate
      );

      const conversations = await this.db.getConversationHistory(telegramId, 100);
      const recentConversations = conversations.filter(conv =>
        new Date(conv.timestamp) >= cutoffDate
      );

      return {
        period: `${days} days`,
        totalTrips: recentTrips.length,
        totalConversations: recentConversations.length,
        totalSpent: recentTrips.reduce((sum, trip) => sum + (trip.cost || 0), 0),
        averageTripCost: recentTrips.length > 0
          ? recentTrips.reduce((sum, trip) => sum + (trip.cost || 0), 0) / recentTrips.length
          : 0,
        destinations: [...new Set(recentTrips.map(trip => trip.destination))],
        lastActivity: profile.updated_at
      };
    } catch (error) {
      console.error('Error getting activity summary:', error);
      throw new Error('Failed to retrieve activity summary');
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(telegramId, preferenceKey, preferenceValue) {
    try {
      return await this.db.saveUserPreference(telegramId, preferenceKey, preferenceValue);
    } catch (error) {
      console.error('Error updating user preference:', error);
      throw new Error('Failed to update preference');
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(telegramId) {
    try {
      return await this.db.getUserAnalytics(telegramId);
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw new Error('Failed to retrieve analytics');
    }
  }
}

module.exports = Profile;