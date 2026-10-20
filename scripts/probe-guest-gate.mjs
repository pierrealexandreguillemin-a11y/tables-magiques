#!/usr/bin/env node
/**
 * probe-guest-gate.mjs — where the time goes before a guest sees the auth dialog on /practice.
 *
 * Throttled like Lighthouse mobile (4x CPU, 150 ms RTT, 1.6 Mbps down). Timestamps from
 * navigation start: auth API response end, dialog text present in the DOM, dialog text visible
 * (computed opacity of its dialog ancestor reaches 1), plus the LCP the browser reports.
 * Median of --runs runs.
 *
 * Usage (after npm run build): node scripts/probe-guest-gate.mjs [--runs 3] [--route /practice]
 */

import { chromium } from '@playwright/test';
import { startNextServer } from './lib/next-server.mjs';

const args = process.argv.slice(2);
const runs = Number(args[args.indexOf('--runs') + 1] || 3);
const route = args.includes('--route')
  ? args[args.indexOf('--route') + 1]
  : '/practice';
const median = (v) => [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)];

async function probeOnce(browser, url) {
  const context = await browser.newContext({
    viewport: { width: 412, height: 823 },
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.addInitScript(() => {
    const marks = {};
    window.__gateMarks = marks;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) marks.lcp = e.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    const check = () => {
      const node = [
        ...document.querySelectorAll('[role=dialog] p, [role=dialog] h2'),
      ].find((n) => n.textContent.includes('Connecte-toi'));
      if (node && marks.inDom === undefined) marks.inDom = performance.now();
      if (node) {
        let el = node.closest('[role=dialog]');
        let visible = true;
        while (el) {
          if (Number(getComputedStyle(el).opacity) < 0.99) visible = false;
          el = el.parentElement;
        }
        if (visible && marks.visible === undefined)
          marks.visible = performance.now();
      }
      if (marks.visible === undefined) requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });

  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(
    () => window.__gateMarks.visible !== undefined,
    null,
    {
      timeout: 60000,
    }
  );
  await page.waitForTimeout(500);
  const result = await page.evaluate(() => {
    const [nav] = performance.getEntriesByType('navigation');
    const me = performance
      .getEntriesByType('resource')
      .find((e) => e.name.includes('/api/auth/me'));
    return {
      htmlEnd: Math.round(nav.responseEnd),
      domInteractive: Math.round(nav.domInteractive),
      loadEvent: Math.round(nav.loadEventEnd),
      authApiStart: me ? Math.round(me.startTime) : null,
      authApiEnd: me ? Math.round(me.responseEnd) : null,
      dialogInDom: Math.round(window.__gateMarks.inDom),
      dialogVisible: Math.round(window.__gateMarks.visible),
      lcp: Math.round(window.__gateMarks.lcp ?? -1),
    };
  });
  await context.close();
  return result;
}

const server = await startNextServer();
const browser = await chromium.launch();
const all = [];
try {
  for (let i = 0; i < runs; i += 1)
    all.push(await probeOnce(browser, new URL(route, server.base).href));
} finally {
  await browser.close();
  server.stop();
}
const keys = Object.keys(all[0]);
const summary = Object.fromEntries(
  keys.map((k) => [k, median(all.map((r) => r[k] ?? -1))])
);
console.log(
  `Guest gate on ${route} (ms from navigation start, median of ${runs})`
);
console.table(summary);
