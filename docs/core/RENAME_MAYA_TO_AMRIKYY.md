# 🔄 Rename Project: Maya → Amrikyy

## 📋 Renaming Plan

This document tracks the systematic renaming of all "Maya" references to "Amrikyy" throughout the project.

### **Naming Conventions**

```
Old Name              → New Name
-------------------- → --------------------
Maya                  → Amrikyy
maya                  → amrikyy
MAYA                  → AMRIKYY
Amrikyy Travel Agent     → Amrikyy Travel Agent
amrikyy-travel-agent     → amrikyy-travel-agent
MayaTrips            → AmrikyyTrips
```

---

## 📁 Files to Update

### **1. Documentation Files (*.md)**
- [ ] README.md
- [ ] PROJECT_DOCUMENTATION.md
- [ ] API_DOCUMENTATION.md
- [ ] ARCHITECTURE.md
- [ ] DEPLOYMENT_GUIDE.md
- [ ] OPENROUTER_INTEGRATION.md
- [ ] KELO_PROGRESS_REPORT.md
- [ ] All other *.md files

### **2. Configuration Files**
- [ ] package.json (root)
- [ ] backend/package.json
- [ ] frontend/package.json
- [ ] .env.template
- [ ] env.example

### **3. Backend Files**
- [ ] backend/server.js
- [ ] backend/src/ai/mayaPersona.js → amrikyyPersona.js
- [ ] backend/telegram-bot*.js
- [ ] backend/routes/*.js
- [ ] backend/tests/**/*.js

### **4. Frontend Files**
- [ ] frontend/src/**/*.tsx
- [ ] frontend/src/**/*.ts
- [ ] frontend/index.html
- [ ] frontend/package.json

### **5. Database & Schema**
- [ ] Database table names
- [ ] Column references
- [ ] SQL files

---

## 🔧 Replacement Strategy

### **Step 1: Documentation**
Replace in all .md files:
- "Amrikyy Travel Agent" → "Amrikyy Travel Agent"
- "Maya" → "Amrikyy"
- "amrikyy-travel-agent" → "amrikyy-travel-agent"

### **Step 2: Code**
Replace in all .js, .ts, .tsx files:
- Class names: `Maya*` → `Amrikyy*`
- Variable names: `maya*` → `amrikyy*`
- Comments and strings

### **Step 3: Configuration**
Update package names and project identifiers

### **Step 4: Database**
Rename tables and update references

---

## ✅ Progress Tracker

### Documentation (0/50 files)
- [ ] Update all markdown files
- [ ] Update README.md
- [ ] Update API documentation

### Backend (0/100 files)
- [ ] Rename mayaPersona.js
- [ ] Update all imports
- [ ] Update all string references

### Frontend (0/80 files)  
- [ ] Update component names
- [ ] Update UI text
- [ ] Update branding

### Configuration (0/10 files)
- [ ] Update package.json files
- [ ] Update environment templates
- [ ] Update build configs

---

## 🚀 Execution Plan

1. **Create backup** of current project
2. **Run automated search/replace** for simple text changes
3. **Manual review** of code-breaking changes (class names, etc.)
4. **Test** all functionality after renaming
5. **Update** git repository name if needed

---

**Status:** Ready to begin systematic renaming  
**Estimated Time:** 2-3 hours  
**Risk Level:** Medium (requires testing after completion)

