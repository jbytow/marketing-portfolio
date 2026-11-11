import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // Absolute base: a relative base once produced /assets/assets/* URLs on nested SPA routes
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    // Maps are still emitted for local debugging, but bundles carry no sourceMappingURL
    sourcemap: 'hidden',
    // Vendor code changes far less often than app code; separate chunks keep their hashes, and the
    // browser cache, stable across content deploys
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          i18n: ['i18next', 'react-i18next'],
          data: ['@tanstack/react-query', 'axios'],
        },
      },
    },
    // Budget below Vite's 500 kB default so chunk growth shows up early; the largest chunk is the lazy
    // TipTap/ProseMirror renderer (about 320 kB), every other chunk stays far below
    chunkSizeWarningLimit: 350,
  },
});
