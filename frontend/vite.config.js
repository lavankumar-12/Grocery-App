import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const BACKEND_URL = 'http://localhost:3000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': { target: BACKEND_URL, changeOrigin: true },
      '/admin': { target: BACKEND_URL, changeOrigin: true },
      '/email': { target: BACKEND_URL, changeOrigin: true },
      '/cart': { target: BACKEND_URL, changeOrigin: true },
      '/uploads': { target: BACKEND_URL, changeOrigin: true },
    },
  },
})
