import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use SWC for faster builds (30% faster than Babel)
      jsxImportSource: '@emotion/react',
      babel: false
    })
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services')
    }
  },

  // Build optimization
  build: {
    // Target modern browsers (smaller bundle)
    target: 'es2020',
    
    // Enable minification (Terser is better than esbuild for size)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks (better caching)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'animation-vendor': ['framer-motion'],
          'utils': ['date-fns', 'clsx', 'zustand']
        },
        // Smaller chunk names
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    
    // Source maps only in development
    sourcemap: false,
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Emit manifest for better caching
    manifest: true,
    
    // Report compressed size (helpful for optimization)
    reportCompressedSize: true
  },

  // Development server optimization
  server: {
    port: 3000,
    host: true,
    
    // HMR optimization
    hmr: {
      overlay: true
    },
    
    // Warm up frequently used files
    warmup: {
      clientFiles: [
        './src/App.tsx',
        './src/main.tsx',
        './src/pages/**/*.tsx'
      ]
    }
  },

  // Dependency optimization
  optimizeDeps: {
    // Pre-bundle these dependencies (faster dev server startup)
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'zustand',
      'date-fns'
    ],
    
    // Exclude heavy dependencies that don't need optimization
    exclude: [],
    
    // Force dependency optimization
    force: false
  },

  // Preview server (for production builds)
  preview: {
    port: 4173,
    host: true
  },

  // Esbuild options (for faster transpilation)
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    
    // Tree shaking (remove unused code)
    treeShaking: true,
    
    // Drop unused imports
    drop: ['console', 'debugger']
  },

  // CSS optimization
  css: {
    devSourcemap: true,
    
    // PostCSS optimization happens in postcss.config.js
    postcss: './postcss.config.js'
  },

  // JSON optimization
  json: {
    namedExports: true,
    stringify: false
  }
});

