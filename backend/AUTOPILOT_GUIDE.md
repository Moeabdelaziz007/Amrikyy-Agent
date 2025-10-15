# 🤖 AMRIKYY AUTOPILOT SYSTEM - نظام الطيار الآلي

Complete autonomous bot management system with AI-powered features!

---

## 🎯 What is Autopilot?

The Autopilot System transforms your Telegram bot into an **intelligent, self-managing AI assistant** that:

- ✅ **Auto-replies** to user messages with context-aware responses
- ✅ **Learns patterns** from user behavior and preferences
- ✅ **Self-heals** from errors and recovers automatically
- ✅ **Analyzes sentiment** and escalates negative interactions
- ✅ **Schedules tasks** (daily reports, cleanup, health checks)
- ✅ **Monitors performance** with real-time analytics
- ✅ **Coordinates agents** (Claude, Gemini, Kilo, Cline)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install node-cron
```

### 2. Configure Environment

Add to `backend/.env`:

```bash
# Autopilot Configuration
AUTOPILOT_ENABLED=true
ADMIN_CHAT_ID=your_telegram_chat_id  # For alerts

# Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token
AI_STRATEGY=gemini  # or 'zai' or 'noai'

# Logging
LOG_LEVEL=info
LOG_TO_CONSOLE=true
LOG_TO_FILE=true
```

### 3. Run Autopilot Bot

```bash
# Normal mode
node run-autopilot-bot.js

# Or with PM2 for production
pm2 start run-autopilot-bot.js --name amrikyy-autopilot
```

---

## 🔧 Features

### 1. **Auto-Reply System** 🤖

Automatically responds to user messages with:
- Quick replies for common questions
- AI-generated responses for complex queries
- Context-aware conversations
- Multi-language support (Arabic & English)

**Example:**
```
User: "Hello"
Bot: "👋 Hello! Welcome to Amrikyy Travel! How can I help you plan your next adventure?"

User: "I need a flight to Dubai"
Bot: [AI-generated personalized response with options]
```

### 2. **Pattern Learning** 🧠

Learns from user interactions:
- Message patterns and preferences
- Active hours and time zones
- Preferred language
- Favorite topics and destinations
- Communication style

**Benefits:**
- Personalized responses
- Better user experience
- Improved conversion rates
- Smarter recommendations

### 3. **Self-Healing** 🏥

Automatically recovers from:
- Polling errors
- API failures
- Memory leaks
- High CPU usage
- Network issues

**Actions:**
- Restarts polling automatically
- Cleans up memory
- Logs errors for analysis
- Notifies admin of critical issues

### 4. **Sentiment Analysis** 😊😐😢

Analyzes user emotions and:
- Detects negative sentiment
- Escalates to human agents when needed
- Tracks user satisfaction
- Improves response quality

**Escalation triggers:**
- Negative score < -0.7
- Angry language detected
- Repeated complaints
- User frustration indicators

### 5. **Scheduled Tasks** ⏰

Automatic daily operations:

**Daily (9 AM):**
- Daily summary report
- User statistics
- Performance metrics

**Every 6 Hours:**
- Analytics report
- Memory usage check
- Error summary

**Hourly:**
- Health check
- System status
- Agent availability

**Midnight:**
- Cleanup old data
- Archive conversations
- Optimize database

### 6. **Real-time Analytics** 📊

Tracks and reports:
- Messages processed
- Auto-replies sent
- Errors handled
- Patterns learned
- Active users
- Memory usage
- Response times
- Conversion rates

### 7. **Multi-Agent Coordination** 🤝

Integrates with:

**🔬 Claude Researcher**
- Strategic analysis
- Complex problem solving
- Deep research

**⚡ Gemini Implementer**
- Rapid responses
- Code generation
- Quick decisions

**🔍 Kilo Analyzer**
- Quality control
- Performance optimization
- Security checks

**🤖 Cline Autonomous**
- Multi-step automation
- Background tasks
- Scheduled operations

---

## 📋 Bot Commands

### User Commands

```bash
/start          - Start conversation
/help           - Get help menu
/search         - Search destinations
/book           - Book travel
/support        - Contact support
```

### Admin Commands

```bash
/autopilot_stats    - View autopilot statistics
/autopilot_health   - Check system health
/users_count        - Count active users
/broadcast          - Send message to all users
```

---

## ⚙️ Configuration Options

### Autopilot Config

```javascript
{
  autoReply: true,              // Enable auto-replies
  learningEnabled: true,        // Enable pattern learning
  analyticsEnabled: true,       // Enable analytics
  selfHealingEnabled: true,     // Enable self-healing
  maxContextLength: 10,         // Max conversation history
  sentimentThreshold: -0.7,     // Escalation threshold
  cleanupInterval: 86400000,    // 24 hours
  healthCheckInterval: 3600000, // 1 hour
}
```

### Update Config Dynamically

```javascript
// In your code
autopilot.updateConfig({
  autoReply: false,  // Disable auto-replies temporarily
  learningEnabled: true,
});
```

---

## 📊 Monitoring & Analytics

### View Statistics

```bash
# In Telegram, send to your bot:
/autopilot_stats
```

**Response:**
```
📊 Autopilot Statistics

⏱️ Uptime: 245 minutes
📨 Messages: 1,234
🤖 Auto-replies: 856
🛡️ Errors handled: 12
🧠 Patterns learned: 145
👥 Active users: 89
🟢 Status: Active
```

### Health Check

```bash
/autopilot_health
```

**Response:**
```
🏥 Autopilot Health Check

Status: healthy
Autopilot: ✅ Active

Agents Status:
• Claude Researcher: ✅
• Gemini Implementer: ✅
• Kilo Analyzer: ✅
• Cline Autonomous: ✅
```

### Admin Dashboard

Monitor in real-time:
- Message flow
- Response times
- Error rates
- User engagement
- Agent performance

---

## 🔍 How It Works

### 1. Message Flow

```
User Message
     ↓
[Autopilot Engine]
     ↓
   ├─→ Update Context
   ├─→ Learn Patterns
   ├─→ Analyze Sentiment
   ├─→ Check Auto-Reply
   │      ↓
   │   [Quick Reply?]
   │      ↓ No
   │   [AI Strategy]
   │      ↓
   │   Generate Response
   │      ↓
   └─→ Send to User
        ↓
    Log Analytics
```

### 2. Self-Healing Flow

```
Error Detected
     ↓
[Identify Error Type]
     ↓
   ├─→ Polling Error → Restart Polling
   ├─→ Memory Leak → Cleanup Memory
   ├─→ API Failure → Retry with Backoff
   └─→ Unknown → Log & Continue
        ↓
    Monitor Recovery
        ↓
    Report to Admin
```

### 3. Learning Flow

```
User Interaction
     ↓
[Extract Patterns]
     ↓
   ├─→ Time of Day
   ├─→ Message Length
   ├─→ Language
   ├─→ Topics
   └─→ Sentiment
        ↓
   Store in Memory
        ↓
   Update User Profile
        ↓
   Use for Next Response
```

---

## 🛠️ Advanced Features

### 1. Custom Quick Replies

Add your own quick replies in `AutopilotEngine.js`:

```javascript
const quickReplies = {
  'book flight|رحلة طيران': 
    '✈️ Let me help you book a flight! Where would you like to go?',
  'cheap deals|عروض رخيصة': 
    '💰 Here are our best deals this week...',
};
```

### 2. Custom Sentiment Keywords

```javascript
const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'سيء', 'فظيع'];
const positiveWords = ['good', 'great', 'awesome', 'love', 'جيد', 'رائع'];
```

### 3. Custom Scheduled Tasks

```javascript
// Add in startScheduledTasks()
this.scheduledJobs.push(
  cron.schedule('0 12 * * *', async () => {
    await this.sendLunchSpecials();
  })
);
```

---

## 🎯 Best Practices

### 1. **Start with Learning Mode**
- Enable pattern learning initially
- Let autopilot observe for 24-48 hours
- Review learned patterns
- Fine-tune responses

### 2. **Monitor Performance**
- Check stats every 6 hours
- Review escalations daily
- Optimize slow responses
- Update quick replies

### 3. **Set Clear Escalation Rules**
- Define sentiment thresholds
- Configure admin alerts
- Train team on handoffs
- Document common issues

### 4. **Regular Maintenance**
- Review logs weekly
- Update AI strategies
- Clean old data
- Optimize memory

### 5. **User Privacy**
- Don't store sensitive data
- Clean contexts regularly
- Anonymize analytics
- Follow GDPR/privacy laws

---

## 🚨 Troubleshooting

### Issue: Bot Not Auto-Replying

**Solutions:**
1. Check `AUTOPILOT_ENABLED=true` in `.env`
2. Verify AI strategy is working
3. Check bot logs for errors
4. Restart autopilot

```bash
# Check logs
tail -f backend/logs/info.log

# Restart
pm2 restart amrikyy-autopilot
```

### Issue: High Memory Usage

**Solutions:**
1. Reduce `maxContextLength`
2. Increase cleanup frequency
3. Check for memory leaks
4. Restart bot

```bash
# Check memory
/autopilot_stats

# Force cleanup
autopilot.cleanup()
```

### Issue: Sentiment Analysis Not Working

**Solutions:**
1. Add more sentiment keywords
2. Adjust threshold
3. Test with known phrases
4. Review language detection

---

## 📈 Performance Optimization

### 1. **Reduce API Calls**
- Cache frequent queries
- Use quick replies
- Batch similar requests

### 2. **Optimize Memory**
- Limit context history
- Clean old patterns
- Use efficient data structures

### 3. **Improve Response Time**
- Pre-generate common responses
- Use async operations
- Implement request queuing

### 4. **Scale Horizontally**
- Use PM2 cluster mode
- Load balance across servers
- Distribute by user regions

---

## 🔐 Security

### Best Practices:

1. ✅ **Never store passwords** in context
2. ✅ **Sanitize user input** before processing
3. ✅ **Rate limit** API calls
4. ✅ **Encrypt** sensitive data
5. ✅ **Monitor** for abuse
6. ✅ **Log** security events
7. ✅ **Update** dependencies regularly

---

## 📚 Resources

- **Telegram Bot API:** https://core.telegram.org/bots/api
- **node-cron Docs:** https://github.com/node-cron/node-cron
- **PM2 Documentation:** https://pm2.keymetrics.io/

---

## 🎉 Success Metrics

Track these KPIs:

- **Response Rate:** % of messages auto-replied
- **Response Time:** Average reply speed
- **User Satisfaction:** Sentiment scores
- **Error Rate:** Errors per 1000 messages
- **Learning Rate:** Patterns learned per day
- **Escalation Rate:** % requiring human intervention
- **Uptime:** System availability %

**Target Metrics:**
- Response Rate: >80%
- Response Time: <2 seconds
- User Satisfaction: >70% positive
- Error Rate: <1%
- Uptime: >99.9%

---

**Created for Amrikyy Travel Agent - The Future of Autonomous Travel Bots! 🤖✈️**

*Last Updated: October 2025*

