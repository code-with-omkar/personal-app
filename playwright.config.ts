import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const PORT = Number(process.env['E2E_PORT'] ?? 4300);
// Use the image's shared Chromium when present (matches the pinned Playwright build).
const executablePath =
  process.env['CHROMIUM_PATH'] ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'off',
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, hasTouch: true } },
  ],
  webServer: {
    // Tests run against the production SSG output, not the dev server.
    command: `npm run build && node e2e/serve-static.mjs dist/personal-app/browser ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
});
