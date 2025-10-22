# 💳 Complete Payment Integration Guide

**Amrikyy SAAAAS - All Payment Methods Setup**  
**Date**: October 22, 2025

---

## 🎯 OVERVIEW

We support **4 payment methods**:
1. **Stripe** - Cards, Apple Pay, Google Pay (Primary)
2. **PayPal** - PayPal accounts
3. **Crypto** - Bitcoin, Ethereum, USDT (via Coinbase Commerce)
4. **Telegram** - In-app Telegram payments

---

## 💰 SAAAAS PRICING PLANS

```javascript
Starter: $49/month
├─ 3 AI agents
├─ 1,000 automations/month
├─ Basic integrations
└─ Community support

Professional: $199/month ⭐ MOST POPULAR
├─ 12 AI agents
├─ 10,000 automations/month
├─ All integrations
├─ Priority support
└─ Custom workflows

Enterprise: $999/month
├─ Unlimited agents
├─ Unlimited automations
├─ White-label option
├─ Dedicated support
├─ Custom development
└─ API access

Agency: $2,999/month
├─ Everything in Enterprise
├─ Multi-tenant support
├─ Reseller license
├─ Revenue sharing
├─ Co-branding
└─ Training & onboarding
```

---

## 🔧 SETUP INSTRUCTIONS

### **1. STRIPE SETUP** (Primary - REQUIRED)

#### **Step 1: Create Stripe Account**
1. Go to [stripe.com](https://stripe.com)
2. Sign up for account
3. Complete business verification

#### **Step 2: Get API Keys**
1. Go to [Dashboard → Developers → API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copy **Secret key** (starts with `sk_test_` or `sk_live_`)
3. Copy **Publishable key** (starts with `pk_test_` or `pk_live_`)

#### **Step 3: Setup Webhook**
1. Go to [Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://your-backend.com/api/payments/stripe/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy **Signing secret** (starts with `whsec_`)

#### **Step 4: Create Products (Optional)**
1. Go to [Dashboard → Products](https://dashboard.stripe.com/test/products)
2. Create products for each plan:
   - Amrikyy SAAAAS - Starter ($49/month)
   - Amrikyy SAAAAS - Professional ($199/month)
   - Amrikyy SAAAAS - Enterprise ($999/month)
   - Amrikyy SAAAAS - Agency ($2,999/month)
3. Copy each **Price ID** (starts with `price_`)

#### **Step 5: Add to .env**
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Product Price IDs
STRIPE_STARTER_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PROFESSIONAL_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_AGENCY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx
```

---

### **2. PAYPAL SETUP** (Optional)

#### **Step 1: Create PayPal Business Account**
1. Go to [paypal.com/business](https://www.paypal.com/business)
2. Sign up for Business account
3. Complete verification

#### **Step 2: Create App**
1. Go to [Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Click "Apps & Credentials"
3. Click "Create App"
4. App Name: "Amrikyy SAAAAS"
5. App Type: "Merchant"

#### **Step 3: Get Credentials**
1. Copy **Client ID**
2. Show and copy **Secret**
3. Note the API URL:
   - Sandbox: `https://api-m.sandbox.paypal.com`
   - Live: `https://api-m.paypal.com`

#### **Step 4: Setup Webhooks**
1. In app settings, go to "Webhooks"
2. Add webhook URL: `https://your-backend.com/api/payments/paypal/webhook`
3. Select events:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`

#### **Step 5: Add to .env**
```bash
# PayPal
PAYPAL_CLIENT_ID=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_CLIENT_SECRET=ELxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
# For production: https://api-m.paypal.com
```

---

### **3. CRYPTO SETUP** (Optional - Coinbase Commerce)

#### **Step 1: Create Coinbase Commerce Account**
1. Go to [commerce.coinbase.com](https://commerce.coinbase.com)
2. Sign up with Coinbase account
3. Complete business verification

#### **Step 2: Get API Key**
1. Go to Settings → API Keys
2. Click "Create an API key"
3. Name: "Amrikyy SAAAAS"
4. Copy **API Key**

#### **Step 3: Setup Webhook**
1. Go to Settings → Webhook subscriptions
2. Add endpoint: `https://your-backend.com/api/payments/crypto/webhook`
3. Copy **Webhook secret**

#### **Step 4: Supported Cryptocurrencies**
- Bitcoin (BTC)
- Ethereum (ETH)
- USD Coin (USDC)
- Tether (USDT)
- Litecoin (LTC)
- Bitcoin Cash (BCH)
- Dogecoin (DOGE)

#### **Step 5: Add to .env**
```bash
# Coinbase Commerce
COINBASE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
COINBASE_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### **4. TELEGRAM PAYMENTS SETUP** (Optional)

#### **Step 1: Get Payment Provider Token**
1. Contact [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/mybots`
3. Select your bot
4. Click "Payments"
5. Choose payment provider:
   - Stripe
   - YooMoney
   - Sberbank
   - etc.
6. Follow provider setup
7. Copy **Payment Token**

#### **Step 2: Add to .env**
```bash
# Telegram Payments
TELEGRAM_PAYMENT_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📝 IMPLEMENTATION

### **Backend Routes Created**

```javascript
// File: backend/routes/payments-unified.js

POST   /api/payments/create
POST   /api/payments/subscription/create
POST   /api/payments/subscription/cancel
GET    /api/payments/plans
GET    /api/payments/providers
GET    /api/payments/status/:paymentId

// Webhooks
POST   /api/payments/stripe/webhook
POST   /api/payments/paypal/webhook
POST   /api/payments/crypto/webhook
POST   /api/payments/telegram/webhook
```

### **Usage Examples**

#### **1. Create One-Time Payment**
```javascript
// Stripe
POST /api/payments/create
{
  "provider": "stripe",
  "amount": 199,
  "currency": "usd",
  "description": "Amrikyy SAAAAS - Professional Plan",
  "customerEmail": "user@example.com"
}

// PayPal
POST /api/payments/create
{
  "provider": "paypal",
  "amount": 199,
  "currency": "USD",
  "description": "Amrikyy SAAAAS - Professional Plan",
  "returnUrl": "https://app.amrikyy.com/payment/success",
  "cancelUrl": "https://app.amrikyy.com/payment/cancel"
}

// Crypto
POST /api/payments/create
{
  "provider": "crypto",
  "amount": 199,
  "currency": "USD",
  "description": "Amrikyy SAAAAS - Professional Plan"
}
```

#### **2. Create Subscription**
```javascript
POST /api/payments/subscription/create
{
  "provider": "stripe",
  "planId": "professional",
  "customerEmail": "user@example.com",
  "metadata": {
    "userId": "user_123",
    "source": "web"
  }
}

Response:
{
  "success": true,
  "provider": "stripe",
  "data": {
    "subscriptionId": "sub_xxxxxxxxxxxxx",
    "customerId": "cus_xxxxxxxxxxxxx",
    "clientSecret": "pi_xxxxxxxxxxxxx_secret_xxxxxxxxxxxxx",
    "status": "incomplete",
    "plan": {
      "id": "professional",
      "name": "Professional",
      "price": 199,
      "currency": "usd",
      "interval": "month"
    }
  }
}
```

#### **3. Cancel Subscription**
```javascript
POST /api/payments/subscription/cancel
{
  "provider": "stripe",
  "subscriptionId": "sub_xxxxxxxxxxxxx"
}
```

#### **4. Get Available Plans**
```javascript
GET /api/payments/plans

Response:
{
  "success": true,
  "plans": {
    "starter": {
      "id": "starter",
      "name": "Starter",
      "price": 49,
      "currency": "usd",
      "interval": "month",
      "features": [...]
    },
    "professional": {...},
    "enterprise": {...},
    "agency": {...}
  }
}
```

---

## 🎨 FRONTEND INTEGRATION

### **React Payment Component**

```typescript
// frontend/src/components/PaymentModal.tsx
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY);

export function PaymentModal({ planId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('stripe');

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/payments/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          planId,
          customerEmail: user.email
        })
      });
      
      const data = await response.json();
      
      if (provider === 'stripe') {
        // Redirect to Stripe Checkout
        const stripe = await stripePromise;
        await stripe.confirmPayment({
          clientSecret: data.data.clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/payment/success`
          }
        });
      } else if (provider === 'paypal') {
        // Redirect to PayPal
        window.location.href = data.data.approveUrl;
      } else if (provider === 'crypto') {
        // Redirect to Coinbase Commerce
        window.location.href = data.data.hostedUrl;
      }
      
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-modal">
      <h2>Subscribe to {planId}</h2>
      
      {/* Payment Method Selection */}
      <div className="payment-methods">
        <button onClick={() => setProvider('stripe')}>
          💳 Credit Card
        </button>
        <button onClick={() => setProvider('paypal')}>
          🅿️ PayPal
        </button>
        <button onClick={() => setProvider('crypto')}>
          ₿ Crypto
        </button>
      </div>
      
      {/* Payment Button */}
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Subscribe Now'}
      </button>
    </div>
  );
}
```

---

## 🔐 SECURITY BEST PRACTICES

### **1. API Keys**
- ✅ Never commit API keys to git
- ✅ Use environment variables
- ✅ Rotate keys regularly
- ✅ Use test keys in development
- ✅ Use live keys only in production

### **2. Webhooks**
- ✅ Verify webhook signatures
- ✅ Use HTTPS only
- ✅ Implement idempotency
- ✅ Log all webhook events
- ✅ Handle retries properly

### **3. Payment Data**
- ✅ Never store card numbers
- ✅ Use Stripe/PayPal tokenization
- ✅ PCI DSS compliance
- ✅ Encrypt sensitive data
- ✅ GDPR compliance

---

## 📊 TESTING

### **Test Cards (Stripe)**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### **Test PayPal**
```
Email: sb-buyer@personal.example.com
Password: test1234
```

### **Test Crypto**
Use Coinbase Commerce sandbox mode

---

## 💰 COST ANALYSIS

### **Transaction Fees**

**Stripe:**
- 2.9% + $0.30 per transaction
- No monthly fees
- No setup fees

**PayPal:**
- 2.9% + $0.30 per transaction
- No monthly fees
- No setup fees

**Coinbase Commerce:**
- 1% per transaction
- No monthly fees
- No setup fees

**Telegram Payments:**
- Depends on provider (usually 2-5%)

### **Monthly Revenue Projections**

```
100 users × $199 = $19,900/month
Fees (3%): -$597
Net: $19,303/month

1,000 users × $199 = $199,000/month
Fees (3%): -$5,970
Net: $193,030/month

10,000 users × $199 = $1,990,000/month
Fees (3%): -$59,700
Net: $1,930,300/month
```

---

## 🚀 DEPLOYMENT CHECKLIST

### **Before Going Live:**
- [ ] Switch to live API keys
- [ ] Test all payment flows
- [ ] Setup webhook endpoints
- [ ] Verify webhook signatures
- [ ] Test subscription creation
- [ ] Test subscription cancellation
- [ ] Test refunds
- [ ] Setup monitoring
- [ ] Configure email notifications
- [ ] Update terms of service
- [ ] Update privacy policy
- [ ] Enable fraud detection
- [ ] Setup customer support

---

## 📞 SUPPORT

### **Stripe Support:**
- Docs: [stripe.com/docs](https://stripe.com/docs)
- Support: [support.stripe.com](https://support.stripe.com)

### **PayPal Support:**
- Docs: [developer.paypal.com](https://developer.paypal.com)
- Support: [paypal.com/support](https://www.paypal.com/support)

### **Coinbase Commerce:**
- Docs: [commerce.coinbase.com/docs](https://commerce.coinbase.com/docs)
- Support: [help.coinbase.com](https://help.coinbase.com)

---

**✅ Payment system ready! Start accepting payments for your SAAAAS platform!** 💰

**Next**: Test with sandbox/test keys, then switch to production! 🚀
