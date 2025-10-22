# 🎓 ALL JetBrains Tools - Complete Guide

Everything you have access to with your Student Pack and how to use them for Amrikyy!

---

## 🎁 What You Have Access To

With your JetBrains Student Pack, you get **ALL** of these tools **FREE**:

### **IDEs (Development Tools)**
1. ✅ **WebStorm** - JavaScript/TypeScript/React/Node.js
2. ✅ **PyCharm Professional** - Python
3. ✅ **IntelliJ IDEA Ultimate** - Java/Kotlin/Full-stack
4. ✅ **DataGrip** - Database management
5. ✅ **PhpStorm** - PHP
6. ✅ **GoLand** - Go
7. ✅ **Rider** - .NET/C#
8. ✅ **CLion** - C/C++
9. ✅ **RubyMine** - Ruby
10. ✅ **AppCode** - iOS/macOS

### **Collaboration Tools**
11. ✅ **Gateway** - Remote development
12. ✅ **Space** - Team collaboration platform
13. ✅ **Code With Me** - Pair programming

### **AI Tools**
14. ✅ **GitHub Copilot** - AI code completion
15. ✅ **AI Assistant** - Built-in AI helper

---

## 🚀 For Amrikyy Project - What to Install

### **MUST INSTALL** ⭐⭐⭐⭐⭐

#### **1. WebStorm**
**Purpose**: Main development IDE

**Use for:**
- ✅ React + TypeScript frontend
- ✅ Node.js + Express backend
- ✅ API testing (HTTP Client)
- ✅ Git operations
- ✅ Debugging
- ✅ GitHub Copilot

**Install NOW:**
1. Open Toolbox
2. Find **WebStorm**
3. Click **Install**

#### **2. DataGrip**
**Purpose**: Database management

**Use for:**
- ✅ Supabase PostgreSQL
- ✅ SQL queries
- ✅ Schema design
- ✅ Data visualization
- ✅ Performance optimization

**Install NOW:**
1. Open Toolbox
2. Find **DataGrip**
3. Click **Install**

#### **3. Gateway**
**Purpose**: Remote development

**Use for:**
- ✅ Develop on remote servers
- ✅ Access Gitpod workspace
- ✅ Work from anywhere
- ✅ Powerful remote machines

**Install NOW:**
1. Open Toolbox
2. Find **Gateway**
3. Click **Install**

---

### **OPTIONAL** ⭐⭐⭐

#### **4. PyCharm Professional**
**Purpose**: Python development

**Use for (if you add Python to Amrikyy):**
- ✅ Python backend services
- ✅ Data analysis scripts
- ✅ Machine learning models
- ✅ Automation scripts

**When to install:**
- If you add Python microservices
- If you need data analysis
- If you build ML features

#### **5. IntelliJ IDEA Ultimate**
**Purpose**: Alternative to WebStorm (more features)

**Use for:**
- ✅ Everything WebStorm does
- ✅ Plus: Java/Kotlin support
- ✅ Plus: Spring Boot
- ✅ Plus: Database tools (built-in)
- ✅ Plus: More plugins

**When to install:**
- If you prefer one IDE for everything
- If you add Java backend
- If you want more features

---

## 🎯 Detailed Setup Guides

### **1. WebStorm Setup** ⭐ PRIORITY 1

**Install:**
```bash
# In Toolbox
1. Find WebStorm
2. Click Install
3. Wait 2-3 minutes
4. Launch
```

**Configure:**
1. **Open Project:**
   - File → Open → `/workspaces/Amrikyy-Agent`

2. **Install Plugins:**
   - Settings → Plugins
   - Install: GitHub Copilot ⭐
   - Install: Tailwind CSS
   - Install: Prettier
   - Install: ESLint

3. **Run Configurations:**
   ```
   Frontend:
   - Name: Frontend Dev
   - Script: dev
   - Package.json: frontend/package.json
   
   Backend:
   - Name: Backend Dev
   - Script: dev
   - Package.json: backend/package.json
   ```

4. **Enable Copilot:**
   - Settings → Plugins → GitHub Copilot
   - Sign in with GitHub
   - Start coding with AI! 🤖

**See:** `WEBSTORM_SETUP.md` for complete guide

---

### **2. DataGrip Setup** ⭐ PRIORITY 2

**Install:**
```bash
# In Toolbox
1. Find DataGrip
2. Click Install
3. Wait 2-3 minutes
4. Launch
```

**Connect to Supabase:**
```
1. Click + → Data Source → PostgreSQL
2. Fill in:
   Host: db.xxxxxxxxxxxxx.supabase.co
   Port: 5432
   Database: postgres
   User: postgres
   Password: [your-supabase-password]
3. Test Connection ✅
4. Click OK
```

**Use Cases:**
- Run SQL queries
- View/edit data
- Design schema
- Export data
- Performance analysis

**See:** `DATAGRIP_SETUP.md` for complete guide

---

### **3. Gateway Setup** ⭐ PRIORITY 3

**What is Gateway?**
Gateway lets you code on remote servers while using your local IDE.

**Use Cases for Amrikyy:**
1. **Develop on Gitpod:**
   - Connect to your Gitpod workspace
   - Use WebStorm locally
   - Code runs on Gitpod server

2. **Work from anywhere:**
   - Connect from laptop
   - Connect from desktop
   - Same environment everywhere

3. **Powerful remote machines:**
   - Use powerful cloud servers
   - Run heavy builds remotely
   - Save local resources

**Setup:**

1. **Install Gateway:**
   - Open Toolbox
   - Find **Gateway**
   - Click Install

2. **Connect to Gitpod:**
   ```bash
   # In Gateway
   1. Click "Connect to SSH"
   2. Enter Gitpod SSH details:
      Host: [your-gitpod-workspace].gitpod.io
      Port: 22
      User: gitpod
   3. Select "WebStorm"
   4. Click Connect
   ```

3. **Open Project:**
   - Gateway opens WebStorm
   - Project runs on Gitpod
   - You code locally!

**Benefits:**
- ✅ Fast local IDE
- ✅ Powerful remote execution
- ✅ No local setup needed
- ✅ Work from any device

---

### **4. PyCharm Professional** (Optional)

**When to use:**
- Adding Python backend services
- Data analysis scripts
- Machine learning features
- Automation tools

**Setup:**
```bash
# In Toolbox
1. Find PyCharm Professional
2. Click Install
3. Open Python project
```

**Use Cases for Amrikyy:**
```python
# Example: Data analysis script
# File: backend/scripts/analyze_bookings.py

import pandas as pd
from supabase import create_client

# Analyze booking patterns
def analyze_bookings():
    supabase = create_client(url, key)
    bookings = supabase.table('bookings').select('*').execute()
    
    df = pd.DataFrame(bookings.data)
    
    # Popular destinations
    popular = df['destination'].value_counts()
    
    # Revenue by month
    df['month'] = pd.to_datetime(df['created_at']).dt.month
    revenue = df.groupby('month')['total_price'].sum()
    
    return {
        'popular_destinations': popular.to_dict(),
        'monthly_revenue': revenue.to_dict()
    }
```

---

### **5. IntelliJ IDEA Ultimate** (Optional)

**When to use:**
- Want one IDE for everything
- Adding Java/Kotlin backend
- Need more advanced features

**Comparison with WebStorm:**

| Feature | WebStorm | IntelliJ IDEA |
|---------|----------|---------------|
| JavaScript/TypeScript | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| React/Node.js | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Java/Kotlin | ❌ | ⭐⭐⭐⭐⭐ |
| Database Tools | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| HTTP Client | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Spring Boot | ❌ | ⭐⭐⭐⭐⭐ |
| Memory Usage | Low | High |

**Recommendation:** Stick with WebStorm unless you need Java

---

## 🌐 Gateway - Remote Development Guide

### **What is Gateway?**

Gateway is a **thin client** that connects to remote IDEs. You get:
- ✅ Local IDE experience
- ✅ Remote code execution
- ✅ Fast performance
- ✅ Work from anywhere

### **Use Cases:**

#### **1. Connect to Gitpod Workspace**

```bash
# Your current Gitpod workspace
Workspace: 019a06cf-fa64-7318-ab31-e93add65c1f0

# SSH connection
Host: 019a06cf-fa64-7318-ab31-e93add65c1f0.ssh.eu-central-1-01.gitpod.dev
Port: 22
User: gitpod
```

**Steps:**
1. Open Gateway
2. Click "Connect to SSH"
3. Enter Gitpod SSH details
4. Select "WebStorm"
5. Gateway downloads WebStorm to Gitpod
6. Opens local window
7. Code runs on Gitpod!

**Benefits:**
- ✅ Use local WebStorm UI
- ✅ Code runs on Gitpod (powerful)
- ✅ No local Node.js needed
- ✅ Access from any device

#### **2. Connect to Cloud Server**

```bash
# Example: AWS EC2 instance
Host: ec2-xx-xx-xx-xx.compute.amazonaws.com
Port: 22
User: ubuntu
Key: ~/.ssh/amrikyy-key.pem
```

**Use for:**
- Production debugging
- Performance testing
- Database access
- Server management

#### **3. Connect to Team Member's Machine**

```bash
# Pair programming
Host: teammate-machine.local
Port: 22
User: developer
```

**Use for:**
- Code reviews
- Pair programming
- Knowledge sharing
- Debugging together

---

## 🤝 Space - Team Collaboration

### **What is Space?**

Space is JetBrains' all-in-one team collaboration platform:
- ✅ Git hosting
- ✅ Code reviews
- ✅ CI/CD pipelines
- ✅ Package registry
- ✅ Team chat
- ✅ Project management
- ✅ Documentation

### **Setup for Amrikyy Team:**

1. **Create Organization:**
   - Go to [jetbrains.space](https://jetbrains.space)
   - Click "Create Organization"
   - Name: "Amrikyy Team"

2. **Import Repository:**
   - Projects → New Project
   - Import from Git
   - URL: `https://github.com/Moeabdelaziz007/Amrikyy-Agent.git`

3. **Set Up CI/CD:**
   ```kotlin
   // .space.kts
   job("Build and Test") {
       container("node:18") {
           shellScript {
               content = """
                   # Frontend
                   cd frontend
                   npm install
                   npm run build
                   npm test
                   
                   # Backend
                   cd ../backend
                   npm install
                   npm test
               """
           }
       }
   }
   
   job("Deploy to Production") {
       container("node:18") {
           shellScript {
               content = """
                   # Deploy to Render
                   curl -X POST ${'$'}RENDER_DEPLOY_HOOK
               """
           }
       }
   }
   ```

4. **Invite Team:**
   - Settings → Members
   - Add team members
   - Set permissions

### **Features to Use:**

#### **Code Reviews:**
```
1. Create merge request
2. Team reviews code
3. Discuss changes
4. Approve/reject
5. Merge to main
```

#### **Team Chat:**
```
Channels:
- #general - Team discussions
- #development - Code questions
- #bugs - Bug reports
- #deployments - Deployment notifications
```

#### **Package Registry:**
```bash
# Publish npm packages
npm publish --registry https://npm.pkg.jetbrains.space/amrikyy/p/main/npm

# Install from Space
npm install @amrikyy/shared-components
```

---

## 🤖 AI Tools

### **1. GitHub Copilot** ⭐⭐⭐⭐⭐

**What it does:**
- Suggests code as you type
- Generates functions from comments
- Writes tests automatically
- Translates between languages

**Setup:**
1. WebStorm → Settings → Plugins
2. Install "GitHub Copilot"
3. Restart WebStorm
4. Sign in with GitHub (student account)

**Usage:**
```typescript
// Type a comment:
// Create a booking form component with validation

// Copilot generates:
export function BookingForm() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const newErrors = {};
    if (!origin) newErrors.origin = 'Required';
    if (!destination) newErrors.destination = 'Required';
    return newErrors;
  };
  
  // ... complete component
}
```

### **2. AI Assistant** (Built-in)

**What it does:**
- Explains code
- Suggests improvements
- Generates documentation
- Refactors code

**Usage:**
1. Select code
2. Right-click → AI Actions
3. Choose action:
   - Explain code
   - Generate docs
   - Suggest improvements
   - Write tests

---

## 📊 Tool Comparison

### **Which IDE for What?**

| Task | Best Tool | Alternative |
|------|-----------|-------------|
| React/TypeScript | WebStorm | IntelliJ IDEA |
| Node.js Backend | WebStorm | IntelliJ IDEA |
| Database | DataGrip | IntelliJ IDEA |
| Python Scripts | PyCharm | IntelliJ IDEA |
| Remote Dev | Gateway | - |
| Team Collab | Space | GitHub |
| API Testing | WebStorm HTTP Client | Postman |
| Git Operations | WebStorm | GitHub Desktop |

### **Recommended Setup:**

```
Primary: WebStorm (coding)
Secondary: DataGrip (database)
Optional: Gateway (remote work)
Optional: PyCharm (if adding Python)
Team: Space (collaboration)
```

---

## 🎯 Installation Priority

### **Install NOW:**
1. ✅ **WebStorm** - Main development
2. ✅ **DataGrip** - Database management
3. ✅ **Gateway** - Remote development

### **Install Later (if needed):**
4. ⏳ **PyCharm** - If adding Python
5. ⏳ **IntelliJ IDEA** - If adding Java
6. ⏳ **Space** - For team collaboration

### **Don't Need (for Amrikyy):**
- ❌ PhpStorm (no PHP)
- ❌ GoLand (no Go)
- ❌ Rider (no .NET)
- ❌ CLion (no C/C++)
- ❌ RubyMine (no Ruby)
- ❌ AppCode (no iOS)

---

## 💡 Pro Tips

### **1. Sync Settings Across All IDEs**

```
File → Manage IDE Settings → Settings Sync
✅ Enable sync with JetBrains account

Syncs:
- Keymap
- Code style
- Plugins
- UI settings
- Tools
```

### **2. Use Toolbox for Everything**

```
Benefits:
✅ Easy installation
✅ Automatic updates
✅ Manage all IDEs
✅ Quick project switching
✅ Version management
```

### **3. Learn Universal Shortcuts**

These work in ALL JetBrains IDEs:

| Action | Shortcut |
|--------|----------|
| Search Everything | Double Shift |
| Find Action | Ctrl+Shift+A |
| Go to Definition | Ctrl+B |
| Find Usages | Alt+F7 |
| Rename | Shift+F6 |
| Format Code | Ctrl+Alt+L |
| Quick Fix | Alt+Enter |

### **4. Use Gateway for Heavy Tasks**

```
Local machine: Light tasks, editing
Remote server: Heavy builds, tests, deployments

Benefits:
✅ Save battery
✅ Faster builds
✅ More resources
```

---

## 🚀 Quick Start Commands

### **Install All Essential Tools:**

```bash
# In Toolbox, install:
1. WebStorm
2. DataGrip
3. Gateway

# Total time: 10 minutes
# Total size: ~2GB
```

### **Open Amrikyy in WebStorm:**

```bash
# Option 1: From WebStorm
File → Open → /workspaces/Amrikyy-Agent

# Option 2: From Terminal
webstorm /workspaces/Amrikyy-Agent

# Option 3: From Toolbox
Toolbox → WebStorm → Open → Select folder
```

### **Connect Gateway to Gitpod:**

```bash
# In Gateway
1. Connect to SSH
2. Host: [workspace-id].ssh.eu-central-1-01.gitpod.dev
3. Port: 22
4. User: gitpod
5. Select WebStorm
6. Connect
```

---

## 📚 Complete Documentation

- `START_HERE.md` - Quick 5-minute start
- `WEBSTORM_SETUP.md` - Complete WebStorm guide
- `DATAGRIP_SETUP.md` - Database management
- `JETBRAINS_STUDENT_PACK.md` - Student pack overview
- `SECURITY_BEST_PRACTICES.md` - Keep secrets safe

---

## ✅ Setup Checklist

### **Essential (Do Now):**
- [ ] Install WebStorm
- [ ] Install DataGrip
- [ ] Install Gateway
- [ ] Open Amrikyy in WebStorm
- [ ] Install GitHub Copilot
- [ ] Connect DataGrip to Supabase
- [ ] Test Gateway connection

### **Optional (Do Later):**
- [ ] Install PyCharm (if needed)
- [ ] Set up Space team
- [ ] Configure CI/CD
- [ ] Enable settings sync
- [ ] Customize themes

---

## 🎊 You Have Everything!

With your Student Pack, you have:
- ✅ **ALL** JetBrains IDEs (worth $1000+/year)
- ✅ **GitHub Copilot** (worth $100/year)
- ✅ **Space** team platform (worth $500+/year)
- ✅ **Gateway** remote development
- ✅ **AI Assistant** built-in
- ✅ **All plugins** and features

**Total Value: $1600+/year - ALL FREE! 🎉**

---

**Ready to use professional tools? Let's build Amrikyy! 🚀**
