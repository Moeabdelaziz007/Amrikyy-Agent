const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * @fileoverview Gmail Email Service
 * @module services/emailService
 * @description Uses Gmail SMTP with an App Password for sending transactional emails.
 *
 * @class EmailService
 * @description Provides methods for sending various types of transactional emails.
 *
 * @property {object} transporter - The Nodemailer transporter object.
 * @property {boolean} initialized - A flag indicating if the service has been initialized.
 * @property {string} fromEmail - The email address to send emails from.
 * @property {string} fromName - The name to display as the sender.
 *
 * @requires nodemailer
 * @requires ../utils/logger
 *
 * @see {@link https://myaccount.google.com/apppasswords} for generating an App Password.
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.fromEmail = process.env.GMAIL_USER || 'noreply@amrikyy.com';
    this.fromName = 'Amrikyy Travel';
  }

  /**
   * Initializes the email transporter.
   * @async
   * @method initialize
   * @returns {Promise<void>}
   * @throws {Error} If the Gmail credentials are not configured.
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Check if Gmail credentials are configured
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        logger.warn('Gmail credentials not configured. Email service will be disabled.');
        logger.warn('To enable emails, add GMAIL_USER and GMAIL_APP_PASSWORD to .env');
        return;
      }

      // Create Gmail transporter
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });

      // Verify connection
      await this.transporter.verify();
      this.initialized = true;
      logger.info('Gmail email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Gmail email service:', error);
      throw error;
    }
  }

  /**
   * Sends a generic email.
   * @async
   * @method sendEmail
   * @param {object} options - The email options.
   * @param {string} options.to - The recipient's email address.
   * @param {string} options.subject - The email subject.
   * @param {string} options.html - The HTML content of the email.
   * @param {string} [options.text] - The plain text content of the email.
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendEmail({ to, subject, html, text }) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.transporter) {
      logger.warn('Email service not initialized. Skipping email send.');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: text || this._stripHtml(html)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email sent successfully to ${to}`, {
        messageId: info.messageId,
        subject
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sends a booking confirmation email.
   * @async
   * @method sendBookingConfirmation
   * @param {object} bookingData - The booking data.
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendBookingConfirmation(bookingData) {
    const { email } = bookingData;

    const subject = `Booking Confirmation - ${bookingData.bookingId}`;
    const html = this._generateBookingConfirmationHTML(bookingData);

    return await this.sendEmail({
      to: email,
      subject,
      html
    });
  }

  /**
   * Sends a payment receipt email.
   * @async
   * @method sendPaymentReceipt
   * @param {object} paymentData - The payment data.
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendPaymentReceipt(paymentData) {
    const { email } = paymentData;

    const subject = `Payment Receipt - ${paymentData.bookingId}`;
    const html = this._generatePaymentReceiptHTML(paymentData);

    return await this.sendEmail({
      to: email,
      subject,
      html
    });
  }

  /**
   * Sends a password reset email.
   * @async
   * @method sendPasswordReset
   * @param {string} email - The recipient's email address.
   * @param {string} resetLink - The password reset link.
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendPasswordReset(email, resetLink) {
    const subject = 'Reset Your Password - Amrikyy Travel';
    const html = this._generatePasswordResetHTML(resetLink);

    return await this.sendEmail({
      to: email,
      subject,
      html
    });
  }

  /**
   * Sends a welcome email.
   * @async
   * @method sendWelcomeEmail
   * @param {string} email - The recipient's email address.
   * @param {string} name - The recipient's name.
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to Amrikyy Travel!';
    const html = this._generateWelcomeHTML(name);

    return await this.sendEmail({
      to: email,
      subject,
      html
    });
  }

  /**
   * Generates the HTML for a booking confirmation email.
   * @private
   * @method _generateBookingConfirmationHTML
   * @param {object} bookingData - The booking data.
   * @returns {string} The HTML content of the email.
   */
  _generateBookingConfirmationHTML(bookingData) {
    const { bookingId, flightDetails, travelerInfo, totalPrice } = bookingData;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-id { font-size: 24px; font-weight: bold; color: #667eea; margin: 20px 0; }
          .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .section-title { font-size: 18px; font-weight: bold; color: #667eea; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .info-label { font-weight: bold; color: #666; }
          .info-value { color: #333; }
          .total { font-size: 24px; font-weight: bold; color: #667eea; text-align: right; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✈️ Booking Confirmed!</h1>
            <p>Your journey begins here</p>
          </div>
          
          <div class="content">
            <p>Dear ${travelerInfo?.firstName || 'Traveler'},</p>
            <p>Thank you for booking with Amrikyy Travel! Your booking has been confirmed.</p>
            
            <div class="booking-id">
              Booking ID: ${bookingId}
            </div>
            
            <div class="section">
              <div class="section-title">Flight Details</div>
              <div class="info-row">
                <span class="info-label">From:</span>
                <span class="info-value">${flightDetails?.origin || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">To:</span>
                <span class="info-value">${flightDetails?.destination || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Departure:</span>
                <span class="info-value">${flightDetails?.departureDate || 'N/A'}</span>
              </div>
              ${flightDetails?.returnDate ? `
              <div class="info-row">
                <span class="info-label">Return:</span>
                <span class="info-value">${flightDetails.returnDate}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="info-label">Passengers:</span>
                <span class="info-value">${flightDetails?.passengers || 1}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Class:</span>
                <span class="info-value">${flightDetails?.class || 'Economy'}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Traveler Information</div>
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${travelerInfo?.firstName || ''} ${travelerInfo?.lastName || ''}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${travelerInfo?.email || ''}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${travelerInfo?.phone || 'N/A'}</span>
              </div>
            </div>
            
            <div class="total">
              Total: ${totalPrice || 'N/A'}
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://amrikyy.com'}/bookings/${bookingId}" class="button">
                View Booking Details
              </a>
            </div>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              <strong>Important:</strong> Please arrive at the airport at least 2 hours before departure for domestic flights and 3 hours for international flights.
            </p>
          </div>
          
          <div class="footer">
            <p>Need help? Contact us at support@amrikyy.com</p>
            <p>&copy; ${new Date().getFullYear()} Amrikyy Travel. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generates the HTML for a payment receipt email.
   * @private
   * @method _generatePaymentReceiptHTML
   * @param {object} paymentData - The payment data.
   * @returns {string} The HTML content of the email.
   */
  _generatePaymentReceiptHTML(paymentData) {
    const { bookingId, amount, currency, paymentIntentId, receiptUrl, paymentDate } = paymentData;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .receipt-box { background: white; padding: 30px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .amount { font-size: 36px; font-weight: bold; color: #11998e; text-align: center; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .info-label { font-weight: bold; color: #666; }
          .info-value { color: #333; }
          .success-badge { background: #38ef7d; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .button { display: inline-block; padding: 12px 30px; background: #11998e; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Successful!</h1>
            <p>Your payment has been processed</p>
          </div>
          
          <div class="content">
            <div style="text-align: center;">
              <span class="success-badge">✓ Payment Confirmed</span>
            </div>
            
            <div class="amount">
              ${currency?.toUpperCase() || 'USD'} ${amount || '0.00'}
            </div>
            
            <div class="receipt-box">
              <h2 style="color: #11998e; margin-bottom: 20px;">Receipt Details</h2>
              
              <div class="info-row">
                <span class="info-label">Booking ID:</span>
                <span class="info-value">${bookingId}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment ID:</span>
                <span class="info-value">${paymentIntentId}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Date:</span>
                <span class="info-value">${paymentDate || new Date().toLocaleDateString()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Amount Paid:</span>
                <span class="info-value">${currency?.toUpperCase() || 'USD'} ${amount || '0.00'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">Credit Card</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value" style="color: #38ef7d; font-weight: bold;">Paid</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              ${receiptUrl ? `
              <a href="${receiptUrl}" class="button">
                Download Receipt
              </a>
              ` : ''}
              <a href="${process.env.FRONTEND_URL || 'https://amrikyy.com'}/bookings/${bookingId}" class="button">
                View Booking
              </a>
            </div>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              This is an automated receipt for your records. If you have any questions about this payment, please contact our support team.
            </p>
          </div>
          
          <div class="footer">
            <p>Questions? Contact us at support@amrikyy.com</p>
            <p>&copy; ${new Date().getFullYear()} Amrikyy Travel. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generates the HTML for a password reset email.
   * @private
   * @method _generatePasswordResetHTML
   * @param {string} resetLink - The password reset link.
   * @returns {string} The HTML content of the email.
   */
  _generatePasswordResetHTML(resetLink) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Your Password</h1>
          </div>
          
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password for your Amrikyy Travel account.</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">
                Reset Password
              </a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0;">
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a>
            </p>
          </div>
          
          <div class="footer">
            <p>Need help? Contact us at support@amrikyy.com</p>
            <p>&copy; ${new Date().getFullYear()} Amrikyy Travel. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generates the HTML for a welcome email.
   * @private
   * @method _generateWelcomeHTML
   * @param {string} name - The recipient's name.
   * @returns {string} The HTML content of the email.
   */
  _generateWelcomeHTML(name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Amrikyy Travel</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .feature-icon { font-size: 30px; margin-bottom: 10px; }
          .button { display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✈️ Welcome to Amrikyy Travel!</h1>
            <p style="font-size: 18px;">Your journey to amazing destinations starts here</p>
          </div>
          
          <div class="content">
            <p>Hi ${name || 'there'}! 👋</p>
            <p>We're thrilled to have you join the Amrikyy Travel family. Get ready to explore the world with ease!</p>
            
            <div class="feature">
              <div class="feature-icon">🔍</div>
              <h3>Smart Flight Search</h3>
              <p>Find the best flights with our AI-powered search engine</p>
            </div>
            
            <div class="feature">
              <div class="feature-icon">💰</div>
              <h3>Best Price Guarantee</h3>
              <p>We compare prices across multiple airlines to get you the best deals</p>
            </div>
            
            <div class="feature">
              <div class="feature-icon">🤖</div>
              <h3>Maya AI Assistant</h3>
              <p>Get personalized travel recommendations from our AI assistant</p>
            </div>
            
            <div class="feature">
              <div class="feature-icon">📱</div>
              <h3>Book Anywhere</h3>
              <p>Access your bookings on web, mobile, Telegram, and WhatsApp</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'https://amrikyy.com'}/search" class="button">
                Start Exploring
              </a>
            </div>
            
            <p style="margin-top: 30px; color: #666;">
              Have questions? Our support team is here to help 24/7 at support@amrikyy.com
            </p>
          </div>
          
          <div class="footer">
            <p>Happy travels! ✈️</p>
            <p>&copy; ${new Date().getFullYear()} Amrikyy Travel. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Strips HTML tags from a string to create a plain text version.
   * @private
   * @method _stripHtml
   * @param {string} html - The HTML content.
   * @returns {string} The plain text content.
   */
  _stripHtml(html) {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Export singleton instance
const emailService = new EmailService();
module.exports = emailService;
