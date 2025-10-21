# Gmail Email Service Setup Guide

This guide will help you connect the Amrikyy Agent with Gmail for sending transactional emails (booking confirmations, payment receipts, password resets, etc.).

---

## 🎯 Overview

The email service uses **Gmail SMTP** with **App Passwords** for secure authentication. This is the recommended approach for automated email sending from applications.

**Benefits:**
- ✅ Free for personal use (up to 500 emails/day)
- ✅ Reliable delivery with Gmail's infrastructure
- ✅ Professional appearance with custom "from" name
- ✅ Secure authentication with App Passwords
- ✅ No additional services or costs required

---

## 📋 Prerequisites

1. A Gmail account (personal or Google Workspace)
2. 2-Step Verification enabled on your Google account
3. Node.js and npm installed
4. The Amrikyy Agent backend set up

---

## 🔧 Setup Instructions

### Step 1: Enable 2-Step Verification

1. Go to your Google Account: [https://myaccount.google.com](https://myaccount.google.com)
2. Navigate to **Security** in the left sidebar
3. Under "How you sign in to Google," click **2-Step Verification**
4. Follow the prompts to enable 2-Step Verification
5. You'll need to verify your identity with your phone

### Step 2: Generate an App Password

1. After enabling 2-Step Verification, go to: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. You may need to sign in again
3. Under "Select app," choose **Mail**
4. Under "Select device," choose **Other (Custom name)**
5. Enter a name like "Amrikyy Agent" or "Travel Bot"
6. Click **Generate**
7. Google will display a 16-character password (e.g., `abcd efgh ijkl mnop`)
8. **Copy this password immediately** - you won't be able to see it again

### Step 3: Configure Environment Variables

1. Open your backend `.env` file:
   ```bash
   cd backend
   nano .env  # or use your preferred editor
   ```

2. Add your Gmail credentials:
   ```bash
   # Email Service (Gmail)
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop  # Remove spaces from the 16-char password
   ```

3. **Important:** Remove all spaces from the app password. It should be 16 characters with no spaces.

4. Save the file

### Step 4: Test the Email Service

Run the test script to verify everything works:

```bash
cd backend
node test-email.js
```

You should see output like:
```
🧪 Testing Gmail Email Service...

1️⃣ Initializing email service...
✅ Email service initialized

2️⃣ Testing booking confirmation email...
✅ Booking confirmation sent successfully
   Message ID: <message-id@gmail.com>

3️⃣ Testing payment receipt email...
✅ Payment receipt sent successfully
   Message ID: <message-id@gmail.com>

4️⃣ Testing welcome email...
✅ Welcome email sent successfully
   Message ID: <message-id@gmail.com>

5️⃣ Testing password reset email...
✅ Password reset email sent successfully
   Message ID: <message-id@gmail.com>

🎉 Email service test completed!

📧 Check your inbox at: your-email@gmail.com
   You should have received 4 test emails.
```

### Step 5: Check Your Inbox

1. Open your Gmail inbox
2. You should see 4 test emails:
   - ✈️ Booking Confirmation
   - 💳 Payment Receipt
   - 🎉 Welcome to Amrikyy Travel
   - 🔐 Reset Your Password

3. If you don't see them, check your **Spam** folder

---

## 🎨 Email Templates

The service includes professionally designed HTML email templates:

### 1. Booking Confirmation
- Flight details (origin, destination, dates)
- Traveler information
- Total price
- Booking ID for reference
- Link to view booking details

### 2. Payment Receipt
- Payment amount and currency
- Payment ID and booking ID
- Payment date and status
- Link to download receipt
- Link to view booking

### 3. Welcome Email
- Personalized greeting
- Feature highlights
- Call-to-action to start exploring
- Support contact information

### 4. Password Reset
- Secure reset link
- Expiration notice (1 hour)
- Security warnings
- Plain text link as fallback

---

## 🔒 Security Best Practices

### DO:
- ✅ Use App Passwords (never your actual Gmail password)
- ✅ Keep your `.env` file secure and never commit it to git
- ✅ Rotate App Passwords periodically
- ✅ Use different App Passwords for different applications
- ✅ Revoke App Passwords you're no longer using

### DON'T:
- ❌ Share your App Password with anyone
- ❌ Commit `.env` file to version control
- ❌ Use your main Gmail password in the application
- ❌ Send sensitive information in plain text emails
- ❌ Exceed Gmail's sending limits (500 emails/day for personal accounts)

---

## 📊 Gmail Sending Limits

### Personal Gmail Account:
- **500 emails per day** (rolling 24-hour period)
- **500 recipients per email**
- **10 MB attachment size limit**

### Google Workspace Account:
- **2,000 emails per day** (rolling 24-hour period)
- **2,000 recipients per email**
- **25 MB attachment size limit**

**Note:** If you exceed these limits, Gmail will temporarily block sending for 24 hours.

---

## 🚀 Usage in Your Application

### Initialize the Service

```javascript
const emailService = require('./services/emailService');

// Initialize (happens automatically on first use)
await emailService.initialize();
```

### Send Booking Confirmation

```javascript
await emailService.sendBookingConfirmation({
  email: 'customer@example.com',
  bookingId: 'BK-12345',
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
    email: 'customer@example.com',
    phone: '+1234567890'
  },
  totalPrice: 'USD 850.00'
});
```

### Send Payment Receipt

```javascript
await emailService.sendPaymentReceipt({
  email: 'customer@example.com',
  bookingId: 'BK-12345',
  amount: '850.00',
  currency: 'USD',
  paymentIntentId: 'pi_123456789',
  receiptUrl: 'https://stripe.com/receipt/...',
  paymentDate: new Date().toLocaleDateString()
});
```

### Send Welcome Email

```javascript
await emailService.sendWelcomeEmail(
  'newuser@example.com',
  'John Doe'
);
```

### Send Password Reset

```javascript
await emailService.sendPasswordReset(
  'user@example.com',
  'https://amrikyy.com/reset-password?token=abc123'
);
```

### Send Custom Email

```javascript
await emailService.sendEmail({
  to: 'recipient@example.com',
  subject: 'Your Custom Subject',
  html: '<h1>Hello!</h1><p>Your custom HTML content</p>',
  text: 'Hello! Your custom plain text content'
});
```

---

## 🐛 Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution:**
1. Make sure 2-Step Verification is enabled
2. Generate a new App Password
3. Remove all spaces from the App Password in `.env`
4. Use the App Password, not your Gmail password

### Error: "self signed certificate in certificate chain"

**Solution:**
This usually happens in development environments. Add to your `.env`:
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0
```
**Warning:** Only use this in development, never in production!

### Emails Going to Spam

**Solutions:**
1. **Warm up your account:** Start by sending a few emails per day, gradually increase
2. **Verify your domain:** If using a custom domain, set up SPF, DKIM, and DMARC records
3. **Avoid spam triggers:** Don't use all caps, excessive exclamation marks, or spam keywords
4. **Include unsubscribe link:** For marketing emails (not required for transactional)
5. **Use a consistent "from" address:** Don't change it frequently

### Rate Limit Exceeded

**Solution:**
If you hit the 500 emails/day limit:
1. Wait 24 hours for the limit to reset
2. Consider upgrading to Google Workspace (2,000 emails/day)
3. Implement email queuing to spread sends over time
4. Use a dedicated email service (SendGrid, Mailgun) for high volume

### Emails Not Sending

**Checklist:**
- [ ] 2-Step Verification is enabled
- [ ] App Password is correct (16 characters, no spaces)
- [ ] `GMAIL_USER` matches the account that generated the App Password
- [ ] `.env` file is in the correct location (`backend/.env`)
- [ ] Environment variables are loaded (`require('dotenv').config()`)
- [ ] No firewall blocking port 587 or 465
- [ ] Gmail account is not suspended or locked

---

## 🔄 Alternative: Using Google Workspace

If you have a Google Workspace account, you can use your custom domain:

```bash
GMAIL_USER=noreply@yourdomain.com
GMAIL_APP_PASSWORD=your-app-password
```

**Benefits:**
- Professional email address (e.g., noreply@amrikyy.com)
- Higher sending limits (2,000 emails/day)
- Better deliverability
- Custom branding

---

## 📈 Monitoring and Logging

The email service automatically logs all email operations:

```javascript
// Success
logger.info('Email sent successfully to user@example.com', {
  messageId: '<message-id@gmail.com>',
  subject: 'Booking Confirmation'
});

// Failure
logger.error('Failed to send email to user@example.com:', error);
```

Check logs in `backend/logs/combined.log` and `backend/logs/error.log`.

---

## 🎯 Production Recommendations

For production use, consider:

1. **Use Google Workspace** for custom domain and higher limits
2. **Implement email queuing** with Bull or BullMQ
3. **Add retry logic** for failed sends
4. **Monitor sending metrics** (success rate, bounce rate)
5. **Set up email templates** in a database for easy updates
6. **Implement unsubscribe functionality** for marketing emails
7. **Use a dedicated email service** (SendGrid, Mailgun, AWS SES) for high volume

---

## 📚 Additional Resources

- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Gmail Sending Limits](https://support.google.com/a/answer/166852)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Email Best Practices](https://developers.google.com/gmail/api/guides/sending)

---

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs in `backend/logs/`
3. Run the test script: `node test-email.js`
4. Verify your Gmail settings at [https://myaccount.google.com](https://myaccount.google.com)

---

**Last Updated:** October 21, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
