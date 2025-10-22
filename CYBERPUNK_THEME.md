# 🌃 Amrikyy AI OS - Cyberpunk Neon Theme

**Cyberpunk-inspired design with neon colors and dark blacks**  
**Date**: October 22, 2025

---

## 🎨 COLOR PALETTE

### **Neon Colors**
```css
--neon-pink: #FF006E;
--neon-cyan: #00F5FF;
--neon-purple: #B026FF;
--neon-green: #39FF14;
--neon-yellow: #FFFF00;
--neon-orange: #FF6600;
--neon-blue: #0080FF;
```

### **Dark Blacks**
```css
--black-pure: #000000;
--black-soft: #0A0A0A;
--black-card: #111111;
--black-hover: #1A1A1A;
```

### **Gradients**
```css
--gradient-neon: linear-gradient(135deg, #FF006E 0%, #00F5FF 100%);
--gradient-cyber: linear-gradient(135deg, #B026FF 0%, #00F5FF 100%);
--gradient-matrix: linear-gradient(135deg, #39FF14 0%, #00F5FF 100%);
```

---

## 🎭 EFFECTS

### **Neon Glow**
```css
.neon-glow-pink {
  box-shadow: 0 0 10px #FF006E, 0 0 20px #FF006E, 0 0 30px #FF006E;
}

.neon-glow-cyan {
  box-shadow: 0 0 10px #00F5FF, 0 0 20px #00F5FF, 0 0 30px #00F5FF;
}

.neon-text-pink {
  color: #FF006E;
  text-shadow: 0 0 10px #FF006E, 0 0 20px #FF006E;
}
```

### **Glassmorphism Cyber**
```css
.glass-cyber {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 0, 110, 0.3);
  box-shadow: 0 0 20px rgba(255, 0, 110, 0.2);
}
```

---

## 🧩 COMPONENTS

### **Desktop Background**
```tsx
<div className="h-screen w-screen bg-black relative overflow-hidden">
  {/* Grid Pattern */}
  <div className="absolute inset-0 opacity-20"
       style={{
         backgroundImage: `
           linear-gradient(#00F5FF 1px, transparent 1px),
           linear-gradient(90deg, #00F5FF 1px, transparent 1px)
         `,
         backgroundSize: '50px 50px'
       }}
  />
  
  {/* Neon Orbs */}
  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink rounded-full blur-3xl opacity-30 animate-pulse" />
  <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan rounded-full blur-3xl opacity-30 animate-pulse" />
</div>
```

### **Window**
```tsx
<div className="bg-black/90 backdrop-blur-xl border border-neon-cyan/30 rounded-lg shadow-[0_0_30px_rgba(0,245,255,0.3)]">
  {/* Title Bar */}
  <div className="h-12 px-4 bg-gradient-to-r from-neon-pink to-neon-cyan flex items-center justify-between">
    <span className="font-bold text-black">App Name</span>
    <div className="flex gap-2">
      <div className="w-3 h-3 rounded-full bg-neon-green shadow-[0_0_10px_#39FF14]" />
      <div className="w-3 h-3 rounded-full bg-neon-yellow shadow-[0_0_10px_#FFFF00]" />
      <div className="w-3 h-3 rounded-full bg-neon-pink shadow-[0_0_10px_#FF006E]" />
    </div>
  </div>
  <div className="p-6">{children}</div>
</div>
```

### **Button**
```tsx
<button className="
  px-6 py-3 rounded-lg
  bg-black border-2 border-neon-cyan
  text-neon-cyan font-bold
  hover:bg-neon-cyan hover:text-black
  transition-all duration-300
  shadow-[0_0_20px_rgba(0,245,255,0.5)]
  hover:shadow-[0_0_30px_rgba(0,245,255,0.8)]
">
  Click Me
</button>
```

### **Card**
```tsx
<div className="
  bg-black/80 backdrop-blur-sm
  border border-neon-purple/30
  rounded-lg p-6
  hover:border-neon-purple
  hover:shadow-[0_0_30px_rgba(176,38,255,0.3)]
  transition-all duration-300
">
  {children}
</div>
```

---

## 🎬 TAILWIND CONFIG

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'neon-pink': '#FF006E',
        'neon-cyan': '#00F5FF',
        'neon-purple': '#B026FF',
        'neon-green': '#39FF14',
        'neon-yellow': '#FFFF00',
      },
      boxShadow: {
        'neon-pink': '0 0 20px rgba(255, 0, 110, 0.5)',
        'neon-cyan': '0 0 20px rgba(0, 245, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(176, 38, 255, 0.5)',
      },
    },
  },
};
```

---

## 📋 QUICK IMPLEMENTATION

```css
/* globals.css */
body {
  @apply bg-black text-white;
}

.neon-text {
  @apply text-neon-cyan;
  text-shadow: 0 0 10px currentColor;
}

.neon-border {
  @apply border-2 border-neon-cyan;
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
}
```

---

**Ready to apply cyberpunk theme?** 🌃
