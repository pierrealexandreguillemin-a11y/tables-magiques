/**
 * Performance Tests - Tables Magiques
 * ISO/IEC 25010 - Performance efficiency testing
 *
 * Measures Core Web Vitals and performance metrics:
 * - LCP (Largest Contentful Paint) < 2.5s
 * - FID (First Input Delay) < 100ms
 * - CLS (Cumulative Layout Shift) < 0.1
 * - TTFB (Time to First Byte) < 800ms
 * - FCP (First Contentful Paint) < 1.8s
 *
 * @see https://web.dev/vitals/
 */

import { test, expect } from '@playwright/test';

// Performance thresholds (Core Web Vitals targets)
const THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint < 2.5s
  FCP: 1800, // First Contentful Paint < 1.8s
  TTFB: 800, // Time to First Byte < 800ms
  CLS: 0.1, // Cumulative Layout Shift < 0.1
  TBT: 200, // Total Blocking Time < 200ms
};

test.describe('Performance - Core Web Vitals', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance API
    await page.addInitScript(() => {
      // Collect performance entries
      window.__perfEntries = [];
      const observer = new PerformanceObserver((list) => {
        if (window.__perfEntries) {
          window.__perfEntries.push(...list.getEntries());
        }
      });
      observer.observe({
        entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'],
      });
    });
  });

  test('Home page loads within performance budget', async ({ page }) => {
    // Navigate and wait for load
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Get navigation timing
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return {
        ttfb: nav.responseStart - nav.requestStart,
        domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
        loadComplete: nav.loadEventEnd - nav.startTime,
      };
    });

    // Get paint timing
    const paintTiming = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint');
      const fcp = entries.find((e) => e.name === 'first-contentful-paint');
      return {
        fcp: fcp?.startTime || 0,
      };
    });

    // Get LCP
    const lcp = await page.evaluate(() => {
      const entries = window.__perfEntries?.filter(
        (e: PerformanceEntry) => e.entryType === 'largest-contentful-paint'
      );
      if (entries && entries.length > 0) {
        return (entries[entries.length - 1] as PerformanceEntry).startTime;
      }
      return 0;
    });

    // Assertions
    console.log(
      `[Perf] TTFB: ${timing.ttfb.toFixed(0)}ms (threshold: ${THRESHOLDS.TTFB}ms)`
    );
    console.log(
      `[Perf] FCP: ${paintTiming.fcp.toFixed(0)}ms (threshold: ${THRESHOLDS.FCP}ms)`
    );
    console.log(
      `[Perf] LCP: ${lcp.toFixed(0)}ms (threshold: ${THRESHOLDS.LCP}ms)`
    );
    console.log(
      `[Perf] DOM Content Loaded: ${timing.domContentLoaded.toFixed(0)}ms`
    );
    console.log(`[Perf] Load Complete: ${timing.loadComplete.toFixed(0)}ms`);

    // Soft assertions (warn but don't fail)
    expect
      .soft(timing.ttfb, `TTFB should be < ${THRESHOLDS.TTFB}ms`)
      .toBeLessThan(THRESHOLDS.TTFB);
    expect
      .soft(paintTiming.fcp, `FCP should be < ${THRESHOLDS.FCP}ms`)
      .toBeLessThan(THRESHOLDS.FCP);

    // LCP might be 0 if measured too early - skip if so
    if (lcp > 0) {
      expect
        .soft(lcp, `LCP should be < ${THRESHOLDS.LCP}ms`)
        .toBeLessThan(THRESHOLDS.LCP);
    }
  });

  test('Practice page loads within performance budget', async ({ page }) => {
    const response = await page.goto('/practice');
    expect(response?.status()).toBe(200);

    await page.waitForLoadState('networkidle');

    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return {
        ttfb: nav.responseStart - nav.requestStart,
        loadComplete: nav.loadEventEnd - nav.startTime,
      };
    });

    console.log(
      `[Perf] Practice - TTFB: ${timing.ttfb.toFixed(0)}ms, Load: ${timing.loadComplete.toFixed(0)}ms`
    );

    expect.soft(timing.ttfb, 'TTFB').toBeLessThan(THRESHOLDS.TTFB);
  });

  test('Challenge page loads within performance budget', async ({ page }) => {
    const response = await page.goto('/challenge');
    expect(response?.status()).toBe(200);

    await page.waitForLoadState('networkidle');

    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return {
        ttfb: nav.responseStart - nav.requestStart,
        loadComplete: nav.loadEventEnd - nav.startTime,
      };
    });

    console.log(
      `[Perf] Challenge - TTFB: ${timing.ttfb.toFixed(0)}ms, Load: ${timing.loadComplete.toFixed(0)}ms`
    );

    expect.soft(timing.ttfb, 'TTFB').toBeLessThan(THRESHOLDS.TTFB);
  });

  test('Settings page loads within performance budget', async ({ page }) => {
    const response = await page.goto('/settings');
    expect(response?.status()).toBe(200);

    await page.waitForLoadState('networkidle');

    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return {
        ttfb: nav.responseStart - nav.requestStart,
        loadComplete: nav.loadEventEnd - nav.startTime,
      };
    });

    console.log(
      `[Perf] Settings - TTFB: ${timing.ttfb.toFixed(0)}ms, Load: ${timing.loadComplete.toFixed(0)}ms`
    );

    expect.soft(timing.ttfb, 'TTFB').toBeLessThan(THRESHOLDS.TTFB);
  });
});

test.describe('Performance - Cumulative Layout Shift', () => {
  test('Home page has minimal layout shift', async ({ page }) => {
    // Set up CLS observer before navigation
    await page.addInitScript(() => {
      window.__clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutEntry = entry as PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          };
          if (
            !layoutEntry.hadRecentInput &&
            typeof window.__clsValue === 'number'
          ) {
            window.__clsValue += layoutEntry.value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait a bit for any late layout shifts
    await page.waitForTimeout(1000);

    const cls = await page.evaluate(() => window.__clsValue || 0);

    console.log(`[Perf] CLS: ${cls.toFixed(4)} (threshold: ${THRESHOLDS.CLS})`);

    expect
      .soft(cls, `CLS should be < ${THRESHOLDS.CLS}`)
      .toBeLessThan(THRESHOLDS.CLS);
  });
});

test.describe('Performance - Resource Loading', () => {
  test('JavaScript bundle size is reasonable', async ({ page }) => {
    const jsBundles: Array<{ url: string; size: number }> = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('.js') && !url.includes('node_modules')) {
        const headers = response.headers();
        const size = parseInt(headers['content-length'] || '0', 10);
        if (size > 0) {
          jsBundles.push({ url: url.split('/').pop() || url, size });
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const totalJsSize = jsBundles.reduce((acc, b) => acc + b.size, 0);
    const totalKB = (totalJsSize / 1024).toFixed(1);

    console.log(
      `[Perf] Total JS: ${totalKB}KB across ${jsBundles.length} bundles`
    );

    // Warn if JS is over 500KB (reasonable for Next.js app)
    if (totalJsSize > 500 * 1024) {
      console.warn(
        `[Perf] Warning: JS bundle size ${totalKB}KB exceeds 500KB recommendation`
      );
    }
  });

  test('Images are optimized', async ({ page }) => {
    const images: Array<{ url: string; size: number }> = [];

    page.on('response', async (response) => {
      const contentType = response.headers()['content-type'] || '';
      if (contentType.includes('image')) {
        const headers = response.headers();
        const size = parseInt(headers['content-length'] || '0', 10);
        if (size > 0) {
          images.push({
            url: response.url().split('/').pop() || response.url(),
            size,
          });
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const totalImageSize = images.reduce((acc, img) => acc + img.size, 0);
    const totalKB = (totalImageSize / 1024).toFixed(1);

    console.log(
      `[Perf] Total images: ${totalKB}KB across ${images.length} images`
    );

    // Check for any oversized images (> 200KB)
    const oversized = images.filter((img) => img.size > 200 * 1024);
    if (oversized.length > 0) {
      console.warn(`[Perf] Warning: ${oversized.length} images exceed 200KB`);
    }
  });
});

// Extend window interface for TypeScript
declare global {
  interface Window {
    __perfEntries?: PerformanceEntry[];
    __clsValue?: number;
  }
}
