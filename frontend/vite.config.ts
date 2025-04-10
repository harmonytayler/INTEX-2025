import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    headers: {
      'Content-Security-Policy': 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com; " +
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com https://accounts.google.com; " +
      "img-src 'self' data: https://intexmovieposters.blob.core.windows.net https://*.blob.core.windows.net; " +
      "frame-ancestors 'none'; " +
      "font-src 'self' fonts.gstatic.com data:; " +
      "connect-src 'self' https://localhost:5001 https://intex-bougier.azurewebsites.net https://accounts.google.com https://oauth2.googleapis.com; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'; " +
      "frame-src 'self' https://accounts.google.com https://oauth2.googleapis.com;",
    },
    cors: {
      origin: 'http://localhost:3000',
      credentials: true,
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: false,
      },
    },
  },
});
