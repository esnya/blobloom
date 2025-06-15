import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteExpress from './src/viteExpress';

export default defineConfig({
  plugins: [react(), viteExpress()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
