/**
 * perf-budget.mjs — compare measured first-load JS against perf-budget.json.
 *
 * Budget = measured value + 5 % on the day it was set (docs/perf/first-load-history.md).
 * Thresholds only go down with a new measurement, never up to make a build pass.
 */

/**
 * @param {Record<string, { loadKB: number, idleKB: number }>} routes measured values
 * @param {Record<string, { loadKB: number, idleKB: number }>} budget max values per route
 * @returns {string[]} one message per exceeded or unmeasured budget entry (empty = pass)
 */
export function checkBudget(routes, budget) {
  return Object.entries(budget).flatMap(([route, limits]) => {
    const measured = routes[route];
    if (!measured) return [`${route}: not measured`];
    return ['loadKB', 'idleKB']
      .filter((metric) => measured[metric] > limits[metric])
      .map(
        (metric) =>
          `${route}: ${metric} ${measured[metric]} KB > budget ${limits[metric]} KB`
      );
  });
}
