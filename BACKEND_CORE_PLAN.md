# 🔧 Backend Core - Complete Implementation Plan

**Goal**: Build rock-solid backend API for the travel booking MVP

**Focus**: Authentication, Search, Booking, Payment - all production-ready

**Timeline**: 2-3 weeks (24-30 hours)

---

## 🎯 BACKEND ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    API LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Auth   │  │  Search  │  │ Booking  │             │
│  │  Routes  │  │  Routes  │  │  Routes  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  MIDDLEWARE LAYER                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Auth   │  │   Rate   │  │  Error   │             │
│  │  Guard   │  │ Limiting │  │ Handler  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  SERVICE LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Auth   │  │  Flight  │  │ Booking  │             │
│  │ Service  │  │ Service  │  │ Service  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  ┌──────────┐  ┌──────────┐                            │
│  │  Stripe  │  │  Email   │                            │
│  │ Service  │  │ Service  │                            │
│  └──────────┘  └──────────┘                            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   DATA LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Supabase │  │  Redis   │  │  Kiwi    │             │
│  │   (DB)   │  │ (Cache)  │  │   API    │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 TASK 1: Setup Backend Core Structure

### **What I'll Do**:
1. Verify all dependencies installed
2. Check environment variables
3. Create core folder structure
4. Set up logging system
5. Configure error handling
6. Test server starts

### **Folder Structure**:
```
backend/
├── src/
│   ├── services/          # Business logic
│   │   ├── authService.js
│   │   ├── flightService.js
│   │   ├── bookingService.js
│   │   ├── stripeService.js
│   │   └── emailService.js
│   ├── routes/            # API endpoints
│   │   ├── auth.js
│   │   ├── flights.js
│   │   ├── bookings.js
│   │   └── payments.js
│   ├── middleware/        # Express middleware
│   │   ├── authMiddleware.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── models/            # Data models
│   │   ├── User.js
│   │   ├── Booking.js
│   │   └── Flight.js
│   └── utils/             # Utilities
│       ├── logger.js
│       ├── validator.js
│       └── helpers.js
├── tests/                 # Test files
├── .env                   # Environment variables
└── server.js              # Main entry point
```

---

## 📋 TASK 2: Create Supabase Database Schema

### **Tables to Create**:

#### **1. Users Table** (handled by Supabase Auth)
```sql
-- Supabase auth.users already exists
-- We'll extend with a profiles table

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### **2. Bookings Table**
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Flight Data
  flight_data JSONB NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  
  -- Travelers
  travelers JSONB NOT NULL,
  num_travelers INTEGER NOT NULL,
  
  -- Pricing
  total_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Payment
  payment_status TEXT DEFAULT 'pending',
  payment_intent_id TEXT,
  stripe_payment_id TEXT,
  
  -- Booking Status
  booking_status TEXT DEFAULT 'pending',
  booking_reference TEXT UNIQUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own bookings
CREATE POLICY "Users can read own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create bookings
CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
```

#### **3. Flight Searches Table** (for caching)
```sql
CREATE TABLE flight_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_params JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- Index for quick lookups
CREATE INDEX idx_flight_searches_params ON flight_searches USING GIN (search_params);
CREATE INDEX idx_flight_searches_expires ON flight_searches(expires_at);

-- Auto-delete expired searches
CREATE OR REPLACE FUNCTION delete_expired_searches()
RETURNS void AS $$
BEGIN
  DELETE FROM flight_searches WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

---

## 📋 TASK 3: Build Authentication Service

### **File**: `backend/src/services/authService.js`

```javascript
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class AuthService {
  /**
   * Sign up new user
   */
  async signUp(email, password, fullName) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: fullName,
        });

      if (profileError) throw profileError;

      logger.info(`User signed up: ${email}`);
      return { user: authData.user, session: authData.session };
    } catch (error) {
      logger.error('Sign up error:', error);
      throw error;
    }
  }

  /**
   * Sign in user
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      logger.info(`User signed in: ${email}`);
      return { user: data.user, session: data.session };
    } catch (error) {
      logger.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign out user
   */
  async signOut(token) {
    try {
      const { error } = await supabase.auth.signOut(token);
      if (error) throw error;

      logger.info('User signed out');
      return { success: true };
    } catch (error) {
      logger.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get user by token
   */
  async getUserByToken(token) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error) throw error;
      return user;
    } catch (error) {
      logger.error('Get user error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
      });

      if (error) throw error;

      logger.info(`Password reset sent to: ${email}`);
      return { success: true };
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
```

---

## 📋 TASK 4: Create Flight Search Service

### **File**: `backend/src/services/flightService.js`

```javascript
const axios = require('axios');
const logger = require('../utils/logger');
const redisCache = require('../cache/RedisCache');

class FlightService {
  constructor() {
    this.kiwiApiKey = process.env.KIWI_API_KEY;
    this.kiwiBaseUrl = 'https://api.tequila.kiwi.com';
  }

  /**
   * Search flights
   */
  async searchFlights(params) {
    try {
      const { origin, destination, departureDate, returnDate, adults = 1, children = 0, infants = 0 } = params;

      // Check cache first
      const cacheKey = `flight:${origin}:${destination}:${departureDate}:${returnDate}:${adults}`;
      const cached = await redisCache.get(cacheKey);
      if (cached) {
        logger.info('Flight search cache hit');
        return cached;
      }

      // Call Kiwi API
      const response = await axios.get(`${this.kiwiBaseUrl}/v2/search`, {
        headers: {
          'apikey': this.kiwiApiKey,
        },
        params: {
          fly_from: origin,
          fly_to: destination,
          date_from: departureDate,
          date_to: departureDate,
          return_from: returnDate,
          return_to: returnDate,
          adults,
          children,
          infants,
          curr: 'USD',
          limit: 50,
        },
      });

      const flights = this.formatFlightResults(response.data.data);

      // Cache for 5 minutes
      await redisCache.set(cacheKey, flights, 300);

      logger.info(`Found ${flights.length} flights`);
      return flights;
    } catch (error) {
      logger.error('Flight search error:', error);
      throw new Error('Failed to search flights');
    }
  }

  /**
   * Format flight results
   */
  formatFlightResults(rawFlights) {
    return rawFlights.map(flight => ({
      id: flight.id,
      origin: flight.cityFrom,
      destination: flight.cityTo,
      departure: {
        time: flight.local_departure,
        airport: flight.flyFrom,
      },
      arrival: {
        time: flight.local_arrival,
        airport: flight.flyTo,
      },
      duration: flight.duration.total,
      stops: flight.route.length - 1,
      price: flight.price,
      currency: flight.currency || 'USD',
      airline: flight.airlines[0],
      deepLink: flight.deep_link,
    }));
  }

  /**
   * Get flight details
   */
  async getFlightDetails(flightId) {
    try {
      // Implementation depends on Kiwi API capabilities
      logger.info(`Getting flight details: ${flightId}`);
      return { id: flightId, details: 'Flight details' };
    } catch (error) {
      logger.error('Get flight details error:', error);
      throw error;
    }
  }
}

module.exports = new FlightService();
```

---

## 📋 TASK 5: Build Booking Service

### **File**: `backend/src/services/bookingService.js`

```javascript
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
const { generateBookingReference } = require('../utils/helpers');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class BookingService {
  /**
   * Create booking
   */
  async createBooking(userId, bookingData) {
    try {
      const bookingReference = generateBookingReference();

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          flight_data: bookingData.flightData,
          origin: bookingData.origin,
          destination: bookingData.destination,
          departure_date: bookingData.departureDate,
          return_date: bookingData.returnDate,
          travelers: bookingData.travelers,
          num_travelers: bookingData.travelers.length,
          total_price: bookingData.totalPrice,
          currency: bookingData.currency || 'USD',
          booking_reference: bookingReference,
          booking_status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      logger.info(`Booking created: ${bookingReference}`);
      return data;
    } catch (error) {
      logger.error('Create booking error:', error);
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  async getBooking(bookingId, userId) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get booking error:', error);
      throw error;
    }
  }

  /**
   * Get user bookings
   */
  async getUserBookings(userId) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get user bookings error:', error);
      throw error;
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId, status, paymentData = {}) {
    try {
      const updateData = {
        booking_status: status,
        updated_at: new Date().toISOString(),
      };

      if (paymentData.paymentStatus) {
        updateData.payment_status = paymentData.paymentStatus;
      }
      if (paymentData.paymentIntentId) {
        updateData.payment_intent_id = paymentData.paymentIntentId;
      }
      if (paymentData.stripePaymentId) {
        updateData.stripe_payment_id = paymentData.stripePaymentId;
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      logger.info(`Booking updated: ${bookingId} - ${status}`);
      return data;
    } catch (error) {
      logger.error('Update booking error:', error);
      throw error;
    }
  }
}

module.exports = new BookingService();
```

---

## 🚀 READY TO START?

**Say**: "Start Task 1 - Setup backend core structure"

And I'll begin building the backend! 🔧

---

**Created by**: Ona AI Assistant  
**Date**: October 21, 2025  
**Status**: ✅ **READY TO EXECUTE**
