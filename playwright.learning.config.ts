import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import path from 'node:path';

const chromiumExecutable = path.join(
  process.env.LOCALAPPDATA ?? '',
  'ms-playwright',
  'chromium-1243',
  'chrome-win64',
  'chrome.exe',
);

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://127.0.0.1:5174',
    ...(existsSync(chromiumExecutable) ? { launchOptions: { executablePath: chromiumExecutable } } : {}),
  },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5174 --strictPort',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: true,
    env: { LOCAL_PREVIEW: '1' },
  },
});
