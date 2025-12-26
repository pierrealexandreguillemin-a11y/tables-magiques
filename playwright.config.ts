/**
 * Playwright Configuration - Tables Magiques
 * ISO/IEC 29119 - E2E Tests against PRODUCTION
 *
 * Projects:
 * - setup: authenticates user
 * - chromium/Mobile Safari: authenticated tests
 * - chromium-no-auth: unauthenticated tests (login modal, redirects)
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
    // Chromium authenticated - for most tests
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /auth\.spec\.ts/, // Auth tests run without auth
    },
    // Chromium unauthenticated - for auth modal tests
    {
      name: 'chromium-no-auth',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /auth\.spec\.ts/,
    },
    // Mobile Safari authenticated
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 13'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /auth\.spec\.ts/,
    },
  ],
  // PAS de webServer - on teste contre la production Vercel
});
