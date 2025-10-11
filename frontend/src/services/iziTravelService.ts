/**
 * izi.TRAVEL API Service
 * Client for accessing izi.TRAVEL tours, museums, and attractions
 */

import axios, { AxiosInstance } from 'axios';

export interface IziSearchParams {
  query?: string;
  lat?: number;
  lon?: number;
  radius?: number;
  languages?: string;
  type?: string;
  limit?: number;
  offset?: number;
  form?: 'compact' | 'short' | 'full';
  sort_by?: 'distance' | 'popularity' | 'rating';
}

export interface IziTour {
  uuid: string;
  title: Record<string, string>;
  summary?: Record<string, string>;
  location?: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  reviews_count?: number;
  images?: Array<{
    url: string;
    type: string;
  }>;
  audio_duration?: number;
  languages?: string[];
  category?: string;
}

class IziTravelService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Search for tours, museums, attractions
   */
  async search(params: IziSearchParams): Promise<IziTour[]> {
    const response = await this.api.get('/izi-travel/search', { params });
    return response.data.results || [];
  }

  /**
   * Get object details
   */
  async getObject(uuid: string, params?: { form?: string; languages?: string }): Promise<IziTour> {
    const response = await this.api.get(`/izi-travel/object/${uuid}`, { params });
    return response.data.object;
  }

  /**
   * Get nearby tours
   */
  async getToursNearby(
    lat: number,
    lon: number,
    options?: { radius?: number; languages?: string; limit?: number }
  ): Promise<IziTour[]> {
    const response = await this.api.get('/izi-travel/tours/nearby', {
      params: { lat, lon, ...options },
    });
    return response.data.tours || [];
  }

  /**
   * Get nearby museums
   */
  async getMuseumsNearby(
    lat: number,
    lon: number,
    options?: { radius?: number; languages?: string; limit?: number }
  ): Promise<IziTour[]> {
    const response = await this.api.get('/izi-travel/museums/nearby', {
      params: { lat, lon, ...options },
    });
    return response.data.museums || [];
  }

  /**
   * Get nearby attractions
   */
  async getAttractionsNearby(
    lat: number,
    lon: number,
    options?: { radius?: number; languages?: string; limit?: number }
  ): Promise<IziTour[]> {
    const response = await this.api.get('/izi-travel/attractions/nearby', {
      params: { lat, lon, ...options },
    });
    return response.data.attractions || [];
  }

  /**
   * Get cities with content
   */
  async getCities(languages: string = 'en,ar'): Promise<any[]> {
    const response = await this.api.get('/izi-travel/cities', {
      params: { languages },
    });
    return response.data.cities || [];
  }

  /**
   * Get countries with content
   */
  async getCountries(languages: string = 'en,ar'): Promise<any[]> {
    const response = await this.api.get('/izi-travel/countries', {
      params: { languages },
    });
    return response.data.countries || [];
  }

  /**
   * Get featured content
   */
  async getFeaturedContent(languages: string = 'en,ar'): Promise<any> {
    const response = await this.api.get('/izi-travel/featured', {
      params: { languages },
    });
    return response.data.featured;
  }

  /**
   * Get reviews for an object
   */
  async getReviews(uuid: string, params?: { languages?: string; limit?: number }): Promise<any[]> {
    const response = await this.api.get(`/izi-travel/object/${uuid}/reviews`, { params });
    return response.data.reviews || [];
  }

  /**
   * Get children of an object (e.g., exhibits in museum)
   */
  async getChildren(uuid: string, params?: { languages?: string; form?: string }): Promise<any[]> {
    const response = await this.api.get(`/izi-travel/object/${uuid}/children`, { params });
    return response.data.children || [];
  }

  /**
   * Search by city
   */
  async searchByCity(cityUuid: string, params?: { type?: string; languages?: string }): Promise<IziTour[]> {
    const response = await this.api.get(`/izi-travel/city/${cityUuid}/search`, { params });
    return response.data.results || [];
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages(): Promise<string[]> {
    const response = await this.api.get('/izi-travel/languages');
    return response.data.languages || [];
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await this.api.get('/izi-travel/health');
    return response.data;
  }
}

// Export singleton instance
export const iziTravelService = new IziTravelService();
export default iziTravelService;

