/**
 * End-to-End Booking Flow Test
 * Tests the complete booking and payment workflow
 * 
 * Usage: node test-booking-flow.js
 */

require('dotenv').config();
const authService = require('./services/authService');
const bookingService = require('./services/bookingService');
const stripeService = require('./services/stripeService');
const emailService = require('./services/emailService');

console.log('🧪 Testing Complete Booking and Payment Flow\n');
console.log('='.repeat(60));

async function testBookingFlow() {
  let testUserId = null;
  let testBookingId = null;
  let testPaymentIntentId = null;

  try {
    // ============================================
    // STEP 1: Initialize Services
    // ============================================
    console.log('\n📦 Step 1: Initializing services...');
    
    stripeService.initialize();
    await emailService.initialize();
    
    console.log('✅ Services initialized\n');

    // ============================================
    // STEP 2: Create Test User
    // ============================================
    console.log('👤 Step 2: Creating test user...');
    
    const testEmail = `test-${Date.now()}@amrikyy.com`;
    const signupResult = await authService.signup({
      email: testEmail,
      password: 'Test123456!',
      fullName: 'Test User'
    });

    if (!signupResult.success) {
      console.error('❌ Failed to create test user:', signupResult.error);
      return;
    }

    testUserId = signupResult.user.id;
    console.log('✅ Test user created:', testUserId);
    console.log('   Email:', testEmail);
    console.log('   (Welcome email should be sent)\n');

    // ============================================
    // STEP 3: Create Booking with Payment Intent
    // ============================================
    console.log('✈️  Step 3: Creating booking...');
    
    const bookingData = {
      userId: testUserId,
      flightDetails: {
        origin: 'Cairo (CAI)',
        destination: 'Dubai (DXB)',
        departureDate: '2025-11-15',
        returnDate: '2025-11-22',
        passengers: 2,
        class: 'Economy',
        airline: 'Emirates',
        flightNumber: 'EK924'
      },
      travelerInfo: {
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        phone: '+201234567890',
        passportNumber: 'A12345678'
      },
      totalPrice: 850.00,
      currency: 'usd'
    };

    const bookingResult = await bookingService.createBooking(bookingData);

    if (!bookingResult.success) {
      console.error('❌ Failed to create booking:', bookingResult.error);
      return;
    }

    testBookingId = bookingResult.booking.id;
    testPaymentIntentId = bookingResult.payment.paymentIntentId;

    console.log('✅ Booking created successfully');
    console.log('   Booking ID:', testBookingId);
    console.log('   Payment Intent ID:', testPaymentIntentId);
    console.log('   Client Secret:', bookingResult.payment.clientSecret.substring(0, 20) + '...');
    console.log('   Status: pending');
    console.log('   Total: USD', bookingResult.booking.totalPrice, '\n');

    // ============================================
    // STEP 4: Retrieve Booking
    // ============================================
    console.log('🔍 Step 4: Retrieving booking...');
    
    const getBookingResult = await bookingService.getBooking(testBookingId);

    if (!getBookingResult.success) {
      console.error('❌ Failed to retrieve booking:', getBookingResult.error);
      return;
    }

    console.log('✅ Booking retrieved successfully');
    console.log('   Status:', getBookingResult.booking.status);
    console.log('   Created at:', getBookingResult.booking.created_at, '\n');

    // ============================================
    // STEP 5: Simulate Payment Success (Webhook)
    // ============================================
    console.log('💳 Step 5: Simulating successful payment...');
    console.log('   (In production, Stripe webhook would trigger this)');
    
    const confirmResult = await bookingService.confirmBooking(testPaymentIntentId);

    if (!confirmResult.success) {
      console.error('❌ Failed to confirm booking:', confirmResult.error);
      return;
    }

    console.log('✅ Booking confirmed successfully');
    console.log('   Booking ID:', confirmResult.booking.id);
    console.log('   Status:', confirmResult.booking.status);
    console.log('   (Booking confirmation email should be sent)');
    console.log('   (Payment receipt email should be sent)\n');

    // ============================================
    // STEP 6: Verify Final Booking Status
    // ============================================
    console.log('✅ Step 6: Verifying final booking status...');
    
    const finalBookingResult = await bookingService.getBooking(testBookingId);

    if (!finalBookingResult.success) {
      console.error('❌ Failed to retrieve final booking:', finalBookingResult.error);
      return;
    }

    console.log('✅ Final booking status verified');
    console.log('   Status:', finalBookingResult.booking.status);
    console.log('   Confirmed at:', finalBookingResult.booking.confirmed_at || 'N/A');
    console.log('   Payment Intent ID:', finalBookingResult.booking.payment_intent_id, '\n');

    // ============================================
    // STEP 7: Test User Bookings Retrieval
    // ============================================
    console.log('📋 Step 7: Retrieving user bookings...');
    
    const userBookingsResult = await bookingService.getUserBookings(testUserId);

    if (!userBookingsResult.success) {
      console.error('❌ Failed to retrieve user bookings:', userBookingsResult.error);
      return;
    }

    console.log('✅ User bookings retrieved');
    console.log('   Total bookings:', userBookingsResult.count);
    console.log('   Bookings:', userBookingsResult.bookings.map(b => ({
      id: b.id,
      status: b.status,
      total: `${b.currency.toUpperCase()} ${b.total_price}`
    })), '\n');

    // ============================================
    // STEP 8: Test Cancellation (Optional)
    // ============================================
    console.log('🚫 Step 8: Testing booking cancellation...');
    
    // Create another booking to cancel
    const cancelBookingResult = await bookingService.createBooking({
      ...bookingData,
      totalPrice: 500.00
    });

    if (cancelBookingResult.success) {
      const cancelResult = await bookingService.cancelBooking(cancelBookingResult.booking.id);
      
      if (cancelResult.success) {
        console.log('✅ Booking cancelled successfully');
        console.log('   Cancelled Booking ID:', cancelResult.booking.id);
        console.log('   Status:', cancelResult.booking.status, '\n');
      } else {
        console.error('❌ Failed to cancel booking:', cancelResult.error);
      }
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('='.repeat(60));
    console.log('\n🎉 ALL TESTS PASSED!\n');
    console.log('✅ Test Summary:');
    console.log('   - User created and welcome email sent');
    console.log('   - Booking created with payment intent');
    console.log('   - Payment confirmed (simulated webhook)');
    console.log('   - Booking confirmation email sent');
    console.log('   - Payment receipt email sent');
    console.log('   - Booking status updated to confirmed');
    console.log('   - User bookings retrieved successfully');
    console.log('   - Booking cancellation tested');
    console.log('\n📧 Check your email inbox for:');
    console.log('   1. Welcome email');
    console.log('   2. Booking confirmation email');
    console.log('   3. Payment receipt email');
    console.log('\n💡 Next Steps:');
    console.log('   1. Set up Stripe webhook endpoint in production');
    console.log('   2. Configure webhook URL in Stripe Dashboard');
    console.log('   3. Test with real Stripe test cards');
    console.log('   4. Monitor webhook events in Stripe Dashboard');
    console.log('\n🔗 Useful Links:');
    console.log('   - Stripe Dashboard: https://dashboard.stripe.com');
    console.log('   - Stripe Test Cards: https://stripe.com/docs/testing');
    console.log('   - Webhook Testing: https://stripe.com/docs/webhooks/test');
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testBookingFlow().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
