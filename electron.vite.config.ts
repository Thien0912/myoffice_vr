import path from 'path'
import { defineConfig, externalizeDepsPlugin, loadEnv } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    main: {
      plugins: [externalizeDepsPlugin()]
    },
    preload: {
      plugins: [externalizeDepsPlugin()]
    },
    renderer: {
      base: command === 'serve' ? env.VITE_BASE_URL || '/' : './',
      resolve: {
        alias: {
          '@renderer': path.resolve(__dirname, 'src/renderer/src')
        }
      },
      plugins: [react()],
      optimizeDeps: {
        include: ['react-easy-crop']
      },
      server: {
        host: true
      }
    }
  }
})
