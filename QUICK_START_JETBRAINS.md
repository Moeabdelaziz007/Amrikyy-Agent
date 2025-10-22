# 🚀 Quick Start - JetBrains Tools (15 Minutes)

Get up and running with WebStorm and DataGrip in 15 minutes!

---

## 📋 What You'll Do

1. ✅ Install JetBrains Toolbox (5 min)
2. ✅ Install WebStorm (3 min)
3. ✅ Install DataGrip (3 min)
4. ✅ Open Amrikyy project (2 min)
5. ✅ Start coding! (2 min)

---

## 🎯 Step 1: Install JetBrains Toolbox (5 minutes)

### **Download Toolbox**

1. Go to: [https://www.jetbrains.com/toolbox-app/](https://www.jetbrains.com/toolbox-app/)
2. Click **Download**
3. Install the downloaded file
4. Open **JetBrains Toolbox**

### **Sign In**

1. Click **Settings** (gear icon)
2. Click **Log In to JetBrains Account**
3. Enter your **student email**
4. Enter your **password**
5. Done! ✅

---

## 🎯 Step 2: Install WebStorm (3 minutes)

### **In JetBrains Toolbox**

1. Find **WebStorm** in the list
2. Click **Install** button
3. Wait for download (2-3 minutes)
4. Click **WebStorm** to launch

### **First Launch**

1. **Accept** license agreement
2. **Skip** data sharing (optional)
3. **Skip** theme selection (use default)
4. Done! ✅

---

## 🎯 Step 3: Install DataGrip (3 minutes)

### **In JetBrains Toolbox**

1. Find **DataGrip** in the list
2. Click **Install** button
3. Wait for download (2-3 minutes)
4. Keep it closed for now

---

## 🎯 Step 4: Open Amrikyy Project (2 minutes)

### **In WebStorm**

1. Click **Open**
2. Navigate to: `/workspaces/Amrikyy-Agent`
3. Click **OK**
4. Wait for indexing (30 seconds)
5. Done! ✅

You should see:
```
Amrikyy-Agent/
├── frontend/
├── backend/
├── docs/
└── ...
```

---

## 🎯 Step 5: Start Coding! (2 minutes)

### **Run Frontend**

1. **Bottom left** → Click **Terminal**
2. Type:
   ```bash
   cd frontend
   npm run dev
   ```
3. Wait for "ready" message
4. Frontend running! ✅

### **Run Backend (New Terminal)**

1. Click **+** in terminal (new tab)
2. Type:
   ```bash
   cd backend
   npm run dev
   ```
3. Wait for "Server running" message
4. Backend running! ✅

---

## 🎉 You're Ready!

Now you can:
- ✅ Edit React components in `frontend/src/`
- ✅ Edit backend code in `backend/`
- ✅ See changes live in browser
- ✅ Use AI code completion (Copilot)

---

## 🔥 First Things to Try

### **1. Enable GitHub Copilot (2 minutes)**

1. **WebStorm** → **Settings** (Ctrl+Alt+S)
2. **Plugins** → Search "GitHub Copilot"
3. Click **Install**
4. **Restart WebStorm**
5. Sign in with GitHub
6. Start typing - Copilot suggests code! 🤖

### **2. Edit a Component (1 minute)**

1. Open: `frontend/src/pages/LandingPage.tsx`
2. Find line with "Your AI-Powered Travel Companion"
3. Change text to anything you want
4. **Save** (Ctrl+S)
5. Check browser - it updates automatically! ✨

### **3. Test API with HTTP Client (2 minutes)**

1. Create file: `backend/test.http`
2. Paste this:
   ```http
   ### Test AI Chat
   POST http://localhost:5000/api/ai/chat
   Content-Type: application/json

   {
     "message": "Hello Maya!"
   }
   ```
3. Click **▶️** (green arrow) next to POST
4. See response below! 🎯

### **4. Connect DataGrip to Supabase (5 minutes)**

1. Open **DataGrip**
2. Click **+** → **Data Source** → **PostgreSQL**
3. Fill in:
   ```
   Host: db.xxxxxxxxxxxxx.supabase.co
   Port: 5432
   Database: postgres
   User: postgres
   Password: [your-supabase-password]
   ```
4. Click **Test Connection** ✅
5. Click **OK**
6. Now you can run SQL queries!

---

## 💡 Essential Shortcuts

### **WebStorm**

| What | Shortcut |
|------|----------|
| Search everything | **Double Shift** |
| Find file | **Ctrl+Shift+N** |
| Go to definition | **Ctrl+B** |
| Rename | **Shift+F6** |
| Format code | **Ctrl+Alt+L** |
| Run | **Shift+F10** |
| Terminal | **Alt+F12** |
| Save all | **Ctrl+S** |

### **Try This Now:**

1. Press **Double Shift**
2. Type "LandingPage"
3. Press **Enter**
4. File opens! 🎉

---

## 🐛 Common Issues

### **"Cannot find module"**

**Solution:**
```bash
cd frontend
npm install

cd ../backend
npm install
```

### **"Port already in use"**

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### **"TypeScript errors everywhere"**

**Solution:**
1. **Settings** → **TypeScript**
2. Enable **TypeScript Language Service**
3. Restart WebStorm

### **"Copilot not working"**

**Solution:**
1. Check you're signed in to GitHub
2. Check student pack is active
3. Restart WebStorm

---

## 📚 What to Learn Next

### **Day 1 (Today)**
- [x] Install tools
- [x] Open project
- [x] Run servers
- [ ] Edit a component
- [ ] Test an API
- [ ] Connect database

### **Day 2 (Tomorrow)**
- [ ] Learn shortcuts (Double Shift, Ctrl+B)
- [ ] Use Copilot to generate code
- [ ] Debug with breakpoints
- [ ] Refactor code (Shift+F6)

### **Day 3**
- [ ] Create HTTP test files
- [ ] Run SQL queries in DataGrip
- [ ] Use Git integration
- [ ] Customize theme

### **Week 2**
- [ ] Master refactoring tools
- [ ] Set up remote development
- [ ] Use Code With Me (pair programming)
- [ ] Optimize workflow

---

## 🎓 Learning Resources

### **Video Tutorials (Watch These!)**

1. **WebStorm Basics** (10 min)
   - [https://www.youtube.com/watch?v=JbtW0dR74LI](https://www.youtube.com/watch?v=JbtW0dR74LI)

2. **GitHub Copilot in WebStorm** (5 min)
   - [https://www.youtube.com/watch?v=4Y7gKxbFkRI](https://www.youtube.com/watch?v=4Y7gKxbFkRI)

3. **DataGrip Tutorial** (15 min)
   - [https://www.youtube.com/watch?v=Xb9K8IAdZNg](https://www.youtube.com/watch?v=Xb9K8IAdZNg)

### **Interactive Tutorials**

1. **WebStorm Guide**
   - [https://www.jetbrains.com/webstorm/guide/](https://www.jetbrains.com/webstorm/guide/)

2. **Keyboard Shortcuts Practice**
   - In WebStorm: **Help** → **Keyboard Shortcuts PDF**

---

## 🎯 Your First Task (10 minutes)

Let's make a real change to the Amrikyy project!

### **Task: Add Your Name to Landing Page**

1. **Open file:**
   - Press **Double Shift**
   - Type "LandingPage"
   - Press **Enter**

2. **Find the hero section:**
   - Press **Ctrl+F** (Find)
   - Type "Your AI-Powered"
   - Press **Enter**

3. **Add your name:**
   ```tsx
   // Find this line:
   <h1>Your AI-Powered Travel Companion</h1>
   
   // Change to:
   <h1>Your AI-Powered Travel Companion</h1>
   <p className="text-xl mt-4">Built by [Your Name]</p>
   ```

4. **Save:**
   - Press **Ctrl+S**

5. **Check browser:**
   - Go to [http://localhost:3000](http://localhost:3000)
   - See your name! 🎉

6. **Commit changes:**
   - Press **Ctrl+K** (Git Commit)
   - Type message: "feat: add developer name to landing page"
   - Click **Commit**

**Congratulations! You just:**
- ✅ Edited code in WebStorm
- ✅ Saw live changes
- ✅ Committed to Git

---

## 🚀 Next Steps

### **Now that you're set up:**

1. **Read the full guides:**
   - `WEBSTORM_SETUP.md` - Complete WebStorm guide
   - `DATAGRIP_SETUP.md` - Complete DataGrip guide
   - `JETBRAINS_STUDENT_PACK.md` - All available tools

2. **Practice shortcuts:**
   - **Double Shift** - Search everything
   - **Ctrl+B** - Go to definition
   - **Shift+F6** - Rename
   - **Alt+Enter** - Quick fix

3. **Use Copilot:**
   - Write comments describing what you want
   - Let Copilot generate code
   - Accept suggestions with **Tab**

4. **Explore features:**
   - HTTP Client for API testing
   - Database tools for SQL
   - Git integration for version control
   - Debugger for finding bugs

---

## 💬 Need Help?

### **Quick Help in WebStorm**

1. **Press Ctrl+Shift+A** (Find Action)
2. Type what you want to do
3. WebStorm shows you how!

Example:
- Type "format" → Shows format code action
- Type "rename" → Shows rename refactoring
- Type "git" → Shows all git actions

### **Documentation**

- **In WebStorm:** Press **F1** on any code
- **Online:** [https://www.jetbrains.com/help/webstorm/](https://www.jetbrains.com/help/webstorm/)

### **Community**

- **Forum:** [https://intellij-support.jetbrains.com/](https://intellij-support.jetbrains.com/)
- **Reddit:** [r/jetbrains](https://www.reddit.com/r/jetbrains/)
- **Stack Overflow:** Tag `webstorm`

---

## ✅ Checklist

**Before you start coding:**

- [ ] JetBrains Toolbox installed
- [ ] WebStorm installed and opened
- [ ] DataGrip installed
- [ ] Amrikyy project opened in WebStorm
- [ ] Frontend running (port 3000)
- [ ] Backend running (port 5000)
- [ ] GitHub Copilot installed
- [ ] Made first code change
- [ ] Committed to Git

**If all checked - YOU'RE READY! 🎉**

---

## 🎊 Congratulations!

You now have:
- ✅ Professional IDE (WebStorm)
- ✅ Database tool (DataGrip)
- ✅ AI assistant (Copilot)
- ✅ Project running
- ✅ First commit done

**You're ready to build amazing features for Amrikyy! 🚀**

---

**Questions? Just ask!** 😊

I'm here to help you:
- Set up any tool
- Fix any error
- Learn any feature
- Build any component

**Let's build something awesome! 💪**
