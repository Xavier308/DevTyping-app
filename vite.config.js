import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
    // Force CSS modules to be processed
    modules: {
      localsConvention: 'camelCase',
    }
  },
  // Clear cache on start to avoid stale CSS
  optimizeDeps: {
    force: true
  }
})