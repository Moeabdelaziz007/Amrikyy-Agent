/**
 * PayPal Payment Service
 * Handles PayPal payment processing for Amrikyy Travel Agent
 */

const paypal = require('@paypal/checkout-server-sdk');
const logger = require('../../utils/logger');

class PayPalService {
  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    this.mode = process.env.PAYPAL_MODE || 'sandbox'; // 'sandbox' or 'live'

    if (!this.clientId || !this.clientSecret) {
      console.warn('⚠️ PayPal credentials not configured. PayPal payments will be disabled.');
      this.isEnabled = false;
      return;
    }

    // Initialize PayPal environment
    const environment = this.mode === 'live'
      ? new paypal.core.LiveEnvironment(this.clientId, this.clientSecret)
      : new paypal.core.SandboxEnvironment(this.clientId, this.clientSecret);

    this.client = new paypal.core.PayPalHttpClient(environment);
    this.isEnabled = true;

    logger.info('PayPal Service initialized', { mode: this.mode });
  }

  /**
   * Create PayPal order
   */
  async createOrder(bookingData) {
    if (!this.isEnabled) {
      throw new Error('PayPal is not configured');
    }

    try {
      const { totalPrice, currency, bookingReference, origin, destination } = bookingData;

      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: bookingReference,
          description: `Flight booking from ${origin} to ${destination}`,
          amount: {
            currency_code: currency || 'USD',
            value: totalPrice.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: currency || 'USD',
                value: totalPrice.toFixed(2)
              }
            }
          },
          items: [{
            name: `Flight: ${origin} → ${destination}`,
            description: `Booking reference: ${bookingReference}`,
            unit_amount: {
              currency_code: currency || 'USD',
              value: totalPrice.toFixed(2)
            },
            quantity: '1',
            category: 'DIGITAL_GOODS'
          }]
        }],
        application_context: {
          brand_name: 'Amrikyy Travel',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.FRONTEND_URL}/booking/success`,
          cancel_url: `${process.env.FRONTEND_URL}/booking/cancel`
        }
      });

      const response = await this.client.execute(request);

      logger.info('PayPal order created', {
        orderId: response.result.id,
        bookingReference,
        amount: totalPrice
      });

      return {
        success: true,
        orderId: response.result.id,
        status: response.result.status,
        links: response.result.links,
        approvalUrl: response.result.links.find(link => link.rel === 'approve')?.href
      };

    } catch (error) {
      logger.error('PayPal order creation failed', { error: error.message });
      throw new Error(`PayPal order creation failed: ${error.message}`);
    }
  }

  /**
   * Capture PayPal order (complete payment)
   */
  async captureOrder(orderId) {
    if (!this.isEnabled) {
      throw new Error('PayPal is not configured');
    }

    try {
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});

      const response = await this.client.execute(request);

      logger.info('PayPal order captured', {
        orderId,
        status: response.result.status,
        captureId: response.result.purchase_units[0]?.payments?.captures[0]?.id
      });

      return {
        success: true,
        orderId: response.result.id,
        status: response.result.status,
        captureId: response.result.purchase_units[0]?.payments?.captures[0]?.id,
        payerEmail: response.result.payer?.email_address,
        payerName: response.result.payer?.name?.given_name + ' ' + response.result.payer?.name?.surname,
        amount: response.result.purchase_units[0]?.payments?.captures[0]?.amount
      };

    } catch (error) {
      logger.error('PayPal order capture failed', { error: error.message, orderId });
      throw new Error(`PayPal order capture failed: ${error.message}`);
    }
  }

  /**
   * Get order details
   */
  async getOrderDetails(orderId) {
    if (!this.isEnabled) {
      throw new Error('PayPal is not configured');
    }

    try {
      const request = new paypal.orders.OrdersGetRequest(orderId);
      const response = await this.client.execute(request);

      return {
        success: true,
        order: response.result
      };

    } catch (error) {
      logger.error('Failed to get PayPal order details', { error: error.message, orderId });
      throw new Error(`Failed to get order details: ${error.message}`);
    }
  }

  /**
   * Refund a captured payment
   */
  async refundPayment(captureId, amount, currency = 'USD') {
    if (!this.isEnabled) {
      throw new Error('PayPal is not configured');
    }

    try {
      const request = new paypal.payments.CapturesRefundRequest(captureId);
      request.requestBody({
        amount: {
          value: amount.toFixed(2),
          currency_code: currency
        }
      });

      const response = await this.client.execute(request);

      logger.info('PayPal refund processed', {
        captureId,
        refundId: response.result.id,
        status: response.result.status
      });

      return {
        success: true,
        refundId: response.result.id,
        status: response.result.status,
        amount: response.result.amount
      };

    } catch (error) {
      logger.error('PayPal refund failed', { error: error.message, captureId });
      throw new Error(`PayPal refund failed: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(webhookEvent, headers) {
    if (!this.isEnabled) {
      throw new Error('PayPal is not configured');
    }

    try {
      const webhookId = process.env.PAYPAL_WEBHOOK_ID;
      
      if (!webhookId) {
        logger.warn('PayPal webhook ID not configured, skipping verification');
        return { verified: false };
      }

      const request = new paypal.notifications.WebhookVerifySignatureRequest();
      request.requestBody({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: webhookEvent
      });

      const response = await this.client.execute(request);

      return {
        verified: response.result.verification_status === 'SUCCESS'
      };

    } catch (error) {
      logger.error('PayPal webhook verification failed', { error: error.message });
      return { verified: false, error: error.message };
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    if (!this.isEnabled) {
      return {
        status: 'disabled',
        message: 'PayPal is not configured'
      };
    }

    try {
      // Simple check - if client is initialized, it's healthy
      return {
        status: 'healthy',
        mode: this.mode,
        enabled: true
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

// Export singleton instance
module.exports = new PayPalService();
