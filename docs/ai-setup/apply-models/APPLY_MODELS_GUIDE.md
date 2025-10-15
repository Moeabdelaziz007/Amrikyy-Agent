# Apply Models Guide - Cline Integration

**Version:** 1.0  
**Last Updated:** October 15, 2025  
**Status:** 🟢 Active  
**Purpose:** Configure precise code diff generation for Cline

---

## 🎯 What Are Apply Models?

Apply models are specialized AI models that generate **precise diffs** to apply code changes. When Chat or Edit model output doesn't align perfectly with existing code, Apply models create exact transformations.

**Problem they solve:**
```
❌ Chat says: "Add error handling"
❌ Output: Generic code that doesn't match your style
✅ Apply model: Generates exact diff matching your codebase
```

---

## 🚀 Recommended Models

### 1. Morph Fast Apply (Primary - Fastest)

**Best for:** Quick iterations, real-time editing, simple changes

```json
{
  "name": "Morph Fast Apply",
  "provider": "morph",
  "model": "morph-fast-apply",
  "speed": "< 1 second",
  "cost": "Free tier available",
  "accuracy": "High for simple edits"
}
```

**Setup:**
1. Sign up: https://morphllm.com/dashboard
2. Get API key
3. Add to `.env`: `MORPH_API_KEY=your_key_here`

**Use cases:**
- Quick single-line edits
- Simple refactoring
- Fast iterations during development
- Real-time code suggestions

---

### 2. Relace Instant Apply (Secondary - Balanced)

**Best for:** Complex diffs, multi-file changes, production code

```json
{
  "name": "Relace Instant Apply",
  "provider": "relace",
  "model": "instant-apply",
  "speed": "2-5 seconds",
  "cost": "Paid",
  "accuracy": "Very high for complex edits"
}
```

**Setup:**
1. Sign up: https://app.relace.ai/settings/api-keys
2. Get API key
3. Add to `.env`: `RELACE_API_KEY=your_key_here`

**Use cases:**
- Complex refactoring
- Multi-file changes
- Precise production edits
- Critical code modifications

---

### 3. Claude 3.5 Haiku (Fallback - Cost-Effective)

**Best for:** When specialized models unavailable, budget-conscious

```json
{
  "name": "Claude 3.5 Haiku",
  "provider": "anthropic",
  "model": "claude-3-5-haiku-latest",
  "speed": "Fast",
  "cost": "Low",
  "accuracy": "High with context"
}
```

**Setup:**
- Already configured! Uses existing `ANTHROPIC_API_KEY`

**Use cases:**
- Fallback when Morph/Relace unavailable
- Complex logic changes
- Context-aware edits
- Cost-conscious operations

---

### 4. Claude 3.5 Sonnet (Critical - Maximum Accuracy)

**Best for:** Critical production changes, high-stakes edits

```json
{
  "name": "Claude 3.5 Sonnet",
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-latest",
  "speed": "Moderate",
  "cost": "Higher",
  "accuracy": "Maximum"
}
```

**Setup:**
- Already configured! Uses existing `ANTHROPIC_API_KEY`

**Use cases:**
- Critical production changes
- Complex architectural refactoring
- High-stakes edits
- When accuracy is paramount

---

## 📝 Prompt Templates

### Default Apply Template

```handlebars
Original: {{{original_code}}}
New: {{{new_code}}}

Please generate the final code without any markers or explanations.
```

**Use:** Standard apply for most cases

---

### Precise Diff Template

```handlebars
Generate a precise diff to transform:

ORIGINAL CODE:
{{{original_code}}}

INTO NEW CODE:
{{{new_code}}}

Provide only the exact changes needed, no explanations.
```

**Use:** Maximum precision needed

---

### Context-Aware Template

```handlebars
Context: This is part of {{{file_path}}}

Original:
{{{original_code}}}

Desired:
{{{new_code}}}

Generate the exact code to replace the original, maintaining style and conventions.
```

**Use:** When file context matters for style matching

---

### Safe Refactor Template

```handlebars
Safely refactor this code:

Current:
{{{original_code}}}

Target:
{{{new_code}}}

Ensure no functionality is lost. Generate only the final code.
```

**Use:** Refactoring with safety emphasis

---

### Minimal Change Template

```handlebars
Make the MINIMAL change to transform:
{{{original_code}}}

Into:
{{{new_code}}}

Change only what's necessary. Output final code only.
```

**Use:** Smallest possible diffs

---

## 🔄 Workflows

### Simple Edit Workflow

**Model:** Morph Fast Apply  
**Template:** Default Apply  
**Time:** < 1 second

```
1. Receive edit request
2. Generate diff
3. Apply changes
4. Verify syntax
```

**Example:**
```javascript
// Original
const name = "John";

// Cline says: "Change to Jane"
// Apply model generates:
const name = "Jane";
```

---

### Complex Refactor Workflow

**Model:** Relace Instant Apply  
**Template:** Safe Refactor  
**Time:** 2-5 seconds

```
1. Analyze original code
2. Understand desired changes
3. Generate precise diff
4. Apply changes
5. Run tests
6. Verify functionality
```

**Example:**
```javascript
// Original
function getUserData(id) {
  const user = db.query(`SELECT * FROM users WHERE id = ${id}`);
  return user;
}

// Cline says: "Fix SQL injection vulnerability"
// Apply model generates:
function getUserData(id) {
  const user = db.query('SELECT * FROM users WHERE id = ?', [id]);
  return user;
}
```

---

### Multi-File Change Workflow

**Model:** Claude 3.5 Haiku  
**Template:** Context-Aware  
**Time:** 5-10 seconds

```
1. Map file dependencies
2. Generate diffs per file
3. Apply in correct order
4. Verify cross-file consistency
5. Run integration tests
```

---

### Critical Production Workflow

**Model:** Claude 3.5 Sonnet  
**Template:** Precise Diff  
**Time:** 10-20 seconds  
**Requires:** User approval

```
1. Backup original
2. Analyze impact
3. Generate ultra-precise diff
4. Apply with verification
5. Run full test suite
6. Create rollback point
```

---

## 🎛️ Model Selection Strategy

### Auto-Selection Rules

```javascript
if (quick_iteration || real_time_editing) {
  use("morph-fast-apply");
} else if (production_code || critical_change) {
  use("claude-3-5-sonnet");
} else if (budget_limited || high_volume) {
  use("claude-3-5-haiku");
} else {
  use("relace-instant-apply"); // Balanced default
}
```

### Fallback Chain

```
1. Morph Fast Apply (try first)
   ↓ (if unavailable)
2. Relace Instant Apply
   ↓ (if unavailable)
3. Claude 3.5 Haiku
   ↓ (if unavailable)
4. Claude 3.5 Sonnet (always available)
```

---

## ✅ Quality Assurance

### Pre-Apply Checks

- ✅ Syntax validation
- ✅ Style consistency
- ✅ Import verification
- ✅ Type checking

### Post-Apply Checks

- ✅ Syntax still valid
- ✅ Tests still pass
- ✅ No regressions
- ✅ Formatting preserved

### Rollback Triggers

- ❌ Syntax error → Immediate rollback
- ❌ Test failure → Rollback and report
- ❌ Type error → Rollback and analyze
- ❌ User request → Manual rollback

---

## 🔧 Configuration

### Environment Variables

```bash
# Required (already configured)
ANTHROPIC_API_KEY=sk-ant-...

# Optional (for faster applies)
MORPH_API_KEY=morph_...
RELACE_API_KEY=relace_...
```

### Cline Settings

```json
{
  "default_model": "morph-fast-apply",
  "default_template": "default_apply",
  "auto_apply": false,
  "require_confirmation": true,
  "show_diff_preview": true,
  "enable_rollback": true,
  "backup_before_apply": true,
  "run_tests_after_apply": true
}
```

---

## 📊 Performance Optimization

### Caching

- ✅ Cache successful patterns (24h)
- ✅ Max cache size: 100MB
- ✅ Speeds up repeated similar edits

### Batching

- ✅ Batch similar changes together
- ✅ Max batch size: 10 changes
- ✅ Reduces API calls

### Parallel Processing

- ✅ Process multiple files in parallel
- ✅ Max parallel: 5 files
- ✅ Faster multi-file changes

---

## 🎓 Learning System

### Tracks Metrics

- Apply success rate
- Average apply time
- Rollback frequency
- User satisfaction
- Model performance

### Improves Over Time

- ✅ Learns your code style
- ✅ Adapts templates to your preferences
- ✅ Optimizes model selection
- ✅ Refines prompts based on success

### Feedback Loop

- Collects user feedback
- Analyzes failures
- Shares insights with Pattern Learning Agent
- Continuously improves accuracy

---

## 🚦 Usage Recommendations

| Scenario | Recommended Model | Why |
|----------|------------------|-----|
| Quick edits | Morph Fast Apply | Speed |
| Production code | Claude 3.5 Sonnet | Accuracy |
| Refactoring | Relace Instant Apply | Precision |
| Learning/Testing | Claude 3.5 Haiku | Balance |
| Cost savings | Morph (free tier) | Budget |

---

## 🔍 Monitoring

### Enabled Features

- ✅ Log all applies
- ✅ Track performance metrics
- ✅ Alert on failures
- ✅ Daily summary reports

### Metrics Dashboard

```
Today's Apply Stats:
- Total applies: 47
- Success rate: 95.7%
- Average time: 1.2s
- Rollbacks: 2
- Model usage:
  - Morph: 35 (74%)
  - Relace: 8 (17%)
  - Haiku: 4 (9%)
```

---

## 🎯 Quick Start

### 1. Get API Keys (Optional but Recommended)

```bash
# Morph (free tier)
https://morphllm.com/dashboard

# Relace (paid)
https://app.relace.ai/settings/api-keys
```

### 2. Add to .env

```bash
# Add these lines to .env
MORPH_API_KEY=your_morph_key_here
RELACE_API_KEY=your_relace_key_here
```

### 3. Test Apply Models

```bash
# Cline will automatically use Apply models
# when making code changes

# Example:
"Cline, refactor this function to use async/await"
# → Apply model generates precise diff
# → Shows preview
# → Applies changes
# → Runs tests
```

### 4. Monitor Performance

```bash
# Check daily summary
cat .cline/logs/apply-summary-$(date +%Y-%m-%d).log
```

---

## 🐛 Troubleshooting

### Apply Failed

```
Error: Apply model failed to generate valid diff

Solution:
1. Check if API keys are valid
2. Try fallback model (Haiku/Sonnet)
3. Review error logs
4. Manual edit if needed
```

### Syntax Error After Apply

```
Error: Syntax error in applied code

Solution:
1. Automatic rollback triggered
2. Original code restored
3. Try different model
4. Report issue for learning
```

### Tests Failed After Apply

```
Error: Tests failed after applying changes

Solution:
1. Automatic rollback triggered
2. Analyze test failures
3. Suggest alternative approach
4. User decides next step
```

---

## 📚 Resources

- **Morph Docs:** https://docs.morphllm.com
- **Relace Docs:** https://docs.relace.ai
- **Continue Hub:** https://hub.continue.dev/explore/models?roles=apply
- **Cline Config:** `.cursor/ai-agents/cline-apply-models.json`

---

## 🎉 Success Stories

### Before Apply Models

```
❌ Chat output doesn't match code style
❌ Manual editing required
❌ Time-consuming adjustments
❌ Inconsistent results
```

### After Apply Models

```
✅ Precise diffs every time
✅ Automatic style matching
✅ < 1 second applies
✅ 95%+ success rate
```

---

**Remember:** Apply models are your precision tools. Use Morph for speed, Relace for precision, and Claude for critical changes!

---

**Last Updated:** October 15, 2025  
**Maintained by:** Mohamed + Cline + AI Team  
**Next Review:** November 15, 2025
