// 🤖 [IA] - v3.1.0: Playwright smoke config - fast, single browser, critical flows
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',

  // Smoke tests should be fast (5 minutes max)
  timeout: 300000,

  // Single test timeout (1 minute)
  expect: {
    timeout: 60000,
  },

  // Run tests in parallel
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,  // No retries in smoke - fails should be visible
  workers: 2,  // Limit workers for faster completion

  // Reporter configuration (simpler for smoke)
  reporter: [
    ['list'],
  ],

  // Shared settings
  use: {
    baseURL: process.env.APP_URL || 'http://localhost:5175',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    actionTimeout: 30000,
  },

  // ONLY chromium for smoke tests (fast)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Development server configuration
  webServer: process.env.CI || process.env.DOCKER ? undefined : {
    command: 'npm run dev -- --port 5175',
    url: 'http://localhost:5175',
    reuseExistingServer: true,
    timeout: 120000,
    cwd: '..',
  },
});
