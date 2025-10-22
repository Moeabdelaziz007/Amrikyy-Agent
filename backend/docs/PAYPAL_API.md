# PayPal Payment API Documentation

## Overview
PayPal integration for Amrikyy Travel Agent booking payments.

**Base URL**: `http://localhost:5000/api/paypal`

---

## Authentication
All endpoints (except webhook and health) require JWT authentication.

**Header**: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Create PayPal Order

Create a PayPal order for a booking.

**Endpoint**: `POST /api/paypal/create-order`

**Request Body**:
```json
{
  "bookingId": "uuid-of-booking"
}
```

**Response** (Success):
```json
{
  "success": true,
  "orderId": "8XY12345AB678901C",
  "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=8XY12345AB678901C",
  "links": [
    {
      "href": "https://api.sandbox.paypal.com/v2/checkout/orders/8XY12345AB678901C",
      "rel": "self",
      "method": "GET"
    },
    {
      "href": "https://www.sandbox.paypal.com/checkoutnow?token=8XY12345AB678901C",
      "rel": "approve",
      "method": "GET"
    },
    {
      "href": "https://api.sandbox.paypal.com/v2/checkout/orders/8XY12345AB678901C/capture",
      "rel": "capture",
      "method": "POST"
    }
  ]
}
```

**Usage Flow**:
1. Create order on backend
2. Redirect user to `approvalUrl`
3. User completes payment on PayPal
4. PayPal redirects back to your app
5. Call capture endpoint to complete payment

---

### 2. Capture PayPal Order

Complete the payment after user approves on PayPal.

**Endpoint**: `POST /api/paypal/capture-order`

**Request Body**:
```json
{
  "orderId": "8XY12345AB678901C",
  "bookingId": "uuid-of-booking"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Payment completed successfully",
  "captureId": "9AB12345CD678901E",
  "status": "COMPLETED"
}
```

---

### 3. Get Order Details

Retrieve PayPal order information.

**Endpoint**: `GET /api/paypal/order/:orderId`

**Response** (Success):
```json
{
  "success": true,
  "order": {
    "id": "8XY12345AB678901C",
    "status": "COMPLETED",
    "purchase_units": [...],
    "payer": {...}
  }
}
```

---

### 4. Refund Payment

Refund a completed PayPal payment.

**Endpoint**: `POST /api/paypal/refund`

**Request Body**:
```json
{
  "bookingId": "uuid-of-booking"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "refundId": "1BC23456DE789012F",
  "status": "COMPLETED"
}
```

---

### 5. PayPal Webhook

Receive PayPal event notifications (IPN).

**Endpoint**: `POST /api/paypal/webhook`

**Events Handled**:
- `PAYMENT.CAPTURE.COMPLETED` - Payment captured successfully
- `PAYMENT.CAPTURE.DENIED` - Payment was denied
- `PAYMENT.CAPTURE.REFUNDED` - Payment was refunded

**Note**: This endpoint is called by PayPal, not your frontend.

---

### 6. Health Check

Check PayPal service status.

**Endpoint**: `GET /api/paypal/health`

**Response** (Enabled):
```json
{
  "status": "healthy",
  "mode": "sandbox",
  "enabled": true
}
```

**Response** (Disabled):
```json
{
  "status": "disabled",
  "message": "PayPal is not configured"
}
```

---

## Frontend Integration Example

### React/TypeScript Example

```typescript
// 1. Create PayPal order
const createPayPalOrder = async (bookingId: string) => {
  const response = await fetch('/api/paypal/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ bookingId })
  });

  const data = await response.json();
  
  if (data.success) {
    // Redirect user to PayPal
    window.location.href = data.approvalUrl;
  }
};

// 2. Capture payment (after user returns from PayPal)
const capturePayPalOrder = async (orderId: string, bookingId: string) => {
  const response = await fetch('/api/paypal/capture-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ orderId, bookingId })
  });

  const data = await response.json();
  
  if (data.success) {
    // Payment completed!
    console.log('Payment successful:', data.captureId);
  }
};
```

---

## PayPal Button Integration

### Using PayPal JavaScript SDK

```html
<!-- Add PayPal SDK -->
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD"></script>

<div id="paypal-button-container"></div>

<script>
  paypal.Buttons({
    createOrder: async () => {
      // Call your backend to create order
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId: 'your-booking-id' })
      });
      
      const data = await response.json();
      return data.orderId;
    },
    
    onApprove: async (data) => {
      // Call your backend to capture payment
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: data.orderID,
          bookingId: 'your-booking-id'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Payment successful!');
      }
    },
    
    onError: (err) => {
      console.error('PayPal error:', err);
      alert('Payment failed. Please try again.');
    }
  }).render('#paypal-button-container');
</script>
```

---

## Environment Variables

Add these to your `.env` file:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID="your-client-id"
PAYPAL_CLIENT_SECRET="your-client-secret"
PAYPAL_MODE="sandbox"  # or "live" for production
PAYPAL_WEBHOOK_ID="your-webhook-id"  # Optional, for webhook verification
```

---

## Testing

### Sandbox Test Accounts

Use PayPal sandbox accounts for testing:

**Buyer Account**:
- Email: `sb-buyer@personal.example.com`
- Password: `test1234`

**Seller Account**:
- Email: `sb-seller@business.example.com`
- Password: `test1234`

### Test Credit Cards

PayPal sandbox accepts these test cards:

- **Visa**: 4032039668610542
- **Mastercard**: 5425233430109903
- **Amex**: 374245455400126

**CVV**: Any 3 digits  
**Expiry**: Any future date

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common Errors**:
- `400` - Bad request (missing parameters)
- `401` - Unauthorized (invalid/missing token)
- `404` - Booking not found
- `500` - Server error

---

## Webhook Setup

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Navigate to **Apps & Credentials**
3. Select your app
4. Scroll to **Webhooks**
5. Click **Add Webhook**
6. Enter webhook URL: `https://your-domain.com/api/paypal/webhook`
7. Select events to receive
8. Copy the **Webhook ID** and add to `.env`

---

## Security Notes

1. **Never expose** `PAYPAL_CLIENT_SECRET` in frontend code
2. Always verify webhook signatures in production
3. Use HTTPS in production
4. Validate all payment amounts on backend
5. Log all payment transactions for audit trail

---

## Support

For PayPal API issues:
- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [PayPal Support](https://www.paypal.com/us/smarthelp/contact-us)

For Amrikyy integration issues:
- Check backend logs
- Test with `/api/paypal/health` endpoint
- Verify environment variables are set correctly

---

**Last Updated**: October 22, 2025  
**Version**: 1.0.0
