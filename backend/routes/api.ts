import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * API Service Layer for QuantumOS Mini-Apps
 */
export const apiService = {
  // --- Agent Task Processing ---
  processAgentTask: (miniAppId: string, action: string, data: any) => {
    return apiClient.post('/travel-agents/request', { miniAppId, action, data });
  },

  getTaskStatus: (taskId: string) => {
    return apiClient.get(`/travel-agents/task/${taskId}`);
  },

  // --- AI Notes API ---
  getNotes: () => {
    // Placeholder: Replace with actual endpoint
    return Promise.resolve({ data: { notes: [] } });
  },
  saveNote: (note: any) => {
    // Placeholder
    return Promise.resolve({ data: { note } });
  },

  // --- AI Maps API ---
  searchPlaces: (query: string) => {
    return apiClient.get(`/flights/locations?query=${query}`); // Using flights/locations as a proxy
  },
  getDirections: (origin: string, destination: string) => {
    // This would call a Mapbox or Google Directions API endpoint
    return Promise.resolve({ data: { route: {} } });
  },

  // --- AI Travel API ---
  planTrip: (tripDetails: any) => {
    return apiService.processAgentTask('ai-travel', 'plan_trip', tripDetails);
  },

  // --- AI Market API ---
  getMarketData: (symbol: string) => {
    // Placeholder
    return Promise.resolve({ data: { symbol, price: Math.random() * 1000 } });
  },

  // --- Gemini AI Processing ---
  sendToGemini: (prompt: string) => {
    return apiClient.post('/ai/smart-chat', { message: prompt });
  },
};

export default apiService;
