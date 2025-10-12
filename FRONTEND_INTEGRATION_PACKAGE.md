# 🎨 Frontend Integration Package

**For Lovable.dev UI Development**

This document contains everything you need to integrate your Lovable-built UI with the Amrikyy backend.

---

## 📦 QUICK START

### 1. Environment Variables

Create `.env` in your frontend root:

```bash
# Backend API
VITE_BACKEND_API_URL=http://localhost:5001/api

# Supabase (Authentication)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (Payments)
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# App Config
VITE_APP_NAME=Amrikyy
VITE_APP_VERSION=1.0.0
```

---

## 🔌 API CLIENT SETUP

### Install Dependencies

```bash
npm install @tanstack/react-query axios zustand
```

### Create API Client (`src/lib/api.ts`)

```typescript
import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🎯 COMPLETE API ENDPOINTS

### 1. Country Agent Queries (AI Chat)

**Endpoint:** `POST /quantum/agent/query`

**Request:**

```typescript
interface AgentQueryRequest {
  country: 'egypt' | 'saudi' | 'uae';
  query: string;
  context?: {
    tripType?: string;
    budget?: string;
    travelers?: number;
    dates?: string;
  };
}
```

**Response:**

```typescript
interface AgentQueryResponse {
  response: string;
  country: string;
  dnaScore: number;
  confidence: number;
  timestamp: string;
  suggestions?: string[];
}
```

**Example:**

```typescript
const response = await apiClient.post('/quantum/agent/query', {
  country: 'egypt',
  query: 'What are the best family-friendly hotels in Cairo?',
  context: {
    tripType: 'family',
    budget: 'mid-range',
    travelers: 4,
  },
});
```

---

### 2. Flight Search (Sabre)

**Endpoint:** `POST /sabre/flights/search`

**Request:**

```typescript
interface FlightSearchRequest {
  origin: string; // Airport code (e.g., 'JFK')
  destination: string; // Airport code (e.g., 'CAI')
  departureDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD (optional for one-way)
  passengers: {
    adults: number;
    children?: number;
    infants?: number;
  };
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  maxStops?: number;
}
```

**Response:**

```typescript
interface FlightSearchResponse {
  flights: Array<{
    id: string;
    outbound: {
      flightNumber: string;
      airline: string;
      airlineName: string;
      departure: {
        airport: string;
        airportName: string;
        time: string;
        terminal?: string;
      };
      arrival: {
        airport: string;
        airportName: string;
        time: string;
        terminal?: string;
      };
      duration: number; // minutes
      stops: number;
      aircraft?: string;
    };
    inbound?: {
      // Same structure as outbound
    };
    price: {
      total: number;
      currency: string;
      perPerson: number;
      breakdown: {
        baseFare: number;
        taxes: number;
        fees: number;
      };
    };
    baggage: {
      checked: string;
      cabin: string;
    };
    amenities: string[];
    bookingClass: string;
    seatsAvailable: number;
  }>;
  searchId: string;
  timestamp: string;
}
```

---

### 3. Hotel Search (Sabre)

**Endpoint:** `POST /sabre/hotels/search`

**Request:**

```typescript
interface HotelSearchRequest {
  destination: string; // City or area code
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  rooms: number;
  guests: {
    adults: number;
    children?: number;
  };
  minStarRating?: number; // 1-5
  maxPrice?: number;
  amenities?: string[]; // ['wifi', 'pool', 'parking']
}
```

**Response:**

```typescript
interface HotelSearchResponse {
  hotels: Array<{
    id: string;
    name: string;
    starRating: number;
    address: {
      street: string;
      city: string;
      country: string;
      postalCode?: string;
    };
    location: {
      latitude: number;
      longitude: number;
    };
    images: string[];
    description: string;
    amenities: string[];
    rooms: Array<{
      id: string;
      type: string;
      description: string;
      maxOccupancy: number;
      beds: string;
      price: {
        total: number;
        perNight: number;
        currency: string;
      };
      available: number;
    }>;
    rating: {
      overall: number;
      reviews: number;
      breakdown: {
        cleanliness: number;
        service: number;
        location: number;
        value: number;
      };
    };
    cancellationPolicy: string;
  }>;
  searchId: string;
  timestamp: string;
}
```

---

### 4. Tours & Activities (izi.TRAVEL)

**Endpoint:** `GET /izi-travel/search`

**Query Parameters:**

```typescript
interface TourSearchParams {
  country: 'egypt' | 'saudi' | 'uae';
  city?: string;
  category?: string; // 'museum', 'tour', 'landmark'
  language?: string; // 'en', 'ar'
  limit?: number;
}
```

**Response:**

```typescript
interface TourSearchResponse {
  tours: Array<{
    id: string;
    title: string;
    description: string;
    type: 'audio_guide' | 'tour' | 'museum';
    images: string[];
    duration: string;
    languages: string[];
    rating: number;
    price?: {
      amount: number;
      currency: string;
    };
    location: {
      city: string;
      country: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    highlights: string[];
    included: string[];
    excluded?: string[];
  }>;
  total: number;
  page: number;
  limit: number;
}
```

---

### 5. Create Booking

**Endpoint:** `POST /sabre/bookings/create`

**Request:**

```typescript
interface CreateBookingRequest {
  flights?: {
    searchId: string;
    flightId: string;
  };
  hotel?: {
    searchId: string;
    hotelId: string;
    roomId: string;
  };
  tours?: Array<{
    tourId: string;
    date: string;
    participants: number;
  }>;
  passengers: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'M' | 'F';
    passportNumber?: string;
    passportExpiry?: string;
    nationality?: string;
    email: string;
    phone: string;
    isLeadPassenger: boolean;
  }>;
  contactInfo: {
    email: string;
    phone: string;
    address?: {
      street: string;
      city: string;
      country: string;
      postalCode: string;
    };
  };
  paymentIntentId: string; // From Stripe
}
```

**Response:**

```typescript
interface CreateBookingResponse {
  success: boolean;
  bookingReference: string;
  pnr?: string; // Passenger Name Record
  confirmationNumber: string;
  totalPrice: {
    amount: number;
    currency: string;
  };
  bookingDetails: {
    flights?: any;
    hotel?: any;
    tours?: any[];
  };
  ticketingDeadline?: string;
  createdAt: string;
}
```

---

### 6. Payment Intent (Stripe)

**Endpoint:** `POST /payment/create-intent`

**Request:**

```typescript
interface PaymentIntentRequest {
  amount: number; // In cents (e.g., 50000 = $500)
  currency: string; // 'usd', 'eur', 'sar', 'aed', 'egp'
  metadata?: {
    bookingType: string;
    destination: string;
    passengers: number;
  };
}
```

**Response:**

```typescript
interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}
```

---

### 7. Admin Dashboard

**Endpoint:** `GET /admin/dashboard/overview`

**Response:**

```typescript
interface AdminDashboardResponse {
  metrics: {
    totalBookings: {
      count: number;
      trend: number; // percentage change
    };
    revenue: {
      amount: number;
      currency: string;
      trend: number;
    };
    activeUsers: {
      count: number;
      trend: number;
    };
    systemHealth: {
      status: 'healthy' | 'degraded' | 'down';
      uptime: number; // percentage
    };
  };
  recentBookings: Array<{
    id: string;
    customerName: string;
    destination: string;
    date: string;
    amount: number;
    status: 'confirmed' | 'pending' | 'cancelled';
  }>;
  agentPerformance: {
    egypt: {
      dnaScore: number;
      totalQueries: number;
      successRate: number;
    };
    saudi: {
      dnaScore: number;
      totalQueries: number;
      successRate: number;
    };
    uae: {
      dnaScore: number;
      totalQueries: number;
      successRate: number;
    };
  };
  chartData: {
    revenue: Array<{ date: string; amount: number }>;
    bookingsByCountry: Array<{ country: string; count: number }>;
  };
}
```

---

## 🪝 REACT QUERY HOOKS

### Create hooks file (`src/hooks/useAPI.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api';

// AI Agent Query
export const useAgentQuery = () => {
  return useMutation({
    mutationFn: async (data: AgentQueryRequest) => {
      const response = await apiClient.post('/quantum/agent/query', data);
      return response.data;
    },
  });
};

// Flight Search
export const useFlightSearch = () => {
  return useMutation({
    mutationFn: async (data: FlightSearchRequest) => {
      const response = await apiClient.post('/sabre/flights/search', data);
      return response.data;
    },
  });
};

// Hotel Search
export const useHotelSearch = () => {
  return useMutation({
    mutationFn: async (data: HotelSearchRequest) => {
      const response = await apiClient.post('/sabre/hotels/search', data);
      return response.data;
    },
  });
};

// Tours Search
export const useToursSearch = (params: TourSearchParams) => {
  return useQuery({
    queryKey: ['tours', params],
    queryFn: async () => {
      const response = await apiClient.get('/izi-travel/search', { params });
      return response.data;
    },
    enabled: !!params.country,
  });
};

// Create Booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBookingRequest) => {
      const response = await apiClient.post('/sabre/bookings/create', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

// Payment Intent
export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: async (data: PaymentIntentRequest) => {
      const response = await apiClient.post('/payment/create-intent', data);
      return response.data;
    },
  });
};

// Admin Dashboard
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/dashboard/overview');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
```

---

## 🎭 MOCK DATA (For Development)

### Mock Agent Response

```typescript
export const mockAgentResponse: AgentQueryResponse = {
  response:
    "Cairo offers excellent family-friendly hotels! I recommend the Marriott Mena House near the Pyramids - it has a pool, kids' club, and stunning views. The Four Seasons at Nile Plaza is also great with its family suites and riverside location. For budget-friendly options, check out the Steigenberger Pyramids Cairo.",
  country: 'egypt',
  dnaScore: 850,
  confidence: 0.95,
  timestamp: new Date().toISOString(),
  suggestions: [
    'Would you like me to search for available rooms?',
    'Should I also suggest family-friendly activities nearby?',
    'Do you need information about transportation from the airport?',
  ],
};
```

### Mock Flight Results

```typescript
export const mockFlights: FlightSearchResponse = {
  flights: [
    {
      id: 'FL001',
      outbound: {
        flightNumber: 'MS986',
        airline: 'MS',
        airlineName: 'EgyptAir',
        departure: {
          airport: 'JFK',
          airportName: 'John F. Kennedy International',
          time: '2024-03-15T23:30:00Z',
          terminal: '4',
        },
        arrival: {
          airport: 'CAI',
          airportName: 'Cairo International',
          time: '2024-03-16T17:45:00Z',
          terminal: '3',
        },
        duration: 675,
        stops: 0,
        aircraft: 'Boeing 777-300ER',
      },
      price: {
        total: 1250.0,
        currency: 'USD',
        perPerson: 625.0,
        breakdown: {
          baseFare: 1000.0,
          taxes: 180.0,
          fees: 70.0,
        },
      },
      baggage: {
        checked: '2 pieces',
        cabin: '1 piece (23kg)',
      },
      amenities: ['WiFi', 'Entertainment', 'Meals included', 'Power outlets'],
      bookingClass: 'Y',
      seatsAvailable: 8,
    },
  ],
  searchId: 'search_' + Date.now(),
  timestamp: new Date().toISOString(),
};
```

### Mock Hotels

```typescript
export const mockHotels: HotelSearchResponse = {
  hotels: [
    {
      id: 'HTL001',
      name: 'Marriott Mena House, Cairo',
      starRating: 5,
      address: {
        street: '6 Pyramids Road, Giza',
        city: 'Cairo',
        country: 'Egypt',
        postalCode: '12556',
      },
      location: {
        latitude: 29.9799,
        longitude: 31.134,
      },
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
      ],
      description:
        'Historic luxury hotel with stunning pyramid views, located at the foot of the Great Pyramids of Giza.',
      amenities: [
        'Pool',
        'Spa',
        'Restaurant',
        'WiFi',
        'Parking',
        'Gym',
        'Kids Club',
        'Room Service',
      ],
      rooms: [
        {
          id: 'RM001',
          type: 'Deluxe Pyramid View',
          description: 'Spacious room with direct pyramid views and king bed',
          maxOccupancy: 3,
          beds: '1 King or 2 Twin',
          price: {
            total: 450.0,
            perNight: 150.0,
            currency: 'USD',
          },
          available: 5,
        },
      ],
      rating: {
        overall: 4.7,
        reviews: 2847,
        breakdown: {
          cleanliness: 4.8,
          service: 4.9,
          location: 5.0,
          value: 4.5,
        },
      },
      cancellationPolicy: 'Free cancellation until 48 hours before check-in',
    },
  ],
  searchId: 'search_' + Date.now(),
  timestamp: new Date().toISOString(),
};
```

---

## 🏪 ZUSTAND STORE

### Create store (`src/store/tripStore.ts`)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TripState {
  // Selected country
  selectedCountry: 'egypt' | 'saudi' | 'uae' | null;
  setSelectedCountry: (country: 'egypt' | 'saudi' | 'uae') => void;

  // Trip details
  tripDetails: {
    destination: string;
    departureDate: string;
    returnDate: string;
    travelers: {
      adults: number;
      children: number;
    };
    budgetRange: [number, number];
    tripStyle: string[];
    specialRequests: string;
  };
  updateTripDetails: (details: Partial<TripState['tripDetails']>) => void;

  // Selected items
  selectedFlight: any | null;
  setSelectedFlight: (flight: any) => void;

  selectedHotel: any | null;
  setSelectedHotel: (hotel: any) => void;

  selectedTours: any[];
  addTour: (tour: any) => void;
  removeTour: (tourId: string) => void;

  // Total calculation
  getTotalPrice: () => number;

  // Reset
  resetTrip: () => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      selectedCountry: null,
      setSelectedCountry: (country) => set({ selectedCountry: country }),

      tripDetails: {
        destination: '',
        departureDate: '',
        returnDate: '',
        travelers: { adults: 1, children: 0 },
        budgetRange: [500, 5000],
        tripStyle: [],
        specialRequests: '',
      },
      updateTripDetails: (details) =>
        set((state) => ({
          tripDetails: { ...state.tripDetails, ...details },
        })),

      selectedFlight: null,
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),

      selectedHotel: null,
      setSelectedHotel: (hotel) => set({ selectedHotel: hotel }),

      selectedTours: [],
      addTour: (tour) =>
        set((state) => ({
          selectedTours: [...state.selectedTours, tour],
        })),
      removeTour: (tourId) =>
        set((state) => ({
          selectedTours: state.selectedTours.filter((t) => t.id !== tourId),
        })),

      getTotalPrice: () => {
        const { selectedFlight, selectedHotel, selectedTours } = get();
        let total = 0;
        if (selectedFlight) total += selectedFlight.price.total;
        if (selectedHotel) total += selectedHotel.rooms[0].price.total;
        selectedTours.forEach((tour) => {
          if (tour.price) total += tour.price.amount;
        });
        return total;
      },

      resetTrip: () =>
        set({
          selectedCountry: null,
          tripDetails: {
            destination: '',
            departureDate: '',
            returnDate: '',
            travelers: { adults: 1, children: 0 },
            budgetRange: [500, 5000],
            tripStyle: [],
            specialRequests: '',
          },
          selectedFlight: null,
          selectedHotel: null,
          selectedTours: [],
        }),
    }),
    {
      name: 'amrikyy-trip-storage',
    }
  )
);
```

---

## ✨ EXAMPLE COMPONENT USAGE

### Flight Search Component

```typescript
import { useFlightSearch } from '../hooks/useAPI';
import { useTripStore } from '../store/tripStore';

export const FlightSearch = () => {
  const { tripDetails } = useTripStore();
  const flightSearch = useFlightSearch();

  const handleSearch = () => {
    flightSearch.mutate({
      origin: 'JFK',
      destination: tripDetails.destination,
      departureDate: tripDetails.departureDate,
      returnDate: tripDetails.returnDate,
      passengers: {
        adults: tripDetails.travelers.adults,
        children: tripDetails.travelers.children,
      },
      cabinClass: 'economy',
    });
  };

  return (
    <div>
      <button onClick={handleSearch} disabled={flightSearch.isPending}>
        {flightSearch.isPending ? 'Searching...' : 'Search Flights'}
      </button>

      {flightSearch.isSuccess && (
        <div>
          {flightSearch.data.flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      )}

      {flightSearch.isError && (
        <div className="error">Error: {flightSearch.error.message}</div>
      )}
    </div>
  );
};
```

---

## 🎨 READY TO INTEGRATE

✅ **Copy API types to your Lovable project**  
✅ **Install dependencies**  
✅ **Create API client**  
✅ **Add React Query hooks**  
✅ **Use mock data initially**  
✅ **Swap to real endpoints when ready**

---

## 🤝 NEED HELP?

Just ask! I'll:

- Generate more mock data
- Create additional hooks
- Debug integration issues
- Add more endpoints
- Optimize API calls

**Now go build that beautiful UI! 🚀**
