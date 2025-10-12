const Stripe = require('stripe');

class StripeService {
  constructor() {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'your_stripe_secret_key_here') {
      throw new Error('Stripe secret key not configured.');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15'
    });
  }

  async createPaymentLink(amount, currency = 'USD', description = 'Amrikyy Trips Payment') {
    try {
      const price = await this.stripe.prices.create({
        unit_amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        product_data: {
          name: description,
          description: `Amrikyy Trips - ${description}`
        }
      });

      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1
          }
        ],
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`
          }
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        payment_method_types: ['card']
      });

      return {
        success: true,
        data: {
          id: paymentLink.id,
          url: paymentLink.url,
          amount: amount,
          currency: currency,
          description: description,
          status: 'created'
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new StripeService();
