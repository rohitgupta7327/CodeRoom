import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Increase warning limit threshold to 2000 kB (2 MB) to prevent warnings for large SDK chunks
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Manual code-splitting: separates large node_modules into distinct bundles.
        // Improves caching efficiency so users don't re-download heavy libraries on minor app code updates.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@monaco-editor')) {
              return 'monaco-editor';
            }
            if (id.includes('@stream-io') || id.includes('stream-chat')) {
              return 'stream-sdk';
            }
            if (id.includes('@clerk')) {
              return 'clerk-auth';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('@tanstack') || id.includes('react-query')) {
              return 'tanstack-query';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})
