# 🌐 Google APIs Setup Guide - Amrikyy Agent

**Platform**: Powered by Gemini + Google Cloud  
**Author**: Mohamed Hossameldin Abdelaziz

---

## 🎯 Required Google APIs

### 1. **Gemini AI API** (Primary AI Model)
- **Purpose**: AI chat, recommendations, natural language processing
- **Free Tier**: 15 requests/minute
- **Get Key**: https://aistudio.google.com/app/apikey

### 2. **Google Maps API** (Location Services)
- **Purpose**: Maps, geocoding, places, directions
- **Free Tier**: $200/month credit
- **Get Key**: https://console.cloud.google.com/google/maps-apis

### 3. **Google Search API** (Research & Discovery)
- **Purpose**: Web search, destination research
- **Free Tier**: 100 queries/day
- **Get Key**: https://developers.google.com/custom-search

### 4. **Google Cloud Platform** (Infrastructure)
- **Purpose**: Service account, storage, advanced features
- **Free Tier**: Various services
- **Setup**: https://console.cloud.google.com

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Gemini API Key (REQUIRED)

1. **Visit**: https://aistudio.google.com/app/apikey
2. **Sign in** with Google account
3. **Click**: "Get API Key" or "Create API Key"
4. **Select**: Existing project or create new
5. **Copy**: Key starts with `AIzaSy...`

**Add to Railway:**
```bash
GEMINI_API_KEY=AIzaSy...
GOOGLE_AI_API_KEY=AIzaSy...
```

---

### Step 2: Google Maps API (RECOMMENDED)

1. **Visit**: https://console.cloud.google.com/google/maps-apis
2. **Enable APIs**:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
3. **Create Credentials** → API Key
4. **Restrict Key** (optional but recommended):
   - Application restrictions: HTTP referrers
   - API restrictions: Select enabled APIs

**Add to Railway:**
```bash
GOOGLE_MAPS_API_KEY=AIzaSy...
```

---

### Step 3: Google Search API (OPTIONAL)

1. **Visit**: https://developers.google.com/custom-search/v1/introduction
2. **Get API Key**: https://console.cloud.google.com/apis/credentials
3. **Create Custom Search Engine**: https://programmablesearchengine.google.com/
4. **Copy Search Engine ID**

**Add to Railway:**
```bash
GOOGLE_SEARCH_API_KEY=AIzaSy...
GOOGLE_SEARCH_ENGINE_ID=your-engine-id
```

---

### Step 4: Google Cloud Service Account (ADVANCED)

**Only needed for:**
- Cloud Storage
- BigQuery
- Advanced AI features
- Production-grade authentication

**Setup:**
1. **Visit**: https://console.cloud.google.com/iam-admin/serviceaccounts
2. **Create Service Account**
3. **Download JSON key**
4. **Add to Railway** as secret file

---

## 📋 Minimum Setup for Launch

### Essential (Deploy Now):
```bash
✅ GEMINI_API_KEY          # AI chat functionality
✅ SUPABASE_URL            # Database
✅ SUPABASE_ANON_KEY       # Database auth
✅ JWT_SECRET              # User authentication
```

### Recommended (Add Soon):
```bash
⭐ GOOGLE_MAPS_API_KEY     # Location features
⭐ GOOGLE_SEARCH_API_KEY   # Research features
```

### Optional (Add Later):
```bash
💡 GOOGLE_CLOUD_PROJECT    # Advanced features
💡 Service Account JSON    # Production features
```

---

## 🔑 Complete Railway Environment Variables

```bash
# ============================================
# SERVER
# ============================================
PORT=3001
NODE_ENV=production

# ============================================
# DATABASE - SUPABASE
# ============================================
SUPABASE_URL=https://driujancggfxgdsuyaih.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaXVqYW5jZ2dmeGdkc3V5YWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTc3MDgsImV4cCI6MjA3NjM5MzcwOH0.4CZCB1D2pPcxELpS5edmRW6lJ7y3_N0aRubjJGl2bhY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaXVqYW5jZ2dmeGdkc3V5YWloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgxNzcwOCwiZXhwIjoyMDc2MzkzNzA4fQ.u-jExSAb_ZhM2fwH82D9p_EdJ0ths4OfrE1BSNSEWMc
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaXVqYW5jZ2dmeGdkc3V5YWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTc3MDgsImV4cCI6MjA3NjM5MzcwOH0.4CZCB1D2pPcxELpS5edmRW6lJ7y3_N0aRubjJGl2bhY

# ============================================
# SECURITY
# ============================================
JWT_SECRET=f8bb6957caa6dbc287832253c85b1f8cbb539af21fb2e5a7157783a0dc9b8624
ENCRYPTION_KEY=f8bb6957caa6dbc287832253c85b1f8cbb539af21fb2e5a7157783a0dc9b8624

# ============================================
# GOOGLE & GEMINI APIs
# ============================================
GEMINI_API_KEY=YOUR_GEMINI_KEY_HERE
GOOGLE_AI_API_KEY=YOUR_GEMINI_KEY_HERE
GOOGLE_MAPS_API_KEY=YOUR_MAPS_KEY_HERE
GOOGLE_SEARCH_API_KEY=YOUR_SEARCH_KEY_HERE
GOOGLE_SEARCH_ENGINE_ID=YOUR_ENGINE_ID_HERE

# ============================================
# FRONTEND
# ============================================
FRONTEND_URL=https://amrikyy-agent.vercel.app
CORS_ORIGIN=https://amrikyy-agent.vercel.app
```

---

## 🎯 Deployment Strategy

### Phase 1: Core Launch (NOW)
```bash
✅ Get Gemini API key
✅ Add to Railway
✅ Deploy backend
✅ Deploy frontend
✅ Test AI chat
```

### Phase 2: Location Features (Week 1)
```bash
⭐ Add Google Maps API
⭐ Enable location search
⭐ Add map visualization
```

### Phase 3: Research Features (Week 2)
```bash
💡 Add Google Search API
💡 Enable destination research
💡 Add recommendations
```

### Phase 4: Advanced Features (Month 1)
```bash
🚀 Google Cloud integration
🚀 Advanced AI features
🚀 Production optimization
```

---

## 💰 Cost Estimation

### Free Tier (First 3 Months)
```
Gemini AI:        FREE (15 req/min)
Google Maps:      FREE ($200 credit/month)
Google Search:    FREE (100 queries/day)
Supabase:         FREE (500MB database)
Railway:          FREE ($5 credit)
Vercel:           FREE (unlimited)
─────────────────────────────────
Total:            $0/month
```

### After Free Tier
```
Gemini AI:        $0.00025/1K chars (~$10/month)
Google Maps:      $2-7/1K requests (~$20/month)
Google Search:    $5/1K queries (~$15/month)
Supabase:         $25/month (Pro plan)
Railway:          $5-20/month
─────────────────────────────────
Total:            ~$75-100/month
```

---

## 🔒 Security Best Practices

### API Key Restrictions

**Gemini API:**
- Restrict to your domain
- Set usage quotas
- Monitor usage

**Google Maps API:**
- HTTP referrer restrictions
- API restrictions (only enabled APIs)
- Daily quotas

**Google Search API:**
- IP restrictions
- Usage limits
- Monitor costs

---

## 📞 Support

**Mohamed Hossameldin Abdelaziz**
- 📧 Email: Amrikyy@gmail.com
- 💬 WhatsApp: +17706160211
- 💼 LinkedIn: [linkedin.com/in/amrikyy](https://www.linkedin.com/in/amrikyy)

---

## 🎯 Next Steps

1. **Get Gemini API Key**: https://aistudio.google.com/app/apikey
2. **Paste key here** or in Railway
3. **Deploy backend**
4. **Test AI chat**
5. **Add Maps API** (optional, can add later)

---

**Ready to get your Gemini API key?**
- ✅ Yes, getting it now
- 📖 Show me step-by-step
- ⏭️ Deploy without Maps first (add later)

**Last Updated**: January 21, 2025  
**Version**: 1.0.0
