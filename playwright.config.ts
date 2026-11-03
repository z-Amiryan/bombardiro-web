import { defineConfig, devices } from '@playwright/test';

// E2E_PORT lets a second checkout test its own build without reusing another checkout's server.
const PORT = Number(process.env.E2E_PORT || 4173);
const isCI = !!process.env.CI;

// Runs against the production build in dist/, served the way Vercel serves it (scripts/serve.mjs), so the
// tests see the real headers. Run `npm run build` first.
export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `node scripts/serve.mjs --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !isCI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: /screenshots\.spec\.ts/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: /screenshots\.spec\.ts/ },
    { name: 'iphone', use: { ...devices['iPhone 15'] }, testIgnore: /screenshots\.spec\.ts/ },
  ],
});
