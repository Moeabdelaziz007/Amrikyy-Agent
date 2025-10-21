# 🤖 Telegram Bot Setup Guide

## ✅ Bot Token Secured

Your Telegram bot token has been added to the backend configuration.

**⚠️ SECURITY**: The token is stored in `.env` which is gitignored and will NOT be committed.

---

## 🚀 Deployment Steps

### 1. Add Token to Render.com

Go to your Render.com dashboard and add this environment variable:

```
TELEGRAM_BOT_TOKEN=8311767002:AAEIUzmsseDtCk6SjFYK41Zi09rcb0ELHsI
```

**Steps:**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your `amrikyy-agent` service
3. Click **Environment** tab
4. Click **Add Environment Variable**
5. Key: `TELEGRAM_BOT_TOKEN`
6. Value: `8311767002:AAEIUzmsseDtCk6SjFYK41Zi09rcb0ELHsI`
7. Click **Save Changes**
8. Render will auto-redeploy

---

## 🔧 What Was Changed

### 1. Backend Integration
- ✅ Added Telegram bot token to `backend/.env`
- ✅ Integrated `telegram-bot-gemini.js` into `server.js`
- ✅ Bot will auto-start when server starts
- ✅ Uses Google Gemini AI for responses

### 2. Bot Features
The bot includes:
- `/start` - Welcome message with Arabic support
- AI-powered travel planning
- Budget management
- Destination recommendations
- Interactive inline keyboards
- Conversation state management

---

## 🧪 Testing Your Bot

### After Render Deployment:

1. **Find Your Bot on Telegram**
   - Open Telegram
   - Search for your bot username (check @BotFather for the username)
   - Or use the link from BotFather

2. **Test Commands**
   ```
   /start - Start the bot
   /help - Get help
   ```

3. **Test AI Chat**
   - Send any message like "I want to visit Paris"
   - Bot should respond with AI-powered suggestions

---

## 📊 Monitoring

### Check Bot Status

**Backend Logs (Render Dashboard):**
```
🤖 Initializing Telegram Bot...
✅ Telegram Bot started successfully
🤖 Maya Travel Bot started successfully (Gemini AI)!
```

**If you see errors:**
- Check that `TELEGRAM_BOT_TOKEN` is set correctly
- Verify the token is valid (test with @BotFather)
- Check Render logs for specific error messages

---

## 🔐 Security Best Practices

### ✅ Already Implemented:
1. Token stored in environment variables (not in code)
2. `.env` file is gitignored
3. Template file uses placeholder values
4. Token not exposed in logs

### ⚠️ Important:
- **NEVER** commit the actual token to git
- **NEVER** share the token publicly
- **ROTATE** the token if accidentally exposed
- Use @BotFather to revoke/regenerate tokens if needed

---

## 🔄 Rotating Your Token (If Compromised)

If your token is ever exposed:

1. **Revoke Old Token**
   - Message @BotFather on Telegram
   - Send `/mybots`
   - Select your bot
   - Click "API Token"
   - Click "Revoke current token"

2. **Get New Token**
   - @BotFather will generate a new token
   - Copy the new token

3. **Update Everywhere**
   - Update `backend/.env` locally
   - Update Render.com environment variable
   - Redeploy

---

## 📝 Bot Configuration

### Current Setup:
- **AI Provider**: Google Gemini 2.0 Flash
- **Language**: Arabic + English support
- **Features**: Travel planning, budget management, AI chat
- **Polling**: Enabled (checks for messages every 300ms)

### Environment Variables Needed:
```bash
TELEGRAM_BOT_TOKEN=your_token_here
GEMINI_API_KEY=your_gemini_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

---

## 🐛 Troubleshooting

### Bot Not Responding

**Check 1: Token is Set**
```bash
# In Render dashboard, verify TELEGRAM_BOT_TOKEN exists
```

**Check 2: Server is Running**
```bash
curl https://amrikyy-agent.onrender.com/api/health
# Should return: {"status":"UP",...}
```

**Check 3: Check Logs**
- Go to Render dashboard
- Click on your service
- View "Logs" tab
- Look for Telegram bot initialization messages

### Common Errors

**Error: "Conflict: terminated by other getUpdates request"**
- Another instance of the bot is running
- Stop all other instances
- Redeploy on Render

**Error: "Unauthorized"**
- Token is invalid or revoked
- Get new token from @BotFather
- Update environment variable

**Error: "Can't parse entities"**
- Message formatting issue
- Check bot code for proper Markdown/HTML escaping

---

## 📞 Support

If you encounter issues:

1. Check Render logs first
2. Verify all environment variables are set
3. Test the health endpoint
4. Contact: Amrikyy@gmail.com

---

## 🎯 Next Steps

After deployment:

1. ✅ Add `TELEGRAM_BOT_TOKEN` to Render.com
2. ✅ Wait for auto-redeploy
3. ✅ Test bot on Telegram
4. ✅ Monitor logs for any errors
5. ✅ Share bot with users for testing

---

**Last Updated**: October 21, 2025  
**Status**: Ready for Deployment

---

<div align="center">

**🔒 Keep Your Token Secure!**

Never share your bot token publicly or commit it to git.

</div>
