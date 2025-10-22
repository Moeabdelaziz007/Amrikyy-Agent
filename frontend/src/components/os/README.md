# Amrikyy AI OS - Advanced OS Components

Complete desktop operating system experience with AI integration.

## 🎯 Components

### 1. QuickSearch
Universal search component with fuzzy matching (Cmd+K / Ctrl+K)

**Features:**
- ✅ Fuzzy search with Fuse.js
- ✅ Keyboard navigation (↑↓ arrows, Enter, Escape)
- ✅ Recent searches with localStorage
- ✅ Beautiful animations
- ✅ Categories and icons
- ✅ Search apps, files, commands

**Usage:**
```tsx
import { QuickSearch } from '@/components/os';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  const searchItems = [
    {
      id: 'app-maya',
      title: 'Maya Travel Assistant',
      description: 'AI-powered travel planning',
      type: 'app',
      action: () => console.log('Open Maya')
    }
  ];

  return (
    <QuickSearch
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      items={searchItems}
    />
  );
}
```

---

### 2. SystemTray
Complete system tray with clock, notifications, volume, and user menu

**Features:**
- ✅ Real-time clock with date
- ✅ Notification center with badges
- ✅ Volume control with slider
- ✅ User menu (profile, settings, logout)
- ✅ Smooth dropdown animations
- ✅ Glassmorphism design

**Usage:**
```tsx
import { SystemTray } from '@/components/os';

function Taskbar() {
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatar.jpg'
  };

  const notifications = [
    {
      id: '1',
      title: 'Welcome!',
      message: 'Your system is ready',
      time: new Date(),
      read: false,
      type: 'success'
    }
  ];

  return (
    <SystemTray
      user={user}
      notifications={notifications}
      onLogout={() => console.log('Logout')}
      onSettings={() => console.log('Settings')}
      onVolumeChange={(vol) => console.log('Volume:', vol)}
    />
  );
}
```

---

### 3. useKeyboardShortcuts
Global keyboard shortcuts manager

**Features:**
- ✅ Cross-platform (Mac Cmd, Windows/Linux Ctrl)
- ✅ Multiple key combinations
- ✅ Prevent default browser shortcuts
- ✅ TypeScript support
- ✅ Customizable shortcuts

**Default Shortcuts:**
- `Cmd+N` / `Ctrl+N` - New window
- `Cmd+W` / `Ctrl+W` - Close window
- `Cmd+M` / `Ctrl+M` - Minimize window
- `Cmd+K` / `Ctrl+K` - Quick search
- `Alt+Tab` - Switch windows
- `Cmd+,` / `Ctrl+,` - Settings

**Usage:**
```tsx
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function App() {
  useKeyboardShortcuts({
    onNewWindow: () => createWindow(),
    onCloseWindow: () => closeActiveWindow(),
    onQuickSearch: () => setSearchOpen(true),
    onSettings: () => openSettings(),
    enabled: true,
    debug: true
  });

  return <YourApp />;
}
```

**Custom Shortcuts:**
```tsx
useKeyboardShortcuts({
  customShortcuts: [
    {
      key: 's',
      ctrl: true,
      shift: true,
      action: () => saveAll(),
      preventDefault: true,
      description: 'Save all'
    }
  ]
});
```

---

### 4. DesktopOS
Complete desktop OS layout combining all features

**Features:**
- ✅ All OS components integrated
- ✅ Taskbar with system tray
- ✅ Window management context
- ✅ Keyboard shortcuts enabled
- ✅ Customizable wallpaper
- ✅ Demo data included

**Usage:**
```tsx
import { DesktopOS } from '@/components/os/DesktopOS';

function App() {
  return (
    <DesktopOS
      user={{ name: 'John Doe', email: 'john@example.com' }}
      onLogout={() => console.log('Logout')}
      onSettings={() => console.log('Settings')}
    >
      <YourDesktopContent />
    </DesktopOS>
  );
}
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install fuse.js date-fns
```

### 2. Import Components
```tsx
import { QuickSearch, SystemTray } from '@/components/os';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
```

### 3. Use Complete Desktop
```tsx
import { DesktopOS } from '@/components/os/DesktopOS';

function App() {
  return (
    <DesktopOS>
      {/* Your apps here */}
    </DesktopOS>
  );
}
```

---

## 📁 File Structure

```
frontend/src/
├── components/
│   └── os/
│       ├── QuickSearch.tsx       # Universal search
│       ├── SystemTray.tsx        # System tray
│       ├── DesktopOS.tsx         # Complete desktop
│       ├── index.ts              # Exports
│       └── README.md             # This file
├── hooks/
│   └── useKeyboardShortcuts.ts   # Keyboard shortcuts
├── contexts/
│   └── WindowManagerContext.tsx  # Window management
└── pages/
    └── OSDemo.tsx                # Demo page
```

---

## 🎨 Styling

All components use:
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Glassmorphism** design
- **Dark theme** optimized
- **Responsive** layouts

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `Cmd+K` / `Ctrl+K` | Quick Search |
| `Cmd+N` / `Ctrl+N` | New Window |
| `Cmd+W` / `Ctrl+W` | Close Window |
| `Cmd+M` / `Ctrl+M` | Minimize Window |
| `Cmd+Shift+M` | Maximize Window |
| `Alt+Tab` | Switch Window (Next) |
| `Alt+Shift+Tab` | Switch Window (Previous) |
| `Cmd+,` / `Ctrl+,` | Settings |
| `Cmd+Q` / `Ctrl+Q` | Quit |
| `Escape` | Close Search |
| `↑` `↓` | Navigate Search Results |
| `Enter` | Select Search Result |

---

## 🧪 Testing

View the demo page to see all features in action:
```tsx
import { OSDemo } from '@/pages/OSDemo';

// Navigate to /os-demo
```

---

## 🔧 Configuration

### QuickSearch Configuration
```tsx
<QuickSearch
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  items={searchItems}
  placeholder="Search anything..."
  maxResults={10}
  className="custom-class"
/>
```

### SystemTray Configuration
```tsx
<SystemTray
  user={user}
  notifications={notifications}
  onNotificationClick={(n) => console.log(n)}
  onMarkAllRead={() => markAllRead()}
  onClearNotifications={() => clear()}
  onVolumeChange={(vol) => setVolume(vol)}
  onLogout={() => logout()}
  onSettings={() => openSettings()}
  onProfile={() => openProfile()}
/>
```

### Keyboard Shortcuts Configuration
```tsx
useKeyboardShortcuts({
  onNewWindow: handleNew,
  onCloseWindow: handleClose,
  onMinimizeWindow: handleMinimize,
  onMaximizeWindow: handleMaximize,
  onQuickSearch: handleSearch,
  onSwitchWindowNext: handleNext,
  onSwitchWindowPrev: handlePrev,
  onSettings: handleSettings,
  customShortcuts: [...],
  enabled: true,
  debug: false
});
```

---

## 💡 Best Practices

1. **QuickSearch:**
   - Provide meaningful descriptions
   - Use categories to organize items
   - Include relevant keywords for better fuzzy matching
   - Limit results to 8-10 items for best UX

2. **SystemTray:**
   - Keep notification messages concise
   - Use appropriate notification types (info, success, warning, error)
   - Update notification state after user interaction
   - Provide avatar for better user recognition

3. **Keyboard Shortcuts:**
   - Don't override critical browser shortcuts
   - Use `preventDefault: true` for OS-specific shortcuts
   - Provide visual feedback when shortcuts are triggered
   - Document all shortcuts for users

4. **DesktopOS:**
   - Wrap entire app in WindowManagerProvider
   - Provide user data for personalization
   - Handle logout/settings callbacks
   - Use custom wallpaper for branding

---

## 🐛 Troubleshooting

**QuickSearch not opening:**
- Check if `isOpen` state is properly managed
- Verify keyboard shortcut is registered
- Check for conflicting shortcuts

**SystemTray dropdowns not working:**
- Ensure proper z-index hierarchy
- Check if click outside handlers are working
- Verify Framer Motion is installed

**Keyboard shortcuts not firing:**
- Check if `enabled` is set to `true`
- Verify callbacks are provided
- Enable `debug` mode to see console logs
- Check for conflicting browser extensions

---

## 📚 Additional Resources

- [Fuse.js Documentation](https://fusejs.io/)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [date-fns Documentation](https://date-fns.org/)

---

## 🎯 Next Steps

1. ✅ QuickSearch - Complete
2. ✅ SystemTray - Complete
3. ✅ Keyboard Shortcuts - Complete
4. ✅ DesktopOS Integration - Complete
5. 🔄 Window Management UI
6. 🔄 File Manager
7. 🔄 Terminal Application
8. 🔄 Settings Panel

---

**Author:** CURSERO AI
**Created:** 2025-10-22
**Version:** 1.0.0
**License:** MIT
