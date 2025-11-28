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
    port: 8010,  
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/predict': {
        target: 'http://peekaboo_class_model_service:8060',
        changeOrigin: true,
        secure: false
      },
      '/birds': {
        target: 'http://peekaboo_symfony:80', // Use the container name
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
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