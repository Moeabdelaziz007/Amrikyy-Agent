# 🎨 Frontend UI Specification for Amrikyy Travel Agent

## Overview

This document specifies exactly what needs to be built in the frontend UI. All backend APIs are ready and documented here.

---

## 🏠 **Page 1: Landing/Home Page**

### Purpose

First impression, value proposition, country selection

### Components Needed

#### 1. Hero Section

```tsx
<Hero>
  - Headline: "Plan Your Perfect Trip to the Middle East" - Subheadline:
  "AI-powered travel planning for Egypt, Saudi Arabia & UAE" - CTA Button:
  "Start Planning" → /planner - Background: Stunning image carousel (Pyramids,
  Mecca, Dubai)
</Hero>
```

#### 2. Country Cards

```tsx
<CountrySelector>
  - Card 1: Egypt 🇪🇬 - Icon/Image: Pyramids - Description: "Ancient wonders &
  Nile cruises" - Button: "Explore Egypt" → /planner?country=egypt - Card 2:
  Saudi Arabia 🇸🇦 - Icon/Image: Kaaba - Description: "Hajj, Umrah & Islamic
  heritage" - Button: "Explore Saudi" → /planner?country=saudi - Card 3: UAE 🇦🇪
  - Icon/Image: Burj Khalifa - Description: "Luxury & modern marvels" - Button:
  "Explore UAE" → /planner?country=uae
</CountrySelector>
```

#### 3. Features Section

```tsx
<Features>
  - Feature 1: AI-Powered Planning (icon: brain) - Feature 2: Real-Time Bookings
  (icon: ticket) - Feature 3: Audio Tours (icon: headphones) - Feature 4: Best
  Prices (icon: dollar)
</Features>
```

#### 4. How It Works

```tsx
<HowItWorks>
  Step 1: Choose destination Step 2: Tell us your preferences Step 3: Get
  AI-generated itinerary Step 4: Book instantly
</HowItWorks>
```

### API Calls

None (static page)

---

## 🗺️ **Page 2: Trip Planner**

### Purpose

Collect user preferences and generate itinerary

### Components Needed

#### 1. Destination Selector

```tsx
<DestinationSelector
  value={country}
  onChange={setCountry}
  options={[
    { value: 'egypt', label: 'Egypt 🇪🇬', icon: pyramids },
    { value: 'saudi', label: 'Saudi Arabia 🇸🇦', icon: kaaba },
    { value: 'uae', label: 'UAE 🇦🇪', icon: burj },
  ]}
/>
```

#### 2. Date Picker

```tsx
<DateRangePicker
  startDate={departureDate}
  endDate={returnDate}
  onChange={setDates}
  minDate={today}
  placeholder="Select travel dates"
/>
```

#### 3. Traveler Counter

```tsx
<TravelerCounter>
  - Adults: <NumberInput min={1} max={9} />
  - Children: <NumberInput min={0} max={9} />
  - Infants: <NumberInput min={0} max={4} />
</TravelerCounter>
```

#### 4. Budget Selector

```tsx
<BudgetSelector
  value={budget}
  onChange={setBudget}
  options={[
    { value: 'budget', label: 'Budget ($50-$100/day)', icon: '💰' },
    { value: 'moderate', label: 'Moderate ($100-$250/day)', icon: '💵' },
    { value: 'luxury', label: 'Luxury ($250+/day)', icon: '💎' },
  ]}
/>
```

#### 5. Interest Tags

```tsx
<InterestSelector
  multiple
  value={interests}
  onChange={setInterests}
  options={[
    { value: 'history', label: 'History & Culture', icon: '🏛️' },
    { value: 'adventure', label: 'Adventure', icon: '🏔️' },
    { value: 'food', label: 'Food & Dining', icon: '🍽️' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'beach', label: 'Beach & Relaxation', icon: '🏖️' },
    { value: 'nightlife', label: 'Nightlife', icon: '🌃' },
  ]}
/>
```

#### 6. Submit Button

```tsx
<Button onClick={handleGenerateItinerary} loading={loading} size="large">
  Create My Itinerary
</Button>
```

### API Calls

**1. Query Country Agent Network**

```typescript
POST /api/quantum/network/query

Request:
{
  "query": "Plan a 7-day trip with history and culture interests",
  "context": {
    "country": "Egypt",
    "dates": { "start": "2025-12-15", "end": "2025-12-22" },
    "travelers": { "adults": 2, "children": 1 },
    "budget": "moderate",
    "interests": ["history", "culture"]
  }
}

Response:
{
  "success": true,
  "agent": "Egypt Travel Expert",
  "response": {
    "type": "itinerary",
    "recommendations": [...tours/attractions]
  }
}
```

**2. Search Flights**

```typescript
POST /api/sabre/flights/search

Request:
{
  "origin": "CAI", // User's origin airport
  "destination": "CAI", // Egypt
  "departureDate": "2025-12-15",
  "returnDate": "2025-12-22",
  "adults": 2,
  "children": 1
}

Response:
{
  "success": true,
  "count": 15,
  "flights": [
    {
      "id": "flight_0",
      "price": { "total": 1200, "currency": "USD" },
      "segments": [...flight details]
    }
  ]
}
```

**3. Search Hotels**

```typescript
POST /api/sabre/hotels/search

Request:
{
  "location": "CAI",
  "checkIn": "2025-12-15",
  "checkOut": "2025-12-22",
  "adults": 2,
  "rooms": 1
}

Response:
{
  "success": true,
  "count": 20,
  "hotels": [
    {
      "id": "hotel_0",
      "name": "Marriott Cairo",
      "price": { "total": 700, "currency": "USD" },
      "rating": 4.5
    }
  ]
}
```

**4. Get Tours**

```typescript
POST /api/quantum/network/query

Request:
{
  "query": "Show me tours and attractions",
  "context": { "country": "Egypt" }
}

Response:
{
  "success": true,
  "response": {
    "type": "attractions",
    "highlights": [...izi.TRAVEL tours with audio guides]
  }
}
```

---

## 📋 **Page 3: Results Page**

### Purpose

Display generated itinerary with flight, hotel, and tour options

### Components Needed

#### 1. Itinerary Summary

```tsx
<ItinerarySummary>
  - Destination: Egypt 🇪🇬 - Dates: Dec 15-22, 2025 - Duration: 7 nights, 8 days
  - Travelers: 2 adults, 1 child - Total Price: $3,200
</ItinerarySummary>
```

#### 2. Day-by-Day Itinerary

```tsx
<DayByDay>
  {itinerary.days.map((day) => (
    <DayCard key={day.number}>
      <h3>
        Day {day.number}: {day.title}
      </h3>
      <Timeline>
        {day.activities.map((activity) => (
          <Activity>
            <Time>{activity.time}</Time>
            <Icon>{activity.icon}</Icon>
            <Details>
              <Title>{activity.title}</Title>
              <Description>{activity.description}</Description>
            </Details>
          </Activity>
        ))}
      </Timeline>
    </DayCard>
  ))}
</DayByDay>
```

#### 3. Flight Options

```tsx
<FlightSelector>
  {flights.map((flight) => (
    <FlightCard
      key={flight.id}
      selected={selectedFlight === flight.id}
      onClick={() => setSelectedFlight(flight.id)}
    >
      <FlightDetails>
        - Airline: {flight.airline}- Departure: {flight.segments[0].departure}-
        Arrival: {flight.segments[0].arrival}- Duration: {flight.duration}-
        Stops: {flight.segments.length - 1}
      </FlightDetails>
      <Price>${flight.price.total}</Price>
    </FlightCard>
  ))}
</FlightSelector>
```

#### 4. Hotel Options

```tsx
<HotelSelector>
  {hotels.map((hotel) => (
    <HotelCard
      key={hotel.id}
      selected={selectedHotel === hotel.id}
      onClick={() => setSelectedHotel(hotel.id)}
    >
      <Image src={hotel.images[0]} />
      <Details>
        - Name: {hotel.name}- Rating: {hotel.rating} ⭐ - Location: {hotel.city}-
        Amenities: {hotel.amenities.join(', ')}
      </Details>
      <Price>${hotel.price.total} for 7 nights</Price>
    </HotelCard>
  ))}
</HotelSelector>
```

#### 5. Tours & Attractions

```tsx
<ToursList>
  {tours.map((tour) => (
    <TourCard key={tour.uuid}>
      <Image src={tour.images[0]} />
      <AudioBadge>🎧 Audio Tour Included</AudioBadge>
      <h3>{tour.title}</h3>
      <Duration>{tour.duration}</Duration>
      <Description>{tour.summary}</Description>
      <Languages>{tour.languages.join(', ')}</Languages>
    </TourCard>
  ))}
</ToursList>
```

#### 6. Price Breakdown

```tsx
<PriceBreakdown>
  - Flights: $1,200 - Hotel: $700 - Tours: $300 - Service Fee: $100 --- Total:
  $2,300
  <Button onClick={handleBooking}>Proceed to Checkout</Button>
</PriceBreakdown>
```

### API Calls

Uses data from previous page (Trip Planner)

---

## 💳 **Page 4: Checkout Page**

### Purpose

Collect traveler details and process payment

### Components Needed

#### 1. Traveler Information Form

```tsx
<TravelerForm>
  {travelers.map((traveler, index) => (
    <TravelerSection key={index}>
      <h3>Traveler {index + 1}</h3>
      - First Name: <Input required />
      - Last Name: <Input required />
      - Date of Birth: <DatePicker required />
      - Passport Number: <Input required />
      - Passport Expiry: <DatePicker required />
      - Nationality: <Select required />
    </TravelerSection>
  ))}
</TravelerForm>
```

#### 2. Contact Information

```tsx
<ContactForm>
  - Email: <Input type="email" required />
  - Phone: <Input type="tel" required />
  - Address: <Textarea required />
  - City: <Input required />
  - Country: <Select required />
</ContactForm>
```

#### 3. Payment Form (Stripe)

```tsx
<PaymentForm>
  <CardElement
    options={{
      style: stripeCardStyle,
    }}
  />

  <Checkbox>I agree to the Terms & Conditions</Checkbox>

  <Button onClick={handlePayment} loading={processing} disabled={!stripe}>
    Pay $3,200
  </Button>
</PaymentForm>
```

#### 4. Booking Summary (Sidebar)

```tsx
<BookingSummary>
  - Trip: Egypt, Dec 15-22 - Travelers: 2 adults, 1 child - Flight: Emirates
  EK924 - Hotel: Marriott Cairo - Tours: 5 included - Total: $3,200
</BookingSummary>
```

### API Calls

**1. Create Booking (Sabre)**

```typescript
POST /api/sabre/booking

Request:
{
  "type": "flight", // or "hotel"
  "travelerInfo": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-15",
      "passportNumber": "ABC123456",
      "nationality": "US"
    }
  ],
  "contact": {
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "payment": {
    "method": "card",
    "token": "stripe_token_here"
  },
  "itinerary": {
    "segments": [...selected flight/hotel]
  }
}

Response:
{
  "success": true,
  "pnr": "ABC123",
  "bookingReference": "ABC123",
  "status": "confirmed"
}
```

**2. Process Payment (Stripe)**

```typescript
POST /api/payment/create-payment-intent

Request:
{
  "amount": 320000, // in cents
  "currency": "usd",
  "description": "Egypt trip booking",
  "metadata": {
    "bookingId": "ABC123",
    "travelers": 3
  }
}

Response:
{
  "clientSecret": "pi_xxx_secret_yyy",
  "paymentIntentId": "pi_xxx"
}
```

**3. Confirm Booking**

```typescript
POST /api/bookings/confirm

Request:
{
  "pnr": "ABC123",
  "paymentIntentId": "pi_xxx",
  "travelerInfo": [...],
  "contact": {...}
}

Response:
{
  "success": true,
  "bookingId": "BOOK_12345",
  "confirmationEmail": "sent"
}
```

---

## ✅ **Page 5: Confirmation Page**

### Purpose

Show booking confirmation and next steps

### Components Needed

#### 1. Success Message

```tsx
<SuccessHeader>
  <Icon>✅</Icon>
  <h1>Booking Confirmed!</h1>
  <p>Your trip to Egypt is all set</p>
</SuccessHeader>
```

#### 2. Booking Details

```tsx
<BookingDetails>
  - Booking Reference: ABC123 - Confirmation Email: sent to john@example.com -
  Trip: Egypt, Dec 15-22, 2025 - Travelers: 2 adults, 1 child - Total Paid:
  $3,200
</BookingDetails>
```

#### 3. What's Next

```tsx
<NextSteps>
  1. Check your email for detailed itinerary 2. Download izi.TRAVEL app for
  audio tours 3. Complete visa application (if required) 4. Travel insurance
  recommended
</NextSteps>
```

#### 4. Download Options

```tsx
<DownloadButtons>
  - <Button>Download Itinerary PDF</Button>- <Button>Add to Calendar</Button>-{' '}
  <Button>Access Audio Tours</Button>
</DownloadButtons>
```

#### 5. Contact Support

```tsx
<Support>
  Need help? Contact us: - Email: support@amrikyy.com - WhatsApp: +20 123 456
  7890 - Live Chat: <ChatButton />
</Support>
```

### API Calls

**Get Booking Details**

```typescript
GET /api/sabre/booking/:pnr

Response:
{
  "success": true,
  "booking": {
    "pnr": "ABC123",
    "status": "confirmed",
    "travelers": [...],
    "itinerary": {...}
  }
}
```

---

## 🎛️ **Page 6: Admin Dashboard**

### Purpose

Monitor bookings, revenue, and system health

### Components Needed

#### 1. Overview Cards

```tsx
<DashboardCards>
  <Card title="Today's Bookings" value="12" trend="+8%" />
  <Card title="Revenue" value="$15,200" trend="+15%" />
  <Card title="Active Users" value="145" trend="+22%" />
  <Card title="System Health" value="Healthy" status="green" />
</DashboardCards>
```

#### 2. Revenue Chart

```tsx
<RevenueChart data={revenueData} type="line" timeRange="7d" />
```

#### 3. Recent Bookings Table

```tsx
<BookingsTable
  columns={['PNR', 'Traveler', 'Destination', 'Date', 'Amount', 'Status']}
  data={recentBookings}
  onRowClick={showBookingDetails}
/>
```

#### 4. Country Agent Status

```tsx
<AgentStatus>
  {agents.map((agent) => (
    <AgentCard key={agent.key}>
      <Icon>{agent.icon}</Icon>
      <Name>{agent.name}</Name>
      <Status>{agent.status}</Status>
      <Metrics>
        - DNA Score: {agent.dnaScore}- Queries: {agent.queryCount}- Last Update:{' '}
        {agent.lastUpdate}
      </Metrics>
    </AgentCard>
  ))}
</AgentStatus>
```

#### 5. System Health

```tsx
<HealthMonitor>
  - API Response Time: 245ms - Uptime: 99.9% - Error Rate: 0.1% - Cache Hit
  Rate: 87%
</HealthMonitor>
```

### API Calls

**1. Dashboard Overview**

```typescript
GET /api/admin/dashboard

Response:
{
  "success": true,
  "dashboard": {
    "network": {...},
    "deployments": {...},
    "agents": {...},
    "health": {...},
    "activity": {...}
  }
}
```

**2. Analytics**

```typescript
GET /api/admin/analytics?range=7d

Response:
{
  "success": true,
  "analytics": {
    "deployments": {
      "timeline": {...},
      "successRate": 95
    },
    "agents": {...},
    "network": {...}
  }
}
```

**3. Agent Leaderboard**

```typescript
GET /api/admin/leaderboard

Response:
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "name": "Egypt Travel Expert",
      "dnaScore": 875,
      "tier": 7
    }
  ]
}
```

---

## 🎨 Design System / Style Guide

### Colors

```css
--primary: #2563EB (Blue)
--secondary: #10B981 (Green)
--accent: #F59E0B (Amber)
--egypt: #C19A6B (Gold)
--saudi: #006C35 (Green)
--uae: #FF0000 (Red)
--text: #1F2937
--bg: #F9FAFB
```

### Typography

```css
--font-heading: 'Inter', sans-serif
--font-body: 'Inter', sans-serif
--text-xs: 12px
--text-sm: 14px
--text-base: 16px
--text-lg: 18px
--text-xl: 20px
--text-2xl: 24px
--text-3xl: 30px
```

### Spacing

```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
--space-12: 48px
```

### Components

- Buttons: Rounded corners (8px), hover effects, loading states
- Cards: White background, shadow, hover lift
- Inputs: Border, focus ring, validation states
- Modals: Center overlay, backdrop blur

---

## 📦 Recommended Tech Stack

### Core

- **React 18** (already installed)
- **TypeScript** (already configured)
- **Vite** (already set up)
- **Tailwind CSS** (already integrated)

### State Management

- **React Query** - API calls, caching, sync

```bash
npm install @tanstack/react-query
```

### Forms

- **React Hook Form** - Form validation

```bash
npm install react-hook-form
```

### Payment

- **Stripe React** - Payment processing

```bash
npm install @stripe/react-stripe-js @stripe/stripe-js
```

### Date/Time

- **date-fns** - Date manipulation

```bash
npm install date-fns
```

### UI Components (Optional)

- **Headless UI** - Accessible components

```bash
npm install @headlessui/react
```

### Icons

- **Lucide React** - Icons (already installed)

---

## 🔌 API Integration Checklist

### Setup React Query

```tsx
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>;
```

### Create API Client

```tsx
// src/api/client.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Example Hook

```tsx
// src/hooks/useFlightSearch.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export const useFlightSearch = (params) => {
  return useQuery({
    queryKey: ['flights', params],
    queryFn: async () => {
      const { data } = await api.post('/sabre/flights/search', params);
      return data;
    },
    enabled: !!params.origin, // Only run if we have origin
  });
};
```

---

## 📝 Implementation Priority

### Week 1: Core Pages

1. ✅ Landing Page (Day 1-2)
2. ✅ Trip Planner (Day 2-3)
3. ✅ Results Page (Day 3-4)

### Week 2: Booking Flow

4. ✅ Checkout Page (Day 5-6)
5. ✅ Confirmation Page (Day 6)
6. ✅ Payment Integration (Day 7)

### Week 3: Admin & Polish

7. ✅ Admin Dashboard (Day 8-9)
8. ✅ Testing & Bug Fixes (Day 10-11)
9. ✅ Performance Optimization (Day 12)

---

## 🎯 Success Criteria

### Functional

- ✅ All pages load in < 3 seconds
- ✅ Forms validate correctly
- ✅ API calls succeed
- ✅ Payment processes securely
- ✅ Mobile responsive

### User Experience

- ✅ Intuitive navigation
- ✅ Clear CTAs
- ✅ Helpful error messages
- ✅ Loading states
- ✅ Success confirmations

### Performance

- ✅ Lighthouse score > 90
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3s

---

## 📞 Questions for UI Design?

If you need clarification on any component, ask about:

1. Exact layout/positioning
2. Interactions/animations
3. Responsive breakpoints
4. Error states
5. Loading states

---

**All backend APIs are ready and waiting!**  
**Backend URL:** `http://localhost:5001/api`  
**Docs:** See `QUANTUM_API_DOCUMENTATION.md`

**Let's build this UI! 🚀**
