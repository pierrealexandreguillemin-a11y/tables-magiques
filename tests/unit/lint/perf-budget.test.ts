/**
 * Calibration of the per-route JS budget gate (scripts/perf-budget.mjs):
 * red on the known-bad 2026-10-17 baseline (barrels shipped Lottie and tsParticles
 * before load) and on the pre-P22 state, green on the measured state the budget was set from.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkBudget } from '@/scripts/perf-budget.mjs';

const budget = JSON.parse(readFileSync('perf-budget.json', 'utf8')).routes;

// docs/perf/first-load-history.md, row "baseline (d800217)"
const KNOWN_BAD = {
  '/': { loadKB: 432, idleKB: 467 },
  '/practice': { loadKB: 431, idleKB: 453 },
  '/challenge': { loadKB: 431, idleKB: 453 },
  '/profile': { loadKB: 432, idleKB: 467 },
  '/settings': { loadKB: 416, idleKB: 446 },
};

// docs/perf/first-load-history.md, row "motion 14" (state before P22, 2026-10-17)
const PRE_P22 = {
  '/': { loadKB: 264, idleKB: 473 },
  '/practice': { loadKB: 352, idleKB: 445 },
  '/challenge': { loadKB: 352, idleKB: 443 },
  '/profile': { loadKB: 264, idleKB: 473 },
  '/settings': { loadKB: 195, idleKB: 314 },
};

// docs/perf/first-load-history.md, row "P22", re-measured on master 142333c (2026-10-20):
// the row the budget was set from
const MEASURED = {
  '/': { loadKB: 226, idleKB: 435 },
  '/practice': { loadKB: 352, idleKB: 415 },
  '/challenge': { loadKB: 352, idleKB: 409 },
  '/profile': { loadKB: 226, idleKB: 435 },
  '/settings': { loadKB: 195, idleKB: 276 },
};

describe('per-route JS budget', () => {
  it('fails on the known-bad baseline', () => {
    const failures = checkBudget(KNOWN_BAD, budget);
    expect(failures).toContain('/: loadKB 432 KB > budget 238 KB');
    expect(failures.length).toBeGreaterThanOrEqual(5);
  });

  it('fails when tsParticles weight comes back (pre-P22 state)', () => {
    expect(checkBudget(PRE_P22, budget)).toContain(
      '/: loadKB 264 KB > budget 238 KB'
    );
  });

  it('passes on the state the budget was measured from', () => {
    expect(checkBudget(MEASURED, budget)).toEqual([]);
  });

  it('fails when a budgeted route was not measured', () => {
    expect(checkBudget({}, { '/': { loadKB: 1, idleKB: 1 } })).toEqual([
      '/: not measured',
    ]);
  });
});
