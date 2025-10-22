import React from 'react';

export default function ResponsiveTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Responsive Design System Test
          </h1>
          <p className="text-gray-300">
            Resize your browser to test breakpoints: Mobile (&lt;768px), Tablet (768-1024px), Desktop (&gt;1024px)
          </p>
        </div>

        {/* Breakpoint Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="mobile-only bg-green-500/20 border-2 border-green-500 rounded-lg p-6 text-center">
            <div className="text-2xl mb-2">📱</div>
            <div className="text-white font-bold">Mobile View</div>
            <div className="text-sm text-gray-300">&lt; 768px</div>
          </div>

          <div className="tablet-only bg-blue-500/20 border-2 border-blue-500 rounded-lg p-6 text-center">
            <div className="text-2xl mb-2">📱</div>
            <div className="text-white font-bold">Tablet View</div>
            <div className="text-sm text-gray-300">768px - 1024px</div>
          </div>

          <div className="desktop-only bg-purple-500/20 border-2 border-purple-500 rounded-lg p-6 text-center">
            <div className="text-2xl mb-2">🖥️</div>
            <div className="text-white font-bold">Desktop View</div>
            <div className="text-sm text-gray-300">&gt; 1024px</div>
          </div>
        </div>

        {/* Touch Target Test */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">Touch Targets (WCAG 2.1 AA)</h2>
          <p className="text-gray-300">
            All buttons should be at least 44×44px (48×48px on mobile)
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="touch-target bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
              Button 1
            </button>
            <button className="touch-target bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
              Button 2
            </button>
            <button className="touch-target bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
              Button 3
            </button>
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">Responsive Grid</h2>
          <p className="text-gray-300">
            Mobile: 1 column | Tablet: 2 columns | Desktop: 3 columns
          </p>
          <div className="grid-responsive">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-6 text-center"
              >
                <div className="text-3xl font-bold text-white">Item {num}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Responsive Flexbox */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">Responsive Flexbox</h2>
          <p className="text-gray-300">
            Mobile: Stacked | Tablet+: Horizontal
          </p>
          <div className="flex-responsive">
            <div className="flex-1 bg-blue-500/20 border border-blue-500 rounded-lg p-6 text-center text-white">
              Flex Item 1
            </div>
            <div className="flex-1 bg-green-500/20 border border-green-500 rounded-lg p-6 text-center text-white">
              Flex Item 2
            </div>
            <div className="flex-1 bg-purple-500/20 border border-purple-500 rounded-lg p-6 text-center text-white">
              Flex Item 3
            </div>
          </div>
        </div>

        {/* Responsive Typography */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">Responsive Typography</h2>
          <p className="text-gray-300">
            Text scales smoothly between 16px and 20px based on viewport
          </p>
          <div className="text-responsive text-white">
            This text uses clamp() to scale responsively between breakpoints.
            Resize your browser to see it adapt smoothly without hard breakpoints.
          </div>
        </div>

        {/* Safe Area Insets */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">Safe Area Insets</h2>
          <p className="text-gray-300">
            Supports iOS notch and Android navigation bars
          </p>
          <div className="safe-area-bottom bg-blue-500/20 border border-blue-500 rounded-lg p-6 text-center text-white">
            This element respects safe area insets (test on mobile device)
          </div>
        </div>

        {/* Orientation Test */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">Orientation Detection</h2>
          <div className="portrait-only bg-green-500/20 border-2 border-green-500 rounded-lg p-6 text-center text-white">
            📱 Portrait Mode Detected
          </div>
          <div className="landscape-only bg-blue-500/20 border-2 border-blue-500 rounded-lg p-6 text-center text-white">
            🖥️ Landscape Mode Detected
          </div>
        </div>

        {/* Accessibility Features */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">Accessibility Features</h2>
          <ul className="text-gray-300 space-y-2">
            <li>✅ Reduced motion support (respects prefers-reduced-motion)</li>
            <li>✅ High contrast mode support (respects prefers-contrast)</li>
            <li>✅ Dark mode support (respects prefers-color-scheme)</li>
            <li>✅ Touch targets meet WCAG 2.1 AA (44×44px minimum)</li>
            <li>✅ Safe area insets for notched devices</li>
          </ul>
        </div>

        {/* Performance Features */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">Performance Optimizations</h2>
          <div className="animated bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-center text-white transform hover:scale-105 transition-transform">
            GPU-accelerated animation (hover me)
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="aspect-ratio-16-9 bg-blue-500/20 border border-blue-500 rounded-lg flex items-center justify-center text-white">
              16:9 Aspect Ratio
            </div>
            <div className="aspect-ratio-1-1 bg-purple-500/20 border border-purple-500 rounded-lg flex items-center justify-center text-white">
              1:1 Aspect Ratio
            </div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-yellow-500/10 border-2 border-yellow-500 rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-yellow-400">Testing Instructions</h2>
          <ol className="text-gray-300 space-y-2 list-decimal list-inside">
            <li>Open Chrome DevTools (F12)</li>
            <li>Click the device toolbar icon (Ctrl+Shift+M)</li>
            <li>Test these viewports:
              <ul className="ml-6 mt-2 space-y-1">
                <li>• iPhone SE (375px) - Mobile</li>
                <li>• iPad Mini (768px) - Tablet</li>
                <li>• iPad Pro (1024px) - Desktop</li>
                <li>• Desktop (1440px+) - Large Desktop</li>
              </ul>
            </li>
            <li>Test portrait and landscape orientations</li>
            <li>Verify touch targets are easy to tap</li>
            <li>Check that grids adapt correctly</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
