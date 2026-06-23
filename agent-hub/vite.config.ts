import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/agent-hub/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['@mlc-ai/web-llm'],
    },
  },
  optimizeDeps: {
    exclude: ['@mlc-ai/web-llm'],
  },
});
