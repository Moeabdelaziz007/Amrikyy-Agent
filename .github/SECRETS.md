# GitHub Secrets Configuration

## Required Secrets for SEO Automation

Add these secrets in your GitHub repository settings:
**Settings → Secrets and variables → Actions → New repository secret**

### 1. GOOGLE_APPLICATION_CREDENTIALS
Google Search Console API credentials (JSON format)

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### 2. GEMINI_API_KEY
Google Gemini API key for AI features

```
AIzaSy...
```

### 3. SUPABASE_URL
Supabase project URL

```
https://your-project.supabase.co
```

### 4. SUPABASE_KEY
Supabase anon/public key

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. SLACK_WEBHOOK_URL (Optional)
Slack webhook URL for notifications

```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

## How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the secret name and value
5. Click **Add secret**

## Testing

After adding secrets, you can test the workflow:

1. Go to **Actions** tab
2. Select **SEO Automation** workflow
3. Click **Run workflow** → **Run workflow**
4. Check the logs for any errors

## Security Notes

- Never commit secrets to the repository
- Use environment-specific secrets for different environments
- Rotate secrets regularly
- Use GitHub's secret scanning to detect leaked secrets
