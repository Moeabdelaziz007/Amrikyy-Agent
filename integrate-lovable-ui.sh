#!/bin/bash

# ============================================================================
# Lovable UI Integration Script
# Automatically integrates Lovable-generated UI with your backend
# ============================================================================

set -e  # Exit on any error

echo "🚀 Starting Lovable UI Integration..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/Users/Shared/maya-travel-agent"
LOVABLE_REPO_URL="$1"  # Pass as first argument

if [ -z "$LOVABLE_REPO_URL" ]; then
    echo "❌ Error: Please provide Lovable GitHub repo URL"
    echo "Usage: ./integrate-lovable-ui.sh https://github.com/YOUR_USERNAME/YOUR_REPO"
    exit 1
fi

echo "📂 Project Root: $PROJECT_ROOT"
echo "🔗 Lovable Repo: $LOVABLE_REPO_URL"
echo ""

# Step 1: Clone Lovable UI
echo "${BLUE}Step 1: Cloning Lovable UI from GitHub...${NC}"
cd "$PROJECT_ROOT"

if [ -d "frontend-lovable" ]; then
    echo "${YELLOW}⚠️  frontend-lovable already exists, removing...${NC}"
    rm -rf frontend-lovable
fi

git clone "$LOVABLE_REPO_URL" frontend-lovable
echo "${GREEN}✅ Cloned successfully${NC}"
echo ""

# Step 2: Backup existing frontend (if any)
echo "${BLUE}Step 2: Backing up existing frontend...${NC}"
if [ -d "frontend" ]; then
    BACKUP_NAME="frontend-backup-$(date +%Y%m%d-%H%M%S)"
    mv frontend "$BACKUP_NAME"
    echo "${GREEN}✅ Backed up to $BACKUP_NAME${NC}"
else
    echo "${YELLOW}ℹ️  No existing frontend to backup${NC}"
fi
echo ""

# Step 3: Move Lovable UI to frontend directory
echo "${BLUE}Step 3: Setting up frontend structure...${NC}"
mv frontend-lovable frontend
echo "${GREEN}✅ Frontend structure ready${NC}"
echo ""

# Step 4: Install dependencies
echo "${BLUE}Step 4: Installing frontend dependencies...${NC}"
cd "$PROJECT_ROOT/frontend"
if [ -f "package.json" ]; then
    npm install
    echo "${GREEN}✅ Dependencies installed${NC}"
else
    echo "${YELLOW}⚠️  No package.json found, skipping...${NC}"
fi
echo ""

# Step 5: Create environment configuration
echo "${BLUE}Step 5: Creating environment configuration...${NC}"
cat > "$PROJECT_ROOT/frontend/.env.local" << EOF
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000

# Supabase Configuration (replace with your values)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Environment
VITE_NODE_ENV=development

# Feature Flags
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_BOOKING=true
VITE_ENABLE_PAYMENTS=true

# AI Agent Configuration
VITE_EGYPT_AGENT_ID=agent_egypt_001
VITE_SAUDI_AGENT_ID=agent_saudi_001
VITE_UAE_AGENT_ID=agent_uae_001
EOF
echo "${GREEN}✅ Environment configuration created${NC}"
echo ""

# Step 6: Create API integration file
echo "${BLUE}Step 6: Creating API integration layer...${NC}"
mkdir -p "$PROJECT_ROOT/frontend/src/lib"

cat > "$PROJECT_ROOT/frontend/src/lib/api-client.ts" << 'EOF'
/**
 * API Client for Amrikyy Backend
 * Centralized API communication layer
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ApiOptions extends RequestInit {
  params?: Record<string, any>;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildURL(endpoint, params);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Travel API Methods
  async searchFlights(query: any) {
    return this.post('/sabre/flights/search', query);
  }

  async searchHotels(query: any) {
    return this.post('/sabre/hotels/search', query);
  }

  async searchTours(query: any) {
    return this.post('/sabre/activities/search', query);
  }

  async createBooking(data: any) {
    return this.post('/sabre/bookings', data);
  }

  // AI Agent Methods
  async chatWithAgent(agentId: string, message: string, context?: any) {
    return this.post(`/agents/${agentId}/chat`, { message, context });
  }

  async getAgentInfo(agentId: string) {
    return this.get(`/agents/${agentId}`);
  }

  // Payment Methods
  async createPaymentIntent(amount: number, currency: string) {
    return this.post('/payments/create-intent', { amount, currency });
  }

  async confirmPayment(paymentIntentId: string) {
    return this.post('/payments/confirm', { paymentIntentId });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
EOF
echo "${GREEN}✅ API client created${NC}"
echo ""

# Step 7: Create integration guide
echo "${BLUE}Step 7: Creating integration guide...${NC}"
cat > "$PROJECT_ROOT/LOVABLE_INTEGRATION_GUIDE.md" << 'EOF'
# Lovable UI Integration Guide

## ✅ What Was Done

1. **Cloned Lovable UI** from GitHub
2. **Set up environment variables** in `.env.local`
3. **Created API client** for backend communication
4. **Backed up old frontend** (if existed)

## 🔧 Next Steps

### 1. Update Environment Variables

Edit `frontend/.env.local` and replace with your actual values:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
```

### 2. Update Components to Use API Client

In your Lovable components, replace fetch calls with:

```typescript
import apiClient from '@/lib/api-client';

// Instead of fetch:
// const response = await fetch('/api/flights');

// Use:
const flights = await apiClient.searchFlights(query);
```

### 3. Start Development Server

```bash
cd frontend
npm run dev
```

### 4. Test All Features

- [ ] Landing page loads
- [ ] Trip planner works
- [ ] AI chat connects to backend
- [ ] Flight/hotel search works
- [ ] Booking flow completes
- [ ] Payments work

## 📚 API Endpoints Available

All endpoints are documented in:
- `FRONTEND_INTEGRATION_PACKAGE.md`
- `LOVABLE_MOCK_DATA.ts`

## 🐛 Troubleshooting

### CORS Errors
Backend already configured for CORS. If issues persist, check:
- Backend is running on port 5000
- Frontend proxy is configured

### API Connection Issues
Check:
1. Backend server is running: `cd backend && npm start`
2. Environment variables are correct
3. Network tab in browser DevTools

### Build Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel
```

### Backend (Railway)
Already configured in `railway.toml`

## 📞 Need Help?

Check the comprehensive docs:
- Backend API: `backend/README.md`
- Frontend Integration: `FRONTEND_INTEGRATION_PACKAGE.md`
- AIX System: `AIX_TEST_RESULTS_SUMMARY.md`
EOF
echo "${GREEN}✅ Integration guide created${NC}"
echo ""

# Step 8: Summary
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "${GREEN}🎉 LOVABLE UI INTEGRATION COMPLETE!${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📂 Frontend location: $PROJECT_ROOT/frontend"
echo "📝 Integration guide: $PROJECT_ROOT/LOVABLE_INTEGRATION_GUIDE.md"
echo "🔧 Environment config: $PROJECT_ROOT/frontend/.env.local"
echo ""
echo "🎯 Next Steps:"
echo "  1. Update environment variables in frontend/.env.local"
echo "  2. cd frontend && npm run dev"
echo "  3. Open http://localhost:5173 (or the port shown)"
echo "  4. Start backend: cd backend && npm start"
echo ""
echo "${GREEN}✅ Ready to rock! 🚀${NC}"
echo ""

