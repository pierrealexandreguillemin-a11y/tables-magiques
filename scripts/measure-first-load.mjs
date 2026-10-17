#!/usr/bin/env node
/**
 * measure-first-load.mjs — gzipped JS actually loaded per route on first visit.
 *
 * check-bundle-size.sh sums every chunk, so it cannot see lazy-loading gains.
 * This script loads each route in Chromium against a production server and sums
 * the gzip size (same method: zlib on the built file) of the scripts the page fetched:
 * loadKB = scripts finished before the load event (critical path), idleKB = all scripts
 * once the network is idle (includes deliberate post-render preloads).
 * --budget: fail (exit 1) when a route exceeds its loadKB or idleKB budget.
 *
 * Usage (after npm run build):
 *   node scripts/measure-first-load.mjs [--budget perf-budget.json]
 * The script starts its own `next start` on a free port and stops it, so a stale
 * server can never answer with an older build. --base <url> measures an external server instead.
 *
 * Writes reports/first-load.json.
 */

import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { ROUTES, serverFor } from './lib/next-server.mjs';
import { checkBudget } from './perf-budget.mjs';

const STATIC_PREFIX = '/_next/static/';

function parseArgs(argv) {
  const args = { base: null, budget: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--base') args.base = argv[++i];
    if (argv[i] === '--budget') args.budget = argv[++i];
  }
  return args;
}

function gzipBytesOf(url) {
  const { pathname } = new URL(url);
  const relative = pathname.slice(STATIC_PREFIX.length);
  return gzipSync(readFileSync(join('.next', 'static', relative))).length;
}

async function measureRoute(browser, base, route) {
  const page = await browser.newPage();
  await page.goto(new URL(route, base).href, { waitUntil: 'load' });
  await page.waitForLoadState('networkidle');
  const entries = await page.evaluate((prefix) => {
    const [nav] = performance.getEntriesByType('navigation');
    return performance
      .getEntriesByType('resource')
      .filter((e) => new URL(e.name).pathname.startsWith(prefix))
      .filter((e) => e.name.endsWith('.js'))
      .map((e) => ({
        url: e.name,
        beforeLoad: e.responseEnd <= nav.loadEventStart,
      }));
  }, STATIC_PREFIX);
  await page.close();
  const unique = [...new Map(entries.map((e) => [e.url, e])).values()];
  const sumKB = (list) =>
    Math.round(list.reduce((sum, e) => sum + gzipBytesOf(e.url), 0) / 1024);
  return {
    scripts: unique.length,
    loadKB: sumKB(unique.filter((e) => e.beforeLoad)),
    idleKB: sumKB(unique),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const server = await serverFor(args.base);
  const { base } = server;
  const browser = await chromium.launch();
  const routes = {};
  try {
    for (const route of ROUTES) {
      routes[route] = await measureRoute(browser, base, route);
    }
  } finally {
    await browser.close();
    server.stop();
  }

  const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'])
    .toString()
    .trim();
  const report = { date: new Date().toISOString(), commit, routes };
  mkdirSync('reports', { recursive: true });
  writeFileSync(
    'reports/first-load.json',
    `${JSON.stringify(report, null, 2)}\n`
  );

  console.log(`First-load JS (gzip) — commit ${commit}`);
  console.table(routes);

  if (!args.budget) return;
  const budget = JSON.parse(readFileSync(args.budget, 'utf8')).routes;
  const failures = checkBudget(routes, budget);
  for (const failure of failures) console.error(`❌ ${failure}`);
  if (failures.length > 0) process.exit(1);
  console.log(`✅ within ${args.budget}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
