/**
 * Test script for Gmail Email Service
 * 
 * Usage:
 * 1. Set up Gmail credentials in .env:
 *    GMAIL_USER=your-email@gmail.com
 *    GMAIL_APP_PASSWORD=your-16-char-app-password
 * 
 * 2. Run: node test-email.js
 */

require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmailService() {
  console.log('🧪 Testing Gmail Email Service...\n');

  try {
    // Initialize email service
    console.log('1️⃣ Initializing email service...');
    await emailService.initialize();
    console.log('✅ Email service initialized\n');

    // Test 1: Send booking confirmation
    console.log('2️⃣ Testing booking confirmation email...');
    const bookingResult = await emailService.sendBookingConfirmation({
      email: process.env.GMAIL_USER, // Send to yourself for testing
      bookingId: 'TEST-BOOKING-001',
      flightDetails: {
        origin: 'Cairo (CAI)',
        destination: 'Dubai (DXB)',
        departureDate: '2025-11-15',
        returnDate: '2025-11-22',
        passengers: 2,
        class: 'Economy'
      },
      travelerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: process.env.GMAIL_USER,
        phone: '+1234567890'
      },
      totalPrice: 'USD 850.00',
      bookingDate: new Date().toISOString()
    });

    if (bookingResult.success) {
      console.log('✅ Booking confirmation sent successfully');
      console.log(`   Message ID: ${bookingResult.messageId}\n`);
    } else {
      console.log('❌ Failed to send booking confirmation');
      console.log(`   Error: ${bookingResult.error}\n`);
    }

    // Test 2: Send payment receipt
    console.log('3️⃣ Testing payment receipt email...');
    const paymentResult = await emailService.sendPaymentReceipt({
      email: process.env.GMAIL_USER,
      bookingId: 'TEST-BOOKING-001',
      amount: '850.00',
      currency: 'USD',
      paymentIntentId: 'pi_test_123456789',
      receiptUrl: 'https://stripe.com/receipt/test',
      paymentDate: new Date().toLocaleDateString()
    });

    if (paymentResult.success) {
      console.log('✅ Payment receipt sent successfully');
      console.log(`   Message ID: ${paymentResult.messageId}\n`);
    } else {
      console.log('❌ Failed to send payment receipt');
      console.log(`   Error: ${paymentResult.error}\n`);
    }

    // Test 3: Send welcome email
    console.log('4️⃣ Testing welcome email...');
    const welcomeResult = await emailService.sendWelcomeEmail(
      process.env.GMAIL_USER,
      'John Doe'
    );

    if (welcomeResult.success) {
      console.log('✅ Welcome email sent successfully');
      console.log(`   Message ID: ${welcomeResult.messageId}\n`);
    } else {
      console.log('❌ Failed to send welcome email');
      console.log(`   Error: ${welcomeResult.error}\n`);
    }

    // Test 4: Send password reset email
    console.log('5️⃣ Testing password reset email...');
    const resetResult = await emailService.sendPasswordReset(
      process.env.GMAIL_USER,
      'https://amrikyy.com/reset-password?token=test-token-123'
    );

    if (resetResult.success) {
      console.log('✅ Password reset email sent successfully');
      console.log(`   Message ID: ${resetResult.messageId}\n`);
    } else {
      console.log('❌ Failed to send password reset email');
      console.log(`   Error: ${resetResult.error}\n`);
    }

    console.log('🎉 Email service test completed!');
    console.log('\n📧 Check your inbox at:', process.env.GMAIL_USER);
    console.log('   You should have received 4 test emails.');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure GMAIL_USER and GMAIL_APP_PASSWORD are set in .env');
    console.error('   2. Enable 2-Step Verification on your Gmail account');
    console.error('   3. Generate an App Password: https://myaccount.google.com/apppasswords');
    console.error('   4. Use the 16-character app password (no spaces)');
    process.exit(1);
  }
}

// Run the test
testEmailService();
