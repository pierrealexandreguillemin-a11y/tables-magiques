/**
 * Auth Setup - Playwright Global Authentication
 * ISO/IEC 29119 - E2E Tests with real auth against production
 *
 * Creates test user if needed, then authenticates via UI
 */

import { test as setup, expect } from '@playwright/test';

// Dedicated E2E test user
const TEST_USER = {
  username: 'e2e_test',
  password: 'e2etest123',
};

const authFile = 'tests/e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // 1. Go to home page
  await page.goto('/');

  // 2. Try to register via API (ignore if already exists)
  await page.request.post('/api/auth/register', {
    data: {
      username: TEST_USER.username,
      password: TEST_USER.password,
      confirmPassword: TEST_USER.password,
    },
  });

  // 3. Click login button to open modal (text includes emoji)
  await page.getByRole('button', { name: /connexion.*🔐/i }).click();

  // 4. Wait for modal
  await page.waitForSelector('[role="dialog"]');

  // 5. Fill credentials
  await page.getByLabel(/pseudo/i).fill(TEST_USER.username);
  await page.getByLabel(/mot de passe/i).fill(TEST_USER.password);

  // 6. Submit
  await page.getByRole('button', { name: /se connecter/i }).click();

  // 7. Wait for auth complete - button shows username with emoji
  await expect(
    page.getByRole('button', {
      name: new RegExp(`${TEST_USER.username}.*👋`, 'i'),
    })
  ).toBeVisible({ timeout: 15000 });

  // 8. Save authentication state
  await page.context().storageState({ path: authFile });
});
