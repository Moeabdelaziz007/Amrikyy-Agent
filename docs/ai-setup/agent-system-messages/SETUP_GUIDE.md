# Agent System Message Setup Guide

**Quick guide to configure the default agent system message in Continue/Cline**

---

## 🚀 Quick Setup

### Option 1: Continue Configuration

1. **Open Continue config:**
```bash
code ~/.continue/config.json
```

2. **Add system message:**
```json
{
  "systemMessage": "You are Cursero - an ultra-intelligent AI coding agent with DNA Score 99.2/100...",
  "models": [
    {
      "title": "Claude 4.5 Sonnet",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-latest",
      "apiKey": "${ANTHROPIC_API_KEY}",
      "systemMessage": "You are Cursero - an ultra-intelligent AI coding agent..."
    }
  ]
}
```

3. **Or use the JSON file:**
```bash
# Copy the system message
cat docs/ai-setup/agent-system-messages/continue-system-message.json

# Paste into your Continue config
```

---

### Option 2: Cline Configuration

1. **Open Cline settings in VS Code:**
   - Press `Cmd/Ctrl + Shift + P`
   - Type "Cline: Open Settings"

2. **Add custom instructions:**
   - Scroll to "Custom Instructions"
   - Paste the content from `DEFAULT_AGENT_SYSTEM_MESSAGE.md`

3. **Or use environment variable:**
```bash
# Add to .env
CLINE_CUSTOM_INSTRUCTIONS="$(cat docs/ai-setup/agent-system-messages/DEFAULT_AGENT_SYSTEM_MESSAGE.md)"
```

---

### Option 3: Per-Model Configuration

Configure different system messages for different models:

```json
{
  "models": [
    {
      "title": "Claude Sonnet (Architect)",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-latest",
      "systemMessage": "You are in Architect Mode. Focus on system design, elegant solutions, and long-term maintainability..."
    },
    {
      "title": "Claude Haiku (Quick Tasks)",
      "provider": "anthropic",
      "model": "claude-3-5-haiku-latest",
      "systemMessage": "You are in Executor Mode. Focus on rapid, high-quality implementation..."
    },
    {
      "title": "GPT-4 (Debugger)",
      "provider": "openai",
      "model": "gpt-4-turbo",
      "systemMessage": "You are in Debugger Mode. Focus on root cause analysis and systematic problem solving..."
    }
  ]
}
```

---

## 📋 What's Included

The default system message includes:

### Core Identity
- ✅ Agent name: Cursero
- ✅ DNA Score: 99.2/100
- ✅ Role: Supreme Coding Intelligence
- ✅ Specialization: Deep learning, optimization, proactive assistance

### Reasoning Strategies (7)
1. Quantum Superposition Thinking
2. Multi-Dimensional Analysis
3. First Principles Reasoning
4. Pattern Synthesis Mastery
5. Strategic Decomposition
6. Hypothesis-Driven Development
7. Creative Synthesis

### Thinking Modes (6)
- 🔍 Explorer Mode (innovation)
- 🏛️ Architect Mode (design)
- ⚡ Executor Mode (implementation)
- 🐛 Debugger Mode (debugging)
- 🚀 Optimizer Mode (refactoring)
- 👨‍🏫 Teacher Mode (documentation)

### Development Process (7 Phases)
1. Deep Understanding (5-15%)
2. Strategic Planning (10-20%)
3. Elegant Design (10-15%)
4. Flawless Implementation (40-50%)
5. Rigorous Validation (10-15%)
6. Continuous Optimization (5-10%)
7. Deep Learning (5%)

### Quality Standards
- ✅ Readability rules
- ✅ Testing requirements (80%+ coverage)
- ✅ Security mandates
- ✅ Performance standards

### Adaptive Learning
- ✅ Observes user patterns (24-48h)
- ✅ Adapts to coding style
- ✅ Learns from corrections
- ✅ Improves continuously

### Proactive Monitoring
- ✅ File changes
- ✅ Code quality
- ✅ Security vulnerabilities
- ✅ Performance regressions

### Project Context
- ✅ Amrikyy Travel Agent architecture
- ✅ Backend patterns (Node.js + Express)
- ✅ Frontend patterns (React + TypeScript)
- ✅ iOS patterns (SwiftUI + MVVM)

---

## 🎯 Customization

### Adjust for Your Project

1. **Update project context:**
```json
{
  "systemMessage": "...PROJECT CONTEXT: [Your Project Name]\n\n**Backend:** [Your stack]\n**Frontend:** [Your stack]..."
}
```

2. **Adjust quality standards:**
```json
{
  "systemMessage": "...Performance Standards:\n- API response: <100ms (your target)\n- Test coverage: 95% (your target)..."
}
```

3. **Add custom patterns:**
```json
{
  "systemMessage": "...PROJECT-SPECIFIC PATTERNS:\n\n**Your Pattern:**\n- Description\n- When to use\n- Example..."
}
```

---

## 🔧 Testing

### Verify System Message is Active

1. **Ask the agent:**
```
"What is your name and role?"
```

**Expected response:**
```
I am Cursero, an ultra-intelligent AI coding agent with DNA Score 99.2/100...
```

2. **Test reasoning:**
```
"How would you approach building a new feature?"
```

**Expected response should mention:**
- 7-phase development process
- Multi-dimensional analysis
- Quantum superposition thinking

3. **Test learning:**
```
"Remember that I prefer 2-space indentation"
```

**Then later:**
```
"Generate a function for me"
```

**Should use 2-space indentation**

---

## 📊 Monitoring

### Check if Learning is Working

1. **Track pattern recognition:**
```bash
# Check Continue logs
tail -f ~/.continue/logs/continue.log | grep "pattern"
```

2. **Monitor adaptations:**
```bash
# Check for style adaptations
tail -f ~/.continue/logs/continue.log | grep "adapt"
```

3. **Review suggestions:**
```bash
# Check proactive suggestions
tail -f ~/.continue/logs/continue.log | grep "suggest"
```

---

## 🐛 Troubleshooting

### System Message Not Applied

**Problem:** Agent doesn't follow system message

**Solutions:**
1. Restart VS Code
2. Reload Continue extension
3. Check config syntax (valid JSON)
4. Verify file path is correct
5. Check for conflicting settings

### Agent Behavior Inconsistent

**Problem:** Agent sometimes follows, sometimes doesn't

**Solutions:**
1. Check if multiple system messages configured
2. Verify model-specific overrides
3. Clear Continue cache
4. Update Continue extension

### Learning Not Working

**Problem:** Agent doesn't adapt to your style

**Solutions:**
1. Verify adaptive learning is enabled
2. Give it 24-48h to learn
3. Provide explicit feedback
4. Check logs for learning events

---

## 📚 Resources

- **Full Documentation:** `DEFAULT_AGENT_SYSTEM_MESSAGE.md`
- **JSON Config:** `continue-system-message.json`
- **Continue Docs:** https://docs.continue.dev
- **Cline Docs:** https://github.com/cline/cline

---

## 🎓 Best Practices

1. **Start with default** - Use the provided system message as-is
2. **Observe behavior** - Watch how agent responds for 1-2 days
3. **Customize gradually** - Adjust one thing at a time
4. **Test changes** - Verify each customization works
5. **Document changes** - Keep track of what you modified
6. **Share learnings** - Help improve the system message

---

## ✅ Success Checklist

- [ ] System message configured in Continue/Cline
- [ ] Agent responds with "Cursero" identity
- [ ] Agent uses 7-phase development process
- [ ] Agent applies multi-dimensional analysis
- [ ] Agent learns from corrections (after 24-48h)
- [ ] Agent provides proactive suggestions
- [ ] Code quality meets standards
- [ ] Tests are comprehensive (80%+)

---

**Remember:** The system message is the foundation of agent behavior. Take time to configure it properly, and you'll have an intelligent coding partner that truly understands your needs!

---

**Last Updated:** October 15, 2025  
**Maintained by:** Mohamed + AI Team
