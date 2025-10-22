# AI Operating System - Core Module

## Overview

The AI Operating System is the foundation of the Amrikyy AI-powered desktop experience. It provides window management, application launching, and natural language OS control powered by Google Gemini Pro.

## Features

### ✅ Window Management
- Open, close, minimize, maximize, restore windows
- Window focus and z-index management
- Window positioning and resizing
- State tracking for all windows

### ✅ Application Registry
- Register and manage applications
- Launch applications in new windows
- Track running applications
- Built-in apps (Maya, Trip Planner, File Manager, Terminal, etc.)

### ✅ Event System
- EventEmitter-based architecture
- Real-time events for all OS operations
- Event types: `window:opened`, `window:closed`, `app:launched`, etc.

### ✅ AI Integration
- Natural language command processing
- Context-aware assistance
- Gemini Pro powered intelligence
- Quantum reasoning capabilities

### ✅ State Persistence
- Save and load OS state
- Window persistence
- User preferences
- Session management

## Architecture

```
AIOperatingSystem (EventEmitter)
├── Gemini AI Engine
├── Window Manager
│   ├── Window State Map
│   ├── Focus Management
│   └── Z-Index Control
├── Application Registry
│   ├── Built-in Apps
│   ├── Custom Apps
│   └── Running Apps Tracker
├── Event System
│   └── Event Emission/Listening
└── State Manager
    ├── State Persistence
    └── Context Management
```

## Usage

### Import the OS

```javascript
const aiOS = require('./src/os/AIOperatingSystem');
```

### Window Management

```javascript
// Open a window
const window = aiOS.openWindow({
  title: 'My Window',
  width: 800,
  height: 600,
  x: 100,
  y: 100
});

// Focus a window
aiOS.focusWindow(window.id);

// Minimize a window
aiOS.minimizeWindow(window.id);

// Maximize a window
aiOS.maximizeWindow(window.id);

// Restore a window
aiOS.restoreWindow(window.id);

// Update window position
aiOS.updateWindowPosition(window.id, 200, 200);

// Update window size
aiOS.updateWindowSize(window.id, 1024, 768);

// Close a window
aiOS.closeWindow(window.id);

// Get all windows
const windows = aiOS.getAllWindows();

// Get window by ID
const myWindow = aiOS.getWindow(window.id);
```

### Application Management

```javascript
// Register an application
aiOS.registerApplication({
  id: 'my-app',
  name: 'My Application',
  icon: '🚀',
  type: 'custom',
  description: 'My custom application',
  component: 'MyAppComponent',
  permissions: ['ai', 'storage']
});

// Launch an application
const result = await aiOS.launchApplication('my-app', {
  width: 1024,
  height: 768
});

// Get all applications
const apps = aiOS.getAllApplications();

// Get application by ID
const app = aiOS.getApplication('my-app');

// Get windows by app
const appWindows = aiOS.getWindowsByApp('my-app');
```

### Natural Language Commands

```javascript
// Process a command
const result = await aiOS.processNaturalLanguageCommand(
  'open maya travel assistant',
  { userId: '123' }
);

// Result includes:
// - intent: The detected intent
// - action: The action to perform
// - response: Natural language response
// - confidence: Confidence score (0-1)
```

### Event Handling

```javascript
// Listen to window events
aiOS.on('window:opened', (window) => {
  console.log('Window opened:', window.title);
});

aiOS.on('window:closed', ({ windowId, window }) => {
  console.log('Window closed:', window.title);
});

aiOS.on('window:focused', (window) => {
  console.log('Window focused:', window.title);
});

// Listen to application events
aiOS.on('app:launched', ({ app, window }) => {
  console.log('App launched:', app.name);
});

aiOS.on('app:closed', ({ appId }) => {
  console.log('App closed:', appId);
});

// Listen to AI events
aiOS.on('ai:command', ({ command, result, duration }) => {
  console.log('AI command:', command, '→', result.intent);
});

// Listen to errors
aiOS.on('error', ({ type, error }) => {
  console.error('OS error:', type, error);
});
```

### State Management

```javascript
// Get OS state
const state = aiOS.getState();

// Update OS state
aiOS.updateState({
  theme: 'light',
  language: 'ar'
});

// Save state
await aiOS.saveState();

// Load state
await aiOS.loadState();

// Get metrics
const metrics = aiOS.getMetrics();
```

## API Routes

### Window Routes

- `GET /api/os/windows` - Get all windows
- `POST /api/os/windows` - Open a new window
- `GET /api/os/windows/:id` - Get window by ID
- `PUT /api/os/windows/:id` - Update window
- `DELETE /api/os/windows/:id` - Close window
- `POST /api/os/windows/:id/focus` - Focus window
- `POST /api/os/windows/:id/minimize` - Minimize window
- `POST /api/os/windows/:id/maximize` - Maximize window
- `POST /api/os/windows/:id/restore` - Restore window

### Application Routes

- `GET /api/os/apps` - Get all applications
- `GET /api/os/apps/:id` - Get application by ID
- `POST /api/os/apps/:id/launch` - Launch application

### System Routes

- `GET /api/os/status` - Get OS status
- `GET /api/os/state` - Get OS state
- `POST /api/os/state/save` - Save OS state
- `POST /api/os/state/load` - Load OS state
- `GET /api/os/metrics` - Get system metrics
- `POST /api/os/command` - Process natural language command
- `POST /api/os/shutdown` - Shutdown OS (admin only)

## Built-in Applications

1. **Maya Travel Assistant** (`maya-travel`)
   - AI-powered travel planning and booking
   - Permissions: ai, booking, maps

2. **Trip Planner** (`trip-planner`)
   - Multi-destination trip planning
   - Permissions: maps, booking

3. **File Manager** (`file-manager`)
   - Manage files and folders
   - Permissions: filesystem

4. **Terminal** (`terminal`)
   - AI-powered command terminal
   - Permissions: terminal, ai

5. **Knowledge Graph** (`knowledge-graph`)
   - 3D visualization of AI knowledge
   - Permissions: ai, 3d

6. **Settings** (`settings`)
   - System settings and preferences
   - Permissions: system

## Events Reference

### Window Events
- `window:opened` - When a window is opened
- `window:closed` - When a window is closed
- `window:focused` - When a window receives focus
- `window:minimized` - When a window is minimized
- `window:maximized` - When a window is maximized
- `window:restored` - When a window is restored
- `window:moved` - When a window is moved
- `window:resized` - When a window is resized

### Application Events
- `app:registered` - When an app is registered
- `app:launched` - When an app is launched
- `app:closed` - When an app is closed

### System Events
- `initialized` - When the OS is initialized
- `state:updated` - When OS state is updated
- `state:saved` - When state is saved
- `state:loaded` - When state is loaded
- `shutdown` - When OS is shutting down

### AI Events
- `ai:command` - When an AI command is processed

### Error Events
- `error` - When an error occurs

## Performance Metrics

The OS tracks the following metrics:

- `windowsOpened` - Total windows opened
- `windowsClosed` - Total windows closed
- `appsLaunched` - Total apps launched
- `aiInteractions` - Total AI interactions
- `averageResponseTime` - Average AI response time (ms)

## Environment Variables

```bash
# Required
GEMINI_API_KEY=your-gemini-api-key
# OR
GOOGLE_AI_API_KEY=your-gemini-api-key

# Optional
GEMINI_MODEL=gemini-2.0-flash-exp  # Default model
```

## Best Practices

1. **Always handle errors**
   ```javascript
   try {
     const window = aiOS.openWindow(config);
   } catch (error) {
     console.error('Failed to open window:', error);
   }
   ```

2. **Use events for UI updates**
   ```javascript
   aiOS.on('window:opened', (window) => {
     updateUI(window);
   });
   ```

3. **Clean up event listeners**
   ```javascript
   const handler = (window) => console.log(window);
   aiOS.on('window:opened', handler);
   
   // Later...
   aiOS.off('window:opened', handler);
   ```

4. **Validate window IDs**
   ```javascript
   const window = aiOS.getWindow(windowId);
   if (!window) {
     console.error('Window not found');
     return;
   }
   ```

5. **Use natural language for user commands**
   ```javascript
   const userInput = 'show me my trips';
   const result = await aiOS.processNaturalLanguageCommand(userInput);
   // Handle result based on intent
   ```

## Testing

```javascript
// Test window management
const window1 = aiOS.openWindow({ title: 'Test Window 1' });
const window2 = aiOS.openWindow({ title: 'Test Window 2' });

console.assert(aiOS.getAllWindows().length === 2);

aiOS.focusWindow(window1.id);
console.assert(aiOS.focusedWindowId === window1.id);

aiOS.closeWindow(window1.id);
console.assert(aiOS.getAllWindows().length === 1);

// Test application launching
const result = await aiOS.launchApplication('maya-travel');
console.assert(result.success === true);
console.assert(aiOS.runningApps.has('maya-travel'));
```

## Future Enhancements

- [ ] Multi-desktop support
- [ ] Window snapping and tiling
- [ ] Keyboard shortcuts
- [ ] Window groups/workspaces
- [ ] Screen sharing
- [ ] Remote desktop
- [ ] Window animations
- [ ] Custom themes
- [ ] Plugin system
- [ ] Voice control integration

## License

© 2025 Mohamed Hossameldin Abdelaziz / AMRIKYY AI Solutions

---

**Version**: 1.0.0  
**Last Updated**: October 22, 2025  
**Status**: Production Ready ✅
