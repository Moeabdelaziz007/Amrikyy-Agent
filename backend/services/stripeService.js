/**
 * @fileoverview Stripe Payment Service
 * @module services/stripeService
 * @description Handles payment processing, payment intents, refunds, and webhooks using the Stripe API.
 */

const Stripe = require('stripe');
const logger = require('../utils/logger');

/**
 * @class StripeService
 * @description Provides methods for interacting with the Stripe API.
 */
class StripeService {
  /**
   * @constructor
   */
  constructor() {
    this.stripe = null;
    this.initialized = false;
  }

  /**
   * Initializes the Stripe client.
   * @method initialize
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
   * Creates a Stripe payment intent.
   * @async
   * @method createPaymentIntent
   * @param {object} params - The payment intent details.
   * @param {number} params.amount - The amount to charge (in the smallest currency unit, e.g., cents).
   * @param {string} [params.currency='usd'] - The currency of the payment.
   * @param {object} [params.metadata={}] - Metadata to associate with the payment intent.
   * @returns {Promise<object>} An object containing the payment intent information.
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
   * Retrieves a payment intent by its ID.
   * @async
   * @method getPaymentIntent
   * @param {string} paymentIntentId - The ID of the payment intent.
   * @returns {Promise<object>} An object containing the payment intent information.
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
   * Cancels a payment intent.
   * @async
   * @method cancelPaymentIntent
   * @param {string} paymentIntentId - The ID of the payment intent to cancel.
   * @returns {Promise<object>} An object indicating the result of the cancellation.
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
   * Verifies the signature of a Stripe webhook.
   * @method verifyWebhookSignature
   * @param {Buffer} payload - The raw payload of the webhook.
   * @param {string} signature - The signature from the 'stripe-signature' header.
   * @returns {object} The parsed Stripe event.
   * @throws {Error} If the signature is invalid or the webhook secret is not configured.
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
   * Creates a refund for a payment intent.
   * @async
   * @method createRefund
   * @param {string} paymentIntentId - The ID of the payment intent to refund.
   * @param {number|null} [amount=null] - The amount to refund. If null, the entire amount will be refunded.
   * @returns {Promise<object>} An object containing the refund information.
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
   * Retrieves the details of a payment method.
   * @async
   * @method getPaymentMethod
   * @param {string} paymentMethodId - The ID of the payment method.
   * @returns {Promise<object>} An object containing the payment method details.
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
