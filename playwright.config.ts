import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  use: { headless: true },
});
