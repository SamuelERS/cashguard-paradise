// 🤖 [IA] - v1.1.17: Playwright configuration for E2E testing in Docker
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  
  // Maximum time for the whole test suite (10 minutes)
  timeout: 600000,
  
  // Maximum time for a single test (2 minutes)
  expect: {
    timeout: 120000,
  },

  // Run tests in parallel
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for the application - will be set by docker-compose
    // 🤖 [IA] - v1.1.17: Usando puerto 5175 para E2E testing
    baseURL: process.env.APP_URL || 'http://localhost:5175',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Emulate Paradise users' typical viewport
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors for local testing
    ignoreHTTPSErrors: true,
    
    // Timeout for actions
    actionTimeout: 30000,
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Development server configuration
  // 🤖 [IA] - v3.1.0: Always start webServer in local (dev without Docker)
  // Only skip webServer in CI/Docker (where app runs separately)
  webServer: process.env.CI || process.env.DOCKER ? undefined : {
    command: 'npm run dev -- --port 5175',
    url: 'http://localhost:5175',
    reuseExistingServer: true,  // Reuse if already running
    timeout: 120000,
    cwd: '..',  // Execute from project root
  },
});