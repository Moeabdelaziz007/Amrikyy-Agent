# 🤖 Amrikyy AI Agents Summary

**Date**: October 21, 2025  
**Project**: Amrikyy Travel Agent Platform  
**Format**: AIX (Artificial Intelligence eXchange) v1.0

---

## 📋 Overview

This document provides a complete summary of all AI agents created for the Amrikyy Travel Agent platform, using the **AIX Format Specification** for standardized agent definitions.

---

## 🎯 What is AIX Format?

**AIX (Artificial Intelligence eXchange)** is a standard file format for packaging and distributing AI agents, created by Mohamed H Abdelaziz.

### Key Benefits:
- ✅ **Standardized**: Consistent agent definitions across the platform
- ✅ **Portable**: Share agents between team members and systems
- ✅ **Secure**: Built-in checksums and signature support
- ✅ **Multi-Format**: Supports YAML, JSON, and TOML
- ✅ **Version Controlled**: Track agent changes in git
- ✅ **Self-Documenting**: All agent info in one file

**Learn More**: https://github.com/Moeabdelaziz007/aix-format

---

## 🤖 Available Agents

### **1. Maya Travel Planner** 🌍
**File**: `agents/maya-travel-planner.aix`  
**ID**: `agent_maya_travel_001`  
**Type**: Travel Planning Assistant

**Purpose**: Complete travel planning with personalized recommendations

**Key Features**:
- ✅ Destination search and recommendations
- ✅ Personalized itinerary generation
- ✅ Price comparison across platforms
- ✅ Multi-destination trip planning
- ✅ Budget optimization
- ✅ Local recommendations and tips
- ✅ Weather insights
- ✅ Visa requirements checking

**Languages**: English, Arabic  
**Model**: GPT-4 Turbo  
**Platform**: Web, Mobile

**Skills**:
- `destination_search` - Find perfect destinations
- `itinerary_generation` - Create day-by-day plans
- `price_comparison` - Compare booking platforms
- `multi_destination` - Plan multi-city trips
- `budget_optimization` - Fit trips to budget
- `local_recommendations` - Hidden gems and tips
- `weather_insights` - Weather forecasts
- `visa_requirements` - Travel restrictions

**Integrations**:
- Google Maps API
- Booking.com API
- Skyscanner API
- OpenWeather API
- Supabase (via MCP)

---

### **2. Telegram Bot** 📱
**File**: `agents/telegram-bot.aix`  
**ID**: `agent_telegram_bot_001`  
**Type**: Messaging Bot

**Purpose**: Quick travel bookings via Telegram

**Key Features**:
- ✅ Fast search and booking
- ✅ Price drop alerts
- ✅ Trip reminders
- ✅ Customer support
- ✅ Inline keyboards for quick actions
- ✅ Rich media (images, maps, cards)

**Languages**: English, Arabic  
**Model**: GPT-3.5 Turbo  
**Platform**: Telegram

**Skills**:
- `quick_search` - Fast destination search
- `booking_assistance` - Guide through booking
- `price_alerts` - Price drop notifications
- `trip_reminders` - Automated reminders
- `customer_support` - Handle inquiries

**Integrations**:
- Telegram Bot API
- Amrikyy Travel API
- Supabase (via MCP)

---

### **3. WhatsApp Bot** 💬
**File**: `agents/whatsapp-bot.aix`  
**ID**: `agent_whatsapp_bot_001`  
**Type**: Customer Service Bot

**Purpose**: Personalized customer service via WhatsApp

**Key Features**:
- ✅ Friendly customer service
- ✅ Booking management
- ✅ Payment assistance
- ✅ Trip updates and notifications
- ✅ Rich media support
- ✅ Interactive buttons and lists

**Languages**: English, Arabic  
**Model**: GPT-4 Turbo  
**Platform**: WhatsApp

**Skills**:
- `customer_service` - Handle support requests
- `booking_management` - Manage bookings
- `payment_assistance` - Payment guidance
- `trip_updates` - Send notifications

**Integrations**:
- WhatsApp Business API
- Amrikyy Travel API
- Supabase (via MCP)

---

## 📊 Agent Comparison

| Feature | Maya Travel Planner | Telegram Bot | WhatsApp Bot |
|---------|-------------------|--------------|--------------|
| **Platform** | Web/Mobile | Telegram | WhatsApp |
| **Model** | GPT-4 Turbo | GPT-3.5 Turbo | GPT-4 Turbo |
| **Response Time** | 1-2s | <2s | 2-5s |
| **Languages** | EN, AR | EN, AR | EN, AR |
| **Voice Support** | ✅ Yes | ❌ No | ✅ Yes |
| **Rich Media** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Price Comparison** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Booking** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Customer Service** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Memory** | 100 msgs | 50 msgs | 100 msgs |
| **Rate Limit** | 60/min | 30/min | 60/min |

---

## 🚀 Quick Start

### **1. Install AIX Tools**

```bash
# Clone AIX format repository
git clone https://github.com/Moeabdelaziz007/aix-format.git
cd aix-format
npm install
```

### **2. Validate Agents**

```bash
# Validate Maya Travel Planner
node bin/aix-validate.js ../Amrikyy-Agent/agents/maya-travel-planner.aix

# Validate Telegram Bot
node bin/aix-validate.js ../Amrikyy-Agent/agents/telegram-bot.aix

# Validate WhatsApp Bot
node bin/aix-validate.js ../Amrikyy-Agent/agents/whatsapp-bot.aix
```

### **3. Load Agents in Code**

```typescript
import { AIXParser } from '@amrikyy/aix-parser';
import { AgentLoader } from '@amrikyy/agent-loader';

// Initialize loader
const loader = new AgentLoader();

// Load agents
const mayaAgent = await loader.loadAgent('./agents/maya-travel-planner.aix');
const telegramBot = await loader.loadAgent('./agents/telegram-bot.aix');
const whatsappBot = await loader.loadAgent('./agents/whatsapp-bot.aix');

// Use agents
const response = await mayaAgent.process({
  message: 'I want to plan a trip to Paris',
  context: { userId: 'user123' },
});

console.log(response.message);
```

---

## 🔧 Agent Management

### **Creating New Agents**

```bash
# Copy template
cp agents/maya-travel-planner.aix agents/my-new-agent.aix

# Edit the file
nano agents/my-new-agent.aix

# Update meta section:
# - Change id to unique value
# - Update name and description
# - Modify persona and skills
# - Configure tools and memory

# Validate
node bin/aix-validate.js agents/my-new-agent.aix
```

### **Converting Formats**

```bash
# Convert to JSON
node bin/aix-convert.js agents/maya-travel-planner.aix agents/maya-travel-planner.json --format json

# Convert to TOML
node bin/aix-convert.js agents/maya-travel-planner.aix agents/maya-travel-planner.toml --format toml
```

### **Updating Agents**

```bash
# 1. Edit the AIX file
nano agents/maya-travel-planner.aix

# 2. Update the 'updated' timestamp in meta section
# 3. Recalculate checksum
node bin/aix-checksum.js agents/maya-travel-planner.aix

# 4. Validate
node bin/aix-validate.js agents/maya-travel-planner.aix --security

# 5. Commit to git
git add agents/maya-travel-planner.aix
git commit -m "Update Maya agent: add new skill"
```

---

## 📚 Documentation

### **Agent Documentation**
- [AI Agents Format & Architecture](./AI_AGENTS_FORMAT.md) - Complete agent format guide
- [All Repos Analysis](./ALL_REPOS_ANALYSIS.md) - Repository analysis and extraction plan

### **AIX Format Documentation**
- [AIX Specification](https://github.com/Moeabdelaziz007/aix-format/blob/main/docs/AIX_SPEC.md) - Complete technical spec
- [AIX Parser Documentation](https://github.com/Moeabdelaziz007/aix-format/blob/main/docs/AIX_PARSER_DOC.md) - Implementation guide
- [AIX Examples](https://github.com/Moeabdelaziz007/aix-format/tree/main/examples) - Sample AIX files

---

## 🔐 Security

### **Checksum Verification**

All AIX files include SHA-256 checksums to verify integrity:

```bash
# Verify checksum
node bin/aix-validate.js agents/maya-travel-planner.aix --security

# Recalculate checksum after changes
node bin/aix-checksum.js agents/maya-travel-planner.aix
```

### **Capability Restrictions**

Each agent has defined capabilities:

```yaml
security:
  capabilities:
    allowed_operations:
      - "read_destinations"
      - "write_trips"
      - "call_apis"
    
    restricted_domains:
      - "localhost"
      - "*.internal"
    
    max_api_calls_per_minute: 60
```

---

## 🎯 Best Practices

### **1. Agent Naming**
- Use descriptive IDs: `agent_maya_travel_001`
- Include version in filename: `maya-travel-planner-v1.0.aix`
- Use kebab-case for files: `telegram-bot.aix`

### **2. Version Control**
- Commit AIX files to git
- Update `updated` timestamp on changes
- Recalculate checksums after edits
- Tag releases: `git tag agent-maya-v1.0`

### **3. Documentation**
- Keep `description` field updated
- Document all skills and parameters
- List all API integrations
- Include usage examples

### **4. Security**
- Always validate checksums
- Use environment variables for secrets
- Define capability restrictions
- Set appropriate rate limits

### **5. Testing**
- Validate AIX files before deployment
- Test all skills and integrations
- Monitor performance metrics
- Collect user feedback

---

## 📞 Support

### **AIX Format**
- **Repository**: https://github.com/Moeabdelaziz007/aix-format
- **Issues**: https://github.com/Moeabdelaziz007/aix-format/issues
- **Email**: amrikyy@gmail.com

### **Amrikyy Platform**
- **Website**: https://amrikyy.ai
- **Documentation**: https://docs.amrikyy.ai
- **Support**: support@amrikyy.ai

---

## 🙏 Acknowledgments

- **AIX Format**: Created by Mohamed H Abdelaziz / AMRIKYY AI Solutions
- **Amrikyy Platform**: Built by the Amrikyy AI Team
- **Community**: Thanks to all contributors and early adopters

---

**Created**: October 21, 2025  
**Last Updated**: October 21, 2025  
**Version**: 1.0.0  
**Format**: AIX v1.0
