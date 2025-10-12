# 🔐 Frontend Environment Variables Setup

This guide shows you how to configure environment variables for the Amrikyy frontend.

---

## 📋 Quick Setup

### 1. Create `.env` file in `frontend/` directory

```bash
cd frontend
touch .env
```

### 2. Copy this template and fill in your values

```bash
# ========================================
# AMRIKYY FRONTEND ENVIRONMENT VARIABLES
# ========================================

# ========================================
# BACKEND API (REQUIRED)
# ========================================
VITE_BACKEND_API_URL=http://localhost:5001/api
# Production: https://amrikyy-backend.railway.app/api

# ========================================
# SUPABASE (REQUIRED for Auth)
# ========================================
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ========================================
# STRIPE (REQUIRED for Payments)
# ========================================
VITE_STRIPE_PUBLIC_KEY=pk_test_51...
# Production: pk_live_51...

# ========================================
# APPLICATION CONFIG
# ========================================
VITE_APP_NAME=Amrikyy
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# ========================================
# FEATURE FLAGS (Optional)
# ========================================
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_CHAT=true
VITE_ENABLE_ADMIN=true
VITE_MOCK_API=false

# ========================================
# MONITORING (Optional)
# ========================================
# VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
# VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## 🎯 Environment-Specific Configs

### **Development** (`.env.development`)

```bash
VITE_BACKEND_API_URL=http://localhost:5001/api
VITE_APP_ENV=development
VITE_DEV_MODE=true
VITE_MOCK_API=false
```

### **Staging** (`.env.staging`)

```bash
VITE_BACKEND_API_URL=https://amrikyy-staging.railway.app/api
VITE_APP_ENV=staging
VITE_DEV_MODE=false
VITE_MOCK_API=false
```

### **Production** (`.env.production`)

```bash
VITE_BACKEND_API_URL=https://api.amrikyy.com/api
VITE_APP_ENV=production
VITE_DEV_MODE=false
VITE_MOCK_API=false
VITE_ENABLE_ANALYTICS=true
```

---

## 🔑 How to Get Your Keys

### **1. Backend API URL**

**Local Development:**

```bash
# Start your backend first
cd backend
npm start
# Backend runs on http://localhost:5001
```

**Production (Railway):**

- Deploy backend to Railway
- Get public URL from Railway dashboard
- Example: `https://amrikyy-backend-production.up.railway.app`

### **2. Supabase Keys**

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project (or use existing)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### **3. Stripe Public Key**

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Sign in or create account
3. Go to **Developers** → **API Keys**
4. Copy:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - Use `pk_test_` for development
   - Use `pk_live_` for production

---

## 🚀 Using in Lovable

### **Option 1: Environment Variables Panel**

If Lovable has an environment variables UI:

1. Click "Settings" or "Environment"
2. Add each variable manually
3. Save and rebuild

### **Option 2: In Code (for prototyping)**

```typescript
// src/config/env.ts
export const config = {
  backendUrl:
    import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5001/api',
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  stripe: {
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Amrikyy',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    env: import.meta.env.VITE_APP_ENV || 'development',
  },
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    chat: import.meta.env.VITE_ENABLE_CHAT !== 'false', // default true
    admin: import.meta.env.VITE_ENABLE_ADMIN !== 'false', // default true
    mockApi: import.meta.env.VITE_MOCK_API === 'true',
  },
};

export default config;
```

### **Usage in Components:**

```typescript
import { config } from '@/config/env';

// In API client
const apiClient = axios.create({
  baseURL: config.backendUrl,
});

// Feature flags
if (config.features.chat) {
  // Render chat interface
}

if (config.features.mockApi) {
  // Use mock data
  return mockFlights();
} else {
  // Use real API
  return apiClient.get('/sabre/flights/search');
}
```

---

## 🧪 Development Mode with Mocks

For faster UI development without backend:

```bash
# .env.development
VITE_MOCK_API=true
```

Then in your API hooks:

```typescript
import { config } from '@/config/env';
import { mockFlights, mockHotels } from './LOVABLE_MOCK_DATA';

export const useFlightSearch = () => {
  return useMutation({
    mutationFn: async (data) => {
      if (config.features.mockApi) {
        // Use mock data during development
        return mockFlights(data);
      }
      // Real API call
      const response = await apiClient.post('/sabre/flights/search', data);
      return response.data;
    },
  });
};
```

---

## ✅ Verification

### Test Your Config:

Create `src/pages/TestEnv.tsx`:

```typescript
import { config } from '@/config/env';

export function TestEnv() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Check</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(config, null, 2)}
      </pre>

      <div className="mt-4 space-y-2">
        <div className={config.backendUrl ? 'text-green-600' : 'text-red-600'}>
          {config.backendUrl ? '✅' : '❌'} Backend URL:{' '}
          {config.backendUrl || 'NOT SET'}
        </div>
        <div
          className={config.supabase.url ? 'text-green-600' : 'text-red-600'}
        >
          {config.supabase.url ? '✅' : '❌'} Supabase URL:{' '}
          {config.supabase.url || 'NOT SET'}
        </div>
        <div
          className={
            config.stripe.publicKey ? 'text-green-600' : 'text-red-600'
          }
        >
          {config.stripe.publicKey ? '✅' : '❌'} Stripe Key:{' '}
          {config.stripe.publicKey ? 'SET' : 'NOT SET'}
        </div>
      </div>
    </div>
  );
}
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** to Git

   - Already in `.gitignore`
   - Use `.env.example` as template

2. **Use different keys for dev/prod**

   - Test keys in development
   - Live keys only in production

3. **Only expose public keys**

   - `VITE_*` variables are embedded in client code
   - Never put secret keys in frontend
   - Backend secrets stay in backend `.env`

4. **Rotate keys regularly**
   - Change Stripe test keys monthly
   - Regenerate Supabase keys if compromised

---

## 📚 Need Help?

- **Supabase Setup:** [https://supabase.com/docs/guides/getting-started](https://supabase.com/docs/guides/getting-started)
- **Stripe Setup:** [https://stripe.com/docs/keys](https://stripe.com/docs/keys)
- **Vite Env Vars:** [https://vitejs.dev/guide/env-and-mode.html](https://vitejs.dev/guide/env-and-mode.html)

---

## 🎉 You're Ready!

Once you've set up your `.env` file with the values above, your frontend will be able to:

✅ Connect to the backend API  
✅ Authenticate users via Supabase  
✅ Process payments via Stripe  
✅ Toggle between mock and real data

**Happy coding! 🚀**
