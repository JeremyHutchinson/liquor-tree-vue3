import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Demo app configuration
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': new URL('../src', import.meta.url).pathname
    }
  },

  server: {
    port: 5173
  }
})
