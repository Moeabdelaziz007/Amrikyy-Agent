/**
 * Stripe Payment Service
 * Handles payment processing, payment intents, and webhooks
 */

const Stripe = require('stripe');
const logger = require('../utils/logger');

class StripeService {
  constructor() {
    this.stripe = null;
    this.initialized = false;
  }

  /**
   * Initialize Stripe client
   */
  initialize() {
    if (this.initialized) {
      return;
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      logger.warn('Stripe secret key not configured. Payment service will be disabled.');
      return;
    }

    try {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16'
      });
      this.initialized = true;
      logger.info('Stripe payment service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Stripe:', error);
      throw error;
    }
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent({ amount, currency = 'usd', metadata = {} }) {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.stripe) {
      return {
        success: false,
        error: 'Payment service not configured'
      };
    }

    try {
      logger.info('Creating payment intent', { amount, currency });

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true
        }
      });

      logger.info('Payment intent created successfully', {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount
      });

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: paymentIntent.status
        }
      };

    } catch (error) {
      logger.error('Failed to create payment intent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Retrieve a payment intent
   */
  async getPaymentIntent(paymentIntentId) {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.stripe) {
      return {
        success: false,
        error: 'Payment service not configured'
      };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          metadata: paymentIntent.metadata
        }
      };

    } catch (error) {
      logger.error('Failed to retrieve payment intent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId) {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.stripe) {
      return {
        success: false,
        error: 'Payment service not configured'
      };
    }

    try {
      logger.info('Canceling payment intent', { paymentIntentId });

      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);

      logger.info('Payment intent canceled successfully', { paymentIntentId });

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status
        }
      };

    } catch (error) {
      logger.error('Failed to cancel payment intent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.stripe) {
      throw new Error('Payment service not configured');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
      return event;
    } catch (error) {
      logger.error('Webhook signature verification failed:', error);
      throw error;
    }
  }

  /**
   * Create a refund
   */
  async createRefund(paymentIntentId, amount = null) {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.stripe) {
      return {
        success: false,
        error: 'Payment service not configured'
      };
    }

    try {
      logger.info('Creating refund', { paymentIntentId, amount });

      const refundData = {
        payment_intent: paymentIntentId
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundData);

      logger.info('Refund created successfully', {
        refundId: refund.id,
        amount: refund.amount / 100
      });

      return {
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          currency: refund.currency,
          status: refund.status
        }
      };

    } catch (error) {
      logger.error('Failed to create refund:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get payment method details
   */
  async getPaymentMethod(paymentMethodId) {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.stripe) {
      return {
        success: false,
        error: 'Payment service not configured'
      };
    }

    try {
      const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);

      return {
        success: true,
        paymentMethod: {
          id: paymentMethod.id,
          type: paymentMethod.type,
          card: paymentMethod.card ? {
            brand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
            expMonth: paymentMethod.card.exp_month,
            expYear: paymentMethod.card.exp_year
          } : null
        }
      };

    } catch (error) {
      logger.error('Failed to retrieve payment method:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
const stripeService = new StripeService();
module.exports = stripeService;
