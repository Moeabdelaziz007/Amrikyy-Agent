# Autocomplete Models Guide - Continue Integration

**Version:** 1.0  
**Last Updated:** October 15, 2025  
**Status:** 🟢 Active  
**Purpose:** Configure intelligent code completion for Continue

---

## 🎯 What Are Autocomplete Models?

Autocomplete models provide **real-time code suggestions** as you type. They predict what you're about to write based on context, making coding faster and more efficient.

**Benefits:**
- ⚡ Instant code suggestions
- 🎯 Context-aware completions
- 🚀 Faster development
- 📚 Learn from your codebase
- 🔒 Privacy options (local models)

---

## 🏆 Recommended Models

### Best Closed Models (Hosted, High Performance)

#### 1. Codestral (Mistral AI) - **RECOMMENDED**

**Best for:** Production use, maximum quality

```json
{
  "name": "Codestral",
  "provider": "mistral",
  "model": "codestral-latest",
  "speed": "Very Fast",
  "quality": "Excellent",
  "cost": "Paid"
}
```

**Setup:**
1. Get API key: https://console.mistral.ai
2. Add to `.env`: `MISTRAL_API_KEY=your_key_here`

**Features:**
- ✅ Excellent code quality
- ✅ Fast response times
- ✅ Multi-language support
- ✅ Context-aware suggestions
- ✅ Function/class completion

---

#### 2. Mercury Coder (Inception AI)

**Best for:** Advanced predictions, next edit capability

```json
{
  "name": "Mercury Coder",
  "provider": "inception",
  "model": "mercury-coder",
  "speed": "Fast",
  "quality": "Excellent",
  "cost": "Paid"
}
```

**Setup:**
1. Get API key: https://inception.ai
2. Add to `.env`: `INCEPTION_API_KEY=your_key_here`

**Features:**
- ✅ Next Edit prediction (proactive suggestions)
- ✅ High-quality completions
- ✅ Advanced context understanding
- ✅ Multi-file awareness

---

### Best Open Models (Local, Privacy-First)

#### 1. QwenCoder2.5 (1.5B) - **RECOMMENDED FOR LOCAL**

**Best for:** Fast local completions, privacy

```json
{
  "name": "QwenCoder2.5 1.5B",
  "provider": "ollama",
  "model": "qwen2.5-coder:1.5b",
  "speed": "Very Fast",
  "quality": "Good",
  "cost": "Free (local)"
}
```

**Setup:**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull model
ollama pull qwen2.5-coder:1.5b
```

**Features:**
- ✅ Runs locally (privacy)
- ✅ Very fast (1.5B parameters)
- ✅ Good quality
- ✅ No API costs
- ✅ Offline capable

**System Requirements:**
- RAM: 4GB minimum
- Storage: 2GB
- CPU: Modern processor

---

#### 2. QwenCoder2.5 (7B)

**Best for:** Better quality, still fast locally

```json
{
  "name": "QwenCoder2.5 7B",
  "provider": "ollama",
  "model": "qwen2.5-coder:7b",
  "speed": "Fast",
  "quality": "Very Good",
  "cost": "Free (local)"
}
```

**Setup:**
```bash
ollama pull qwen2.5-coder:7b
```

**Features:**
- ✅ Better quality than 1.5B
- ✅ Still fast on modern hardware
- ✅ Local privacy
- ✅ No API costs

**System Requirements:**
- RAM: 8GB minimum
- Storage: 5GB
- CPU: Modern processor
- GPU: Optional (faster with GPU)

---

## 🎨 Model Comparison

| Model | Type | Speed | Quality | Cost | Privacy | Best For |
|-------|------|-------|---------|------|---------|----------|
| **Codestral** | Closed | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | 💰 | ☁️ | Production |
| **Mercury Coder** | Closed | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | 💰💰 | ☁️ | Next Edit |
| **Qwen 1.5B** | Open | ⚡⚡⚡⚡ | ⭐⭐⭐ | Free | 🔒 | Fast Local |
| **Qwen 7B** | Open | ⚡⚡⚡ | ⭐⭐⭐⭐ | Free | 🔒 | Quality Local |

---

## 🚀 Next Edit Feature

**What is Next Edit?**
Proactive code prediction that anticipates your next change before you type it.

**Supported Model:**
- **Mercury Coder** - Primary Next Edit model

**How it works:**
1. Analyzes your current code
2. Predicts what you'll edit next
3. Suggests changes proactively
4. Learns from your patterns

**Example:**
```javascript
// You write:
function calculateTotal(items) {
  let total = 0;
  
// Next Edit suggests:
  for (const item of items) {
    total += item.price;
  }
  return total;
}
```

---

## 📋 Configuration Examples

### Option 1: Codestral (Best Quality)

```json
{
  "models": [
    {
      "title": "Codestral Autocomplete",
      "provider": "mistral",
      "model": "codestral-latest",
      "apiKey": "${MISTRAL_API_KEY}",
      "roles": ["autocomplete"],
      "completionOptions": {
        "temperature": 0.2,
        "topP": 0.95,
        "maxTokens": 256
      }
    }
  ]
}
```

---

### Option 2: Mercury Coder (Next Edit)

```json
{
  "models": [
    {
      "title": "Mercury Coder",
      "provider": "inception",
      "model": "mercury-coder",
      "apiKey": "${INCEPTION_API_KEY}",
      "roles": ["autocomplete", "next_edit"],
      "completionOptions": {
        "temperature": 0.1,
        "topP": 0.95,
        "maxTokens": 512
      }
    }
  ]
}
```

---

### Option 3: Qwen Local (Privacy)

```json
{
  "models": [
    {
      "title": "Qwen 1.5B Local",
      "provider": "ollama",
      "model": "qwen2.5-coder:1.5b",
      "roles": ["autocomplete"],
      "completionOptions": {
        "temperature": 0.2,
        "topP": 0.95,
        "maxTokens": 256,
        "numPredict": 256
      }
    }
  ]
}
```

---

### Option 4: Hybrid (Best of Both)

```json
{
  "models": [
    {
      "title": "Codestral Primary",
      "provider": "mistral",
      "model": "codestral-latest",
      "apiKey": "${MISTRAL_API_KEY}",
      "roles": ["autocomplete"],
      "priority": 1
    },
    {
      "title": "Qwen Fallback",
      "provider": "ollama",
      "model": "qwen2.5-coder:1.5b",
      "roles": ["autocomplete"],
      "priority": 2
    }
  ]
}
```

---

## ⚙️ Autocomplete Settings

### Basic Settings

```json
{
  "autocomplete": {
    "enabled": true,
    "debounceDelay": 300,
    "maxPromptTokens": 2048,
    "prefixPercentage": 0.85,
    "maxSuffixPercentage": 0.25,
    "template": "default"
  }
}
```

### Advanced Settings

```json
{
  "autocomplete": {
    "enabled": true,
    "debounceDelay": 300,
    "maxPromptTokens": 2048,
    "prefixPercentage": 0.85,
    "maxSuffixPercentage": 0.25,
    "template": "default",
    
    "multilineCompletions": "auto",
    "useCache": true,
    "useOtherFiles": true,
    "onlyMyCode": false,
    
    "disableInFiles": [
      "*.md",
      "*.txt",
      ".env"
    ]
  }
}
```

---

## 🎯 Performance Optimization

### For Hosted Models (Codestral, Mercury)

```json
{
  "completionOptions": {
    "temperature": 0.2,
    "topP": 0.95,
    "maxTokens": 256,
    "frequencyPenalty": 0.0,
    "presencePenalty": 0.0
  }
}
```

**Tips:**
- Lower temperature (0.1-0.3) for more deterministic
- Higher topP (0.9-0.95) for better quality
- Limit maxTokens (128-256) for speed

---

### For Local Models (Qwen)

```json
{
  "completionOptions": {
    "temperature": 0.2,
    "topP": 0.95,
    "maxTokens": 256,
    "numPredict": 256,
    "numCtx": 2048,
    "repeatPenalty": 1.1
  }
}
```

**Tips:**
- Use smaller context (numCtx: 2048) for speed
- Limit predictions (numPredict: 256)
- Enable GPU acceleration if available

---

## 🔧 Troubleshooting

### No Completions Appearing

**Check:**
1. Model is configured correctly
2. API key is valid (for hosted models)
3. Ollama is running (for local models)
4. Autocomplete is enabled in settings
5. File type is not in `disableInFiles`

**Test:**
```bash
# For Ollama
ollama list
ollama run qwen2.5-coder:1.5b "test"

# For API models
curl -X POST https://api.mistral.ai/v1/completions \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -d '{"model":"codestral-latest","prompt":"test"}'
```

---

### Slow Completions

**For Hosted Models:**
- Check internet connection
- Verify API rate limits
- Consider switching to local model

**For Local Models:**
- Use smaller model (1.5B instead of 7B)
- Enable GPU acceleration
- Increase RAM allocation
- Close other applications

---

### Poor Quality Suggestions

**Solutions:**
1. Switch to larger model (7B instead of 1.5B)
2. Use hosted model (Codestral)
3. Adjust temperature (lower = more focused)
4. Enable `useOtherFiles` for better context
5. Increase `maxPromptTokens` for more context

---

## 📊 Model Selection Guide

### Choose Codestral if:
- ✅ You want best quality
- ✅ You have API budget
- ✅ You need fast completions
- ✅ Privacy is not critical

### Choose Mercury Coder if:
- ✅ You want Next Edit feature
- ✅ You need proactive suggestions
- ✅ You have higher API budget
- ✅ You want cutting-edge features

### Choose Qwen 1.5B if:
- ✅ Privacy is important
- ✅ You want free solution
- ✅ You need very fast completions
- ✅ You have limited RAM (4GB+)

### Choose Qwen 7B if:
- ✅ Privacy is important
- ✅ You want better quality
- ✅ You have more RAM (8GB+)
- ✅ You can sacrifice some speed

---

## 🎓 Best Practices

### 1. Start Simple
```json
// Begin with one model
{
  "models": [
    {
      "title": "Qwen 1.5B",
      "provider": "ollama",
      "model": "qwen2.5-coder:1.5b",
      "roles": ["autocomplete"]
    }
  ]
}
```

### 2. Add Fallback
```json
// Add backup model
{
  "models": [
    {
      "title": "Codestral",
      "provider": "mistral",
      "model": "codestral-latest",
      "apiKey": "${MISTRAL_API_KEY}",
      "roles": ["autocomplete"],
      "priority": 1
    },
    {
      "title": "Qwen Fallback",
      "provider": "ollama",
      "model": "qwen2.5-coder:1.5b",
      "roles": ["autocomplete"],
      "priority": 2
    }
  ]
}
```

### 3. Optimize Settings
```json
// Fine-tune for your workflow
{
  "autocomplete": {
    "debounceDelay": 200,  // Faster suggestions
    "maxPromptTokens": 4096,  // More context
    "useOtherFiles": true  // Better awareness
  }
}
```

---

## 🔒 Privacy Considerations

### Hosted Models (Codestral, Mercury)
- ⚠️ Code sent to external servers
- ⚠️ Subject to provider's privacy policy
- ✅ Usually encrypted in transit
- ✅ Providers claim not to train on your code

### Local Models (Qwen)
- ✅ All processing on your machine
- ✅ No data leaves your computer
- ✅ Complete privacy
- ✅ Works offline

**Recommendation:** Use local models for sensitive code, hosted for general development.

---

## 📈 Performance Metrics

### Expected Performance

| Model | Latency | Quality Score | Tokens/sec |
|-------|---------|---------------|------------|
| Codestral | 100-300ms | 9/10 | 50-100 |
| Mercury | 150-400ms | 9/10 | 40-80 |
| Qwen 1.5B | 50-150ms | 7/10 | 100-200 |
| Qwen 7B | 100-300ms | 8/10 | 50-100 |

---

## 🚀 Quick Start

### 1. Choose Your Model

**For best quality:** Codestral
```bash
# Add to .env
MISTRAL_API_KEY=your_key_here
```

**For privacy:** Qwen 1.5B
```bash
# Install and run
ollama pull qwen2.5-coder:1.5b
```

### 2. Configure Continue

Add to `.continue/config.json`:
```json
{
  "models": [
    {
      "title": "My Autocomplete",
      "provider": "mistral",  // or "ollama"
      "model": "codestral-latest",  // or "qwen2.5-coder:1.5b"
      "apiKey": "${MISTRAL_API_KEY}",  // omit for ollama
      "roles": ["autocomplete"]
    }
  ]
}
```

### 3. Test It

1. Open a code file
2. Start typing
3. Wait for suggestions (300ms default)
4. Press Tab to accept

---

## 📚 Resources

- **Continue Docs:** https://docs.continue.dev
- **Model Hub:** https://hub.continue.dev/explore/models?roles=autocomplete
- **Mistral Console:** https://console.mistral.ai
- **Ollama:** https://ollama.com
- **Qwen Models:** https://huggingface.co/Qwen

---

## 🎉 Success Metrics

### Before Autocomplete
```
❌ Typing every character manually
❌ Looking up syntax constantly
❌ Slower development
❌ More typos
```

### After Autocomplete
```
✅ 30-50% faster coding
✅ Fewer syntax errors
✅ Better code consistency
✅ More focus on logic
```

---

**Remember:** Start with Qwen 1.5B (free, fast, private) or Codestral (best quality). You can always switch or add fallbacks later!

---

**Last Updated:** October 15, 2025  
**Maintained by:** Mohamed + AI Team  
**Next Review:** November 15, 2025
