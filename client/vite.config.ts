import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/internal/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './tests/coverage',
      include: ['src/**/*']
    },
  },
});
