# 🎨 KOMBAI VISUAL PROMPT - DESIGN TO CODE

## 📸 **GIVE KOMBAI THESE SCREENSHOTS:**

---

## 🎯 **COMPONENT 1: CHAT INTERFACE**

### **Reference:** maya-travel-agent.lovable.app

### **Screenshot Instructions:**
1. Go to: https://maya-travel-agent.lovable.app/
2. Take screenshot of the chat interface
3. Note these elements:
   - Chat messages layout
   - Input field design
   - Avatar styling (hexagonal)
   - Background gradient
   - Glassmorphism effects

### **Visual Specs for Kombai:**
```
LAYOUT:
┌─────────────────────────────────────────────────┐
│  Header (AI Avatar + Name)                      │
├────────────────────┬────────────────────────────┤
│                    │                            │
│  Chat Messages     │  Hologram Workflow         │
│  (60% width)       │  (40% width)               │
│                    │                            │
│  - User bubble     │  - Active agents           │
│  - AI bubble       │  - Progress animations     │
│  - Typing...       │  - Status indicators       │
│                    │                            │
├────────────────────┴────────────────────────────┤
│  Input Field + Send Button                      │
└─────────────────────────────────────────────────┘

COLORS:
- Background: Linear gradient (slate-900 → blue-900 → slate-900)
- User bubbles: Solid blue-500 (#3B82F6)
- AI bubbles: Glass effect (white/10 + blur)
- Input: Glass effect (white/10 + border white/20)

TYPOGRAPHY:
- Chat text: 16px, Inter, regular
- Timestamp: 12px, gray-400
- Input placeholder: 16px, gray-400

EFFECTS:
- All cards: backdrop-blur-md
- Shadows: 0 8px 32px rgba(0,0,0,0.2)
- Borders: 1px solid rgba(255,255,255,0.2)
- Hover: Scale 1.02 + shadow increase
```

---

## 🎯 **COMPONENT 2: DASHBOARD**

### **Reference:** Notion Dashboard + sorare-basic-44568.lovable.app

### **Screenshot Instructions:**
1. Go to: https://sorare-basic-44568.lovable.app/
2. Screenshot the card grid layout
3. Note the hover effects and spacing

### **Visual Specs for Kombai:**
```
LAYOUT:
┌──────────────────────────────────────────────────┐
│  Welcome Banner                                   │
│  "Welcome back, Mohamed! 👋"                     │
├────────────┬────────────┬────────────────────────┤
│ 🌍 Trips   │ 💰 Saved   │ ⭐ Destinations       │
│   12       │   $1,450   │     8                  │
│ +2 this mo │ vs budget  │ wishlist              │
└────────────┴────────────┴────────────────────────┘

Recent Trips (Horizontal Scroll)
┌──────────┐ ┌──────────┐ ┌──────────┐
│ [Image]  │ │ [Image]  │ │ [Image]  │
│ Tokyo    │ │ Paris    │ │ Rome     │
│ Mar 2025 │ │ Apr 2025 │ │ May 2025 │
└──────────┘ └──────────┘ └──────────┘

Recommended Destinations (4-column grid)
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│[Img] │ │[Img] │ │[Img] │ │[Img] │
│Tokyo │ │Paris │ │Dubai │ │Bali  │
│ ⭐4.8│ │ ⭐4.9│ │ ⭐4.7│ │ ⭐4.6│
└──────┘ └──────┘ └──────┘ └──────┘

SPACING:
- Section gaps: 48px (space-12)
- Card gaps: 24px (space-6)
- Card padding: 24px (space-6)

CARDS:
- Glass effect background
- Rounded corners: 16px (radius-lg)
- Hover: Lift up 8px (translateY(-8px))
- Border: 1px solid white/20
```

---

## 🎯 **COMPONENT 3: TRIP DETAILS**

### **Reference:** Airbnb listing page layout

### **Visual Specs for Kombai:**
```
LAYOUT:
┌──────────────────────────────────────────────────┐
│  Hero Image (Large destination photo)            │
│  Overlay: Trip Name + Dates                      │
└──────────────────────────────────────────────────┘

┌──────────────────┬───────────────────────────────┐
│                  │                               │
│  Main Content    │  Sidebar                      │
│                  │                               │
│  Tabs:           │  Quick Stats:                 │
│  • Itinerary     │  • Total Cost: $2,500         │
│  • Budget        │  • Days: 7                    │
│  • Bookings      │  • People: 2                  │
│  • Tips          │                               │
│                  │  Actions:                     │
│  [Tab Content]   │  • Share Trip                 │
│                  │  • Edit Trip                  │
│                  │  • Delete Trip                │
│                  │                               │
└──────────────────┴───────────────────────────────┘

ITINERARY TAB:
Timeline view with:
┌─ Day 1 ────────────────────────┐
│ ○ Morning: Arrival at airport  │
│ ○ Afternoon: Hotel check-in    │
│ ○ Evening: Local dinner        │
└────────────────────────────────┘

BUDGET TAB:
Donut chart + breakdown list:
┌────────────────┐
│   [Donut]      │  Flights:  $800
│   $2,500       │  Hotels:   $900
│   Total        │  Food:     $500
└────────────────┘  Activities: $300

COLORS:
- Completed items: Green checkmark
- Pending items: Gray circle
- Warning items: Amber icon
```

---

## 🎯 **COMPONENT 4: AGENT NETWORK VISUALIZATION**

### **Reference:** D3.js force-directed graph examples

### **Visual Specs for Kombai:**
```
LAYOUT:
Full-screen canvas with floating nodes

NODE STRUCTURE (Agent):
       ⬡ Hexagon shape
      / \
     /   \  Avatar inside
    |  A  | (Amrikyy = A)
     \   /
      \ /
       ⬡
    Status dot (green/amber/red)

CONNECTION LINES:
- Solid line: Direct coordination
- Dashed line: Occasional communication
- Animated gradient: Active data flow
- Thickness: Communication frequency

INTERACTIONS:
1. Hover node:
   - Highlight connected nodes
   - Dim other nodes (opacity 0.3)
   - Show tooltip with agent name + status

2. Click node:
   - Open details panel (right side)
   - Show: Skills, current task, stats

3. Drag node:
   - Allow repositioning
   - Update connections in real-time

COLORS:
- Amrikyy node: Blue (#3B82F6)
- Safar node: Green (#10B981)
- Thrifty node: Amber (#F59E0B)
- Thaqafa node: Purple (#8B5CF6)
- Connection lines: Gradient from source to target
- Active connections: Animated glow
```

---

## 🎯 **COMPONENT 5: AGENT ID CARD (Already Built - Reference)**

### **Current Implementation:** `frontend/src/components/identity/AgentIDCard.tsx`

### **Visual Reference:**
```
FRONT SIDE:
┌─────────────────────────┐
│     ⬡ Hexagon Avatar    │
│                         │
│      Amrikyy            │
│   AI Travel Companion   │
│                         │
│  Status: ● Active       │
│  Age: Newborn AI        │
│  Born: Jan 1, 2025      │
│                         │
│  [Flip to see more]     │
└─────────────────────────┘

BACK SIDE:
┌─────────────────────────┐
│  Digital Identity       │
│                         │
│  Skills:                │
│  ▓▓▓▓▓▓▓▓░ 95% Planning │
│  ▓▓▓▓▓▓▓░░ 90% Budget   │
│                         │
│  Personality:           │
│  • Friendly: 95%        │
│  • Helpful: 98%         │
│                         │
│  Mission:               │
│  "Help travelers..."    │
│                         │
│  [Flip back]            │
└─────────────────────────┘

ANIMATION:
- 3D flip on click (rotateY 180deg)
- Smooth transition (0.6s ease)
- Hover: Slight lift + glow
```

---

## 🎯 **COMPONENT 6: HOLOGRAM WORKFLOW (Already Built - Reference)**

### **Current Implementation:** `frontend/src/components/workflow/HologramWorkflow.tsx`

### **Visual Reference:**
```
┌────────────────────────────────┐
│  🔌 Workflow Active            │
│  AI Agents Working             │
├────────────────────────────────┤
│                                │
│  ⬡ Amrikyy                     │
│  Analyzing request...          │
│  [▓▓▓▓▓▓▓▓▓░] 90%             │
│                                │
│  ↓ Connection line             │
│                                │
│  ⬡ Safar                       │
│  Researching destinations...   │
│  [▓▓▓▓▓░░░░░] 50%             │
│                                │
│  ↓ Connection line             │
│                                │
│  ⬡ Thrifty (Pending...)        │
│  ○ Waiting...                  │
│                                │
└────────────────────────────────┘

ANIMATIONS:
- Progress bars: Smooth fill animation
- Connection lines: Flowing gradient
- Active agent: Pulsing glow effect
- Particles: Floating from agent to agent
- Grid background: Slow vertical scroll
```

---

## 📐 **DESIGN TOKENS (Use These Exact Values):**

```css
/* Paste this into your CSS/Tailwind config */

:root {
  /* Colors - Primary */
  --primary-blue: #3B82F6;
  --primary-purple: #8B5CF6;
  --primary-pink: #EC4899;
  
  /* Colors - Agent */
  --agent-amrikyy: #3B82F6;
  --agent-safar: #10B981;
  --agent-thrifty: #F59E0B;
  --agent-thaqafa: #8B5CF6;
  
  /* Colors - Background */
  --bg-primary: #0F172A; /* slate-900 */
  --bg-secondary: #1E293B; /* slate-800 */
  --bg-tertiary: #334155; /* slate-700 */
  
  /* Colors - Semantic */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  
  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 30px;
  --font-size-4xl: 36px;
  --font-size-5xl: 48px;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
  --shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
  
  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-blur: 16px;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 300ms ease;
  --transition-slow: 600ms ease;
}
```

---

## 🎨 **GLASSMORPHISM RECIPE (Copy-Paste):**

```css
/* Standard Glass Card */
.glass-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* Glass Card Hover */
.glass-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

/* Gradient Background */
.gradient-bg {
  background: linear-gradient(
    135deg,
    #0F172A 0%,
    #1E3A8A 50%,
    #0F172A 100%
  );
}

/* Agent Color Glow */
.agent-glow-blue {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}

.agent-glow-green {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
}

.agent-glow-amber {
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
}

.agent-glow-purple {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
}
```

---

## 📱 **RESPONSIVE BREAKPOINTS:**

```css
/* Mobile First Approach */

/* Small devices (phones, 640px and up) */
@media (min-width: 640px) {
  /* sm: */
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  /* md: */
}

/* Large devices (desktops, 1024px and up) */
@media (min-width: 1024px) {
  /* lg: */
}

/* Extra large devices (large desktops, 1280px and up) */
@media (min-width: 1280px) {
  /* xl: */
}

/* 2XL devices (1536px and up) */
@media (min-width: 1536px) {
  /* 2xl: */
}
```

### **Mobile Adjustments:**
```
Mobile (< 768px):
- Chat sidebar: Hidden (toggle button)
- Card grid: 1 column
- Font sizes: -2px smaller
- Spacing: Reduce by 25%
- Touch targets: Min 44px

Tablet (768px - 1024px):
- Chat sidebar: 30% width
- Card grid: 2 columns
- Font sizes: Base

Desktop (> 1024px):
- Chat sidebar: 40% width
- Card grid: 4 columns
- Font sizes: Base
- Full features visible
```

---

## ✅ **PIXEL-PERFECT CHECKLIST:**

When converting designs, ensure:

- [ ] **Colors match exactly** (use color picker on reference)
- [ ] **Spacing is consistent** (use 4px/8px increments)
- [ ] **Typography matches** (font, size, weight, line-height)
- [ ] **Borders are precise** (width, color, radius)
- [ ] **Shadows are correct** (x, y, blur, spread, color)
- [ ] **Hover states work** (scale, shadow, color changes)
- [ ] **Animations are smooth** (60fps, no jank)
- [ ] **Icons align properly** (centered, correct size)
- [ ] **Responsive at all breakpoints** (test on real devices)
- [ ] **Loading states exist** (skeletons, spinners)
- [ ] **Error states exist** (messages, retry buttons)
- [ ] **Empty states exist** (illustrations, helpful text)

---

## 🖼️ **ACTUAL SCREENSHOTS TO PROVIDE:**

### **Take These Screenshots:**

1. **Chat Interface:**
   - URL: https://maya-travel-agent.lovable.app/
   - Capture: Full page with chat + sidebar
   - Focus on: Message bubbles, input field, avatar

2. **Card Grid:**
   - URL: https://sorare-basic-44568.lovable.app/
   - Capture: Card grid section
   - Focus on: Spacing, hover effects, shadows

3. **Dashboard Example:**
   - URL: https://notion.so (any dashboard)
   - Capture: Stats cards + content grid
   - Focus on: Layout, card design

4. **Network Graph:**
   - URL: Search "D3.js network graph examples"
   - Capture: Interactive node graph
   - Focus on: Node design, connections, layout

---

## 🎯 **KOMBAI INPUT FORMAT:**

```
For each component, give Kombai:

1. Screenshot (PNG/JPG)
2. Component name: "ChatInterface"
3. Framework: "React + TypeScript + Tailwind"
4. Additional notes: "Use glassmorphism, dark theme"
5. API endpoints to integrate (if any)

Kombai will output:
→ React component code
→ TypeScript types
→ Tailwind classes
→ Responsive styles
```

---

## 🚀 **FINAL DELIVERY:**

After Kombai converts all designs, you should have:

✅ **Priority 1 Pages:**
- ChatPage.tsx
- Dashboard.tsx
- TripDetails.tsx
- AgentNetwork.tsx

✅ **Priority 2 Pages:**
- ProfileSettings.tsx
- DestinationsBrowse.tsx
- NotificationsCenter.tsx

✅ **Supporting Components:**
- LoadingStates.tsx
- ErrorStates.tsx
- EmptyStates.tsx
- Animations utilities

---

**NOW GIVE THESE SCREENSHOTS TO KOMBAI AND WATCH THE MAGIC!** ✨🎨

