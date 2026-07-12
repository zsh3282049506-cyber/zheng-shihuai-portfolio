import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 相对资源路径可同时兼容 GitHub Pages 项目页与自定义域名。
  base: './',
  plugins: [react()],
})
