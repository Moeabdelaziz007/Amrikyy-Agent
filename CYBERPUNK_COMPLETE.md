# 🌃 Cyberpunk Neon Theme - Complete Implementation

**Full cyberpunk design system with neon colors and dark blacks**

---

## 🎨 COMPLETE COLOR SYSTEM

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Neon Colors */
    --neon-pink: #FF006E;
    --neon-cyan: #00F5FF;
    --neon-purple: #B026FF;
    --neon-green: #39FF14;
    --neon-yellow: #FFFF00;
    --neon-orange: #FF6600;
    --neon-blue: #0080FF;
    
    /* Dark Blacks */
    --black-pure: #000000;
    --black-soft: #0A0A0A;
    --black-card: #111111;
    --black-hover: #1A1A1A;
    --black-border: #222222;
  }
  
  * {
    @apply border-black-border;
  }
  
  body {
    @apply bg-black text-white font-mono antialiased;
  }
  
  /* Scrollbar */
  ::-webkit-scrollbar {
    @apply w-2 h-2;
  }
  
  ::-webkit-scrollbar-track {
    @apply bg-black;
  }
  
  ::-webkit-scrollbar-thumb {
    @apply bg-neon-cyan rounded-full;
    box-shadow: 0 0 10px #00F5FF;
  }
}

@layer components {
  /* Neon Text Effects */
  .neon-text-pink {
    @apply text-[#FF006E];
    text-shadow: 0 0 10px #FF006E, 0 0 20px #FF006E, 0 0 30px #FF006E;
  }
  
  .neon-text-cyan {
    @apply text-[#00F5FF];
    text-shadow: 0 0 10px #00F5FF, 0 0 20px #00F5FF, 0 0 30px #00F5FF;
  }
  
  .neon-text-purple {
    @apply text-[#B026FF];
    text-shadow: 0 0 10px #B026FF, 0 0 20px #B026FF, 0 0 30px #B026FF;
  }
  
  .neon-text-green {
    @apply text-[#39FF14];
    text-shadow: 0 0 10px #39FF14, 0 0 20px #39FF14, 0 0 30px #39FF14;
  }
  
  /* Neon Borders */
  .neon-border-pink {
    @apply border-2 border-[#FF006E];
    box-shadow: 0 0 10px rgba(255, 0, 110, 0.5), 0 0 20px rgba(255, 0, 110, 0.3);
  }
  
  .neon-border-cyan {
    @apply border-2 border-[#00F5FF];
    box-shadow: 0 0 10px rgba(0, 245, 255, 0.5), 0 0 20px rgba(0, 245, 255, 0.3);
  }
  
  .neon-border-purple {
    @apply border-2 border-[#B026FF];
    box-shadow: 0 0 10px rgba(176, 38, 255, 0.5), 0 0 20px rgba(176, 38, 255, 0.3);
  }
  
  /* Glass Cyber */
  .glass-cyber {
    @apply bg-black/70 backdrop-blur-xl;
    border: 1px solid rgba(0, 245, 255, 0.3);
    box-shadow: 0 0 20px rgba(0, 245, 255, 0.2);
  }
  
  .glass-cyber-pink {
    @apply bg-black/70 backdrop-blur-xl;
    border: 1px solid rgba(255, 0, 110, 0.3);
    box-shadow: 0 0 20px rgba(255, 0, 110, 0.2);
  }
  
  /* Neon Glow */
  .glow-pink {
    box-shadow: 0 0 20px rgba(255, 0, 110, 0.6), 0 0 40px rgba(255, 0, 110, 0.4);
  }
  
  .glow-cyan {
    box-shadow: 0 0 20px rgba(0, 245, 255, 0.6), 0 0 40px rgba(0, 245, 255, 0.4);
  }
  
  .glow-purple {
    box-shadow: 0 0 20px rgba(176, 38, 255, 0.6), 0 0 40px rgba(176, 38, 255, 0.4);
  }
  
  /* Cyber Grid */
  .cyber-grid {
    background-image: 
      linear-gradient(rgba(0, 245, 255, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 245, 255, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
  }
}

@layer utilities {
  .text-shadow-neon {
    text-shadow: 0 0 10px currentColor;
  }
  
  .animate-neon-pulse {
    animation: neon-pulse 2s ease-in-out infinite;
  }
}

@keyframes neon-pulse {
  0%, 100% {
    opacity: 1;
    filter: brightness(1);
  }
  50% {
    opacity: 0.8;
    filter: brightness(1.2);
  }
}
```

---

## 🎨 TAILWIND CONFIG

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-pink': '#FF006E',
        'neon-cyan': '#00F5FF',
        'neon-purple': '#B026FF',
        'neon-green': '#39FF14',
        'neon-yellow': '#FFFF00',
        'neon-orange': '#FF6600',
        'neon-blue': '#0080FF',
        'black-pure': '#000000',
        'black-soft': '#0A0A0A',
        'black-card': '#111111',
        'black-hover': '#1A1A1A',
        'black-border': '#222222',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        cyber: ['Orbitron', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #FF006E 0%, #00F5FF 100%)',
        'gradient-cyber': 'linear-gradient(135deg, #B026FF 0%, #00F5FF 100%)',
        'gradient-matrix': 'linear-gradient(135deg, #39FF14 0%, #00F5FF 100%)',
      },
      boxShadow: {
        'neon-pink': '0 0 20px rgba(255, 0, 110, 0.6), 0 0 40px rgba(255, 0, 110, 0.4)',
        'neon-cyan': '0 0 20px rgba(0, 245, 255, 0.6), 0 0 40px rgba(0, 245, 255, 0.4)',
        'neon-purple': '0 0 20px rgba(176, 38, 255, 0.6), 0 0 40px rgba(176, 38, 255, 0.4)',
        'neon-green': '0 0 20px rgba(57, 255, 20, 0.6), 0 0 40px rgba(57, 255, 20, 0.4)',
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'glitch': 'glitch 1s infinite',
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.2)' },
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
```

---

## 🧩 COMPONENT LIBRARY

### **1. Desktop Background**
```tsx
// components/CyberDesktop.tsx
'use client';

export function CyberDesktop({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">
      {/* Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      
      {/* Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink rounded-full blur-3xl opacity-20 animate-neon-pulse" />
      <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-neon-cyan rounded-full blur-3xl opacity-20 animate-neon-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple rounded-full blur-3xl opacity-20 animate-neon-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 245, 255, 0.03) 2px, rgba(0, 245, 255, 0.03) 4px)'
        }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
```

### **2. Cyber Window**
```tsx
// components/CyberWindow.tsx
'use client';

import { motion } from 'framer-motion';
import { X, Minus, Square } from 'lucide-react';

interface CyberWindowProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  onClose?: () => void;
  color?: 'pink' | 'cyan' | 'purple' | 'green';
}

export function CyberWindow({ 
  title, 
  icon = '⚡', 
  children, 
  onClose,
  color = 'cyan' 
}: CyberWindowProps) {
  const colorClasses = {
    pink: 'neon-border-pink',
    cyan: 'neon-border-cyan',
    purple: 'neon-border-purple',
    green: 'border-neon-green shadow-neon-green',
  };
  
  const gradientClasses = {
    pink: 'from-neon-pink to-neon-purple',
    cyan: 'from-neon-cyan to-neon-blue',
    purple: 'from-neon-purple to-neon-pink',
    green: 'from-neon-green to-neon-cyan',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className={`glass-cyber rounded-lg overflow-hidden ${colorClasses[color]}`}
    >
      {/* Title Bar */}
      <div className={`h-12 px-4 bg-gradient-to-r ${gradientClasses[color]} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-bold text-black font-cyber tracking-wider">{title}</span>
        </div>
        
        {/* Window Controls */}
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded bg-black/30 hover:bg-black/50 flex items-center justify-center transition-all">
            <Minus className="w-4 h-4 text-black" />
          </button>
          <button className="w-8 h-8 rounded bg-black/30 hover:bg-black/50 flex items-center justify-center transition-all">
            <Square className="w-4 h-4 text-black" />
          </button>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded bg-neon-pink/30 hover:bg-neon-pink flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
}
```

### **3. Cyber Button**
```tsx
// components/CyberButton.tsx
'use client';

interface CyberButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  color?: 'pink' | 'cyan' | 'purple' | 'green';
  className?: string;
}

export function CyberButton({ 
  children, 
  onClick, 
  variant = 'primary',
  color = 'cyan',
  className = '' 
}: CyberButtonProps) {
  const colorMap = {
    pink: 'neon-pink',
    cyan: 'neon-cyan',
    purple: 'neon-purple',
    green: 'neon-green',
  };
  
  const neonColor = colorMap[color];
  
  if (variant === 'primary') {
    return (
      <button
        onClick={onClick}
        className={`
          px-6 py-3 rounded-lg font-bold font-cyber tracking-wider
          bg-black border-2 border-${neonColor}
          text-${neonColor}
          hover:bg-${neonColor} hover:text-black
          transition-all duration-300
          shadow-[0_0_20px_rgba(0,245,255,0.5)]
          hover:shadow-[0_0_30px_rgba(0,245,255,0.8)]
          active:scale-95
          ${className}
        `}
      >
        {children}
      </button>
    );
  }
  
  if (variant === 'secondary') {
    return (
      <button
        onClick={onClick}
        className={`
          px-6 py-3 rounded-lg font-bold font-cyber tracking-wider
          bg-${neonColor}/10 border border-${neonColor}/50
          text-${neonColor}
          hover:bg-${neonColor}/20 hover:border-${neonColor}
          transition-all duration-300
          ${className}
        `}
      >
        {children}
      </button>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-3 rounded-lg font-bold font-cyber tracking-wider
        text-${neonColor}
        hover:bg-${neonColor}/10
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </button>
  );
}
```

### **4. Cyber Card**
```tsx
// components/CyberCard.tsx
'use client';

interface CyberCardProps {
  children: React.ReactNode;
  color?: 'pink' | 'cyan' | 'purple' | 'green';
  className?: string;
}

export function CyberCard({ 
  children, 
  color = 'cyan',
  className = '' 
}: CyberCardProps) {
  const borderColors = {
    pink: 'border-neon-pink/30 hover:border-neon-pink',
    cyan: 'border-neon-cyan/30 hover:border-neon-cyan',
    purple: 'border-neon-purple/30 hover:border-neon-purple',
    green: 'border-neon-green/30 hover:border-neon-green',
  };
  
  const glowColors = {
    pink: 'hover:shadow-[0_0_30px_rgba(255,0,110,0.3)]',
    cyan: 'hover:shadow-[0_0_30px_rgba(0,245,255,0.3)]',
    purple: 'hover:shadow-[0_0_30px_rgba(176,38,255,0.3)]',
    green: 'hover:shadow-[0_0_30px_rgba(57,255,20,0.3)]',
  };

  return (
    <div className={`
      bg-black-card/80 backdrop-blur-sm
      border ${borderColors[color]}
      rounded-lg p-6
      ${glowColors[color]}
      transition-all duration-300
      ${className}
    `}>
      {children}
    </div>
  );
}
```

### **5. Cyber Taskbar**
```tsx
// components/CyberTaskbar.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export function CyberTaskbar() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 glass-cyber border-t neon-border-cyan z-50">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Start Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-lg bg-gradient-neon flex items-center justify-center font-bold text-2xl shadow-neon-cyan"
        >
          ⚡
        </motion.button>
        
        {/* Running Apps */}
        <div className="flex gap-2">
          {['🎬', '📚', '✈️', '💳', '⚙️'].map((icon, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1, y: -5 }}
              className="w-12 h-12 rounded-lg bg-black-card border border-neon-cyan/30 hover:border-neon-cyan flex items-center justify-center text-2xl transition-all"
            >
              {icon}
            </motion.button>
          ))}
        </div>
        
        {/* System Tray */}
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-green shadow-neon-green animate-neon-pulse" />
            <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-neon-cyan animate-neon-pulse" />
            <div className="w-2 h-2 rounded-full bg-neon-pink shadow-neon-pink animate-neon-pulse" />
          </div>
          <span className="text-sm neon-text-cyan font-mono">
            {time.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

## 📱 EXAMPLE PAGE

```tsx
// app/page.tsx
'use client';

import { CyberDesktop } from '@/components/CyberDesktop';
import { CyberWindow } from '@/components/CyberWindow';
import { CyberButton } from '@/components/CyberButton';
import { CyberCard } from '@/components/CyberCard';
import { CyberTaskbar } from '@/components/CyberTaskbar';

export default function Home() {
  return (
    <CyberDesktop>
      <div className="p-8 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-cyber font-bold neon-text-cyan animate-neon-pulse">
            AMRIKYY AI OS
          </h1>
          <p className="text-xl neon-text-pink">
            The Future of AI-Powered Operating Systems
          </p>
        </div>
        
        {/* Windows */}
        <div className="grid grid-cols-2 gap-6">
          <CyberWindow title="YOUTUBE AUTOMATION" icon="🎬" color="pink">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold neon-text-pink">
                Create Videos with AI
              </h2>
              <p className="text-gray-400">
                Generate, produce, and upload videos automatically using cutting-edge AI technology.
              </p>
              <CyberButton color="pink">
                START CREATING
              </CyberButton>
            </div>
          </CyberWindow>
          
          <CyberWindow title="NOTEBOOKLM RESEARCH" icon="📚" color="cyan">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold neon-text-cyan">
                AI-Powered Research
              </h2>
              <p className="text-gray-400">
                Analyze documents, fact-check content, and generate insights with AI.
              </p>
              <CyberButton color="cyan">
                START RESEARCH
              </CyberButton>
            </div>
          </CyberWindow>
        </div>
        
        {/* Cards */}
        <div className="grid grid-cols-3 gap-4">
          <CyberCard color="purple">
            <h3 className="text-lg font-bold neon-text-purple mb-2">Travel Planner</h3>
            <p className="text-sm text-gray-400">Plan your perfect trip with AI</p>
          </CyberCard>
          
          <CyberCard color="green">
            <h3 className="text-lg font-bold neon-text-green mb-2">Payment Manager</h3>
            <p className="text-sm text-gray-400">Manage all your payments</p>
          </CyberCard>
          
          <CyberCard color="pink">
            <h3 className="text-lg font-bold neon-text-pink mb-2">API Client</h3>
            <p className="text-sm text-gray-400">Test and debug APIs</p>
          </CyberCard>
        </div>
      </div>
      
      <CyberTaskbar />
    </CyberDesktop>
  );
}
```

---

## 🎨 FONT SETUP

Add to `app/layout.tsx`:

```tsx
import { JetBrains_Mono, Orbitron } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
});

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-cyber',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${orbitron.variable}`}>
      <body className="font-mono">
        {children}
      </body>
    </html>
  );
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Copy `globals.css` styles
- [ ] Update `tailwind.config.js`
- [ ] Install fonts (JetBrains Mono, Orbitron)
- [ ] Create `CyberDesktop` component
- [ ] Create `CyberWindow` component
- [ ] Create `CyberButton` component
- [ ] Create `CyberCard` component
- [ ] Create `CyberTaskbar` component
- [ ] Apply to all pages
- [ ] Test animations
- [ ] Deploy to Vercel

---

## 🚀 RESULT

**Cyberpunk AI OS with:**
- ✅ Pure black backgrounds
- ✅ Neon pink, cyan, purple, green colors
- ✅ Glowing effects everywhere
- ✅ Cyber grid patterns
- ✅ Scanline effects
- ✅ Smooth animations
- ✅ Glassmorphism
- ✅ Consistent theme across all pages

---

**Ready to deploy?** 🌃⚡
