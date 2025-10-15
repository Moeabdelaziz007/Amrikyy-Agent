# DESIGN SYSTEM - Amrikyy Platform Visual Standards

**Version:** 1.0  
**Last Updated:** October 14, 2025  
**Purpose:** Consistent visual identity across all platforms (Web, iOS, Telegram)

---

## 🎨 Design Philosophy

**"Modern Arabic aesthetics meets futuristic AI technology"**

**Core Principles:**
1. **Glassmorphism** - Transparent layers with blur (modern, premium feel)
2. **Blue-Purple Gradient** - Technology with creativity and wisdom
3. **Golden Accents** - Premium quality, Arab cultural heritage
4. **Smooth Animations** - Everything moves with purpose (60fps)
5. **Bilingual Design** - Works beautifully in Arabic RTL and English LTR
6. **Accessible** - WCAG 2.1 AA compliant, everyone can use it

---

## 🌐 Design References

### Primary Inspiration

**1. maya-travel-agent.lovable.app**
- Avatar design and animations
- Chat interface aesthetics
- Warm, approachable feel
- Clean component layouts

**Adapted for Amrikyy:**
- Hexagonal frames instead of circles (Islamic geometry)
- Blue-purple gradient instead of single color
- Golden borders for premium feel
- Breathing animations for agents

**2. sorare-basic-44568.lovable.app**
- Card grid layout for services/kits
- Hover effects and micro-interactions
- Clean, modern card design
- Responsive grid system

**Adapted for Amrikyy:**
- Agent cards in same grid style
- Kit marketplace uses same layout
- Glassmorphism added to cards
- Arabic pattern details on borders

---

## 🎨 Color Palette

### Primary Brand Colors

```css
:root {
  /* === BRAND CORE === */
  --amrikyy-blue: #3B82F6;        /* Technology, trust, sky */
  --amrikyy-purple: #8B5CF6;      /* Wisdom, creativity, magic */
  --amrikyy-gold: #F59E0B;        /* Premium, Arab culture */
  
  /* === GRADIENTS === */
  --gradient-primary: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  --gradient-accent: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
  --gradient-hologram: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.3) 0%,
    rgba(139, 92, 246, 0.3) 100%
  );
  
  /* === AGENT-SPECIFIC COLORS === */
  --agent-amrikyy: #3B82F6;       /* Main avatar - Blue */
  --agent-safar: #10B981;         /* Travel specialist - Emerald */
  --agent-thrifty: #F59E0B;       /* Budget optimizer - Amber */
  --agent-thaqafa: #8B5CF6;       /* Cultural guide - Purple */
  
  /* === UI COLORS === */
  --background-dark: #0F172A;     /* Deep slate */
  --background-light: #F8FAFC;    /* Off-white */
  --surface-dark: #1E293B;        /* Slate 800 */
  --surface-light: #FFFFFF;       /* Pure white */
  
  /* === GLASS MORPHISM === */
  --glass-light: rgba(255, 255, 255, 0.1);
  --glass-medium: rgba(255, 255, 255, 0.2);
  --glass-heavy: rgba(255, 255, 255, 0.3);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-blur: 16px;
  
  /* === SEMANTIC COLORS === */
  --success: #10B981;             /* Green */
  --warning: #F59E0B;             /* Amber */
  --error: #EF4444;               /* Red */
  --info: #3B82F6;                /* Blue */
  
  /* === TEXT COLORS === */
  --text-primary-dark: rgba(255, 255, 255, 0.95);
  --text-secondary-dark: rgba(255, 255, 255, 0.70);
  --text-tertiary-dark: rgba(255, 255, 255, 0.50);
  
  --text-primary-light: rgba(15, 23, 42, 0.95);
  --text-secondary-light: rgba(15, 23, 42, 0.70);
  --text-tertiary-light: rgba(15, 23, 42, 0.50);
}
```

### Color Usage Guidelines

**Primary Blue (#3B82F6):**
- Use for: Main CTAs, links, primary actions
- Represents: Technology, trust, professionalism
- Accessibility: Ensure 4.5:1 contrast on dark backgrounds

**Secondary Purple (#8B5CF6):**
- Use for: Secondary actions, highlights, quantum features
- Represents: Creativity, wisdom, AI intelligence
- Pair with: Blue in gradients

**Accent Gold (#F59E0B):**
- Use for: Premium features, highlights, success states
- Represents: Quality, Arab culture, value
- Sparingly: Don't overuse, keep it special

**Agent Colors:**
- Each mini-agent has unique color for instant recognition
- Use in ID cards, avatars, status indicators

---

## ✍️ Typography

### Font Families

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  /* Font Stacks */
  --font-english: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-arabic: 'Tajawal', 'Arial Arabic', 'Geeza Pro', sans-serif;
  --font-code: 'JetBrains Mono', 'Courier New', monospace;
  
  /* Font Sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  --text-6xl: 3.75rem;     /* 60px */
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* Font Weights */
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  --weight-extrabold: 800;
}
```

### Type Scale

| Use Case | Size | Weight | Line Height |
|----------|------|--------|-------------|
| **Hero Heading** | 48px (3rem) | 800 (extrabold) | 1.1 |
| **Page Title** | 36px (2.25rem) | 700 (bold) | 1.2 |
| **Section Heading** | 24px (1.5rem) | 600 (semibold) | 1.3 |
| **Card Title** | 20px (1.25rem) | 600 (semibold) | 1.4 |
| **Body Text** | 16px (1rem) | 400 (normal) | 1.5 |
| **Small Text** | 14px (0.875rem) | 500 (medium) | 1.5 |
| **Tiny Text** | 12px (0.75rem) | 500 (medium) | 1.4 |

### Arabic Typography

**Special Considerations:**
```css
[dir="rtl"], .arabic {
  font-family: var(--font-arabic);
  line-height: 1.75; /* Taller for Arabic script */
  letter-spacing: 0; /* No letter spacing for Arabic */
}

/* Arabic headings need more breathing room */
[dir="rtl"] h1, [dir="rtl"] h2, [dir="rtl"] h3 {
  line-height: 1.5;
  font-weight: 700; /* Tajawal looks better bolder */
}
```

---

## 🎴 Component Library

### 1. Agent Card (Primary Component)

**Design:** Inspired by Sorare card grid

```css
/* packages/web/src/components/ui/AgentCard.module.css */

.agent-card {
  /* Structure */
  position: relative;
  width: 100%;
  max-width: 360px;
  padding: 2rem;
  border-radius: 20px;
  
  /* Glassmorphism */
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  
  /* Border */
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  /* Shadow */
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  /* Transitions */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.agent-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 60px rgba(59, 130, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-color: var(--amrikyy-blue);
}

/* Agent Avatar Section */
.agent-avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
  position: relative;
}

.agent-avatar-frame {
  width: 100%;
  height: 100%;
  clip-path: polygon(
    50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%
  ); /* Hexagon */
  background: var(--gradient-primary);
  padding: 3px;
}

.agent-avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  clip-path: polygon(
    50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%
  );
  animation: breathe 4s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { 
    transform: scale(1);
    filter: brightness(1);
  }
  50% { 
    transform: scale(1.05);
    filter: brightness(1.1);
  }
}

/* Status Indicator */
.status-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--background-dark);
  animation: pulse 2s ease-in-out infinite;
}

.status-active { background: #10B981; } /* Green */
.status-busy { background: #F59E0B; }   /* Amber */
.status-idle { background: #6B7280; }   /* Gray */
.status-error { background: #EF4444; }  /* Red */

@keyframes pulse {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.7;
    transform: scale(1.15);
  }
}
```

**React Component Structure:**

```typescript
// packages/web/src/components/ui/AgentCard.tsx

interface AgentCardProps {
  agent: {
    name: string;
    role: string;
    avatar: string;
    color: string;
    status: 'active' | 'busy' | 'idle' | 'error';
    skills: Array<{ name: string; level: number }>;
  };
  onClick?: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick }) => {
  return (
    <div className="agent-card" onClick={onClick}>
      {/* Avatar with hexagonal frame */}
      <div className="agent-avatar">
        <div 
          className="agent-avatar-frame"
          style={{ background: `linear-gradient(135deg, ${agent.color}, ${agent.color}dd)` }}
        >
          <img src={agent.avatar} alt={agent.name} />
        </div>
        <div className={`status-indicator status-${agent.status}`} />
      </div>
      
      {/* Agent Info */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-1">{agent.name}</h3>
        <p className="text-sm text-white/70">{agent.role}</p>
      </div>
      
      {/* Skills */}
      <div className="space-y-2">
        {agent.skills.map(skill => (
          <div key={skill.name} className="skill-bar">
            <div className="flex justify-between text-xs mb-1">
              <span>{skill.name}</span>
              <span>{skill.level}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* View Details Button */}
      <button className="view-details-btn mt-4 w-full">
        View Profile
      </button>
    </div>
  );
};
```

---

### 2. Digital ID Card Component

**Flippable card with front and back:**

```css
/* packages/web/src/components/identity/AgentIDCard.module.css */

.id-card {
  width: 400px;
  height: 250px;
  perspective: 1000px;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.id-card:hover .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
  padding: 2rem;
  background: var(--gradient-primary);
  box-shadow: 0 20px 60px rgba(59, 130, 246, 0.5);
}

.card-back {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
}

/* Front Side Layout */
.card-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.card-avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.5);
}

.card-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.card-role {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Info Rows */
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-label {
  font-size: 0.875rem;
  opacity: 0.7;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 600;
}

/* Back Side Layout */
.card-mission {
  margin-bottom: 1.5rem;
}

.mission-title {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.mission-text {
  font-size: 1rem;
  font-style: italic;
  line-height: 1.5;
}

.signature {
  position: absolute;
  bottom: 1.5rem;
  left: 2rem;
  right: 2rem;
  font-size: 0.75rem;
  opacity: 0.7;
  text-align: center;
}
```

---

### 3. Hologram Workflow Component

**The signature Amrikyy feature:**

```css
/* packages/web/src/components/workflow/HologramWorkflow.module.css */

.hologram-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 420px;
  max-height: 600px;
  z-index: 1000;
  
  /* Glassmorphism */
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.15),
    rgba(139, 92, 246, 0.15)
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  
  /* Border with gradient */
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative;
  border-radius: 24px;
  padding: 2rem;
  
  /* Glow effect */
  box-shadow: 
    0 0 60px rgba(59, 130, 246, 0.4),
    inset 0 0 20px rgba(59, 130, 246, 0.1);
}

.hologram-container::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 24px;
  padding: 2px;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: -1;
}

/* Particle Background */
.hologram-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 24px;
  z-index: -1;
  opacity: 0.5;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(59, 130, 246, 0.8);
  border-radius: 50%;
  animation: float 3s infinite ease-in-out;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  50% {
    transform: translateY(-40px) translateX(15px);
    opacity: 1;
  }
}

/* Workflow Steps */
.workflow-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.workflow-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.workflow-step.active {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.workflow-step.complete {
  opacity: 0.6;
}

/* Agent Avatar in Workflow */
.workflow-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
}

.glow-pulse {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(59, 130, 246, 0.6) 0%,
    transparent 70%
  );
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.4);
    opacity: 1;
  }
}

/* Progress Bar */
.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
}
```

---

### 4. Button Component

```css
.btn {
  /* Base styles */
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

/* Primary Button */
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Glass Button (Secondary) */
.btn-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-glass:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}
```

---

## 📐 Layout System

### Grid for Agent Gallery

```css
.agent-gallery {
  padding: 4rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

/* Responsive breakpoints */
@media (max-width: 1024px) {
  .agent-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .agent-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  
  .agent-gallery {
    padding: 2rem 1rem;
  }
}
```

### Dashboard Layout

```css
.dashboard {
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
  gap: 0;
}

.sidebar {
  grid-row: 1 / -1;
  background: var(--surface-dark);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem 1rem;
}

.header {
  grid-column: 2;
  background: var(--surface-dark);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 2rem;
}

.main-content {
  grid-column: 2;
  padding: 2rem;
  overflow-y: auto;
}

/* Mobile: Stack vertically */
@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    grid-row: auto;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}
```

---

## ✨ Animations Library

### Breathing Effect (Avatars)

```css
@keyframes breathe {
  0%, 100% { 
    transform: scale(1);
    filter: brightness(1) saturate(1);
  }
  50% { 
    transform: scale(1.05);
    filter: brightness(1.1) saturate(1.1);
  }
}

.avatar-breathe {
  animation: breathe 4s ease-in-out infinite;
}
```

### Card Flip

```css
@keyframes flip-in {
  from {
    transform: rotateY(-180deg);
    opacity: 0;
  }
  to {
    transform: rotateY(0);
    opacity: 1;
  }
}

.card-flip-enter {
  animation: flip-in 0.6s ease-out;
}
```

### Slide Up (Page transitions)

```css
@keyframes slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.page-enter {
  animation: slide-up 0.4s ease-out;
}
```

### Glow Pulse (Active indicators)

```css
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
  }
}

.active-glow {
  animation: glow-pulse 2s ease-in-out infinite;
}
```

### Particle Float (Hologram background)

```css
@keyframes particle-float {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(1);
    opacity: 0;
  }
}
```

---

## 📱 Responsive Design

### Breakpoints

```css
:root {
  --breakpoint-sm: 640px;   /* Mobile landscape */
  --breakpoint-md: 768px;   /* Tablet */
  --breakpoint-lg: 1024px;  /* Desktop */
  --breakpoint-xl: 1280px;  /* Large desktop */
  --breakpoint-2xl: 1536px; /* Extra large */
}
```

### Mobile-First Approach

```css
/* Base styles: Mobile */
.component {
  font-size: 1rem;
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    font-size: 1.125rem;
    padding: 1.5rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    font-size: 1.25rem;
    padding: 2rem;
  }
}
```

---

## ♿ Accessibility Standards

### Color Contrast

**WCAG 2.1 AA Requirements:**
- Normal text: Minimum 4.5:1 contrast ratio
- Large text (18px+): Minimum 3:1 contrast ratio
- Interactive elements: Minimum 3:1 against background

**Testing:**
```css
/* White text on dark blue background */
color: #FFFFFF;  /* RGB: 255, 255, 255 */
background: #1E3A8A;  /* RGB: 30, 58, 138 */
/* Contrast ratio: 10.35:1 ✅ Passes AAA */
```

### Focus States

```css
*:focus-visible {
  outline: 3px solid var(--amrikyy-blue);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Custom focus for buttons */
.btn:focus-visible {
  outline: 3px solid var(--amrikyy-gold);
  outline-offset: 4px;
}
```

### Screen Reader Support

**Labels for all interactive elements:**
```tsx
<button aria-label="View Amrikyy agent profile">
  <UserIcon />
</button>

<img 
  src="/avatars/amrikyy.svg" 
  alt="Amrikyy avatar - friendly AI travel assistant with blue-purple gradient"
/>
```

### Keyboard Navigation

```css
/* Tab order should be logical */
.interactive-element {
  tab-index: 0; /* Keyboard accessible */
}

/* Skip to main content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--amrikyy-blue);
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

---

## 🎭 Dark Mode (Primary) & Light Mode (Optional)

### Dark Theme (Default)

```css
[data-theme="dark"] {
  --bg-primary: #0F172A;
  --bg-secondary: #1E293B;
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.70);
}
```

### Light Theme

```css
[data-theme="light"] {
  --bg-primary: #F8FAFC;
  --bg-secondary: #FFFFFF;
  --text-primary: rgba(15, 23, 42, 0.95);
  --text-secondary: rgba(15, 23, 42, 0.70);
  
  /* Adjust glassmorphism for light mode */
  --glass-light: rgba(0, 0, 0, 0.05);
  --glass-medium: rgba(0, 0, 0, 0.1);
  --glass-border: rgba(0, 0, 0, 0.15);
}
```

---

## 🖼️ Icon System

**Library:** Lucide React (consistent, tree-shakeable)

**Common Icons:**
```typescript
import {
  Plane,      // Travel
  Map,        // Destinations  
  DollarSign, // Budget
  Bot,        // AI Agent
  Settings,   // Configuration
  User,       // Profile
  Search,     // Search
  Heart,      // Favorites
  Calendar,   // Dates
  Globe       // International
} from 'lucide-react';
```

**Custom Icons** (for agents):
- Create SVG icons for each agent role
- Store in `assets/brand/icons/`
- Use consistent stroke-width: 2px

---

## 🌍 RTL (Right-to-Left) Support

### Arabic Language Support

```css
/* Auto RTL for Arabic */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

/* Flip layout for RTL */
[dir="rtl"] .sidebar {
  border-right: none;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

[dir="rtl"] .hologram-container {
  right: auto;
  left: 2rem;
}

/* Icons that should flip */
[dir="rtl"] .icon-directional {
  transform: scaleX(-1);
}

/* Icons that should NOT flip (numbers, symbols) */
[dir="rtl"] .icon-neutral {
  transform: none;
}
```

---

## 📦 Component Sizes

### Standard Component Dimensions

```css
:root {
  /* Spacing scale */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  
  /* Component heights */
  --height-input: 2.5rem;     /* 40px */
  --height-button: 2.75rem;   /* 44px */
  --height-header: 4rem;      /* 64px */
  
  /* Border radius */
  --radius-sm: 0.5rem;    /* 8px */
  --radius-md: 0.75rem;   /* 12px */
  --radius-lg: 1rem;      /* 16px */
  --radius-xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;  /* Fully rounded */
}
```

---

## 🎨 Tailwind Configuration

```typescript
// tailwind.config.ts

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'amrikyy-blue': '#3B82F6',
        'amrikyy-purple': '#8B5CF6',
        'amrikyy-gold': '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        arabic: ['Tajawal', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0' },
          '50%': { transform: 'translateY(-40px)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
```

---

## 🎬 Framer Motion Presets

```typescript
// packages/web/src/lib/animations.ts

export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.4 }
  },
  
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { duration: 0.3 }
  },
  
  quantum: {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [0.8, 1.05, 1],
      opacity: [0, 1, 1],
    },
    transition: { duration: 0.6 }
  },
  
  hologramAppear: {
    initial: { y: 100, opacity: 0, scale: 0.9 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -50, opacity: 0, scale: 0.95 },
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  }
};
```

---

## 📱 iOS Design Standards

### SwiftUI Components

```swift
// packages/ios/Amrikyy/Shared/DesignSystem.swift

struct AmrikyyColors {
    static let blue = Color(hex: "#3B82F6")
    static let purple = Color(hex: "#8B5CF6")
    static let gold = Color(hex: "#F59E0B")
    
    static let gradientPrimary = LinearGradient(
        colors: [blue, purple],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

struct AmrikyyFonts {
    static let title = Font.system(size: 28, weight: .bold)
    static let heading = Font.system(size: 20, weight: .semibold)
    static let body = Font.system(size: 16, weight: .regular)
    static let caption = Font.system(size: 14, weight: .medium)
}

struct GlassmorphismModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(.ultraThinMaterial)
            .background(
                LinearGradient(
                    colors: [
                        AmrikyyColors.blue.opacity(0.1),
                        AmrikyyColors.purple.opacity(0.1)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .cornerRadius(20)
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
            )
            .shadow(color: AmrikyyColors.blue.opacity(0.3), radius: 20)
    }
}
```

---

## ✅ Design System Checklist

**For every new component:**

- [ ] Uses design tokens (colors, spacing, typography from system)
- [ ] Has dark mode support (or uses theme-aware variables)
- [ ] Responsive on mobile, tablet, desktop
- [ ] Includes hover/active/focus states
- [ ] Accessible (keyboard nav, ARIA labels, contrast)
- [ ] Follows naming conventions
- [ ] Documented in Storybook (future) or comments
- [ ] Tested on Safari, Chrome, Firefox
- [ ] Tested on iOS Safari (for web components)
- [ ] Smooth animations (60fps, no jank)

---

## 🎨 Brand Assets

### Logo Files

```
assets/brand/
├── logo-full.svg              # Amrikyy with text
├── logo-icon.svg              # Just the emblem
├── logo-arabic.svg            # Arabic version
├── logo-horizontal.svg        # Wide format
└── logo-vertical.svg          # Tall format
```

### Islamic Geometric Patterns

```
assets/brand/patterns/
├── hexagon-grid.svg           # For backgrounds
├── star-pattern.svg           # For borders
└── arabesque-detail.svg       # For accents
```

---

## 📐 Component Spacing

### Standard Padding/Margin

```css
.component-sm { padding: 0.75rem; }    /* 12px */
.component-md { padding: 1rem; }       /* 16px */
.component-lg { padding: 1.5rem; }     /* 24px */
.component-xl { padding: 2rem; }       /* 32px */
```

### Grid Gaps

```css
.grid-tight { gap: 0.5rem; }   /* 8px */
.grid-normal { gap: 1rem; }    /* 16px */
.grid-relaxed { gap: 2rem; }   /* 32px */
```

---

## 🎯 Implementation Priority

### Phase 1: Core Components (Week 1)
1. Color palette (CSS variables)
2. Typography system
3. Button component
4. Card component
5. Input component

### Phase 2: Agent Components (Week 2)
1. AgentCard
2. AgentIDCard (flippable)
3. AgentGallery grid
4. Agent avatar frames

### Phase 3: Advanced (Week 3)
1. HologramWorkflow
2. TopologyVisualization
3. Particle effects
4. Advanced animations

---

**This design system ensures Amrikyy looks professional and feels magical across all platforms.** ✨

**Last Updated:** October 14, 2025  
**Status:** 🟢 Active Design Standard

