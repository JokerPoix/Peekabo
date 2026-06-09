import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 8010,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/predict': {
        target: 'http://peekaboo_symfony:80',
        changeOrigin: true,
        secure: false
      },
      '/llm': {
        target: 'http://peekaboo_symfony:80',
        changeOrigin: true,
        secure: false
      },
      '/birds': {
        target: 'http://peekaboo_symfony:80',
        changeOrigin: true,
        secure: false,
      },
      '/bird': {
        target: 'http://peekaboo_symfony:80',
        changeOrigin: true,
        secure: false
      },
      '/user': {
        target: 'http://peekaboo_symfony:80',
        changeOrigin: true,
        secure: false
      },
      '/login': {
        target: 'http://peekaboo_symfony:80',
        changeOrigin: true,
        secure: false
      },
      '/register': {
        target: 'http://peekaboo_symfony:80',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
