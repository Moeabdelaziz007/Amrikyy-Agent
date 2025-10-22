# 🚀 WebStorm Setup Guide - Amrikyy Project

Complete guide to set up WebStorm for maximum productivity on the Amrikyy Travel Platform.

---

## 🎯 Why WebStorm for Amrikyy?

WebStorm is **THE BEST** IDE for this project because:
- ✅ **React + TypeScript** - Best-in-class support
- ✅ **Node.js Backend** - Integrated debugging
- ✅ **Tailwind CSS** - Intelligent autocomplete
- ✅ **Git Integration** - Visual merge, blame, history
- ✅ **Database Tools** - Built-in SQL console
- ✅ **HTTP Client** - Test APIs without Postman
- ✅ **Refactoring** - Safe rename, extract, move
- ✅ **GitHub Copilot** - AI code completion (Student Pack!)

---

## 📥 Installation

### **Step 1: Download WebStorm**

1. Go to [JetBrains WebStorm](https://www.jetbrains.com/webstorm/download/)
2. Download for your OS (Windows/Mac/Linux)
3. Install with default settings

### **Step 2: Activate Student License**

1. Open WebStorm
2. **Help** → **Register**
3. Select **JetBrains Account**
4. Sign in with your student email
5. License activates automatically ✅

---

## 🔧 Initial Setup

### **Step 1: Open Amrikyy Project**

```bash
# Option 1: From WebStorm
File → Open → /workspaces/Amrikyy-Agent

# Option 2: From Terminal
webstorm /workspaces/Amrikyy-Agent

# Option 3: From Git
File → New → Project from Version Control
URL: https://github.com/Moeabdelaziz007/Amrikyy-Agent.git
```

### **Step 2: Configure Node.js**

WebStorm auto-detects Node.js, but verify:

1. **Settings** (Ctrl+Alt+S) → **Languages & Frameworks** → **Node.js**
2. **Node interpreter**: Should show `/usr/bin/node` or similar
3. **Package manager**: npm (auto-detected)
4. Click **OK**

### **Step 3: Configure TypeScript**

1. **Settings** → **Languages & Frameworks** → **TypeScript**
2. **TypeScript version**: Project (from node_modules)
3. **Enable TypeScript Language Service**: ✅
4. **Recompile on changes**: ✅
5. Click **OK**

---

## 🎨 Essential Plugins

### **Must-Have Plugins**

Install via: **Settings** → **Plugins** → **Marketplace**

1. **GitHub Copilot** ⭐⭐⭐⭐⭐
   - AI code completion
   - FREE with Student Pack!
   - Install → Sign in with GitHub

2. **Tailwind CSS** ⭐⭐⭐⭐⭐
   - Intelligent class completion
   - Color preview
   - Documentation on hover

3. **Prettier** ⭐⭐⭐⭐⭐
   - Code formatting
   - Auto-format on save

4. **ESLint** ⭐⭐⭐⭐⭐
   - JavaScript/TypeScript linting
   - Auto-fix issues

5. **GitToolBox** ⭐⭐⭐⭐
   - Enhanced Git integration
   - Inline blame
   - Auto-fetch

6. **Rainbow Brackets** ⭐⭐⭐⭐
   - Colorful bracket matching
   - Easier to read nested code

7. **Material Theme UI** ⭐⭐⭐
   - Beautiful themes
   - Better syntax highlighting

---

## ⚙️ Project Configuration

### **1. Enable Prettier**

**Settings** → **Languages & Frameworks** → **JavaScript** → **Prettier**

```
Prettier package: /workspaces/Amrikyy-Agent/frontend/node_modules/prettier
Run on save: ✅
Run for files: {**/*,*}.{js,ts,jsx,tsx,css,json,md}
```

### **2. Enable ESLint**

**Settings** → **Languages & Frameworks** → **JavaScript** → **Code Quality Tools** → **ESLint**

```
Automatic ESLint configuration: ✅
Run eslint --fix on save: ✅
```

### **3. Configure Code Style**

**Settings** → **Editor** → **Code Style** → **TypeScript**

```
Tab size: 2
Indent: 2
Continuation indent: 2
Use single quotes: ✅
Trailing comma: ES5
Semicolons: Always
```

### **4. Enable Auto-Import**

**Settings** → **Editor** → **General** → **Auto Import**

```
TypeScript/JavaScript:
  ✅ Add unambiguous imports on the fly
  ✅ Optimize imports on the fly
```

---

## 🚀 Run Configurations

### **Frontend (React + Vite)**

1. **Run** → **Edit Configurations** → **+** → **npm**
2. Configure:

```
Name: Frontend Dev Server
Package.json: /workspaces/Amrikyy-Agent/frontend/package.json
Command: run
Scripts: dev
```

3. Click **OK**
4. Run with **Shift+F10** or click ▶️

### **Backend (Node.js + Express)**

1. **Run** → **Edit Configurations** → **+** → **npm**
2. Configure:

```
Name: Backend Dev Server
Package.json: /workspaces/Amrikyy-Agent/backend/package.json
Command: run
Scripts: dev
Environment variables: (click folder icon)
  - Add from backend/.env
```

3. Click **OK**
4. Run with **Shift+F10**

### **Both Servers (Compound)**

1. **Run** → **Edit Configurations** → **+** → **Compound**
2. Configure:

```
Name: Full Stack Dev
Configurations:
  ✅ Frontend Dev Server
  ✅ Backend Dev Server
```

3. Click **OK**
4. Run both with one click! 🎉

---

## 🐛 Debugging

### **Debug Frontend (React)**

1. **Run** → **Edit Configurations** → **+** → **JavaScript Debug**
2. Configure:

```
Name: Debug Frontend
URL: http://localhost:3000
Browser: Chrome
```

3. Set breakpoints in `.tsx` files (click line number)
4. Click 🐛 Debug button
5. Browser opens, breakpoints hit in WebStorm!

### **Debug Backend (Node.js)**

1. **Run** → **Edit Configurations** → **+** → **Node.js**
2. Configure:

```
Name: Debug Backend
JavaScript file: backend/server.js
Environment variables: (from backend/.env)
```

3. Set breakpoints in `.js` files
4. Click 🐛 Debug button
5. Breakpoints hit when API called!

---

## 🔍 Powerful Features

### **1. Smart Code Completion**

Type and press **Ctrl+Space**:

```typescript
// Type: useS
// WebStorm suggests: useState, useEffect, useRef, etc.

// Type: motion.
// WebStorm suggests: motion.div, motion.button, etc.

// Type: className="
// WebStorm suggests Tailwind classes with preview!
```

### **2. Refactoring**

**Right-click** → **Refactor**:

- **Rename** (Shift+F6): Rename variable/function everywhere
- **Extract Method** (Ctrl+Alt+M): Extract code to function
- **Extract Variable** (Ctrl+Alt+V): Extract to variable
- **Move** (F6): Move file/component safely
- **Change Signature**: Update function parameters

Example:
```typescript
// Before
const handleClick = () => {
  console.log('Clicked');
  setCount(count + 1);
  saveToDatabase(count + 1);
}

// Select code → Extract Method → Name: "incrementCount"

// After
const incrementCount = (newCount: number) => {
  setCount(newCount);
  saveToDatabase(newCount);
}

const handleClick = () => {
  console.log('Clicked');
  incrementCount(count + 1);
}
```

### **3. Find Usages**

**Alt+F7** on any symbol:
- See all usages
- Navigate to usage
- Refactor safely

### **4. Quick Documentation**

**Ctrl+Q** on any symbol:
- See TypeScript types
- See JSDoc comments
- See function signatures

### **5. Parameter Info**

**Ctrl+P** inside function call:
- See parameter names
- See parameter types
- See which parameter you're on

---

## 🌐 HTTP Client (Better than Postman!)

### **Create API Test File**

1. Create `backend/api-tests.http`
2. Add requests:

```http
### Test AI Chat
POST http://localhost:5000/api/ai/chat
Content-Type: application/json

{
  "message": "Hello Maya, I want to book a flight to Paris"
}

### Test Booking Creation
POST http://localhost:5000/api/bookings
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "origin": "CAI",
  "destination": "DXB",
  "date": "2025-12-01",
  "passengers": 2,
  "price": 599.99
}

### Get User Bookings
GET http://localhost:5000/api/bookings/user/{{userId}}
Authorization: Bearer {{token}}

### Test PayPal Order
POST http://localhost:5000/api/paypal/create-order
Content-Type: application/json

{
  "amount": 299.99,
  "currency": "USD",
  "bookingId": "{{bookingId}}"
}
```

3. Click ▶️ next to request to execute
4. See response in WebStorm!

**Benefits:**
- ✅ No need for Postman
- ✅ Version controlled (commit .http files)
- ✅ Environment variables
- ✅ Response history
- ✅ Code generation

---

## 🗄️ Database Tools

### **Connect to Supabase**

1. **View** → **Tool Windows** → **Database**
2. Click **+** → **Data Source** → **PostgreSQL**
3. Configure:

```
Name: Amrikyy Supabase
Host: db.xxxxxxxxxxxxx.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [your-password]
```

4. Test Connection ✅
5. Click **OK**

**Now you can:**
- Run SQL queries
- View/edit data
- Generate code from tables
- Export data

---

## 🎯 GitHub Copilot Usage

### **Enable Copilot**

1. **Settings** → **Plugins** → Install **GitHub Copilot**
2. Restart WebStorm
3. Sign in with GitHub (student account)
4. Start coding! 🤖

### **Copilot Examples**

```typescript
// 1. Generate React Component
// Type comment:
// Create a booking card component with flight details

// Copilot generates:
interface BookingCardProps {
  origin: string;
  destination: string;
  date: string;
  price: number;
}

export function BookingCard({ origin, destination, date, price }: BookingCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">{origin} → {destination}</h3>
          <p className="text-gray-600">{date}</p>
        </div>
        <div className="text-2xl font-bold text-blue-600">
          ${price}
        </div>
      </div>
    </div>
  );
}

// 2. Generate API Route
// Type comment:
// Create Express route to get user bookings with pagination

// Copilot generates:
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const bookings = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
    
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Generate Tests
// Type comment:
// Write tests for payment service

// Copilot generates complete test suite!
```

---

## ⌨️ Essential Shortcuts

| Action | Shortcut |
|--------|----------|
| **Search Everywhere** | Double Shift |
| **Find File** | Ctrl+Shift+N |
| **Find in Files** | Ctrl+Shift+F |
| **Go to Definition** | Ctrl+B |
| **Find Usages** | Alt+F7 |
| **Rename** | Shift+F6 |
| **Format Code** | Ctrl+Alt+L |
| **Optimize Imports** | Ctrl+Alt+O |
| **Run** | Shift+F10 |
| **Debug** | Shift+F9 |
| **Quick Fix** | Alt+Enter |
| **Show Documentation** | Ctrl+Q |
| **Parameter Info** | Ctrl+P |
| **Recent Files** | Ctrl+E |
| **Terminal** | Alt+F12 |
| **Git Commit** | Ctrl+K |
| **Git Push** | Ctrl+Shift+K |

---

## 🎨 Recommended Theme

**Material Theme UI** (Dark):

1. **Settings** → **Plugins** → Install **Material Theme UI**
2. **Settings** → **Appearance** → **Theme**: Material Oceanic
3. **Settings** → **Editor** → **Color Scheme**: Material Oceanic

---

## 🔥 Pro Tips

### **1. Multi-Cursor Editing**

- **Alt+Click**: Add cursor
- **Ctrl+Alt+Shift+J**: Select all occurrences
- **Alt+J**: Select next occurrence

```typescript
// Select "const" → Ctrl+Alt+Shift+J → Type "let"
// Changes all at once!
const name = 'John';
const age = 25;
const city = 'Cairo';
```

### **2. Live Templates**

Type abbreviation + **Tab**:

```typescript
// Type: rfc + Tab
// Generates:
import React from 'react';

export default function ComponentName() {
  return (
    <div>
      
    </div>
  );
}

// Type: uef + Tab
// Generates:
useEffect(() => {
  
}, []);

// Type: clg + Tab
// Generates:
console.log();
```

### **3. Scratch Files**

**Ctrl+Alt+Shift+Insert** → Create scratch file

- Test code without creating files
- Try TypeScript snippets
- Experiment with APIs

### **4. Local History**

**Right-click file** → **Local History** → **Show History**

- See all changes (even uncommitted)
- Revert to any point
- Compare versions

### **5. TODO Comments**

```typescript
// TODO: Add error handling
// FIXME: Memory leak here
// NOTE: Important information
```

View all: **View** → **Tool Windows** → **TODO**

---

## 📊 Performance Optimization

### **Exclude Folders**

**Right-click folder** → **Mark Directory as** → **Excluded**

Exclude:
- `node_modules` (auto-excluded)
- `.next`
- `dist`
- `build`
- `.cache`

### **Increase Memory**

**Help** → **Change Memory Settings**

Set to: **4096 MB** (if you have 8GB+ RAM)

---

## 🐛 Troubleshooting

### **TypeScript Errors Not Showing**

1. **Settings** → **TypeScript** → **Enable TypeScript Language Service**: ✅
2. Restart TypeScript service: **Ctrl+Shift+A** → "Restart TypeScript Service"

### **Prettier Not Working**

1. Check Prettier is installed: `npm list prettier`
2. **Settings** → **Prettier** → Verify path
3. Enable "Run on save"

### **Slow Performance**

1. Exclude unnecessary folders
2. Increase memory allocation
3. Disable unused plugins
4. Clear caches: **File** → **Invalidate Caches**

---

## 📚 Learning Resources

- [WebStorm Documentation](https://www.jetbrains.com/help/webstorm/)
- [WebStorm Tips & Tricks](https://www.jetbrains.com/webstorm/guide/)
- [Keyboard Shortcuts PDF](https://resources.jetbrains.com/storage/products/webstorm/docs/WebStorm_ReferenceCard.pdf)
- [Video Tutorials](https://www.youtube.com/c/Jetbrains)

---

## ✅ Setup Checklist

- [ ] Install WebStorm
- [ ] Activate Student License
- [ ] Open Amrikyy project
- [ ] Install GitHub Copilot
- [ ] Install Tailwind CSS plugin
- [ ] Install Prettier plugin
- [ ] Configure run configurations
- [ ] Set up HTTP client
- [ ] Connect to Supabase database
- [ ] Learn essential shortcuts
- [ ] Customize theme

---

**Last Updated**: October 22, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅

Ready to code like a pro! 🚀
