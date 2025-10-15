# 🌍 Travel APIs Setup Guide - دليل إعداد APIs السفر

Complete guide for integrating travel booking APIs into Amrikyy Travel Agent

---

## 🎯 Available Travel APIs

### 1. **Sabre GDS API** ⭐⭐⭐⭐⭐
**Best for:** Full-featured travel booking system

**What it offers:**
- ✈️ Flight bookings (1000+ airlines)
- 🏨 Hotel reservations (150,000+ properties)
- 🚗 Car rentals
- 🎫 Tours & activities
- 💰 Real-time pricing

**Getting Started:**
1. Register at: https://developer.sabre.com/
2. Get credentials: Client ID + Client Secret
3. Choose API type: REST (modern) or SOAP (more features)

**Access Levels:**
- 🆓 **Free Tier:** Sandbox testing environment
- 💰 **Commercial:** Production access (requires agreement)

**Documentation:** https://developer.sabre.com/docs/

---

### 2. **Amadeus for Developers** ⭐⭐⭐⭐⭐
**Best for:** Easy integration with generous free tier

**What it offers:**
- ✈️ Flight search & booking
- 🏨 Hotel booking
- 🎫 Activities & experiences
- 🛂 Airport & city information
- 💹 Travel analytics

**Getting Started:**
1. Sign up at: https://developers.amadeus.com/
2. Get API Key instantly
3. Start with Self-Service APIs (free)

**Access Levels:**
- 🆓 **Free Tier:** 
  - 2,000 API calls/month
  - Test environment
  - Perfect for development
- 💰 **Production:** 
  - Pay-as-you-go
  - Starting from $0.01 per API call

**Documentation:** https://developers.amadeus.com/self-service/apis

---

### 3. **Travelport Universal API** ⭐⭐⭐⭐
**Best for:** Enterprise-level integrations

**What it offers:**
- ✈️ Multi-GDS flight content
- 🏨 Hotel bookings
- 🚗 Car rentals
- 🚂 Rail bookings

**Getting Started:**
1. Register at: https://developer.travelport.com/
2. Request sandbox credentials
3. Trial period available

**Access Levels:**
- 🧪 **Trial:** Sandbox environment
- 💰 **Commercial:** Production access

**Documentation:** https://developer.travelport.com/universal-api

---

### 4. **Skyscanner API** ⭐⭐⭐⭐
**Best for:** Flight price comparison

**What it offers:**
- ✈️ Flight search (all major airlines)
- 🏨 Hotel search
- 🚗 Car rental search
- 💰 Price comparison

**Getting Started:**
1. Apply at: https://partners.skyscanner.net/
2. Get API key (approval required)
3. RapidAPI access available

**Access Levels:**
- 🆓 **RapidAPI Free:** 
  - 100 calls/month
  - Basic endpoints
- 💰 **Partner Program:**
  - Commission-based
  - Full access

**Documentation:** https://skyscanner.github.io/slate/

---

### 5. **Kiwi.com Tequila API** ⭐⭐⭐⭐
**Best for:** Budget flights & complex routing

**What it offers:**
- ✈️ Flight search (budget airlines included)
- 🗺️ Multi-city routing
- 💰 Price prediction
- 🎫 Booking management

**Getting Started:**
1. Sign up at: https://tequila.kiwi.com/
2. Request API access
3. Free tier available

**Access Levels:**
- 🆓 **Free:** Limited calls for development
- 💰 **Commercial:** Based on usage

**Documentation:** https://tequila.kiwi.com/docs/

---

### 6. **OpenSky API** 🆓 ⭐⭐⭐
**Best for:** FREE Flight tracking

**What it offers:**
- ✈️ Real-time flight tracking
- 🛫 Airport information
- 📊 Flight statistics
- 100% FREE!

**Getting Started:**
1. No registration needed for basic use
2. Optional free account for more data
3. Direct access: https://opensky-network.org/

**Access Levels:**
- 🆓 **Always Free:** 
  - 400 API calls/day (anonymous)
  - 4,000 API calls/day (registered)

**Documentation:** https://opensky-network.org/apidoc/

---

### 7. **Booking.com API** ⭐⭐⭐⭐
**Best for:** Hotel bookings

**What it offers:**
- 🏨 28+ million listings
- 💰 Best price guarantee
- ⭐ Reviews & ratings
- 📍 Global coverage

**Getting Started:**
1. Join affiliate program: https://www.booking.com/affiliate
2. Apply for API access
3. Approval required

**Access Levels:**
- 💰 **Affiliate Program:** Commission-based (25-40%)

**Documentation:** https://developers.booking.com/

---

## 🚀 Quick Start: Sabre API Integration

### Step 1: Registration
```bash
# Visit and register
https://developer.sabre.com/
```

### Step 2: Get Credentials
After registration, you'll receive:
- **Client ID:** `V1:abc123:DEVCENTER:EXT`
- **Client Secret:** `xyz789`
- **IPCC (Pseudo City Code):** `IPCC123`

### Step 3: Authentication (OAuth 2.0)
```javascript
const axios = require('axios');

async function getSabreToken() {
  const credentials = Buffer.from(
    `${process.env.SABRE_CLIENT_ID}:${process.env.SABRE_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axios.post(
    'https://api.sabre.com/v2/auth/token',
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
}
```

### Step 4: Example Flight Search
```javascript
async function searchFlights(origin, destination, date) {
  const token = await getSabreToken();

  const response = await axios.get(
    'https://api.sabre.com/v2/shop/flights',
    {
      params: {
        origin,
        destination,
        departuredate: date,
        returndate: date
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
}

// Usage
searchFlights('JFK', 'LAX', '2025-12-01');
```

---

## 🚀 Quick Start: Amadeus API Integration

### Step 1: Registration
```bash
# Visit and sign up
https://developers.amadeus.com/register
```

### Step 2: Get API Keys
Instantly receive:
- **API Key:** `abc123xyz789`
- **API Secret:** `secret456`

### Step 3: Authentication
```javascript
const axios = require('axios');

async function getAmadeusToken() {
  const response = await axios.post(
    'https://test.api.amadeus.com/v1/security/oauth2/token',
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_API_KEY,
      client_secret: process.env.AMADEUS_API_SECRET
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
}
```

### Step 4: Example Flight Search
```javascript
async function searchAmadeusFlights(origin, destination, date) {
  const token = await getAmadeusToken();

  const response = await axios.get(
    'https://test.api.amadeus.com/v2/shopping/flight-offers',
    {
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: date,
        adults: 1
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
}

// Usage
searchAmadeusFlights('NYC', 'LAX', '2025-12-01');
```

---

## 📊 Comparison Table

| API | Free Tier | Commercial | Flight | Hotel | Car | Activities |
|-----|-----------|------------|--------|-------|-----|------------|
| **Sabre** | ✅ Sandbox | 💰 Yes | ✅ | ✅ | ✅ | ✅ |
| **Amadeus** | ✅ 2K calls/mo | 💰 $0.01/call | ✅ | ✅ | ❌ | ✅ |
| **Travelport** | ✅ Trial | 💰 Yes | ✅ | ✅ | ✅ | ❌ |
| **Skyscanner** | ✅ 100 calls | 💰 Commission | ✅ | ✅ | ✅ | ❌ |
| **Kiwi.com** | ✅ Limited | 💰 Usage | ✅ | ❌ | ❌ | ❌ |
| **OpenSky** | ✅ Always Free | 🆓 Free | ✅ Tracking | ❌ | ❌ | ❌ |
| **Booking.com** | ❌ | 💰 Affiliate | ❌ | ✅ | ❌ | ❌ |

---

## 🎯 Recommended Setup for Amrikyy Travel Agent

### Phase 1: Development (FREE)
1. **Amadeus** - Flight & hotel search (2,000 free calls/month)
2. **OpenSky** - Real-time flight tracking (free)
3. **Sabre Sandbox** - Full testing environment (free)

### Phase 2: MVP Launch
1. **Amadeus Production** - Pay-as-you-go ($0.01/call)
2. **Kiwi.com** - Budget flight options
3. **Booking.com Affiliate** - Hotel bookings (commission-based)

### Phase 3: Scale
1. **Sabre Production** - Full GDS access
2. **Travelport** - Enterprise features
3. **Multiple providers** - Best price comparison

---

## 📝 Environment Variables Setup

Add to `backend/.env`:

```bash
# Sabre API
SABRE_CLIENT_ID=V1:your_client_id:DEVCENTER:EXT
SABRE_CLIENT_SECRET=your_client_secret
SABRE_IPCC=your_ipcc_code
SABRE_API_BASE=https://api.sabre.com

# Amadeus API (Recommended for FREE tier!)
AMADEUS_API_KEY=your_api_key
AMADEUS_API_SECRET=your_api_secret
AMADEUS_API_BASE=https://test.api.amadeus.com
# Change to https://api.amadeus.com for production

# Kiwi.com Tequila API
KIWI_API_KEY=your_kiwi_api_key
KIWI_API_BASE=https://api.tequila.kiwi.com

# Skyscanner API
SKYSCANNER_API_KEY=your_skyscanner_key

# Booking.com
BOOKING_AFFILIATE_ID=your_affiliate_id

# OpenSky (No key needed!)
OPENSKY_API_BASE=https://opensky-network.org/api
```

---

## 🔧 Implementation Files to Create

```
backend/
├── src/
│   ├── services/
│   │   ├── sabre/
│   │   │   ├── SabreClient.js
│   │   │   ├── FlightService.js
│   │   │   └── HotelService.js
│   │   ├── amadeus/
│   │   │   ├── AmadeusClient.js
│   │   │   ├── FlightService.js
│   │   │   └── HotelService.js
│   │   └── aggregator/
│   │       └── TravelAggregator.js (combines all APIs)
│   └── config/
│       └── travel-apis.config.js
```

---

## 🚀 Next Steps

1. ✅ **Choose your APIs** based on budget and requirements
2. ✅ **Register and get credentials** from chosen providers
3. ✅ **Add credentials to .env**
4. ✅ **Create service files** for each API
5. ✅ **Test in sandbox/development** environments
6. ✅ **Integrate with Telegram bot**
7. ✅ **Deploy to production**

---

## 📚 Additional Resources

- **Sabre Dev Studio:** https://developer.sabre.com/
- **Amadeus for Developers:** https://developers.amadeus.com/
- **Travelport Developer Portal:** https://developer.travelport.com/
- **Travel API Comparison:** https://www.altexsoft.com/blog/travel-apis/

---

## 💡 Pro Tips

1. **Start with Amadeus** - Best free tier for development
2. **Use Sabre sandbox** - Test without costs
3. **Combine multiple APIs** - Better prices & coverage
4. **Cache responses** - Reduce API calls & costs
5. **Monitor usage** - Track API call limits
6. **Handle errors gracefully** - APIs can fail
7. **Store popular routes** - Optimize performance

---

**Created for Amrikyy Travel Agent - Your AI-Powered Travel Assistant! 🌍✈️**

*Last Updated: October 2025*

