import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    envDir: process.cwd(),
    root: path.resolve(__dirname, 'src/renderer'),
    base: env.VITE_BASE_URL || '/',
    plugins: [react()],
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true
    },
    resolve: {
      alias: { '@renderer': path.resolve(__dirname, 'src/renderer/src') }
    },
    server: {
      host: true, // Lắng nghe trên mọi mạng để có thể truy cập bằng IP
      port: 5173
    }
  }
})
