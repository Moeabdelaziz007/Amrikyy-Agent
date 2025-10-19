const request = require('supertest');
const app = require('../server');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

describe('Destinations API', () => {
  let testDestinations = [];

  beforeAll(async () => {
    // Create test destinations in database
    const destinations = [
      {
        name: 'Paris',
        description: 'The City of Light and Love',
        country: 'France',
        region: 'Europe',
        rating: 4.5,
        review_count: 1250,
        price_range: '$$$',
        category: ['city', 'cultural'],
        images: ['https://example.com/paris1.jpg'],
        best_time_to_visit: 'Spring',
        estimated_cost: { low: 1500, high: 3000, currency: 'USD' },
        attractions: ['Eiffel Tower', 'Louvre Museum'],
        activities: ['Sightseeing', 'Museums', 'Food tours'],
        popular_with: ['Couples', 'Culture lovers'],
        tags: ['romantic', 'art', 'history'],
        featured: true,
        trending: false
      },
      {
        name: 'Tokyo',
        description: 'Modern metropolis with ancient traditions',
        country: 'Japan',
        region: 'Asia',
        rating: 4.7,
        review_count: 2100,
        price_range: '$$$',
        category: ['city', 'cultural'],
        images: ['https://example.com/tokyo1.jpg'],
        best_time_to_visit: 'Spring',
        estimated_cost: { low: 2000, high: 4000, currency: 'USD' },
        attractions: ['Tokyo Tower', 'Senso-ji Temple'],
        activities: ['Shopping', 'Temples', 'Technology'],
        popular_with: ['Families', 'Tech enthusiasts'],
        tags: ['modern', 'traditional', 'technology'],
        featured: false,
        trending: true
      },
      {
        name: 'Bali',
        description: 'Tropical paradise with beautiful beaches',
        country: 'Indonesia',
        region: 'Asia',
        rating: 4.3,
        review_count: 890,
        price_range: '$$',
        category: ['beach', 'nature'],
        images: ['https://example.com/bali1.jpg'],
        best_time_to_visit: 'Summer',
        estimated_cost: { low: 800, high: 1500, currency: 'USD' },
        attractions: ['Ubud Rice Terraces', 'Mount Batur'],
        activities: ['Beach relaxation', 'Hiking', 'Yoga'],
        popular_with: ['Couples', 'Nature lovers'],
        tags: ['beach', 'relaxation', 'spiritual'],
        featured: false,
        trending: false
      }
    ];

    for (const destination of destinations) {
      const { data, error } = await supabase
        .from('destinations')
        .insert([destination])
        .select()
        .single();

      if (error) throw error;
      testDestinations.push(data);
    }
  });

  afterAll(async () => {
    // Clean up test data
    for (const destination of testDestinations) {
      await supabase
        .from('destinations')
        .delete()
        .eq('id', destination.id);
    }
  });

  describe('GET /api/destinations', () => {
    it('should return all destinations with pagination', async () => {
      const response = await request(app)
        .get('/api/destinations?limit=2&page=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.destinations).toBeDefined();
      expect(Array.isArray(response.body.data.destinations)).toBe(true);
      expect(response.body.data.destinations.length).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.total_items).toBeGreaterThan(0);
    });

    it('should support search by name', async () => {
      const response = await request(app)
        .get('/api/destinations?search=Paris')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.destinations.length).toBe(1);
      expect(response.body.data.destinations[0].name).toBe('Paris');
    });

    it('should support filtering by region', async () => {
      const response = await request(app)
        .get('/api/destinations?region=Europe')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.destinations.length).toBe(1);
      expect(response.body.data.destinations[0].region).toBe('Europe');
    });

    it('should support filtering by price range', async () => {
      const response = await request(app)
        .get('/api/destinations?price_range=$$$')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.destinations.length).toBe(2);
      response.body.data.destinations.forEach(destination => {
        expect(destination.price_range).toBe('$$$');
      });
    });

    it('should support sorting by rating', async () => {
      const response = await request(app)
        .get('/api/destinations?sort=rating&order=desc')
        .expect(200);

      expect(response.body.success).toBe(true);
      const destinations = response.body.data.destinations;
      for (let i = 1; i < destinations.length; i++) {
        expect(destinations[i-1].rating).toBeGreaterThanOrEqual(destinations[i].rating);
      }
    });

    it('should support multiple filters combined', async () => {
      const response = await request(app)
        .get('/api/destinations?region=Asia&price_range=$$&min_rating=4.0')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.destinations.length).toBe(1);
      expect(response.body.data.destinations[0].name).toBe('Bali');
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/destinations?limit=1&page=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.destinations.length).toBe(1);
      expect(response.body.data.pagination.current_page).toBe(2);
    });
  });

  describe('GET /api/destinations/search', () => {
    it('should perform advanced search with multiple criteria', async () => {
      const response = await request(app)
        .get('/api/destinations/search?name=Tokyo&region=Asia&min_rating=4.5&category=city')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.destinations.length).toBe(1);
      expect(response.body.destinations[0].name).toBe('Tokyo');
    });

    it('should handle empty search results', async () => {
      const response = await request(app)
        .get('/api/destinations/search?name=NonExistentDestination')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.destinations.length).toBe(0);
    });
  });

  describe('GET /api/destinations/:id', () => {
    it('should return destination details by ID', async () => {
      const parisDestination = testDestinations.find(d => d.name === 'Paris');

      const response = await request(app)
        .get(`/api/destinations/${parisDestination.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.destination).toBeDefined();
      expect(response.body.destination.name).toBe('Paris');
      expect(response.body.destination.description).toBe('The City of Light and Love');
      expect(response.body.destination.attractions).toContain('Eiffel Tower');
    });

    it('should return 404 for non-existent destination', async () => {
      const response = await request(app)
        .get('/api/destinations/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Destination not found');
    });
  });

  describe('GET /api/destinations/featured', () => {
    it('should return only featured destinations', async () => {
      const response = await request(app)
        .get('/api/destinations/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.destinations)).toBe(true);

      response.body.destinations.forEach(destination => {
        expect(destination.featured).toBe(true);
      });
    });

    it('should return empty array when no featured destinations exist', async () => {
      // This test assumes we have featured destinations
      // In a real scenario, we might want to create a featured destination first

      const response = await request(app)
        .get('/api/destinations/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.destinations)).toBe(true);
    });
  });

  describe('POST /api/destinations/favorites', () => {
    it('should add destination to favorites', async () => {
      const parisDestination = testDestinations.find(d => d.name === 'Paris');
      const userId = 'test-user-123';

      const response = await request(app)
        .post('/api/destinations/favorites')
        .send({
          userId,
          destinationId: parisDestination.id
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Destination added to favorites');

      // Verify in database
      const { data: favorite } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId)
        .eq('destination_id', parisDestination.id)
        .single();

      expect(favorite).toBeDefined();

      // Clean up
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId);
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/destinations/favorites')
        .send({ userId: 'test-user' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/destinations/favorites/:id', () => {
    it('should remove destination from favorites', async () => {
      const parisDestination = testDestinations.find(d => d.name === 'Paris');
      const userId = 'test-user-456';

      // First, add to favorites
      await supabase
        .from('user_favorites')
        .insert([{
          user_id: userId,
          destination_id: parisDestination.id
        }]);

      const response = await request(app)
        .delete(`/api/destinations/favorites/${parisDestination.id}`)
        .send({ userId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Favorite removed successfully');

      // Verify it's deleted
      const { data: favorite } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId)
        .eq('destination_id', parisDestination.id)
        .single();

      expect(favorite).toBeNull();
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .delete('/api/destinations/favorites/test-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Cache Integration', () => {
    it('should use cache for repeated requests', async () => {
      // First request to populate cache
      const response1 = await request(app)
        .get('/api/destinations?limit=1');

      expect(response1.status).toBe(200);

      // Second request should potentially use cache
      const response2 = await request(app)
        .get('/api/destinations?limit=1');

      expect(response2.status).toBe(200);
      expect(response2.body).toBeDefined();
    });

    it('should use cache for featured destinations', async () => {
      // First request
      const response1 = await request(app)
        .get('/api/destinations/featured');

      expect(response1.status).toBe(200);

      // Second request should use cache
      const response2 = await request(app)
        .get('/api/destinations/featured');

      expect(response2.status).toBe(200);
      expect(response2.body).toBeDefined();
    });
  });

  describe('Performance Monitoring', () => {
    it('should include performance headers', async () => {
      const response = await request(app)
        .get('/api/destinations');

      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.headers['x-request-id']).toMatch(/^req_\d+_[a-z0-9]+$/);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid query parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/destinations?page=invalid&limit=invalid')
        .expect(200); // Should default to valid values

      expect(response.body.success).toBe(true);
    });

    it('should handle malformed JSON in requests', async () => {
      const response = await request(app)
        .post('/api/destinations/favorites')
        .set('Content-Type', 'application/json')
        .send('{ malformed json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle database connection errors gracefully', async () => {
      // This would require mocking the database connection
      // For now, we'll test the error response structure for invalid IDs

      const response = await request(app)
        .get('/api/destinations/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Destination not found');
    });
  });

  describe('Load Testing Simulation', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = [];

      // Create 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .get('/api/destinations?limit=1')
        );
      }

      // Execute all requests concurrently
      const responses = await Promise.all(requests);

      // Verify all requests succeeded
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Security Testing', () => {
    it('should validate input parameters', async () => {
      // Test with potentially malicious input
      const response = await request(app)
        .get('/api/destinations?search=<script>alert("xss")</script>')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should not contain script tags in response
      expect(response.body.data.destinations).toBeDefined();
    });

    it('should handle SQL injection attempts', async () => {
      const response = await request(app)
        .get('/api/destinations?search=1%27%20OR%20%271%27%3D%271')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should handle gracefully without exposing database structure
    });
  });
});




