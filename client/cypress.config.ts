import { defineConfig } from 'cypress';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  e2e: {
    supportFile: false,
    baseUrl: 'http://localhost:4000',
    downloadsFolder: 'tests/e2e/downloads',
    specPattern: 'tests/e2e/**/*.cy.ts',
    screenshotsFolder: 'tests/e2e/screenshots',
    defaultCommandTimeout: 25000,
    setupNodeEvents(on, config) {
      on('task', {
        clearDownloads() {
          const downloadsFolder = config.downloadsFolder;
          const files = ['articles.json', 'articles.csv', 'articles.parquet'];

          files.forEach(file => {
            const filePath = path.join(downloadsFolder, file);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          });

          return null;
        },
      });
    },
  },
});
