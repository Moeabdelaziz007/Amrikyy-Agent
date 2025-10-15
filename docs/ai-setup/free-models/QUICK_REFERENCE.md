# Free Models Quick Reference Card

**One-page guide for free AI models setup**

---

## 🚀 5-Minute Setup

```bash
# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Download models
ollama pull qwen2.5-coder:1.5b  # Autocomplete (1GB)
ollama pull qwen2.5-coder:7b    # Chat/Edit (4.7GB)
ollama pull nomic-embed-text    # Embeddings (274MB)

# 3. Copy config
cp docs/ai-setup/free-models/continue-free-config.json ~/.continue/config.json

# 4. Restart VS Code
```

**Done!** Cost: $0/month

---

## 📊 Model Cheat Sheet

| Model | Size | RAM | Speed | Quality | Use For |
|-------|------|-----|-------|---------|---------|
| **qwen2.5-coder:1.5b** | 1GB | 4GB | ⚡⚡⚡⚡ | ⭐⭐⭐ | Autocomplete |
| **qwen2.5-coder:7b** | 4.7GB | 8GB | ⚡⚡⚡ | ⭐⭐⭐⭐ | Chat/Edit |
| **nomic-embed-text** | 274MB | 2GB | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | Search |

---

## ⚙️ Common Commands

```bash
# List models
ollama list

# Remove model
ollama rm qwen2.5-coder:7b

# Update model
ollama pull qwen2.5-coder:7b

# Test model
ollama run qwen2.5-coder:1.5b "test"

# Check running models
ollama ps

# Stop model
ollama stop qwen2.5-coder:7b
```

---

## 🎯 Optimization Quick Tips

### Fast Autocomplete
```json
{
  "completionOptions": {
    "temperature": 0.1,
    "numPredict": 128,
    "numCtx": 1024
  }
}
```

### Better Quality
```json
{
  "completionOptions": {
    "temperature": 0.3,
    "numPredict": 4096,
    "numCtx": 16384
  }
}
```

### Low RAM (4GB)
```bash
# Use only 1.5B model
ollama pull qwen2.5-coder:1.5b
```

---

## 🐛 Quick Fixes

### No suggestions?
```bash
# Check Ollama running
ollama ps

# Restart Ollama
pkill ollama && ollama serve &

# Restart VS Code
```

### Too slow?
```bash
# Use smaller model
ollama pull qwen2.5-coder:1.5b

# Reduce context in config
"numCtx": 2048
```

### Out of memory?
```bash
# Stop unused models
ollama stop qwen2.5-coder:7b

# Use 1.5B only
```

---

## 💡 Pro Tips

1. **Start small:** Begin with 1.5B, upgrade if needed
2. **GPU helps:** Automatically used if available
3. **Context matters:** More context = better but slower
4. **Temperature:** Lower (0.1-0.2) = more focused
5. **Update monthly:** `ollama pull model-name`

---

## 📱 VS Code Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Chat | `Cmd/Ctrl + L` |
| Edit Code | `Cmd/Ctrl + I` |
| Accept Suggestion | `Tab` |
| Reject Suggestion | `Esc` |

---

## 💰 Cost Comparison

| Service | Cost/Month |
|---------|------------|
| **Free Models (This)** | **$0** |
| GitHub Copilot | $10-19 |
| Cursor Pro | $20 |
| Tabnine Pro | $12 |

**Savings:** $42-51/month

---

## ✅ Quick Checklist

- [ ] Ollama installed
- [ ] Models downloaded
- [ ] Config copied
- [ ] VS Code restarted
- [ ] Autocomplete working
- [ ] Chat working
- [ ] $0 spent ✓

---

## 🆘 Need Help?

- **Full Guide:** `FREE_MODELS_SETUP.md`
- **Ollama Docs:** https://ollama.com
- **Continue Docs:** https://docs.continue.dev
- **Issues:** Check troubleshooting section

---

**Remember:** 100% Free • 100% Private • 100% Local

**Last Updated:** October 15, 2025
