const axios = require('axios');
const config = require('../../config/qdrant-config.json');

class QdrantService {
  constructor() {
    this.baseUrl = config.qdrant.url;
    this.apiKey = process.env.QDRANT_API_KEY;
    this.headers = {
      'Content-Type': 'application/json',
      'api-key': this.apiKey,
    };
  }

  /**
   * Search for similar travel destinations
   */
  async searchDestinations(query, limit = 10) {
    try {
      // Get embedding for the query
      const embedding = await this.getEmbedding(query);

      const response = await axios.post(
        `${this.baseUrl}/collections/travel_destinations/points/search`,
        {
          vector: embedding,
          limit: limit,
          with_payload: true,
          score_threshold: config.qdrant.search.score_threshold,
        },
        { headers: this.headers }
      );

      return response.data.result;
    } catch (error) {
      console.error('Error searching destinations:', error);
      throw error;
    }
  }

  /**
   * Get personalized recommendations based on user preferences
   */
  async getRecommendations(userId, limit = 10) {
    try {
      // Get user preferences embedding
      const userPreferences = await this.getUserPreferences(userId);
      const embedding = await this.getEmbedding(userPreferences);

      const response = await axios.post(
        `${this.baseUrl}/collections/user_preferences/points/search`,
        {
          vector: embedding,
          limit: limit,
          with_payload: true,
          score_threshold: 0.8,
        },
        { headers: this.headers }
      );

      return response.data.result;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  /**
   * Analyze travel reviews for sentiment and insights
   */
  async analyzeReviews(destination, limit = 20) {
    try {
      const embedding = await this.getEmbedding(`reviews for ${destination}`);

      const response = await axios.post(
        `${this.baseUrl}/collections/travel_reviews/points/search`,
        {
          vector: embedding,
          limit: limit,
          with_payload: true,
          score_threshold: 0.6,
        },
        { headers: this.headers }
      );

      return response.data.result;
    } catch (error) {
      console.error('Error analyzing reviews:', error);
      throw error;
    }
  }

  /**
   * Kody marketing analysis - search marketing content
   */
  async searchMarketingContent(query, limit = 10) {
    try {
      const embedding = await this.getEmbedding(query);

      const response = await axios.post(
        `${this.baseUrl}/collections/marketing_content/points/search`,
        {
          vector: embedding,
          limit: limit,
          with_payload: true,
          score_threshold: 0.7,
        },
        { headers: this.headers }
      );

      return response.data.result;
    } catch (error) {
      console.error('Error searching marketing content:', error);
      throw error;
    }
  }

  /**
   * Add new travel destination to vector database
   */
  async addDestination(destination) {
    try {
      const embedding = await this.getEmbedding(destination.description);

      const response = await axios.put(
        `${this.baseUrl}/collections/travel_destinations/points`,
        {
          points: [
            {
              id: destination.id,
              vector: embedding,
              payload: {
                name: destination.name,
                description: destination.description,
                activities: destination.activities,
                culture: destination.culture,
                climate: destination.climate,
                country: destination.country,
                created_at: new Date().toISOString(),
              },
            },
          ],
        },
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error adding destination:', error);
      throw error;
    }
  }

  /**
   * Add marketing content for Kody analysis
   */
  async addMarketingContent(content) {
    try {
      const embedding = await this.getEmbedding(content.content);

      const response = await axios.put(
        `${this.baseUrl}/collections/marketing_content/points`,
        {
          points: [
            {
              id: content.id,
              vector: embedding,
              payload: {
                content: content.content,
                campaign_type: content.campaign_type,
                target_audience: content.target_audience,
                performance: content.performance,
                created_at: new Date().toISOString(),
              },
            },
          ],
        },
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error adding marketing content:', error);
      throw error;
    }
  }

  /**
   * Get text embedding using OpenAI API
   */
  async getEmbedding(text) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          input: text,
          model: config.embeddings.model,
          dimensions: config.embeddings.dimensions,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data[0].embedding;
    } catch (error) {
      console.error('Error getting embedding:', error);
      throw error;
    }
  }

  /**
   * Get user preferences as text for embedding
   */
  async getUserPreferences(userId) {
    try {
      // This would typically come from your database
      const user = await this.getUserFromDatabase(userId);

      const preferences = [
        `Budget: ${user.budget_range}`,
        `Interests: ${user.interests.join(', ')}`,
        `Travel style: ${user.travel_style}`,
        `Previous destinations: ${user.previous_destinations.join(', ')}`,
      ].join(' ');

      return preferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  /**
   * Create collections if they don't exist
   */
  async initializeCollections() {
    try {
      for (const [key, collection] of Object.entries(config.qdrant.collections)) {
        try {
          await axios.put(
            `${this.baseUrl}/collections/${collection.name}`,
            {
              vectors: {
                size: collection.vector_size,
                distance: collection.distance,
              },
            },
            { headers: this.headers }
          );
          console.log(`✅ Collection ${collection.name} initialized`);
        } catch (error) {
          if (error.response?.status === 409) {
            console.log(`✅ Collection ${collection.name} already exists`);
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Error initializing collections:', error);
      throw error;
    }
  }

  /**
   * Health check for Qdrant service
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseUrl}/collections`, { headers: this.headers });

      return {
        status: 'healthy',
        collections: response.data.result.collections.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

module.exports = QdrantService;
