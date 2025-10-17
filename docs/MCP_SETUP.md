# 🔌 MCP Setup for Continue

Quick setup guide for Model Context Protocol (MCP) integration with Continue.

## ✅ What's Already Configured

### MCP Servers Installed
- ✅ **Private Journal MCP** - `/workspace/backend/mcp-servers/private-journal/`
- 🔄 **Pattern Learning Journal** - Ready when needed

### Continue Configuration
- ✅ `config.json` - Updated with MCP servers
- ✅ Agents configured with MCP tools
- ✅ Custom commands for journal interaction

## 🚀 Quick Start

### 1. Test MCP Server

```bash
cd /workspace/backend/mcp-servers
node test-private-journal.js
```

Expected output:
```
✅ Server starts successfully
✅ Communication established
✅ Ready for Claude/Cursor integration
```

### 2. Verify in Continue

1. **Open Continue Sidebar**
2. **Check Available Tools:**
   - Look for "MCP Tools" section
   - Should see: `process_thoughts`, `search_journal`, etc.

3. **Test Journal Command:**
   ```
   /remember Test insight: MCP integration working!
   ```

### 3. Use Custom Commands

**Store an Insight:**
```
/remember The MoneyHunter uses SmartValidator with 7-dimensional scoring for opportunity validation
```

**Search Memories:**
```
/recall How do we validate opportunities?
```

**Analyze Code:**
```
/maya-pattern
[Select code to analyze for Maya-specific patterns]
```

## 🔧 Configuration Details

### MCP Server Configuration (.continue/config.json)

```json
{
  "mcpServers": {
    "private-journal": {
      "type": "stdio",
      "command": "node",
      "args": ["/workspace/backend/mcp-servers/private-journal/dist/index.js"],
      "env": {
        "JOURNAL_PATH": "/workspace/.private-journal"
      },
      "autoApprove": [
        "process_thoughts",
        "search_journal",
        "read_journal_entry",
        "list_recent_entries"
      ],
      "disabled": false
    }
  }
}
```

### Agent MCP Configuration (agents/*.yaml)

```yaml
mcpServers:
  - name: private-journal
    type: stdio
    command: node
    args: [/workspace/backend/mcp-servers/private-journal/dist/index.js]
    autoApprove: [process_thoughts, search_journal]
```

## 📝 Available MCP Tools

### process_thoughts
Store multi-section journal entries.

**Categories:**
- `feelings` - Emotional processing
- `project_notes` - Maya project insights
- `user_context` - Collaboration preferences
- `technical_insights` - Engineering learnings
- `world_knowledge` - Domain knowledge

**Example:**
```javascript
process_thoughts({
  technical_insights: "SmartValidator uses 7D scoring",
  project_notes: "Money Hunter integrates with existing AIX agents"
})
```

### search_journal
Semantic search across all journal entries.

**Parameters:**
- `query` (required) - Natural language search
- `limit` (optional) - Max results (default: 10)
- `type` (optional) - 'project', 'user', or 'both' (default: 'both')
- `sections` (optional) - Filter by categories

**Example:**
```javascript
search_journal({
  query: "authentication implementation patterns",
  limit: 5,
  type: "project"
})
```

### read_journal_entry
Read full content of specific entry.

**Parameters:**
- `path` (required) - File path from search results

### list_recent_entries
Browse recent entries chronologically.

**Parameters:**
- `limit` (optional) - Max entries (default: 10)
- `type` (optional) - Entry scope
- `days` (optional) - Days back (default: 30)

## 🗂️ Journal Structure

### Project Journal
```
.private-journal/
├── 2025-10-15/
│   ├── 14-30-45-123456.md
│   ├── 14-30-45-123456.embedding
│   └── ...
```

### Personal Journal (Optional)
```
~/.private-journal/
├── 2025-10-15/
│   ├── 14-32-15-789012.md
│   └── ...
```

### Entry Format
```markdown
---
title: "2:30:45 PM - Oct 15, 2025"
date: 2025-10-15T14:30:45.123Z
timestamp: 1729012245123
---

## Technical Insights

The SmartValidator implements 7-dimensional scoring...

## Project Notes

Money Hunter system successfully integrated...
```

## 🔍 Troubleshooting

### MCP Server Not Starting

1. **Check Node.js:**
   ```bash
   node --version  # Should be v18+
   ```

2. **Rebuild Server:**
   ```bash
   cd backend/mcp-servers/private-journal
   npm install
   npm run build
   ```

3. **Test Manually:**
   ```bash
   node dist/index.js
   ```

### Tools Not Appearing in Continue

1. **Restart Continue:**
   - Close and reopen Continue sidebar
   - Or reload VS Code/Cursor

2. **Check Configuration:**
   ```bash
   cat .continue/config.json | grep "mcpServers" -A 20
   ```

3. **Verify Server Path:**
   ```bash
   ls -la backend/mcp-servers/private-journal/dist/index.js
   ```

### Semantic Search Not Working

1. **Check Embeddings:**
   ```bash
   cd backend/mcp-servers/private-journal
   npm run build
   ```

2. **Verify Transformers Model:**
   - First run downloads ~50MB model
   - Check: `~/.cache/huggingface/`

3. **Test Search:**
   ```bash
   node dist/index.js  # Should show "Checking for missing embeddings..."
   ```

## 🎯 Best Practices

### What to Store in Journal

**✅ DO Store:**
- Architectural decisions and rationale
- Problem-solving processes
- Implementation strategies
- Debugging discoveries
- Pattern learnings
- User preferences
- Project conventions

**❌ DON'T Store:**
- Secrets, API keys, passwords
- Trivial fixes (typos)
- Temporary debugging logs
- External library documentation (use docs instead)

### Effective Journal Queries

**Good Queries:**
```
"How did we implement authentication with JWT and Redis?"
"What patterns do we use for error handling in Express?"
"React state management approach in Maya frontend"
"SwiftUI MVVM patterns from iOS implementation"
```

**Poor Queries:**
```
"code"  # Too vague
"bug"   # Not specific
"fix"   # Missing context
```

### Journal Maintenance

1. **Regular Review:**
   - Weekly: Review recent entries
   - Monthly: Consolidate related insights
   - Quarterly: Archive outdated patterns

2. **Keep Organized:**
   - Use consistent categories
   - Write clear, searchable titles
   - Include code examples with context

3. **Backup Important Insights:**
   ```bash
   # Backup project journal
   tar -czf journal-backup-$(date +%Y%m%d).tar.gz .private-journal/
   ```

## 📊 Performance Tips

### Optimize Search Speed
- Keep journal entries focused (< 1000 words)
- Use specific categories
- Limit search results (5-10)
- Archive old entries periodically

### Reduce Memory Usage
- Disable unused MCP servers
- Clear embedding cache if needed
- Use project journals for team work
- Use personal journals for private thoughts

## 🔐 Security Notes

### Privacy
- ✅ All processing is **local** (no external APIs)
- ✅ Embeddings generated on your machine
- ✅ No telemetry or analytics
- ✅ Open source MIT licensed

### Git Ignore
Add to `.gitignore`:
```
.private-journal/
*.embedding
```

Prevent committing private thoughts!

## 🆘 Support

### Documentation
- [Full MCP Integration Guide](../backend/mcp-servers/MCP_INTEGRATION_GUIDE.md)
- [Private Journal README](../backend/mcp-servers/private-journal/README.md)
- [Continue Agents README](./agents/README.md)

### Issues
- MCP Server: Check `backend/mcp-servers/private-journal/`
- Continue Config: Check `.continue/config.json`
- Agent Config: Check `.continue/agents/*.yaml`

### Quick Diagnostics
```bash
# Run full diagnostic
cd /workspace
./backend/mcp-servers/setup-mcp-servers.sh
./backend/mcp-servers/test-private-journal.js
```

---

**MCP Integration Complete** ✅  
**Ready for Persistent AI Memory** 🧠✨
