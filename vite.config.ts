import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://91.227.18.176/just4sport',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})