const request = require('supertest');
const app = require('../server');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mock the auth middleware
const auth = (req, res, next) => {
  req.user = { id: 'test-user' };
  next();
};

const express = require('express');
const destinationsRouter = require('../routes/destinations');

const testApp = express();
testApp.use(express.json());
testApp.use(auth);
testApp.use('/api/destinations', destinationsRouter);

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
      const response = await request(testApp)
        .get('/api/destinations?limit=2&page=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.destinations).toBeDefined();
      expect(Array.isArray(response.body.destinations)).toBe(true);
      expect(response.body.destinations.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBeGreaterThan(0);
    });

    it('should support search by name', async () => {
      const response = await request(testApp)
        .get('/api/destinations?search=Paris')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.destinations.length).toBe(1);
      expect(response.body.destinations[0].name).toBe('Paris');
    });

    it('should support filtering by region', async () => {
      const response = await request(testApp)
        .get('/api/destinations?region=Europe')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.destinations.length).toBe(1);
      expect(response.body.destinations[0].region).toBe('Europe');
    });

    it('should support filtering by price range', async () => {
      const response = await request(testApp)
        .get('/api/destinations?price_range=$$$')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.destinations.length).toBe(2);
      response.body.destinations.forEach(destination => {
        expect(destination.price_range).toBe('$$$');
      });
    });

    it('should support sorting by rating', async () => {
      const response = await request(testApp)
        .get('/api/destinations?sort=rating&order=desc')
        .expect(200);

      expect(response.body.success).toBe(true);
      const destinations = response.body.destinations;
      for (let i = 1; i < destinations.length; i++) {
        expect(destinations[i-1].rating).toBeGreaterThanOrEqual(destinations[i].rating);
      }
    });

    it('should support multiple filters combined', async () => {
      const response = await request(testApp)
        .get('/api/destinations?region=Asia&price_range=$$&rating=4.0')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.destinations.length).toBe(1);
      expect(response.body.destinations[0].name).toBe('Bali');
    });

    it('should handle pagination correctly', async () => {
      const response = await request(testApp)
        .get('/api/destinations?limit=1&page=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.destinations.length).toBe(1);
      expect(response.body.pagination.page).toBe(2);
    });
  });

  describe('GET /api/destinations/:id', () => {
    it('should return destination details by ID', async () => {
      const parisDestination = testDestinations.find(d => d.name === 'Paris');

      const response = await request(testApp)
        .get(`/api/destinations/${parisDestination.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.destination).toBeDefined();
      expect(response.body.destination.name).toBe('Paris');
      expect(response.body.destination.description).toBe('The City of Light and Love');
      expect(response.body.destination.attractions).toContain('Eiffel Tower');
    });

    it('should return 404 for non-existent destination', async () => {
      const response = await request(testApp)
        .get('/api/destinations/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Destination not found.');
    });
  });

  describe('GET /api/destinations/popular', () => {
    it('should return popular destinations', async () => {
      const response = await request(testApp)
        .get('/api/destinations/popular')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.destinations)).toBe(true);
    });
  });
});
