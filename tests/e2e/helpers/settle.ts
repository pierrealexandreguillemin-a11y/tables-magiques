/**
 * Wait until the one-shot entry animations are over (fade-up, title-enter...).
 *
 * `networkidle` says nothing about CSS animations: a contrast measured during a fade-in reads a
 * half-transparent text (flaky by construction, seen on /settings 2026-10-21). Infinite
 * animations (bg-drift, clouds) never finish and are skipped.
 */

import type { Page } from '@playwright/test';

export async function waitForEntryAnimations(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined))
    )
  );
}
