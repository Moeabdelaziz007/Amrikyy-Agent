import React, { useState, useEffect } from 'react';
import { Brain, Layers, Code2, Sliders, Globe, StickyNote, Grid3x3, Home, MessageSquare, Calendar, Camera, Music, Video, FileText, Download, Image, Folder, Wifi, Battery, Volume2, Lock, Info, Monitor, X, Minus, Maximize2 } from 'lucide-react';

// Custom Hooks
const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState('desktop');

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width < 768) setDeviceType('mobile');
      else if (width < 1024) setDeviceType('tablet');
      else setDeviceType('desktop');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return deviceType;
};

const useGestures = (onSwipeUp, onSwipeDown) => {
  useEffect(() => {
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e) => {
      const endY = e.changedTouches[0].clientY;
      const deltaY = startY - endY;
      const deltaTime = Date.now() - startTime;

      if (Math.abs(deltaY) > 50 && deltaTime < 300) {
        if (deltaY > 0 && onSwipeUp) onSwipeUp();
        if (deltaY < 0 && onSwipeDown) onSwipeDown();
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeUp, onSwipeDown]);
};

// App Definitions
const apps = [
  { id: 'maya', name: 'Maya AI', icon: Brain, gradient: 'from-purple-500 via-pink-500 to-blue-500', animate: true },
  { id: 'files', name: 'Files', icon: Layers, gradient: 'from-blue-500 to-cyan-500' },
  { id: 'terminal', name: 'Terminal', icon: Code2, gradient: 'from-green-500 to-emerald-500' },
  { id: 'settings', name: 'Settings', icon: Sliders, gradient: 'from-gray-600 to-gray-800' },
  { id: 'browser', name: 'Browser', icon: Globe, gradient: 'from-orange-500 to-red-500' },
  { id: 'notes', name: 'Notes', icon: StickyNote, gradient: 'from-yellow-500 to-amber-500' },
  { id: 'photos', name: 'Photos', icon: Camera, gradient: 'from-pink-500 to-rose-500' },
  { id: 'music', name: 'Music', icon: Music, gradient: 'from-purple-600 to-indigo-500' },
  { id: 'calendar', name: 'Calendar', icon: Calendar, gradient: 'from-red-500 to-pink-500' },
  { id: 'messages', name: 'Messages', icon: MessageSquare, gradient: 'from-green-400 to-emerald-500' },
];

// Mobile Components
const MobileDock = ({ apps, onAppClick, activeApp }) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
    <div className="mx-4 mb-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
      <div className="flex justify-around items-center px-4 py-3">
        {apps.slice(0, 4).map(app => (
          <button
            key={app.id}
            onClick={() => onAppClick(app.id)}
            className={`flex flex-col items-center gap-1 min-w-[56px] min-h-[56px] rounded-xl transition-all active:scale-95 ${
              activeApp === app.id ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-lg ${
              app.animate ? 'animate-pulse' : ''
            }`}>
              <app.icon className="w-6 h-6 text-white" />
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const MobileAppDrawer = ({ apps, onAppClick, onClose }) => (
  <div className="fixed inset-0 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className="absolute inset-x-0 bottom-0 bg-white dark:bg-gray-900 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
      <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6" />
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">All Apps</h2>
      <div className="grid grid-cols-4 gap-4">
        {apps.map(app => (
          <button
            key={app.id}
            onClick={() => { onAppClick(app.id); onClose(); }}
            className="flex flex-col items-center gap-2 p-2 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
          >
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-lg`}>
              <app.icon className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs text-gray-700 dark:text-gray-300 text-center">{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const FloatingActionButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform z-40"
  >
    <Grid3x3 className="w-6 h-6 text-white" />
  </button>
);

// App Windows
const AppWindow = ({ app, onClose, isMaximized, onToggleMaximize }) => {
  const renderAppContent = () => {
    switch (app.id) {
      case 'maya':
        return (
          <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20">
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-200">Hello! I'm Maya, your AI assistant. How can I help you today?</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Maya anything..."
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow">
                  Send
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'files':
        return (
          <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Documents', icon: FileText, color: 'blue' },
                  { name: 'Downloads', icon: Download, color: 'green' },
                  { name: 'Pictures', icon: Image, color: 'purple' },
                  { name: 'Music', icon: Music, color: 'orange' },
                ].map(folder => (
                  <div key={folder.name} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-lg transition-shadow cursor-pointer">
                    <folder.icon className={`w-8 h-8 text-${folder.color}-500 mb-2`} />
                    <p className="font-medium text-gray-900 dark:text-white">{folder.name}</p>
                    <p className="text-xs text-gray-500">12 items</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'terminal':
        return (
          <div className="h-full bg-gray-950 text-green-400 font-mono p-4 overflow-y-auto">
            <div className="space-y-2">
              <p>AmrikyyOS Terminal v1.0.0</p>
              <p>Type 'help' for available commands</p>
              <p className="mt-4">user@amrikyy:~$ <span className="animate-pulse">█</span></p>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {[
                { icon: Monitor, label: 'Display', color: 'blue' },
                { icon: Wifi, label: 'Network', color: 'green' },
                { icon: Battery, label: 'Battery', color: 'yellow' },
                { icon: Volume2, label: 'Sound', color: 'purple' },
                { icon: Lock, label: 'Privacy', color: 'red' },
                { icon: Info, label: 'About', color: 'gray' },
              ].map(setting => (
                <div key={setting.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${setting.color}-100 dark:bg-${setting.color}-900/20 flex items-center justify-center`}>
                    <setting.icon className={`w-5 h-5 text-${setting.color}-500`} />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{setting.label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'browser':
        return (
          <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search or enter URL..."
                  className="flex-1 bg-transparent border-0 focus:outline-none text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
            <div className="flex-1 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-red-900/10 flex items-center justify-center">
              <div className="text-center">
                <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Start browsing the web</p>
              </div>
            </div>
          </div>
        );
      
      case 'notes':
        return (
          <div className="flex flex-col h-full bg-yellow-50 dark:bg-gray-900">
            <div className="flex-1 p-4">
              <textarea
                placeholder="Start typing your note..."
                className="w-full h-full bg-transparent border-0 focus:outline-none text-gray-900 dark:text-white resize-none"
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <app.icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{app.name}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden transition-all ${
      isMaximized ? 'fixed inset-4' : 'fixed inset-8'
    }`}>
      <div className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${app.gradient} flex items-center justify-center`}>
            <app.icon className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{app.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
            <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button 
            onClick={onToggleMaximize}
            className="w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {renderAppContent()}
      </div>
    </div>
  );
};

// Tablet Split View
const TabletSplitView = ({ leftApp, rightApp, onClose }) => (
  <div className="fixed inset-0 flex gap-2 p-4 bg-gray-100 dark:bg-gray-950">
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
      {leftApp && <AppWindow app={leftApp} onClose={() => onClose('left')} isMaximized={false} onToggleMaximize={() => {}} />}
    </div>
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
      {rightApp && <AppWindow app={rightApp} onClose={() => onClose('right')} isMaximized={false} onToggleMaximize={() => {}} />}
    </div>
  </div>
);

// Desktop Taskbar
const DesktopTaskbar = ({ apps, onAppClick, activeApps }) => (
  <div className="fixed bottom-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 flex items-center px-4 gap-2">
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
        <Home className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="flex-1 flex items-center gap-2">
      {apps.slice(0, 6).map(app => (
        <button
          key={app.id}
          onClick={() => onAppClick(app.id)}
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${app.gradient} flex items-center justify-center hover:scale-110 transition-transform ${
            activeApps.includes(app.id) ? 'ring-2 ring-white' : ''
          }`}
        >
          <app.icon className="w-6 h-6 text-white" />
        </button>
      ))}
    </div>
    <div className="flex items-center gap-3 text-white text-sm">
      <Wifi className="w-5 h-5" />
      <Battery className="w-5 h-5" />
      <Volume2 className="w-5 h-5" />
      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  </div>
);

// Main OS Component
const AmrikyyOSComplete = () => {
  const deviceType = useDeviceType();
  const [activeApp, setActiveApp] = useState(null);
  const [activeApps, setActiveApps] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [maximizedApp, setMaximizedApp] = useState(null);
  const [splitViewApps, setSplitViewApps] = useState({ left: null, right: null });

  useGestures(
    () => setShowDrawer(true),
    () => setShowDrawer(false)
  );

  const handleAppClick = (appId) => {
    const app = apps.find(a => a.id === appId);
    if (deviceType === 'mobile') {
      setActiveApp(appId);
      if (!activeApps.includes(appId)) {
        setActiveApps([...activeApps, appId]);
      }
    } else if (deviceType === 'tablet') {
      if (!splitViewApps.left) {
        setSplitViewApps({ ...splitViewApps, left: app });
      } else if (!splitViewApps.right) {
        setSplitViewApps({ ...splitViewApps, right: app });
      }
    } else {
      setActiveApp(appId);
      if (!activeApps.includes(appId)) {
        setActiveApps([...activeApps, appId]);
      }
    }
  };

  const handleCloseApp = () => {
    setActiveApp(null);
    setMaximizedApp(null);
  };

  const handleToggleMaximize = () => {
    setMaximizedApp(maximizedApp ? null : activeApp);
  };

  const currentApp = apps.find(app => app.id === activeApp);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Wallpaper Branding */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-center px-8">
          <div className="mb-8 animate-pulse">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
              <Brain className="w-14 h-14 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl tracking-tight">
            Super AI Automation Agency
          </h1>
          <div className="flex items-center justify-center gap-3 text-white/90 text-xl md:text-2xl font-medium">
            <span>Powered by</span>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-lg">
              <span className="font-bold bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                Gemini
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      {deviceType === 'mobile' && (
        <>
          {/* Clock Widget */}
          <div className="absolute top-12 left-0 right-0 flex flex-col items-center p-8 pointer-events-none z-10">
            <div className="text-white text-center bg-black/20 backdrop-blur-md rounded-3xl px-8 py-4 border border-white/20">
              <p className="text-lg opacity-90">{new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              <p className="text-5xl font-light mt-2">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          <MobileDock apps={apps} onAppClick={handleAppClick} activeApp={activeApp} />
          <FloatingActionButton onClick={() => setShowDrawer(true)} />
          
          {showDrawer && (
            <MobileAppDrawer apps={apps} onAppClick={handleAppClick} onClose={() => setShowDrawer(false)} />
          )}

          {currentApp && (
            <AppWindow 
              app={currentApp} 
              onClose={handleCloseApp} 
              isMaximized={maximizedApp === activeApp}
              onToggleMaximize={handleToggleMaximize}
            />
          )}
        </>
      )}

      {/* Tablet View */}
      {deviceType === 'tablet' && (
        <>
          {/* Clock Widget */}
          <div className="absolute top-8 left-8 pointer-events-none z-10">
            <div className="text-white bg-black/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
              <p className="text-sm opacity-90">{new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              <p className="text-3xl font-light">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          
          {(splitViewApps.left || splitViewApps.right) && (
            <TabletSplitView
              leftApp={splitViewApps.left}
              rightApp={splitViewApps.right}
              onClose={(side) => setSplitViewApps({ ...splitViewApps, [side]: null })}
            />
          )}
          
          <DesktopTaskbar apps={apps} onAppClick={handleAppClick} activeApps={Object.values(splitViewApps).filter(Boolean).map(a => a.id)} />
        </>
      )}

      {/* Desktop View */}
      {deviceType === 'desktop' && (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <h1 className="text-7xl font-bold mb-4">AmrikyyOS</h1>
              <p className="text-2xl opacity-80">Desktop Mode</p>
            </div>
          </div>

          {currentApp && (
            <AppWindow 
              app={currentApp} 
              onClose={handleCloseApp}
              isMaximized={maximizedApp === activeApp}
              onToggleMaximize={handleToggleMaximize}
            />
          )}

          <DesktopTaskbar apps={apps} onAppClick={handleAppClick} activeApps={activeApps} />
        </>
      )}
    </div>
  );
};

export default AmrikyyOSComplete;
