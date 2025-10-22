# 🚀 START HERE - You Have Toolbox!

Since you already have JetBrains Toolbox, let's get started in **5 MINUTES**!

---

## ✅ Step 1: Install WebStorm (2 minutes)

1. **Open JetBrains Toolbox**
2. Find **WebStorm** in the list
3. Click **Install**
4. Wait 2 minutes
5. Click **WebStorm** to launch

---

## ✅ Step 2: Open Amrikyy Project (1 minute)

1. In WebStorm, click **Open**
2. Navigate to: `/workspaces/Amrikyy-Agent`
3. Click **OK**
4. Wait for indexing (30 seconds)

**You should see:**
```
Amrikyy-Agent/
├── frontend/
├── backend/
├── docs/
└── ...
```

---

## ✅ Step 3: Install GitHub Copilot (2 minutes)

1. **Settings** (Ctrl+Alt+S)
2. **Plugins** → Search "GitHub Copilot"
3. Click **Install**
4. **Restart WebStorm**
5. Sign in with your GitHub account
6. Done! 🤖

---

## 🎉 You're Ready to Code!

### **Run the Project:**

**Terminal in WebStorm** (Alt+F12):

```bash
# Frontend
cd frontend
npm run dev

# Backend (new terminal tab - click +)
cd backend
npm run dev
```

**Open browser:** [http://localhost:3000](http://localhost:3000)

---

## 🔥 Try These NOW:

### **1. Search Anything (Double Shift)**

1. Press **Shift** twice quickly
2. Type "LandingPage"
3. Press **Enter**
4. File opens! ✨

### **2. Edit Landing Page**

1. Find line: `Your AI-Powered Travel Companion`
2. Change it to anything you want
3. Press **Ctrl+S** to save
4. Check browser - it updates! 🎉

### **3. Use Copilot**

1. Open any `.tsx` file
2. Type a comment:
   ```typescript
   // Create a button component with hover effect
   ```
3. Press **Enter**
4. Copilot suggests code! Press **Tab** to accept

### **4. Test API**

1. Create file: `backend/test.http`
2. Paste:
   ```http
   ### Test AI Chat
   POST http://localhost:5000/api/ai/chat
   Content-Type: application/json

   {
     "message": "Hello Maya!"
   }
   ```
3. Click **▶️** next to POST
4. See response! 🎯

---

## 📚 Essential Shortcuts

| Action | Shortcut |
|--------|----------|
| **Search Everything** | Double Shift |
| **Find File** | Ctrl+Shift+N |
| **Go to Definition** | Ctrl+B |
| **Rename** | Shift+F6 |
| **Format Code** | Ctrl+Alt+L |
| **Terminal** | Alt+F12 |
| **Git Commit** | Ctrl+K |

---

## 🗄️ Want Database Tools?

### **Install DataGrip (Optional)**

1. **Open Toolbox**
2. Find **DataGrip**
3. Click **Install**
4. See `DATAGRIP_SETUP.md` for connection guide

---

## 📖 Full Guides Available

- `QUICK_START_JETBRAINS.md` - Detailed 15-min guide
- `WEBSTORM_SETUP.md` - Complete WebStorm setup
- `DATAGRIP_SETUP.md` - Database management
- `JETBRAINS_STUDENT_PACK.md` - All available tools
- `SECURITY_BEST_PRACTICES.md` - Keep secrets safe

---

## 🆘 Common Issues

### **"Cannot find module"**
```bash
cd frontend && npm install
cd backend && npm install
```

### **"Port already in use"**
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

### **"Copilot not working"**
- Check you're signed in to GitHub
- Restart WebStorm
- Check student pack is active

---

## 🎯 Your First Task (5 minutes)

**Add your name to the landing page:**

1. Press **Double Shift**
2. Type "LandingPage"
3. Find: `Your AI-Powered Travel Companion`
4. Add below it:
   ```tsx
   <p className="text-xl mt-4">Built by [Your Name]</p>
   ```
5. Save (Ctrl+S)
6. Check browser!
7. Commit (Ctrl+K)

**Congratulations! You just made your first change! 🎉**

---

## 💬 Need Help?

Just ask me! I can help you:
- Set up any feature
- Fix any error
- Learn any shortcut
- Build any component

**Let's build something awesome! 🚀**

---

## ⚡ Quick Commands

```bash
# Start everything
cd frontend && npm run dev &
cd backend && npm run dev &

# Stop everything
pkill -f "vite"
pkill -f "node.*server.js"

# Install dependencies
cd frontend && npm install
cd backend && npm install

# Format code
npm run format

# Run tests
npm test
```

---

**Ready? Open WebStorm and let's code! 💪**
