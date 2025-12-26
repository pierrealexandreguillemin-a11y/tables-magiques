/**
 * Playwright Configuration - Tables Magiques
 * ISO/IEC 29119 - E2E Tests against PRODUCTION
 *
 * IMPORTANT: Tests run against Vercel production with authentication
 */

import { defineConfig, devices } from '@playwright/test';

// URL de production Vercel - TOUJOURS tester contre la prod
const baseURL = 'https://tables-magiques.vercel.app';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  reporter: [['html'], ['list']],
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    // Setup project - runs first to authenticate
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // Chromium tests - depend on setup for auth
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    // Mobile Safari tests - depend on setup for auth
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 13'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
  // PAS de webServer - on teste contre la production Vercel
});
