/**
 * Kelo AI Client
 * Integration with Kelo AI services for enhanced travel recommendations
 */

class KeloClient {
  constructor() {
    this.apiKey = process.env.KELO_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('KELO_API_KEY is required but not configured. Please check your .env file.');
    }
    this.baseUrl = process.env.KELO_BASE_URL || 'https://api.kelo.ai';
    this.isEnabled = !!this.apiKey;
  }

  /**
   * Get travel recommendations from Kelo AI
   */
  async getRecommendations(query, options = {}) {
    if (!this.isEnabled) {
      return { recommendations: [], source: 'mock' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query,
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error(`Kelo API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Kelo AI error:', error);
      return { recommendations: [], source: 'error', error: error.message };
    }
  }

  /**
   * Analyze travel preferences
   */
  async analyzePreferences(userData) {
    if (!this.isEnabled) {
      return { preferences: {}, source: 'mock' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/analyze-preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(userData),
      });

      return await response.json();
    } catch (error) {
      console.error('Kelo preference analysis error:', error);
      return { preferences: {}, source: 'error', error: error.message };
    }
  }
}

module.exports = KeloClient;
