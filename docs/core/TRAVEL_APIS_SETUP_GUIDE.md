# 🚀 Travel APIs Setup Guide

Complete guide for setting up external travel APIs for Amrikyy Travel Agent.

## 📋 Table of Contents

1. [Kiwi Tequila API (Flights)](#kiwi-tequila-api)
2. [Booking.com Affiliate API (Hotels)](#bookingcom-affiliate-api)
3. [Mapbox API (Maps & Geocoding)](#mapbox-api)
4. [Environment Configuration](#environment-configuration)
5. [Testing APIs](#testing-apis)
6. [Rate Limits & Best Practices](#rate-limits--best-practices)

---

## 🛫 Kiwi Tequila API

### What It Does
- Flight search across 800+ airlines
- Real-time pricing and availability
- Booking capabilities (sandbox mode)
- Multi-city and flexible date searches

### Setup Steps

1. **Create Account**
   - Visit: [https://tequila.kiwi.com/portal/login](https://tequila.kiwi.com/portal/login)
   - Sign up for a developer account
   - Verify your email

2. **Get API Key**
   - Navigate to "API Keys" section
   - Create a new API key
   - Copy the key (you won't see it again!)

3. **Add to Environment**
   ```bash
   KIWI_API_KEY=your_api_key_here
   ```

4. **Test Connection**
   ```bash
   curl -X GET "https://api.tequila.kiwi.com/locations/query?term=London&locale=en-US" \
     -H "apikey: YOUR_API_KEY"
   ```

### Rate Limits
- **Free Tier**: 100 requests/month
- **Paid Tier**: Custom limits
- **Recommended**: Start with free tier for testing

### API Endpoints Used
- `/v2/search` - Flight search
- `/locations/query` - Airport/city search
- `/v2/booking/check_flights` - Flight details
- `/v2/booking/save_booking` - Create booking (sandbox)

---

## 🏨 Booking.com Affiliate API

### What It Does
- Hotel search worldwide
- Real-time availability and pricing
- Room details and photos
- Affiliate commission on bookings

### Setup Steps

1. **Join Affiliate Program**
   - Visit: [https://www.booking.com/affiliate-program/v2/index.html](https://www.booking.com/affiliate-program/v2/index.html)
   - Apply for affiliate partnership
   - Wait for approval (usually 1-3 days)

2. **Get Credentials**
   - Log in to Partner Hub
   - Navigate to "API Access"
   - Get your Affiliate ID
   - Request API key if needed

3. **Add to Environment**
   ```bash
   BOOKING_COM_AFFILIATE_ID=your_affiliate_id_here
   BOOKING_COM_API_KEY=your_api_key_here
   ```

4. **Test Connection**
   ```bash
   curl -X GET "https://distribution-xml.booking.com/2.7/json/cities?name=London&affiliate_id=YOUR_AFFILIATE_ID"
   ```

### Rate Limits
- **Standard**: 100 requests/minute
- **Premium**: Custom limits
- **Caching**: Recommended for 24 hours

### API Endpoints Used
- `/hotels` - Hotel search
- `/cities` - City search
- `/blockavailability` - Room availability
- Direct booking URLs with affiliate tracking

---

## 🗺️ Mapbox API

### What It Does
- Geocoding (address → coordinates)
- Reverse geocoding (coordinates → address)
- Place search (POIs, landmarks)
- Directions and routing
- Static map images

### Setup Steps

1. **Create Account**
   - Visit: [https://account.mapbox.com/auth/signup/](https://account.mapbox.com/auth/signup/)
   - Sign up (free tier available)
   - Verify email

2. **Get Access Token**
   - Go to "Access Tokens" page
   - Copy your default public token
   - Or create a new token with specific scopes

3. **Add to Environment**
   ```bash
   MAPBOX_ACCESS_TOKEN=pk.your_access_token_here
   ```

4. **Test Connection**
   ```bash
   curl "https://api.mapbox.com/geocoding/v5/mapbox.places/London.json?access_token=YOUR_TOKEN"
   ```

### Rate Limits
- **Free Tier**: 
  - 100,000 requests/month for geocoding
  - 50,000 requests/month for directions
- **Pay-as-you-go**: $0.50 per 1,000 requests

### API Endpoints Used
- `/geocoding/v5/mapbox.places` - Geocoding & search
- `/directions/v5/mapbox` - Routing
- `/styles/v1/mapbox` - Static maps

---

## ⚙️ Environment Configuration

### Complete .env File

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (Supabase)
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# External APIs - Travel Services
# Kiwi Tequila (Flights)
KIWI_API_KEY=your_kiwi_api_key_here

# Booking.com (Hotels)
BOOKING_COM_AFFILIATE_ID=your_booking_affiliate_id_here
BOOKING_COM_API_KEY=your_booking_api_key_here

# Mapbox (Maps & Geocoding)
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here

# AI Configuration
KELO_API_KEY=your_kelo_api_key_here
KELO_API_BASE_URL=https://api.kelo.ai/v4
KELO_MODEL=glm-4.6

# Payment Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# CORS Configuration
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### Configuration Validation

Run this command to check if all APIs are configured:

```bash
node backend/scripts/validate-apis.js
```

---

## 🧪 Testing APIs

### Test Flight Search

```bash
curl -X POST http://localhost:5000/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "from": "NYC",
    "to": "LON",
    "departureDate": "01/12/2025",
    "adults": 1
  }'
```

### Test Hotel Search

```bash
curl -X POST http://localhost:5000/api/hotels/search \
  -H "Content-Type: application/json" \
  -d '{
    "cityId": "-2601889",
    "checkin": "2025-12-01",
    "checkout": "2025-12-05",
    "adults": 2
  }'
```

### Test MCP Tools

```bash
curl -X POST http://localhost:5000/api/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "search_flights",
    "params": {
      "from": "NYC",
      "to": "PAR",
      "departureDate": "01/12/2025"
    }
  }'
```

### Test Agent Coordination

```bash
curl -X POST http://localhost:5000/api/travel-agents/request \
  -H "Content-Type: application/json" \
  -d '{
    "type": "plan_trip",
    "destination": "Paris",
    "origin": "New York",
    "departureDate": "01/12/2025",
    "returnDate": "08/12/2025",
    "budget": 3000,
    "travelers": 2
  }'
```

---

## 📊 Rate Limits & Best Practices

### Rate Limiting Strategy

| API | Free Tier | Recommended Cache | Priority |
|-----|-----------|-------------------|----------|
| Kiwi Tequila | 100/month | 1 hour | High |
| Booking.com | 100/min | 24 hours | Medium |
| Mapbox | 100k/month | 7 days | Low |

### Best Practices

1. **Caching**
   ```javascript
   // Cache flight searches for 1 hour
   // Cache hotel searches for 24 hours
   // Cache geocoding for 7 days
   ```

2. **Error Handling**
   ```javascript
   // Always handle rate limit errors (429)
   // Implement exponential backoff
   // Provide fallback responses
   ```

3. **Monitoring**
   ```javascript
   // Track API usage
   // Set up alerts for rate limit warnings
   // Monitor response times
   ```

4. **Cost Optimization**
   - Use batch requests when possible
   - Implement aggressive caching
   - Consider upgrading to paid tiers for production

---

## 🔒 Security Considerations

### API Key Protection

1. **Never commit API keys to Git**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use environment variables**
   ```javascript
   // ✅ Good
   const apiKey = process.env.KIWI_API_KEY;
   
   // ❌ Bad
   const apiKey = 'hardcoded_key_here';
   ```

3. **Rotate keys regularly**
   - Change API keys every 90 days
   - Immediately rotate if compromised

4. **Use ephemeral tokens for MCP**
   ```javascript
   // Generate short-lived tokens for agent operations
   const token = generateEphemeralToken({
     scope: ['flights:read'],
     expiresIn: '15m'
   });
   ```

---

## 📚 Additional Resources

### Documentation Links
- [Kiwi Tequila API Docs](https://tequila.kiwi.com/portal/docs/tequila_api)
- [Booking.com Partner Hub](https://partners.booking.com/)
- [Mapbox API Documentation](https://docs.mapbox.com/api/)

### Support
- Kiwi Support: support@tequila.kiwi.com
- Booking.com: Via Partner Hub
- Mapbox: support@mapbox.com

---

## ✅ Checklist

Before going to production:

- [ ] All API keys configured
- [ ] Rate limiting implemented
- [ ] Caching strategy in place
- [ ] Error handling tested
- [ ] Monitoring set up
- [ ] Security audit completed
- [ ] Backup API providers identified
- [ ] Cost estimates calculated

---

**Last Updated:** October 16, 2025  
**Version:** 1.0.0
