import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { defineConfig as defineTestConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: defineTestConfig({
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }),
});
