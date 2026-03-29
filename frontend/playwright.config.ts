import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for end-to-end tests.
 *
 * Run: npx playwright test
 * Report: npx playwright show-report
 */
export default defineConfig({
  // Directory that contains all E2E spec files
  testDir: './e2e',

  // Global timeout for each test
  timeout: 30_000,

  // Retry failed tests once on CI to reduce flakiness from network timing
  retries: process.env.CI ? 1 : 0,

  // Run tests in parallel (each file in its own worker)
  fullyParallel: true,

  // Fail the build on CI if any test.only is accidentally left in source
  forbidOnly: !!process.env.CI,

  // Reporter — use "list" locally, "github" + "html" on CI
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'on-failure' }]],

  // Shared settings for all tests in this project
  use: {
    // Base URL for page.goto('/') calls
    baseURL: 'http://localhost:3000',

    // Capture a screenshot on test failure for debugging
    screenshot: 'only-on-failure',

    // Record a trace on first retry for CI debugging
    trace: 'on-first-retry',
  },

  // Test only against Chromium for speed (add Firefox/Safari if needed later)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start the Next.js dev server automatically before running tests.
  // Remove this block if you prefer to start the server manually.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
