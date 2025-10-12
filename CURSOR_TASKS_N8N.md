# 📋 Cursor Tasks - n8n Workflow

**Priority:** 🟡 **Important**  
**Estimated Time:** 30 minutes  
**Files:** `n8n-workflows/predictive-intelligence.json`

---

## ✅ What's Already Done

- ✅ Complete workflow designed (13 nodes)
- ✅ Intent scoring algorithm (weighted 0-100)
- ✅ Pattern analysis (6 functions)
- ✅ Dual-path AI (GLM-4.6 vs GLM-Flash)
- ✅ Multi-channel outreach (Telegram + Email)
- ✅ Database integration (Supabase queries)

---

## 📋 Tasks to Execute in Gitpod

### **Task 1: Set Up n8n** (10 min)

```bash
# Option A: n8n Cloud (recommended for beginners)
# 1. Go to: https://n8n.io/
# 2. Sign up for free account
# 3. Create new workflow: "Amrikyy Predictive Intelligence"

# Option B: Self-hosted (for advanced users)
npx n8n
# Access: http://localhost:5678

# 4. Import workflow
# In n8n: Workflows > Import from File
# Upload: n8n-workflows/predictive-intelligence.json
```

---

### **Task 2: Configure Credentials** (5 min)

```bash
# In n8n Dashboard > Credentials:

# 1. Add Supabase Postgres
Name: Supabase
Type: Postgres
Host: db.YOUR_PROJECT_ID.supabase.co
Database: postgres
User: postgres
Password: YOUR_DB_PASSWORD
SSL: Enabled

# 2. Add Z.ai API
Name: Z.AI API
Type: Header Auth
Header Name: Authorization
Header Value: Bearer YOUR_ZAI_API_KEY

# 3. Add Telegram Bot
Name: Telegram Bot
Type: Telegram
Access Token: YOUR_BOT_TOKEN

# 4. Add SMTP (for emails)
Name: SMTP
Type: Email (SMTP)
Host: smtp.gmail.com (or your provider)
User: your-email@gmail.com
Password: YOUR_APP_PASSWORD
```

---

### **Task 3: Test Workflow** (10 min)

```bash
# 1. In n8n, open workflow
# 2. Click "Execute Workflow" button (top right)
# 3. Check execution log:

Expected flow:
✅ Daily trigger activated
✅ Fetched 100 active users
✅ Analyzed behavior for each
✅ Calculated intent scores
✅ Split: 40% high intent, 60% low intent
✅ Generated predictions (GLM-4.6)
✅ Generated engagement boosts (GLM-Flash)
✅ Saved to database
✅ Sent Telegram messages
✅ Sent emails
✅ Updated metrics

# 4. Check database
SELECT * FROM trip_predictions ORDER BY predicted_at DESC LIMIT 10;
# Expected: New predictions created

# 5. Check Telegram
# Expected: Message received with interactive buttons
```

---

### **Task 4: Add Error Handling** (15 min)

**Fix JSON parsing in "استخراج التنبؤ" node:**

```javascript
// Replace existing code with:
try {
  const response = $input.first().json;
  
  // Validate response
  if (!response?.choices?.[0]?.message?.content) {
    throw new Error('Invalid GLM response structure');
  }
  
  const aiMessage = response.choices[0].message.content;
  const jsonText = aiMessage.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const prediction = JSON.parse(jsonText);
  
  // Validate required fields
  const required = ['destination', 'check_in', 'check_out', 'budget_min', 'budget_max'];
  for (const field of required) {
    if (!prediction[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Validate dates
  const checkIn = new Date(prediction.check_in);
  const checkOut = new Date(prediction.check_out);
  const today = new Date();
  
  if (checkIn < today) {
    throw new Error('Check-in date is in the past');
  }
  
  if (checkOut <= checkIn) {
    throw new Error('Check-out must be after check-in');
  }
  
  // Validate budget
  if (prediction.budget_min <= 0 || prediction.budget_max <= 0) {
    throw new Error('Budget must be positive');
  }
  
  // Validate confidence
  if (prediction.confidence < 0.3) {
    throw new Error('Confidence too low - skip prediction');
  }
  
  // Add metadata
  prediction.user_id = $node["محلل الأنماط"].json.userId;
  prediction.user_email = $node["محلل الأنماط"].json.userEmail;
  prediction.user_telegram_id = $node["محلل الأنماط"].json.user_telegram_id;
  prediction.predicted_at = new Date().toISOString();
  prediction.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  prediction.id = require('crypto').randomUUID();
  
  return [prediction];
  
} catch (error) {
  // Log error and skip user
  console.error('Prediction failed:', error.message);
  
  return [{
    error: true,
    user_id: $node["محلل الأنماط"].json.userId,
    error_message: error.message,
    raw_response: $input.first().json,
    action: 'manual_review_needed'
  }];
}
```

---

### **Task 5: Add Batching** (Optional)

```bash
# In n8n workflow:
# After "جلب المستخدمين النشطين" node
# Add "Split In Batches" node:

Batch Size: 10 users
Options:
  ✅ Reset: No
  ✅ Wait between batches: 2000ms (2 seconds)

# This prevents API rate limiting
# Processes 10 users every 2 seconds
# 100 users = 20 seconds total (acceptable)
```

---

### **Task 6: Enable Workflow** (1 min)

```bash
# In n8n:
# 1. Click workflow name > Settings
# 2. Enable "Active"
# 3. Set timezone: "Africa/Cairo"
# 4. Save

# Workflow will now run daily at 8 AM automatically!
```

---

## ✅ Success Criteria

- [ ] n8n account created
- [ ] Credentials configured (Supabase, Z.ai, Telegram, SMTP)
- [ ] Workflow imported successfully
- [ ] Test execution completed (100 users processed)
- [ ] Predictions saved to database
- [ ] Telegram messages sent
- [ ] Error handling added
- [ ] Workflow activated (runs daily at 8 AM)

---

## 📊 Expected Results

After first run:
- ~40 predictions generated (high intent users)
- ~60 engagement boosts sent (low intent users)
- All saved to `trip_predictions` table
- Telegram messages delivered
- Metrics updated in `daily_metrics`

---

## 🚨 Troubleshooting

**Issue:** "Invalid credentials"  
**Fix:** Re-check API keys in n8n Credentials

**Issue:** "Database connection failed"  
**Fix:** Check Supabase DB password, enable SSL

**Issue:** "GLM API timeout"  
**Fix:** Add timeout: 30s in HTTP Request node settings

**Issue:** "JSON parse error"  
**Fix:** Task 4 error handling code fixes this

---

**Status:** Ready to deploy! 🚀

