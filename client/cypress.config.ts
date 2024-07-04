import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    supportFile: false,
    baseUrl: 'http://localhost:4000',
    downloadsFolder: 'tests/e2e/downloads',
    specPattern: 'tests/e2e/**/*.cy.ts',
    defaultCommandTimeout: 25000,
  },
});
