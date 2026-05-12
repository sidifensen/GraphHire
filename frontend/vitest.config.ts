import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      'react-router-dom': path.resolve(__dirname, 'src/shims/react-router-dom.tsx'),
      'motion/react': 'framer-motion',
    },
  },
  test: {
    environment: 'jsdom',
    // Keep a single test root under frontend/tests to avoid split ownership.
    globals: true,
    setupFiles: ['tests/setup.tsx'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
