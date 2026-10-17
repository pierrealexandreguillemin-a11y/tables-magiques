/**
 * Playwright Local Configuration - Tables Magiques
 *
 * Visual regression against a LOCAL production build, to prove that a
 * HOW-only change (bundling, lazy-loading) leaves the pixels unchanged.
 * The default config (playwright.config.ts) keeps targeting production.
 *
 * Usage:
 *   git stash && npm run build && npm run test:e2e:local:update   # reference = before
 *   git stash pop && npm run build && npm run test:e2e:local       # compare = after
 *
 * Snapshots live in tests/e2e/__local_snapshots__/ (gitignored: machine-specific).
 */

import { defineConfig, devices } from '@playwright/test';

const PORT = 3101;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /visual-regression\.spec\.ts/,
  snapshotPathTemplate: '{testDir}/__local_snapshots__/{arg}{ext}',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  timeout: 60000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: `node node_modules/next/dist/bin/next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120000,
  },
});
