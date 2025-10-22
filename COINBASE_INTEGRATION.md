# 💰 Coinbase Integration - Cryptocurrency Payments

**Adding Coinbase Commerce to Amrikyy Agent**  
**API Key**: `c100898f-e713-402b-b9d3-66421db017e5`  
**Date**: October 22, 2025

---

## 🎯 OVERVIEW

Integrate Coinbase Commerce to accept cryptocurrency payments:
- Bitcoin (BTC)
- Ethereum (ETH)
- Litecoin (LTC)
- Bitcoin Cash (BCH)
- USD Coin (USDC)
- DAI

---

## 🔧 SETUP

### **1. Install Coinbase Commerce SDK**

```bash
cd backend
npm install coinbase-commerce-node
```

### **2. Add Environment Variables**

```bash
# .env
COINBASE_COMMERCE_API_KEY=c100898f-e713-402b-b9d3-66421db017e5
COINBASE_WEBHOOK_SECRET=your_webhook_secret
```

---

## 💻 IMPLEMENTATION

### **CoinbaseService.js**

```javascript
// backend/src/services/CoinbaseService.js
const Client = require('coinbase-commerce-node').Client;
const Charge = require('coinbase-commerce-node').resources.Charge;
const Webhook = require('coinbase-commerce-node').Webhook;

class CoinbaseService {
  constructor() {
    Client.init(process.env.COINBASE_COMMERCE_API_KEY);
    this.webhookSecret = process.env.COINBASE_WEBHOOK_SECRET;
  }

  /**
   * Create a cryptocurrency payment charge
   */
  async createCharge(params) {
    const {
      name,
      description,
      amount,
      currency = 'USD',
      metadata = {}
    } = params;

    try {
      const chargeData = {
        name,
        description,
        pricing_type: 'fixed_price',
        local_price: {
          amount: amount.toString(),
          currency: currency
        },
        metadata: {
          ...metadata,
          customer_id: metadata.userId,
          order_id: metadata.orderId
        }
      };

      const charge = await Charge.create(chargeData);

      return {
        id: charge.id,
        code: charge.code,
        hosted_url: charge.hosted_url,
        pricing: charge.pricing,
        addresses: charge.addresses,
        expires_at: charge.expires_at,
        created_at: charge.created_at
      };
    } catch (error) {
      console.error('Coinbase charge creation failed:', error);
      throw new Error(`Failed to create charge: ${error.message}`);
    }
  }

  /**
   * Get charge details
   */
  async getCharge(chargeId) {
    try {
      const charge = await Charge.retrieve(chargeId);
      return {
        id: charge.id,
        code: charge.code,
        status: charge.timeline[charge.timeline.length - 1].status,
        pricing: charge.pricing,
        payments: charge.payments,
        timeline: charge.timeline
      };
    } catch (error) {
      console.error('Failed to retrieve charge:', error);
      throw new Error(`Failed to get charge: ${error.message}`);
    }
  }

  /**
   * List all charges
   */
  async listCharges(limit = 25) {
    try {
      const charges = await Charge.list({ limit });
      return charges.data.map(charge => ({
        id: charge.id,
        code: charge.code,
        status: charge.timeline[charge.timeline.length - 1].status,
        amount: charge.pricing.local.amount,
        currency: charge.pricing.local.currency,
        created_at: charge.created_at
      }));
    } catch (error) {
      console.error('Failed to list charges:', error);
      throw new Error(`Failed to list charges: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(rawBody, signature) {
    try {
      const event = Webhook.verifyEventBody(
        rawBody,
        signature,
        this.webhookSecret
      );
      return event;
    } catch (error) {
      console.error('Webhook verification failed:', error);
      return null;
    }
  }

  /**
   * Handle webhook event
   */
  async handleWebhook(event) {
    const { type, data } = event;

    switch (type) {
      case 'charge:created':
        console.log('Charge created:', data.code);
        break;

      case 'charge:confirmed':
        console.log('Payment confirmed:', data.code);
        // Update order status to paid
        await this.handlePaymentConfirmed(data);
        break;

      case 'charge:failed':
        console.log('Payment failed:', data.code);
        // Handle failed payment
        await this.handlePaymentFailed(data);
        break;

      case 'charge:delayed':
        console.log('Payment delayed:', data.code);
        break;

      case 'charge:pending':
        console.log('Payment pending:', data.code);
        break;

      case 'charge:resolved':
        console.log('Payment resolved:', data.code);
        break;

      default:
        console.log('Unknown event type:', type);
    }

    return { received: true };
  }

  /**
   * Handle confirmed payment
   */
  async handlePaymentConfirmed(charge) {
    // Update database
    // Send confirmation email
    // Fulfill order
    console.log('Processing confirmed payment:', charge.id);
    
    return {
      orderId: charge.metadata.order_id,
      status: 'paid',
      amount: charge.pricing.local.amount,
      currency: charge.pricing.local.currency
    };
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailed(charge) {
    // Update database
    // Send failure notification
    console.log('Processing failed payment:', charge.id);
    
    return {
      orderId: charge.metadata.order_id,
      status: 'failed'
    };
  }

  /**
   * Get supported cryptocurrencies
   */
  getSupportedCurrencies() {
    return [
      { code: 'BTC', name: 'Bitcoin' },
      { code: 'ETH', name: 'Ethereum' },
      { code: 'LTC', name: 'Litecoin' },
      { code: 'BCH', name: 'Bitcoin Cash' },
      { code: 'USDC', name: 'USD Coin' },
      { code: 'DAI', name: 'Dai' }
    ];
  }
}

module.exports = new CoinbaseService();
```

---

## 🔌 API ROUTES

### **coinbase-routes.js**

```javascript
// backend/routes/coinbase-routes.js
const express = require('express');
const router = express.Router();
const coinbaseService = require('../src/services/CoinbaseService');

/**
 * POST /api/coinbase/charge
 * Create a new cryptocurrency payment charge
 */
router.post('/charge', async (req, res) => {
  try {
    const { name, description, amount, currency, metadata } = req.body;

    const charge = await coinbaseService.createCharge({
      name,
      description,
      amount,
      currency,
      metadata
    });

    res.json({
      success: true,
      data: charge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/coinbase/charge/:id
 * Get charge details
 */
router.get('/charge/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const charge = await coinbaseService.getCharge(id);

    res.json({
      success: true,
      data: charge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/coinbase/charges
 * List all charges
 */
router.get('/charges', async (req, res) => {
  try {
    const { limit } = req.query;
    const charges = await coinbaseService.listCharges(limit);

    res.json({
      success: true,
      data: charges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/coinbase/webhook
 * Handle Coinbase webhook events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-cc-webhook-signature'];
    const rawBody = req.body.toString('utf8');

    const event = coinbaseService.verifyWebhook(rawBody, signature);

    if (!event) {
      return res.status(400).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    await coinbaseService.handleWebhook(event);

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/coinbase/currencies
 * Get supported cryptocurrencies
 */
router.get('/currencies', (req, res) => {
  const currencies = coinbaseService.getSupportedCurrencies();
  res.json({
    success: true,
    data: currencies
  });
});

module.exports = router;
```

---

## 🔗 INTEGRATE WITH SERVER

### **Update server.js**

```javascript
// backend/server.js

// Add Coinbase routes
const coinbaseRoutes = require('./routes/coinbase-routes');

// Use routes (BEFORE express.json() for webhook)
app.use('/api/coinbase/webhook', coinbaseRoutes);
app.use(express.json());
app.use('/api/coinbase', coinbaseRoutes);
```

---

## 💻 FRONTEND INTEGRATION

### **CoinbasePayment Component**

```typescript
// frontend/src/components/CoinbasePayment.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CoinbasePaymentProps {
  amount: number;
  currency?: string;
  description: string;
  onSuccess?: (chargeId: string) => void;
  onError?: (error: string) => void;
}

export function CoinbasePayment({
  amount,
  currency = 'USD',
  description,
  onSuccess,
  onError
}: CoinbasePaymentProps) {
  const [loading, setLoading] = useState(false);
  const [chargeUrl, setChargeUrl] = useState<string | null>(null);

  const createCharge = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/coinbase/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Amrikyy Service',
          description,
          amount,
          currency,
          metadata: {
            userId: 'user_123',
            orderId: `order_${Date.now()}`
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setChargeUrl(data.data.hosted_url);
        // Open payment page
        window.open(data.data.hosted_url, '_blank');
        onSuccess?.(data.data.id);
      } else {
        onError?.(data.error);
      }
    } catch (error) {
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Pay with Cryptocurrency</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="text-2xl font-bold">${amount} {currency}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Accepted Cryptocurrencies</p>
          <div className="flex gap-2 mt-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded">BTC</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">ETH</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded">USDC</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded">DAI</span>
          </div>
        </div>

        <Button
          onClick={createCharge}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating Payment...' : 'Pay with Crypto'}
        </Button>

        {chargeUrl && (
          <p className="text-sm text-center text-gray-500">
            Payment page opened in new tab
          </p>
        )}
      </div>
    </Card>
  );
}
```

---

## 🧪 TESTING

### **Test Charge Creation**

```bash
curl -X POST http://localhost:3000/api/coinbase/charge \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Payment",
    "description": "Testing Coinbase integration",
    "amount": 10,
    "currency": "USD",
    "metadata": {
      "userId": "test_user",
      "orderId": "test_order_123"
    }
  }'
```

### **Test Get Charge**

```bash
curl http://localhost:3000/api/coinbase/charge/CHARGE_ID
```

### **Test List Charges**

```bash
curl http://localhost:3000/api/coinbase/charges
```

---

## 🔔 WEBHOOK SETUP

### **1. Configure Webhook in Coinbase Dashboard**

1. Go to https://commerce.coinbase.com/dashboard/settings
2. Click "Webhook subscriptions"
3. Add endpoint: `https://your-domain.com/api/coinbase/webhook`
4. Copy webhook secret
5. Add to `.env`: `COINBASE_WEBHOOK_SECRET=your_secret`

### **2. Test Webhook Locally**

```bash
# Use ngrok for local testing
ngrok http 3000

# Update webhook URL in Coinbase dashboard
https://your-ngrok-url.ngrok.io/api/coinbase/webhook
```

---

## 💰 PRICING

### **Coinbase Commerce Fees**
```
Transaction Fee: 1%
No monthly fees
No setup fees
Instant settlement to your wallet
```

---

## 🔒 SECURITY

### **Best Practices**
- ✅ Always verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Store API keys in environment variables
- ✅ Validate all incoming data
- ✅ Log all transactions
- ✅ Implement rate limiting

---

## 📊 INTEGRATION WITH UNIFIED PAYMENT SERVICE

### **Update UnifiedPaymentService.js**

```javascript
// Add Coinbase to unified service
const coinbaseService = require('./CoinbaseService');

class UnifiedPaymentService {
  // ... existing code ...

  async createCryptoPayment(params) {
    return await coinbaseService.createCharge(params);
  }

  async getCryptoPaymentStatus(chargeId) {
    return await coinbaseService.getCharge(chargeId);
  }
}
```

---

## ✅ CHECKLIST

- [ ] Install `coinbase-commerce-node`
- [ ] Add API key to `.env`
- [ ] Create `CoinbaseService.js`
- [ ] Create `coinbase-routes.js`
- [ ] Update `server.js`
- [ ] Create frontend component
- [ ] Setup webhook in Coinbase dashboard
- [ ] Test charge creation
- [ ] Test webhook handling
- [ ] Deploy to production

---

## 🚀 READY TO USE

**Your Coinbase integration is ready!**

**API Key**: `c100898f-e713-402b-b9d3-66421db017e5`

**Next steps:**
1. Install the package
2. Add the service and routes
3. Test locally
4. Deploy to production

---

**Built by**: Mohamed Hossameldin Abdelaziz  
**Date**: October 22, 2025  
**Status**: Ready to implement
