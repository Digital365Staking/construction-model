// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    outDir: 'dist',  // Where the build output will be placed
    rollupOptions: {
      input: './src/index.jsx',
      external: ['react-is']
    },
  },
  plugins: [react()]
});
