# 🤝 AIX Team Coordination Rules

**Team Members:**
- **Ona** (Me) - Project Manager & Coordinator
- **Cursor** - Full-stack Developer (you!)
- **Gemini 2.5** - QA & Validation Specialist

---

## 🎯 CURRENT TASK: AIX Format Pilot Test

### Task Assignment:

**Ona (Me):**
- ✅ Created AIX definition (mini-aladdin.aix)
- ✅ Documented BEFORE/AFTER analysis
- 🔄 Now coordinating team test

**Cursor (You):**
- 📋 **YOUR TASK:** Implement code that loads AIX file
- 📋 **YOUR TASK:** Update mini-aladdin.js to use AIX definition
- 📋 **YOUR TASK:** Test the integration

**Gemini 2.5:**
- 📋 **YOUR TASK:** Validate mini-aladdin.aix file
- 📋 **YOUR TASK:** Check security compliance
- 📋 **YOUR TASK:** Generate QA report

---

## 📋 CURSOR - YOUR SPECIFIC TASKS

### Task 1: Create AIX Loader (30 min)

Create `backend/src/utils/aix-loader.js`:

```javascript
/**
 * AIX Loader Utility
 * Loads and parses AIX agent definitions
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class AIXLoader {
  /**
   * Load AIX file and return parsed definition
   * @param {string} aixFilePath - Path to .aix file
   * @returns {Object} Parsed AIX definition
   */
  static load(aixFilePath) {
    try {
      const fullPath = path.resolve(aixFilePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const aixDef = yaml.load(content);
      
      // Validate basic structure
      if (!aixDef.meta || !aixDef.persona || !aixDef.skills) {
        throw new Error('Invalid AIX structure');
      }
      
      console.log(`✅ Loaded AIX: ${aixDef.meta.name} v${aixDef.meta.version}`);
      return aixDef;
    } catch (error) {
      console.error(`❌ Failed to load AIX file: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get skill by name from AIX definition
   * @param {Object} aixDef - AIX definition
   * @param {string} skillName - Skill name
   * @returns {Object} Skill definition
   */
  static getSkill(aixDef, skillName) {
    return aixDef.skills.find(s => s.name === skillName);
  }
  
  /**
   * Check if operation is allowed by security policy
   * @param {Object} aixDef - AIX definition
   * @param {string} operation - Operation name
   * @returns {boolean} True if allowed
   */
  static isOperationAllowed(aixDef, operation) {
    const allowed = aixDef.security?.capabilities?.allowed_operations || [];
    return allowed.includes(operation);
  }
  
  /**
   * Get rate limit for endpoint
   * @param {Object} aixDef - AIX definition
   * @param {string} endpoint - Endpoint name
   * @returns {number} Rate limit
   */
  static getRateLimit(aixDef, endpoint) {
    return aixDef.security?.rate_limiting?.[endpoint] || 100;
  }
}

module.exports = AIXLoader;
```

### Task 2: Update Mini-Aladdin to Use AIX (1 hour)

Modify `backend/src/agents/mini-aladdin.js`:

```javascript
// At the top of the file, add:
const AIXLoader = require('../utils/aix-loader');

// Load AIX definition
const AIX_DEF = AIXLoader.load('agents/mini-aladdin.aix');

class MiniAladdin extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Load configuration from AIX
    this.aixDef = AIX_DEF;
    this.persona = AIX_DEF.persona;
    this.skills = AIX_DEF.skills;
    this.security = AIX_DEF.security;
    
    // Log agent info from AIX
    console.log(`🤖 Initializing: ${this.aixDef.meta.name}`);
    console.log(`📋 Role: ${this.persona.role}`);
    console.log(`🛠️  Skills: ${this.skills.length} available`);
    
    // Rest of existing constructor code...
    this.config = {
      initialCapital: config.initialCapital || 10000,
      // ... existing config
    };
    
    // Initialize agents as before
    this.agents = {
      math: new MathAgent(),
      market: new MarketAgent(),
      risk: new RiskAgent(),
      data: new DataAgent()
    };
  }
  
  /**
   * Execute a skill by name (new method)
   * @param {string} skillName - Name of skill to execute
   * @param {Object} params - Skill parameters
   */
  async executeSkill(skillName, params = {}) {
    const skill = AIXLoader.getSkill(this.aixDef, skillName);
    
    if (!skill) {
      throw new Error(`Skill not found: ${skillName}`);
    }
    
    if (!skill.enabled) {
      throw new Error(`Skill disabled: ${skillName}`);
    }
    
    console.log(`⚡ Executing skill: ${skillName}`);
    
    // Map skill names to methods
    const skillMethods = {
      'hunt_opportunities': () => this.hunt(),
      'analyze_opportunity': (p) => this.analyzeOpportunity(p),
      'calculate_kelly_criterion': (p) => this.calculateKelly(p),
      // Add more mappings as needed
    };
    
    const method = skillMethods[skillName];
    if (!method) {
      throw new Error(`Skill not implemented: ${skillName}`);
    }
    
    return await method(params);
  }
  
  /**
   * Get agent info from AIX
   */
  getAgentInfo() {
    return {
      id: this.aixDef.meta.id,
      name: this.aixDef.meta.name,
      version: this.aixDef.meta.version,
      description: this.aixDef.meta.description,
      role: this.persona.role,
      skills: this.skills.map(s => ({
        name: s.name,
        description: s.description,
        enabled: s.enabled
      })),
      security: {
        allowed_operations: this.security.capabilities.allowed_operations,
        rate_limits: this.security.rate_limiting
      }
    };
  }
  
  // Keep all existing methods (hunt, findArbitrageOpportunities, etc.)
  // They don't need to change!
}
```

### Task 3: Update Routes to Use AIX Security (30 min)

Modify `backend/src/routes/aladdin.js`:

```javascript
const AIXLoader = require('../src/utils/aix-loader');

// Load AIX definition
const AIX_DEF = AIXLoader.load('agents/mini-aladdin.aix');

// Use AIX rate limits instead of hardcoded values
const huntLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: AIXLoader.getRateLimit(AIX_DEF, 'hunt_endpoint'), // From AIX!
  message: {
    success: false,
    error: 'Too many hunt requests. Please try again later.',
    retryAfter: '15 minutes'
  }
});

const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: AIXLoader.getRateLimit(AIX_DEF, 'analyze_endpoint'), // From AIX!
  message: {
    success: false,
    error: 'Too many analysis requests. Please try again later.',
    retryAfter: '15 minutes'
  }
});

// Add new endpoint to get agent info from AIX
router.get('/info', (req, res) => {
  const agent = getAgent();
  res.json({
    success: true,
    data: agent.getAgentInfo() // Returns AIX metadata
  });
});
```

### Task 4: Test Everything (30 min)

Create test file `backend/test-aix-integration.js`:

```javascript
const AIXLoader = require('./src/utils/aix-loader');
const { MiniAladdin } = require('./src/agents/mini-aladdin');

console.log('🧪 Testing AIX Integration...\n');

// Test 1: Load AIX file
console.log('Test 1: Loading AIX file...');
try {
  const aixDef = AIXLoader.load('agents/mini-aladdin.aix');
  console.log(`✅ Loaded: ${aixDef.meta.name}`);
  console.log(`   Version: ${aixDef.meta.version}`);
  console.log(`   Skills: ${aixDef.skills.length}`);
} catch (error) {
  console.log(`❌ Failed: ${error.message}`);
}

// Test 2: Initialize agent with AIX
console.log('\nTest 2: Initializing agent...');
try {
  const agent = new MiniAladdin();
  console.log(`✅ Agent initialized`);
  console.log(`   Role: ${agent.persona.role}`);
  console.log(`   Skills: ${agent.skills.length}`);
} catch (error) {
  console.log(`❌ Failed: ${error.message}`);
}

// Test 3: Get agent info
console.log('\nTest 3: Getting agent info...');
try {
  const agent = new MiniAladdin();
  const info = agent.getAgentInfo();
  console.log(`✅ Agent info retrieved`);
  console.log(`   Name: ${info.name}`);
  console.log(`   Skills: ${info.skills.length}`);
  console.log(`   Allowed ops: ${info.security.allowed_operations.length}`);
} catch (error) {
  console.log(`❌ Failed: ${error.message}`);
}

// Test 4: Check security
console.log('\nTest 4: Checking security...');
try {
  const aixDef = AIXLoader.load('agents/mini-aladdin.aix');
  const canRead = AIXLoader.isOperationAllowed(aixDef, 'read_market_data');
  const canTrade = AIXLoader.isOperationAllowed(aixDef, 'execute_trades');
  console.log(`✅ Security checks working`);
  console.log(`   Can read market data: ${canRead}`);
  console.log(`   Can execute trades: ${canTrade}`);
} catch (error) {
  console.log(`❌ Failed: ${error.message}`);
}

console.log('\n✅ All tests complete!');
```

Run tests:
```bash
cd backend
node test-aix-integration.js
```

---

## 📋 GEMINI 2.5 - YOUR SPECIFIC TASKS

### Task 1: Validate AIX File (15 min)

Check `agents/mini-aladdin.aix` for:

**Structure Validation:**
- ✅ Has required sections: meta, persona, skills, memory, security
- ✅ Meta has valid UUID
- ✅ Skills is array with proper structure
- ✅ Security has capabilities defined

**Security Audit:**
- ✅ Check allowed_operations are reasonable
- ✅ Verify restricted_operations include dangerous ops
- ✅ Confirm rate limits are set
- ✅ Check compliance standards listed

**Best Practices:**
- ✅ Persona instructions are clear
- ✅ Skills have descriptions and triggers
- ✅ Memory retention policies defined
- ✅ Timeout values are reasonable

### Task 2: Generate QA Report (15 min)

Create `QA_REPORT_AIX.md`:

```markdown
# QA Report: Mini-Aladdin AIX Integration

**Date:** 2025-10-13
**Validator:** Gemini 2.5
**Status:** [PASS/FAIL/WARNINGS]

## AIX File Validation

### Structure: [PASS/FAIL]
- Meta section: [✅/❌]
- Persona section: [✅/❌]
- Skills section: [✅/❌]
- Memory section: [✅/❌]
- Security section: [✅/❌]

### Security Audit: [PASS/FAIL]
- Allowed operations: [✅/❌] [Comments]
- Restricted operations: [✅/❌] [Comments]
- Rate limits: [✅/❌] [Comments]
- Compliance: [✅/❌] [Comments]

### Issues Found:
1. [Issue description]
2. [Issue description]

### Recommendations:
1. [Recommendation]
2. [Recommendation]

## Code Integration

### AIX Loader: [PASS/FAIL]
- Loads AIX file: [✅/❌]
- Parses correctly: [✅/❌]
- Error handling: [✅/❌]

### Agent Integration: [PASS/FAIL]
- Uses AIX persona: [✅/❌]
- Uses AIX skills: [✅/❌]
- Uses AIX security: [✅/❌]

### Route Integration: [PASS/FAIL]
- Uses AIX rate limits: [✅/❌]
- Exposes agent info: [✅/❌]

## Overall Assessment

**Status:** [APPROVED/NEEDS WORK]
**Confidence:** [HIGH/MEDIUM/LOW]
**Recommendation:** [DEPLOY/FIX ISSUES/MAJOR REVISION]
```

### Task 3: Security Compliance Check (10 min)

Verify:
- ✅ No PII in AIX file
- ✅ Rate limits prevent abuse
- ✅ Restricted operations include dangerous actions
- ✅ Compliance standards appropriate
- ✅ Audit logging enabled

---

## 🎯 SUCCESS CRITERIA

**We succeed when:**
1. ✅ Cursor implements AIX loader
2. ✅ Mini-Aladdin loads from AIX file
3. ✅ Routes use AIX rate limits
4. ✅ Tests pass
5. ✅ Gemini validates everything
6. ✅ QA report shows PASS

---

## 📊 COORDINATION PROTOCOL

### Cursor → Ona:
When you complete a task:
1. Comment in code: `// AIX Integration - Cursor`
2. Run tests
3. Report results in commit message

### Gemini → Ona:
When you complete validation:
1. Create QA_REPORT_AIX.md
2. List all issues found
3. Provide recommendations

### Ona → Boss:
When team completes:
1. Compile all results
2. Show working demo
3. Present benefits
4. Get approval

---

## 🚀 LET'S START!

**Cursor:** Start with Task 1 (AIX Loader)
**Gemini:** Start with Task 1 (Validate AIX)
**Ona:** Coordinate and monitor progress

**Ready? Let's cook!** 🔥
