// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 引入 path 模块

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // 设置别名
    }
  },
  server: {
    port: 5173, // 前端开发服务器端口
    proxy: {
      '/api': {
        target: 'http://67ee6e5b.r20.vip.cpolar.cn',
        changeOrigin: true,
      }
    }
  }
})