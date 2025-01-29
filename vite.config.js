// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  server: {
    open: true,
    // Configure server to return index.html for unknown routes
    hmr: true,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/pdfjs-dist/build/pdf.worker.min.js",
          dest: "", // Root of the output directory
        },
      ],
    }),
    react()
  ]
});
