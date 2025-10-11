/**
 * Stripe Payment Wrapper Service
 * Simplifies Stripe integration with caching, error handling, and retry logic
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../../utils/logger');
const redisService = require('../redis-service');

class StripeService {
  constructor() {
    this.cachePrefix = 'stripe:';
    this.cacheTTL = 300; // 5 minutes for payment data
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(params) {
    try {
      const {
        amount, // in cents
        currency = 'usd',
        customerId,
        metadata = {},
        description,
        paymentMethodTypes = ['card'],
        captureMethod = 'automatic'
      } = params;

      if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
      }

      const paymentIntent = await this.retryOperation(async () => {
        return await stripe.paymentIntents.create({
          amount,
          currency,
          customer: customerId,
          metadata,
          description,
          payment_method_types: paymentMethodTypes,
          capture_method: captureMethod
        });
      });

      logger.info(`✅ Created payment intent: ${paymentIntent.id} for ${amount/100} ${currency}`);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      };
    } catch (error) {
      logger.error('Stripe payment intent creation error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(params) {
    try {
      const {
        email,
        name,
        phone,
        metadata = {}
      } = params;

      if (!email) {
        throw new Error('Email is required');
      }

      // Check cache for existing customer
      const cacheKey = `${this.cachePrefix}customer:email:${email}`;
      if (redisService.isConnected) {
        const cached = await redisService.get(cacheKey);
        if (cached) {
          logger.info(`✅ Found cached customer: ${email}`);
          return cached;
        }
      }

      const customer = await this.retryOperation(async () => {
        return await stripe.customers.create({
          email,
          name,
          phone,
          metadata
        });
      });

      const customerData = {
        customerId: customer.id,
        email: customer.email,
        name: customer.name,
        created: customer.created
      };

      // Cache customer data
      if (redisService.isConnected) {
        await redisService.set(cacheKey, customerData, 86400); // 24 hours
      }

      logger.info(`✅ Created Stripe customer: ${customer.id}`);

      return customerData;
    } catch (error) {
      logger.error('Stripe customer creation error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId) {
    try {
      const cacheKey = `${this.cachePrefix}customer:${customerId}`;
      
      if (redisService.isConnected) {
        const cached = await redisService.get(cacheKey);
        if (cached) return cached;
      }

      const customer = await stripe.customers.retrieve(customerId);

      const customerData = {
        customerId: customer.id,
        email: customer.email,
        name: customer.name,
        created: customer.created,
        defaultSource: customer.default_source
      };

      if (redisService.isConnected) {
        await redisService.set(cacheKey, customerData, 3600); // 1 hour
      }

      return customerData;
    } catch (error) {
      logger.error(`Stripe get customer error (${customerId}):`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(params) {
    try {
      const {
        customerId,
        priceId,
        trialPeriodDays,
        metadata = {}
      } = params;

      if (!customerId || !priceId) {
        throw new Error('Customer ID and Price ID are required');
      }

      const subscription = await this.retryOperation(async () => {
        return await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          trial_period_days: trialPeriodDays,
          metadata,
          payment_behavior: 'default_incomplete',
          payment_settings: { save_default_payment_method: 'on_subscription' },
          expand: ['latest_invoice.payment_intent']
        });
      });

      logger.info(`✅ Created subscription: ${subscription.id}`);

      return {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end
      };
    } catch (error) {
      logger.error('Stripe subscription creation error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId, immediate = false) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediate
      });

      if (immediate) {
        await stripe.subscriptions.cancel(subscriptionId);
      }

      logger.info(`✅ Cancelled subscription: ${subscriptionId} (immediate: ${immediate})`);

      return {
        subscriptionId: subscription.id,
        status: subscription.status,
        canceledAt: subscription.canceled_at,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      };
    } catch (error) {
      logger.error(`Stripe cancel subscription error (${subscriptionId}):`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a checkout session
   */
  async createCheckoutSession(params) {
    try {
      const {
        priceId,
        quantity = 1,
        customerId,
        successUrl,
        cancelUrl,
        mode = 'payment', // payment, subscription, setup
        metadata = {}
      } = params;

      if (!priceId || !successUrl || !cancelUrl) {
        throw new Error('Price ID, success URL, and cancel URL are required');
      }

      const sessionParams = {
        line_items: [
          {
            price: priceId,
            quantity
          }
        ],
        mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata
      };

      if (customerId) {
        sessionParams.customer = customerId;
      }

      const session = await this.retryOperation(async () => {
        return await stripe.checkout.sessions.create(sessionParams);
      });

      logger.info(`✅ Created checkout session: ${session.id}`);

      return {
        sessionId: session.id,
        url: session.url,
        status: session.status
      };
    } catch (error) {
      logger.error('Stripe checkout session creation error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a payment link
   */
  async createPaymentLink(params) {
    try {
      const {
        priceId,
        quantity = 1,
        metadata = {}
      } = params;

      if (!priceId) {
        throw new Error('Price ID is required');
      }

      const paymentLink = await this.retryOperation(async () => {
        return await stripe.paymentLinks.create({
          line_items: [
            {
              price: priceId,
              quantity
            }
          ],
          metadata
        });
      });

      logger.info(`✅ Created payment link: ${paymentLink.id}`);

      return {
        paymentLinkId: paymentLink.id,
        url: paymentLink.url,
        active: paymentLink.active
      };
    } catch (error) {
      logger.error('Stripe payment link creation error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Retrieve a payment intent
   */
  async getPaymentIntent(paymentIntentId) {
    try {
      const cacheKey = `${this.cachePrefix}payment:${paymentIntentId}`;
      
      if (redisService.isConnected) {
        const cached = await redisService.get(cacheKey);
        if (cached) return cached;
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      const data = {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        customerId: paymentIntent.customer,
        created: paymentIntent.created
      };

      if (redisService.isConnected && paymentIntent.status === 'succeeded') {
        await redisService.set(cacheKey, data, 3600); // Cache successful payments
      }

      return data;
    } catch (error) {
      logger.error(`Stripe get payment intent error (${paymentIntentId}):`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Refund a payment
   */
  async createRefund(params) {
    try {
      const {
        paymentIntentId,
        amount, // Optional, refund specific amount
        reason = 'requested_by_customer'
      } = params;

      if (!paymentIntentId) {
        throw new Error('Payment Intent ID is required');
      }

      const refundParams = {
        payment_intent: paymentIntentId,
        reason
      };

      if (amount) {
        refundParams.amount = amount;
      }

      const refund = await this.retryOperation(async () => {
        return await stripe.refunds.create(refundParams);
      });

      logger.info(`✅ Created refund: ${refund.id} for payment ${paymentIntentId}`);

      return {
        refundId: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status
      };
    } catch (error) {
      logger.error('Stripe refund creation error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * List customer's payment methods
   */
  async listPaymentMethods(customerId, type = 'card') {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type
      });

      return paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year
        } : null
      }));
    } catch (error) {
      logger.error(`Stripe list payment methods error (${customerId}):`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature, secret) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        secret || process.env.STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (error) {
      logger.error('Stripe webhook verification error:', error);
      throw new Error('Webhook signature verification failed');
    }
  }

  /**
   * Retry operation with exponential backoff
   */
  async retryOperation(operation, attempt = 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= this.retryAttempts) {
        throw error;
      }

      // Retry on network errors or rate limits
      if (error.type === 'StripeConnectionError' || error.statusCode === 429) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        logger.warn(`Retrying Stripe operation (attempt ${attempt}) after ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryOperation(operation, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      // Simple API call to verify connection
      await stripe.balance.retrieve();

      return {
        status: 'healthy',
        service: 'Stripe API',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'Stripe API',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Handle Stripe errors
   */
  handleError(error) {
    const errorMap = {
      'StripeCardError': 'Card was declined',
      'StripeInvalidRequestError': 'Invalid parameters',
      'StripeAPIError': 'Stripe API error',
      'StripeConnectionError': 'Network error',
      'StripeAuthenticationError': 'Authentication failed',
      'StripeRateLimitError': 'Too many requests'
    };

    return {
      error: errorMap[error.type] || 'Payment processing error',
      type: error.type,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    };
  }

  /**
   * Clear cache
   */
  async clearCache(pattern = '*') {
    if (redisService.isConnected) {
      await redisService.clearCacheByPattern(`${this.cachePrefix}${pattern}`);
      logger.info(`✅ Cleared Stripe cache: ${pattern}`);
    }
  }
}

// Singleton instance
const stripeService = new StripeService();

module.exports = stripeService;

