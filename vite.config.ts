import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/MoM-Assistant/', // must match repo name exactly
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
