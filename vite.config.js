// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    open: true,
    // Configure server to return index.html for unknown routes
    hmr: true,
  },
  plugins: [react()]
});
