# 🚀 Lovable → GitHub → Local Integration

## Quick Start Guide

### 1️⃣ Connect Lovable to GitHub

**Option A: Through Lovable UI**

1. Go to your Lovable project: https://lovable.dev/projects/
2. Look for "Settings" or "Deploy" section
3. Click "Connect GitHub" or "Export to Repository"
4. Authorize Lovable to access GitHub
5. Choose "Create new repository" or select existing one
6. Lovable will push all your code to GitHub

**Option B: Through Lovable Settings**

- Check: https://docs.lovable.dev (for official docs)
- Or look in project settings for GitHub integration

### 2️⃣ Get Your GitHub Repository URL

Once connected, you'll have a URL like:

```
https://github.com/YOUR_USERNAME/amrikyy-ui
```

### 3️⃣ Run the Integration Script

**Method 1: Automatic Integration (Recommended)**

```bash
cd /Users/Shared/maya-travel-agent
./integrate-lovable-ui.sh https://github.com/YOUR_USERNAME/YOUR_REPO
```

This will:

- ✅ Clone your Lovable UI
- ✅ Set up environment variables
- ✅ Create API integration layer
- ✅ Install dependencies
- ✅ Generate integration guide

**Method 2: Manual Integration**

```bash
# Clone the repo
cd /Users/Shared/maya-travel-agent
git clone https://github.com/YOUR_USERNAME/YOUR_REPO frontend

# Install dependencies
cd frontend
npm install

# Copy environment template
cp ../.env.example .env.local

# Start dev server
npm run dev
```

### 4️⃣ Update Environment Variables

Edit `frontend/.env.local`:

```bash
# Backend API
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000

# Supabase (get from https://supabase.com/dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe (get from https://dashboard.stripe.com)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key-here

# Agent IDs
VITE_EGYPT_AGENT_ID=agent_egypt_001
VITE_SAUDI_AGENT_ID=agent_saudi_001
VITE_UAE_AGENT_ID=agent_uae_001
```

### 5️⃣ Start Everything

**Terminal 1: Backend**

```bash
cd /Users/Shared/maya-travel-agent/backend
npm start
```

**Terminal 2: Frontend**

```bash
cd /Users/Shared/maya-travel-agent/frontend
npm run dev
```

**Open in browser:**

- Frontend: http://localhost:5173 (or port shown)
- Backend API: http://localhost:5000/health

---

## 🎯 Alternative: Download ZIP from GitHub

If you prefer ZIP download:

### Step 1: Download

1. Go to: https://github.com/YOUR_USERNAME/YOUR_REPO
2. Click green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file

### Step 2: Move Files

```bash
cd /Users/Shared/maya-travel-agent
mv ~/Downloads/your-repo-main frontend
cd frontend
npm install
```

### Step 3: Follow steps 4-5 above

---

## 📝 Troubleshooting

### Can't find GitHub option in Lovable?

**Try these locations:**

- Project Settings
- Deploy tab
- Export menu
- Share button
- More options (three dots)

**Or check Lovable docs:**

- https://docs.lovable.dev
- Help center in Lovable
- Contact Lovable support

### GitHub Not Authorized?

1. Go to GitHub Settings
2. Applications → Authorized OAuth Apps
3. Find "Lovable" and authorize it

### Repo Created but Empty?

Lovable might need a few minutes to push code. Check:

1. Refresh GitHub page
2. Look for "Recent commits"
3. Try "Sync" or "Push" button in Lovable

---

## 🎨 What You Get from Lovable

The GitHub repo should contain:

```
your-repo/
├── src/
│   ├── components/     # UI components
│   ├── pages/          # All pages
│   ├── lib/            # Utilities
│   └── ...
├── public/             # Static assets
├── package.json        # Dependencies
├── vite.config.ts      # Build config
├── tailwind.config.ts  # Styling
└── ...
```

---

## ✅ Integration Checklist

After running the integration script:

- [ ] Frontend cloned successfully
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Backend running on port 5000
- [ ] Frontend running (port 5173 or shown)
- [ ] Can see landing page
- [ ] Can navigate between pages
- [ ] API calls working (check Network tab)

---

## 🚀 Ready to Deploy?

Once everything works locally:

### Frontend → Vercel

```bash
cd frontend
npm install -g vercel
vercel login
vercel
```

### Backend → Railway

Already configured! Just:

```bash
cd backend
git add .
git commit -m "Ready for deployment"
git push
```

---

## 💡 Need Help?

**I'm here to help! Just tell me:**

1. ✅ "I connected Lovable to GitHub - here's the URL"
   → I'll run the integration immediately

2. ✅ "I downloaded the ZIP file"
   → Extract it and tell me where, I'll integrate

3. ✅ "I'm stuck at step X"
   → I'll guide you through it

4. ✅ "Can you do this differently?"
   → Absolutely! Tell me your preference

---

**Your move! 🎯**

Give me the GitHub URL and I'll integrate everything in 30 seconds! 🚀
