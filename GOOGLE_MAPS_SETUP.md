# 🗺️ Google Maps API Setup Guide

**Complete guide to set up Google Maps Platform for Amrikyy AI OS**

---

## 🎯 STEP 1: CREATE GOOGLE CLOUD PROJECT

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Project name: `amrikyy-ai-os`
4. Click "Create"
5. Wait for project creation (30 seconds)

---

## 🔑 STEP 2: ENABLE REQUIRED APIS

### **Enable These APIs:**

1. **Places API (New)** ⭐ REQUIRED
   - URL: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
   - Click "Enable"

2. **Routes API** ⭐ REQUIRED
   - URL: https://console.cloud.google.com/apis/library/routes.googleapis.com
   - Click "Enable"

3. **Geocoding API** ⭐ REQUIRED
   - URL: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
   - Click "Enable"

4. **Maps JavaScript API** (Optional - for frontend maps)
   - URL: https://console.cloud.google.com/apis/library/maps-backend.googleapis.com
   - Click "Enable"

5. **Distance Matrix API** (Optional - for advanced routing)
   - URL: https://console.cloud.google.com/apis/library/distance-matrix-backend.googleapis.com
   - Click "Enable"

---

## 🔐 STEP 3: CREATE API KEY

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "API Key"
3. Copy the API key (save it securely!)
4. Click "Restrict Key" (IMPORTANT for security)

### **Restrict API Key:**

#### **For Backend (Server-side):**
```
Application restrictions:
├─ IP addresses
└─ Add your server IP (or 0.0.0.0/0 for development)

API restrictions:
├─ Restrict key
└─ Select APIs:
    ├─ Places API (New)
    ├─ Routes API
    ├─ Geocoding API
    └─ Distance Matrix API
```

#### **For Frontend (Client-side):**
```
Application restrictions:
├─ HTTP referrers (websites)
└─ Add your domains:
    ├─ http://localhost:5173/*
    ├─ https://yourdomain.com/*
    └─ https://*.vercel.app/*

API restrictions:
├─ Restrict key
└─ Select APIs:
    └─ Maps JavaScript API
```

**⚠️ IMPORTANT:** Create 2 separate API keys:
- One for backend (IP restricted)
- One for frontend (HTTP referrer restricted)

---

## 💳 STEP 4: ENABLE BILLING

1. Go to [Billing](https://console.cloud.google.com/billing)
2. Click "Link a billing account"
3. Add payment method (credit card)
4. **Don't worry!** Google gives you:
   - $200 free credit every month
   - First 28,000 requests/month FREE for most APIs
   - You won't be charged unless you exceed free tier

### **Free Tier Limits:**
```
Places API (New):
├─ Text Search: $0 for first 1,000 requests/month
├─ Nearby Search: $0 for first 1,000 requests/month
└─ Place Details: $0 for first 1,000 requests/month

Routes API:
├─ Directions: $0 for first 28,000 requests/month
└─ Distance Matrix: $0 for first 28,000 requests/month

Geocoding API:
└─ $0 for first 28,000 requests/month

Total: ~$200/month in free usage! 🎉
```

---

## 🔧 STEP 5: ADD TO YOUR PROJECT

### **Backend .env file:**
```bash
# Add to backend/.env
GOOGLE_MAPS_API_KEY=your-backend-api-key-here
```

### **Frontend .env file:**
```bash
# Add to frontend/.env
VITE_GOOGLE_MAPS_API_KEY=your-frontend-api-key-here
```

---

## ✅ STEP 6: TEST THE INTEGRATION

### **Run the test script:**
```bash
cd backend
node test-google-maps.js
```

### **Expected output:**
```
🗺️ Testing Google Maps Service Integration

1️⃣ Testing Service Status...
✅ Service status OK

2️⃣ Testing Hotel Search...
Found 5 hotels:
  1. Hotel Name
     Address: Full address
     Rating: 4.5 (1234 reviews)
✅ Hotel search OK

3️⃣ Testing Restaurant Search...
✅ Restaurant search OK

4️⃣ Testing Attractions Search...
✅ Attractions search OK

5️⃣ Testing Geocoding...
✅ Geocoding OK

6️⃣ Testing Directions...
✅ Directions OK

🎉 All tests passed!
✅ Google Maps Service is fully operational!
```

---

## 🚨 TROUBLESHOOTING

### **Error: "API key not valid"**
```
Solution:
1. Check if API key is correct in .env
2. Verify API key restrictions allow your IP
3. Wait 5 minutes after creating key (propagation time)
```

### **Error: "This API has not been enabled"**
```
Solution:
1. Go to Google Cloud Console
2. Enable the required API
3. Wait 2-3 minutes for activation
```

### **Error: "Billing not enabled"**
```
Solution:
1. Go to Billing in Google Cloud Console
2. Link a billing account
3. Add payment method
4. Don't worry - you have $200 free credit!
```

### **Error: "PERMISSION_DENIED"**
```
Solution:
1. Check API key restrictions
2. Make sure your IP is allowed
3. Verify the API is enabled
```

### **Error: "OVER_QUERY_LIMIT"**
```
Solution:
1. You've exceeded free tier
2. Check usage in Google Cloud Console
3. Implement caching to reduce API calls
4. Consider upgrading billing
```

---

## 💰 COST OPTIMIZATION TIPS

### **1. Use Redis Caching**
```javascript
// Cache hotel searches for 1 hour
const cacheKey = `hotels:${destination}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const hotels = await googleMaps.searchHotels(destination);
await redis.setex(cacheKey, 3600, JSON.stringify(hotels));
```

### **2. Batch Requests**
```javascript
// Instead of 10 separate requests
// Use Distance Matrix for multiple origins/destinations
const matrix = await googleMaps.calculateDistanceMatrix(
  [origin1, origin2, origin3],
  [dest1, dest2, dest3]
);
```

### **3. Use Appropriate Detail Levels**
```javascript
// Don't request all fields if you only need basic info
const hotels = await googleMaps.searchHotels(area, {
  maxResults: 5  // Limit results
});
```

### **4. Monitor Usage**
- Go to [Google Cloud Console → APIs & Services → Dashboard](https://console.cloud.google.com/apis/dashboard)
- Check daily usage
- Set up budget alerts

---

## 📊 USAGE MONITORING

### **Set Up Budget Alerts:**

1. Go to [Billing → Budgets & alerts](https://console.cloud.google.com/billing/budgets)
2. Click "Create Budget"
3. Set budget: $50/month
4. Set alerts at: 50%, 90%, 100%
5. Add your email for notifications

### **Monitor API Usage:**

1. Go to [APIs & Services → Dashboard](https://console.cloud.google.com/apis/dashboard)
2. View requests per API
3. Check error rates
4. Monitor quotas

---

## 🎯 PRODUCTION CHECKLIST

Before going to production:

- [ ] API keys are restricted (IP/HTTP referrer)
- [ ] Billing is enabled
- [ ] Budget alerts are set up
- [ ] Caching is implemented (Redis)
- [ ] Error handling is in place
- [ ] Rate limiting is configured
- [ ] Usage monitoring is active
- [ ] Backup API keys are created
- [ ] Documentation is updated
- [ ] Team has access to Google Cloud Console

---

## 📚 USEFUL LINKS

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Places API (New) Guide](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Routes API Guide](https://developers.google.com/maps/documentation/routes)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Support](https://developers.google.com/maps/support)

---

## 🆘 NEED HELP?

### **Google Cloud Support:**
- Free tier: Community support only
- Paid: 24/7 support available

### **Amrikyy Support:**
- GitHub Issues: [github.com/Moeabdelaziz007/Amrikyy-Agent/issues](https://github.com/Moeabdelaziz007/Amrikyy-Agent/issues)
- Email: amrikyy@gmail.com

---

**✅ You're all set! Google Maps is ready to power your SAAAAS platform!** 🚀
