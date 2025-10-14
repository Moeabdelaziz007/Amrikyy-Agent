# 🎨 Kombai Frontend Finishing Tasks

## 👤 **Your Role:**
**Kombai** - Frontend Code Generator  
**Mission:** Convert designs to pixel-perfect React/TypeScript components  
**Focus:** UI polish, design consistency, responsive layouts

---

## 🎯 **WHAT'S ALREADY BUILT (Don't Rebuild):**

✅ **Components Created:**
- `AgentIDCard.tsx` - Digital ID cards with flip animation
- `HologramWorkflow.tsx` - Real-time AI workflow visualization
- `AgentGallery.tsx` - Agent grid with search/filter
- `LandingPage.tsx` - Homepage with agent showcase

✅ **Backend Ready:**
- Agent Registry API (`/api/agents`)
- WebSocket for real-time updates
- Authentication system
- Payment integration

---

## 🚧 **WHAT'S MISSING (Build These):**

### **Priority 1: Critical Pages (MUST HAVE)**

#### **1. Chat Interface / Trip Planning Page**
**Reference Design:** maya-travel-agent.lovable.app  
**Features Needed:**
- Chat bubbles (user + AI responses)
- Input field with send button
- Typing indicator animation
- Hologram workflow sidebar (show agents working)
- Trip suggestions cards
- Budget display widget
- File upload for inspiration (images)
- Voice input button (future)

**API Connections:**
- `POST /api/ai/chat` - Send messages
- WebSocket `/ws/workflow` - Real-time updates

**Design Specs:**
```
Layout: Split screen
- Left: Chat messages (60%)
- Right: Workflow sidebar (40%)

Colors: 
- Primary: #3B82F6 (blue)
- Secondary: #8B5CF6 (purple)
- Background: Dark gradient
- Chat bubbles: Glassmorphism

Typography:
- Font: Inter
- Chat: 16px
- Headers: 24px bold
```

---

#### **2. Dashboard / Home (After Login)**
**Reference Design:** sorare-basic-44568.lovable.app (card grid)  
**Features Needed:**
- Welcome banner with user name
- Quick stats cards (trips planned, money saved, destinations)
- Recent trips carousel
- Recommended destinations grid
- Active agents status
- Notification center

**API Connections:**
- `GET /api/trips` - User's trips
- `GET /api/agents` - Agent status
- `GET /api/analytics/summary` - Stats

**Design Specs:**
```
Layout: Dashboard grid
- Top: Welcome + stats (3 cards)
- Middle: Recent trips (horizontal scroll)
- Bottom: Destinations grid (4 columns)

Components:
- Stat Card: Glass effect, icon, number, label
- Trip Card: Image, title, dates, status badge
- Destination Card: Large image, overlay text, rating
```

---

#### **3. Trip Details Page**
**Design:** Expandable trip view  
**Features Needed:**
- Trip header (destination, dates, status)
- Itinerary timeline (day-by-day)
- Budget breakdown chart
- Booking links (flights, hotels)
- Map view with pins
- Weather forecast
- Cultural tips section
- Share trip button
- Edit/Delete actions

**API Connections:**
- `GET /api/trips/:id` - Trip data
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

**Design Specs:**
```
Layout: Tabbed interface
- Tab 1: Itinerary (timeline view)
- Tab 2: Budget (donut chart + list)
- Tab 3: Bookings (cards with links)
- Tab 4: Tips (cultural guide)

Colors:
- Success: #10B981 (green)
- Warning: #F59E0B (amber)
- Error: #EF4444 (red)
```

---

#### **4. Agent Network Visualization**
**Design:** Interactive topology graph  
**Features Needed:**
- Node graph (agents as nodes)
- Connection lines (animated)
- Click node → show agent details
- Real-time status updates
- Quantum entanglement visualization
- Energy flow animation
- Legend explaining connections

**API Connections:**
- `GET /api/agents/topology/network` - Topology data
- WebSocket `/ws/workflow` - Live updates

**Design Specs:**
```
Layout: Full screen canvas
- Canvas: D3.js or React-Flow
- Nodes: Hexagonal avatars
- Lines: Animated gradients

Interactions:
- Hover node: Highlight connections
- Click node: Show details panel
- Drag nodes: Rearrange layout
```

---

### **Priority 2: Polish & Enhancement (NICE TO HAVE)**

#### **5. Profile Settings Page**
**Features:**
- User info (name, email, avatar)
- Preferences (language, currency, notifications)
- Travel style quiz
- Budget defaults
- Dietary restrictions
- Prayer time preferences (if Muslim)
- Connected accounts (Google, Apple)
- Danger zone (delete account)

---

#### **6. Destinations Browse Page**
**Reference:** Travel site catalogs  
**Features:**
- Filter sidebar (region, budget, season)
- Destination cards grid
- Sort options (popular, price, rating)
- Search with autocomplete
- Infinite scroll or pagination
- Save favorites

---

#### **7. Notifications Center**
**Features:**
- Notification list (chronological)
- Mark as read/unread
- Filter by type (trips, deals, system)
- Real-time updates (WebSocket)
- Clear all button

---

#### **8. Mobile Responsive Views**
**All pages need:**
- Mobile navigation (bottom bar or hamburger)
- Touch-friendly buttons (min 44px)
- Collapsible sections
- Swipe gestures
- Pull-to-refresh

---

### **Priority 3: Micro-interactions (POLISH)**

#### **9. Loading States**
- Skeleton screens (not just spinners)
- Shimmer effects
- Progress indicators
- Empty states with illustrations
- Error states with retry button

#### **10. Animations**
- Page transitions (fade, slide)
- Button hover effects
- Card hover lift
- Scroll animations (fade-in on scroll)
- Success/error toasts
- Confetti on trip booked

---

## 🎨 **DESIGN SYSTEM REFERENCE:**

### **Colors:**
```css
/* Primary */
--blue-500: #3B82F6;
--purple-500: #8B5CF6;
--pink-500: #EC4899;

/* Agent Colors */
--amrikyy: #3B82F6;
--safar: #10B981;
--thrifty: #F59E0B;
--thaqafa: #8B5CF6;

/* Neutrals */
--slate-900: #0F172A;
--slate-800: #1E293B;
--slate-700: #334155;
--white: #FFFFFF;

/* Semantic */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

### **Typography:**
```css
/* Font Family */
font-family: 'Inter', system-ui, sans-serif;

/* Sizes */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
--text-4xl: 36px;
--text-5xl: 48px;

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### **Spacing:**
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
```

### **Border Radius:**
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;
```

### **Shadows:**
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
--shadow-glow: 0 0 20px rgba(59, 130, 246, 0.4);
```

---

## 📸 **DESIGN REFERENCES TO CONVERT:**

### **Give Kombai These Screenshots:**

1. **Chat Interface:**
   - Reference: maya-travel-agent.lovable.app
   - Screenshot the chat page
   - Note: Hologram sidebar on right

2. **Dashboard:**
   - Reference: Standard dashboard layouts
   - Show stats cards + trip cards

3. **Agent Cards:**
   - Reference: sorare-basic-44568.lovable.app
   - Grid layout with hover effects

4. **Trip Details:**
   - Reference: Airbnb-style detail pages
   - Timeline + budget breakdown

5. **Network Visualization:**
   - Reference: Network graph examples
   - Nodes with connections

---

## 🔌 **API INTEGRATION NOTES:**

### **API Base URL:**
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

### **Key Endpoints:**
```typescript
// Agents
GET /api/agents - List all agents
GET /api/agents/:id - Get agent details
GET /api/agents/topology/network - Get topology

// Trips
GET /api/trips - List user trips
POST /api/trips - Create new trip
GET /api/trips/:id - Get trip details
PUT /api/trips/:id - Update trip
DELETE /api/trips/:id - Delete trip

// Chat
POST /api/ai/chat - Send message
WebSocket ws://localhost:5000/ws/workflow - Real-time updates

// User
GET /api/user/profile - Get user profile
PUT /api/user/profile - Update profile
```

### **WebSocket Usage:**
```typescript
const ws = new WebSocket('ws://localhost:5000/ws/workflow?sessionId=xyz');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle workflow updates
};
```

---

## ✅ **CHECKLIST FOR KOMBAI:**

### **Before Starting:**
- [ ] Review existing components (don't duplicate)
- [ ] Read design system specs
- [ ] Check API documentation
- [ ] Set up local dev environment

### **For Each Component:**
- [ ] Match design system colors exactly
- [ ] Use Tailwind CSS classes
- [ ] Add TypeScript types
- [ ] Include loading states
- [ ] Add error handling
- [ ] Make it responsive (mobile-first)
- [ ] Add hover/active states
- [ ] Include accessibility (ARIA labels)
- [ ] Test with real API data

### **After Building:**
- [ ] Test on Chrome, Safari, Firefox
- [ ] Test on mobile devices
- [ ] Check accessibility (lighthouse)
- [ ] Verify API integrations work
- [ ] Add to Storybook (if using)
- [ ] Update documentation

---

## 🚀 **DELIVERY FORMAT:**

### **For Each Component, Provide:**

1. **Component File:**
   ```typescript
   // frontend/src/components/ComponentName.tsx
   ```

2. **Types File:**
   ```typescript
   // frontend/src/types/ComponentName.types.ts
   ```

3. **API Hook (if needed):**
   ```typescript
   // frontend/src/hooks/useComponentData.ts
   ```

4. **README:**
   ```markdown
   # ComponentName
   
   ## Props
   - prop1: type - description
   
   ## Usage
   ```typescript
   <ComponentName prop1="value" />
   ```
   ```

---

## 💬 **EXAMPLE: CHAT INTERFACE COMPONENT**

```typescript
// frontend/src/pages/ChatPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic } from 'lucide-react';
import HologramWorkflow from '../components/workflow/HologramWorkflow';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
      setSessionId(data.sessionId);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-lg px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 backdrop-blur-md text-white'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Where would you like to go?"
              className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={sendMessage}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl hover:shadow-lg transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Workflow Sidebar */}
      <div className="w-96 border-l border-white/10 p-6 overflow-y-auto">
        <HologramWorkflow sessionId={sessionId} />
      </div>
    </div>
  );
};

export default ChatPage;
```

---

## 🎯 **SUCCESS CRITERIA:**

### **Kombai's work is DONE when:**

✅ All Priority 1 pages are built and working  
✅ Design system is consistently applied  
✅ All components are responsive (mobile + desktop)  
✅ API integrations are functional  
✅ Loading/error states are included  
✅ TypeScript has no errors  
✅ Components match design references  
✅ Animations are smooth (60fps)  
✅ Code is clean and documented  

---

## 📞 **SUPPORT:**

**Questions?** Ask the team:
- **Cursor:** Backend integration help
- **Claude:** Design decisions
- **Lovable:** UI/UX feedback
- **Mohamed:** Product direction

---

**GO BUILD SOMETHING BEAUTIFUL!** 🚀✨

