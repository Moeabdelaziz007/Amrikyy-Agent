# 🚀 Continue Agents - Installation Guide

This directory contains Continue agent configurations for the Maya Travel Agent project.

## 📋 Prerequisites

1. **Continue Extension Installed:**
   - VS Code: Install "Continue" extension
   - Cursor: Built-in Continue support

2. **MCP Servers Set Up:**
   ```bash
   cd /workspace/backend/mcp-servers
   ./setup-mcp-servers.sh
   ```

3. **API Keys Configured:**
   - `ANTHROPIC_API_KEY` - For Claude Sonnet 4
   - `OPENAI_API_KEY` - For GPT-5
   - `VOYAGE_API_KEY` - For Voyage Code 3 (embeddings)
   - `RELACE_API_KEY` - For Relace Instant Apply (optional)

## ⚡ Quick Installation

### Option 1: Copy to Continue Directory

```bash
# From project root
cp docs/continue-agents/*.yaml ~/.continue/agents/

# Or if using Cursor
cp docs/continue-agents/*.yaml ~/.cursor/agents/
```

### Option 2: Symlink (Recommended)

```bash
# Create symlink to keep agents in sync with repo
ln -s $(pwd)/docs/continue-agents/*.yaml ~/.continue/agents/

# Or for Cursor
ln -s $(pwd)/docs/continue-agents/*.yaml ~/.cursor/agents/
```

### Option 3: Manual Setup

1. **Create Agents Directory:**
   ```bash
   mkdir -p ~/.continue/agents
   ```

2. **Copy Agent Files:**
   - Copy `maya-travel-agent.yaml`
   - Copy `code-reviewer.yaml`
   - Copy `pattern-learner.yaml`
   - Copy `README.md`

3. **Reload Continue:**
   - Restart VS Code/Cursor
   - Or reload Continue extension

## 🔧 Configuration

### 1. Update API Keys

Edit each `.yaml` file and replace placeholders:

```yaml
# Before
apiKey: ${{ secrets.ANTHROPIC_API_KEY }}

# After (choose one method)
apiKey: sk-ant-xxxxx  # Direct key (not recommended for git)
apiKey: $ANTHROPIC_API_KEY  # Environment variable (recommended)
```

### 2. Update MCP Server Paths

If your workspace is not at `/workspace`, update paths:

```yaml
# Before
args: [/workspace/backend/mcp-servers/private-journal/dist/index.js]

# After
args: [/your/actual/path/backend/mcp-servers/private-journal/dist/index.js]
```

### 3. Configure Local Models (Optional)

If using Ollama for local models:

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull recommended models
ollama pull qwen3-coder-30b
ollama pull qwen2.5-coder-7b
```

Update agent configs to use local models:

```yaml
models:
  - name: Qwen3 Coder 30B
    provider: ollama
    model: qwen3-coder-30b
    # No API key needed for local models
```

## ✅ Verification

### 1. Test Agent Loading

1. Open Continue sidebar
2. Click agent dropdown
3. Should see:
   - Maya Travel Agent Assistant
   - Code Reviewer
   - Pattern Learner

### 2. Test MCP Tools

```
/remember Test insight: MCP integration working!
```

Expected: Tool executes successfully

### 3. Test Custom Commands

```
/maya-pattern
[Select some code]
```

Expected: Analysis with Maya-specific patterns

## 📚 Available Agents

### Maya Travel Agent Assistant
**Best for:** Full-stack development, AIX agents, Money Hunter

**Models:**
- Claude Sonnet 4 (primary)
- Qwen3 Coder 30B (fast impl)
- GPT-5 (complex reasoning)

**Commands:**
- `/remember` - Store insights
- `/recall` - Search memories
- `/maya-pattern` - Analyze Maya patterns
- `/aix-agent` - Generate AIX configs
- `/money-hunter` - Revenue analysis

### Code Reviewer
**Best for:** Code review, security audits, quality assurance

**Models:**
- Claude Sonnet 4 (review)
- GPT-5 (security)

**Commands:**
- `/review` - 7D code review
- `/security-audit` - Security analysis

### Pattern Learner
**Best for:** Learning patterns, applying best practices

**Models:**
- Qwen3 Coder 30B (analysis)
- Claude Sonnet 4 (synthesis)

**Commands:**
- `/learn` - Extract patterns
- `/apply` - Apply patterns
- `/discover` - Find patterns

## 🔍 Troubleshooting

### Agents Not Appearing

**Solution 1: Check Directory**
```bash
ls ~/.continue/agents/
# Should show: maya-travel-agent.yaml, code-reviewer.yaml, pattern-learner.yaml
```

**Solution 2: Check File Permissions**
```bash
chmod 644 ~/.continue/agents/*.yaml
```

**Solution 3: Restart Continue**
- Close and reopen Continue sidebar
- Or restart VS Code/Cursor

### MCP Tools Not Working

**Solution 1: Verify MCP Server**
```bash
cd /workspace/backend/mcp-servers
node test-private-journal.js
```

**Solution 2: Check Paths**
```bash
# Verify server exists
ls /workspace/backend/mcp-servers/private-journal/dist/index.js
```

**Solution 3: Rebuild MCP Server**
```bash
cd /workspace/backend/mcp-servers/private-journal
npm install
npm run build
```

### API Key Errors

**Solution 1: Set Environment Variables**
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANTHROPIC_API_KEY="sk-ant-xxxxx"
export OPENAI_API_KEY="sk-xxxxx"
export VOYAGE_API_KEY="pa-xxxxx"
```

**Solution 2: Use Continue Settings**
- Open Continue settings
- Add API keys in model configuration
- Save and reload

### Model Not Available

**Solution 1: Check Provider Status**
- Anthropic: https://status.anthropic.com
- OpenAI: https://status.openai.com

**Solution 2: Use Alternative Model**
Edit agent config to use available model:
```yaml
# Replace Claude Sonnet 4 with Gemini
- name: Gemini 2.5 Pro
  provider: gemini
  model: gemini-2.5-pro
  apiKey: $GEMINI_API_KEY
```

**Solution 3: Use Local Model**
```yaml
- name: Qwen3 Coder
  provider: ollama
  model: qwen3-coder-30b
  # No API key needed
```

## 🎯 Best Practices

### Agent Selection
- **Complex tasks** → Maya Travel Agent Assistant
- **Code review** → Code Reviewer
- **Pattern work** → Pattern Learner
- **Quick edits** → Any agent (use autocomplete model)

### Memory Management
- Store significant decisions: `/remember`
- Search before major tasks: `/recall`
- Build knowledge base over time
- Regular journal review

### Model Selection
- **Closed models** (Claude, GPT-5) → Best quality
- **Open models** (Qwen3) → Fast, privacy-first
- **Local models** (Ollama) → No API costs, offline

## 📖 Documentation

- [Agent README](./README.md) - Comprehensive guide
- [MCP Setup Guide](../MCP_SETUP.md) - MCP troubleshooting
- [MCP Integration Guide](../../backend/mcp-servers/MCP_INTEGRATION_GUIDE.md)
- [Continue Official Docs](https://docs.continue.dev/)

## 🆘 Support

### Quick Diagnostics
```bash
# Test everything
cd /workspace
./backend/mcp-servers/setup-mcp-servers.sh
./backend/mcp-servers/test-private-journal.js
```

### Common Issues
1. **Agents not loading** → Check directory and permissions
2. **MCP tools failing** → Rebuild MCP server
3. **API errors** → Verify API keys
4. **Model unavailable** → Use alternative or local model

### Getting Help
- Check agent README.md
- Review MCP_SETUP.md
- Inspect Continue logs
- Test with simpler configuration

---

**Installation Complete!** 🎉  
**Ready for AI-Powered Development** 🚀
