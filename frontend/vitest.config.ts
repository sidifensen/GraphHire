import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import next from '@next/vite-plugin-next'

export default defineConfig({
  plugins: [
    next(),
    react(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
