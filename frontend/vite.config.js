import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    proxy: {
      // Localhost backend ke liye proxy lagao
      '/api': {
        target: 'https://stproject1.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
    // allowedHosts ki abhi zarurat nahi jab tak local pe ho
  }
})