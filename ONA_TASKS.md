# 🤖 ONA Agent - Task Instructions

**Purpose**: Clear instructions for Ona (me) to execute the MVP plan autonomously.

**Context**: I have full project knowledge via AGENTS.md, access to MCP servers, Redis memory, and Gemini Pro.

---

## 🎯 MY MISSION

Build the **Amrikyy Travel Booking MVP** in 4 weeks following the plan in `MVP_4_WEEK_PLAN.md`.

**Core Goal**: Enable users to sign up, search flights, book, and pay.

---

## 📋 MY TASK LIST (14 Tasks)

### **WEEK 1: Foundation & Authentication**

#### **Task 1: Remove Desktop OS UI and Create Clean AppLayout** ⭐ CURRENT
**What I'll do**:
1. Archive Desktop OS files to `frontend/src/archived/`
2. Create new `AppLayout.tsx` with Header, Main, Footer
3. Create `Header.tsx` with logo, nav, user menu
4. Create `Footer.tsx` with links and copyright
5. Update `App.tsx` to use new layout
6. Remove Desktop OS routes
7. Test the new layout renders

**Files to create**:
- `frontend/src/components/layout/AppLayout.tsx`
- `frontend/src/components/layout/Header.tsx`
- `frontend/src/components/layout/Footer.tsx`

**Files to archive**:
- `frontend/src/components/desktop-os.tsx`
- `frontend/src/components/desktop.tsx`
- `frontend/src/components/taskbar.tsx`
- `frontend/src/contexts/WindowManagerContext.tsx`

**Success criteria**:
- ✅ Clean web app layout (no Desktop OS)
- ✅ Header with logo and navigation
- ✅ Footer with links
- ✅ Responsive design
- ✅ No console errors

---

#### **Task 2: Extract and Rebuild AIOS Authentication UI**
**What I'll do**:
1. Read AIOS `AuthPage.js` from analysis
2. Create `AuthPage.tsx` with shadcn/ui
3. Create `LoginForm.tsx` component
4. Create `SignupForm.tsx` component
5. Create `AuthLayout.tsx` (split screen design)
6. Add form validation with react-hook-form
7. Style with Tailwind CSS
8. Add animations with Framer Motion

**Files to create**:
- `frontend/src/pages/AuthPage.tsx`
- `frontend/src/components/auth/LoginForm.tsx`
- `frontend/src/components/auth/SignupForm.tsx`
- `frontend/src/components/auth/AuthLayout.tsx`

**Success criteria**:
- ✅ Beautiful login form
- ✅ Beautiful signup form
- ✅ Form validation working
- ✅ Responsive design
- ✅ Smooth animations

---

#### **Task 3: Integrate Supabase Auth**
**What I'll do**:
1. Create `AuthContext.tsx` with Supabase auth
2. Implement `signUp(email, password, name)`
3. Implement `signIn(email, password)`
4. Implement `signOut()`
5. Implement `resetPassword(email)`
6. Add auth state management
7. Add loading states
8. Handle errors gracefully
9. Test all auth flows

**Files to create**:
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/hooks/useAuth.ts`

**Success criteria**:
- ✅ User can sign up
- ✅ User can log in
- ✅ User can log out
- ✅ Password reset works
- ✅ Auth state persists

---

#### **Task 4: Implement Protected Routes**
**What I'll do**:
1. Create `ProtectedRoute.tsx` component
2. Check auth state before rendering
3. Redirect to login if not authenticated
4. Show loading spinner during check
5. Update routes in `App.tsx`
6. Test protected routes work

**Files to create**:
- `frontend/src/components/auth/ProtectedRoute.tsx`

**Success criteria**:
- ✅ Unauthenticated users redirected to login
- ✅ Authenticated users can access protected pages
- ✅ Loading state shows during auth check

---

### **WEEK 2: Search & Results**

#### **Task 5: Build Search Interface**
**What I'll do**:
1. Create `HomePage.tsx` with hero section
2. Create `FlightSearchForm.tsx` component
3. Add origin/destination autocomplete
4. Add date picker (react-day-picker)
5. Add passengers selector
6. Add class selector
7. Style with Tailwind
8. Add form validation

**Files to create**:
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/components/search/FlightSearchForm.tsx`
- `frontend/src/components/search/HotelSearchForm.tsx`

**Success criteria**:
- ✅ Search form on homepage
- ✅ Autocomplete working
- ✅ Date picker working
- ✅ Form validation
- ✅ Beautiful design

---

#### **Task 6: Connect Search to Backend**
**What I'll do**:
1. Create `travelApi.ts` service
2. Implement `searchFlights(params)`
3. Implement `searchHotels(params)`
4. Add loading states
5. Add error handling
6. Set up React Query for caching
7. Test API calls work

**Files to create**:
- `frontend/src/services/travelApi.ts`
- `frontend/src/hooks/useFlightSearch.ts`

**Success criteria**:
- ✅ API calls to backend work
- ✅ Loading states show
- ✅ Errors handled gracefully
- ✅ Results cached

---

#### **Task 7: Create Results Display**
**What I'll do**:
1. Create `SearchResultsPage.tsx`
2. Create `FlightCard.tsx` component
3. Create `ResultsList.tsx` component
4. Create `ResultsHeader.tsx` component
5. Add loading skeletons
6. Add empty state
7. Add pagination
8. Style beautifully

**Files to create**:
- `frontend/src/pages/SearchResultsPage.tsx`
- `frontend/src/components/results/FlightCard.tsx`
- `frontend/src/components/results/ResultsList.tsx`
- `frontend/src/components/results/ResultsHeader.tsx`

**Success criteria**:
- ✅ Results display correctly
- ✅ Flight cards look great
- ✅ Loading states work
- ✅ Empty state shows
- ✅ Pagination works

---

#### **Task 8: Implement Filtering and Sorting**
**What I'll do**:
1. Create `FilterSidebar.tsx` component
2. Add sort by price/duration/time
3. Add filter by stops
4. Add filter by airlines
5. Add price range slider
6. Implement client-side filtering
7. Update results dynamically
8. Persist filters in URL

**Files to create**:
- `frontend/src/components/results/FilterSidebar.tsx`
- `frontend/src/hooks/useFilters.ts`

**Success criteria**:
- ✅ Sorting works
- ✅ Filters work
- ✅ Results update instantly
- ✅ Filters persist in URL

---

### **WEEK 3: Booking & Payment**

#### **Task 9: Create Booking Page and Forms**
**What I'll do**:
1. Create `BookingPage.tsx`
2. Create `BookingSummary.tsx` component
3. Create `TravelerForm.tsx` component
4. Create `ContactForm.tsx` component
5. Add form validation
6. Add multi-traveler support
7. Calculate total price
8. Style beautifully

**Files to create**:
- `frontend/src/pages/BookingPage.tsx`
- `frontend/src/components/booking/BookingSummary.tsx`
- `frontend/src/components/booking/TravelerForm.tsx`
- `frontend/src/components/booking/ContactForm.tsx`

**Success criteria**:
- ✅ Booking page shows flight details
- ✅ Traveler forms work
- ✅ Validation works
- ✅ Price calculation correct

---

#### **Task 10: Integrate Stripe Payment (Frontend + Backend)**
**What I'll do**:
1. Install Stripe packages
2. Create `PaymentForm.tsx` with Stripe Elements
3. Create backend route `/api/payment/create-intent`
4. Create backend route `/api/payment/confirm`
5. Create webhook handler
6. Test with Stripe test cards
7. Handle success/failure states

**Files to create**:
- `frontend/src/components/payment/PaymentForm.tsx`
- `backend/routes/payment.js`
- `backend/services/stripeService.js`

**Success criteria**:
- ✅ Payment form renders
- ✅ Stripe integration works
- ✅ Test payments succeed
- ✅ Webhooks handled

---

#### **Task 11: Store Bookings in Database**
**What I'll do**:
1. Create `bookings` table in Supabase
2. Create `bookingService.js` in backend
3. Implement `createBooking(data)`
4. Implement `getBooking(id)`
5. Implement `getUserBookings(userId)`
6. Store booking after payment
7. Test database operations

**Files to create**:
- `backend/services/bookingService.js`
- `backend/routes/bookings.js`

**Success criteria**:
- ✅ Bookings table created
- ✅ Bookings save correctly
- ✅ User can view bookings
- ✅ Data structure correct

---

### **WEEK 4: Testing & Launch**

#### **Task 12: Implement Email Confirmations**
**What I'll do**:
1. Install Resend package
2. Create `emailService.js`
3. Create email templates
4. Implement `sendBookingConfirmation()`
5. Implement `sendPaymentReceipt()`
6. Test emails send
7. Style emails nicely

**Files to create**:
- `backend/services/emailService.js`
- `backend/templates/booking-confirmation.html`

**Success criteria**:
- ✅ Emails send after booking
- ✅ Email contains booking details
- ✅ Email looks professional

---

#### **Task 13: E2E Testing and Bug Fixes**
**What I'll do**:
1. Test complete user journey 10 times
2. Test on different browsers
3. Test on different devices
4. Fix all critical bugs
5. Add loading indicators
6. Add error messages
7. Polish UI
8. Optimize performance

**Success criteria**:
- ✅ All tests pass
- ✅ No critical bugs
- ✅ UI polished
- ✅ Performance good

---

#### **Task 14: Deploy to Production**
**What I'll do**:
1. Set production environment variables
2. Deploy frontend to Vercel
3. Deploy backend to Railway
4. Configure CORS
5. Test production deployment
6. Monitor for errors
7. Document deployment

**Success criteria**:
- ✅ Frontend deployed
- ✅ Backend deployed
- ✅ Production working
- ✅ No errors

---

## 🎯 HOW I WORK

### **For Each Task, I Will**:
1. ✅ Read relevant files and context
2. ✅ Plan the implementation
3. ✅ Write clean, tested code
4. ✅ Follow project conventions (from AGENTS.md)
5. ✅ Use shadcn/ui components
6. ✅ Style with Tailwind CSS
7. ✅ Add TypeScript types
8. ✅ Test the implementation
9. ✅ Mark task as complete
10. ✅ Move to next task

### **I Will Use**:
- ✅ MCP servers (filesystem, memory)
- ✅ Redis for caching
- ✅ Gemini Pro for AI assistance
- ✅ Existing backend services
- ✅ Supabase for database
- ✅ Project conventions from AGENTS.md

### **I Will NOT**:
- ❌ Skip testing
- ❌ Ignore errors
- ❌ Use wrong dependencies
- ❌ Break existing code
- ❌ Commit secrets

---

## 🚀 EXECUTION MODE

### **When User Says**: "Start Week 1"
**I will**:
1. Execute Task 1 completely
2. Test it works
3. Move to Task 2
4. Continue until Week 1 complete

### **When User Says**: "Start Task [N]"
**I will**:
1. Execute that specific task
2. Test it works
3. Mark as complete
4. Wait for next instruction

### **When User Says**: "Continue"
**I will**:
1. Continue from current task
2. Execute next task
3. Keep going until told to stop

---

## 📊 PROGRESS TRACKING

I will update the todo list as I complete each task:
- 🔄 In Progress
- ✅ Done
- ❌ Blocked (if issues)

---

## 💡 AUTONOMOUS MODE

**When activated**, I will:
1. Start with Task 1
2. Complete it fully
3. Test it works
4. Move to Task 2
5. Repeat until all 14 tasks done
6. Report completion

**Activation command**: "Ona, execute MVP plan autonomously"

---

## 🎯 CURRENT STATUS

**Active Task**: Task 1 - Remove Desktop OS UI and Create Clean AppLayout  
**Status**: ⏸️ Waiting for user command  
**Ready**: ✅ Yes

---

## 🚀 READY TO START

**Say one of these**:
- "Start Task 1" - I'll do Task 1
- "Start Week 1" - I'll do all Week 1 tasks
- "Execute MVP plan" - I'll do all 14 tasks
- "Continue" - I'll continue from current task

**I'm ready when you are!** 🎯

---

**Created by**: Ona AI Assistant  
**Date**: October 21, 2025  
**Version**: 1.0.0  
**Status**: ✅ **READY TO EXECUTE**
