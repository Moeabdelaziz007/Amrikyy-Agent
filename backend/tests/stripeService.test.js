/**
 * Unit Tests for Stripe Service
 * Tests payment intent creation, retrieval, and webhook handling
 */

const stripeService = require('../services/stripeService');

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123456',
        client_secret: 'pi_test_123456_secret_abc',
        amount: 85000,
        currency: 'usd',
        status: 'requires_payment_method',
        metadata: {}
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_test_123456',
        amount: 85000,
        currency: 'usd',
        status: 'succeeded',
        metadata: { bookingId: 'BK-TEST-12345' }
      }),
      cancel: jest.fn().mockResolvedValue({
        id: 'pi_test_123456',
        status: 'canceled'
      })
    },
    refunds: {
      create: jest.fn().mockResolvedValue({
        id: 're_test_123456',
        amount: 85000,
        status: 'succeeded'
      })
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123456',
            metadata: { bookingId: 'BK-TEST-12345' }
          }
        }
      })
    }
  }));
});

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('StripeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    stripeService.stripe = null;
    stripeService.initialized = false;
  });

  describe('initialize()', () => {
    it('should initialize Stripe client with API key', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456';

      stripeService.initialize();

      expect(stripeService.initialized).toBe(true);
      expect(stripeService.stripe).toBeDefined();
    });

    it('should handle missing API key gracefully', () => {
      delete process.env.STRIPE_SECRET_KEY;

      stripeService.initialize();

      expect(stripeService.initialized).toBe(false);
      expect(stripeService.stripe).toBeNull();
    });

    it('should not re-initialize if already initialized', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456';

      stripeService.initialize();
      const firstInstance = stripeService.stripe;
      
      stripeService.initialize();
      const secondInstance = stripeService.stripe;

      expect(firstInstance).toBe(secondInstance);
    });
  });

  describe('createPaymentIntent()', () => {
    beforeEach(() => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456';
      stripeService.initialize();
    });

    it('should create payment intent successfully', async () => {
      const result = await stripeService.createPaymentIntent({
        amount: 850.00,
        currency: 'usd',
        metadata: {
          bookingId: 'BK-TEST-12345',
          userId: 'user-123'
        }
      });

      expect(result.success).toBe(true);
      expect(result.paymentIntent).toBeDefined();
      expect(result.paymentIntent.id).toBe('pi_test_123456');
      expect(result.paymentIntent.clientSecret).toBeDefined();
    });

    it('should convert amount to cents', async () => {
      await stripeService.createPaymentIntent({
        amount: 850.00,
        currency: 'usd'
      });

      expect(stripeService.stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 85000 // 850.00 * 100
        })
      );
    });

    it('should convert currency to lowercase', async () => {
      await stripeService.createPaymentIntent({
        amount: 100,
        currency: 'USD'
      });

      expect(stripeService.stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'usd'
        })
      );
    });

    it('should use default currency when not provided', async () => {
      await stripeService.createPaymentIntent({
        amount: 100
      });

      expect(stripeService.stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'usd'
        })
      );
    });

    it('should include metadata in payment intent', async () => {
      const metadata = {
        bookingId: 'BK-TEST-12345',
        userId: 'user-123',
        type: 'flight_booking'
      };

      await stripeService.createPaymentIntent({
        amount: 850.00,
        metadata
      });

      expect(stripeService.stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata
        })
      );
    });

    it('should enable automatic payment methods', async () => {
      await stripeService.createPaymentIntent({
        amount: 100
      });

      expect(stripeService.stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          automatic_payment_methods: {
            enabled: true
          }
        })
      );
    });

    it('should handle Stripe errors gracefully', async () => {
      stripeService.stripe.paymentIntents.create.mockRejectedValueOnce(
        new Error('Stripe API error')
      );

      const result = await stripeService.createPaymentIntent({
        amount: 100
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe API error');
    });

    it('should fail when service not initialized', async () => {
      stripeService.initialized = false;
      stripeService.stripe = null;
      delete process.env.STRIPE_SECRET_KEY;

      const result = await stripeService.createPaymentIntent({
        amount: 100
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment service not configured');
    });

    it('should convert amount back to dollars in response', async () => {
      const result = await stripeService.createPaymentIntent({
        amount: 850.00
      });

      expect(result.paymentIntent.amount).toBe(850.00);
    });
  });

  describe('getPaymentIntent()', () => {
    beforeEach(() => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456';
      stripeService.initialize();
    });

    it('should retrieve payment intent successfully', async () => {
      const result = await stripeService.getPaymentIntent('pi_test_123456');

      expect(result.success).toBe(true);
      expect(result.paymentIntent).toBeDefined();
      expect(result.paymentIntent.id).toBe('pi_test_123456');
    });

    it('should fail when payment intent ID is missing', async () => {
      const result = await stripeService.getPaymentIntent(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment intent ID is required');
    });

    it('should handle retrieval errors gracefully', async () => {
      stripeService.stripe.paymentIntents.retrieve.mockRejectedValueOnce(
        new Error('Payment intent not found')
      );

      const result = await stripeService.getPaymentIntent('pi_invalid');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment intent not found');
    });
  });

  describe('cancelPaymentIntent()', () => {
    beforeEach(() => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456';
      stripeService.initialize();
    });

    it('should cancel payment intent successfully', async () => {
      const result = await stripeService.cancelPaymentIntent('pi_test_123456');

      expect(result.success).toBe(true);
      expect(result.paymentIntent).toBeDefined();
      expect(result.paymentIntent.status).toBe('canceled');
    });

    it('should fail when payment intent ID is missing', async () => {
      const result = await stripeService.cancelPaymentIntent(null);

      expect(result.success).toBe(false);
    });

    it('should handle cancellation errors', async () => {
      stripeService.stripe.paymentIntents.cancel.mockRejectedValueOnce(
        new Error('Cannot cancel succeeded payment')
      );

      const result = await stripeService.cancelPaymentIntent('pi_test_123456');

      expect(result.success).toBe(false);
    });
  });

  describe('createRefund()', () => {
    beforeEach(() => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456';
      stripeService.initialize();
    });

    it('should create full refund successfully', async () => {
      const result = await stripeService.createRefund('pi_test_123456');

      expect(result.success).toBe(true);
      expect(result.refund).toBeDefined();
      expect(result.refund.id).toBe('re_test_123456');
    });

    it('should create partial refund successfully', async () => {
      const result = await stripeService.createRefund('pi_test_123456', 500.00);

      expect(result.success).toBe(true);
      expect(stripeService.stripe.refunds.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_intent: 'pi_test_123456',
          amount: 50000 // 500.00 * 100
        })
      );
    });

    it('should convert refund amount to cents', async () => {
      await stripeService.createRefund('pi_test_123456', 123.45);

      expect(stripeService.stripe.refunds.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 12345
        })
      );
    });

    it('should fail when payment intent ID is missing', async () => {
      const result = await stripeService.createRefund(null);

      expect(result.success).toBe(false);
    });
  });

  describe('verifyWebhookSignature()', () => {
    beforeEach(() => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123456';
      stripeService.initialize();
    });

    it('should verify webhook signature successfully', async () => {
      const payload = JSON.stringify({ type: 'payment_intent.succeeded' });
      const signature = 'test-signature';

      const result = await stripeService.verifyWebhookSignature(payload, signature);

      expect(result.success).toBe(true);
      expect(result.event).toBeDefined();
      expect(result.event.type).toBe('payment_intent.succeeded');
    });

    it('should fail when webhook secret is not configured', async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;
      stripeService.initialized = false;
      stripeService.initialize();

      const result = await stripeService.verifyWebhookSignature('payload', 'signature');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Webhook secret not configured');
    });

    it('should handle invalid signatures', async () => {
      stripeService.stripe.webhooks.constructEvent.mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      const result = await stripeService.verifyWebhookSignature('payload', 'bad-signature');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });
  });

  describe('Error Handling', () => {
    it('should log errors when operations fail', async () => {
      const logger = require('../utils/logger');
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456';
      stripeService.initialize();

      stripeService.stripe.paymentIntents.create.mockRejectedValueOnce(
        new Error('Network error')
      );

      await stripeService.createPaymentIntent({ amount: 100 });

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create payment intent'),
        expect.any(Error)
      );
    });

    it('should return error when Stripe throws exception', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456';
      stripeService.initialize();

      stripeService.stripe.paymentIntents.create.mockRejectedValueOnce(
        new Error('Rate limit exceeded')
      );

      const result = await stripeService.createPaymentIntent({ amount: 100 });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Rate limit exceeded');
    });
  });
});
