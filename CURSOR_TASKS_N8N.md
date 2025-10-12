# 🔧 n8n Workflow - Critical Fixes & Enhancements

## 🔴 Priority 1: Critical Fixes (MUST DO)

### Task 1.1: Add Error Handling to JSON Parsing

**Location:** Node "استخراج التنبؤ"

**Current Code (Risky):**
```javascript
const response = $input.first().json;
const aiMessage = response.choices[0].message.content;
let jsonText = aiMessage.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

try {
  const prediction = JSON.parse(jsonText);
  // ...
} catch (error) {
  throw new Error(`فشل تحليل JSON من GLM: ${error.message}\nالاستجابة: ${aiMessage}`);
}
```

**Fixed Code:**
```javascript
// ==========================================
// استخراج التنبؤ مع معالجة أخطاء شاملة
// ==========================================

const response = $input.first().json;

// Validate response structure
if (!response || !response.choices || !response.choices[0]) {
  return [{
    error: 'Invalid API response structure',
    user_id: $node["محلل الأنماط"].json.userId,
    action: 'retry_later'
  }];
}

const aiMessage = response.choices[0].message.content;

// Clean JSON text
let jsonText = aiMessage
  .replace(/```json\n?/g, '')
  .replace(/```\n?/g, '')
  .trim();

try {
  const prediction = JSON.parse(jsonText);
  
  // ==========================================
  // Validation: Required Fields
  // ==========================================
  const requiredFields = ['destination', 'check_in', 'check_out', 'budget_min', 'budget_max', 'confidence'];
  const missingFields = requiredFields.filter(field => !prediction[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // ==========================================
  // Validation: Date Logic
  // ==========================================
  const checkIn = new Date(prediction.check_in);
  const checkOut = new Date(prediction.check_out);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    throw new Error('Invalid date format');
  }
  
  if (checkIn < today) {
    // Auto-fix: Move to next year
    checkIn.setFullYear(checkIn.getFullYear() + 1);
    checkOut.setFullYear(checkOut.getFullYear() + 1);
    prediction.check_in = checkIn.toISOString().split('T')[0];
    prediction.check_out = checkOut.toISOString().split('T')[0];
  }
  
  if (checkOut <= checkIn) {
    throw new Error('Check-out must be after check-in');
  }
  
  const nights = Math.floor((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  if (nights > 30) {
    throw new Error('Trip duration too long (max 30 nights)');
  }
  
  // ==========================================
  // Validation: Budget Logic
  // ==========================================
  if (prediction.budget_min <= 0 || prediction.budget_max <= 0) {
    throw new Error('Budget must be positive');
  }
  
  if (prediction.budget_min > prediction.budget_max) {
    // Auto-fix: Swap values
    [prediction.budget_min, prediction.budget_max] = [prediction.budget_max, prediction.budget_min];
  }
  
  if (prediction.budget_max > 10000) {
    throw new Error('Budget too high (max $10,000/night)');
  }
  
  // ==========================================
  // Validation: Confidence Score
  // ==========================================
  if (prediction.confidence < 0 || prediction.confidence > 1) {
    prediction.confidence = Math.max(0, Math.min(1, prediction.confidence));
  }
  
  if (prediction.confidence < 0.3) {
    return [{
      error: 'Confidence too low',
      confidence: prediction.confidence,
      user_id: $node["محلل الأنماط"].json.userId,
      action: 'skip_prediction'
    }];
  }
  
  // ==========================================
  // Add Metadata
  // ==========================================
  prediction.user_id = $node["محلل الأنماط"].json.userId;
  prediction.user_email = $node["محلل الأنماط"].json.userEmail;
  prediction.predicted_at = new Date().toISOString();
  prediction.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  prediction.nights = nights;
  
  // Ensure reasoning is array
  if (!Array.isArray(prediction.reasoning)) {
    prediction.reasoning = [prediction.reasoning || 'تحليل تلقائي'];
  }
  
  // Ensure trigger_phrase exists
  if (!prediction.trigger_phrase) {
    prediction.trigger_phrase = `🎯 وجدت رحلة مثالية لك إلى ${prediction.destination}!`;
  }
  
  return [prediction];
  
} catch (error) {
  // ==========================================
  // Error Handling: Log & Return Fallback
  // ==========================================
  console.error('Prediction extraction failed:', {
    error: error.message,
    aiMessage: aiMessage.substring(0, 200),
    userId: $node["محلل الأنماط"].json.userId
  });
  
  return [{
    error: error.message,
    raw_response: aiMessage.substring(0, 500),
    user_id: $node["محلل الأنماط"].json.userId,
    user_email: $node["محلل الأنماط"].json.userEmail,
    action: 'manual_review_needed',
    timestamp: new Date().toISOString()
  }];
}
```

**Action:** Replace the code in "استخراج التنبؤ" node

---

### Task 1.2: Add Rate Limiting

**Location:** Node "جلب المستخدمين النشطين"

**Current Query (Risky):**
```sql
SELECT u.id, u.email, u.created_at,
       tp.persona_types, tp.travel_style, tp.budget_tier,
       tp.booking_patterns
FROM users u
LEFT JOIN traveler_personas tp ON u.id = tp.user_id
WHERE u.last_login > NOW() - INTERVAL '30 days'
  AND NOT EXISTS (
    SELECT 1 FROM trip_predictions pred
    WHERE pred.user_id = u.id
      AND pred.prediction_status = 'نشط'
  )
```

**Fixed Query:**
```sql
-- ==========================================
-- جلب المستخدمين مع Rate Limiting
-- ==========================================

SELECT u.id, u.email, u.created_at, u.telegram_id,
       tp.persona_types, tp.travel_style, tp.budget_tier,
       tp.booking_patterns
FROM users u
LEFT JOIN traveler_personas tp ON u.id = tp.user_id
WHERE u.last_login > NOW() - INTERVAL '30 days'
  AND u.account_status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM trip_predictions pred
    WHERE pred.user_id = u.id
      AND pred.prediction_status = 'نشط'
      AND pred.predicted_at > NOW() - INTERVAL '7 days' -- Don't predict again within 7 days
  )
ORDER BY u.last_login DESC
LIMIT 100; -- Process max 100 users per run (rate limiting)
```

**Alternative: Add "Split In Batches" Node**

**After "جلب المستخدمين النشطين", add new node:**

**Node Name:** "معالجة بالدفعات"  
**Type:** Split In Batches  
**Settings:**
- Batch Size: 10
- Options:
  - Reset: true

**Then add "Wait" node after each batch:**

**Node Name:** "انتظار بين الدفعات"  
**Type:** Wait  
**Settings:**
- Amount: 2
- Unit: Seconds

**Action:** Add these nodes to prevent API rate limit

---

### Task 1.3: Add Prediction Validation Before Saving

**Location:** Add new node before "حفظ في قاعدة البيانات"

**Node Name:** "التحقق النهائي من التنبؤ"  
**Type:** Code  
**Code:**

```javascript
// ==========================================
// التحقق النهائي قبل الحفظ
// ==========================================

const prediction = $input.first().json;

// Check if this is an error object
if (prediction.error || prediction.action === 'manual_review_needed') {
  // Log error to separate table
  // Don't save to trip_predictions
  return [];
}

// Final sanity checks
const issues = [];

// Check destination is not empty
if (!prediction.destination || prediction.destination.trim().length === 0) {
  issues.push('Empty destination');
}

// Check dates are in future
const checkIn = new Date(prediction.check_in);
const today = new Date();
today.setHours(0, 0, 0, 0);

if (checkIn < today) {
  issues.push('Check-in date is in the past');
}

// Check budget is reasonable
if (prediction.budget_min < 10 || prediction.budget_max > 5000) {
  issues.push('Budget out of reasonable range');
}

// Check confidence is sufficient
if (prediction.confidence < 0.4) {
  issues.push('Confidence too low');
}

// If any issues, don't save
if (issues.length > 0) {
  console.error('Prediction validation failed:', {
    user_id: prediction.user_id,
    issues: issues
  });
  return [];
}

// All good, proceed to save
return [prediction];
```

**Action:** Add this node before database save

---

### Task 1.4: Add Feedback Loop (Webhook Handler)

**Create New Workflow:** "Telegram Callback Handler"

**Trigger Node:**
- **Type:** Webhook
- **Path:** `telegram-callback`
- **Method:** POST

**Code Node:** "معالجة رد المستخدم"

```javascript
// ==========================================
// معالجة رد المستخدم على التنبؤ
// ==========================================

const body = $input.first().json.body;
const callbackData = body.callback_query?.data;
const userId = body.callback_query?.from?.id;

if (!callbackData) {
  return [{ error: 'No callback data' }];
}

// Parse callback data
// Format: "action_predictionId"
// Examples: "start_search_abc123", "dismiss_abc123", "modify_prediction_abc123"

const parts = callbackData.split('_');
const action = parts[0];
const predictionId = parts[parts.length - 1];

const result = {
  user_telegram_id: userId,
  prediction_id: predictionId,
  action: action,
  timestamp: new Date().toISOString()
};

// Route based on action
if (action === 'start') {
  result.next_step = 'update_prediction_status';
  result.new_status = 'تم_الحجز';
  result.send_message = 'رائع! دعني أبحث عن أفضل الفنادق...';
  
} else if (action === 'modify') {
  result.next_step = 'ask_what_to_modify';
  result.send_message = 'ما الذي تريد تعديله؟\n1️⃣ الوجهة\n2️⃣ التواريخ\n3️⃣ الميزانية';
  
} else if (action === 'dismiss') {
  result.next_step = 'update_prediction_status';
  result.new_status = 'تم_التجاهل';
  result.send_message = 'حسناً، سأقترح عليك رحلة أخرى لاحقاً 😊';
}

return [result];
```

**Database Update Node:**

```sql
UPDATE trip_predictions
SET 
  prediction_status = '{{$json.new_status}}',
  validated_at = NOW()
WHERE id = '{{$json.prediction_id}}';
```

**Telegram Response Node:**

Send message: `{{$json.send_message}}`

**Action:** Create this new workflow

---

## 🟡 Priority 2: Enhancements

### Task 2.1: Add A/B Testing

**Location:** Node "استخراج التنبؤ"

**Add after metadata:**

```javascript
// ==========================================
// A/B Testing: Trigger Phrase Variants
// ==========================================

const variant = Math.random() < 0.5 ? 'A' : 'B';

const triggerPhrases = {
  A: {
    excited: `🎉 اكتشفت رحلة مثالية لك إلى ${prediction.destination}!`,
    subtle: `💡 لاحظت أنك قد تحتاج رحلة إلى ${prediction.destination} قريباً`,
    urgent: `⚡ عرض محدود! رحلة رائعة إلى ${prediction.destination} بانتظارك`
  },
  B: {
    excited: `✨ ${prediction.destination} تنتظرك! وجدت عرضاً رائعاً`,
    subtle: `🤔 هل فكرت في زيارة ${prediction.destination}؟ لدي اقتراح لك`,
    urgent: `🔥 الأسعار ممتازة الآن في ${prediction.destination}!`
  }
};

// Choose style based on emotional state
const emotionalState = $node["محلل الأنماط"].json.patterns.currentEmotionalTrend;
let style = 'excited';

if (emotionalState === 'متوتر' || emotionalState === 'قلق_ميزانية') {
  style = 'subtle';
} else if (emotionalState === 'متحمس') {
  style = 'excited';
}

prediction.variant = variant;
prediction.trigger_phrase = triggerPhrases[variant][style];
```

**Add Tracking:**

```sql
-- In "حفظ في قاعدة البيانات" node, add column:
INSERT INTO trip_predictions (..., ab_test_variant)
VALUES (..., '{{$json.variant}}')
```

**Action:** Add A/B testing logic

---

### Task 2.2: Add Confidence Tiers

**Location:** After "استخراج التنبؤ"

**Add new "IF" node:** "تصنيف حسب الثقة"

**Conditions:**
- **Output 1 (High Confidence):** `{{$json.confidence >= 0.8}}`
- **Output 2 (Medium Confidence):** `{{$json.confidence >= 0.6 && $json.confidence < 0.8}}`
- **Output 3 (Low Confidence):** `{{$json.confidence < 0.6}}`

**Different Messages:**

**High Confidence (0.8+):**
```
🎯 متأكد 95% أنك ستحب هذه الرحلة!

📍 ${destination}
📅 ${dates}
💰 ${budget}

[✅ احجز الآن!]
```

**Medium Confidence (0.6-0.8):**
```
💡 لدي اقتراح قد يعجبك

📍 ${destination}
📅 ${dates}
💰 ${budget}

هل هذا يناسبك؟
[✅ نعم] [📝 عدّل]
```

**Low Confidence (< 0.6):**
```
🤔 أحتاج معرفة المزيد عنك

ما رأيك في ${destination}؟
أو أخبرني بتفضيلاتك وسأقترح الأفضل

[💬 أخبرني المزيد]
```

**Action:** Add confidence-based routing

---

### Task 2.3: Add Price Drop Alerts

**Create New Workflow:** "مراقبة الأسعار"

**Trigger:** Schedule (every 6 hours)

**Query:**
```sql
SELECT 
  tp.id,
  tp.user_id,
  tp.predicted_destination,
  tp.predicted_dates,
  tp.predicted_budget_range,
  u.telegram_id,
  u.email
FROM trip_predictions tp
JOIN users u ON tp.user_id = u.id
WHERE tp.prediction_status = 'نشط'
  AND tp.predicted_at > NOW() - INTERVAL '30 days'
  AND (tp.predicted_dates->>'check_in')::DATE > NOW()
```

**Price Check Node:**
```javascript
// Call hotel API to check current prices
const destination = $json.predicted_destination;
const checkIn = $json.predicted_dates.check_in;
const checkOut = $json.predicted_dates.check_out;

// Simulate price check (replace with real API)
const currentPrice = Math.floor(Math.random() * 200) + 50;
const predictedPrice = ($json.predicted_budget_range.min + $json.predicted_budget_range.max) / 2;

const priceDrop = ((predictedPrice - currentPrice) / predictedPrice) * 100;

if (priceDrop >= 15) {
  return [{
    ...$json,
    current_price: currentPrice,
    predicted_price: predictedPrice,
    price_drop_percent: priceDrop.toFixed(0),
    alert: true
  }];
}

return [];
```

**Send Alert:**
```
🔥 انخفاض السعر!

الوجهة: ${destination}
السعر الآن: $${current_price} (كان $${predicted_price})
وفّرت: ${price_drop_percent}%!

[🚀 احجز الآن قبل ارتفاع السعر!]
```

**Action:** Create price monitoring workflow

---

## 📝 Summary for Cursor:

**Fixes to Apply:**

1. ✅ **Error Handling** - Replace code in "استخراج التنبؤ" node
2. ✅ **Rate Limiting** - Update query + add Split In Batches
3. ✅ **Prediction Validation** - Add validation node before save
4. ✅ **Feedback Loop** - Create new webhook workflow
5. ✅ **A/B Testing** - Add variant logic
6. ✅ **Confidence Tiers** - Add routing based on confidence
7. ✅ **Price Alerts** - Create price monitoring workflow

**Expected Results:**
- ✅ No crashes from invalid JSON
- ✅ No API rate limit errors
- ✅ Only valid predictions saved
- ✅ User feedback tracked
- ✅ A/B test data collected
- ✅ Better UX based on confidence
- ✅ Proactive price alerts

**Testing Checklist:**
- [ ] Test with invalid GLM response
- [ ] Test with 1000+ users (rate limiting)
- [ ] Test with past dates (validation)
- [ ] Test user clicking buttons (feedback)
- [ ] Test A/B variants (tracking)
- [ ] Test confidence tiers (routing)
- [ ] Test price drop detection

---

**Ready for Cursor to implement?** ✅
