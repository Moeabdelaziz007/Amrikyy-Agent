# 🔗 Lovable UI → Backend Integration Guide

**When Lovable finishes building your UI, use this guide to connect it to the real backend APIs.**

---

## 📦 STEP 1: Export from Lovable

1. **Click "Export" or "Download"** in Lovable
2. **Extract the ZIP file**
3. **Move contents to `frontend/` directory**

```bash
# Structure should look like:
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── store/
│   └── App.tsx
├── public/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🔧 STEP 2: Install Dependencies

```bash
cd frontend
npm install

# Additional packages (if not already installed by Lovable)
npm install @tanstack/react-query axios zustand
npm install @supabase/supabase-js
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

## 🔐 STEP 3: Setup Environment Variables

Follow `FRONTEND_ENV_SETUP.md` to create your `.env` file.

**Quick version:**

```bash
# frontend/.env
VITE_BACKEND_API_URL=http://localhost:5001/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

---

## 📡 STEP 4: Create API Client

Create `frontend/src/lib/apiClient.ts`:

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

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🪝 STEP 5: Create React Query Hooks

Create `frontend/src/hooks/useAPI.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';

// ============================================================================
// COUNTRY AGENT (AI Chat)
// ============================================================================

export const useAgentQuery = () => {
  return useMutation({
    mutationFn: async (data: {
      country: 'egypt' | 'saudi' | 'uae';
      query: string;
      context?: any;
    }) => {
      const response = await apiClient.post('/quantum/agent/query', data);
      return response.data;
    },
  });
};

// ============================================================================
// FLIGHT SEARCH
// ============================================================================

export const useFlightSearch = () => {
  return useMutation({
    mutationFn: async (data: {
      origin: string;
      destination: string;
      departureDate: string;
      returnDate?: string;
      passengers: {
        adults: number;
        children?: number;
        infants?: number;
      };
      cabinClass?: 'economy' | 'business' | 'first';
    }) => {
      const response = await apiClient.post('/sabre/flights/search', data);
      return response.data;
    },
  });
};

// ============================================================================
// HOTEL SEARCH
// ============================================================================

export const useHotelSearch = () => {
  return useMutation({
    mutationFn: async (data: {
      destination: string;
      checkInDate: string;
      checkOutDate: string;
      rooms: number;
      guests: {
        adults: number;
        children?: number;
      };
      minStarRating?: number;
    }) => {
      const response = await apiClient.post('/sabre/hotels/search', data);
      return response.data;
    },
  });
};

// ============================================================================
// TOURS & ACTIVITIES
// ============================================================================

export const useToursSearch = (params: {
  country: 'egypt' | 'saudi' | 'uae';
  city?: string;
  category?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['tours', params],
    queryFn: async () => {
      const response = await apiClient.get('/izi-travel/search', { params });
      return response.data;
    },
    enabled: !!params.country,
  });
};

// ============================================================================
// CREATE BOOKING
// ============================================================================

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      flights?: any;
      hotel?: any;
      tours?: any[];
      passengers: any[];
      contactInfo: any;
      paymentIntentId: string;
    }) => {
      const response = await apiClient.post('/sabre/bookings/create', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

// ============================================================================
// PAYMENT INTENT
// ============================================================================

export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: async (data: {
      amount: number;
      currency: string;
      metadata?: any;
    }) => {
      const response = await apiClient.post('/payment/create-intent', data);
      return response.data;
    },
  });
};

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================

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

## 🎨 STEP 6: Update Your Components

### **Example: Plan Page (Trip Planner)**

Replace mock API calls with real hooks:

```typescript
// frontend/src/pages/PlanPage.tsx
import { useAgentQuery } from '@/hooks/useAPI';
import { useTripStore } from '@/store/tripStore';

export function PlanPage() {
  const { selectedCountry, tripDetails } = useTripStore();
  const agentQuery = useAgentQuery();

  const handleAskAgent = async (question: string) => {
    try {
      const response = await agentQuery.mutateAsync({
        country: selectedCountry || 'egypt',
        query: question,
        context: {
          tripType: tripDetails.tripStyle,
          budget: tripDetails.budgetRange[1],
          travelers: tripDetails.travelers.adults,
        },
      });

      // Display response in chat
      console.log('Agent response:', response.response);
    } catch (error) {
      console.error('Agent query failed:', error);
    }
  };

  return (
    <div>
      {/* Your Lovable UI */}
      <button onClick={() => handleAskAgent('Best time to visit?')}>
        Ask Agent
      </button>

      {agentQuery.isPending && <div>Agent thinking...</div>}
      {agentQuery.isError && <div>Error: {agentQuery.error.message}</div>}
      {agentQuery.isSuccess && <div>{agentQuery.data.response}</div>}
    </div>
  );
}
```

### **Example: Results Page (Flight Search)**

```typescript
// frontend/src/pages/ResultsPage.tsx
import { useFlightSearch } from '@/hooks/useAPI';
import { useTripStore } from '@/store/tripStore';

export function ResultsPage() {
  const { tripDetails } = useTripStore();
  const flightSearch = useFlightSearch();

  useEffect(() => {
    // Search flights on page load
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
  }, []);

  return (
    <div>
      {flightSearch.isPending && <div>Searching flights...</div>}

      {flightSearch.isSuccess && (
        <div>
          {flightSearch.data.flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      )}

      {flightSearch.isError && <div>Error: {flightSearch.error.message}</div>}
    </div>
  );
}
```

### **Example: Checkout Page (Payment)**

```typescript
// frontend/src/pages/CheckoutPage.tsx
import { useCreatePaymentIntent, useCreateBooking } from '@/hooks/useAPI';
import { useTripStore } from '@/store/tripStore';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export function CheckoutPage() {
  const { getTotalPrice, selectedFlight, selectedHotel, selectedTours } =
    useTripStore();
  const createPaymentIntent = useCreatePaymentIntent();
  const createBooking = useCreateBooking();

  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent on load
    const totalAmount = getTotalPrice();
    createPaymentIntent.mutate(
      {
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          bookingType: 'travel_package',
        },
      },
      {
        onSuccess: (data) => {
          setClientSecret(data.clientSecret);
        },
      }
    );
  }, []);

  const handleCompleteBooking = async (paymentIntentId: string) => {
    try {
      const result = await createBooking.mutateAsync({
        flights: selectedFlight ? { flightId: selectedFlight.id } : undefined,
        hotel: selectedHotel ? { hotelId: selectedHotel.id } : undefined,
        tours: selectedTours,
        passengers: [
          /* passenger data from form */
        ],
        contactInfo: {
          /* contact data from form */
        },
        paymentIntentId,
      });

      alert(`Booking confirmed! Reference: ${result.bookingReference}`);
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  return (
    <div>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm onSuccess={handleCompleteBooking} />
        </Elements>
      )}
    </div>
  );
}
```

---

## 🧪 STEP 7: Test Integration

### **Start Backend**

```bash
# Terminal 1
cd backend
npm start
# Backend running on http://localhost:5001
```

### **Start Frontend**

```bash
# Terminal 2
cd frontend
npm run dev
# Frontend running on http://localhost:3000
```

### **Test Flow:**

1. **Landing Page** → Select country → Go to Plan
2. **Plan Page** → Fill form → Ask AI agent → Submit
3. **Results Page** → Search flights/hotels → Select items
4. **Checkout** → Enter details → Complete payment
5. **Admin Dashboard** → View metrics

---

## 🐛 STEP 8: Debug Common Issues

### **CORS Errors**

If you see `Access-Control-Allow-Origin` errors:

```bash
# backend/.env
FRONTEND_URL=http://localhost:3000
```

Backend already handles CORS, just ensure `FRONTEND_URL` is set.

### **401 Unauthorized**

If all requests fail with 401:

```typescript
// Check if token is being sent
console.log('Access token:', localStorage.getItem('access_token'));

// Temporarily disable auth for testing
// backend/server.js - comment out auth middleware
```

### **Network Timeout**

If requests timeout:

```typescript
// Increase timeout in apiClient
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds instead of 30
});
```

---

## ✅ STEP 9: Verification Checklist

- [ ] Frontend loads without errors
- [ ] Backend health check works: `http://localhost:5001/api/health`
- [ ] AI agent responds in Plan page
- [ ] Flight search returns results
- [ ] Hotel search returns results
- [ ] Tours load for selected country
- [ ] Stripe payment intent creates successfully
- [ ] Booking completes end-to-end
- [ ] Admin dashboard loads metrics

---

## 🚀 STEP 10: Deploy

### **Frontend (Vercel)**

```bash
# Push to GitHub
git add frontend/
git commit -m "feat: Integrate Lovable UI with backend"
git push

# Deploy to Vercel
# Go to vercel.com → Import project → Select repo
# Vercel auto-detects frontend/ as React app
# Add environment variables in Vercel dashboard
```

### **Backend (Already on Railway)**

Backend is already deployed! Just ensure environment variables are set in Railway.

---

## 🎉 DONE!

Your Lovable UI is now connected to the real Amrikyy backend!

**Next Steps:**

- Polish animations
- Add loading skeletons
- Improve error messages
- Add toast notifications
- Beta test with real users

**You're ready to LAUNCH! 🚀**
