# 🤖 Continue Agents - Maya Travel Agent Project

Specialized AI agents for the Maya Travel Agent project with MCP integration for persistent memory and pattern learning.

## 📦 Available Agents

### 1. **Maya Travel Agent Assistant** (Primary)
**File:** `maya-travel-agent.yaml`  
**Status:** ✅ Ready

**Specialization:**
- Full-stack development for Maya Travel Agent
- AIX v3.0 agent configuration
- Backend (Node.js + Express) layered architecture
- Frontend (React + TypeScript) patterns
- iOS (SwiftUI + MVVM) development
- Money Hunter system integration

**Models:**
- Primary: Claude Sonnet 4 (chat, edit, reasoning)
- Secondary: Qwen3 Coder 30B (fast implementation)
- Tertiary: GPT-5 (complex reasoning)
- Autocomplete: QwenCoder 2.5 (7B)
- Apply: Relace Instant Apply
- Embed: Voyage Code 3

**MCP Tools:**
- ✅ Private Journal (journaling, semantic search, memory)
- ✅ Pattern Learning (pattern recognition and application)

**Custom Commands:**
- `/remember` - Store insights in journal
- `/recall` - Search journal memories
- `/maya-pattern` - Analyze Maya-specific patterns
- `/aix-agent` - Generate AIX v3.0 configurations
- `/money-hunter` - Analyze revenue opportunities

---

### 2. **Code Reviewer**
**File:** `code-reviewer.yaml`  
**Status:** ✅ Ready

**Specialization:**
- Comprehensive code review
- Security audits
- Quality assurance
- Performance analysis
- Pattern validation

**Models:**
- Claude Sonnet 4 (primary review)
- GPT-5 (security audit)

**Custom Commands:**
- `/review` - 7-dimensional code review
- `/security-audit` - Security-focused analysis

**Review Dimensions:**
1. Code Quality
2. Performance
3. Security
4. Architecture
5. Testing
6. Documentation
7. Error Handling

---

### 3. **Pattern Learner**
**File:** `pattern-learner.yaml`  
**Status:** ✅ Ready

**Specialization:**
- Learn coding patterns from codebase
- Apply learned patterns intelligently
- Discover architectural patterns
- Store best practices

**Models:**
- Qwen3 Coder 30B (pattern analysis)
- Claude Sonnet 4 (deep learning & synthesis)

**Custom Commands:**
- `/learn` - Extract and store patterns
- `/apply` - Apply learned patterns
- `/discover` - Discover patterns in codebase

**Pattern Categories:**
- Architectural patterns
- Design patterns
- Coding conventions
- Error handling
- Testing patterns
- Performance optimizations
- Security practices

---

## 🚀 Quick Start

### Using Agents in Continue

1. **Select Agent from Dropdown:**
   - Open Continue sidebar
   - Click agent selector
   - Choose desired agent (Maya Travel Agent, Code Reviewer, etc.)

2. **Agent Auto-Loads:**
   - Appropriate models for the task
   - MCP tools (Private Journal, Pattern Learning)
   - Custom commands specific to agent role

3. **Use Custom Commands:**
   ```
   /remember This AIX agent uses semantic vectors for routing
   /recall How do we structure AIX agents?
   /maya-pattern [select code to analyze]
   ```

### Command Examples

**Store a Technical Insight:**
```
/remember The SmartValidator uses 7-dimensional scoring:
1. Technical feasibility
2. Revenue potential
3. Time investment
4. Skill match
5. Client quality
6. Risk level
7. Strategic alignment
```

**Search for Past Solutions:**
```
/recall How did we implement the Money Hunter validation system?
```

**Analyze Maya Patterns:**
```
/maya-pattern
[Select code from backend/agents/ or frontend/src/]
```

**Learn a Pattern:**
```
/learn
[Select code demonstrating a pattern]
```

**Apply Learned Pattern:**
```
/apply authentication middleware pattern
[In new file where pattern should be applied]
```

---

## 🔌 MCP Integration

All agents have access to these MCP servers:

### Private Journal MCP
**Location:** `/workspace/backend/mcp-servers/private-journal/`

**Tools Available:**
- `process_thoughts` - Multi-section journaling
- `search_journal` - Semantic search
- `read_journal_entry` - Read specific entries
- `list_recent_entries` - Browse recent entries

**Journal Categories:**
- **feelings** - Emotional processing
- **project_notes** - Maya-specific insights
- **user_context** - Collaboration preferences
- **technical_insights** - Engineering learnings
- **world_knowledge** - Domain knowledge

### Pattern Learning Journal
**Location:** `/workspace/backend/mcp-servers/pattern-learning-journal/`

**Tools Available:**
- `store_pattern` - Save coding pattern
- `search_patterns` - Find relevant patterns
- `apply_pattern` - Apply pattern to code
- `list_patterns` - Browse all patterns

---

## 🎯 Model Recommendations

Based on Continue's official recommendations:

### Agent Plan (Planning & Reasoning)
**Closed Models (Best):**
- ✅ Claude Opus 4.1
- ✅ Claude Sonnet 4 (Currently using)
- ✅ GPT-5 (Currently using)
- ✅ Gemini 2.5 Pro

**Open Models (Alternative):**
- Qwen3 Coder (480B)
- Qwen3 Coder (30B) - Currently using
- Kimi K2 (1T)

### Chat/Edit
**Closed Models:**
- ✅ Claude Sonnet 4 (Primary)
- GPT-5
- Gemini 2.5 Pro

**Open Models:**
- ✅ Qwen3 Coder (30B) (Secondary)
- gpt-oss (120B)

### Autocomplete
**Closed Models:**
- Codestral
- Mercury Coder

**Open Models:**
- ✅ QwenCoder 2.5 (7B) (Currently using)
- QwenCoder 2.5 (1.5B)

### Embeddings
**Closed Models:**
- ✅ Voyage Code 3 (Recommended)
- Morph Embeddings
- Codestral Embed

**Open Models:**
- Nomic Embed Text
- Qwen3 Embedding

---

## 🔧 Configuration

### Adding New Agent

1. **Create Agent File:**
   ```bash
   touch .continue/agents/my-agent.yaml
   ```

2. **Define Agent Structure:**
   ```yaml
   name: My Agent
   version: 1.0.0
   schema: v1
   
   models:
     - name: Claude Sonnet 4
       provider: anthropic
       model: claude-sonnet-4-20250514
   
   mcpServers:
     - name: private-journal
       type: stdio
       command: node
       args: [/workspace/backend/mcp-servers/private-journal/dist/index.js]
   
   customCommands:
     - name: my-command
       description: Custom command
       prompt: "Do something with: {{{ input }}}"
   ```

3. **Reload Continue:**
   - Agent appears in dropdown automatically

### Updating Existing Agent

1. Edit the `.yaml` file
2. Save changes
3. Continue auto-reloads configuration

---

## 📊 Model Orchestration

Agents automatically select the best model for each task:

| Task | Model | Why |
|------|-------|-----|
| Architecture Design | Claude Sonnet 4 | Superior reasoning |
| Fast Implementation | Qwen3 Coder 30B | Speed + quality balance |
| Security Audit | GPT-5 | Deep security analysis |
| Code Completion | QwenCoder 2.5 (7B) | Very fast, accurate |
| Code Transformation | Relace Instant Apply | Instant apply capability |
| Semantic Search | Voyage Code 3 | Code-optimized embeddings |

---

## 💾 Persistent Memory Workflow

### How It Works

1. **During Development:**
   - Agent encounters significant decision
   - Auto-stores in Private Journal via MCP
   - Categorizes by type (technical, project, user preference)

2. **Before New Tasks:**
   - Agent searches journal for relevant context
   - Loads past learnings and patterns
   - Applies proven solutions

3. **Learning Over Time:**
   - Patterns reinforced through usage
   - User corrections stored as preferences
   - Codebase knowledge accumulates

### Example Flow

```
User: "Implement user authentication for Maya"

Agent thinks:
1. Search journal: "authentication implementation patterns"
2. Finds: "We use JWT with Redis session storage"
3. Finds: "Prefer bcrypt for password hashing"
4. Applies learned patterns automatically
5. Implements using proven approach
6. Stores new insights: "Added rate limiting to auth endpoints"
```

---

## 🛡️ Security & Privacy

### Journal Privacy
- ✅ All processing happens **locally**
- ✅ No external API calls for embeddings
- ✅ Journal files stored in `.private-journal/`
- ✅ Add to `.gitignore` to prevent commits

### Best Practices
1. **Never store secrets** in journal
2. **Use project journals** for team-shareable insights
3. **Use personal journals** for private reflections
4. **Regular backups** of important insights

---

## 📚 Resources

### Documentation
- [MCP Integration Guide](../mcp-servers/MCP_INTEGRATION_GUIDE.md)
- [Private Journal README](../mcp-servers/private-journal/README.md)
- [Continue Official Docs](https://docs.continue.dev/)
- [Model Recommendations](https://docs.continue.dev/customization/models)

### Project Files
- [AIX v3.0 Documentation](../../../AIX_V3_COMPLETE_DOCUMENTATION_INDEX.md)
- [Maya Travel Agent README](../../../README.md)
- [Money Hunter System](../../../backend/src/agents/README.md)

---

## 🎯 Next Steps

1. **✅ Agents Created** - Ready to use
2. **🔄 Configure API Keys** - Add to environment
3. **🎮 Select Agent** - Choose from dropdown
4. **💬 Start Coding** - Use custom commands
5. **📝 Build Memory** - Store insights as you work
6. **🚀 Improve Over Time** - Agent learns your patterns

---

**Built for Maya Travel Agent Project**  
**Enhanced with MCP Persistent Memory** 🧠✨
