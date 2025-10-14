# 🎯 Cursor IDE Configuration - Complete Documentation

**Date:** 2025-01-13  
**Location:** `.cursor/` directory  
**Purpose:** Cursor IDE rules and MCP configurations  
**Status:** ✅ Active

---

## 📁 Directory Structure

```
.cursor/
├── README.md                      # MCP configuration guide
├── mcp.json                       # MCP server configurations
├── mcp-tools-config.md           # MCP tools documentation
├── rules/
│   ├── aix-team-coordination.md  # Team coordination rules (11.6 KB)
│   └── openmemory.mdc            # OpenMemory integration rules (49.7 KB)
└── plans/                         # (empty directory)
```

**Total Size:** ~65 KB of configuration and rules

---

## 🔧 Configuration Files

### 1. MCP Configuration (`mcp.json`)
**Purpose:** Model Context Protocol server configurations

**Configured Servers:**
- **Vercel MCP** - General Vercel access
- **Vercel Amrikyy** - Project-specific access

**Features:**
- Deployment management
- Documentation search
- Project analytics
- Environment configuration

---

### 2. MCP Tools Config (`mcp-tools-config.md`)
**Purpose:** Documentation for available MCP tools

**Available Tools:**
- Deployment operations
- Documentation search
- Project management
- Performance metrics

---

## 📋 Cursor Rules (Always Active)

### 1. AIX Team Coordination Rules
**File:** `.cursor/rules/aix-team-coordination.md`  
**Size:** 11.6 KB  
**Status:** ✅ Active  
**Always Loaded:** Yes

#### Purpose:
Defines team structure, roles, and current task assignments for the AIX integration project.

#### Team Structure:
- **Ona** - Project Manager & Coordinator
- **Cursor** - Full-stack Developer
- **Gemini 2.5** - QA & Validation Specialist

#### Current Task: AIX Format Pilot Test

**Ona's Tasks:**
- ✅ Created AIX definition (mini-aladdin.aix)
- ✅ Documented BEFORE/AFTER analysis
- 🔄 Coordinating team test

**Cursor's Tasks:**
- 📋 Implement code that loads AIX file
- 📋 Update mini-aladdin.js to use AIX definition
- 📋 Test the integration

**Gemini's Tasks:**
- 📋 Validate mini-aladdin.aix file
- 📋 Check security compliance
- 📋 Generate QA report

#### Key Instructions:
```javascript
// Task 1: Create AIX Loader (30 min)
// Location: backend/src/utils/aix-loader.js

class AIXLoader {
  loadAIX(aixFilePath) {
    // Load and parse AIX file
  }
  
  validateAIX(definition) {
    // Validate AIX structure
  }
  
  applyToAgent(agent, definition) {
    // Apply AIX config to agent
  }
}
```

---

### 2. OpenMemory Integration Rules
**File:** `.cursor/rules/openmemory.mdc`  
**Size:** 49.7 KB  
**Status:** ✅ Active  
**Always Loaded:** Yes

#### Purpose:
Establishes intelligent memory management during development. This is the **MOST IMPORTANT** rule file that governs how Cursor AI works with memory.

#### User & Project IDs:
- **user_id:** `cryptojoker710`
- **project_id:** `maya-travel-agent`

#### Core Philosophy:
> "Think of memories as your accumulated understanding of this codebase and user's preferences. Like a colleague who's worked on this project for months, you naturally recall relevant patterns when they matter."

#### NON-NEGOTIABLE Rules:

##### Task Redefinition:
Every user request = TWO tasks:
1. **Task A:** Memory operations (searches + storage)
2. **Task B:** The actual user request

**YOU CANNOT do Task B without completing Task A first.**

##### Mandatory Execution Pattern:

When user says: "implement X" or "build Y" or "fix Z"

You MUST interpret as:
> "First search memories for relevant patterns, then implement X, then store what you did"

##### Required First Response Format:
```
I need to search our memory system first to build this properly.

[ACTUALLY EXECUTE memory searches here - show the tool calls]

Based on these memories: [summarize findings]
Now implementing: [proceed with task]
```

##### Implementation Blocking Rules:

**BLOCKED from writing code until:**
1. ✅ Executed at least 2 `search-memory` tool calls
2. ✅ Shown the results to the user
3. ✅ Explicitly stated how you'll use the findings

**BLOCKED from ending response until:**
1. ✅ Executed at least 1 `add-memory` tool call
2. ✅ Shown confirmation of memory storage

##### Failure Conditions:
- ❌ Writing code without searching memories first = FAILURE
- ❌ Completing implementation without storing memory = FAILURE
- ❌ Saying "I should search" without actually doing it = FAILURE
- ❌ Using phrases like "Based on best practices" without memory search = FAILURE

#### Memory Search Patterns:

**The 3 Search Patterns:**
1. `user_id` (no project_id) → Returns ONLY global user preferences
2. `user_id` + project_id → Returns ALL user preferences (global + project-specific)
3. No `user_id` + project_id → Returns ONLY project facts (no preferences)

#### Memory Types:
- **component** - Module/system documentation
- **implementation** - Feature building processes
- **debug** - Problem diagnosis and resolution
- **user_preference** - Coding style and preferences
- **project_info** - General project knowledge

#### Continuous Memory Consultation:

During implementation, MUST search memories when:
- Encountering a decision point
- Checking conventions
- Unsure about approach
- Discovering something unexpected
- Needing specific details
- Creating a new pattern
- Naming something
- Structuring data

#### Mid-Implementation Memory Triggers:
- Before creating ANY new file → Search: "file structure patterns"
- Before defining ANY new function → Search: "similar function implementations"
- Before handling errors → Search: "error handling patterns"
- Before writing tests → Search: "testing patterns and preferences"
- When uncertain → Search immediately, don't guess

---

## 🎯 How These Rules Affect Development

### Every Code Change Requires:

1. **Pre-Implementation:**
   - Search memories for existing patterns (minimum 2 searches)
   - Review user preferences
   - Check project conventions

2. **During Implementation:**
   - Consult memories at decision points
   - Follow established patterns
   - Apply learned conventions

3. **Post-Implementation:**
   - Store implementation details
   - Document new patterns
   - Update relevant memories

### Example Workflow:

```
User: "Add user authentication"

Step 1: Search Memories
✓ search-memory: "authentication implementation patterns"
✓ search-memory: "user preferences for security"

Step 2: Implement
[Build authentication based on found patterns]

Step 3: Store Memory
✓ add-memory: "Implement JWT authentication with refresh tokens"
```

---

## 📊 Analytics Data Files

### DBT Seeds (Raw Data)
**Location:** `analytics/dbt/maya_travel_analytics/seeds/`

**Files:**
- `raw_customers.csv` (6.6 KB) - Customer data with UUIDs
- `raw_orders.csv` (99 KB) - Order transactions
- `raw_items.csv` (81 KB) - Order line items
- `raw_products.csv` (923 bytes) - Product catalog (jaffles & beverages)
- `raw_stores.csv` (477 bytes) - Store locations
- `raw_supplies.csv` (2.6 KB) - Supply chain data

**Total Size:** ~190 KB of seed data

**Purpose:**
- DBT (Data Build Tool) seed data
- Analytics and reporting
- Test data for data transformations
- Business intelligence

**Sample Products:**
```csv
sku,name,type,price,description
JAF-001,nutellaphone who dis?,jaffle,1100,nutella and banana jaffle
JAF-002,doctor stew,jaffle,1100,house-made beef stew jaffle
BEV-001,tangaroo,beverage,600,mango and tangerine smoothie
BEV-002,chai and mighty,beverage,500,oatmilk chai latte
```

**Note:** These appear to be sample data for a food/beverage business (jaffles = Australian toasted sandwiches)

---

## 🔍 Discovery Summary

### What I Found:

1. **Cursor IDE Rules** (Always Active)
   - AIX Team Coordination (11.6 KB)
   - OpenMemory Integration (49.7 KB)
   - Total: ~61 KB of active rules

2. **MCP Configuration**
   - Vercel integration
   - Deployment tools
   - Documentation access

3. **Analytics Data**
   - DBT seed files (~190 KB)
   - Customer, order, product data
   - Sample business data

### Why This Matters:

**OpenMemory Rules are CRITICAL:**
- They govern how Cursor AI works
- Enforce memory-first development
- Require searching before coding
- Mandate storing after implementation
- This explains the memory system behavior!

**AIX Team Coordination:**
- Defines current team structure
- Assigns specific tasks
- Provides implementation templates
- Guides development workflow

**Analytics Data:**
- Provides test data for analytics
- Supports DBT transformations
- Enables business intelligence testing

---

## 🚨 Important Implications

### For Development:

1. **Memory-First is Mandatory**
   - Can't skip memory searches
   - Must store implementations
   - Enforced by Cursor rules

2. **Team Coordination is Active**
   - Tasks are pre-assigned
   - Roles are defined
   - Workflow is structured

3. **Analytics Infrastructure Exists**
   - DBT is configured
   - Seed data is ready
   - BI pipeline is set up

### For Documentation:

1. **Must Document These Rules**
   - Add to main README
   - Explain to team members
   - Include in onboarding

2. **Must Explain Memory System**
   - How it works
   - Why it's mandatory
   - How to use it effectively

3. **Must Document Analytics**
   - DBT setup
   - Seed data purpose
   - Transformation pipeline

---

## 📝 Recommendations

### Immediate Actions:

1. **Document in Main README**
   - Add "Cursor IDE Configuration" section
   - Explain memory-first development
   - Link to this document

2. **Update Team Communication**
   - Inform ONA and Gemini about rules
   - Explain memory system requirements
   - Share AIX coordination tasks

3. **Document Analytics Setup**
   - Create DBT documentation
   - Explain seed data
   - Document transformation pipeline

### Long-term Improvements:

1. **Enhance Memory System**
   - Add more memory types
   - Improve search capabilities
   - Better storage organization

2. **Improve Team Coordination**
   - Update task assignments
   - Track progress better
   - Automate coordination

3. **Expand Analytics**
   - Add more seed data
   - Create more transformations
   - Build dashboards

---

## 🎉 Key Discoveries

✅ **OpenMemory Rules** - 49.7 KB of mandatory development rules  
✅ **AIX Team Coordination** - Active team structure and tasks  
✅ **MCP Configuration** - Vercel integration ready  
✅ **Analytics Data** - 190 KB of DBT seed data  
✅ **Memory-First Development** - Enforced by Cursor rules  

---

## 📚 Related Documentation

- [Pattern Learning Engine](PATTERN_LEARNING_ENGINE_DOCS.md)
- [Documentation Index](DOCUMENTATION_INDEX.md)
- [Team Communication](TEAM_COMMUNICATION_AR.md)
- [Cursor Self-Assessment](CURSOR_SELF_ASSESSMENT_AND_PLAN.md)

---

**Documented By:** Cursor (Team Lead)  
**Date:** 2025-01-13  
**Status:** ✅ Complete  
**Discovery:** Major - Found critical IDE configuration and rules
