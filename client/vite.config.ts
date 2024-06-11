import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { defineConfig as defineTestConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  preview: {
    port: 4000,
    strictPort: true,
  },
  server: {
    port: 4000,
    strictPort: true,
    host: true,
    origin: 'http://0.0.0.0:4000',
  },
  test: defineTestConfig({
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }),
});
