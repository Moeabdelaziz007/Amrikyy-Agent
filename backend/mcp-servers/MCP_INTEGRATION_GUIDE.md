# 🔌 MCP Servers Integration Guide

## Overview

This directory contains Model Context Protocol (MCP) servers that enhance AI capabilities with specialized tools and persistent memory.

## 📦 Available MCP Servers

### 1. **Private Journal MCP** 
**Location:** `private-journal/`  
**Status:** ✅ Installed & Built  
**Version:** 1.0.0

**Capabilities:**
- 📝 Multi-section private journaling (feelings, project notes, technical insights, etc.)
- 🔍 Semantic search across all entries using local AI embeddings
- 📚 Persistent memory across conversations
- 🔒 Completely private - all processing happens locally

**Tools Available:**
- `process_thoughts` - Multi-section journaling
- `search_journal` - Semantic search with natural language queries
- `read_journal_entry` - Read specific entry content
- `list_recent_entries` - Browse recent entries chronologically

**Usage Example:**
```javascript
// Store a technical insight
await process_thoughts({
  technical_insights: "Discovered that the SmartValidator uses 7-dimensional scoring for opportunity validation. The weighted algorithm significantly improves approval accuracy."
});

// Search for related insights later
await search_journal({
  query: "opportunity validation approach",
  limit: 5
});
```

---

### 2. **Pattern Learning Journal**
**Location:** `pattern-learning-journal/`  
**Status:** ✅ Available

**Capabilities:**
- 🎯 Store coding patterns and best practices
- 🔄 Track architectural decisions
- 📊 Learn from user preferences

---

## 🚀 Quick Start

### Running Individual MCP Server

```bash
# Private Journal
cd backend/mcp-servers/private-journal
npm start

# Pattern Learning Journal  
cd backend/mcp-servers/pattern-learning-journal
npm start
```

### Integration with Cursor/Claude

Add to your MCP settings file:

**Location:** `~/.config/cursor/mcp-settings.json` or Claude Desktop config

```json
{
  "mcpServers": {
    "private-journal": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/workspace/backend/mcp-servers/private-journal/dist/index.js"
      ],
      "autoApprove": [
        "process_thoughts",
        "search_journal",
        "read_journal_entry",
        "list_recent_entries"
      ]
    }
  }
}
```

---

## 📂 Directory Structure

```
backend/mcp-servers/
├── mcp-config.json                    # MCP servers configuration
├── MCP_INTEGRATION_GUIDE.md          # This file
├── private-journal/                   # Private journaling server
│   ├── src/                          # TypeScript source
│   ├── dist/                         # Compiled JavaScript
│   ├── tests/                        # Test suite
│   ├── .private-journal/             # Local journal storage
│   ├── package.json                  # Dependencies
│   └── README.md                     # Detailed documentation
└── pattern-learning-journal/         # Pattern learning server
    └── ...
```

---

## 🔧 Configuration

### Private Journal Configuration

The journal automatically creates storage in:
- **Project journals:** `.private-journal/` in project root
- **Personal journals:** `~/.private-journal/` in user home

**Environment Variables (Optional):**
```bash
# Override default journal location
JOURNAL_PATH=/custom/path/to/journal

# Customize embedding model
EMBEDDING_MODEL=all-MiniLM-L6-v2
```

---

## 🎯 Use Cases

### For Maya Travel Agent Project

1. **Technical Decision Tracking**
   ```javascript
   process_thoughts({
     project_notes: "Implemented AIX v3.0 agent coordination. Chose decentralized swarm architecture over hierarchical to enable autonomous scaling.",
     technical_insights: "Semantic vectors improve agent matching by 40% compared to keyword-based routing."
   });
   ```

2. **User Preference Learning**
   ```javascript
   process_thoughts({
     user_context: "User prefers Arabic-first responses with cultural sensitivity. Budget-conscious travel style detected across multiple conversations."
   });
   ```

3. **Search Past Solutions**
   ```javascript
   search_journal({
     query: "how did we handle payment integration with Telegram",
     type: "project",
     limit: 3
   });
   ```

---

## 🧪 Testing

### Test Private Journal Server

```bash
cd backend/mcp-servers/private-journal
npm test
```

### Manual Testing

```bash
# Start server in debug mode
DEBUG=* node dist/index.js

# Server communicates via stdio (JSON-RPC)
# Test by sending MCP messages
```

---

## 📊 Performance

### Private Journal
- **Embedding generation:** ~100ms per entry (local AI)
- **Semantic search:** <50ms for 1000 entries
- **Storage:** ~1KB per entry + ~4KB per embedding
- **Memory usage:** ~200MB (embedding model loaded)

### Pattern Learning
- **Pattern storage:** <10ms
- **Search:** <20ms
- **Memory:** ~50MB

---

## 🛡️ Security & Privacy

### Private Journal
- ✅ All processing happens **locally** - no external API calls
- ✅ Journal files stored in **user-controlled directories**
- ✅ Embeddings generated using **local transformers**
- ✅ No telemetry or analytics
- ✅ MIT licensed - fully open source

### Best Practices
- Keep journal files in `.gitignore` to avoid committing private thoughts
- Use project journals for team-shareable insights
- Use personal journals for private reflections
- Regular backups recommended for important insights

---

## 🔄 Updates & Maintenance

### Updating Private Journal MCP

```bash
cd backend/mcp-servers/private-journal
git pull origin main
npm install
npm run build
```

### Adding New MCP Servers

1. Create new directory: `backend/mcp-servers/new-server/`
2. Install/develop server following MCP spec
3. Add configuration to `mcp-config.json`
4. Update this guide

---

## 📚 Resources

### Official Documentation
- [MCP Specification](https://modelcontextprotocol.io/)
- [Private Journal MCP GitHub](https://github.com/obra/private-journal-mcp)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)

### Related Files in Project
- `backend/src/aix/MCPProtocol.js` - MCP protocol implementation
- `backend/src/aix/MCPAgentServer.js` - MCP agent server
- `backend/src/ai/mcpTools.js` - MCP tools for Maya AI

---

## 🎯 Integration Roadmap

### ✅ Phase 1: Complete
- [x] Install Private Journal MCP
- [x] Build and compile TypeScript
- [x] Create configuration files
- [x] Write integration guide

### 🔄 Phase 2: In Progress
- [ ] Test journal storage and retrieval
- [ ] Configure semantic search
- [ ] Integrate with main backend server
- [ ] Add journal endpoint to API

### 📋 Phase 3: Planned
- [ ] Web dashboard for journal entries
- [ ] Export/import capabilities
- [ ] Team-shared knowledge base
- [ ] Analytics on learning patterns

---

## 🤝 Contributing

To add or improve MCP servers:
1. Create feature branch
2. Add server to `mcp-servers/`
3. Update `mcp-config.json`
4. Add documentation to this guide
5. Submit PR

---

**Built with ❤️ for enhanced AI capabilities**  
**Maya Travel Agent Project**
