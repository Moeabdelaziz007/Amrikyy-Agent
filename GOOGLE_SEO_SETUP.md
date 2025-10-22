# 🔍 Google SEO Automation Setup Guide

**Automate sitemap submission, indexing monitoring, and SEO tracking**

---

## 📋 Prerequisites

1. **Domain**: Your website domain (e.g., `amrikyy.com`)
2. **Google Account**: For Search Console access
3. **Google Cloud Project**: For API access

---

## 🚀 Step 1: Google Search Console Setup

### 1.1 Verify Your Domain

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **"Add Property"**
3. Choose **"Domain"** (recommended) or **"URL prefix"**
4. Follow verification steps:
   - **DNS verification** (recommended): Add TXT record to your DNS
   - **HTML file**: Upload verification file to your site
   - **HTML tag**: Add meta tag to your homepage

### 1.2 Wait for Verification

- DNS verification can take 24-48 hours
- Check status in Search Console

---

## 🔑 Step 2: Create Service Account

### 2.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Create Project"**
3. Name: `amrikyy-seo-automation`
4. Click **"Create"**

### 2.2 Enable APIs

1. Go to **"APIs & Services" > "Library"**
2. Search and enable:
   - ✅ **Google Search Console API**
   - ✅ **Indexing API** (optional, only for jobs/live video)
   - ✅ **PageSpeed Insights API** (optional, for Core Web Vitals)

### 2.3 Create Service Account

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials" > "Service Account"**
3. Name: `seo-automation-bot`
4. Role: **"Owner"** (for full access)
5. Click **"Done"**

### 2.4 Generate JSON Key

1. Click on the service account you just created
2. Go to **"Keys"** tab
3. Click **"Add Key" > "Create new key"**
4. Choose **"JSON"**
5. Download the JSON file
6. **IMPORTANT**: Keep this file secure! Never commit to Git

### 2.5 Add Service Account to Search Console

1. Go back to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Click **"Settings"** (gear icon)
4. Click **"Users and permissions"**
5. Click **"Add user"**
6. Enter the service account email (from JSON file):
   ```
   seo-automation-bot@amrikyy-seo-automation.iam.gserviceaccount.com
   ```
7. Permission: **"Owner"**
8. Click **"Add"**

---

## 🔐 Step 3: Store Credentials Securely

### 3.1 Local Development

1. Create `.env` file in backend directory:
   ```bash
   # Google Search Console
   GOOGLE_SERVICE_ACCOUNT_EMAIL=seo-automation-bot@amrikyy-seo-automation.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_PROJECT_ID=amrikyy-seo-automation
   
   # Site URL
   SITE_URL=https://amrikyy.com/
   ```

2. Extract from JSON file:
   ```javascript
   const serviceAccount = require('./service-account.json');
   
   console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL=' + serviceAccount.client_email);
   console.log('GOOGLE_PRIVATE_KEY="' + serviceAccount.private_key + '"');
   console.log('GOOGLE_PROJECT_ID=' + serviceAccount.project_id);
   ```

3. Add to `.gitignore`:
   ```
   service-account.json
   .env
   ```

### 3.2 Production (GitHub Secrets)

1. Go to your GitHub repository
2. Click **"Settings" > "Secrets and variables" > "Actions"**
3. Click **"New repository secret"**
4. Add these secrets:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_PROJECT_ID`
   - `SITE_URL`

---

## 📦 Step 4: Install Dependencies

```bash
cd backend
npm install googleapis --save
```

---

## ✅ Step 5: Verify Setup

Create a test script to verify credentials:

```javascript
// backend/test-google-auth.js
const { google } = require('googleapis');

async function testAuth() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/webmasters'],
    });

    const client = await auth.getClient();
    const searchconsole = google.searchconsole({ version: 'v1', auth: client });

    // List sites
    const response = await searchconsole.sites.list();
    console.log('✅ Authentication successful!');
    console.log('Sites:', response.data.siteEntry);
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
  }
}

testAuth();
```

Run test:
```bash
node backend/test-google-auth.js
```

Expected output:
```
✅ Authentication successful!
Sites: [
  {
    siteUrl: 'https://amrikyy.com/',
    permissionLevel: 'siteOwner'
  }
]
```

---

## 🎯 Next Steps

Once setup is complete:

1. ✅ **SitemapGenerator.js** - Generate and submit sitemaps
2. ✅ **SEOMonitor.js** - Fetch Search Analytics data
3. ✅ **seo-routes.js** - API endpoints for SEO data
4. ✅ **SEODashboard.tsx** - Frontend dashboard
5. ✅ **GitHub Actions** - Daily monitoring automation

---

## 🐛 Troubleshooting

### Error: "User does not have sufficient permission"
**Solution**: Make sure service account is added as **Owner** in Search Console

### Error: "Invalid credentials"
**Solution**: 
- Check `GOOGLE_PRIVATE_KEY` has proper newlines (`\n`)
- Verify email matches service account
- Regenerate JSON key if needed

### Error: "Site not found"
**Solution**: 
- Verify domain in Search Console first
- Use exact URL format (with trailing slash)
- Wait 24-48 hours after verification

### Error: "API not enabled"
**Solution**: Enable Search Console API in Google Cloud Console

---

## 📚 Resources

- [Search Console API Documentation](https://developers.google.com/webmaster-tools/search-console-api-original)
- [Service Account Authentication](https://cloud.google.com/docs/authentication/production)
- [Search Console Help](https://support.google.com/webmasters)

---

**Status**: Setup guide ready  
**Next**: Implement automation services
