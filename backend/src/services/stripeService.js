/**
 * Stripe Payment Service
 * Handles all Stripe payment operations
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../../utils/logger');

class StripeService {
  /**
   * Create payment intent
   */
  async createPaymentIntent(amount, currency = 'USD', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(`✅ Payment intent created: ${paymentIntent.id}`);
      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      logger.error('❌ Create payment intent error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Confirm payment
   */
  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      logger.info(`✅ Payment confirmed: ${paymentIntentId}`);
      return {
        success: true,
        status: paymentIntent.status,
        paymentIntent,
      };
    } catch (error) {
      logger.error('❌ Confirm payment error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create payment link
   */
  async createPaymentLink(amount, currency = 'USD', description = 'Flight Booking') {
    try {
      // Create a price
      const price = await stripe.prices.create({
        unit_amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        product_data: {
          name: description,
          description: `Amrikyy - ${description}`,
        },
      });

      // Create payment link
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${process.env.FRONTEND_URL}/payment/success`,
          },
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
      });

      logger.info(`✅ Payment link created: ${paymentLink.id}`);
      return {
        success: true,
        url: paymentLink.url,
        id: paymentLink.id,
      };
    } catch (error) {
      logger.error('❌ Create payment link error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentIntentId, amount = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundData);

      logger.info(`✅ Refund created: ${refund.id}`);
      return {
        success: true,
        refund,
      };
    } catch (error) {
      logger.error('❌ Refund payment error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        payment: {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          created: paymentIntent.created,
          metadata: paymentIntent.metadata,
        },
      };
    } catch (error) {
      logger.error('❌ Get payment details error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle webhook event
   */
  async handleWebhook(event) {
    try {
      logger.info(`📨 Webhook received: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          return await this.handlePaymentSuccess(event.data.object);

        case 'payment_intent.payment_failed':
          return await this.handlePaymentFailed(event.data.object);

        case 'charge.refunded':
          return await this.handleRefund(event.data.object);

        default:
          logger.info(`Unhandled event type: ${event.type}`);
          return { success: true };
      }
    } catch (error) {
      logger.error('❌ Webhook handler error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(paymentIntent) {
    logger.info(`✅ Payment succeeded: ${paymentIntent.id}`);
    // This will be called by webhook handler
    // Update booking status in database
    return { success: true, paymentIntent };
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailed(paymentIntent) {
    logger.error(`❌ Payment failed: ${paymentIntent.id}`);
    // Update booking status in database
    return { success: true, paymentIntent };
  }

  /**
   * Handle refund
   */
  async handleRefund(charge) {
    logger.info(`💰 Refund processed: ${charge.id}`);
    // Update booking status in database
    return { success: true, charge };
  }

  /**
   * Construct webhook event
   */
  constructWebhookEvent(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      return {
        success: true,
        event,
      };
    } catch (error) {
      logger.error('❌ Webhook signature verification failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new StripeService();
