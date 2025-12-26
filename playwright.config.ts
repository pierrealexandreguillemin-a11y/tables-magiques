/**
 * Playwright Configuration - Tables Magiques
 * ISO/IEC 29119 - E2E Tests against localhost OR production
 */

import { defineConfig, devices } from '@playwright/test';

// URL de base : prod si NEXT_PUBLIC_APP_URL, sinon localhost
const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const isProduction = baseURL.includes('vercel.app');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    // Screenshot on failure
    screenshot: 'only-on-failure',
    // Video on retry
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  // WebServer uniquement en local (pas en CI contre prod)
  ...(isProduction
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 120000,
        },
      }),
});
