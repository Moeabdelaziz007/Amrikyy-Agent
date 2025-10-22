/**
 * Unit Tests for Email Service
 * Tests email sending, template generation, and error handling
 */

const emailService = require('../services/emailService');

// Mock nodemailer
const mockTransporter = {
  verify: jest.fn().mockResolvedValue(true),
  sendMail: jest.fn().mockResolvedValue({
    messageId: 'test-message-id-123'
  })
};

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => mockTransporter)
}));

const nodemailer = require('nodemailer');

// Mock logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTransporter.verify.mockClear();
    mockTransporter.sendMail.mockClear();
    mockTransporter.verify.mockResolvedValue(true);
    mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id-123' });
    emailService.transporter = null;
    emailService.initialized = false;
  });

  describe('initialize()', () => {
    it('should initialize email service with Gmail credentials', async () => {
      process.env.GMAIL_USER = 'test@gmail.com';
      process.env.GMAIL_APP_PASSWORD = 'test-password';

      await emailService.initialize();

      expect(emailService.initialized).toBe(true);
      expect(emailService.transporter).toBeDefined();
    });

    it('should handle missing Gmail credentials gracefully', async () => {
      delete process.env.GMAIL_USER;
      delete process.env.GMAIL_APP_PASSWORD;

      await emailService.initialize();

      expect(emailService.initialized).toBe(false);
      expect(emailService.transporter).toBeNull();
    });

    it('should not re-initialize if already initialized', async () => {
      process.env.GMAIL_USER = 'test@gmail.com';
      process.env.GMAIL_APP_PASSWORD = 'test-password';

      await emailService.initialize();
      const firstTransporter = emailService.transporter;
      
      await emailService.initialize();
      const secondTransporter = emailService.transporter;

      expect(firstTransporter).toBe(secondTransporter);
    });
  });

  describe('sendEmail()', () => {
    beforeEach(async () => {
      process.env.GMAIL_USER = 'test@gmail.com';
      process.env.GMAIL_APP_PASSWORD = 'test-password';
      await emailService.initialize();
    });

    it('should send email successfully', async () => {
      const result = await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        text: 'Test content'
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id-123');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Test Email'
        })
      );
    });

    it('should handle email sending failure', async () => {
      mockTransporter.sendMail.mockRejectedValueOnce(
        new Error('SMTP error')
      );

      const result = await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMTP error');
    });

    it('should strip HTML for text version if not provided', async () => {
      await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Hello <strong>World</strong></p>'
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Hello World')
        })
      );
    });
  });

  describe('sendBookingConfirmation()', () => {
    beforeEach(async () => {
      process.env.GMAIL_USER = 'test@gmail.com';
      process.env.GMAIL_APP_PASSWORD = 'test-password';
      await emailService.initialize();
    });

    it('should send booking confirmation email with all details', async () => {
      const bookingData = {
        email: 'user@example.com',
        bookingId: 'BK-TEST-12345',
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
          email: 'user@example.com',
          phone: '+201234567890'
        },
        totalPrice: 'USD 850.00'
      };

      const result = await emailService.sendBookingConfirmation(bookingData);

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Booking Confirmation - BK-TEST-12345'
        })
      );
    });

    it('should include flight details in email HTML', async () => {
      const bookingData = {
        email: 'user@example.com',
        bookingId: 'BK-TEST-12345',
        flightDetails: {
          origin: 'Cairo',
          destination: 'Dubai',
          departureDate: '2025-11-15'
        },
        travelerInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'user@example.com'
        },
        totalPrice: 'USD 850.00'
      };

      await emailService.sendBookingConfirmation(bookingData);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('BK-TEST-12345');
      expect(callArgs.html).toContain('Cairo');
      expect(callArgs.html).toContain('Dubai');
      expect(callArgs.html).toContain('John');
    });
  });

  describe('sendPaymentReceipt()', () => {
    beforeEach(async () => {
      process.env.GMAIL_USER = 'test@gmail.com';
      process.env.GMAIL_APP_PASSWORD = 'test-password';
      await emailService.initialize();
    });

    it('should send payment receipt email', async () => {
      const paymentData = {
        email: 'user@example.com',
        bookingId: 'BK-TEST-12345',
        amount: 850.00,
        currency: 'usd',
        paymentIntentId: 'pi_test_123456',
        receiptUrl: 'https://stripe.com/receipt/123'
      };

      const result = await emailService.sendPaymentReceipt(paymentData);

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Payment Receipt - BK-TEST-12345'
        })
      );
    });

    it('should include payment details in email HTML', async () => {
      const paymentData = {
        email: 'user@example.com',
        bookingId: 'BK-TEST-12345',
        amount: 850.00,
        currency: 'usd',
        paymentIntentId: 'pi_test_123456'
      };

      await emailService.sendPaymentReceipt(paymentData);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('850');
      expect(callArgs.html).toContain('USD');
      expect(callArgs.html).toContain('pi_test_123456');
    });
  });

  describe('sendPasswordReset()', () => {
    beforeEach(async () => {
      process.env.GMAIL_USER = 'test@gmail.com';
      process.env.GMAIL_APP_PASSWORD = 'test-password';
      await emailService.initialize();
    });

    it('should send password reset email with link', async () => {
      const resetLink = 'https://amrikyy.com/reset-password?token=abc123';

      const result = await emailService.sendPasswordReset(
        'user@example.com',
        resetLink
      );

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Reset Your Password')
        })
      );
    });

    it('should include reset link in email HTML', async () => {
      const resetLink = 'https://amrikyy.com/reset-password?token=abc123';

      await emailService.sendPasswordReset('user@example.com', resetLink);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(resetLink);
    });
  });

  describe('sendWelcomeEmail()', () => {
    beforeEach(async () => {
      process.env.GMAIL_USER = 'test@gmail.com';
      process.env.GMAIL_APP_PASSWORD = 'test-password';
      await emailService.initialize();
    });

    it('should send welcome email to new user', async () => {
      const result = await emailService.sendWelcomeEmail(
        'user@example.com',
        'John Doe'
      );

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Welcome to Amrikyy Travel!'
        })
      );
    });

    it('should personalize welcome email with user name', async () => {
      await emailService.sendWelcomeEmail('user@example.com', 'John Doe');

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('John Doe');
    });

    it('should handle missing name gracefully', async () => {
      await emailService.sendWelcomeEmail('user@example.com');

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('there');
    });
  });

  describe('_stripHtml()', () => {
    it('should remove HTML tags from content', () => {
      const html = '<p>Hello <strong>World</strong></p>';
      const text = emailService._stripHtml(html);

      expect(text).toBe('Hello World');
      expect(text).not.toContain('<');
      expect(text).not.toContain('>');
    });

    it('should remove style tags and content', () => {
      const html = '<style>body { color: red; }</style><p>Hello</p>';
      const text = emailService._stripHtml(html);

      expect(text).toBe('Hello');
      expect(text).not.toContain('style');
      expect(text).not.toContain('color');
    });

    it('should normalize whitespace', () => {
      const html = '<p>Hello    \n\n    World</p>';
      const text = emailService._stripHtml(html);

      expect(text).toBe('Hello World');
    });
  });

  describe('Error Handling', () => {
    it('should return error when service not initialized', async () => {
      emailService.initialized = false;
      emailService.transporter = null;
      delete process.env.GMAIL_USER;

      const result = await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email service not configured');
    });

    it('should log errors when sending fails', async () => {
      const logger = require('../utils/logger');
      process.env.GMAIL_USER = 'test@gmail.com';
      process.env.GMAIL_APP_PASSWORD = 'test-password';
      await emailService.initialize();

      mockTransporter.sendMail.mockRejectedValueOnce(
        new Error('Network error')
      );

      await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      });

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send email'),
        expect.any(Error)
      );
    });
  });
});
