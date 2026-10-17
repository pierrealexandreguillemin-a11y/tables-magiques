# First-load JS history

Gzipped JS per route, measured on a local production build (Chromium, cold cache).

- `loadKB` — scripts finished before the `load` event (critical path).
- `idleKB` — every script once the network is idle (includes deliberate post-render preloads).
- `total` — sum of every emitted chunk, `bash scripts/check-bundle-size.sh` (informative since
  2026-10-17; the CI gate is the per-route budget `perf-budget.json`, measured value + 5 %).

Reproduce: `npm run build && npm run quality:first-load` (checks `perf-budget.json`) (the script starts and stops its own
`next start`; a stale server cannot answer with an older build) and `npm run quality:bundle-size`.
Duplicated modules across chunks: `node` script in the 2026-10-17 entry below.

| Date       | Change                                                   | `/` load / idle | `/practice` | `/challenge` | `/profile` | `/settings` | total |
| ---------- | -------------------------------------------------------- | --------------- | ----------- | ------------ | ---------- | ----------- | ----- |
| 2026-10-17 | baseline (`d800217`, Next 16.4.2, React 19.3.1)          | 432 / 467       | 431 / 453   | 431 / 453    | 432 / 467  | 416 / 446   | 524   |
| 2026-10-17 | direct imports, barrels removed                          | 288 / 459       | 370 / 431   | 370 / 429    | 288 / 459  | 218 / 305   | 547   |
| 2026-10-17 | motion 14, `m.*`, async strict LazyMotion (domMax)       | 264 / 473       | 352 / 445   | 352 / 443    | 264 / 473  | 195 / 314   | 561   |
| 2026-10-17 | tsParticles -> canvas star field + canvas-confetti (P22) | 226 / 435       | 352 / 415   | 352 / 409    | 226 / 435  | 195 / 276   | 548   |

## 2026-10-17 — why the barrels cost 144 KB on the home page

`components/effects/index.ts` and `lib/animations/index.ts` re-exported every effect, including
Lottie (~115 KB gz chunk), tsParticles (~38 KB) and react-kawaii. Without a `sideEffects`
declaration the bundler cannot prove that unused re-exports are side-effect free, so importing
one name from a barrel shipped all of them before `load`.

Two fixes were measured:

| Fix                                        | `/` load | `/` idle | total          | duplicated modules |
| ------------------------------------------ | -------- | -------- | -------------- | ------------------ |
| none (baseline)                            | 432      | 467      | 524            | 24 / 392           |
| `"sideEffects": ["*.css"]` in package.json | 285      | 481      | 569 (gate red) | 65 / 371           |
| direct imports, barrels deleted (kept)     | 288      | 459      | 547            | 55 / 386           |

The direct-import fix was kept: same critical-path gain, lower idle on every route, gate green.
The total grows because Turbopack now splits per route and copies small shared modules into
several chunks; a single visit never downloads those copies twice, which `idleKB` shows.

Visual proof of a HOW-only change: `npm run test:e2e:local:update` on the new build, then the
pre-change sources rebuilt and `npm run test:e2e:local` → 7/7 screenshots match
(`maxDiffPixelRatio: 0.01`, the threshold of `tests/e2e/visual-regression.spec.ts`).

Duplicated-module count (Turbopack chunk format, module id followed by a factory):

```bash
node -e "const fs=require('fs');const d='.next/static/chunks';const seen=new Map();for(const f of fs.readdirSync(d).filter(f=>f.endsWith('.js'))){const s=fs.readFileSync(d+'/'+f,'utf8');const re=/[,\[](\d{2,7}),(?=\(?[\w\$,]*\)?=>|function)/g;let m;while((m=re.exec(s))){if(!seen.has(m[1]))seen.set(m[1],new Set());seen.get(m[1]).add(f)}}console.log('modules',seen.size,'duplicated',[...seen.values()].filter(s=>s.size>1).length)"
```

## 2026-10-17 — motion 14 with `m.*`: the total gate stopped making sense

`LazyMotion` was already in `app/providers.tsx`, but every component rendered `motion.*`, which
carries all features. After the migration to `m.*` with the feature bundle loaded asynchronously:
home before `load` 288 → 264 KB, settings 218 → 195, practice/challenge 370 → 352. Screenshots
unchanged (`npm run test:e2e:local`, 7/7).

| Feature bundle (async)               | `/` load / idle | total |
| ------------------------------------ | --------------- | ----- |
| `domMax` (kept: Toast uses `layout`) | 264 / 473       | 561   |
| `domAnimation` (measured, not kept)  | 263 / 459       | 547   |

`domAnimation` would save 14 KB at idle on every route, but it lacks layout animations: toasts
would jump into place instead of sliding when one is dismissed (visual downgrade, rejected).
With `domMax` the sum of all chunks reaches 561 KB, over the 560 KB threshold, although no
route loads more JS than before at load time. The sum grows with every code split, so it fights
the very optimisation this refonte is made of. **Decision (user, 2026-10-17): the CI gate becomes
the per-route budget** (`perf-budget.json`, measured value + 5 %, calibrated by
`tests/unit/lint/perf-budget.test.ts`: red on the 432 KB baseline, green on this row); the total
stays reported, non-blocking.

## 2026-10-17 — slow device: does async motion leave content invisible?

Risk: with `LazyMotion` features loaded after hydration, `m.*` elements stay at their `initial`
state (often `opacity: 0`) until the chunk arrives. Measured with Lighthouse 13.5.0, mobile,
`throttlingMethod: devtools` (real throttling, observed filmstrip):
`MSYS_NO_PATHCONV=1 node scripts/measure-visual-speed.mjs --runs 2 --routes /,/practice,/challenge [--cwd ../wt-before]`,
before = `6c5c1a6` (framer-motion), after = `c26b542` (motion `m.*`), runs interleaved
before/after/before/after, medians of 2 (ms):

| Route        | Speed Index before | after       | LCP before  | after       |
| ------------ | ------------------ | ----------- | ----------- | ----------- |
| `/`          | 6268 / 6493        | 6526 / 6119 | 2488 / 2505 | 2497 / 2346 |
| `/practice`  | 5136 / 4786        | 5126 / 4807 | 7374 / 6832 | 7134 / 6577 |
| `/challenge` | 5503 / 5519        | 5466 / 5392 | 6651 / 6938 | 6560 / 6427 |

No measurable regression: differences stay inside run-to-run spread (a Blender render shared the
CPU). Side finding to work on: **LCP 6.4-7.4 s on practice/challenge** on a throttled mobile.

## 2026-10-17 — P22: tsParticles removed

Home before `load` 264 -> 226 KB (`FairyBackground` imported tsParticles eagerly), idle -38 KB on
home, -30 to -38 KB on the other routes. Main-thread cost of the effects and the visual parity
method: `docs/spikes/particles-parity-2026-10/README.md`.

## 2026-10-17 — LCP diagnosis on a throttled mobile (findings only, no change yet)

Lighthouse 13.5.0, mobile, devtools throttling, branch `refonte/p22-particles` build, one run per
route (reports kept outside the repo). Audits read: `lcp-breakdown-insight`,
`mainthread-work-breakdown`, `bootup-time`, `long-tasks`.

| Route       | LCP     | LCP element                                                            | Breakdown                        |
| ----------- | ------- | ---------------------------------------------------------------------- | -------------------------------- |
| `/practice` | 7018 ms | `AuthGate` dialog text "Connecte-toi pour sauvegarder tes scores ! 🦄" | TTFB 20 ms, render delay 6998 ms |
| `/`         | 2174 ms | the 🦄 logo emoji (`data-tour="logo"`, CSS drop-shadow)                | TTFB 8 ms, render delay 2165 ms  |

Main thread, `/`: Other 5066 ms, Style & Layout 3499 ms, Script Evaluation 1569 ms, Rendering
1188 ms (4x CPU throttling). `/practice`: Other 2343, Script Evaluation 1995, Rendering 1152,
Style & Layout 1036. Long tasks on `/practice` include the Lottie chunk (279 ms) although the
guest only sees the auth dialog.

Reading (hypotheses to verify, not conclusions):

1. `/practice` for a guest: the largest element is a client-only dialog that waits for hydration,
   the session check and its motion entry animation. Candidates: render the guest gate on the
   server, or make the gate text visible without waiting for the animation feature bundle.
2. `/`: 3.5 s of style and layout under throttling points at CSS cost (four clouds with
   `filter: blur(50-80px)` animated, drop-shadows, `bg-drift`). To profile with a performance
   trace before touching anything; the rule "optimise HOW, never WHAT" applies.
3. Lottie loads on `/practice` for guests who never see it: deferrable until the game starts.
