import React, { useState, useEffect } from 'react';
import { Menu, X, Search, Home, FileText, Terminal, Settings, Cpu, Zap, MessageSquare, Phone, ChevronUp, Plus } from 'lucide-react';

// ============================================================================
// HOOKS: Device Detection
// ============================================================================

const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setDeviceType('mobile');
      else if (width < 1024) setDeviceType('tablet');
      else setDeviceType('desktop');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
};

const useGestures = (onSwipeUp?: () => void, onSwipeDown?: () => void) => {
  useEffect(() => {
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY;
      const deltaY = endY - startY;
      const deltaTime = Date.now() - startTime;

      if (Math.abs(deltaY) > 50 && deltaTime < 300) {
        if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        } else if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        }
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

// ============================================================================
// TYPES
// ============================================================================

type AppId = 'files' | 'terminal' | 'maya' | 'settings' | 'browser' | 'notes';

interface App {
  id: AppId;
  title: string;
  icon: React.ReactNode;
  color: string;
}

// ============================================================================
// MOBILE COMPONENTS
// ============================================================================

const MobileDock: React.FC<{
  apps: App[];
  onAppLaunch: (id: AppId) => void;
  onDrawerOpen: () => void;
}> = ({ apps, onAppLaunch, onDrawerOpen }) => {
  const pinnedApps = apps.slice(0, 4);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 px-4 py-3 safe-area-bottom z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {pinnedApps.map((app) => (
          <button
            key={app.id}
            onClick={() => onAppLaunch(app.id)}
            className="flex flex-col items-center gap-1 p-2 rounded-2xl active:scale-95 transition-transform touch-manipulation"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <div className={`w-12 h-12 rounded-2xl ${app.color} flex items-center justify-center shadow-lg`}>
              {app.icon}
            </div>
            <span className="text-xs text-gray-300">{app.title}</span>
          </button>
        ))}
        <button
          onClick={onDrawerOpen}
          className="flex flex-col items-center gap-1 p-2 rounded-2xl active:scale-95 transition-transform"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-gray-700 flex items-center justify-center shadow-lg">
            <Menu className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-gray-300">More</span>
        </button>
      </div>
    </div>
  );
};

const MobileAppDrawer: React.FC<{
  apps: App[];
  isOpen: boolean;
  onClose: () => void;
  onAppLaunch: (id: AppId) => void;
}> = ({ apps, isOpen, onClose, onAppLaunch }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 bg-gray-900 rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Apps</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => {
                onAppLaunch(app.id);
                onClose();
              }}
              className="flex flex-col items-center gap-2 p-2 rounded-2xl active:scale-95 transition-transform"
            >
              <div className={`w-14 h-14 rounded-2xl ${app.color} flex items-center justify-center shadow-lg`}>
                {app.icon}
              </div>
              <span className="text-xs text-gray-300 text-center">{app.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const FloatingActionButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 w-14 h-14 bg-blue-500 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform z-40"
      style={{ minWidth: '56px', minHeight: '56px' }}
    >
      <Search className="w-6 h-6 text-white" />
    </button>
  );
};

const MobileSearchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 animate-in fade-in duration-200">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center">
            <X className="w-6 h-6 text-white" />
          </button>
          <input
            type="text"
            placeholder="Search apps, files, and more..."
            className="flex-1 bg-gray-800 text-white rounded-full px-4 py-3 text-base outline-none"
            autoFocus
          />
        </div>
        <div className="space-y-2">
          {['Recent', 'Apps', 'Files', 'Settings'].map((category) => (
            <div key={category} className="bg-gray-800 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">{category}</h3>
              <div className="text-gray-500 text-sm">No recent {category.toLowerCase()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MobileApp: React.FC<{
  app: App;
  onClose: () => void;
}> = ({ app, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 z-40 animate-in slide-in-from-right duration-300">
      {/* App Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center active:scale-95 transition-transform"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <div className={`w-8 h-8 rounded-lg ${app.color} flex items-center justify-center`}>
          {React.cloneElement(app.icon as React.ReactElement, { className: 'w-5 h-5' })}
        </div>
        <h1 className="text-lg font-semibold text-white">{app.title}</h1>
      </div>

      {/* App Content */}
      <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 60px)' }}>
        {app.id === 'maya' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Maya AI</h2>
                  <p className="text-sm text-gray-400">Your AI Assistant</p>
                </div>
              </div>
              <p className="text-gray-300">How can I help you today?</p>
            </div>

            <div className="space-y-3">
              {['Plan a trip', 'Search files', 'Run command', 'Get weather'].map((suggestion) => (
                <button
                  key={suggestion}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left text-white transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {app.id === 'files' && (
          <div className="space-y-2">
            {['Documents', 'Downloads', 'Pictures', 'Videos', 'Music'].map((folder) => (
              <button
                key={folder}
                className="w-full bg-gray-800 rounded-xl p-4 flex items-center gap-3 active:bg-gray-700 transition-colors"
              >
                <FileText className="w-6 h-6 text-blue-400" />
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">{folder}</div>
                  <div className="text-sm text-gray-400">Empty</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {app.id === 'terminal' && (
          <div className="bg-black rounded-xl p-4 font-mono text-sm">
            <div className="text-green-400">$ Welcome to Amrikyy Terminal</div>
            <div className="text-gray-400 mt-2">Type 'help' for available commands</div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-blue-400">~</span>
              <span className="text-white">$</span>
              <div className="flex-1 bg-transparent outline-none text-white">|</div>
            </div>
          </div>
        )}

        {app.id === 'settings' && (
          <div className="space-y-2">
            {[
              { label: 'Display', icon: <Cpu className="w-5 h-5" /> },
              { label: 'Network', icon: <Zap className="w-5 h-5" /> },
              { label: 'Privacy', icon: <Settings className="w-5 h-5" /> },
              { label: 'About', icon: <MessageSquare className="w-5 h-5" /> },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full bg-gray-800 rounded-xl p-4 flex items-center gap-3 active:bg-gray-700 transition-colors"
              >
                <div className="text-blue-400">{item.icon}</div>
                <div className="text-white font-medium">{item.label}</div>
              </button>
            ))}
          </div>
        )}

        {(app.id === 'browser' || app.id === 'notes') && (
          <div className="text-center py-12">
            <div className={`w-20 h-20 rounded-2xl ${app.color} flex items-center justify-center mx-auto mb-4`}>
              {React.cloneElement(app.icon as React.ReactElement, { className: 'w-10 h-10' })}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{app.title}</h3>
            <p className="text-gray-400">Coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// TABLET COMPONENTS
// ============================================================================

const TabletSplitView: React.FC<{
  leftApp: App | null;
  rightApp: App | null;
  onAppClose: (side: 'left' | 'right') => void;
}> = ({ leftApp, rightApp, onAppClose }) => {
  return (
    <div className="flex h-full">
      {leftApp && (
        <div className="flex-1 border-r border-gray-700">
          <MobileApp app={leftApp} onClose={() => onAppClose('left')} />
        </div>
      )}
      {rightApp && (
        <div className="flex-1">
          <MobileApp app={rightApp} onClose={() => onAppClose('right')} />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DESKTOP COMPONENTS (Simplified for demo)
// ============================================================================

const DesktopTaskbar: React.FC<{
  apps: App[];
  onAppLaunch: (id: AppId) => void;
}> = ({ apps, onAppLaunch }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 px-6 py-2">
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors">
          <Menu className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1 flex items-center gap-2">
          {apps.slice(0, 6).map((app) => (
            <button
              key={app.id}
              onClick={() => onAppLaunch(app.id)}
              className={`w-10 h-10 rounded-lg ${app.color} flex items-center justify-center hover:scale-110 transition-transform`}
            >
              {React.cloneElement(app.icon as React.ReactElement, { className: 'w-5 h-5' })}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-400">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN OS COMPONENT
// ============================================================================

const MobileOSDemo: React.FC = () => {
  const deviceType = useDeviceType();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [tabletApps, setTabletApps] = useState<{ left: AppId | null; right: AppId | null }>({
    left: null,
    right: null,
  });

  const apps: App[] = [
    { id: 'maya', title: 'Maya AI', icon: <Zap className="w-6 h-6 text-white" />, color: 'bg-gradient-to-br from-blue-500 to-purple-500' },
    { id: 'files', title: 'Files', icon: <FileText className="w-6 h-6 text-white" />, color: 'bg-blue-500' },
    { id: 'terminal', title: 'Terminal', icon: <Terminal className="w-6 h-6 text-white" />, color: 'bg-green-500' },
    { id: 'settings', title: 'Settings', icon: <Settings className="w-6 h-6 text-white" />, color: 'bg-gray-600' },
    { id: 'browser', title: 'Browser', icon: <Home className="w-6 h-6 text-white" />, color: 'bg-orange-500' },
    { id: 'notes', title: 'Notes', icon: <MessageSquare className="w-6 h-6 text-white" />, color: 'bg-yellow-500' },
  ];

  useGestures(
    () => deviceType === 'mobile' && setDrawerOpen(true),
    () => deviceType === 'mobile' && setSearchOpen(true)
  );

  const handleAppLaunch = (id: AppId) => {
    if (deviceType === 'mobile') {
      setActiveApp(id);
    } else if (deviceType === 'tablet') {
      if (!tabletApps.left) {
        setTabletApps({ ...tabletApps, left: id });
      } else if (!tabletApps.right) {
        setTabletApps({ ...tabletApps, right: id });
      } else {
        setTabletApps({ ...tabletApps, right: id });
      }
    }
  };

  const activeAppData = activeApp ? apps.find((a) => a.id === activeApp) : null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Device Type Indicator */}
      <div className="absolute top-4 right-4 bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-300 z-50">
        {deviceType.toUpperCase()} MODE
      </div>

      {/* MOBILE VIEW */}
      {deviceType === 'mobile' && (
        <>
          {!activeApp ? (
            <div className="flex flex-col items-center justify-center h-full px-6 pb-24">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-6 shadow-2xl">
                <Cpu className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Amrikyy OS</h1>
              <p className="text-gray-400 text-center mb-8">First AI-Native Operating System</p>
              <div className="text-sm text-gray-500 text-center">
                <p>✨ Swipe up to open apps</p>
                <p>🔍 Tap search button for quick access</p>
              </div>
            </div>
          ) : activeAppData ? (
            <MobileApp app={activeAppData} onClose={() => setActiveApp(null)} />
          ) : null}

          <MobileDock apps={apps} onAppLaunch={handleAppLaunch} onDrawerOpen={() => setDrawerOpen(true)} />
          <FloatingActionButton onClick={() => setSearchOpen(true)} />
          <MobileAppDrawer apps={apps} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onAppLaunch={handleAppLaunch} />
          <MobileSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
      )}

      {/* TABLET VIEW */}
      {deviceType === 'tablet' && (
        <>
          <div className="h-full pb-16">
            {!tabletApps.left && !tabletApps.right ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-6 shadow-2xl">
                  <Cpu className="w-16 h-16 text-white" />
                </div>
                <h1 className="text-5xl font-bold text-white mb-2">Amrikyy OS</h1>
                <p className="text-gray-400 text-center mb-8">Tablet Mode - Split Screen Ready</p>
                <p className="text-gray-500">Launch apps to use split-screen view</p>
              </div>
            ) : (
              <TabletSplitView
                leftApp={tabletApps.left ? apps.find((a) => a.id === tabletApps.left)! : null}
                rightApp={tabletApps.right ? apps.find((a) => a.id === tabletApps.right)! : null}
                onAppClose={(side) => setTabletApps({ ...tabletApps, [side]: null })}
              />
            )}
          </div>
          <DesktopTaskbar apps={apps} onAppLaunch={handleAppLaunch} />
        </>
      )}

      {/* DESKTOP VIEW */}
      {deviceType === 'desktop' && (
        <>
          <div className="flex flex-col items-center justify-center h-full pb-16">
            <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-8 shadow-2xl">
              <Cpu className="w-20 h-20 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-white mb-4">Amrikyy OS</h1>
            <p className="text-xl text-gray-400 text-center mb-4">First AI-Native Operating System</p>
            <p className="text-gray-500 text-center max-w-2xl">
              Desktop mode with full window management. Resize your browser to see mobile and tablet modes!
            </p>
          </div>
          <DesktopTaskbar apps={apps} onAppLaunch={handleAppLaunch} />
        </>
      )}
    </div>
  );
};

export default MobileOSDemo;
