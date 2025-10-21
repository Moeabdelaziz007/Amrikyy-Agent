# 🤖 Gitpod Agent Setup for Amrikyy AI OS

**Goal**: Configure Gitpod Agent to automatically run the Quantum Gemini Core agent system.

---

## ✅ STEP 1: Add Script to package.json

First, we need to add the `quantum-agent` script to your backend package.json:

```json
"scripts": {
  "quantum-agent": "node src/agents/QuantumGeminiCore.js"
}
```

---

## ✅ STEP 2: Gitpod Agent Configuration

Go to: `https://app.gitpod.io/settings/agents`

Click: **"+ New Agent Command"**

### Configuration Values (Safe for Gitpod Regex):

| Field | Value |
|-------|-------|
| **Name** | `Amrikyy_Quantum_Agent` |
| **Command** | `cd backend && npm run quantum-agent` |
| **Description** | `Runs QuantumGeminiCore agent for Amrikyy AI OS` |
| **Prompt** | `Start the Quantum Gemini Core agent to execute AI OS tasks from AMRIKYY_AI_OS_PLAN.md` |

### ⚠️ Important Rules:
- ✅ Use only: `a-z`, `A-Z`, `0-9`, `.`, `_`, `/`, `-`, and spaces
- ❌ Avoid: `:`, `"`, `\`, `|`, `'`, `&`, `>`, `<`
- ❌ Keep under 2000 characters
- ✅ Use simple bash commands

---

## ✅ STEP 3: Alternative Simple Command

If the above doesn't work, use this minimal version:

| Field | Value |
|-------|-------|
| **Name** | `QuantumAgent` |
| **Command** | `node backend/src/agents/QuantumGeminiCore.js` |
| **Description** | `Quantum AI agent` |
| **Prompt** | `Run the quantum agent` |

---

## ✅ STEP 4: Test the Agent

After saving:

1. Open a new Gitpod workspace
2. Check if the agent starts automatically
3. View logs in Gitpod terminal
4. Verify Gemini Pro API connection

---

## 🔧 TROUBLESHOOTING

### Error: "Invalid command format"
**Solution**: Remove special characters, use only alphanumeric + basic symbols

### Error: "Command not found"
**Solution**: Use full path: `node /workspace/Amrikyy-Agent/backend/src/agents/QuantumGeminiCore.js`

### Error: "npm not found"
**Solution**: Use absolute path to node: `/usr/bin/node backend/src/agents/QuantumGeminiCore.js`

### Error: "GEMINI_API_KEY not found"
**Solution**: Add environment variable in Gitpod settings:
- Go to: `https://app.gitpod.io/settings/variables`
- Add: `GEMINI_API_KEY` = `your-api-key`
- Scope: `Moeabdelaziz007/Amrikyy-Agent`

---

## 🚀 RECOMMENDED SETUP

### Option A: Simple Node Script (Recommended)

**Command**:
```bash
node backend/src/agents/QuantumGeminiCore.js
```

**Pros**:
- ✅ No npm needed
- ✅ Direct execution
- ✅ Faster startup
- ✅ Less dependencies

### Option B: NPM Script

**Command**:
```bash
cd backend && npm run quantum-agent
```

**Pros**:
- ✅ Uses package.json
- ✅ Can chain commands
- ✅ Standard approach

### Option C: Full Path (Most Reliable)

**Command**:
```bash
/usr/bin/node /workspace/Amrikyy-Agent/backend/src/agents/QuantumGeminiCore.js
```

**Pros**:
- ✅ Always works
- ✅ No path issues
- ✅ Most reliable

---

## 📋 COMPLETE EXAMPLE

### Gitpod Agent Configuration:

```
Name: Amrikyy_Quantum_Agent

Command: /usr/bin/node /workspace/Amrikyy-Agent/backend/src/agents/QuantumGeminiCore.js

Description: Quantum Gemini Core agent for Amrikyy AI OS powered by Google Gemini Pro

Prompt: Initialize and run the Quantum Gemini Core agent to execute AI OS tasks. Load configuration from AMRIKYY_AI_OS_PLAN.md and start monitoring system operations.
```

---

## 🔐 ENVIRONMENT VARIABLES NEEDED

Add these in Gitpod Settings → Variables:

| Variable | Value | Scope |
|----------|-------|-------|
| `GEMINI_API_KEY` | `your-gemini-api-key` | `Moeabdelaziz007/Amrikyy-Agent` |
| `NODE_ENV` | `production` | `Moeabdelaziz007/Amrikyy-Agent` |
| `SUPABASE_URL` | `your-supabase-url` | `Moeabdelaziz007/Amrikyy-Agent` |
| `SUPABASE_KEY` | `your-supabase-key` | `Moeabdelaziz007/Amrikyy-Agent` |

---

## ✅ VERIFICATION CHECKLIST

After setup, verify:

- [ ] Agent appears in Gitpod Agents list
- [ ] Command passes regex validation
- [ ] Environment variables are set
- [ ] Workspace starts without errors
- [ ] Agent logs show in terminal
- [ ] Gemini Pro API connects successfully
- [ ] QuantumGeminiCore initializes
- [ ] No permission errors

---

## 🎯 EXPECTED OUTPUT

When successful, you should see:

```
🚀 Quantum Gemini Core initialized with superpowers
Model: gemini-2.0-flash-exp
Quantum State: Active
Superpowers: Enabled
Status: Ready
```

---

## 📞 NEXT STEPS

1. ✅ Copy the configuration above
2. ✅ Paste into Gitpod Agent settings
3. ✅ Add environment variables
4. ✅ Save and test
5. ✅ Open new workspace to verify

---

## 💡 PRO TIPS

1. **Start Simple**: Use Option C (full path) first
2. **Test Locally**: Run the command in terminal first
3. **Check Logs**: Always review Gitpod logs
4. **Environment**: Verify all env vars are set
5. **Permissions**: Ensure files are executable

---

## 🔥 ADVANCED: Auto-Start on Workspace Open

To make the agent start automatically when you open a workspace, you can use Gitpod Tasks instead:

Create `.gitpod.yml` (optional):

```yaml
tasks:
  - name: Quantum Agent
    command: |
      cd backend
      npm install
      npm run quantum-agent
```

But since you want to use **Agents UI only**, stick with the configuration above.

---

## ✅ FINAL RECOMMENDATION

**Use this exact configuration**:

```
Name: QuantumAgent

Command: node backend/src/agents/QuantumGeminiCore.js

Description: Quantum AI agent

Prompt: Run quantum agent
```

**Why?**
- ✅ Shortest possible (less regex issues)
- ✅ Simple and clear
- ✅ No special characters
- ✅ Easy to debug

---

**Created by**: Ona AI Assistant  
**Date**: October 21, 2025  
**Status**: ✅ Ready to Configure
