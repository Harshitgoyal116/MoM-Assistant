import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This allows process.env.API_KEY to work in your code
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  // This MUST match your repository name on GitHub
  base: '/MoM-Assistant/', 
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});