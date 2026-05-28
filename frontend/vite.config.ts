import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/create/',
  plugins: [react()],
  server: {
    proxy: {
      '/api/dashscope': {
        target: 'https://dashscope.aliyuncs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dashscope/, ''),
        secure: true
      }
    }
  }
})
