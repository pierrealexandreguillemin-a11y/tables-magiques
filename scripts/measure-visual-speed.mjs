#!/usr/bin/env node
/**
 * measure-visual-speed.mjs — how fast each route becomes visually complete on a slow device.
 *
 * Lighthouse (mobile, throttlingMethod "devtools": real network + 4x CPU throttling, so the
 * filmstrip is observed, not simulated). Speed Index catches content that stays invisible while
 * a lazy chunk loads (e.g. m.* elements waiting for the async motion feature bundle).
 * Median of --runs runs per route. Runs routes in the order given, interleaving nothing: compare
 * two builds by running them back to back on an idle machine.
 *
 * Usage (after npm run build):
 *   node scripts/measure-visual-speed.mjs [--runs 3] [--cwd ../other-checkout] [--routes /,/practice]
 */

import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { ROUTES, startNextServer } from './lib/next-server.mjs';

function parseArgs(argv) {
  const args = { runs: 3, cwd: undefined, routes: ROUTES };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--runs') args.runs = Number(argv[++i]);
    if (argv[i] === '--cwd') args.cwd = argv[++i];
    if (argv[i] === '--routes') args.routes = argv[++i].split(',');
  }
  return args;
}

const median = (values) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

async function auditOnce(url, port) {
  const { lhr } = await lighthouse(url, {
    port,
    output: 'json',
    onlyCategories: ['performance'],
    throttlingMethod: 'devtools',
    logLevel: 'error',
  });
  const value = (id) => Math.round(lhr.audits[id].numericValue);
  return {
    speedIndex: value('speed-index'),
    lcp: value('largest-contentful-paint'),
    tbt: value('total-blocking-time'),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const server = await startNextServer({ cwd: args.cwd });
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless=new'],
  });
  const results = {};
  try {
    for (const route of args.routes) {
      const runs = [];
      for (let run = 0; run < args.runs; run += 1) {
        runs.push(
          await auditOnce(new URL(route, server.base).href, chrome.port)
        );
      }
      results[route] = {
        speedIndexMs: median(runs.map((r) => r.speedIndex)),
        lcpMs: median(runs.map((r) => r.lcp)),
        tbtMs: median(runs.map((r) => r.tbt)),
      };
    }
  } finally {
    await chrome.kill();
    server.stop();
  }
  console.log(
    `Visual speed (Lighthouse mobile, devtools throttling, median of ${args.runs})`
  );
  console.table(results);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
