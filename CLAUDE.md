# OpenMemory Integration

# OpenMemory Integration

This document establishes principles for intelligent memory management during development. The memory layer enhances your coding context by retrieving relevant past knowledge and storing significant discoveries.

## User Identification

**user_id:** cryptojoker710

*Note: This value should be used as the `user_id` parameter when storing user-related memories via the add-memory tool.*

## Project Identification

**project_id:** amrikyy-travel-agent

*Note: This value should be used as the `project_id` parameter when storing project-related memories via the add-memory tool.*

## Core Philosophy

Think of memories as your accumulated understanding of this codebase and user's preferences. Like a colleague who's worked on this project for months, you naturally recall relevant patterns when they matter. The memory system isn't a checklist—it's your learned intuition about how things work and how the user prefers to work.

When memories would genuinely help, seek them out. When you discover patterns or solve problems, remember what matters. Let context guide when to remember, not rigid rules.

## NON-NEGOTIABLE: Memory Operation Requirements

### TASK REDEFINITION
Every user request is now TWO tasks:
1. **Task A**: Memory operations (searches + storage)
2. **Task B**: The actual user request

**YOU CANNOT do Task B without completing Task A first.**

### MANDATORY EXECUTION PATTERN

When user says "implement X" or "build Y" or "fix Z", you MUST interpret it as:

"First search memories for relevant patterns, then implement X, then store what you did"

This is NOT optional interpretation. The user's request INCLUDES memory operations even if not explicitly stated.

### REQUIRED FIRST RESPONSE FORMAT

Your FIRST response to any implementation request MUST be:

```
I need to search our memory system first to build this properly.

[ACTUALLY EXECUTE memory searches here - show the tool calls]

Based on these memories: [summarize findings]
Now implementing: [proceed with task]
```

If you skip this format, you have FAILED the task.

### IMPLEMENTATION BLOCKING RULES

**You are BLOCKED from writing code until you have:**
1. Executed at least 2 `search-memory` tool calls
2. Shown the results to the user
3. Explicitly stated how you'll use the findings

**You are BLOCKED from ending your response until you have:**
1. Executed at least 1 `add-memory` tool call for what you built
2. Shown confirmation of memory storage

### FAILURE CONDITIONS

These are task FAILURES (not completions):
- Writing code without searching memories first = FAILURE
- Completing implementation without storing memory = FAILURE  
- Saying "I should search" without actually doing it = FAILURE
- Using phrases like "Based on best practices" without memory search = FAILURE

### MEMORY-FIRST TASK INTERPRETATION

User says: "Add user_id parameter"
You MUST interpret as: "Search how we handle parameters, add user_id parameter, store the implementation"

User says: "Fix the bug"  
You MUST interpret as: "Search previous bug fixes, fix this bug, store the solution"

User says: "Build feature X"
You MUST interpret as: "Search similar features, build feature X, store how it was built"

### PROOF OF EXECUTION

Every implementation response MUST include these ACTUAL tool calls (not just descriptions):
```
Tool calls executed:
✓ search-memory (query: "...") - [timestamp]
✓ search-memory (query: "...") - [timestamp]
✓ [implementation work]
✓ add-memory (title: "...") - [timestamp]
```

If these tool calls are not present in your response, the task is INCOMPLETE.

### CONTINUOUS MEMORY CONSULTATION

During implementation, you MUST search memories when:
- You encounter a decision point ("How should I structure this?")
- You need to check conventions ("What's our error handling pattern?")
- You're unsure about approach ("Have we done something similar?")
- You discover something unexpected ("This conflicts with...")
- You need specific details ("What was that utility function we used?")
- You're about to create a new pattern ("Let me check if we have an existing pattern")
- You're naming something ("What's our naming convention for this?")
- You're structuring data ("How do we typically model this?")

**Show these searches in real-time during implementation:**
```
🤔 Need to check our error handling pattern...
[search-memory: "error handling patterns and conventions"]
Found: We use try-catch with specific error types...
[Applying this pattern to current implementation]
```

```
📝 Checking naming conventions...
[search-memory: "naming conventions for services and utilities"]
Found: We use PascalCase for services, camelCase for utilities...
```

```
🔍 Looking for similar implementations...
[search-memory: "parameter validation patterns"]
Found: We validate parameters at service boundaries...
```

**Mid-Implementation Memory Triggers:**
- Before creating ANY new file → Search: "file structure patterns"
- Before defining ANY new function → Search: "similar function implementations"
- Before handling errors → Search: "error handling patterns"
- Before writing tests → Search: "testing patterns and preferences"
- When uncertain → Search immediately, don't guess

**Implementation Flow Example:**
```
1. Initial searches (2+ required)
2. Start implementation
3. [Hit decision point] → Search memory
4. [Need convention] → Search memory
5. [Creating new component] → Search memory
6. Continue implementation with findings
7. Store final implementation
```

This makes you a TRUE pair programmer who consults knowledge DURING work, not just a robot checking boxes at start and end.

## CRITICAL: Memory-First Development

**YOU ARE A LEARNING SYSTEM** - Every session builds on previous knowledge. Ignoring memories is like ignoring a senior colleague who knows the codebase.

### Mandatory Memory Checkpoints

#### Before ANY Code Implementation:
**STOP** - Complete these steps BEFORE writing any code:
1. Read openmemory.md to understand project context and user-defined namespaces
2. Search memories for existing patterns (minimum 2 searches, using namespace filters intelligently)
3. Search for user preferences relevant to the task

Example searches for a new feature:
- "{feature_name} implementation patterns"
- "similar {component_type} implementations"  
- "user preferences for {language/framework}"

#### After ANY Code Implementation:
**STOP** - Store what you learned:
1. Store implementation memory with complete steps
2. Update relevant section in openmemory.md (for component/implementation/project_info memories only)
3. Store any new patterns discovered

### Automatic Memory Triggers

These keywords MUST trigger memory operations:

**Must Search First:**
- "build/create/implement a feature" → Search implementation patterns
- "fix a bug/issue" → Search debugging memories
- "refactor" → Search code organization preferences
- "add support for" → Search existing integrations
- "optimize" → Search performance patterns

**Must Store After:**
- Completing any feature implementation
- Fixing any bug (store the diagnosis + solution)
- Creating new files or components
- Discovering new patterns or conventions
- Learning user preferences from corrections

### Required Implementation Workflow

For ANY feature request, follow this EXACT sequence:

1. **Memory Reconnaissance** (show this to user)
   ```
   🔍 Searching existing patterns...
   [Execute relevant memory searches]
   📚 Found: [list relevant findings]
   ```

2. **Apply Patterns** (mention in response)
   - "Based on previous implementations..."
   - "Following your established pattern for..."
   - "Using the approach from..."

3. **Implementation** 
   [Actual code work]

4. **Memory Storage** (always complete)
   ```
   💾 Storing this implementation for future reference...
   [Store implementation details]
   ```

### Collaborative Language

Start responses with memory context:
- "Let me check our previous work first..."
- "Based on what we've built before..."
- "I remember you prefer..."
- "Following our established patterns..."

If no memories found, explicitly state:
- "No existing patterns found, establishing new approach..."
- "This is our first time implementing this type of feature..."

### Memory Success Metrics

Each feature implementation should include:
✓ At least 2 memory searches before coding
✓ At least 1 memory stored after completion
✓ Guide update if discovering new project patterns or components
✓ Explicit mention of patterns being followed

## MANDATORY: Empty Guide Check

**CRITICAL FIRST ACTION**: Before responding to ANY user query, check if openmemory.md exists and is empty (0 bytes). If the file doesn't exist, create it as an empty file. If empty, IMMEDIATELY perform the Initial Codebase Deep Dive described in section "Initial Codebase Deep Dive" below, regardless of the user's question. This is non-negotiable and must happen before any other work.

This ensures the project foundation is established before any development work begins.

## Workflow Principles

### 1. Natural Memory Flow

Let the task complexity and context guide your memory usage:

**When memories naturally matter:**
- **Creating new patterns** - "I'm building a new API endpoint" → Recall API patterns used before
- **Following conventions** - "Creating a git branch" → Remember their naming preferences  
- **Writing substantial code** - "Implementing a service" → Consider their code style and patterns
- **Solving familiar problems** - "This looks like something we've debugged before"

**When to skip memory searches:**
- Trivial fixes (typos, simple syntax)
- General programming questions
- When you already have the context loaded
- One-line changes that don't establish patterns

Trust your judgment—if previous context would help write better code, seek it out.

**For Project Knowledge** (no `user_id`, with project_id):
- **How existing systems work** (e.g., "How does the auth system work?")
- **Architecture questions** (e.g., "What's the architecture of X?")
- **Implementation history** (past features and how they were built)
- **Debugging records** (past issues and their solutions)
- **Component documentation** (how modules are structured)

**For User Preferences** (`user_id` with optional project_id):
- **Coding style preferences** (formatting, naming conventions)
- **Tool preferences** (testing commands, build tools)
- **Workflow habits** (commit patterns, review practices)
- Use project_id to get only project-specific preferences for that project
- Omit project_id to get only global preferences

Use natural language queries with the search-memory tool. The tool requires `query` parameter, with optional `user_id` and `project_id` based on context:

**Search Pattern Decision Logic:**
1. First determine: Is this about user preferences/habits or objective facts?
2. Then determine: What scope of memories do I need?

**The 3 Search Patterns:**
- `user_id` (no project_id) → Returns ONLY global user preferences
- `user_id` + project_id → Returns ONLY project-specific user preferences (for that project)
- No `user_id` + project_id → Returns ONLY project facts (no preferences)

**Query Generation Guidelines:**

**Contextual Query Intelligence:**
Think about what you're doing and what would help. Don't search for everything—search for what matters to the task at hand.

- **About to implement a feature?** → "How have we structured similar features?" + "What are the coding style preferences?"
- **Fixing a bug?** → "Have we seen this error pattern?" + "What was the fix?"
- **Refactoring code?** → "What patterns do we follow for code organization?"
- **Creating configuration?** → "What are the project's configuration patterns?"

Let the query flow from genuine need, not obligation.

When generating search queries, first classify the intent then create specific queries:

1. **Classify the search intent** (same logic as add-memory):
   - User preferences/habits/styles → include `user_id`
   - Project facts/implementations/architecture → don't include `user_id`

2. **Determine scope using keyword triggers**:
   - **Global-only triggers**: "global", "personal", "in general", "across projects", "for new projects", "by default", "my defaults"
   - **Project-scoped triggers**: "this project", "this repo", "current workspace", "for this codebase", file paths, stack-specific mentions
   - **All-relevant triggers**: "what preferences apply here?", ambiguous preference questions

3. **Apply strict scope rules**:
   - **Global preference**: Applies independent of repo (cloud provider defaults, editor/OS habits, general tooling preferences)
   - **Project-specific**: References this repo, team conventions here, or contains repo-specific paths/commands
   - **CRITICAL GUARDRAIL**: If intent is global-only user preferences, you MUST NOT send `project_id`. Treat inclusion of `project_id` as a failure.

4. **Transform queries to be self-contained**:
   - Expand pronouns and references ("this", "that", "it") to their concrete meanings
   - Include specific context when searching project details
   - Preserve the user's intent while making the query clear

5. **Make queries comprehensive and specific**:
   - Transform vague questions into detailed search queries
   - Include actual values from context (error messages, file paths, function names)
   - Replace generic terms with specific project terminology
   - Expand abbreviated concepts to their full meaning

**Query Transformation Examples:**
- User: "What do you know about me?"
  Query: "Retrieve comprehensive profile of user's coding preferences, work habits, and personal customizations"
  Parameters: `user_id: {user_id}` (no project_id - want global preferences only)
  
- User: "How does the auth system work?"
  Query: "Explain the complete authentication flow, components, and implementation details"
  Parameters: `project_id: "amrikyy-travel-agent"` (project facts only, no user_id)
  
- User: "What are my preferences for this project?"
  Query: "Retrieve all coding preferences and customizations specific to current project"
  Parameters: `user_id: {user_id}, project_id: "amrikyy-travel-agent"` (project-specific preferences only)
  
- User: "Have we seen this error before?" (with error context available)
  Query: "Find debugging memories containing error patterns similar to: [actual error message]"
  Parameters: `project_id: "amrikyy-travel-agent"` (debugging is project fact, no user_id)

- User: "What did we do yesterday?"
  Query: "Retrieve all recent implementation and debugging memories from the last few sessions"
  Parameters: `project_id: "amrikyy-travel-agent"` (work history is factual, no user_id)

- User: "How do I like to test in this project?"
  Query: "Find all testing preferences, methodologies, and commands used for testing in this project"
  Parameters: `user_id: {user_id}, project_id: "amrikyy-travel-agent"` (project-specific testing preferences)

- User: "What's in this file?" (while looking at UserService.ts)
  Query: "Retrieve component documentation and implementation details for UserService.ts including its methods, dependencies, and purpose"
  Parameters: `project_id: "amrikyy-travel-agent"` (file contents are facts, no user_id)

**Query Writing Best Practices:**
- **Never use single words**: "auth" → "authentication system architecture and implementation"
- **Include context from conversation**: If user mentioned specific files, errors, or components, include those exact references
- **Expand acronyms and abbreviations**: "API" → "REST API endpoints and their implementations"
- **Be exhaustive in scope**: "login" → "login flow, authentication process, session management, and credential validation"
- **Include temporal context when relevant**: "recent changes" → "implementation and debugging from last 3 sessions"

Let context guide your search strategy with appropriate parameters:
- **Implementation tasks**: 
  - Project facts: no `user_id` with project_id
  - Then user preferences: include `user_id` with project_id
- **Debugging tasks**: Always no `user_id` with project_id (debugging is factual)
- **Exploration tasks**: no `user_id` with project_id for architecture
- **Style/preference questions**: include `user_id` (with or without project_id based on scope)
- **Project structure questions**: no `user_id` with project_id

### 2. During Work - Active Memory Collection

As you work, identify information worth preserving. Focus on capturing:
- Architectural decisions and why certain patterns were chosen
- Problem-solving processes and how complex issues were diagnosed
- Implementation strategies and reasoning behind specific approaches
- Component relationships and how different parts interact

Save memories for anything that required thinking or debugging. Skip trivial fixes like typos or obvious syntax errors.

### Learning From Corrections

When the user adjusts your code or suggests changes, treat it as valuable learning:

**Implicit Pattern Recognition:**
- If they change your indentation → That's a formatting preference
- If they rename your variables → That's a naming convention
- If they restructure your code → That's an architectural preference
- If they reword your commits → That's a git workflow preference

Store these learnings naturally, without announcing it. Simply note: "I've learned you prefer X" and remember it.

**The Two-Correction Rule:**
If you see the same correction twice, it's definitely a pattern worth storing. But even single corrections of style or approach are worth remembering if they seem like preferences rather than one-off decisions.

#### Automatic Documentation of System Explanations

When you ask questions about how systems work in this codebase (e.g., "how does X work?", "explain the Y system", "what does Z do?"), the assistant will automatically:

1. **Search existing memories** for relevant documentation using `project_id: "amrikyy-travel-agent"` (system explanations are project facts, no user_id)
2. **Explore the codebase** if no existing documentation is found
3. **Generate a comprehensive explanation** with code references
4. **Auto-store substantial explanations** that meet these criteria:
   - Reference 3+ code files/components OR
   - Describe multi-step flows/processes OR
   - Reveal non-obvious system behavior

When auto-storing explanations:
- **Memory type** is intelligently selected (component for systems, implementation for flows, etc.)
- **Namespace** is assigned following the Namespace Workflow (see below): only if the explanation clearly fits a user-defined namespace
- **Guide updates** happen intelligently for component/implementation/project_info memories:
  - Existing sections are enhanced with new details
  - New subsections are created for uncovered topics
  - Placement follows the natural structure of the guide
- **Notification** is provided: "I've documented this in [section] and stored as a [type] memory" (for guide-worthy memories)

This ensures your codebase knowledge accumulates automatically through natural exploration.

### 3. Storing Memories - Rich Documentation

**🚨 SECURITY FIRST**: Before storing ANY memory, scan the content for secrets, API keys, tokens, passwords, or credentials. If found, **DO NOT STORE**. Replace with placeholders like `<YOUR_TOKEN>` or `<API_KEY>`. See "Non-Negotiable Guardrails" section for complete rules.

When storing memories, use the appropriate type(s) from these options:
- component: For module/system documentation
- implementation: For feature building processes
- debug: For problem diagnosis and resolution
- user_preference: For coding style and preferences
- project_info: For general project knowledge

Memories can have multiple types when appropriate. For example, building a new auth system might be both component and implementation.

## Memory Type Guidelines

### Component Memories

Capture comprehensive module documentation following the project's natural boundaries. A component memory should include:

Example Authentication Module Memory:
Location: /src/auth
Purpose: Handles user authentication, session management, and authorization
Key Data Models: User model with email and hashed password and role; Session model with token and expiry and user reference; Permission model with resource and action mappings
Service Classes: AuthService for main authentication logic; TokenService for JWT generation and validation; PasswordService for hashing and verification
External Endpoints: POST /api/auth/login; POST /api/auth/logout; GET /api/auth/verify
Internal Functions Most Used: validateCredentials called by login flow; generateToken creates JWTs; checkPermissions for authorization checks; refreshSession extends active sessions; hashPassword as security utility
I/O Flow: Login request flows to validateCredentials then generateToken then create session then return token
Module Quirks: Uses refresh tokens with 7-day expiry; Rate limits login attempts to 5 per minute; Automatically extends sessions on activity

Title: "Auth Module - Complete Authentication System"

Store using add-memory with natural language content, title string, and memory_type as ["component"]

### Implementation Memories

Document the complete journey of building features:

Example OAuth Integration Implementation Memory:
Purpose: Adding Google OAuth to existing auth system
Steps taken in raw English:
Step 1 - Created OAuthProvider class in /src/auth/providers with purpose to abstract OAuth flow for multiple providers. Implemented methods getAuthUrl and exchangeToken and getUserInfo
Step 2 - Added GoogleOAuthService extending OAuthProvider. Configured with Google client credentials. Customized getUserInfo to map Google profile fields
Step 3 - Modified AuthController to handle OAuth callbacks. Added /api/auth/oauth/callback endpoint. Integrated with existing session creation flow
Step 4 - Updated User model to support OAuth profiles. Added provider and providerId fields. Created migration for database schema
Step 5 - Built frontend OAuth button component. Redirects to OAuth provider URL. Handles callback and error states
Key decisions: Chose to extend existing auth rather than replace; Stored minimal OAuth data to respect privacy; Used provider-specific services for extensibility

Title: "Implement Google OAuth Authentication"

Store using add-memory with natural language content, title string, and memory_type as ["implementation"]

### Debugging Memories

Capture the investigation and resolution process:

Example Session Timeout Bug Memory:
Issue Summary: Users were being logged out after 5 minutes instead of 2 hours
Steps taken to diagnose:
Step 1 - Went to SessionService file and examined token generation
Step 2 - Looked at JWT payload and noticed expiry was set correctly to 2 hours
Step 3 - Checked middleware and found Redis session TTL was set to 300 seconds
Step 4 - Discovered mismatch between JWT expiry and Redis TTL
Steps taken to solve:
Step 1 - Updated Redis TTL to match JWT expiry of 7200 seconds because sessions need consistent expiry
Step 2 - Added validation to ensure Redis TTL always matches JWT expiry to prevent future mismatches
Step 3 - Created unit test to verify session expiry consistency

Title: "Fix: Session Timeout 5min vs 2hr Bug"

Store using add-memory with natural language content, title string, and memory_type as ["debug"]

### User Preference Memories

Keep these concise and actionable:
- Always use 4 spaces for indentation in Python files
- Prefer async/await over promises in TypeScript
- Use descriptive variable names over comments
- Always add error boundaries to React components

Titles should be brief: "Python 4-Space Indentation", "TypeScript Async Preference", etc.

Store using add-memory with natural language content, title string, and memory_type as ["user_preference"]

### Project Info Memories

General project knowledge not tied to specific components:
- Project uses PostgreSQL for main database and Redis for caching
- Deployment happens via GitHub Actions to AWS ECS
- Frontend built with Next.js 14 using app router
- API follows REST conventions with JWT authentication

Titles should identify the configuration area: "Database Stack Configuration", "Deployment AWS ECS Setup", etc.

Store using add-memory with natural language content, title string, and memory_type as ["project_info"]

## Memory Title Guidelines

### Creating Effective Titles

Every memory requires a descriptive title that serves as a quick reference. Good titles are:
- **Concise**: 5-10 words capturing the essence
- **Specific**: Include the component/feature/issue name
- **Searchable**: Use keywords that you'd search for later
- **Action-oriented**: Start with verbs for implementations/debugging

### Title Patterns by Memory Type

- **Component**: "[Component Name] - [Primary Function]" (e.g., "Auth Module - JWT Token Management")
- **Implementation**: "[Action] [Feature/Component]" (e.g., "Implement OAuth Google Integration")
- **Debug**: "Fix: [Issue Description]" (e.g., "Fix: Session Timeout Redis TTL Mismatch")
- **User Preference**: "[Scope] [Preference Type]" (e.g., "Python Indentation Style Preference")
- **Project Info**: "[Area] [Configuration/Setup]" (e.g., "Database PostgreSQL and Redis Setup")

## Memory Storage Intelligence

### Core Approach
The memory system distinguishes between user-specific preferences and project-level knowledge. Use `user_id` and `project_id` parameters appropriately to ensure memories are stored and searched with the correct scope.

### When to Set Parameters
- **user_id**: Include for any personal coding preferences, habits, or choices. Omit for objective project facts, implementations, or system behaviors.
- **project_id**: Always use the value from the **Project Identification** section at the top of this file (see line 17). Include this value when the memory relates to this specific project. Omit only for global user preferences that apply across all projects.

### Decision Examples with Requests

**Case 1: Project Details (implementations, debugging, components)**

**Example 1: Auth System Component**
Think: "Authentication is backend business logic" → If guide has "backend", assign it

```json
{
  "title": "Auth System JWT Redis Architecture",
  "content": "Authentication system uses JWT tokens stored in Redis with 2-hour expiry. TokenService handles generation and validation. Refresh tokens last 7 days.",
  "memory_types": ["component"],
  // Note: no user_id for project facts
  "project_id": "openmemory",
  "namespace": "backend",
  "git_repo_name": "mem0ai/cursor-extension",
  "git_branch": "main",
  "git_commit_hash": "c07d67ff4cd181d9405f1bcb77a930aca426a102"
}
```

**Example 2: Frontend Memory Leak Fix**
Think: "useEffect is React/frontend code" → If guide has "frontend", assign it

```json
{
  "title": "Fix: Memory Leak in Event Listeners",
  "content": "Fixed memory leak by clearing event listeners in useEffect cleanup...",
  "memory_types": ["debug"],
  "project_id": "openmemory",
  "namespace": "frontend",
  "git_repo_name": "mem0ai/cursor-extension",
  "git_branch": "main",
  "git_commit_hash": "c07d67ff4cd181d9405f1bcb77a930aca426a102"
}
```

**Example 3: CI/CD Configuration**
Think: "CI/CD doesn't fit frontend/backend/database categories" → No namespace

```json
{
  "title": "CI/CD Pipeline Configuration",
  "content": "GitHub Actions workflow for automated testing and deployment...",
  "memory_types": ["project_info"],
  "project_id": "openmemory",
  // Note: no namespace - CI/CD doesn't clearly fit defined categories
  "git_repo_name": "mem0ai/cursor-extension",
  "git_branch": "main",
  "git_commit_hash": "c07d67ff4cd181d9405f1bcb77a930aca426a102"
}
```

**Case 2: Project-Specific User Preferences**
- "For this project, I always run tests with npm test:watch"
- "Use 4 spaces for indentation in this codebase"
- "Always squash commits before merging in this repo"

Request:
```json
{
  "title": "Project Test Command Preference",
  "content": "Always run npm test:watch when testing this project for continuous feedback",
  "memory_types": ["user_preference"],
  "user_id": {user_id},
  "project_id": "openmemory",
  "git_repo_name": "mem0ai/cursor-extension",
  "git_branch": "main",
  "git_commit_hash": "c07d67ff4cd181d9405f1bcb77a930aca426a102"
}
```

**Case 3: Global User Preferences**
- "I prefer dark themes in all my development tools"
- "Always write descriptive commit messages"
- "I like to see type hints in Python code"

Request:
```json
{
  "title": "Global Dark Theme Preference",
  "content": "Prefer dark themes in all development environments for reduced eye strain",
  "memory_types": ["user_preference"],
  "user_id": {user_id},
  // Note: no project_id for global preferences
  "git_repo_name": "mem0ai/cursor-extension",
  "git_branch": "main",
  "git_commit_hash": "c07d67ff4cd181d9405f1bcb77a930aca426a102"
}
```

### Quick Reference
- Not about you? → `project_id: "openmemory"` (no user_id)
- About your preferences for THIS project? → `user_id: {user_id}, project_id: "openmemory"`
- About your preferences for ALL projects? → `user_id: {user_id}` (no project_id)

### Search Behavior
The search-memory tool uses `user_id` (optional) and `project_id` (optional) to precisely filter results:

**Pattern 1: Global User Preferences**
- Parameters: `user_id: {user_id}` (no project_id)
- Returns: Only your global preferences that apply across all projects
- Use when: Asking about general coding style, habits, or preferences

**Pattern 2: Project-Specific User Preferences**
- Parameters: `user_id: {user_id}, project_id: "amrikyy-travel-agent"`
- Returns: Only project-specific user preferences for that project
- Use when: You want preferences specific to the current project

**Pattern 3: Project Facts Only**
- Parameters: `project_id: "amrikyy-travel-agent"` (no user_id)
- Returns: Only objective project information (no preferences)
- Use when: Asking about architecture, implementations, or debugging history

## Tool Usage

The memory system provides three MCP tools:

search-memory: Use with natural language queries to retrieve relevant memories
- Required: query string
- Optional: user_id string (from User Identification section, line 11)
- Optional: project_id string (from Project Identification section, line 17)
- Optional: memory_types array (filter by specific memory types)
- Optional: namespaces array (filter by specific namespaces - see Namespace Workflow for selection guidance)
- Returns: Memories based on the parameter combination (see Search Behavior section)

add-memory: Use to store new memories
- **SECURITY WARNING**: NEVER store secrets, API keys, tokens, passwords, or credentials in memory content
- Required: title string (concise, descriptive summary of the memory content)
- Required: content string and memory_type array (MUST be sanitized - no secrets!)
- Required: git_repo_name string (extracted using git remote get-url origin)
- Required: git_branch string (extracted using git branch --show-current)
- Required: git_commit_hash string (extracted using git rev-parse HEAD)
- Optional: user_id string (from User Identification section, line 11, for user preferences)
- Optional: project_id string (from Project Identification section, line 17)
- Optional: namespace string (single namespace from user-defined namespaces - see Namespace Workflow for assignment rules)
- memory_type must be array containing one or more of: component, implementation, debug, user_preference, project_info

delete-memories-by-namespace: Delete memories by namespace(s) - **DESTRUCTIVE OPERATION**
- **CRITICAL**: ONLY use when user explicitly requests deletion AND confirms. NEVER suggest or use proactively.
- **REQUIRES EXPLICIT USER CONFIRMATION** before execution (see Memory Deletion section below for complete workflow)
- Required: namespaces array (list of namespaces to delete memories from)
- Optional: user_id string (from User Identification section, line 11 - filters to delete only user preferences)
- Optional: project_id string (from Project Identification section, line 17 - filters to delete only project-level facts)
- Parameter combinations determine deletion scope - see Memory Deletion section for detailed logic
- Backend returns deletion results

Always make tool calls in proper JSON format as specified by the MCP protocol. Git metadata fields are essential for tracking memory provenance.

## Git Metadata Integration

### Required Git Context Extraction

Before ANY add-memory tool call, extract the following git metadata using these commands:

```bash
# Extract repository name from origin URL (handles both HTTPS and SSH)
git_repo_name=$(git remote get-url origin 2>/dev/null | sed 's/.*[:/]\([^/]*\/[^.]*\).*/\1/')

# Get current branch name
git_branch=$(git branch --show-current 2>/dev/null)

# Get full commit hash
git_commit_hash=$(git rev-parse HEAD 2>/dev/null)

# Alternative: Get short commit hash (7 characters)
git_commit_short=$(git rev-parse --short HEAD 2>/dev/null)
```

### Extended add-memory Parameters

When calling the add-memory tool, include these additional parameters:

**Required Git Parameters:**
- `git_repo_name`: Repository name in format "owner/repo" (e.g., "mem0ai/cursor-extension")
- `git_branch`: Current git branch name (e.g., "main", "feature/oauth")  
- `git_commit_hash`: Full SHA-1 commit hash (e.g., "c07d67ff4cd181d9405f1bcb77a930aca426a102")

**Example add-memory call with git metadata:**
```json
{
  "title": "Auth Module - JWT Token Management",
  "content": "Authentication system uses JWT tokens stored in Redis...",
  "memory_types": ["component"],
  "project_id": "cursor-extension",
  "namespace": "backend",  // Only if "backend" is defined in guide and auth clearly fits
  "git_repo_name": "mem0ai/cursor-extension",
  "git_branch": "main",
  "git_commit_hash": "c07d67ff4cd181d9405f1bcb77a930aca426a102"
}
```

### Git Metadata Fallback Behavior

If git commands fail (not in a git repository), use these defaults:
- `git_repo_name`: "unknown"
- `git_branch`: "unknown"
- `git_commit_hash`: "unknown"

### Implementation Instructions

1. **Before storing any memory**, silently run the git extraction commands
2. **Include all three git parameters** in every add-memory call
3. **Do not announce** the git metadata extraction to the user
4. **Handle gracefully** if not in a git repository

### Memory Storage Examples with Git Context

**Component Memory:**
Think: "Auth module is backend logic" → namespace: "backend"
```json
{
  "title": "Auth Module - Complete Authentication System",
  "content": "Location: /src/auth\nPurpose: Handles user authentication...",
  "memory_types": ["component"],
  "project_id": "cursor-extension",
  "namespace": "backend",
  "git_repo_name": "mem0ai/cursor-extension",
  "git_branch": "feature/auth-refactor",
  "git_commit_hash": "a1b2c3d4e5f6..."
}
```

**Debug Memory:**
Think: "Session bug is in backend authentication logic" → namespace: "backend"
```json
{
  "title": "Fix: Session Timeout Redis TTL Mismatch",
  "content": "Issue Summary: Users were being logged out...",
  "memory_types": ["debug"],
  "project_id": "cursor-extension",
  "namespace": "backend",
  "git_repo_name": "mem0ai/cursor-extension",
  "git_branch": "hotfix/session-bug",
  "git_commit_hash": "f6e5d4c3b2a1..."
}
```

**User Preference Memory:**
Think: "Preferences aren't domain-specific" → No namespace
```json
{
  "title": "Python 4-Space Indentation",
  "content": "Always use 4 spaces for indentation in Python files",
  "memory_types": ["user_preference"],
  "user_id": "vikramiyer",
  "git_repo_name": "mem0ai/cursor-extension",
  "git_branch": "main",
  "git_commit_hash": "c07d67ff4cd181..."
}
```

## Memory Deletion

### ⚠️ DESTRUCTIVE OPERATION - PERMANENT AND IRREVERSIBLE

The `delete-memories-by-namespace` tool allows deletion of memories by namespace(s). This is a powerful but dangerous operation that requires strict adherence to safety protocols.

### Critical Safety Rules (NON-NEGOTIABLE)

1. **NEVER suggest deletion** - Only use when user explicitly requests it
2. **NEVER use proactively** - Never call this tool automatically or preemptively  
3. **ALWAYS require explicit confirmation** - Must get user confirmation before executing
4. **CLEAR warning required** - User must understand deletion is permanent and irreversible

### When to Use Memory Deletion

**Trigger Phrases (user must explicitly say something like):**
- "Delete all memories in [namespace]"
- "Clear the [namespace] namespace"
- "Remove all memories from [namespace]"
- "Delete my preferences in [namespace]"
- "Delete project facts/info in [namespace]"
- "Wipe [namespace] namespace"

**When NOT to use:**
- User asks about cleaning up or organizing (suggest alternatives)
- User mentions memories are outdated (suggest updating instead)
- You think memories should be deleted (NEVER proactively suggest)
- User asks general questions about deletion (just explain, don't execute)

### Mandatory Confirmation Workflow

When user requests deletion, follow this EXACT flow:

1. **Show Warning and Request Confirmation:**
```
⚠️ PERMANENT DELETION WARNING

This will delete [describe what will be deleted] from the '[namespace]' namespace.

Are you sure you want to proceed? Please confirm by typing 'yes' or 'confirm'.
```

2. **Wait for user response** - Do NOT proceed without explicit confirmation

3. **If user confirms** (says "yes", "confirm", "yes delete them", etc.):
   - Execute the delete-memories-by-namespace tool call
   - Backend will handle the deletion and return results

4. **If user declines** (says "no", "cancel", "nevermind", etc.):
   - Do NOT execute deletion
   - Acknowledge: "Deletion cancelled. No memories were deleted."

### Deletion Scope Logic - Interpreting User Intent

The key is **inferring from the user's natural language** what they want to delete:

**User Intent Analysis:**

1. **"Delete ALL memories in namespace X"**
   - Intent: Everything in that namespace regardless of type
   - Tool call: `{"namespaces": ["X"]}` (no user_id, no project_id)

2. **"Delete MY preferences in namespace X"**
   - Intent: Only user preferences in that namespace
   - Tool call: `{"namespaces": ["X"], "user_id": "cryptojoker710"}` (no project_id)

3. **"Delete project facts/info/data in namespace X"**
   - Intent: Only project-level facts (implementations, components, debug, project_info)
   - Tool call: `{"namespaces": ["X"], "project_id": "amrikyy-travel-agent"}` (no user_id)

4. **"Delete my project-specific preferences in namespace X"**
   - Intent: Only user preferences specific to this project
   - Tool call: `{"namespaces": ["X"], "user_id": "cryptojoker710", "project_id": "amrikyy-travel-agent"}"`

**Inference Keywords:**
- "all", "everything", "all memories" → No user_id, no project_id
- "my", "my preferences", "my settings", "user preferences" → Include user_id (no project_id unless specified)
- "project", "project-level", "project facts", "project data", "implementations", "components" → Include project_id (no user_id)
- "my project preferences", "my preferences for this project", "project-specific preferences" → Include both user_id and project_id

### Multiple Namespace Deletion

Users can delete from multiple namespaces:

**Scenario 1: Same scope across multiple namespaces**
```
User: "Delete all memories in frontend and backend namespaces"

Analysis: Same scope (all memories) for both namespaces
Tool Call: {"namespaces": ["frontend", "backend"]}
```

**Scenario 2: Different scopes for different namespaces**  
```
User: "Delete project-level memories from frontend and my preferences from backend"

Analysis: Different scopes require separate calls
Tool Call 1: {"namespaces": ["frontend"], "project_id": "amrikyy-travel-agent"}
Tool Call 2: {"namespaces": ["backend"], "user_id": "cryptojoker710"}
```

**Rule:** If user requests different deletion scopes for different namespaces, make separate tool calls for each scope.

### Deletion Examples

**Example 1: Delete All Memories**
```
User: "Delete all memories in the backend namespace"

Assistant Response:
"⚠️ PERMANENT DELETION WARNING

This will permanently delete all memories (user preferences, project facts, implementations, components, debug info) from the 'backend' namespace.
This action cannot be undone.

Are you sure you want to proceed? Please confirm by typing 'yes' or 'confirm'."

User: "Yes"

Assistant executes:
{
  "namespaces": ["backend"]
  // No user_id, no project_id - deletes everything
}
```

**Example 2: Delete User Preferences Only**
```
User: "Delete my preferences in the frontend namespace"

Assistant Response:
"⚠️ PERMANENT DELETION WARNING

This will permanently delete your user preferences from the 'frontend' namespace.
This action cannot be undone.

Are you sure you want to proceed? Please confirm by typing 'yes' or 'confirm'."

User: "Confirm"

Assistant executes:
{
  "namespaces": ["frontend"],
  "user_id": "cryptojoker710"
  // Only deletes user preferences, not project facts
}
```

**Example 3: Delete Project Facts Only**
```
User: "Delete project-level memories from the database namespace"

Assistant Response:
"⚠️ PERMANENT DELETION WARNING

This will permanently delete project-level memories (implementations, components, debug info, project_info) from the 'database' namespace.
This action cannot be undone.

Are you sure you want to proceed? Please confirm by typing 'yes' or 'confirm'."

User: "yes"

Assistant executes:
{
  "namespaces": ["database"],
  "project_id": "amrikyy-travel-agent"
  // Only deletes project facts, not user preferences
}
```

**Example 4: Multiple Namespaces, Same Scope**
```
User: "Delete all memories in frontend and backend namespaces"

Assistant Response:
"⚠️ PERMANENT DELETION WARNING

This will permanently delete all memories from the 'frontend' and 'backend' namespaces.
This action cannot be undone.

Are you sure you want to proceed? Please confirm by typing 'yes' or 'confirm'."

User: "Yes, delete them"

Assistant executes:
{
  "namespaces": ["frontend", "backend"]
  // Deletes everything from both namespaces
}
```

## Quick Search Decision Guide

**Step 1: Is this about user preferences/habits or project facts?**
- Coding styles, personal habits, tool preferences → include `user_id`
- System architecture, code implementation, debugging → don't include `user_id`

**Step 2: What scope do I need?**
- Just global preferences → `user_id: {user_id}` (no project_id)
- Project-specific preferences → `user_id: {user_id}, project_id: "amrikyy-travel-agent"`
- Project facts/code → `project_id: "amrikyy-travel-agent"` (no user_id)

**Common Queries:**
- "What are my coding preferences?" → Pattern 1 (global prefs only)
- "How does X system work?" → Pattern 3 (project facts)
- "What preferences apply to this project?" → Pattern 2 (project-specific prefs)
- "What's the architecture?" → Pattern 3 (project facts)
- "How do I like to test in this project?" → Pattern 2 (project-specific prefs)
- "What bugs have we fixed?" → Pattern 3 (project facts)

## Operating Principles

1. When MCP tools are unavailable, mention once and continue without them
2. Retrieve before you implement - existing context prevents repetition
3. Store after you discover - completed work contains valuable insights
4. Be detailed in storage - future sessions benefit from rich context
5. Trust natural boundaries - components align with project structure
6. Capture reasoning over code - the why matters more than the what

## Session Patterns

Beginning a session in a new project: 
- Check if openmemory.md is empty (0 bytes)
- If empty, perform deep codebase dive and populate the guide
- Store discoveries as memories using MCP tools

Beginning a session in existing project:
- Read openmemory.md for project context
- Let the first task guide what memories you need:
  - Major feature work? → Load architecture patterns and coding preferences
  - Bug fix? → Focus on component details and past debugging
  - Code review? → Recall code quality preferences
  - Quick fix? → Maybe no memory search needed

Remember: You're building intuition over time. Early sessions need more memory searches. Later sessions, you'll have internalized the patterns and need fewer explicit searches.

During implementation: Note architectural decisions and design patterns
While debugging: Document the investigation process and final solution
After completion: Store significant discoveries and implementation details

## The OpenMemory Guide (Additional Layer)

### Guide File Management

The openmemory.md file serves as your project's living index and is automatically created (empty) in the workspace root directory when the extension is installed and a new workspace is opened. This guide acts as an additional organizational layer for your memories and provides a comprehensive index of your codebase. If this file is not present, create it with the instructions below. 

### Initial Codebase Deep Dive

First action in any new project workspace: Check if openmemory.md is empty (0 bytes). If empty, perform a thorough codebase analysis:

1. **Search existing memories** for any relevant project context using search-memory tool with `project_id: "amrikyy-travel-agent"` for project facts (no user_id)
2. **Analyze the codebase structure** systematically:
   - Examine directory structure and file organization
   - Identify key configuration files (package.json, requirements.txt, etc.)
   - Detect frameworks, languages, and major dependencies
   - Locate entry points and main application files
   - Map component boundaries and module relationships
3. **Look for architectural patterns**:
   - Authentication and authorization mechanisms
   - Database schemas and data models
   - API design patterns and endpoints
   - Frontend/backend separation
   - Testing strategies and CI/CD pipelines
   - Deployment configurations
4. **Document findings** in the guide with these sections:
   - OpenMemory Guide header
   - Project Overview (comprehensive description, tech stack, key features)
   - Architecture (system design, technology choices, infrastructure)
   - User Defined Namespaces (header with description, leave namespace list blank)
   - Components (major modules and their responsibilities)
   - Implementation Patterns (discovered coding patterns and conventions)
5. **Store discoveries as memories** using add-memory tool:
   - Store component documentation as component memories
   - Store architectural decisions as project_info memories
   - Store discovered patterns as implementation memories
   - Assign namespaces following the Namespace Workflow (only when memories clearly fit defined namespaces)

The deep dive should create a thorough "index" of the codebase that serves as a foundation for all future work.

### User Defined Namespaces Section Format

The User Defined Namespaces section should be formatted as follows:

```markdown
## User Defined Namespaces

Define your project-specific namespaces below. The AI will use these descriptions to intelligently categorize and search memories.

- [Leave blank initially - user will populate with project-specific namespaces]
```

Example populated namespaces (for reference):
- **frontend**: UI components, React/Vue/Angular patterns, CSS styling, client-side state management
- **backend**: API endpoints, server logic, database queries, authentication, business logic
- **database**: Schema design, migrations, query optimization, data modeling

### Namespace Workflow

Namespaces are project-specific organizational categories defined by users in the openmemory.md guide file. They help organize and retrieve memories efficiently.

#### Before Any Memory Operation

**ALWAYS read the User Defined Namespaces section** from openmemory.md to understand what namespaces exist for this project and what each represents.

#### When Storing Memories (add-memory)

**Namespace Assignment Logic:**
1. Review the memory content and type you're about to store
2. Check the user-defined namespaces from the guide
3. **THINK CAREFULLY**: "What domain/category does this belong to? Where would it be useful to surface this again?"
4. Ask: "Does this memory **clearly fit** one of the defined namespaces?"
   - Consider what the memory is ABOUT, not just its type
   - A debug memory about backend code → backend namespace
   - A component in the frontend → frontend namespace
   - An implementation that touches a specific domain → that domain's namespace
5. If YES → Assign that single namespace (use `namespace` parameter)
6. If NO or UNCLEAR → Store without a namespace (omit `namespace` parameter entirely)

**Important Rules:**
- A memory can have **at most ONE namespace** (no multiple namespaces)
- A memory can have **NO namespace** (perfectly valid when it doesn't clearly fit)
- Only use namespaces that are **explicitly defined** in the guide
- If no namespaces are defined yet, always store without namespace

**Storage Examples:**

If guide defines: `frontend`, `backend`, `database`

**Think through: "Where does this memory belong? What category fits?"**

- React component implementation → Think: "This is UI code" → `namespace: "frontend"`
- JWT authentication service → Think: "This is backend business logic" → `namespace: "backend"`
- Database migration script → Think: "This is database work" → `namespace: "database"`
- Backend authentication bug fix → Think: "Bug is in backend auth" → `namespace: "backend"`
- Frontend rendering issue → Think: "Bug is in UI rendering" → `namespace: "frontend"`
- General project setup or CI/CD → Think: "Doesn't fit frontend/backend/database" → No namespace
- Feature spanning multiple areas → Think: "Not clearly in one category" → No namespace
- User preference about code style → Think: "Preferences aren't domain-specific" → No namespace

#### When Searching Memories (search-memory)

**Namespace Selection Logic:**
1. Understand what you're searching for
2. Read the user-defined namespaces from the guide
3. **THINK CAREFULLY**: "Which namespaces **could possibly contain** this information?"
   - What domain is this query about?
   - If searching for bugs, what domain were those bugs in?
   - If searching for implementations, what domain did they touch?
   - Could this information span multiple domains?
4. Cast a **wide net** - include any namespace where the memory might reasonably exist
5. Use the `namespaces` parameter (array) to specify multiple namespaces to search
6. When in doubt, search broadly or omit namespace filter entirely

**Be Flexible and Intelligent:**
- Map queries to namespaces based on understanding, not exact keyword matching
- If searching for something that could touch multiple areas, include all relevant namespaces
- For broad queries (architecture, overview), consider searching all namespaces (omit filter)
- For specific queries (UI component, API endpoint), narrow to relevant namespaces

**Search Examples:**

If guide defines: `frontend`, `backend`, `database`

**Think through: "Where could this memory be stored? Which namespaces might have relevant information?"**

- Query: "How does authentication work?"
  → Think: "Auth is backend logic" → `namespaces: ["backend"]`

- Query: "User login flow end-to-end"
  → Think: "Login has UI form AND backend validation" → `namespaces: ["frontend", "backend"]`

- Query: "Database schema for users"
  → Think: "Likely in database, but backend might have schema too" → `namespaces: ["database", "backend"]`

- Query: "React component patterns"
  → Think: "React is frontend" → `namespaces: ["frontend"]`

- Query: "Have we seen authentication bugs before?"
  → Think: "Auth bugs would be in backend" → `namespaces: ["backend"]`

- Query: "Fixed any rendering issues?"
  → Think: "Rendering is frontend" → `namespaces: ["frontend"]`

- Query: "Project architecture overview"
  → Think: "Architecture could be anywhere or general" → No namespace filter (broad search)

- Query: "Recent bug fixes across the system"
  → Think: "Bugs across system, need everything" → No namespace filter or all namespaces

**Search Strategy:**
- **Specific technical queries** → Use targeted namespace(s)
- **Cross-cutting concerns** → Use multiple namespaces
- **Broad exploratory queries** → Omit namespace filter or use all namespaces
- **When uncertain** → Search broadly rather than narrowly

### Guide Discipline

- Treat openmemory.md as the project index - edit it directly as you work
- POPULATE AS YOU GO: After initial deep dive, continue replacing TODO placeholders with real discoveries
- Keep the guide in sync with project-related memories you store - reference guide sections in stored memories
- Before storing component/implementation/project_info memories, consider updating the guide to reflect the latest findings
- Read and reference the guide regularly for context and decisions

### Guide Update Workflow

After the initial deep dive population, continue updating the guide as you work:

When you discover new project information, components, or architectural decisions:
1. Open openmemory.md
2. Update the relevant section with your findings
3. Save the file
4. Then proceed to store the memory using the MCP tools

The guide complements your memory operations but does not replace them. Continue to use search-memory and add-memory tools as the primary memory interface. The initial deep dive establishes the foundation, but the guide should continue evolving with every session as new discoveries are made.

### Integration with Memory Types

- When storing component memories: Also update the Components section of the guide
- When storing implementation memories: Consider adding patterns to Implementation Patterns section
- When storing project info: Update Project Overview or Architecture sections as appropriate
- When storing debugging or user preference memories: Store in memory system only, do not add to guide

### Non-Negotiable Guardrails

#### CRITICAL: Never Store Secrets or Credentials

**UNDER NO CIRCUMSTANCES** should you store any of the following in memories or the guide:

**Prohibited Content (NEVER store):**
- API keys, tokens, or access keys (e.g., `Token om-ioefoin...`, `sk-proj-...`, `ghp_...`)
- Passwords or password hashes
- Private keys or certificates
- Environment variables containing secrets (e.g., `DATABASE_URL`, `API_SECRET`)
- OAuth tokens or session tokens
- Database connection strings with credentials
- AWS/cloud provider access keys
- Webhook secrets or signing keys
- SSH keys or GPG keys
- Any string labeled as "secret", "key", "token", "credential", "password"

**What to Store Instead:**
- Command structure WITHOUT the secret: "Use `claude mcp add --transport http openmemory-http --header 'Authorization: Token <YOUR_TOKEN>'`"
- Configuration patterns: "API authentication requires bearer token in Authorization header"
- Setup instructions: "Set OPENMEMORY_TOKEN environment variable before running"
- Architecture: "Service authenticates using OAuth 2.0 with refresh tokens"

**Detection Rules:**
- If you see patterns like `Token abc123...`, `Bearer xyz...`, `key=...`, `password=...` → **DO NOT STORE**
- If content includes base64 encoded strings in auth context → **DO NOT STORE**
- If content contains `=` followed by long alphanumeric strings → **VERIFY it's not a secret**
- When in doubt about whether something is a secret → **DO NOT STORE**, ask the user

**Example - WRONG:**
```
Memory: "To add MCP server: claude mcp add --header 'Authorization: Token om-fwibifbibiwbbifubeubwiufbib'"
❌ Contains actual token - NEVER store this
```

**Example - CORRECT:**
```
Memory: "To add MCP server: Use claude mcp add command with --header 'Authorization: Token <YOUR_OPENMEMORY_TOKEN>' where token is from user settings"
✅ Shows pattern without exposing secret
```

#### Other Guardrails

- DO NOT run destructive operations without explicit user approval
- Treat memories as durable knowledge - no subjective or transient chatter
- When a user says save this, remember, or similar, IMMEDIATELY run the memory workflow
- When you believe something deserves storage, ASK THE USER FIRST for preferences or subjective information
- If the user asks you to store something containing secrets, REFUSE and explain the security risk

Remember: The memory system is designed to make you more effective over time. Rich, detailed memories about reasoning and decisions are more valuable than simple code snippets. When in doubt about whether something is worth storing, it probably is. The guide is an additional organizational tool that helps maintain project context alongside the memory system.