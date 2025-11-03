import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow external access for Kombai preview
    port: 5173,
    strictPort: false, // Allow fallback to another port if 5173 is busy
    open: false, // Don't auto-open browser (Kombai handles this)
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  },
})
