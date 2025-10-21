# 🚀 Amrikyy Agent - 4 Week MVP Plan

**Goal**: Ship a working travel booking platform where users can sign up, search flights, book, and pay.

**Strategy**: Replace Desktop OS with clean web app. Integrate pre-built components. Focus on core funnel.

**Timeline**: 4 weeks  
**Status**: 🎯 **STARTING NOW**

---

## 🎯 MVP GOAL

**User Journey**:
1. Visit website
2. Sign up / Log in
3. Search for flights
4. View results
5. Select flight
6. Enter traveler details
7. Pay with Stripe
8. Receive confirmation email

**What We're NOT Building** (for MVP):
- ❌ Desktop OS interface
- ❌ AI chat (Maya)
- ❌ Knowledge graph
- ❌ Voice control
- ❌ Bots (Telegram/WhatsApp)
- ❌ Advanced personalization

**What We ARE Building**:
- ✅ Clean web app UI
- ✅ Authentication (Supabase)
- ✅ Flight search (Kiwi API)
- ✅ Results display
- ✅ Booking flow
- ✅ Payment (Stripe)
- ✅ Email confirmations

---

## 📅 WEEK 1: Foundation & Authentication

### **Objective**: Professional web app with working auth

### **Tasks**:

#### **1.1 Remove Desktop OS UI** (2h)
- Archive `desktop-os.tsx`, `desktop.tsx`, `taskbar.tsx`
- Remove WindowManager context
- Clean up unused OS components

#### **1.2 Create Clean AppLayout** (2h)
**File**: `frontend/src/components/layout/AppLayout.tsx`

```typescript
// Clean, modern layout
- Header (logo, nav, user menu)
- Main content area
- Footer
- Responsive design
```

#### **1.3 Extract AIOS Authentication UI** (4h)
**Source**: AIOS `AuthPage.js`  
**Target**: `frontend/src/pages/AuthPage.tsx`

**Components to create**:
```typescript
// frontend/src/components/auth/LoginForm.tsx
- Email input
- Password input
- Submit button
- "Forgot password" link
- "Sign up" link

// frontend/src/components/auth/SignupForm.tsx
- Name input
- Email input
- Password input
- Confirm password
- Terms checkbox
- Submit button

// frontend/src/components/auth/AuthLayout.tsx
- Split screen design
- Left: Form
- Right: Hero image/animation
```

**Design**: Use shadcn/ui + Tailwind (NOT Material-UI)

#### **1.4 Integrate Supabase Auth** (3h)
**Source**: AIOS `AuthContext.js` logic  
**Target**: `frontend/src/contexts/AuthContext.tsx`

```typescript
// frontend/src/contexts/AuthContext.tsx
- useAuth hook
- signUp(email, password, name)
- signIn(email, password)
- signOut()
- resetPassword(email)
- user state
- loading state
```

**Backend**: Already configured in `backend/.env`

#### **1.5 Implement Protected Routes** (1h)
**File**: `frontend/src/components/auth/ProtectedRoute.tsx`

```typescript
// Redirect to /login if not authenticated
- Check auth state
- Show loading spinner
- Redirect or render children
```

### **Week 1 Deliverables**:
- ✅ Clean web app layout (no Desktop OS)
- ✅ Beautiful auth pages (login/signup)
- ✅ Working Supabase authentication
- ✅ Protected routes
- ✅ User can sign up, log in, log out

**Time**: 12 hours

---

## 📅 WEEK 2: Search & Results

### **Objective**: Users can search flights and see results

### **Tasks**:

#### **2.1 Build Search Interface** (3h)
**Source**: AuraOS AI Foundry `AITravelApp.tsx`  
**Target**: `frontend/src/pages/HomePage.tsx`

**Components to create**:
```typescript
// frontend/src/components/search/FlightSearchForm.tsx
- Origin input (autocomplete)
- Destination input (autocomplete)
- Date picker (departure/return)
- Passengers selector
- Class selector (economy/business)
- Search button

// frontend/src/components/search/HotelSearchForm.tsx
- Location input
- Check-in/out dates
- Guests selector
- Search button
```

**Design**: Hero section with search form, popular destinations below

#### **2.2 Connect to Backend API** (2h)
**Backend**: Already exists in `backend/routes/travel.js`

```typescript
// frontend/src/services/travelApi.ts
- searchFlights(params)
- searchHotels(params)
- getFlightDetails(id)
```

**API Integration**:
- Use axios or fetch
- Handle loading states
- Handle errors
- Cache results (React Query)

#### **2.3 Create Results Display** (4h)
**Source**: Quantum AIVoyage `TravelCard.tsx`  
**Target**: `frontend/src/pages/SearchResultsPage.tsx`

**Components to create**:
```typescript
// frontend/src/components/results/FlightCard.tsx
- Airline logo
- Flight times
- Duration
- Stops
- Price
- "Book" button

// frontend/src/components/results/ResultsList.tsx
- List of FlightCards
- Loading skeleton
- Empty state
- Pagination

// frontend/src/components/results/ResultsHeader.tsx
- Search summary
- Results count
- Modify search button
```

#### **2.4 Implement Filtering** (3h)
**Source**: Quantum AIVoyage `FilterBar.tsx`  
**Target**: `frontend/src/components/results/FilterSidebar.tsx`

**Filters**:
```typescript
// Client-side filtering
- Sort by: Price, Duration, Departure time
- Filter by: Stops (direct, 1 stop, 2+ stops)
- Filter by: Airlines
- Filter by: Departure time ranges
- Price range slider
```

### **Week 2 Deliverables**:
- ✅ Search form on homepage
- ✅ Connected to Kiwi API
- ✅ Beautiful results page
- ✅ Working filters and sorting
- ✅ User can search and browse flights

**Time**: 12 hours

---

## 📅 WEEK 3: Booking & Payment

### **Objective**: Complete booking flow with payment

### **Tasks**:

#### **3.1 Create Booking Page** (3h)
**Target**: `frontend/src/pages/BookingPage.tsx`

**Components to create**:
```typescript
// frontend/src/components/booking/BookingSummary.tsx
- Flight details recap
- Price breakdown
- Total price

// frontend/src/components/booking/TravelerForm.tsx
- First name, Last name
- Date of birth
- Passport number
- Nationality
- Add multiple travelers
- Validation

// frontend/src/components/booking/ContactForm.tsx
- Email
- Phone number
- Emergency contact
```

#### **3.2 Integrate Stripe (Frontend)** (3h)
**Target**: `frontend/src/components/payment/PaymentForm.tsx`

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

```typescript
// frontend/src/components/payment/PaymentForm.tsx
- Stripe Elements
- Card input
- Billing address
- Submit button
- Loading state
- Error handling
```

#### **3.3 Integrate Stripe (Backend)** (4h)
**Target**: `backend/routes/payment.js`

```javascript
// backend/routes/payment.js
POST /api/payment/create-intent
- Create Stripe PaymentIntent
- Return client_secret

POST /api/payment/confirm
- Confirm payment
- Create booking record
- Return booking confirmation

// Webhook
POST /api/payment/webhook
- Handle Stripe events
- Update booking status
```

#### **3.4 Store Bookings in Database** (2h)
**Target**: Supabase `bookings` table

**Schema**:
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  flight_data JSONB,
  travelers JSONB,
  total_price DECIMAL,
  payment_status TEXT,
  stripe_payment_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Backend**:
```javascript
// backend/services/bookingService.js
- createBooking(data)
- getBooking(id)
- getUserBookings(userId)
- updateBookingStatus(id, status)
```

### **Week 3 Deliverables**:
- ✅ Complete booking page
- ✅ Traveler information forms
- ✅ Stripe payment integration
- ✅ Bookings stored in database
- ✅ User can complete full booking flow

**Time**: 12 hours

---

## 📅 WEEK 4: Finalization & Launch

### **Objective**: Polish, test, and deploy

### **Tasks**:

#### **4.1 Email Confirmations** (3h)
**Service**: Resend or SendGrid

```bash
npm install resend
```

**Backend**:
```javascript
// backend/services/emailService.js
- sendBookingConfirmation(booking, user)
- sendPaymentReceipt(booking, user)

// Email template
- Booking details
- Flight information
- Traveler names
- Total paid
- Booking reference
```

#### **4.2 E2E Testing** (4h)
**Test Cases**:
1. Sign up with new account ✅
2. Log in with existing account ✅
3. Search for flights ✅
4. View results ✅
5. Apply filters ✅
6. Select a flight ✅
7. Enter traveler details ✅
8. Complete payment (test card) ✅
9. Verify booking in database ✅
10. Receive confirmation email ✅

**Test with**:
- Different browsers (Chrome, Firefox, Safari)
- Different devices (Desktop, Tablet, Mobile)
- Different screen sizes

#### **4.3 Bug Fixes & Polish** (3h)
**Critical Fixes**:
- Loading indicators everywhere
- Error messages (user-friendly)
- Form validation
- Empty states
- Success messages
- Responsive design issues

**Polish**:
- Smooth transitions
- Consistent spacing
- Color scheme
- Typography
- Icons

#### **4.4 Deploy to Production** (2h)
**Frontend** (Vercel):
```bash
# Already configured
vercel --prod
```

**Backend** (Railway):
```bash
# Already configured
railway up
```

**Environment Variables**:
- Production Supabase keys
- Production Stripe keys
- Production email API keys
- CORS origins

**DNS**:
- Point domain to Vercel
- Configure SSL

### **Week 4 Deliverables**:
- ✅ Email confirmations working
- ✅ All critical bugs fixed
- ✅ Fully tested end-to-end
- ✅ Deployed to production
- ✅ Ready for first users

**Time**: 12 hours

---

## 📊 TOTAL TIME BREAKDOWN

| Week | Focus | Hours |
|------|-------|-------|
| Week 1 | Auth & Foundation | 12h |
| Week 2 | Search & Results | 12h |
| Week 3 | Booking & Payment | 12h |
| Week 4 | Testing & Launch | 12h |
| **TOTAL** | **MVP Complete** | **48h** |

**At 3 hours/day**: 16 days (2.5 weeks)  
**At 4 hours/day**: 12 days (under 2 weeks)  
**At 6 hours/day**: 8 days (1 week)

---

## 🎯 SUCCESS METRICS

### **Week 1 Success**:
- [ ] User can sign up
- [ ] User can log in
- [ ] User can log out
- [ ] Protected routes work
- [ ] UI looks professional

### **Week 2 Success**:
- [ ] User can search flights
- [ ] Results display correctly
- [ ] Filters work
- [ ] Sorting works
- [ ] API calls succeed

### **Week 3 Success**:
- [ ] User can select flight
- [ ] User can enter details
- [ ] Payment form works
- [ ] Booking saves to DB
- [ ] Payment processes

### **Week 4 Success**:
- [ ] Email sends
- [ ] All tests pass
- [ ] No critical bugs
- [ ] Deployed to production
- [ ] First booking completed

---

## 🚀 IMMEDIATE NEXT STEPS

### **RIGHT NOW - Start Week 1, Task 1.1**:

1. **Archive Desktop OS files**:
```bash
mkdir -p frontend/src/archived
mv frontend/src/components/desktop-os.tsx frontend/src/archived/
mv frontend/src/components/desktop.tsx frontend/src/archived/
mv frontend/src/components/taskbar.tsx frontend/src/archived/
mv frontend/src/contexts/WindowManagerContext.tsx frontend/src/archived/
```

2. **Create new AppLayout**:
```bash
mkdir -p frontend/src/components/layout
touch frontend/src/components/layout/AppLayout.tsx
touch frontend/src/components/layout/Header.tsx
touch frontend/src/components/layout/Footer.tsx
```

3. **Update main routes**:
```bash
# Edit frontend/src/App.tsx
# Remove Desktop OS routes
# Add new clean routes
```

---

## 💡 KEY PRINCIPLES

1. **Ship Fast**: Don't perfect, just ship
2. **Focus**: Only core booking flow
3. **Integrate**: Use existing components
4. **Test**: Test every step
5. **Deploy**: Deploy early and often

---

## 🔥 MOTIVATION

**In 4 weeks, you will have**:
- ✅ A live, working product
- ✅ Real users booking travel
- ✅ Revenue coming in
- ✅ Proof of concept
- ✅ Foundation to build on

**After MVP, you can add**:
- AI chat (Maya)
- Personalization
- Bots
- Advanced features
- Desktop OS (if needed)

---

## ✅ READY TO START?

**Say**: "Start Week 1, Task 1.1 - Remove Desktop OS"

And I'll begin immediately! 🚀

---

**Created by**: Ona AI Assistant  
**Date**: October 21, 2025  
**Version**: 1.0.0  
**Status**: 🎯 **READY TO EXECUTE**
