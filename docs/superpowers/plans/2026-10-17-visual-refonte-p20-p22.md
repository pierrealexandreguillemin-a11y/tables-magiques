# Visual refonte 2026 — P20 → P22 + style track — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the parts of the 2026 visual refonte that do not depend on the 3D style decision (P20 CSS native, P21 motion slimming, P22 tsParticles removal), with measured gains, while a parallel track settles the 3D style by forced-choice human verdict.

**Architecture:** Measure first (per-route first-load JS + local visual snapshots), then change HOW things render before WHAT renders: `motion.*` → `m.*` under an async `LazyMotion strict` (pure HOW, pixel-identical), then CSS-native replacements (View Transitions, `@starting-style`), then particle engine replacement behind a visual-parity checkpoint. The style track produces real renders served in the user's Chrome, never stand-ins.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind v4, `motion` 14 (`motion/react`, `motion/react-m`), Playwright, Vitest, Blender 5.2 headless, optionally three.js 0.186.x (user-approved lever, 2026-10-17).

**Spec:** `docs/VISUAL_REFONTE_2026_SPEC.md`

## Status (updated 2026-10-17, evening)

Done:

- Task 1 (spec v1.1), Task 2 (latest stables, per-route measurement), plus the barrels finding
  (home 432 -> 288 KB before load).
- Task 3 (motion 14, `m.*`, async strict LazyMotion with domMax): home 288 -> 264 KB. CI gate =
  per-route budget `perf-budget.json` (user decision). Slow-device check (Lighthouse, real
  throttling): no measurable regression (`docs/perf/first-load-history.md`).
- npm audit: production 0 vulnerabilities; dev residuals documented (braces, no patched release).
- Task 6: mascot verdict = candidate 1, procedural chibi unicorn; A2 iteration committed and shown
  on the board (`docs/spikes/style-2026-10/board.html`).
- Task 5 (P22) **implemented on branch `refonte/p22-particles`, not merged**: home 264 -> 226 KB
  before load, idle -30 to -38 KB per route, main thread -25 to -35 %. Waiting for the user's blind
  parity verdict (`docs/spikes/particles-parity-2026-10/`).

Waiting on the user:

1. P22 parity, **round 2** (harness on `http://127.0.0.1:8766/index.html`). Round 1 (the user's
   daughter): canvas lost 3 of 4, "less colour". Fixed: per-star opacity speed (real parity gap
   with tsParticles), even colour spread; see `docs/spikes/particles-parity-2026-10/VERDICT.md`.
2. Mascot **A3 vs A2** (board on `http://127.0.0.1:8765/board.html`). A2 approved; A3 = hair-like
   mane as requested. Still open: contrast (product call: darker backdrop or less white body).

Next, in order:

1. Merge P22 after the verdict; lower `perf-budget.json` to the new measurement + 5 %.
2. **LCP 6.4-7.4 s on /practice and /challenge**: diagnosed (`docs/perf/first-load-history.md`,
   last section): the LCP is the guest auth dialog (render delay 7.0 s); home spends 3.5 s in
   style and layout. Next: performance trace, then a measured fix proposal shown to the user.
3. Task 4 (P20, CSS native): checkpoint list of one-shot `m.*` entries -> `@starting-style`;
   View Transitions prototype on one route, shown to the user.
4. P23 once A2 is approved: rig + poses (idle, success, encouragement, celebration), delivery mode
   decided by measurement (pre-rendered video/AVIF vs three.js GLB), then retire Lottie (-78 KB JS,
   -868 KB `unicorn.json`).
5. Push: nothing pushed yet; the new CI step (Chromium + per-route budget) has never run on GitHub.

## Global Constraints

- Never degrade visuals for perf without asking: optimize HOW, not WHAT (CLAUDE.md rule + memory `no_visual_downgrade`).
- Every animated component supports `prefers-reduced-motion`.
- Easings come from `styles/tokens.css` (`var(--ease-spring)`, `var(--ease-smooth)`); never hardcode `cubic-bezier`.
- Animation colors come from `lib/animations/colors.ts`.
- A red gate means fix the code; thresholds only go down with a measurement.
- Every number written in a doc carries the command that reproduces it.
- Latest stable versions, pinned (`npm view <pkg> version` on the day): `next@16.4.2`, `eslint-config-next@16.4.2`, `react@19.3.1`, `react-dom@19.3.1`, `motion@14.3.0` (2026-10-17).
- Conventional atomic commits; never push without explicit request.
- E2E config targets production by default (`playwright.config.ts` baseURL); local runs go through an env override, never by editing the default.

## Review Focus

1. **Hydration before features load** — with async `LazyMotion`, `m.*` elements render their `initial` state until features arrive; an element whose `initial` is `opacity: 0` must still become visible (no stuck-invisible UI if the chunk is slow). Test: Playwright throttled-network check that the home title reaches opacity 1.
2. **Reduced motion** — `prefers-reduced-motion: reduce` must still end every entry animation in its final visible state after each migration (existing E2E to extend, run locally).
3. **Test mocks drifting from runtime** — 9 test files mock `framer-motion` with a local `motion` proxy; after migration a mock that only exports `motion` would make tests pass while runtime uses `m`. One shared mock exporting both, consumed by all 9 files.
4. **Re-proliferation** — a future `import { motion } from 'motion/react'` silently re-adds the full bundle. ESLint `no-restricted-imports` must fail on it (calibrated red on a fixture, green on the fix).
5. **Theme + dark mode** — particle replacements must render in both themes (`FairyBackground` has light/dark variants); captures cover both.

---

### Task 1: Correct the spec with today's facts

**Files:**

- Modify: `docs/VISUAL_REFONTE_2026_SPEC.md` (§2, §3, §6, status line)

- [ ] **Step 1:** §3 — replace the "Recommandation : clay" paragraph by the 2026-09-04 verdict (all 6 renders rejected: "pas enfantin, pas conforme aux styles"; cause: clay/toy were a shading change on the same low-poly mesh) and the open options (chibi-proportioned assets, or Blender rework: voxel remesh + smooth, SSS + pastel studio light, coat, soft ground shadow, Cycles; or a three.js real-time mascot). Decision method: forced-choice against references (Task 6).
- [ ] **Step 2:** §6 — Quaternius row: license page now _Quaternius Asset License (QAL) v1.0_, "Last updated: 8/28/2026", forbids redistributing raw assets; the FAQ still says CC0; verify per pack; the downloaded _Ultimate Animated Animals_ pack ships a CC0 `License.txt` (2026-09-04). Raw asset files never committed (renders only). Source: wiki `topics/game-dev/bibliotheques-assets-3d-libres.md` (secondary) + to re-read at https://quaternius.com/license.html (primary) before writing.
- [ ] **Step 3:** §2 — add the 2026-10-17 measured finding: `LazyMotion` is in place but all 24 files render `motion.*`, which pulls the full feature set, so `LazyMotion` saves nothing today. Re-measured baseline: `npm run build && bash scripts/check-bundle-size.sh` → 525 KB (2026-10-17).
- [ ] **Step 4:** Commit `docs: update refonte spec — style verdict, Quaternius QAL, LazyMotion finding`.

### Task 2: Pin latest stables and build the measurement harness

**Files:**

- Modify: `package.json` (versions above; scripts `quality:first-load`)
- Create: `scripts/measure-first-load.mjs`
- Modify: `playwright.config.ts` (env override `PLAYWRIGHT_BASE_URL`, default unchanged; local snapshot dir when overridden)
- Modify: `.gitignore` (`reports/first-load*.json`, local snapshot dir)
- Create: `docs/perf/first-load-history.md`

**Interfaces:**

- Produces: `npm run quality:first-load` → prints a table route × gzipped first-load JS KB and writes `reports/first-load.json` `{ date, commit, routes: { [path]: { scripts: number, gzipKB: number } } }`. Optional `--max <route>=<kb>` fails with exit 1 above threshold.
- Produces: `PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test visual-regression` compares against local baselines.

- [ ] **Step 1:** `npm i next@16.4.2 eslint-config-next@16.4.2 react@19.3.1 react-dom@19.3.1`; run `npm run typecheck && npm run lint && npm run test:run && npm run build`. Expected: all green, 1398 tests passed. Any red → fix before going on.
- [ ] **Step 2:** Write `scripts/measure-first-load.mjs`: starts nothing itself (expects `npx next start -p 3100`), opens each route of `['/', '/practice', '/challenge', '/profile', '/settings']` in Playwright Chromium, waits for `load` + network idle, collects `performance.getEntriesByType('resource')` with `initiatorType === 'script'` on the same origin, maps each URL under `/_next/static/` to its file in `.next/static/`, sums `zlib.gzipSync(file).length`. Same gzip method as `check-bundle-size.sh` so both numbers are comparable.
- [ ] **Step 3:** Run it on the upgraded build. Record the table in `docs/perf/first-load-history.md` with date, commit and command.
- [ ] **Step 4:** Add the env override to `playwright.config.ts`; run the visual-regression spec once locally with `--update-snapshots` to create the local baseline (pre-migration reference).
- [ ] **Step 5:** Commit `chore: pin latest stable next/react` and `perf: add first-load JS measurement per route` (two commits).

### Task 3 (P21a): `motion` 14 + `m` + async strict LazyMotion

**Files:**

- Modify: `package.json` (remove `framer-motion`, add `motion@14.3.0`)
- Create: `lib/animations/framer/features.ts` (default export `domAnimation`)
- Modify: `app/providers.tsx` (`<LazyMotion features={loadMotionFeatures} strict>`)
- Modify: the 24 files listed by `grep -rlE "from ['\"]framer-motion" app components features lib` — `motion.X` → `m.X` (import `* as m from 'motion/react-m'`), other imports from `motion/react`
- Create: `tests/utils/motionMock.tsx` (shared `vi.mock` factory exporting `motion`, `m`, `AnimatePresence`, `LazyMotion`, hooks)
- Modify: the 9 test files mocking `framer-motion` to use it
- Modify: `eslint.config.*` (`no-restricted-imports`: path `framer-motion` forbidden; `motion/react` import name `motion` forbidden, message "use m from motion/react-m")
- Create: `tests/unit/lint/motion-imports.test.ts` (ESLint API on two fixtures)
- Modify: `CLAUDE.md` (FM section → `motion` + `m` rule)

**Interfaces:**

- Produces: `loadMotionFeatures: () => Promise<FeatureBundle>` in `lib/animations/framer/loadFeatures.ts`.

- [ ] **Step 1:** Write `tests/unit/lint/motion-imports.test.ts`: lints a string `import { motion } from 'motion/react'` → expects 1 error from `no-restricted-imports`; lints `import * as m from 'motion/react-m'` → 0 errors; lints `import { motion } from 'framer-motion'` → 1 error. Run → FAIL (rule absent).
- [ ] **Step 2:** Add the ESLint rule. Run the test → PASS. Run `npm run lint` → it now reports every file still on `motion.*` (expected red, the migration list).
- [ ] **Step 3:** Swap the dependency, create `features.ts` + `loadFeatures.ts`, switch providers to async + `strict`. No `layout`/`drag` usage exists (checked 2026-10-17), so `domAnimation` suffices.
- [ ] **Step 4:** Migrate the 24 files and the 9 mocks (shared mock). `npm run lint && npm run typecheck && npm run test:run` → green, 1398+ tests.
- [ ] **Step 5:** Add Playwright local check (Review Focus 1): home on throttled network (Slow 3G profile via CDP), title element reaches computed opacity 1 within 10 s.
- [ ] **Step 6:** `npm run build`, `quality:first-load`, `quality:bundle-size`, local visual-regression against Task 2 baseline. Expected: visuals identical (0 diff over threshold), first-load lower on every route. Record numbers in `docs/perf/first-load-history.md`. If not lower, stop and investigate — do not claim the gain.
- [ ] **Step 7:** Commit `perf(motion): migrate to motion 14 m components with async strict LazyMotion` + `chore(lint): forbid full motion import`.

### Task 4 (P20): CSS-native foundations

**Design checkpoint first:** list each FM usage that is a pure one-shot entry (`initial`/`animate` without exit, gesture or spring hook) and propose its CSS equivalent (`@starting-style` + `transition`, curve from tokens). FM stays for the 7 documented cases (CLAUDE.md). Route transitions: evaluate React `<ViewTransition>` / Next 16 `experimental.viewTransition` (Context7 on the day) vs current `PageTransition`; prototype on one route, capture both, user picks.

**Files:**

- Modify: `styles/tokens.css` (`@property` for animated custom props; shared `linear()` spring curves)
- Modify: `styles/animations.css` (`@starting-style` entry utilities)
- Modify: components from the checkpoint list
- Test: `tests/e2e/reduced-motion*.spec.ts` (extend to new utilities, local run)

- [ ] **Step 1:** Checkpoint list written into this plan (append), user OK on route transition prototype.
- [ ] **Step 2:** Per component: unit test asserting the CSS utility class is applied and no `m.*` remains; migrate; reduced-motion E2E green locally.
- [ ] **Step 3:** Measure (first-load, bundle, visual diff). Visual diffs here are expected only where the user approved them.
- [ ] **Step 4:** Commit per component group: `refactor(anim): replace one-shot motion entries with @starting-style`.

### Task 5 (P22): Replace tsParticles — parity checkpoint first

**Design (2026-10-17, after reading the three uses):** two mechanisms, not three.

| Use                                                 | tsParticles today                                                                                                                                                                                                              | Replacement                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `FairyBackground` (home, practice)                  | 40 five-point stars, sizes 3-8 px, colours yellow/white/pink/violet, opacity 0.5-1 oscillating, random drift 0.5 px/frame, bounce on edges, twinkle, gold glow (shadow blur 10), fpsLimit 30, pause on blur / outside viewport | one canvas star-field engine, preset `fairy`                      |
| `ParticlesBackground preset="sparkles"` (challenge) | 30 stars per 600x600 px, sizes 1-3, gold/white/pink, opacity 0-1 oscillating fast, drift 0.3                                                                                                                                   | same engine, preset `sparkles`                                    |
| `SuccessExplosion`, `BadgeUnlockModal`              | confetti emitter at top, 10 particles / 100 ms, squares + circles, gravity, rotate + tilt, life 3 s                                                                                                                            | `canvas-confetti` 1.9.4 (ISC) fired as a stream from the top band |

Files: `lib/animations/canvas/starField.ts` (pure particle model + render loop, injectable random
for tests), `lib/animations/canvas/starFieldPresets.ts` (colours from `lib/animations/colors.ts`),
`components/effects/StarField.tsx` (canvas, DPR, resize, visibility + viewport pause, reduced
motion = one static frame), `lib/animations/canvas/confettiStream.ts`. Parity checkpoint: both
builds served side by side in the user's Chrome (iframes), light and dark.

Presets actually used (2026-10-17): `sparkles` (ChallengePage), `FairyBackground` (PracticePage, HomePage), `confetti` via `SuccessExplosion` / `BadgeUnlockModal`. `stars`, `snow`, `bubbles` are unused → deleted.

**Files:**

- Create: `lib/animations/canvas/sparkleField.ts` (tiny rAF canvas renderer: `createSparkleField(canvas, preset, { reducedMotion, fpsLimit: 30 }) => { destroy(): void }`, pauses on `visibilitychange`)
- Modify: `components/effects/FairyBackground.tsx`, `ParticlesBackground.tsx`, `SuccessExplosion.tsx`, `BadgeUnlockModal.tsx`
- Modify: `package.json` (remove `@tsparticles/*`, add `canvas-confetti@1.9.4` + `@types/canvas-confetti`)
- Delete: `hooks/useParticlesEngine.ts`, unused presets in `lib/animations/particles/configs.ts`

- [ ] **Step 1:** Record current effects (Playwright video, light + dark) and serve them with the candidate replacement side by side on `http://localhost` in the user's Chrome. **User forced choice: same or better? If worse → iterate, never ship.**
- [ ] **Step 2:** Unit tests for `createSparkleField`: renders N particles, `destroy()` cancels rAF, reduced motion draws one static frame.
- [ ] **Step 3:** Implement, swap components, delete tsParticles. Gates green.
- [ ] **Step 4:** Measure: `quality:bundle-size` expected −39 KB gz or more vs Task 3 number (spec target). Record. Lower the `check-bundle-size.sh` threshold only in P24.
- [ ] **Step 5:** Commit `perf(particles): replace tsParticles with canvas renderer and canvas-confetti`.

### Task 6 (parallel): Settle the 3D style

Method from wiki `topics/llm-tooling/cookbook-frontend-anti-slop-quatre-couches.md`: material before design, real renders, forced-choice human verdict against a reference.

**Files:**

- Create: `docs/spikes/style-2026-10/` (references, renders, `VERDICT.md`)
- Create/modify: `scripts/blender/render_styles.py` (new style passes) and, if chosen, `docs/spikes/style-2026-10/threejs/` (real-time candidate)

- [ ] **Step 1:** Collect 3 real reference candidates of children's apps/products with a rounded 3D mascot look (screenshots captured from their official sites, sources noted). User picks the bar.
- [ ] **Step 2:** Download candidate assets with chibi proportions (Quaternius cute packs: license read per pack; Kenney CC0; Poly Pizza CC0 only). Raw files stay out of git.
- [ ] **Step 3:** Render each candidate in the chosen reference style (Blender Cycles: remesh + smooth, SSS clay, pastel studio light, soft shadow) and one three.js real-time candidate (toon/clay shading, glTF). Serve on localhost in the user's Chrome, positions shuffled.
- [ ] **Step 4:** User forced choice → `VERDICT.md`, spec §3 updated, unblocks P23.
