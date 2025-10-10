import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        'dist/',
        'coverage/',
        '**/*.config.{js,ts}',
        '**/*.setup.{js,ts}'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    reporters: process.env.CI ? ['verbose', 'github-actions'] : ['verbose'],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        url: 'http://localhost:3000'
      }
    }
  }
})
