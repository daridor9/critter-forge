import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/critter-forge/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/components/dexShapes.tsx') || id.includes('/src/components/xrayShapes.tsx')) {
            return 'creature-art';
          }
        },
      },
    },
  },
})
