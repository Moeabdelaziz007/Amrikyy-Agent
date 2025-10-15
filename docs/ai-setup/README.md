# AI Setup Documentation - Complete Guide

**Version:** 1.0  
**Last Updated:** October 15, 2025  
**Status:** 🟢 Active  
**Purpose:** Central hub for all AI agent configurations

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Available Configurations](#available-configurations)
4. [Setup Guides](#setup-guides)
5. [Model Options](#model-options)
6. [Cost Comparison](#cost-comparison)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This directory contains complete configurations for setting up AI coding assistants with Continue/Cline. Choose from:

- **Free Models** - $0/month, 100% local, complete privacy
- **Paid Models** - Best quality, hosted, fast
- **Hybrid** - Mix of free and paid for optimal balance

**All configurations include:**
- ✅ Ready-to-use JSON configs
- ✅ Comprehensive setup guides
- ✅ Troubleshooting tips
- ✅ Performance optimization
- ✅ Quick reference cards

---

## 🚀 Quick Start

### Option 1: Free Models (Recommended for Privacy)

**Cost:** $0/month  
**Privacy:** 100% local  
**Setup Time:** 5 minutes

```bash
# Install and configure
bash docs/ai-setup/free-models/install-free-models.sh

# Or manual
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen2.5-coder:1.5b
ollama pull qwen2.5-coder:7b
cp docs/ai-setup/free-models/continue-free-config.json ~/.continue/config.json
```

**Guide:** [free-models/FREE_MODELS_SETUP.md](free-models/FREE_MODELS_SETUP.md)

---

### Option 2: Paid Models (Best Quality)

**Cost:** ~$20-50/month  
**Quality:** Excellent  
**Setup Time:** 2 minutes

```bash
# Add API keys to .env
echo "ANTHROPIC_API_KEY=your_key" >> .env
echo "MISTRAL_API_KEY=your_key" >> .env

# Copy config
cp docs/ai-setup/autocomplete-models/continue-autocomplete-config.json ~/.continue/config.json
```

**Guides:**
- [autocomplete-models/AUTOCOMPLETE_MODELS_GUIDE.md](autocomplete-models/AUTOCOMPLETE_MODELS_GUIDE.md)
- [apply-models/APPLY_MODELS_GUIDE.md](apply-models/APPLY_MODELS_GUIDE.md)

---

### Option 3: Hybrid (Best of Both)

**Cost:** ~$10-20/month  
**Balance:** Quality + Privacy  
**Setup Time:** 10 minutes

```bash
# Install Ollama for local models
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen2.5-coder:1.5b

# Add API keys for hosted models
echo "ANTHROPIC_API_KEY=your_key" >> .env

# Use hybrid config (create custom)
```

---

## 📁 Available Configurations

### 1. Agent System Messages

**Location:** `agent-system-messages/`

**What it is:** The "brain" of your AI agent - defines personality, reasoning, and behavior.

**Files:**
- `DEFAULT_AGENT_SYSTEM_MESSAGE.md` - Complete Cursero persona (600+ lines)
- `continue-system-message.json` - JSON config for Continue
- `SETUP_GUIDE.md` - How to configure

**Features:**
- Cursero identity (DNA Score 99.2/100)
- 7 reasoning strategies
- 6 thinking modes
- 7-phase development process
- Adaptive learning system
- Proactive monitoring

**Use when:** Setting up any AI agent (required)

---

### 2. Autocomplete Models

**Location:** `autocomplete-models/`

**What it is:** Real-time code suggestions as you type.

**Files:**
- `AUTOCOMPLETE_MODELS_GUIDE.md` - Complete guide (400+ lines)
- `continue-autocomplete-config.json` - Ready-to-use config
- `QUICK_START.md` - 5-minute setup

**Models:**
- **Codestral** (Mistral) - Best quality, paid
- **Mercury Coder** (Inception) - Next Edit prediction, paid
- **Qwen 1.5B** (Ollama) - Fast local, free
- **Qwen 7B** (Ollama) - Quality local, free

**Use when:** You want intelligent code completion

---

### 3. Apply Models

**Location:** `apply-models/`

**What it is:** Precise code diffs for applying changes.

**Files:**
- `APPLY_MODELS_GUIDE.md` - Complete guide (500+ lines)
- `cline-apply-models.json` - Cline config
- `continue-config.json` - Continue config

**Models:**
- **Morph Fast Apply** - Fastest, free tier
- **Relace Instant Apply** - Precise, paid
- **Claude 3.5 Haiku** - Fallback, paid
- **Claude 3.5 Sonnet** - Critical changes, paid

**Use when:** Chat/Edit output doesn't align with your code

---

### 4. Free Models

**Location:** `free-models/`

**What it is:** Complete zero-cost AI setup using local models.

**Files:**
- `FREE_MODELS_SETUP.md` - Comprehensive guide (600+ lines)
- `continue-free-config.json` - Complete free config
- `install-free-models.sh` - Automated installer
- `QUICK_REFERENCE.md` - One-page cheat sheet

**Models:**
- **Qwen 2.5 Coder 1.5B** - Autocomplete (1GB)
- **Qwen 2.5 Coder 7B** - Chat/Edit (4.7GB)
- **Nomic Embed Text** - Embeddings (274MB)

**Use when:** You want $0/month cost and complete privacy

---

## 🎯 Setup Guides by Use Case

### For Beginners

**Start here:**
1. Read: `free-models/QUICK_REFERENCE.md`
2. Run: `bash free-models/install-free-models.sh`
3. Test: Open VS Code and start coding

**Time:** 5 minutes  
**Cost:** $0

---

### For Privacy-Conscious Developers

**Recommended setup:**
1. Follow: `free-models/FREE_MODELS_SETUP.md`
2. Use: Only local models (Ollama)
3. Configure: `continue-free-config.json`

**Benefits:**
- 100% local processing
- No data sent to external servers
- Works offline
- No API keys needed

---

### For Maximum Quality

**Recommended setup:**
1. Get API keys:
   - Anthropic (Claude): https://console.anthropic.com
   - Mistral (Codestral): https://console.mistral.ai
   - Inception (Mercury): https://inception.ai

2. Follow guides:
   - `autocomplete-models/AUTOCOMPLETE_MODELS_GUIDE.md`
   - `apply-models/APPLY_MODELS_GUIDE.md`

3. Configure:
   - `autocomplete-models/continue-autocomplete-config.json`
   - `apply-models/continue-config.json`

**Cost:** ~$20-50/month  
**Quality:** Excellent

---

### For Balanced Approach

**Recommended setup:**
1. Install Ollama (free local models)
2. Get Anthropic API key (for critical tasks)
3. Use hybrid config:
   - Qwen 1.5B for autocomplete (free, fast)
   - Claude Sonnet for chat/edit (paid, quality)

**Cost:** ~$10-20/month  
**Balance:** Speed + Quality + Privacy

---

## 💰 Cost Comparison

### Free Setup (This Guide)

| Feature | Model | Cost |
|---------|-------|------|
| Autocomplete | Qwen 1.5B | $0 |
| Chat/Edit | Qwen 7B | $0 |
| Embeddings | Nomic | $0 |
| Apply | N/A | $0 |
| **Total/Month** | | **$0** |

**Annual Savings:** $624-732 vs paid alternatives

---

### Paid Setup (Best Quality)

| Feature | Model | Cost/Month |
|---------|-------|------------|
| Autocomplete | Codestral | ~$10 |
| Chat/Edit | Claude Sonnet | ~$20 |
| Apply | Morph/Relace | ~$10 |
| Embeddings | Voyage | ~$5 |
| **Total/Month** | | **~$45** |

**Annual Cost:** ~$540

---

### Hybrid Setup (Balanced)

| Feature | Model | Cost/Month |
|---------|-------|------------|
| Autocomplete | Qwen 1.5B (free) | $0 |
| Chat/Edit | Claude Sonnet | ~$20 |
| Apply | Claude Haiku | ~$5 |
| Embeddings | Nomic (free) | $0 |
| **Total/Month** | | **~$25** |

**Annual Cost:** ~$300  
**Savings:** ~$240/year vs full paid

---

## 📊 Model Comparison Matrix

### Autocomplete Models

| Model | Type | Speed | Quality | Cost | Privacy | RAM |
|-------|------|-------|---------|------|---------|-----|
| **Codestral** | Hosted | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $10/mo | ☁️ | N/A |
| **Mercury** | Hosted | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $15/mo | ☁️ | N/A |
| **Qwen 1.5B** | Local | ⚡⚡⚡⚡ | ⭐⭐⭐ | Free | 🔒 | 4GB |
| **Qwen 7B** | Local | ⚡⚡⚡ | ⭐⭐⭐⭐ | Free | 🔒 | 8GB |

---

### Chat/Edit Models

| Model | Type | Speed | Quality | Cost | Privacy | RAM |
|-------|------|-------|---------|------|---------|-----|
| **Claude Sonnet** | Hosted | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $20/mo | ☁️ | N/A |
| **GPT-4** | Hosted | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $20/mo | ☁️ | N/A |
| **Qwen 7B** | Local | ⚡⚡⚡ | ⭐⭐⭐⭐ | Free | 🔒 | 8GB |
| **Qwen 14B** | Local | ⚡⚡ | ⭐⭐⭐⭐⭐ | Free | 🔒 | 16GB |

---

### Apply Models

| Model | Type | Speed | Quality | Cost | Privacy |
|-------|------|-------|---------|------|---------|
| **Morph Fast** | Hosted | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | Free tier | ☁️ |
| **Relace Instant** | Hosted | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $10/mo | ☁️ |
| **Claude Haiku** | Hosted | ⚡⚡⚡ | ⭐⭐⭐⭐ | $5/mo | ☁️ |
| **Claude Sonnet** | Hosted | ⚡⚡ | ⭐⭐⭐⭐⭐ | $20/mo | ☁️ |

---

## 🔧 Configuration Files Reference

### Continue Config Location

```bash
~/.continue/config.json
```

### Cline Config Location

```bash
# VS Code Settings
Cmd/Ctrl + Shift + P → "Cline: Open Settings"
```

### Environment Variables

```bash
# .env file
ANTHROPIC_API_KEY=sk-ant-...
MISTRAL_API_KEY=...
OPENAI_API_KEY=sk-...
INCEPTION_API_KEY=...
MORPH_API_KEY=...
RELACE_API_KEY=...
VOYAGE_API_KEY=...
```

---

## 🐛 Troubleshooting

### No Autocomplete Suggestions

**Check:**
1. Model is configured in Continue
2. Ollama is running (for local models)
3. API key is valid (for hosted models)
4. File type is not disabled
5. Continue extension is enabled

**Fix:**
```bash
# For Ollama
ollama ps
ollama list

# For API models
echo $ANTHROPIC_API_KEY

# Restart VS Code
```

---

### Slow Performance

**For Local Models:**
- Use smaller model (1.5B instead of 7B)
- Reduce context window (`numCtx: 2048`)
- Close other applications
- Enable GPU if available

**For Hosted Models:**
- Check internet connection
- Verify API rate limits
- Try different model

---

### Out of Memory

**Solutions:**
1. Use smaller model:
```bash
ollama pull qwen2.5-coder:1.5b
```

2. Reduce context:
```json
{
  "completionOptions": {
    "numCtx": 1024
  }
}
```

3. Close unused models:
```bash
ollama stop qwen2.5-coder:7b
```

---

### API Errors

**Check:**
1. API key is valid
2. Account has credits
3. Not rate limited
4. Correct API endpoint

**Fix:**
```bash
# Test API key
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-3-5-sonnet-latest","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

---

## 📚 Additional Resources

### Official Documentation
- **Continue:** https://docs.continue.dev
- **Cline:** https://github.com/cline/cline
- **Ollama:** https://ollama.com
- **Anthropic:** https://docs.anthropic.com
- **Mistral:** https://docs.mistral.ai

### Model Hubs
- **Continue Hub:** https://hub.continue.dev
- **Ollama Library:** https://ollama.com/library
- **Hugging Face:** https://huggingface.co

### Community
- **Continue Discord:** https://discord.gg/continue
- **Ollama Discord:** https://discord.gg/ollama

---

## ✅ Setup Checklist

### Initial Setup
- [ ] Choose setup type (free/paid/hybrid)
- [ ] Install required tools (Ollama/API keys)
- [ ] Download/configure models
- [ ] Copy configuration files
- [ ] Restart VS Code

### Verification
- [ ] Autocomplete working
- [ ] Chat working
- [ ] Edit working
- [ ] Apply working (if configured)
- [ ] Performance acceptable

### Optimization
- [ ] Adjust temperature/context
- [ ] Configure custom commands
- [ ] Set up keyboard shortcuts
- [ ] Enable/disable features as needed

---

## 🎓 Learning Path

### Day 1: Get Started
1. Read: `free-models/QUICK_REFERENCE.md`
2. Install: Free models setup
3. Test: Basic autocomplete and chat

### Day 2-3: Explore Features
1. Try: Different models
2. Test: Custom commands
3. Learn: Keyboard shortcuts

### Week 1: Optimize
1. Adjust: Settings for your workflow
2. Monitor: Performance and quality
3. Customize: System message

### Month 1: Master
1. Learn: Advanced features
2. Create: Custom workflows
3. Share: Your setup with team

---

## 🚀 Next Steps

1. **Choose your setup:**
   - Free: `free-models/FREE_MODELS_SETUP.md`
   - Paid: `autocomplete-models/AUTOCOMPLETE_MODELS_GUIDE.md`
   - Hybrid: Mix both guides

2. **Configure agent:**
   - `agent-system-messages/SETUP_GUIDE.md`

3. **Optimize:**
   - Adjust settings
   - Test performance
   - Customize to your needs

4. **Learn more:**
   - Read full guides
   - Join community
   - Share feedback

---

## 📞 Support

**Issues?**
1. Check troubleshooting section above
2. Read relevant guide in detail
3. Check official documentation
4. Ask in community Discord

**Feedback?**
- Open GitHub issue
- Suggest improvements
- Share your setup

---

**Remember:** Start simple, test thoroughly, optimize gradually. You can always upgrade or change your setup later!

---

**Last Updated:** October 15, 2025  
**Maintained by:** Mohamed + AI Team  
**Next Review:** November 15, 2025
