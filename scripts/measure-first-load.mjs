#!/usr/bin/env node
/**
 * measure-first-load.mjs — gzipped JS actually loaded per route on first visit.
 *
 * check-bundle-size.sh sums every chunk, so it cannot see lazy-loading gains.
 * This script loads each route in Chromium against a production server and sums
 * the gzip size (same method: zlib on the built file) of the scripts the page fetched:
 * loadKB = scripts finished before the load event (critical path), idleKB = all scripts
 * once the network is idle (includes deliberate post-render preloads).
 * --max thresholds apply to loadKB.
 *
 * Usage (after npm run build):
 *   node scripts/measure-first-load.mjs [--max /=300 --max /practice=320]
 * The script starts its own `next start` on a free port and stops it, so a stale
 * server can never answer with an older build. --base <url> measures an external server instead.
 *
 * Writes reports/first-load.json. Exit 1 if a --max threshold is exceeded.
 */

import { chromium } from '@playwright/test';
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { gzipSync } from 'node:zlib';

const ROUTES = ['/', '/practice', '/challenge', '/profile', '/settings'];
const STATIC_PREFIX = '/_next/static/';

function parseArgs(argv) {
  const args = { base: null, max: {} };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--base') args.base = argv[++i];
    if (argv[i] === '--max') {
      const [route, kb] = argv[++i].split('=');
      args.max[route] = Number(kb);
    }
  }
  return args;
}

function gzipBytesOf(url) {
  const { pathname } = new URL(url);
  const relative = pathname.slice(STATIC_PREFIX.length);
  return gzipSync(readFileSync(join('.next', 'static', relative))).length;
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function startServer() {
  const port = await freePort();
  const child = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'start', '-p', String(port)],
    { stdio: 'ignore' }
  );
  const base = `http://localhost:${port}`;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(base);
      if (response.ok) return { base, stop: () => child.kill() };
    } catch {
      // server not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  child.kill();
  throw new Error(`next start did not answer on ${base} within 60 s`);
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
      .map((e) => ({ url: e.name, beforeLoad: e.responseEnd <= nav.loadEventStart }));
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
  const server = args.base ? { base: args.base, stop: () => {} } : await startServer();
  const { base } = server;
  const { max } = args;
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

  const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD']).toString().trim();
  const report = { date: new Date().toISOString(), commit, routes };
  mkdirSync('reports', { recursive: true });
  writeFileSync('reports/first-load.json', `${JSON.stringify(report, null, 2)}\n`);

  console.log(`First-load JS (gzip) — commit ${commit}`);
  console.table(routes);

  const failures = Object.entries(max).filter(
    ([route, kb]) => routes[route] && routes[route].loadKB > kb
  );
  for (const [route, kb] of failures) {
    console.error(`❌ ${route}: ${routes[route].loadKB} KB > ${kb} KB`);
  }
  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
