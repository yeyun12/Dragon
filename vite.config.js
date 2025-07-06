import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  server: {
    host: true,
    port: 5173,
    open: true // 서버 시작 시 브라우저 자동 실행
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
}); 