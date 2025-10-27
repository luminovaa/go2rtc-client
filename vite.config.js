import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://114.9.13.244:1984',
        changeOrigin: true,
        ws: true,
        secure: false,
      }
    }
  }
})