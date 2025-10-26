# 🚀 Simple Git Workflow Guide

**For**: Amrikyy-Agent Project  
**Date**: October 24, 2025  
**Location**: `~/Desktop/Amrikyy-Agent`

---

## ✅ Repository Status: READY

Your repository is now cloned locally and ready to use!

```bash
Location: ~/Desktop/Amrikyy-Agent
Branch: main
Status: ✅ Clean (up to date with GitHub)
```

---

## 📚 Basic Git Commands (Copy & Paste)

### 1. **Navigate to Your Project** (Always do this first)
```bash
cd ~/Desktop/Amrikyy-Agent
```

### 2. **Check What Changed**
```bash
git status
```
This shows:
- ✅ Files you added/modified
- ❌ Files you deleted
- ⚠️ Files not tracked by git

### 3. **Pull Latest Changes** (Do this BEFORE starting work)
```bash
git pull origin main
```
This downloads any changes from GitHub to your computer.

### 4. **Add Your Changes**
```bash
# Add ALL changes
git add .

# OR add specific files
git add backend/server.js
git add frontend/src/App.tsx
```

### 5. **Commit Your Changes** (Save locally)
```bash
git commit -m "Brief description of what you changed"
```

Examples:
```bash
git commit -m "Fixed login bug"
git commit -m "Added new AI agent"
git commit -m "Updated documentation"
```

### 6. **Push to GitHub** (Upload to cloud)
```bash
git push origin main
```

---

## 🔄 Complete Workflow (Step by Step)

### **Every Time You Start Working:**

```bash
# 1. Go to project folder
cd ~/Desktop/Amrikyy-Agent

# 2. Pull latest changes from GitHub
git pull origin main

# 3. Check current status
git status
```

### **After Making Changes:**

```bash
# 1. Check what you changed
git status

# 2. Add all your changes
git add .

# 3. Commit with a message
git commit -m "Describe what you did"

# 4. Push to GitHub
git push origin main
```

---

## 🆘 Common Problems & Solutions

### ❌ Problem: "Your branch is behind"
**Solution:**
```bash
git pull origin main
```

### ❌ Problem: "You have uncommitted changes"
**Solution:**
```bash
# Save your changes first
git add .
git commit -m "Work in progress"

# Then pull
git pull origin main
```

### ❌ Problem: "Merge conflict"
**Solution:**
```bash
# 1. Open the conflicting file in VS Code
# 2. Choose which version to keep (you'll see markers like <<<<<<)
# 3. Save the file
# 4. Add and commit
git add .
git commit -m "Resolved merge conflict"
git push origin main
```

### ❌ Problem: "Permission denied (publickey)"
**Solution:**
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/Moeabdelaziz007/Amrikyy-Agent.git

# Try again
git push origin main
```

### ❌ Problem: "Need to login"
**Solution:**
```bash
# Install GitHub CLI
brew install gh

# Login
gh auth login

# Follow the prompts and choose HTTPS
```

---

## 📖 Detailed Examples

### Example 1: Fix a Bug
```bash
cd ~/Desktop/Amrikyy-Agent

# Pull latest
git pull origin main

# Make your changes in VS Code...

# Check status
git status

# Add and commit
git add .
git commit -m "🐛 Fixed authentication error in backend"

# Push to GitHub
git push origin main
```

### Example 2: Add New Feature
```bash
cd ~/Desktop/Amrikyy-Agent

# Pull latest
git pull origin main

# Create new files and code...

# Add and commit
git add .
git commit -m "✨ Added new AI chat feature"

# Push
git push origin main
```

### Example 3: Update Documentation
```bash
cd ~/Desktop/Amrikyy-Agent

# Edit README.md or other docs...

git add .
git commit -m "📚 Updated deployment documentation"
git push origin main
```

---

## 🎯 Quick Reference Card

| Action | Command |
|--------|---------|
| Go to project | `cd ~/Desktop/Amrikyy-Agent` |
| Check status | `git status` |
| Pull changes | `git pull origin main` |
| Add all changes | `git add .` |
| Commit | `git commit -m "message"` |
| Push | `git push origin main` |
| See history | `git log --oneline` |
| Undo last commit | `git reset --soft HEAD~1` |

---

## 💡 Pro Tips

### 1. **Always Pull Before You Start**
Prevents merge conflicts!
```bash
git pull origin main
```

### 2. **Commit Often**
Small commits are better than big ones:
```bash
git commit -m "Added button"
# work more...
git commit -m "Added click handler"
# work more...
git commit -m "Added API call"
```

### 3. **Use Good Commit Messages**
Bad: `git commit -m "stuff"`  
Good: `git commit -m "Fixed login button styling"`

### 4. **Check Status Frequently**
```bash
git status
```
Shows what's changed before you commit.

### 5. **Use Emojis (Optional but fun!)**
```bash
git commit -m "✨ New feature"
git commit -m "🐛 Bug fix"
git commit -m "📚 Documentation"
git commit -m "🎨 UI improvements"
git commit -m "🔧 Configuration"
```

---

## 🔐 Authentication Setup (One-Time)

### Option 1: GitHub CLI (Recommended)
```bash
# Install
brew install gh

# Login
gh auth login

# Follow prompts:
# - Choose GitHub.com
# - Choose HTTPS
# - Authenticate with browser
```

### Option 2: Personal Access Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "Amrikyy Agent"
4. Select scopes: `repo` (all checkboxes)
5. Click "Generate token"
6. Copy the token (starts with `ghp_`)
7. When git asks for password, paste the token

---

## 📱 Working from VS Code

### Open in VS Code:
```bash
cd ~/Desktop/Amrikyy-Agent
code .
```

### Use VS Code's Built-in Git:
1. Click the Source Control icon (left sidebar)
2. See your changes
3. Click "+" to stage changes
4. Type commit message
5. Click ✓ to commit
6. Click "..." → Push

---

## 🎓 Learning More

### See commit history:
```bash
git log --oneline --graph
```

### See what changed in a file:
```bash
git diff backend/server.js
```

### Discard changes to a file:
```bash
git checkout backend/server.js
```

### Create a backup branch:
```bash
git checkout -b backup-oct24
git checkout main
```

---

## 🚨 Emergency Commands

### **Undo last commit (keep changes):**
```bash
git reset --soft HEAD~1
```

### **Discard ALL local changes:**
```bash
git reset --hard HEAD
```

### **Start fresh from GitHub:**
```bash
cd ~/Desktop
rm -rf Amrikyy-Agent
git clone https://github.com/Moeabdelaziz007/Amrikyy-Agent.git
cd Amrikyy-Agent
```

---

## ✅ Your Daily Workflow

```bash
# Morning: Start work
cd ~/Desktop/Amrikyy-Agent
git pull origin main

# During work: Save progress
git add .
git commit -m "Work in progress"

# End of day: Push everything
git push origin main
```

---

## 📞 Need Help?

### Check if git is working:
```bash
cd ~/Desktop/Amrikyy-Agent
git status
```

### See remote URL:
```bash
git remote -v
```

### Test GitHub connection:
```bash
git ls-remote origin
```

---

## 🎉 Success Checklist

- [x] ✅ Repository cloned to `~/Desktop/Amrikyy-Agent`
- [x] ✅ On `main` branch
- [x] ✅ Connected to GitHub
- [x] ✅ Working tree is clean
- [ ] Add your changes
- [ ] Commit your changes
- [ ] Push to GitHub

---

## 🔗 Useful Links

- **Your Repository**: https://github.com/Moeabdelaziz007/Amrikyy-Agent
- **GitHub Help**: https://docs.github.com/en/get-started
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf

---

**Remember**: 
1. **Pull** before you work (`git pull origin main`)
2. **Add** your changes (`git add .`)
3. **Commit** with a message (`git commit -m "message"`)
4. **Push** to share (`git push origin main`)

**You've got this! 🚀**

---

**Created**: October 24, 2025  
**For**: Mohamed Hossameldin Abdelaziz (@Moeabdelaziz007)  
**Project**: Amrikyy AI Agent Platform
