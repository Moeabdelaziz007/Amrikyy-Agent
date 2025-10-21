# 🎯 Expert-Level Task Breakdown - Backend Core

**Approach**: Break every task into atomic, testable steps  
**Goal**: Each step takes 15-30 minutes max  
**Total**: 30 granular tasks

---

## 📊 TASK CATEGORIES

### **Phase 1: Database Setup** (Tasks 1-8)
### **Phase 2: Email Service** (Tasks 9-11)
### **Phase 3: API Enhancement** (Tasks 12-17)
### **Phase 4: Testing** (Tasks 18-24)
### **Phase 5: Deployment** (Tasks 25-30)

---

## 🗄️ PHASE 1: DATABASE SETUP (2-3 hours)

### **Task 1: Create SQL migration file for profiles table** ⭐ CURRENT
**Time**: 15 min  
**File**: `backend/migrations/001_create_profiles.sql`

**Steps**:
1. Create migrations folder
2. Write CREATE TABLE statement
3. Add UUID extension if needed
4. Add created_at/updated_at defaults
5. Add comments for documentation

**Deliverable**: SQL file ready to run

---

### **Task 2: Create SQL migration file for bookings table**
**Time**: 20 min  
**File**: `backend/migrations/002_create_bookings.sql`

**Steps**:
1. Write CREATE TABLE statement
2. Add all columns with proper types
3. Add foreign key to auth.users
4. Add UNIQUE constraint on booking_reference
5. Add CHECK constraints for validation
6. Add comments

**Deliverable**: SQL file ready to run

---

### **Task 3: Create SQL migration file for flight_searches cache table**
**Time**: 15 min  
**File**: `backend/migrations/003_create_flight_searches.sql`

**Steps**:
1. Write CREATE TABLE statement
2. Add JSONB columns for params and results
3. Add expires_at for TTL
4. Add GIN index for JSONB search
5. Create cleanup function

**Deliverable**: SQL file ready to run

---

### **Task 4: Add RLS policies for profiles table**
**Time**: 15 min  
**File**: `backend/migrations/004_profiles_rls.sql`

**Steps**:
1. Enable RLS on profiles table
2. Create SELECT policy (users can read own profile)
3. Create INSERT policy (users can create own profile)
4. Create UPDATE policy (users can update own profile)
5. Test policies with sample queries

**Deliverable**: RLS policies working

---

### **Task 5: Add RLS policies for bookings table**
**Time**: 20 min  
**File**: `backend/migrations/005_bookings_rls.sql`

**Steps**:
1. Enable RLS on bookings table
2. Create SELECT policy (users can read own bookings)
3. Create INSERT policy (users can create bookings)
4. Create UPDATE policy (users can update own bookings)
5. Create DELETE policy (users can cancel own bookings)
6. Test policies

**Deliverable**: RLS policies working

---

### **Task 6: Create database indexes for performance**
**Time**: 15 min  
**File**: `backend/migrations/006_create_indexes.sql`

**Steps**:
1. Create index on bookings(user_id)
2. Create index on bookings(booking_reference)
3. Create index on bookings(booking_status)
4. Create index on bookings(created_at)
5. Create GIN index on flight_searches(search_params)
6. Analyze query performance

**Deliverable**: Indexes created and tested

---

### **Task 7: Create database functions and triggers**
**Time**: 20 min  
**File**: `backend/migrations/007_functions_triggers.sql`

**Steps**:
1. Create updated_at trigger function
2. Add trigger to profiles table
3. Add trigger to bookings table
4. Create delete_expired_searches function
5. Test functions work

**Deliverable**: Functions and triggers working

---

### **Task 8: Test database schema with sample data**
**Time**: 20 min  
**File**: `backend/migrations/008_test_data.sql`

**Steps**:
1. Insert test user profile
2. Insert test booking
3. Insert test flight search
4. Verify RLS policies work
5. Verify triggers fire
6. Clean up test data

**Deliverable**: Schema fully tested

---

## 📧 PHASE 2: EMAIL SERVICE (1-1.5 hours)

### **Task 9: Create email service with Resend integration**
**Time**: 25 min  
**File**: `backend/src/services/emailService.js`

**Steps**:
1. Install Resend package: `npm install resend`
2. Create EmailService class
3. Initialize Resend client
4. Create sendEmail() method
5. Add error handling and logging
6. Add retry logic for failures

**Deliverable**: Email service ready

---

### **Task 10: Create email templates**
**Time**: 30 min  
**Files**: 
- `backend/templates/booking-confirmation.html`
- `backend/templates/payment-receipt.html`

**Steps**:
1. Create templates folder
2. Design booking confirmation HTML
3. Add dynamic placeholders
4. Design payment receipt HTML
5. Add company branding
6. Test templates render correctly

**Deliverable**: Email templates ready

---

### **Task 11: Test email service sends correctly**
**Time**: 15 min  
**File**: `backend/tests/emailService.test.js`

**Steps**:
1. Create test file
2. Test sendEmail() with real email
3. Verify email received
4. Test error handling
5. Test retry logic

**Deliverable**: Email service tested

---

## 🔌 PHASE 3: API ENHANCEMENT (2-2.5 hours)

### **Task 12: Enhance auth routes with new authService**
**Time**: 20 min  
**File**: `backend/routes/auth.js`

**Steps**:
1. Import new authService
2. Replace inline Supabase calls with service methods
3. Standardize response format
4. Add input validation
5. Test all auth endpoints

**Deliverable**: Auth routes using service layer

---

### **Task 13: Enhance booking routes with new bookingService**
**Time**: 25 min  
**File**: `backend/routes/bookings.js`

**Steps**:
1. Import new bookingService
2. Create POST /api/bookings (create booking)
3. Create GET /api/bookings (list user bookings)
4. Create GET /api/bookings/:id (get booking details)
5. Create PATCH /api/bookings/:id (update booking)
6. Create DELETE /api/bookings/:id (cancel booking)
7. Add auth middleware
8. Test all endpoints

**Deliverable**: Complete booking API

---

### **Task 14: Create payment webhook endpoint**
**Time**: 25 min  
**File**: `backend/routes/payment.js`

**Steps**:
1. Create POST /api/payment/webhook
2. Verify Stripe signature
3. Handle payment_intent.succeeded
4. Handle payment_intent.failed
5. Update booking status
6. Send confirmation email
7. Test with Stripe CLI

**Deliverable**: Webhook handling payments

---

### **Task 15: Test payment flow end-to-end**
**Time**: 30 min

**Steps**:
1. Create test booking
2. Create payment intent
3. Simulate payment success
4. Verify booking updated
5. Verify email sent
6. Test payment failure
7. Test refund flow

**Deliverable**: Payment flow working

---

### **Task 16: Add request validation middleware**
**Time**: 20 min  
**File**: `backend/middleware/validator.js`

**Steps**:
1. Install express-validator: `npm install express-validator`
2. Create validation middleware
3. Add validators for auth routes
4. Add validators for booking routes
5. Add validators for payment routes
6. Test validation errors

**Deliverable**: Input validation working

---

### **Task 17: Add error response standardization**
**Time**: 15 min  
**File**: `backend/middleware/errorHandler.js`

**Steps**:
1. Enhance existing error handler
2. Standardize error response format
3. Add error codes
4. Add stack traces in development
5. Test error responses

**Deliverable**: Consistent error responses

---

## 🧪 PHASE 4: TESTING (3-4 hours)

### **Task 18: Write unit tests for authService**
**Time**: 30 min  
**File**: `backend/tests/unit/authService.test.js`

**Steps**:
1. Set up Jest test file
2. Mock Supabase client
3. Test signUp()
4. Test signIn()
5. Test signOut()
6. Test getUserByToken()
7. Test resetPassword()
8. Verify 80%+ coverage

**Deliverable**: Auth service tested

---

### **Task 19: Write unit tests for bookingService**
**Time**: 30 min  
**File**: `backend/tests/unit/bookingService.test.js`

**Steps**:
1. Set up Jest test file
2. Mock Supabase client
3. Test createBooking()
4. Test getBooking()
5. Test getUserBookings()
6. Test updateBookingStatus()
7. Test cancelBooking()
8. Verify 80%+ coverage

**Deliverable**: Booking service tested

---

### **Task 20: Write unit tests for stripeService**
**Time**: 30 min  
**File**: `backend/tests/unit/stripeService.test.js`

**Steps**:
1. Set up Jest test file
2. Mock Stripe client
3. Test createPaymentIntent()
4. Test confirmPayment()
5. Test refundPayment()
6. Test handleWebhook()
7. Verify 80%+ coverage

**Deliverable**: Stripe service tested

---

### **Task 21: Write integration tests for auth flow**
**Time**: 30 min  
**File**: `backend/tests/integration/auth.test.js`

**Steps**:
1. Set up test database
2. Test signup → login → get user
3. Test password reset flow
4. Test token refresh
5. Test invalid credentials
6. Clean up test data

**Deliverable**: Auth flow tested

---

### **Task 22: Write integration tests for booking flow**
**Time**: 30 min  
**File**: `backend/tests/integration/booking.test.js`

**Steps**:
1. Set up test database
2. Test create booking
3. Test get bookings
4. Test update booking
5. Test cancel booking
6. Clean up test data

**Deliverable**: Booking flow tested

---

### **Task 23: Write integration tests for payment flow**
**Time**: 30 min  
**File**: `backend/tests/integration/payment.test.js`

**Steps**:
1. Use Stripe test mode
2. Test create payment intent
3. Test payment success webhook
4. Test payment failure webhook
5. Test refund
6. Verify booking status updates

**Deliverable**: Payment flow tested

---

### **Task 24: Run full test suite and fix issues**
**Time**: 30 min

**Steps**:
1. Run `npm test`
2. Fix any failing tests
3. Improve coverage to 80%+
4. Generate coverage report
5. Document test results

**Deliverable**: All tests passing

---

## 🚀 PHASE 5: DEPLOYMENT (2-3 hours)

### **Task 25: Create deployment configuration for Railway**
**Time**: 20 min  
**File**: `backend/railway.json`

**Steps**:
1. Create railway.json config
2. Specify build command
3. Specify start command
4. Set health check endpoint
5. Configure auto-deploy

**Deliverable**: Railway config ready

---

### **Task 26: Set up environment variables for production**
**Time**: 20 min

**Steps**:
1. List all required env vars
2. Add to Railway dashboard
3. Generate production Stripe keys
4. Generate production Supabase keys
5. Set FRONTEND_URL
6. Set NODE_ENV=production

**Deliverable**: Env vars configured

---

### **Task 27: Deploy backend to Railway**
**Time**: 15 min

**Steps**:
1. Connect GitHub repo to Railway
2. Trigger deployment
3. Monitor build logs
4. Verify deployment successful
5. Get production URL

**Deliverable**: Backend deployed

---

### **Task 28: Test production deployment**
**Time**: 30 min

**Steps**:
1. Test health endpoint
2. Test auth endpoints
3. Test flight search
4. Test booking creation
5. Test payment flow
6. Verify emails send
7. Check logs for errors

**Deliverable**: Production working

---

### **Task 29: Monitor logs and fix any issues**
**Time**: 30 min

**Steps**:
1. Set up Railway log monitoring
2. Check for errors
3. Fix any issues found
4. Verify fixes deployed
5. Monitor for 24 hours

**Deliverable**: Stable production

---

### **Task 30: Document deployment process**
**Time**: 20 min  
**File**: `DEPLOYMENT.md`

**Steps**:
1. Document Railway setup
2. Document env var requirements
3. Document deployment steps
4. Document rollback procedure
5. Document monitoring setup

**Deliverable**: Deployment documented

---

## 📊 PROGRESS TRACKING

### **Phase 1: Database** (8 tasks)
- [ ] Task 1: Profiles table SQL
- [ ] Task 2: Bookings table SQL
- [ ] Task 3: Flight searches SQL
- [ ] Task 4: Profiles RLS
- [ ] Task 5: Bookings RLS
- [ ] Task 6: Indexes
- [ ] Task 7: Functions/Triggers
- [ ] Task 8: Test schema

### **Phase 2: Email** (3 tasks)
- [ ] Task 9: Email service
- [ ] Task 10: Email templates
- [ ] Task 11: Test emails

### **Phase 3: API** (6 tasks)
- [ ] Task 12: Auth routes
- [ ] Task 13: Booking routes
- [ ] Task 14: Payment webhook
- [ ] Task 15: Test payment
- [ ] Task 16: Validation
- [ ] Task 17: Error handling

### **Phase 4: Testing** (7 tasks)
- [ ] Task 18: Auth unit tests
- [ ] Task 19: Booking unit tests
- [ ] Task 20: Stripe unit tests
- [ ] Task 21: Auth integration tests
- [ ] Task 22: Booking integration tests
- [ ] Task 23: Payment integration tests
- [ ] Task 24: Full test suite

### **Phase 5: Deployment** (6 tasks)
- [ ] Task 25: Railway config
- [ ] Task 26: Env vars
- [ ] Task 27: Deploy
- [ ] Task 28: Test production
- [ ] Task 29: Monitor
- [ ] Task 30: Document

---

## ⏱️ TIME ESTIMATES

| Phase | Tasks | Time |
|-------|-------|------|
| Phase 1: Database | 8 | 2-3 hours |
| Phase 2: Email | 3 | 1-1.5 hours |
| Phase 3: API | 6 | 2-2.5 hours |
| Phase 4: Testing | 7 | 3-4 hours |
| Phase 5: Deployment | 6 | 2-3 hours |
| **TOTAL** | **30** | **10-14 hours** |

---

## 🎯 EXECUTION STRATEGY

### **Sprint 1** (Day 1): Database + Email
- Complete Phase 1 (Database)
- Complete Phase 2 (Email)
- **Result**: Data layer ready

### **Sprint 2** (Day 2): API Enhancement
- Complete Phase 3 (API)
- **Result**: All endpoints working

### **Sprint 3** (Day 3): Testing
- Complete Phase 4 (Testing)
- **Result**: Everything tested

### **Sprint 4** (Day 4): Deployment
- Complete Phase 5 (Deployment)
- **Result**: Live in production

---

## 💡 EXPERT TIPS

1. **One task at a time** - Don't skip ahead
2. **Test immediately** - After each task
3. **Commit often** - After each completed task
4. **Document as you go** - Don't wait until end
5. **Ask for help** - If stuck for >15 minutes

---

## 🚀 READY TO START

**Current Task**: Task 1 - Create SQL migration file for profiles table

**Say**: "Start Task 1" or "Continue"

---

**Created by**: Ona AI Assistant  
**Date**: October 21, 2025  
**Status**: ✅ Ready to Execute
