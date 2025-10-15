# Autocomplete Quick Start Guide

**Get intelligent code completion in 5 minutes!**

---

## 🚀 Option 1: Best Quality (Codestral)

### Step 1: Get API Key
```bash
# Visit: https://console.mistral.ai
# Sign up and get your API key
```

### Step 2: Add to Environment
```bash
# Add to .env file
echo "MISTRAL_API_KEY=your_key_here" >> .env
```

### Step 3: Configure Continue
```bash
# Copy config
cp docs/ai-setup/autocomplete-models/continue-autocomplete-config.json .continue/config.json
```

### Step 4: Test
1. Open any code file
2. Start typing
3. Wait 300ms
4. See suggestions appear!
5. Press Tab to accept

**Done!** ✅

---

## 🔒 Option 2: Privacy First (Local Qwen)

### Step 1: Install Ollama
```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from: https://ollama.com/download
```

### Step 2: Pull Model
```bash
# Fast model (1.5B)
ollama pull qwen2.5-coder:1.5b

# Or better quality (7B)
ollama pull qwen2.5-coder:7b
```

### Step 3: Verify
```bash
# Test the model
ollama run qwen2.5-coder:1.5b "Write a hello world function"
```

### Step 4: Configure Continue
```json
// Add to .continue/config.json
{
  "models": [
    {
      "title": "Qwen Local",
      "provider": "ollama",
      "model": "qwen2.5-coder:1.5b",
      "roles": ["autocomplete"]
    }
  ]
}
```

### Step 5: Test
1. Open any code file
2. Start typing
3. See local suggestions!
4. Press Tab to accept

**Done!** ✅ (100% private, no API needed)

---

## 🎯 Option 3: Hybrid (Best of Both)

### Use Codestral + Qwen Fallback

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

**Benefits:**
- ✅ Best quality when online (Codestral)
- ✅ Works offline (Qwen)
- ✅ Automatic fallback
- ✅ Privacy for sensitive files

---

## ⚙️ Adjust Settings

### Faster Suggestions
```json
{
  "autocomplete": {
    "debounceDelay": 200  // Default: 300
  }
}
```

### More Context
```json
{
  "autocomplete": {
    "maxPromptTokens": 4096,  // Default: 2048
    "useOtherFiles": true
  }
}
```

### Disable in Certain Files
```json
{
  "autocomplete": {
    "disableInFiles": [
      "*.md",
      "*.txt",
      ".env"
    ]
  }
}
```

---

## 🐛 Troubleshooting

### No Suggestions?

**Check:**
```bash
# For Ollama
ollama list
ollama ps

# For API models
echo $MISTRAL_API_KEY
```

**Fix:**
1. Restart VS Code
2. Check Continue extension is enabled
3. Verify model is running (Ollama)
4. Check API key is valid

### Slow Suggestions?

**For Hosted:**
- Check internet speed
- Try local model

**For Local:**
- Use smaller model (1.5B)
- Close other apps
- Enable GPU if available

---

## 📊 Expected Performance

| Model | Speed | Quality | Privacy | Cost |
|-------|-------|---------|---------|------|
| Codestral | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ☁️ | 💰 |
| Qwen 1.5B | ⚡⚡⚡⚡ | ⭐⭐⭐ | 🔒 | Free |
| Qwen 7B | ⚡⚡⚡ | ⭐⭐⭐⭐ | 🔒 | Free |

---

## 🎓 Tips

1. **Start simple** - One model first
2. **Test thoroughly** - Try different file types
3. **Adjust delay** - Find your sweet spot (200-500ms)
4. **Use fallback** - Hybrid setup for reliability
5. **Monitor usage** - Check what works best

---

## 📚 Next Steps

- Read full guide: `AUTOCOMPLETE_MODELS_GUIDE.md`
- Configure Apply models: `../apply-models/`
- Set up Rerank models: `../rerank-models/`
- Explore Continue docs: https://docs.continue.dev

---

**Questions?** Check the full guide or Continue documentation!
