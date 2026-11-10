import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /runner-security\.spec\.ts$/,
  use: { baseURL: 'http://127.0.0.1:5184', channel: 'chrome' },
});
