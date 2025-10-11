const express = require('express');
const router = express.Router();
const stripeService = require('../src/services/stripeService');
const PaymentService = require('../src/services/paymentService');

// Create Stripe payment link
router.post('/create-payment-link', async (req, res) => {
  try {
    const { amount, currency, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required and must be greater than 0'
      });
    }

    const paymentResult = await stripeService.createPaymentLink(amount, currency, description);
    
    if (paymentResult.success) {
      res.json({
        success: true,
        paymentLink: paymentResult.data,
        message: 'Payment link created successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: paymentResult.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Create payment intent
router.post('/create-payment', async (req, res) => {
  try {
    const { amount, currency, paymentMethod, description, chatId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required and must be greater than 0'
      });
    }

    let paymentResult;
    
    switch (paymentMethod) {
    case 'stripe':
      paymentResult = await stripeService.createPaymentLink(amount, currency, description);
      break;
    case 'paypal':
      paymentResult = await PaymentService.createPayPalPayment(amount, currency, description);
      break;
    case 'telegram':
      paymentResult = await PaymentService.createTelegramPayment(amount, currency, description, chatId);
      break;
    default:
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method. Supported: stripe, paypal, telegram'
      });
    }

    if (paymentResult.success) {
      res.json({
        success: true,
        payment: paymentResult.data,
        message: 'Payment created successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: paymentResult.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Confirm payment
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentId, paymentMethod } = req.body;
    
    if (!paymentId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID and method are required'
      });
    }

    // Simulate payment confirmation
    const confirmation = {
      id: paymentId,
      status: 'succeeded',
      confirmed_at: new Date().toISOString(),
      method: paymentMethod
    };

    res.json({
      success: true,
      confirmation,
      message: 'Payment confirmed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get payment status
router.get('/payment-status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Simulate payment status check
    const status = {
      id: paymentId,
      status: 'succeeded',
      amount: 100.00,
      currency: 'USD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      payment: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Telegram Bot webhook for payments
router.post('/telegram-webhook', async (req, res) => {
  try {
    const { update } = req.body;
    
    if (update.pre_checkout_query) {
      // Handle pre-checkout query
      const { id, from, currency, total_amount } = update.pre_checkout_query;
      
      // Validate payment
      const isValid = total_amount > 0 && currency === 'USD';
      
      if (isValid) {
        // Approve payment
        res.json({
          success: true,
          message: 'Payment approved',
          pre_checkout_query_id: id
        });
      } else {
        // Reject payment
        res.status(400).json({
          success: false,
          error: 'Invalid payment amount or currency'
        });
      }
    } else if (update.message && update.message.successful_payment) {
      // Handle successful payment
      const { successful_payment } = update.message;
      
      res.json({
        success: true,
        message: 'Payment processed successfully',
        payment: successful_payment
      });
    } else {
      res.json({
        success: true,
        message: 'Webhook received'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
