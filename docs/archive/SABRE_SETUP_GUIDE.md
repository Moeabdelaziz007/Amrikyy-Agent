# 🔐 Sabre API Setup Guide

## Step 1: Create Sabre Developer Account

1. Go to: https://developer.sabre.com
2. Click "Sign Up" (top right)
3. Fill in your information:
   - Company: Amrikyy Travel
   - Role: Developer
   - Use Case: Travel Booking Platform
4. Verify your email

## Step 2: Create Application

1. Login to Sabre Dev Studio
2. Go to "My Apps" → "Create New App"
3. Fill in:
   - App Name: "Amrikyy Travel Agent"
   - Description: "AI-powered travel booking platform"
   - APIs needed:
     - ✅ Bargain Finder Max (flight search)
     - ✅ Hotel Availability
     - ✅ Passenger Name Record (PNR)
     - ✅ Create Booking
4. Click "Create"

## Step 3: Get Credentials

After creating the app, you'll see:

- **Client ID**: `V1:xxxxx:DEVCENTER:EXT`
- **Client Secret**: Long string of characters
- **Shared Secret**: Another long string

Copy these values!

## Step 4: Request PCC (Pseudo City Code)

The PCC is required for booking. Two options:

### Option A: Test PCC (for development)

Sabre provides test PCCs:

- **Test PCC**: `F9CE` (use this for testing)

### Option B: Production PCC (for live bookings)

Contact Sabre:

1. Email: developer@sabre.com
2. Subject: "PCC Request for Amrikyy Travel"
3. Include:
   - Your application ID
   - Company details
   - Business registration documents
   - Expected booking volume

Processing time: 5-10 business days

## Step 5: Add to Environment Variables

Add these to your `backend/.env` file:

```env
# Sabre API Credentials
SABRE_CLIENT_ID=V1:xxxxx:DEVCENTER:EXT
SABRE_CLIENT_SECRET=your_secret_here
SABRE_PCC=F9CE
SABRE_BASE_URL=https://api.havail.sabre.com
SABRE_REST_URL=https://api.sabre.com

# Company Info (for bookings)
COMPANY_ADDRESS=Amrikyy Travel Agency
COMPANY_CITY=Cairo
COMPANY_COUNTRY=EG
COMPANY_POSTAL=11511
COMPANY_STATE=C
```

## Step 6: Test Authentication

Run this test:

```bash
curl -X POST "https://api.sabre.com/v2/auth/token" \
  -H "Authorization: Basic $(echo -n 'YOUR_CLIENT_ID:YOUR_CLIENT_SECRET' | base64)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials"
```

Expected response:

```json
{
  "access_token": "T1RLAQKvj...",
  "token_type": "Bearer",
  "expires_in": 604800
}
```

## Step 7: Test Flight Search

```bash
curl -X POST "https://api.sabre.com/v5/offers/shop" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "OTA_AirLowFareSearchRQ": {
      "OriginDestinationInformation": [{
        "DepartureDateTime": "2025-12-15T00:00:00",
        "OriginLocation": { "LocationCode": "JFK" },
        "DestinationLocation": { "LocationCode": "CAI" }
      }],
      "TravelPreferences": {
        "CabinPref": [{ "Cabin": "Y" }]
      },
      "TravelerInfoSummary": {
        "AirTravelerAvail": [{
          "PassengerTypeQuantity": [{ "Code": "ADT", "Quantity": 1 }]
        }]
      }
    }
  }'
```

## Step 8: Verify in Amrikyy

Once credentials are added, test via Amrikyy:

```bash
# Health check
curl http://localhost:5001/api/sabre/health

# Should return:
{
  "status": "healthy",
  "message": "Sabre API is operational",
  "configured": true,
  "authenticated": true
}
```

## Troubleshooting

### Error: "Invalid credentials"

- Double-check Client ID and Secret
- Ensure no extra spaces
- Base64 encoding might be incorrect

### Error: "PCC not authorized"

- Using production PCC in test mode?
- Use `F9CE` for testing
- Contact Sabre for production PCC

### Error: "Rate limit exceeded"

- Free tier: 1000 calls/month
- Production: 50K+ calls/month
- Upgrade plan if needed

## Pricing

### Sandbox (Free)

- 1,000 API calls/month
- All APIs available
- Test data only
- Perfect for development

### Production Plans

- **Starter**: $99/month - 10K calls
- **Professional**: $299/month - 50K calls
- **Enterprise**: Custom pricing - Unlimited

## Important Notes

1. **Test vs Production**

   - Sandbox: Different base URL + test PCC
   - Production: Real bookings, real money

2. **Booking Liability**

   - Test bookings don't cost money
   - Production bookings are real transactions
   - You're responsible for customer payments

3. **Compliance**

   - IATA/ARC certification may be required
   - Travel agency license needed in some countries
   - Check local regulations

4. **Best Practices**
   - Cache responses (we do with Redis)
   - Handle errors gracefully
   - Log all transactions
   - Test thoroughly before production

## Resources

- **API Documentation**: https://developer.sabre.com/docs
- **Code Samples**: https://github.com/SabreDevStudio
- **Support Forum**: https://developer.sabre.com/forum
- **Contact**: developer@sabre.com

## Next Steps

Once Sabre is configured:

1. ✅ Test flight search
2. ✅ Test hotel search
3. ✅ Test booking creation
4. ✅ Integrate with Stripe for payments
5. ✅ Deploy to production

---

**Questions?** Contact Sabre Developer Support or email: support@amrikyy.com
