import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api/chatbot': {
        target: 'http://localhost:8084', // ✅ Quarkus Backend
        changeOrigin: true,
        secure: false
      },
      '/admin/prompts': {
        target: 'http://localhost:8080', // ✅ Backend for /admin/prompts
        changeOrigin: true,
        secure: false
      }
    }
  }
})
